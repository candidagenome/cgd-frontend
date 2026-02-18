/**
 * Gene Registry Curation Page - Process gene registry submissions.
 *
 * Allows curators to review and commit gene name reservations.
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  listPendingSubmissions,
  getSubmissionDetails,
  processSubmission,
  delaySubmission,
  deleteSubmission,
} from '../../api/geneRegistryCurationApi';

export default function GeneRegistryCurationPage() {
  // List state
  const [submissions, setSubmissions] = useState([]);
  const [loadingList, setLoadingList] = useState(true);

  // Selected submission state
  const [selectedId, setSelectedId] = useState(null);
  const [details, setDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Form state for processing
  const [geneName, setGeneName] = useState('');
  const [orfName, setOrfName] = useState('');
  const [organismAbbrev, setOrganismAbbrev] = useState('');
  const [description, setDescription] = useState('');
  const [headline, setHeadline] = useState('');
  const [aliases, setAliases] = useState('');
  const [referenceNo, setReferenceNo] = useState('');

  // UI state
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Load pending submissions
  const loadSubmissions = async () => {
    setLoadingList(true);
    try {
      const data = await listPendingSubmissions();
      setSubmissions(data.submissions);
    } catch (err) {
      setError('Failed to load submissions: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  // Load submission details
  const handleSelectSubmission = async (id) => {
    setSelectedId(id);
    setLoadingDetails(true);
    setError(null);
    setSuccess(null);

    try {
      const data = await getSubmissionDetails(id);
      if (data.found) {
        setDetails(data.submission);

        // Pre-fill form
        const innerData = data.submission.data || {};
        setGeneName(data.submission.gene_name || innerData.gene_name || '');
        setOrfName(data.submission.orf_name || innerData.orf_name || '');
        setOrganismAbbrev(data.submission.organism || innerData.organism || '');
        setDescription(innerData.description || '');
        setHeadline(data.submission.orf_info?.headline || '');
        setAliases(innerData.aliases || '');
        setReferenceNo('');
      } else {
        setError('Submission not found');
        setDetails(null);
      }
    } catch (err) {
      setError('Failed to load details: ' + (err.response?.data?.detail || err.message));
      setDetails(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Process submission
  const handleProcess = async () => {
    if (!geneName.trim()) {
      setError('Gene name is required');
      return;
    }
    if (!organismAbbrev) {
      setError('Organism is required');
      return;
    }

    setProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      const aliasesList = aliases
        .split(/[,;|]/)
        .map((a) => a.trim())
        .filter((a) => a);

      const result = await processSubmission({
        submission_id: selectedId,
        gene_name: geneName.trim(),
        orf_name: orfName.trim() || null,
        organism_abbrev: organismAbbrev,
        description: description.trim() || null,
        headline: headline.trim() || null,
        aliases: aliasesList.length > 0 ? aliasesList : null,
        reference_no: referenceNo ? parseInt(referenceNo, 10) : null,
      });

      setSuccess(result.message);
      setSelectedId(null);
      setDetails(null);
      loadSubmissions();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to process submission');
    } finally {
      setProcessing(false);
    }
  };

  // Delay submission
  const handleDelay = async () => {
    const comment = prompt('Enter delay comment (optional):');

    try {
      await delaySubmission(selectedId, comment);
      setSuccess('Submission delayed');
      loadSubmissions();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delay submission');
    }
  };

  // Delete submission
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this submission?')) {
      return;
    }

    try {
      await deleteSubmission(selectedId);
      setSuccess('Submission deleted');
      setSelectedId(null);
      setDetails(null);
      loadSubmissions();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete submission');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.backLink}>
        <Link to="/curation">&larr; Back to Curator Central</Link>
      </div>

      <h1 style={styles.title}>Process Gene Registry Forms</h1>

      {error && (
        <div style={styles.errorBox}>{error}</div>
      )}

      {success && (
        <div style={styles.successBox}>{success}</div>
      )}

      <div style={styles.columnsWrapper}>
        {/* Submissions List */}
        <div style={styles.panel}>
          <h2 style={styles.panelTitle}>Pending Submissions</h2>

          {loadingList ? (
            <p>Loading...</p>
          ) : submissions.length === 0 ? (
            <p style={styles.mutedText}>No pending submissions.</p>
          ) : (
            <div style={styles.submissionsList}>
              {submissions.map((sub) => (
                <div
                  key={sub.id}
                  onClick={() => handleSelectSubmission(sub.id)}
                  style={{
                    ...styles.submissionItem,
                    ...(selectedId === sub.id ? styles.submissionItemSelected : {}),
                  }}
                >
                  <div style={styles.geneName}>{sub.gene_name || 'Unknown gene'}</div>
                  <div style={styles.smallText}>
                    {sub.orf_name && <span>ORF: {sub.orf_name} | </span>}
                    {sub.organism}
                  </div>
                  <div style={styles.smallMutedText}>From: {sub.submitter_name}</div>
                  <div style={styles.dateText}>{sub.submitted_at?.split('T')[0]}</div>
                </div>
              ))}
            </div>
          )}

          <button onClick={loadSubmissions} style={styles.refreshButton}>
            Refresh List
          </button>
        </div>

        {/* Submission Details / Processing Form */}
        <div style={styles.panel}>
          <h2 style={styles.panelTitle}>
            {details ? 'Process Submission' : 'Select a submission'}
          </h2>

          {loadingDetails ? (
            <p>Loading details...</p>
          ) : details ? (
            <div>
              {/* Submitter Info */}
              {details.colleague_info && (
                <div style={styles.infoBox}>
                  <strong>Submitter:</strong> {details.colleague_info.name}
                  {details.colleague_info.email && (
                    <span style={styles.mutedText}> ({details.colleague_info.email})</span>
                  )}
                  <br />
                  {details.colleague_info.institution}
                </div>
              )}

              {/* ORF Info */}
              {details.orf_info && (
                <div style={styles.orfInfoBox}>
                  <strong>ORF Found:</strong> {details.orf_info.feature_name}
                  {details.orf_info.gene_name && (
                    <span style={{ color: '#dc2626' }}>
                      {' '}(Already named: {details.orf_info.gene_name})
                    </span>
                  )}
                  <br />
                  Type: {details.orf_info.feature_type}
                </div>
              )}

              {/* Processing Form */}
              <div style={styles.formSection}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Gene Name *</label>
                  <input
                    type="text"
                    value={geneName}
                    onChange={(e) => setGeneName(e.target.value)}
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>ORF Name</label>
                  <input
                    type="text"
                    value={orfName}
                    onChange={(e) => setOrfName(e.target.value)}
                    placeholder="Defaults to gene name (uppercased)"
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Organism *</label>
                  <input
                    type="text"
                    value={organismAbbrev}
                    onChange={(e) => setOrganismAbbrev(e.target.value)}
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    style={styles.textarea}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Headline</label>
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Aliases (comma-separated)</label>
                  <input
                    type="text"
                    value={aliases}
                    onChange={(e) => setAliases(e.target.value)}
                    placeholder="e.g., ABC1, XYZ2"
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Reference No</label>
                  <input
                    type="number"
                    value={referenceNo}
                    onChange={(e) => setReferenceNo(e.target.value)}
                    placeholder="Optional"
                    style={styles.input}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div style={styles.buttonGroup}>
                <button
                  onClick={handleProcess}
                  disabled={processing}
                  style={{
                    ...styles.button,
                    ...styles.buttonPrimary,
                    ...(processing ? styles.buttonDisabled : {}),
                  }}
                >
                  {processing ? 'Processing...' : 'Commit'}
                </button>
                <button onClick={handleDelay} style={{ ...styles.button, ...styles.buttonWarning }}>
                  Delay
                </button>
                <button onClick={handleDelete} style={{ ...styles.button, ...styles.buttonDanger }}>
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <p style={styles.mutedText}>
              Select a submission from the list to view details and process it.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1100px',
    margin: '1rem auto',
    padding: '1rem 1.5rem',
  },
  backLink: {
    marginBottom: '1.5rem',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '1.5rem',
  },
  errorBox: {
    backgroundColor: '#fee2e2',
    border: '1px solid #f87171',
    color: '#b91c1c',
    padding: '0.75rem 1rem',
    borderRadius: '4px',
    marginBottom: '1rem',
  },
  successBox: {
    backgroundColor: '#dcfce7',
    border: '1px solid #4ade80',
    color: '#166534',
    padding: '0.75rem 1rem',
    borderRadius: '4px',
    marginBottom: '1rem',
  },
  columnsWrapper: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
  },
  panel: {
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: '4px',
    padding: '1rem',
  },
  panelTitle: {
    fontWeight: '600',
    marginBottom: '1rem',
    fontSize: '1.1rem',
  },
  mutedText: {
    color: '#666',
  },
  submissionsList: {
    maxHeight: '400px',
    overflowY: 'auto',
  },
  submissionItem: {
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
    marginBottom: '0.5rem',
  },
  submissionItemSelected: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
  },
  geneName: {
    fontWeight: '500',
  },
  smallText: {
    fontSize: '0.875rem',
    color: '#666',
  },
  smallMutedText: {
    fontSize: '0.875rem',
    color: '#888',
  },
  dateText: {
    fontSize: '0.75rem',
    color: '#999',
  },
  refreshButton: {
    marginTop: '1rem',
    padding: '0.5rem 1rem',
    backgroundColor: '#e5e7eb',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  infoBox: {
    padding: '0.75rem',
    backgroundColor: '#f9fafb',
    borderRadius: '4px',
    fontSize: '0.875rem',
    marginBottom: '1rem',
  },
  orfInfoBox: {
    padding: '0.75rem',
    backgroundColor: '#fefce8',
    border: '1px solid #fde047',
    borderRadius: '4px',
    fontSize: '0.875rem',
    marginBottom: '1rem',
  },
  formSection: {
    marginBottom: '1rem',
  },
  formGroup: {
    marginBottom: '0.75rem',
  },
  label: {
    display: 'block',
    fontWeight: '500',
    fontSize: '0.875rem',
    marginBottom: '0.25rem',
  },
  input: {
    width: '100%',
    border: '1px solid #ccc',
    borderRadius: '4px',
    padding: '0.5rem 0.75rem',
    fontSize: '1rem',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    border: '1px solid #ccc',
    borderRadius: '4px',
    padding: '0.5rem 0.75rem',
    fontSize: '1rem',
    boxSizing: 'border-box',
    resize: 'vertical',
  },
  buttonGroup: {
    display: 'flex',
    gap: '0.5rem',
    paddingTop: '1rem',
    borderTop: '1px solid #e5e7eb',
  },
  button: {
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '500',
  },
  buttonPrimary: {
    backgroundColor: '#2563eb',
    color: '#fff',
  },
  buttonWarning: {
    backgroundColor: '#eab308',
    color: '#fff',
  },
  buttonDanger: {
    backgroundColor: '#dc2626',
    color: '#fff',
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
};
