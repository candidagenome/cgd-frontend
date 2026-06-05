/**
 * Interactions Curation Page
 *
 * Curator interface for physical and genetic interactions of a gene.
 * - Two sections: Physical Interactions and Genetic Interactions.
 * - Shows current interactions with their Source (BioGRID / CGD).
 * - Curators can add new interactions (tagged source=CGD; queried gene = Bait)
 *   and delete CGD-curated ones. BioGRID interactions are read-only.
 *
 * Mirrors the PhenotypeCurationPage layout/conventions.
 */
import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import interactionsCurationApi from '../../api/interactionsCurationApi';
import { getOrganisms } from '../../api/litReviewApi';
import { filterAllowedOrganisms } from '../../constants/organisms';
import { renderCitationItem } from '../../utils/formatCitation.jsx';

const SECTIONS = [
  { key: 'physical', label: 'Physical Interactions' },
  { key: 'genetic', label: 'Genetic Interactions' },
];

const EMPTY_FORM = { interactor: '', experiment_type: '', pubmed: '', description: '' };

function InteractionsCurationPage() {
  const { featureName } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const organismParam = searchParams.get('organism') || '';

  // Search form state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrganism, setSelectedOrganism] = useState('');
  const [organisms, setOrganisms] = useState([]);

  // Data state
  const [data, setData] = useState(null);
  const [experimentTypes, setExperimentTypes] = useState({ physical: [], genetic: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Per-section add-new-interaction form state
  const [forms, setForms] = useState({ physical: { ...EMPTY_FORM }, genetic: { ...EMPTY_FORM } });
  const [submitting, setSubmitting] = useState({ physical: false, genetic: false });

  // Load organism list + experiment-type vocab once
  useEffect(() => {
    (async () => {
      try {
        const orgData = await getOrganisms();
        setOrganisms(filterAllowedOrganisms(orgData.organisms || []));
      } catch {
        setOrganisms([]);
      }
      try {
        setExperimentTypes(await interactionsCurationApi.getExperimentTypes());
      } catch {
        setExperimentTypes({ physical: [], genetic: [] });
      }
    })();
  }, []);

  const loadInteractions = useCallback(async () => {
    if (!featureName) return;
    setLoading(true);
    setError(null);
    try {
      const result = await interactionsCurationApi.getInteractions(featureName, organismParam || null);
      setData(result);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to load interactions');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [featureName, organismParam]);

  useEffect(() => {
    loadInteractions();
  }, [loadInteractions]);

  const handleSearch = (e) => {
    e.preventDefault();
    const gene = searchQuery.trim();
    if (!gene) return;
    const qs = selectedOrganism ? `?organism=${encodeURIComponent(selectedOrganism)}` : '';
    navigate(`/curation/interactions/${encodeURIComponent(gene)}${qs}`);
  };

  const updateForm = (sectionKey, field, value) => {
    setForms((prev) => ({ ...prev, [sectionKey]: { ...prev[sectionKey], [field]: value } }));
  };

  const handleAdd = async (sectionKey, e) => {
    e.preventDefault();
    const form = forms[sectionKey];
    if (!form.interactor.trim() || !form.experiment_type || !form.pubmed.trim()) {
      setError('Interacting gene, experiment type, and PubMed ID are all required.');
      return;
    }
    if (!/^\d+$/.test(form.pubmed.trim())) {
      setError('PubMed ID must be numeric.');
      return;
    }
    setSubmitting((p) => ({ ...p, [sectionKey]: true }));
    setError(null);
    setSuccess(null);
    try {
      await interactionsCurationApi.createInteraction(featureName, {
        organism: organismParam || null,
        interactor: form.interactor.trim(),
        experiment_type: form.experiment_type,
        pubmed: Number(form.pubmed.trim()),
        description: form.description.trim() || null,
      });
      setSuccess(`Added ${sectionKey} interaction with ${form.interactor.trim()}.`);
      setForms((prev) => ({ ...prev, [sectionKey]: { ...EMPTY_FORM } }));
      await loadInteractions();
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to add interaction');
    } finally {
      setSubmitting((p) => ({ ...p, [sectionKey]: false }));
    }
  };

  const handleDelete = async (interactionNo) => {
    if (!window.confirm('Delete this CGD-curated interaction?')) return;
    setError(null);
    setSuccess(null);
    try {
      await interactionsCurationApi.deleteInteraction(interactionNo);
      setSuccess('Interaction deleted.');
      await loadInteractions();
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to delete interaction');
    }
  };

  const renderReferences = (refs) => {
    if (!refs || refs.length === 0) return '-';
    return refs.map((r, i) => <div key={i}>{renderCitationItem(r)}</div>);
  };

  const renderPartners = (partners) =>
    (partners || []).map((p, i) => (
      <span key={i}>
        {i > 0 && ', '}
        <Link to={`/locus/${encodeURIComponent(p.feature_name)}`} target="_blank" rel="noopener noreferrer">
          {p.gene_name || p.feature_name}
        </Link>
        {p.action ? <span style={styles.action}> ({p.action})</span> : null}
      </span>
    ));

  // ---------- Search form (no gene selected) ----------
  if (!featureName) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1>Interaction Curation</h1>
          <div style={styles.headerRight}>
            <span>Curator: {user?.first_name} {user?.last_name}</span>
            <Link to="/curation" style={styles.headerLink}>Curator Central</Link>
          </div>
        </div>
        <div style={styles.searchForm}>
          <p>Enter a gene/feature name to curate its physical and genetic interactions:</p>
          <form onSubmit={handleSearch} style={styles.searchFormInner}>
            <select
              value={selectedOrganism}
              onChange={(e) => setSelectedOrganism(e.target.value)}
              style={styles.organismSelect}
            >
              <option value="">Select species...</option>
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
              placeholder="Enter ORF/gene name"
              style={styles.searchInput}
            />
            <button type="submit" style={styles.searchButton}>Search</button>
          </form>
        </div>
      </div>
    );
  }

  // ---------- Loading / error ----------
  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading interactions...</div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>{error}</div>
        <Link to="/curation/interactions">Search for another gene</Link>
        {' | '}
        <Link to="/curation">Back to Curator Central</Link>
      </div>
    );
  }

  const displayName = data ? (data.gene_name || data.feature_name) : featureName;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>
          Interaction Curation: {displayName}
          {data?.organism && <span style={styles.speciesInTitle}> ({data.organism})</span>}
        </h1>
        <div style={styles.headerRight}>
          <span>Curator: {user?.first_name} {user?.last_name}</span>
          <Link to="/curation/interactions" style={styles.headerLink}>New search</Link>
          <Link to="/curation" style={styles.headerLink}>Curator Central</Link>
        </div>
      </div>

      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      {SECTIONS.map((section) => {
        const rows = (data && data[section.key]) || [];
        const typeOptions = experimentTypes[section.key] || [];
        const form = forms[section.key];
        return (
          <div key={section.key} style={styles.existingSection}>
            <h2 style={styles.existingHeader}>{section.label}</h2>

            {rows.length === 0 ? (
              <div style={styles.noAnnotations}>No {section.key} interactions for this gene.</div>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Interactor</th>
                    <th style={styles.th}>Experiment Type</th>
                    <th style={styles.th}>Source</th>
                    <th style={styles.th}>Description</th>
                    <th style={styles.th}>Reference(s)</th>
                    <th style={styles.th}></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.interaction_no}>
                      <td style={styles.td}>{renderPartners(row.partners)}</td>
                      <td style={styles.td}>{row.experiment_type}</td>
                      <td style={styles.td}>
                        <span style={row.source === 'CGD' ? styles.sourceCgd : styles.sourceBiogrid}>
                          {row.source}
                        </span>
                      </td>
                      <td style={styles.td}>{row.description || '-'}</td>
                      <td style={styles.td}>{renderReferences(row.references)}</td>
                      <td style={styles.td}>
                        {row.editable ? (
                          <button
                            type="button"
                            style={styles.deleteButton}
                            onClick={() => handleDelete(row.interaction_no)}
                          >
                            Delete
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Add new interaction (source=CGD) */}
            <form onSubmit={(e) => handleAdd(section.key, e)} style={styles.addForm}>
              <span style={styles.addLabel}>Add {section.key} interaction:</span>
              <input
                type="text"
                value={form.interactor}
                onChange={(e) => updateForm(section.key, 'interactor', e.target.value)}
                placeholder="Interacting gene (Hit)"
                style={styles.addInput}
              />
              <select
                value={form.experiment_type}
                onChange={(e) => updateForm(section.key, 'experiment_type', e.target.value)}
                style={styles.addSelect}
              >
                <option value="">Experiment type...</option>
                {typeOptions.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <input
                type="text"
                inputMode="numeric"
                value={form.pubmed}
                onChange={(e) => updateForm(section.key, 'pubmed', e.target.value)}
                placeholder="PubMed ID"
                style={styles.addPubmed}
              />
              <input
                type="text"
                value={form.description}
                onChange={(e) => updateForm(section.key, 'description', e.target.value)}
                placeholder="Description (optional)"
                maxLength={240}
                style={styles.addInput}
              />
              <button type="submit" style={styles.searchButton} disabled={submitting[section.key]}>
                {submitting[section.key] ? 'Adding...' : 'Add'}
              </button>
            </form>
          </div>
        );
      })}

      <p style={styles.note}>
        New interactions are saved with source <strong>CGD</strong> and the queried gene
        ({displayName}) recorded as Bait. The PubMed reference must already exist in CGD.
        BioGRID interactions are read-only.
      </p>
    </div>
  );
}

const styles = {
  container: { maxWidth: '1400px', margin: '1rem auto', padding: '1rem' },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '0.5rem', borderBottom: '2px solid #333', paddingBottom: '0.5rem',
    flexWrap: 'wrap', gap: '1rem',
  },
  headerRight: { display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.9rem' },
  speciesInTitle: { fontSize: '0.85em', fontWeight: 'normal', color: '#666', fontStyle: 'italic' },
  headerLink: { padding: '0.25rem 0.5rem', backgroundColor: '#f0f0f0', borderRadius: '4px', textDecoration: 'none' },
  loading: { padding: '2rem', textAlign: 'center', color: '#666' },
  error: { padding: '1rem', backgroundColor: '#fee', border: '1px solid #fcc', borderRadius: '4px', color: '#c00', marginBottom: '1rem' },
  success: { padding: '1rem', backgroundColor: '#efe', border: '1px solid #cfc', borderRadius: '4px', color: '#060', marginBottom: '1rem' },
  searchForm: { padding: '2rem', backgroundColor: '#f9f9f9', border: '1px solid #ddd', borderRadius: '4px', textAlign: 'center' },
  searchFormInner: { display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' },
  searchInput: { padding: '0.5rem', fontSize: '1rem', border: '1px solid #ccc', borderRadius: '4px', width: '300px' },
  searchButton: { padding: '0.5rem 1rem', backgroundColor: '#337ab7', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  organismSelect: { padding: '0.5rem', fontSize: '1rem', border: '1px solid #ccc', borderRadius: '4px', minWidth: '200px' },
  existingSection: { marginBottom: '1.5rem', padding: '0.5rem', border: '1px solid #ddd' },
  existingHeader: { backgroundColor: '#CCCCFF', padding: '0.5rem', margin: '-0.5rem -0.5rem 0.5rem -0.5rem', fontSize: '1.1rem' },
  noAnnotations: { padding: '1rem', textAlign: 'center', color: '#666', fontStyle: 'italic' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' },
  th: { textAlign: 'left', padding: '0.5rem', borderBottom: '2px solid #333', backgroundColor: '#f5f5f5' },
  td: { padding: '0.5rem', borderBottom: '1px solid #eee', verticalAlign: 'top' },
  action: { color: '#888', fontSize: '0.85em' },
  sourceCgd: { backgroundColor: '#d4edda', color: '#155724', padding: '0.1rem 0.4rem', borderRadius: '3px', fontSize: '0.8rem' },
  sourceBiogrid: { backgroundColor: '#e2e3e5', color: '#383d41', padding: '0.1rem 0.4rem', borderRadius: '3px', fontSize: '0.8rem' },
  deleteButton: { padding: '0.2rem 0.6rem', backgroundColor: '#d9534f', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' },
  addForm: { display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.75rem', flexWrap: 'wrap', paddingTop: '0.5rem', borderTop: '1px dashed #ccc' },
  addLabel: { fontWeight: 'bold', fontSize: '0.85rem' },
  addInput: { padding: '0.4rem', fontSize: '0.9rem', border: '1px solid #ccc', borderRadius: '4px', minWidth: '180px' },
  addSelect: { padding: '0.4rem', fontSize: '0.9rem', border: '1px solid #ccc', borderRadius: '4px' },
  addPubmed: { padding: '0.4rem', fontSize: '0.9rem', border: '1px solid #ccc', borderRadius: '4px', width: '120px' },
  note: { marginTop: '1rem', color: '#666', fontSize: '0.85rem' },
};

export default InteractionsCurationPage;
