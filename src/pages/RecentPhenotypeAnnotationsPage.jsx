import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import statsApi from '../api/statsApi';
import './RecentPhenotypeAnnotationsPage.css';

function RecentPhenotypeAnnotationsPage() {
  const [searchParams] = useSearchParams();
  const requestedDays = Number.parseInt(searchParams.get('days') || '90', 10);
  const days = Number.isFinite(requestedDays) ? Math.min(Math.max(requestedDays, 1), 365) : 90;
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setError('');
    statsApi
      .getRecentActivity(days)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.response?.data?.detail || err.message || 'Unable to load recent annotations');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [days]);

  const annotations = data?.recent_phenotype_annotations || [];

  return (
    <main className="recent-phenotypes-page">
      <p className="recent-phenotypes-eyebrow">CGD PHENOTYPES</p>
      <h1>Recent Phenotype Annotations</h1>
      <p className="recent-phenotypes-intro">
        Feature–phenotype associations added to CGD during the last {days} days.
      </p>

      {!data && !error && <p className="recent-phenotypes-status">Loading annotations…</p>}
      {error && <p className="recent-phenotypes-error">{error}</p>}

      {data && (
        <>
          <div className="recent-phenotypes-summary">
            <strong>{data.phenotype_annotations.toLocaleString()}</strong>
            <span>annotation{data.phenotype_annotations === 1 ? '' : 's'} added</span>
          </div>

          {annotations.length > 0 ? (
            <div className="recent-phenotypes-list">
              {annotations.map((annotation) => (
                <article key={annotation.annotation_no} className="recent-phenotype-card">
                  <div>
                    <Link to={`/locus/${encodeURIComponent(annotation.feature_name)}`}>
                      {annotation.gene_name || annotation.feature_name}
                    </Link>
                    {annotation.gene_name && (
                      <span className="recent-phenotype-systematic">{annotation.feature_name}</span>
                    )}
                  </div>
                  <div className="recent-phenotype-observable">
                    {annotation.observable}
                    {annotation.qualifier ? ` — ${annotation.qualifier}` : ''}
                  </div>
                  <div className="recent-phenotype-meta">
                    {annotation.experiment_type} · Added{' '}
                    {new Date(annotation.date_created).toLocaleDateString()}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="recent-phenotypes-status">No phenotype annotations were added in this period.</p>
          )}
        </>
      )}

      <Link to="/phenotype/search" className="recent-phenotypes-browse">
        Browse all phenotype annotations →
      </Link>
    </main>
  );
}

export default RecentPhenotypeAnnotationsPage;
