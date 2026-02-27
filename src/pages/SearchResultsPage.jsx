import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { searchApi } from '../api/searchApi';
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
    const fetchResults = async () => {
      if (!query.trim()) {
        setInitialResults(null);
        setSelectedCategory(null);
        setCategoryResults(null);
        setTotalCount(0);
        return;
      }

      setLoading(true);
      setError(null);

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
          // Fetch all results for this category
          await fetchCategoryResults(firstCategoryWithResults);
        } else {
          setSelectedCategory(null);
          setCategoryResults(null);
          setTotalCount(0);
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
    const filteredResults = selectedOrganism
      ? results.filter(r => r.organism === selectedOrganism)
      : results;

    return (
      <div className="ag-grid-wrapper">
        <AgGridReact
          rowData={filteredResults}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          domLayout="normal"
          suppressCellFocus={true}
          enableCellTextSelection={true}
          pagination={true}
          paginationPageSize={20}
          paginationPageSizeSelector={[20, 50, 100]}
          getRowId={(params) => `${params.data.category}-${params.data.id}`}
        />
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
