import React, { useEffect, useMemo } from 'react';
import OrganismSelector, { getDefaultOrganism } from './OrganismSelector';
import AlphaFoldViewer from './AlphaFoldViewer';
import { formatCitationString, CitationLinksBelow, buildCitationLinks } from '../../utils/formatCitation.jsx';
import './LocusComponents.css';

function ProteinDetails({ data, loading, error, selectedOrganism, onOrganismChange }) {
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
                    orgData.protein_standard_name_with_refs ? (
                      <strong dangerouslySetInnerHTML={{ __html: orgData.protein_standard_name_with_refs }} />
                    ) : (
                      <strong>{orgData.protein_standard_name}</strong>
                    )
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

              {/* Allele Names (protein format, e.g., C1_13700wp_b) */}
              {orgData.allele_names && orgData.allele_names.length > 0 && (
                <tr>
                  <th>Allele Name{orgData.allele_names.length > 1 ? 's' : ''}</th>
                  <td>
                    {orgData.allele_names.map((allele, idx) => (
                      <span key={idx}>
                        {allele.allele_name_with_refs ? (
                          <span dangerouslySetInnerHTML={{ __html: allele.allele_name_with_refs }} />
                        ) : (
                          <span>{allele.protein_allele_name || allele.allele_name}</span>
                        )}
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
                  <AlphaFoldViewer
                    key={orgData.alphafold_info?.uniprot_id || selectedOrganism}
                    uniprotId={orgData.alphafold_info?.uniprot_id}
                  />
                </td>
              </tr>

              {/* Conserved Domains Section - always show when protein data exists */}
              <tr className="section-with-divider section-grey-bg">
                <th>Conserved Domains</th>
                <td>
                  {orgData.pbrowse_url ? (
                    <a
                      href={orgData.pbrowse_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Domains in JBrowse
                    </a>
                  ) : (
                    <span className="no-value">No domain information available</span>
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
                          <a
                            href={`/cgi-bin/protein/proteinProperty.pl?dbid=${orgData.stanford_name || orgData.systematic_name}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Physicochemical Properties Page
                          </a>
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
              {orgData.blast_url && (
                <>
                  <tr className="section-with-divider section-grey-bg">
                    <th>Homologs</th>
                    <td></td>
                  </tr>
                  <tr>
                    <th style={{ paddingLeft: '20px', fontWeight: 'normal' }}>BLAST Search</th>
                    <td>
                      <a href={orgData.blast_url} target="_blank" rel="noopener noreferrer">
                        BLAST {orgData.protein_standard_name || orgData.locus_display_name} against other Candida sequences
                      </a>
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
		      {formatCitationString(ref.citation, ref.journal_name || ref.journal)}
		      {ref?.pubmed ? <span className="citation-pmid"> PMID: {ref.pubmed}</span> : null}	
                      {ref.links && ref.links.length > 0 && (
                        <CitationLinksBelow links={ref.links && ref.links.length ? ref.links : buildCitationLinks(ref)} />
                      )}
                    </span>
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
