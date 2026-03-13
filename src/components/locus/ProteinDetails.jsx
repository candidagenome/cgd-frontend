import React, { useEffect, useMemo, useState, Suspense, lazy } from 'react';
import { Link, useParams } from 'react-router-dom';
import OrganismSelector, { getDefaultOrganism } from './OrganismSelector';
import { renderCitationItem } from '../../utils/formatCitation.jsx';
import './LocusComponents.css';

// Lazy load heavy 3D viewer component
const AlphaFoldViewer = lazy(() => import('./AlphaFoldViewer'));

/**
 * Generate external URL for a domain accession based on its source database.
 * @param {string} accession - The domain accession ID (e.g., "IPR000719", "PF00069")
 * @param {string} source - The source database (e.g., "InterPro", "Pfam", "SMART")
 * @returns {string|null} - URL to the external database entry, or null if unknown
 */
function getDomainUrl(accession, source) {
  if (!accession) return null;

  const acc = accession.trim();
  const src = (source || '').toLowerCase();

  // Match by accession prefix first (more reliable)
  if (acc.startsWith('IPR')) {
    return `https://www.ebi.ac.uk/interpro/entry/InterPro/${acc}/`;
  }
  if (acc.startsWith('PF') && /^PF\d+$/.test(acc)) {
    return `https://www.ebi.ac.uk/interpro/entry/pfam/${acc}/`;
  }
  if (acc.startsWith('PS') && /^PS\d+$/.test(acc)) {
    return `https://prosite.expasy.org/${acc}`;
  }
  if (acc.startsWith('SM') && /^SM\d+$/.test(acc)) {
    return `https://smart.embl.de/smart/do_annotation.pl?DOMAIN=${acc}`;
  }
  if (acc.startsWith('cd') && /^cd\d+$/.test(acc)) {
    return `https://www.ncbi.nlm.nih.gov/Structure/cdd/cddsrv.cgi?uid=${acc}`;
  }
  if (acc.startsWith('G3DSA:')) {
    // CATH-Gene3D - format like G3DSA:1.10.10.10
    return `https://www.cathdb.info/version/latest/superfamily/${acc.replace('G3DSA:', '')}`;
  }
  if (acc.startsWith('SSF') && /^SSF\d+$/.test(acc)) {
    // SUPERFAMILY
    return `https://supfam.org/SUPERFAMILY/cgi-bin/scop.cgi?ipid=${acc.replace('SSF', '')}`;
  }
  if (acc.startsWith('PTHR') && /^PTHR\d+/.test(acc)) {
    // PANTHER
    return `https://www.pantherdb.org/panther/family.do?clsAccession=${acc}`;
  }
  if (acc.startsWith('TIGR') && /^TIGR\d+$/.test(acc)) {
    // TIGRFAMs (now in InterPro)
    return `https://www.ebi.ac.uk/interpro/entry/tigrfams/${acc}/`;
  }
  if (acc.startsWith('MF_') && /^MF_\d+$/.test(acc)) {
    // HAMAP
    return `https://hamap.expasy.org/rule/${acc}`;
  }
  if (acc.startsWith('PIRSF') && /^PIRSF\d+$/.test(acc)) {
    // PIRSF
    return `https://proteininformationresource.org/cgi-bin/ipcSF?id=${acc}`;
  }
  if (acc.startsWith('PR') && /^PR\d+$/.test(acc)) {
    // PRINTS
    return `https://www.ebi.ac.uk/interpro/entry/prints/${acc}/`;
  }

  // Fallback: match by source name
  if (src.includes('interpro')) {
    return `https://www.ebi.ac.uk/interpro/entry/InterPro/${acc}/`;
  }
  if (src.includes('pfam')) {
    return `https://www.ebi.ac.uk/interpro/entry/pfam/${acc}/`;
  }
  if (src.includes('prosite')) {
    return `https://prosite.expasy.org/${acc}`;
  }
  if (src.includes('smart')) {
    return `https://smart.embl.de/smart/do_annotation.pl?DOMAIN=${acc}`;
  }
  if (src.includes('cdd') || src.includes('ncbi')) {
    return `https://www.ncbi.nlm.nih.gov/Structure/cdd/cddsrv.cgi?uid=${acc}`;
  }
  if (src.includes('gene3d') || src.includes('cath')) {
    return `https://www.cathdb.info/version/latest/superfamily/${acc}`;
  }
  if (src.includes('superfamily')) {
    return `https://supfam.org/SUPERFAMILY/cgi-bin/scop.cgi?ipid=${acc}`;
  }
  if (src.includes('panther')) {
    return `https://www.pantherdb.org/panther/family.do?clsAccession=${acc}`;
  }

  return null;
}

