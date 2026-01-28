import React, { useState, useEffect } from 'react';
import OrganismSelector, { getDefaultOrganism } from './OrganismSelector';
import './LocusComponents.css';

function PhenotypeDetails({ data, loading, error, selectedOrganism, onOrganismChange }) {
  const [collapsedSections, setCollapsedSections] = useState({});

  // Get available organisms from the data
  const organisms = data?.results ? Object.keys(data.results) : [];

  // Set default organism if not already set and data is available
  useEffect(() => {
    if (organisms.length > 0 && !selectedOrganism) {
      const defaultOrg = getDefaultOrganism(organisms);
      if (defaultOrg && onOrganismChange) {
        onOrganismChange(defaultOrg);
      }
    }
  }, [organisms, selectedOrganism, onOrganismChange]);

  if (loading) return <div className="loading">Loading phenotype data...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!data || !data.results) return <div className="no-data">No phenotype data available</div>;

  if (organisms.length === 0) {
    return <div className="no-data">No phenotype annotations found</div>;
  }

  // Get data for the selected organism
  const orgData = selectedOrganism ? data.results[selectedOrganism] : null;

  // Map experiment types to root categories (like Perl does)
  const getExperimentCategory = (experimentType) => {
    if (!experimentType) return 'Other';
    const type = experimentType.toLowerCase();
    if (type.includes('large-scale') || type.includes('large scale') || type.includes('survey')) {
      return 'Large-Scale Survey';
    }
    return 'Classical Genetics';
  };

  // Group annotations by experiment category, then by experiment type
  const groupAnnotations = (annotations) => {
    const groups = {};

    annotations.forEach(ann => {
      const category = getExperimentCategory(ann.experiment);
      const expType = ann.experiment || 'Unspecified';

      if (!groups[category]) {
        groups[category] = {};
      }
      if (!groups[category][expType]) {
        groups[category][expType] = [];
      }
      groups[category][expType].push(ann);
    });

    return groups;
  };

  const toggleSection = (key) => {
    setCollapsedSections(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Category colors matching Perl style
  const categoryColors = {
    'Classical Genetics': '#1976d2',
    'Large-Scale Survey': '#7b1fa2',
    'Other': '#616161'
  };

  // Group annotations for the selected organism
  const grouped = orgData ? groupAnnotations(orgData.annotations || []) : null;

  return (
    <div className="phenotype-details">
      {/* Organism Selector */}
      <OrganismSelector
        organisms={organisms}
        selectedOrganism={selectedOrganism}
        onOrganismChange={onOrganismChange}
        dataType="phenotype"
      />

      {/* Display data for selected organism */}
      {selectedOrganism && orgData ? (
        <div className="organism-section">
          <h3 className="organism-name">{selectedOrganism}</h3>
          <p className="locus-display">Locus: {orgData.locus_display_name}</p>

          {grouped && Object.keys(grouped).length > 0 ? (
            <div className="phenotype-groups">
              {Object.entries(grouped).map(([category, expTypes]) => (
                <div key={category} className="phenotype-category">
                  <h4
                    className="category-header"
                    style={{ borderLeftColor: categoryColors[category] || '#616161' }}
                  >
                    {category}
                    <span className="annotation-count">
                      ({Object.values(expTypes).flat().length} annotations)
                    </span>
                  </h4>

                  {Object.entries(expTypes).map(([expType, annotations]) => {
                    const sectionKey = `${selectedOrganism}-${category}-${expType}`;
                    const isCollapsed = collapsedSections[sectionKey];

                    return (
                      <div key={expType} className="experiment-type-section">
                        <div
                          className="experiment-type-header"
                          onClick={() => toggleSection(sectionKey)}
                        >
                          <span className="collapse-icon">{isCollapsed ? '▶' : '▼'}</span>
                          <span className="experiment-type-name">{expType}</span>
                          <span className="annotation-count">({annotations.length})</span>
                        </div>

                        {!isCollapsed && (
                          <table className="data-table phenotype-table">
                            <thead>
                              <tr>
                                <th>Phenotype</th>
                                <th>Qualifier</th>
                                <th>Strain</th>
                              </tr>
                            </thead>
                            <tbody>
                              {annotations.map((ann, idx) => (
                                <tr key={idx}>
                                  <td>
                                    {ann.phenotype?.link ? (
                                      <a href={ann.phenotype.link}>
                                        {ann.phenotype?.display_name}
                                      </a>
                                    ) : (
                                      ann.phenotype?.display_name
                                    )}
                                  </td>
                                  <td>{ann.qualifier || '-'}</td>
                                  <td>{ann.strain || '-'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No phenotype annotations for this organism</p>
          )}
        </div>
      ) : (
        <p className="no-data">Select an organism to view phenotype annotations</p>
      )}
    </div>
  );
}

export default PhenotypeDetails;
