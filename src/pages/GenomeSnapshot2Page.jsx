import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import genomeSnapshotApi from '../api/genomeSnapshotApi';
import './InfoPages.css';
import './GenomeSnapshot2Page.css';

/**
 * Genome Snapshot 2 — an "explore this genome" dashboard.
 *
 * Every headline number, table row, chart element and chromosome leads to the
 * underlying genes/annotations (Advanced Search, GO term pages, chromosome
 * pages, JBrowse). This is an enhanced, fully interactive alternative to the
 * classic /genome-snapshot page and reuses the same backend API.
 */

// ---------------------------------------------------------------------------
// Static reference data
// ---------------------------------------------------------------------------

const ASSEMBLY_REFERENCES = {
  C_albicans_SC5314: [{ pmid: '24025428', assembly: 'Assembly 22' }],
  C_auris_B8441: [
    { pmid: '39177371', assembly: 'Nuclear Genome' },
    { pmid: '33193142', assembly: 'Mitochondrial Genome' },
  ],
  C_glabrata_CBS138: [{ pmid: '32068314', assembly: 'Current Assembly' }],
  C_parapsilosis_CDC317: [{ pmid: '22192698', assembly: 'Current Assembly' }],
  C_dubliniensis_CD36: [{ pmid: '19745113', assembly: 'Current Assembly' }],
  C_tropicalis: [{ pmid: '32469306', assembly: 'Current Assembly' }],
  C_tropicalis_MYA3404: [{ pmid: '32469306', assembly: 'Current Assembly' }],
};

// Shared browsing-context name so every cross-page link opens in (and reuses)
// a single secondary tab rather than navigating away from the dashboard.
const LINK_TARGET = 'cgdExplore';

// JBrowse deep-links copied verbatim from the JBrowse navigation menu so the
// "View in JBrowse" links land on the same assembly / location / tracks.
const JBROWSE_LINKS = {
  C_albicans_SC5314: '/jbrowse2/?assembly=C_albicans_SC5314&loc=Ca22chr1A_C_albicans_SC5314:115518..129521&tracks=DNA,TranscribedFeatures',
  C_auris_B8441: '/jbrowse2/?assembly=C_auris_B8441&loc=Chr4_C_auris_B8441:120307..131992&tracks=C_auris_B8441-ReferenceSequenceTrack,C_auris_B8441_features.sorted.gff',
  C_dubliniensis_CD36: '/jbrowse2/?assembly=C_dubliniensis_CD36&loc=Chr1_C_dubliniensis_CD36:131096..145475&tracks=C_dubliniensis_CD36-ReferenceSequenceTrack,C_dubliniensis_CD36_features.sorted.gff',
  C_glabrata_CBS138: '/jbrowse2/?assembly=C_glabrata_CBS138&loc=ChrA_C_glabrata_CBS138:1..100000&tracks=C_glabrata_CBS138-ReferenceSequenceTrack,C_glabrata_CBS138_features.sorted.gff',
  C_parapsilosis_CDC317: '/jbrowse2/?assembly=C_parapsilosis_CDC317&loc=Contig005504_C_parapsilosis_CDC317:1..100000&tracks=C_parapsilosis_CDC317-ReferenceSequenceTrack,C_parapsilosis_CDC317_features.sorted.gff',
  C_tropicalis: '/jbrowse2/?assembly=C_tropicalis_MYA3404&loc=CP047869.1:1..100000&tracks=C_tropicalis_MYA3404-ReferenceSequenceTrack,C_tropicalis_features.sorted.gff',
  C_tropicalis_MYA3404: '/jbrowse2/?assembly=C_tropicalis_MYA3404&loc=CP047869.1:1..100000&tracks=C_tropicalis_MYA3404-ReferenceSequenceTrack,C_tropicalis_features.sorted.gff',
};

// Short explanations reused for tooltips and help drawers.
const EXPLAIN = {
  verified: 'An ORF with experimental evidence that it encodes a protein.',
  uncharacterized: 'A likely protein-coding ORF whose function has not yet been experimentally determined.',
  dubious: 'An ORF that is unlikely to encode a functional protein.',
  total_orfs: 'All open reading frames annotated in the genome (Verified + Uncharacterized + Dubious).',
  go: 'Total Gene Ontology annotations across Molecular Function, Cellular Component and Biological Process.',
  trna: 'Transfer RNA genes.',
  molecular_function: 'What the gene product does at the molecular level (e.g. "transferase activity").',
  cellular_component: 'Where in the cell the gene product acts (e.g. "nucleus").',
  biological_process: 'The larger biological objective the gene product contributes to (e.g. "DNA replication").',
};

// Feature categories used by the inventory filter.
const CATEGORY_PROTEIN = 'protein';
const CATEGORY_RNA = 'rna';
const CATEGORY_REPEAT = 'repeats';
const CATEGORY_OTHER = 'other';

const CATEGORY_LABELS = {
  all: 'All features',
  [CATEGORY_PROTEIN]: 'Protein-coding',
  [CATEGORY_RNA]: 'RNA',
  [CATEGORY_REPEAT]: 'Repeats',
  [CATEGORY_OTHER]: 'Other',
};

// Ordered inventory row definitions. `field` reads from the snapshot payload;
// `search` builds the Advanced Search query string used for the row link.
const INVENTORY_DEFS = [
  { key: 'total_orfs', label: 'Total ORFs', category: CATEGORY_PROTEIN, field: 'total_orfs', haploidField: 'haploid_orfs', search: 'featuretype=ORF', always: true },
  { key: 'verified', label: 'Verified ORFs', category: CATEGORY_PROTEIN, field: 'verified_orfs', search: 'qualifier=Verified&featuretype=ORF' },
  { key: 'uncharacterized', label: 'Uncharacterized ORFs', category: CATEGORY_PROTEIN, field: 'uncharacterized_orfs', search: 'qualifier=Uncharacterized&featuretype=ORF' },
  { key: 'dubious', label: 'Dubious ORFs', category: CATEGORY_PROTEIN, field: 'dubious_orfs', search: 'qualifier=Dubious&featuretype=ORF' },
  { key: 'trna', label: 'tRNA', category: CATEGORY_RNA, field: 'trna_count', search: 'featuretype=tRNA' },
  { key: 'snorna', label: 'snoRNA', category: CATEGORY_RNA, field: 'snorna_count', search: 'featuretype=snoRNA' },
  { key: 'snrna', label: 'snRNA', category: CATEGORY_RNA, field: 'snrna_count', search: 'featuretype=snRNA' },
  { key: 'rrna', label: 'rRNA', category: CATEGORY_RNA, field: 'rrna_count', search: 'featuretype=rRNA' },
  { key: 'ncrna', label: 'ncRNA', category: CATEGORY_RNA, field: 'ncrna_count', search: 'featuretype=ncRNA' },
  { key: 'ltr', label: 'Long terminal repeat', category: CATEGORY_REPEAT, field: 'ltr_count', search: 'featuretype=long_terminal_repeat' },
  { key: 'repeat_region', label: 'Repeat region', category: CATEGORY_REPEAT, field: 'repeat_region_count', search: 'featuretype=repeat_region' },
  { key: 'retrotransposon', label: 'Retrotransposon', category: CATEGORY_REPEAT, field: 'retrotransposon_count', search: 'featuretype=retrotransposon' },
  { key: 'centromere', label: 'Centromere', category: CATEGORY_OTHER, field: 'centromere_count', search: 'featuretype=centromere' },
  { key: 'pseudogene', label: 'Pseudogenes', category: CATEGORY_OTHER, field: 'pseudogene_count', search: 'featuretype=pseudogene' },
  { key: 'blocked', label: 'Blocked reading frame', category: CATEGORY_OTHER, field: 'blocked_reading_frame_count', search: 'featuretype=blocked_reading_frame' },
];

