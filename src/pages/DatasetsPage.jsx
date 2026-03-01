import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import referenceApi from '../api/referenceApi';
import './InfoPages.css';
import './DatasetsPage.css';

const DatasetsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await referenceApi.getReferencesWithDatasets();
        setData(response);
      } catch (err) {
        setError('Failed to load datasets. Please try again later.');
        console.error('Error fetching datasets:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Group references by year
  const groupByYear = (references) => {
    const grouped = {};
    for (const ref of references) {
      if (!grouped[ref.year]) {
        grouped[ref.year] = [];
      }
      grouped[ref.year].push(ref);
    }
    return grouped;
  };

  const renderCitation = (ref) => {
    return (
      <li key={ref.reference_no} className="dataset-item">
        <span dangerouslySetInnerHTML={{ __html: ref.citation }} />
        {' '}
        {ref.links.map((link, idx) => (
          <span key={idx} className="citation-link">
            {link.link_type === 'internal' ? (
              <Link to={link.url}>[{link.name}]</Link>
            ) : (
              <a href={link.url} target="_blank" rel="noopener noreferrer">
                [{link.name}]
              </a>
            )}
            {' '}
          </span>
        ))}
      </li>
    );
  };

  if (loading) {
    return (
      <div className="info-page">
        <div className="info-page-content">
          <h1>Datasets archived at CGD</h1>
          <hr />
          <p>Loading datasets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="info-page">
        <div className="info-page-content">
          <h1>Datasets archived at CGD</h1>
          <hr />
          <p className="error-message">{error}</p>
        </div>
      </div>
    );
  }

  const groupedRefs = data ? groupByYear(data.references) : {};
  const years = data?.years || [];

  return (
    <div className="info-page datasets-page">
      <div className="info-page-content">
        <h1>Datasets archived at CGD</h1>
        <hr />

        <p className="datasets-intro">
          CGD collects only published and freely available datasets.<br />
          Contact CGD Curators if you want to contribute your results.
        </p>

        <p>
          <a
            href="http://www.candidagenome.org/download/systematic_results/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Browse the archive directory here
          </a>
        </p>

        {years.length > 0 && (
          <div className="year-nav">
            {years.map((year, idx) => (
              <span key={year}>
                {idx > 0 && ' | '}
                <a href={`#year-${year}`}>{year}</a>
              </span>
            ))}
          </div>
        )}

        <p className="datasets-note">
          <span className="note-label">Note:</span> the strains used in some of the experiments
          listed below may have chromosomal abnormalities such as aneuploidy, which introduces
          chromosome-specific bias into microarray and other results. For more details, see
          Arbour et al. (2009).
        </p>

        {years.map((year) => (
          <div key={year} className="year-section">
            <h3 id={`year-${year}`}>
              <a name={year}>{year}:</a>
            </h3>
            <ul className="dataset-list">
              {groupedRefs[year]?.map((ref) => renderCitation(ref))}
            </ul>
          </div>
        ))}

        {data && data.total_count === 0 && (
          <p>No datasets found.</p>
        )}
      </div>
    </div>
  );
};

export default DatasetsPage;
