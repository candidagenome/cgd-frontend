import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import pangenomeApi from '../api/pangenomeApi';
import PangenomeMap from '../components/pangenome/PangenomeMap';
import { SECTIONS, fmtCopies } from '../components/pangenome/sections';
import './PangenomePage.css';

// The dropdowns filter on the server; the grid pages and sorts every matching gene on the client
const MAX_GENES = 50000;
const GRID_PAGE_SIZE = 10;
const fmtInt = (v) => (v === null || v === undefined ? '' : Number(v).toLocaleString());

const CATEGORY_OPTIONS = [
  { value: '', label: 'All genes' },
  { value: 'core', label: 'Core' },
  { value: 'accessory', label: 'Accessory' },
];
const REFERENCE_OPTIONS = [
  { value: '', label: 'In reference or not' },
  { value: 'in', label: 'In reference annotation' },
  { value: 'novel', label: 'No gene in reference annotation' },
];
// "Not in reference" means the reference annotation has no corresponding gene, not that the sequence is absent
const NOT_IN_REFERENCE_HELP = (strain) =>
  `No corresponding gene in the ${strain} reference annotation; the sequence may still be present in its genome.`;

/** Short Isolates-column text for core genes without a per-gene count, from the study's core definition */
const coreShortLabel = (definition) => {
  const pct = (definition || '').match(/(\d+(?:\.\d+)?)\s*%/);
  if (pct) return `≥${pct[1]}%`;
  const all = (definition || '').match(/\ball (\d+)\b/);
  return all ? `${all[1]}/${all[1]}` : 'core';
};
const STOP_OPTIONS = [
  { value: '', label: 'Any' },
  { value: 'true', label: 'With premature stops' },
  { value: 'false', label: 'Without' },
];
const DUPLICATION_OPTIONS = [
  { value: '', label: 'Any' },
  { value: 'true', label: 'Duplicated in some isolates' },
  { value: 'false', label: 'Not duplicated' },
];
const SORT_OPTIONS = [
  { value: 'position', label: 'Chromosome position' },
  { value: 'id', label: 'Gene ID' },
  { value: 'presence', label: 'Rarest accessory first' },
  { value: 'stops', label: 'Most isolates with stops' },
  { value: 'duplicated', label: 'Most isolates duplicated' },
];

const shortCitation = (citation) => (citation || '').replace(/\) .*$/, ')');

/** What a strain-variation study reports, for the study list */
const studyData = (s) =>
  [s.copy_number_reported && 'Copy number', s.stop_codons_reported && 'Premature stop codons']
    .filter(Boolean)
    .join(', ');

