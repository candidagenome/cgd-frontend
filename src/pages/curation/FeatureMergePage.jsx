/**
 * Feature Merge Page
 *
 * Merge two ORF features into one after a sequence-error correction makes two
 * adjacent ORF fragments a single gene. Extends the survivor, transfers+dedups
 * the retired feature's annotations, and soft-retires the redundant feature.
 */
import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import featureMergeApi from '../../api/featureMergeApi';

function FeatureMergePage() {
  useAuth();

  const [survivorName, setSurvivorName] = useState('');
  const [retireName, setRetireName] = useState('');
  const [newStopCoord, setNewStopCoord] = useState('');
  const [survivor, setSurvivor] = useState(null);
  const [retiree, setRetiree] = useState(null);
  const [preview, setPreview] = useState(null);
  const [note, setNote] = useState('');
  const [referenceNosInput, setReferenceNosInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [commitResult, setCommitResult] = useState(null);

  const lookup = useCallback(async (name, setter) => {
    if (!name.trim()) return;
    setError('');
    try {
      const data = await featureMergeApi.getFeatureSummary(name.trim());
      setter(data);
    } catch (err) {
      setError(err.response?.data?.detail || `Feature ${name} not found`);
      setter(null);
    }
  }, []);

  const runMerge = useCallback(async (dryRun) => {
    setError('');
    if (!survivorName.trim() || !retireName.trim() || !newStopCoord) {
      setError('Survivor, retiree, and new stop coordinate are all required.');
      return;
    }
    if (!note.trim()) {
      setError('A note describing the merge is required.');
      return;
    }
    if (!dryRun && !window.confirm(
      `Commit merge: retire ${retireName} into ${survivorName} and extend it to ${newStopCoord}?\n\n` +
      'This regenerates the survivor sequences, transfers annotations, and soft-retires ' +
      'the redundant feature. It is logged and reversible only by another curated edit.'
    )) {
      return;
    }
    dryRun ? setLoading(true) : setCommitting(true);
    setPreview(null);
    if (!dryRun) setCommitResult(null);
    try {
      const data = await featureMergeApi.merge({
        survivorName: survivorName.trim(),
        retireName: retireName.trim(),
        newStopCoord: parseInt(newStopCoord, 10),
        note: note.trim(),
        referenceNos: referenceNosInput
          .split(/[,\s]+/)
          .filter(Boolean)
          .map((n) => parseInt(n, 10))
          .filter((n) => !Number.isNaN(n)),
        dryRun,
      });
      if (dryRun) setPreview(data);
      else setCommitResult(data);
    } catch (err) {
      setError(err.response?.data?.detail || (dryRun ? 'Preview failed' : 'Commit failed'));
    } finally {
      dryRun ? setLoading(false) : setCommitting(false);
    }
  }, [survivorName, retireName, newStopCoord, note, referenceNosInput]);

  const renderSummary = (label, s) => (
    <div style={styles.summaryCol}>
      <h3 style={styles.subsectionHeader}>{label}</h3>
      {!s ? <p style={styles.muted}>Not looked up.</p> : (
        <ul style={styles.summaryList}>
          <li><strong>{s.feature_name}</strong>{s.gene_name ? ` (${s.gene_name})` : ''} — {s.feature_type}</li>
          <li>feature_no {s.feature_no}, {s.dbxref_id}</li>
          {s.location && (
            <li>coords {s.location.start_coord.toLocaleString()}–{s.location.stop_coord.toLocaleString()} ({s.location.strand})</li>
          )}
          <li>CDS children: {s.cds_children.map((c) => c.feature_name).join(', ') || 'none'}</li>
          <li>
            annotations:{' '}
            {Object.entries(s.annotation_counts)
              .filter(([, v]) => v > 0)
              .map(([k, v]) => `${k.replace('_', ' ')} ${v}`)
              .join(', ') || 'none'}
          </li>
        </ul>
      )}
    </div>
  );

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Merge Features</h1>

      <div style={styles.warningBox}>
        <strong>Warning:</strong> This merges two ORF features into one. The survivor
        is extended and its sequences regenerated; the retired feature's annotations
        are transferred (deduplicated) and it is soft-retired (its current location and
        sequences are deprecated, its history kept). Verify the preview carefully.
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.section}>
        <h2 style={styles.sectionHeader}>Features to Merge</h2>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Survivor (extended, kept):</label>
          <input
            type="text"
            value={survivorName}
            onChange={(e) => setSurvivorName(e.target.value)}
            style={styles.textInput}
            placeholder="e.g. C1_12410C_A"
          />
          <button onClick={() => lookup(survivorName, setSurvivor)} style={styles.lookupButton}>
            Look up
          </button>
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Retiree (merged in):</label>
          <input
            type="text"
            value={retireName}
            onChange={(e) => setRetireName(e.target.value)}
            style={styles.textInput}
            placeholder="e.g. C1_12400C_A"
          />
          <button onClick={() => lookup(retireName, setRetiree)} style={styles.lookupButton}>
            Look up
          </button>
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>New stop coordinate for survivor:</label>
          <input
            type="number"
            value={newStopCoord}
            onChange={(e) => setNewStopCoord(e.target.value)}
            style={styles.coordInput}
            placeholder="e.g. 2699565"
          />
          {retiree?.location && (
            <button
              onClick={() => setNewStopCoord(String(retiree.location.stop_coord))}
              style={styles.lookupButton}
              title="Use the retiree's far boundary"
            >
              Use retiree stop ({retiree.location.stop_coord.toLocaleString()})
            </button>
          )}
        </div>

        {(survivor || retiree) && (
          <div style={styles.summaryRow}>
            {renderSummary('Survivor', survivor)}
            {renderSummary('Retiree', retiree)}
          </div>
        )}

        <div style={styles.buttonRow}>
          <button onClick={() => runMerge(true)} disabled={loading} style={styles.previewButton}>
            {loading ? 'Loading…' : 'Preview Merge'}
          </button>
        </div>
      </div>

      {preview && (
        <div style={styles.section}>
          <h2 style={styles.sectionHeader}>Preview</h2>

          <h3 style={styles.subsectionHeader}>Extended features</h3>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Feature</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Old coords</th>
                <th style={styles.th}>New coords</th>
                <th style={styles.th}>Genomic (nt)</th>
                <th style={styles.th}>Protein (aa)</th>
                <th style={styles.th}>Internal stops</th>
              </tr>
            </thead>
            <tbody>
              {preview.extended_features.map((f) => (
                <tr key={f.feature_no} style={styles.tr}>
                  <td style={styles.td}>{f.feature_name}</td>
                  <td style={styles.td}>{f.feature_type}</td>
                  <td style={styles.td}>{f.old_coords.join('–')}</td>
                  <td style={styles.td}>{f.new_coords.join('–')}</td>
                  <td style={styles.td}>{f.genomic_length?.toLocaleString()}</td>
                  <td style={styles.td}>{f.protein_length?.toLocaleString() ?? '—'}</td>
                  <td style={f.internal_stops > 0 ? styles.badCell : styles.td}>
                    {f.internal_stops === undefined ? '—' : f.internal_stops}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 style={styles.subsectionHeader}>Annotation transfer (dedup)</h3>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Table</th>
                <th style={styles.th}>Transferred</th>
                <th style={styles.th}>Redundant (dropped)</th>
              </tr>
            </thead>
            <tbody>
              {preview.annotation_transfer.map((t) => (
                <tr key={t.table} style={styles.tr}>
                  <td style={styles.td}>{t.table.replace('_', ' ')}</td>
                  <td style={styles.td}>{t.transferred}</td>
                  <td style={styles.td}>{t.redundant_dropped}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 style={styles.subsectionHeader}>Retire &amp; preserve</h3>
          <ul style={styles.summaryList}>
            {preview.features_retired.map((f) => (
              <li key={f.feature_no}>
                Soft-retire {f.feature_name} ({f.feature_type}): deprecate{' '}
                {f.current_locations_deprecated} location(s) + {f.current_seqs_deprecated} seq(s),
                history kept.
              </li>
            ))}
            {preview.identifiers_preserved.map((a) => (
              <li key={a.alias_name}>Preserve <code>{a.alias_name}</code> as {a.alias_type} synonym of survivor.</li>
            ))}
          </ul>

          {commitResult ? (
            <div style={styles.successBox}>
              <strong>Merged.</strong> {commitResult.retired.feature_name} retired into{' '}
              {commitResult.survivor.feature_name}; extended to {commitResult.survivor.new_coords.join('–')}.
              Recorded under note_no {commitResult.note_no}
              {commitResult.reference_nos.length > 0 && ` (references: ${commitResult.reference_nos.join(', ')})`}.
            </div>
          ) : (
            <div style={styles.commitBox}>
              <h3 style={styles.subsectionHeader}>Commit Merge</h3>
              <label style={styles.commitLabel}>Note (required) — describe the merge and cite evidence:</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                style={styles.textarea}
                placeholder="e.g. Merged orf19.5225 (C1_12400C_A) into PKH2 (C1_12410C_A) after the Assembly-22 junction correction (PMID:37561787; PacBio GCA_032688725.1)."
              />
              <label style={styles.commitLabel}>Reference no(s) to link (optional, comma-separated CGD reference_no):</label>
              <input
                type="text"
                value={referenceNosInput}
                onChange={(e) => setReferenceNosInput(e.target.value)}
                style={styles.input}
                placeholder="e.g. 68332"
              />
              <div style={{ marginTop: '0.75rem' }}>
                <button onClick={() => runMerge(false)} disabled={committing || !note.trim()} style={styles.commitButton}>
                  {committing ? 'Committing…' : 'Commit Merge'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div style={styles.backLink}>
        <Link to="/curation">Back to Curator Central</Link>
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: '1100px', margin: '1rem auto', padding: '1rem' },
  title: { marginBottom: '0.5rem' },
  warningBox: {
    padding: '1rem', backgroundColor: '#fff3cd', border: '1px solid #ffc107',
    borderRadius: '4px', marginBottom: '1.5rem',
  },
  error: {
    padding: '0.75rem', backgroundColor: '#fee', border: '1px solid #c00',
    borderRadius: '4px', color: '#c00', marginBottom: '1rem',
  },
  section: { marginBottom: '2rem' },
  sectionHeader: {
    backgroundColor: '#CCCCFF', padding: '0.5rem', margin: '0 0 1rem 0', fontSize: '1.1rem',
  },
  subsectionHeader: {
    fontSize: '1rem', marginTop: '1.5rem', marginBottom: '0.5rem',
    borderBottom: '1px solid #ccc', paddingBottom: '0.25rem',
  },
  fieldGroup: {
    display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem',
  },
  label: { fontWeight: 'bold', minWidth: '220px' },
  textInput: { width: '260px', padding: '0.4rem', fontSize: '1rem', fontFamily: 'monospace' },
  coordInput: { width: '160px', padding: '0.4rem', fontSize: '1rem' },
  lookupButton: {
    padding: '0.4rem 0.75rem', fontSize: '0.85rem', backgroundColor: '#6c757d',
    color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer',
  },
  summaryRow: { display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '1rem' },
  summaryCol: { flex: 1, minWidth: '320px' },
  summaryList: { margin: '0.25rem 0 0 1.1rem', lineHeight: 1.5 },
  muted: { color: '#888' },
  buttonRow: { display: 'flex', gap: '1rem', marginTop: '1rem' },
  previewButton: {
    padding: '0.5rem 1.5rem', fontSize: '1rem', backgroundColor: '#0066cc',
    color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer',
  },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' },
  th: {
    backgroundColor: '#e0e0e0', padding: '0.5rem', textAlign: 'left', borderBottom: '2px solid #999',
  },
  tr: { borderBottom: '1px solid #ddd' },
  td: { padding: '0.5rem', verticalAlign: 'top' },
  badCell: { padding: '0.5rem', verticalAlign: 'top', color: '#c0392b', fontWeight: 'bold' },
  commitBox: {
    padding: '1rem', backgroundColor: '#fff8e1', border: '1px solid #ffc107',
    borderRadius: '4px', marginTop: '1.5rem',
  },
  successBox: {
    padding: '1rem', backgroundColor: '#e6f4ea', border: '1px solid #34a853',
    borderRadius: '4px', marginTop: '1.5rem',
  },
  commitLabel: { display: 'block', fontWeight: 600, margin: '0.5rem 0 0.25rem' },
  textarea: { width: '100%', padding: '0.5rem', fontSize: '0.9rem', boxSizing: 'border-box' },
  input: { width: '100%', padding: '0.4rem', fontSize: '0.9rem', boxSizing: 'border-box' },
  commitButton: {
    padding: '0.6rem 1.2rem', backgroundColor: '#c0392b', color: '#fff',
    border: 'none', borderRadius: '4px', fontWeight: 600, cursor: 'pointer',
  },
  backLink: { marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #ddd' },
};

export default FeatureMergePage;
