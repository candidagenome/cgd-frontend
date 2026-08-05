import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import statsApi from '../api/statsApi';
import './RecentOrthologClustersPage.css';

const shortOrganism = (name = '') => name.replace(/^Candida\s+/i, 'C. ');

function RecentOrthologClustersPage() {
  const [searchParams] = useSearchParams();
  const requestedDays = Number.parseInt(searchParams.get('days') || '90', 10);
  const days = Number.isFinite(requestedDays) ? Math.min(Math.max(requestedDays, 1), 365) : 90;
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [appliedQuery, setAppliedQuery] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setError('');
    statsApi.getRecentOrthologClusters({ days, page, limit: 25, query: appliedQuery })
      .then((result) => { if (!cancelled) setData(result); })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.detail || err.message || 'Unable to load clusters');
      });
    return () => { cancelled = true; };
  }, [days, page, appliedQuery]);

  const totalPages = data ? Math.max(1, Math.ceil(data.total_count / data.limit)) : 1;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const submitFilter = (event) => {
    event.preventDefault();
    setPage(1);
    setAppliedQuery(query.trim());
  };

  return (
    <main className="recent-orthologs-page">
      <header>
        <p className="recent-orthologs-eyebrow">CGD ORTHOLOGS</p>
        <h1>Recent Ortholog Cluster Imports</h1>
        <p>{startDate.toLocaleDateString()} to {new Date().toLocaleDateString()}</p>
      </header>

      <section className="recent-orthologs-summary">
        <strong>{data ? data.total_count.toLocaleString() : '—'}</strong>
        <span>computational ortholog clusters imported in the last {days} days</span>
      </section>

      <section className="recent-orthologs-about">
        <div>
          <strong>What is a cluster?</strong>
          <p>A group of genes inferred to be orthologs across <em>Candida</em> species. Select a member gene to open its CGD locus page.</p>
        </div>
        <div>
          <strong>Import methods</strong>
          <p>{data ? Object.entries(data.method_counts).map(([method, count]) => `${method}: ${count.toLocaleString()}`).join(' · ') : 'Loading…'}</p>
        </div>
      </section>

      <section className="recent-orthologs-table-wrap">
        <form className="recent-orthologs-toolbar" onSubmit={submitFilter}>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter by cluster ID, type, or method" aria-label="Filter clusters" />
          <button type="submit">Filter</button>
        </form>
        {error && <p className="recent-orthologs-error">{error}</p>}
        {!data && !error && <p className="recent-orthologs-status">Loading clusters…</p>}
        {data && (
          <>
            <div className="recent-orthologs-scroll">
              <table>
                <thead><tr><th>Cluster</th><th>Member Genes</th><th>Method</th><th>Date Imported</th></tr></thead>
                <tbody>
                  {data.clusters.map((cluster) => (
                    <tr key={cluster.homology_group_no}>
                      <td><strong>{cluster.cluster_id || `Group ${cluster.homology_group_no}`}</strong><span className="recent-orthologs-type">{cluster.group_type} · {cluster.member_count} members</span></td>
                      <td><div className="recent-ortholog-members">{cluster.members.map((member) => <Link key={member.feature_name} to={`/locus/${encodeURIComponent(member.feature_name)}`}><strong>{member.gene_name || member.feature_name}</strong><span>{shortOrganism(member.organism)}</span></Link>)}</div></td>
                      <td>{cluster.method}</td>
                      <td>{new Date(cluster.date_created).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <footer>
              <span>Page {page} of {totalPages}</span>
              <div><button disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button><button disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</button></div>
            </footer>
          </>
        )}
      </section>
      <Link className="recent-orthologs-tool" to="/ortholog-converter">Open the Ortholog Converter →</Link>
    </main>
  );
}

export default RecentOrthologClustersPage;
