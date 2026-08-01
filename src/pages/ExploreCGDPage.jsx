import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import searchApi from '../api/searchApi';
import genomeSnapshotApi from '../api/genomeSnapshotApi';
import referenceApi from '../api/referenceApi';
import statsApi from '../api/statsApi';
import { SPECIES_ORDER, SPECIES_ABBREV } from '../constants/organisms';
import './ExploreCGDPage.css';

// Strain label parsed out of the full organism_name (e.g. "Candida albicans SC5314" -> "SC5314").
const strainOf = (organismName) => {
  const parts = (organismName || '').split(' ');
  return parts.length > 2 ? parts.slice(2).join(' ') : '';
};

// Category cards shown in "Browse by Category". `statKey` maps a card to a live
// total from /api/stats/summary; when present it overrides the fallback `count`.
// Cards without a statKey (Chemicals) have no cheap totals source, so the count
// stays an editable curator-maintained placeholder.
const CATEGORY_CARDS = [
  {
    key: 'genes',
    label: 'Genes',
    dot: '#2563eb',
    statKey: 'genes',
    count: null,
    description: 'Protein-coding and verified ORFs across 6 species',
    examples: ['ACT1', 'ERG11'],
    to: '/feature-search',
  },
  {
    key: 'orthologs',
    label: 'Ortholog Clusters',
    dot: '#7c3aed',
    tag: 'NEW FOR CGD',
    statKey: 'ortholog_clusters',
    count: 6124,
    description: 'Conserved genes across Candida species',
    examples: ['ACT1 cluster', 'ERG11 cluster'],
    to: '/ortholog-converter',
  },
  {
    key: 'references',
    label: 'References',
    dot: '#f97316',
    statKey: 'references',
    count: 85230,
    description: 'Literature and curated sources',
    examples: ['Candida auris outbreak', 'Biofilm review'],
    to: '/literature',
  },
  {
    key: 'phenotypes',
    label: 'Phenotypes',
    dot: '#ec4899',
    statKey: 'phenotype_annotations',
    count: 12840,
    description: 'Morphology, drug resistance, biofilm',
    examples: ['filamentous growth', 'azole resistance'],
    to: '/phenotype/search',
  },
  {
    key: 'biological_processes',
    label: 'GO Annotations',
    dot: '#22c55e',
    statKey: 'go_annotations',
    count: 18210,
    description: 'GO terms, virulence, biofilm formation',
    examples: ['biofilm formation', 'adhesion'],
    to: '/go-slim-mapper',
  },
  {
    key: 'chemicals',
    label: 'Chemicals',
    dot: '#ef4444',
    count: 1450,
    description: 'Antifungals and metabolites',
    examples: ['fluconazole', 'caspofungin'],
    to: '/search/results?query=fluconazole',
  },
];

// Secondary categories shown as compact chips. `statKey` overrides the count
// with a live total where one exists; the rest are placeholders.
const OTHER_CATEGORIES = [
  { label: 'Molecular Functions', count: 11203, to: '/go-slim-mapper' },
  { label: 'Cellular Components', count: 3890, to: '/go-slim-mapper' },
  { label: 'Colleagues', statKey: 'colleagues', count: 4120, to: '/colleague' },
  { label: 'Interactions', statKey: 'interactions', count: 22100, to: '/feature-search' },
  { label: 'Strains', statKey: 'organisms', count: 6, to: '/strains' },
  { label: 'Biofilm Genes', count: 1234, to: '/feature-search' },
];

// Rotating search-box placeholders (genes, ORFs, and Candida-relevant terms),
// cycled while the box is empty — mirrors the SGD Explore page.
const SEARCH_EXAMPLES = [
  'ACT1',
  'ERG11',
  'nuclear pore',
  'HWP1',
  'fluconazole resistance',
  'orf19.2003',
  'EFG1',
  'biofilm formation',
  'CDR1',
  'hyphal growth',
  'BCR1',
  'azole resistance',
];

// "What's New in CGD" highlights. Curator-maintained editorial content.
const WHATS_NEW = [
  { icon: '📖', count: '210 new references', detail: 'curated this week' },
  { icon: '🧪', count: '89 new phenotype annotations', detail: 'drug & biofilm' },
  { icon: '🗂️', count: '45 new ortholog updates', detail: 'C. auris pan-genome' },
];

