import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import referenceApi from '../api/referenceApi';
import { renderCitationItem } from '../utils/formatCitation';
import './NewPapersThisWeekPage.css';

function NewPapersThisWeekPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await referenceApi.getNewPapersThisWeek(7);
        setData(result);
      } catch (err) {
        setError(err.response?.data?.detail || err.message || 'Failed to load new papers');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
        <h1>New Papers This Week</h1>
        <p className="date-range">
          Papers added to CGD from {formatDate(data?.start_date)} to {formatDate(data?.end_date)}
        </p>
      </header>

      <div className="results-summary">
        <strong>{data?.total_count || 0}</strong> paper{data?.total_count !== 1 ? 's' : ''} added
        this week
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
          <p>No new papers were added to CGD this week.</p>
        </div>
      )}

      <div className="back-link">
        <Link to="/">Back to Home</Link>
      </div>
    </div>
  );
}

export default NewPapersThisWeekPage;
