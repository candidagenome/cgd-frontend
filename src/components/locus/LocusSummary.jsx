import React from 'react';
import './LocusComponents.css';

function LocusSummary({ data, organismName, goData, goLoading, phenotypeData, phenotypeLoading, sequenceData, sequenceLoading }) {
  if (!data) return null;

  const feature = data;

  // Group GO annotations by aspect, then annotation_type, then by term+qualifier
  const groupGoByAspect = (annotations) => {
    if (!annotations || annotations.length === 0) return {};

    const aspectCodeMap = {
      'f': 'molecular_function',
      'p': 'biological_process',
      'c': 'cellular_component',
    };

    // Structure: { aspect: { annotationType: { termKey: termData } } }
    const groups = {
      'molecular_function': {},
      'biological_process': {},
      'cellular_component': {},
    };

    annotations.forEach(ann => {
      const rawAspect = ann.term?.aspect?.toLowerCase().replace(' ', '_') || 'unknown';
      const aspect = aspectCodeMap[rawAspect] || rawAspect;
      if (!groups[aspect]) return;

      const termName = ann.term?.display_name;
      const qualifier = ann.qualifier || '';
      const evidenceCode = ann.evidence?.code;
      const withFrom = ann.evidence?.with_from;
      const annotationType = ann.annotation_type || 'other';

      if (termName) {
        // Initialize annotation type group if needed
        if (!groups[aspect][annotationType]) {
          groups[aspect][annotationType] = {};
        }

        // Create unique key for term+qualifier combination
        const key = `${termName}|${qualifier}`;

        if (!groups[aspect][annotationType][key]) {
          groups[aspect][annotationType][key] = {
            name: termName,
            goid: ann.term?.goid,
            qualifier: qualifier,
            evidenceEntries: [],  // Array of { code, withFrom }
          };
        }

        // Add evidence entry (code + withFrom) if present
        if (evidenceCode) {
          const existingEntry = groups[aspect][annotationType][key].evidenceEntries.find(
            e => e.code === evidenceCode && e.withFrom === withFrom
          );
          if (!existingEntry) {
            groups[aspect][annotationType][key].evidenceEntries.push({
              code: evidenceCode,
              withFrom: withFrom,
            });
          }
        }
      }
    });

    // Convert to final structure: { aspect: { annotationType: [terms] } }
    const result = {};
    for (const [aspect, typeGroups] of Object.entries(groups)) {
      result[aspect] = {};
      for (const [annType, terms] of Object.entries(typeGroups)) {
        result[aspect][annType] = Object.values(terms);
      }
    }

    return result;
  };

  const goGroups = goData ? groupGoByAspect(goData.annotations) : {};

  // Group phenotype annotations by experiment_type, then mutant_type, then unique observables
  const groupPhenotypesByType = (annotations) => {
    if (!annotations || annotations.length === 0) return {};

    // Structure: { experimentType: { mutantType: Set of unique observables } }
    const groups = {};

    annotations.forEach(ann => {
      const experimentType = ann.experiment_type || 'Classical genetics';
      const mutantType = ann.mutant_type || 'unspecified';
      const observable = ann.phenotype?.display_name;
      const qualifier = ann.qualifier;

      if (!observable) return;

      if (!groups[experimentType]) {
        groups[experimentType] = {};
      }

      if (!groups[experimentType][mutantType]) {
        groups[experimentType][mutantType] = new Set();
      }

      // Combine observable with qualifier if present
      let displayName = observable;
      if (qualifier) {
        displayName = `${observable}: ${qualifier}`;
      }

      groups[experimentType][mutantType].add(displayName);
    });

    // Convert Sets to sorted arrays
    const result = {};
    for (const [expType, mutantTypes] of Object.entries(groups)) {
      result[expType] = {};
      for (const [mutType, observables] of Object.entries(mutantTypes)) {
        result[expType][mutType] = Array.from(observables).sort();
      }
    }

    return result;
  };

  const phenotypeGroups = phenotypeData ? groupPhenotypesByType(phenotypeData.annotations) : {};

  // Experiment type display order
  const experimentTypeOrder = ['Classical genetics', 'Large-scale survey'];

  // Annotation type display order and labels
  const annotationTypeOrder = ['manually curated', 'high-throughput', 'computational'];
  const annotationTypeLabels = {
    'manually curated': 'Manually curated',
    'high-throughput': 'High-throughput',
    'computational': 'Computational',
  };

  const aspectLabels = {
    'molecular_function': 'Molecular Function',
    'biological_process': 'Biological Process',
    'cellular_component': 'Cellular Component',
  };

  // Group aliases by type (like Perl does: Uniform, Non-uniform, Protein name, etc.)
  // Exclude 'Other strain feature name' as it's displayed separately
  const groupAliasesByType = (aliases) => {
    if (!aliases || aliases.length === 0) return {};

    const groups = {};
    aliases.forEach(alias => {
      const type = alias.alias_type || 'Other';
      // Skip 'Other strain feature name' - displayed in separate row
      if (type === 'Other strain feature name') return;
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(alias.alias_name);
    });

    // Sort alias types in a logical order
    const typeOrder = ['Uniform', 'Non-uniform', 'Protein name', 'NCBI protein name', 'Retired name'];
    const sortedGroups = {};

    typeOrder.forEach(type => {
      if (groups[type]) {
        sortedGroups[type] = groups[type];
      }
    });

    // Add any remaining types
    Object.keys(groups).forEach(type => {
      if (!sortedGroups[type]) {
        sortedGroups[type] = groups[type];
      }
    });

    return sortedGroups;
  };

  const aliasGroups = groupAliasesByType(feature.aliases);
  const hasRetiredNames = aliasGroups['Retired name'] && aliasGroups['Retired name'].length > 0;
  const hasNonRetiredAliases = Object.keys(aliasGroups).filter(type => type !== 'Retired name').length > 0;

  // Group external links by source and substitute ORF name in URLs
  const groupLinksBySource = (links, featureName) => {
    if (!links || links.length === 0) return {};

    const groups = {};
    links.forEach(link => {
      const source = link.source || 'Other';
      if (!groups[source]) {
        groups[source] = [];
      }
      // Replace _SUBSTITUTE_THIS_ placeholder with the ORF name (feature_name)
      const processedLink = {
        ...link,
        url: link.url ? link.url.replace(/_SUBSTITUTE_THIS_/g, featureName || '') : link.url
      };
      groups[source].push(processedLink);
    });

    return groups;
  };

  const linkGroups = groupLinksBySource(feature.external_links, feature.feature_name);

  return (
    <div className="locus-summary">
      <table className="info-table">
        <tbody>
          {/* Standard Name */}
          <tr>
            <th>Standard Name</th>
            <td>
              {feature.gene_name ? (
                <span>{feature.gene_name}</span>
              ) : (
                <span className="no-value">-</span>
              )}
            </td>
          </tr>

          {/* Systematic Name */}
          <tr>
            <th>Systematic Name</th>
            <td>{feature.feature_name}</td>
          </tr>

          {/* Assembly 19/21 Identifier - shown if different from Systematic Name */}
          {feature.assembly_21_identifier && (
            <tr>
              <th>Assembly 19/21 Identifier</th>
              <td>{feature.assembly_21_identifier}</td>
            </tr>
          )}

          {/* Aliases - grouped by type (excluding Retired name and Other strain feature name) */}
          {hasNonRetiredAliases && (
            <tr>
              <th>Alias</th>
              <td>
                <div className="alias-groups">
                  {Object.entries(aliasGroups)
                    .filter(([type]) => type !== 'Retired name')
                    .map(([type, names]) => (
                      <div key={type} className="alias-group">
                        <span className="alias-type-label">{type}:</span>
                        <span className="alias-names">{names.join(', ')}</span>
                      </div>
                    ))}
                </div>
              </td>
            </tr>
          )}

          {/* Feature Type with qualifier */}
          <tr>
            <th>Feature Type</th>
            <td>
              <span className="feature-type-badge">{feature.feature_type}</span>
              {feature.feature_qualifier && (
                <span className="feature-qualifier">, {feature.feature_qualifier}</span>
              )}
            </td>
          </tr>

          {/* Allele - shown if alleles exist */}
          {feature.alleles && feature.alleles.length > 0 && (
            <tr>
              <th>Allele</th>
              <td>
                {feature.alleles.map((allele, idx) => (
                  <span key={allele.feature_no}>
                    <a href={`/locus/${allele.feature_name}`}>
                      {allele.gene_name || allele.feature_name}
                    </a>
                    {idx < feature.alleles.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </td>
            </tr>
          )}

          {/* Allelic Variation - shown if data exists */}
          {feature.allelic_variation && (
            <tr>
              <th>Allelic Variation</th>
              <td>{feature.allelic_variation}</td>
            </tr>
          )}

          {/* CUG Codons - shown if data exists */}
          {feature.cug_codons !== null && feature.cug_codons !== undefined && (
            <tr>
              <th>CUG Codons</th>
              <td>{feature.cug_codons}</td>
            </tr>
          )}

          {/* Description/Headline */}
          <tr>
            <th>Description</th>
            <td>{feature.headline || <span className="no-value">No description available</span>}</td>
          </tr>

          {/* Name Description (what the gene name stands for) */}
          {feature.name_description && (
            <tr>
              <th>Name Description</th>
              <td><em>{feature.name_description}</em></td>
            </tr>
          )}

          {/* Systematic Names Used in Other Strains */}
          {feature.other_strain_names && feature.other_strain_names.length > 0 && (
            <tr>
              <th>Systematic Names Used in Other Strains</th>
              <td>
                {feature.other_strain_names.map((item, idx) => (
                  <span key={idx}>
                    {typeof item === 'string' ? (
                      <span>{item}</span>
                    ) : (
                      <>
                        <span>{item.alias_name}</span>
                        {item.strain_name && <span> (<em>{item.strain_name}</em>)</span>}
                      </>
                    )}
                    {idx < feature.other_strain_names.length - 1 ? ' ; ' : ''}
                  </span>
                ))}
              </td>
            </tr>
          )}

          {/* Orthologous genes in Candida species */}
          {feature.candida_orthologs && feature.candida_orthologs.length > 0 && (
            <tr>
              <th>Orthologous genes in Candida species</th>
              <td>
                <div className="ortholog-list">
                  {feature.candida_orthologs.map((orth, idx) => (
                    <div key={idx} className="ortholog-item">
                      <a href={`/locus/${orth.feature_name}`}>
                        {orth.gene_name || orth.feature_name}
                      </a>
                      <span className="organism-name"> (<em>{orth.organism_name}</em>)</span>
                    </div>
                  ))}
                </div>
                {feature.ortholog_cluster_url && (
                  <div style={{marginTop: '8px'}}>
                    <a href={feature.ortholog_cluster_url} target="_blank" rel="noopener noreferrer">
                      View ortholog cluster
                    </a>
                  </div>
                )}
              </td>
            </tr>
          )}

          {/* Ortholog(s) in non-CGD species - inline format with species names */}
          {feature.external_orthologs && feature.external_orthologs.length > 0 && (
            <tr>
              <th>Ortholog(s) in non-CGD species</th>
              <td>
                {feature.external_orthologs.map((orth, idx) => (
                  <span key={idx}>
                    <em>{orth.species_name || orth.source}</em>
                    {' ('}
                    {orth.url ? (
                      <a href={orth.url} target="_blank" rel="noopener noreferrer">
                        {orth.description || orth.dbxref_id}
                      </a>
                    ) : (
                      <span>{orth.description || orth.dbxref_id}</span>
                    )}
                    {')'}
                    {idx < feature.external_orthologs.length - 1 ? ' ; ' : ''}
                  </span>
                ))}
              </td>
            </tr>
          )}

          {/* GO Annotations */}
          {goLoading ? (
            <tr>
              <th>GO Annotations</th>
              <td><em>Loading GO annotations...</em></td>
            </tr>
          ) : (goData && goData.annotations && goData.annotations.length > 0) && (
            <>
              <tr className="go-section-header">
                <th>GO Annotations</th>
                <td>
                  <a href={`?tab=go`}>
                    View all <em>{feature.gene_name || feature.feature_name}</em> GO evidence and references
                  </a>
                </td>
              </tr>
              {Object.entries(goGroups).map(([aspect, typeGroups]) => {
                // Check if this aspect has any terms
                const hasTerms = Object.values(typeGroups).some(terms => terms.length > 0);
                if (!hasTerms) return null;

                return (
                  <React.Fragment key={aspect}>
                    {/* Aspect header row */}
                    <tr className="go-aspect-header-row">
                      <th style={{paddingLeft: '10px'}}>{aspectLabels[aspect]}</th>
                      <td></td>
                    </tr>
                    {/* Annotation type rows */}
                    {annotationTypeOrder.map(annType => {
                      const terms = typeGroups[annType];
                      if (!terms || terms.length === 0) return null;

                      return (
                        <tr key={`${aspect}-${annType}`} className="go-annotation-type-row">
                          <th style={{paddingLeft: '30px', fontWeight: 'normal', fontStyle: 'italic'}}>
                            {annotationTypeLabels[annType] || annType}
                          </th>
                          <td>
                            <div className="go-terms-list">
                              {terms.map((term, idx) => (
                                <div key={idx} className="go-term-item">
                                  <span className="go-bullet">•</span>
                                  {term.qualifier && (
                                    <em className={`go-qualifier ${term.qualifier.toLowerCase() === 'not' ? 'qualifier-not' : ''}`}>
                                      {term.qualifier}
                                    </em>
                                  )}{term.qualifier ? ' ' : ''}
                                  <a
                                    href={`https://amigo.geneontology.org/amigo/term/${term.goid}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    {term.name}
                                  </a>
                                  {term.evidenceEntries && term.evidenceEntries.length > 0 && (
                                    <span className="go-evidence-codes">
                                      {' ('}
                                      {term.evidenceEntries.map((entry, entryIdx) => (
                                        <span key={entryIdx}>
                                          <a
                                            href="http://geneontology.org/docs/guide-go-evidence-codes/"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title={entry.code}
                                          >
                                            {entry.code}
                                          </a>
                                          {entry.withFrom && (
                                            <span className="go-with-from"> with {entry.withFrom}</span>
                                          )}
                                          {entryIdx < term.evidenceEntries.length - 1 ? ', ' : ''}
                                        </span>
                                      ))}
                                      {')'}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </>
          )}

          {/* Mutant Phenotype */}
          {phenotypeLoading ? (
            <tr>
              <th>Mutant Phenotype</th>
              <td><em>Loading phenotype annotations...</em></td>
            </tr>
          ) : (phenotypeData && phenotypeData.annotations && phenotypeData.annotations.length > 0) && (
            <>
              <tr className="phenotype-section-header">
                <th>Mutant Phenotype</th>
                <td>
                  <a href={`?tab=phenotype`}>
                    View all <em>{feature.gene_name || feature.feature_name}</em> Phenotype details and references
                  </a>
                </td>
              </tr>
              {experimentTypeOrder.map(expType => {
                const mutantTypes = phenotypeGroups[expType];
                if (!mutantTypes || Object.keys(mutantTypes).length === 0) return null;

                return (
                  <React.Fragment key={expType}>
                    {/* Experiment type header row */}
                    <tr className="phenotype-experiment-type-row">
                      <th style={{paddingLeft: '10px', fontWeight: 'bold'}}>{expType}</th>
                      <td></td>
                    </tr>
                    {/* Mutant type rows */}
                    {Object.entries(mutantTypes).sort(([a], [b]) => a.localeCompare(b)).map(([mutantType, observables]) => (
                      <tr key={`${expType}-${mutantType}`} className="phenotype-mutant-type-row">
                        <th style={{paddingLeft: '30px', fontWeight: 'normal'}}>
                          {mutantType}
                        </th>
                        <td>
                          <div className="phenotype-observables-list">
                            {observables.map((obs, idx) => (
                              <div key={idx} className="phenotype-observable-item">
                                <span className="phenotype-bullet">•</span>
                                <span>{obs}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })}
            </>
          )}

          {/* Sequence Information */}
          {sequenceLoading ? (
            <tr>
              <th>Sequence Information</th>
              <td><em>Loading sequence information...</em></td>
            </tr>
          ) : (sequenceData && sequenceData.locations && sequenceData.locations.length > 0) && (
            <>
              {/* Sequence Information header with chromosomal coordinates */}
              {sequenceData.locations.filter(loc => loc.is_current).map((location, idx) => (
                <React.Fragment key={idx}>
                  <tr className="sequence-section-header">
                    <th>Sequence Information</th>
                    <td>
                      <span className="sequence-coords-text">
                        {location.chromosome && `${location.chromosome}:`}
                        {location.start_coord.toLocaleString()} to {location.stop_coord.toLocaleString()}
                        {location.strand && `, ${location.strand === 'W' || location.strand === '+' ? 'Watson' : 'Crick'} strand`}
                      </span>
                      <span style={{marginLeft: '15px'}}>
                        <a href={`?tab=sequence`}>
                          View all <em>{feature.gene_name || feature.feature_name}</em> Sequence details
                        </a>
                      </span>
                    </td>
                  </tr>
                  {/* Last Update row */}
                  {(location.coord_version || location.seq_version) && (
                    <tr className="sequence-update-row">
                      <th style={{paddingLeft: '10px', fontWeight: 'normal'}}>
                        Last Update
                      </th>
                      <td>
                        <span className="sequence-update-text">
                          {location.coord_version && `Coordinates: ${new Date(location.coord_version).toISOString().split('T')[0]}`}
                          {location.coord_version && location.seq_version && ' | '}
                          {location.seq_version && `Sequence: ${new Date(location.seq_version).toISOString().split('T')[0]}`}
                        </span>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {/* Subfeature Details */}
              {sequenceData.subfeatures && sequenceData.subfeatures.length > 0 && (
                <tr className="sequence-subfeature-row">
                  <th style={{paddingLeft: '10px', fontWeight: 'normal'}}>
                    Subfeature Details
                  </th>
                  <td>
                    <table className="subfeature-table">
                      <thead>
                        <tr>
                          <th rowSpan="2"></th>
                          <th rowSpan="2"></th>
                          <th colSpan="3" rowSpan="2">Relative<br/>Coordinates</th>
                          <th rowSpan="2"></th>
                          <th colSpan="3" rowSpan="2">Chromosomal<br/>Coordinates</th>
                          <th rowSpan="2"></th>
                          <th colSpan="3">Most Recent Update</th>
                        </tr>
                        <tr>
                          <th>Coordinates</th>
                          <th></th>
                          <th>Sequence</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sequenceData.subfeatures.map((sf, idx) => (
                          <tr key={idx}>
                            <td className="subfeature-type">{sf.feature_type}</td>
                            <td></td>
                            <td className="subfeature-coord">{sf.relative_start}</td>
                            <td className="subfeature-coord-to">to</td>
                            <td className="subfeature-coord">{sf.relative_stop}</td>
                            <td></td>
                            <td className="subfeature-coord">{sf.start_coord?.toLocaleString()}</td>
                            <td className="subfeature-coord-to">to</td>
                            <td className="subfeature-coord">{sf.stop_coord?.toLocaleString()}</td>
                            <td></td>
                            <td className="subfeature-version"><em>{sf.coord_version ? new Date(sf.coord_version).toISOString().split('T')[0] : ''}</em></td>
                            <td></td>
                            <td className="subfeature-version"><em>{sf.seq_version ? new Date(sf.seq_version).toISOString().split('T')[0] : ''}</em></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </td>
                </tr>
              )}
              {/* Sequence Tools Pulldowns */}
              {sequenceData.sequence_resources && (
                <tr className="sequence-tools-row">
                  <th style={{paddingLeft: '10px', fontWeight: 'normal'}}></th>
                  <td>
                    <div className="sequence-tools-container">
                      {sequenceData.sequence_resources.retrieve_sequences && sequenceData.sequence_resources.retrieve_sequences.length > 0 && (
                        <div className="sequence-tool-dropdown">
                          <label><strong>Retrieve Sequences</strong></label>
                          <select
                            onChange={(e) => {
                              if (e.target.value && !e.target.value.startsWith('?query=')) {
                                window.open(e.target.value, '_blank');
                              }
                            }}
                            defaultValue=""
                          >
                            <option value="">Select...</option>
                            {sequenceData.sequence_resources.retrieve_sequences.map((item, idx) => (
                              <option
                                key={idx}
                                value={item.url}
                                disabled={item.url.startsWith('?query=')}
                                style={item.url.startsWith('?query=') ? {fontWeight: 'bold', backgroundColor: '#eee'} : {}}
                              >
                                {item.label}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={(e) => {
                              const select = e.target.previousSibling;
                              if (select.value && !select.value.startsWith('?query=')) {
                                window.open(select.value, '_blank');
                              }
                            }}
                          >
                            View
                          </button>
                        </div>
                      )}
                      {sequenceData.sequence_resources.sequence_analysis_tools && sequenceData.sequence_resources.sequence_analysis_tools.length > 0 && (
                        <div className="sequence-tool-dropdown">
                          <label><strong>Sequence Analysis Tools</strong></label>
                          <select
                            onChange={(e) => {
                              if (e.target.value && !e.target.value.startsWith('?query=')) {
                                window.open(e.target.value, '_blank');
                              }
                            }}
                            defaultValue=""
                          >
                            <option value="">Select...</option>
                            {sequenceData.sequence_resources.sequence_analysis_tools.map((item, idx) => (
                              <option
                                key={idx}
                                value={item.url}
                                disabled={item.url.startsWith('?query=')}
                                style={item.url.startsWith('?query=') ? {fontWeight: 'bold', backgroundColor: '#eee'} : {}}
                              >
                                {item.label}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={(e) => {
                              const select = e.target.previousSibling;
                              if (select.value && !select.value.startsWith('?query=')) {
                                window.open(select.value, '_blank');
                              }
                            }}
                          >
                            View
                          </button>
                        </div>
                      )}
                      {sequenceData.sequence_resources.maps_displays && sequenceData.sequence_resources.maps_displays.length > 0 && (
                        <div className="sequence-tool-dropdown">
                          <label><strong>Maps & Displays</strong></label>
                          <select
                            onChange={(e) => {
                              if (e.target.value && !e.target.value.startsWith('?query=')) {
                                window.open(e.target.value, '_blank');
                              }
                            }}
                            defaultValue=""
                          >
                            <option value="">Select...</option>
                            {sequenceData.sequence_resources.maps_displays.map((item, idx) => (
                              <option
                                key={idx}
                                value={item.url}
                                disabled={item.url.startsWith('?query=')}
                                style={item.url.startsWith('?query=') ? {fontWeight: 'bold', backgroundColor: '#eee'} : {}}
                              >
                                {item.label}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={(e) => {
                              const select = e.target.previousSibling;
                              if (select.value && !select.value.startsWith('?query=')) {
                                window.open(select.value, '_blank');
                              }
                            }}
                          >
                            View
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              )}
              {/* Allele Location - shown for each secondary allele */}
              {sequenceData.allele_locations && sequenceData.allele_locations.length > 0 && (
                sequenceData.allele_locations.map((allele, alleleIdx) => (
                  <React.Fragment key={alleleIdx}>
                    {/* Allele Location header with coordinates */}
                    <tr className="allele-location-header">
                      <th>
                        Allele Location<br/>
                        <span style={{fontWeight: 'normal', paddingLeft: '10px'}}>
                          Allele {allele.feature_name}
                        </span>
                      </th>
                      <td>
                        <span className="sequence-coords-text">
                          {allele.chromosome && `${allele.chromosome}:`}
                          {allele.start_coord?.toLocaleString()} to {allele.stop_coord?.toLocaleString()}
                          {allele.strand && `, ${allele.strand === 'W' || allele.strand === '+' ? 'Watson' : 'Crick'} strand`}
                        </span>
                      </td>
                    </tr>
                    {/* Allele Last Update row */}
                    {(allele.coord_version || allele.seq_version) && (
                      <tr className="sequence-update-row">
                        <th style={{paddingLeft: '10px', fontWeight: 'normal'}}>
                          Last Update
                        </th>
                        <td>
                          <span className="sequence-update-text">
                            {allele.coord_version && `Coordinates: ${new Date(allele.coord_version).toISOString().split('T')[0]}`}
                            {allele.coord_version && allele.seq_version && ' | '}
                            {allele.seq_version && `Sequence: ${new Date(allele.seq_version).toISOString().split('T')[0]}`}
                          </span>
                        </td>
                      </tr>
                    )}
                    {/* Allele Subfeature Details */}
                    {allele.subfeatures && allele.subfeatures.length > 0 && (
                      <tr className="sequence-subfeature-row">
                        <th style={{paddingLeft: '10px', fontWeight: 'normal'}}>
                          Subfeature Details
                        </th>
                        <td>
                          <table className="subfeature-table">
                            <thead>
                              <tr>
                                <th rowSpan="2"></th>
                                <th rowSpan="2"></th>
                                <th colSpan="3" rowSpan="2">Relative<br/>Coordinates</th>
                                <th rowSpan="2"></th>
                                <th colSpan="3" rowSpan="2">Chromosomal<br/>Coordinates</th>
                                <th rowSpan="2"></th>
                                <th colSpan="3">Most Recent Update</th>
                              </tr>
                              <tr>
                                <th>Coordinates</th>
                                <th></th>
                                <th>Sequence</th>
                              </tr>
                            </thead>
                            <tbody>
                              {allele.subfeatures.map((sf, idx) => (
                                <tr key={idx}>
                                  <td className="subfeature-type">{sf.feature_type}</td>
                                  <td></td>
                                  <td className="subfeature-coord">{sf.relative_start}</td>
                                  <td className="subfeature-coord-to">to</td>
                                  <td className="subfeature-coord">{sf.relative_stop}</td>
                                  <td></td>
                                  <td className="subfeature-coord">{sf.start_coord?.toLocaleString()}</td>
                                  <td className="subfeature-coord-to">to</td>
                                  <td className="subfeature-coord">{sf.stop_coord?.toLocaleString()}</td>
                                  <td></td>
                                  <td className="subfeature-version"><em>{sf.coord_version ? new Date(sf.coord_version).toISOString().split('T')[0] : ''}</em></td>
                                  <td></td>
                                  <td className="subfeature-version"><em>{sf.seq_version ? new Date(sf.seq_version).toISOString().split('T')[0] : ''}</em></td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </>
          )}

          {/* Organism */}
          <tr>
            <th>Organism</th>
            <td>
              <em>{organismName}</em>
              {feature.taxon_id && (
                <span className="taxon-id"> (Taxon ID: {feature.taxon_id})</span>
              )}
            </td>
          </tr>

          {/* Primary DBID */}
          <tr>
            <th>Primary CGDID</th>
            <td>{feature.dbxref_id}</td>
          </tr>

          {/* Source */}
          <tr>
            <th>Source</th>
            <td>{feature.source}</td>
          </tr>

          {/* Date Created */}
          {feature.date_created && (
            <tr>
              <th>Date Created</th>
              <td>{new Date(feature.date_created).toLocaleDateString()}</td>
            </tr>
          )}

          {/* Retired Names - shown separately with different styling */}
          {hasRetiredNames && (
            <tr>
              <th>Retired Names</th>
              <td>
                <span className="retired-names">
                  {aliasGroups['Retired name'].map((name, idx) => (
                    <span key={idx} className="retired-name">
                      <em>{name}</em>
                      {idx < aliasGroups['Retired name'].length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </span>
              </td>
            </tr>
          )}

          {/* External Links - grouped by source */}
          {Object.keys(linkGroups).length > 0 && (
            <tr>
              <th>External Links</th>
              <td>
                <div className="external-link-groups">
                  {Object.entries(linkGroups).map(([source, links]) => (
                    <div key={source} className="link-group">
                      <span className="link-source-label">{source}:</span>
                      <span className="link-items">
                        {links.map((link, idx) => (
                          <span key={idx}>
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={link.url_type}
                            >
                              {link.url_type}
                            </a>
                            {idx < links.length - 1 ? ', ' : ''}
                          </span>
                        ))}
                      </span>
                    </div>
                  ))}
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default LocusSummary;
