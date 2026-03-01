import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import referenceApi from '../api/referenceApi';
import { renderCitationItem } from '../utils/formatCitation';
import './GenomeWideAnalysisPapersPage.css';

const PAGE_SIZE = 50;

function DiseaseRelatedPapersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentTopic = searchParams.get('topic') || null;
  const currentPage = parseInt(searchParams.get('page'), 10) || 1;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await referenceApi.getDiseaseRelatedPapers(
          currentTopic,
          currentPage,
          PAGE_SIZE
        );
        setData(result);
      } catch (err) {
        setError(
          err.response?.data?.detail || err.message || 'Failed to load disease-related papers'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentTopic, currentPage]);

  const handleTopicClick = (topic) => {
    const params = new URLSearchParams();
    if (topic) params.set('topic', topic);
    params.set('page', '1');
    setSearchParams(params);
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
  };

  const renderTopicFilters = () => {
    if (!data?.available_topics) return null;

    const topics = data.available_topics;

    return (
      <div className="topic-filters">
        <p className="filter-instruction">Click on a topic to see papers for that topic:</p>
        <div className="topic-columns">
          <div className="topic-column">
            {topics.map((topic) => (
              <button
                key={topic}
                className={`topic-btn ${currentTopic === topic ? 'selected' : ''}`}
                onClick={() => handleTopicClick(topic)}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
        {currentTopic && (
          <button className="clear-filter-btn" onClick={() => handleTopicClick(null)}>
            Show all topics
          </button>
        )}
      </div>
    );
  };

  const renderPagination = () => {
    if (!data || data.total_pages <= 1) return null;

    const pages = [];
    const maxVisible = 10;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(data.total_pages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(
        <button
          key={i}
          className={`page-btn ${i === currentPage ? 'active' : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="pagination">
        <span className="page-info">
          Page {currentPage} of {data.total_pages} ({data.total_count} papers)
        </span>
        <div className="page-controls">
          {currentPage > 1 && (
            <button className="page-btn" onClick={() => handlePageChange(currentPage - 1)}>
              Prev
            </button>
          )}
          {pages}
          {currentPage < data.total_pages && (
            <button className="page-btn" onClick={() => handlePageChange(currentPage + 1)}>
              Next
            </button>
          )}
        </div>
      </div>
    );
  };

  const formatSpecies = (species) => {
    if (!species || species.length === 0) return '-';
    return species.map((s) => {
      const match = s.match(/^(\w)\w*\s+(.+)$/);
      if (match) return `${match[1]}. ${match[2]}`;
      return s;
    }).join(', ');
  };

  if (loading) {
    return (
      <div className="genome-wide-papers-page">
        <div className="loading">Loading disease-related papers...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="genome-wide-papers-page">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="genome-wide-papers-page">
      <header className="page-header">
        <h1>Disease-Related Papers</h1>
        <div className="header-links">
          <Link to="/help">Help</Link>
        </div>
      </header>

      {renderTopicFilters()}

      {renderPagination()}

      {data?.references?.length > 0 ? (
        <div className="papers-table-wrapper">
          <table className="papers-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Literature Topic</th>
                <th>Species</th>
                <th>Genes Addressed</th>
              </tr>
            </thead>
            <tbody>
              {data.references.map((paper) => (
                <tr key={paper.reference_no}>
                  <td className="reference-cell">
                    {renderCitationItem(paper, { itemClassName: '' })}
                  </td>
                  <td className="topics-cell">{paper.topics?.join(', ') || '-'}</td>
                  <td className="species-cell">{formatSpecies(paper.species)}</td>
                  <td className="genes-cell">
                    {paper.genes?.length > 0
                      ? paper.genes.map((g, idx) => (
                          <span key={idx}>
                            {idx > 0 && ' '}
                            <Link to={`/locus/${g.feature_name}`}>
                              {g.gene_name || g.feature_name}
                            </Link>
                          </span>
                        ))
                      : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="no-papers">
          <p>No disease-related papers found.</p>
        </div>
      )}

      {renderPagination()}

      <div className="back-link">
        <Link to="/">Back to Home</Link>
      </div>
    </div>
  );
}

export default DiseaseRelatedPapersPage;