const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'genome-inventory', label: 'Genome Inventory' },
  { id: 'chromosomes', label: 'Chromosomes' },
  { id: 'go-annotations', label: 'GO Annotations' },
  { id: 'go-categories', label: 'GO Categories' },
  { id: 'comparison', label: 'Compare' },
  { id: 'related-tools', label: 'Related Tools' },
];

const GO_ASPECTS = [
  { key: 'molecular_function', label: 'Molecular Function', color: '#4169E1' },
  { key: 'cellular_component', label: 'Cellular Component', color: '#228B22' },
  { key: 'biological_process', label: 'Biological Process', color: '#DC143C' },
];

// ORF slice styling shared between the pie chart and its legend.
const ORF_SLICES_META = [
  { key: 'verified', label: 'Verified', color: '#4169E1', pattern: 'diag', qualifier: 'Verified' },
  { key: 'uncharacterized', label: 'Uncharacterized', color: '#228B22', pattern: 'dots', qualifier: 'Uncharacterized' },
  { key: 'dubious', label: 'Dubious', color: '#DC143C', pattern: 'cross', qualifier: 'Dubious' },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmt(n) {
  return (n ?? 0).toLocaleString();
}

function featureSearchUrl(organism, query) {
  return `/feature-search/results?organism=${organism}&${query}`;
}

function jbrowseMenuUrl(organism) {
  return JBROWSE_LINKS[organism] || '/jbrowse2/';
}

// JBrowse assembly name (differs from the CGD organism abbrev for C. tropicalis).
function jbrowseAssembly(organism) {
  return organism === 'C_tropicalis' ? 'C_tropicalis_MYA3404' : organism;
}

function downloadCsv(filename, rows) {
  const csv = rows
    .map((r) => r.map((cell) => {
      const s = String(cell ?? '');
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    }).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Apply the organism-specific chromosome relabelling used by the classic page.
function normalizeChromosomes(organism, chromosomes) {
  if (!chromosomes) return [];
  if (organism === 'C_albicans_SC5314') {
    return chromosomes
      .filter((chr) => !chr.chromosome_display.endsWith('B'))
      .map((chr) => ({
        ...chr,
        chromosome_display: chr.chromosome_display.endsWith('A')
          ? chr.chromosome_display.slice(0, -1)
          : chr.chromosome_display,
      }));
  }
  if (organism === 'C_glabrata_CBS138') {
    return chromosomes.map((chr) => {
      if (chr.chromosome_display === 'Mito' && chr.chromosome !== 'mito_C_glabrata_CBS138') {
        return { ...chr, chromosome_display: 'ChrM' };
      }
      if (chr.chromosome === 'mito_C_glabrata_CBS138') {
        return { ...chr, chromosome_display: 'Mito' };
      }
      return chr;
    });
  }
  return chromosomes;
}

// ---------------------------------------------------------------------------
// Small shared UI pieces
// ---------------------------------------------------------------------------

function HelpDrawer({ title, children }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="gs2-help">
      <button
        type="button"
        className="gs2-help-toggle"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        title="What do these numbers mean?"
      >
        ? {title || 'What do these numbers mean?'}
      </button>
      {open && <div className="gs2-help-body" role="note">{children}</div>}
    </span>
  );
}

function Tooltip({ tip }) {
  if (!tip) return null;
  return (
    <div className="gs2-tooltip" style={{ left: tip.x + 14, top: tip.y + 14 }} role="tooltip">
      <div className="gs2-tooltip-title">{tip.title}</div>
      {tip.lines.map((l, i) => <div key={i}>{l}</div>)}
      {tip.action && <div className="gs2-tooltip-action">{tip.action}</div>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Interactive ORF pie chart
// ---------------------------------------------------------------------------

function OrfPieChart({ counts, organism, organismName, mode, onTip }) {
  const size = 300;
  const radius = 120;
  const cx = size / 2;
  const cy = size / 2;

  const slices = ORF_SLICES_META
    .map((meta) => ({ ...meta, value: counts[meta.key] || 0 }))
    .filter((s) => s.value > 0);
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  if (total === 0) return null;

  const go = (qualifier) => {
    window.open(featureSearchUrl(organism, `qualifier=${qualifier}&featuretype=ORF`), LINK_TARGET);
  };

  const arcs = [];
  let angle = -90;
  slices.forEach((slice) => {
    const sweep = (slice.value / total) * 360;
    const start = angle;
    const end = angle + sweep;
    const sr = (start * Math.PI) / 180;
    const er = (end * Math.PI) / 180;
    const x1 = cx + radius * Math.cos(sr);
    const y1 = cy + radius * Math.sin(sr);
    const x2 = cx + radius * Math.cos(er);
    const y2 = cy + radius * Math.sin(er);
    const largeArc = sweep > 180 ? 1 : 0;
    const mid = ((start + end) / 2) * (Math.PI / 180);
    const lr = radius * 0.62;
    arcs.push({
      ...slice,
      path: total === slice.value
        ? null
        : `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`,
      labelX: cx + lr * Math.cos(mid),
      labelY: cy + lr * Math.sin(mid),
      pct: (slice.value / total) * 100,
    });
    angle = end;
  });

  const sliceLabel = (a) => (mode === 'count' ? fmt(a.value) : `${a.pct.toFixed(1)}%`);

  const handleMove = (e, a) => {
    onTip({
      x: e.clientX,
      y: e.clientY,
      title: `${a.label} ORFs`,
      lines: [
        `${fmt(a.value)} ORFs (${a.pct.toFixed(1)}%)`,
        EXPLAIN[a.key],
      ],
      action: 'Click to view these genes →',
    });
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={`ORF distribution for ${organismName}: ${slices.map((s) => `${s.label} ${fmt(s.value)}`).join(', ')}`}
    >
      <defs>
        <pattern id="gs2-diag" patternUnits="userSpaceOnUse" width="8" height="8">
          <path d="M0,8 l8,-8 M-2,2 l4,-4 M6,10 l4,-4" stroke="#fff" strokeWidth="1.2" opacity="0.6" />
        </pattern>
        <pattern id="gs2-dots" patternUnits="userSpaceOnUse" width="8" height="8">
          <circle cx="2" cy="2" r="1.3" fill="#fff" opacity="0.6" />
        </pattern>
        <pattern id="gs2-cross" patternUnits="userSpaceOnUse" width="8" height="8">
          <path d="M0,0 l8,8 M8,0 l-8,8" stroke="#fff" strokeWidth="1" opacity="0.5" />
        </pattern>
      </defs>
      {arcs.map((a) => {
        const shared = {
          fill: a.color,
          stroke: '#fff',
          strokeWidth: 2,
          tabIndex: 0,
          role: 'button',
          'aria-label': `${a.label}: ${fmt(a.value)} ORFs, ${a.pct.toFixed(1)} percent. Activate to view genes.`,
          className: 'gs2-pie-slice',
          onClick: () => go(a.qualifier),
          onKeyDown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(a.qualifier); } },
          onMouseMove: (e) => handleMove(e, a),
          onMouseLeave: () => onTip(null),
        };
        return a.path ? (
          <g key={a.key}>
            <path d={a.path} {...shared} />
            <path d={a.path} fill={`url(#gs2-${a.pattern})`} pointerEvents="none" />
          </g>
        ) : (
          <g key={a.key}>
            <circle cx={cx} cy={cy} r={radius} {...shared} />
            <circle cx={cx} cy={cy} r={radius} fill={`url(#gs2-${a.pattern})`} pointerEvents="none" />
          </g>
        );
      })}
      {arcs.map((a) => (a.pct >= 5 || arcs.length === 1) && (
        <text
          key={`t-${a.key}`}
          x={a.path ? a.labelX : cx}
          y={a.path ? a.labelY : cy}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#fff"
          fontSize="13"
          fontWeight="bold"
          pointerEvents="none"
        >
          {sliceLabel(a)}
        </text>
      ))}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Interactive GO Slim bar chart
// ---------------------------------------------------------------------------

function GoBarChart({ aspect, color, mode, limit, filter, onTip }) {
  if (!aspect || !aspect.categories || aspect.categories.length === 0) {
    return <p className="gs2-muted">No data available.</p>;
  }

  let cats = aspect.categories.slice();
  if (filter.trim()) {
    const q = filter.toLowerCase().trim();
    cats = cats.filter((c) => c.go_term.toLowerCase().includes(q) || c.goid.toLowerCase().includes(q));
  }
  const valueOf = (c) => (mode === 'count' ? (c.count || 0) : (c.percentage || 0));
  cats.sort((a, b) => valueOf(b) - valueOf(a));
  if (limit !== 'all') cats = cats.slice(0, Number(limit));

  if (cats.length === 0) return <p className="gs2-muted">No categories match "{filter}".</p>;

  const maxValue = Math.max(...cats.map(valueOf), 1);
  const chartWidth = 760;
  const barHeight = 22;
  const gap = 4;
  const labelWidth = 260;
  const barArea = chartWidth - labelWidth - 70;
  const chartHeight = cats.length * (barHeight + gap) + 10;

  const go = (goid) => { window.open(`/go/${goid}`, LINK_TARGET); };

  return (
    <svg
      width={chartWidth}
      height={chartHeight}
      viewBox={`0 0 ${chartWidth} ${chartHeight}`}
      role="img"
      aria-label={`${aspect.aspect_name || 'GO'} distribution, ${cats.length} categories`}
    >
      {cats.map((c, i) => {
        const v = valueOf(c);
        const y = i * (barHeight + gap) + 4;
        const w = (v / maxValue) * barArea;
        const label = c.go_term.length > 38 ? c.go_term.slice(0, 35) + '…' : c.go_term;
        const valueText = mode === 'count' ? fmt(c.count) : `${(c.percentage || 0).toFixed(1)}%`;
        const move = (e) => onTip({
          x: e.clientX,
          y: e.clientY,
          title: c.go_term,
          lines: [
            `${c.goid}`,
            `${fmt(c.count)} genes (${(c.percentage || 0).toFixed(1)}% of annotated)`,
          ],
          action: 'Click to open this GO category →',
        });
        return (
          <g
            key={c.goid}
            className="gs2-bar-row"
            tabIndex={0}
            role="button"
            aria-label={`${c.go_term}, ${fmt(c.count)} genes, ${(c.percentage || 0).toFixed(1)} percent. Activate to open GO category.`}
            onClick={() => go(c.goid)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(c.goid); } }}
            onMouseMove={move}
            onMouseLeave={() => onTip(null)}
          >
            <rect x={0} y={y} width={chartWidth} height={barHeight} fill="transparent" />
            <text x={labelWidth - 10} y={y + barHeight / 2 + 4} textAnchor="end" fontSize="11" fill="#1976d2" className="gs2-bar-label">
              {label}
            </text>
            <rect x={labelWidth} y={y} width={Math.max(w, 1)} height={barHeight} fill={color} rx="2" />
            <text x={labelWidth + Math.max(w, 1) + 8} y={y + barHeight / 2 + 4} fontSize="11" fill="#333">
              {valueText}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Sticky section navigation
// ---------------------------------------------------------------------------

function SectionNav({ active }) {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  return (
    <nav className="gs2-section-nav" aria-label="Section navigation">
      {SECTIONS.map((s) => (
        <button
          key={s.id}
          type="button"
          className={active === s.id ? 'gs2-nav-item active' : 'gs2-nav-item'}
          onClick={() => scrollTo(s.id)}
        >
          {s.label}
        </button>
      ))}
    </nav>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

function GenomeSnapshot2Page() {
  const { organism } = useParams();

  const [data, setData] = useState(null);
  const [organisms, setOrganisms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [goSlimData, setGoSlimData] = useState(null);
  const [goSlimLoading, setGoSlimLoading] = useState(false);
  const [chrInventory, setChrInventory] = useState(null);
  const [chrInventoryLoading, setChrInventoryLoading] = useState(false);

  // Interaction state
  const [tip, setTip] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [showTop, setShowTop] = useState(false);

  // ORF chart
  const [pieMode, setPieMode] = useState('percentage');

  // Inventory table controls
  const [invSearch, setInvSearch] = useState('');
  const [invCategory, setInvCategory] = useState('all');
  const [invSort, setInvSort] = useState({ key: 'total', dir: 'desc' });

  // GO categories controls
  const [goTab, setGoTab] = useState('molecular_function');
  const [goMode, setGoMode] = useState('percentage');
  const [goLimit, setGoLimit] = useState('10');
  const [goFilter, setGoFilter] = useState('');

  // Chromosome interaction
  const [selectedChrs, setSelectedChrs] = useState([]);

  // Comparison
  const [compareWith, setCompareWith] = useState([]);
  const [compareData, setCompareData] = useState({});
  const [compareLoading, setCompareLoading] = useState({});

  // -- data fetching -------------------------------------------------------
  useEffect(() => {
    const fetchOrganisms = async () => {
      try {
        const res = await genomeSnapshotApi.getOrganisms();
        if (res.success) setOrganisms(res.organisms);
      } catch (err) {
        console.error('Failed to fetch organisms:', err);
      }
    };
    fetchOrganisms();
  }, []);

  useEffect(() => {
    if (!organism) return;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setSelectedChrs([]);
      setCompareWith([]);
      setCompareData({});
      try {
        const res = await genomeSnapshotApi.getSnapshot(organism);
        if (res.success) setData(res);
        else setError(res.error || 'Failed to load genome snapshot');
      } catch (err) {
        setError(err.response?.data?.detail || err.message || 'Failed to load genome snapshot');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [organism]);

  useEffect(() => {
    if (!organism) return;
    const fetchGoSlim = async () => {
      setGoSlimLoading(true);
      try {
        const res = await genomeSnapshotApi.getGoSlimDistribution(organism);
        if (res.success) setGoSlimData(res);
      } catch (err) {
        console.error('Failed to fetch GO Slim distribution:', err);
      } finally {
        setGoSlimLoading(false);
      }
    };
    fetchGoSlim();
  }, [organism]);

  useEffect(() => {
    if (!organism) return;
    const fetchChrInventory = async () => {
      setChrInventoryLoading(true);
      try {
        const res = await genomeSnapshotApi.getChromosomeInventory(organism);
        if (res.success) setChrInventory(res);
      } catch (err) {
        console.error('Failed to fetch chromosome inventory:', err);
      } finally {
        setChrInventoryLoading(false);
      }
    };
    fetchChrInventory();
  }, [organism]);

  // -- scroll spy + back-to-top -------------------------------------------
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!data) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: '-30% 0px -60% 0px', threshold: 0 }
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [data, goSlimData, chrInventory]);

  // -- comparison ----------------------------------------------------------
  const toggleCompare = useCallback((abbrev) => {
    setCompareWith((prev) => (prev.includes(abbrev)
      ? prev.filter((a) => a !== abbrev)
      : [...prev, abbrev]));
  }, []);

  // Fetch snapshots for any newly selected comparison genomes.
  useEffect(() => {
    compareWith.forEach((abbrev) => {
      if (compareData[abbrev] || compareLoading[abbrev]) return;
      const fetchCompare = async () => {
        setCompareLoading((l) => ({ ...l, [abbrev]: true }));
        try {
          const res = await genomeSnapshotApi.getSnapshot(abbrev);
          if (res.success) setCompareData((d) => ({ ...d, [abbrev]: res }));
        } catch (err) {
          console.error('Compare fetch failed:', err);
        } finally {
          setCompareLoading((l) => ({ ...l, [abbrev]: false }));
        }
      };
      fetchCompare();
    });
  }, [compareWith, compareData, compareLoading]);

  // -- derived values ------------------------------------------------------
  const isDiploid = organism ? organism.toLowerCase().includes('albicans') : false;
  const divisor = isDiploid ? 2 : 1;

  const orfCounts = data ? {
    verified: data.verified_orfs,
    uncharacterized: data.uncharacterized_orfs,
    dubious: data.dubious_orfs,
  } : null;
  const orfTotal = data ? data.verified_orfs + data.uncharacterized_orfs + data.dubious_orfs : 0;

  const inventoryRows = useMemo(() => {
    if (!data) return [];
    const totalFeatures = data.total_features || 0;
    return INVENTORY_DEFS
      .map((def) => {
        const total = data[def.field] || 0;
        if (!def.always && total <= 0) return null;
        const haploid = def.haploidField
          ? (data[def.haploidField] || 0)
          : Math.round(total / divisor);
        const pct = totalFeatures > 0 ? (total / totalFeatures) * 100 : 0;
        return { ...def, total, haploid, pct };
      })
      .filter(Boolean);
  }, [data, divisor]);

  const filteredInventory = useMemo(() => {
    let rows = inventoryRows;
    if (invCategory !== 'all') rows = rows.filter((r) => r.category === invCategory);
    if (invSearch.trim()) {
      const q = invSearch.toLowerCase().trim();
      rows = rows.filter((r) => r.label.toLowerCase().includes(q));
    }
    const dir = invSort.dir === 'asc' ? 1 : -1;
    const val = (r) => {
      if (invSort.key === 'label') return r.label.toLowerCase();
      if (invSort.key === 'haploid') return r.haploid;
      if (invSort.key === 'pct') return r.pct;
      return r.total;
    };
    return rows.slice().sort((a, b) => {
      const av = val(a);
      const bv = val(b);
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
  }, [inventoryRows, invCategory, invSearch, invSort]);

  const displayChromosomes = useMemo(
    () => normalizeChromosomes(organism, chrInventory?.chromosomes),
    [organism, chrInventory]
  );
  const maxChrLen = useMemo(
    () => Math.max(1, ...displayChromosomes.map((c) => c.length_bp || 0)),
    [displayChromosomes]
  );

  const toggleChrSelection = (chrId) => {
    setSelectedChrs((prev) => {
      if (prev.includes(chrId)) return prev.filter((c) => c !== chrId);
      if (prev.length >= 2) return [prev[1], chrId];
      return [...prev, chrId];
    });
  };

  const handleInvSort = (key) => {
    setInvSort((prev) => (prev.key === key
      ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
      : { key, dir: key === 'label' ? 'asc' : 'desc' }));
  };

  const exportInventory = () => {
    const rows = [['Feature Type', 'Total', 'Haploid Total', '% of total features']];
    filteredInventory.forEach((r) => rows.push([r.label, r.total, r.haploid, r.pct.toFixed(2)]));
    downloadCsv(`${organism}_genome_inventory.csv`, rows);
  };

  const exportChromosomes = () => {
    const header = ['Feature Type', 'Total', ...displayChromosomes.map((c) => c.chromosome_display)];
    const fields = [
      ['Total ORFs', 'total_orfs'], ['Verified ORFs', 'verified_orfs'],
      ['Uncharacterized ORFs', 'uncharacterized_orfs'], ['Dubious ORFs', 'dubious_orfs'],
      ['tRNA', 'trna'], ['snoRNA', 'snorna'], ['rRNA', 'rrna'], ['ncRNA', 'ncrna'],
      ['Pseudogene', 'pseudogene'], ['Total features', 'total_features'], ['Chromosome length (bp)', 'length_bp'],
    ];
    const rows = [header];
    fields.forEach(([label, f]) => {
      rows.push([label, chrInventory?.grand_totals?.[f] ?? '', ...displayChromosomes.map((c) => c[f] ?? '')]);
    });
    downloadCsv(`${organism}_chromosome_inventory.csv`, rows);
  };

  // -- organism selector (no organism in URL) ------------------------------
  if (!organism) {
    return (
      <div className="info-page">
        <div className="info-page-content">
          <h1>Genome Snapshot</h1>
          <hr />
          <p>Select a genome to explore its interactive snapshot:</p>
          <ul>
            {organisms.map((org) => (
              <li key={org.organism_abbrev}>
                <Link to={`/genome-snapshot2/${org.organism_abbrev}`}><em>{org.organism_name}</em></Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="info-page">
        <div className="info-page-content">
          <h1>Genome Snapshot</h1>
          <hr />
          <div className="loading-state"><span className="loading-spinner"></span> Loading genome snapshot…</div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="info-page">
        <div className="info-page-content">
          <h1>Genome Snapshot</h1>
          <hr />
          <div className="error-state"><p>{error || 'Failed to load genome snapshot'}</p></div>
          <p><Link to="/genome-snapshot2">View available genomes</Link></p>
        </div>
      </div>
    );
  }

  const fullName = `${data.organism_name} ${data.strain}`;
  const goTotal = data.go_annotations?.total || 0;

  // "Genome at a glance" cards.
  const cards = [
    { label: 'Total ORFs', value: data.total_orfs, sub: 'all open reading frames', href: featureSearchUrl(organism, 'featuretype=ORF'), cta: 'View genes →', color: '#555' },
    { label: 'Verified ORFs', value: data.verified_orfs, sub: orfTotal ? `${((data.verified_orfs / orfTotal) * 100).toFixed(1)}%` : '', href: featureSearchUrl(organism, 'qualifier=Verified&featuretype=ORF'), cta: 'View genes →', color: '#4169E1' },
    { label: 'Uncharacterized ORFs', value: data.uncharacterized_orfs, sub: orfTotal ? `${((data.uncharacterized_orfs / orfTotal) * 100).toFixed(1)}%` : '', href: featureSearchUrl(organism, 'qualifier=Uncharacterized&featuretype=ORF'), cta: 'View genes →', color: '#228B22' },
    { label: 'Dubious ORFs', value: data.dubious_orfs, sub: orfTotal ? `${((data.dubious_orfs / orfTotal) * 100).toFixed(1)}%` : '', href: featureSearchUrl(organism, 'qualifier=Dubious&featuretype=ORF'), cta: 'View genes →', color: '#DC143C' },
    { label: 'GO annotations', value: goTotal, sub: 'across all 3 aspects', scroll: 'go-annotations', cta: 'Explore GO →', color: '#8e44ad' },
  ];

  const selectedChrObjs = selectedChrs
    .map((id) => displayChromosomes.find((c) => c.chromosome === id))
    .filter(Boolean);

  const otherOrganisms = organisms.filter((o) => o.organism_abbrev !== organism);

  return (
    <div className="info-page genome-snapshot-page gs2-page">
      <Tooltip tip={tip} />

      <div className="info-page-content">
        <div className="snapshot-header">
          <h1><em>{fullName}</em> Genome Snapshot — Explore this Genome</h1>
          <a href="/help/genome-snapshot" className="help-button" title="Help" target={LINK_TARGET} rel="noopener">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="#0066cc" strokeWidth="2" fill="white" />
              <text x="12" y="17" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#0066cc">?</text>
            </svg>
          </a>
        </div>
        <hr />

        <p className="gs2-timestamp">
          <strong>Data calculated:</strong> {data.last_updated} · in real time from the CGD database
        </p>

        {ASSEMBLY_REFERENCES[organism] && (
          <p style={{ marginBottom: '10px' }}>
            <strong>Assembly Reference{ASSEMBLY_REFERENCES[organism].length > 1 ? 's' : ''}:</strong>{' '}
            {ASSEMBLY_REFERENCES[organism].map((ref, idx) => (
              <span key={ref.pmid}>
                {idx > 0 && ' | '}
                <a href={`https://pubmed.ncbi.nlm.nih.gov/${ref.pmid}/`} target="_blank" rel="noopener noreferrer">
                  PMID: {ref.pmid}
                </a>{' '}({ref.assembly})
              </span>
            ))}
          </p>
        )}

        <SectionNav active={activeSection} />

        {/* ============================= OVERVIEW ============================= */}
        <section className="info-section gs2-section" id="overview">
          <h2 className="gs2-h2">Genome at a Glance</h2>
          <div className="gs2-cards">
            {cards.map((c) => {
              const inner = (
                <>
                  <span className="gs2-card-value">{fmt(c.value)}</span>
                  <span className="gs2-card-label">{c.label}</span>
                  {c.sub && <span className="gs2-card-sub">{c.sub}</span>}
                  <span className="gs2-card-cta">{c.cta}</span>
                </>
              );
              return c.scroll ? (
                <button
                  key={c.label}
                  type="button"
                  className="gs2-card"
                  style={{ borderTopColor: c.color }}
                  onClick={() => document.getElementById(c.scroll)?.scrollIntoView({ behavior: 'smooth' })}
                >
                  {inner}
                </button>
              ) : (
                <a key={c.label} className="gs2-card" href={c.href} target={LINK_TARGET} rel="noopener" style={{ borderTopColor: c.color }}>
                  {inner}
                </a>
              );
            })}
          </div>

          <div className="gs2-explore-panel">
            <h3>Explore this genome</h3>
            <div className="gs2-explore-links">
              <a href="/feature-search" target={LINK_TARGET} rel="noopener">🔍 Find a gene or feature</a>
              <button type="button" onClick={() => document.getElementById('chromosomes')?.scrollIntoView({ behavior: 'smooth' })}>🧬 Browse a chromosome</button>
              <button type="button" onClick={() => document.getElementById('go-categories')?.scrollIntoView({ behavior: 'smooth' })}>🏷️ Search GO annotations</button>
              <a href={jbrowseMenuUrl(organism)} target={LINK_TARGET} rel="noopener">🗺️ View in JBrowse</a>
              <a href="/download" target={LINK_TARGET} rel="noopener">⬇️ Download genome data</a>
              <button type="button" onClick={() => document.getElementById('comparison')?.scrollIntoView({ behavior: 'smooth' })}>⚖️ Compare with another genome</button>
            </div>
          </div>

          <div className="gs2-pie-block">
            <div className="gs2-chart-toolbar">
              <h3 style={{ margin: 0 }}>Protein-coding gene distribution</h3>
              <div className="gs2-toggle" role="group" aria-label="Display mode">
                <button type="button" className={pieMode === 'percentage' ? 'active' : ''} onClick={() => setPieMode('percentage')}>Percentage</button>
                <button type="button" className={pieMode === 'count' ? 'active' : ''} onClick={() => setPieMode('count')}>Count</button>
              </div>
            </div>
            <div className="gs2-pie-wrap">
              <OrfPieChart
                counts={orfCounts}
                organism={organism}
                organismName={fullName}
                mode={pieMode}
                onTip={setTip}
              />
              <div className="gs2-pie-legend">
                {ORF_SLICES_META.map((meta) => {
                  const value = orfCounts[meta.key] || 0;
                  const pct = orfTotal ? ((value / orfTotal) * 100).toFixed(1) : '0.0';
                  return (
                    <a
                      key={meta.key}
                      className="gs2-legend-row"
                      href={featureSearchUrl(organism, `qualifier=${meta.qualifier}&featuretype=ORF`)}
                      target={LINK_TARGET}
                      rel="noopener"
                    >
                      <span className={`gs2-swatch gs2-swatch-${meta.pattern}`} style={{ backgroundColor: meta.color }} aria-hidden="true"></span>
                      <span><strong>{fmt(value)}</strong> {meta.label} · {pct}%</span>
                      <span className="gs2-legend-cta">view →</span>
                    </a>
                  );
                })}
                <HelpDrawer title="What do these categories mean?">
                  <ul>
                    <li><strong>Verified:</strong> {EXPLAIN.verified}</li>
                    <li><strong>Uncharacterized:</strong> {EXPLAIN.uncharacterized}</li>
                    <li><strong>Dubious:</strong> {EXPLAIN.dubious}</li>
                  </ul>
                  <p>Slices use both colour and a texture (diagonal / dotted / cross-hatch) so they remain distinguishable without relying on colour alone. Click any slice or legend row to open the matching genes in Advanced Search.</p>
                </HelpDrawer>
              </div>
            </div>
          </div>
        </section>

        {/* ========================= GENOME INVENTORY ========================= */}
        <section className="info-section gs2-section" id="genome-inventory">
          <h2 className="gs2-h2">
            Genome Inventory
            <HelpDrawer>
              <p>Counts of every annotated feature type across the full assembly. Use the search box, category filter and column headers to focus the table, then download the current view. Click a feature-type name to retrieve that exact set of features in Advanced Search.</p>
            </HelpDrawer>
          </h2>

          <div className="gs2-table-controls">
            <input
              type="text"
              className="gs2-input"
              placeholder="Search feature types…"
              value={invSearch}
              onChange={(e) => setInvSearch(e.target.value)}
              aria-label="Search feature types"
            />
            <div className="gs2-filter-chips" role="group" aria-label="Feature category filter">
              {Object.keys(CATEGORY_LABELS).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={invCategory === cat ? 'active' : ''}
                  onClick={() => setInvCategory(cat)}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
            <button type="button" className="gs2-download-btn" onClick={exportInventory}>⬇️ Download CSV</button>
          </div>

          <table className="snapshot-table gs2-sortable">
            <thead>
              <tr>
                <SortHeader label="Feature Type" col="label" sort={invSort} onSort={handleInvSort} align="left" />
                <SortHeader label="Total" col="total" sort={invSort} onSort={handleInvSort} />
                <SortHeader label="Haploid Total" col="haploid" sort={invSort} onSort={handleInvSort} />
                <SortHeader label="% of total features" col="pct" sort={invSort} onSort={handleInvSort} />
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((r) => (
                <tr key={r.key}>
                  <td style={{ textAlign: 'left' }}>
                    <a href={featureSearchUrl(organism, r.search)} target={LINK_TARGET} rel="noopener">{r.label}</a>
                    <span className="gs2-cat-tag">{CATEGORY_LABELS[r.category]}</span>
                  </td>
                  <td>{fmt(r.total)}</td>
                  <td>{fmt(r.haploid)}</td>
                  <td>{r.pct.toFixed(2)}%</td>
                </tr>
              ))}
              {data.total_features > 0 && (
                <tr className="total-row">
                  <td style={{ textAlign: 'left' }}><strong>Total features</strong></td>
                  <td><strong>{fmt(data.total_features)}</strong></td>
                  <td><strong>{fmt(Math.round(data.total_features / divisor))}</strong></td>
                  <td><strong>100%</strong></td>
                </tr>
              )}
            </tbody>
          </table>
          {filteredInventory.length === 0 && <p className="gs2-muted">No feature types match your filters.</p>}
        </section>

        {/* =========================== CHROMOSOMES =========================== */}
        <section className="info-section gs2-section" id="chromosomes">
          <h2 className="gs2-h2">
            Chromosomes
            <HelpDrawer>
              <p>The ideogram shows each chromosome scaled by length. Click a chromosome to highlight its column and see a detail card; click a second to compare the two side by side. Chromosome counts represent the <strong>haploid reference assembly</strong>, which is why per-chromosome ORF totals are lower than the Genome Inventory totals above.</p>
            </HelpDrawer>
          </h2>

          <p className="gs2-note">
            <strong>Note:</strong> Chromosome counts represent the haploid reference assembly. The Genome
            Inventory above reports {fmt(data.total_orfs)} total ORFs; the per-chromosome table below sums to{' '}
            {fmt(chrInventory?.grand_totals?.total_orfs)} because it counts the haploid set.
          </p>

          {chrInventoryLoading ? (
            <div className="loading-state"><span className="loading-spinner"></span> Loading chromosome data…</div>
          ) : displayChromosomes.length > 0 ? (
            <>
              {/* Ideogram */}
              <div className="gs2-ideogram" role="group" aria-label="Chromosome selector">
                {displayChromosomes.map((chr) => {
                  const w = 40 + ((chr.length_bp || 0) / maxChrLen) * 220;
                  const selected = selectedChrs.includes(chr.chromosome);
                  return (
                    <button
                      key={chr.chromosome}
                      type="button"
                      className={selected ? 'gs2-chr-chip selected' : 'gs2-chr-chip'}
                      style={{ width: `${w}px` }}
                      onClick={() => toggleChrSelection(chr.chromosome)}
                      aria-pressed={selected}
                      title={`${chr.chromosome_display}: ${fmt(chr.length_bp)} bp, ${fmt(chr.total_orfs)} ORFs`}
                    >
                      <span className="gs2-chr-name">{chr.chromosome_display}</span>
                      <span className="gs2-chr-len">{((chr.length_bp || 0) / 1e6).toFixed(2)} Mb</span>
                    </button>
                  );
                })}
              </div>
              <p className="gs2-muted gs2-hint">Click a chromosome to highlight and inspect it; click a second to compare. {selectedChrs.length > 0 && <button type="button" className="gs2-linkbtn" onClick={() => setSelectedChrs([])}>Clear selection</button>}</p>

              {/* Chromosome detail / comparison cards */}
              {selectedChrObjs.length > 0 && (
                <div className="gs2-chr-details">
                  {selectedChrObjs.map((chr) => {
                    const orfs = chr.total_orfs || 0;
                    const vRatio = orfs ? ((chr.verified_orfs / orfs) * 100).toFixed(1) : '0.0';
                    const uRatio = orfs ? ((chr.uncharacterized_orfs / orfs) * 100).toFixed(1) : '0.0';
                    return (
                      <div key={chr.chromosome} className="gs2-chr-card">
                        <h4>Chromosome {chr.chromosome_display}</h4>
                        <dl>
                          <div><dt>Length</dt><dd>{fmt(chr.length_bp)} bp</dd></div>
                          <div><dt>Total ORFs</dt><dd>{fmt(chr.total_orfs)}</dd></div>
                          <div><dt>Verified</dt><dd>{fmt(chr.verified_orfs)} ({vRatio}%)</dd></div>
                          <div><dt>Uncharacterized</dt><dd>{fmt(chr.uncharacterized_orfs)} ({uRatio}%)</dd></div>
                          <div><dt>Dubious</dt><dd>{fmt(chr.dubious_orfs)}</dd></div>
                          <div><dt>tRNA</dt><dd>{fmt(chr.trna)}</dd></div>
                          <div><dt>snoRNA / rRNA / ncRNA</dt><dd>{fmt(chr.snorna)} / {fmt(chr.rrna)} / {fmt(chr.ncrna)}</dd></div>
                        </dl>
                        <div className="gs2-chr-card-links">
                          <a href={`/chromosome/${chr.chromosome}`} target={LINK_TARGET} rel="noopener">Feature list →</a>
                          <a href={`/jbrowse2/?assembly=${jbrowseAssembly(organism)}&loc=${encodeURIComponent(chr.chromosome)}`} target={LINK_TARGET} rel="noopener">JBrowse →</a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Chromosome feature inventory table with column highlight */}
              <div className="gs2-table-controls">
                <span className="gs2-muted">Chromosome Feature Inventory</span>
                <button type="button" className="gs2-download-btn" onClick={exportChromosomes}>⬇️ Download CSV</button>
              </div>
              <div className="chromosome-table-wrapper">
                <table className="chromosome-inventory-table gs2-chr-table">
                  <thead>
                    <tr>
                      <th rowSpan="2">Feature Type</th>
                      <th rowSpan="2">Total</th>
                      <th colSpan={displayChromosomes.length}>Chromosome</th>
                    </tr>
                    <tr>
                      {displayChromosomes.map((chr) => (
                        <th
                          key={chr.chromosome}
                          className={selectedChrs.includes(chr.chromosome) ? 'chr-header gs2-col-selected' : 'chr-header'}
                        >
                          <button type="button" className="gs2-linkbtn" onClick={() => toggleChrSelection(chr.chromosome)}>
                            {chr.chromosome_display}
                          </button>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <ChrRow label="Total ORFs" field="total_orfs" chrs={displayChromosomes} totals={chrInventory.grand_totals} selected={selectedChrs} onSelect={toggleChrSelection} />
                    {chrInventory.feature_types?.includes('Verified ORFs') && (
                      <ChrRow label="Verified ORFs" field="verified_orfs" chrs={displayChromosomes} totals={chrInventory.grand_totals} selected={selectedChrs} onSelect={toggleChrSelection} link={featureSearchUrl(organism, 'qualifier=Verified&featuretype=ORF')} />
                    )}
                    {chrInventory.feature_types?.includes('Uncharacterized ORFs') && (
                      <ChrRow label="Uncharacterized ORFs" field="uncharacterized_orfs" chrs={displayChromosomes} totals={chrInventory.grand_totals} selected={selectedChrs} onSelect={toggleChrSelection} link={featureSearchUrl(organism, 'qualifier=Uncharacterized&featuretype=ORF')} />
                    )}
                    {chrInventory.feature_types?.includes('Dubious ORFs') && (
                      <ChrRow label="Dubious ORFs" field="dubious_orfs" chrs={displayChromosomes} totals={chrInventory.grand_totals} selected={selectedChrs} onSelect={toggleChrSelection} link={featureSearchUrl(organism, 'qualifier=Dubious&featuretype=ORF')} />
                    )}
                    {chrInventory.feature_types?.includes('tRNA') && (
                      <ChrRow label="tRNA" field="trna" chrs={displayChromosomes} totals={chrInventory.grand_totals} selected={selectedChrs} onSelect={toggleChrSelection} link={featureSearchUrl(organism, 'featuretype=tRNA')} />
                    )}
                    {chrInventory.feature_types?.includes('snoRNA') && (
                      <ChrRow label="snoRNA" field="snorna" chrs={displayChromosomes} totals={chrInventory.grand_totals} selected={selectedChrs} onSelect={toggleChrSelection} link={featureSearchUrl(organism, 'featuretype=snoRNA')} />
                    )}
                    {chrInventory.feature_types?.includes('rRNA') && (
                      <ChrRow label="rRNA" field="rrna" chrs={displayChromosomes} totals={chrInventory.grand_totals} selected={selectedChrs} onSelect={toggleChrSelection} link={featureSearchUrl(organism, 'featuretype=rRNA')} />
                    )}
                    {chrInventory.feature_types?.includes('ncRNA') && (
                      <ChrRow label="ncRNA" field="ncrna" chrs={displayChromosomes} totals={chrInventory.grand_totals} selected={selectedChrs} onSelect={toggleChrSelection} link={featureSearchUrl(organism, 'featuretype=ncRNA')} />
                    )}
                    {chrInventory.feature_types?.includes('Pseudogene') && (
                      <ChrRow label="Pseudogene" field="pseudogene" chrs={displayChromosomes} totals={chrInventory.grand_totals} selected={selectedChrs} onSelect={toggleChrSelection} link={featureSearchUrl(organism, 'featuretype=pseudogene')} />
                    )}
                    <ChrRow label="Total" field="total_features" chrs={displayChromosomes} totals={chrInventory.grand_totals} selected={selectedChrs} onSelect={toggleChrSelection} totalRow />
                    <ChrRow label="Chromosome length (bp)" field="length_bp" chrs={displayChromosomes} totals={chrInventory.grand_totals} selected={selectedChrs} onSelect={toggleChrSelection} />
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <p className="gs2-muted">No chromosome data available for this organism.</p>
          )}
        </section>

        {/* ========================= GO ANNOTATIONS ========================= */}
        <section className="info-section gs2-section" id="go-annotations">
          <h2 className="gs2-h2">
            Summary of GO Annotations
            <HelpDrawer>
              <p>Total number of gene products annotated to each Gene Ontology aspect. These include Verified and Uncharacterized ORFs, transposable-element genes and all RNA gene products. Click an aspect to jump to its interactive category chart.</p>
            </HelpDrawer>
          </h2>
          <table className="snapshot-table go-table">
            <thead>
              <tr><th>Ontology</th><th>Total Annotations</th><th>Explore</th></tr>
            </thead>
            <tbody>
              {GO_ASPECTS.map((a) => (
                <tr key={a.key}>
                  <td>{a.label}</td>
                  <td>{fmt(data.go_annotations?.[a.key])}</td>
                  <td>
                    <button type="button" className="gs2-linkbtn" onClick={() => { setGoTab(a.key); document.getElementById('go-categories')?.scrollIntoView({ behavior: 'smooth' }); }}>
                      View categories →
                    </button>
                  </td>
                </tr>
              ))}
              <tr className="total-row">
                <th>All Ontologies</th>
                <td>{fmt(goTotal)}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* ========================= GO CATEGORIES ========================= */}
        <section className="info-section gs2-section" id="go-categories">
          <h2 className="gs2-h2">
            GO Categories (GO Slim distribution)
            <HelpDrawer>
              <p>Distribution of gene products across a <em>Candida</em>-tailored GO Slim (a high-level subset of GO terms). Switch aspects with the tabs, toggle count vs. percentage, choose how many categories to show, or search for a term such as "biofilm", "mitochondrion" or "transport". Click any bar to open that GO category.</p>
            </HelpDrawer>
          </h2>

          <div className="gs2-go-tabs" role="tablist">
            {GO_ASPECTS.map((a) => (
              <button
                key={a.key}
                type="button"
                role="tab"
                aria-selected={goTab === a.key}
                className={goTab === a.key ? 'gs2-go-tab active' : 'gs2-go-tab'}
                style={goTab === a.key ? { borderBottomColor: a.color, color: a.color } : undefined}
                onClick={() => setGoTab(a.key)}
              >
                {a.label}
              </button>
            ))}
          </div>

          <div className="gs2-chart-toolbar gs2-go-toolbar">
            <input
              type="text"
              className="gs2-input"
              placeholder='Search GO categories… (e.g. "transport")'
              value={goFilter}
              onChange={(e) => setGoFilter(e.target.value)}
              aria-label="Search GO categories"
            />
            <div className="gs2-toggle" role="group" aria-label="GO display mode">
              <button type="button" className={goMode === 'percentage' ? 'active' : ''} onClick={() => setGoMode('percentage')}>Percentage</button>
              <button type="button" className={goMode === 'count' ? 'active' : ''} onClick={() => setGoMode('count')}>Count</button>
            </div>
            <div className="gs2-toggle" role="group" aria-label="Number of categories">
              {['10', '25', 'all'].map((n) => (
                <button key={n} type="button" className={goLimit === n ? 'active' : ''} onClick={() => setGoLimit(n)}>
                  {n === 'all' ? 'All' : `Top ${n}`}
                </button>
              ))}
            </div>
          </div>

          <div className="gs2-go-chart-wrap">
            {goSlimLoading ? (
              <p>Loading chart…</p>
            ) : (
              <GoBarChart
                aspect={goSlimData?.[goTab]}
                color={GO_ASPECTS.find((a) => a.key === goTab).color}
                mode={goMode}
                limit={goLimit}
                filter={goFilter}
                onTip={setTip}
              />
            )}
          </div>
          <p className="gs2-muted">
            Data source: <a href="/go-slim-mapper" target={LINK_TARGET} rel="noopener">GO Slim Mapper</a>. GO documentation at the{' '}
            <a href="https://sites.google.com/view/yeastgenome-help/function-help/gene-ontology-go" target="_blank" rel="noopener noreferrer">GO help page</a>.
          </p>
        </section>

        {/* =========================== COMPARISON =========================== */}
        <section className="info-section gs2-section" id="comparison">
          <h2 className="gs2-h2">
            Compare with another Candida genome
            <HelpDrawer>
              <p>Select one or more other genomes to see a side-by-side summary of ORF counts, RNA features, genome-wide totals and GO annotation coverage. Data is fetched live from each genome's snapshot.</p>
            </HelpDrawer>
          </h2>
          <div className="gs2-compare-chips" role="group" aria-label="Genomes to compare">
            {otherOrganisms.map((o) => (
              <button
                key={o.organism_abbrev}
                type="button"
                className={compareWith.includes(o.organism_abbrev) ? 'gs2-compare-chip active' : 'gs2-compare-chip'}
                aria-pressed={compareWith.includes(o.organism_abbrev)}
                onClick={() => toggleCompare(o.organism_abbrev)}
              >
                <em>{o.organism_name}</em>
              </button>
            ))}
          </div>

          {compareWith.length > 0 && (
            <div className="chromosome-table-wrapper">
              <table className="snapshot-table gs2-compare-table">
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>Metric</th>
                    <th><em>{fullName}</em></th>
                    {compareWith.map((abbrev) => {
                      const cd = compareData[abbrev];
                      const org = organisms.find((o) => o.organism_abbrev === abbrev);
                      return <th key={abbrev}><em>{cd ? `${cd.organism_name} ${cd.strain}` : (org?.organism_name || abbrev)}</em></th>;
                    })}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: 'Total ORFs', get: (d) => d.total_orfs },
                    { label: 'Verified ORFs', get: (d) => d.verified_orfs },
                    { label: 'Uncharacterized ORFs', get: (d) => d.uncharacterized_orfs },
                    { label: 'Dubious ORFs', get: (d) => d.dubious_orfs },
                    { label: 'tRNA', get: (d) => d.trna_count },
                    { label: 'snoRNA', get: (d) => d.snorna_count },
                    { label: 'Total features', get: (d) => d.total_features },
                    { label: 'GO annotations (total)', get: (d) => d.go_annotations?.total },
                  ].map((row) => (
                    <tr key={row.label}>
                      <td style={{ textAlign: 'left' }}>{row.label}</td>
                      <td>{fmt(row.get(data))}</td>
                      {compareWith.map((abbrev) => (
                        <td key={abbrev}>
                          {compareLoading[abbrev] ? '…' : (compareData[abbrev] ? fmt(row.get(compareData[abbrev])) : '—')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <hr />

        {/* ========================= RELATED TOOLS ========================= */}
        <section className="info-section gs2-section" id="related-tools">
          <h2 className="gs2-h2">Related Tools &amp; Genomes</h2>
          <div className="gs2-related-grid">
            <div>
              <h4>Explore</h4>
              <ul>
                <li><a href="/feature-search" target={LINK_TARGET} rel="noopener">Advanced Search</a></li>
                <li><a href={jbrowseMenuUrl(organism)} target={LINK_TARGET} rel="noopener">JBrowse genome browser</a></li>
                <li><a href="/go-slim-mapper" target={LINK_TARGET} rel="noopener">GO Slim Mapper</a></li>
                <li><a href="/download" target={LINK_TARGET} rel="noopener">Download Data</a></li>
                <li><a href="/help/genome-snapshot" target={LINK_TARGET} rel="noopener">Genome Snapshot Help</a></li>
              </ul>
            </div>
            <div>
              <h4>Other Genome Snapshots</h4>
              <ul>
                {otherOrganisms.map((o) => (
                  <li key={o.organism_abbrev}>
                    <Link to={`/genome-snapshot2/${o.organism_abbrev}`}><em>{o.organism_name}</em></Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>

      {showTop && (
        <button type="button" className="gs2-back-to-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Back to top">
          ↑ Top
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components used by the tables
// ---------------------------------------------------------------------------

function SortHeader({ label, col, sort, onSort, align }) {
  const active = sort.key === col;
  const arrow = active ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : '';
  return (
    <th style={align === 'left' ? { textAlign: 'left' } : undefined}>
      <button type="button" className="gs2-sort-btn" onClick={() => onSort(col)} aria-label={`Sort by ${label}`}>
        {label}{arrow}
      </button>
    </th>
  );
}

function ChrRow({ label, field, chrs, totals, selected, onSelect, link, totalRow }) {
  return (
    <tr className={totalRow ? 'total-row' : undefined}>
      <td className={field === 'length_bp' || totalRow ? undefined : 'indent'} style={{ textAlign: 'left' }}>
        {link ? <a href={link} target={LINK_TARGET} rel="noopener">{totalRow ? <strong>{label}</strong> : label}</a> : (totalRow ? <strong>{label}</strong> : label)}
      </td>
      <td>{totalRow ? <strong>{fmt(totals?.[field])}</strong> : fmt(totals?.[field])}</td>
      {chrs.map((chr) => (
        <td
          key={chr.chromosome}
          className={selected.includes(chr.chromosome) ? 'gs2-col-selected' : undefined}
          onClick={() => onSelect(chr.chromosome)}
          style={{ cursor: 'pointer' }}
          title={`${chr.chromosome_display}: click to highlight`}
        >
          {totalRow ? <strong>{fmt(chr[field])}</strong> : fmt(chr[field])}
        </td>
      ))}
    </tr>
  );
}

export default GenomeSnapshot2Page;
