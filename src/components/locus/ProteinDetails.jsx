import React, { useState, useEffect, useMemo } from 'react';
import OrganismSelector, { getDefaultOrganism } from './OrganismSelector';
import './LocusComponents.css';

function ProteinDetails({ data, loading, error, selectedOrganism, onOrganismChange }) {
  const [showAllAA, setShowAllAA] = useState(false);
  const [showSequence, setShowSequence] = useState(false);

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

  if (loading) return <div className="loading">Loading protein data...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!data || !data.results) return <div className="no-data">No protein data available</div>;

  if (organisms.length === 0) {
    return <div className="no-data">No protein information found</div>;
  }

  // Get data for the selected organism
  const orgData = selectedOrganism ? data.results[selectedOrganism] : null;

  const formatNumber = (num, decimals = 2) => {
    if (num === null || num === undefined) return '-';
    return typeof num === 'number' ? num.toFixed(decimals) : num;
  };

  const formatMW = (mw) => {
    if (mw === null || mw === undefined) return '-';
    if (mw >= 1000) {
      return `${(mw / 1000).toFixed(2)} kDa`;
    }
    return `${mw} Da`;
  };

  // Amino acid full names and properties
  const aaInfo = {
    ala: { code: 'A', name: 'Alanine', type: 'nonpolar' },
    arg: { code: 'R', name: 'Arginine', type: 'positive' },
    asn: { code: 'N', name: 'Asparagine', type: 'polar' },
    asp: { code: 'D', name: 'Aspartic acid', type: 'negative' },
    cys: { code: 'C', name: 'Cysteine', type: 'polar' },
    gln: { code: 'Q', name: 'Glutamine', type: 'polar' },
    glu: { code: 'E', name: 'Glutamic acid', type: 'negative' },
    gly: { code: 'G', name: 'Glycine', type: 'nonpolar' },
    his: { code: 'H', name: 'Histidine', type: 'positive' },
    ile: { code: 'I', name: 'Isoleucine', type: 'nonpolar' },
    leu: { code: 'L', name: 'Leucine', type: 'nonpolar' },
    lys: { code: 'K', name: 'Lysine', type: 'positive' },
    met: { code: 'M', name: 'Methionine', type: 'nonpolar' },
    phe: { code: 'F', name: 'Phenylalanine', type: 'nonpolar' },
    pro: { code: 'P', name: 'Proline', type: 'nonpolar' },
    ser: { code: 'S', name: 'Serine', type: 'polar' },
    thr: { code: 'T', name: 'Threonine', type: 'polar' },
    trp: { code: 'W', name: 'Tryptophan', type: 'nonpolar' },
    tyr: { code: 'Y', name: 'Tyrosine', type: 'polar' },
    val: { code: 'V', name: 'Valine', type: 'nonpolar' },
  };

  const aaTypeColors = {
    nonpolar: '#ffecb3',
    polar: '#c8e6c9',
    positive: '#bbdefb',
    negative: '#ffcdd2',
  };

  // Get protein info for selected organism
  const pi = orgData?.protein_info;

  // Render domain graphic
  const renderDomainGraphic = (domains, proteinLength) => {
    if (!domains || domains.length === 0 || !proteinLength) return null;

    const width = 600;
    const height = 60;
    const trackHeight = 20;
    const scale = width / proteinLength;

    // Color palette for different domain types
    const domainColors = {
      'Pfam': '#4CAF50',
      'SMART': '#2196F3',
      'InterPro': '#FF9800',
      'PROSITE': '#9C27B0',
      'default': '#607D8B',
    };

    return (
      <div className="domain-graphic">
        <svg width={width} height={height} style={{ border: '1px solid #ddd', backgroundColor: '#fafafa' }}>
          {/* Protein backbone */}
          <rect x="0" y={height / 2 - 3} width={width} height="6" fill="#ccc" />

          {/* Domains */}
          {domains.map((domain, idx) => {
            if (!domain.start_coord || !domain.stop_coord) return null;
            const x = domain.start_coord * scale;
            const domainWidth = (domain.stop_coord - domain.start_coord) * scale;
            const color = domainColors[domain.domain_type] || domainColors.default;

            return (
              <g key={idx}>
                <rect
                  x={x}
                  y={height / 2 - trackHeight / 2}
                  width={Math.max(domainWidth, 5)}
                  height={trackHeight}
                  fill={color}
                  stroke="#333"
                  strokeWidth="1"
                  rx="3"
                >
                  <title>{`${domain.domain_name} (${domain.start_coord}-${domain.stop_coord})`}</title>
                </rect>
              </g>
            );
          })}

          {/* Scale markers */}
          <text x="5" y={height - 5} fontSize="10" fill="#666">1</text>
          <text x={width - 30} y={height - 5} fontSize="10" fill="#666">{proteinLength}</text>
        </svg>
        <div className="domain-legend">
          {Object.entries(domainColors).filter(([k]) => k !== 'default').map(([type, color]) => (
            <span key={type} className="legend-item" style={{ marginRight: '15px' }}>
              <span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: color, marginRight: '4px', borderRadius: '2px' }}></span>
              {type}
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="protein-details locus-summary">
      {/* Organism Selector */}
      <OrganismSelector
        organisms={organisms}
        selectedOrganism={selectedOrganism}
        onOrganismChange={onOrganismChange}
        dataType="protein"
      />

      {/* Display data for selected organism */}
      {selectedOrganism && orgData ? (
        <>
          <table className="info-table">
            <tbody>
              {/* Protein Standard Name (e.g., Act1p) */}
              <tr>
                <th>Protein Standard Name</th>
                <td>
                  {orgData.protein_standard_name ? (
                    <strong>{orgData.protein_standard_name}</strong>
                  ) : (
                    <span className="no-value">-</span>
                  )}
                </td>
              </tr>

              {/* Protein Systematic Name (e.g., C1_13700wp_a) */}
              <tr>
                <th>Protein Systematic Name</th>
                <td>{orgData.protein_systematic_name || orgData.systematic_name}</td>
              </tr>

              {/* Aliases (protein format, e.g., C1_13700wp_b) */}
              {orgData.aliases && orgData.aliases.length > 0 && (
                <tr>
                  <th>Alias{orgData.aliases.length > 1 ? 'es' : ''}</th>
                  <td>
                    {orgData.aliases.map((alias, idx) => (
                      <span key={idx}>
                        {alias.protein_alias_name || alias.alias_name}
                        {idx < orgData.aliases.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </td>
                </tr>
              )}

              {/* Description */}
              <tr>
                <th>Description</th>
                <td>
                  {orgData.description ? (
                    <span>{orgData.description}</span>
                  ) : (
                    <span className="no-value">No description available</span>
                  )}
                </td>
              </tr>

              {/* Structural Information Section Header */}
              {(pi || orgData.alphafold_info) && (
                <>
                  <tr className="section-with-divider section-grey-bg">
                    <th>Structural Information</th>
                    <td>
                      {orgData.alphafold_info && orgData.alphafold_info.structure_available && (
                        <a
                          href={orgData.alphafold_info.alphafold_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="alphafold-link"
                        >
                          View AlphaFold Structure
                        </a>
                      )}
                    </td>
                  </tr>

                  {/* AlphaFold */}
                  {orgData.alphafold_info && orgData.alphafold_info.structure_available && (
                    <tr>
                      <th style={{ paddingLeft: '20px' }}>AlphaFold</th>
                      <td>
                        <a
                          href={orgData.alphafold_info.alphafold_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {orgData.alphafold_info.uniprot_id}
                        </a>
                        {' '}
                        <span className="external-link-hint">(predicted structure)</span>
                      </td>
                    </tr>
                  )}

                  {pi && (
                    <>
                      {/* Length */}
                      <tr>
                        <th style={{ paddingLeft: '20px' }}>Length</th>
                        <td>{pi.protein_length?.toLocaleString() || '-'} amino acids</td>
                      </tr>

                      {/* Molecular Weight */}
                      <tr>
                        <th style={{ paddingLeft: '20px' }}>Molecular Weight</th>
                        <td>{formatMW(pi.molecular_weight)}</td>
                      </tr>

                      {/* Isoelectric Point */}
                      <tr>
                        <th style={{ paddingLeft: '20px' }}>Isoelectric Point (pI)</th>
                        <td>{formatNumber(pi.pi)}</td>
                      </tr>

                      {/* CAI */}
                      {pi.cai !== null && pi.cai !== undefined && (
                        <tr>
                          <th style={{ paddingLeft: '20px' }}>CAI (Codon Adaptation Index)</th>
                          <td>{formatNumber(pi.cai)}</td>
                        </tr>
                      )}

                      {/* Codon Bias */}
                      {pi.codon_bias !== null && pi.codon_bias !== undefined && (
                        <tr>
                          <th style={{ paddingLeft: '20px' }}>Codon Bias</th>
                          <td>{formatNumber(pi.codon_bias)}</td>
                        </tr>
                      )}

                      {/* FOP Score */}
                      {pi.fop_score !== null && pi.fop_score !== undefined && (
                        <tr>
                          <th style={{ paddingLeft: '20px' }}>FOP Score</th>
                          <td>{formatNumber(pi.fop_score)}</td>
                        </tr>
                      )}

                      {/* GRAVY Score */}
                      {pi.gravy_score !== null && pi.gravy_score !== undefined && (
                        <tr>
                          <th style={{ paddingLeft: '20px' }}>GRAVY Score</th>
                          <td>
                            {formatNumber(pi.gravy_score)}
                            {pi.gravy_score > 0 ? ' (hydrophobic)' : pi.gravy_score < 0 ? ' (hydrophilic)' : ''}
                          </td>
                        </tr>
                      )}

                      {/* Aromaticity Score */}
                      {pi.aromaticity_score !== null && pi.aromaticity_score !== undefined && (
                        <tr>
                          <th style={{ paddingLeft: '20px' }}>Aromaticity Score</th>
                          <td>{formatNumber(pi.aromaticity_score)}</td>
                        </tr>
                      )}

                      {/* N-terminus */}
                      {pi.n_term_seq && (
                        <tr>
                          <th style={{ paddingLeft: '20px' }}>N-terminus</th>
                          <td><code className="terminal-sequence">{pi.n_term_seq}</code></td>
                        </tr>
                      )}

                      {/* C-terminus */}
                      {pi.c_term_seq && (
                        <tr>
                          <th style={{ paddingLeft: '20px' }}>C-terminus</th>
                          <td><code className="terminal-sequence">{pi.c_term_seq}</code></td>
                        </tr>
                      )}

                      {/* Amino Acid Composition */}
                      {pi.amino_acids && Object.keys(pi.amino_acids).length > 0 && (
                        <tr>
                          <th
                            style={{ paddingLeft: '20px', cursor: 'pointer' }}
                            onClick={() => setShowAllAA(!showAllAA)}
                          >
                            <span className="collapse-icon">{showAllAA ? '▼' : '▶'}</span>
                            {' '}Amino Acid Composition
                          </th>
                          <td>
                            {!showAllAA ? (
                              <span className="count-badge">{Object.keys(pi.amino_acids).length} types</span>
                            ) : (
                              <div className="aa-composition">
                                <div className="aa-legend">
                                  <span className="legend-item" style={{ backgroundColor: aaTypeColors.nonpolar }}>Nonpolar</span>
                                  <span className="legend-item" style={{ backgroundColor: aaTypeColors.polar }}>Polar</span>
                                  <span className="legend-item" style={{ backgroundColor: aaTypeColors.positive }}>Positive</span>
                                  <span className="legend-item" style={{ backgroundColor: aaTypeColors.negative }}>Negative</span>
                                </div>
                                <div className="aa-grid">
                                  {Object.entries(pi.amino_acids)
                                    .sort((a, b) => b[1] - a[1])
                                    .map(([aa, count]) => {
                                      const info = aaInfo[aa.toLowerCase()] || { code: aa.toUpperCase(), name: aa, type: 'nonpolar' };
                                      const totalAA = pi.protein_length || 0;
                                      const percentage = totalAA > 0 ? ((count / totalAA) * 100).toFixed(1) : 0;
                                      return (
                                        <div
                                          key={aa}
                                          className="aa-item"
                                          style={{ backgroundColor: aaTypeColors[info.type] }}
                                          title={info.name}
                                        >
                                          <span className="aa-code">{info.code}</span>
                                          <span className="aa-count">{count}</span>
                                          <span className="aa-percent">{percentage}%</span>
                                        </div>
                                      );
                                    })}
                                </div>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </>
                  )}
                </>
              )}

              {/* Conserved Domains Section */}
              {orgData.conserved_domains && orgData.conserved_domains.length > 0 && (
                <>
                  <tr className="section-with-divider section-grey-bg">
                    <th>Conserved Domains</th>
                    <td>
                      <span className="count-badge">{orgData.conserved_domains.length} domain{orgData.conserved_domains.length > 1 ? 's' : ''}</span>
                    </td>
                  </tr>

                  {/* Domain Graphic */}
                  {pi && pi.protein_length && (
                    <tr>
                      <th style={{ paddingLeft: '20px', fontWeight: 'normal' }}>Domain Map</th>
                      <td>
                        {renderDomainGraphic(orgData.conserved_domains, pi.protein_length)}
                      </td>
                    </tr>
                  )}

                  {orgData.conserved_domains.map((domain, idx) => (
                    <tr key={idx}>
                      <th style={{ paddingLeft: '20px', fontWeight: 'normal' }}>{domain.domain_type}</th>
                      <td>
                        <strong>{domain.domain_name}</strong>
                        {domain.start_coord && domain.stop_coord && (
                          <span> ({domain.start_coord} - {domain.stop_coord})</span>
                        )}
                        {domain.interpro_id && (
                          <span>
                            {' '}[
                            <a
                              href={`https://www.ebi.ac.uk/interpro/entry/InterPro/${domain.interpro_id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {domain.interpro_id}
                            </a>
                            ]
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </>
              )}

              {/* Sequence Detail Section */}
              {orgData.sequence_detail && (orgData.sequence_detail.protein_sequence_gcg || orgData.sequence_detail.protein_length) && (
                <>
                  <tr className="section-with-divider section-grey-bg">
                    <th
                      style={{ cursor: orgData.sequence_detail.protein_sequence_gcg ? 'pointer' : 'default' }}
                      onClick={() => orgData.sequence_detail.protein_sequence_gcg && setShowSequence(!showSequence)}
                    >
                      {orgData.sequence_detail.protein_sequence_gcg && (
                        <span className="collapse-icon">{showSequence ? '▼' : '▶'}</span>
                      )}
                      {' '}Sequence Detail
                    </th>
                    <td>
                      {orgData.sequence_detail.protein_length && (
                        <span>{orgData.sequence_detail.protein_length} aa</span>
                      )}
                      {orgData.sequence_detail.cds_length && (
                        <span> | CDS: {orgData.sequence_detail.cds_length} bp</span>
                      )}
                    </td>
                  </tr>
                  {showSequence && orgData.sequence_detail.protein_sequence_gcg && (
                    <tr>
                      <th style={{ paddingLeft: '20px', fontWeight: 'normal' }}>Protein Sequence (GCG Format)</th>
                      <td>
                        <pre className="protein-sequence gcg-format" style={{ margin: 0, whiteSpace: 'pre', fontFamily: 'monospace', fontSize: '11px', backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px', overflowX: 'auto' }}>
                          {orgData.sequence_detail.protein_sequence_gcg}
                        </pre>
                      </td>
                    </tr>
                  )}
                </>
              )}

              {/* Homologs Section */}
              {(orgData.homologs && orgData.homologs.length > 0) || orgData.blast_url ? (
                <>
                  <tr className="section-with-divider section-grey-bg">
                    <th>Homologs</th>
                    <td>
                      {orgData.homologs && orgData.homologs.length > 0 && (
                        <span className="count-badge">{orgData.homologs.length} homolog{orgData.homologs.length > 1 ? 's' : ''}</span>
                      )}
                    </td>
                  </tr>

                  {/* BLAST Link */}
                  {orgData.blast_url && (
                    <tr>
                      <th style={{ paddingLeft: '20px', fontWeight: 'normal' }}>BLAST Search</th>
                      <td>
                        <a href={orgData.blast_url} target="_blank" rel="noopener noreferrer">
                          BLAST {orgData.protein_standard_name || orgData.locus_display_name} against other Candida sequences
                        </a>
                      </td>
                    </tr>
                  )}

                  {orgData.homologs && orgData.homologs.map((homolog, idx) => (
                    <tr key={idx}>
                      <th style={{ paddingLeft: '20px', fontWeight: 'normal', fontStyle: 'italic' }}>
                        {homolog.organism_name}
                      </th>
                      <td>
                        {homolog.url ? (
                          <a href={homolog.url} target="_blank" rel="noopener noreferrer">
                            {homolog.protein_name || homolog.gene_name || homolog.feature_name}
                          </a>
                        ) : (
                          <span>{homolog.protein_name || homolog.gene_name || homolog.feature_name}</span>
                        )}
                        {homolog.source && <span className="homolog-source"> [{homolog.source}]</span>}
                      </td>
                    </tr>
                  ))}
                </>
              ) : null}

              {/* External Sequence Database */}
              {orgData.external_links && orgData.external_links.length > 0 && (
                <tr className="section-with-divider">
                  <th>External Sequence Database</th>
                  <td>
                    <span className="external-links-inline">
                      {orgData.external_links.map((link, idx) => (
                        <span key={idx}>
                          <a href={link.url} target="_blank" rel="noopener noreferrer">
                            {link.label}
                          </a>
                          {idx < orgData.external_links.length - 1 ? ' | ' : ''}
                        </span>
                      ))}
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* REFERENCES CITED ON THIS PAGE */}
          {orgData.cited_references && orgData.cited_references.length > 0 && (
            <div className="cited-references-section">
              <h3 className="section-header">
                REFERENCES CITED ON THIS PAGE
                {orgData.literature_guide_url && (
                  <span className="literature-guide-link">
                    {' '}[
                    <a href={orgData.literature_guide_url}>
                      View Complete Literature Guide for <em>{orgData.protein_standard_name || orgData.locus_display_name}</em>
                    </a>
                    ]
                  </span>
                )}
              </h3>
              <div className="references-list">
                {orgData.cited_references.map((ref, idx) => (
                  <div key={idx} id={`ref${idx + 1}`} className="reference-item">
                    <span className="reference-number">{idx + 1})</span>
                    <span className="reference-citation">
                      {ref.citation}
                      {ref.pubmed && (
                        <a
                          href={`https://pubmed.ncbi.nlm.nih.gov/${ref.pubmed}/`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="pubmed-link"
                        >
                          {' '}PMID: {ref.pubmed}
                        </a>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Show message if no protein info at all */}
          {!pi && !orgData.conserved_domains?.length && !orgData.homologs?.length && (
            <p className="no-data">No protein information for this organism</p>
          )}
        </>
      ) : (
        <p className="no-data">Select an organism to view protein information</p>
      )}
    </div>
  );
}

export default ProteinDetails;
