import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import referenceApi from '../api/referenceApi';
import { formatCitationString, CitationLinksBelow } from '../utils/formatCitation';
import './GenomeWideAnalysisPapersPage.css';

function GenomeWideAnalysisPapersPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await referenceApi.getGenomeWideAnalysisPapers();
        setData(result);
      } catch (err) {
        setError(
          err.response?.data?.detail || err.message || 'Failed to load genome-wide analysis papers'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="genome-wide-papers-page">
        <div className="loading">Loading genome-wide analysis papers...</div>
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
        <h1>Genome-wide Analysis Papers</h1>
        <p className="page-description">
          Papers describing large-scale surveys, high-throughput experiments, and systematic studies
          in <em>Candida</em> species.
        </p>
      </header>

      <div className="results-summary">
        <strong>{data?.total_count || 0}</strong> genome-wide analysis paper
        {data?.total_count !== 1 ? 's' : ''} in CGD
      </div>

      {data?.references?.length > 0 ? (
        <div className="papers-list">
          {data.references.map((paper) => (
            <div key={paper.reference_no} className="paper-item">
              <div className="citation-line">
                {paper.citation ? (
                  formatCitationString(paper.citation)
                ) : (
                  <Link to={`/reference/${paper.dbxref_id}`}>
                    {paper.title || paper.dbxref_id}
                  </Link>
                )}
                {paper.pubmed && <span className="citation-pmid"> PMID: {paper.pubmed}</span>}
              </div>
              <CitationLinksBelow links={paper.links} />
            </div>
          ))}
        </div>
      ) : (
        <div className="no-papers">
          <p>No genome-wide analysis papers found.</p>
        </div>
      )}

      <div className="back-link">
        <Link to="/">Back to Home</Link>
      </div>
    </div>
  );
}

export default GenomeWideAnalysisPapersPage;
