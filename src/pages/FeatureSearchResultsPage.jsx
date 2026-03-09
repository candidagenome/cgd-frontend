import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import featureSearchApi from '../api/featureSearchApi';
import './FeatureSearchResultsPage.css';

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

// Custom cell renderer for ORF links
const OrfLinkRenderer = (props) => {
  if (!props.value) return '-';
  return <Link to={`/locus/${props.value}`}>{props.value}</Link>;
};

function FeatureSearchResultsPage() {
  // State
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [sortBy, setSortBy] = useState('orf');

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

  // AG Grid column definitions
  const columnDefs = useMemo(() => [
    {
      headerName: 'ORF',
      field: 'orf',
      cellRenderer: OrfLinkRenderer,
      sortable: true,
      minWidth: 120,
      flex: 1,
    },
    {
      headerName: 'Gene',
      field: 'gene',
      sortable: true,
      minWidth: 100,
      flex: 1,
      cellStyle: { fontStyle: 'italic' },
      valueFormatter: (params) => params.value || '-',
    },
    {
      headerName: 'Feature Type',
      field: 'feature_type',
      sortable: true,
      minWidth: 130,
      flex: 1,
    },
    {
      headerName: 'Qualifier',
      field: 'qualifier',
      sortable: true,
      minWidth: 100,
      flex: 1,
      valueFormatter: (params) => params.value || '-',
    },
    {
      headerName: 'Description',
      field: 'description',
      sortable: true,
      minWidth: 250,
      flex: 2,
      wrapText: true,
      autoHeight: true,
      cellClass: 'ag-cell-wrap-text',
      valueFormatter: (params) => params.value || '-',
    },
  ], []);

  // AG Grid default column definitions
  const defaultColDef = useMemo(() => ({
    resizable: true,
  }), []);

  // Filter results by applied quick filter text
  const filteredFeatures = useMemo(() => {
    if (!results?.features || !appliedQuickFilter.trim()) return results?.features || [];
    const searchLower = appliedQuickFilter.toLowerCase().trim();
    return results.features.filter((f) => {
      const searchFields = [f.orf, f.gene, f.feature_type, f.qualifier, f.description];
      return searchFields.some((field) => field && String(field).toLowerCase().includes(searchLower));
    });
  }, [results?.features, appliedQuickFilter]);

  // Fetch search params from sessionStorage on mount
  useEffect(() => {
    const storedParams = sessionStorage.getItem('featureSearchParams');
    if (!storedParams) {
      setError('No search parameters found. Please start a new search.');
      setLoading(false);
      return;
    }

    try {
      const params = JSON.parse(storedParams);
      setSearchParams(params);
      setSortBy(params.sort_by || 'orf');
    } catch (err) {
      setError('Invalid search parameters');
      setLoading(false);
    }
  }, []);

  // Fetch results when params change
  const fetchResults = useCallback(async () => {
    if (!searchParams) return;

    setLoading(true);
    setError(null);

    try {
      const params = {
        ...searchParams,
        sort_by: sortBy,
      };

      const response = await featureSearchApi.search(params);
      setResults(response);
    } catch (err) {
      console.error('Search error:', err);
      setError(err.response?.data?.detail || err.response?.data?.error || err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  }, [searchParams, sortBy]);

  useEffect(() => {
    if (searchParams) {
      fetchResults();
    }
  }, [searchParams, fetchResults]);

  // Handle sort change
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  // Handle download
  const handleDownload = async () => {
    if (!searchParams) return;

    setDownloading(true);
    try {
      await featureSearchApi.downloadResults({
        ...searchParams,
        sort_by: sortBy,
      });
    } catch (err) {
      console.error('Download error:', err);
      alert(`Failed to download results: ${err.message || 'Unknown error'}`);
    } finally {
      setDownloading(false);
    }
  };

  // Build query summary
  const buildQuerySummary = () => {
    if (!searchParams) return null;

    const parts = [];

    if (searchParams.organism) {
      parts.push(`Organism: ${searchParams.organism}`);
    }

    if (searchParams.include_all_types) {
      parts.push('Feature Types: All');
    } else if (searchParams.feature_types?.length > 0) {
      parts.push(`Feature Types: ${searchParams.feature_types.join(', ')}`);
    }

    if (searchParams.qualifiers?.length > 0) {
      parts.push(`Qualifiers: ${searchParams.qualifiers.join(', ')}`);
    }

    if (searchParams.has_introns === true) {
      parts.push('Has Introns: Yes');
    } else if (searchParams.has_introns === false) {
      parts.push('Has Introns: No');
    }

    if (searchParams.chromosomes?.length > 0) {
      parts.push(`Chromosomes: ${searchParams.chromosomes.join(', ')}`);
    }

    return parts;
  };

  if (loading && !results) {
    return (
      <div className="feature-results-page">
        <div className="feature-results-content">
          <h1>Advanced Search Results</h1>
          <hr />
          <div className="loading-state">
            <span className="loading-spinner"></span>
            Searching...
          </div>
        </div>
      </div>
    );
  }

  if (error && !results) {
    return (
      <div className="feature-results-page">
        <div className="feature-results-content">
          <h1>Advanced Search Results</h1>
          <hr />
          <div className="error-state">
            <strong>Error</strong>
            <p>{error}</p>
          </div>
          <div className="back-link">
            <Link to="/feature-search">&larr; Back to Search</Link>
          </div>
        </div>
      </div>
    );
  }

  const queryParts = buildQuerySummary();

  return (
    <div className="feature-results-page">
      <div className="feature-results-content">
        <h1>Advanced Search Results</h1>
        <hr />

        {/* Query Summary */}
        <div className="results-summary">
          <div className="summary-header">
            <strong>
              Found {results?.total_count?.toLocaleString() || 0} feature
              {results?.total_count !== 1 ? 's' : ''}
            </strong>
            <Link to="/feature-search" className="new-search-link">
              &larr; New Search
            </Link>
          </div>

          {queryParts && queryParts.length > 0 && (
            <div className="query-details">
              {queryParts.map((part, idx) => (
                <span key={idx} className="query-part">
                  {part}
                </span>
              ))}
            </div>
          )}

          <div className="results-actions">
            <div className="sort-control">
              <label>Sort by:</label>
              <select value={sortBy} onChange={handleSortChange}>
                <option value="orf">ORF Name</option>
                <option value="gene">Gene Name</option>
                <option value="feature_type">Feature Type</option>
              </select>
            </div>

            <button
              className="download-btn"
              onClick={handleDownload}
              disabled={downloading || !results?.features?.length}
            >
              {downloading ? 'Downloading...' : 'Download TSV'}
            </button>
          </div>
        </div>

        {loading && (
          <div className="loading-overlay">
            <span className="loading-spinner"></span>
          </div>
        )}

        {results?.total_count === 0 ? (
          <div className="no-results">
            <p>No features found matching your criteria.</p>
            <p className="hint">
              Try broadening your search by selecting more feature types or removing filters.
            </p>
          </div>
        ) : (
          <>
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
                  Showing {filteredFeatures.length} of {results?.features?.length || 0} results
                </span>
              )}
            </div>

            <div className="ag-grid-container">
              <AgGridReact
                rowData={filteredFeatures}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                domLayout="autoHeight"
                pagination={true}
                paginationPageSize={10}
                paginationPageSizeSelector={[10, 25, 50, 100]}
                suppressCellFocus={true}
                enableCellTextSelection={true}
                getRowId={(params) => params.data.feature_id || params.data.orf}
              />
            </div>

            {/* Filter Counts Summary */}
            {results?.filter_counts && (
              <div className="filter-counts">
                <h3>Filter Summary</h3>
                <div className="counts-grid">
                  {results.filter_counts.by_feature_type && (
                    <div className="count-section">
                      <h4>By Feature Type</h4>
                      <ul>
                        {Object.entries(results.filter_counts.by_feature_type).map(
                          ([type, count]) => (
                            <li key={type}>
                              <span className="count-label">{type}:</span>
                              <span className="count-value">{count.toLocaleString()}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                  {results.filter_counts.by_qualifier && (
                    <div className="count-section">
                      <h4>By Qualifier</h4>
                      <ul>
                        {Object.entries(results.filter_counts.by_qualifier).map(
                          ([qual, count]) => (
                            <li key={qual}>
                              <span className="count-label">{qual}:</span>
                              <span className="count-value">{count.toLocaleString()}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                  {results.filter_counts.by_chromosome && (
                    <div className="count-section">
                      <h4>By Chromosome</h4>
                      <ul>
                        {Object.entries(results.filter_counts.by_chromosome).map(
                          ([chr, count]) => (
                            <li key={chr}>
                              <span className="count-label">{chr}:</span>
                              <span className="count-value">{count.toLocaleString()}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default FeatureSearchResultsPage;
