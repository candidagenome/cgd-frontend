import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import pangenomeApi from '../api/pangenomeApi';
import './PangenomePage.css';

const PAGE_SIZE = 50;
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
        Published pangenome studies of CGD species: which genes are shared by all isolates of a species (core),
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

/** Expanded row: premature stop codons per isolate and the two divergent strains */
function GeneDetail({ studyId, geneId, divergentStrains }) {
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
      <h4>Premature stop codons</h4>
      {gene.stop_codons.length === 0 ? (
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

  const filters = useMemo(
    () => ({
      category: searchParams.get('category') || '',
      reference: searchParams.get('reference') || '',
      stops: searchParams.get('stops') || '',
      q: searchParams.get('q') || '',
      sort: searchParams.get('sort') || 'position',
      page: Number(searchParams.get('page') || 1),
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
    const params = { sort: filters.sort, page: filters.page, page_size: PAGE_SIZE };
    ['category', 'reference', 'stops', 'q'].forEach((k) => {
      if (filters[k]) params[k] = filters[k];
    });
    pangenomeApi
      .getGenes(studyId, params)
      .then(setGenes)
      .catch(() => setGenes({ total: 0, genes: [] }));
  }, [studyId, filters]);

  // Dropdowns apply immediately; the text search waits for Search / Enter
  const update = (changes) => {
    const next = new URLSearchParams(searchParams);
    Object.entries({ ...changes, page: changes.page || '' }).forEach(([k, v]) => {
      if (v) next.set(k, v);
      else next.delete(k);
    });
    setExpanded(null);
    setSearchParams(next);
  };

  if (error) return <div className="pangenome-page error">{error}</div>;
  if (!study) return <div className="pangenome-page loading">Loading...</div>;

  const total = study.isolate_count;
  const pages = genes ? Math.max(1, Math.ceil(genes.total / PAGE_SIZE)) : 1;

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
        </div>
        <div>
          <strong>{fmtInt(study.counts.with_stop_codons)}</strong> genes with premature stops
        </div>
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

      <h2 className="section-header">Genes</h2>
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
        <label>
          Sort{' '}
          <select value={filters.sort} onChange={(e) => update({ sort: e.target.value })}>
            {SORT_OPTIONS.map((o) => (
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
            {fmtInt(genes.total)} {genes.total === 1 ? 'gene' : 'genes'}
            {pages > 1 && ` · page ${filters.page} of ${pages}`}
          </div>
          <div className="pangenome-scroll">
            <table className="pangenome-table">
              <thead>
                <tr>
                  <th>Gene</th>
                  <th>CGD locus</th>
                  <th>Category</th>
                  <th>Isolates</th>
                  <th>Type</th>
                  <th>Ortholog / note</th>
                  <th>Stops</th>
                </tr>
              </thead>
              <tbody>
                {genes.genes.map((g) => (
                  <React.Fragment key={g.id}>
                    <tr
                      className={`pangenome-row ${expanded === g.id ? 'expanded' : ''}`}
                      onClick={() => setExpanded(expanded === g.id ? null : g.id)}
                      title="Show details"
                    >
                      <td className="pangenome-id">
                        <span className="pangenome-toggle">{expanded === g.id ? '▾' : '▸'}</span> {g.id}
                      </td>
                      <td>
                        {g.reference_gene ? (
                          <Link to={`/locus/${g.reference_gene}`} onClick={(e) => e.stopPropagation()}>
                            {g.gene_name ? `${g.gene_name} / ${g.reference_gene}` : g.reference_gene}
                          </Link>
                        ) : (
                          <span className="pangenome-note">none</span>
                        )}
                      </td>
                      <td>
                        <span className={`pangenome-badge ${g.category}`}>{g.category}</span>
                        {!g.in_reference && <span className="pangenome-badge novel">not in reference</span>}
                      </td>
                      <td>{g.presence !== null && g.presence !== undefined ? `${g.presence}/${total}` : ''}</td>
                      <td>{g.type}</td>
                      <td className="pangenome-note-cell">
                        {[g.ortholog, g.note].filter(Boolean).join(' — ')}
                      </td>
                      <td>
                        {g.stop_codon_count > 0
                          ? `${g.stop_codon_count} site${g.stop_codon_count > 1 ? 's' : ''}, ${g.stop_codon_isolates} isol.`
                          : ''}
                      </td>
                    </tr>
                    {expanded === g.id && (
                      <tr className="pangenome-detail-row">
                        <td colSpan={7}>
                          <GeneDetail
                            studyId={studyId}
                            geneId={g.id}
                            divergentStrains={study.divergent_strains}
                          />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
          {pages > 1 && (
            <div className="pangenome-pager">
              <button disabled={filters.page <= 1} onClick={() => update({ page: String(filters.page - 1) })}>
                Previous
              </button>
              <span>
                Page {filters.page} of {pages}
              </span>
              <button disabled={filters.page >= pages} onClick={() => update({ page: String(filters.page + 1) })}>
                Next
              </button>
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
        <li>
          <a href={pangenomeApi.downloadUrl(studyId, 'stop_codons')}>Premature stop codons by isolate</a> (TSV)
        </li>
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
                <th>Isolate</th>
                <th>Origin</th>
                <th>Reads</th>
                <th>Assembly</th>
                <th>Contigs</th>
                <th>N50</th>
              </tr>
            </thead>
            <tbody>
              {study.isolates.map((i) => (
                <tr key={i.name}>
                  <td>{i.name}</td>
                  <td>{i.origin}</td>
                  <td>
                    {[i.short_read_accession, i.long_read_accession].filter(Boolean).map((acc) => (
                      <a
                        key={acc}
                        className="pangenome-accession"
                        href={`https://www.ncbi.nlm.nih.gov/sra/?term=${encodeURIComponent(acc)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {acc}
                      </a>
                    ))}
                  </td>
                  <td>{[i.assembly_level, i.platform].filter(Boolean).join(', ')}</td>
                  <td>{fmtInt(i.contigs)}</td>
                  <td>{fmtInt(i.n50)}</td>
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