/** Study list (/pangenome, /strain-variation) */
function PangenomeStudies({ section }) {
  const config = SECTIONS[section];
  const [studies, setStudies] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    pangenomeApi
      .getStudies(section)
      .then((r) => setStudies(r.studies))
      .catch(() => setError('Could not load the studies.'));
  }, [section]);

  const pangenome = section === 'pangenome';
  return (
    <div className="pangenome-page">
      <h1>{config.title}</h1>
      <p className="pangenome-intro">
        {config.intro} <Link to={`/help/pangenome${pangenome ? '' : '#strain-variation'}`}>Help</Link>
      </p>
      {error && <div className="error">{error}</div>}
      {!studies && !error && <div className="loading">Loading...</div>}
      {studies && studies.length === 0 && <p className="pangenome-note">No studies loaded yet.</p>}
      {studies && studies.length > 0 && (
        <div className="pangenome-scroll">
          <table className="pangenome-table">
            <thead>
              <tr>
                <th>Study</th>
                <th>Species</th>
                <th>Isolates</th>
                {pangenome ? (
                  <>
                    <th>Core</th>
                    <th>Accessory</th>
                    <th title={NOT_IN_REFERENCE_HELP('reference')}>Not in reference</th>
                  </>
                ) : (
                  <>
                    <th>Genes</th>
                    <th>Data</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {studies.map((s) => (
                <tr key={s.study_id}>
                  <td>
                    <Link to={`${config.path}/${s.study_id}`}>{s.title}</Link>
                    <div className="pangenome-note">{shortCitation(s.citation)}</div>
                  </td>
                  <td>
                    <em>{s.species}</em> ({s.reference_strain})
                  </td>
                  <td>{fmtInt(s.isolate_count)}</td>
                  {pangenome ? (
                    <>
                      <td>{fmtInt(s.counts.core)}</td>
                      <td>{fmtInt(s.counts.accessory)}</td>
                      <td>{fmtInt(s.counts.not_in_reference)}</td>
                    </>
                  ) : (
                    <>
                      <td>{fmtInt(s.counts.genes)}</td>
                      <td>{studyData(s)}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/** Gene details: isolates carrying the gene, premature stop codons per isolate and the divergent strains */
function GeneDetail({ studyId, geneId, study }) {
  const divergentStrains = study.divergent_strains;
  const baseline = study.copy_number_baseline || 2;
  const [gene, setGene] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    pangenomeApi
      .getGene(studyId, geneId)
      .then(setGene)
      .catch(() => setError('Could not load gene detail.'));
  }, [studyId, geneId]);

  if (error) return <div className="error">{error}</div>;
  if (!gene) return <div className="loading">Loading...</div>;
  return (
    <div className="pangenome-detail">
      {gene.interpro && (
        <p>
          <strong>InterPro:</strong> {gene.interpro}
        </p>
      )}
      {gene.blomberg_k !== null && gene.blomberg_k !== undefined && (
        <p>
          <strong>Phylogenetic signal (Blomberg&apos;s K):</strong> {gene.blomberg_k.toFixed(2)} (p ={' '}
          {gene.phylo_p_value})
        </p>
      )}
      {divergentStrains.length > 0 && (
        <>
          <h4>Divergent isolates</h4>
          <table className="pangenome-subtable">
            <thead>
              <tr>
                <th>Isolate</th>
                <th>Presence (read coverage)</th>
                <th>Best BLAST hit</th>
                <th>Identity (%)</th>
                <th>Hit status</th>
              </tr>
            </thead>
            <tbody>
              {divergentStrains.map((strain) => {
                const hit = gene.divergent_strains?.[strain];
                return (
                  <tr key={strain}>
                    <td>{strain}</td>
                    <td>{hit?.presence || '-'}</td>
                    <td>{hit?.hit || '-'}</td>
                    <td>{hit?.identity ?? '-'}</td>
                    <td>{hit?.hit_status || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}
      {Object.keys(gene.isolate_genes || {}).length > 0 && (
        <>
          <h4>
            Carried by {Object.keys(gene.isolate_genes).length} of {study.isolate_count} isolates
          </h4>
          {(() => {
            const absent = study.isolates.map((i) => i.name).filter((n) => !gene.isolate_genes[n]);
            return absent.length > 0 && <p className="pangenome-note">Absent from: {absent.join(', ')}</p>;
          })()}
          <table className="pangenome-subtable">
            <thead>
              <tr>
                <th>Isolate</th>
                <th>Its genes in this family</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(gene.isolate_genes).map(([isolate, ids]) => (
                <tr key={isolate}>
                  <td>{isolate}</td>
                  <td className="pangenome-id-list">{ids.join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
      {Object.keys(gene.copy_number || {}).length > 0 && (
        <>
          <h4>Copy number by isolate</h4>
          <p className="pangenome-note">
            Highest first; an unchanged gene is about {baseline}
            {baseline === 2 ? ' (diploid)' : baseline === 1 ? ' (haploid)' : ''}. Red: absent; amber: duplicated (at
            least twice that).
          </p>
          <div className="pangenome-cn-list">
            {Object.entries(gene.copy_number)
              .sort((a, b) => b[1] - a[1])
              .map(([isolate, cn]) => (
                <span
                  key={isolate}
                  className={`pangenome-cn ${cn < 0.2 ? 'absent' : cn >= 2 * baseline ? 'high' : ''}`}
                  title={`${isolate}: ${cn}`}
                >
                  {isolate} <strong>{fmtCopies(cn, study)}</strong>
                </span>
              ))}
          </div>
        </>
      )}
      {study.stop_codons_reported && <h4>Premature stop codons</h4>}
      {!study.stop_codons_reported ? null : gene.stop_codons.length === 0 ? (
        <p className="pangenome-note">None reported.</p>
      ) : (
        <table className="pangenome-subtable">
          <thead>
            <tr>
              <th>Position</th>
              <th>{gene.stop_codons.some((s) => s.protein_change) ? 'Protein change' : 'Codon (aa)'}</th>
              <th>Homozygous in</th>
              <th>Heterozygous in</th>
            </tr>
          </thead>
          <tbody>
            {gene.stop_codons.map((s) => (
              <tr key={`${s.chromosome}-${s.position}-${s.source_position}`}>
                <td>
                  {s.position ? (
                    <>
                      {s.position_approximate ? '≈ ' : ''}
                      {s.chromosome}:{fmtInt(s.position)}
                    </>
                  ) : (
                    '-'
                  )}
                  {s.source_position && <div className="pangenome-note">study: {s.source_position}</div>}
                </td>
                <td>{s.protein_change || s.aa_position}</td>
                <td>
                  {s.homozygous.length
                    ? s.homozygous.join(', ')
                    : // studies giving counts, not isolate lists
                      Object.entries(s.group_counts || {})
                        .map(([group, n]) => `${n} in ${group}`)
                        .join('; ') || '-'}
                </td>
                <td>{s.heterozygous.length ? s.heterozygous.join(', ') : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

/** One study (/pangenome/:studyId) */
function PangenomeStudy({ studyId, section }) {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [study, setStudy] = useState(null);
  const [genes, setGenes] = useState(null);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [showIsolates, setShowIsolates] = useState(false);
  const [queryInput, setQueryInput] = useState(searchParams.get('q') || '');
  // Keep the search box in step with q when it changes from outside the box (back / forward, map links)
  const [syncedQuery, setSyncedQuery] = useState(searchParams.get('q') || '');
  if (syncedQuery !== (searchParams.get('q') || '')) {
    setSyncedQuery(searchParams.get('q') || '');
    setQueryInput(searchParams.get('q') || '');
  }
  const gridRef = useRef(null);

  const filters = useMemo(
    () => ({
      category: searchParams.get('category') || '',
      reference: searchParams.get('reference') || '',
      stops: searchParams.get('stops') || '',
      duplicated: searchParams.get('duplicated') || '',
      q: searchParams.get('q') || '',
      sort: searchParams.get('sort') || 'position',
    }),
    [searchParams]
  );

  useEffect(() => {
    pangenomeApi
      .getStudy(studyId)
      .then(setStudy)
      .catch(() => setError('Pangenome study not found.'));
  }, [studyId]);

  useEffect(() => {
    const params = { sort: filters.sort, page: 1, page_size: MAX_GENES };
    ['category', 'reference', 'stops', 'duplicated', 'q'].forEach((k) => {
      if (filters[k]) params[k] = filters[k];
    });
    pangenomeApi
      .getGenes(studyId, params)
      .then((r) => {
        setGenes(r);
        // A search that finds one gene, or names one exactly (e.g. "Show in gene table"), opens its detail
        const q = (params.q || '').toUpperCase();
        // a gene's own ID wins over other study genes drawn at the same CGD locus
        const byId = r.genes.filter((g) => q && g.id.toUpperCase() === q);
        const exact = byId.length ? byId : r.genes.filter((g) => q && g.reference_gene?.toUpperCase() === q);
        setExpanded(r.genes.length === 1 ? r.genes[0].id : exact.length === 1 ? exact[0].id : null);
      })
      .catch(() => setGenes({ total: 0, genes: [], error: true }));
  }, [studyId, filters]);

  const total = study?.isolate_count;
  const categories = (SECTIONS[study?.section] || SECTIONS.pangenome).categories;
  // Studies of variants (stop codons) say which isolates carry them, not which isolates carry each gene
  const presence = study?.presence_reported !== false;
  const columnDefs = useMemo(
    () => [
      {
        headerName: 'Gene',
        field: 'id',
        minWidth: 200,
        cellClass: 'pangenome-id',
        cellRenderer: (p) => (
          <>
            <span className="pangenome-toggle">{p.context.expanded === p.value ? '▾' : '▸'}</span> {p.value}
          </>
        ),
      },
      {
        headerName: 'CGD locus',
        minWidth: 170,
        valueGetter: (p) =>
          p.data.reference_gene
            ? p.data.gene_name
              ? `${p.data.gene_name} / ${p.data.reference_gene}`
              : p.data.reference_gene
            : '',
        cellRenderer: (p) =>
          p.data.reference_gene ? (
            <Link to={`/locus/${p.data.reference_gene}`} onClick={(e) => e.stopPropagation()}>
              {p.value}
            </Link>
          ) : (
            <span className="pangenome-note">none</span>
          ),
      },
      presence && {
        headerName: 'Category',
        minWidth: 200,
        valueGetter: (p) => `${p.data.category}${p.data.in_reference ? '' : ' not in reference'}`,
        cellRenderer: (p) => (
          <>
            <span className={`pangenome-badge ${p.data.category}`}>
              {p.data.presence === 0 ? categories.absentAll : categories[p.data.category] || p.data.category}
            </span>
            {!p.data.in_reference && (
              <span className="pangenome-badge novel" title={NOT_IN_REFERENCE_HELP(study?.reference_strain)}>
                not in reference
              </span>
            )}
          </>
        ),
      },
      presence && {
        headerName: 'Isolates',
        width: 110,
        // Core genes have no per-gene count in the study; sort them above every accessory gene
        valueGetter: (p) => (p.data.presence ?? (p.data.category === 'core' ? total + 1 : null)),
        valueFormatter: (p) =>
          p.data.presence !== null && p.data.presence !== undefined
            ? `${p.data.presence}/${total}`
            : p.data.category === 'core'
              ? coreShortLabel(study?.core_definition)
              : '',
      },
      { headerName: 'Type', field: 'type', minWidth: 160, tooltipField: 'type' },
      {
        headerName: 'Ortholog / note',
        flex: 1,
        minWidth: 120,
        cellClass: 'pangenome-note-cell',
        tooltipValueGetter: (p) => p.value,
        valueGetter: (p) => [p.data.ortholog, p.data.note].filter(Boolean).join(' — '),
      },
      study?.copy_number_reported && {
        headerName: 'Copy number',
        minWidth: 130,
        headerTooltip: 'Copy number range across isolates; sorts by the highest',
        valueGetter: (p) => p.data.copy_number_max,
        valueFormatter: (p) =>
          p.data.copy_number_max === null || p.data.copy_number_max === undefined
            ? ''
            : `${fmtCopies(p.data.copy_number_min, study)}–${fmtCopies(p.data.copy_number_max, study)}`,
      },
      study?.duplication_threshold && {
        headerName: 'Duplicated',
        width: 120,
        headerTooltip: `Isolates with ${study.duplication_threshold} or more copies (twice the normal copy number)`,
        valueGetter: (p) => p.data.duplicated_isolates || 0,
        valueFormatter: (p) => (p.value ? `${p.value}/${total}` : ''),
      },
      study?.stop_codons_reported && {
        headerName: 'Stops',
        minWidth: 140,
        valueGetter: (p) => p.data.stop_codon_isolates || 0,
        valueFormatter: (p) => {
          const n = p.data.stop_codon_count;
          const k = p.data.stop_codon_isolates;
          return n > 0 ? `${n} site${n > 1 ? 's' : ''}, ${k} isolate${k > 1 ? 's' : ''}` : '';
        },
      },
    ].filter(Boolean),
    [total, study, categories, presence]
  );

  // Re-render rows so the toggle arrow and highlight follow the open gene
  useEffect(() => {
    gridRef.current?.api?.redrawRows();
  }, [expanded]);

  // Dropdowns apply immediately; the text search waits for Search / Enter
  const update = (changes) => {
    const next = new URLSearchParams(searchParams);
    Object.entries({ ...changes, page: '' }).forEach(([k, v]) => {
      if (v) next.set(k, v);
      else next.delete(k);
    });
    setSearchParams(next);
  };

  if (error) return <div className="pangenome-page error">{error}</div>;
  if (!study) return <div className="pangenome-page loading">Loading...</div>;
  // A study opened under the other section's address moves to its own (old /pangenome/bergin2024 links)
  const config = SECTIONS[study.section] || SECTIONS.pangenome;
  if ((study.section || 'pangenome') !== section) {
    return <Navigate to={`${config.path}/${studyId}${location.search}`} replace />;
  }

  const expandedGene = genes?.genes.find((g) => g.id === expanded);
  // Isolate table columns, leaving out those the study gives no values for
  const isolateColumns = [
    { key: 'name', label: 'Isolate', render: (i) => i.name },
    { key: 'origin', label: 'Origin', render: (i) => i.origin },
    {
      key: 'reads',
      label: 'Reads',
      has: (i) => i.short_read_accession || i.long_read_accession,
      render: (i) =>
        [i.short_read_accession, i.long_read_accession].filter(Boolean).map((acc) => (
          <a
            key={acc}
            className="pangenome-accession"
            href={`https://www.ncbi.nlm.nih.gov/sra/?term=${encodeURIComponent(acc)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {acc}
          </a>
        )),
    },
    {
      key: 'assembly',
      label: 'Assembly',
      has: (i) => i.assembly_level || i.platform,
      render: (i) => [i.assembly_level, i.platform].filter(Boolean).join(', '),
    },
    { key: 'contigs', label: 'Contigs', render: (i) => fmtInt(i.contigs) },
    { key: 'n50', label: 'N50', render: (i) => fmtInt(i.n50) },
    { key: 'gene_count', label: 'Genes', render: (i) => fmtInt(i.gene_count) },
  ].filter((c) => study.isolates.some((i) => (c.has ? c.has(i) : i[c.key] !== null && i[c.key] !== undefined)));

  return (
    <div className="pangenome-page">
      <div className="pangenome-breadcrumb">
        <Link to={config.path}>{config.title}</Link> &rsaquo; {study.title}
        {' '}
        &middot;{' '}
        <Link to={`/help/pangenome${study.section === 'strain_variation' ? '#strain-variation' : ''}`}>Help</Link>
      </div>
      <h1>{study.title}</h1>
      <p className="pangenome-citation">
        {study.reference_dbxref_id ? (
          <Link to={`/reference/${study.reference_dbxref_id}`}>{study.citation}</Link>
        ) : (
          study.citation
        )}
        {study.pubmed && (
          <>
            {' '}
            &middot;{' '}
            <a href={`https://pubmed.ncbi.nlm.nih.gov/${study.pubmed}`} target="_blank" rel="noopener noreferrer">
              PubMed
            </a>
          </>
        )}
        {study.doi && (
          <>
            {' '}
            &middot;{' '}
            <a href={`https://doi.org/${study.doi}`} target="_blank" rel="noopener noreferrer">
              DOI: {study.doi}
            </a>
          </>
        )}
      </p>

      <div className="pangenome-stats">
        <div>
          <strong>{fmtInt(total)}</strong> isolates
        </div>
        {presence && (
          <>
          <div>
            <strong>{fmtInt(study.counts.core)}</strong> {config.core}
          </div>
          <div>
            <strong>{fmtInt(study.counts.accessory)}</strong> {config.accessory}
            {study.section === 'strain_variation' && study.counts.absent_from_all > 0 && (
              <span className="pangenome-stat-split"> ({fmtInt(study.counts.absent_from_all)} from all)</span>
            )}
          </div>
          </>
        )}
        {study.section !== 'strain_variation' && (
          <div title={NOT_IN_REFERENCE_HELP(study.reference_strain)}>
            <strong>{fmtInt(study.counts.not_in_reference)}</strong> not in {study.reference_strain}
            {study.counts.not_in_reference_core !== null && study.counts.not_in_reference_core !== undefined && (
              <span className="pangenome-stat-split">
                {' '}
                ({fmtInt(study.counts.not_in_reference_core)} core, {fmtInt(study.counts.not_in_reference_accessory)}{' '}
                accessory)
              </span>
            )}
          </div>
        )}
        {study.duplication_threshold && (
          <div title="At least twice the normal copy number in one or more isolates">
            <strong>{fmtInt(study.counts.duplicated)}</strong> genes duplicated in some isolates
            <span className="pangenome-stat-split"> ({study.duplication_threshold} or more copies)</span>
          </div>
        )}
        {study.stop_codons_reported && (
          <div>
            <strong>{fmtInt(study.counts.with_stop_codons)}</strong> genes with premature stops
          </div>
        )}
      </div>
      <ul className="pangenome-notes">
        {study.core_definition && (
          <li>
            {config.coreNote} {study.core_definition}.
          </li>
        )}
        {study.notes.map((n) => (
          <li key={n}>{n}</li>
        ))}
        <li>
          Data: {study.data_source}
          {study.license ? ` (${study.license})` : ''}. Loaded {study.loaded}.
        </li>
      </ul>

      <h2 className="section-header">{config.browser}</h2>
      <PangenomeMap
        studyId={studyId}
        referenceStrain={study.reference_strain}
        showStops={study.stop_codons_reported}
        categories={config.categories}
        mapTicks={config.mapTicks}
        stepGene={presence ? config.stepGene : 'gene with a stop'}
        showPresence={presence}
        duplicationThreshold={study.duplication_threshold}
        focusId={filters.q}
        onShowInTable={(id) => {
          setQueryInput(id);
          update({ q: id });
          document.getElementById('pangenome-genes')?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      <h2 className="section-header" id="pangenome-genes">
        Genes
      </h2>
      <div className="pangenome-filters">
        {presence && (
          <select value={filters.category} onChange={(e) => update({ category: e.target.value })}>
            {CATEGORY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.value === 'accessory'
                  ? config.categories.filter
                  : o.value
                    ? config.categories[o.value].replace(/^./, (c) => c.toUpperCase())
                    : o.label}
              </option>
            ))}
          </select>
        )}
        <select value={filters.reference} onChange={(e) => update({ reference: e.target.value })}>
          {REFERENCE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label.replace('reference', study.reference_strain)}
            </option>
          ))}
        </select>
        {study.stop_codons_reported && presence && (
          <label>
            Stop codons{' '}
            <select value={filters.stops} onChange={(e) => update({ stops: e.target.value })}>
              {STOP_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        )}
        {study.duplication_threshold && (
          <label>
            Duplications{' '}
            <select value={filters.duplicated} onChange={(e) => update({ duplicated: e.target.value })}>
              {DUPLICATION_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        )}
        <label>
          Sort{' '}
          <select value={filters.sort} onChange={(e) => update({ sort: e.target.value })}>
            {SORT_OPTIONS.filter(
              (o) =>
                (o.value !== 'stops' || study.stop_codons_reported) &&
                (o.value !== 'duplicated' || study.duplication_threshold)
            ).map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            update({ q: queryInput.trim() });
          }}
        >
          <input
            type="text"
            value={queryInput}
            placeholder="Gene, ortholog or domain"
            onChange={(e) => setQueryInput(e.target.value)}
          />
          <button type="submit">Search</button>
          {filters.q && (
            <button
              type="button"
              onClick={() => {
                setQueryInput('');
                update({ q: '' });
              }}
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {!genes ? (
        <div className="loading">Loading genes...</div>
      ) : genes.error ? (
        <div className="error">Could not load the gene list. Please try again later.</div>
      ) : (
        <>
          <div className="pangenome-count">
            {fmtInt(genes.total)} {genes.total === 1 ? 'gene' : 'genes'} · click a row for details
          </div>
          {genes.genes.length < genes.total && (
            <div className="pangenome-warning">
              Showing the first {fmtInt(genes.genes.length)} of {fmtInt(genes.total)} genes; narrow the list with the
              filters or search, or use the downloads for all of them.
            </div>
          )}
          <div className="ag-theme-alpine pangenome-grid" style={{ width: '100%' }}>
            <AgGridReact
              ref={gridRef}
              rowData={genes.genes}
              columnDefs={columnDefs}
              defaultColDef={{ sortable: true, resizable: true }}
              getRowId={(p) => p.data.id}
              onRowClicked={(e) => setExpanded(expanded === e.data.id ? null : e.data.id)}
              context={{ expanded }}
              rowClassRules={{ 'ag-row-selected': (p) => p.data?.id === p.context.expanded }}
              domLayout="autoHeight"
              pagination
              paginationPageSize={GRID_PAGE_SIZE}
              paginationPageSizeSelector={[10, 25, 50, 100]}
              tooltipShowDelay={300}
              suppressCellFocus
              overlayNoRowsTemplate="No genes match."
            />
          </div>
          {expandedGene && (
            <div className="pangenome-detail-panel">
              <h3>
                <span>
                  {expandedGene.id}
                  {expandedGene.gene_name && ` (${expandedGene.gene_name})`}
                </span>
                <button className="pangenome-link-button" onClick={() => setExpanded(null)}>
                  Close
                </button>
              </h3>
              <GeneDetail studyId={studyId} geneId={expandedGene.id} study={study} />
            </div>
          )}
        </>
      )}

      <h2 className="section-header">Downloads</h2>
      <ul className="pangenome-downloads">
        <li>
          <a href={pangenomeApi.downloadUrl(studyId, 'genes')}>{config.genesDownload}</a> (TSV)
        </li>
        {presence && config.coreDownload && (
          <li>
            <a href={pangenomeApi.downloadUrl(studyId, 'core')}>{config.coreDownload}</a> (TSV)
          </li>
        )}
        {presence && (
          <li>
            <a href={pangenomeApi.downloadUrl(studyId, 'accessory')}>{config.accessoryDownload}</a> (TSV)
          </li>
        )}
        {study.duplication_threshold && (
          <li>
            <a href={pangenomeApi.downloadUrl(studyId, 'duplicated')}>Genes duplicated in some isolates</a> (TSV)
          </li>
        )}
        {study.stop_codons_reported && (
          <li>
            <a href={pangenomeApi.downloadUrl(studyId, 'stop_codons')}>Premature stop codons by isolate</a> (TSV)
          </li>
        )}
        {study.copy_number_reported && (
          <li>
            <a href={pangenomeApi.downloadUrl(studyId, 'copy_number')}>Copy number by gene and isolate</a> (TSV)
          </li>
        )}
        <li>
          <a href={pangenomeApi.downloadUrl(studyId, 'isolates')}>Isolates</a> (TSV)
        </li>
      </ul>

      <h2 className="section-header">
        Isolates ({fmtInt(study.isolates.length)}){' '}
        <button className="pangenome-link-button" onClick={() => setShowIsolates(!showIsolates)}>
          {showIsolates ? 'Hide' : 'Show'}
        </button>
      </h2>
      {showIsolates && (
        <div className="pangenome-scroll">
          <table className="pangenome-table">
            <thead>
              <tr>
                {isolateColumns.map((c) => (
                  <th key={c.key}>{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {study.isolates.map((i) => (
                <tr key={i.name}>
                  {isolateColumns.map((c) => (
                    <td key={c.key}>{c.render(i)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function PangenomePage({ section = 'pangenome' }) {
  const { studyId } = useParams();
  return studyId ? (
    <PangenomeStudy studyId={studyId} section={section} />
  ) : (
    <PangenomeStudies section={section} />
  );
}

export default PangenomePage;
