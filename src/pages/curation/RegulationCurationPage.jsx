/**
 * Regulation Curation Page
 *
 * Curator entry of transcriptional regulatory associations (transcription
 * factor -> target gene) from papers PathoYeastract has not covered yet.
 * - Load a paper by PubMed ID to see, edit or delete what has been curated from it.
 * - Add a batch: one TF, one experiment and condition, and a pasted list of
 *   targets (one per line, optionally with an effect and a log2 fold change).
 *   "Check targets" resolves the names first; "Save" stores the resolvable rows.
 * Saved rows appear on the locus Regulation tab as CGD curation.
 *
 * Mirrors the InteractionsCurationPage layout/conventions.
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import regulationCurationApi from '../../api/regulationCurationApi';
import { getOrganisms } from '../../api/litReviewApi';
import { filterAllowedOrganisms } from '../../constants/organisms';
import { formatCitationString } from '../../utils/formatCitation.jsx';

const EFFECT_LABELS = { Positive: 'activation', Negative: 'repression', 'N/A': 'n/a' };

const EMPTY_BATCH = {
  organism: '',
  tf: '',
  evidence_code: 'Direct',
  experiment: '',
  association_type: 'N/A',
  strain_background: '',
  condition_group: '',
  environmental_condition: '',
  regulation_note: '',
  targets: '',
};

const STATUS_LABELS = {
  ok: 'ready',
  exists: 'already curated',
  duplicate: 'duplicate',
  not_found: 'not found',
  ambiguous: 'ambiguous',
  error: 'error',
};

const detail = (err, fallback) => err.response?.data?.detail || err.message || fallback;

function GeneLink({ gene }) {
  return (
    <Link to={`/locus/${encodeURIComponent(gene.feature_name)}?tab=regulation`} target="_blank" rel="noopener noreferrer">
      {gene.display_name}
    </Link>
  );
}

function EditRow({ row, vocab, onSave, onCancel }) {
  const [form, setForm] = useState({
    evidence_code: row.evidence_code,
    experiment: row.experiment,
    association_type: row.association_type,
    log2fc: row.log2fc ?? '',
    strain_background: row.strain_background || '',
    condition_group: row.condition_group || '',
    environmental_condition: row.environmental_condition || '',
    regulation_note: row.regulation_note || '',
  });
  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));
  return (
    <tr style={styles.editRow}>
      <td style={styles.td} />
      <td style={styles.td}><GeneLink gene={row.tf} /></td>
      <td style={styles.td}><GeneLink gene={row.target} /></td>
      <td style={styles.td}>
        <select value={form.evidence_code} onChange={(e) => set('evidence_code', e.target.value)} style={styles.input}>
          {vocab.evidence_codes.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
        </select>
        <input
          list={`experiments-${form.evidence_code}`}
          value={form.experiment}
          onChange={(e) => set('experiment', e.target.value)}
          style={{ ...styles.input, marginTop: '0.25rem' }}
        />
      </td>
      <td style={styles.td}>
        <select value={form.association_type} onChange={(e) => set('association_type', e.target.value)} style={styles.input}>
          {vocab.association_types.map((t) => <option key={t} value={t}>{EFFECT_LABELS[t]}</option>)}
        </select>
        <input
          value={form.log2fc}
          onChange={(e) => set('log2fc', e.target.value)}
          placeholder="log2FC"
          style={{ ...styles.input, marginTop: '0.25rem', width: '6rem' }}
        />
      </td>
      <td style={styles.td}>
        <input value={form.strain_background} onChange={(e) => set('strain_background', e.target.value)} placeholder="Strain" style={styles.input} />
      </td>
      <td style={styles.td}>
        <select value={form.condition_group} onChange={(e) => set('condition_group', e.target.value)} style={styles.input}>
          <option value="">Condition group...</option>
          {vocab.condition_groups.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
        <textarea
          value={form.environmental_condition}
          onChange={(e) => set('environmental_condition', e.target.value)}
          rows={2}
          style={{ ...styles.input, marginTop: '0.25rem', width: '100%' }}
        />
        <input
          value={form.regulation_note}
          onChange={(e) => set('regulation_note', e.target.value)}
          placeholder="Note"
          style={{ ...styles.input, marginTop: '0.25rem', width: '100%' }}
        />
      </td>
      <td style={styles.td} colSpan={2}>
        <button
          type="button"
          style={styles.primaryButton}
          onClick={() => onSave({ ...form, log2fc: form.log2fc === '' ? null : Number(form.log2fc) })}
        >
          Save
        </button>{' '}
        <button type="button" style={styles.secondaryButton} onClick={onCancel}>Cancel</button>
      </td>
    </tr>
  );
}

function AssociationsTable({ rows, vocab, selected, onToggle, onToggleAll, editing, onEdit, onSaveEdit, onCancelEdit }) {
  if (rows.length === 0) {
    return <div style={styles.noRows}>No associations curated yet.</div>;
  }
  const allSelected = rows.every((r) => selected.has(r.regulation_no));
  return (
    <table style={styles.table}>
      <thead>
        <tr>
          <th style={styles.th}>
            <input type="checkbox" checked={allSelected} onChange={() => onToggleAll(!allSelected)} aria-label="Select all" />
          </th>
          <th style={styles.th}>TF</th>
          <th style={styles.th}>Target</th>
          <th style={styles.th}>Evidence</th>
          <th style={styles.th}>Effect</th>
          <th style={styles.th}>Strain</th>
          <th style={styles.th}>Condition</th>
          <th style={styles.th}>Curated</th>
          <th style={styles.th}></th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (editing === row.regulation_no ? (
          <EditRow
            key={row.regulation_no}
            row={row}
            vocab={vocab}
            onSave={(data) => onSaveEdit(row.regulation_no, data)}
            onCancel={onCancelEdit}
          />
        ) : (
          <tr key={row.regulation_no}>
            <td style={styles.td}>
              <input
                type="checkbox"
                checked={selected.has(row.regulation_no)}
                onChange={() => onToggle(row.regulation_no)}
                aria-label={`Select ${row.tf.display_name} - ${row.target.display_name}`}
              />
            </td>
            <td style={styles.td}><GeneLink gene={row.tf} /></td>
            <td style={styles.td}>
              <GeneLink gene={row.target} />
              {row.in_pathoyeastract && (
                <div style={styles.overlap} title="PathoYeastract already lists this TF and target from the same paper">
                  also in PathoYeastract
                </div>
              )}
            </td>
            <td style={styles.td}>
              <strong>{row.evidence_code === 'Direct' ? 'DNA binding' : 'Expression'}</strong>
              <div style={styles.muted}>{row.experiment}</div>
            </td>
            <td style={styles.td}>
              {EFFECT_LABELS[row.association_type]}
              {row.log2fc !== null && row.log2fc !== undefined && <div style={styles.muted}>log2FC {row.log2fc}</div>}
            </td>
            <td style={styles.td}>{row.strain_background || '-'}</td>
            <td style={styles.td}>
              {row.condition_group && <div><strong>{row.condition_group}</strong></div>}
              {row.environmental_condition && <div>{row.environmental_condition}</div>}
              {row.regulation_note && <div style={styles.muted}>Note: {row.regulation_note}</div>}
            </td>
            <td style={styles.td}>
              {row.created_by}
              <div style={styles.muted}>{row.date_created}</div>
            </td>
            <td style={styles.td}>
              <button type="button" style={styles.linkButton} onClick={() => onEdit(row.regulation_no)}>Edit</button>
            </td>
          </tr>
        )))}
      </tbody>
    </table>
  );
}

function RegulationCurationPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const pubmedParam = searchParams.get('pubmed') || '';

  const [vocab, setVocab] = useState(null);
  const [organisms, setOrganisms] = useState([]);
  const [pubmedInput, setPubmedInput] = useState(pubmedParam);
  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [selected, setSelected] = useState(new Set());
  const [editing, setEditing] = useState(null);

  const [batch, setBatch] = useState(EMPTY_BATCH);
  const [preview, setPreview] = useState(null);
  const [previewKey, setPreviewKey] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setVocab(await regulationCurationApi.getVocabulary());
      } catch (err) {
        setError(detail(err, 'Failed to load the vocabulary'));
      }
      try {
        const orgData = await getOrganisms();
        setOrganisms(filterAllowedOrganisms(orgData.organisms || []));
      } catch {
        setOrganisms([]);
      }
    })();
  }, []);

  const loadPaper = useCallback(async () => {
    if (!pubmedParam) {
      setPaper(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setPaper(await regulationCurationApi.getReference(pubmedParam));
      setSelected(new Set());
      setEditing(null);
    } catch (err) {
      setPaper(null);
      setError(detail(err, 'Failed to load the paper'));
    } finally {
      setLoading(false);
    }
  }, [pubmedParam]);

  useEffect(() => {
    loadPaper();
  }, [loadPaper]);

  const handleLoadPaper = (e) => {
    e.preventDefault();
    const pubmed = pubmedInput.trim();
    if (!/^\d+$/.test(pubmed)) {
      setError('PubMed ID must be numeric.');
      return;
    }
    setSuccess(null);
    setPreview(null);
    setSearchParams({ pubmed });
  };

  const batchPayload = useMemo(() => ({ ...batch, pubmed: Number(pubmedParam) }), [batch, pubmedParam]);
  const payloadKey = JSON.stringify(batchPayload);
  const previewCurrent = preview && previewKey === payloadKey;

  const setField = (field, value) => setBatch((b) => ({ ...b, [field]: value }));

  const handlePreview = async () => {
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      setPreview(await regulationCurationApi.preview(batchPayload));
      setPreviewKey(payloadKey);
    } catch (err) {
      setPreview(null);
      setError(detail(err, 'Failed to check the targets'));
    } finally {
      setBusy(false);
    }
  };

  const handleSave = async () => {
    setBusy(true);
    setError(null);
    try {
      const result = await regulationCurationApi.create(batchPayload);
      setSuccess(`Saved ${result.added} association${result.added === 1 ? '' : 's'}`
        + (result.skipped ? `; ${result.skipped} line${result.skipped === 1 ? '' : 's'} skipped.` : '.'));
      setPreview(null);
      setBatch((b) => ({ ...b, targets: '' }));
      await loadPaper();
    } catch (err) {
      setError(detail(err, 'Failed to save'));
    } finally {
      setBusy(false);
    }
  };

  const toggle = (no) => setSelected((prev) => {
    const next = new Set(prev);
    if (next.has(no)) next.delete(no); else next.add(no);
    return next;
  });
  const toggleAll = (on) => setSelected(on ? new Set(paper.associations.map((r) => r.regulation_no)) : new Set());

  const handleDelete = async () => {
    if (selected.size === 0) return;
    if (!window.confirm(`Delete ${selected.size} curated association${selected.size === 1 ? '' : 's'}?`)) return;
    setError(null);
    try {
      const result = await regulationCurationApi.remove([...selected]);
      setSuccess(`Deleted ${result.deleted} association${result.deleted === 1 ? '' : 's'}.`);
      await loadPaper();
    } catch (err) {
      setError(detail(err, 'Failed to delete'));
    }
  };

  const handleSaveEdit = async (regulationNo, data) => {
    setError(null);
    try {
      await regulationCurationApi.update(regulationNo, data);
      setSuccess('Association updated.');
      await loadPaper();
    } catch (err) {
      setError(detail(err, 'Failed to update'));
    }
  };

  const readyCount = previewCurrent ? (preview.counts.ok || 0) : 0;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>Regulation Curation</h1>
        <div style={styles.headerRight}>
          <span>Curator: {user?.first_name} {user?.last_name}</span>
          <Link to="/curation" style={styles.headerLink}>Curator Central</Link>
        </div>
      </div>

      <p style={styles.intro}>
        Enter transcription factor &rarr; target gene associations from papers that PathoYeastract has not
        covered. They appear on each gene&apos;s Regulation tab as CGD curation, next to PathoYeastract&apos;s
        associations.
      </p>

      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      <form onSubmit={handleLoadPaper} style={styles.searchForm}>
        <label htmlFor="reg-pubmed" style={styles.label}>Paper (PubMed ID):</label>
        <input
          id="reg-pubmed"
          type="text"
          inputMode="numeric"
          value={pubmedInput}
          onChange={(e) => setPubmedInput(e.target.value)}
          placeholder="e.g. 42770292"
          style={styles.pubmedInput}
        />
        <button type="submit" style={styles.primaryButton}>Load paper</button>
        <span style={styles.muted}>The reference must already be in CGD.</span>
      </form>

      {loading && <div style={styles.loading}>Loading...</div>}

      {paper && vocab && (
        <>
          <div style={styles.paper}>
            {paper.dbxref_id ? (
              <Link to={`/reference/${paper.dbxref_id}`} target="_blank" rel="noopener noreferrer">
                {formatCitationString(paper.citation)}
              </Link>
            ) : formatCitationString(paper.citation)}
            {' '}
            <a href={`https://pubmed.ncbi.nlm.nih.gov/${paper.pubmed}`} target="_blank" rel="noopener noreferrer">PubMed</a>
          </div>

          <section style={styles.section}>
            <h2 style={styles.sectionHeader}>
              Curated from this paper ({paper.associations.length})
            </h2>
            {paper.associations.length > 0 && (
              <div style={styles.toolbar}>
                <button
                  type="button"
                  style={{ ...styles.deleteButton, opacity: selected.size === 0 ? 0.5 : 1 }}
                  onClick={handleDelete}
                  disabled={selected.size === 0}
                >
                  Delete selected ({selected.size})
                </button>
              </div>
            )}
            <AssociationsTable
              rows={paper.associations}
              vocab={vocab}
              selected={selected}
              onToggle={toggle}
              onToggleAll={toggleAll}
              editing={editing}
              onEdit={setEditing}
              onSaveEdit={handleSaveEdit}
              onCancelEdit={() => setEditing(null)}
            />
          </section>

          <section style={styles.section}>
            <h2 style={styles.sectionHeader}>Add associations</h2>
            <div style={styles.grid}>
              <label style={styles.label} htmlFor="reg-organism">Species</label>
              <select id="reg-organism" value={batch.organism} onChange={(e) => setField('organism', e.target.value)} style={styles.input}>
                <option value="">Select species...</option>
                {organisms.map((org) => (
                  <option key={org.organism_abbrev} value={org.organism_abbrev}>{org.organism_name}</option>
                ))}
              </select>

              <label style={styles.label} htmlFor="reg-tf">Transcription factor</label>
              <input id="reg-tf" value={batch.tf} onChange={(e) => setField('tf', e.target.value)} placeholder="Gene name or systematic name" style={styles.input} />

              <span style={styles.label}>Evidence</span>
              <div style={styles.radioGroup}>
                {vocab.evidence_codes.map((c) => (
                  <label key={c.code} style={styles.radio}>
                    <input
                      type="radio"
                      name="evidence_code"
                      value={c.code}
                      checked={batch.evidence_code === c.code}
                      onChange={() => setField('evidence_code', c.code)}
                    />
                    {' '}{c.label} ({c.code === 'Direct' ? 'TF binds the promoter' : 'target expression changes'})
                  </label>
                ))}
              </div>

              <label style={styles.label} htmlFor="reg-experiment">Experiment</label>
              <input
                id="reg-experiment"
                list={`experiments-${batch.evidence_code}`}
                value={batch.experiment}
                onChange={(e) => setField('experiment', e.target.value)}
                placeholder="Pick from the list or type your own"
                style={styles.wideInput}
              />

              <label style={styles.label} htmlFor="reg-strain">Strain background</label>
              <input id="reg-strain" value={batch.strain_background} onChange={(e) => setField('strain_background', e.target.value)} placeholder="e.g. CBS138" style={styles.input} />

              <label style={styles.label} htmlFor="reg-group">Condition group</label>
              <select id="reg-group" value={batch.condition_group} onChange={(e) => setField('condition_group', e.target.value)} style={styles.input}>
                <option value="">Select...</option>
                {vocab.condition_groups.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>

              <label style={styles.label} htmlFor="reg-condition">Condition</label>
              <textarea
                id="reg-condition"
                value={batch.environmental_condition}
                onChange={(e) => setField('environmental_condition', e.target.value)}
                rows={2}
                placeholder="e.g. Grown in YPD at 30 °C to mid-log phase"
                style={styles.wideInput}
              />

              <label style={styles.label} htmlFor="reg-effect">Default effect</label>
              <select id="reg-effect" value={batch.association_type} onChange={(e) => setField('association_type', e.target.value)} style={styles.input}>
                <option value="N/A">Not stated (n/a)</option>
                <option value="Positive">Activation</option>
                <option value="Negative">Repression</option>
                <option value="infer">From each target&apos;s log2FC sign</option>
              </select>

              <label style={styles.label} htmlFor="reg-note">Note (optional)</label>
              <input id="reg-note" value={batch.regulation_note} onChange={(e) => setField('regulation_note', e.target.value)} style={styles.wideInput} />

              <label style={styles.label} htmlFor="reg-targets">Target genes</label>
              <div>
                <textarea
                  id="reg-targets"
                  value={batch.targets}
                  onChange={(e) => setField('targets', e.target.value)}
                  rows={10}
                  placeholder={'One target per line, optionally followed by an effect and a log2 fold change:\nCDR1\nPDR16  up  2.4\nCAGL0F02717g  -1.3'}
                  style={{ ...styles.wideInput, fontFamily: 'monospace' }}
                />
                <div style={styles.muted}>
                  Separate columns with tabs, commas or spaces. Effects: up/activated/positive, down/repressed/negative,
                  n/a. A line&apos;s own effect overrides the default. Gene names, systematic names, orf19 IDs and
                  aliases are accepted.
                </div>
              </div>
            </div>
            {vocab.evidence_codes.map((c) => (
              <datalist key={c.code} id={`experiments-${c.code}`}>
                {(vocab.experiments[c.code] || []).map((x) => <option key={x} value={x} />)}
              </datalist>
            ))}

            <div style={styles.actions}>
              <button type="button" style={styles.primaryButton} onClick={handlePreview} disabled={busy}>
                {busy && !previewCurrent ? 'Checking...' : 'Check targets'}
              </button>
              <button
                type="button"
                style={{ ...styles.saveButton, opacity: busy || !previewCurrent || readyCount === 0 ? 0.5 : 1 }}
                onClick={handleSave}
                disabled={busy || !previewCurrent || readyCount === 0}
                title={previewCurrent ? '' : 'Check the targets first'}
              >
                Save {readyCount} association{readyCount === 1 ? '' : 's'}
              </button>
              {preview && !previewCurrent && <span style={styles.muted}>The form changed; check the targets again.</span>}
            </div>

            {preview && (
              <div style={styles.preview}>
                <div>
                  <strong>{preview.tf.display_name}</strong> ({preview.tf.feature_name}) &rarr;{' '}
                  {Object.entries(preview.counts).map(([k, n]) => `${n} ${STATUS_LABELS[k] || k}`).join(', ')}
                </div>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Line</th>
                      <th style={styles.th}>Entered</th>
                      <th style={styles.th}>Target</th>
                      <th style={styles.th}>Effect</th>
                      <th style={styles.th}>log2FC</th>
                      <th style={styles.th}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.rows.map((r) => (
                      <tr key={r.line} style={r.status === 'ok' ? undefined : styles.problemRow}>
                        <td style={styles.td}>{r.line}</td>
                        <td style={styles.td}>{r.name}</td>
                        <td style={styles.td}>{r.target ? <GeneLink gene={r.target} /> : '-'}</td>
                        <td style={styles.td}>{EFFECT_LABELS[r.effect]}</td>
                        <td style={styles.td}>{r.log2fc ?? ''}</td>
                        <td style={styles.td}>
                          {STATUS_LABELS[r.status] || r.status}
                          {r.message && <div style={styles.muted}>{r.message}</div>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
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
  headerLink: { padding: '0.25rem 0.5rem', backgroundColor: '#f0f0f0', borderRadius: '4px', textDecoration: 'none' },
  intro: { color: '#444', fontSize: '0.9rem' },
  loading: { padding: '1rem', color: '#666' },
  error: { padding: '1rem', backgroundColor: '#fee', border: '1px solid #fcc', borderRadius: '4px', color: '#c00', marginBottom: '1rem' },
  success: { padding: '1rem', backgroundColor: '#efe', border: '1px solid #cfc', borderRadius: '4px', color: '#060', marginBottom: '1rem' },
  searchForm: { display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', padding: '1rem', backgroundColor: '#f9f9f9', border: '1px solid #ddd', borderRadius: '4px' },
  pubmedInput: { padding: '0.4rem', fontSize: '0.95rem', border: '1px solid #ccc', borderRadius: '4px', width: '10rem' },
  paper: { margin: '1rem 0', padding: '0.75rem', borderLeft: '4px solid #337ab7', backgroundColor: '#f5f8fc' },
  section: { marginBottom: '1.5rem', padding: '0.5rem', border: '1px solid #ddd' },
  sectionHeader: { backgroundColor: '#CCCCFF', padding: '0.5rem', margin: '-0.5rem -0.5rem 0.5rem -0.5rem', fontSize: '1.1rem' },
  toolbar: { marginBottom: '0.5rem' },
  noRows: { padding: '1rem', textAlign: 'center', color: '#666', fontStyle: 'italic' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', marginTop: '0.5rem' },
  th: { textAlign: 'left', padding: '0.5rem', borderBottom: '2px solid #333', backgroundColor: '#f5f5f5' },
  td: { padding: '0.5rem', borderBottom: '1px solid #eee', verticalAlign: 'top' },
  editRow: { backgroundColor: '#fffbe6' },
  problemRow: { backgroundColor: '#fff4f4' },
  muted: { color: '#777', fontSize: '0.8rem' },
  overlap: { color: '#8a6d3b', fontSize: '0.75rem' },
  grid: { display: 'grid', gridTemplateColumns: 'minmax(9rem, max-content) 1fr', gap: '0.6rem 1rem', alignItems: 'start' },
  label: { fontWeight: 'bold', fontSize: '0.9rem', paddingTop: '0.35rem' },
  input: { padding: '0.4rem', fontSize: '0.9rem', border: '1px solid #ccc', borderRadius: '4px', minWidth: '14rem', boxSizing: 'border-box' },
  wideInput: { padding: '0.4rem', fontSize: '0.9rem', border: '1px solid #ccc', borderRadius: '4px', width: '100%', maxWidth: '48rem', boxSizing: 'border-box' },
  radioGroup: { display: 'flex', flexDirection: 'column', gap: '0.25rem', paddingTop: '0.35rem', fontSize: '0.9rem' },
  radio: { cursor: 'pointer' },
  actions: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' },
  preview: { marginTop: '1rem' },
  primaryButton: { padding: '0.45rem 1rem', backgroundColor: '#337ab7', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  saveButton: { padding: '0.45rem 1rem', backgroundColor: '#3c763d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  secondaryButton: { padding: '0.45rem 1rem', backgroundColor: '#eee', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' },
  deleteButton: { padding: '0.3rem 0.8rem', backgroundColor: '#d9534f', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' },
  linkButton: { background: 'none', border: 'none', color: '#337ab7', cursor: 'pointer', padding: 0, textDecoration: 'underline' },
};

export default RegulationCurationPage;
