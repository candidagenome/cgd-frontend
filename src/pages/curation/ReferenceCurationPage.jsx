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

  // Create mode state
  const [createMode, setCreateMode] = useState('pubmed'); // 'pubmed' or 'manual'

  // Create from PubMed state
  const [pubmedId, setPubmedId] = useState('');
  const [refStatus, setRefStatus] = useState('Published');
  const [refStatuses, setRefStatuses] = useState([]);
  const [creating, setCreating] = useState(false);

  // Create manual reference state
  const [manualTitle, setManualTitle] = useState('');
  const [manualYear, setManualYear] = useState(new Date().getFullYear());
  const [manualAuthors, setManualAuthors] = useState(['', '', '', '']);
  const [manualJournal, setManualJournal] = useState('');
  const [manualVolume, setManualVolume] = useState('');
  const [manualPages, setManualPages] = useState('');
  const [manualAbstract, setManualAbstract] = useState('');
  const [manualStatus, setManualStatus] = useState('Published');

  // Literature guide linking state
  const [litguideFeatures, setLitguideFeatures] = useState('');
  const [litguideTopic, setLitguideTopic] = useState('');
  const [linking, setLinking] = useState(false);

  // Edit reference state
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editYear, setEditYear] = useState('');
  const [editVolume, setEditVolume] = useState('');
  const [editPages, setEditPages] = useState('');
  const [saving, setSaving] = useState(false);

  // Delete reference state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [referenceUsage, setReferenceUsage] = useState(null);
  const [deleting, setDeleting] = useState(false);

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

  // Handle create manual reference
  const handleCreateManual = async (e) => {
    e.preventDefault();

    if (!manualTitle.trim()) {
      setError('Title is required');
      return;
    }

    if (!manualYear) {
      setError('Year is required');
      return;
    }

    setCreating(true);
    setError(null);

    try {
      // Filter out empty authors
      const authors = manualAuthors.filter((a) => a.trim());

      const result = await referenceCurationApi.createManual({
        title: manualTitle.trim(),
        year: parseInt(manualYear, 10),
        status: manualStatus,
        authors: authors.length > 0 ? authors : null,
        journal_abbrev: manualJournal.trim() || null,
        volume: manualVolume.trim() || null,
        pages: manualPages.trim() || null,
        abstract: manualAbstract.trim() || null,
      });

      setSuccessMessage(`Reference ${result.reference_no} created successfully`);
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

  // Update author at index
  const updateAuthor = (index, value) => {
    const newAuthors = [...manualAuthors];
    newAuthors[index] = value;
    setManualAuthors(newAuthors);
  };

  // Add more author fields
  const addAuthorFields = () => {
    setManualAuthors([...manualAuthors, '', '', '', '']);
  };

  // Start editing reference
  const handleStartEdit = () => {
    setEditTitle(referenceData?.title || '');
    setEditYear(referenceData?.year || '');
    setEditVolume(referenceData?.volume || '');
    setEditPages(referenceData?.pages || '');
    setIsEditing(true);
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setIsEditing(false);
    setError(null);
  };

  // Save edited reference
  const handleSaveEdit = async () => {
    setSaving(true);
    setError(null);

    try {
      const updates = {};
      if (editTitle !== (referenceData?.title || '')) {
        updates.title = editTitle || null;
      }
      if (editYear !== (referenceData?.year || '')) {
        updates.year = editYear ? parseInt(editYear, 10) : null;
      }
      if (editVolume !== (referenceData?.volume || '')) {
        updates.volume = editVolume || null;
      }
      if (editPages !== (referenceData?.pages || '')) {
        updates.pages = editPages || null;
      }

      if (Object.keys(updates).length === 0) {
        setIsEditing(false);
        return;
      }

      await referenceCurationApi.updateReference(parseInt(referenceNo, 10), updates);
      setSuccessMessage('Reference updated successfully');
      setIsEditing(false);
      loadReference();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update reference');
    } finally {
      setSaving(false);
    }
  };

  // Show delete confirmation
  const handleShowDeleteConfirm = async () => {
    setError(null);
    try {
      const usage = await referenceCurationApi.getReferenceUsage(parseInt(referenceNo, 10));
      setReferenceUsage(usage);
      setShowDeleteConfirm(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to check reference usage');
    }
  };

  // Cancel delete
  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setReferenceUsage(null);
  };

  // Delete reference
  const handleDeleteReference = async () => {
    setDeleting(true);
    setError(null);

    try {
      await referenceCurationApi.deleteReference(parseInt(referenceNo, 10));
      setSuccessMessage('Reference deleted successfully');
      setShowDeleteConfirm(false);
      // Navigate back to curation central after a short delay
      setTimeout(() => {
        navigate('/curation');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete reference');
      setShowDeleteConfirm(false);
    } finally {
      setDeleting(false);
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
          <h1>Create Reference</h1>
          <Link to="/curation">Back to Curator Central</Link>
        </div>

        {error && <div style={styles.error}>{error}</div>}
        {successMessage && <div style={styles.success}>{successMessage}</div>}

        {/* Tab buttons */}
        <div style={styles.tabContainer}>
          <button
            onClick={() => setCreateMode('pubmed')}
            style={{
              ...styles.tabButton,
              ...(createMode === 'pubmed' ? styles.tabButtonActive : {}),
            }}
          >
            From PubMed
          </button>
          <button
            onClick={() => setCreateMode('manual')}
            style={{
              ...styles.tabButton,
              ...(createMode === 'manual' ? styles.tabButtonActive : {}),
            }}
          >
            Manual Entry (Non-PubMed)
          </button>
        </div>

        <div style={styles.formContainer}>
          {createMode === 'pubmed' ? (
            /* PubMed form */
            <form onSubmit={handleCreateFromPubmed} style={styles.form}>
              <p style={styles.formDescription}>
                Enter a PubMed ID to fetch reference metadata from NCBI.
              </p>
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
          ) : (
            /* Manual entry form */
            <form onSubmit={handleCreateManual} style={styles.form}>
              <p style={styles.formDescription}>
                Manually enter reference information for papers without a PubMed ID.
              </p>

              {/* Authors */}
              <div style={styles.formSection}>
                <h3 style={styles.formSectionTitle}>Authors</h3>
                <p style={styles.formHint}>
                  Format: Last name followed by initials (e.g., &quot;Smith JA&quot;)
                </p>
                <div style={styles.authorGrid}>
                  {manualAuthors.map((author, idx) => (
                    <input
                      key={idx}
                      type="text"
                      value={author}
                      onChange={(e) => updateAuthor(idx, e.target.value)}
                      placeholder={`Author ${idx + 1}`}
                      style={styles.authorInput}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addAuthorFields}
                  style={styles.addButton}
                >
                  + Add more authors
                </button>
              </div>

              {/* Title */}
              <div style={styles.formRow}>
                <label style={styles.formLabel}>
                  Title: <span style={styles.required}>*</span>
                </label>
                <textarea
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  placeholder="Reference title"
                  style={styles.formTextareaWide}
                  rows={2}
                  required
                />
              </div>

              {/* Journal, Volume, Pages, Year */}
              <div style={styles.formGrid}>
                <div style={styles.formGridItem}>
                  <label style={styles.formLabelSmall}>Journal Abbrev:</label>
                  <input
                    type="text"
                    value={manualJournal}
                    onChange={(e) => setManualJournal(e.target.value)}
                    placeholder="e.g., J Biol Chem"
                    style={styles.formInputSmall}
                  />
                </div>
                <div style={styles.formGridItem}>
                  <label style={styles.formLabelSmall}>Volume:</label>
                  <input
                    type="text"
                    value={manualVolume}
                    onChange={(e) => setManualVolume(e.target.value)}
                    placeholder="e.g., 45"
                    style={styles.formInputSmall}
                  />
                </div>
                <div style={styles.formGridItem}>
                  <label style={styles.formLabelSmall}>Pages:</label>
                  <input
                    type="text"
                    value={manualPages}
                    onChange={(e) => setManualPages(e.target.value)}
                    placeholder="e.g., 123-130"
                    style={styles.formInputSmall}
                  />
                </div>
                <div style={styles.formGridItem}>
                  <label style={styles.formLabelSmall}>
                    Year: <span style={styles.required}>*</span>
                  </label>
                  <input
                    type="number"
                    value={manualYear}
                    onChange={(e) => setManualYear(e.target.value)}
                    placeholder="Year"
                    style={styles.formInputSmall}
                    required
                  />
                </div>
              </div>

              {/* Abstract */}
              <div style={styles.formRow}>
                <label style={styles.formLabel}>Abstract:</label>
                <textarea
                  value={manualAbstract}
                  onChange={(e) => setManualAbstract(e.target.value)}
                  placeholder="Optional abstract text"
                  style={styles.formTextareaWide}
                  rows={4}
                />
              </div>

              {/* Status */}
              <div style={styles.formRow}>
                <label style={styles.formLabel}>
                  Status: <span style={styles.required}>*</span>
                </label>
                <select
                  value={manualStatus}
                  onChange={(e) => setManualStatus(e.target.value)}
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
          )}
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3>Delete Reference?</h3>
            <p>Are you sure you want to delete reference {referenceNo}?</p>

            {referenceUsage && referenceUsage.in_use && (
              <div style={styles.usageWarning}>
                <strong>Warning:</strong> This reference has linked data:
                <ul>
                  {referenceUsage.go_ref_count > 0 && (
                    <li>GO annotations: {referenceUsage.go_ref_count}</li>
                  )}
                  {referenceUsage.ref_link_count > 0 && (
                    <li>Reference links: {referenceUsage.ref_link_count}</li>
                  )}
                  {referenceUsage.refprop_feat_count > 0 && (
                    <li>Literature guide links: {referenceUsage.refprop_feat_count}</li>
                  )}
                </ul>
                <p>Deleting will fail if linked data exists. Remove links first.</p>
              </div>
            )}

            <div style={styles.modalButtons}>
              <button
                onClick={handleDeleteReference}
                disabled={deleting}
                style={styles.deleteConfirmButton}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
              <button
                onClick={handleCancelDelete}
                style={styles.cancelButton}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reference Details */}
      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2>Reference Details</h2>
          <div style={styles.sectionActions}>
            {!isEditing && (
              <>
                <button onClick={handleStartEdit} style={styles.editButton}>
                  Edit
                </button>
                <button onClick={handleShowDeleteConfirm} style={styles.deleteButton}>
                  Delete
                </button>
              </>
            )}
          </div>
        </div>

        {isEditing ? (
          <div style={styles.editForm}>
            <div style={styles.editRow}>
              <label style={styles.editLabel}>Title:</label>
              <textarea
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                style={styles.editTextarea}
                rows={2}
              />
            </div>
            <div style={styles.editGrid}>
              <div style={styles.editGridItem}>
                <label style={styles.editLabelSmall}>Year:</label>
                <input
                  type="number"
                  value={editYear}
                  onChange={(e) => setEditYear(e.target.value)}
                  style={styles.editInputSmall}
                />
              </div>
              <div style={styles.editGridItem}>
                <label style={styles.editLabelSmall}>Volume:</label>
                <input
                  type="text"
                  value={editVolume}
                  onChange={(e) => setEditVolume(e.target.value)}
                  style={styles.editInputSmall}
                />
              </div>
              <div style={styles.editGridItem}>
                <label style={styles.editLabelSmall}>Pages:</label>
                <input
                  type="text"
                  value={editPages}
                  onChange={(e) => setEditPages(e.target.value)}
                  style={styles.editInputSmall}
                />
              </div>
            </div>
            <div style={styles.editButtons}>
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                style={styles.saveButton}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button onClick={handleCancelEdit} style={styles.cancelButton}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
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
                  <th style={styles.detailsTh}>Volume:</th>
                  <td style={styles.detailsTd}>{referenceData?.volume || '-'}</td>
                </tr>
                <tr>
                  <th style={styles.detailsTh}>Pages:</th>
                  <td style={styles.detailsTd}>{referenceData?.pages || '-'}</td>
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
          </>
        )}
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
  tabContainer: {
    display: 'flex',
    gap: '0',
    marginBottom: '1rem',
    borderBottom: '2px solid #ddd',
  },
  tabButton: {
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderBottom: '2px solid transparent',
    background: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    color: '#666',
    marginBottom: '-2px',
  },
  tabButtonActive: {
    borderBottomColor: '#337ab7',
    color: '#337ab7',
    fontWeight: 'bold',
  },
  formDescription: {
    marginBottom: '1rem',
    color: '#666',
  },
  formSection: {
    marginBottom: '1.5rem',
    padding: '1rem',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px',
  },
  formSectionTitle: {
    margin: '0 0 0.5rem 0',
    fontSize: '1rem',
    fontWeight: 'bold',
  },
  formHint: {
    fontSize: '0.85rem',
    color: '#666',
    marginBottom: '0.5rem',
  },
  authorGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '0.5rem',
    marginBottom: '0.5rem',
  },
  authorInput: {
    padding: '0.5rem',
    fontSize: '0.9rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
  },
  addButton: {
    padding: '0.25rem 0.75rem',
    fontSize: '0.85rem',
    backgroundColor: '#f0f0f0',
    border: '1px solid #ccc',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1rem',
    marginBottom: '1rem',
  },
  formGridItem: {
    display: 'flex',
    flexDirection: 'column',
  },
  formLabelSmall: {
    fontSize: '0.85rem',
    fontWeight: 'bold',
    marginBottom: '0.25rem',
  },
  formInputSmall: {
    padding: '0.5rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
  },
  formTextareaWide: {
    flex: 1,
    padding: '0.5rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontFamily: 'inherit',
    minWidth: '400px',
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
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  sectionActions: {
    display: 'flex',
    gap: '0.5rem',
  },
  editButton: {
    padding: '0.4rem 0.8rem',
    backgroundColor: '#337ab7',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  deleteButton: {
    padding: '0.4rem 0.8rem',
    backgroundColor: '#d9534f',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  editForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  editRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.5rem',
  },
  editLabel: {
    width: '80px',
    fontWeight: 'bold',
    paddingTop: '0.5rem',
  },
  editLabelSmall: {
    fontSize: '0.85rem',
    fontWeight: 'bold',
    marginBottom: '0.25rem',
  },
  editTextarea: {
    flex: 1,
    padding: '0.5rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontFamily: 'inherit',
  },
  editGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
  },
  editGridItem: {
    display: 'flex',
    flexDirection: 'column',
  },
  editInputSmall: {
    padding: '0.5rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
  },
  editButtons: {
    display: 'flex',
    gap: '0.5rem',
  },
  saveButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#5cb85c',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  cancelButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    maxWidth: '400px',
    width: '90%',
  },
  usageWarning: {
    padding: '1rem',
    backgroundColor: '#fcf8e3',
    border: '1px solid #faebcc',
    borderRadius: '4px',
    marginBottom: '1rem',
  },
  modalButtons: {
    display: 'flex',
    gap: '0.5rem',
    justifyContent: 'flex-end',
    marginTop: '1rem',
  },
  deleteConfirmButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#d9534f',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export default ReferenceCurationPage;
