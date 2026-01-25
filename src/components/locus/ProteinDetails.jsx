import React from 'react';
import './LocusComponents.css';

function ProteinDetails({ data, loading, error }) {
  if (loading) return <div className="loading">Loading protein data...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!data || !data.results) return <div className="no-data">No protein data available</div>;

  const organisms = Object.entries(data.results);

  if (organisms.length === 0) {
    return <div className="no-data">No protein information found</div>;
  }

  const formatNumber = (num, decimals = 2) => {
    if (num === null || num === undefined) return '-';
    return typeof num === 'number' ? num.toFixed(decimals) : num;
  };

  return (
    <div className="protein-details">
      {organisms.map(([orgName, orgData]) => (
        <div key={orgName} className="organism-section">
          <h3 className="organism-name">{orgName}</h3>
          <p className="locus-display">Locus: {orgData.locus_display_name}</p>

          {orgData.protein_info ? (
            <div className="protein-info">
              <h4>Protein Properties</h4>
              <table className="info-table">
                <tbody>
                  <tr>
                    <th>Length</th>
                    <td>{orgData.protein_info.protein_length} amino acids</td>
                  </tr>
                  <tr>
                    <th>Molecular Weight</th>
                    <td>{formatNumber(orgData.protein_info.molecular_weight)} Da</td>
                  </tr>
                  <tr>
                    <th>Isoelectric Point (pI)</th>
                    <td>{formatNumber(orgData.protein_info.pi)}</td>
                  </tr>
                  <tr>
                    <th>CAI</th>
                    <td>{formatNumber(orgData.protein_info.cai)}</td>
                  </tr>
                  <tr>
                    <th>Codon Bias</th>
                    <td>{formatNumber(orgData.protein_info.codon_bias)}</td>
                  </tr>
                  <tr>
                    <th>FOP Score</th>
                    <td>{formatNumber(orgData.protein_info.fop_score)}</td>
                  </tr>
                  <tr>
                    <th>GRAVY Score</th>
                    <td>{formatNumber(orgData.protein_info.gravy_score)}</td>
                  </tr>
                  <tr>
                    <th>Aromaticity Score</th>
                    <td>{formatNumber(orgData.protein_info.aromaticity_score)}</td>
                  </tr>
                  {orgData.protein_info.n_term_seq && (
                    <tr>
                      <th>N-terminal Sequence</th>
                      <td className="sequence">{orgData.protein_info.n_term_seq}</td>
                    </tr>
                  )}
                  {orgData.protein_info.c_term_seq && (
                    <tr>
                      <th>C-terminal Sequence</th>
                      <td className="sequence">{orgData.protein_info.c_term_seq}</td>
                    </tr>
                  )}
                </tbody>
              </table>

              {orgData.protein_info.amino_acids && Object.keys(orgData.protein_info.amino_acids).length > 0 && (
                <>
                  <h4>Amino Acid Composition</h4>
                  <table className="aa-table">
                    <thead>
                      <tr>
                        <th>AA</th>
                        <th>Count</th>
                        <th>AA</th>
                        <th>Count</th>
                        <th>AA</th>
                        <th>Count</th>
                        <th>AA</th>
                        <th>Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const aas = Object.entries(orgData.protein_info.amino_acids);
                        const rows = [];
                        for (let i = 0; i < aas.length; i += 4) {
                          rows.push(
                            <tr key={i}>
                              {[0, 1, 2, 3].map(j => {
                                const aa = aas[i + j];
                                return aa ? (
                                  <React.Fragment key={j}>
                                    <td>{aa[0].toUpperCase()}</td>
                                    <td>{aa[1]}</td>
                                  </React.Fragment>
                                ) : (
                                  <React.Fragment key={j}>
                                    <td></td>
                                    <td></td>
                                  </React.Fragment>
                                );
                              })}
                            </tr>
                          );
                        }
                        return rows;
                      })()}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          ) : (
            <p className="no-data">No protein information for this organism</p>
          )}
        </div>
      ))}
    </div>
  );
}

export default ProteinDetails;
