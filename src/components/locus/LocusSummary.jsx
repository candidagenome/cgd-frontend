import React from 'react';
import './LocusComponents.css';

function LocusSummary({ data, organismName }) {
  if (!data) return null;

  const feature = data;

  // Group aliases by type (like Perl does: Uniform, Non-uniform, Protein name, etc.)
  // Exclude 'Other strain feature name' as it's displayed separately
  const groupAliasesByType = (aliases) => {
    if (!aliases || aliases.length === 0) return {};

    const groups = {};
    aliases.forEach(alias => {
      const type = alias.alias_type || 'Other';
      // Skip 'Other strain feature name' - displayed in separate row
      if (type === 'Other strain feature name') return;
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
  const hasNonRetiredAliases = Object.keys(aliasGroups).filter(type => type !== 'Retired name').length > 0;

  // Group external links by source and substitute ORF name in URLs
  const groupLinksBySource = (links, featureName) => {
    if (!links || links.length === 0) return {};

    const groups = {};
    links.forEach(link => {
      const source = link.source || 'Other';
      if (!groups[source]) {
        groups[source] = [];
      }
      // Replace _SUBSTITUTE_THIS_ placeholder with the ORF name (feature_name)
      const processedLink = {
        ...link,
        url: link.url ? link.url.replace(/_SUBSTITUTE_THIS_/g, featureName || '') : link.url
      };
      groups[source].push(processedLink);
    });

    return groups;
  };

  const linkGroups = groupLinksBySource(feature.external_links, feature.feature_name);

  return (
    <div className="locus-summary">
      <table className="info-table">
        <tbody>
          {/* Standard Name */}
          <tr>
            <th>Standard Name</th>
            <td>
              {feature.gene_name ? (
                <span>{feature.gene_name}</span>
              ) : (
                <span className="no-value">-</span>
              )}
            </td>
          </tr>

          {/* Systematic Name */}
          <tr>
            <th>Systematic Name</th>
            <td>{feature.feature_name}</td>
          </tr>

          {/* Assembly 19/21 Identifier - shown if different from Systematic Name */}
          {feature.assembly_21_identifier && (
            <tr>
              <th>Assembly 19/21 Identifier</th>
              <td>{feature.assembly_21_identifier}</td>
            </tr>
          )}

          {/* Aliases - grouped by type (excluding Retired name and Other strain feature name) */}
          {hasNonRetiredAliases && (
            <tr>
              <th>Alias</th>
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

          {/* Feature Type with qualifier */}
          <tr>
            <th>Feature Type</th>
            <td>
              <span className="feature-type-badge">{feature.feature_type}</span>
              {feature.feature_qualifier && (
                <span className="feature-qualifier">, {feature.feature_qualifier}</span>
              )}
            </td>
          </tr>

          {/* Allele - shown if alleles exist */}
          {feature.alleles && feature.alleles.length > 0 && (
            <tr>
              <th>Allele</th>
              <td>
                {feature.alleles.map((allele, idx) => (
                  <span key={allele.feature_no}>
                    <a href={`/locus/${allele.feature_name}`}>
                      {allele.gene_name || allele.feature_name}
                    </a>
                    {idx < feature.alleles.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </td>
            </tr>
          )}

          {/* Allelic Variation - shown if data exists */}
          {feature.allelic_variation && (
            <tr>
              <th>Allelic Variation</th>
              <td>{feature.allelic_variation}</td>
            </tr>
          )}

          {/* CUG Codons - shown if data exists */}
          {feature.cug_codons !== null && feature.cug_codons !== undefined && (
            <tr>
              <th>CUG Codons</th>
              <td>{feature.cug_codons}</td>
            </tr>
          )}

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

          {/* Systematic Names Used in Other Strains */}
          {feature.other_strain_names && feature.other_strain_names.length > 0 && (
            <tr>
              <th>Systematic Names Used in Other Strains</th>
              <td>
                {feature.other_strain_names.map((item, idx) => (
                  <span key={idx}>
                    {typeof item === 'string' ? (
                      <span>{item}</span>
                    ) : (
                      <>
                        <span>{item.alias_name}</span>
                        {item.strain_name && <span> (<em>{item.strain_name}</em>)</span>}
                      </>
                    )}
                    {idx < feature.other_strain_names.length - 1 ? ' ; ' : ''}
                  </span>
                ))}
              </td>
            </tr>
          )}

          {/* Orthologous genes in Candida species */}
          {feature.candida_orthologs && feature.candida_orthologs.length > 0 && (
            <tr>
              <th>Orthologous genes in Candida species</th>
              <td>
                <div className="ortholog-list">
                  {feature.candida_orthologs.map((orth, idx) => (
                    <div key={idx} className="ortholog-item">
                      <a href={`/locus/${orth.feature_name}`}>
                        {orth.gene_name || orth.feature_name}
                      </a>
                      <span className="organism-name"> (<em>{orth.organism_name}</em>)</span>
                    </div>
                  ))}
                </div>
                {feature.ortholog_cluster_url && (
                  <div style={{marginTop: '8px'}}>
                    <a href={feature.ortholog_cluster_url} target="_blank" rel="noopener noreferrer">
                      View ortholog cluster
                    </a>
                  </div>
                )}
              </td>
            </tr>
          )}

          {/* Ortholog(s) in non-CGD species - inline format with species names */}
          {feature.external_orthologs && feature.external_orthologs.length > 0 && (
            <tr>
              <th>Ortholog(s) in non-CGD species</th>
              <td>
                {feature.external_orthologs.map((orth, idx) => (
                  <span key={idx}>
                    <em>{orth.species_name || orth.source}</em>
                    {' ('}
                    {orth.url ? (
                      <a href={orth.url} target="_blank" rel="noopener noreferrer">
                        {orth.description || orth.dbxref_id}
                      </a>
                    ) : (
                      <span>{orth.description || orth.dbxref_id}</span>
                    )}
                    {')'}
                    {idx < feature.external_orthologs.length - 1 ? ' ; ' : ''}
                  </span>
                ))}
              </td>
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
            <td>{feature.dbxref_id}</td>
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
