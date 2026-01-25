import React from 'react';
import './LocusComponents.css';

function SequenceDetails({ data, loading, error }) {
  if (loading) return <div className="loading">Loading sequence data...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!data || !data.results) return <div className="no-data">No sequence data available</div>;

  const organisms = Object.entries(data.results);

  if (organisms.length === 0) {
    return <div className="no-data">No sequence information found</div>;
  }

  const formatStrand = (strand) => {
    if (strand === 'W') return 'Watson (+)';
    if (strand === 'C') return 'Crick (-)';
    return strand;
  };

  return (
    <div className="sequence-details">
      {organisms.map(([orgName, orgData]) => (
        <div key={orgName} className="organism-section">
          <h3 className="organism-name">{orgName}</h3>
          <p className="locus-display">Locus: {orgData.locus_display_name}</p>

          {/* Locations */}
          {orgData.locations && orgData.locations.length > 0 && (
            <div className="locations-section">
              <h4>Chromosomal Location</h4>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Chromosome</th>
                    <th>Start</th>
                    <th>Stop</th>
                    <th>Strand</th>
                    <th>Current</th>
                  </tr>
                </thead>
                <tbody>
                  {orgData.locations.map((loc, idx) => (
                    <tr key={idx} className={loc.is_current ? 'current' : 'archived'}>
                      <td>{loc.chromosome || '-'}</td>
                      <td>{loc.start_coord?.toLocaleString()}</td>
                      <td>{loc.stop_coord?.toLocaleString()}</td>
                      <td>{formatStrand(loc.strand)}</td>
                      <td>{loc.is_current ? 'Yes' : 'No'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Sequences */}
          {orgData.sequences && orgData.sequences.length > 0 && (
            <div className="sequences-section">
              <h4>Sequences</h4>
              {orgData.sequences.map((seq, idx) => (
                <div key={idx} className={`sequence-block ${seq.is_current ? 'current' : 'archived'}`}>
                  <div className="sequence-header">
                    <span className="seq-type">{seq.seq_type}</span>
                    <span className="seq-meta">
                      Length: {seq.seq_length?.toLocaleString()} |
                      Source: {seq.source} |
                      Version: {new Date(seq.seq_version).toLocaleDateString()}
                      {seq.is_current && <span className="current-badge">Current</span>}
                    </span>
                  </div>
                  {seq.residues && (
                    <div className="sequence-content">
                      <pre className="sequence-text">{seq.residues}</pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {(!orgData.locations || orgData.locations.length === 0) &&
           (!orgData.sequences || orgData.sequences.length === 0) && (
            <p className="no-data">No sequence information for this organism</p>
          )}
        </div>
      ))}
    </div>
  );
}

export default SequenceDetails;
