import React, { useState, useEffect, useMemo } from 'react';
import OrganismSelector, { getDefaultOrganism } from './OrganismSelector';
import './LocusComponents.css';

function SequenceDetails({ data, loading, error, selectedOrganism, onOrganismChange }) {
  const [expandedSequences, setExpandedSequences] = useState({});
  const [showArchivedLocations, setShowArchivedLocations] = useState(false);

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

  // Expand all sequences by default when data loads
  useEffect(() => {
    if (selectedOrganism && data?.results?.[selectedOrganism]?.sequences) {
      const sequences = data.results[selectedOrganism].sequences;
      const sequenceGroups = {};
      sequences.forEach(seq => {
        const type = seq.seq_type || 'Other';
        if (!sequenceGroups[type]) {
          sequenceGroups[type] = [];
        }
        sequenceGroups[type].push(seq);
      });

      // Set all sequences as expanded by default
      const expandedByDefault = {};
      Object.entries(sequenceGroups).forEach(([seqType, seqs]) => {
        seqs.forEach((seq, idx) => {
          if (seq.residues) {
            const seqKey = `${selectedOrganism}-${seqType}-${idx}`;
            expandedByDefault[seqKey] = true;
          }
        });
      });
      setExpandedSequences(expandedByDefault);
    }
  }, [selectedOrganism, data]);

  if (loading) return <div className="loading">Loading sequence data...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!data || !data.results) return <div className="no-data">No sequence data available</div>;

  if (organisms.length === 0) {
    return <div className="no-data">No sequence information found</div>;
  }

  // Get data for the selected organism
  const orgData = selectedOrganism ? data.results[selectedOrganism] : null;

  const formatStrand = (strand) => {
    if (strand === 'W') return 'Watson (+)';
    if (strand === 'C') return 'Crick (-)';
    if (strand === '+') return 'Forward (+)';
    if (strand === '-') return 'Reverse (-)';
    return strand;
  };

  const formatCoordinates = (start, stop) => {
    if (!start || !stop) return '-';
    const length = Math.abs(stop - start) + 1;
    return `${start.toLocaleString()} - ${stop.toLocaleString()} (${length.toLocaleString()} bp)`;
  };

  const toggleSequence = (key) => {
    setExpandedSequences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Group sequences by type
  const groupSequencesByType = (sequences) => {
    const groups = {};
    sequences.forEach(seq => {
      const type = seq.seq_type || 'Other';
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(seq);
    });
    return groups;
  };

  // Get locations and sequences for selected organism
  const currentLocations = orgData?.locations?.filter(l => l.is_current) || [];
  const archivedLocations = orgData?.locations?.filter(l => !l.is_current) || [];
  const sequenceGroups = orgData ? groupSequencesByType(orgData.sequences || []) : {};

  return (
    <div className="sequence-details">
      {/* Organism Selector */}
      <OrganismSelector
        organisms={organisms}
        selectedOrganism={selectedOrganism}
        onOrganismChange={onOrganismChange}
        dataType="sequence"
      />

      {/* Display data for selected organism */}
      {selectedOrganism && orgData ? (
        <div className="organism-section">
          <h3 className="organism-name">{selectedOrganism}</h3>
          <p className="locus-display">Locus: {orgData.locus_display_name}</p>

          {/* Current Chromosomal Location - Highlighted */}
          {currentLocations.length > 0 && (
            <div className="location-highlight">
              <h4>Chromosomal Location</h4>
              {currentLocations.map((loc, idx) => (
                <div key={idx} className="current-location-card">
                  <div className="location-main">
                    <span className="chromosome-name">
                      {loc.chromosome || 'Unknown Chromosome'}
                    </span>
                    <span className="location-coords">
                      {formatCoordinates(loc.start_coord, loc.stop_coord)}
                    </span>
                  </div>
                  <div className="location-details">
                    <span className="strand-info">
                      Strand: <strong>{formatStrand(loc.strand)}</strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Archived Locations - Collapsible */}
          {archivedLocations.length > 0 && (
            <div className="archived-locations">
              <div
                className="archived-header"
                onClick={() => setShowArchivedLocations(!showArchivedLocations)}
              >
                <span className="collapse-icon">{showArchivedLocations ? '▼' : '▶'}</span>
                <span>Archived Locations</span>
                <span className="count-badge">{archivedLocations.length}</span>
              </div>
              {showArchivedLocations && (
                <table className="data-table archived-table">
                  <thead>
                    <tr>
                      <th>Chromosome</th>
                      <th>Coordinates</th>
                      <th>Strand</th>
                    </tr>
                  </thead>
                  <tbody>
                    {archivedLocations.map((loc, idx) => (
                      <tr key={idx}>
                        <td>{loc.chromosome || '-'}</td>
                        <td>{formatCoordinates(loc.start_coord, loc.stop_coord)}</td>
                        <td>{formatStrand(loc.strand)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Sequences - Grouped by Type */}
          {Object.keys(sequenceGroups).length > 0 && (
            <div className="sequences-section">
              <h4>Sequences</h4>
              {Object.entries(sequenceGroups).map(([seqType, sequences]) => (
                <div key={seqType} className="sequence-type-group">
                  <h5 className="sequence-type-header">
                    {seqType}
                    <span className="count-badge">{sequences.length}</span>
                  </h5>

                  {sequences.map((seq, idx) => {
                    const seqKey = `${selectedOrganism}-${seqType}-${idx}`;
                    const isExpanded = expandedSequences[seqKey];

                    return (
                      <div
                        key={idx}
                        className={`sequence-block ${seq.is_current ? 'current' : 'archived'}`}
                      >
                        <div
                          className="sequence-header"
                          onClick={() => seq.residues && toggleSequence(seqKey)}
                          style={{ cursor: seq.residues ? 'pointer' : 'default' }}
                        >
                          <div className="seq-info-left">
                            {seq.residues && (
                              <span className="collapse-icon">{isExpanded ? '▼' : '▶'}</span>
                            )}
                            <span className="seq-type">{seq.seq_type}</span>
                            {seq.is_current && <span className="current-badge">Current</span>}
                          </div>
                          <div className="seq-info-right">
                            <span className="seq-stat">
                              <strong>{seq.seq_length?.toLocaleString()}</strong>
                              {seq.seq_type === 'Protein' ? ' aa' : ' bp'}
                            </span>
                            <span className="seq-meta">
                              Source: {seq.source}
                            </span>
                            <span className="seq-meta">
                              Version: {new Date(seq.seq_version).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {isExpanded && seq.residues && (
                          <div className="sequence-content">
                            <div className="sequence-toolbar">
                              <button
                                className="copy-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(seq.residues);
                                }}
                              >
                                Copy Sequence
                              </button>
                              <span className="sequence-length-info">
                                Showing {seq.residues.length.toLocaleString()} characters
                                {seq.residues.endsWith('...') && ' (truncated)'}
                              </span>
                            </div>
                            <pre className="sequence-text">{seq.residues}</pre>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}

          {(!orgData.locations || orgData.locations.length === 0) &&
           (!orgData.sequences || orgData.sequences.length === 0) && (
            <p className="no-data">No sequence information for this organism</p>
          )}
        </div>
      ) : (
        <p className="no-data">Select an organism to view sequence information</p>
      )}
    </div>
  );
}

export default SequenceDetails;
