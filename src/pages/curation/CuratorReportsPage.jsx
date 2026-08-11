/**
 * Curator Reports Page - "Database Stats for Reports"
 *
 * Runs the canned statistics queries curators previously ran by hand in
 * sqlplus (phenotype/GO annotation counts, curated-reference counts) for
 * grant reporting, publications, and posters. Results can be downloaded
 * as TSV.
 */
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import curatorReportApi from '../../api/curatorReportApi';

function CuratorReportsPage() {
  const [reports, setReports] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [paramValues, setParamValues] = useState({});
  const [customValues, setCustomValues] = useState({}); // for allow_custom selects
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(null);
  const [resultData, setResultData] = useState(null);

  useEffect(() => {
    curatorReportApi.getDefinitions()
      .then((data) => {
        setReports(data.reports || []);
        if (data.reports?.length) setSelectedId(data.reports[0].id);
      })
      .catch((err) => setError(err.response?.data?.detail || 'Failed to load report list'));
  }, []);

  const report = useMemo(
    () => reports.find((r) => r.id === selectedId),
    [reports, selectedId]
  );

  useEffect(() => {
    // Reset params and results when switching reports
    setParamValues({});
    setCustomValues({});
    setResultData(null);
    setError(null);
  }, [selectedId]);

  const effectiveParams = useMemo(() => {
    const out = {};
    (report?.params || []).forEach((p) => {
      const raw = paramValues[p.name];
      if (raw === '__custom__') {
        out[p.name] = customValues[p.name] || '';
      } else if (raw !== undefined) {
        out[p.name] = raw;
      }
    });
    return out;
  }, [report, paramValues, customValues]);

  const missingRequired = useMemo(
    () => (report?.params || []).some((p) => p.required && !effectiveParams[p.name]),
    [report, effectiveParams]
  );

  const handleRun = async (e) => {
    e.preventDefault();
    if (!report) return;
    setRunning(true);
    setError(null);
    setResultData(null);
    try {
      const data = await curatorReportApi.run(report.id, effectiveParams);
      setResultData(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Report failed');
    } finally {
      setRunning(false);
    }
  };

  // Total row for numeric columns (matches how curators sum grouped counts).
  const totals = useMemo(() => {
    if (!resultData?.rows?.length) return null;
    const sums = resultData.columns.map((_, colIdx) => {
      const vals = resultData.rows.map((row) => row[colIdx]);
      if (!vals.every((v) => typeof v === 'number')) return null;
      return vals.reduce((a, b) => a + b, 0);
    });
    return sums.some((s) => s !== null) ? sums : null;
  }, [resultData]);

  const buildTsv = () => {
    const lines = [resultData.columns.join('\t')];
    resultData.rows.forEach((row) => lines.push(row.map((v) => v ?? '').join('\t')));
    return lines.join('\n');
  };

  const handleDownload = () => {
    const blob = new Blob([buildTsv()], { type: 'text/tab-separated-values' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const stamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `cgd_${resultData.report_id}_${stamp}.tsv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(buildTsv());
  };

  const renderParam = (p) => {
    const value = paramValues[p.name] ?? '';
    if (p.type === 'date') {
      return (
        <input
          type="date"
          value={value}
          onChange={(e) => setParamValues((prev) => ({ ...prev, [p.name]: e.target.value }))}
          style={styles.input}
        />
      );
    }
    if (p.type === 'select') {
      return (
        <>
          <select
            value={value}
            onChange={(e) => setParamValues((prev) => ({ ...prev, [p.name]: e.target.value }))}
            style={styles.input}
          >
            {p.required && <option value="">(choose…)</option>}
            {(p.options || []).map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
            {p.allow_custom && <option value="__custom__">Other…</option>}
          </select>
          {value === '__custom__' && (
            <input
              type="text"
              placeholder="Custom value"
              value={customValues[p.name] ?? ''}
              onChange={(e) => setCustomValues((prev) => ({ ...prev, [p.name]: e.target.value }))}
              style={{ ...styles.input, marginTop: '0.3rem' }}
            />
          )}
        </>
      );
    }
    return (
      <input
        type="text"
        value={value}
        onChange={(e) => setParamValues((prev) => ({ ...prev, [p.name]: e.target.value }))}
        style={styles.input}
      />
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Database Stats for Reports</h1>
        <Link to="/curation">Back to Curator Central</Link>
      </div>
      <p style={styles.intro}>
        Canned statistics for grant reports, publications, and posters —
        the counts previously gathered with manual SQL. Leave the date blank
        for all-time totals, or set it to count records created since a
        grant-period start date.
      </p>

      <div style={styles.layout}>
        <div style={styles.reportList}>
          {reports.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setSelectedId(r.id)}
              style={{
                ...styles.reportButton,
                ...(r.id === selectedId ? styles.reportButtonActive : {}),
              }}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div style={styles.reportPane}>
          {report && (
            <>
              <p style={styles.reportDescription}>{report.description}</p>
              <form onSubmit={handleRun} style={styles.paramForm}>
                {report.params.map((p) => (
                  <label key={p.name} style={styles.label}>
                    {p.label}{p.required ? ' *' : ''}
                    {renderParam(p)}
                  </label>
                ))}
                <button
                  type="submit"
                  disabled={running || missingRequired}
                  style={styles.runButton}
                >
                  {running ? 'Running…' : 'Run report'}
                </button>
              </form>

              {error && <div style={styles.errorBox}>{error}</div>}

              {resultData && (
                <div>
                  <div style={styles.resultActions}>
                    <span style={styles.rowCount}>
                      {resultData.rows.length} row{resultData.rows.length === 1 ? '' : 's'}
                    </span>
                    <button type="button" onClick={handleCopy} style={styles.smallButton}>Copy TSV</button>
                    <button type="button" onClick={handleDownload} style={styles.smallButton}>Download TSV</button>
                  </div>
                  <div style={styles.tableWrap}>
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          {resultData.columns.map((c) => (
                            <th key={c} style={styles.th}>{c.replaceAll('_', ' ')}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {resultData.rows.map((row, i) => (
                          <tr key={i}>
                            {row.map((v, j) => (
                              <td key={j} style={styles.td}>
                                {typeof v === 'number' ? v.toLocaleString() : (v ?? '')}
                              </td>
                            ))}
                          </tr>
                        ))}
                        {resultData.rows.length === 0 && (
                          <tr>
                            <td colSpan={resultData.columns.length} style={styles.emptyCell}>
                              No rows returned.
                            </td>
                          </tr>
                        )}
                      </tbody>
                      {totals && (
                        <tfoot>
                          <tr>
                            {totals.map((s, j) => (
                              <td key={j} style={styles.totalCell}>
                                {j === 0 && s === null ? 'TOTAL' : (s !== null ? s.toLocaleString() : '')}
                              </td>
                            ))}
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
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
    alignItems: 'baseline',
    borderBottom: '2px solid #333',
    paddingBottom: '0.5rem',
    marginBottom: '1rem',
  },
  title: { margin: 0 },
  intro: { color: '#444', marginBottom: '1.25rem' },
  layout: { display: 'flex', gap: '1.5rem', alignItems: 'flex-start' },
  reportList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
    width: '280px',
    flexShrink: 0,
  },
  reportButton: {
    textAlign: 'left',
    padding: '0.5rem 0.7rem',
    border: '1px solid #ccc',
    borderRadius: '6px',
    background: '#f7f7f7',
    cursor: 'pointer',
    fontSize: '0.88rem',
    lineHeight: 1.3,
  },
  reportButtonActive: {
    background: '#CCCCFF',
    borderColor: '#333',
    fontWeight: 600,
  },
  reportPane: { flex: 1, minWidth: 0 },
  reportDescription: { color: '#555', fontSize: '0.92rem', marginTop: 0 },
  paramForm: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    background: '#f7f7f7',
    border: '1px solid #ddd',
    borderRadius: '6px',
    padding: '0.9rem',
    marginBottom: '1rem',
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    fontSize: '0.85rem',
    fontWeight: 600,
    minWidth: '180px',
  },
  input: {
    padding: '0.4rem 0.55rem',
    border: '1px solid #bbb',
    borderRadius: '4px',
    fontSize: '0.92rem',
    fontWeight: 400,
  },
  runButton: {
    padding: '0.5rem 1.1rem',
    background: '#2c5aa0',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.95rem',
  },
  errorBox: {
    background: '#f8d7da',
    border: '1px solid #dc3545',
    color: '#721c24',
    borderRadius: '4px',
    padding: '0.6rem 0.9rem',
    marginBottom: '1rem',
  },
  resultActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    marginBottom: '0.5rem',
  },
  rowCount: { color: '#666', fontSize: '0.85rem', marginRight: 'auto' },
  smallButton: {
    padding: '0.3rem 0.7rem',
    border: '1px solid #bbb',
    borderRadius: '4px',
    background: '#fff',
    cursor: 'pointer',
    fontSize: '0.82rem',
  },
  tableWrap: { overflowX: 'auto' },
  table: { borderCollapse: 'collapse', width: '100%' },
  th: {
    background: '#CCCCFF',
    textAlign: 'left',
    padding: '0.4rem 0.6rem',
    border: '1px solid #aaa',
    fontSize: '0.85rem',
    textTransform: 'capitalize',
  },
  td: {
    padding: '0.35rem 0.6rem',
    border: '1px solid #ddd',
    fontSize: '0.9rem',
  },
  totalCell: {
    padding: '0.35rem 0.6rem',
    border: '1px solid #aaa',
    fontWeight: 700,
    background: '#f0f0f0',
    fontSize: '0.9rem',
  },
  emptyCell: {
    padding: '0.6rem',
    color: '#888',
    fontStyle: 'italic',
    border: '1px solid #ddd',
  },
};

export default CuratorReportsPage;
