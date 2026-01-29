import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import OrganismSelector, { getDefaultOrganism } from './OrganismSelector';
import './LocusComponents.css';

function HomologyDetails({ data, loading, error, selectedOrganism, onOrganismChange }) {
  const [collapsedGroups, setCollapsedGroups] = useState({});

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

  const toggleGroup = (key) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Group members by organism for better display
  const groupMembersByOrganism = (members) => {
    const groups = {};
    members.forEach(member => {
      const org = member.organism_name || 'Unknown';
      if (!groups[org]) {
        groups[org] = [];
      }
      groups[org].push(member);
    });
    return groups;
  };

  // Homology type icons and colors
  const homologyTypeInfo = {
    'Ortholog': { icon: '🔀', color: '#1976d2' },
    'Paralog': { icon: '🔄', color: '#7b1fa2' },
    'Best Hit': { icon: '🎯', color: '#388e3c' },
    'Inparanoid': { icon: '🧬', color: '#f57c00' },
  };

  const getTypeInfo = (type) => {
    for (const [key, info] of Object.entries(homologyTypeInfo)) {
      if (type?.toLowerCase().includes(key.toLowerCase())) {
        return info;
      }
    }
    return { icon: '🔗', color: '#616161' };
  };

  // Calculate total homologs for the selected organism
  const totalHomologs = orgData?.homology_groups?.reduce(
    (sum, g) => sum + (g.members?.length || 0), 0
  ) || 0;

  return (
    <div className="homology-details">
      {/* Organism Selector */}
      <OrganismSelector
        organisms={organisms}
        selectedOrganism={selectedOrganism}
        onOrganismChange={onOrganismChange}
        dataType="homology"
      />

      {/* Display data for selected organism */}
      {selectedOrganism && orgData ? (
        <div className="organism-section">
          <h3 className="organism-name">{selectedOrganism}</h3>
          <p className="locus-display">
            Locus: {orgData.locus_display_name}
            {totalHomologs > 0 && (
              <span className="total-count"> ({totalHomologs} homologs in {orgData.homology_groups?.length || 0} groups)</span>
            )}
          </p>

          {orgData.homology_groups && orgData.homology_groups.length > 0 ? (
            <div className="homology-groups-container">
              {orgData.homology_groups.map((group, gIdx) => {
                const groupKey = `${selectedOrganism}-${gIdx}`;
                const isCollapsed = collapsedGroups[groupKey];
                const typeInfo = getTypeInfo(group.homology_group_type);
                const membersByOrg = groupMembersByOrganism(group.members || []);

                return (
                  <div
                    key={gIdx}
                    className="homology-group-card"
                    style={{ borderLeftColor: typeInfo.color }}
                  >
                    <div
                      className="homology-group-header"
                      onClick={() => toggleGroup(groupKey)}
                    >
                      <div className="group-title">
                        <span className="collapse-icon">{isCollapsed ? '▶' : '▼'}</span>
                        <span className="group-icon">{typeInfo.icon}</span>
                        <span className="group-type">{group.homology_group_type}</span>
                        <span className="count-badge">{group.members?.length || 0}</span>
                      </div>
                      {group.method && (
                        <span className="group-method">Method: {group.method}</span>
                      )}
                    </div>

                    {!isCollapsed && group.members && group.members.length > 0 && (
                      <div className="homology-members">
                        {Object.entries(membersByOrg).map(([memberOrg, members]) => (
                          <div key={memberOrg} className="organism-members-group">
                            <div className="member-organism-header">
                              <em>{memberOrg}</em>
                              <span className="count-badge small">{members.length}</span>
                            </div>
                            <div className="member-list">
                              {members.map((member, mIdx) => (
                                <div key={mIdx} className="member-item">
                                  <div className="member-name">
                                    {member.organism_name === 'External' ? (
                                      <span className="external-member">
                                        {member.gene_name || member.feature_name}
                                      </span>
                                    ) : (
                                      <Link
                                        to={`/locus/${member.feature_name}`}
                                        className="member-link"
                                      >
                                        {member.gene_name || member.feature_name}
                                      </Link>
                                    )}
                                  </div>
                                  {member.dbxref_id && (
                                    <div className="member-id">
                                      <code>{member.dbxref_id}</code>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="no-data">No homology groups for this organism</p>
          )}
        </div>
      ) : (
        <p className="no-data">Select an organism to view homology information</p>
      )}
    </div>
  );
}

export default HomologyDetails;
