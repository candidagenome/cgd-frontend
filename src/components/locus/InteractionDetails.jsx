import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import OrganismSelector, { getDefaultOrganism } from './OrganismSelector';
import './LocusComponents.css';

function InteractionDetails({ data, loading, error, selectedOrganism, onOrganismChange, orthologOrganisms = [] }) {
  const [collapsedSections, setCollapsedSections] = useState({});

  // Get available organisms from the data
  const organisms = useMemo(() => {
    return data?.results ? Object.keys(data.results) : [];
  }, [data?.results]);

  if (loading) return <div className="loading">Loading interaction data...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!data || !data.results) return <div className="no-data">No interaction data available</div>;

  // Get the current organism's data
  const currentOrganism = selectedOrganism || getDefaultOrganism(organisms);
  const orgData = data.results[currentOrganism];

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
    'Co-crystal Structure': '#c2185b',
    'Co-localization': '#00838f',
    'FRET': '#6a1b9a',
    'PCA': '#4527a0',
    'Far Western': '#283593',
    'Biochemical Activity': '#558b2f',
    'Protein-peptide': '#ef6c00',
    'Other': '#616161'
  };

  const getExpTypeColor = (expType) => {
    return expTypeColors[expType] || expTypeColors['Other'];
  };

  if (!orgData) {
    return (
      <div className="interaction-details">
        <OrganismSelector
          organisms={organisms}
          selectedOrganism={currentOrganism}
          onOrganismChange={onOrganismChange}
          orthologOrganisms={orthologOrganisms}
        />
        <div className="no-data">No interaction data available for {currentOrganism}.</div>
      </div>
    );
  }

  const grouped = groupByExperimentType(orgData.interactions || []);
  const totalInteractions = orgData.interactions?.length || 0;

  return (
    <div className="interaction-details">
      <OrganismSelector
        organisms={organisms}
        selectedOrganism={currentOrganism}
        onOrganismChange={onOrganismChange}
        orthologOrganisms={orthologOrganisms}
      />

      <div className="section-header">
        <h2>Physical Interactions for {orgData.locus_display_name}</h2>
        {totalInteractions > 0 && (
          <p className="section-description">
            {totalInteractions} physical interaction{totalInteractions !== 1 ? 's' : ''} from BioGRID and other sources.
            {' '}
            <a
              href="https://thebiogrid.org/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn more about BioGRID
            </a>
          </p>
        )}
      </div>

      {Object.keys(grouped).length > 0 ? (
        <div className="interaction-groups">
          {Object.entries(grouped).map(([expType, interactions]) => {
            const sectionKey = `${currentOrganism}-${expType}`;
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
                            {(!interaction.interactors || interaction.interactors.length === 0) && (
                              <span className="self-interaction">(self-interaction)</span>
                            )}
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
        <p className="no-data">No physical interactions found for this gene.</p>
      )}
    </div>
  );
}

export default InteractionDetails;