function ProteinDetails({ data, loading, error, selectedOrganism, onOrganismChange }) {
  const { name: locusName } = useParams();
  const [showAlphaFold, setShowAlphaFold] = useState(false);
  const [showDomainViewer, setShowDomainViewer] = useState(true); // Show domain viewer by default

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

  // Reset viewers when organism changes
  useEffect(() => {
    setShowAlphaFold(false);
    setShowDomainViewer(true); // Reset to show domain viewer for new organism
  }, [selectedOrganism]);

  if (loading) return <div className="loading">Loading protein data...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!data || !data.results) return <div className="no-data">No protein data available</div>;

  if (organisms.length === 0) {
    return <div className="no-data">No protein information found</div>;
  }

  // Get data for the selected organism
  const orgData = selectedOrganism ? data.results[selectedOrganism] : null;

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
              {/* Standard Name (e.g., ACT1) */}
              <tr>
                <th>Standard Name</th>
                <td>
                  {orgData.gene_name || orgData.stanford_name || <span className="no-value">-</span>}
                </td>
              </tr>

              {/* Systematic Name (e.g., C1_13700W_A) */}
              <tr>
                <th>Systematic Name</th>
                <td>{orgData.systematic_name || orgData.feature_name}</td>
              </tr>

              {/* Allele Names (e.g., C1_13700W_B) */}
              {orgData.allele_names && orgData.allele_names.length > 0 && (
                <tr>
                  <th>Allele Name{orgData.allele_names.length > 1 ? 's' : ''}</th>
                  <td>
                    {orgData.allele_names.map((allele, idx) => (
                      <span key={idx}>
                        {allele.feature_name || allele.systematic_name || allele.allele_name}
                        {idx < orgData.allele_names.length - 1 ? ', ' : ''}
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
                    orgData.description_with_refs ? (
                      <span dangerouslySetInnerHTML={{ __html: orgData.description_with_refs }} />
                    ) : (
                      <span>{orgData.description}</span>
                    )
                  ) : (
                    <span className="no-value">No description available</span>
                  )}
                </td>
              </tr>

              {/* Name Description */}
              {orgData.name_description && (
                <tr>
                  <th>Name Description</th>
                  <td>
                    {orgData.name_description_with_refs ? (
                      <span dangerouslySetInnerHTML={{ __html: orgData.name_description_with_refs }} />
                    ) : (
                      <span>{orgData.name_description}</span>
                    )}
                  </td>
                </tr>
              )}

              {/* Structural Information Section - always show when protein data exists */}
              <tr className="section-with-divider section-grey-bg">
                <th style={{ verticalAlign: 'top' }}>Structural Information</th>
                <td>
                  <div style={{ marginBottom: '10px', fontWeight: '600' }}>AlphaFold Protein Structure</div>
                  {showAlphaFold ? (
                    <Suspense fallback={<div className="loading">Loading 3D viewer...</div>}>
                      <AlphaFoldViewer
                        key={orgData.alphafold_info?.uniprot_id || selectedOrganism}
                        uniprotId={orgData.alphafold_info?.uniprot_id}
                      />
                    </Suspense>
                  ) : (
                    <button
                      onClick={() => setShowAlphaFold(true)}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: '#1976d2',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Load 3D Structure
                    </button>
                  )}
                </td>
              </tr>

              {/* Conserved Domains Section - always show when protein data exists */}
              <tr className="section-with-divider section-grey-bg">
                <th style={{ verticalAlign: 'top' }}>Conserved Domains</th>
                <td>
                  {orgData.pbrowse_url ? (
                    <div className="domain-viewer-container">
                      <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button
                          onClick={() => setShowDomainViewer(!showDomainViewer)}
                          style={{
                            padding: '4px 10px',
                            backgroundColor: '#f5f5f5',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          {showDomainViewer ? '▼ Hide' : '▶ Show'} Domain Viewer
                        </button>
                        <a
                          href={orgData.pbrowse_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontSize: '13px' }}
                        >
                          Open in Full JBrowse ↗
                        </a>
                      </div>
                      {showDomainViewer && (
                        <div className="domain-viewer-iframe-container" style={{ marginBottom: '12px' }}>
                          <iframe
                            src={orgData.pbrowse_url}
                            title="Domain Viewer"
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
                  ) : null}
                  {orgData.conserved_domains && orgData.conserved_domains.length > 0 ? (
                    <div className="domains-table-container">
                      <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#666' }}>
                        Computationally identified domains and motifs as determined by InterProScan analysis.
                        {' '}({orgData.conserved_domains.length} entries)
                      </p>
                      <table className="domains-table">
                        <thead>
                          <tr>
                            <th>Protein Coordinates</th>
                            <th>Accession ID</th>
                            <th>Source</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orgData.conserved_domains.map((domain, idx) => {
                            const domainUrl = getDomainUrl(domain.domain_name, domain.domain_type);
                            return (
                              <tr key={idx}>
                                <td>
                                  {domain.start_coord && domain.stop_coord
                                    ? `${domain.start_coord}-${domain.stop_coord}`
                                    : '-'}
                                </td>
                                <td>
                                  {domain.domain_name ? (
                                    domainUrl ? (
                                      <a href={domainUrl} target="_blank" rel="noopener noreferrer">
                                        {domain.domain_name}
                                      </a>
                                    ) : (
                                      domain.domain_name
                                    )
                                  ) : '-'}
                                </td>
                                <td>{domain.domain_type || '-'}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    !orgData.pbrowse_url && <span className="no-value">No domain information available</span>
                  )}
                </td>
              </tr>

              {/* Sequence Detail Section - show GCG sequence by default */}
              {(orgData.sequence_detail || orgData.protein_info) && (
                <>
                  <tr className="section-with-divider section-grey-bg">
                    <th>Sequence Detail</th>
                    <td>
                      {/* Length */}
                      {(orgData.sequence_detail?.protein_length || orgData.protein_info?.protein_length) && (
                        <span>
                          Length = {orgData.sequence_detail?.protein_length || orgData.protein_info?.protein_length} aa
                        </span>
                      )}
                      {/* Molecular Weight */}
                      {orgData.protein_info?.molecular_weight && (
                        <span>
                          ; MW = {(orgData.protein_info.molecular_weight / 1000).toFixed(1)} kDa
                        </span>
                      )}
                      {/* pI */}
                      {orgData.protein_info?.pi && (
                        <span>; pI = {orgData.protein_info.pi.toFixed(2)}</span>
                      )}
                      {/* Physicochemical Properties link */}
                      {orgData.systematic_name && (
                        <span>
                          {' '}
                          <Link to={`/protein/${orgData.stanford_name || orgData.systematic_name}/properties`}>
                            Physicochemical Properties Page
                          </Link>
                        </span>
                      )}
                    </td>
                  </tr>
                  {orgData.sequence_detail?.protein_sequence_gcg && (
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

              {/* Homologs Section - only show BLAST link */}
              {(orgData.blast_url || orgData.sequence_detail?.protein_sequence_fasta) && (
                <>
                  <tr className="section-with-divider section-grey-bg">
                    <th>Homologs</th>
                    <td></td>
                  </tr>
                  <tr>
                    <th style={{ paddingLeft: '20px', fontWeight: 'normal' }}>BLAST Search</th>
                    <td>
                      <Link
                        to={`/blast?program=blastp&qtype=locus&locus=${encodeURIComponent(orgData.systematic_name || orgData.feature_name || locusName)}&dataset=PROTEIN`}
                      >
                        BLAST {orgData.protein_standard_name || orgData.locus_display_name} against other Candida sequences
                      </Link>
                    </td>
                  </tr>
                </>
              )}

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
                    <Link to={`/locus/${locusName}?tab=literature`}>
                      View Complete Literature Guide for <em>{orgData.protein_standard_name || orgData.locus_display_name}</em>
                    </Link>
                    ]
                  </span>
                )}
              </h3>
              <div className="references-list">
                {orgData.cited_references.map((ref, idx) => (
                  <div key={idx} id={`ref${idx + 1}`} className="reference-item">
                    <span className="reference-number">{idx + 1})</span>
                    {renderCitationItem(ref, { itemClassName: 'reference-citation' })}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Show message if no protein info at all */}
          {!orgData.sequence_detail && !orgData.blast_url && !orgData.external_links?.length && (
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
