import React from 'react';
import './LocusComponents.css';

function GoDetails({ data, loading, error }) {
  if (loading) return <div className="loading">Loading GO annotations...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!data || !data.results) return <div className="no-data">No GO annotation data available</div>;

  const organisms = Object.entries(data.results);

  if (organisms.length === 0) {
    return <div className="no-data">No GO annotations found</div>;
  }

  // Group annotations by aspect
  const groupByAspect = (annotations) => {
    const groups = {
      'molecular_function': [],
      'biological_process': [],
      'cellular_component': [],
    };

    annotations.forEach(ann => {
      const aspect = ann.term?.aspect?.toLowerCase().replace(' ', '_') || 'unknown';
      if (groups[aspect]) {
        groups[aspect].push(ann);
      }
    });

    return groups;
  };

  const aspectLabels = {
    'molecular_function': 'Molecular Function',
    'biological_process': 'Biological Process',
    'cellular_component': 'Cellular Component',
  };

  return (
    <div className="go-details">
      {organisms.map(([orgName, orgData]) => (
        <div key={orgName} className="organism-section">
          <h3 className="organism-name">{orgName}</h3>
          <p className="locus-display">Locus: {orgData.locus_display_name}</p>

          {orgData.annotations && orgData.annotations.length > 0 ? (
            Object.entries(groupByAspect(orgData.annotations)).map(([aspect, annotations]) => (
              annotations.length > 0 && (
                <div key={aspect} className="aspect-section">
                  <h4>{aspectLabels[aspect] || aspect}</h4>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>GO Term</th>
                        <th>GO ID</th>
                        <th>Evidence</th>
                        <th>References</th>
                      </tr>
                    </thead>
                    <tbody>
                      {annotations.map((ann, idx) => (
                        <tr key={idx}>
                          <td>{ann.term?.display_name}</td>
                          <td>
                            <a
                              href={`https://amigo.geneontology.org/amigo/term/${ann.term?.goid}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {ann.term?.goid}
                            </a>
                          </td>
                          <td>{ann.evidence?.code}</td>
                          <td>
                            {ann.references?.map((ref, refIdx) => (
                              <span key={refIdx}>
                                {ref.startsWith('PMID:') ? (
                                  <a
                                    href={`https://pubmed.ncbi.nlm.nih.gov/${ref.replace('PMID:', '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    {ref}
                                  </a>
                                ) : (
                                  ref
                                )}
                                {refIdx < ann.references.length - 1 ? ', ' : ''}
                              </span>
                            ))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ))
          ) : (
            <p className="no-data">No GO annotations for this organism</p>
          )}
        </div>
      ))}
    </div>
  );
}

export default GoDetails;
