/**
 * Reference Curation Page
 *
 * Reference management interface for curators.
 * - View/edit reference details
 * - Set curation status
 * - Link to literature guide topics
 * - Create new reference from PubMed
 *
 * Mirrors legacy reference curation CGI functionality.
 */
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import referenceCurationApi from '../../api/referenceCurationApi';

function ReferenceCurationPage() {
  const { referenceNo } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isCreateMode = !referenceNo;

  // Reference data state
  const [referenceData, setReferenceData] = useState(null);
  const [loading, setLoading] = useState(!isCreateMode);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Curation status state
  const [curationStatuses, setCurationStatuses] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Create from PubMed state
  const [pubmedId, setPubmedId] = useState('');
  const [refStatus, setRefStatus] = useState('Published');
  const [refStatuses, setRefStatuses] = useState([]);
  const [creating, setCreating] = useState(false);

  // Literature guide linking state
  const [litguideFeatures, setLitguideFeatures] = useState('');
  const [litguideTopic, setLitguideTopic] = useState('');
  const [linking, setLinking] = useState(false);

  // Load reference data
  const loadReference = useCallback(async () => {
    if (!referenceNo) return;

    setLoading(true);
    setError(null);

    try {
      const data = await referenceCurationApi.getCurationDetails(parseInt(referenceNo, 10));
      setReferenceData(data);
      setSelectedStatus(data.curation_status || '');
    } catch (err) {
      if (err.response?.status === 404) {
        setError(`Reference ${referenceNo} not found`);
      } else {
        setError('Failed to load reference');
      }
    } finally {
      setLoading(false);
    }
  }, [referenceNo]);

  // Load statuses on mount
  useEffect(() => {
    const loadStatuses = async () => {
      try {
        const [curationData, refData] = await Promise.all([
          referenceCurationApi.getCurationStatuses(),
          referenceCurationApi.getReferenceStatuses(),
        ]);
        setCurationStatuses(curationData.statuses);
        setRefStatuses(refData.statuses);
      } catch (err) {
        console.error('Failed to load statuses:', err);
      }
    };

    loadStatuses();
  }, []);

  // Load reference on mount
  useEffect(() => {
    if (!isCreateMode) {
      loadReference();
    }
  }, [loadReference, isCreateMode]);

  // Handle curation status change
  const handleStatusChange = async () => {
    if (!selectedStatus || selectedStatus === referenceData?.curation_status) {
      return;
    }

    setStatusUpdating(true);
    setError(null);

    try {
      await referenceCurationApi.setCurationStatus(
        parseInt(referenceNo, 10),
        selectedStatus
      );
      setSuccessMessage('Curation status updated');
      loadReference();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update status');
    } finally {
      setStatusUpdating(false);
    }
  };

  // Handle create from PubMed
  const handleCreateFromPubmed = async (e) => {
    e.preventDefault();

    if (!pubmedId) {
      setError('PubMed ID is required');
      return;
    }

    setCreating(true);
    setError(null);

    try {
      const result = await referenceCurationApi.createFromPubmed(
        parseInt(pubmedId, 10),
        refStatus
      );
      setSuccessMessage(`Reference ${result.reference_no} created from PubMed ${pubmedId}`);
      // Navigate to the new reference
      setTimeout(() => {
        navigate(`/curation/reference/${result.reference_no}`);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create reference');
    } finally {
      setCreating(false);
    }
  };

  // Handle literature guide linking
  const handleLinkToLitGuide = async (e) => {
    e.preventDefault();

    if (!litguideFeatures.trim() || !litguideTopic.trim()) {
      setError('Features and topic are required');
      return;
    }

    setLinking(true);
    setError(null);

    try {
      const featureNames = litguideFeatures
        .split(/[\s,;]+/)
        .map((f) => f.trim())
        .filter((f) => f);

      const result = await referenceCurationApi.linkToLitGuide(
        parseInt(referenceNo, 10),
        featureNames,
        litguideTopic
      );

      setSuccessMessage(`Linked ${result.linked_count} features to literature guide`);
      setLitguideFeatures('');
      setLitguideTopic('');
      loadReference();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to link to literature guide');
    } finally {
      setLinking(false);
    }
  };

  // Create mode UI
  if (isCreateMode) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1>Create Reference from PubMed</h1>
          <Link to="/curation">Back to Curator Central</Link>
        </div>

        {error && <div style={styles.error}>{error}</div>}
        {successMessage && <div style={styles.success}>{successMessage}</div>}

        <div style={styles.formContainer}>
          <form onSubmit={handleCreateFromPubmed} style={styles.form}>
            <div style={styles.formRow}>
              <label style={styles.formLabel}>
                PubMed ID: <span style={styles.required}>*</span>
              </label>
              <input
                type="number"
                value={pubmedId}
                onChange={(e) => setPubmedId(e.target.value)}
                placeholder="e.g., 12345678"
                style={styles.formInput}
                required
              />
            </div>

            <div style={styles.formRow}>
              <label style={styles.formLabel}>
                Status: <span style={styles.required}>*</span>
              </label>
              <select
                value={refStatus}
                onChange={(e) => setRefStatus(e.target.value)}
                style={styles.formSelect}
              >
                {refStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.formButtons}>
              <button
                type="submit"
                disabled={creating}
                style={styles.submitButton}
              >
                {creating ? 'Creating...' : 'Create Reference'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading reference...</div>
      </div>
    );
  }

  // Error state (no data)
  if (error && !referenceData) {
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
        <h1>Reference Curation: {referenceNo}</h1>
        <div style={styles.headerRight}>
          <span>Curator: {user?.first_name} {user?.last_name}</span>
          <Link to="/curation/litguide/todo" style={styles.headerLink}>
            LitGuide Todo
          </Link>
          <Link to="/curation" style={styles.headerLink}>
            Curator Central
          </Link>
        </div>
      </div>

      {successMessage && <div style={styles.success}>{successMessage}</div>}
      {error && <div style={styles.error}>{error}</div>}

      {/* Reference Details */}
      <section style={styles.section}>
        <h2>Reference Details</h2>
        <table style={styles.detailsTable}>
          <tbody>
            <tr>
              <th style={styles.detailsTh}>Reference #:</th>
              <td style={styles.detailsTd}>{referenceData?.reference_no}</td>
            </tr>
            <tr>
              <th style={styles.detailsTh}>PubMed:</th>
              <td style={styles.detailsTd}>
                {referenceData?.pubmed ? (
                  <a
                    href={`https://pubmed.ncbi.nlm.nih.gov/${referenceData.pubmed}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {referenceData.pubmed}
                  </a>
                ) : (
                  '-'
                )}
              </td>
            </tr>
            <tr>
              <th style={styles.detailsTh}>Title:</th>
              <td style={styles.detailsTd}>{referenceData?.title || '-'}</td>
            </tr>
            <tr>
              <th style={styles.detailsTh}>Citation:</th>
              <td style={styles.detailsTd}>{referenceData?.citation}</td>
            </tr>
            <tr>
              <th style={styles.detailsTh}>Year:</th>
              <td style={styles.detailsTd}>{referenceData?.year}</td>
            </tr>
            <tr>
              <th style={styles.detailsTh}>Status:</th>
              <td style={styles.detailsTd}>{referenceData?.status}</td>
            </tr>
            <tr>
              <th style={styles.detailsTh}>Source:</th>
              <td style={styles.detailsTd}>{referenceData?.source}</td>
            </tr>
          </tbody>
        </table>

        {referenceData?.abstract && (
          <div style={styles.abstract}>
            <h3>Abstract</h3>
            <p>{referenceData.abstract}</p>
          </div>
        )}

        <p>
          <Link to={`/reference/${referenceNo}`}>View full reference page</Link>
        </p>
      </section>

      {/* Curation Status */}
      <section style={styles.section}>
        <h2>Curation Status</h2>
        <div style={styles.statusRow}>
          <span style={styles.statusLabel}>
            Current Status:{' '}
            <strong>{referenceData?.curation_status || 'Not set'}</strong>
          </span>
        </div>

        <div style={styles.statusForm}>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={styles.formSelect}
          >
            <option value="">Select status...</option>
            {curationStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <button
            onClick={handleStatusChange}
            disabled={statusUpdating || !selectedStatus}
            style={styles.updateButton}
          >
            {statusUpdating ? 'Updating...' : 'Update Status'}
          </button>
        </div>
      </section>

      {/* Literature Guide Topics */}
      <section style={styles.section}>
        <h2>Literature Guide Topics</h2>

        {referenceData?.topics?.length > 0 ? (
          <div style={styles.topicsList}>
            {referenceData.topics.map((topic, idx) => (
              <div key={idx} style={styles.topicItem}>
                <strong>{topic.topic}:</strong>
                <span style={styles.topicFeatures}>
                  {topic.features?.map((f) => f.feature_name || f.gene_name).join(', ') || 'No features'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p style={styles.noData}>No literature guide links yet.</p>
        )}

        <h3>Link to Literature Guide</h3>
        <form onSubmit={handleLinkToLitGuide} style={styles.litguideForm}>
          <div style={styles.formRow}>
            <label style={styles.formLabel}>Topic:</label>
            <input
              type="text"
              value={litguideTopic}
              onChange={(e) => setLitguideTopic(e.target.value)}
              placeholder="e.g., Regulation, Disease"
              style={styles.formInput}
            />
          </div>
          <div style={styles.formRow}>
            <label style={styles.formLabel}>Features:</label>
            <textarea
              value={litguideFeatures}
              onChange={(e) => setLitguideFeatures(e.target.value)}
              placeholder="Enter feature names (one per line or comma-separated)"
              style={styles.formTextarea}
              rows={3}
            />
          </div>
          <button
            type="submit"
            disabled={linking}
            style={styles.submitButton}
          >
            {linking ? 'Linking...' : 'Link Features'}
          </button>
        </form>
      </section>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1000px',
    margin: '1rem auto',
    padding: '1rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
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
  section: {
    marginBottom: '2rem',
    padding: '1rem',
    backgroundColor: '#f9f9f9',
    border: '1px solid #ddd',
    borderRadius: '4px',
  },
  detailsTable: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  detailsTh: {
    textAlign: 'right',
    padding: '0.5rem',
    width: '120px',
    verticalAlign: 'top',
    fontWeight: 'bold',
  },
  detailsTd: {
    padding: '0.5rem',
    verticalAlign: 'top',
  },
  abstract: {
    marginTop: '1rem',
    padding: '1rem',
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: '4px',
  },
  statusRow: {
    marginBottom: '1rem',
  },
  statusLabel: {
    fontSize: '1.1rem',
  },
  statusForm: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  formContainer: {
    padding: '1rem',
    backgroundColor: '#f9f9f9',
    border: '1px solid #ddd',
    borderRadius: '4px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  litguideForm: {
    marginTop: '1rem',
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
    width: '100px',
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
    width: '250px',
  },
  formTextarea: {
    padding: '0.5rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    width: '300px',
    fontFamily: 'inherit',
  },
  formSelect: {
    padding: '0.5rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    minWidth: '200px',
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
  updateButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#337ab7',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  topicsList: {
    marginBottom: '1rem',
  },
  topicItem: {
    padding: '0.5rem',
    marginBottom: '0.5rem',
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: '4px',
  },
  topicFeatures: {
    marginLeft: '0.5rem',
    color: '#666',
  },
  noData: {
    color: '#666',
    fontStyle: 'italic',
  },
};

export default ReferenceCurationPage;
