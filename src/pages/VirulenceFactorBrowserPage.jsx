import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import virulenceFactorApi from '../api/virulenceFactorApi';
import './VirulenceFactorBrowserPage.css';

// Category color mapping for visual distinction
const CATEGORY_COLORS = {
  // Adhesion & Biofilm - Blues
  adhesion: 'cat-blue',
  biofilm: 'cat-blue-light',
  biofilm_formation: 'cat-blue-light',
  // Host Interaction - Reds
  host_interaction: 'cat-red',
  immune_evasion: 'cat-red-light',
  // Secreted Enzymes - Greens
  secreted_enzymes: 'cat-green',
  cell_wall: 'cat-green-light',
  // Morphogenesis - Purple
  morphogenesis: 'cat-purple',
  filamentation: 'cat-purple-light',
  // Stress & Drug Resistance - Orange/Pink
  stress_response: 'cat-orange',
  drug_resistance: 'cat-pink',
};

// Get color class for a category
const getCategoryColorClass = (categoryKey) => {
  if (!categoryKey) return 'cat-default';
  // Try exact match first
  if (CATEGORY_COLORS[categoryKey]) {
    return CATEGORY_COLORS[categoryKey];
  }
  // Try lowercase normalized
  const normalized = categoryKey.toLowerCase().replace(/[\s-]/g, '_');
  if (CATEGORY_COLORS[normalized]) {
    return CATEGORY_COLORS[normalized];
  }
  // Default
  return 'cat-default';
};

// Categorize match reason and return type info
const categorizeMatchReason = (reason) => {
  const reasonLower = reason.toLowerCase();
  if (reasonLower.includes('go:') || reasonLower.includes('gene ontology') ||
      reasonLower.includes('biological process') || reasonLower.includes('molecular function') ||
      reasonLower.includes('cellular component')) {
    return { type: 'go', label: 'GO', tooltip: 'Gene Ontology' };
  }
  if (reasonLower.includes('phenotype') || reasonLower.includes('resistance') ||
      reasonLower.includes('sensitivity') || reasonLower.includes('defect') ||
      reasonLower.includes('mutant')) {
    return { type: 'phe', label: 'PHE', tooltip: 'Phenotype' };
  }
  return { type: 'kw', label: 'KW', tooltip: 'Keyword (text-based match)' };
};

