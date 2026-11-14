import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import pangenomeApi from '../api/pangenomeApi';
import PangenomeMap from '../components/pangenome/PangenomeMap';
import './PangenomePage.css';

// The dropdowns filter on the server; the grid pages and sorts every matching gene on the client
const MAX_GENES = 10000;
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
  { value: 'novel', label: 'Not in reference' },
];
const STOP_OPTIONS = [
  { value: '', label: 'Any' },
  { value: 'true', label: 'With premature stops' },
  { value: 'false', label: 'Without' },
];
const SORT_OPTIONS = [
  { value: 'position', label: 'Chromosome position' },
  { value: 'id', label: 'Gene ID' },
  { value: 'presence', label: 'Rarest accessory first' },
  { value: 'stops', label: 'Most isolates with stops' },
];

const shortCitation = (citation) => (citation || '').replace(/\) .*$/, ')');

/** Study list (/pangenome) */
function PangenomeStudies() {
  const [studies, setStudies] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    pangenomeApi
      .getStudies()
      .then((r) => setStudies(r.studies))
      .catch(() => setError('Could not load pangenome studies.'));
  }, []);

  return (
    <div className="pangenome-page">
      <h1>Pangenome Browser</h1>
      <p className="pangenome-intro">
        Published pangenome studies of CGD species: which genes are shared by all or nearly all isolates of a species (core),
        which vary between isolates (accessory), and genes absent from the CGD reference strain.
      </p>
      {error && <div className="error">{error}</div>}
      {!studies && !error && <div className="loading">Loading...</div>}
      {studies && (
        <div className="pangenome-scroll">
          <table className="pangenome-table">
            <thead>
              <tr>
                <th>Study</th>
                <th>Species</th>
                <th>Isolates</th>
                <th>Core</th>
                <th>Accessory</th>
                <th>Not in reference</th>
              </tr>
            </thead>
            <tbody>
              {studies.map((s) => (
                <tr key={s.study_id}>
                  <td>
                    <Link to={`/pangenome/${s.study_id}`}>{s.title}</Link>
                    <div className="pangenome-note">{shortCitation(s.citation)}</div>
                  </td>
                  <td>
                    <em>{s.species}</em> ({s.reference_strain})
                  </td>
                  <td>{fmtInt(s.isolate_count)}</td>
                  <td>{fmtInt(s.counts.core)}</td>
                  <td>{fmtInt(s.counts.accessory)}</td>
                  <td>{fmtInt(s.counts.not_in_reference)}</td>
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
      {study.stop_codons_reported && <h4>Premature stop codons</h4>}
      {!study.stop_codons_reported ? null : gene.stop_codons.length === 0 ? (
        <p className="pangenome-note">None reported.</p>
      ) : (
        <table className="pangenome-subtable">
          <thead>
            <tr>
              <th>Position</th>
              <th>Codon (aa)</th>
              <th>Homozygous in</th>
              <th>Heterozygous in</th>
            </tr>
          </thead>
          <tbody>
            {gene.stop_codons.map((s) => (
              <tr key={`${s.chromosome}-${s.position}`}>
                <td>
                  {s.chromosome}:{fmtInt(s.position)}
                </td>
                <td>{s.aa_position}</td>
                <td>{s.homozygous.length ? s.homozygous.join(', ') : '-'}</td>
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
function PangenomeStudy({ studyId }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [study, setStudy] = useState(null);
  const [genes, setGenes] = useState(null);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [showIsolates, setShowIsolates] = useState(false);
  const [queryInput, setQueryInput] = useState(searchParams.get('q') || '');
  const gridRef = useRef(null);

  const filters = useMemo(
    () => ({
      category: searchParams.get('category') || '',
      reference: searchParams.get('reference') || '',
      stops: searchParams.get('stops') || '',
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
    ['category', 'reference', 'stops', 'q'].forEach((k) => {
      if (filters[k]) params[k] = filters[k];
    });
    pangenomeApi
      .getGenes(studyId, params)
      .then((r) => {
        setGenes(r);
        // A search that finds one gene (e.g. "Show in gene table") opens its detail
        setExpanded(r.genes.length === 1 ? r.genes[0].id : null);
      })
      .catch(() => setGenes({ total: 0, genes: [] }));
  }, [studyId, filters]);

  const total = study?.isolate_count;
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
      {
        headerName: 'Category',
        minWidth: 200,
        valueGetter: (p) => `${p.data.category}${p.data.in_reference ? '' : ' not in reference'}`,
        cellRenderer: (p) => (
          <>
            <span className={`pangenome-badge ${p.data.category}`}>{p.data.category}</span>
            {!p.data.in_reference && <span className="pangenome-badge novel">not in reference</span>}
          </>
        ),
      },
      {
        headerName: 'Isolates',
        width: 90,
        // Core genes have no per-gene count in the study; sort them above every accessory gene
        valueGetter: (p) => (p.data.presence ?? (p.data.category === 'core' ? total + 1 : null)),
        valueFormatter: (p) =>
          p.data.presence !== null && p.data.presence !== undefined
            ? `${p.data.presence}/${total}`
            : p.data.category === 'core'
              ? '≥99.5%'
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
    [total, study?.stop_codons_reported]
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
        <Link to="/pangenome">Pangenome Browser</Link> &rsaquo; {study.title}
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
      </p>

      <div className="pangenome-stats">
        <div>
          <strong>{fmtInt(total)}</strong> isolates
        </div>
        <div>
          <strong>{fmtInt(study.counts.core)}</strong> core genes
        </div>
        <div>
          <strong>{fmtInt(study.counts.accessory)}</strong> accessory genes
        </div>
        <div>
          <strong>{fmtInt(study.counts.not_in_reference)}</strong> not in {study.reference_strain}
          {study.counts.not_in_reference_core !== null && study.counts.not_in_reference_core !== undefined && (
            <span className="pangenome-stat-split">
              {' '}
              ({fmtInt(study.counts.not_in_reference_core)} core, {fmtInt(study.counts.not_in_reference_accessory)}{' '}
              accessory)
            </span>
          )}
        </div>
        {study.stop_codons_reported && (
          <div>
            <strong>{fmtInt(study.counts.with_stop_codons)}</strong> genes with premature stops
          </div>
        )}
      </div>
      <ul className="pangenome-notes">
        {study.core_definition && <li>Core genes are {study.core_definition}.</li>}
        {study.notes.map((n) => (
          <li key={n}>{n}</li>
        ))}
        <li>
          Data: {study.data_source}
          {study.license ? ` (${study.license})` : ''}. Loaded {study.loaded}.
        </li>
      </ul>

      <h2 className="section-header">Pangenome browser</h2>
      <PangenomeMap
        studyId={studyId}
        referenceStrain={study.reference_strain}
        showStops={study.stop_codons_reported}
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
        <select value={filters.category} onChange={(e) => update({ category: e.target.value })}>
          {CATEGORY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select value={filters.reference} onChange={(e) => update({ reference: e.target.value })}>
          {REFERENCE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label.replace('reference', study.reference_strain)}
            </option>
          ))}
        </select>
        {study.stop_codons_reported && (
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
        <label>
          Sort{' '}
          <select value={filters.sort} onChange={(e) => update({ sort: e.target.value })}>
            {SORT_OPTIONS.filter((o) => o.value !== 'stops' || study.stop_codons_reported).map((o) => (
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
      ) : (
        <>
          <div className="pangenome-count">
            {fmtInt(genes.total)} {genes.total === 1 ? 'gene' : 'genes'} · click a row for details
          </div>
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
          <a href={pangenomeApi.downloadUrl(studyId, 'genes')}>All pangenome genes</a> (TSV)
        </li>
        <li>
          <a href={pangenomeApi.downloadUrl(studyId, 'accessory')}>Accessory genes</a> (TSV)
        </li>
        {study.stop_codons_reported && (
          <li>
            <a href={pangenomeApi.downloadUrl(studyId, 'stop_codons')}>Premature stop codons by isolate</a> (TSV)
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

function PangenomePage() {
  const { studyId } = useParams();
  return studyId ? <PangenomeStudy studyId={studyId} /> : <PangenomeStudies />;
}

export default PangenomePage;
