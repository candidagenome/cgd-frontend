import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import OrganismSelector, { getDefaultOrganism } from './OrganismSelector';
import { formatCitationString, CitationLinks } from '../../utils/formatCitation.jsx';
import './LocusComponents.css';

// Annotation type labels (matching Perl format)
const ANNOTATION_TYPE_LABELS = {
  'manually curated': 'Manually Curated',
  'high-throughput': 'High-Throughput Experiments',
  'computational': 'Computational',
};

// Aspect labels
const ASPECT_LABELS = {
  'F': 'Molecular Function',
  'P': 'Biological Process',
  'C': 'Cellular Component',
};

// Evidence code descriptions
const EVIDENCE_DESCRIPTIONS = {
  'EXP': 'Inferred from Experiment',
  'IDA': 'Inferred from Direct Assay',
  'IPI': 'Inferred from Physical Interaction',
  'IMP': 'Inferred from Mutant Phenotype',
  'IGI': 'Inferred from Genetic Interaction',
  'IEP': 'Inferred from Expression Pattern',
  'HTP': 'High Throughput Experiment',
  'HDA': 'High Throughput Direct Assay',
  'HMP': 'High Throughput Mutant Phenotype',
  'HGI': 'High Throughput Genetic Interaction',
  'HEP': 'High Throughput Expression Pattern',
  'IBA': 'Inferred from Biological Aspect of Ancestor',
  'IBD': 'Inferred from Biological Aspect of Descendant',
  'IKR': 'Inferred from Key Residues',
  'IRD': 'Inferred from Rapid Divergence',
  'ISS': 'Inferred from Sequence or Structural Similarity',
  'ISO': 'Inferred from Sequence Orthology',
  'ISA': 'Inferred from Sequence Alignment',
  'ISM': 'Inferred from Sequence Model',
  'IGC': 'Inferred from Genomic Context',
  'RCA': 'Reviewed Computational Analysis',
  'TAS': 'Traceable Author Statement',
  'NAS': 'Non-traceable Author Statement',
  'IC': 'Inferred by Curator',
  'ND': 'No Biological Data Available',
  'IEA': 'Inferred from Electronic Annotation',
};

