import React, { useState, useEffect } from 'react';
import OrganismSelector, { getDefaultOrganism } from './OrganismSelector';
import './LocusComponents.css';

function GoDetails({ data, loading, error, selectedOrganism, onOrganismChange }) {
  const [collapsedAspects, setCollapsedAspects] = useState({});

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

  if (loading) return <div className="loading">Loading GO annotations...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!data || !data.results) return <div className="no-data">No GO annotation data available</div>;

  if (organisms.length === 0) {
    return <div className="no-data">No GO annotations found</div>;
  }

  // Get data for the selected organism
  const orgData = selectedOrganism ? data.results[selectedOrganism] : null;

  // Map single-letter aspect codes to full names
  const aspectCodeMap = {
    'f': 'molecular_function',
    'p': 'biological_process',
    'c': 'cellular_component',
  };

  // Evidence code descriptions (from GO Consortium)
  const evidenceDescriptions = {
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

  // Categorize evidence codes
  const getEvidenceCategory = (code) => {
    const experimentalCodes = ['EXP', 'IDA', 'IPI', 'IMP', 'IGI', 'IEP', 'HTP', 'HDA', 'HMP', 'HGI', 'HEP'];
    const computationalCodes = ['IBA', 'IBD', 'IKR', 'IRD', 'ISS', 'ISO', 'ISA', 'ISM', 'IGC', 'RCA', 'IEA'];

    if (experimentalCodes.includes(code)) return 'Experimental';
    if (computationalCodes.includes(code)) return 'Computational';
    return 'Other';
  };

  // Group annotations by aspect, then optionally by evidence category
  const groupByAspect = (annotations) => {
    const groups = {
      'molecular_function': { annotations: [], byEvidence: {} },
      'biological_process': { annotations: [], byEvidence: {} },
      'cellular_component': { annotations: [], byEvidence: {} },
    };

    annotations.forEach(ann => {
      const rawAspect = ann.term?.aspect?.toLowerCase().replace(' ', '_') || 'unknown';
      const aspect = aspectCodeMap[rawAspect] || rawAspect;

      if (groups[aspect]) {
        groups[aspect].annotations.push(ann);

        // Also group by evidence category
        const evidenceCategory = getEvidenceCategory(ann.evidence?.code);
        if (!groups[aspect].byEvidence[evidenceCategory]) {
          groups[aspect].byEvidence[evidenceCategory] = [];
        }
        groups[aspect].byEvidence[evidenceCategory].push(ann);
      }
    });

    return groups;
  };

  const aspectLabels = {
    'molecular_function': 'Molecular Function',
    'biological_process': 'Biological Process',
    'cellular_component': 'Cellular Component',
  };

  const aspectIcons = {
    'molecular_function': '⚙️',
    'biological_process': '🔄',
    'cellular_component': '📍',
  };

  const toggleAspect = (key) => {
    setCollapsedAspects(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Group annotations for the selected organism
  const grouped = orgData ? groupByAspect(orgData.annotations || []) : null;

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
            <div className="go-aspects">
              {Object.entries(grouped).map(([aspect, aspectData]) => {
                if (aspectData.annotations.length === 0) return null;

                const sectionKey = `${selectedOrganism}-${aspect}`;
                const isCollapsed = collapsedAspects[sectionKey];

                return (
                  <div key={aspect} className="aspect-section">
                    <h4
                      className="aspect-header"
                      onClick={() => toggleAspect(sectionKey)}
                    >
                      <span className="collapse-icon">{isCollapsed ? '▶' : '▼'}</span>
                      <span className="aspect-icon">{aspectIcons[aspect]}</span>
                      <span>{aspectLabels[aspect] || aspect}</span>
                      <span className="count-badge">{aspectData.annotations.length}</span>
                    </h4>

                    {!isCollapsed && (
                      <div className="aspect-content">
                        {/* Show annotations grouped by evidence category */}
                        {Object.entries(aspectData.byEvidence).map(([category, annotations]) => (
                          <div key={category} className="evidence-category">
                            <div className="evidence-category-header">
                              {category} Evidence
                              <span className="count-badge">{annotations.length}</span>
                            </div>

                            <table className="data-table go-table">
                              <thead>
                                <tr>
                                  <th>GO Term</th>
                                  <th>GO ID</th>
                                  <th>Evidence</th>
                                  <th>References</th>
                                </tr>
                              </thead>
                              <tbody>
                                {annotations.map((ann, idx) => (
                                  <tr key={idx}>
                                    <td>
                                      {ann.qualifier && (
                                        <span
                                          className={`go-qualifier ${ann.qualifier.toLowerCase() === 'not' ? 'qualifier-not' : ''}`}
                                        >
                                          {ann.qualifier}
                                        </span>
                                      )}
                                      {ann.term?.display_name}
                                    </td>
                                    <td>
                                      <a
                                        href={`https://amigo.geneontology.org/amigo/term/${ann.term?.goid}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="go-id-link"
                                      >
                                        {ann.term?.goid}
                                      </a>
                                    </td>
                                    <td>
                                      <span
                                        className="evidence-code"
                                        title={evidenceDescriptions[ann.evidence?.code] || ann.evidence?.code}
                                      >
                                        {ann.evidence?.code}
                                      </span>
                                      {ann.evidence?.with_from && (
                                        <span className="evidence-with"> with {ann.evidence.with_from}</span>
                                      )}
                                    </td>
                                    <td>
                                      {ann.references?.map((ref, refIdx) => (
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
                                          {refIdx < ann.references.length - 1 ? ', ' : ''}
                                        </span>
                                      ))}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ))}
                      </div>
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
