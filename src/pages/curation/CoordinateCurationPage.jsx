/**
 * Coordinate and Relationship Curation Page
 *
 * Update feature coordinates and parent/child relationships.
 * Mirrors functionality from legacy UpdateCoordRelation.pm.
 */
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import coordinateCurationApi from '../../api/coordinateCurationApi';

function CoordinateCurationPage() {
  useAuth();

  const [seqSources, setSeqSources] = useState([]);
  const [selectedSource, setSelectedSource] = useState('');
  const [featureQuery, setFeatureQuery] = useState('');
  const [featureInfo, setFeatureInfo] = useState(null);
  const [editedCoords, setEditedCoords] = useState({});
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load seq sources on mount
  useEffect(() => {
    const loadSeqSources = async () => {
      try {
        const data = await coordinateCurationApi.getSeqSources();
        setSeqSources(data.sources || []);
        if (data.sources && data.sources.length > 0) {
          setSelectedSource(data.sources[0]);
        }
      } catch {
        setError('Failed to load assemblies');
      }
    };
    loadSeqSources();
  }, []);

  const handleLoadFeature = useCallback(async () => {
    if (!featureQuery) {
      setError('Please enter a feature name');
      return;
    }
    if (!selectedSource) {
      setError('Please select an assembly');
      return;
    }

    setLoading(true);
    setError('');
    setFeatureInfo(null);
    setEditedCoords({});
    setPreview(null);

    try {
      const data = await coordinateCurationApi.getFeatureInfo(
        featureQuery,
        selectedSource
      );
      setFeatureInfo(data);

      // Initialize edited coordinates
      const coords = {};
      if (data.location) {
        coords[data.feature_no] = {
          start_coord: data.location.start_coord,
          stop_coord: data.location.stop_coord,
          strand: data.location.strand,
        };
      }
      data.subfeatures.forEach((sub) => {
        if (sub.start_coord) {
          coords[sub.feature_no] = {
            start_coord: sub.start_coord,
            stop_coord: sub.stop_coord,
            strand: sub.strand,
          };
        }
      });
      setEditedCoords(coords);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load feature');
    } finally {
      setLoading(false);
    }
  }, [featureQuery, selectedSource]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLoadFeature();
    }
  };

  const handleCoordChange = (featureNo, field, value) => {
    setEditedCoords((prev) => ({
      ...prev,
      [featureNo]: {
        ...prev[featureNo],
        [field]: field === 'strand' ? value : parseInt(value, 10) || '',
      },
    }));
  };

  const handlePreview = useCallback(async () => {
    if (!featureInfo || !selectedSource) return;

    // Build changes array
    const changes = Object.entries(editedCoords).map(([featureNo, coords]) => ({
      feature_no: parseInt(featureNo, 10),
      ...coords,
    }));

    setLoading(true);
    setError('');

    try {
      const data = await coordinateCurationApi.previewChanges(
        featureInfo.feature_name,
        selectedSource,
        changes
      );
      setPreview(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Preview failed');
    } finally {
      setLoading(false);
    }
  }, [featureInfo, selectedSource, editedCoords]);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Update Feature Coordinates and Relationships</h1>

      <p style={styles.description}>
        This interface allows you to change the chromosomal coordinates for a
        feature and its subfeatures, and to update their relationships.
      </p>

      {error && <div style={styles.error}>{error}</div>}

      {/* Search Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionHeader}>Select Feature</h2>
        <div style={styles.searchRow}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Feature name:</label>
            <input
              type="text"
              value={featureQuery}
              onChange={(e) => setFeatureQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter feature or gene name"
              style={styles.input}
            />
          </div>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Assembly:</label>
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              style={styles.select}
            >
              {seqSources.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleLoadFeature}
            disabled={loading || !featureQuery}
            style={styles.button}
          >
            {loading ? 'Loading...' : 'Load Feature'}
          </button>
        </div>
      </div>

      {/* Feature Info Section */}
      {featureInfo && (
        <div style={styles.section}>
          <h2 style={styles.sectionHeader}>
            Feature: {featureInfo.feature_name}
            {featureInfo.gene_name && ` (${featureInfo.gene_name})`}
          </h2>

          <div style={styles.infoBox}>
            <p><strong>Type:</strong> {featureInfo.feature_type}</p>
            <p><strong>CGDID:</strong> {featureInfo.dbxref_id}</p>
            {featureInfo.headline && (
              <p><strong>Description:</strong> {featureInfo.headline}</p>
            )}
            {featureInfo.root_feature_name && (
              <p><strong>Chromosome:</strong> {featureInfo.root_feature_name}</p>
            )}
          </div>

          {/* Coordinates Table */}
          <h3 style={styles.subsectionHeader}>Coordinates and Subfeatures</h3>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Feature</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Relationship</th>
                <th style={styles.th}>Start</th>
                <th style={styles.th}>Stop</th>
                <th style={styles.th}>Strand</th>
              </tr>
            </thead>
            <tbody>
              {/* Main feature */}
              <tr style={styles.mainFeatureRow}>
                <td style={styles.td}>
                  <strong>
                    <Link to={`/locus/${featureInfo.feature_name}`}>
                      {featureInfo.feature_name}
                    </Link>
                  </strong>
                </td>
                <td style={styles.td}>{featureInfo.feature_type}</td>
                <td style={styles.td}>self</td>
                <td style={styles.td}>
                  {editedCoords[featureInfo.feature_no] ? (
                    <input
                      type="number"
                      value={editedCoords[featureInfo.feature_no]?.start_coord || ''}
                      onChange={(e) =>
                        handleCoordChange(featureInfo.feature_no, 'start_coord', e.target.value)
                      }
                      style={styles.coordInput}
                    />
                  ) : (
                    '-'
                  )}
                </td>
                <td style={styles.td}>
                  {editedCoords[featureInfo.feature_no] ? (
                    <input
                      type="number"
                      value={editedCoords[featureInfo.feature_no]?.stop_coord || ''}
                      onChange={(e) =>
                        handleCoordChange(featureInfo.feature_no, 'stop_coord', e.target.value)
                      }
                      style={styles.coordInput}
                    />
                  ) : (
                    '-'
                  )}
                </td>
                <td style={styles.td}>
                  {editedCoords[featureInfo.feature_no] ? (
                    <select
                      value={editedCoords[featureInfo.feature_no]?.strand || ''}
                      onChange={(e) =>
                        handleCoordChange(featureInfo.feature_no, 'strand', e.target.value)
                      }
                      style={styles.strandSelect}
                    >
                      <option value="W">W (Watson)</option>
                      <option value="C">C (Crick)</option>
                    </select>
                  ) : (
                    '-'
                  )}
                </td>
              </tr>

              {/* Subfeatures */}
              {featureInfo.subfeatures.map((sub) => (
                <tr key={sub.feature_no} style={styles.tr}>
                  <td style={styles.td}>{sub.feature_name}</td>
                  <td style={styles.td}>{sub.feature_type}</td>
                  <td style={styles.td}>
                    {sub.relationship_type}
                    {sub.rank && ` (rank: ${sub.rank})`}
                  </td>
                  <td style={styles.td}>
                    {editedCoords[sub.feature_no] ? (
                      <input
                        type="number"
                        value={editedCoords[sub.feature_no]?.start_coord || ''}
                        onChange={(e) =>
                          handleCoordChange(sub.feature_no, 'start_coord', e.target.value)
                        }
                        style={styles.coordInput}
                      />
                    ) : (
                      sub.start_coord || '-'
                    )}
                  </td>
                  <td style={styles.td}>
                    {editedCoords[sub.feature_no] ? (
                      <input
                        type="number"
                        value={editedCoords[sub.feature_no]?.stop_coord || ''}
                        onChange={(e) =>
                          handleCoordChange(sub.feature_no, 'stop_coord', e.target.value)
                        }
                        style={styles.coordInput}
                      />
                    ) : (
                      sub.stop_coord || '-'
                    )}
                  </td>
                  <td style={styles.td}>
                    {editedCoords[sub.feature_no] ? (
                      <select
                        value={editedCoords[sub.feature_no]?.strand || ''}
                        onChange={(e) =>
                          handleCoordChange(sub.feature_no, 'strand', e.target.value)
                        }
                        style={styles.strandSelect}
                      >
                        <option value="W">W</option>
                        <option value="C">C</option>
                      </select>
                    ) : (
                      sub.strand || '-'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Parents Section */}
          {featureInfo.parents.length > 0 && (
            <>
              <h3 style={styles.subsectionHeader}>Parent Features</h3>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Feature</th>
                    <th style={styles.th}>Gene</th>
                    <th style={styles.th}>Type</th>
                    <th style={styles.th}>Relationship</th>
                    <th style={styles.th}>Coordinates</th>
                  </tr>
                </thead>
                <tbody>
                  {featureInfo.parents.map((parent) => (
                    <tr key={parent.feature_no} style={styles.tr}>
                      <td style={styles.td}>
                        <Link to={`/locus/${parent.feature_name}`}>
                          {parent.feature_name}
                        </Link>
                      </td>
                      <td style={styles.td}>{parent.gene_name || '-'}</td>
                      <td style={styles.td}>{parent.feature_type}</td>
                      <td style={styles.td}>
                        {parent.relationship_type}
                        {parent.rank && ` (rank: ${parent.rank})`}
                      </td>
                      <td style={styles.td}>
                        {parent.start_coord && parent.stop_coord
                          ? `${parent.start_coord.toLocaleString()}-${parent.stop_coord.toLocaleString()} (${parent.strand})`
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          <div style={styles.buttonRow}>
            <button onClick={handlePreview} disabled={loading} style={styles.previewButton}>
              Preview Changes
            </button>
          </div>
        </div>
      )}

      {/* Preview Section */}
      {preview && (
        <div style={styles.section}>
          <h2 style={styles.sectionHeader}>Preview Changes</h2>

          {preview.change_count > 0 ? (
            <>
              <p>{preview.change_count} coordinate change(s) detected:</p>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Feature</th>
                    <th style={styles.th}>Old Coordinates</th>
                    <th style={styles.th}>New Coordinates</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.changes.map((change) => (
                    <tr key={change.feature_no} style={styles.tr}>
                      <td style={styles.td}>{change.feature_name}</td>
                      <td style={styles.td}>
                        {change.old_start.toLocaleString()}-{change.old_stop.toLocaleString()} ({change.old_strand})
                      </td>
                      <td style={styles.td}>
                        <span style={styles.newValue}>
                          {change.new_start.toLocaleString()}-{change.new_stop.toLocaleString()} ({change.new_strand})
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            <p>No coordinate changes detected.</p>
          )}

          <div style={styles.noticeBox}>
            <strong>Note:</strong> The commit functionality will be implemented
            in a future update. For now, please use this preview to verify your
            planned changes and coordinate with database administrators.
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
  subsectionHeader: {
    fontSize: '1rem',
    marginTop: '1.5rem',
    marginBottom: '0.5rem',
    borderBottom: '1px solid #ccc',
    paddingBottom: '0.25rem',
  },
  searchRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  label: {
    fontWeight: 'bold',
    fontSize: '0.9rem',
  },
  input: {
    padding: '0.5rem',
    fontSize: '1rem',
    width: '250px',
  },
  select: {
    padding: '0.5rem',
    fontSize: '1rem',
    minWidth: '200px',
  },
  button: {
    padding: '0.5rem 1.5rem',
    fontSize: '1rem',
    backgroundColor: '#0066cc',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  infoBox: {
    backgroundColor: '#f5f5f5',
    padding: '1rem',
    borderRadius: '4px',
    marginBottom: '1rem',
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
  mainFeatureRow: {
    borderBottom: '1px solid #ddd',
    backgroundColor: '#fffde7',
  },
  td: {
    padding: '0.5rem',
    verticalAlign: 'middle',
  },
  coordInput: {
    width: '100px',
    padding: '0.3rem',
    fontSize: '0.9rem',
  },
  strandSelect: {
    padding: '0.3rem',
    fontSize: '0.9rem',
  },
  buttonRow: {
    marginTop: '1.5rem',
  },
  previewButton: {
    padding: '0.5rem 1.5rem',
    fontSize: '1rem',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  newValue: {
    color: '#28a745',
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

export default CoordinateCurationPage;
