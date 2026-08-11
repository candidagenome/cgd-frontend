/**
 * CV Admin Page - "Manage CV Terms"
 *
 * Lets curators add terms to CGD-managed controlled vocabularies through the
 * UI instead of direct SQL: phenotype strain backgrounds, literature topics,
 * and other small CVs. Replaces the manual sqlplus recipe (INSERT into
 * CV_TERM + CVTERM_RELATIONSHIP).
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import cvAdminApi from '../../api/cvAdminApi';

function CvAdminPage() {
  const [cvs, setCvs] = useState([]);
  const [selectedCv, setSelectedCv] = useState(null); // cv_name
  const [terms, setTerms] = useState([]);
  const [loadingTerms, setLoadingTerms] = useState(false);

  const [newTermName, setNewTermName] = useState('');
  const [parentTermNo, setParentTermNo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null); // {ok, message}

  useEffect(() => {
    cvAdminApi.getCvs()
      .then((data) => {
        setCvs(data.cvs || []);
        const firstFeatured = (data.cvs || []).find((cv) => cv.featured);
        if (firstFeatured) setSelectedCv(firstFeatured.cv_name);
      })
      .catch((err) => {
        setResult({ ok: false, message: err.response?.data?.detail || 'Failed to load CVs' });
      });
  }, []);

  const loadTerms = useCallback((cvName) => {
    if (!cvName) return;
    setLoadingTerms(true);
    cvAdminApi.getTerms(cvName)
      .then((data) => setTerms(data.terms || []))
      .catch((err) => {
        setTerms([]);
        setResult({ ok: false, message: err.response?.data?.detail || 'Failed to load terms' });
      })
      .finally(() => setLoadingTerms(false));
  }, []);

  useEffect(() => {
    setResult(null);
    setParentTermNo('');
    setNewTermName('');
    loadTerms(selectedCv);
  }, [selectedCv, loadTerms]);

  const cvInfo = useMemo(
    () => cvs.find((cv) => cv.cv_name === selectedCv),
    [cvs, selectedCv]
  );

  // Top-level terms (groups) first in the parent dropdown, then the rest.
  const { groupTerms, childTerms, byParent } = useMemo(() => {
    const groups = terms.filter((t) => t.parent_cv_term_no == null);
    const children = terms.filter((t) => t.parent_cv_term_no != null);
    const map = {};
    children.forEach((t) => {
      (map[t.parent_cv_term_no] = map[t.parent_cv_term_no] || []).push(t);
    });
    return { groupTerms: groups, childTerms: children, byParent: map };
  }, [terms]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCv || !newTermName.trim()) return;
    setSubmitting(true);
    setResult(null);
    try {
      const created = await cvAdminApi.addTerm(
        selectedCv,
        newTermName.trim(),
        parentTermNo ? Number(parentTermNo) : null
      );
      setResult({
        ok: true,
        message: `Added "${created.term_name}" (cv_term_no ${created.cv_term_no})`
          + (created.parent_term_name ? ` under "${created.parent_term_name}"` : ' as a top-level term'),
      });
      setNewTermName('');
      loadTerms(selectedCv);
    } catch (err) {
      setResult({ ok: false, message: err.response?.data?.detail || 'Failed to add term' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Manage CV Terms</h1>
        <Link to="/curation">Back to Curator Central</Link>
      </div>
      <p style={styles.intro}>
        Add terms to CGD-managed controlled vocabularies — e.g. new strain
        backgrounds for the Curate Phenotype tool, or new literature topics
        for the Lit Guide. Changes take effect immediately in the curation
        tools on this server; repeat the addition on production when ready.
      </p>

      <div style={styles.cvPicker}>
        {cvs.map((cv) => (
          <button
            key={cv.cv_name}
            type="button"
            onClick={() => setSelectedCv(cv.cv_name)}
            style={{
              ...styles.cvButton,
              ...(cv.featured ? styles.cvButtonFeatured : {}),
              ...(cv.cv_name === selectedCv ? styles.cvButtonActive : {}),
            }}
          >
            {cv.label}
            <span style={styles.cvCount}>{cv.term_count}</span>
          </button>
        ))}
      </div>

      {cvInfo && (
        <p style={styles.cvDescription}>{cvInfo.description}</p>
      )}

      {result && (
        <div style={result.ok ? styles.successBox : styles.errorBox}>
          {result.message}
        </div>
      )}

      {selectedCv && (
        <form onSubmit={handleSubmit} style={styles.addForm}>
          <div style={styles.formRow}>
            <label style={styles.label}>
              New term name
              <input
                type="text"
                value={newTermName}
                onChange={(e) => setNewTermName(e.target.value)}
                style={styles.input}
                placeholder="e.g. Protein Structure, SC5314-derived strain X"
                maxLength={1024}
                required
              />
            </label>
            <label style={styles.label}>
              Parent term / group
              <select
                value={parentTermNo}
                onChange={(e) => setParentTermNo(e.target.value)}
                style={styles.input}
              >
                <option value="">(none — top-level term)</option>
                {groupTerms.length > 0 && (
                  <optgroup label="Top-level groups">
                    {groupTerms.map((t) => (
                      <option key={t.cv_term_no} value={t.cv_term_no}>{t.term_name}</option>
                    ))}
                  </optgroup>
                )}
                {childTerms.length > 0 && (
                  <optgroup label="Other terms">
                    {childTerms.map((t) => (
                      <option key={t.cv_term_no} value={t.cv_term_no}>{t.term_name}</option>
                    ))}
                  </optgroup>
                )}
              </select>
            </label>
            <button type="submit" disabled={submitting || !newTermName.trim()} style={styles.submitButton}>
              {submitting ? 'Adding…' : 'Add term'}
            </button>
          </div>
        </form>
      )}

      <h3 style={styles.termsHeader}>
        Current terms {loadingTerms ? '(loading…)' : `(${terms.length})`}
      </h3>
      <div style={styles.termTree}>
        {groupTerms.map((group) => (
          <TermNode key={group.cv_term_no} term={group} byParent={byParent} depth={0} />
        ))}
        {/* Terms whose parent is missing from the CV (shouldn't happen, but show them) */}
        {childTerms.filter((t) => !terms.some((x) => x.cv_term_no === t.parent_cv_term_no)).map((t) => (
          <TermNode key={t.cv_term_no} term={t} byParent={byParent} depth={0} />
        ))}
      </div>
    </div>
  );
}

