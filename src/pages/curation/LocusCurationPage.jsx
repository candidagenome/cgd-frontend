/**
 * Locus Curation Page
 *
 * Full locus/feature information curation interface.
 * - Search for features
 * - Edit basic feature fields (gene name, description, headline, etc.)
 * - Manage aliases, notes, and URLs
 *
 * Mirrors legacy locusCuration CGI functionality.
 */
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import locusCurationApi from '../../api/locusCurationApi';
import { filterAllowedOrganisms } from '../../constants/organisms';
import { formatCitationString, CitationLinksBelow, buildCitationLinks } from '../../utils/formatCitation.jsx';

function LocusCurationPage() {
  const { featureName } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Organism state
  const [organisms, setOrganisms] = useState([]);
  const [selectedOrganism, setSelectedOrganism] = useState('');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);

  // Feature state
  const [featureData, setFeatureData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Load organisms on mount
  useEffect(() => {
    const loadOrganisms = async () => {
      try {
        const data = await locusCurationApi.getOrganisms();
        const filteredOrganisms = filterAllowedOrganisms(data.organisms || []);
        setOrganisms(filteredOrganisms);
        // Default to first organism if available
        if (filteredOrganisms.length > 0) {
          setSelectedOrganism(filteredOrganisms[0].organism_abbrev);
        }
      } catch (err) {
        console.error('Failed to load organisms:', err);
      }
    };
    loadOrganisms();
  }, []);

  // Edit form state
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  // Add item forms state
  const [showAddAlias, setShowAddAlias] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);
  const [showAddUrl, setShowAddUrl] = useState(false);

  const [newAlias, setNewAlias] = useState({ alias_name: '', alias_type: 'Uniform', reference_no: '' });
  const [newNote, setNewNote] = useState({ note_type: '', note_text: '' });
  const [newUrl, setNewUrl] = useState({ url_type: '', link: '' });

  // Load feature details
  const loadFeature = useCallback(async (identifier) => {
    if (!identifier) return;

    setLoading(true);
    setError(null);

    try {
      const data = await locusCurationApi.getFeatureDetails(identifier);
      setFeatureData(data);
      setEditForm({
        gene_name: data.gene_name || '',
        gene_name_pmids: data.gene_name_pmids || '',
        name_description: data.name_description || '',
        name_description_pmids: data.name_description_pmids || '',
        headline: data.headline || '',
        headline_pmids: data.headline_pmids || '',
        feature_type: data.feature_type || '',
      });
    } catch (err) {
      if (err.response?.status === 404) {
        setError(`Feature '${identifier}' not found`);
      } else if (err.response?.status === 401) {
        // Auth error - handled by interceptor, don't show duplicate error
        return;
      } else {
        setError(err.response?.data?.detail || 'Failed to load feature details');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Load feature on mount if featureName provided
  useEffect(() => {
    if (featureName) {
      loadFeature(featureName);
    }
  }, [featureName, loadFeature]);

  // Search features
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    setError(null);

    try {
      const data = await locusCurationApi.searchFeatures(searchQuery, {
        organismAbbrev: selectedOrganism || undefined,
      });
      setSearchResults(data);
    } catch (err) {
      setError('Search failed');
    } finally {
      setSearching(false);
    }
  };

  // Select feature from search results
  const handleSelectFeature = (feature) => {
    navigate(`/curation/locus/${feature.feature_name}`);
    setSearchResults(null);
    setSearchQuery('');
  };

  // Handle edit form change
  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  // Save feature changes
  const handleSaveFeature = async () => {
    setSaving(true);
    setError(null);

    try {
      await locusCurationApi.updateFeature(featureData.feature_no, editForm);
      setSuccessMessage('Feature updated successfully');
      setEditMode(false);
      loadFeature(featureData.feature_no);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update feature');
    } finally {
      setSaving(false);
    }
  };

  // Add alias
  const handleAddAlias = async (e) => {
    e.preventDefault();
    if (!newAlias.alias_name.trim()) return;

    try {
      await locusCurationApi.addAlias(
        featureData.feature_no,
        newAlias.alias_name,
        newAlias.alias_type,
        newAlias.reference_no ? parseInt(newAlias.reference_no, 10) : null
      );
      setSuccessMessage('Alias added');
      setShowAddAlias(false);
      setNewAlias({ alias_name: '', alias_type: 'Uniform', reference_no: '' });
      loadFeature(featureData.feature_no);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add alias');
    }
  };

  // Remove alias
  const handleRemoveAlias = async (featureAliasNo) => {
    if (!window.confirm('Are you sure you want to remove this alias?')) return;

    try {
      await locusCurationApi.removeAlias(featureAliasNo);
      setSuccessMessage('Alias removed');
      loadFeature(featureData.feature_no);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to remove alias');
    }
  };

  // Add note
  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.note_type.trim() || !newNote.note_text.trim()) return;

    try {
      await locusCurationApi.addNote(
        featureData.feature_no,
        newNote.note_type,
        newNote.note_text
      );
      setSuccessMessage('Note added');
      setShowAddNote(false);
      setNewNote({ note_type: '', note_text: '' });
      loadFeature(featureData.feature_no);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add note');
    }
  };

  // Remove note
  const handleRemoveNote = async (featureNoteNo) => {
    if (!window.confirm('Are you sure you want to remove this note?')) return;

    try {
      await locusCurationApi.removeNote(featureNoteNo);
      setSuccessMessage('Note removed');
      loadFeature(featureData.feature_no);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to remove note');
    }
  };

  // Add URL
  const handleAddUrl = async (e) => {
    e.preventDefault();
    if (!newUrl.url_type.trim() || !newUrl.link.trim()) return;

    try {
      await locusCurationApi.addUrl(featureData.feature_no, newUrl.url_type, newUrl.link);
      setSuccessMessage('URL added');
      setShowAddUrl(false);
      setNewUrl({ url_type: '', link: '' });
      loadFeature(featureData.feature_no);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add URL');
    }
  };

  // Remove URL
  const handleRemoveUrl = async (featUrlNo) => {
    if (!window.confirm('Are you sure you want to remove this URL?')) return;

    try {
      await locusCurationApi.removeUrl(featUrlNo);
      setSuccessMessage('URL removed');
      loadFeature(featureData.feature_no);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to remove URL');
    }
  };

  // Unlink field reference
  const handleUnlinkFieldReference = async (refLinkNo, fieldName) => {
    if (!window.confirm(`Are you sure you want to unlink this reference from ${fieldName}?`)) return;

    try {
      await locusCurationApi.unlinkFieldReference(refLinkNo);
      setSuccessMessage('Reference unlinked');
      loadFeature(featureData.feature_no);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to unlink reference');
    }
  };

  // Render field references as a list with citations and links (matching Locus Summary style)
  const renderFieldRefs = (refs, fieldName) => {
    if (!refs || refs.length === 0) return null;
    return (
      <div style={styles.refList}>
        <div style={styles.refListHeader}>References:</div>
        <div style={styles.refListItems}>
          {refs.map((ref) => {
            const links = buildCitationLinks({
              dbxref_id: ref.dbxref_id,
              reference_no: ref.reference_no,
              pubmed: ref.pubmed,
            });
            return (
              <div key={ref.ref_link_no} style={styles.refListItem}>
                <div style={styles.refCitation}>
                  <div style={styles.citationLine}>
                    {ref.citation ? (
                      <>
                        {formatCitationString(ref.citation)}
                        {ref.pubmed && <span style={styles.pmidText}> PMID: {ref.pubmed}</span>}
                      </>
                    ) : ref.pubmed ? (
                      <>
                        <a
                          href={`https://pubmed.ncbi.nlm.nih.gov/${ref.pubmed}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          PMID:{ref.pubmed}
                        </a>
                      </>
                    ) : (
                      <Link to={`/reference/${ref.reference_no}`}>
                        Ref:{ref.reference_no}
                      </Link>
                    )}
                  </div>
                  <CitationLinksBelow links={links} />
                </div>
                <button
                  onClick={() => handleUnlinkFieldReference(ref.ref_link_no, fieldName)}
                  style={styles.unlinkButtonSmall}
                  title="Unlink reference"
                >
                  unlink
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>Locus Curation</h1>
        <div style={styles.headerRight}>
          <span>Curator: {user?.first_name} {user?.last_name}</span>
          <Link to="/curation" style={styles.headerLink}>
            Curator Central
          </Link>
        </div>
      </div>

      {successMessage && <div style={styles.success}>{successMessage}</div>}
      {error && <div style={styles.error}>{error}</div>}

      {/* Search Form */}
      <div style={styles.searchSection}>
        <form onSubmit={handleSearch} style={styles.searchForm}>
          <select
            value={selectedOrganism}
            onChange={(e) => setSelectedOrganism(e.target.value)}
            style={styles.organismSelect}
          >
            <option value="">All organisms</option>
            {organisms.map((org) => (
              <option key={org.organism_abbrev} value={org.organism_abbrev}>
                {org.organism_name}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by feature name or gene name..."
            style={styles.searchInput}
          />
          <button type="submit" disabled={searching} style={styles.searchButton}>
            {searching ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

      {/* Search Results */}
      {searchResults && (
        <div style={styles.searchResults}>
          <h3>Search Results ({searchResults.total})</h3>
          {searchResults.features.length === 0 ? (
            <p>No features found.</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Feature Name</th>
                  <th style={styles.th}>Gene Name</th>
                  <th style={styles.th}>Type</th>
                  <th style={styles.th}>Headline</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {searchResults.features.map((f) => (
                  <tr key={f.feature_no}>
                    <td style={styles.td}>{f.feature_name}</td>
                    <td style={styles.td}>{f.gene_name || '-'}</td>
                    <td style={styles.td}>{f.feature_type}</td>
                    <td style={styles.td}>{f.headline || '-'}</td>
                    <td style={styles.td}>
                      <button
                        onClick={() => handleSelectFeature(f)}
                        style={styles.actionButton}
                      >
                        Select
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <button onClick={() => setSearchResults(null)} style={styles.closeButton}>
            Close Results
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && <div style={styles.loading}>Loading feature details...</div>}

      {/* Feature Details */}
      {featureData && !loading && (
        <div style={styles.featureSection}>
          <div style={styles.featureHeader}>
            <h2>
              {featureData.feature_name}
              {featureData.gene_name && ` (${featureData.gene_name})`}
            </h2>
            <div style={styles.featureActions}>
              <Link to={`/locus/${featureData.feature_name}`} style={styles.headerLink}>
                View Locus Page
              </Link>
              {!editMode && (
                <button onClick={() => setEditMode(true)} style={styles.editButton}>
                  Edit Feature
                </button>
              )}
            </div>
          </div>

          {/* Basic Info */}
          <div style={styles.infoSection}>
            <h3 style={styles.sectionHeader}>Basic Information</h3>

            {editMode ? (
              <div style={styles.editForm}>
                {/* Gene Name Section */}
                <div style={styles.fieldSection}>
                  <div style={styles.fieldLeft}>
                    <div style={styles.formRow}>
                      <label style={styles.formLabel}>Gene Name:</label>
                      <input
                        type="text"
                        value={editForm.gene_name}
                        onChange={(e) => handleEditChange('gene_name', e.target.value)}
                        style={styles.formInputLarge}
                      />
                    </div>
                  </div>
                  <div style={styles.fieldRight}>
                    {renderFieldRefs(featureData.gene_name_refs, 'Gene Name')}
                    <div style={styles.addPmidRow}>
                      <label style={styles.addPmidLabel}>Add PMIDs:</label>
                      <input
                        type="text"
                        value={editForm.gene_name_pmids}
                        onChange={(e) => handleEditChange('gene_name_pmids', e.target.value)}
                        style={styles.formInputPmid}
                        placeholder="e.g. 12345678|23456789"
                      />
                    </div>
                  </div>
                </div>

                {/* Name Description Section */}
                <div style={styles.fieldSection}>
                  <div style={styles.fieldLeft}>
                    <div style={styles.formRow}>
                      <label style={styles.formLabel}>Name Description:</label>
                      <textarea
                        value={editForm.name_description}
                        onChange={(e) => handleEditChange('name_description', e.target.value)}
                        style={styles.formTextareaLarge}
                        rows={3}
                      />
                    </div>
                  </div>
                  <div style={styles.fieldRight}>
                    {renderFieldRefs(featureData.name_description_refs, 'Name Description')}
                    <div style={styles.addPmidRow}>
                      <label style={styles.addPmidLabel}>Add PMIDs:</label>
                      <input
                        type="text"
                        value={editForm.name_description_pmids}
                        onChange={(e) => handleEditChange('name_description_pmids', e.target.value)}
                        style={styles.formInputPmid}
                        placeholder="e.g. 12345678|23456789"
                      />
                    </div>
                  </div>
                </div>

                {/* Headline Section */}
                <div style={styles.fieldSection}>
                  <div style={styles.fieldLeft}>
                    <div style={styles.formRow}>
                      <label style={styles.formLabel}>Headline:</label>
                      <div style={styles.textareaWrapper}>
                        <textarea
                          value={editForm.headline}
                          onChange={(e) => {
                            if (e.target.value.length <= 240) {
                              handleEditChange('headline', e.target.value);
                            }
                          }}
                          style={styles.formTextareaLarge}
                          rows={5}
                          maxLength={240}
                        />
                        <div style={styles.charCount}>
                          {editForm.headline?.length || 0}/240
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={styles.fieldRight}>
                    {renderFieldRefs(featureData.headline_refs, 'Headline')}
                    <div style={styles.addPmidRow}>
                      <label style={styles.addPmidLabel}>Add PMIDs:</label>
                      <input
                        type="text"
                        value={editForm.headline_pmids}
                        onChange={(e) => handleEditChange('headline_pmids', e.target.value)}
                        style={styles.formInputPmid}
                        placeholder="e.g. 12345678|23456789"
                      />
                    </div>
                  </div>
                </div>

                {/* Feature Type */}
                <div style={styles.formRow}>
                  <label style={styles.formLabel}>Feature Type:</label>
                  <input
                    type="text"
                    value={editForm.feature_type}
                    onChange={(e) => handleEditChange('feature_type', e.target.value)}
                    style={styles.formInput}
                  />
                </div>
                <div style={styles.formButtons}>
                  <button
                    onClick={handleSaveFeature}
                    disabled={saving}
                    style={styles.saveButton}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => {
                      setEditMode(false);
                      setEditForm({
                        gene_name: featureData.gene_name || '',
                        gene_name_pmids: featureData.gene_name_pmids || '',
                        name_description: featureData.name_description || '',
                        name_description_pmids: featureData.name_description_pmids || '',
                        headline: featureData.headline || '',
                        headline_pmids: featureData.headline_pmids || '',
                        feature_type: featureData.feature_type || '',
                      });
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
                    <th style={styles.infoTh}>Feature No:</th>
                    <td style={styles.infoTd}>{featureData.feature_no}</td>
                  </tr>
                  <tr>
                    <th style={styles.infoTh}>Feature Name:</th>
                    <td style={styles.infoTd}>{featureData.feature_name}</td>
                  </tr>
                  <tr>
                    <th style={styles.infoTh}>Gene Name:</th>
                    <td style={styles.infoTd}>{featureData.gene_name || '-'}</td>
                  </tr>
                  <tr>
                    <th style={styles.infoTh}>Name Description:</th>
                    <td style={styles.infoTd}>{featureData.name_description || '-'}</td>
                  </tr>
                  <tr>
                    <th style={styles.infoTh}>Feature Type:</th>
                    <td style={styles.infoTd}>{featureData.feature_type}</td>
                  </tr>
                  <tr>
                    <th style={styles.infoTh}>Headline:</th>
                    <td style={styles.infoTd}>{featureData.headline || '-'}</td>
                  </tr>
                  <tr>
                    <th style={styles.infoTh}>Source:</th>
                    <td style={styles.infoTd}>{featureData.source}</td>
                  </tr>
                  <tr>
                    <th style={styles.infoTh}>Created:</th>
                    <td style={styles.infoTd}>
                      {featureData.date_created?.split('T')[0]} by {featureData.created_by}
                    </td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>

          {/* Aliases Section */}
          <div style={styles.infoSection}>
            <div style={styles.sectionHeaderRow}>
              <h3 style={styles.sectionHeader}>Aliases ({featureData.aliases?.length || 0})</h3>
              <button
                onClick={() => setShowAddAlias(!showAddAlias)}
                style={styles.addButton}
              >
                {showAddAlias ? 'Cancel' : '+ Add Alias'}
              </button>
            </div>

            {showAddAlias && (
              <form onSubmit={handleAddAlias} style={styles.addForm}>
                <div style={styles.formRow}>
                  <label style={styles.formLabelSmall}>Alias Name:</label>
                  <input
                    type="text"
                    value={newAlias.alias_name}
                    onChange={(e) => setNewAlias({ ...newAlias, alias_name: e.target.value })}
                    style={styles.formInput}
                    required
                  />
                </div>
                <div style={styles.formRow}>
                  <label style={styles.formLabelSmall}>Type:</label>
                  <select
                    value={newAlias.alias_type}
                    onChange={(e) => setNewAlias({ ...newAlias, alias_type: e.target.value })}
                    style={styles.formSelect}
                  >
                    <option value="Uniform">Uniform</option>
                    <option value="Non-uniform">Non-uniform</option>
                    <option value="NCBI protein name">NCBI protein name</option>
                  </select>
                </div>
                <div style={styles.formRow}>
                  <label style={styles.formLabelSmall}>Reference #:</label>
                  <input
                    type="number"
                    value={newAlias.reference_no}
                    onChange={(e) => setNewAlias({ ...newAlias, reference_no: e.target.value })}
                    style={styles.formInput}
                    placeholder="Optional"
                  />
                </div>
                <button type="submit" style={styles.submitButton}>Add Alias</button>
              </form>
            )}

            {featureData.aliases?.length > 0 ? (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Alias</th>
                    <th style={styles.th}>Type</th>
                    <th style={styles.th}>References</th>
                    <th style={styles.th}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {featureData.aliases.map((alias) => (
                    <tr key={alias.feat_alias_no}>
                      <td style={styles.td}>{alias.alias_name}</td>
                      <td style={styles.td}>{alias.alias_type}</td>
                      <td style={styles.td}>
                        {alias.references?.map((ref) => {
                          const links = buildCitationLinks({
                            dbxref_id: ref.dbxref_id,
                            reference_no: ref.reference_no,
                            pubmed: ref.pubmed,
                          });
                          return (
                            <div key={ref.reference_no} style={styles.aliasRefItem}>
                              <div style={styles.citationLine}>
                                {ref.citation ? (
                                  <>
                                    {formatCitationString(ref.citation)}
                                    {ref.pubmed && <span style={styles.pmidText}> PMID: {ref.pubmed}</span>}
                                  </>
                                ) : ref.pubmed ? (
                                  `PMID:${ref.pubmed}`
                                ) : (
                                  `Ref:${ref.reference_no}`
                                )}
                              </div>
                              <CitationLinksBelow links={links} />
                            </div>
                          );
                        })}
                      </td>
                      <td style={styles.td}>
                        <button
                          onClick={() => handleRemoveAlias(alias.feat_alias_no)}
                          style={styles.deleteButton}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={styles.noItems}>No aliases.</p>
            )}
          </div>

          {/* Notes Section */}
          <div style={styles.infoSection}>
            <div style={styles.sectionHeaderRow}>
              <h3 style={styles.sectionHeader}>Notes ({featureData.notes?.length || 0})</h3>
              <button
                onClick={() => setShowAddNote(!showAddNote)}
                style={styles.addButton}
              >
                {showAddNote ? 'Cancel' : '+ Add Note'}
              </button>
            </div>

            {showAddNote && (
              <form onSubmit={handleAddNote} style={styles.addForm}>
                <div style={styles.formRow}>
                  <label style={styles.formLabelSmall}>Note Type:</label>
                  <select
                    value={newNote.note_type}
                    onChange={(e) => setNewNote({ ...newNote, note_type: e.target.value })}
                    style={styles.formSelect}
                    required
                  >
                    <option value="">Select type...</option>
                    <option value="Curation note">Curation note</option>
                    <option value="Annotation change">Annotation change</option>
                    <option value="Sequence change">Sequence change</option>
                    <option value="Nomenclature history">Nomenclature history</option>
                    <option value="Nomenclature conflict">Nomenclature conflict</option>
                    <option value="Literature history">Literature history</option>
                    <option value="Proposed annotation change">Proposed annotation change</option>
                    <option value="Proposed sequence change">Proposed sequence change</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div style={styles.formRow}>
                  <label style={styles.formLabelSmall}>Note Text:</label>
                  <textarea
                    value={newNote.note_text}
                    onChange={(e) => setNewNote({ ...newNote, note_text: e.target.value })}
                    style={styles.formTextareaSmall}
                    rows={3}
                    required
                  />
                </div>
                <button type="submit" style={styles.submitButton}>Add Note</button>
              </form>
            )}

            {featureData.notes?.length > 0 ? (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Type</th>
                    <th style={styles.th}>Text</th>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {featureData.notes.map((note) => (
                    <tr key={note.note_link_no}>
                      <td style={styles.td}>{note.note_type}</td>
                      <td style={styles.td}>{note.note_text}</td>
                      <td style={styles.td}>{note.date_created?.split('T')[0] || '-'}</td>
                      <td style={styles.td}>
                        <button
                          onClick={() => handleRemoveNote(note.note_link_no)}
                          style={styles.deleteButton}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={styles.noItems}>No notes.</p>
            )}
          </div>

          {/* URLs Section */}
          <div style={styles.infoSection}>
            <div style={styles.sectionHeaderRow}>
              <h3 style={styles.sectionHeader}>URLs ({featureData.urls?.length || 0})</h3>
              <button
                onClick={() => setShowAddUrl(!showAddUrl)}
                style={styles.addButton}
              >
                {showAddUrl ? 'Cancel' : '+ Add URL'}
              </button>
            </div>

            {showAddUrl && (
              <form onSubmit={handleAddUrl} style={styles.addForm}>
                <div style={styles.formRow}>
                  <label style={styles.formLabelSmall}>URL Type:</label>
                  <select
                    value={newUrl.url_type}
                    onChange={(e) => setNewUrl({ ...newUrl, url_type: e.target.value })}
                    style={styles.formSelect}
                    required
                  >
                    <option value="">Select type...</option>
                    <option value="Reference Data">Reference Data</option>
                    <option value="Reference LINKOUT">Reference LINKOUT</option>
                    <option value="Reference supplement">Reference supplement</option>
                    <option value="Reference full text">Reference full text</option>
                    <option value="Phenotype Viewer">Phenotype Viewer</option>
                    <option value="Research summary">Research summary</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div style={styles.formRow}>
                  <label style={styles.formLabelSmall}>Link:</label>
                  <input
                    type="url"
                    value={newUrl.link}
                    onChange={(e) => setNewUrl({ ...newUrl, link: e.target.value })}
                    style={styles.formInputWide}
                    placeholder="https://..."
                    required
                  />
                </div>
                <button type="submit" style={styles.submitButton}>Add URL</button>
              </form>
            )}

            {featureData.urls?.length > 0 ? (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Type</th>
                    <th style={styles.th}>Link</th>
                    <th style={styles.th}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {featureData.urls.map((url) => (
                    <tr key={url.feat_url_no}>
                      <td style={styles.td}>{url.url_type}</td>
                      <td style={styles.td}>
                        <a href={url.link} target="_blank" rel="noopener noreferrer">
                          {url.link}
                        </a>
                      </td>
                      <td style={styles.td}>
                        <button
                          onClick={() => handleRemoveUrl(url.feat_url_no)}
                          style={styles.deleteButton}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={styles.noItems}>No URLs.</p>
            )}
          </div>
        </div>
      )}

      {/* Initial State - No Feature Selected */}
      {!featureData && !loading && !featureName && (
        <div style={styles.noFeature}>
          <p>Search for a feature above to begin curation.</p>
        </div>
      )}
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
  },
  searchForm: {
    display: 'flex',
    gap: '0.5rem',
  },
  searchInput: {
    flex: 1,
    padding: '0.5rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
  },
  organismSelect: {
    padding: '0.5rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    minWidth: '200px',
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
  featureSection: {
    marginTop: '1rem',
  },
  featureHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  featureActions: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
  },
  editButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#337ab7',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  infoSection: {
    marginBottom: '1.5rem',
    padding: '1rem',
    backgroundColor: '#f9f9f9',
    border: '1px solid #ddd',
    borderRadius: '4px',
  },
  sectionHeader: {
    backgroundColor: '#CCCCFF',
    padding: '0.5rem',
    margin: '0 0 1rem 0',
    fontSize: '1rem',
  },
  sectionHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  infoTable: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  infoTh: {
    textAlign: 'left',
    padding: '0.5rem',
    width: '150px',
    verticalAlign: 'top',
    backgroundColor: '#f0f0f0',
    borderBottom: '1px solid #ddd',
  },
  infoTd: {
    padding: '0.5rem',
    borderBottom: '1px solid #ddd',
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
  editForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  addForm: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1rem',
    padding: '1rem',
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: '4px',
    marginBottom: '1rem',
    alignItems: 'flex-end',
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
  formLabelSmall: {
    width: '100px',
    fontWeight: 'bold',
    paddingTop: '0.5rem',
  },
  formInput: {
    padding: '0.5rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    width: '200px',
  },
  formInputLarge: {
    padding: '0.5rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    width: '400px',
    maxWidth: '100%',
  },
  formInputWide: {
    padding: '0.5rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    width: '500px',
    maxWidth: '100%',
  },
  formTextareaLarge: {
    padding: '0.5rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    width: '400px',
    maxWidth: '100%',
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  formTextareaWide: {
    padding: '0.5rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    width: '500px',
    maxWidth: '100%',
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  formInputPmid: {
    padding: '0.5rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    width: '250px',
    maxWidth: '100%',
  },
  formSelect: {
    padding: '0.5rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    width: '200px',
  },
  formTextarea: {
    padding: '0.5rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    width: '600px',
    maxWidth: '100%',
    resize: 'vertical',
  },
  formTextareaSmall: {
    padding: '0.5rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    width: '400px',
    maxWidth: '100%',
    resize: 'vertical',
  },
  formTextareaHeadline: {
    padding: '0.5rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    width: '400px',
    maxWidth: '100%',
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  textareaWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  charCount: {
    fontSize: '0.8rem',
    color: '#666',
    textAlign: 'right',
  },
  formHint: {
    fontSize: '0.8rem',
    color: '#666',
    fontStyle: 'italic',
    paddingTop: '0.5rem',
  },
  fieldSection: {
    display: 'flex',
    gap: '2rem',
    marginBottom: '1.5rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid #eee',
  },
  fieldLeft: {
    flex: '0 0 auto',
  },
  fieldRight: {
    flex: '1 1 auto',
    minWidth: '300px',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  addPmidRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  addPmidLabel: {
    fontWeight: 'bold',
    fontSize: '0.9rem',
    whiteSpace: 'nowrap',
  },
  refList: {
    backgroundColor: '#f9f9f9',
    border: '1px solid #ddd',
    borderRadius: '4px',
    padding: '0.5rem',
  },
  refListHeader: {
    fontWeight: 'bold',
    fontSize: '0.9rem',
    marginBottom: '0.5rem',
    color: '#333',
  },
  refListItems: {
    margin: 0,
    padding: '0 0 0 1rem',
    listStyle: 'disc',
  },
  refListItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '0.5rem',
    marginBottom: '0.5rem',
    fontSize: '0.9rem',
  },
  refCitation: {
    flex: 1,
    wordBreak: 'break-word',
  },
  citationText: {
    color: '#666',
    fontSize: '0.85rem',
  },
  citationLine: {
    marginBottom: '0.25rem',
  },
  pmidText: {
    color: '#666',
    fontSize: '0.85rem',
  },
  aliasRefItem: {
    marginBottom: '0.5rem',
  },
  unlinkButtonSmall: {
    padding: '0.15rem 0.4rem',
    border: 'none',
    borderRadius: '3px',
    backgroundColor: '#d9534f',
    color: 'white',
    fontSize: '0.75rem',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  formButtons: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '0.5rem',
  },
  addButton: {
    padding: '0.25rem 0.75rem',
    backgroundColor: '#337ab7',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  submitButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#5cb85c',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
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
  actionButton: {
    padding: '0.25rem 0.5rem',
    backgroundColor: '#5cb85c',
    color: 'white',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
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
  noItems: {
    color: '#666',
    fontStyle: 'italic',
  },
  noFeature: {
    padding: '2rem',
    textAlign: 'center',
    color: '#666',
    backgroundColor: '#f9f9f9',
    borderRadius: '4px',
  },
};

export default LocusCurationPage;
