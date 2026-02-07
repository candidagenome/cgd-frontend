import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import patmatchApi from '../api/patmatchApi';
import './PatmatchResultsPage.css';

const HITS_PER_PAGE = 20;

function PatmatchResultsPage() {
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [downloading, setDownloading] = useState(false);

  // Extract search parameters from URL
  const pattern = searchParams.get('pattern') || '';
  const patternType = searchParams.get('type') || 'dna';
  const dataset = searchParams.get('ds') || 'chromosomes';
  const strand = searchParams.get('strand') || 'both';
  const maxMismatches = parseInt(searchParams.get('mm'), 10) || 0;
  const maxInsertions = parseInt(searchParams.get('ins'), 10) || 0;
  const maxDeletions = parseInt(searchParams.get('del'), 10) || 0;
  const maxResults = parseInt(searchParams.get('max'), 10) || 100;

  // Fetch results on mount
  useEffect(() => {
    const fetchResults = async () => {
      if (!pattern) {
        setError('No pattern specified');
        setLoading(false);
        return;
      }

      try {
        const params = {
          pattern,
          pattern_type: patternType,
          dataset,
          strand,
          max_mismatches: maxMismatches,
          max_insertions: maxInsertions,
          max_deletions: maxDeletions,
          max_results: maxResults,
        };

        const response = await patmatchApi.search(params);

        if (response.success && response.result) {
          setResults(response.result);
        } else {
          setError(response.error || 'Pattern match search failed');
        }
      } catch (err) {
        // Handle Pydantic validation errors (array of error objects)
        const detail = err.response?.data?.detail;
        let errorMsg = 'Search failed';
        if (Array.isArray(detail)) {
          // Extract messages from validation errors
          errorMsg = detail.map((e) => e.msg || e.message || JSON.stringify(e)).join('; ');
        } else if (typeof detail === 'string') {
          errorMsg = detail;
        } else if (err.message) {
          errorMsg = err.message;
        }
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [pattern, patternType, dataset, strand, maxMismatches, maxInsertions, maxDeletions, maxResults]);

  // Pagination
  const totalHits = results?.hits?.length || 0;
  const totalPages = Math.ceil(totalHits / HITS_PER_PAGE);
  const startIdx = (currentPage - 1) * HITS_PER_PAGE;
  const endIdx = startIdx + HITS_PER_PAGE;
  const paginatedHits = results?.hits?.slice(startIdx, endIdx) || [];

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    window.scrollTo(0, 0);
  };

  // Build new search URL
  const buildNewSearchUrl = () => {
    const params = new URLSearchParams();
    if (pattern) params.set('pattern', pattern);
    params.set('type', patternType);
    params.set('ds', dataset);
    if (patternType === 'dna') params.set('strand', strand);
    if (maxMismatches > 0) params.set('mm', maxMismatches.toString());
    if (maxInsertions > 0) params.set('ins', maxInsertions.toString());
    if (maxDeletions > 0) params.set('del', maxDeletions.toString());
    return `/patmatch?${params.toString()}`;
  };

  // Handle download
  const handleDownload = async () => {
    setDownloading(true);
    try {
      await patmatchApi.downloadResults({
        pattern,
        pattern_type: patternType,
        dataset,
        strand,
        max_mismatches: maxMismatches,
        max_insertions: maxInsertions,
        max_deletions: maxDeletions,
        max_results: 10000, // Download all results, not just paginated
      });
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setDownloading(false);
    }
  };

  // Render pagination controls
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="pagination">
        <button
          className="pagination-btn"
          onClick={() => goToPage(1)}
          disabled={currentPage === 1}
        >
          &laquo; First
        </button>
        <button
          className="pagination-btn"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          &lsaquo; Prev
        </button>
        <span className="pagination-info">
          Page {currentPage} of {totalPages}
        </span>
        <button
          className="pagination-btn"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next &rsaquo;
        </button>
        <button
          className="pagination-btn"
          onClick={() => goToPage(totalPages)}
          disabled={currentPage === totalPages}
        >
          Last &raquo;
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="patmatch-results-page">
        <div className="patmatch-content">
          <h1>Pattern Match Results</h1>
          <hr />
          <div className="loading-state">
            <span className="loading-spinner"></span>
            Searching for pattern "{pattern}"...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="patmatch-results-page">
        <div className="patmatch-content">
          <h1>Pattern Match Results</h1>
          <hr />
          <div className="error-state">
            <strong>Error</strong>
            <p>{error}</p>
          </div>
          <div className="back-link">
            <Link to={buildNewSearchUrl()}>← Back to Search</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="patmatch-results-page">
      <div className="patmatch-content">
        <h1>Pattern Match Results</h1>
        <hr />

        {/* Search Summary */}
        <div className="results-summary">
          <div className="summary-row">
            <span><strong>Pattern:</strong> <code>{results.pattern}</code></span>
            <span><strong>Type:</strong> {results.pattern_type}</span>
            <span><strong>Dataset:</strong> {results.dataset}</span>
            {patternType === 'dna' && <span><strong>Strand:</strong> {results.strand}</span>}
          </div>
          <div className="summary-row">
            <span>
              <strong>Found {results.total_hits} match{results.total_hits !== 1 ? 'es' : ''}</strong>
              {' '}in {results.sequences_searched.toLocaleString()} sequences
              ({results.total_residues_searched.toLocaleString()} residues)
            </span>
          </div>
          <div className="action-links">
            <Link to={buildNewSearchUrl()} className="new-search-link">
              ← New Search
            </Link>
            {results.total_hits > 0 && (
              <button
                className="download-btn"
                onClick={handleDownload}
                disabled={downloading}
              >
                {downloading ? 'Downloading...' : 'Download Full Results (TSV)'}
              </button>
            )}
          </div>
        </div>

        {results.total_hits === 0 ? (
          <div className="no-results">
            <p>No matches found for pattern "{results.pattern}"</p>
            <p className="hint">
              Try using IUPAC ambiguity codes or allow mismatches in Advanced Options.
            </p>
          </div>
        ) : (
          <>
            <div className="results-info">
              Showing {startIdx + 1}-{Math.min(endIdx, totalHits)} of {totalHits} matches
            </div>

            {renderPagination()}

            <table className="results-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Sequence</th>
                  <th>Position</th>
                  <th>Strand</th>
                  <th>Match</th>
                  <th>Context</th>
                </tr>
              </thead>
              <tbody>
                {paginatedHits.map((hit, idx) => (
                  <tr key={idx}>
                    <td className="row-num">{startIdx + idx + 1}</td>
                    <td>
                      {hit.locus_link ? (
                        <Link to={hit.locus_link} target="_blank" rel="noopener noreferrer">
                          {hit.sequence_name}
                        </Link>
                      ) : (
                        hit.sequence_name
                      )}
                      {hit.sequence_description &&
                        hit.sequence_description !== hit.sequence_name && (
                          <span className="seq-desc"> ({hit.sequence_description})</span>
                        )}
                    </td>
                    <td className="position-cell">
                      {hit.match_start.toLocaleString()}-{hit.match_end.toLocaleString()}
                      {hit.jbrowse_link && (
                        <a
                          href={hit.jbrowse_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="jbrowse-link"
                          title="View in JBrowse"
                        >
                          JB
                        </a>
                      )}
                    </td>
                    <td className="strand-cell">{hit.strand}</td>
                    <td className="match-cell">
                      <code>{hit.matched_sequence}</code>
                    </td>
                    <td className="context-cell">
                      <code>
                        <span className="context-before">{hit.context_before}</span>
                        <span className="context-match">{hit.matched_sequence}</span>
                        <span className="context-after">{hit.context_after}</span>
                      </code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {renderPagination()}
          </>
        )}
      </div>
    </div>
  );
}

export default PatmatchResultsPage;
