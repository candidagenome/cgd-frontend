import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import featureSearchApi from '../api/featureSearchApi';
import './FeatureSearchResultsPage.css';

function FeatureSearchResultsPage() {
  const navigate = useNavigate();

  // State
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useState(null);
  const [downloading, setDownloading] = useState(false);

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize] = useState(30);
  const [sortBy, setSortBy] = useState('orf');

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
      setPage(params.page || 1);
      setSortBy(params.sort_by || 'orf');
    } catch (err) {
      setError('Invalid search parameters');
      setLoading(false);
    }
  }, []);

  // Fetch results when params or pagination changes
  const fetchResults = useCallback(async () => {
    if (!searchParams) return;

    setLoading(true);
    setError(null);

    try {
      const params = {
        ...searchParams,
        page,
        page_size: pageSize,
        sort_by: sortBy,
      };

      const response = await featureSearchApi.search(params);
      setResults(response);
    } catch (err) {
      console.error('Search error:', err);
      setError(err.response?.data?.error || err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  }, [searchParams, page, pageSize, sortBy]);

  useEffect(() => {
    if (searchParams) {
      fetchResults();
    }
  }, [searchParams, fetchResults]);

  // Handle pagination
  const goToPage = (newPage) => {
    setPage(Math.max(1, Math.min(newPage, results?.total_pages || 1)));
    window.scrollTo(0, 0);
  };

  // Handle sort change
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setPage(1);
  };

  // Handle download
  const handleDownload = async () => {
    if (!searchParams) return;

    setDownloading(true);
    try {
      await featureSearchApi.downloadResults({
        ...searchParams,
        page: 1,
        page_size: 10000, // Download all
        sort_by: sortBy,
      });
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download results');
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

  // Render pagination controls
  const renderPagination = () => {
    if (!results || results.total_pages <= 1) return null;

    return (
      <div className="pagination">
        <button
          className="pagination-btn"
          onClick={() => goToPage(1)}
          disabled={page === 1}
        >
          &laquo; First
        </button>
        <button
          className="pagination-btn"
          onClick={() => goToPage(page - 1)}
          disabled={page === 1}
        >
          &lsaquo; Prev
        </button>
        <span className="pagination-info">
          Page {page} of {results.total_pages}
        </span>
        <button
          className="pagination-btn"
          onClick={() => goToPage(page + 1)}
          disabled={page === results.total_pages}
        >
          Next &rsaquo;
        </button>
        <button
          className="pagination-btn"
          onClick={() => goToPage(results.total_pages)}
          disabled={page === results.total_pages}
        >
          Last &raquo;
        </button>
      </div>
    );
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
            <div className="results-info">
              Showing {((page - 1) * pageSize) + 1}-
              {Math.min(page * pageSize, results?.total_count || 0)} of{' '}
              {results?.total_count?.toLocaleString() || 0} features
            </div>

            {renderPagination()}

            <table className="results-table">
              <thead>
                <tr>
                  <th>ORF</th>
                  <th>Gene</th>
                  <th>Feature Type</th>
                  <th>Qualifier</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {results?.features?.map((feature, idx) => (
                  <tr key={feature.feature_id || idx}>
                    <td>
                      <Link to={`/locus/${feature.orf}`}>
                        {feature.orf}
                      </Link>
                    </td>
                    <td className="gene-cell">
                      {feature.gene || '-'}
                    </td>
                    <td className="type-cell">
                      {feature.feature_type}
                    </td>
                    <td className="qualifier-cell">
                      {feature.qualifier || '-'}
                    </td>
                    <td className="description-cell">
                      {feature.description || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {renderPagination()}

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
