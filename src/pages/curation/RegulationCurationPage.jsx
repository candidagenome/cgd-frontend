/**
 * Regulation Curation Page
 *
 * Curator entry of transcriptional regulatory associations (regulator ->
 * target gene) from papers PathoYeastract has not covered yet. Two kinds of
 * entry; large-scale expression studies are left to PathoYeastract:
 * - DNA binding: targeted assays (EMSA, ChIP-qPCR, ...) or genome-wide binding,
 *   whose peak file is turned into the target list;
 * - expression change in a single-gene mutant: how the regulator was mutated,
 *   and whether each target went up or down (the effect follows from both).
 *
 * - Load a paper by PubMed ID to see, edit or delete what has been curated from it.
 * - Add a batch: one regulator, one experiment and condition, and a pasted list
 *   of targets. "Check targets" resolves the names first; "Save" stores the
 *   resolvable rows. The regulator must be a GO DNA-binding transcription
 *   factor, a PathoYeastract regulator, or a gene a curator admitted.
 * - Review: admitted regulators, and RNA accumulation phenotypes that are not
 *   on the Regulation tab (regulator not admitted, reporter not a gene).
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
const CHANGE_LABELS = { up: 'up', down: 'down' };

const EMPTY_BATCH = {
  organism: '',
  tf: '',
  evidence_code: 'Direct',
  experiment: '',
  mutant_type: '',
  expression_change: '',
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

const evidenceLabel = (row) => (row.evidence_code === 'Direct'
  ? 'DNA binding'
  : `Expression${row.mutant_type ? ` (${row.mutant_type} mutant)` : ''}`);

/** Experiments offered for an evidence type, keeping a row's older experiment selectable. */
function ExperimentSelect({ vocab, evidenceCode, value, onChange, id, style }) {
  const options = vocab.experiments[evidenceCode] || [];
  return (
    <select id={id} value={value} onChange={(e) => onChange(e.target.value)} style={style}>
      <option value="">Select experiment...</option>
      {value && !options.includes(value) && <option value={value}>{value}</option>}
      {options.map((x) => <option key={x} value={x}>{x}</option>)}
    </select>
  );
}

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
    mutant_type: row.mutant_type || '',
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
        <ExperimentSelect
          vocab={vocab}
          evidenceCode={form.evidence_code}
          value={form.experiment}
          onChange={(v) => set('experiment', v)}
          style={{ ...styles.input, marginTop: '0.25rem' }}
        />
        {form.evidence_code === 'Indirect' && (
          <select value={form.mutant_type} onChange={(e) => set('mutant_type', e.target.value)} style={{ ...styles.input, marginTop: '0.25rem' }}>
            <option value="">Mutant type...</option>
            {vocab.mutant_types.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        )}
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
          <th style={styles.th}>Regulator</th>
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
                <div style={styles.overlap} title="PathoYeastract already lists this regulator and target from the same paper">
                  also in PathoYeastract
                </div>
              )}
            </td>
            <td style={styles.td}>
              <strong>{evidenceLabel(row)}</strong>
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

