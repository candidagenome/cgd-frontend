/**
 * Colleague Curation Page
 *
 * Curator interface for managing colleague records.
 * - List and search colleagues
 * - View/edit colleague details
 * - Add/remove URLs, keywords, features, relationships
 *
 * Mirrors legacy NewColleague.pm and UpdateColleague.pm functionality.
 */
import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import colleagueCurationApi from '../../api/colleagueCurationApi';

function ColleagueCurationPage() {
  const { colleagueNo: paramColleagueNo } = useParams();
  const { user } = useAuth();

  // List view state
  const [colleagues, setColleagues] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Detail view state
  const [colleagueDetails, setColleagueDetails] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});

  // New item inputs
  const [newUrl, setNewUrl] = useState({ url_type: '', link: '' });
  const [newKeyword, setNewKeyword] = useState('');
  const [newFeature, setNewFeature] = useState('');

  const pageSize = 50;

  // Load colleague list
  const loadColleagues = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await colleagueCurationApi.listColleagues(page, pageSize);
      setColleagues(data.colleagues);
      setTotal(data.total);
    } catch (err) {
      setError('Failed to load colleagues');
    } finally {
      setLoading(false);
    }
  }, [page]);

  // Load colleague details
  const loadColleagueDetails = useCallback(async () => {
    if (!paramColleagueNo) return;

    setLoading(true);
    setError(null);

    try {
      const data = await colleagueCurationApi.getColleagueDetails(paramColleagueNo);
      setColleagueDetails(data);
      setEditData(data);
    } catch (err) {
      if (err.response?.status === 404) {
        setError(`Colleague ${paramColleagueNo} not found`);
      } else {
        setError('Failed to load colleague details');
      }
      setColleagueDetails(null);
    } finally {
      setLoading(false);
    }
  }, [paramColleagueNo]);

  // Load data on mount
  useEffect(() => {
    if (paramColleagueNo) {
      loadColleagueDetails();
    } else {
      loadColleagues();
    }
  }, [loadColleagues, loadColleagueDetails, paramColleagueNo]);

  // Handle save changes
  const handleSave = async () => {
    try {
      await colleagueCurationApi.updateColleague(paramColleagueNo, editData);
      setSuccessMessage('Colleague updated successfully');
      setEditing(false);
      loadColleagueDetails();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update colleague');
    }
  };

  // Handle delete colleague
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this colleague?')) {
      return;
    }

    try {
      await colleagueCurationApi.deleteColleague(paramColleagueNo);
      setSuccessMessage('Colleague deleted');
      window.location.href = '/curation/colleague/list';
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete colleague');
    }
  };

  // Handle add URL
  const handleAddUrl = async () => {
    if (!newUrl.url_type || !newUrl.link) return;

    try {
      await colleagueCurationApi.addUrl(paramColleagueNo, newUrl.url_type, newUrl.link);
      setNewUrl({ url_type: '', link: '' });
      loadColleagueDetails();
      setSuccessMessage('URL added');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add URL');
    }
  };

  // Handle remove URL
  const handleRemoveUrl = async (collUrlNo) => {
    try {
      await colleagueCurationApi.removeUrl(collUrlNo);
      loadColleagueDetails();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to remove URL');
    }
  };

  // Handle add keyword
  const handleAddKeyword = async () => {
    if (!newKeyword) return;

    try {
      await colleagueCurationApi.addKeyword(paramColleagueNo, newKeyword);
      setNewKeyword('');
      loadColleagueDetails();
      setSuccessMessage('Keyword added');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add keyword');
    }
  };

  // Handle remove keyword
  const handleRemoveKeyword = async (collKwNo) => {
    try {
      await colleagueCurationApi.removeKeyword(collKwNo);
      loadColleagueDetails();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to remove keyword');
    }
  };

  // Handle add feature
  const handleAddFeature = async () => {
    if (!newFeature) return;

    try {
      await colleagueCurationApi.addFeature(paramColleagueNo, newFeature);
      setNewFeature('');
      loadColleagueDetails();
      setSuccessMessage('Feature added');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add feature');
    }
  };

  // Handle remove feature
  const handleRemoveFeature = async (collFeatNo) => {
    try {
      await colleagueCurationApi.removeFeature(collFeatNo);
      loadColleagueDetails();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to remove feature');
    }
  };

  // Handle remove relationship
  const handleRemoveRelationship = async (collRelNo) => {
    try {
      await colleagueCurationApi.removeRelationship(collRelNo);
      loadColleagueDetails();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to remove relationship');
    }
  };

  // Render list view
  if (!paramColleagueNo) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1>Colleague Curation</h1>
          <div style={styles.headerRight}>
            <span>Curator: {user?.first_name} {user?.last_name}</span>
            <Link to="/curation" style={styles.headerLink}>
              Curator Central
            </Link>
          </div>
        </div>

        {successMessage && <div style={styles.success}>{successMessage}</div>}
        {error && <div style={styles.error}>{error}</div>}

        {loading ? (
          <div style={styles.loading}>Loading colleagues...</div>
        ) : (
          <>
            <p>Total colleagues: {total}</p>

            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>ID</th>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Institution</th>
                  <th style={styles.th}>PI</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {colleagues.map((c) => (
                  <tr key={c.colleague_no}>
                    <td style={styles.td}>{c.colleague_no}</td>
                    <td style={styles.td}>
                      {c.last_name}, {c.first_name}
                    </td>
                    <td style={styles.td}>{c.email || '-'}</td>
                    <td style={styles.td}>{c.institution || '-'}</td>
                    <td style={styles.td}>{c.is_pi}</td>
                    <td style={styles.td}>
                      <Link to={`/curation/colleague/${c.colleague_no}`}>
                        Edit
                      </Link>
                      {' | '}
                      <Link to={`/colleague/${c.colleague_no}`} target="_blank">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={styles.pagination}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                style={styles.pageButton}
              >
                Previous
              </button>
              <span style={styles.pageInfo}>
                Page {page} of {Math.ceil(total / pageSize)}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page * pageSize >= total}
                style={styles.pageButton}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  // Render detail view
  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading colleague details...</div>
      </div>
    );
  }

  if (error && !colleagueDetails) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>{error}</div>
        <Link to="/curation/colleague/list">Back to Colleague List</Link>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>
          Edit Colleague: {colleagueDetails?.first_name} {colleagueDetails?.last_name}
        </h1>
        <div style={styles.headerRight}>
          <Link to="/curation/colleague/list" style={styles.headerLink}>
            Colleague List
          </Link>
          <Link to="/curation" style={styles.headerLink}>
            Curator Central
          </Link>
        </div>
      </div>

      {successMessage && <div style={styles.success}>{successMessage}</div>}
      {error && <div style={styles.error}>{error}</div>}

      {colleagueDetails && (
        <>
          {/* Basic Info Section */}
          <section style={styles.section}>
            <h3 style={styles.sectionHeader}>
              Basic Information
              {!editing && (
                <button onClick={() => setEditing(true)} style={styles.editButton}>
                  Edit
                </button>
              )}
            </h3>

            {editing ? (
              <div style={styles.editForm}>
                <div style={styles.formRow}>
                  <label style={styles.formLabel}>First Name:</label>
                  <input
                    type="text"
                    value={editData.first_name || ''}
                    onChange={(e) =>
                      setEditData({ ...editData, first_name: e.target.value })
                    }
                    style={styles.formInput}
                  />
                </div>
                <div style={styles.formRow}>
                  <label style={styles.formLabel}>Last Name:</label>
                  <input
                    type="text"
                    value={editData.last_name || ''}
                    onChange={(e) =>
                      setEditData({ ...editData, last_name: e.target.value })
                    }
                    style={styles.formInput}
                  />
                </div>
                <div style={styles.formRow}>
                  <label style={styles.formLabel}>Email:</label>
                  <input
                    type="email"
                    value={editData.email || ''}
                    onChange={(e) =>
                      setEditData({ ...editData, email: e.target.value })
                    }
                    style={styles.formInput}
                  />
                </div>
                <div style={styles.formRow}>
                  <label style={styles.formLabel}>Institution:</label>
                  <input
                    type="text"
                    value={editData.institution || ''}
                    onChange={(e) =>
                      setEditData({ ...editData, institution: e.target.value })
                    }
                    style={styles.formInput}
                  />
                </div>
                <div style={styles.formRow}>
                  <label style={styles.formLabel}>Job Title:</label>
                  <input
                    type="text"
                    value={editData.job_title || ''}
                    onChange={(e) =>
                      setEditData({ ...editData, job_title: e.target.value })
                    }
                    style={styles.formInput}
                  />
                </div>
                <div style={styles.formRow}>
                  <label style={styles.formLabel}>Is PI:</label>
                  <select
                    value={editData.is_pi || 'N'}
                    onChange={(e) =>
                      setEditData({ ...editData, is_pi: e.target.value })
                    }
                    style={styles.formSelect}
                  >
                    <option value="Y">Yes</option>
                    <option value="N">No</option>
                  </select>
                </div>

                <div style={styles.formButtons}>
                  <button onClick={handleSave} style={styles.saveButton}>
                    Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false);
                      setEditData(colleagueDetails);
                    }}
                    style={styles.cancelButton}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <table style={styles.infoTable}>
                <tbody>
                  <tr>
                    <td style={styles.labelCell}>Colleague No:</td>
                    <td style={styles.valueCell}>{colleagueDetails.colleague_no}</td>
                  </tr>
                  <tr>
                    <td style={styles.labelCell}>Name:</td>
                    <td style={styles.valueCell}>
                      {colleagueDetails.first_name} {colleagueDetails.last_name}
                      {colleagueDetails.suffix && `, ${colleagueDetails.suffix}`}
                    </td>
                  </tr>
                  <tr>
                    <td style={styles.labelCell}>Email:</td>
                    <td style={styles.valueCell}>{colleagueDetails.email || '-'}</td>
                  </tr>
                  <tr>
                    <td style={styles.labelCell}>Institution:</td>
                    <td style={styles.valueCell}>
                      {colleagueDetails.institution || '-'}
                    </td>
                  </tr>
                  <tr>
                    <td style={styles.labelCell}>Job Title:</td>
                    <td style={styles.valueCell}>
                      {colleagueDetails.job_title || '-'}
                    </td>
                  </tr>
                  <tr>
                    <td style={styles.labelCell}>Is PI:</td>
                    <td style={styles.valueCell}>{colleagueDetails.is_pi}</td>
                  </tr>
                  <tr>
                    <td style={styles.labelCell}>Source:</td>
                    <td style={styles.valueCell}>{colleagueDetails.source}</td>
                  </tr>
                </tbody>
              </table>
            )}
          </section>

          {/* URLs Section */}
          <section style={styles.section}>
            <h3 style={styles.sectionHeader}>URLs</h3>
            {colleagueDetails.urls?.length > 0 ? (
              <ul style={styles.itemList}>
                {colleagueDetails.urls.map((url) => (
                  <li key={url.coll_url_no} style={styles.itemRow}>
                    <span>
                      <strong>{url.url_type}:</strong>{' '}
                      <a href={url.link} target="_blank" rel="noopener noreferrer">
                        {url.link}
                      </a>
                    </span>
                    <button
                      onClick={() => handleRemoveUrl(url.coll_url_no)}
                      style={styles.removeButton}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={styles.emptyText}>No URLs</p>
            )}
            <div style={styles.addRow}>
              <select
                value={newUrl.url_type}
                onChange={(e) => setNewUrl({ ...newUrl, url_type: e.target.value })}
                style={styles.smallSelect}
              >
                <option value="">Type...</option>
                <option value="Lab">Lab</option>
                <option value="Personal">Personal</option>
                <option value="Research">Research</option>
              </select>
              <input
                type="text"
                value={newUrl.link}
                onChange={(e) => setNewUrl({ ...newUrl, link: e.target.value })}
                placeholder="URL"
                style={styles.smallInput}
              />
              <button onClick={handleAddUrl} style={styles.addButton}>
                Add
              </button>
            </div>
          </section>

          {/* Keywords Section */}
          <section style={styles.section}>
            <h3 style={styles.sectionHeader}>Keywords</h3>
            {colleagueDetails.keywords?.length > 0 ? (
              <ul style={styles.itemList}>
                {colleagueDetails.keywords.map((kw) => (
                  <li key={kw.coll_kw_no} style={styles.itemRow}>
                    <span>{kw.keyword}</span>
                    <button
                      onClick={() => handleRemoveKeyword(kw.coll_kw_no)}
                      style={styles.removeButton}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={styles.emptyText}>No keywords</p>
            )}
            <div style={styles.addRow}>
              <input
                type="text"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                placeholder="Keyword"
                style={styles.smallInput}
              />
              <button onClick={handleAddKeyword} style={styles.addButton}>
                Add
              </button>
            </div>
          </section>

          {/* Features Section */}
          <section style={styles.section}>
            <h3 style={styles.sectionHeader}>Associated Features</h3>
            {colleagueDetails.features?.length > 0 ? (
              <ul style={styles.itemList}>
                {colleagueDetails.features.map((feat) => (
                  <li key={feat.coll_feat_no} style={styles.itemRow}>
                    <span>
                      <Link to={`/locus/${feat.feature_name}`}>
                        {feat.feature_name}
                      </Link>
                      {feat.gene_name && ` (${feat.gene_name})`}
                    </span>
                    <button
                      onClick={() => handleRemoveFeature(feat.coll_feat_no)}
                      style={styles.removeButton}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={styles.emptyText}>No associated features</p>
            )}
            <div style={styles.addRow}>
              <input
                type="text"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                placeholder="Feature/gene name"
                style={styles.smallInput}
              />
              <button onClick={handleAddFeature} style={styles.addButton}>
                Add
              </button>
            </div>
          </section>

          {/* Relationships Section */}
          <section style={styles.section}>
            <h3 style={styles.sectionHeader}>Relationships</h3>
            {colleagueDetails.relationships?.length > 0 ? (
              <ul style={styles.itemList}>
                {colleagueDetails.relationships.map((rel) => (
                  <li key={rel.coll_relationship_no} style={styles.itemRow}>
                    <span>
                      <strong>{rel.relationship_type}:</strong>{' '}
                      <Link to={`/curation/colleague/${rel.associate_no}`}>
                        {rel.associate_name}
                      </Link>
                    </span>
                    <button
                      onClick={() =>
                        handleRemoveRelationship(rel.coll_relationship_no)
                      }
                      style={styles.removeButton}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={styles.emptyText}>No relationships</p>
            )}
          </section>

          {/* Delete Section */}
          <section style={styles.dangerSection}>
            <h3 style={styles.dangerHeader}>Danger Zone</h3>
            <button onClick={handleDelete} style={styles.deleteButton}>
              Delete Colleague
            </button>
          </section>
        </>
      )}
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
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '1rem',
    marginTop: '1rem',
  },
  pageButton: {
    padding: '0.5rem 1rem',
    cursor: 'pointer',
  },
  pageInfo: {
    color: '#666',
  },
  section: {
    marginBottom: '1.5rem',
    padding: '1rem',
    backgroundColor: '#f9f9f9',
    border: '1px solid #ddd',
    borderRadius: '4px',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
    paddingBottom: '0.5rem',
    borderBottom: '1px solid #ddd',
    margin: 0,
  },
  editButton: {
    padding: '0.25rem 0.5rem',
    backgroundColor: '#337ab7',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  infoTable: {
    width: '100%',
  },
  labelCell: {
    fontWeight: 'bold',
    width: '150px',
    padding: '0.25rem 0',
  },
  valueCell: {
    padding: '0.25rem 0',
  },
  editForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  formRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  formLabel: {
    width: '120px',
    fontWeight: 'bold',
  },
  formInput: {
    padding: '0.4rem',
    fontSize: '0.9rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    flex: 1,
    maxWidth: '300px',
  },
  formSelect: {
    padding: '0.4rem',
    fontSize: '0.9rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
  },
  formButtons: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '0.5rem',
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
    backgroundColor: '#999',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  itemList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  itemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.25rem 0',
    borderBottom: '1px solid #eee',
  },
  emptyText: {
    color: '#666',
    fontStyle: 'italic',
  },
  addRow: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '0.5rem',
  },
  smallSelect: {
    padding: '0.4rem',
    fontSize: '0.9rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    width: '120px',
  },
  smallInput: {
    padding: '0.4rem',
    fontSize: '0.9rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    flex: 1,
  },
  addButton: {
    padding: '0.4rem 0.8rem',
    backgroundColor: '#337ab7',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  removeButton: {
    padding: '0.2rem 0.4rem',
    backgroundColor: '#d9534f',
    color: 'white',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    fontSize: '0.8rem',
  },
  dangerSection: {
    marginTop: '2rem',
    padding: '1rem',
    backgroundColor: '#fff',
    border: '1px solid #d9534f',
    borderRadius: '4px',
  },
  dangerHeader: {
    color: '#d9534f',
    marginBottom: '0.5rem',
  },
  deleteButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#d9534f',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export default ColleagueCurationPage;
