import React, { useState, useMemo, useRef, useEffect } from 'react';

// Amino acid color categories - lighter/pastel colors
const AA_COLORS = {
  // Hydrophobic (A, I, L, M, V) - light blue
  'A': '#B8D4E8', 'I': '#B8D4E8', 'L': '#B8D4E8', 'M': '#B8D4E8', 'V': '#B8D4E8',
  // Aromatic (F, W, Y) - light purple
  'F': '#D4C4E8', 'W': '#D4C4E8', 'Y': '#D4C4E8',
  // Polar (N, Q, S, T) - light green
  'N': '#C8E8C8', 'Q': '#C8E8C8', 'S': '#C8E8C8', 'T': '#C8E8C8',
  // Negative charge (D, E) - light red/pink
  'D': '#F8C4C4', 'E': '#F8C4C4',
  // Positive charge (H, K, R) - light cyan
  'H': '#C4E8E8', 'K': '#C4E8E8', 'R': '#C4E8E8',
  // Backbone change (G, P) - light orange
  'G': '#F8DCC4', 'P': '#F8DCC4',
  // Cysteine (C) - light yellow
  'C': '#F8F4C4',
};

// Nucleotide color categories for coding sequences
const NT_COLORS = {
  // Purine (A, G) - light blue
  'A': '#B8D4E8', 'G': '#B8D4E8',
  // Pyrimidine (C, T) - light green
  'C': '#C8E8C8', 'T': '#C8E8C8',
};

const BLOCK_SIZE_DESKTOP = 100;  // 100 positions per line for desktop
const BLOCK_SIZE_COMPACT = 150;  // 150 positions for compact mode
const BLOCK_SIZE_MOBILE = 50;    // 50 positions for mobile/fallback
const IDENTITY_THRESHOLD = 0.8;

// CGD core species for filtering
const CGD_CORE_SPECIES = new Set([
  'Candida albicans SC5314',
  'Candida dubliniensis CD36',
  'Candida tropicalis MYA-3404',
  'Candida parapsilosis CDC317',
  'Candida auris B8441',
  'Candida glabrata CBS138',
]);

// Prefixes for C. albicans SC5314 sequences (should be reference)
const CALBICANS_PREFIXES = ['C1_', 'orf19.', 'Ca21chr', 'C1-'];

/**
 * Calculate coverage and percent identity relative to reference
 */
function calculateStats(refSeq, targetSeq) {
  let matches = 0;
  let alignedPositions = 0;
  let refLength = 0;

  for (let i = 0; i < refSeq.length; i++) {
    const refAA = refSeq[i];
    const targetAA = targetSeq[i] || '-';

    if (refAA !== '-') {
      refLength++;
      if (targetAA !== '-') {
        alignedPositions++;
        if (refAA === targetAA) {
          matches++;
        }
      }
    }
  }

  const coverage = refLength > 0 ? (alignedPositions / refLength) * 100 : 0;
  const identity = alignedPositions > 0 ? (matches / alignedPositions) * 100 : 0;

  return { coverage, identity };
}

/**
 * Calculate column conservation
 */
function calculateColumnConservation(sequences, refIndex) {
  if (!sequences.length) return [];

  const refSeq = sequences[refIndex]?.sequence || sequences[0]?.sequence || '';
  const conservation = [];

  for (let i = 0; i < refSeq.length; i++) {
    const refAA = refSeq[i];
    if (refAA === '-') {
      conservation.push(0);
      continue;
    }

    let matches = 0;
    let total = 0;
    for (const seq of sequences) {
      const aa = seq.sequence[i] || '-';
      if (aa !== '-') {
        total++;
        if (aa === refAA) matches++;
      }
    }
    conservation.push(total > 0 ? matches / total : 0);
  }

  return conservation;
}

/**
 * Build position ruler string
 */
function buildRuler(start, end, totalLength) {
  const blockLen = end - start;
  let ruler = '';

  for (let i = 0; i < blockLen; i++) {
    const pos = start + i + 1;

    if (pos === 1) {
      ruler += '[';
    } else if (pos === totalLength) {
      ruler += ']';
    } else if (pos % 100 === 0) {
      ruler += String((pos / 100) % 10);
    } else if (pos % 50 === 0) {
      ruler += ':';
    } else if (pos % 10 === 0) {
      ruler += '.';
    } else {
      ruler += ' ';
    }
  }

  return ruler;
}

/**
 * Render residue with optional coloring
 */
