# Search Performance Analysis

**Date**: 2026-04-02
**Status**: Analysis complete, awaiting implementation

## Current Architecture

| Layer | Technology | Status |
|-------|------------|--------|
| Frontend | Axios API calls | 300ms debounce |
| Backend | FastAPI + SQLAlchemy | All queries hit Oracle directly |
| Elasticsearch | Configured but **NOT USED** | Index/mapping ready, needs activation |

## Key Finding: Elasticsearch is Ready But Not Used

The backend has full Elasticsearch infrastructure:
- **Config**: `cgd/core/elasticsearch.py` - client and index mapping
- **Indexer**: `cgd/api/services/es_indexer.py` - indexes genes, GO terms, phenotypes, references
- **CLI**: `cgd reindex` command to rebuild index
- **Settings**: `elasticsearch_url: http://localhost:9200`, index: `cgd`

**But search endpoints query Oracle directly instead of ES.**

## Performance Issues Identified

### 1. N+1 Query Pattern in Reference Search (High Impact)
**Location**: `cgd/api/services/search_service.py:126-183`

```python
# For EACH reference, a separate query is made:
ref_urls = (
    db.query(RefUrl)
    .filter(RefUrl.reference_no == ref.reference_no)
    .all()
)
```

**Fix**: Use `joinedload()` to eager-load URLs in single query.

### 2. Sequential Category Counting (High Impact)
**Location**: `cgd/api/services/search_service.py:687-751`

```python
genes_count = _count_genes(db, query)
go_terms_count = _count_go_terms(db, query)
phenotypes_count = _count_phenotypes(db, query)
references_count = _count_references(db, query)
orthologs_count = _count_orthologs(db, query)
```

5 sequential database queries for counts alone.

**Fix**: Parallelize with `asyncio.gather()` or cache counts.

### 3. Text Search: 14 Sequential Category Searches (High Impact)
**Location**: `cgd/api/services/text_search_service.py:2198-2262`

```python
for category in categories_to_search:
    search_func = CATEGORY_SEARCH_FUNCTIONS[category]
    count_func = CATEGORY_COUNT_FUNCTIONS[category]
    results = search_func(db, query, limit_per_category)
    count = count_func(db, query)
```

Each category = 2 queries (search + count). 14 categories = 28 sequential queries.

**Fix**: Use ES or parallelize queries.

### 4. No Application-Level Caching (High Impact)
- No Redis/Memcached integration
- No query result caching
- No count caching

**Fix**: Add Redis caching with TTL for:
- Count queries (5-10 min TTL)
- Assembly 21 exclusion list (1 hour TTL)
- Common search results (5 min TTL)

### 5. Assembly 21 Deduplication Overhead (Medium Impact)
**Location**: `cgd/api/services/search_service.py`

Complex subqueries built for every gene search:
```python
direct_a21 = (
    db.query(FeatRelationship.child_feature_no.label('feature_no'))
    .filter(
        FeatRelationship.relationship_type == 'Assembly 21 Primary Allele',
        FeatRelationship.rank == 3,
    )
)
alleles_of_a21 = (...)  # Another complex subquery
return direct_a21.union(alleles_of_a21).subquery()
```

**Fix**: Pre-compute and cache exclusion list.

### 6. Oracle IN Clause Chunking (Medium Impact)
Due to Oracle's 1000-item IN clause limit:
```python
CHUNK_SIZE = 999
for i in range(0, len(feature_nos_list), CHUNK_SIZE):
    chunk = feature_nos_list[i:i + CHUNK_SIZE]
    # Execute query for each chunk...
```

**Fix**: Use ES for large result sets.

## Recommendations (Priority Order)

### Option A: Enable Elasticsearch for Search
1. Run `cgd reindex` to populate ES index
2. Modify `search_service.py` to query ES instead of Oracle
3. Expected improvement: 10-100x faster for text searches

### Option B: Add Redis Caching
1. Install Redis and `redis-py`
2. Cache count queries (TTL: 5 min)
3. Cache Assembly 21 exclusion list (TTL: 1 hour)
4. Expected improvement: 2-5x for repeated queries

### Option C: Fix N+1 Queries
1. Use `joinedload()` for reference URLs
2. Batch queries where possible
3. Expected improvement: 2-3x for reference searches

### Option D: Parallelize Queries
1. Convert to async with `asyncio.gather()`
2. Run independent category queries concurrently
3. Expected improvement: 3-5x for multi-category searches

## Key Files

| File | Purpose |
|------|---------|
| `cgd-backend/cgd/api/routers/search_router.py` | Search API endpoints |
| `cgd-backend/cgd/api/services/search_service.py` | Quick search, autocomplete, resolve |
| `cgd-backend/cgd/api/services/text_search_service.py` | Full text search (14 categories) |
| `cgd-backend/cgd/api/services/feature_search_service.py` | Advanced feature search |
| `cgd-backend/cgd/core/elasticsearch.py` | ES configuration (unused) |
| `cgd-backend/cgd/api/services/es_indexer.py` | ES indexing functions |
| `cgd-backend/cgd/db/engine.py` | Database connection pool |

## Frontend Search API

Located at `cgd-frontend/src/api/searchApi.js`:
- `resolve(query)` - Direct URL resolution
- `quickSearch(query, limit)` - Multi-category search
- `autocomplete(query, limit)` - Search suggestions
- `searchCategory(query, category)` - Single category search
- `textSearch(query, ...)` - Full-text search with filters
- `textSearchCategory(...)` - Full-text in specific category