// Abbreviate organism name (e.g., "Candida albicans SC5314" -> "C. albicans")
const getOrganismAbbrev = (organismName) => {
  if (!organismName) return '';
  const parts = organismName.split(' ');
  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}. ${parts[1]}`;
  }
  return organismName;
};

// Format locus display name like "AAF1/C3_06470W_A"
const formatLocusName = (result) => {
  if (result.gene_name && result.gene_name !== result.feature_name) {
    return `${result.gene_name}/${result.feature_name}`;
  }
  return result.feature_name || result.gene_name || '-';
};

// SearchHighlight component - highlights all occurrences of search term (case-insensitive)
const SearchHighlight = ({ text, searchTerm }) => {
  if (!searchTerm || !text) {
    return <>{text}</>;
  }

  const searchLower = searchTerm.toLowerCase();
  const parts = [];
  let lastIndex = 0;
  let textLower = text.toLowerCase();
  let index = textLower.indexOf(searchLower);

  while (index !== -1) {
    // Add text before the match
    if (index > lastIndex) {
      parts.push(text.slice(lastIndex, index));
    }
    // Add the highlighted match
    parts.push(
      <mark key={index} className="search-highlight">
        {text.slice(index, index + searchTerm.length)}
      </mark>
    );
    lastIndex = index + searchTerm.length;
    index = textLower.indexOf(searchLower, lastIndex);
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <>{parts}</>;
};

function VirulenceFactorBrowserPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Config/metadata state
  const [categories, setCategories] = useState([]);
  const [organisms, setOrganisms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [configError, setConfigError] = useState(null);

  // Filter state
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedOrganism, setSelectedOrganism] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Results state
  const [results, setResults] = useState(null);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [resultsError, setResultsError] = useState(null);

  // Quick filter state: pending (what user types) vs applied (what filters)
  const [pendingQuickFilter, setPendingQuickFilter] = useState('');
  const [appliedQuickFilter, setAppliedQuickFilter] = useState('');

  // Description expansion state
  const [expandedDescriptions, setExpandedDescriptions] = useState(new Set());

  // Request counter to handle race conditions - only use response from latest request
  const requestCounterRef = useRef(0);

  // Toggle description expansion for a specific gene
  const toggleDescriptionExpansion = useCallback((geneId) => {
    setExpandedDescriptions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(geneId)) {
        newSet.delete(geneId);
      } else {
        newSet.add(geneId);
      }
      return newSet;
    });
  }, []);

  const applyQuickFilter = () => {
    setAppliedQuickFilter(pendingQuickFilter);
  };

  const clearQuickFilter = () => {
    setPendingQuickFilter('');
    setAppliedQuickFilter('');
  };

  const hasPendingChanges = pendingQuickFilter !== appliedQuickFilter;

  // Load config (categories and organisms) on mount - only runs once
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);
        const [categoriesData, organismsData] = await Promise.all([
          virulenceFactorApi.getCategories(),
          virulenceFactorApi.getOrganisms(),
        ]);
        setCategories(categoriesData.categories || categoriesData || []);
        setOrganisms(organismsData || []);

        // Parse URL params for initial state (only on mount)
        const params = new URLSearchParams(window.location.search);
        const urlCategories = params.getAll('categories');
        const urlOrganism = params.get('organism') || '';
        const urlSearch = params.get('search') || '';

        if (urlCategories.length > 0) {
          setSelectedCategories(urlCategories);
        }
        if (urlOrganism) {
          setSelectedOrganism(urlOrganism);
        }
        if (urlSearch) {
          setSearchTerm(urlSearch);
        }
      } catch (err) {
        console.error('Failed to fetch config:', err);
        setConfigError('Failed to load virulence categories');
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Update URL params when filters change
  const updateUrlParams = useCallback(() => {
    const params = new URLSearchParams();
    selectedCategories.forEach((cat) => params.append('categories', cat));
    if (selectedOrganism) params.set('organism', selectedOrganism);
    if (searchTerm) params.set('search', searchTerm);
    setSearchParams(params, { replace: true });
  }, [selectedCategories, selectedOrganism, searchTerm, setSearchParams]);

  useEffect(() => {
    const timeoutId = setTimeout(updateUrlParams, 300);
    return () => clearTimeout(timeoutId);
  }, [updateUrlParams]);

  // Fetch results when filters change
  const fetchResults = useCallback(async () => {
    // Don't fetch if no categories selected and no search term
    if (selectedCategories.length === 0 && !searchTerm.trim()) {
      setResults(null);
      return;
    }

    // Increment request counter to track this request
    requestCounterRef.current += 1;
    const thisRequestId = requestCounterRef.current;

    setResultsLoading(true);
    setResultsError(null);

    try {
      const params = {
        categories: selectedCategories,
        organisms: selectedOrganism ? [selectedOrganism] : [],
        search_term: searchTerm.trim() || undefined,
        page: 1,
        page_size: 1000, // Get all results for client-side filtering
      };

      const data = await virulenceFactorApi.getFactors(params);

      // Only update state if this is still the latest request
      if (thisRequestId === requestCounterRef.current) {
        setResults(data);
      }
    } catch (err) {
      // Only update error state if this is still the latest request
      if (thisRequestId === requestCounterRef.current) {
        console.error('Failed to fetch virulence factors:', err);
        setResultsError(err.response?.data?.detail || err.message || 'Search failed');
      }
    } finally {
      // Only clear loading if this is still the latest request
      if (thisRequestId === requestCounterRef.current) {
        setResultsLoading(false);
      }
    }
  }, [selectedCategories, selectedOrganism, searchTerm]);

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(fetchResults, 500);
    return () => clearTimeout(timeoutId);
  }, [fetchResults]);

  // Handle category checkbox change
  const handleCategoryChange = (categoryKey, checked) => {
    if (checked) {
      setSelectedCategories((prev) => [...prev, categoryKey]);
    } else {
      setSelectedCategories((prev) => prev.filter((c) => c !== categoryKey));
    }
  };

  // Select all / clear all categories
  const selectAllCategories = () => {
    setSelectedCategories(categories.map((c) => c.key));
  };

  const clearAllCategories = () => {
    setSelectedCategories([]);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedOrganism('');
    setSearchTerm('');
    setPendingQuickFilter('');
    setAppliedQuickFilter('');
  };

  // Client-side download
  const handleClientDownload = (format = 'csv') => {
    if (!filteredResults || filteredResults.length === 0) return;

    const headers = [
      'Gene Name',
      'Systematic Name',
      'Organism',
      'Categories',
      'Matched By',
      'Description',
    ];

    const rows = filteredResults.map((item) => [
      item.gene_name || '',
      item.feature_name || '',
      getOrganismAbbrev(item.organism),
      (item.categories || []).join('; '),
      (item.match_reasons || []).join('; '),
      item.description || '',
    ]);

    const separator = format === 'csv' ? ',' : '\t';
    const escapeField = (val) => {
      const str = String(val || '');
      if (format === 'csv' && (str.includes(',') || str.includes('"') || str.includes('\n'))) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const content = [
      headers.map(escapeField).join(separator),
      ...rows.map((row) => row.map(escapeField).join(separator)),
    ].join('\n');

    const mimeType = format === 'csv' ? 'text/csv' : 'text/tab-separated-values';
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `virulence_factors.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Filter results by quick filter text
  const filteredResults = useMemo(() => {
    if (!results?.items) return [];
    let items = results.items;

    if (appliedQuickFilter.trim()) {
      const searchLower = appliedQuickFilter.toLowerCase().trim();
      items = items.filter((item) => {
        const searchFields = [
          item.gene_name,
          item.feature_name,
          item.organism,
          item.description,
          ...(item.categories || []),
          ...(item.match_reasons || []),
        ];
        return searchFields.some((field) => field && String(field).toLowerCase().includes(searchLower));
      });
    }

    return items;
  }, [results?.items, appliedQuickFilter]);

  // AG Grid column definitions
  const columnDefs = useMemo(
    () => [
      {
        headerName: 'Gene',
        field: 'gene',
        flex: 1,
        minWidth: 140,
        valueGetter: (params) => formatLocusName(params.data),
        cellRenderer: (params) => (
          <Link to={`/locus/${params.data.feature_name || params.data.gene_name}`} className="gene-link">
            {formatLocusName(params.data)}
          </Link>
        ),
      },
      {
        headerName: 'Organism',
        field: 'organism',
        flex: 0.6,
        minWidth: 100,
        valueGetter: (params) => getOrganismAbbrev(params.data.organism),
        cellRenderer: (params) => <em>{getOrganismAbbrev(params.data.organism)}</em>,
      },
      {
        headerName: 'Categories',
        field: 'categories',
        flex: 1,
        minWidth: 150,
        wrapText: true,
        cellStyle: { whiteSpace: 'normal', lineHeight: '1.4' },
        valueGetter: (params) => (params.data.categories || []).join(', '),
        cellRenderer: (params) => {
          const cats = params.data.categories || [];
          if (cats.length === 0) return '-';
          return (
            <div className="categories-cell">
              {cats.map((cat, idx) => {
                // Find the category key for this display name
                const catObj = categories.find(
                  (c) => c.name === cat || c.key === cat
                );
                const catKey = catObj?.key || cat.toLowerCase().replace(/[\s-]/g, '_');
                return (
                  <span key={idx} className={`category-tag ${getCategoryColorClass(catKey)}`}>
                    {cat}
                  </span>
                );
              })}
            </div>
          );
        },
      },
      {
        headerName: 'Matched By',
        field: 'match_reasons',
        flex: 1.5,
        minWidth: 220,
        wrapText: true,
        cellStyle: { whiteSpace: 'normal', lineHeight: '1.4' },
        valueGetter: (params) => (params.data.match_reasons || []).join('; '),
        cellRenderer: (params) => {
          const reasons = params.data.match_reasons || [];
          if (reasons.length === 0) return '-';
          return (
            <div className="match-reasons-cell">
              {reasons.map((reason, idx) => {
                const { type, label, tooltip } = categorizeMatchReason(reason);
                return (
                  <div key={idx} className={`match-reason match-reason-${type}`}>
                    <span
                      className={`match-type-badge badge-${type}`}
                      title={tooltip}
                    >
                      {label}
                    </span>
                    <span className="match-reason-text">{reason}</span>
                  </div>
                );
              })}
            </div>
          );
        },
      },
      {
        headerName: 'Description',
        field: 'description',
        flex: 2,
        minWidth: 250,
        wrapText: true,
        cellStyle: { whiteSpace: 'normal', lineHeight: '1.4' },
        valueGetter: (params) => params.data.description || '-',
        cellRenderer: (params) => {
          const desc = params.data.description || '-';
          const geneId = params.data.feature_name || params.data.gene_name;
          const isExpanded = expandedDescriptions.has(geneId);
          const highlightTerm = searchTerm || appliedQuickFilter;
          const TRUNCATE_LENGTH = 150;

          // Short descriptions don't need truncation
          if (desc === '-' || desc.length <= TRUNCATE_LENGTH) {
            if (highlightTerm) {
              return <SearchHighlight text={desc} searchTerm={highlightTerm} />;
            }
            return desc;
          }

          // Long description - show truncated or expanded
          if (isExpanded) {
            return (
              <div className="description-expandable">
                {highlightTerm ? (
                  <SearchHighlight text={desc} searchTerm={highlightTerm} />
                ) : (
                  desc
                )}
                <button
                  type="button"
                  className="description-toggle"
                  onClick={() => toggleDescriptionExpansion(geneId)}
                >
                  Show less
                </button>
              </div>
            );
          }

          const truncated = desc.slice(0, TRUNCATE_LENGTH) + '...';
          return (
            <div className="description-expandable">
              {highlightTerm ? (
                <SearchHighlight text={truncated} searchTerm={highlightTerm} />
              ) : (
                truncated
              )}
              <button
                type="button"
                className="description-toggle"
                onClick={() => toggleDescriptionExpansion(geneId)}
              >
                Show more
              </button>
            </div>
          );
        },
      },
    ],
    [categories, searchTerm, appliedQuickFilter, expandedDescriptions, toggleDescriptionExpansion]
  );

  // Default column properties
  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      resizable: true,
    }),
    []
  );

  // Grid ref for refreshing row heights
  const gridRef = useRef(null);

  // Calculate row height based on content
  const getRowHeight = useCallback((params) => {
    const minHeight = 60;
    const lineHeight = 20;

    const categories = params.data.categories || [];
    const matchReasons = params.data.match_reasons || [];
    const description = params.data.description || '';
    const geneId = params.data.feature_name || params.data.gene_name;

    const maxItems = Math.max(categories.length, matchReasons.length);

    // Check if description is expanded
    const isExpanded = expandedDescriptions.has(geneId);
    const descLines = isExpanded
      ? Math.ceil(description.length / 40) // More lines when expanded
      : Math.min(Math.ceil(description.length / 50), 4); // Truncated

    const maxLines = Math.max(2, maxItems, descLines);
    return Math.max(minHeight, maxLines * lineHeight + 20);
  }, [expandedDescriptions]);

  // Refresh row heights when descriptions expand/collapse
  useEffect(() => {
    if (gridRef.current?.api) {
      gridRef.current.api.resetRowHeights();
    }
  }, [expandedDescriptions]);

  // Render loading state
  if (loading) {
    return (
      <div className="virulence-factor-browser-page">
        <header className="page-header">
          <h1>Virulence Factor Browser</h1>
          <hr />
        </header>
        <div className="loading-section">
          <div className="loading-spinner"></div>
          <p>Loading virulence categories...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (configError) {
    return (
      <div className="virulence-factor-browser-page">
        <header className="page-header">
          <h1>Virulence Factor Browser</h1>
          <hr />
        </header>
        <div className="error-section">
          <div className="error-icon">&#9888;</div>
          <p className="error-message">{configError}</p>
        </div>
      </div>
    );
  }

  const hasFilters = selectedCategories.length > 0 || selectedOrganism || searchTerm;
  const hasResults = results?.items && results.items.length > 0;

  return (
    <div className="virulence-factor-browser-page">
      <header className="page-header">
        <h1>Virulence Factor Browser</h1>
        <hr />
        <p className="subtitle">
          Searchable catalog of Candida virulence-related genes including adhesins, secreted enzymes,
          morphogenesis genes, host interaction factors, biofilm-related genes, and immune evasion genes.
        </p>
      </header>

      <div className="browser-layout">
        {/* Filter Sidebar */}
        <aside className="filter-sidebar">
          <div className="filter-section">
            <h3>Virulence Categories</h3>
            <div className="category-actions">
              <button type="button" onClick={selectAllCategories} className="action-link">
                Select All
              </button>
              <span className="separator">|</span>
              <button type="button" onClick={clearAllCategories} className="action-link">
                Clear All
              </button>
            </div>
            <div className="category-list">
              {categories.map((category) => (
                <label key={category.key} className="category-item">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category.key)}
                    onChange={(e) => handleCategoryChange(category.key, e.target.checked)}
                  />
                  <span className="category-name">{category.name}</span>
                  <span className="category-count">({category.count || 0})</span>
                </label>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h3>Organism</h3>
            <select
              value={selectedOrganism}
              onChange={(e) => setSelectedOrganism(e.target.value)}
              className="organism-dropdown"
            >
              <option value="">All Organisms</option>
              {organisms.map((org) => (
                <option key={org.organism_abbrev || org.name} value={org.organism_abbrev || org.name}>
                  {org.name || org.organism_abbrev}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-section">
            <h3>Search</h3>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Gene name or keyword..."
              className="search-input"
            />
          </div>

          <div className="filter-actions">
            <button
              type="button"
              onClick={clearAllFilters}
              className="btn-clear"
              disabled={!hasFilters}
            >
              Clear All Filters
            </button>
          </div>
        </aside>

        {/* Results Panel */}
        <main className="results-panel">
          {/* Active filters chips */}
          {hasFilters && (
            <div className="active-filters">
              <span className="filters-label">Active Filters:</span>
              {selectedCategories.map((catKey) => {
                const cat = categories.find((c) => c.key === catKey);
                return (
                  <span key={catKey} className="filter-chip">
                    {cat?.name || catKey}
                    <button
                      type="button"
                      onClick={() => handleCategoryChange(catKey, false)}
                      className="chip-remove"
                    >
                      &times;
                    </button>
                  </span>
                );
              })}
              {selectedOrganism && (
                <span className="filter-chip">
                  Organism: {selectedOrganism}
                  <button
                    type="button"
                    onClick={() => setSelectedOrganism('')}
                    className="chip-remove"
                  >
                    &times;
                  </button>
                </span>
              )}
              {searchTerm && (
                <span className="filter-chip">
                  Search: &quot;{searchTerm}&quot;
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="chip-remove"
                  >
                    &times;
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Loading state */}
          {resultsLoading && (
            <div className="loading-section">
              <div className="loading-spinner"></div>
              <p>Searching virulence factors...</p>
            </div>
          )}

          {/* Error state */}
          {resultsError && (
            <div className="error-section">
              <div className="error-icon">&#9888;</div>
              <p className="error-message">{resultsError}</p>
            </div>
          )}

          {/* No filters selected */}
          {!resultsLoading && !resultsError && !hasFilters && (
            <div className="empty-state">
              <p>Select one or more virulence categories to browse genes.</p>
              <p>You can also search by gene name or keyword.</p>
            </div>
          )}

          {/* No results */}
          {!resultsLoading && !resultsError && hasFilters && !hasResults && (
            <div className="no-results">
              <p>No virulence factors found matching your criteria.</p>
              <p>Try selecting different categories or broadening your search.</p>
            </div>
          )}

          {/* Results */}
          {!resultsLoading && !resultsError && hasResults && (
            <>
              <div className="results-summary">
                <div className="results-summary-left">
                  <div className="results-count">
                    Found <strong>{results.total_count || results.items.length}</strong> virulence factor
                    {(results.total_count || results.items.length) !== 1 ? 's' : ''}
                  </div>
                </div>
                <div className="results-summary-right">
                  <button
                    type="button"
                    className="btn-download"
                    onClick={() => handleClientDownload('csv')}
                  >
                    Download CSV
                  </button>
                  <button
                    type="button"
                    className="btn-download"
                    onClick={() => handleClientDownload('tsv')}
                  >
                    Download TSV
                  </button>
                </div>
              </div>

              {/* Quick filter */}
              <div className="filter-controls">
                <div className="filter-group">
                  <label htmlFor="quick-filter">Filter results: </label>
                  <input
                    type="text"
                    id="quick-filter"
                    value={pendingQuickFilter}
                    onChange={(e) => setPendingQuickFilter(e.target.value)}
                    placeholder="Type to filter..."
                    className="quick-filter-input"
                  />
                  <button
                    type="button"
                    className="apply-filter-btn"
                    onClick={applyQuickFilter}
                    disabled={!hasPendingChanges}
                  >
                    Apply
                  </button>
                  {(appliedQuickFilter || pendingQuickFilter) && (
                    <button
                      type="button"
                      className="clear-filter-btn"
                      onClick={clearQuickFilter}
                      title="Clear filter"
                    >
                      &times;
                    </button>
                  )}
                </div>

                {appliedQuickFilter && (
                  <div className="filter-status">
                    Showing {filteredResults.length} of {results.items.length} results
                    <span className="filter-tag">Filter: &quot;{appliedQuickFilter}&quot;</span>
                  </div>
                )}
              </div>

              {/* Results table */}
              <div className="results-grid-wrapper ag-theme-alpine" style={{ width: '100%' }}>
                <AgGridReact
                  ref={gridRef}
                  rowData={filteredResults}
                  columnDefs={columnDefs}
                  defaultColDef={defaultColDef}
                  domLayout="autoHeight"
                  pagination={true}
                  paginationPageSize={10}
                  paginationPageSizeSelector={[10, 25, 50, 100]}
                  suppressCellFocus={true}
                  getRowHeight={getRowHeight}
                />
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default VirulenceFactorBrowserPage;
