import React from 'react';
import './LocusComponents.css';

function LocusSummary({ data, organismName }) {
  if (!data) return null;

  const feature = data;

  return (
    <div className="locus-summary">
      <table className="info-table">
        <tbody>
          <tr>
            <th>Standard Name</th>
            <td>{feature.gene_name || '-'}</td>
          </tr>
          <tr>
            <th>Systematic Name</th>
            <td>{feature.feature_name}</td>
          </tr>
          <tr>
            <th>Feature Type</th>
            <td>{feature.feature_type}</td>
          </tr>
          <tr>
            <th>Description</th>
            <td>{feature.headline || '-'}</td>
          </tr>
          <tr>
            <th>Name Description</th>
            <td>{feature.name_description || '-'}</td>
          </tr>
          <tr>
            <th>Organism</th>
            <td>{organismName} (Taxon ID: {feature.taxon_id})</td>
          </tr>
          <tr>
            <th>CGDID</th>
            <td>{feature.dbxref_id}</td>
          </tr>
          <tr>
            <th>Source</th>
            <td>{feature.source}</td>
          </tr>

          {feature.aliases && feature.aliases.length > 0 && (
            <tr>
              <th>Aliases</th>
              <td>
                <ul className="alias-list">
                  {feature.aliases.map((alias, idx) => (
                    <li key={idx}>
                      {alias.alias_name} <span className="alias-type">({alias.alias_type})</span>
                    </li>
                  ))}
                </ul>
              </td>
            </tr>
          )}

          {feature.external_links && feature.external_links.length > 0 && (
            <tr>
              <th>External Links</th>
              <td>
                <ul className="link-list">
                  {feature.external_links.map((link, idx) => (
                    <li key={idx}>
                      <a href={link.url} target="_blank" rel="noopener noreferrer">
                        {link.source} - {link.url_type}
                      </a>
                    </li>
                  ))}
                </ul>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default LocusSummary;
