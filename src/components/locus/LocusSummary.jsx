import React from 'react';
import './LocusComponents.css';

function LocusSummary({ data, organismName }) {
  if (!data) return null;

  const feature = data;

  // Group aliases by type (like Perl does: Uniform, Non-uniform, Protein name, etc.)
  const groupAliasesByType = (aliases) => {
    if (!aliases || aliases.length === 0) return {};

    const groups = {};
    aliases.forEach(alias => {
      const type = alias.alias_type || 'Other';
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(alias.alias_name);
    });

    // Sort alias types in a logical order
    const typeOrder = ['Uniform', 'Non-uniform', 'Protein name', 'NCBI protein name', 'Retired name'];
    const sortedGroups = {};

    typeOrder.forEach(type => {
      if (groups[type]) {
        sortedGroups[type] = groups[type];
      }
    });

    // Add any remaining types
    Object.keys(groups).forEach(type => {
      if (!sortedGroups[type]) {
        sortedGroups[type] = groups[type];
      }
    });

    return sortedGroups;
  };

  const aliasGroups = groupAliasesByType(feature.aliases);
  const hasRetiredNames = aliasGroups['Retired name'] && aliasGroups['Retired name'].length > 0;

  // Group external links by source
  const groupLinksBySource = (links) => {
    if (!links || links.length === 0) return {};

    const groups = {};
    links.forEach(link => {
      const source = link.source || 'Other';
      if (!groups[source]) {
        groups[source] = [];
      }
      groups[source].push(link);
    });

    return groups;
  };

  const linkGroups = groupLinksBySource(feature.external_links);

  return (
    <div className="locus-summary">
      <table className="info-table">
        <tbody>
          {/* Standard Name - highlighted if exists */}
          <tr>
            <th>Standard Name</th>
            <td>
              {feature.gene_name ? (
                <strong className="gene-name">{feature.gene_name}</strong>
              ) : (
                <span className="no-value">-</span>
              )}
            </td>
          </tr>

          {/* Systematic Name */}
          <tr>
            <th>Systematic Name</th>
            <td><code className="systematic-name">{feature.feature_name}</code></td>
          </tr>

          {/* Feature Type with badge styling */}
          <tr>
            <th>Feature Type</th>
            <td>
              <span className="feature-type-badge">{feature.feature_type}</span>
            </td>
          </tr>

          {/* Description/Headline */}
          <tr>
            <th>Description</th>
            <td>{feature.headline || <span className="no-value">No description available</span>}</td>
          </tr>

          {/* Name Description (what the gene name stands for) */}
          {feature.name_description && (
            <tr>
              <th>Name Description</th>
              <td><em>{feature.name_description}</em></td>
            </tr>
          )}

          {/* Organism */}
          <tr>
            <th>Organism</th>
            <td>
              <em>{organismName}</em>
              {feature.taxon_id && (
                <span className="taxon-id"> (Taxon ID: {feature.taxon_id})</span>
              )}
            </td>
          </tr>

          {/* Primary DBID */}
          <tr>
            <th>Primary CGDID</th>
            <td>
              <code className="dbxref-id">{feature.dbxref_id}</code>
            </td>
          </tr>

          {/* Source */}
          <tr>
            <th>Source</th>
            <td>{feature.source}</td>
          </tr>

          {/* Date Created */}
          {feature.date_created && (
            <tr>
              <th>Date Created</th>
              <td>{new Date(feature.date_created).toLocaleDateString()}</td>
            </tr>
          )}

          {/* Aliases - grouped by type */}
          {Object.keys(aliasGroups).filter(type => type !== 'Retired name').length > 0 && (
            <tr>
              <th>Aliases</th>
              <td>
                <div className="alias-groups">
                  {Object.entries(aliasGroups)
                    .filter(([type]) => type !== 'Retired name')
                    .map(([type, names]) => (
                      <div key={type} className="alias-group">
                        <span className="alias-type-label">{type}:</span>
                        <span className="alias-names">{names.join(', ')}</span>
                      </div>
                    ))}
                </div>
              </td>
            </tr>
          )}

          {/* Retired Names - shown separately with different styling */}
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

          {/* External Links - grouped by source */}
          {Object.keys(linkGroups).length > 0 && (
            <tr>
              <th>External Links</th>
              <td>
                <div className="external-link-groups">
                  {Object.entries(linkGroups).map(([source, links]) => (
                    <div key={source} className="link-group">
                      <span className="link-source-label">{source}:</span>
                      <span className="link-items">
                        {links.map((link, idx) => (
                          <span key={idx}>
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={link.url_type}
                            >
                              {link.url_type}
                            </a>
                            {idx < links.length - 1 ? ', ' : ''}
                          </span>
                        ))}
                      </span>
                    </div>
                  ))}
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default LocusSummary;
