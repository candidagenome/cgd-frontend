import React from 'react';
import { Link } from 'react-router-dom';
import './LocusComponents.css';

function InteractionDetails({ data, loading, error }) {
  if (loading) return <div className="loading">Loading interaction data...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!data || !data.results) return <div className="no-data">No interaction data available</div>;

  const organisms = Object.entries(data.results);

  if (organisms.length === 0) {
    return <div className="no-data">No interactions found</div>;
  }

  return (
    <div className="interaction-details">
      {organisms.map(([orgName, orgData]) => (
        <div key={orgName} className="organism-section">
          <h3 className="organism-name">{orgName}</h3>
          <p className="locus-display">Locus: {orgData.locus_display_name}</p>

          {orgData.interactions && orgData.interactions.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Interactor(s)</th>
                  <th>Experiment Type</th>
                  <th>Description</th>
                  <th>Source</th>
                  <th>References</th>
                </tr>
              </thead>
              <tbody>
                {orgData.interactions.map((interaction, idx) => (
                  <tr key={idx}>
                    <td>
                      {interaction.interactors?.map((interactor, iIdx) => (
                        <span key={iIdx}>
                          <Link to={`/locus/${interactor.feature_name}`}>
                            {interactor.gene_name || interactor.feature_name}
                          </Link>
                          {interactor.action && ` (${interactor.action})`}
                          {iIdx < interaction.interactors.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </td>
                    <td>{interaction.experiment_type || '-'}</td>
                    <td>{interaction.description || '-'}</td>
                    <td>{interaction.source || '-'}</td>
                    <td>
                      {interaction.references?.map((ref, refIdx) => (
                        <span key={refIdx}>
                          {ref.startsWith('PMID:') ? (
                            <a
                              href={`https://pubmed.ncbi.nlm.nih.gov/${ref.replace('PMID:', '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {ref}
                            </a>
                          ) : (
                            ref
                          )}
                          {refIdx < interaction.references.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-data">No interactions for this organism</p>
          )}
        </div>
      ))}
    </div>
  );
}

export default InteractionDetails;
