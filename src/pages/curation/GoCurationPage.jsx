/**
 * GO Curation Page
 *
 * Full GO annotation curation interface for a feature.
 * - Display existing annotations grouped by aspect (F/P/C)
 * - Add new annotations with validation
 * - Mark annotations as reviewed
 * - Delete annotations
 *
 * Mirrors legacy goCuration CGI functionality.
 */
import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import goCurationApi from '../../api/goCurationApi';

function GoCurationPage() {
  const { featureName } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Search form state (when no feature specified)
  const [searchQuery, setSearchQuery] = useState('');

  // Feature and annotations state
  const [featureData, setFeatureData] = useState(null);
  const [loading, setLoading] = useState(!!featureName); // Only loading if we have a feature
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // New annotation form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [evidenceCodes, setEvidenceCodes] = useState([]);
  const [newAnnotation, setNewAnnotation] = useState({
    goid: '',
    evidence: '',
    reference_no: '',
    qualifiers: [],
    ic_from_goid: '',
  });
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Load feature annotations
  const loadAnnotations = useCallback(async () => {
    if (!featureName) return;

    setLoading(true);
    setError(null);

    try {
      const data = await goCurationApi.getAnnotations(featureName);
      setFeatureData(data);
    } catch (err) {
      if (err.response?.status === 404) {
        setError(`Feature '${featureName}' not found`);
      } else {
        setError('Failed to load GO annotations');
      }
    } finally {
      setLoading(false);
    }
  }, [featureName]);

  // Load evidence codes
  useEffect(() => {
    const loadEvidenceCodes = async () => {
      try {
        const data = await goCurationApi.getEvidenceCodes();
        setEvidenceCodes(data.evidence_codes);
      } catch (err) {
        console.error('Failed to load evidence codes:', err);
      }
    };

    loadEvidenceCodes();
  }, []);

  // Load annotations on mount and when featureName changes
  useEffect(() => {
    loadAnnotations();
  }, [loadAnnotations]);

  // Group annotations by aspect
  const annotationsByAspect = featureData?.annotations?.reduce((acc, ann) => {
    const aspect = ann.go_aspect || 'Unknown';
    if (!acc[aspect]) acc[aspect] = [];
    acc[aspect].push(ann);
    return acc;
  }, {}) || {};

  // Handle mark as reviewed
  const handleMarkReviewed = async (annotationNo) => {
    try {
      await goCurationApi.markAsReviewed(annotationNo);
      setSuccessMessage('Annotation marked as reviewed');
      loadAnnotations();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError('Failed to mark annotation as reviewed');
    }
  };

  // Handle delete annotation
  const handleDelete = async (annotationNo) => {
    if (!window.confirm('Are you sure you want to delete this annotation?')) {
      return;
    }

    try {
      await goCurationApi.deleteAnnotation(annotationNo);
      setSuccessMessage('Annotation deleted');
      loadAnnotations();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete annotation');
    }
  };

  // Handle new annotation form change
  const handleFormChange = (field, value) => {
    setNewAnnotation((prev) => ({ ...prev, [field]: value }));
    setFormError(null);
  };

  // Handle create annotation
  const handleCreateAnnotation = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      // Validate required fields
      if (!newAnnotation.goid) {
        throw new Error('GO ID is required');
      }
      if (!newAnnotation.evidence) {
        throw new Error('Evidence code is required');
      }
      if (!newAnnotation.reference_no) {
        throw new Error('Reference number is required');
      }

      // Validate IC evidence requires from GOid
      if (newAnnotation.evidence === 'IC' && !newAnnotation.ic_from_goid) {
        throw new Error('IC evidence requires "from GO ID" value');
      }

      const data = {
        goid: parseInt(newAnnotation.goid, 10),
        evidence: newAnnotation.evidence,
        reference_no: parseInt(newAnnotation.reference_no, 10),
      };

      if (newAnnotation.qualifiers.length > 0) {
        data.qualifiers = newAnnotation.qualifiers;
      }

      if (newAnnotation.ic_from_goid) {
        data.ic_from_goid = parseInt(newAnnotation.ic_from_goid, 10);
      }

      await goCurationApi.createAnnotation(featureName, data);

      setSuccessMessage('Annotation created successfully');
      setShowAddForm(false);
      setNewAnnotation({
        goid: '',
        evidence: '',
        reference_no: '',
        qualifiers: [],
        ic_from_goid: '',
      });
      loadAnnotations();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setFormError(err.response?.data?.detail || err.message || 'Failed to create annotation');
    } finally {
      setSubmitting(false);
    }
  };

  // Aspect display names
  const aspectNames = {
    function: 'Molecular Function (F)',
    process: 'Biological Process (P)',
    component: 'Cellular Component (C)',
  };

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/curation/go/${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Show search form when no feature is specified
  if (!featureName) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1>GO Curation</h1>
          <div style={styles.headerRight}>
            <span>Curator: {user?.first_name} {user?.last_name}</span>
            <Link to="/curation/go/todo" style={styles.headerLink}>
              GO Todo List
            </Link>
            <Link to="/curation" style={styles.headerLink}>
              Curator Central
            </Link>
          </div>
        </div>

        <div style={styles.searchContainer}>
          <h2>Search for a Feature</h2>
          <p style={styles.searchHint}>
            Enter a feature name (systematic name or gene name) to view and edit its GO annotations.
          </p>
          <form onSubmit={handleSearch} style={styles.searchForm}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g., orf19.123 or ACT1"
              style={styles.searchInput}
              autoFocus
            />
            <button type="submit" style={styles.searchButton}>
              Search
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading GO annotations...</div>
      </div>
    );
  }

  if (error && !featureData) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>{error}</div>
        <Link to="/curation">Back to Curator Central</Link>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>GO Curation: {featureData?.feature_name}</h1>
        <div style={styles.headerRight}>
          <span>Curator: {user?.first_name} {user?.last_name}</span>
          <Link to="/curation/go/todo" style={styles.headerLink}>
            GO Todo List
          </Link>
          <Link to="/curation" style={styles.headerLink}>
            Curator Central
          </Link>
        </div>
      </div>

      {featureData?.gene_name && (
        <p style={styles.subtitle}>
          Gene: <strong>{featureData.gene_name}</strong>
          {' | '}
          <Link to={`/locus/${featureData.feature_name}`}>View Locus Page</Link>
        </p>
      )}

      {successMessage && <div style={styles.success}>{successMessage}</div>}
      {error && <div style={styles.error}>{error}</div>}

      {/* Add Annotation Button */}
      <div style={styles.actions}>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={styles.addButton}
        >
          {showAddForm ? 'Cancel' : '+ Add New GO Annotation'}
        </button>
      </div>

      {/* Add Annotation Form */}
      {showAddForm && (
        <div style={styles.formContainer}>
          <h3>Add New GO Annotation</h3>
          {formError && <div style={styles.formError}>{formError}</div>}

          <form onSubmit={handleCreateAnnotation} style={styles.form}>
            <div style={styles.formRow}>
              <label style={styles.formLabel}>
                GO ID: <span style={styles.required}>*</span>
              </label>
              <input
                type="number"
                value={newAnnotation.goid}
                onChange={(e) => handleFormChange('goid', e.target.value)}
                placeholder="e.g., 5515"
                style={styles.formInput}
                required
              />
              <span style={styles.formHint}>Enter GO ID without "GO:" prefix</span>
            </div>

            <div style={styles.formRow}>
              <label style={styles.formLabel}>
                Evidence Code: <span style={styles.required}>*</span>
              </label>
              <select
                value={newAnnotation.evidence}
                onChange={(e) => handleFormChange('evidence', e.target.value)}
                style={styles.formSelect}
                required
              >
                <option value="">Select evidence code...</option>
                {evidenceCodes.map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </select>
            </div>

            {newAnnotation.evidence === 'IC' && (
              <div style={styles.formRow}>
                <label style={styles.formLabel}>
                  From GO ID: <span style={styles.required}>*</span>
                </label>
                <input
                  type="number"
                  value={newAnnotation.ic_from_goid}
                  onChange={(e) => handleFormChange('ic_from_goid', e.target.value)}
                  placeholder="GO ID for IC inference"
                  style={styles.formInput}
                  required
                />
              </div>
            )}

            <div style={styles.formRow}>
              <label style={styles.formLabel}>
                Reference #: <span style={styles.required}>*</span>
              </label>
              <input
                type="number"
                value={newAnnotation.reference_no}
                onChange={(e) => handleFormChange('reference_no', e.target.value)}
                placeholder="Reference number"
                style={styles.formInput}
                required
              />
            </div>

            <div style={styles.formRow}>
              <label style={styles.formLabel}>Qualifiers:</label>
              <div style={styles.checkboxGroup}>
                {['NOT', 'contributes_to', 'colocalizes_with'].map((q) => (
                  <label key={q} style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={newAnnotation.qualifiers.includes(q)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleFormChange('qualifiers', [...newAnnotation.qualifiers, q]);
                        } else {
                          handleFormChange(
                            'qualifiers',
                            newAnnotation.qualifiers.filter((x) => x !== q)
                          );
                        }
                      }}
                    />
                    {q}
                  </label>
                ))}
              </div>
            </div>

            <div style={styles.formButtons}>
              <button
                type="submit"
                disabled={submitting}
                style={styles.submitButton}
              >
                {submitting ? 'Creating...' : 'Create Annotation'}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                style={styles.cancelButton}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Existing Annotations */}
      <div style={styles.annotations}>
        <h2>Existing GO Annotations ({featureData?.annotations?.length || 0})</h2>

        {Object.entries(annotationsByAspect).length === 0 ? (
          <p style={styles.noAnnotations}>No GO annotations found for this feature.</p>
        ) : (
          Object.entries(annotationsByAspect).map(([aspect, annotations]) => (
            <section key={aspect} style={styles.aspectSection}>
              <h3 style={styles.aspectHeader}>
                {aspectNames[aspect] || aspect} ({annotations.length})
              </h3>

              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>GO ID</th>
                    <th style={styles.th}>Term</th>
                    <th style={styles.th}>Evidence</th>
                    <th style={styles.th}>References</th>
                    <th style={styles.th}>Last Reviewed</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {annotations.map((ann) => (
                    <tr key={ann.go_annotation_no}>
                      <td style={styles.td}>
                        <a
                          href={`http://amigo.geneontology.org/amigo/term/GO:${String(ann.goid).padStart(7, '0')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          GO:{String(ann.goid).padStart(7, '0')}
                        </a>
                      </td>
                      <td style={styles.td}>{ann.go_term}</td>
                      <td style={styles.td}>{ann.go_evidence}</td>
                      <td style={styles.td}>
                        {ann.references?.map((ref, idx) => (
                          <div key={ref.go_ref_no}>
                            <Link to={`/reference/${ref.reference_no}`}>
                              {ref.pubmed ? `PMID:${ref.pubmed}` : `Ref:${ref.reference_no}`}
                            </Link>
                            {ref.qualifiers?.length > 0 && (
                              <span style={styles.qualifiers}>
                                {' '}({ref.qualifiers.join(', ')})
                              </span>
                            )}
                          </div>
                        ))}
                      </td>
                      <td style={styles.td}>
                        {ann.date_last_reviewed?.split('T')[0] || '-'}
                      </td>
                      <td style={styles.td}>
                        <button
                          onClick={() => handleMarkReviewed(ann.go_annotation_no)}
                          style={styles.actionButton}
                          title="Mark as reviewed (update date)"
                        >
                          Review
                        </button>
                        <button
                          onClick={() => handleDelete(ann.go_annotation_no)}
                          style={styles.deleteButton}
                          title="Delete annotation"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '1rem auto',
    padding: '1rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
    borderBottom: '2px solid #333',
    paddingBottom: '0.5rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    fontSize: '0.9rem',
  },
  headerLink: {
    padding: '0.25rem 0.5rem',
    backgroundColor: '#f0f0f0',
    borderRadius: '4px',
    textDecoration: 'none',
  },
  subtitle: {
    marginBottom: '1rem',
    color: '#666',
  },
  loading: {
    padding: '2rem',
    textAlign: 'center',
    color: '#666',
  },
  error: {
    padding: '1rem',
    backgroundColor: '#fee',
    border: '1px solid #fcc',
    borderRadius: '4px',
    color: '#c00',
    marginBottom: '1rem',
  },
  success: {
    padding: '1rem',
    backgroundColor: '#efe',
    border: '1px solid #cfc',
    borderRadius: '4px',
    color: '#060',
    marginBottom: '1rem',
  },
  actions: {
    marginBottom: '1rem',
  },
  addButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#337ab7',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  formContainer: {
    padding: '1rem',
    backgroundColor: '#f9f9f9',
    border: '1px solid #ddd',
    borderRadius: '4px',
    marginBottom: '1.5rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  formRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.5rem',
  },
  formLabel: {
    width: '120px',
    fontWeight: 'bold',
    paddingTop: '0.5rem',
  },
  required: {
    color: '#c00',
  },
  formInput: {
    padding: '0.5rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    width: '200px',
  },
  formSelect: {
    padding: '0.5rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    width: '200px',
  },
  formHint: {
    fontSize: '0.85rem',
    color: '#666',
    paddingTop: '0.5rem',
  },
  checkboxGroup: {
    display: 'flex',
    gap: '1rem',
    paddingTop: '0.5rem',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  formButtons: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '0.5rem',
  },
  submitButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#5cb85c',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  cancelButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#999',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  formError: {
    padding: '0.5rem',
    backgroundColor: '#fee',
    border: '1px solid #fcc',
    borderRadius: '4px',
    color: '#c00',
    marginBottom: '1rem',
  },
  annotations: {
    marginTop: '1.5rem',
  },
  aspectSection: {
    marginBottom: '1.5rem',
  },
  aspectHeader: {
    backgroundColor: '#CCCCFF',
    padding: '0.5rem',
    margin: '0 0 0.5rem 0',
  },
  noAnnotations: {
    padding: '2rem',
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.9rem',
  },
  th: {
    textAlign: 'left',
    padding: '0.5rem',
    borderBottom: '2px solid #333',
    backgroundColor: '#f5f5f5',
  },
  td: {
    padding: '0.5rem',
    borderBottom: '1px solid #ddd',
    verticalAlign: 'top',
  },
  qualifiers: {
    fontSize: '0.85rem',
    color: '#666',
  },
  actionButton: {
    padding: '0.25rem 0.5rem',
    backgroundColor: '#5cb85c',
    color: 'white',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    marginRight: '0.25rem',
    fontSize: '0.85rem',
  },
  deleteButton: {
    padding: '0.25rem 0.5rem',
    backgroundColor: '#d9534f',
    color: 'white',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  searchContainer: {
    maxWidth: '600px',
    margin: '2rem auto',
    padding: '2rem',
    backgroundColor: '#f9f9f9',
    border: '1px solid #ddd',
    borderRadius: '8px',
    textAlign: 'center',
  },
  searchHint: {
    color: '#666',
    marginBottom: '1.5rem',
  },
  searchForm: {
    display: 'flex',
    gap: '0.5rem',
    justifyContent: 'center',
  },
  searchInput: {
    padding: '0.75rem 1rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    width: '300px',
  },
  searchButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#337ab7',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
  },
};

export default GoCurationPage;
