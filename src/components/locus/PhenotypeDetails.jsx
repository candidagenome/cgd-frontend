import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import OrganismSelector, { getDefaultOrganism } from './OrganismSelector';
import { formatCitationString, CitationLinksBelow, buildCitationLinks } from '../../utils/formatCitation.jsx';
import './LocusComponents.css';

function PhenotypeDetails({ data, loading, error, selectedOrganism, onOrganismChange }) {
  const [collapsedSections, setCollapsedSections] = useState({});

  // Get available organisms from the data - memoize to prevent new array reference each render
  const organisms = useMemo(() => {
    return data?.results ? Object.keys(data.results) : [];
  }, [data?.results]);

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
  // IMPORTANT: Do NOT produce an "Other" category (it hid the whole table for records lacking experiment type).
  const getExperimentCategory = (experimentType) => {
    // Default missing/unknown experiment types into "Classical Genetics"
    // so we avoid displaying an "Other" section header while still showing data.
    if (!experimentType) return 'Classical Genetics';

    const type = experimentType.toLowerCase();
    if (type.includes('large-scale') || type.includes('large scale') || type.includes('survey')) {
      return 'Large-Scale Survey';
    }
    return 'Classical Genetics';
  };

  // Group annotations by experiment category, then by experiment type
  const groupAnnotations = (annotations) => {
    const groups = {};

    (annotations || []).forEach((ann) => {
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
    setCollapsedSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Category colors matching Perl style
  const categoryColors = {
    'Classical Genetics': '#1976d2',
    'Large-Scale Survey': '#7b1fa2',
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

                    const showHeader = expType !== 'Unspecified';

                    return (
                      <div key={expType} className="experiment-type-section">
                        {showHeader && (
                          <div
                            className="experiment-type-header"
                            onClick={() => toggleSection(sectionKey)}
                            role="button"
                            tabIndex={0}
                          >
                            <span className="collapse-icon">{isCollapsed ? '▶' : '▼'}</span>
                            <span className="experiment-type-name">{expType}</span>
                            <span className="annotation-count">({annotations.length})</span>
                          </div>
                        )}

                        {!isCollapsed && (
                          <table className="data-table phenotype-table">
                            <thead>
                              <tr>
                                <th>Experiment Type</th>
                                <th>Mutant Information</th>
                                <th>Strain Background</th>
                                <th>Phenotype</th>
                                <th>Chemical</th>
                                <th>Details</th>
                                <th>References</th>
                              </tr>
                            </thead>
                            <tbody>
                              {annotations.map((ann, idx) => {
                                const refs = ann.references || (ann.reference ? [ann.reference] : []);

                                return (
                                  <tr key={idx}>
                                    {/* Experiment Type */}
                                    <td>
                                      {ann.experiment_type || ann.experiment || '-'}
                                      {ann.experiment_comment && (
                                        <div className="experiment-comment">({ann.experiment_comment})</div>
                                      )}
                                    </td>

                                    {/* Mutant Information */}
                                    <td>
                                      {ann.mutant_type ? (
                                        <>
                                          <span>Description: {ann.mutant_type}</span>
                                          {ann.alleles && ann.alleles.length > 0 &&
                                            ann.alleles.map((allele, aIdx) => (
                                              <div key={aIdx}>
                                                Allele: {allele.property_value}
                                                {allele.property_description && (
                                                  <span> ({allele.property_description})</span>
                                                )}
                                              </div>
                                            ))}
                                        </>
                                      ) : (
                                        '-'
                                      )}
                                    </td>

                                    {/* Strain Background */}
                                    <td>{ann.strain || '-'}</td>

                                    {/* Phenotype */}
                                    <td>
                                      {ann.phenotype?.link ? (
                                        <a href={ann.phenotype.link}>{ann.phenotype?.display_name}</a>
                                      ) : (
                                        ann.phenotype?.display_name || '-'
                                      )}
                                      {ann.qualifier && `: ${ann.qualifier}`}
                                    </td>

                                    {/* Chemical */}
                                    <td>
                                      {ann.chemicals && ann.chemicals.length > 0 ? (
                                        ann.chemicals.map((chem, cIdx) => (
                                          <div key={cIdx}>
                                            {chem.property_value}
                                            {chem.property_description && <div>({chem.property_description})</div>}
                                          </div>
                                        ))
                                      ) : (
                                        '-'
                                      )}
                                    </td>

                                    {/* Details */}
                                    <td>
                                      {ann.details && ann.details.length > 0 ? (
                                        ann.details.map((detail, dIdx) => (
                                          <div key={dIdx}>
                                            {detail.property_type}: {detail.property_value}
                                            {detail.property_description && <div>({detail.property_description})</div>}
                                          </div>
                                        ))
                                      ) : (
                                        '-'
                                      )}
                                    </td>

                                    {/* References */}
                                    <td>
                                      {refs.length > 0 ? (
                                        refs.map((ref, refIdx) => {
                                          const isRefObject = typeof ref === 'object' && ref !== null;
                                          const citation = isRefObject ? ref.citation : null;
                                          const journal = isRefObject ? (ref.journal_name || ref.journal) : null;
                                          const links = isRefObject ? ref.links : null;

                                          const refId = isRefObject
                                            ? (ref.dbxref_id || ref.reference_id || (ref.pubmed ? `PMID:${ref.pubmed}` : null))
                                            : ref;

                                          return (
                                            <div key={refIdx} className="go-reference-item">
                                              {citation ? (
                                                <>
                                                  {formatCitationString(citation, journal)}
                                                  {links && links.length > 0 ? (
                                                    <CitationLinksBelow links={ref.links && ref.links.length ? ref.links : buildCitationLinks(ref)} />
                                                  ) : refId && (
                                                    <span className="citation-links">
                                                      {' ['}
                                                      <Link to={`/reference/${refId}`}>CGD Paper</Link>
                                                      {isRefObject && ref.pubmed && (
                                                        <>
                                                          {' | '}
                                                          <a
                                                            href={`https://pubmed.ncbi.nlm.nih.gov/${ref.pubmed}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                          >
                                                            PubMed
                                                          </a>
                                                        </>
                                                      )}
                                                      {']'}
                                                    </span>
                                                  )}
                                                </>
                                              ) : refId ? (
                                                (typeof refId === 'string' &&
                                                  (refId.startsWith('CGD_REF:') || refId.startsWith('CA') || refId.startsWith('PMID:'))) ? (
                                                  refId.startsWith('PMID:') ? (
                                                    <a
                                                      href={`https://pubmed.ncbi.nlm.nih.gov/${refId.replace('PMID:', '')}`}
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                    >
                                                      {refId}
                                                    </a>
                                                  ) : (
                                                    <Link to={`/reference/${refId}`}>{refId}</Link>
                                                  )
                                                ) : (
                                                  refId
                                                )
                                              ) : null}
                                            </div>
                                          );
                                        })
                                      ) : (
                                        '-'
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
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
