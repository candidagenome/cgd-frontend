import React, { useState, useMemo } from 'react';

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

const BLOCK_SIZE = 50;
const IDENTITY_THRESHOLD = 0.8;

// Prefixes for C. albicans SC5314 sequences (should be reference)
const CALBICANS_PREFIXES = ['C1_', 'orf19.', 'Ca21chr', 'C1-'];

// Column widths (in characters)
const COL_NUM = 2;      // Row number
const COL_ID = 13;      // Sequence ID
const COL_COV = 7;      // Coverage
const COL_PID = 7;      // Percent identity
const COL_GAP = 5;      // Gap before sequence

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
 * Pad string to width (left or right aligned)
 */
function pad(str, width, alignRight = false) {
  const s = String(str);
  if (s.length >= width) return s.substring(0, width);
  const padding = ' '.repeat(width - s.length);
  return alignRight ? padding + s : s + padding;
}

/**
 * Build position ruler string
 * Format: "  1 [        .         .         .         .         : 50"
 * - [ only at position 1
 * - ] only at the final position
 * - : at positions 50, 150, 250, 350 (every 50 not divisible by 100)
 * - digit at positions 100, 200, 300 (hundreds marker)
 * - . at every 10th position
 */
function buildRuler(start, end, totalLength) {
  const blockLen = end - start;
  let ruler = '';

  for (let i = 0; i < blockLen; i++) {
    const pos = start + i + 1; // 1-based position

    if (pos === 1) {
      // Opening bracket only at position 1
      ruler += '[';
    } else if (pos === totalLength) {
      // Closing bracket at final position
      ruler += ']';
    } else if (pos % 100 === 0) {
      // Hundreds marker (1, 2, 3, etc.)
      ruler += String(pos / 100);
    } else if (pos % 50 === 0) {
      // Colon at 50, 150, 250, etc.
      ruler += ':';
    } else if (pos % 10 === 0) {
      // Dot at every 10th position
      ruler += '.';
    } else {
      ruler += ' ';
    }
  }

  // Start position (right-aligned, 3 chars) followed by space
  const startStr = pad(String(start + 1), 3, true) + ' ';
  // End position
  const endStr = ' ' + end;

  return startStr + ruler + endStr;
}

/**
 * Render amino acid with optional coloring
 */
function AminoAcid({ aa, shouldColor }) {
  if (aa === '-') {
    return <span style={{ color: '#999' }}>-</span>;
  }

  if (shouldColor && AA_COLORS[aa]) {
    return (
      <span style={{ backgroundColor: AA_COLORS[aa], color: '#000' }}>
        {aa}
      </span>
    );
  }

  return <span>{aa}</span>;
}

/**
 * Main alignment viewer component
 */
