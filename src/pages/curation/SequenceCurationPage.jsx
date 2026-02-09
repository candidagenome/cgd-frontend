/**
 * Sequence Curation Page
 *
 * Insert, delete, or substitute nucleotides in chromosome/contig sequences.
 * Mirrors functionality from legacy UpdateRootSequence.pm.
 */
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import sequenceCurationApi from '../../api/sequenceCurationApi';

function SequenceCurationPage() {
  useAuth();

  const [assemblies, setAssemblies] = useState([]);
  const [selectedChromosome, setSelectedChromosome] = useState('');
  const [changes, setChanges] = useState([createEmptyChange()]);
  const [preview, setPreview] = useState(null);
  const [nearbyFeatures, setNearbyFeatures] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load root sequences on mount
  useEffect(() => {
    const loadRootSequences = async () => {
      try {
        const data = await sequenceCurationApi.getRootSequences();
        setAssemblies(data.assemblies || []);
      } catch {
        setError('Failed to load chromosomes/contigs');
      }
    };
    loadRootSequences();
  }, []);

  function createEmptyChange() {
    return {
      type: 'insertion',
      position: '',
      start: '',
      end: '',
      sequence: '',
    };
  }

  const handleAddChange = () => {
    setChanges([...changes, createEmptyChange()]);
  };

  const handleRemoveChange = (index) => {
    if (changes.length > 1) {
      setChanges(changes.filter((_, i) => i !== index));
    }
  };

  const handleChangeUpdate = (index, field, value) => {
    const updated = [...changes];
    updated[index] = { ...updated[index], [field]: value };
    setChanges(updated);
  };

  const handlePreview = useCallback(async () => {
    if (!selectedChromosome) {
      setError('Please select a chromosome/contig');
      return;
    }

    // Validate and prepare changes
    const validChanges = changes
      .filter((c) => {
        if (c.type === 'insertion') {
          return c.position && c.sequence;
        } else if (c.type === 'deletion') {
          return c.start && c.end;
        } else if (c.type === 'substitution') {
          return c.start && c.end && c.sequence;
        }
        return false;
      })
      .map((c) => ({
        type: c.type,
        position: c.position ? parseInt(c.position, 10) : undefined,
        start: c.start ? parseInt(c.start, 10) : undefined,
        end: c.end ? parseInt(c.end, 10) : undefined,
        sequence: c.sequence || undefined,
      }));

    if (validChanges.length === 0) {
      setError('Please enter at least one valid change');
      return;
    }

    setLoading(true);
    setError('');
    setPreview(null);

    try {
      const data = await sequenceCurationApi.previewChanges(
        selectedChromosome,
        validChanges
      );
      setPreview(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Preview failed');
    } finally {
      setLoading(false);
    }
  }, [selectedChromosome, changes]);

  const handleLookupNearby = useCallback(async (position) => {
    if (!selectedChromosome || !position) return;

    try {
      const data = await sequenceCurationApi.getNearbyFeatures(
        selectedChromosome,
        parseInt(position, 10)
      );
      setNearbyFeatures(data);
    } catch (err) {
      console.error('Failed to load nearby features:', err);
    }
  }, [selectedChromosome]);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Update Chromosome Sequence</h1>

      <div style={styles.warningBox}>
        <strong>Warning:</strong> This tool modifies chromosome/contig sequences
        and updates coordinates for all affected features. Please verify your
        changes carefully before committing.
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {/* Chromosome Selection */}
      <div style={styles.section}>
        <h2 style={styles.sectionHeader}>Select Chromosome/Contig</h2>
        <select
          value={selectedChromosome}
          onChange={(e) => setSelectedChromosome(e.target.value)}
          style={styles.select}
        >
          <option value="">-- Choose chromosome/contig --</option>
          {assemblies.map((assembly) => (
            <optgroup key={assembly.assembly} label={assembly.assembly}>
              {assembly.sequences.map((seq) => (
                <option key={seq.feature_name} value={seq.feature_name}>
                  {seq.feature_name} ({seq.seq_length.toLocaleString()} bp)
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {/* Changes Form */}
      <div style={styles.section}>
        <h2 style={styles.sectionHeader}>Sequence Changes</h2>
        <p style={styles.instructions}>
          Enter insertions, deletions, or substitutions. Coordinates are 1-based.
        </p>

        {changes.map((change, index) => (
          <div key={index} style={styles.changeRow}>
            <div style={styles.changeHeader}>
              <span style={styles.changeNumber}>Change {index + 1}</span>
              {changes.length > 1 && (
                <button
                  onClick={() => handleRemoveChange(index)}
                  style={styles.removeButton}
                >
                  Remove
                </button>
              )}
            </div>

            <div style={styles.changeFields}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Type:</label>
                <select
                  value={change.type}
                  onChange={(e) => handleChangeUpdate(index, 'type', e.target.value)}
                  style={styles.typeSelect}
                >
                  <option value="insertion">Insertion</option>
                  <option value="deletion">Deletion</option>
                  <option value="substitution">Substitution</option>
                </select>
              </div>

              {change.type === 'insertion' && (
                <>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Insert after position:</label>
                    <input
                      type="number"
                      value={change.position}
                      onChange={(e) => handleChangeUpdate(index, 'position', e.target.value)}
                      style={styles.coordInput}
                      placeholder="e.g., 1000"
                    />
                    <button
                      onClick={() => handleLookupNearby(change.position)}
                      style={styles.lookupButton}
                      disabled={!change.position}
                    >
                      Nearby
                    </button>
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Sequence to insert:</label>
                    <textarea
                      value={change.sequence}
                      onChange={(e) => handleChangeUpdate(index, 'sequence', e.target.value.toUpperCase())}
                      style={styles.seqInput}
                      placeholder="ACGT..."
                      rows={2}
                    />
                  </div>
                </>
              )}

              {change.type === 'deletion' && (
                <>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Delete from:</label>
                    <input
                      type="number"
                      value={change.start}
                      onChange={(e) => handleChangeUpdate(index, 'start', e.target.value)}
                      style={styles.coordInput}
                      placeholder="Start"
                    />
                    <label style={styles.label}>to:</label>
                    <input
                      type="number"
                      value={change.end}
                      onChange={(e) => handleChangeUpdate(index, 'end', e.target.value)}
                      style={styles.coordInput}
                      placeholder="End"
                    />
                    <button
                      onClick={() => handleLookupNearby(change.start)}
                      style={styles.lookupButton}
                      disabled={!change.start}
                    >
                      Nearby
                    </button>
                  </div>
                </>
              )}

              {change.type === 'substitution' && (
                <>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Replace from:</label>
                    <input
                      type="number"
                      value={change.start}
                      onChange={(e) => handleChangeUpdate(index, 'start', e.target.value)}
                      style={styles.coordInput}
                      placeholder="Start"
                    />
                    <label style={styles.label}>to:</label>
                    <input
                      type="number"
                      value={change.end}
                      onChange={(e) => handleChangeUpdate(index, 'end', e.target.value)}
                      style={styles.coordInput}
                      placeholder="End"
                    />
                    <button
                      onClick={() => handleLookupNearby(change.start)}
                      style={styles.lookupButton}
                      disabled={!change.start}
                    >
                      Nearby
                    </button>
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>New sequence:</label>
                    <textarea
                      value={change.sequence}
                      onChange={(e) => handleChangeUpdate(index, 'sequence', e.target.value.toUpperCase())}
                      style={styles.seqInput}
                      placeholder="ACGT..."
                      rows={2}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        ))}

        <div style={styles.buttonRow}>
          <button onClick={handleAddChange} style={styles.addButton}>
            + Add Another Change
          </button>
          <button
            onClick={handlePreview}
            disabled={loading || !selectedChromosome}
            style={styles.previewButton}
          >
            {loading ? 'Loading...' : 'Preview Changes'}
          </button>
        </div>
      </div>

      {/* Nearby Features */}
      {nearbyFeatures && (
        <div style={styles.section}>
          <h2 style={styles.sectionHeader}>
            Nearby Features (around position {nearbyFeatures.position})
          </h2>
          {nearbyFeatures.features.length > 0 ? (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Feature</th>
                  <th style={styles.th}>Gene</th>
                  <th style={styles.th}>Type</th>
                  <th style={styles.th}>Start</th>
                  <th style={styles.th}>Stop</th>
                  <th style={styles.th}>Strand</th>
                </tr>
              </thead>
              <tbody>
                {nearbyFeatures.features.map((f) => (
                  <tr key={f.feature_no} style={styles.tr}>
                    <td style={styles.td}>
                      <Link to={`/locus/${f.feature_name}`}>{f.feature_name}</Link>
                    </td>
                    <td style={styles.td}>{f.gene_name || '-'}</td>
                    <td style={styles.td}>{f.feature_type}</td>
                    <td style={styles.td}>{f.start_coord.toLocaleString()}</td>
                    <td style={styles.td}>{f.stop_coord.toLocaleString()}</td>
                    <td style={styles.td}>{f.strand}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No features found in the specified range.</p>
          )}
        </div>
      )}

      {/* Preview Results */}
      {preview && (
        <div style={styles.section}>
          <h2 style={styles.sectionHeader}>Preview Results</h2>

          <div style={styles.summaryBox}>
            <p>
              <strong>Chromosome:</strong> {preview.feature_name}
            </p>
            <p>
              <strong>Current length:</strong> {preview.old_length.toLocaleString()} bp
            </p>
            <p>
              <strong>New length:</strong> {preview.new_length.toLocaleString()} bp
            </p>
            <p>
              <strong>Net change:</strong>{' '}
              <span style={preview.net_change >= 0 ? styles.positive : styles.negative}>
                {preview.net_change >= 0 ? '+' : ''}{preview.net_change} bp
              </span>
            </p>
          </div>

          <h3 style={styles.subsectionHeader}>Change Details</h3>
          {preview.changes.map((c, i) => (
            <div key={i} style={styles.changeDetail}>
              <strong>
                {c.type.charAt(0).toUpperCase() + c.type.slice(1)}
                {c.type === 'insertion' && ` after position ${c.position}`}
                {(c.type === 'deletion' || c.type === 'substitution') &&
                  ` from ${c.start} to ${c.end}`}
              </strong>
              {c.deleted_sequence && (
                <p>Deleted: <code style={styles.seqCode}>{c.deleted_sequence}</code></p>
              )}
              {c.old_sequence && (
                <p>Old: <code style={styles.seqCode}>{c.old_sequence}</code></p>
              )}
              {c.sequence && (
                <p>Inserted: <code style={styles.seqCode}>{c.sequence}</code></p>
              )}
              {c.new_sequence && (
                <p>New: <code style={styles.seqCode}>{c.new_sequence}</code></p>
              )}
            </div>
          ))}

          <h3 style={styles.subsectionHeader}>
            Affected Features ({preview.affected_features.length})
          </h3>
          {preview.affected_features.length > 0 ? (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Feature</th>
                  <th style={styles.th}>Type</th>
                  <th style={styles.th}>Current Coords</th>
                  <th style={styles.th}>New Coords</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {preview.affected_features.map((f) => (
                  <tr
                    key={f.feature_no}
                    style={f.is_overlapping ? styles.overlappingRow : styles.tr}
                  >
                    <td style={styles.td}>
                      <Link to={`/locus/${f.feature_name}`}>{f.feature_name}</Link>
                      {f.gene_name && ` (${f.gene_name})`}
                    </td>
                    <td style={styles.td}>{f.feature_type}</td>
                    <td style={styles.td}>
                      {f.start_coord.toLocaleString()}-{f.stop_coord.toLocaleString()} ({f.strand})
                    </td>
                    <td style={styles.td}>
                      {f.new_start.toLocaleString()}-{f.new_stop.toLocaleString()}
                    </td>
                    <td style={styles.td}>
                      {f.is_overlapping ? (
                        <span style={styles.warningText}>Overlapping - Review needed</span>
                      ) : (
                        <span>Coordinate shift</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No features affected.</p>
          )}

          <div style={styles.noticeBox}>
            <strong>Note:</strong> The commit functionality will be implemented
            in a future update. For now, please use this preview to verify your
            planned changes and coordinate with database administrators for actual
            sequence modifications.
          </div>
        </div>
      )}

      <div style={styles.backLink}>
        <Link to="/curation">Back to Curator Central</Link>
      </div>
    </div>
  );
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
  warningBox: {
    padding: '1rem',
    backgroundColor: '#fff3cd',
    border: '1px solid #ffc107',
    borderRadius: '4px',
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
  subsectionHeader: {
    fontSize: '1rem',
    marginTop: '1.5rem',
    marginBottom: '0.5rem',
    borderBottom: '1px solid #ccc',
    paddingBottom: '0.25rem',
  },
  select: {
    width: '100%',
    maxWidth: '500px',
    padding: '0.5rem',
    fontSize: '1rem',
  },
  instructions: {
    color: '#666',
    marginBottom: '1rem',
  },
  changeRow: {
    border: '1px solid #ddd',
    borderRadius: '4px',
    padding: '1rem',
    marginBottom: '1rem',
    backgroundColor: '#f9f9f9',
  },
  changeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
  },
  changeNumber: {
    fontWeight: 'bold',
  },
  removeButton: {
    padding: '0.25rem 0.5rem',
    fontSize: '0.85rem',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
  },
  changeFields: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  fieldGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  label: {
    fontWeight: 'bold',
    minWidth: '120px',
  },
  typeSelect: {
    padding: '0.4rem',
    fontSize: '1rem',
  },
  coordInput: {
    width: '120px',
    padding: '0.4rem',
    fontSize: '1rem',
  },
  seqInput: {
    flex: 1,
    minWidth: '300px',
    padding: '0.4rem',
    fontSize: '0.9rem',
    fontFamily: 'monospace',
  },
  lookupButton: {
    padding: '0.4rem 0.75rem',
    fontSize: '0.85rem',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
  },
  buttonRow: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1rem',
  },
  addButton: {
    padding: '0.5rem 1rem',
    fontSize: '0.95rem',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  previewButton: {
    padding: '0.5rem 1.5rem',
    fontSize: '1rem',
    backgroundColor: '#0066cc',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.9rem',
  },
  th: {
    backgroundColor: '#e0e0e0',
    padding: '0.5rem',
    textAlign: 'left',
    borderBottom: '2px solid #999',
  },
  tr: {
    borderBottom: '1px solid #ddd',
  },
  overlappingRow: {
    borderBottom: '1px solid #ddd',
    backgroundColor: '#fff3cd',
  },
  td: {
    padding: '0.5rem',
    verticalAlign: 'top',
  },
  summaryBox: {
    backgroundColor: '#f5f5f5',
    padding: '1rem',
    borderRadius: '4px',
    marginBottom: '1rem',
  },
  positive: {
    color: '#28a745',
  },
  negative: {
    color: '#dc3545',
  },
  changeDetail: {
    backgroundColor: '#f9f9f9',
    padding: '0.75rem',
    borderRadius: '4px',
    marginBottom: '0.5rem',
    border: '1px solid #ddd',
  },
  seqCode: {
    backgroundColor: '#e9ecef',
    padding: '0.2rem 0.4rem',
    borderRadius: '3px',
    fontFamily: 'monospace',
    fontSize: '0.85rem',
    wordBreak: 'break-all',
  },
  warningText: {
    color: '#856404',
    fontWeight: 'bold',
  },
  noticeBox: {
    padding: '1rem',
    backgroundColor: '#d1ecf1',
    border: '1px solid #bee5eb',
    borderRadius: '4px',
    marginTop: '1.5rem',
  },
  backLink: {
    marginTop: '2rem',
    paddingTop: '1rem',
    borderTop: '1px solid #ddd',
  },
};

export default SequenceCurationPage;
