import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './LocusComponents.css';
import { renderCitationItem } from '../../utils/formatCitation.jsx';

function LocusSummary({
  data,
  organismName,
  goData,
  goLoading,
  phenotypeData,
  phenotypeLoading,
  sequenceData,
  sequenceLoading,
}) {
  const [showJBrowseViewer, setShowJBrowseViewer] = useState(true); // Show JBrowse viewer by default

  if (!data) return null;

  const feature = data;

  // ---------- Formatting helpers ----------
  const fmtInt = (v) => {
    if (v === null || v === undefined || v === '') return '';
    const n = Number(v);
    return Number.isFinite(n) ? n.toLocaleString() : String(v);
  };

  const fmtDate = (v) => {
    if (!v) return '';
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return '';
    return d.toISOString().slice(0, 10);
  };

  const fmtStrand = (strand) => {
    if (!strand) return '';
    return strand === 'W' || strand === '+' ? 'Watson' : 'Crick';
  };

  // Convert <feature:ID>NAME</feature> tags to hyperlinks
  const parseFeatureTags = (html) => {
    if (!html) return '';
    // Match <feature:FEATURE_ID>GENE_NAME</feature> and convert to anchor tags
    return html.replace(/<feature:([^>]+)>([^<]+)<\/feature>/g, '<a href="/locus/$1">$2</a>');
  };

  // ---------- GO grouping ----------
  const groupGoByAspect = (annotations) => {
    if (!annotations || annotations.length === 0) return {};

    const aspectCodeMap = {
      f: 'molecular_function',
      p: 'biological_process',
      c: 'cellular_component',
    };

    const groups = {
      molecular_function: {},
      biological_process: {},
      cellular_component: {},
    };

    annotations.forEach((ann) => {
      const rawAspect = ann.term?.aspect?.toLowerCase().replace(' ', '_') || 'unknown';
      const aspect = aspectCodeMap[rawAspect] || rawAspect;
      if (!groups[aspect]) return;

      const termName = ann.term?.display_name;
      if (!termName) return;

      const qualifier = ann.qualifier || '';
      const evidenceCode = ann.evidence?.code;
      const withFrom = ann.evidence?.with_from;
      const annotationType = ann.annotation_type || 'other';

      if (!groups[aspect][annotationType]) {
        groups[aspect][annotationType] = {};
      }

      const key = `${termName}|${qualifier}`;

      if (!groups[aspect][annotationType][key]) {
        groups[aspect][annotationType][key] = {
          name: termName,
          goid: ann.term?.goid,
          qualifier,
          evidenceEntries: [],
        };
      }

      if (evidenceCode) {
        const existing = groups[aspect][annotationType][key].evidenceEntries.find(
          (e) => e.code === evidenceCode && e.withFrom === withFrom
        );
        if (!existing) {
          groups[aspect][annotationType][key].evidenceEntries.push({ code: evidenceCode, withFrom });
        }
      }
    });

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

  const annotationTypeOrder = ['manually curated', 'high-throughput', 'computational'];
  const annotationTypeLabels = {
    'manually curated': 'Manually curated',
    'high-throughput': 'High-throughput',
    computational: 'Computational',
  };

  const aspectLabels = {
    molecular_function: 'Molecular Function',
    biological_process: 'Biological Process',
    cellular_component: 'Cellular Component',
  };

  // ---------- Phenotype grouping ----------
  const groupPhenotypesByType = (annotations) => {
    if (!annotations || annotations.length === 0) return {};

    const groups = {};
    annotations.forEach((ann) => {
      const experimentType = ann.experiment_type || 'Classical genetics';
      const mutantType = ann.mutant_type || 'unspecified';
      const observable = ann.phenotype?.display_name;
      const qualifier = ann.qualifier;

      if (!observable) return;

      if (!groups[experimentType]) groups[experimentType] = {};
      if (!groups[experimentType][mutantType]) groups[experimentType][mutantType] = new Set();

      const display = qualifier ? `${observable}: ${qualifier}` : observable;
      groups[experimentType][mutantType].add(display);
    });

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
  const experimentTypeOrder = ['Classical genetics', 'Large-scale survey'];

  // ---------- Alias grouping ----------
  const groupAliasesByType = (aliases) => {
    if (!aliases || aliases.length === 0) return {};

    const groups = {};
    aliases.forEach((alias) => {
      const type = alias.alias_type || 'Other';
      if (type === 'Other strain feature name') return;
      if (!groups[type]) groups[type] = [];
      groups[type].push(alias.alias_name);
    });

    const typeOrder = ['Uniform', 'Non-uniform', 'Protein name', 'NCBI protein name', 'Retired name'];
    const sorted = {};

    typeOrder.forEach((t) => {
      if (groups[t]) sorted[t] = groups[t];
    });

    Object.keys(groups).forEach((t) => {
      if (!sorted[t]) sorted[t] = groups[t];
    });

    return sorted;
  };

  const aliasGroups = groupAliasesByType(feature.aliases);
  const hasRetiredNames = aliasGroups['Retired name'] && aliasGroups['Retired name'].length > 0;
  const hasNonRetiredAliases =
    Object.keys(aliasGroups).filter((t) => t !== 'Retired name').length > 0;

  // ---------- External links grouping ----------
  const groupLinksByLabel = (links) => {
    if (!links || links.length === 0) return {};
    const groups = {};
    links.forEach((link) => {
      const label = link.label || 'Other';
      if (!groups[label]) groups[label] = [];
      groups[label].push(link);
    });
    return groups;
  };

  // Helper to fix malformed dictyBase URLs
  // Backend returns: http://dictybase.org/gene/DDB_G0272520/feature/DDB0185015
  // Should be: http://dictybase.org/gene/DDB0185015
  const fixExternalUrl = (url) => {
    if (!url) return url;
    const dictyMatch = url.match(/^(https?:\/\/dictybase\.org)\/gene\/[^/]+\/feature\/([^/]+)$/);
    if (dictyMatch) {
      return `${dictyMatch[1]}/gene/${dictyMatch[2]}`;
    }
    return url;
  };

  const linkGroups = groupLinksByLabel(feature.external_links);

  // ---------- Sequence helpers (NEW "nice" tables) ----------
  const renderLocationHeader = (loc, rightLink) => {
    if (!loc) return null;

    return (
      <div className="seq-header-inline">
        <span className="seq-coords">
          {loc.chromosome ? `${loc.chromosome}:` : ''}
          {fmtInt(loc.start_coord)} to {fmtInt(loc.stop_coord)}
          {loc.strand ? `, ${fmtStrand(loc.strand)} strand` : ''}
        </span>
        {rightLink ? <span className="seq-header-link">{rightLink}</span> : null}
      </div>
    );
  };

  const renderLastUpdate = (coordVersion, seqVersion) => {
    if (!coordVersion && !seqVersion) return null;

    return (
      <div className="seq-last-update">
        {coordVersion ? <span>Coordinates: {fmtDate(coordVersion)}</span> : null}
        {coordVersion && seqVersion ? <span className="seq-sep">|</span> : null}
        {seqVersion ? <span>Sequence: {fmtDate(seqVersion)}</span> : null}
      </div>
    );
  };

  const normalizeFeatureType = (t) => {
    if (!t) return '';
    if (t.toLowerCase() === 'cds') return 'CDS';
    return t;
  };

  const renderSubfeatureTable = (subfeatures) => {
    if (!subfeatures || subfeatures.length === 0) return null;

    return (
      <div className="subfeature-table-wrap">
        <table className="subfeature-table">
          <thead>
            <tr>
              <th className="sf-col-type">Subfeature</th>
              <th colSpan={2} className="sf-colgroup">
                Relative Coordinates
              </th>
              <th colSpan={2} className="sf-colgroup">
                Chromosomal Coordinates
              </th>
              <th colSpan={2} className="sf-colgroup">
                Most Recent Update
              </th>
            </tr>
            <tr>
              <th className="sf-col-type"></th>
              <th className="sf-col-start">Start</th>
              <th className="sf-col-stop">Stop</th>
              <th className="sf-col-start">Start</th>
              <th className="sf-col-stop">Stop</th>
              <th className="sf-col-date">Coordinates</th>
              <th className="sf-col-date">Sequence</th>
            </tr>
          </thead>
          <tbody>
            {subfeatures.map((sf, idx) => (
              <tr key={idx}>
                <td className="sf-type">{normalizeFeatureType(sf.feature_type) || ''}</td>
                <td className="sf-num">{fmtInt(sf.relative_start)}</td>
                <td className="sf-num">{fmtInt(sf.relative_stop)}</td>
                <td className="sf-num">{fmtInt(sf.start_coord)}</td>
                <td className="sf-num">{fmtInt(sf.stop_coord)}</td>
                <td className="sf-date">
                  <em>{fmtDate(sf.coord_version)}</em>
                </td>
                <td className="sf-date">
                  <em>{fmtDate(sf.seq_version)}</em>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderSequenceBlock = ({ title, locusName, loc, subfeatures }) => {
    if (!loc) return null;

    return (
      <>
        <tr className="sequence-section-header section-with-divider section-grey-bg">
          <th>{title}</th>
          <td>
            {renderLocationHeader(
              loc,
              locusName ? (
                <a href={`?tab=sequence`}>
                  View all <em>{locusName}</em> Sequence details
                </a>
              ) : null
            )}
          </td>
        </tr>

        {(loc.coord_version || loc.seq_version) && (
          <tr className="sequence-update-row">
            <th style={{ paddingLeft: '10px', fontWeight: 'normal' }}>Last Update</th>
            <td>{renderLastUpdate(loc.coord_version, loc.seq_version)}</td>
          </tr>
        )}

        {subfeatures && subfeatures.length > 0 && (
          <tr className="sequence-subfeature-row">
            <th style={{ paddingLeft: '10px', fontWeight: 'normal' }}>Subfeature Details</th>
            <td>{renderSubfeatureTable(subfeatures)}</td>
          </tr>
        )}
      </>
    );
  };

  // Pick current main location (first current location)
  const currentMainLocation =
    sequenceData?.locations?.filter((l) => l.is_current)?.[0] || null;

  // ---------- Render ----------
  return (
    <>
      <table className="info-table">
        <tbody>
          {/* Standard Name */}
          <tr>
            <th>Standard Name</th>
            <td>
              {feature.gene_name ? (
                feature.gene_name_with_refs ? (
                  <span dangerouslySetInnerHTML={{ __html: feature.gene_name_with_refs }} />
                ) : (
                  <span>
                    <em>{feature.gene_name}</em>
                  </span>
                )
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

          {/* Assembly 19/21 Identifier */}
          {feature.assembly_21_identifier && (
            <tr>
              <th>Assembly 19/21 Identifier</th>
              <td>{feature.assembly_21_identifier}</td>
            </tr>
          )}

          {/* Aliases */}
          {hasNonRetiredAliases && (
            <tr>
              <th>Alias</th>
              <td>
                <div className="alias-groups">
                  {(() => {
                    const aliasRefsMap = {};
                    if (feature.aliases_with_refs) {
                      feature.aliases_with_refs.forEach((a) => {
                        aliasRefsMap[a.alias_name] = a.alias_name_with_refs;
                      });
                    }

                    return Object.entries(aliasGroups)
                      .filter(([type]) => type !== 'Retired name')
                      .map(([type, names]) => (
                        <div key={type} className="alias-group">
                          <span className="alias-type-label">{type}:</span>
                          <span className="alias-names">
                            {names.map((name, idx) => (
                              <span key={idx}>
                                {aliasRefsMap[name] ? (
                                  <span dangerouslySetInnerHTML={{ __html: aliasRefsMap[name] }} />
                                ) : (
                                  <span>{name}</span>
                                )}
                                {idx < names.length - 1 ? ', ' : ''}
                              </span>
                            ))}
                          </span>
                        </div>
                      ));
                  })()}
                </div>
              </td>
            </tr>
          )}

          {/* Feature Type */}
          <tr>
            <th>Feature Type</th>
            <td>
              <span className="feature-type-badge">{feature.feature_type}</span>
              {feature.feature_qualifier && <span className="feature-qualifier">, {feature.feature_qualifier}</span>}
            </td>
          </tr>

          {/* Organism */}
          <tr>
            <th>Organism</th>
            <td>
              <em>{organismName}</em>
              {feature.taxon_id && <span className="taxon-id"> (Taxon ID: {feature.taxon_id})</span>}
            </td>
          </tr>

          {/* Primary CGDID */}
          <tr>
            <th>Primary CGDID</th>
            <td>{feature.dbxref_id}</td>
          </tr>

          {/* Allele */}
          {feature.alleles && feature.alleles.length > 0 && (
            <tr>
              <th>Allele</th>
              <td>
                {feature.alleles.map((allele, idx) => (
                  <span key={allele.feature_no}>
                    <a href={`/locus/${allele.feature_name}`}>{allele.gene_name || allele.feature_name}</a>
                    {idx < feature.alleles.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </td>
            </tr>
          )}

          {/* Allelic Variation */}
          {feature.allelic_variation && (
            <tr>
              <th>Allelic Variation</th>
              <td>{feature.allelic_variation}</td>
            </tr>
          )}

          {/* CUG Codons */}
          {feature.cug_codons !== null && feature.cug_codons !== undefined && (
            <tr>
              <th>CUG Codons</th>
              <td>{feature.cug_codons}</td>
            </tr>
          )}

          {/* Description */}
          <tr>
            <th>Description</th>
            <td>
              {feature.headline ? (
                feature.headline_with_refs ? (
                  <span dangerouslySetInnerHTML={{ __html: feature.headline_with_refs }} />
                ) : (
                  <span>{feature.headline}</span>
                )
              ) : (
                <span className="no-value">No description available</span>
              )}
            </td>
          </tr>

          {/* Name Description */}
          {feature.name_description && (
            <tr>
              <th>Name Description</th>
              <td>
                {feature.name_description_with_refs ? (
                  <span dangerouslySetInnerHTML={{ __html: feature.name_description_with_refs }} />
                ) : (
                  <em>{feature.name_description}</em>
                )}
              </td>
            </tr>
          )}

          {/* Other strain names */}
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
                        {item.strain_name && (
                          <span>
                            {' '}
                            (<em>{item.strain_name}</em>)
                          </span>
                        )}
                      </>
                    )}
                    {idx < feature.other_strain_names.length - 1 ? ' ; ' : ''}
                  </span>
                ))}
              </td>
            </tr>
          )}

          {/* Candida orthologs */}
          {feature.candida_orthologs && feature.candida_orthologs.length > 0 && (
            <tr>
              <th>Orthologous genes in Candida species</th>
              <td>
                <div className="ortholog-list">
                  {feature.candida_orthologs.map((orth, idx) => (
                    <div key={idx} className="ortholog-item">
                      <a href={`/locus/${orth.feature_name}`}>
                        {orth.gene_name && orth.gene_name !== orth.feature_name
                          ? `${orth.gene_name}/${orth.feature_name}`
                          : orth.feature_name}
                      </a>
                      <span className="organism-name">
                        {' '}
                        (<em>{orth.organism_name}</em>)
                      </span>
                    </div>
                  ))}
                </div>
                {feature.ortholog_cluster_url && (
                  <div style={{ marginTop: '8px' }}>
                    <a href={feature.ortholog_cluster_url} target="_blank" rel="noopener noreferrer">
                      View ortholog cluster
                    </a>
                  </div>
                )}
              </td>
            </tr>
          )}

          {/* External orthologs - filter out A. nidulans and N. crassa */}
          {feature.external_orthologs && (() => {
            const filteredOrthologs = feature.external_orthologs.filter(orth => {
              const speciesName = (orth.species_name || orth.source || '').toLowerCase();
              return !speciesName.includes('nidulans') && !speciesName.includes('crassa');
            });
            return filteredOrthologs.length > 0 ? (
              <tr>
                <th>Ortholog(s) in non-CGD species</th>
                <td>
                  {filteredOrthologs.map((orth, idx) => (
                    <span key={idx}>
                      <em>{orth.species_name || orth.source}</em>
                      {orth.gene_name && ` ${orth.gene_name}`}
                      {' ('}
                      {orth.url ? (
                        <a href={fixExternalUrl(orth.url)} target="_blank" rel="noopener noreferrer">
                          {orth.description || orth.dbxref_id}
                        </a>
                      ) : (
                        <span>{orth.description || orth.dbxref_id}</span>
                      )}
                      {')'}
                      {idx < filteredOrthologs.length - 1 ? ' ; ' : ''}
                    </span>
                  ))}
                </td>
              </tr>
            ) : null;
          })()}

          {/* JBrowse */}
          {sequenceData && sequenceData.jbrowse_info && (
            <tr className="jbrowse-section">
              <th style={{ verticalAlign: 'top' }}>JBrowse</th>
              <td>
                <div className="jbrowse-viewer-container">
                  <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      onClick={() => setShowJBrowseViewer(!showJBrowseViewer)}
                      style={{
                        padding: '4px 10px',
                        backgroundColor: '#f5f5f5',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      {showJBrowseViewer ? '▼ Hide' : '▶ Show'} JBrowse Viewer
                    </button>
                    <a
                      href={sequenceData.jbrowse_info.full_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: '13px' }}
                    >
                      Open in Full JBrowse ↗
                    </a>
                    <span className="jbrowse-location" style={{ fontSize: '13px', color: '#666' }}>
                      {sequenceData.jbrowse_info.chromosome}:{fmtInt(sequenceData.jbrowse_info.start_coord)}..
                      {fmtInt(sequenceData.jbrowse_info.stop_coord)}
                    </span>
                  </div>
                  {showJBrowseViewer && (
                    <div className="jbrowse-iframe-container" style={{ marginBottom: '12px' }}>
                      <iframe
                        src={sequenceData.jbrowse_info.full_url}
                        title="JBrowse Viewer"
                        style={{
                          width: '100%',
                          height: '350px',
                          border: '1px solid #ddd',
                          borderRadius: '4px'
                        }}
                      />
                    </div>
                  )}
                </div>
              </td>
            </tr>
          )}

          {/* GO */}
          {goLoading ? (
            <tr className="section-with-divider section-grey-bg">
              <th>GO Annotations</th>
              <td>
                <em>Loading GO annotations...</em>
              </td>
            </tr>
          ) : goData && goData.annotations && goData.annotations.length > 0 ? (
            <>
              <tr className="go-section-header section-with-divider section-grey-bg">
                <th>GO Annotations</th>
                <td>
                  <a href={`?tab=go`}>
                    View all <em>{feature.gene_name || feature.feature_name}</em> GO evidence and references
                  </a>
                </td>
              </tr>

              {Object.entries(goGroups).map(([aspect, typeGroups]) => {
                const hasTerms = Object.values(typeGroups).some((terms) => terms.length > 0);
                if (!hasTerms) return null;

                return (
                  <React.Fragment key={aspect}>
                    <tr className="go-aspect-header-row">
                      <th style={{ paddingLeft: '10px' }}>{aspectLabels[aspect]}</th>
                      <td></td>
                    </tr>

                    {annotationTypeOrder.map((annType) => {
                      const terms = typeGroups[annType];
                      if (!terms || terms.length === 0) return null;

                      return (
                        <tr key={`${aspect}-${annType}`} className="go-annotation-type-row">
                          <th style={{ paddingLeft: '30px', fontWeight: 'normal', fontStyle: 'italic' }}>
                            {annotationTypeLabels[annType] || annType}
                          </th>
                          <td>
                            <div className="go-terms-list">
                              {terms.map((term, idx) => (
                                <div key={idx} className="go-term-item">
                                  <span className="go-bullet">•</span>
                                  {term.qualifier && (
                                    <em
                                      className={`go-qualifier ${
                                        term.qualifier.toLowerCase() === 'not' ? 'qualifier-not' : ''
                                      }`}
                                    >
                                      {term.qualifier}
                                    </em>
                                  )}
                                  {term.qualifier ? ' ' : ''}
                                  <Link to={`/go/${term.goid}`}>
                                    {term.name}
                                  </Link>

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
                                          {entry.withFrom && <span className="go-with-from"> with {entry.withFrom}</span>}
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
          ) : null}

          {/* Phenotype */}
          {phenotypeLoading ? (
            <tr className="section-with-divider section-grey-bg">
              <th>Mutant Phenotype</th>
              <td>
                <em>Loading phenotype annotations...</em>
              </td>
            </tr>
          ) : phenotypeData && phenotypeData.annotations && phenotypeData.annotations.length > 0 ? (
            <>
              <tr className="phenotype-section-header section-with-divider section-grey-bg">
                <th>Mutant Phenotype</th>
                <td>
                  <a href={`?tab=phenotype`}>
                    View all <em>{feature.gene_name || feature.feature_name}</em> Phenotype details and references
                  </a>
                </td>
              </tr>

              {experimentTypeOrder.map((expType) => {
                const mutantTypes = phenotypeGroups[expType];
                if (!mutantTypes || Object.keys(mutantTypes).length === 0) return null;

                return (
                  <React.Fragment key={expType}>
                    <tr className="phenotype-experiment-type-row">
                      <th style={{ paddingLeft: '10px', fontWeight: 'bold' }}>{expType}</th>
                      <td></td>
                    </tr>

                    {Object.entries(mutantTypes)
                      .sort(([a], [b]) => a.localeCompare(b))
                      .map(([mutantType, observables]) => (
                        <tr key={`${expType}-${mutantType}`} className="phenotype-mutant-type-row">
                          <th style={{ paddingLeft: '30px', fontWeight: 'normal' }}>{mutantType}</th>
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
          ) : null}

          {/* Sequence Information */}
          {sequenceLoading ? (
            <tr className="section-with-divider section-grey-bg">
              <th>Sequence Information</th>
              <td>
                <em>Loading sequence information...</em>
              </td>
            </tr>
          ) : sequenceData && (sequenceData.locations?.length > 0 || sequenceData.allele_locations?.length > 0) ? (
            <>
              {/* Main locus sequence block */}
              {renderSequenceBlock({
                title: 'Sequence Information',
                locusName: feature.gene_name || feature.feature_name,
                loc: currentMainLocation,
                subfeatures: sequenceData.subfeatures || [],
              })}

              {/* Allele locations blocks */}
              {sequenceData.allele_locations &&
                sequenceData.allele_locations.length > 0 &&
                sequenceData.allele_locations.map((allele, alleleIdx) => (
                  <React.Fragment key={alleleIdx}>
                    {renderSequenceBlock({
                      title: (
                        <>
                          Allele Location
                          <br />
                          <span style={{ fontWeight: 'normal', paddingLeft: '10px' }}>
                            Allele {allele.feature_name}
                          </span>
                        </>
                      ),
                      locusName: null,
                      loc: allele,
                      subfeatures: allele.subfeatures || [],
                    })}
                  </React.Fragment>
                ))}
            </>
          ) : null}

          {/* Retired Names */}
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

          {/* External Links */}
          {Object.keys(linkGroups).length > 0 && (
            <tr className="section-with-divider">
              <th>External Links</th>
              <td>
                <span className="external-links-inline">
                  {Object.entries(linkGroups).map(([label, links], groupIdx) => (
                    <span key={label}>
                      {links.length === 1 ? (
                        <a href={links[0].url} target="_blank" rel="noopener noreferrer">
                          {label}
                        </a>
                      ) : (
                        <span>
                          {label} (
                          {links.map((link, idx) => (
                            <span key={idx}>
                              <a href={link.url} target="_blank" rel="noopener noreferrer">
                                {idx + 1}
                              </a>
                              {idx < links.length - 1 ? ', ' : ''}
                            </span>
                          ))}
                          )
                        </span>
                      )}
                      {groupIdx < Object.keys(linkGroups).length - 1 ? ' | ' : ''}
                    </span>
                  ))}
                </span>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ADDITIONAL INFORMATION */}
      {feature.additional_info_links && feature.additional_info_links.length > 0 && (
        <div className="additional-info-section">
          <h3 className="section-header">
            ADDITIONAL INFORMATION for <em>{feature.gene_name || feature.feature_name}</em>
          </h3>
          <div className="additional-info-links">
            {feature.additional_info_links.map((link, idx) => (
              <a
                key={idx}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="additional-info-link"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* LOCUS SUMMARY NOTES */}
      {feature.summary_notes && feature.summary_notes.length > 0 && (
        <div className="summary-notes-section">
          <h3 className="section-header">
            LOCUS SUMMARY NOTES for <em>{(feature.gene_name || feature.feature_name || '').trim()}</em>{feature.summary_notes_last_updated && (<span className="last-updated"> (Last Updated: {fmtDate(feature.summary_notes_last_updated)})</span>)}
          </h3>
          <div className="summary-notes-content">
            {feature.summary_notes.map((note, idx) => (
              <p
                key={idx}
                className="summary-note-paragraph"
                dangerouslySetInnerHTML={{ __html: parseFeatureTags(note.paragraph_text) }}
              />
            ))}
          </div>
        </div>
      )}

      {/* REFERENCES CITED ON THIS PAGE */}
      {feature.cited_references && feature.cited_references.length > 0 && (
        <div className="cited-references-section">
          <h3 className="section-header">
            REFERENCES CITED ON THIS PAGE
            {feature.literature_guide_url && (
              <span className="literature-guide-link">
                {' '}
                [
                <Link to={`/locus/${feature.gene_name || feature.feature_name}?tab=literature`}>
                  View Complete Literature Guide for <em>{feature.gene_name || feature.feature_name}</em>
                </Link>
                ]
              </span>
            )}
          </h3>
          <div className="references-list">
            {feature.cited_references.map((ref, idx) => (
              <div key={ref.reference_no} id={`ref${idx + 1}`} className="reference-item">
                <span className="reference-number">{idx + 1})</span>
                {renderCitationItem(ref, { itemClassName: 'reference-citation' })}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default LocusSummary;