function Residue({ char, shouldColor, isProtein }) {
  if (char === '-') {
    return <span style={{ color: '#999' }}>-</span>;
  }

  const colors = isProtein ? AA_COLORS : NT_COLORS;

  if (shouldColor && colors[char]) {
    return (
      <span style={{ backgroundColor: colors[char], color: '#000' }}>
        {char}
      </span>
    );
  }

  return <span>{char}</span>;
}

/**
 * Color key legend component
 */
function ColorKeyPopover({ isProtein, onClose }) {
  const colors = isProtein ? [
    { color: '#B8D4E8', label: 'Hydrophobic (A,I,L,M,V)' },
    { color: '#D4C4E8', label: 'Aromatic (F,W,Y)' },
    { color: '#C8E8C8', label: 'Polar (N,Q,S,T)' },
    { color: '#F8C4C4', label: 'Negative (D,E)' },
    { color: '#C4E8E8', label: 'Positive (H,K,R)' },
    { color: '#F8DCC4', label: 'Backbone (G,P)' },
    { color: '#F8F4C4', label: 'Cysteine (C)' },
  ] : [
    { color: '#B8D4E8', label: 'Purine (A,G)' },
    { color: '#C8E8C8', label: 'Pyrimidine (C,T)' },
  ];

  return (
    <div
      style={{
        position: 'absolute',
        top: '100%',
        left: 0,
        zIndex: 100,
        backgroundColor: '#fff',
        border: '1px solid #ddd',
        borderRadius: '4px',
        padding: '10px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        minWidth: '200px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <strong style={{ fontSize: '12px' }}>Color Key</strong>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            color: '#666',
          }}
        >
          ×
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px' }}>
        {colors.map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ backgroundColor: color, width: '14px', height: '14px', display: 'inline-block' }} />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Main alignment viewer component
 */
function AlignmentViewer({ sequences, alignmentType, referenceId }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showColorKey, setShowColorKey] = useState(false);
  const [showCGDOnly, setShowCGDOnly] = useState(false);
  const [compactMode, setCompactMode] = useState(true);
  const alignmentRef = useRef(null);
  const [blockSize, setBlockSize] = useState(BLOCK_SIZE_DESKTOP);

  // Detect screen size for responsive block size
  useEffect(() => {
    const updateBlockSize = () => {
      if (window.innerWidth < 768) {
        setBlockSize(BLOCK_SIZE_MOBILE);
      } else if (compactMode) {
        setBlockSize(BLOCK_SIZE_COMPACT);
      } else {
        setBlockSize(BLOCK_SIZE_DESKTOP);
      }
    };
    updateBlockSize();
    window.addEventListener('resize', updateBlockSize);
    return () => window.removeEventListener('resize', updateBlockSize);
  }, [compactMode]);

  // Find reference sequence index
  const actualRefIndex = useMemo(() => {
    if (referenceId) {
      const idx = sequences.findIndex(s => s.sequence_id === referenceId);
      if (idx >= 0) return idx;
    }

    for (let i = 0; i < sequences.length; i++) {
      const seqId = sequences[i].sequence_id;
      if (CALBICANS_PREFIXES.some(prefix => seqId.startsWith(prefix))) {
        return i;
      }
    }

    return 0;
  }, [sequences, referenceId]);

  // Calculate stats for all sequences
  const sequenceStats = useMemo(() => {
    if (!sequences.length) return [];
    const refSeq = sequences[actualRefIndex]?.sequence || '';

    return sequences.map((seq, idx) => {
      if (idx === actualRefIndex) {
        return { coverage: 100, identity: 100 };
      }
      return calculateStats(refSeq, seq.sequence);
    });
  }, [sequences, actualRefIndex]);

  // Calculate column conservation
  const conservation = useMemo(() => {
    return calculateColumnConservation(sequences, actualRefIndex);
  }, [sequences, actualRefIndex]);

  // Sort and filter sequences
  const sortedSequences = useMemo(() => {
    const withStats = sequences.map((seq, idx) => ({
      ...seq,
      originalIndex: idx,
      stats: sequenceStats[idx] || { coverage: 0, identity: 0 },
    }));

    let filtered = withStats;
    if (showCGDOnly) {
      filtered = withStats.filter(seq =>
        seq.organism_name && CGD_CORE_SPECIES.has(seq.organism_name)
      );
    }

    return filtered.sort((a, b) => {
      if (a.originalIndex === actualRefIndex) return -1;
      if (b.originalIndex === actualRefIndex) return 1;
      return b.stats.identity - a.stats.identity;
    });
  }, [sequences, sequenceStats, actualRefIndex, showCGDOnly]);

  // Count CGD core species
  const cgdCoreCount = useMemo(() => {
    return sequences.filter(seq =>
      seq.organism_name && CGD_CORE_SPECIES.has(seq.organism_name)
    ).length;
  }, [sequences]);

  if (!sequences.length) {
    return <div style={{ color: '#666', fontStyle: 'italic' }}>No alignment data</div>;
  }

  const alignmentLength = sequences[0]?.sequence?.length || 0;
  const numBlocks = Math.ceil(alignmentLength / blockSize);

  const blocks = [];
  for (let blockIdx = 0; blockIdx < numBlocks; blockIdx++) {
    const start = blockIdx * blockSize;
    const end = Math.min(start + blockSize, alignmentLength);
    blocks.push({ start, end, blockIdx });
  }

  const title = alignmentType === 'protein' ? 'Protein Sequence Alignment' : 'Coding Sequence Alignment';
  const refSeq = sortedSequences[0];

  // Styles
  const fontSize = compactMode ? '11px' : '13px';
  const lineHeight = compactMode ? '1.15' : '1.4';
  const seqIdWidth = compactMode ? '11ch' : '13ch';

  return (
    <div style={{ marginBottom: '20px' }}>
      {/* Header */}
      <div
        style={{
          backgroundColor: '#f5f5f5',
          padding: '10px 15px',
          borderRadius: '4px 4px 0 0',
          border: '1px solid #ddd',
          borderBottom: isCollapsed ? '1px solid #ddd' : 'none',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <span style={{ fontWeight: 'bold' }}>{title}</span>
        <span style={{ color: '#666', fontSize: '12px' }}>
          {isCollapsed ? '▶ Expand' : '▼ Collapse'}
        </span>
      </div>

      {!isCollapsed && (
        <div
          style={{
            border: '1px solid #ddd',
            borderTop: 'none',
            borderRadius: '0 0 4px 4px',
            padding: '12px 15px',
            backgroundColor: '#fff',
          }}
        >
          {/* Compact summary header */}
          <div style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', fontSize: '13px' }}>
              <span>
                <strong>Reference:</strong> {refSeq?.sequence_id}
                {refSeq?.organism_name && (
                  <span style={{ color: '#666' }}> ({refSeq.organism_name})</span>
                )}
              </span>
              <span style={{ color: '#999' }}>|</span>
              <span>{sortedSequences.length} sequences</span>
              <span style={{ color: '#999' }}>|</span>
              <span>Identity ≥80% colored</span>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
              <button
                onClick={(e) => { e.stopPropagation(); setShowDetails(!showDetails); }}
                style={{
                  padding: '4px 10px',
                  fontSize: '12px',
                  border: '1px solid #ccc',
                  borderRadius: '3px',
                  backgroundColor: showDetails ? '#e3f2fd' : '#fff',
                  cursor: 'pointer',
                }}
              >
                {showDetails ? 'Hide' : 'Show'} sequence details
              </button>

              <div style={{ position: 'relative' }}>
                <button
                  onClick={(e) => { e.stopPropagation(); setShowColorKey(!showColorKey); }}
                  style={{
                    padding: '4px 10px',
                    fontSize: '12px',
                    border: '1px solid #ccc',
                    borderRadius: '3px',
                    backgroundColor: showColorKey ? '#e3f2fd' : '#fff',
                    cursor: 'pointer',
                  }}
                >
                  Color key
                </button>
                {showColorKey && (
                  <ColorKeyPopover
                    isProtein={alignmentType === 'protein'}
                    onClose={() => setShowColorKey(false)}
                  />
                )}
              </div>

              <span style={{ color: '#ddd' }}>|</span>

              {/* Display controls */}
              <label style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={showCGDOnly}
                  onChange={(e) => setShowCGDOnly(e.target.checked)}
                  onClick={(e) => e.stopPropagation()}
                />
                CGD core only ({cgdCoreCount})
              </label>

              <label style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={compactMode}
                  onChange={(e) => setCompactMode(e.target.checked)}
                  onClick={(e) => e.stopPropagation()}
                />
                Compact
              </label>
            </div>
          </div>

          {/* Expandable sequence details table */}
          {showDetails && (
            <div style={{ marginBottom: '12px', maxHeight: '200px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '3px' }}>
              <table style={{ borderCollapse: 'collapse', fontSize: '11px', width: '100%' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9f9f9', position: 'sticky', top: 0 }}>
                    <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>#</th>
                    <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Sequence ID</th>
                    <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Organism</th>
                    <th style={{ padding: '4px 6px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Cov</th>
                    <th style={{ padding: '4px 6px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>ID</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedSequences.map((seq, idx) => (
                    <tr key={seq.sequence_id}>
                      <td style={{ padding: '3px 6px', color: '#666' }}>{idx + 1}</td>
                      <td style={{ padding: '3px 6px', fontFamily: 'monospace' }}>{seq.sequence_id}</td>
                      <td style={{ padding: '3px 6px', fontStyle: 'italic', color: '#666' }}>
                        {seq.organism_name || '-'}
                      </td>
                      <td style={{ padding: '3px 6px', textAlign: 'right', fontFamily: 'monospace' }}>
                        {seq.stats.coverage.toFixed(1)}%
                      </td>
                      <td style={{ padding: '3px 6px', textAlign: 'right', fontFamily: 'monospace' }}>
                        {seq.stats.identity.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Scrollable alignment viewer */}
          <div
            ref={alignmentRef}
            style={{
              maxHeight: '500px',
              overflowY: 'auto',
              overflowX: 'auto',
              border: '1px solid #eee',
              borderRadius: '3px',
              backgroundColor: '#fafafa',
            }}
          >
            <div style={{
              fontFamily: 'monospace',
              fontSize,
              lineHeight,
              padding: '8px',
              minWidth: 'fit-content',
            }}>
              {blocks.map(({ start, end, blockIdx }) => (
                <div key={blockIdx} style={{ marginBottom: compactMode ? '8px' : '12px' }}>
                  {/* Position ruler - sticky header */}
                  <div style={{
                    color: '#888',
                    whiteSpace: 'pre',
                    position: 'sticky',
                    top: 0,
                    backgroundColor: '#fafafa',
                    zIndex: 1,
                    paddingBottom: '2px',
                  }}>
                    <span style={{ display: 'inline-block', width: '2ch', textAlign: 'right' }}></span>
                    <span style={{ display: 'inline-block', width: seqIdWidth }}></span>
                    <span style={{ display: 'inline-block', width: '5ch', textAlign: 'right', marginRight: '1ch' }}>
                      {start + 1}
                    </span>
                    <span>{buildRuler(start, end, alignmentLength)}</span>
                    <span style={{ marginLeft: '1ch' }}>{end}</span>
                  </div>

                  {/* Sequences */}
                  {sortedSequences.map((seq, seqIdx) => {
                    const seqSlice = seq.sequence.slice(start, end);

                    return (
                      <div key={seq.sequence_id} style={{ whiteSpace: 'pre', display: 'flex' }}>
                        {/* Row number - sticky */}
                        <span style={{
                          display: 'inline-block',
                          width: '2ch',
                          textAlign: 'right',
                          color: '#999',
                          position: 'sticky',
                          left: 0,
                          backgroundColor: '#fafafa',
                          zIndex: 1,
                        }}>
                          {seqIdx + 1}
                        </span>
                        {/* Sequence ID - sticky */}
                        <span
                          title={seq.organism_name || seq.sequence_id}
                          style={{
                            display: 'inline-block',
                            width: seqIdWidth,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            cursor: 'help',
                            position: 'sticky',
                            left: '2ch',
                            backgroundColor: '#fafafa',
                            zIndex: 1,
                            paddingLeft: '1ch',
                          }}
                        >
                          {seq.sequence_id}
                        </span>
                        {/* Spacer */}
                        <span style={{ display: 'inline-block', width: '6ch' }}></span>
                        {/* Sequence */}
                        <span>
                          {seqSlice.split('').map((char, charIdx) => {
                            const globalPos = start + charIdx;
                            const shouldColor = conservation[globalPos] >= IDENTITY_THRESHOLD;
                            return (
                              <Residue
                                key={charIdx}
                                char={char}
                                shouldColor={shouldColor}
                                isProtein={alignmentType === 'protein'}
                              />
                            );
                          })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Summary footer */}
          <div style={{
            marginTop: '8px',
            fontSize: '11px',
            color: '#666',
            display: 'flex',
            justifyContent: 'space-between',
          }}>
            <span>
              {sortedSequences.length} sequences, {alignmentLength} {alignmentType === 'protein' ? 'residues' : 'nucleotides'}
            </span>
            <span>
              {blockSize} positions/line
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default AlignmentViewer;
