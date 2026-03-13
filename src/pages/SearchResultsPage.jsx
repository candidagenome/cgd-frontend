import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { searchApi } from '../api/searchApi';
import { CitationLinksBelow } from '../utils/formatCitation.jsx';
import './SearchResultsPage.css';

// Register AG Grid modules once
if (!ModuleRegistry.__cgdRegistered) {
  ModuleRegistry.registerModules([AllCommunityModule]);
  ModuleRegistry.__cgdRegistered = true;
}

// Combined cell renderer for identifier + description
const CombinedResultRenderer = (props) => {
  const data = props.data;
  if (!data) return '-';

  const displayName = data.highlighted_name || data.name;
  const displayDesc = data.highlighted_description || data.description;
  const id = data.id;
  const organism = data.organism;

  // For references category, show PMID/ID as link, citation below, then links
  // Note: backend returns category="reference" (singular)
  const isReferences = data.category === 'reference' || data.category === 'references';

  if (isReferences) {
    // data.name is "PMID:xxx" or dbxref_id
    // data.description is the citation text
    // data.links is the array of citation links from the API
    const isExternal = data.link?.startsWith('http');
    return (
      <div className="combined-result-cell references-cell">
        <div className="result-header">
          <a
            href={data.link}
            target="_blank"
            rel={isExternal ? "noopener noreferrer" : undefined}
            className="result-name"
            dangerouslySetInnerHTML={{ __html: displayName }}
          />
          {organism && <span className="result-organism">{organism}</span>}
        </div>
        {displayDesc && (
          <div
            className="result-description"
            dangerouslySetInnerHTML={{ __html: displayDesc }}
          />
        )}
        {data.links && data.links.length > 0 && (
          <CitationLinksBelow links={data.links} className="search-result-links" target="_blank" />
        )}
      </div>
    );
  }

  // For genes category, link to /locus/[gene_name]
  // Prefer gene_name (standard name like "HOG1") over name (which may be orf ID like "orf19.8514")
  const isGenes = data.category === 'genes';
  const locusIdentifier = data.gene_name || data.name;
  const linkUrl = isGenes ? `/locus/${locusIdentifier}` : data.link;
  const isExternal = linkUrl?.startsWith('http');

  return (
    <div className="combined-result-cell">
      <div className="result-header">
        <a
          href={linkUrl}
          target="_blank"
          rel={isExternal ? "noopener noreferrer" : undefined}
          className="result-name"
          dangerouslySetInnerHTML={{ __html: displayName }}
        />
        {id && <span className="result-id">({id})</span>}
        {organism && <span className="result-organism">{organism}</span>}
      </div>
      {displayDesc && (
        <div
          className="result-description"
          dangerouslySetInnerHTML={{ __html: displayDesc }}
        />
      )}
    </div>
  );
};

const CATEGORY_LABELS = {
  genes: 'Genes / Loci',
  go_terms: 'GO Terms',
  phenotypes: 'Phenotypes',
  references: 'References',
};