function GoDetails({ data, loading, error, selectedOrganism, onOrganismChange }) {
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

  if (loading) return <div className="loading">Loading GO annotations...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!data || !data.results) return <div className="no-data">No GO annotation data available</div>;

  if (organisms.length === 0) {
    return <div className="no-data">No GO annotations found</div>;
  }

  // Get data for the selected organism
  const orgData = selectedOrganism ? data.results[selectedOrganism] : null;

  // Group annotations by annotation_type, then by aspect
  const groupAnnotations = (annotations) => {
    const groups = {};

    // Initialize groups for each annotation type
    Object.keys(ANNOTATION_TYPE_LABELS).forEach(type => {
      groups[type] = {
        'F': [],  // Molecular Function
        'P': [],  // Biological Process
        'C': [],  // Cellular Component
      };
    });

    annotations.forEach(ann => {
      const type = ann.annotation_type?.toLowerCase() || 'manually curated';
      const aspect = ann.term?.aspect?.toUpperCase() || 'P';

      if (groups[type] && groups[type][aspect]) {
        groups[type][aspect].push(ann);
      }
    });

    return groups;
  };

  const toggleSection = (key) => {
    setCollapsedSections(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Group annotations for the selected organism
  const grouped = orgData ? groupAnnotations(orgData.annotations || []) : null;

  // Count total annotations per type
  const countAnnotationsForType = (typeData) => {
    return Object.values(typeData).reduce((sum, arr) => sum + arr.length, 0);
  };

  // Render a single GO annotation table for an aspect
  const renderAspectTable = (annotations, aspectKey, typeKey) => {
    if (!annotations || annotations.length === 0) return null;

    const sectionKey = `${selectedOrganism}-${typeKey}-${aspectKey}`;
    const isCollapsed = collapsedSections[sectionKey];

    return (
      <div key={aspectKey} className="go-aspect-section">
        <h5
          className="aspect-subheader"
          onClick={() => toggleSection(sectionKey)}
        >
          <span className="collapse-icon">{isCollapsed ? '>' : 'v'}</span>
          {ASPECT_LABELS[aspectKey]}
          <span className="count-badge">{annotations.length}</span>
        </h5>

        {!isCollapsed && (
          <table className="data-table go-table">
            <thead>
              <tr>
                <th>Annotation</th>
                <th>Reference</th>
                <th>Evidence</th>
                <th>Assigned By</th>
              </tr>
            </thead>
            <tbody>
              {annotations.map((ann, idx) => (
                <tr key={idx}>
                  <td>
                    {ann.qualifier && (
                      <span className={`go-qualifier ${ann.qualifier.toLowerCase() === 'not' ? 'qualifier-not' : ''}`}>
                        {ann.qualifier}
                      </span>
                    )}
                    {' '}
                    <a
                      href={`https://amigo.geneontology.org/amigo/term/${ann.term?.goid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {ann.term?.display_name}
                    </a>
                  </td>
                  <td>
                    {ann.references?.map((ref, refIdx) => {
                      // Handle both string refs and object refs with citation data
                      const isObject = typeof ref === 'object' && ref !== null;
                      const refId = isObject ? (ref.dbxref_id || ref.reference_id || (ref.pubmed ? `PMID:${ref.pubmed}` : null)) : ref;
                      const citation = isObject ? ref.citation : null;
                      const journal = isObject ? (ref.journal_name || ref.journal) : null;
                      const links = isObject ? ref.links : null;

                      return (
                        <div key={refIdx} className="go-reference-item">
                          {citation ? (
                            // Display full formatted citation when available
                            <>
                              {formatCitationString(citation, journal)}
                              {links && links.length > 0 ? (
                                <CitationLinks links={links} />
                              ) : refId && (
                                <span className="citation-links">
                                  {' ['}
                                  <Link to={`/reference/${refId}`}>CGD Paper</Link>
                                  {isObject && ref.pubmed && (
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
                          ) : (
                            // Fallback to showing reference ID as link
                            <>
                              {(typeof refId === 'string' && refId.startsWith('PMID:')) ? (
                                <a
                                  href={`https://pubmed.ncbi.nlm.nih.gov/${refId.replace('PMID:', '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {refId}
                                </a>
                              ) : (typeof refId === 'string' && (refId.startsWith('CGD_REF:') || refId.startsWith('CA'))) ? (
                                <Link to={`/reference/${refId}`}>{refId}</Link>
                              ) : (
                                refId
                              )}
                            </>
                          )}
                        </div>
                      );
                    })}
                  </td>
                  <td>
                    <span title={EVIDENCE_DESCRIPTIONS[ann.evidence?.code] || ann.evidence?.code}>
                      {ann.evidence?.code}
                    </span>
                    {EVIDENCE_DESCRIPTIONS[ann.evidence?.code] && (
                      <span className="evidence-description">
                        {' : '}{EVIDENCE_DESCRIPTIONS[ann.evidence?.code]}
                      </span>
                    )}
                    {ann.evidence?.with_from && (
                      <div className="evidence-with">with {ann.evidence.with_from}</div>
                    )}
                    {ann.date_created && (
                      <div className="assigned-date">Assigned on {ann.date_created}</div>
                    )}
                  </td>
                  <td>{ann.source || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  };

  return (
    <div className="go-details">
      {/* Organism Selector */}
      <OrganismSelector
        organisms={organisms}
        selectedOrganism={selectedOrganism}
        onOrganismChange={onOrganismChange}
        dataType="go"
      />

      {/* Display data for selected organism */}
      {selectedOrganism && orgData ? (
        <div className="organism-section">
          <h3 className="organism-name">{selectedOrganism}</h3>
          <p className="locus-display">Locus: {orgData.locus_display_name}</p>

          {orgData.annotations && orgData.annotations.length > 0 ? (
            <div className="go-annotation-types">
              {/* Iterate through annotation types in order */}
              {Object.entries(ANNOTATION_TYPE_LABELS).map(([typeKey, typeLabel]) => {
                const typeData = grouped[typeKey];
                const totalCount = countAnnotationsForType(typeData);

                if (totalCount === 0) {
                  return (
                    <div key={typeKey} className="annotation-type-section">
                      <h4 className="annotation-type-header">{typeLabel} GO Annotations</h4>
                      <p className="no-data">No {typeLabel} GO Annotations for {orgData.locus_display_name}.</p>
                    </div>
                  );
                }

                return (
                  <div key={typeKey} className="annotation-type-section">
                    <h4 className="annotation-type-header">
                      {typeLabel} GO Annotations
                      <span className="count-badge">{totalCount}</span>
                    </h4>

                    {/* Render each aspect (F, P, C) */}
                    {['F', 'P', 'C'].map(aspectKey =>
                      renderAspectTable(typeData[aspectKey], aspectKey, typeKey)
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="no-data">No GO annotations for this organism</p>
          )}
        </div>
      ) : (
        <p className="no-data">Select an organism to view GO annotations</p>
      )}
    </div>
  );
}

export default GoDetails;
