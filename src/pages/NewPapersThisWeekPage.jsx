import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import referenceApi from '../api/referenceApi';
import { renderCitationItem } from '../utils/formatCitation';
import './NewPapersThisWeekPage.css';

function NewPapersThisWeekPage() {
  const [searchParams] = useSearchParams();
  const requestedDays = Number.parseInt(searchParams.get('days') || '7', 10);
  const days = Number.isFinite(requestedDays) ? Math.min(Math.max(requestedDays, 1), 365) : 7;
  const isWeekly = days === 7;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await referenceApi.getNewPapersThisWeek(days);
        setData(result);
      } catch (err) {
        setError(err.response?.data?.detail || err.message || 'Failed to load new papers');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [days]);

  const formatDate = (isoDate) => {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="new-papers-page">
        <div className="loading">Loading new papers...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="new-papers-page">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="new-papers-page">
      <header className="page-header">
        <h1>{isWeekly ? 'New Papers This Week' : 'Recently Added Papers'}</h1>
        <p className="date-range">
          Papers added to CGD from {formatDate(data?.start_date)} to {formatDate(data?.end_date)}
        </p>
      </header>

      <div className="results-summary">
        <strong>{data?.total_count || 0}</strong> paper{data?.total_count !== 1 ? 's' : ''} added
        {isWeekly ? ' this week' : ` in the last ${days} days`}
      </div>

      {data?.references?.length > 0 ? (
        <div className="papers-list">
          {data.references.map((paper) => (
            <div key={paper.reference_no} className="paper-item">
              {renderCitationItem(paper, { itemClassName: '' })}
              <div className="date-added">Added: {formatDate(paper.date_created)}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-papers">
          <p>No new papers were added to CGD during this period.</p>
        </div>
      )}

      <div className="back-link">
        <Link to="/browse/references">Back to References</Link>
      </div>
    </div>
  );
}

export default NewPapersThisWeekPage;