const CATEGORY_ORDER = ['genes', 'go_terms', 'phenotypes', 'references'];

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('query') || '';

  // Initial quick search results (for category counts)
  const [initialResults, setInitialResults] = useState(null);
  // All results for selected category
  const [categoryResults, setCategoryResults] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  const [loading, setLoading] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Organism filtering state
  const [availableOrganisms, setAvailableOrganisms] = useState([]);
  const [selectedOrganism, setSelectedOrganism] = useState(null);
  const [organismCounts, setOrganismCounts] = useState({});
  const [hasApiOrganismCounts, setHasApiOrganismCounts] = useState(false);

  // Quick filter state: pending (what user types) vs applied (what filters)
  const [pendingQuickFilter, setPendingQuickFilter] = useState('');
  const [appliedQuickFilter, setAppliedQuickFilter] = useState('');

  const applyFilter = useCallback(() => {
    setAppliedQuickFilter(pendingQuickFilter);
  }, [pendingQuickFilter]);

  const clearFilter = useCallback(() => {
    setPendingQuickFilter('');
    setAppliedQuickFilter('');
  }, []);

  const hasPendingChanges = pendingQuickFilter !== appliedQuickFilter;

  // AG Grid column definitions - single combined column
  const columnDefs = useMemo(() => [
    {
      headerName: selectedCategory ? CATEGORY_LABELS[selectedCategory] : 'Results',
      field: 'name',
      cellRenderer: CombinedResultRenderer,
      sortable: true,
      flex: 1,
      wrapText: true,
      autoHeight: true,
      cellStyle: { whiteSpace: 'normal', lineHeight: '1.4', padding: '10px 12px' },
    },
  ], [selectedCategory]);

  // AG Grid default column definitions
  const defaultColDef = useMemo(() => ({
    resizable: true,
  }), []);

  // Filter results by applied quick filter text
  const getFilteredResults = useCallback((results) => {
    if (!appliedQuickFilter.trim()) return results;
    const searchLower = appliedQuickFilter.toLowerCase().trim();
    return results.filter((r) => {
      const searchFields = [
        r.name,
        r.description,
        r.id,
        r.organism,
        r.highlighted_name,
        r.highlighted_description,
      ];
      return searchFields.some((field) => field && String(field).toLowerCase().includes(searchLower));
    });
  }, [appliedQuickFilter]);

  // Fetch all results for a category
  const fetchCategoryResults = useCallback(async (category) => {
    if (!query.trim() || !category) return;

    setCategoryLoading(true);
    try {
      const data = await searchApi.searchCategory(query, category);
      setCategoryResults(data.results);
      setTotalCount(data.total_count || data.results?.length || 0);
      // Use organism counts from API if provided
      if (data.organism_counts) {
        setOrganismCounts(data.organism_counts);
        setAvailableOrganisms(Object.keys(data.organism_counts));
        setHasApiOrganismCounts(true);
      } else {
        setHasApiOrganismCounts(false);
      }
    } catch (err) {
      console.error('Category search error:', err);
      setError('Failed to load results. Please try again.');
    } finally {
      setCategoryLoading(false);
    }
  }, [query]);

  // Initial search effect
  useEffect(() => {
    let isMounted = true;

    const fetchResults = async () => {
      if (!query.trim()) {
        if (isMounted) {
          setInitialResults(null);
          setSelectedCategory(null);
          setCategoryResults(null);
          setTotalCount(0);
        }
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Perform quick search to get category counts
        const data = await searchApi.quickSearch(query);
        if (!isMounted) return;

        setInitialResults(data);

        // Auto-select first category with results
        const firstCategoryWithResults = CATEGORY_ORDER.find(
          cat => data.results_by_category?.[cat]?.length > 0
        );

        if (firstCategoryWithResults) {
          setSelectedCategory(firstCategoryWithResults);
          // Fetch all results for this category
          await fetchCategoryResults(firstCategoryWithResults);
        } else {
          if (isMounted) {
            setSelectedCategory(null);
            setCategoryResults(null);
            setTotalCount(0);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('Search error:', err);
          setError('Failed to perform search. Please try again.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchResults();

    return () => {
      isMounted = false;
    };
  }, [query, fetchCategoryResults]);

  // Extract organisms and calculate counts when category results change (fallback when API doesn't provide counts)
  useEffect(() => {
    // Skip if API already provided organism counts
    if (hasApiOrganismCounts) {
      return;
    }

    if (categoryResults && categoryResults.length > 0) {
      // Calculate counts per organism from current page (fallback)
      const counts = {};
      categoryResults.forEach(r => {
        if (r.organism) {
          counts[r.organism] = (counts[r.organism] || 0) + 1;
        }
      });
      setOrganismCounts(counts);
      setAvailableOrganisms(Object.keys(counts));
    } else {
      setAvailableOrganisms([]);
      setOrganismCounts({});
    }
  }, [categoryResults, hasApiOrganismCounts]);

  // Reset selected organism if it's no longer available
  useEffect(() => {
    if (availableOrganisms.length > 0) {
      setSelectedOrganism(prev => {
        if (prev !== null && !availableOrganisms.includes(prev)) {
          return null;
        }
        return prev;
      });
    }
  }, [availableOrganisms]);

  // Handle category change
  const handleCategoryChange = async (category) => {
    if (category === selectedCategory) return;

    setSelectedCategory(category);
    setCategoryResults(null);
    setTotalCount(0);
    // Reset organism selection when changing category
    setAvailableOrganisms([]);
    setOrganismCounts({});
    setSelectedOrganism(null);
    setHasApiOrganismCounts(false);
    await fetchCategoryResults(category);
  };


  const renderFacets = () => {
    // Filter results by selected organism for display count
    const results = categoryResults || [];
    const filteredResults = selectedOrganism
      ? results.filter(r => r.organism === selectedOrganism)
      : results;
    const displayCount = selectedOrganism ? filteredResults.length : totalCount;

    return (
      <div className="search-facets">
        {/* Organism filter facet */}
        {availableOrganisms.length > 0 && (
          <div className="organism-facet">
            <h3>Organism</h3>
            <ul className="facet-list">
              <li
                className={`facet-item ${selectedOrganism === null ? 'selected' : ''}`}
                onClick={() => setSelectedOrganism(null)}
              >
                <span className="facet-label">All Organisms</span>
                <span className="facet-count">{totalCount}</span>
              </li>
              {availableOrganisms.map(organism => (
                <li
                  key={organism}
                  className={`facet-item ${selectedOrganism === organism ? 'selected' : ''}`}
                  onClick={() => setSelectedOrganism(organism)}
                >
                  <span className="facet-label">{organism}</span>
                  <span className="facet-count">{organismCounts[organism] || 0}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <h3>Categories</h3>
        <ul className="facet-list">
          {CATEGORY_ORDER.map(categoryKey => {
            // Use counts_by_category from API (actual total counts), fall back to totalCount or results length
            let count = initialResults?.counts_by_category?.[categoryKey]
              ?? (selectedCategory === categoryKey ? totalCount : 0)
              ?? (initialResults?.results_by_category?.[categoryKey]?.length || 0);
            const isSelected = selectedCategory === categoryKey;
            const hasResults = count > 0;

            return (
              <li
                key={categoryKey}
                className={`facet-item ${isSelected ? 'selected' : ''} ${!hasResults ? 'disabled' : ''}`}
                onClick={() => hasResults && handleCategoryChange(categoryKey)}
              >
                <span className="facet-label">{CATEGORY_LABELS[categoryKey]}</span>
                <span className="facet-count">{isSelected ? displayCount : count}</span>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  const renderResults = () => {
    if (!selectedCategory) {
      return (
        <div className="search-no-selection">
          Select a category to view results.
        </div>
      );
    }

    if (categoryLoading) {
      return (
        <div className="search-loading">
          Loading results...
        </div>
      );
    }

    const results = categoryResults || [];
    // Filter results by selected organism
    const organismFiltered = selectedOrganism
      ? results.filter(r => r.organism === selectedOrganism)
      : results;
    // Apply quick filter
    const filteredResults = getFilteredResults(organismFiltered);

    return (
      <div>
        {/* Quick Filter Box */}
        <div className="filter-controls" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 15px', background: '#f8f9fa', border: '1px solid #e0e0e0', borderRadius: '4px', marginBottom: '10px' }}>
          <label htmlFor="quick-filter" style={{ fontWeight: 500, color: '#333', whiteSpace: 'nowrap' }}>Filter results: </label>
          <input
            type="text"
            id="quick-filter"
            value={pendingQuickFilter}
            onChange={(e) => setPendingQuickFilter(e.target.value)}
            placeholder="Type to filter..."
            style={{ padding: '6px 10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px', width: '200px' }}
          />
          <button
            type="button"
            onClick={applyFilter}
            disabled={!hasPendingChanges}
            style={{ padding: '6px 12px', border: 'none', background: hasPendingChanges ? '#1976d2' : '#90caf9', color: 'white', fontWeight: 500, cursor: hasPendingChanges ? 'pointer' : 'not-allowed', borderRadius: '4px', fontSize: '14px' }}
          >
            Apply
          </button>
          {(appliedQuickFilter || pendingQuickFilter) && (
            <button
              type="button"
              onClick={clearFilter}
              title="Clear filter"
              style={{ padding: '4px 8px', border: 'none', background: '#e0e0e0', color: '#666', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', borderRadius: '4px', lineHeight: 1 }}
            >
              ×
            </button>
          )}
          {appliedQuickFilter && (
            <span style={{ fontSize: '0.9rem', color: '#555' }}>
              Showing {filteredResults.length} of {organismFiltered.length} results
            </span>
          )}
        </div>

        <div className="ag-grid-wrapper">
          <AgGridReact
            rowData={filteredResults}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            domLayout="autoHeight"
            suppressCellFocus={true}
            enableCellTextSelection={true}
            pagination={true}
            paginationPageSize={10}
            paginationPageSizeSelector={[10, 25, 50, 100]}
            getRowId={(params) => `${params.data.category}-${params.data.id}`}
          />
        </div>
      </div>
    );
  };

  const totalResults = initialResults?.total_results || 0;

  return (
    <div className="search-results-page">
      <div className="search-results-content">
        <h1>Search Results</h1>
        <hr />

        {query && (
          <p className="search-query-info">
            Results for: <strong>"{query}"</strong>
            {initialResults && ` - ${totalResults} total results found`}
          </p>
        )}

        {!query && (
          <div className="search-no-results">
            Please enter a search term.
          </div>
        )}

        {loading && (
          <div className="search-loading">
            Searching...
          </div>
        )}

        {error && (
          <div className="search-error">
            {error}
          </div>
        )}

        {!loading && !error && initialResults && totalResults === 0 && (
          <div className="search-no-results">
            No results found for "{query}". Try a different search term.
          </div>
        )}

        {!loading && !error && initialResults && totalResults > 0 && (
          <div className="search-layout">
            <aside className="search-sidebar">
              {renderFacets()}
            </aside>
            <main className="search-main">
              {renderResults()}
            </main>
          </div>
        )}

        <div className="back-to-search">
          <Link to="/search">Back to Search Options</Link>
        </div>
      </div>
    </div>
  );
};

export default SearchResultsPage;
