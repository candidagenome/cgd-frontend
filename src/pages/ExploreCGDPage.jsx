import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
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
    icon: '🧬',
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
    icon: '🔗',
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
    icon: '📚',
    statKey: 'references',
    count: 85230,
    description: 'Literature and curated sources',
    examples: ['Candida auris outbreak', 'Biofilm review'],
    to: '/browse/references',
  },
  {
    key: 'phenotypes',
    label: 'Phenotypes',
    dot: '#ec4899',
    icon: '🔬',
    statKey: 'phenotype_annotations',
    count: 12840,
    description: 'Morphology, drug resistance, biofilm',
    examples: ['filamentous growth', 'azole resistance'],
    to: '/phenotype/recent?days=90',
  },
  {
    key: 'biological_processes',
    label: 'GO Annotations',
    dot: '#22c55e',
    icon: '🌿',
    statKey: 'go_annotations',
    count: 18210,
    description: 'GO terms, virulence, biofilm formation',
    examples: ['biofilm formation', 'adhesion'],
    to: '/browse/biological-processes',
  },
  // Chemicals are hidden until CGD has a dedicated chemical explorer and a
  // reliable backend total. A generic search link made this card misleading.
  // {
  //   key: 'chemicals',
  //   label: 'Chemicals',
  //   dot: '#ef4444',
  //   icon: '💊',
  //   count: null,
  //   description: 'Antifungals and metabolites',
  //   examples: ['fluconazole', 'caspofungin'],
  //   to: '/browse/chemicals',
  // },
];

// Secondary categories shown as compact chips. `statKey` overrides the count
// with a live total where one exists; the rest are placeholders.
const OTHER_CATEGORIES = [
  { label: 'Molecular Functions', to: '/browse/molecular-functions', organismAware: true },
  { label: 'Cellular Components', to: '/browse/cellular-components', organismAware: true },
  { label: 'Colleagues', statKey: 'colleagues', count: 4120, to: '/colleague' },
  { label: 'Interactions', statKey: 'interactions', count: 22100, to: '/browse/interactions', organismAware: true },
  { label: 'Strains', statKey: 'organisms', count: 6, to: '/strains' },
  { label: 'Biofilm Genes', to: '/virulence-factor-browser?categories=biofilm', organismAware: true },
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
  'Candida auris',
  'PMID: 39177371',
];

// "What's New in CGD" highlights. Curator-maintained editorial content.
const WHATS_NEW = [
  {
    key: 'references',
    icon: '📖',
    singular: 'new reference',
    plural: 'new references',
    to: '/reference/NewPapersThisWeek?days=90',
  },
  {
    key: 'phenotype_annotations',
    icon: '🧪',
    singular: 'new phenotype annotation',
    plural: 'new phenotype annotations',
    to: '/phenotype/search',
  },
  {
    key: 'ortholog_clusters',
    icon: '🗂️',
    singular: 'new ortholog cluster',
    plural: 'new ortholog clusters',
    to: '/ortholog-converter',
  },
];

const ExploreCGDPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const inputRef = useRef(null);

  const [query, setQuery] = useState('');
  const [organisms, setOrganisms] = useState([]);
  const [geneCounts, setGeneCounts] = useState({}); // organism_abbrev -> haploid_orfs
  // null = "All species" (global totals); otherwise an organism_abbrev to filter by.
  const selectedOrg = searchParams.get('organism') || null;
  const [countsByOrg, setCountsByOrg] = useState({});
  const [recentRefs, setRecentRefs] = useState([]);
  const [indexDate, setIndexDate] = useState('July 24, 2026');
  const [exampleIdx, setExampleIdx] = useState(0);
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState(null);
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
        if (!cancelled) setRecentRefs((data?.references || []).slice(0, 3));
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
      .getRecentActivity(90)
      .then((data) => {
        if (!cancelled && data?.success !== false) setRecentActivity(data);
      })
      .catch(() => {});
    statsApi
      .getGeneOfTheDay()
      .then((data) => {
        if (!cancelled && data?.success !== false) setGeneOfDay(data);
      })
      .catch(() => {});
    statsApi
      .getCountsByOrganism()
      .then((data) => {
        if (!cancelled && data?.by_organism) setCountsByOrg(data.by_organism);
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

  // Counts driving the category cards: the selected organism's totals when a
  // filter is active, otherwise the global summary.
  const activeCounts = useMemo(
    () => (selectedOrg ? countsByOrg[selectedOrg] : stats) || {},
    [selectedOrg, countsByOrg, stats]
  );

  const selectedOrgName = useMemo(
    () => organisms.find((o) => o.organism_abbrev === selectedOrg)?.organism_name || '',
    [organisms, selectedOrg]
  );

  const selectedOrgLabel = useMemo(() => {
    const org = organisms.find((o) => o.organism_abbrev === selectedOrg);
    if (!org) return '';
    const species = SPECIES_ABBREV[org.organism_name] || org.organism_name;
    const strain = strainOf(org.organism_name);
    return strain ? `${species} ${strain}` : species;
  }, [organisms, selectedOrg]);

  // Drop stale/invalid organism parameters once the live organism list is known.
  useEffect(() => {
    if (!selectedOrg || organisms.length === 0) return;
    if (!organisms.some((org) => org.organism_abbrev === selectedOrg)) {
      setSearchParams({}, { replace: true });
    }
  }, [selectedOrg, organisms, setSearchParams]);

  const selectOrganism = (organismAbbrev) => {
    const next = organismAbbrev === selectedOrg ? null : organismAbbrev;
    setSearchParams(next ? { organism: next } : {});
  };

  const scopedDestination = (card) => {
    if (!selectedOrg) return card.to;
    // These destinations currently understand organism abbreviations.
    if (card.key === 'genes' || card.key === 'phenotypes') {
      const separator = card.to.includes('?') ? '&' : '?';
      return `${card.to}${separator}organism=${encodeURIComponent(selectedOrg)}`;
    }
    if (card.to.startsWith('/browse/')) {
      return `${card.to}?organism=${encodeURIComponent(selectedOrg)}`;
    }
    return card.to;
  };

  const withOrganism = (destination, value = selectedOrg) => {
    if (!value) return destination;
    const separator = destination.includes('?') ? '&' : '?';
    return `${destination}${separator}organism=${encodeURIComponent(value)}`;
  };

  const exampleDestination = (card, example) => {
    if (card.key === 'genes') {
      return withOrganism(`/search/results?query=${encodeURIComponent(example)}`, selectedOrgName);
    }
    if (card.key === 'orthologs') {
      return `/ortholog-converter?gene=${encodeURIComponent(example.replace(/ cluster$/i, ''))}`;
    }
    if (card.key === 'references') {
      return `/search/text/results?query=${encodeURIComponent(example)}&search_field=paper_titles&match_mode=all`;
    }
    if (card.key === 'phenotypes') {
      return withOrganism(`/phenotype/search?query=${encodeURIComponent(example)}`);
    }
    return `/search/text/results?query=${encodeURIComponent(example)}&search_field=go_terms&match_mode=all`;
  };

  const otherDestination = (category) => {
    if (!selectedOrg || !category.organismAware) return category.to;
    return withOrganism(category.to);
  };

  // Resolve a category's count: prefer the active (filtered or global) scope,
  // fall back to the global summary for keys absent from per-organism data
  // (e.g. colleagues), and finally to the curator placeholder.
  const { cards, otherCategories } = useMemo(() => {
    const resolve = (statKey, placeholder) => {
      if (!statKey) return placeholder;
      if (activeCounts[statKey] != null) return activeCounts[statKey];
      if (stats?.[statKey] != null) return stats[statKey];
      return placeholder;
    };
    return {
      cards: CATEGORY_CARDS.map((c) => ({ ...c, count: resolve(c.statKey, c.count) })),
      otherCategories: OTHER_CATEGORIES.map((o) => ({ ...o, count: resolve(o.statKey, o.count) })),
    };
  }, [activeCounts, stats]);

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
    if (q) {
      const params = new URLSearchParams({ query: q });
      if (selectedOrgName) params.set('organism', selectedOrgName);
      navigate(`/search/results?${params.toString()}`);
    }
  };

  const fmt = (n) => (n == null ? '' : n.toLocaleString());
  const speciesCount = organisms.length || 6;

  return (
    <div className="explore-cgd">
      <div className="explore-inner">
        {/* Hero */}
        <header className="explore-hero">
          <h1 className="explore-title">
            Explore <em>Candida</em> Genome Database
          </h1>
          <p className="explore-tagline">
            Curated genomic, functional, and literature data for six medically
            important <em>Candida</em> species.
          </p>
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
            Updated {indexDate} · {speciesCount} reference strains indexed
          </div>
        </header>

        {/* Body: main + sidebar */}
        <div className="explore-body">
          <main className="explore-main">
            {/* Browse by organism */}
            <section className="explore-section">
              <div className="explore-section-head">
                <h2 className="explore-section-title">Browse by Organism</h2>
                {selectedOrg ? (
                  <div className="explore-org-actions">
                    <Link to={`/genome-snapshot2/${selectedOrg}`}>View {selectedOrgLabel} overview →</Link>
                    <button
                      type="button"
                      className="explore-clear-filter"
                      onClick={() => setSearchParams({})}
                    >
                      Clear filter <span aria-hidden="true">×</span>
                    </button>
                  </div>
                ) : (
                  <span className="explore-section-meta">Select an organism to filter counts</span>
                )}
              </div>
              <div className="explore-org-grid">
                {organisms.map((org) => {
                  const isSelected = org.organism_abbrev === selectedOrg;
                  const abbrev = SPECIES_ABBREV[org.organism_name] || org.organism_name;
                  const strain = strainOf(org.organism_name);
                  const count = geneCounts[org.organism_abbrev];
                  return (
                    <div
                      key={org.organism_abbrev}
                      className={`explore-org-pill${isSelected ? ' is-selected' : ''}`}
                    >
                      <button
                        type="button"
                        className="explore-org-select"
                        onClick={() => selectOrganism(org.organism_abbrev)}
                        aria-pressed={isSelected}
                        title={`Filter all category counts by ${org.organism_name}`}
                      >
                        <span className={`explore-org-check${isSelected ? ' is-on' : ''}`} aria-hidden="true">
                          {isSelected ? '✓' : ''}
                        </span>
                        <em className="explore-org-name">{abbrev}</em>
                        {strain && <span className="explore-org-strain">{strain}</span>}
                        {count != null && (
                          <span className="explore-org-count">{fmt(count)} genes</span>
                        )}
                      </button>
                      <Link
                        className="explore-org-go"
                        to={`/genome-snapshot2/${org.organism_abbrev}`}
                        title={`Open the ${org.organism_name} genome overview`}
                        aria-label={`Open ${org.organism_name} genome overview`}
                      >
                        Overview <span aria-hidden="true">↗</span>
                      </Link>
                    </div>
                  );
                })}
              </div>
              {!selectedOrg && (
                <p className="explore-org-note">
                  Select a row to update category counts; use ↗ to open its genome overview.
                </p>
              )}
            </section>

            {/* Browse by category */}
            <section className="explore-section">
              <div className="explore-section-head">
                <h2 className="explore-section-title">Browse by Category</h2>
                {selectedOrg && <span className="explore-section-meta">Counts for <em>{selectedOrgLabel}</em></span>}
              </div>
              <div className="explore-card-grid">
                {cards.map((c) => (
                  <article key={c.key} className="explore-card">
                    <div className="explore-card-top">
                      <span
                        className="explore-card-icon"
                        style={{ background: `${c.dot}1a`, color: c.dot }}
                        aria-hidden="true"
                      >
                        {c.icon}
                      </span>
                      <Link className="explore-card-label" to={scopedDestination(c)}>{c.label}</Link>
                      {c.tag && <span className="explore-card-tag">{c.tag}</span>}
                      <span className="explore-card-count">{fmt(c.count)}</span>
                    </div>
                    <p className="explore-card-desc">
                      {selectedOrg && c.key === 'genes'
                        ? 'Protein-coding and verified ORFs in this reference genome'
                        : c.description}
                    </p>
                    <div className="explore-card-examples">
                      {c.examples.map((ex) => (
                        <Link key={ex} className="explore-chip" to={exampleDestination(c, ex)}>{ex}</Link>
                      ))}
                    </div>
                    <div className="explore-card-foot">
                      <Link className="explore-card-browse" to={scopedDestination(c)}>Browse all ↗</Link>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {/* Other categories */}
            <section className="explore-section">
              <h3 className="explore-other-title">Other Categories</h3>
              <div className="explore-other-chips">
                {otherCategories.map((o) => (
                  <Link key={o.label} to={otherDestination(o)} className="explore-other-chip">
                    {o.label}
                    {o.count != null && <span className="explore-other-count">{fmt(o.count)}</span>}
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
                  <li key={n.key}>
                    <Link to={n.to} className="explore-news-item">
                      <span className="explore-news-icon" aria-hidden="true">{n.icon}</span>
                      <span className="explore-news-text">
                        <strong>
                          {recentActivity
                            ? `${fmt(recentActivity[n.key])} ${recentActivity[n.key] === 1 ? n.singular : n.plural}`
                            : `Recent ${n.plural.replace(/^new /, '')}`}
                        </strong>
                        <span className="explore-news-detail">added in the last 90 days</span>
                      </span>
                      <span className="explore-news-arrow" aria-hidden="true">→</span>
                    </Link>
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