/** Genome-wide binding: turn a peak file into the target list. */
function PeakPanel({ organism, defaultWindow, onTargets }) {
  const [text, setText] = useState('');
  const [fileName, setFileName] = useState('');
  const [windowBp, setWindowBp] = useState(defaultWindow);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const readFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setText(String(reader.result || ''));
    reader.readAsText(file);
  };

  const run = async () => {
    setBusy(true);
    setError(null);
    try {
      const data = await regulationCurationApi.assignPeaks(organism, text, Number(windowBp) || defaultWindow);
      setResult(data);
      onTargets(data.target_lines);
    } catch (err) {
      setResult(null);
      setError(detail(err, 'Failed to read the peaks'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={styles.peakPanel}>
      <div>
        <strong>Peaks to targets.</strong> Upload or paste the paper&apos;s peak file (BED or narrowPeak, a
        chrom,start,end table, or chrom:start-end lines). Each gene whose promoter holds a peak becomes a
        target; a peak between two divergent genes counts for both. The target list below is replaced.
      </div>
      <div style={styles.peakControls}>
        <input type="file" accept=".bed,.narrowPeak,.broadPeak,.txt,.tsv,.csv" onChange={readFile} />
        <label>
          Promoter: <input
            type="number"
            min={100}
            max={5000}
            step={100}
            value={windowBp}
            onChange={(e) => setWindowBp(e.target.value)}
            style={{ ...styles.input, minWidth: 0, width: '6rem' }}
          /> bp upstream of the start
        </label>
        <button
          type="button"
          style={{ ...styles.primaryButton, opacity: busy || !organism || !text.trim() ? 0.5 : 1 }}
          onClick={run}
          disabled={busy || !organism || !text.trim()}
          title={organism ? '' : 'Choose the species first'}
        >
          {busy ? 'Assigning...' : 'Find targets'}
        </button>
      </div>
      <textarea
        value={text}
        onChange={(e) => { setText(e.target.value); setFileName(''); }}
        rows={4}
        placeholder={fileName ? `${fileName} loaded` : 'Or paste peaks here, e.g. Ca22chr1A_C_albicans_SC5314\t120400\t120650'}
        style={{ ...styles.wideInput, fontFamily: 'monospace', marginTop: '0.5rem' }}
      />
      {error && <div style={styles.inlineError}>{error}</div>}
      {result && (
        <div style={styles.muted}>
          {result.peaks} peaks; {result.peaks_assigned} fell in a promoter ({result.window} bp) &rarr;{' '}
          <strong>{result.targets.length} target genes</strong>
          {result.skipped_lines > 0 && `; ${result.skipped_lines} header/unreadable lines skipped`}
          {result.unmatched_chromosomes.length > 0 && (
            <div style={styles.inlineError}>
              Chromosome names not in CGD (peaks ignored):{' '}
              {result.unmatched_chromosomes.map((c) => `${c.name} (${c.peaks})`).join(', ')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Shown when the batch's regulator is not a recognized regulator: admit it, with a reason. */
function AdmitRegulator({ organism, gene, onAdmitted }) {
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const admit = async () => {
    setBusy(true);
    setError(null);
    try {
      await regulationCurationApi.allowRegulator(organism, gene.feature_name, note);
      await onAdmitted();
    } catch (err) {
      setError(detail(err, 'Failed to admit the regulator'));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div style={styles.warning}>
      <div>
        <strong>{gene.display_name}</strong> is not a recognized regulator: it has no GO DNA-binding
        transcription factor annotation and is not a PathoYeastract regulator. If the paper supports it as a
        regulator, admit it; it then counts as one everywhere (including its RNA accumulation phenotypes).
      </div>
      <div style={styles.peakControls}>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Why it is a regulator (required)"
          style={styles.wideInput}
        />
        <button
          type="button"
          style={{ ...styles.primaryButton, opacity: busy || !note.trim() ? 0.5 : 1 }}
          onClick={admit}
          disabled={busy || !note.trim()}
        >
          Admit {gene.display_name} as a regulator
        </button>
      </div>
      {error && <div style={styles.inlineError}>{error}</div>}
    </div>
  );
}

/** Admitted regulators and RNA accumulation phenotypes that are not on the Regulation tab. */
function ReviewSection({ organisms, initialOrganism }) {
  const [organism, setOrganism] = useState(initialOrganism || '');
  const [review, setReview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [notes, setNotes] = useState({});

  useEffect(() => {
    if (!organism && initialOrganism) setOrganism(initialOrganism);
  }, [initialOrganism, organism]);

  const load = useCallback(async () => {
    if (!organism) {
      setReview(null);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      setReview(await regulationCurationApi.getReview(organism));
    } catch (err) {
      setReview(null);
      setError(detail(err, 'Failed to load the review'));
    } finally {
      setBusy(false);
    }
  }, [organism]);

  useEffect(() => {
    load();
  }, [load]);

  const act = async (fn) => {
    setError(null);
    try {
      await fn();
      await load();
    } catch (err) {
      setError(detail(err, 'Failed to save'));
    }
  };

  return (
    <section style={styles.section}>
      <h2 style={styles.sectionHeader}>Regulators and phenotype review</h2>
      <p style={styles.intro}>
        RNA accumulation phenotypes appear on the Regulation tab as expression evidence when the mutated gene
        is a regulator (a GO DNA-binding transcription factor, a PathoYeastract regulator, or admitted here)
        and the reporter names a gene. Edit phenotypes with the phenotype curation tool.
      </p>
      <label style={styles.label} htmlFor="review-organism">Species </label>
      <select id="review-organism" value={organism} onChange={(e) => setOrganism(e.target.value)} style={styles.input}>
        <option value="">Select species...</option>
        {organisms.map((org) => (
          <option key={org.organism_abbrev} value={org.organism_abbrev}>{org.organism_name}</option>
        ))}
      </select>
      {busy && <span style={styles.muted}> Loading...</span>}
      {error && <div style={styles.inlineError}>{error}</div>}
      {review && (
        <>
          <div style={styles.muted}>
            Regulators: {review.regulator_counts.go} with GO DNA-binding transcription factor annotations,{' '}
            {review.regulator_counts.pathoyeastract} in PathoYeastract, {review.regulator_counts.admitted} admitted.
          </div>

          <h3 style={styles.subHeader}>Admitted regulators ({review.admitted.length})</h3>
          {review.admitted.length === 0 ? <div style={styles.muted}>None.</div> : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Gene</th>
                  <th style={styles.th}>Why</th>
                  <th style={styles.th}>Admitted</th>
                  <th style={styles.th}></th>
                </tr>
              </thead>
              <tbody>
                {review.admitted.map((a) => (
                  <tr key={a.feature_name}>
                    <td style={styles.td}><GeneLink gene={a} /></td>
                    <td style={styles.td}>{a.note}</td>
                    <td style={styles.td}>{a.created_by}<div style={styles.muted}>{a.date_created}</div></td>
                    <td style={styles.td}>
                      <button
                        type="button"
                        style={styles.linkButton}
                        onClick={() => window.confirm(`Withdraw ${a.display_name} as an admitted regulator?`)
                          && act(() => regulationCurationApi.removeRegulator(organism, a.feature_name))}
                      >
                        Withdraw
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <h3 style={styles.subHeader}>
            Phenotypes left off the tab: mutated gene is not a regulator ({review.excluded_regulators.length} genes)
          </h3>
          {review.excluded_regulators.length === 0 ? <div style={styles.muted}>None.</div> : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Mutated gene</th>
                  <th style={styles.th}>Annotations</th>
                  <th style={styles.th}>Reporters</th>
                  <th style={styles.th}>Admit as a regulator</th>
                </tr>
              </thead>
              <tbody>
                {review.excluded_regulators.map((e) => (
                  <tr key={e.feature_name}>
                    <td style={styles.td}>
                      <Link to={`/locus/${encodeURIComponent(e.feature_name)}?tab=phenotype`} target="_blank" rel="noopener noreferrer">
                        {e.display_name}
                      </Link>
                    </td>
                    <td style={styles.td}>{e.annotations}</td>
                    <td style={styles.td}>{e.reporters.join('; ')}</td>
                    <td style={styles.td}>
                      <input
                        value={notes[e.feature_name] || ''}
                        onChange={(ev) => setNotes((n) => ({ ...n, [e.feature_name]: ev.target.value }))}
                        placeholder="Why it is a regulator"
                        style={{ ...styles.input, minWidth: '12rem' }}
                      />{' '}
                      <button
                        type="button"
                        style={{ ...styles.secondaryButton, opacity: (notes[e.feature_name] || '').trim() ? 1 : 0.5 }}
                        disabled={!(notes[e.feature_name] || '').trim()}
                        onClick={() => act(() => regulationCurationApi.allowRegulator(
                          organism, e.feature_name, notes[e.feature_name]))}
                      >
                        Admit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <h3 style={styles.subHeader}>
            Reporters with words that are not CGD genes ({review.unresolved_reporters.length})
          </h3>
          {review.unresolved_reporters.length === 0 ? <div style={styles.muted}>None.</div> : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Mutated gene</th>
                  <th style={styles.th}>Reporter</th>
                  <th style={styles.th}>Not a gene</th>
                  <th style={styles.th}>Shown as targets</th>
                </tr>
              </thead>
              <tbody>
                {review.unresolved_reporters.map((u) => (
                  <tr key={`${u.pheno_annotation_no}-${u.reporter}`}>
                    <td style={styles.td}>
                      <Link to={`/locus/${encodeURIComponent(u.regulator.feature_name)}?tab=phenotype`} target="_blank" rel="noopener noreferrer">
                        {u.regulator.display_name}
                      </Link>
                      {!u.regulator_shown && <div style={styles.muted}>not a regulator</div>}
                    </td>
                    <td style={styles.td}>{u.reporter}</td>
                    <td style={styles.td}>{u.unresolved.join(', ')}</td>
                    <td style={styles.td}>
                      {u.targets.length ? u.targets.map((t, i) => (
                        <span key={t.feature_name}>{i > 0 && ', '}<GeneLink gene={t} /></span>
                      )) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </section>
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
  const setEvidence = (code) => setBatch((b) => ({ ...b, evidence_code: code, experiment: '', mutant_type: '' }));
  const isExpression = batch.evidence_code === 'Indirect';
  const genomeWide = !isExpression && vocab?.genome_wide_experiments.includes(batch.experiment);

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

  const regulatorOk = !preview || preview.regulator.is_regulator;
  const readyCount = previewCurrent && regulatorOk ? (preview.counts.ok || 0) : 0;

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
        Enter regulator &rarr; target gene associations from papers that PathoYeastract has not covered:
        DNA binding, and expression changes in single-gene mutants. Large-scale expression studies
        (RNA-seq, microarrays) are left to PathoYeastract. Associations appear on each gene&apos;s Regulation
        tab as CGD curation, next to PathoYeastract&apos;s; RNA accumulation phenotypes of regulators appear
        there too, so they need not be entered here.
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

              <label style={styles.label} htmlFor="reg-tf">Regulator</label>
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
                      onChange={() => setEvidence(c.code)}
                    />
                    {' '}{c.label}{' '}
                    <span style={styles.muted}>
                      ({c.code === 'Direct'
                        ? 'the regulator binds the target\'s promoter or a motif in it'
                        : 'the regulator is mutated and the target\'s expression measured'})
                    </span>
                  </label>
                ))}
              </div>

              <label style={styles.label} htmlFor="reg-experiment">Experiment</label>
              <div>
                <ExperimentSelect
                  id="reg-experiment"
                  vocab={vocab}
                  evidenceCode={batch.evidence_code}
                  value={batch.experiment}
                  onChange={(v) => setField('experiment', v)}
                  style={styles.input}
                />
                {!isExpression && (
                  <div style={styles.muted}>
                    Genome-wide binding ({vocab.genome_wide_experiments.join(', ')}) takes its targets from a peak file.
                  </div>
                )}
              </div>

              {isExpression && (
                <>
                  <label style={styles.label} htmlFor="reg-mutant">Regulator mutant</label>
                  <select id="reg-mutant" value={batch.mutant_type} onChange={(e) => setField('mutant_type', e.target.value)} style={styles.input}>
                    <option value="">Select mutant type...</option>
                    {vocab.mutant_types.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </>
              )}

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

              {isExpression ? (
                <>
                  <label style={styles.label} htmlFor="reg-change">Target expression</label>
                  <div>
                    <select id="reg-change" value={batch.expression_change} onChange={(e) => setField('expression_change', e.target.value)} style={styles.input}>
                      <option value="">Given on each line (up / down)</option>
                      {vocab.expression_changes.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
                      <option value="infer">From each target&apos;s log2FC sign</option>
                    </select>
                    <div style={styles.muted}>
                      The effect follows from the mutant and the change: a target that goes down in a null (or
                      up on overexpression) is activated by the regulator; the reverse means repression.
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <label style={styles.label} htmlFor="reg-effect">Default effect</label>
                  <select id="reg-effect" value={batch.association_type} onChange={(e) => setField('association_type', e.target.value)} style={styles.input}>
                    <option value="N/A">Not stated (n/a)</option>
                    <option value="Positive">Activation</option>
                    <option value="Negative">Repression</option>
                    <option value="infer">From each target&apos;s log2FC sign</option>
                  </select>
                </>
              )}

              <label style={styles.label} htmlFor="reg-note">Note (optional)</label>
              <input id="reg-note" value={batch.regulation_note} onChange={(e) => setField('regulation_note', e.target.value)} style={styles.wideInput} />

              <label style={styles.label} htmlFor="reg-targets">Target genes</label>
              <div>
                {genomeWide && (
                  <PeakPanel
                    organism={batch.organism}
                    defaultWindow={vocab.promoter_window}
                    onTargets={(lines) => setField('targets', lines)}
                  />
                )}
                <textarea
                  id="reg-targets"
                  value={batch.targets}
                  onChange={(e) => setField('targets', e.target.value)}
                  rows={10}
                  placeholder={isExpression
                    ? 'One target per line, with the change in the mutant and optionally a log2 fold change:\nCDR1  down\nPDR16  up  2.4\nCAGL0F02717g  -1.3'
                    : 'One target per line, optionally followed by an effect:\nCDR1\nPDR16  activated\nCAGL0F02717g  repressed'}
                  style={{ ...styles.wideInput, fontFamily: 'monospace' }}
                />
                <div style={styles.muted}>
                  Separate columns with tabs, commas or spaces; text after # is ignored.{' '}
                  {isExpression
                    ? 'Changes: up/increased, down/decreased/absent. An explicit effect (activated, repressed) overrides the one inferred.'
                    : 'Effects: activated/positive, repressed/negative, n/a. A line\'s own effect overrides the default.'}
                  {' '}Gene names, systematic names, orf19 IDs and aliases are accepted.
                </div>
              </div>
            </div>
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
                  {preview.regulator.is_regulator && (
                    <span style={styles.muted}> &middot; regulator: {preview.regulator.reasons.join('; ')}</span>
                  )}
                </div>
                {!preview.regulator.is_regulator && (
                  <AdmitRegulator organism={preview.organism} gene={preview.tf} onAdmitted={handlePreview} />
                )}
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Line</th>
                      <th style={styles.th}>Entered</th>
                      <th style={styles.th}>Target</th>
                      {preview.shared.evidence_code === 'Indirect' && <th style={styles.th}>Change</th>}
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
                        {preview.shared.evidence_code === 'Indirect' && (
                          <td style={styles.td}>{CHANGE_LABELS[r.change] || '-'}</td>
                        )}
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

      {vocab && <ReviewSection organisms={organisms} initialOrganism={batch.organism} />}
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
  peakPanel: { padding: '0.75rem', marginBottom: '0.5rem', backgroundColor: '#f5f8fc', border: '1px solid #c9d8ea', borderRadius: '4px', fontSize: '0.85rem', maxWidth: '48rem', boxSizing: 'border-box' },
  peakControls: { display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.5rem' },
  warning: { padding: '0.75rem', margin: '0.5rem 0', backgroundColor: '#fcf8e3', border: '1px solid #faebcc', borderRadius: '4px', color: '#8a6d3b', fontSize: '0.9rem' },
  inlineError: { color: '#c00', fontSize: '0.85rem', marginTop: '0.25rem' },
  subHeader: { fontSize: '1rem', margin: '1rem 0 0.25rem' },
};

export default RegulationCurationPage;
