import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './LocusComponents.css';

function InteractionDetails({ data, loading, error }) {
  const [collapsedSections, setCollapsedSections] = useState({});

  if (loading) return <div className="loading">Loading interaction data...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!data || !data.results) return <div className="no-data">No interaction data available</div>;

  const organisms = Object.entries(data.results);

  if (organisms.length === 0) {
    return <div className="no-data">No interactions found</div>;
  }

  // Group interactions by experiment type
  const groupByExperimentType = (interactions) => {
    const groups = {};
    interactions.forEach(interaction => {
      const expType = interaction.experiment_type || 'Other';
      if (!groups[expType]) {
        groups[expType] = [];
      }
      groups[expType].push(interaction);
    });
    return groups;
  };

  const toggleSection = (key) => {
    setCollapsedSections(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Experiment type colors
  const expTypeColors = {
    'Affinity Capture-MS': '#1976d2',
    'Affinity Capture-Western': '#1565c0',
    'Two-hybrid': '#7b1fa2',
    'Co-purification': '#388e3c',
    'Reconstituted Complex': '#f57c00',
    'Other': '#616161'
  };

  const getExpTypeColor = (expType) => {
    return expTypeColors[expType] || expTypeColors['Other'];
  };

  return (
    <div className="interaction-details">
      {organisms.map(([orgName, orgData]) => {
        const grouped = groupByExperimentType(orgData.interactions || []);
        const totalInteractions = orgData.interactions?.length || 0;

        return (
          <div key={orgName} className="organism-section">
            <h3 className="organism-name">{orgName}</h3>
            <p className="locus-display">
              Locus: {orgData.locus_display_name}
              {totalInteractions > 0 && (
                <span className="total-count"> ({totalInteractions} physical interactions)</span>
              )}
            </p>

            {Object.keys(grouped).length > 0 ? (
              <div className="interaction-groups">
                {Object.entries(grouped).map(([expType, interactions]) => {
                  const sectionKey = `${orgName}-${expType}`;
                  const isCollapsed = collapsedSections[sectionKey];

                  return (
                    <div key={expType} className="interaction-type-section">
                      <div
                        className="interaction-type-header"
                        onClick={() => toggleSection(sectionKey)}
                        style={{ borderLeftColor: getExpTypeColor(expType) }}
                      >
                        <span className="collapse-icon">{isCollapsed ? '▶' : '▼'}</span>
                        <span className="interaction-type-name">{expType}</span>
                        <span className="count-badge">{interactions.length}</span>
                      </div>

                      {!isCollapsed && (
                        <div className="interaction-cards">
                          {interactions.map((interaction, idx) => (
                            <div key={idx} className="interaction-card">
                              <div className="interaction-interactors">
                                <span className="interactor-label">Interacts with:</span>
                                <div className="interactor-list">
                                  {interaction.interactors?.map((interactor, iIdx) => (
                                    <span key={iIdx} className="interactor-item">
                                      <Link
                                        to={`/locus/${interactor.feature_name}`}
                                        className="interactor-link"
                                      >
                                        {interactor.gene_name || interactor.feature_name}
                                      </Link>
                                      {interactor.action && (
                                        <span className="interactor-action">({interactor.action})</span>
                                      )}
                                      {iIdx < interaction.interactors.length - 1 ? ', ' : ''}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              {interaction.description && (
                                <div className="interaction-description">
                                  {interaction.description}
                                </div>
                              )}

                              <div className="interaction-meta">
                                {interaction.source && (
                                  <span className="interaction-source">
                                    Source: {interaction.source}
                                  </span>
                                )}
                                {interaction.references && interaction.references.length > 0 && (
                                  <span className="interaction-refs">
                                    {interaction.references.map((ref, refIdx) => (
                                      <span key={refIdx}>
                                        {ref.startsWith('PMID:') ? (
                                          <a
                                            href={`https://pubmed.ncbi.nlm.nih.gov/${ref.replace('PMID:', '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="pmid-link"
                                          >
                                            {ref}
                                          </a>
                                        ) : (
                                          ref
                                        )}
                                        {refIdx < interaction.references.length - 1 ? ', ' : ''}
                                      </span>
                                    ))}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="no-data">No interactions for this organism</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default InteractionDetails;