function AlignmentViewer({ sequences, alignmentType, referenceId }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Find reference sequence index - prefer C. albicans SC5314 sequence
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

  // Calculate stats for all sequences relative to reference
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

  // Sort sequences: reference first, then by identity descending
  const sortedSequences = useMemo(() => {
    const withStats = sequences.map((seq, idx) => ({
      ...seq,
      originalIndex: idx,
      stats: sequenceStats[idx] || { coverage: 0, identity: 0 },
    }));

    return withStats.sort((a, b) => {
      if (a.originalIndex === actualRefIndex) return -1;
      if (b.originalIndex === actualRefIndex) return 1;
      return b.stats.identity - a.stats.identity;
    });
  }, [sequences, sequenceStats, actualRefIndex]);

  if (!sequences.length) {
    return <div style={{ color: '#666', fontStyle: 'italic' }}>No alignment data</div>;
  }

  const alignmentLength = sequences[0]?.sequence?.length || 0;
  const numBlocks = Math.ceil(alignmentLength / BLOCK_SIZE);

  // Generate blocks
  const blocks = [];
  for (let blockIdx = 0; blockIdx < numBlocks; blockIdx++) {
    const start = blockIdx * BLOCK_SIZE;
    const end = Math.min(start + BLOCK_SIZE, alignmentLength);
    blocks.push({ start, end, blockIdx });
  }

  const title = alignmentType === 'protein' ? 'Protein Sequence Alignment' : 'Coding Sequence Alignment';

  // Header prefix for ruler line
  const headerPrefix = ' '.repeat(COL_NUM + 1) + pad('cov', COL_ID, true) + pad('pid', COL_COV, true) + ' '.repeat(COL_PID);

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
            padding: '15px',
            backgroundColor: '#fff',
            overflowX: 'auto',
          }}
        >
          {/* Legend */}
          <div style={{ marginBottom: '15px', fontSize: '13px' }}>
            <div style={{ marginBottom: '5px' }}>
              <strong>Reference sequence (1):</strong> {sortedSequences[0]?.sequence_id}
            </div>
            <div style={{ marginBottom: '5px', color: '#666' }}>
              Identities normalized by aligned length.
            </div>
            <div style={{ marginBottom: '5px', color: '#666' }}>
              Colored by: identity &gt;= 80%
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', fontSize: '12px', marginLeft: '20px' }}>
              <span><span style={{ backgroundColor: '#B8D4E8', padding: '0 4px' }}>&nbsp;</span> Hydrophobic (A, I, L, M, V)</span>
              <span><span style={{ backgroundColor: '#D4C4E8', padding: '0 4px' }}>&nbsp;</span> Aromatic (F, W, Y)</span>
              <span><span style={{ backgroundColor: '#C8E8C8', padding: '0 4px' }}>&nbsp;</span> Polar (N, Q, S, T)</span>
              <span><span style={{ backgroundColor: '#F8C4C4', padding: '0 4px' }}>&nbsp;</span> Negative charge (D, E)</span>
              <span><span style={{ backgroundColor: '#C4E8E8', padding: '0 4px' }}>&nbsp;</span> Positive charge (H, K, R)</span>
              <span><span style={{ backgroundColor: '#F8DCC4', padding: '0 4px' }}>&nbsp;</span> Backbone change (G, P)</span>
              <span><span style={{ backgroundColor: '#F8F4C4', padding: '0 4px' }}>&nbsp;</span> Cysteine (C)</span>
            </div>
          </div>

          {/* Alignment blocks */}
          <div style={{ fontFamily: 'monospace', fontSize: '13px', lineHeight: '1.4' }}>
            {blocks.map(({ start, end, blockIdx }) => (
              <div key={blockIdx} style={{ marginBottom: '15px' }}>
                {/* Position ruler */}
                <div style={{ color: '#666', whiteSpace: 'pre' }}>
                  {headerPrefix}{buildRuler(start, end, alignmentLength)}
                </div>

                {/* Sequences */}
                {sortedSequences.map((seq, seqIdx) => {
                  const seqSlice = seq.sequence.slice(start, end);
                  const rowNum = pad(String(seqIdx + 1), COL_NUM, true);
                  const seqId = pad(seq.sequence_id, COL_ID);
                  const cov = pad(seq.stats.coverage.toFixed(1) + '%', COL_COV, true);
                  const pid = pad(seq.stats.identity.toFixed(1) + '%', COL_PID, true);
                  const gap = ' '.repeat(COL_GAP);

                  return (
                    <div key={seq.sequence_id} style={{ whiteSpace: 'pre' }}>
                      <span style={{ color: '#666' }}>{rowNum}</span>
                      <span> </span>
                      <span>{seqId}</span>
                      <span style={{ color: '#666' }}>{cov}</span>
                      <span style={{ color: '#666' }}>{pid}</span>
                      <span>{gap}</span>
                      <span>
                        {seqSlice.split('').map((aa, aaIdx) => {
                          const globalPos = start + aaIdx;
                          const shouldColor = conservation[globalPos] >= IDENTITY_THRESHOLD;
                          return (
                            <AminoAcid
                              key={aaIdx}
                              aa={aa}
                              shouldColor={shouldColor && alignmentType === 'protein'}
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

          {/* Summary */}
          <div style={{
            marginTop: '10px',
            fontSize: '12px',
            color: '#666',
            borderTop: '1px solid #eee',
            paddingTop: '10px'
          }}>
            {sortedSequences.length} sequences, {alignmentLength} {alignmentType === 'protein' ? 'residues' : 'nucleotides'}
          </div>
        </div>
      )}
    </div>
  );
}

export default AlignmentViewer;
