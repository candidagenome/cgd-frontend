/**
 * Phenotype Curation Page
 *
 * Full phenotype annotation curation interface for a feature.
 * - Display existing phenotype annotations
 * - Add new annotations with experiment type, mutant type, observable, qualifier
 * - Add experiment properties (strain_background, allele, etc.)
 * - Delete annotations
 *
 * Mirrors legacy UpdatePhenotype.pm functionality.
 */
import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import phenotypeCurationApi from '../../api/phenotypeCurationApi';

function PhenotypeCurationPage() {
  const { featureName: paramFeatureName } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  // Support both route param and query param for feature name
  const featureName = paramFeatureName || searchParams.get('query');

  // Feature and annotations state
  const [featureData, setFeatureData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Search state (when no feature specified)
  const [searchQuery, setSearchQuery] = useState('');

  // New annotation form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAnnotation, setNewAnnotation] = useState({
    experiment_type: '',
    mutant_type: '',
    observable: '',
    qualifier: '',
    reference_no: '',
    experiment_comment: '',
    properties: [],
  });
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // CV terms for dropdowns
  const [experimentTypes, setExperimentTypes] = useState([]);
  const [mutantTypes, setMutantTypes] = useState([]);
  const [qualifiers, setQualifiers] = useState([]);
  const [propertyTypes, setPropertyTypes] = useState([]);

  // Load CV terms
  useEffect(() => {
    const loadCVTerms = async () => {
      try {
        const [expTypes, mutTypes, quals, propTypes] = await Promise.all([
          phenotypeCurationApi.getCVTerms('experiment_type').catch(() => ({ terms: [] })),
          phenotypeCurationApi.getCVTerms('mutant_type').catch(() => ({ terms: [] })),
          phenotypeCurationApi.getCVTerms('qualifier').catch(() => ({ terms: [] })),
          phenotypeCurationApi.getPropertyTypes().catch(() => ({ property_types: [] })),
        ]);
        setExperimentTypes(expTypes.terms);
        setMutantTypes(mutTypes.terms);
        setQualifiers(quals.terms);
        setPropertyTypes(propTypes.property_types);
      } catch (err) {
        console.error('Failed to load CV terms:', err);
      }
    };

    loadCVTerms();
  }, []);

  // Load feature annotations
  const loadAnnotations = useCallback(async () => {
    if (!featureName) return;

    setLoading(true);
    setError(null);

    try {
      const data = await phenotypeCurationApi.getAnnotations(featureName);
      setFeatureData(data);
    } catch (err) {
      if (err.response?.status === 404) {
        setError(`Feature '${featureName}' not found`);
      } else {
        setError('Failed to load phenotype annotations');
      }
      setFeatureData(null);
    } finally {
      setLoading(false);
    }
  }, [featureName]);

  // Load annotations on mount and when featureName changes
  useEffect(() => {
    if (featureName) {
      loadAnnotations();
    }
  }, [loadAnnotations, featureName]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/curation/phenotype?query=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  // Handle delete annotation
  const handleDelete = async (annotationNo) => {
    if (!window.confirm('Are you sure you want to delete this annotation?')) {
      return;
    }

    try {
      await phenotypeCurationApi.deleteAnnotation(annotationNo);
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

  // Handle property change
  const handlePropertyChange = (index, field, value) => {
    setNewAnnotation((prev) => {
      const properties = [...prev.properties];
      properties[index] = { ...properties[index], [field]: value };
      return { ...prev, properties };
    });
  };

  // Add property row
  const addPropertyRow = () => {
    setNewAnnotation((prev) => ({
      ...prev,
      properties: [
        ...prev.properties,
        { property_type: '', property_value: '', property_description: '' },
      ],
    }));
  };

  // Remove property row
  const removePropertyRow = (index) => {
    setNewAnnotation((prev) => ({
      ...prev,
      properties: prev.properties.filter((_, i) => i !== index),
    }));
  };

  // Handle create annotation
  const handleCreateAnnotation = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      // Validate required fields
      if (!newAnnotation.experiment_type) {
        throw new Error('Experiment type is required');
      }
      if (!newAnnotation.mutant_type) {
        throw new Error('Mutant type is required');
      }
      if (!newAnnotation.observable) {
        throw new Error('Observable is required');
      }
      if (!newAnnotation.reference_no) {
        throw new Error('Reference number is required');
      }

      const data = {
        experiment_type: newAnnotation.experiment_type,
        mutant_type: newAnnotation.mutant_type,
        observable: newAnnotation.observable,
        qualifier: newAnnotation.qualifier || null,
        reference_no: parseInt(newAnnotation.reference_no, 10),
        experiment_comment: newAnnotation.experiment_comment || null,
      };

      // Add properties if any
      const validProperties = newAnnotation.properties.filter(
        (p) => p.property_type && p.property_value
      );
      if (validProperties.length > 0) {
        data.properties = validProperties;
      }

      await phenotypeCurationApi.createAnnotation(featureName, data);

      setSuccessMessage('Annotation created successfully');
      setShowAddForm(false);
      setNewAnnotation({
        experiment_type: '',
        mutant_type: '',
        observable: '',
        qualifier: '',
        reference_no: '',
        experiment_comment: '',
        properties: [],
      });
      loadAnnotations();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setFormError(
        err.response?.data?.detail || err.message || 'Failed to create annotation'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Show search form if no feature name
  if (!featureName) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1>Phenotype Curation</h1>
          <div style={styles.headerRight}>
            <span>
              Curator: {user?.first_name} {user?.last_name}
            </span>
            <Link to="/curation" style={styles.headerLink}>
              Curator Central
            </Link>
          </div>
        </div>

        <div style={styles.searchForm}>
          <p>Enter a gene/feature name to curate phenotype annotations:</p>
          <form onSubmit={handleSearch} style={styles.searchFormInner}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter ORF/gene name"
              style={styles.searchInput}
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
        <div style={styles.loading}>Loading phenotype annotations...</div>
      </div>
    );
  }

  if (error && !featureData) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>{error}</div>
        <Link to="/curation/phenotype">Search for another feature</Link>
        {' | '}
        <Link to="/curation">Back to Curator Central</Link>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>Phenotype Curation: {featureData?.feature_name}</h1>
        <div style={styles.headerRight}>
          <span>
            Curator: {user?.first_name} {user?.last_name}
          </span>
          <Link to="/curation/phenotype" style={styles.headerLink}>
            New Search
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
          {showAddForm ? 'Cancel' : '+ Add New Phenotype Annotation'}
        </button>
      </div>

      {/* Add Annotation Form */}
      {showAddForm && (
        <div style={styles.formContainer}>
          <h3>Add New Phenotype Annotation</h3>
          {formError && <div style={styles.formError}>{formError}</div>}

          <form onSubmit={handleCreateAnnotation} style={styles.form}>
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
              <label style={styles.formLabel}>
                Experiment Type: <span style={styles.required}>*</span>
              </label>
              <select
                value={newAnnotation.experiment_type}
                onChange={(e) => handleFormChange('experiment_type', e.target.value)}
                style={styles.formSelect}
                required
              >
                <option value="">Select experiment type...</option>
                {experimentTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.formRow}>
              <label style={styles.formLabel}>
                Mutant Type: <span style={styles.required}>*</span>
              </label>
              <select
                value={newAnnotation.mutant_type}
                onChange={(e) => handleFormChange('mutant_type', e.target.value)}
                style={styles.formSelect}
                required
              >
                <option value="">Select mutant type...</option>
                {mutantTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.formRow}>
              <label style={styles.formLabel}>
                Observable: <span style={styles.required}>*</span>
              </label>
              <input
                type="text"
                value={newAnnotation.observable}
                onChange={(e) => handleFormChange('observable', e.target.value)}
                placeholder="Enter observable (CV term)"
                style={styles.formInputWide}
                required
              />
            </div>

            <div style={styles.formRow}>
              <label style={styles.formLabel}>Qualifier:</label>
              <select
                value={newAnnotation.qualifier}
                onChange={(e) => handleFormChange('qualifier', e.target.value)}
                style={styles.formSelect}
              >
                <option value="">-- no selection --</option>
                {qualifiers.map((qual) => (
                  <option key={qual} value={qual}>
                    {qual}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.formRow}>
              <label style={styles.formLabel}>Experiment Comment:</label>
              <textarea
                value={newAnnotation.experiment_comment}
                onChange={(e) =>
                  handleFormChange('experiment_comment', e.target.value)
                }
                placeholder="Optional experiment description"
                style={styles.formTextarea}
                rows={3}
              />
            </div>

            {/* Properties Section */}
            <div style={styles.propertiesSection}>
              <h4 style={styles.propertiesHeader}>
                Experiment Properties
                <button
                  type="button"
                  onClick={addPropertyRow}
                  style={styles.addPropertyButton}
                >
                  + Add Property
                </button>
              </h4>

              {newAnnotation.properties.map((prop, index) => (
                <div key={index} style={styles.propertyRow}>
                  <select
                    value={prop.property_type}
                    onChange={(e) =>
                      handlePropertyChange(index, 'property_type', e.target.value)
                    }
                    style={styles.propertySelect}
                  >
                    <option value="">Select type...</option>
                    {propertyTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={prop.property_value}
                    onChange={(e) =>
                      handlePropertyChange(index, 'property_value', e.target.value)
                    }
                    placeholder="Value"
                    style={styles.propertyInput}
                  />
                  <input
                    type="text"
                    value={prop.property_description || ''}
                    onChange={(e) =>
                      handlePropertyChange(
                        index,
                        'property_description',
                        e.target.value
                      )
                    }
                    placeholder="Description (optional)"
                    style={styles.propertyInput}
                  />
                  <button
                    type="button"
                    onClick={() => removePropertyRow(index)}
                    style={styles.removePropertyButton}
                  >
                    Remove
                  </button>
                </div>
              ))}
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
        <h2>
          Existing Phenotype Annotations ({featureData?.annotations?.length || 0})
        </h2>

        {featureData?.annotations?.length === 0 ? (
          <p style={styles.noAnnotations}>
            No phenotype annotations found for this feature.
          </p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Experiment Type</th>
                <th style={styles.th}>Mutant Type</th>
                <th style={styles.th}>Observable</th>
                <th style={styles.th}>Qualifier</th>
                <th style={styles.th}>Properties</th>
                <th style={styles.th}>References</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {featureData?.annotations?.map((ann) => (
                <tr key={ann.pheno_annotation_no}>
                  <td style={styles.td}>{ann.experiment_type}</td>
                  <td style={styles.td}>{ann.mutant_type}</td>
                  <td style={styles.td}>{ann.observable}</td>
                  <td style={styles.td}>{ann.qualifier || '-'}</td>
                  <td style={styles.td}>
                    {ann.properties?.length > 0 ? (
                      <ul style={styles.propertyList}>
                        {ann.properties.map((prop, idx) => (
                          <li key={idx}>
                            <strong>{prop.property_type}:</strong>{' '}
                            {prop.property_value}
                            {prop.property_description &&
                              ` (${prop.property_description})`}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      '-'
                    )}
                    {ann.experiment?.experiment_comment && (
                      <div style={styles.experimentComment}>
                        Comment: {ann.experiment.experiment_comment}
                      </div>
                    )}
                  </td>
                  <td style={styles.td}>
                    {ann.references?.map((ref, idx) => (
                      <div key={idx}>
                        <Link to={`/reference/${ref.reference_no}`}>
                          {ref.pubmed
                            ? `PMID:${ref.pubmed}`
                            : `Ref:${ref.reference_no}`}
                        </Link>
                      </div>
                    ))}
                  </td>
                  <td style={styles.td}>
                    <button
                      onClick={() => handleDelete(ann.pheno_annotation_no)}
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
  searchForm: {
    padding: '2rem',
    backgroundColor: '#f9f9f9',
    border: '1px solid #ddd',
    borderRadius: '4px',
    textAlign: 'center',
  },
  searchFormInner: {
    display: 'flex',
    justifyContent: 'center',
    gap: '0.5rem',
    marginTop: '1rem',
  },
  searchInput: {
    padding: '0.5rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    width: '300px',
  },
  searchButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#337ab7',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
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
    width: '140px',
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
  formInputWide: {
    padding: '0.5rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    width: '400px',
  },
  formSelect: {
    padding: '0.5rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    width: '250px',
  },
  formTextarea: {
    padding: '0.5rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    width: '400px',
    resize: 'vertical',
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
  propertiesSection: {
    marginTop: '0.5rem',
    padding: '1rem',
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: '4px',
  },
  propertiesHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
    paddingBottom: '0.5rem',
    borderBottom: '1px solid #ddd',
  },
  addPropertyButton: {
    padding: '0.25rem 0.5rem',
    backgroundColor: '#337ab7',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  propertyRow: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '0.5rem',
    alignItems: 'center',
  },
  propertySelect: {
    padding: '0.4rem',
    fontSize: '0.9rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    width: '150px',
  },
  propertyInput: {
    padding: '0.4rem',
    fontSize: '0.9rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    flex: 1,
    minWidth: '150px',
  },
  removePropertyButton: {
    padding: '0.25rem 0.5rem',
    backgroundColor: '#d9534f',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  annotations: {
    marginTop: '1.5rem',
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
  propertyList: {
    margin: 0,
    padding: '0 0 0 1rem',
    fontSize: '0.85rem',
  },
  experimentComment: {
    fontSize: '0.85rem',
    color: '#666',
    marginTop: '0.25rem',
    fontStyle: 'italic',
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
};

export default PhenotypeCurationPage;
