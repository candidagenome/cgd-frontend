import React, { useState, useEffect, useMemo } from 'react';
import OrganismSelector, { getDefaultOrganism } from './OrganismSelector';
import './LocusComponents.css';

function ProteinDetails({ data, loading, error, selectedOrganism, onOrganismChange }) {
  const [showAllAA, setShowAllAA] = useState(false);

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

  if (loading) return <div className="loading">Loading protein data...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!data || !data.results) return <div className="no-data">No protein data available</div>;

  if (organisms.length === 0) {
    return <div className="no-data">No protein information found</div>;
  }

  // Get data for the selected organism
  const orgData = selectedOrganism ? data.results[selectedOrganism] : null;

  const formatNumber = (num, decimals = 2) => {
    if (num === null || num === undefined) return '-';
    return typeof num === 'number' ? num.toFixed(decimals) : num;
  };

  const formatMW = (mw) => {
    if (mw === null || mw === undefined) return '-';
    if (mw >= 1000) {
      return `${(mw / 1000).toFixed(2)} kDa`;
    }
    return `${mw} Da`;
  };

  // Amino acid full names and properties
  const aaInfo = {
    ala: { code: 'A', name: 'Alanine', type: 'nonpolar' },
    arg: { code: 'R', name: 'Arginine', type: 'positive' },
    asn: { code: 'N', name: 'Asparagine', type: 'polar' },
    asp: { code: 'D', name: 'Aspartic acid', type: 'negative' },
    cys: { code: 'C', name: 'Cysteine', type: 'polar' },
    gln: { code: 'Q', name: 'Glutamine', type: 'polar' },
    glu: { code: 'E', name: 'Glutamic acid', type: 'negative' },
    gly: { code: 'G', name: 'Glycine', type: 'nonpolar' },
    his: { code: 'H', name: 'Histidine', type: 'positive' },
    ile: { code: 'I', name: 'Isoleucine', type: 'nonpolar' },
    leu: { code: 'L', name: 'Leucine', type: 'nonpolar' },
    lys: { code: 'K', name: 'Lysine', type: 'positive' },
    met: { code: 'M', name: 'Methionine', type: 'nonpolar' },
    phe: { code: 'F', name: 'Phenylalanine', type: 'nonpolar' },
    pro: { code: 'P', name: 'Proline', type: 'nonpolar' },
    ser: { code: 'S', name: 'Serine', type: 'polar' },
    thr: { code: 'T', name: 'Threonine', type: 'polar' },
    trp: { code: 'W', name: 'Tryptophan', type: 'nonpolar' },
    tyr: { code: 'Y', name: 'Tyrosine', type: 'polar' },
    val: { code: 'V', name: 'Valine', type: 'nonpolar' },
  };

  const aaTypeColors = {
    nonpolar: '#ffecb3',
    polar: '#c8e6c9',
    positive: '#bbdefb',
    negative: '#ffcdd2',
  };

  // Get protein info for selected organism
  const pi = orgData?.protein_info;

  return (
    <div className="protein-details">
      {/* Organism Selector */}
      <OrganismSelector
        organisms={organisms}
        selectedOrganism={selectedOrganism}
        onOrganismChange={onOrganismChange}
        dataType="protein"
      />

      {/* Display data for selected organism */}
      {selectedOrganism && orgData ? (
        <div className="organism-section">
          <h3 className="organism-name">{selectedOrganism}</h3>
          <p className="locus-display">Locus: {orgData.locus_display_name}</p>

          {pi ? (
            <div className="protein-info">
              {/* Primary Properties - Highlighted */}
              <div className="protein-primary-stats">
                <div className="stat-card">
                  <div className="stat-value">{pi.protein_length?.toLocaleString() || '-'}</div>
                  <div className="stat-label">Amino Acids</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{formatMW(pi.molecular_weight)}</div>
                  <div className="stat-label">Molecular Weight</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{formatNumber(pi.pi)}</div>
                  <div className="stat-label">Isoelectric Point (pI)</div>
                </div>
              </div>

              {/* Codon Usage Properties */}
              <div className="protein-section">
                <h4>Codon Usage Properties</h4>
                <div className="property-grid">
                  <div className="property-item">
                    <span className="property-label">CAI (Codon Adaptation Index)</span>
                    <span className="property-value">{formatNumber(pi.cai)}</span>
                  </div>
                  <div className="property-item">
                    <span className="property-label">Codon Bias</span>
                    <span className="property-value">{formatNumber(pi.codon_bias)}</span>
                  </div>
                  <div className="property-item">
                    <span className="property-label">FOP Score</span>
                    <span className="property-value">{formatNumber(pi.fop_score)}</span>
                  </div>
                </div>
              </div>

              {/* Physicochemical Properties */}
              <div className="protein-section">
                <h4>Physicochemical Properties</h4>
                <div className="property-grid">
                  <div className="property-item">
                    <span className="property-label">GRAVY Score</span>
                    <span className="property-value">{formatNumber(pi.gravy_score)}</span>
                    <span className="property-hint">
                      {pi.gravy_score > 0 ? '(hydrophobic)' : pi.gravy_score < 0 ? '(hydrophilic)' : ''}
                    </span>
                  </div>
                  <div className="property-item">
                    <span className="property-label">Aromaticity Score</span>
                    <span className="property-value">{formatNumber(pi.aromaticity_score)}</span>
                  </div>
                </div>
              </div>

              {/* Terminal Sequences */}
              {(pi.n_term_seq || pi.c_term_seq) && (
                <div className="protein-section">
                  <h4>Terminal Sequences</h4>
                  {pi.n_term_seq && (
                    <div className="terminal-seq">
                      <span className="terminal-label">N-terminus:</span>
                      <code className="terminal-sequence">{pi.n_term_seq}</code>
                    </div>
                  )}
                  {pi.c_term_seq && (
                    <div className="terminal-seq">
                      <span className="terminal-label">C-terminus:</span>
                      <code className="terminal-sequence">{pi.c_term_seq}</code>
                    </div>
                  )}
                </div>
              )}

              {/* Amino Acid Composition */}
              {pi.amino_acids && Object.keys(pi.amino_acids).length > 0 && (
                <div className="protein-section">
                  <h4
                    className="collapsible-header"
                    onClick={() => setShowAllAA(!showAllAA)}
                  >
                    <span className="collapse-icon">{showAllAA ? '▼' : '▶'}</span>
                    Amino Acid Composition
                    <span className="count-badge">{Object.keys(pi.amino_acids).length} types</span>
                  </h4>

                  {showAllAA && (
                    <div className="aa-composition">
                      <div className="aa-legend">
                        <span className="legend-item" style={{ backgroundColor: aaTypeColors.nonpolar }}>Nonpolar</span>
                        <span className="legend-item" style={{ backgroundColor: aaTypeColors.polar }}>Polar</span>
                        <span className="legend-item" style={{ backgroundColor: aaTypeColors.positive }}>Positive</span>
                        <span className="legend-item" style={{ backgroundColor: aaTypeColors.negative }}>Negative</span>
                      </div>

                      <div className="aa-grid">
                        {Object.entries(pi.amino_acids)
                          .sort((a, b) => b[1] - a[1])
                          .map(([aa, count]) => {
                            const info = aaInfo[aa.toLowerCase()] || { code: aa.toUpperCase(), name: aa, type: 'nonpolar' };
                            const totalAA = pi.protein_length || 0;
                            const percentage = totalAA > 0 ? ((count / totalAA) * 100).toFixed(1) : 0;

                            return (
                              <div
                                key={aa}
                                className="aa-item"
                                style={{ backgroundColor: aaTypeColors[info.type] }}
                                title={info.name}
                              >
                                <span className="aa-code">{info.code}</span>
                                <span className="aa-count">{count}</span>
                                <span className="aa-percent">{percentage}%</span>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <p className="no-data">No protein information for this organism</p>
          )}
        </div>
      ) : (
        <p className="no-data">Select an organism to view protein information</p>
      )}
    </div>
  );
}

export default ProteinDetails;
