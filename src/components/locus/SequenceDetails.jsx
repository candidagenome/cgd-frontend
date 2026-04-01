import React, { useState, useEffect, useMemo, useCallback } from 'react';
import OrganismSelector, { getDefaultOrganism } from './OrganismSelector';
import { API_BASE_URL } from '../../api/config';
import './LocusComponents.css';

// Map sequence type from DB to API parameter
const getSeqTypeParam = (seqType) => {
  const type = seqType?.toLowerCase() || '';
  if (type.includes('protein')) return 'protein';
  if (type.includes('coding') || type === 'cds') return 'coding';
  if (type.includes('genomic_utr')) return 'genomic_utr';
  if (type.includes('coding_utr') || type.includes('transcript')) return 'coding_utr';
  return 'genomic';
};

// Additional sequence options (fetched on demand)
const BASE_SEQ_OPTIONS = [
  { type: 'coding_utr', label: 'Transcript/mRNA (introns spliced out)', description: 'Spliced transcript sequence - exons and UTRs only, no introns' },
  { type: 'genomic_flanking', label: 'Genomic DNA +1kb Flanking', description: 'Genomic DNA (with introns) plus 1kb upstream and downstream regions', flankl: 1000, flankr: 1000, seqtype: 'genomic' },
];

// Generate sequence options including B allele options for diploid organisms
const getSequenceOptions = (selectedOrganism, alleleLocations) => {
  const options = [...BASE_SEQ_OPTIONS];

  // Only add B allele options for C. albicans SC5314 (diploid)
  if (selectedOrganism === 'Candida albicans SC5314' && alleleLocations?.length > 0) {
    const bAllele = alleleLocations[0]; // First (usually only) B allele
    if (bAllele?.feature_name) {
      options.push(
        { type: 'b_allele_separator', label: `── B Allele (${bAllele.feature_name}) ──`, isSeparator: true },
        { type: 'b_genomic', label: 'B Allele Genomic DNA', description: 'Genomic DNA for B allele', locusOverride: bAllele.feature_name, seqtype: 'genomic' },
        { type: 'b_coding_utr', label: 'B Allele Transcript/mRNA', description: 'Spliced transcript for B allele', locusOverride: bAllele.feature_name, seqtype: 'coding_utr' },
        { type: 'b_protein', label: 'B Allele Protein', description: 'Protein sequence for B allele', locusOverride: bAllele.feature_name, seqtype: 'protein' },
      );
    }
  }

  return options;
};

