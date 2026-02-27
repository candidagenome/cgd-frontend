import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { searchApi } from '../api/searchApi';
import OrganismSelector, { getDefaultOrganism } from '../components/locus/OrganismSelector';
import './SearchResultsPage.css';

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

// Custom cell renderer for name links
const NameLinkRenderer = (props) => {
  if (!props.value) return '-';
  const displayName = props.data.highlighted_name || props.data.name;
  return (
    <Link
      to={props.data.link}
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

const CATEGORY_LABELS = {
  genes: 'Genes / Loci',
  go_terms: 'GO Terms',
  phenotypes: 'Phenotypes',
  references: 'References',
};

const CATEGORY_ORDER = ['genes', 'go_terms', 'phenotypes', 'references'];
const PAGE_SIZE = 20;

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('query') || '';

  // Initial quick search results (for category counts)
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
      const data = await searchApi.searchCategory(query, category, page, PAGE_SIZE);
      setCategoryResults(data.results);
      setPagination(data.pagination);
      // Use organism counts from API if provided (counts ALL results, not just current page)
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
        // Perform quick search to get category counts
        const data = await searchApi.quickSearch(query);
        setInitialResults(data);

        // Auto-select first category with results
        const firstCategoryWithResults = CATEGORY_ORDER.find(
          cat => data.results_by_category?.[cat]?.length > 0
        );

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
  }, [query, fetchCategoryResults]);

  // Extract organisms and calculate counts when category results change (fallback when API doesn't provide counts)
  useEffect(() => {
    // Skip if API already provided organism counts
    if (hasApiOrganismCounts) {
      // Just validate selected organism against available organisms
      if (selectedOrganism !== null && !availableOrganisms.includes(selectedOrganism)) {
        setSelectedOrganism(null);
      }
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
      // Default to "All Organisms" (null) to show all results initially
      if (selectedOrganism !== null && !organisms.includes(selectedOrganism)) {
        setSelectedOrganism(null);
      }
    } else {
      setAvailableOrganisms([]);
      setOrganismCounts({});
      setSelectedOrganism(null);
    }
  }, [categoryResults, selectedOrganism, hasApiOrganismCounts, availableOrganisms]);

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


  const renderFacets = () => {
    return (
      <div className="search-facets">
        <h3>Categories</h3>
        <ul className="facet-list">
          {CATEGORY_ORDER.map(categoryKey => {
            // Use counts_by_category from API (actual total counts), fall back to pagination or results length
            let count = initialResults?.counts_by_category?.[categoryKey]
              ?? (selectedCategory === categoryKey && pagination ? pagination.total_items : 0)
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
                <span className="facet-count">{count}</span>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

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
    const filteredResults = selectedOrganism
      ? results.filter(r => r.organism === selectedOrganism)
      : results;
    // Use the larger of pagination total or actual results length for total count
    const totalCount = Math.max(pagination?.total_items || 0, results.length);
    // Show filtered count in header when organism is selected, otherwise show total
    const displayCount = selectedOrganism ? filteredResults.length : totalCount;

    return (
      <div className={`search-results-list ${selectedCategory}`}>
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