// Recursive tree node — CVs vary in depth (strain_background is 3 levels:
// Candida strains -> species -> strains; literature_topic is 2).
function TermNode({ term, byParent, depth }) {
  const children = byParent[term.cv_term_no] || [];
  return (
    <div style={{ ...(depth === 0 ? styles.group : {}), paddingLeft: depth ? '1rem' : 0 }}>
      <div style={depth === 0 ? styles.groupName : styles.childItem}>
        {term.term_name}
        <span style={styles.termNo}>#{term.cv_term_no}</span>
      </div>
      {children.map((child) => (
        <TermNode key={child.cv_term_no} term={child} byParent={byParent} depth={depth + 1} />
      ))}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '900px',
    margin: '1rem auto',
    padding: '1rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    borderBottom: '2px solid #333',
    paddingBottom: '0.5rem',
    marginBottom: '1rem',
  },
  title: { margin: 0 },
  intro: { color: '#444', marginBottom: '1.25rem' },
  cvPicker: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginBottom: '0.75rem',
  },
  cvButton: {
    padding: '0.4rem 0.8rem',
    border: '1px solid #bbb',
    borderRadius: '6px',
    background: '#f7f7f7',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  cvButtonFeatured: {
    fontWeight: 600,
    background: '#eef2ff',
    borderColor: '#99a8e8',
  },
  cvButtonActive: {
    background: '#CCCCFF',
    borderColor: '#333',
  },
  cvCount: {
    marginLeft: '0.4rem',
    color: '#666',
    fontSize: '0.8rem',
  },
  cvDescription: { color: '#555', fontSize: '0.92rem', marginBottom: '1rem' },
  addForm: {
    background: '#f7f7f7',
    border: '1px solid #ddd',
    borderRadius: '6px',
    padding: '1rem',
    marginBottom: '1.5rem',
  },
  formRow: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    fontSize: '0.85rem',
    fontWeight: 600,
    flex: 1,
    minWidth: '220px',
  },
  input: {
    padding: '0.45rem 0.6rem',
    border: '1px solid #bbb',
    borderRadius: '4px',
    fontSize: '0.95rem',
    fontWeight: 400,
  },
  submitButton: {
    padding: '0.5rem 1.1rem',
    background: '#2c5aa0',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.95rem',
  },
  successBox: {
    background: '#d4edda',
    border: '1px solid #28a745',
    color: '#155724',
    borderRadius: '4px',
    padding: '0.6rem 0.9rem',
    marginBottom: '1rem',
  },
  errorBox: {
    background: '#f8d7da',
    border: '1px solid #dc3545',
    color: '#721c24',
    borderRadius: '4px',
    padding: '0.6rem 0.9rem',
    marginBottom: '1rem',
  },
  termsHeader: {
    backgroundColor: '#CCCCFF',
    padding: '0.25rem 0.5rem',
    fontSize: '1rem',
  },
  termTree: { columnCount: 2, columnGap: '2rem' },
  group: { breakInside: 'avoid', marginBottom: '0.9rem' },
  groupName: { fontWeight: 700, marginBottom: '0.2rem' },
  childList: { listStyle: 'none', margin: 0, paddingLeft: '1rem' },
  childItem: { padding: '0.1rem 0', fontSize: '0.92rem' },
  emptyChild: { color: '#999', fontStyle: 'italic', fontSize: '0.85rem' },
  termNo: { color: '#999', fontSize: '0.75rem', marginLeft: '0.4rem' },
};

export default CvAdminPage;
