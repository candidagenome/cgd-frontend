import React, { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import OrganismSelector, { getDefaultOrganism } from './OrganismSelector';
import './LocusComponents.css';

function HomologyDetails({ data, loading, error, selectedOrganism, onOrganismChange }) {
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
              {/* Ortholog Cluster Section */}
              <tr className="section-with-divider section-grey-bg">
                <th>Ortholog Cluster</th>
                <td>
                  <strong>From CGOB</strong>
                </td>
              </tr>

              {/* Download Links */}
              {orgData.ortholog_cluster?.download_links && orgData.ortholog_cluster.download_links.length > 0 && (
                <tr>
                  <th style={{ paddingLeft: '20px', fontWeight: 'normal', verticalAlign: 'top' }}>
                    Download cluster sequence files:
                  </th>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {orgData.ortholog_cluster.download_links.map((link, idx) => (
                        <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer">
                          {link.label}
                        </a>
                      ))}
                    </div>
                  </td>
                </tr>
              )}

              {/* Orthologs Table */}
              {orgData.ortholog_cluster?.orthologs && orgData.ortholog_cluster.orthologs.length > 0 && (
                <tr>
                  <th style={{ paddingLeft: '20px', fontWeight: 'normal', verticalAlign: 'top' }}>
                    Orthologs
                  </th>
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
                                <Link to={`/locus/${orth.feature_name}`}>
                                  {orth.sequence_id}
                                </Link>
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
                            <td style={{ padding: '8px' }}>
                              {orth.status || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </td>
                </tr>
              )}

              {/* Show message if no orthologs */}
              {(!orgData.ortholog_cluster?.orthologs || orgData.ortholog_cluster.orthologs.length === 0) && (
                <tr>
                  <th style={{ paddingLeft: '20px', fontWeight: 'normal' }}>Orthologs</th>
                  <td>
                    <em style={{ color: '#666' }}>No orthologs found in CGOB cluster</em>
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
