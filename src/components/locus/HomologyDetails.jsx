import React, { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import OrganismSelector, { getDefaultOrganism } from './OrganismSelector';
import { API_BASE_URL } from '../../api/config';
import './LocusComponents.css';

// Helper to resolve download URLs that may be relative to the API
const resolveDownloadUrl = (url) => {
  if (!url) return null;
  // If URL starts with /api, prepend the API base URL
  if (url.startsWith('/api')) {
    return `${API_BASE_URL}${url}`;
  }
  return url;
};

// Lazy load heavy visualization components
const PhylogeneticTreeViewer = lazy(() => import('./PhylogeneticTreeViewer'));
const AlignmentViewer = lazy(() => import('./AlignmentViewer'));
const GenomeSyntenyBrowser = lazy(() => import('../synteny/GenomeSyntenyBrowser'));

// Helper to get status color styling
const getStatusStyle = (status) => {
  if (!status) return { color: '#666' };
  const s = status.toUpperCase();
  if (s.includes('VERIFIED')) return { color: '#2e7d32', fontWeight: 'bold' };
  if (s.includes('UNCHARACTERIZED')) return { color: '#757575', fontWeight: 'bold' };
  if (s.includes('DUBIOUS')) return { color: '#c62828', fontWeight: 'bold' };
  return { color: '#666' };
};

function HomologyDetails({ data, loading, error, selectedOrganism, onOrganismChange, locusName }) {
  // State for lazy-loaded alignment viewers
  const [showProteinAlignment, setShowProteinAlignment] = useState(false);
  const [showCodingAlignment, setShowCodingAlignment] = useState(false);

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

  // Reset alignment visibility when organism changes
  useEffect(() => {
    setShowProteinAlignment(false);
    setShowCodingAlignment(false);
  }, [selectedOrganism]);

  if (loading) return <div className="loading">Loading homology data...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!data || !data.results) return <div className="no-data">No homology data available</div>;

  if (organisms.length === 0) {
    return <div className="no-data">No homology information found</div>;
  }

  // Get data for the selected organism
  const orgData = selectedOrganism ? data.results[selectedOrganism] : null;

  return (
    <div className="homology-details locus-summary">
      {/* Organism Selector */}
      <OrganismSelector
        organisms={organisms}
        selectedOrganism={selectedOrganism}
        onOrganismChange={onOrganismChange}
        dataType="homology"
      />

      {/* Display data for selected organism */}
      {selectedOrganism && orgData ? (
        <>
          <table className="info-table">
            <tbody>
              {/* 1. Orthologs in fungal species */}
              {orgData.ortholog_cluster?.orthologs && orgData.ortholog_cluster.orthologs.length > 0 ? (
                <tr className="section-with-divider section-grey-bg">
                  <th style={{ verticalAlign: 'top' }}>Orthologs in fungal species</th>
                  <td>
                    <table className="ortholog-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                          <th style={{ padding: '8px', textAlign: 'left', fontWeight: '600' }}>Sequence ID</th>
                          <th style={{ padding: '8px', textAlign: 'left', fontWeight: '600' }}>Organism</th>
                          <th style={{ padding: '8px', textAlign: 'left', fontWeight: '600' }}>Source</th>
                          <th style={{ padding: '8px', textAlign: 'left', fontWeight: '600' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orgData.ortholog_cluster.orthologs.map((orth, idx) => (
                          <tr
                            key={idx}
                            style={{
                              backgroundColor: orth.is_query ? '#fff3e0' : (idx % 2 === 0 ? '#fff' : '#fafafa'),
                              borderBottom: '1px solid #eee'
                            }}
                          >
                            <td style={{ padding: '8px' }}>
                              {orth.source === 'CGD' ? (
                                <a href={`/locus/${orth.feature_name}`} target="_blank" rel="noopener noreferrer">
                                  {orth.sequence_id}
                                </a>
                              ) : orth.url ? (
                                <a href={orth.url} target="_blank" rel="noopener noreferrer">
                                  {orth.sequence_id}
                                </a>
                              ) : (
                                <span>{orth.sequence_id}</span>
                              )}
                              {orth.is_query && (
                                <span style={{ marginLeft: '8px', fontSize: '11px', color: '#e65100', fontWeight: '500' }}>
                                  (query)
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '8px' }}>
                              <em>{orth.organism_name}</em>
                            </td>
                            <td style={{ padding: '8px' }}>
                              {orth.source}
                            </td>
                            <td style={{ padding: '8px', ...getStatusStyle(orth.status) }}>
                              {orth.status || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </td>
                </tr>
              ) : (
                <tr className="section-with-divider section-grey-bg">
                  <th style={{ verticalAlign: 'top' }}>Orthologs in fungal species</th>
                  <td>
                    <em style={{ color: '#666' }}>No orthologs found</em>
                  </td>
                </tr>
              )}

              {/* 2. Orthologs in model fungi */}
              {/* Filter out A. nidulans entries */}
              {orgData.orthologs_fungal && (() => {
                const filteredEntries = Object.entries(orgData.orthologs_fungal.by_source || {})
                  .filter(([, homologs]) => {
                    const orgName = homologs[0]?.organism_name || '';
                    return !orgName.toLowerCase().includes('nidulans');
                  });
                return filteredEntries.length > 0 ? (
                  <tr className="section-with-divider section-grey-bg">
                    <th style={{ verticalAlign: 'top' }}>Orthologs in model fungi</th>
                    <td>
                      {filteredEntries.map(([source, homologs], srcIdx) => (
                        <span key={source}>
                          {srcIdx > 0 && ' ; '}
                          <em>{homologs[0]?.organism_name || source}</em>
                          {' ('}
                          {homologs.map((h, idx) => (
                            <span key={idx}>
                              {idx > 0 && ', '}
                              {h.url ? (
                                <a href={h.url} target="_blank" rel="noopener noreferrer">
                                  {h.display_name}
                                </a>
                              ) : (
                                <span>{h.display_name}</span>
                              )}
                            </span>
                          ))}
                          {')'}
                        </span>
                      ))}
                    </td>
                  </tr>
                ) : null;
              })()}

              {/* 3. Reciprocal best hits in other species */}
              {orgData.reciprocal_best_hits && Object.keys(orgData.reciprocal_best_hits.by_source || {}).length > 0 && (
                <tr className="section-with-divider section-grey-bg">
                  <th style={{ verticalAlign: 'top' }}>Reciprocal best hits in other species</th>
                  <td>
                    {Object.entries(orgData.reciprocal_best_hits.by_source).map(([source, homologs], srcIdx) => (
                      <span key={source}>
                        {srcIdx > 0 && ' ; '}
                        <em>{homologs[0]?.organism_name || source}</em>
                        {' ('}
                        {homologs.map((h, idx) => (
                          <span key={idx}>
                            {idx > 0 && ', '}
                            {h.url ? (
                              <a href={h.url} target="_blank" rel="noopener noreferrer">
                                {h.display_name}
                              </a>
                            ) : (
                              <span>{h.display_name}</span>
                            )}
                          </span>
                        ))}
                        {')'}
                      </span>
                    ))}
                  </td>
                </tr>
              )}

              {/* 4. Synteny View within CGD */}
              {orgData.ortholog_cluster && locusName && (
                <tr className="section-with-divider">
                  <th style={{ verticalAlign: 'top' }}>Synteny View within CGD</th>
                  <td>
                    <Suspense fallback={<div className="loading">Loading synteny viewer...</div>}>
                      <GenomeSyntenyBrowser
                        geneName={locusName}
                        embedded={true}
                      />
                    </Suspense>
                  </td>
                </tr>
              )}

              {/* 5. Wider fungal synteny */}
              {orgData.ortholog_cluster && (
                <tr className="section-with-divider section-grey-bg">
                  <th style={{ verticalAlign: 'top' }}>Wider fungal synteny</th>
                  <td>
                    <div style={{ marginBottom: '8px' }}>
                      Candida Gene Order Browser
                    </div>
                    {orgData.ortholog_cluster.cluster_url ? (
                      <a
                        href={orgData.ortholog_cluster.cluster_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View CGOB cluster and synteny information
                      </a>
                    ) : (
                      <a href="http://cgob3.ucd.ie/" target="_blank" rel="noopener noreferrer">
                        CGOB
                      </a>
                    )}
                  </td>
                </tr>
              )}

              {/* 6. Download cluster sequence files */}
              {orgData.ortholog_cluster?.download_links && orgData.ortholog_cluster.download_links.length > 0 && (
                <tr className="section-with-divider">
                  <th style={{ verticalAlign: 'top' }}>Download cluster sequence files</th>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {orgData.ortholog_cluster.download_links.map((link, idx) => {
                        const url = resolveDownloadUrl(link.url);
                        return url ? (
                          <a key={idx} href={url} target="_blank" rel="noopener noreferrer">
                            {link.label}
                          </a>
                        ) : null;
                      })}
                    </div>
                  </td>
                </tr>
              )}

              {/* Phylogenetic Tree Section */}
              {orgData.phylogenetic_tree && (
                <>
                  <tr className="section-with-divider section-grey-bg">
                    <th style={{ verticalAlign: 'top' }}>Phylogenetic Tree</th>
                    <td>
                      <div style={{ marginBottom: '8px' }}>
                        Built with{' '}
                        <a href="http://compbio.cs.huji.ac.il/semphy/" target="_blank" rel="noopener noreferrer">
                          SEMPHY
                        </a>
                      </div>
                      {orgData.phylogenetic_tree.tree_length && (
                        <div style={{ marginBottom: '8px', color: '#666', fontSize: '13px' }}>
                          Tree rooted by midpoint; total tree length = {orgData.phylogenetic_tree.tree_length.toFixed(2)} subs/site
                        </div>
                      )}
                    </td>
                  </tr>
                  {/* Tree Visualization */}
                  {orgData.phylogenetic_tree.newick_tree && (
                    <tr>
                      <th style={{ paddingLeft: '20px', fontWeight: 'normal', verticalAlign: 'top' }}>
                        Tree Display
                      </th>
                      <td>
                        <Suspense fallback={<div className="loading">Loading tree viewer...</div>}>
                          <PhylogeneticTreeViewer
                            newickTree={orgData.phylogenetic_tree.newick_tree}
                            leafCount={orgData.phylogenetic_tree.leaf_count}
                            orthologs={orgData.ortholog_cluster?.orthologs}
                          />
                        </Suspense>
                        <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                          {orgData.phylogenetic_tree.leaf_count} leaves
                        </div>
                      </td>
                    </tr>
                  )}
                  {/* Download Links */}
                  {orgData.phylogenetic_tree.download_links && orgData.phylogenetic_tree.download_links.length > 0 && (
                    <tr>
                      <th style={{ paddingLeft: '20px', fontWeight: 'normal', verticalAlign: 'top' }}>
                        Download tree files:
                      </th>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {orgData.phylogenetic_tree.download_links.map((link, idx) => {
                            const url = resolveDownloadUrl(link.url);
                            return url ? (
                              <a key={idx} href={url} target="_blank" rel="noopener noreferrer">
                                {link.label}
                              </a>
                            ) : null;
                          })}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              )}

              {/* Protein Sequence Alignment Section */}
              {orgData.protein_alignment && orgData.protein_alignment.sequences && orgData.protein_alignment.sequences.length > 0 && (
                <tr className="section-with-divider">
                  <th style={{ verticalAlign: 'top' }}>Protein Sequence Alignment</th>
                  <td style={{ padding: '15px 0' }}>
                    {!showProteinAlignment ? (
                      <button
                        onClick={() => setShowProteinAlignment(true)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#1976d2',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        Load Protein Sequence Alignment
                      </button>
                    ) : (
                      <Suspense fallback={<div className="loading">Loading alignment...</div>}>
                        <AlignmentViewer
                          sequences={orgData.protein_alignment.sequences}
                          alignmentType="protein"
                        />
                      </Suspense>
                    )}
                    {/* Download Links */}
                    {orgData.protein_alignment.download_links && orgData.protein_alignment.download_links.length > 0 && (
                      <div style={{ marginTop: '10px', display: 'flex', gap: '15px', fontSize: '13px' }}>
                        <span style={{ color: '#666' }}>Download:</span>
                        {orgData.protein_alignment.download_links.map((link, idx) => {
                          const url = resolveDownloadUrl(link.url);
                          return url ? (
                            <a key={idx} href={url} target="_blank" rel="noopener noreferrer">
                              {link.label}
                            </a>
                          ) : null;
                        })}
                      </div>
                    )}
                  </td>
                </tr>
              )}

              {/* Coding Sequence Alignment Section */}
              {orgData.coding_alignment && orgData.coding_alignment.sequences && orgData.coding_alignment.sequences.length > 0 && (
                <tr className="section-with-divider">
                  <th style={{ verticalAlign: 'top' }}>Coding Sequence Alignment</th>
                  <td style={{ padding: '15px 0' }}>
                    {!showCodingAlignment ? (
                      <button
                        onClick={() => setShowCodingAlignment(true)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#1976d2',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        Load Coding Sequence Alignment
                      </button>
                    ) : (
                      <Suspense fallback={<div className="loading">Loading alignment...</div>}>
                        <AlignmentViewer
                          sequences={orgData.coding_alignment.sequences}
                          alignmentType="coding"
                        />
                      </Suspense>
                    )}
                    {/* Download Links */}
                    {orgData.coding_alignment.download_links && orgData.coding_alignment.download_links.length > 0 && (
                      <div style={{ marginTop: '10px', display: 'flex', gap: '15px', fontSize: '13px' }}>
                        <span style={{ color: '#666' }}>Download:</span>
                        {orgData.coding_alignment.download_links.map((link, idx) => {
                          const url = resolveDownloadUrl(link.url);
                          return url ? (
                            <a key={idx} href={url} target="_blank" rel="noopener noreferrer">
                              {link.label}
                            </a>
                          ) : null;
                        })}
                      </div>
                    )}
                  </td>
                </tr>
              )}

            </tbody>
          </table>
        </>
      ) : (
        <p className="no-data">Select an organism to view homology information</p>
      )}
    </div>
  );
}

export default HomologyDetails;
