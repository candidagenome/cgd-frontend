/**
 * Note Curation Page
 *
 * Create and edit curator notes.
 * - Search existing notes
 * - Create new notes with entity links
 * - Edit note text and type
 * - Link/unlink notes to entities
 * - Delete notes
 *
 * Mirrors legacy NewNote.pm and UpdateNote.pm functionality.
 */
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import noteCurationApi from '../../api/noteCurationApi';

function NoteCurationPage() {
  const { noteNo } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isNewMode = !noteNo || searchParams.get('mode') === 'new';

  // Available options
  const [noteTypes, setNoteTypes] = useState([]);
  const [linkableTables, setLinkableTables] = useState([]);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);

  // Note state
  const [noteData, setNoteData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Form state (for create/edit)
  const [formText, setFormText] = useState('');
  const [formType, setFormType] = useState('');
  const [formLinks, setFormLinks] = useState([]);
  const [saving, setSaving] = useState(false);

  // Add link state
  const [newLinkTable, setNewLinkTable] = useState('');
  const [newLinkKey, setNewLinkKey] = useState('');

  // Load options
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [typesData, tablesData] = await Promise.all([
          noteCurationApi.getNoteTypes(),
          noteCurationApi.getLinkableTables(),
        ]);
        setNoteTypes(typesData.note_types);
        setLinkableTables(tablesData.tables);
        if (!formType && typesData.note_types.length > 0) {
          setFormType(typesData.note_types[0]);
        }
      } catch (err) {
        console.error('Failed to load options:', err);
      }
    };

    loadOptions();
  }, []);

  // Load note details
  const loadNote = useCallback(async (id) => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const data = await noteCurationApi.getNoteDetails(id);
      setNoteData(data);
      setFormText(data.note);
      setFormType(data.note_type);
    } catch (err) {
      if (err.response?.status === 404) {
        setError(`Note ${id} not found`);
      } else {
        setError('Failed to load note details');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Load note on mount if noteNo provided
  useEffect(() => {
    if (noteNo && !isNewMode) {
      loadNote(noteNo);
    }
  }, [noteNo, isNewMode, loadNote]);

  // Search notes
  const handleSearch = async (e) => {
    e.preventDefault();
    setSearching(true);
    setError(null);

    try {
      const data = await noteCurationApi.searchNotes({
        query: searchQuery || undefined,
        noteType: searchType || undefined,
      });
      setSearchResults(data);
    } catch (err) {
      setError('Search failed');
    } finally {
      setSearching(false);
    }
  };

  // Select note from search
  const handleSelectNote = (note) => {
    navigate(`/curation/note/${note.note_no}`);
    setSearchResults(null);
  };

  // Add entity link (for new notes)
  const handleAddLink = () => {
    if (!newLinkTable || !newLinkKey) return;

    const newLink = {
      tab_name: newLinkTable,
      primary_key: parseInt(newLinkKey, 10),
    };

    // Check for duplicates
    const exists = formLinks.some(
      (l) => l.tab_name === newLink.tab_name && l.primary_key === newLink.primary_key
    );
    if (!exists) {
      setFormLinks([...formLinks, newLink]);
    }

    setNewLinkTable('');
    setNewLinkKey('');
  };

  // Remove entity link (for new notes)
  const handleRemoveLink = (index) => {
    setFormLinks(formLinks.filter((_, i) => i !== index));
  };

  // Create new note
  const handleCreateNote = async (e) => {
    e.preventDefault();
    if (!formText.trim() || !formType) return;

    setSaving(true);
    setError(null);

    try {
      const result = await noteCurationApi.createNote(
        formText,
        formType,
        formLinks.length > 0 ? formLinks : null
      );
      setSuccessMessage('Note created successfully');
      navigate(`/curation/note/${result.note_no}`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create note');
    } finally {
      setSaving(false);
    }
  };

  // Update note
  const handleUpdateNote = async () => {
    setSaving(true);
    setError(null);

    try {
      await noteCurationApi.updateNote(noteData.note_no, {
        noteText: formText,
        noteType: formType,
      });
      setSuccessMessage('Note updated successfully');
      loadNote(noteData.note_no);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update note');
    } finally {
      setSaving(false);
    }
  };

  // Delete note
  const handleDeleteNote = async () => {
    if (!window.confirm('Are you sure you want to delete this note? All entity links will also be removed.')) {
      return;
    }

    try {
      await noteCurationApi.deleteNote(noteData.note_no);
      setSuccessMessage('Note deleted');
      navigate('/curation/note/edit');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete note');
    }
  };

  // Link note to entity
  const handleLinkToEntity = async () => {
    if (!newLinkTable || !newLinkKey) return;

    try {
      await noteCurationApi.linkNoteToEntity(
        noteData.note_no,
        newLinkTable,
        parseInt(newLinkKey, 10)
      );
      setSuccessMessage('Note linked to entity');
      setNewLinkTable('');
      setNewLinkKey('');
      loadNote(noteData.note_no);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to link note');
    }
  };

  // Unlink note from entity
  const handleUnlinkFromEntity = async (noteLinkNo) => {
    if (!window.confirm('Are you sure you want to unlink this entity?')) return;

    try {
      await noteCurationApi.unlinkNoteFromEntity(noteLinkNo);
      setSuccessMessage('Entity unlinked');
      loadNote(noteData.note_no);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to unlink entity');
    }
  };

  // Reset to new mode
  const handleNewNote = () => {
    setNoteData(null);
    setFormText('');
    setFormType(noteTypes[0] || '');
    setFormLinks([]);
    navigate('/curation/note/new');
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>{isNewMode ? 'Create New Note' : 'Edit Note'}</h1>
        <div style={styles.headerRight}>
          <span>Curator: {user?.first_name} {user?.last_name}</span>
          {!isNewMode && (
            <button onClick={handleNewNote} style={styles.headerButton}>
              + New Note
            </button>
          )}
          <Link to="/curation" style={styles.headerLink}>
            Curator Central
          </Link>
        </div>
      </div>

      {successMessage && <div style={styles.success}>{successMessage}</div>}
      {error && <div style={styles.error}>{error}</div>}

      {/* Search Section (for edit mode) */}
      {!isNewMode && !noteData && (
        <div style={styles.searchSection}>
          <h3>Find Note to Edit</h3>
          <form onSubmit={handleSearch} style={styles.searchForm}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by note text..."
              style={styles.searchInput}
            />
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              style={styles.searchSelect}
            >
              <option value="">All types</option>
              {noteTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <button type="submit" disabled={searching} style={styles.searchButton}>
              {searching ? 'Searching...' : 'Search'}
            </button>
          </form>
        </div>
      )}

      {/* Search Results */}
      {searchResults && (
        <div style={styles.searchResults}>
          <h3>Search Results ({searchResults.total})</h3>
          {searchResults.notes.length === 0 ? (
            <p>No notes found.</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Note #</th>
                  <th style={styles.th}>Type</th>
                  <th style={styles.th}>Note</th>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {searchResults.notes.map((note) => (
                  <tr key={note.note_no}>
                    <td style={styles.td}>{note.note_no}</td>
                    <td style={styles.td}>{note.note_type}</td>
                    <td style={styles.td}>{note.note}</td>
                    <td style={styles.td}>{note.date_created?.split('T')[0]}</td>
                    <td style={styles.td}>
                      <button
                        onClick={() => handleSelectNote(note)}
                        style={styles.actionButton}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <button onClick={() => setSearchResults(null)} style={styles.closeButton}>
            Close
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && <div style={styles.loading}>Loading note...</div>}

      {/* Create New Note Form */}
      {isNewMode && !loading && (
        <div style={styles.formSection}>
          <form onSubmit={handleCreateNote}>
            <div style={styles.formRow}>
              <label style={styles.formLabel}>Note Type:</label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value)}
                style={styles.formSelect}
                required
              >
                {noteTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div style={styles.formRow}>
              <label style={styles.formLabel}>Note Text:</label>
              <textarea
                value={formText}
                onChange={(e) => setFormText(e.target.value)}
                style={styles.formTextarea}
                rows={6}
                required
              />
            </div>

            <div style={styles.formRow}>
              <label style={styles.formLabel}>Link to Entities:</label>
              <div style={styles.linkSection}>
                <div style={styles.linkInputRow}>
                  <select
                    value={newLinkTable}
                    onChange={(e) => setNewLinkTable(e.target.value)}
                    style={styles.linkSelect}
                  >
                    <option value="">Select table...</option>
                    {linkableTables.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={newLinkKey}
                    onChange={(e) => setNewLinkKey(e.target.value)}
                    placeholder="Primary key"
                    style={styles.linkInput}
                  />
                  <button
                    type="button"
                    onClick={handleAddLink}
                    disabled={!newLinkTable || !newLinkKey}
                    style={styles.addLinkButton}
                  >
                    Add
                  </button>
                </div>

                {formLinks.length > 0 && (
                  <div style={styles.linkList}>
                    {formLinks.map((link, idx) => (
                      <div key={idx} style={styles.linkTag}>
                        {link.tab_name}:{link.primary_key}
                        <button
                          type="button"
                          onClick={() => handleRemoveLink(idx)}
                          style={styles.removeLinkBtn}
                        >
                          x
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div style={styles.formButtons}>
              <button type="submit" disabled={saving} style={styles.saveButton}>
                {saving ? 'Creating...' : 'Create Note'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Existing Note */}
      {noteData && !loading && (
        <div style={styles.formSection}>
          <div style={styles.noteHeader}>
            <h2>Note #{noteData.note_no}</h2>
            <span style={styles.noteInfo}>
              Created: {noteData.date_created?.split('T')[0]} by {noteData.created_by}
            </span>
          </div>

          <div style={styles.formRow}>
            <label style={styles.formLabel}>Note Type:</label>
            <select
              value={formType}
              onChange={(e) => setFormType(e.target.value)}
              style={styles.formSelect}
            >
              {noteTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div style={styles.formRow}>
            <label style={styles.formLabel}>Note Text:</label>
            <textarea
              value={formText}
              onChange={(e) => setFormText(e.target.value)}
              style={styles.formTextarea}
              rows={6}
            />
          </div>

          <div style={styles.formButtons}>
            <button onClick={handleUpdateNote} disabled={saving} style={styles.saveButton}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button onClick={handleDeleteNote} style={styles.deleteButton}>
              Delete Note
            </button>
          </div>

          {/* Linked Entities */}
          <div style={styles.linkedSection}>
            <h3 style={styles.sectionHeader}>
              Linked Entities ({noteData.linked_entities?.length || 0})
            </h3>

            {/* Add new link */}
            <div style={styles.linkInputRow}>
              <select
                value={newLinkTable}
                onChange={(e) => setNewLinkTable(e.target.value)}
                style={styles.linkSelect}
              >
                <option value="">Select table...</option>
                {linkableTables.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <input
                type="number"
                value={newLinkKey}
                onChange={(e) => setNewLinkKey(e.target.value)}
                placeholder="Primary key"
                style={styles.linkInput}
              />
              <button
                onClick={handleLinkToEntity}
                disabled={!newLinkTable || !newLinkKey}
                style={styles.addLinkButton}
              >
                Link Entity
              </button>
            </div>

            {noteData.linked_entities?.length > 0 ? (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Table</th>
                    <th style={styles.th}>Key</th>
                    <th style={styles.th}>Entity</th>
                    <th style={styles.th}>Date Linked</th>
                    <th style={styles.th}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {noteData.linked_entities.map((entity) => (
                    <tr key={entity.note_link_no}>
                      <td style={styles.td}>{entity.tab_name}</td>
                      <td style={styles.td}>{entity.primary_key}</td>
                      <td style={styles.td}>
                        {entity.entity_name && (
                          <Link to={`/locus/${entity.entity_name}`}>
                            {entity.entity_name}
                            {entity.gene_name && ` (${entity.gene_name})`}
                          </Link>
                        )}
                      </td>
                      <td style={styles.td}>{entity.date_created?.split('T')[0]}</td>
                      <td style={styles.td}>
                        <button
                          onClick={() => handleUnlinkFromEntity(entity.note_link_no)}
                          style={styles.unlinkButton}
                        >
                          Unlink
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={styles.noItems}>No linked entities.</p>
            )}
          </div>
        </div>
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
    color: '#333',
  },
  headerButton: {
    padding: '0.25rem 0.75rem',
    backgroundColor: '#337ab7',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  success: {
    padding: '1rem',
    backgroundColor: '#efe',
    border: '1px solid #cfc',
    borderRadius: '4px',
    color: '#060',
    marginBottom: '1rem',
  },
  error: {
    padding: '1rem',
    backgroundColor: '#fee',
    border: '1px solid #fcc',
    borderRadius: '4px',
    color: '#c00',
    marginBottom: '1rem',
  },
  loading: {
    padding: '2rem',
    textAlign: 'center',
    color: '#666',
  },
  searchSection: {
    marginBottom: '1.5rem',
    padding: '1rem',
    backgroundColor: '#f9f9f9',
    border: '1px solid #ddd',
    borderRadius: '4px',
  },
  searchForm: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  searchInput: {
    flex: 1,
    minWidth: '200px',
    padding: '0.5rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
  },
  searchSelect: {
    padding: '0.5rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
  },
  searchButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#337ab7',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  searchResults: {
    padding: '1rem',
    backgroundColor: '#f9f9f9',
    border: '1px solid #ddd',
    borderRadius: '4px',
    marginBottom: '1.5rem',
  },
  closeButton: {
    marginTop: '1rem',
    padding: '0.5rem 1rem',
    backgroundColor: '#666',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  formSection: {
    padding: '1rem',
    backgroundColor: '#f9f9f9',
    border: '1px solid #ddd',
    borderRadius: '4px',
  },
  noteHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  noteInfo: {
    color: '#666',
    fontSize: '0.9rem',
  },
  formRow: {
    marginBottom: '1rem',
  },
  formLabel: {
    display: 'block',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
  },
  formSelect: {
    padding: '0.5rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    width: '200px',
  },
  formTextarea: {
    width: '100%',
    padding: '0.5rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    resize: 'vertical',
  },
  formButtons: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '1rem',
  },
  saveButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#5cb85c',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  deleteButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#d9534f',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  linkSection: {
    marginTop: '0.5rem',
  },
  linkInputRow: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  linkSelect: {
    padding: '0.5rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    minWidth: '150px',
  },
  linkInput: {
    padding: '0.5rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    width: '120px',
  },
  addLinkButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#337ab7',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  linkList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginTop: '0.5rem',
  },
  linkTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.5rem',
    backgroundColor: '#e6f3ff',
    border: '1px solid #99c9ff',
    borderRadius: '4px',
    fontSize: '0.9rem',
  },
  removeLinkBtn: {
    background: 'none',
    border: 'none',
    color: '#c00',
    cursor: 'pointer',
    padding: '0 0.25rem',
    fontWeight: 'bold',
  },
  linkedSection: {
    marginTop: '1.5rem',
  },
  sectionHeader: {
    backgroundColor: '#CCCCFF',
    padding: '0.5rem',
    margin: '0 0 1rem 0',
    fontSize: '1rem',
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
  actionButton: {
    padding: '0.25rem 0.5rem',
    backgroundColor: '#337ab7',
    color: 'white',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  unlinkButton: {
    padding: '0.25rem 0.5rem',
    backgroundColor: '#d9534f',
    color: 'white',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  noItems: {
    color: '#666',
    fontStyle: 'italic',
  },
};

export default NoteCurationPage;
