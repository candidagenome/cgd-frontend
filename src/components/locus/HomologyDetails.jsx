import React from 'react';
import { Link } from 'react-router-dom';
import './LocusComponents.css';

function HomologyDetails({ data, loading, error }) {
  if (loading) return <div className="loading">Loading homology data...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!data || !data.results) return <div className="no-data">No homology data available</div>;

  const organisms = Object.entries(data.results);

  if (organisms.length === 0) {
    return <div className="no-data">No homology information found</div>;
  }

  return (
    <div className="homology-details">
      {organisms.map(([orgName, orgData]) => (
        <div key={orgName} className="organism-section">
          <h3 className="organism-name">{orgName}</h3>
          <p className="locus-display">Locus: {orgData.locus_display_name}</p>

          {orgData.homology_groups && orgData.homology_groups.length > 0 ? (
            orgData.homology_groups.map((group, gIdx) => (
              <div key={gIdx} className="homology-group">
                <h4>
                  {group.homology_group_type}
                  {group.method && <span className="method"> (Method: {group.method})</span>}
                </h4>

                {group.members && group.members.length > 0 ? (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Gene/Feature</th>
                        <th>Organism</th>
                        <th>ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.members.map((member, mIdx) => (
                        <tr key={mIdx}>
                          <td>
                            {member.organism_name === 'External' ? (
                              <span>{member.gene_name || member.feature_name}</span>
                            ) : (
                              <Link to={`/locus/${member.feature_name}`}>
                                {member.gene_name || member.feature_name}
                              </Link>
                            )}
                          </td>
                          <td>{member.organism_name}</td>
                          <td>{member.dbxref_id}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="no-data">No members in this group</p>
                )}
              </div>
            ))
          ) : (
            <p className="no-data">No homology groups for this organism</p>
          )}
        </div>
      ))}
    </div>
  );
}

export default HomologyDetails;
