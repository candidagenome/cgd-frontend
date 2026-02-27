import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { searchApi } from '../api/searchApi';
import OrganismSelector, { getDefaultOrganism } from '../components/locus/OrganismSelector';
import './TextSearchResultsPage.css';

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

// Custom cell renderer for name links
const NameLinkRenderer = (props) => {
  if (!props.value) return '-';
  const displayName = props.data.highlighted_name || props.data.name;
  const link = props.data.link;
  const isExternal = link && (link.startsWith('http://') || link.startsWith('https://'));

  if (!link) {
    return <span dangerouslySetInnerHTML={{ __html: displayName }} />;
  }
  if (isExternal) {
    return (
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        dangerouslySetInnerHTML={{ __html: displayName }}
      />
    );
  }
  return (
    <Link
      to={link}
      dangerouslySetInnerHTML={{ __html: displayName }}
    />
  );
};

// Custom cell renderer for description with HTML
const DescriptionRenderer = (props) => {
  if (!props.value) return '-';
  const displayDesc = props.data.highlighted_description || props.data.description;
  return <span dangerouslySetInnerHTML={{ __html: displayDesc }} />;
};

// Category labels for display
const CATEGORY_LABELS = {
  genes: 'Genes / Loci',
  descriptions: 'Locus Descriptions',
  go_terms: 'GO Terms',
  colleagues: 'Colleagues',
  authors: 'Authors',
  pathways: 'Pathways',
  paragraphs: 'Locus Summary Paragraphs',
  abstracts: 'Paper Abstracts',
  name_descriptions: 'Gene Name Descriptions',
  phenotypes: 'Phenotypes',
  notes: 'History Notes',
  external_ids: 'External Database IDs',
  orthologs: 'Orthologs / Best Hits',
  literature_topics: 'Literature Topics',
};

// Order in which categories are displayed
const CATEGORY_ORDER = [
  'genes', 'descriptions', 'go_terms', 'colleagues', 'authors',
  'pathways', 'paragraphs', 'abstracts', 'name_descriptions',
  'phenotypes', 'notes', 'external_ids', 'orthologs', 'literature_topics'
];

const PAGE_SIZE = 20;

const TextSearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('query') || '';
  const type = searchParams.get('type') || null; // 'homolog' for ortholog-only search

  // Initial search results (for category counts)
  const [initialResults, setInitialResults] = useState(null);
  // Paginated results for selected category
  const [categoryResults, setCategoryResults] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [loading, setLoading] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Organism filtering state
  const [availableOrganisms, setAvailableOrganisms] = useState([]);
  const [selectedOrganism, setSelectedOrganism] = useState(null);
  const [organismCounts, setOrganismCounts] = useState({});
  const [hasApiOrganismCounts, setHasApiOrganismCounts] = useState(false);

  // Check if results have organism data
  const hasOrganismData = useMemo(() => {
    if (!categoryResults || categoryResults.length === 0) return false;
    return categoryResults.some(r => r.organism);
  }, [categoryResults]);

  // AG Grid column definitions - dynamically include organism column
  const columnDefs = useMemo(() => {
    const cols = [
      {
        headerName: 'Name',
        field: 'name',
        cellRenderer: NameLinkRenderer,
        filter: 'agTextColumnFilter',
        sortable: true,
        minWidth: 150,
        flex: 1,
      },
      {
        headerName: 'ID',
        field: 'id',
        filter: 'agTextColumnFilter',
        sortable: true,
        minWidth: 130,
        flex: 1,
      },
      {
        headerName: 'Description',
        field: 'description',
        cellRenderer: DescriptionRenderer,
        filter: 'agTextColumnFilter',
        sortable: true,
        minWidth: 300,
        flex: 2,
        wrapText: true,
        autoHeight: true,
        cellStyle: { whiteSpace: 'normal', lineHeight: '1.4' },
      },
    ];
    // Only add organism column if data has organism info
    if (hasOrganismData) {
      cols.push({
        headerName: 'Organism',
        field: 'organism',
        filter: 'agTextColumnFilter',
        sortable: true,
        minWidth: 180,
        flex: 1,
      });
    }
    return cols;
  }, [hasOrganismData]);

  // AG Grid default column definitions
  const defaultColDef = useMemo(() => ({
    resizable: true,
    floatingFilter: true,
  }), []);

  // Fetch paginated results for a category
  const fetchCategoryResults = useCallback(async (category, page) => {
    if (!query.trim() || !category) return;

    setCategoryLoading(true);
    try {
      const data = await searchApi.textSearchCategory(query, category, page, PAGE_SIZE);
      setCategoryResults(data.results);
      setPagination(data.pagination);
      // Use organism counts from API if provided (counts ALL results, not just current page)
      if (data.organism_counts) {
        const organisms = Object.keys(data.organism_counts);
        setOrganismCounts(data.organism_counts);
        setAvailableOrganisms(organisms);
        setHasApiOrganismCounts(true);
        // Validate selectedOrganism against the fresh organism list
        setSelectedOrganism(prev => {
          if (prev !== null && !organisms.includes(prev)) {
            return null;
          }
          return prev;
        });
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
    const fetchResults = async () => {
      if (!query.trim()) {
        setInitialResults(null);
        setSelectedCategory(null);
        setCategoryResults(null);
        setPagination(null);
        return;
      }

      setLoading(true);
      setError(null);
      setCurrentPage(1);

      try {
        // Perform text search (with type filter if specified)
        const data = await searchApi.textSearch(query, 10, type);
        setInitialResults(data);

        // Determine which categories to show (only orthologs if type=homolog)
        const categoriesToShow = type === 'homolog' ? ['orthologs'] : CATEGORY_ORDER;

        // Auto-select first category with results
        const firstCategoryWithResults = categoriesToShow.find(cat => {
          const categoryData = data.categories.find(c => c.category === cat);
          return categoryData && categoryData.count > 0;
        });

        if (firstCategoryWithResults) {
          setSelectedCategory(firstCategoryWithResults);
          // Fetch first page of results for this category
          await fetchCategoryResults(firstCategoryWithResults, 1);
        } else {
          setSelectedCategory(null);
          setCategoryResults(null);
          setPagination(null);
        }
      } catch (err) {
        console.error('Search error:', err);
        setError('Failed to perform search. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, type, navigate, fetchCategoryResults]);

  // Extract organisms and calculate counts when category results change (fallback when API doesn't provide counts)
  useEffect(() => {
    // Skip if API already provided organism counts (validation is handled in fetchCategoryResults)
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

      const organisms = Object.keys(counts);
      setAvailableOrganisms(organisms);
      // Reset organism selection if the previously selected one is not available
      setSelectedOrganism(prev => {
        if (prev !== null && !organisms.includes(prev)) {
          return null;
        }
        return prev;
      });
    } else {
      setAvailableOrganisms([]);
      setOrganismCounts({});
      setSelectedOrganism(null);
    }
  }, [categoryResults, hasApiOrganismCounts]);

  // Handle category change
  const handleCategoryChange = async (category) => {
    if (category === selectedCategory) return;

    setSelectedCategory(category);
    setCurrentPage(1);
    setCategoryResults(null);
    setPagination(null);
    // Reset organism selection when changing category
    setAvailableOrganisms([]);
    setOrganismCounts({});
    setSelectedOrganism(null);
    setHasApiOrganismCounts(false);
    await fetchCategoryResults(category, 1);
  };

  // Handle page change
  const handlePageChange = async (newPage) => {
    if (newPage === currentPage || newPage < 1 || (pagination && newPage > pagination.total_pages)) {
      return;
    }

    setCurrentPage(newPage);
    await fetchCategoryResults(selectedCategory, newPage);

    // Scroll to top of results
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  // Render facets (category filters)
  const renderFacets = () => {
    // Get category counts from initial results
    const getCategoryCount = (categoryKey) => {
      if (!initialResults?.categories) return 0;
      const cat = initialResults.categories.find(c => c.category === categoryKey);
      return cat ? cat.count : 0;
    };

    // Filter categories if type=homolog
    const categoriesToShow = type === 'homolog' ? ['orthologs'] : CATEGORY_ORDER;

    return (
      <div className="text-search-facets">
        <h3>Categories</h3>
        <ul className="facet-list">
          {categoriesToShow.map(categoryKey => {
            // Use pagination total if available for selected category, otherwise use initial count
            // For selected category with organism filter, use organism-specific count
            let count;
            if (selectedCategory === categoryKey && pagination) {
              // If an organism is selected, use the organism-specific count
              if (selectedOrganism && organismCounts[selectedOrganism] !== undefined) {
                count = organismCounts[selectedOrganism];
              } else {
                count = pagination.total_items;
              }
            } else {
              count = getCategoryCount(categoryKey);
            }
            // If we have more results than the count says, use the actual count
            if (selectedCategory === categoryKey && categoryResults && categoryResults.length > count) {
              count = categoryResults.length;
            }
            const isSelected = selectedCategory === categoryKey;
            const hasResults = count > 0;

            return (
              <li
                key={categoryKey}
                className={`facet-item ${isSelected ? 'selected' : ''} ${!hasResults ? 'disabled' : ''}`}
                onClick={() => hasResults && handleCategoryChange(categoryKey)}
              >
                <span className="facet-label">{CATEGORY_LABELS[categoryKey]}</span>
                <span className="facet-count">{count}</span>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  // Render pagination
  const renderPagination = () => {
    if (!pagination || pagination.total_pages <= 1) {
      return null;
    }

    const { page, total_pages, has_prev, has_next, total_items } = pagination;

    // Generate page numbers to show
    const pageNumbers = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(total_pages, startPage + maxVisiblePages - 1);

    // Adjust start if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="pagination">
        <div className="pagination-info">
          Showing {((page - 1) * PAGE_SIZE) + 1} - {Math.min(page * PAGE_SIZE, total_items)} of {total_items} results
        </div>
        <div className="pagination-controls">
          <button
            className="pagination-btn"
            onClick={() => handlePageChange(1)}
            disabled={!has_prev}
            title="First page"
          >
            &laquo;
          </button>
          <button
            className="pagination-btn"
            onClick={() => handlePageChange(page - 1)}
            disabled={!has_prev}
            title="Previous page"
          >
            &lsaquo;
          </button>

          {startPage > 1 && (
            <>
              <button className="pagination-btn" onClick={() => handlePageChange(1)}>1</button>
              {startPage > 2 && <span className="pagination-ellipsis">...</span>}
            </>
          )}

          {pageNumbers.map(pageNum => (
            <button
              key={pageNum}
              className={`pagination-btn ${pageNum === page ? 'active' : ''}`}
              onClick={() => handlePageChange(pageNum)}
            >
              {pageNum}
            </button>
          ))}

          {endPage < total_pages && (
            <>
              {endPage < total_pages - 1 && <span className="pagination-ellipsis">...</span>}
              <button className="pagination-btn" onClick={() => handlePageChange(total_pages)}>
                {total_pages}
              </button>
            </>
          )}

          <button
            className="pagination-btn"
            onClick={() => handlePageChange(page + 1)}
            disabled={!has_next}
            title="Next page"
          >
            &rsaquo;
          </button>
          <button
            className="pagination-btn"
            onClick={() => handlePageChange(total_pages)}
            disabled={!has_next}
            title="Last page"
          >
            &raquo;
          </button>
        </div>
      </div>
    );
  };

  // Render main results
  const renderResults = () => {
    if (!selectedCategory) {
      return (
        <div className="text-search-no-selection">
          Select a category to view results.
        </div>
      );
    }

    if (categoryLoading) {
      return (
        <div className="text-search-loading">
          Loading results...
        </div>
      );
    }

    const results = categoryResults || [];
    // Filter results by selected organism
    const filteredResults = selectedOrganism
      ? results.filter(r => r.organism === selectedOrganism)
      : results;
    // Use the larger of pagination total or actual results length for total count
    const totalCount = Math.max(pagination?.total_items || 0, results.length);
    // Show filtered count in header when organism is selected, otherwise show total
    const displayCount = selectedOrganism ? filteredResults.length : totalCount;

    return (
      <div className={`text-search-results-list ${selectedCategory}`}>
        <h2>
          {CATEGORY_LABELS[selectedCategory]}
          <span className="category-count">({displayCount} results)</span>
        </h2>
        {availableOrganisms.length > 0 && (
          <OrganismSelector
            organisms={availableOrganisms}
            selectedOrganism={selectedOrganism}
            onOrganismChange={setSelectedOrganism}
            dataType="search"
            context="search"
            organismCounts={organismCounts}
            showAllOption={true}
          />
        )}
        <div className="ag-grid-container">
          <AgGridReact
            rowData={filteredResults}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            domLayout="autoHeight"
            suppressCellFocus={true}
            enableCellTextSelection={true}
            pagination={true}
            paginationPageSize={10}
            paginationPageSizeSelector={[10, 20, 50]}
            getRowId={(params) => `${params.data.category}-${params.data.id}`}
          />
        </div>
        {renderPagination()}
      </div>
    );
  };

  const totalResults = initialResults?.total_results || 0;
  const searchTypeLabel = type === 'homolog' ? 'Ortholog Search' : 'Text Search';

  return (
    <div className="text-search-results-page">
      <div className="text-search-results-content">
        <h1>{searchTypeLabel} Results</h1>
        <hr />

        {query && (
          <p className="search-query-info">
            Results for: <strong>"{query}"</strong>
            {initialResults && ` - ${totalResults} total results found`}
          </p>
        )}

        {!query && (
          <div className="text-search-no-results">
            Please enter a search term.
          </div>
        )}

        {loading && (
          <div className="text-search-loading">
            Searching...
          </div>
        )}

        {error && (
          <div className="text-search-error">
            {error}
          </div>
        )}

        {!loading && !error && initialResults && totalResults === 0 && (
          <div className="text-search-no-results">
            No results found for "{query}". Try a different search term.
          </div>
        )}

        {!loading && !error && initialResults && totalResults > 0 && (
          <div className="text-search-layout">
            <aside className="text-search-sidebar">
              {renderFacets()}
            </aside>
            <main className="text-search-main">
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

export default TextSearchResultsPage;
