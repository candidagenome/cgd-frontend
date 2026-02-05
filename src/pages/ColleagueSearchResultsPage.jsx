import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import colleagueApi from '../api/colleagueApi';
import './ColleagueSearchResultsPage.css';

function ColleagueSearchResultsPage() {
  const [searchParams] = useSearchParams();
  const lastName = searchParams.get('last_name') || '';

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  useEffect(() => {
    if (!lastName) {
      setError('No search term provided');
      setLoading(false);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await colleagueApi.search(lastName, page, pageSize);
        if (data.success) {
          setResults(data);
        } else {
          setError(data.error || 'Search failed');
        }
      } catch (err) {
        console.error('Search error:', err);
        setError(err.response?.data?.detail || err.message || 'Search failed');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [lastName, page, pageSize]);

  const goToPage = (newPage) => {
    setPage(Math.max(1, Math.min(newPage, results?.total_pages || 1)));
    window.scrollTo(0, 0);
  };

  if (loading) {
    return (
      <div className="colleague-results-page">
        <div className="colleague-results-content">
          <h1>CGD Colleague Search Results</h1>
          <hr />
          <div className="loading-state">
            <span className="loading-spinner"></span>
            Searching...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="colleague-results-page">
        <div className="colleague-results-content">
          <h1>CGD Colleague Search Results</h1>
          <hr />
          <div className="error-state">
            <strong>Error:</strong> {error}
          </div>
          <div className="back-link">
            <Link to="/colleague">&larr; Back to Search</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="colleague-results-page">
      <div className="colleague-results-content">
        <h1>CGD Colleague Search Results</h1>
        <hr />

        {results?.wildcard_appended && (
          <div className="wildcard-notice">
            To make sure you find the person of interest, your query has been
            changed from <span className="highlight">{lastName}</span> to:{' '}
            <span className="highlight">{results.search_term}</span>
          </div>
        )}

        <div className="search-summary">
          <strong>Search Results for:</strong>{' '}
          <span className="highlight">{results?.search_term}</span>
          <span className="result-count">
            ({results?.total_count || 0} result{results?.total_count !== 1 ? 's' : ''})
          </span>
        </div>

        {results?.total_count === 0 ? (
          <div className="no-results">
            <p>
              The last name "<strong>{lastName}</strong>" you have submitted is
              not in our database.
            </p>
            <p>
              <Link to="/colleague">&larr; Try another search</Link>
            </p>
          </div>
        ) : (
          <>
            {/* Pagination Top */}
            {results?.total_pages > 1 && (
              <div className="pagination">
                <button onClick={() => goToPage(1)} disabled={page === 1}>
                  &laquo; First
                </button>
                <button onClick={() => goToPage(page - 1)} disabled={page === 1}>
                  &lsaquo; Prev
                </button>
                <span className="pagination-info">
                  Page {page} of {results.total_pages}
                </span>
                <button
                  onClick={() => goToPage(page + 1)}
                  disabled={page === results.total_pages}
                >
                  Next &rsaquo;
                </button>
                <button
                  onClick={() => goToPage(results.total_pages)}
                  disabled={page === results.total_pages}
                >
                  Last &raquo;
                </button>
              </div>
            )}

            <table className="results-table">
              <thead>
                <tr>
                  <th>Name (Last, First)</th>
                  <th>Organization</th>
                  <th>Contact Info</th>
                </tr>
              </thead>
              <tbody>
                {results?.colleagues?.map((coll) => (
                  <tr key={coll.colleague_no}>
                    <td>
                      <Link to={`/colleague/${coll.colleague_no}`}>
                        {coll.full_name}
                      </Link>
                    </td>
                    <td>{coll.institution || '-'}</td>
                    <td className="contact-cell">
                      {coll.work_phone && (
                        <div>Work phone: {coll.work_phone}</div>
                      )}
                      {coll.other_phone && (
                        <div>Other phone: {coll.other_phone}</div>
                      )}
                      {coll.fax && <div>Fax: {coll.fax}</div>}
                      {coll.email && <div>E-mail: {coll.email}</div>}
                      {coll.urls?.map((url, idx) => (
                        <div key={idx}>
                          WWW:{' '}
                          <a href={url.url} target="_blank" rel="noopener noreferrer">
                            {url.url_type || url.url}
                          </a>
                        </div>
                      ))}
                      {!coll.work_phone && !coll.other_phone && !coll.fax &&
                       !coll.email && (!coll.urls || coll.urls.length === 0) && '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Bottom */}
            {results?.total_pages > 1 && (
              <div className="pagination">
                <button onClick={() => goToPage(1)} disabled={page === 1}>
                  &laquo; First
                </button>
                <button onClick={() => goToPage(page - 1)} disabled={page === 1}>
                  &lsaquo; Prev
                </button>
                <span className="pagination-info">
                  Page {page} of {results.total_pages}
                </span>
                <button
                  onClick={() => goToPage(page + 1)}
                  disabled={page === results.total_pages}
                >
                  Next &rsaquo;
                </button>
                <button
                  onClick={() => goToPage(results.total_pages)}
                  disabled={page === results.total_pages}
                >
                  Last &raquo;
                </button>
              </div>
            )}
          </>
        )}

        <div className="action-links">
          <Link to="/colleague">New Colleague Search</Link>
        </div>
      </div>
    </div>
  );
}

export default ColleagueSearchResultsPage;
