import React from 'react';
import { Link } from 'react-router-dom';
import './LocusComponents.css';

function References({ data, loading, error }) {
  if (loading) return <div className="loading">Loading references...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!data || !data.results) return <div className="no-data">No reference data available</div>;

  const organisms = Object.entries(data.results);

  if (organisms.length === 0) {
    return <div className="no-data">No references found</div>;
  }

  return (
    <div className="references-details">
      {organisms.map(([orgName, orgData]) => (
        <div key={orgName} className="organism-section">
          <h3 className="organism-name">{orgName}</h3>
          <p className="locus-display">Locus: {orgData.locus_display_name}</p>

          {orgData.references && orgData.references.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Year</th>
                  <th>Citation</th>
                  <th>PubMed</th>
                </tr>
              </thead>
              <tbody>
                {orgData.references
                  .sort((a, b) => b.year - a.year)
                  .map((ref, idx) => (
                    <tr key={idx}>
                      <td>{ref.year}</td>
                      <td>
                        <Link to={`/reference/${ref.pubmed || ref.reference_no}`}>
                          {ref.citation}
                        </Link>
                        {ref.title && <div className="ref-title">{ref.title}</div>}
                      </td>
                      <td>
                        {ref.pubmed ? (
                          <a
                            href={`https://pubmed.ncbi.nlm.nih.gov/${ref.pubmed}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {ref.pubmed}
                          </a>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          ) : (
            <p className="no-data">No references for this organism</p>
          )}
        </div>
      ))}
    </div>
  );
}

export default References;