const ExploreCGDPage = () => {
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const [query, setQuery] = useState('');
  const [organisms, setOrganisms] = useState([]);
  const [geneCounts, setGeneCounts] = useState({}); // organism_abbrev -> haploid_orfs
  // The reference strain gets a highlighted pill; the others are plain links.
  const selectedOrg = 'C_albicans_SC5314';
  const [recentRefs, setRecentRefs] = useState([]);
  const [indexDate, setIndexDate] = useState('July 24, 2026');
  const [exampleIdx, setExampleIdx] = useState(0);
  const [stats, setStats] = useState(null);
  const [geneOfDay, setGeneOfDay] = useState(null);

  // Load the organism list, then the per-species gene counts (haploid ORFs).
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const orgResp = await searchApi.getOrganisms();
        const orgList = orgResp?.organisms || [];
        if (cancelled) return;

        // Order the pills phylogenetically (constants), falling back to API order.
        const ordered = [...orgList].sort((a, b) => {
          const ia = SPECIES_ORDER.indexOf(a.organism_name);
          const ib = SPECIES_ORDER.indexOf(b.organism_name);
          return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
        });
        setOrganisms(ordered);

        const snapshots = await Promise.all(
          ordered.map((org) =>
            genomeSnapshotApi
              .getSnapshot(org.organism_abbrev)
              .then((snap) => ({ abbrev: org.organism_abbrev, snap }))
              .catch(() => ({ abbrev: org.organism_abbrev, snap: null }))
          )
        );
        if (cancelled) return;

        const counts = {};
        let latest = '';
        snapshots.forEach(({ abbrev, snap }) => {
          if (snap) {
            counts[abbrev] = snap.haploid_orfs || snap.total_orfs || 0;
            if (snap.last_updated) latest = snap.last_updated;
          }
        });
        setGeneCounts(counts);
        if (latest) setIndexDate(latest);
      } catch (err) {
        console.error('Failed to load organism data:', err);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Load recently added references (best-effort; empty is fine).
  useEffect(() => {
    let cancelled = false;
    referenceApi
      .getNewPapersThisWeek(90)
      .then((data) => {
        if (!cancelled) setRecentRefs((data?.references || []).slice(0, 4));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Load database-wide totals and the gene of the day (best-effort).
  useEffect(() => {
    let cancelled = false;
    statsApi
      .getSummary()
      .then((data) => {
        if (!cancelled && data?.success !== false) setStats(data);
      })
      .catch(() => {});
    statsApi
      .getGeneOfTheDay()
      .then((data) => {
        if (!cancelled && data?.success !== false) setGeneOfDay(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Prefer the backend's total; fall back to summing the live per-species counts.
  const summedGenes = useMemo(
    () => Object.values(geneCounts).reduce((sum, n) => sum + (n || 0), 0),
    [geneCounts]
  );
  const totalGenes = stats?.genes || summedGenes;

  // Override each card's placeholder count with a live total when statKey resolves.
  const cards = useMemo(
    () =>
      CATEGORY_CARDS.map((c) => {
        const live = c.statKey && stats?.[c.statKey];
        return live ? { ...c, count: live } : c;
      }),
    [stats]
  );

  const otherCategories = useMemo(
    () =>
      OTHER_CATEGORIES.map((o) => {
        const live = o.statKey && stats?.[o.statKey];
        return live ? { ...o, count: live } : o;
      }),
    [stats]
  );

  // Cycle the placeholder through example terms while the box is empty.
  useEffect(() => {
    if (query) return undefined;
    const id = setInterval(() => {
      setExampleIdx((i) => (i + 1) % SEARCH_EXAMPLES.length);
    }, 2500);
    return () => clearInterval(id);
  }, [query]);

  // Cmd/Ctrl-K focuses the search box, matching the ⌘K affordance.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (q) navigate(`/search/results?query=${encodeURIComponent(q)}`);
  };

  const fmt = (n) => (n == null ? '' : n.toLocaleString());
  const speciesCount = organisms.length || 6;

  return (
    <div className="explore-cgd">
      <div className="explore-inner">
        {/* Hero */}
        <header className="explore-hero">
          <h1 className="explore-title">
            Search <em>Candida</em> Genome Database
          </h1>
          <p className="explore-subtitle">
            Explore {totalGenes ? `~${(Math.round(totalGenes / 1000) * 1000).toLocaleString()}` : '~35,000'} genes
            across {speciesCount} species,{' '}
            {stats?.references ? `${stats.references.toLocaleString()}` : '85,000+'} references, and more
          </p>

          <form className="explore-search" onSubmit={handleSearch} role="search">
            <span className="explore-search-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              ref={inputRef}
              type="text"
              className="explore-search-input"
              placeholder={`Try ${SEARCH_EXAMPLES[exampleIdx]}`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search the Candida Genome Database"
            />
            <kbd className="explore-kbd">⌘K</kbd>
            <button type="submit" className="explore-search-btn">Search</button>
          </form>

          <p className="explore-gotd">
            <span className="explore-gotd-dot" aria-hidden="true" /> Gene of the day:{' '}
            <Link
              to={geneOfDay?.link || `/locus/${geneOfDay?.display_name || 'ACT1'}`}
              className="explore-gotd-gene"
            >
              {geneOfDay?.display_name || 'ACT1'}
            </Link>{' '}
            <span className="explore-gotd-desc">
              &mdash; {geneOfDay?.headline || 'Actin; structural constituent of cytoskeleton'}
            </span>
          </p>

          <div className="explore-liveindex">
            <span className="explore-live-dot" aria-hidden="true" />
            <span className="explore-live-label">LIVE INDEX</span>
            <span className="explore-live-sep">|</span>
            CGD is up to date as of {indexDate} &mdash; {speciesCount} reference strains &mdash; start typing to search or browse below
          </div>
        </header>

        {/* Body: main + sidebar */}
        <div className="explore-body">
          <main className="explore-main">
            {/* Browse by organism */}
            <section className="explore-section">
              <div className="explore-section-head">
                <h2 className="explore-section-title">Browse by Organism</h2>
                <span className="explore-section-meta">{speciesCount} strains ·</span>
              </div>
              <div className="explore-org-grid">
                {organisms.map((org) => {
                  const isReference = org.organism_abbrev === selectedOrg;
                  const abbrev = SPECIES_ABBREV[org.organism_name] || org.organism_name;
                  const strain = strainOf(org.organism_name);
                  const count = geneCounts[org.organism_abbrev];
                  return (
                    <Link
                      key={org.organism_abbrev}
                      to={`/genome-snapshot2/${org.organism_abbrev}`}
                      className={`explore-org-pill${isReference ? ' is-selected' : ''}`}
                      title={`View the ${org.organism_name} genome overview`}
                    >
                      <span className={`explore-org-check${isReference ? ' is-on' : ''}`} aria-hidden="true">
                        {isReference ? '✓' : ''}
                      </span>
                      <em className="explore-org-name">{abbrev}</em>
                      {strain && <span className="explore-org-strain">{strain}</span>}
                      {count != null && (
                        <span className="explore-org-count">{fmt(count)} genes</span>
                      )}
                      <span className="explore-org-go" aria-hidden="true">↗</span>
                    </Link>
                  );
                })}
              </div>
              <p className="explore-org-note">
                Click an organism to open its genome overview.{' '}
                {strainOf(
                  organisms.find((o) => o.organism_abbrev === selectedOrg)?.organism_name || ''
                ) || 'SC5314'}{' '}
                is the reference strain.
              </p>
            </section>

            {/* Browse by category */}
            <section className="explore-section">
              <h2 className="explore-section-title">Browse by Category</h2>
              <div className="explore-card-grid">
                {cards.map((c) => (
                  <Link key={c.key} to={c.to} className="explore-card">
                    <div className="explore-card-top">
                      <span className="explore-card-dot" style={{ background: c.dot }} aria-hidden="true" />
                      <span className="explore-card-label">{c.label}</span>
                      {c.tag && <span className="explore-card-tag">{c.tag}</span>}
                      <span className="explore-card-count">{fmt(c.count)}</span>
                    </div>
                    <p className="explore-card-desc">{c.description}</p>
                    <div className="explore-card-examples">
                      {c.examples.map((ex) => (
                        <span key={ex} className="explore-chip">{ex}</span>
                      ))}
                    </div>
                    <div className="explore-card-foot">
                      <span className="explore-card-strains">1 strains</span>
                      <span className="explore-card-browse">Browse all ↗</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* Other categories */}
            <section className="explore-section">
              <h3 className="explore-other-title">Other Categories</h3>
              <div className="explore-other-chips">
                {otherCategories.map((o) => (
                  <Link key={o.label} to={o.to} className="explore-other-chip">
                    {o.label} <span className="explore-other-count">{fmt(o.count)}</span>
                  </Link>
                ))}
              </div>
            </section>
          </main>

          {/* Sidebar */}
          <aside className="explore-sidebar">
            <div className="explore-panel">
              <h3 className="explore-panel-title">
                <span className="explore-panel-bar" aria-hidden="true" /> WHAT'S NEW IN CGD
              </h3>
              <ul className="explore-news">
                {WHATS_NEW.map((n) => (
                  <li key={n.count} className="explore-news-item">
                    <span className="explore-news-icon" aria-hidden="true">{n.icon}</span>
                    <span className="explore-news-text">
                      <strong>{n.count}</strong>
                      <span className="explore-news-detail">{n.detail}</span>
                    </span>
                    <span className="explore-news-dot" aria-hidden="true" />
                  </li>
                ))}
              </ul>

              <div className="explore-recent-head">
                <span>RECENTLY ADDED REFERENCES</span>
                <Link to="/literature" className="explore-recent-viewall">View all →</Link>
              </div>
              <ul className="explore-recent">
                {recentRefs.length > 0 ? (
                  recentRefs.map((ref) => (
                    <li key={ref.reference_no} className="explore-recent-item">
                      <Link to={`/reference/${ref.pubmed || ref.reference_no}`} className="explore-recent-cite">
                        {ref.citation || ref.title}
                      </Link>
                    </li>
                  ))
                ) : (
                  <li className="explore-recent-empty">
                    New references appear here as they are curated.
                  </li>
                )}
              </ul>
            </div>

            <div className="explore-blast">
              <div className="explore-blast-head">🔬 Need to identify a gene?</div>
              <p className="explore-blast-body">
                Paste a sequence for BLAST across {speciesCount} reference strains, or try the ortholog browser.
              </p>
              <div className="explore-blast-actions">
                <Link to="/blast" className="explore-blast-btn is-primary">BLAST</Link>
                <Link to="/ortholog-converter" className="explore-blast-btn">Ortholog browser</Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ExploreCGDPage;
