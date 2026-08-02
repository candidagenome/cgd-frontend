import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import phenotypeApi from '../api/phenotypeApi';
import './RecentPhenotypeAnnotationsPage.css';

const PAGE_SIZE = 10;

const countBy = (items, keyFn) => {
  const counts = new Map();
  items.forEach((item) => {
    const key = keyFn(item);
    if (key) counts.set(key, (counts.get(key) || 0) + 1);
  });
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
};

const detailValues = (annotation, types) =>
  (annotation.details || [])
    .filter((detail) => types.includes(detail.property_type))
    .map((detail) => detail.property_value);

function RecentPhenotypeAnnotationsPage() {
  const [searchParams] = useSearchParams();
  const requestedDays = Number.parseInt(searchParams.get('days') || '90', 10);
  const days = Number.isFinite(requestedDays) ? Math.min(Math.max(requestedDays, 1), 365) : 90;
  const [annotations, setAnnotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    phenotypeApi
      .searchPhenotypes({ recent_days: days, limit: 100 })
      .then((result) => {
        if (!cancelled) setAnnotations(result.results || []);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.response?.data?.detail || err.message || 'Unable to load recent annotations');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [days]);

  useEffect(() => setPage(1), [filter]);

  const filtered = useMemo(() => {
    const needle = filter.trim().toLowerCase();
    if (!needle) return annotations;
    return annotations.filter((annotation) =>
      JSON.stringify(annotation).toLowerCase().includes(needle)
    );
  }, [annotations, filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const genes = countBy(annotations, (a) => a.gene_name || a.feature_name);
  const phenotypes = countBy(annotations, (a) =>
    [a.observable, a.qualifier].filter(Boolean).join(': ')
  );
  const experiments = countBy(annotations, (a) => a.experiment_type);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return (
    <main className="recent-phenotypes-page">
      <header className="recent-phenotypes-header">
        <p className="recent-phenotypes-eyebrow">CGD PHENOTYPES</p>
        <h1>Phenotypes Recently Added to CGD</h1>
        <p className="recent-phenotypes-range">
          {startDate.toLocaleDateString('en-CA')} to {new Date().toLocaleDateString('en-CA')}
        </p>
        <span className="recent-phenotypes-badge">
          {annotations.length} {annotations.length === 1 ? 'entry' : 'entries'} for{' '}
          {phenotypes.length} {phenotypes.length === 1 ? 'phenotype' : 'phenotypes'}
        </span>
      </header>

      {loading && <p className="recent-phenotypes-status">Loading annotations…</p>}
      {error && <p className="recent-phenotypes-error">{error}</p>}

      {!loading && !error && (
        <>
          <section className="recent-phenotypes-summary" aria-label="Recent annotation summary">
            <div className="recent-summary-counts">
              <strong>{annotations.length}</strong> phenotype annotations
              <strong>{phenotypes.length}</strong> phenotypes
              <strong>{genes.length}</strong> associated genes
            </div>
            <div><b>Top genes:</b> {genes.slice(0, 5).map(([name, count]) => <span key={name}>{name} ({count})</span>)}</div>
            <div><b>Top phenotypes:</b> {phenotypes.slice(0, 3).map(([name, count]) => <span key={name}>{name} ({count})</span>)}</div>
            <div><b>Experiment type:</b> {experiments.map(([name, count]) => <span key={name}>{name} ({count})</span>)}</div>
          </section>

          <section className="recent-phenotypes-table-wrap">
            <div className="recent-phenotypes-toolbar">
              <label>
                <span className="sr-only">Filter annotations</span>
                <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter table" />
              </label>
            </div>
            <div className="recent-phenotypes-scroll">
              <table className="recent-phenotypes-table">
                <thead><tr><th>Gene</th><th>Phenotype</th><th>Experiment Type</th><th>Mutant Information</th><th>Strain Background</th><th>Chemical</th><th>Details</th><th>Reference</th></tr></thead>
                <tbody>
                  {visible.map((annotation, index) => {
                    const chemicals = detailValues(annotation, ['Chemical']);
                    const details = detailValues(annotation, ['Details', 'Condition', 'Reporter']);
                    const alleles = detailValues(annotation, ['Allele']);
                    const reference = annotation.references?.[0];
                    return (
                      <tr key={`${annotation.feature_name}-${annotation.date_created}-${index}`}>
                        <td><Link to={`/locus/${encodeURIComponent(annotation.feature_name)}`}>{annotation.gene_name || annotation.feature_name}</Link></td>
                        <td><Link to={`/phenotype/search?observable=${encodeURIComponent(annotation.observable)}`}>{annotation.observable}{annotation.qualifier ? `: ${annotation.qualifier}` : ''}</Link></td>
                        <td>{annotation.experiment_type || '—'}</td>
                        <td>{annotation.mutant_type || '—'}{alleles.length > 0 && <><br /><b>Allele:</b> {alleles.join('; ')}</>}</td>
                        <td>{annotation.strain || '—'}</td>
                        <td>{chemicals.join('; ') || '—'}</td>
                        <td>{annotation.experiment_comment || details.join('; ') || '—'}</td>
                        <td>{reference ? <Link to={`/reference/${reference.pubmed || reference.reference_no}`}>{reference.citation || reference.dbxref_id}</Link> : '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <footer className="recent-phenotypes-pagination">
              <span>Showing {filtered.length ? (page - 1) * PAGE_SIZE + 1 : 0} to {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} entries</span>
              <div><button disabled={page === 1} onClick={() => setPage(page - 1)}>‹</button><span>{page} / {totalPages}</span><button disabled={page === totalPages} onClick={() => setPage(page + 1)}>›</button></div>
            </footer>
          </section>
        </>
      )}

      <Link to="/phenotype/search" className="recent-phenotypes-browse">Browse all phenotype annotations →</Link>
    </main>
  );
}

export default RecentPhenotypeAnnotationsPage;
