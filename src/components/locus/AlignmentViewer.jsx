import React, { useState, useMemo } from 'react';

// Amino acid color categories
const AA_COLORS = {
  // Hydrophobic (A, I, L, M, V) - blue
  'A': '#6495ED', 'I': '#6495ED', 'L': '#6495ED', 'M': '#6495ED', 'V': '#6495ED',
  // Aromatic (F, W, Y) - purple
  'F': '#9370DB', 'W': '#9370DB', 'Y': '#9370DB',
  // Polar (N, Q, S, T) - green
  'N': '#90EE90', 'Q': '#90EE90', 'S': '#90EE90', 'T': '#90EE90',
  // Negative charge (D, E) - red
  'D': '#FF6B6B', 'E': '#FF6B6B',
  // Positive charge (H, K, R) - cyan
  'H': '#40E0D0', 'K': '#40E0D0', 'R': '#40E0D0',
  // Backbone change (G, P) - orange
  'G': '#FFA500', 'P': '#FFA500',
  // Cysteine (C) - yellow
  'C': '#FFD700',
};

const BLOCK_SIZE = 50;
const IDENTITY_THRESHOLD = 0.8; // 80% identity for coloring

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
 * Calculate column conservation (identity at each position)
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
 * Render a single amino acid with optional coloring
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
 * Render position ruler
 */
function PositionRuler({ start, end, blockSize }) {
  const positions = [];
  for (let i = start; i <= end; i += 10) {
    positions.push(i);
  }

  // Create ruler string
  let ruler = '';
  for (let i = 0; i < blockSize && (start + i) <= end; i++) {
    const pos = start + i;
    if (pos % 50 === 0) {
      ruler += ':';
    } else if (pos % 10 === 0) {
      ruler += '.';
    } else {
      ruler += ' ';
    }
  }

  return (
    <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#666' }}>
      <span style={{ display: 'inline-block', width: '160px' }}></span>
      <span style={{ display: 'inline-block', width: '60px' }}></span>
      <span style={{ display: 'inline-block', width: '60px' }}></span>
      <span>{start} [{ruler}] {Math.min(start + blockSize - 1, end)}</span>
    </div>
  );
}

/**
 * Main alignment viewer component
 */
function AlignmentViewer({ sequences, alignmentType, referenceId }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [refIndex, setRefIndex] = useState(0);

  // Find reference sequence index
  const actualRefIndex = useMemo(() => {
    if (referenceId) {
      const idx = sequences.findIndex(s => s.sequence_id === referenceId);
      return idx >= 0 ? idx : 0;
    }
    return refIndex;
  }, [sequences, referenceId, refIndex]);

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

    // Put reference first, then sort by identity
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
          <div style={{ marginBottom: '15px', fontSize: '12px' }}>
            <div style={{ marginBottom: '5px' }}>
              <strong>Reference sequence (1):</strong> {sortedSequences[0]?.sequence_id}
            </div>
            <div style={{ marginBottom: '5px', color: '#666' }}>
              Identities normalized by aligned length. Colored by: identity ≥ 80%
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', fontSize: '11px' }}>
              <span><span style={{ backgroundColor: '#6495ED', padding: '1px 4px' }}>■</span> Hydrophobic (A, I, L, M, V)</span>
              <span><span style={{ backgroundColor: '#9370DB', padding: '1px 4px' }}>■</span> Aromatic (F, W, Y)</span>
              <span><span style={{ backgroundColor: '#90EE90', padding: '1px 4px' }}>■</span> Polar (N, Q, S, T)</span>
              <span><span style={{ backgroundColor: '#FF6B6B', padding: '1px 4px' }}>■</span> Negative charge (D, E)</span>
              <span><span style={{ backgroundColor: '#40E0D0', padding: '1px 4px' }}>■</span> Positive charge (H, K, R)</span>
              <span><span style={{ backgroundColor: '#FFA500', padding: '1px 4px' }}>■</span> Backbone change (G, P)</span>
              <span><span style={{ backgroundColor: '#FFD700', padding: '1px 4px' }}>■</span> Cysteine (C)</span>
            </div>
          </div>

          {/* Alignment blocks */}
          {blocks.map(({ start, end, blockIdx }) => (
            <div key={blockIdx} style={{ marginBottom: '20px' }}>
              {/* Position ruler */}
              <PositionRuler start={start + 1} end={alignmentLength} blockSize={end - start} />

              {/* Sequences */}
              {sortedSequences.map((seq, seqIdx) => {
                const seqSlice = seq.sequence.slice(start, end);
                const isRef = seqIdx === 0;

                return (
                  <div
                    key={seq.sequence_id}
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '11px',
                      lineHeight: '1.4',
                      whiteSpace: 'pre',
                    }}
                  >
                    {/* Row number and ID */}
                    <span style={{
                      display: 'inline-block',
                      width: '20px',
                      textAlign: 'right',
                      marginRight: '5px',
                      color: '#666'
                    }}>
                      {seqIdx + 1}
                    </span>
                    <span style={{
                      display: 'inline-block',
                      width: '130px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {seq.sequence_id}
                    </span>

                    {/* Coverage */}
                    <span style={{
                      display: 'inline-block',
                      width: '60px',
                      textAlign: 'right',
                      color: '#666',
                      marginRight: '5px'
                    }}>
                      {seq.stats.coverage.toFixed(1)}%
                    </span>

                    {/* Identity */}
                    <span style={{
                      display: 'inline-block',
                      width: '55px',
                      textAlign: 'right',
                      color: '#666',
                      marginRight: '10px'
                    }}>
                      {seq.stats.identity.toFixed(1)}%
                    </span>

                    {/* Sequence with coloring */}
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
