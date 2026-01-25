import React from 'react';
import './LocusComponents.css';

function PhenotypeDetails({ data, loading, error }) {
  if (loading) return <div className="loading">Loading phenotype data...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!data || !data.results) return <div className="no-data">No phenotype data available</div>;

  const organisms = Object.entries(data.results);

  if (organisms.length === 0) {
    return <div className="no-data">No phenotype annotations found</div>;
  }

  return (
    <div className="phenotype-details">
      {organisms.map(([orgName, orgData]) => (
        <div key={orgName} className="organism-section">
          <h3 className="organism-name">{orgName}</h3>
          <p className="locus-display">Locus: {orgData.locus_display_name}</p>

          {orgData.annotations && orgData.annotations.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Phenotype</th>
                  <th>Qualifier</th>
                  <th>Experiment Type</th>
                  <th>Strain</th>
                </tr>
              </thead>
              <tbody>
                {orgData.annotations.map((ann, idx) => (
                  <tr key={idx}>
                    <td>{ann.phenotype?.display_name}</td>
                    <td>{ann.qualifier || '-'}</td>
                    <td>{ann.experiment || '-'}</td>
                    <td>{ann.strain || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-data">No phenotype annotations for this organism</p>
          )}
        </div>
      ))}
    </div>
  );
}

export default PhenotypeDetails;