function SequenceDetails({ data, loading, error, selectedOrganism, onOrganismChange }) {
  const [expandedSequences, setExpandedSequences] = useState({});
  const [additionalSeqs, setAdditionalSeqs] = useState({});  // { type: { sequence, loading, error } }
  const [expandedAdditional, setExpandedAdditional] = useState({});

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

  // Fetch additional sequence types on demand
  const fetchAdditionalSequence = useCallback(async (opt, locusName) => {
    const key = opt.type;

    // If already loaded, just toggle expansion
    if (additionalSeqs[key]?.sequence) {
      setExpandedAdditional(prev => ({ ...prev, [key]: !prev[key] }));
      return;
    }

    // Set loading state
    setAdditionalSeqs(prev => ({ ...prev, [key]: { loading: true, error: null, sequence: null } }));
    setExpandedAdditional(prev => ({ ...prev, [key]: true }));

    try {
      const seqtype = opt.seqtype || opt.type;
      let url = `${API_BASE_URL}/api/sequence?locus=${encodeURIComponent(locusName)}&seqtype=${seqtype}&format=json`;
      if (opt.flankl) url += `&flankl=${opt.flankl}`;
      if (opt.flankr) url += `&flankr=${opt.flankr}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch sequence: ${response.statusText}`);
      }
      const result = await response.json();

      setAdditionalSeqs(prev => ({
        ...prev,
        [key]: { loading: false, error: null, sequence: result.sequence, info: result.info }
      }));
    } catch (err) {
      setAdditionalSeqs(prev => ({
        ...prev,
        [key]: { loading: false, error: err.message, sequence: null }
      }));
    }
  }, [additionalSeqs]);

  // Toggle additional sequence expansion
  const toggleAdditionalSequence = (key) => {
    setExpandedAdditional(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Build download URL for additional sequences
  const getAdditionalDownloadUrl = (opt, locusName) => {
    const seqtype = opt.seqtype || opt.type;
    let url = `${API_BASE_URL}/api/sequence?locus=${encodeURIComponent(locusName)}&seqtype=${seqtype}&format=fasta`;
    if (opt.flankl) url += `&flankl=${opt.flankl}`;
    if (opt.flankr) url += `&flankr=${opt.flankr}`;
    return url;
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

  // Format sequence type labels for clarity
  const formatSeqTypeLabel = (seqType) => {
    const type = seqType?.toLowerCase() || '';
    if (type === 'genomic') return 'Genomic DNA (with introns)';
    if (type === 'coding') return 'Coding Sequence / CDS (introns spliced out)';
    if (type === 'protein') return 'Protein';
    return seqType;
  };

  // Get locations and sequences for selected organism
  const currentLocations = orgData?.locations?.filter(l => l.is_current) || [];
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

          {/* Additional Sequence Options */}
          {orgData?.locus_display_name && (() => {
            const seqOptions = getSequenceOptions(selectedOrganism, orgData.allele_locations);
            return (
            <div className="additional-sequences-section">
              <h4>Additional Sequence Options</h4>
              <div className="additional-seq-options">
                {seqOptions.map(opt => (
                  opt.isSeparator ? (
                    <span key={opt.type} className="seq-options-separator">{opt.label}</span>
                  ) : (
                  <button
                    key={opt.type}
                    className={`additional-seq-btn ${expandedAdditional[opt.type] ? 'active' : ''}`}
                    onClick={() => fetchAdditionalSequence(opt, opt.locusOverride || orgData.locus_display_name)}
                    title={opt.description}
                  >
                    {additionalSeqs[opt.type]?.loading ? 'Loading...' : opt.label}
                    <span className="collapse-indicator">{expandedAdditional[opt.type] ? ' ▼' : ' ▶'}</span>
                  </button>
                  )
                ))}
              </div>

              {/* Display fetched additional sequences */}
              {seqOptions.filter(opt => !opt.isSeparator).map(opt => {
                const seqData = additionalSeqs[opt.type];
                const isExpanded = expandedAdditional[opt.type];

                if (!seqData || (!seqData.loading && !seqData.sequence && !seqData.error)) {
                  return null;
                }

                return (
                  <div key={opt.type} className="additional-seq-display">
                    <div
                      className="additional-seq-header"
                      onClick={() => toggleAdditionalSequence(opt.type)}
                    >
                      <span className="collapse-icon">{isExpanded ? '▼' : '▶'}</span>
                      <span className="seq-type">{opt.label}</span>
                      {seqData.info?.length && (
                        <span className="seq-stat">
                          <strong>{seqData.info.length.toLocaleString()}</strong> bp
                        </span>
                      )}
                    </div>

                    {isExpanded && (
                      <div className="sequence-content">
                        {seqData.loading && (
                          <div className="loading-inline">Loading sequence...</div>
                        )}
                        {seqData.error && (
                          <div className="error-inline">Error: {seqData.error}</div>
                        )}
                        {seqData.sequence && (
                          <>
                            <div className="sequence-toolbar">
                              <button
                                className="copy-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(seqData.sequence);
                                }}
                              >
                                Copy Sequence
                              </button>
                              <a
                                className="download-btn"
                                href={getAdditionalDownloadUrl(opt, opt.locusOverride || orgData.locus_display_name)}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                              >
                                Download FASTA
                              </a>
                              <span className="sequence-length-info">
                                {seqData.sequence.length.toLocaleString()} characters
                              </span>
                            </div>
                            <pre className="sequence-text">{seqData.sequence}</pre>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )})()}

          {/* Sequences - Grouped by Type, with A and B allele labels for C. albicans */}
          {Object.keys(sequenceGroups).length > 0 && (() => {
            const hasBAllele = selectedOrganism === 'Candida albicans SC5314' &&
                               orgData.allele_locations?.length > 0;
            const bAllele = hasBAllele ? orgData.allele_locations[0] : null;
            const bAlleleSeqs = bAllele?.sequences || [];

            // Group B allele sequences by type for side-by-side display
            const bAlleleByType = {};
            bAlleleSeqs.forEach(seq => {
              const type = seq.seq_type || 'Other';
              bAlleleByType[type] = seq;
            });

            return (
              <div className="sequences-section">
                <h4>Sequences</h4>
                {hasBAllele && (
                  <p className="allele-info-text">
                    <em>C. albicans</em> is diploid with two alleles (A and B) for each gene.
                    Both allele sequences are shown below.
                  </p>
                )}
                {Object.entries(sequenceGroups).map(([seqType, sequences]) => {
                  const bSeq = bAlleleByType[seqType];

                  return (
                    <div key={seqType} className="sequence-type-group">
                      <h5 className="sequence-type-header">
                        {formatSeqTypeLabel(seqType)}
                        <span className="count-badge">{sequences.length + (bSeq ? 1 : 0)}</span>
                      </h5>

                      {/* A Allele sequences */}
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
                                <span className="seq-type">{formatSeqTypeLabel(seq.seq_type)}</span>
                                {hasBAllele && <span className="allele-badge allele-a">A allele</span>}
                                {seq.is_current && <span className="current-badge">Current</span>}
                              </div>
                              <div className="seq-info-right">
                                <span className="seq-stat">
                                  <strong>{seq.seq_length?.toLocaleString()}</strong>
                                  {seq.seq_type?.toLowerCase() === 'protein' ? ' aa' : ' bp'}
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
                                  <a
                                    className="download-btn"
                                    href={`${API_BASE_URL}/api/sequence?locus=${encodeURIComponent(orgData.locus_display_name)}&seqtype=${getSeqTypeParam(seq.seq_type)}&format=fasta`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    Download FASTA
                                  </a>
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

                      {/* B Allele sequence for this type (if exists) */}
                      {bSeq && (() => {
                        const seqKey = `b-allele-${seqType}`;
                        const isExpanded = expandedSequences[seqKey];

                        return (
                          <div
                            className="sequence-block current b-allele"
                          >
                            <div
                              className="sequence-header"
                              onClick={() => bSeq.residues && toggleSequence(seqKey)}
                              style={{ cursor: bSeq.residues ? 'pointer' : 'default' }}
                            >
                              <div className="seq-info-left">
                                {bSeq.residues && (
                                  <span className="collapse-icon">{isExpanded ? '▼' : '▶'}</span>
                                )}
                                <span className="seq-type">{formatSeqTypeLabel(bSeq.seq_type)}</span>
                                <span className="allele-badge allele-b">B allele</span>
                              </div>
                              <div className="seq-info-right">
                                <span className="seq-stat">
                                  <strong>{bSeq.seq_length?.toLocaleString()}</strong>
                                  {bSeq.seq_type?.toLowerCase() === 'protein' ? ' aa' : ' bp'}
                                </span>
                                {bSeq.source && (
                                  <span className="seq-meta">
                                    Source: {bSeq.source}
                                  </span>
                                )}
                                {bSeq.seq_version && (
                                  <span className="seq-meta">
                                    Version: {new Date(bSeq.seq_version).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>

                            {isExpanded && bSeq.residues && (
                              <div className="sequence-content">
                                <div className="sequence-toolbar">
                                  <button
                                    className="copy-btn"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigator.clipboard.writeText(bSeq.residues);
                                    }}
                                  >
                                    Copy Sequence
                                  </button>
                                  <a
                                    className="download-btn"
                                    href={`${API_BASE_URL}/api/sequence?locus=${encodeURIComponent(bAllele.feature_name)}&seqtype=${getSeqTypeParam(bSeq.seq_type)}&format=fasta`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    Download FASTA
                                  </a>
                                  <span className="sequence-length-info">
                                    Showing {bSeq.residues.length.toLocaleString()} characters
                                  </span>
                                </div>
                                <pre className="sequence-text">{bSeq.residues}</pre>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  );
                })}
              </div>
            );
          })()}

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
