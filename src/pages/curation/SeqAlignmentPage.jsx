/**
 * Sequence Alignment Page
 *
 * Compare and align two sequences for curation work.
 * Mirrors functionality from legacy seqAlignment CGI.
 */
import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import seqAlignmentApi from '../../api/seqAlignmentApi';

function SeqAlignmentPage() {
  useAuth();

  const [seq1, setSeq1] = useState('');
  const [seq2, setSeq2] = useState('');
  const [seq1Name, setSeq1Name] = useState('Current');
  const [seq2Name, setSeq2Name] = useState('New');
  const [alignment, setAlignment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAlign = useCallback(async () => {
    if (!seq1.trim()) {
      setError('Please enter the first sequence');
      return;
    }
    if (!seq2.trim()) {
      setError('Please enter the second sequence');
      return;
    }

    setLoading(true);
    setError('');
    setAlignment(null);

    try {
      const data = await seqAlignmentApi.alignSequences(
        seq1,
        seq2,
        seq1Name || 'Current',
        seq2Name || 'New'
      );
      setAlignment(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Alignment failed');
    } finally {
      setLoading(false);
    }
  }, [seq1, seq2, seq1Name, seq2Name]);

  const handleClear = () => {
    setSeq1('');
    setSeq2('');
    setSeq1Name('Current');
    setSeq2Name('New');
    setAlignment(null);
    setError('');
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Sequence Alignment</h1>

      <p style={styles.description}>
        Compare two sequences to visualize differences. Useful for comparing
        old vs new sequences during curation.
      </p>

      {error && <div style={styles.error}>{error}</div>}

      {/* Input Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionHeader}>Enter Sequences</h2>

        <div style={styles.inputRow}>
          <div style={styles.inputGroup}>
            <div style={styles.labelRow}>
              <label style={styles.label}>First Sequence:</label>
              <input
                type="text"
                value={seq1Name}
                onChange={(e) => setSeq1Name(e.target.value)}
                placeholder="Name (optional)"
                style={styles.nameInput}
              />
            </div>
            <textarea
              value={seq1}
              onChange={(e) => setSeq1(e.target.value)}
              placeholder="Enter nucleotide or protein sequence..."
              style={styles.seqInput}
              rows={8}
            />
            <div style={styles.seqInfo}>
              {seq1.replace(/\s/g, '').length} characters
            </div>
          </div>

          <div style={styles.inputGroup}>
            <div style={styles.labelRow}>
              <label style={styles.label}>Second Sequence:</label>
              <input
                type="text"
                value={seq2Name}
                onChange={(e) => setSeq2Name(e.target.value)}
                placeholder="Name (optional)"
                style={styles.nameInput}
              />
            </div>
            <textarea
              value={seq2}
              onChange={(e) => setSeq2(e.target.value)}
              placeholder="Enter nucleotide or protein sequence..."
              style={styles.seqInput}
              rows={8}
            />
            <div style={styles.seqInfo}>
              {seq2.replace(/\s/g, '').length} characters
            </div>
          </div>
        </div>

        <div style={styles.buttonRow}>
          <button
            onClick={handleAlign}
            disabled={loading || !seq1.trim() || !seq2.trim()}
            style={styles.alignButton}
          >
            {loading ? 'Aligning...' : 'Align Sequences'}
          </button>
          <button onClick={handleClear} style={styles.clearButton}>
            Clear
          </button>
        </div>
      </div>

      {/* Results Section */}
      {alignment && (
        <div style={styles.section}>
          <h2 style={styles.sectionHeader}>Alignment Results</h2>

          {/* Statistics */}
          <div style={styles.statsBox}>
            <div style={styles.statItem}>
              <strong>{alignment.seq1_name}:</strong> {alignment.seq1_length} bp/aa
            </div>
            <div style={styles.statItem}>
              <strong>{alignment.seq2_name}:</strong> {alignment.seq2_length} bp/aa
            </div>
            <div style={styles.statItem}>
              <strong>Aligned length:</strong> {alignment.aligned_length}
            </div>
            <div style={styles.statItem}>
              <strong>Identity:</strong>{' '}
              <span style={styles.identityValue}>{alignment.identity_percent}%</span>
            </div>
            <div style={styles.statItem}>
              <strong>Matches:</strong>{' '}
              <span style={styles.matchValue}>{alignment.matches}</span>
            </div>
            <div style={styles.statItem}>
              <strong>Mismatches:</strong>{' '}
              <span style={styles.mismatchValue}>{alignment.mismatches}</span>
            </div>
            <div style={styles.statItem}>
              <strong>Gaps:</strong>{' '}
              <span style={styles.gapValue}>{alignment.gaps}</span>
            </div>
          </div>

          {/* Legend */}
          <div style={styles.legend}>
            <span style={styles.legendItem}>
              <span style={styles.matchSymbol}>*</span> = Match
            </span>
            <span style={styles.legendItem}>
              <span style={styles.mismatchSymbol}>.</span> = Mismatch
            </span>
            <span style={styles.legendItem}>
              <span style={styles.gapSymbol}>-</span> = Gap
            </span>
          </div>

          {/* Alignment Blocks */}
          <div style={styles.alignmentContainer}>
            {alignment.blocks.map((block, index) => (
              <div key={index} style={styles.alignmentBlock}>
                <div style={styles.alignmentLine}>
                  <span style={styles.seqLabel}>{alignment.seq1_name}</span>
                  <span style={styles.position}>{block.seq1_start}</span>
                  <span style={styles.sequence}>
                    {formatSequence(block.seq1, block.symbols)}
                  </span>
                  <span style={styles.position}>{block.seq1_end}</span>
                </div>
                <div style={styles.alignmentLine}>
                  <span style={styles.seqLabel}></span>
                  <span style={styles.position}></span>
                  <span style={styles.symbols}>
                    {formatSymbols(block.symbols)}
                  </span>
                  <span style={styles.position}></span>
                </div>
                <div style={styles.alignmentLine}>
                  <span style={styles.seqLabel}>{alignment.seq2_name}</span>
                  <span style={styles.position}>{block.seq2_start}</span>
                  <span style={styles.sequence}>
                    {formatSequence(block.seq2, block.symbols)}
                  </span>
                  <span style={styles.position}>{block.seq2_end}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={styles.backLink}>
        <Link to="/curation">Back to Curator Central</Link>
      </div>
    </div>
  );
}

// Helper function to format sequence with highlighting
function formatSequence(seq, symbols) {
  return seq.split('').map((char, i) => {
    const symbol = symbols[i];
    let style = {};
    if (char === '-') {
      style = { color: '#999' };
    } else if (symbol === '.') {
      style = { backgroundColor: '#ffcccc', color: '#c00' };
    }
    return (
      <span key={i} style={style}>
        {char}
      </span>
    );
  });
}

// Helper function to format symbols with highlighting
function formatSymbols(symbols) {
  return symbols.split('').map((char, i) => {
    let style = {};
    if (char === '*') {
      style = { color: '#090' };
    } else if (char === '.') {
      style = { color: '#c00' };
    }
    return (
      <span key={i} style={style}>
        {char}
      </span>
    );
  });
}

const styles = {
  container: {
    maxWidth: '1100px',
    margin: '1rem auto',
    padding: '1rem',
  },
  title: {
    marginBottom: '0.5rem',
  },
  description: {
    color: '#666',
    marginBottom: '1.5rem',
  },
  error: {
    padding: '0.75rem',
    backgroundColor: '#fee',
    border: '1px solid #c00',
    borderRadius: '4px',
    color: '#c00',
    marginBottom: '1rem',
  },
  section: {
    marginBottom: '2rem',
  },
  sectionHeader: {
    backgroundColor: '#CCCCFF',
    padding: '0.5rem',
    margin: '0 0 1rem 0',
    fontSize: '1.1rem',
  },
  inputRow: {
    display: 'flex',
    gap: '1.5rem',
  },
  inputGroup: {
    flex: 1,
  },
  labelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  label: {
    fontWeight: 'bold',
  },
  nameInput: {
    padding: '0.3rem',
    width: '150px',
    fontSize: '0.9rem',
  },
  seqInput: {
    width: '100%',
    padding: '0.5rem',
    fontSize: '0.9rem',
    fontFamily: 'monospace',
    resize: 'vertical',
  },
  seqInfo: {
    fontSize: '0.85rem',
    color: '#666',
    marginTop: '0.25rem',
  },
  buttonRow: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1rem',
  },
  alignButton: {
    padding: '0.5rem 1.5rem',
    fontSize: '1rem',
    backgroundColor: '#0066cc',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  clearButton: {
    padding: '0.5rem 1rem',
    fontSize: '1rem',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  statsBox: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1rem',
    backgroundColor: '#f5f5f5',
    padding: '1rem',
    borderRadius: '4px',
    marginBottom: '1rem',
  },
  statItem: {
    minWidth: '150px',
  },
  identityValue: {
    color: '#0066cc',
    fontWeight: 'bold',
  },
  matchValue: {
    color: '#090',
  },
  mismatchValue: {
    color: '#c00',
  },
  gapValue: {
    color: '#666',
  },
  legend: {
    display: 'flex',
    gap: '2rem',
    marginBottom: '1rem',
    fontSize: '0.9rem',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  matchSymbol: {
    color: '#090',
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  mismatchSymbol: {
    color: '#c00',
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  gapSymbol: {
    color: '#999',
    fontFamily: 'monospace',
  },
  alignmentContainer: {
    backgroundColor: '#f9f9f9',
    padding: '1rem',
    borderRadius: '4px',
    overflowX: 'auto',
  },
  alignmentBlock: {
    marginBottom: '1rem',
  },
  alignmentLine: {
    display: 'flex',
    alignItems: 'center',
    fontFamily: 'monospace',
    fontSize: '0.9rem',
    lineHeight: '1.5',
  },
  seqLabel: {
    width: '80px',
    fontWeight: 'bold',
    flexShrink: 0,
  },
  position: {
    width: '60px',
    textAlign: 'right',
    paddingRight: '0.5rem',
    color: '#666',
    fontSize: '0.8rem',
    flexShrink: 0,
  },
  sequence: {
    letterSpacing: '1px',
  },
  symbols: {
    letterSpacing: '1px',
  },
  backLink: {
    marginTop: '2rem',
    paddingTop: '1rem',
    borderTop: '1px solid #ddd',
  },
};

export default SeqAlignmentPage;
