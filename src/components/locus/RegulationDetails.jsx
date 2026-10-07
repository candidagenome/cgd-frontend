import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import OrganismSelector, { getDefaultOrganism } from './OrganismSelector';
import { formatCitationString } from '../../utils/formatCitation.jsx';
import './LocusComponents.css';
import './RegulationDetails.css';

const REGULATOR_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'binding', label: 'DNA binding evidence' },
  { id: 'documented', label: 'Documented' },
  { id: 'potential', label: 'Predicted site' },
];

const TARGET_FILTERS = [
  { id: 'binding', label: 'DNA binding evidence', count: 'binding' },
  { id: 'documented', label: 'Documented', count: 'documented' },
  { id: 'both', label: 'Documented + predicted', count: 'documented_and_potential' },
  { id: 'potential', label: 'Predicted site', count: 'potential' },
];

const SEQUENCE_LINE = 60;
const REGULATORS_PER_PAGE = 10;

function GeneLink({ gene }) {
  if (!gene) return null;
  if (!gene.feature_name) {
    return <span className="reg-unlinked" title="Not matched to a CGD locus">{gene.display_name}</span>;
  }
  return (
    <Link to={`/locus/${encodeURIComponent(gene.feature_name)}`} title={gene.feature_name}>
      {gene.display_name}
    </Link>
  );
}

function EvidenceBadges({ binding, expression }) {
  return (
    <span className="reg-badges">
      {binding && <span className="reg-badge reg-badge-binding" title="Direct evidence: TF binds the promoter (e.g. ChIP)">DNA binding</span>}
      {expression && <span className="reg-badge reg-badge-expression" title="Indirect evidence: target expression changes when the TF is perturbed">Expression</span>}
    </span>
  );
}

function Direction({ activated, repressed }) {
  if (!activated && !repressed) return <span className="muted">-</span>;
  return (
    <span className="reg-direction">
      {activated && <span className="reg-up" title="TF acts as activator">&#9650; activator</span>}
      {repressed && <span className="reg-down" title="TF acts as repressor">&#9660; repressor</span>}
    </span>
  );
}

function ReferenceCell({ reference }) {
  const { pubmed, citation, dbxref_id: dbxrefId } = reference;
  return (
    <div className="reg-reference">
      {dbxrefId ? (
        <Link to={`/reference/${dbxrefId}`}>{formatCitationString(citation)}</Link>
      ) : (
        <span>{citation || `PMID ${pubmed}`}</span>
      )}
      {pubmed && (
        <a className="reg-pubmed" href={`https://pubmed.ncbi.nlm.nih.gov/${pubmed}`} target="_blank" rel="noopener noreferrer">
          PubMed
        </a>
      )}
    </div>
  );
}

function EvidenceTable({ regulator }) {
  return (
    <div className="reg-evidence">
      <table className="data-table reg-evidence-table">
        <thead>
          <tr>
            <th>Reference</th>
            <th>Evidence</th>
            <th>Effect</th>
            <th>Strain</th>
            <th>Condition</th>
          </tr>
        </thead>
        <tbody>
          {regulator.evidence.map((ev, idx) => (
            <tr key={idx}>
              <td><ReferenceCell reference={ev.reference} /></td>
              <td>
                <strong>{ev.evidence_code === 'Direct' ? 'DNA binding' : 'Expression'}</strong>
                {ev.experiment && <div className="muted">{ev.experiment}</div>}
              </td>
              <td className="reg-nowrap">
                {ev.association_type === 'Positive' && <span className="reg-up">&#9650; activation</span>}
                {ev.association_type === 'Negative' && <span className="reg-down">&#9660; repression</span>}
                {!['Positive', 'Negative'].includes(ev.association_type) && <span className="muted">n/a</span>}
                {ev.log2fc !== null && ev.log2fc !== undefined && (
                  <div className="muted">log2FC {ev.log2fc.toFixed(2)}</div>
                )}
              </td>
              <td>{ev.strain || '-'}</td>
              <td className="reg-condition">
                {ev.environmental_group && <div><strong>{ev.environmental_group}</strong></div>}
                {ev.environmental_condition && (
                  <div className="reg-condition-text" title={ev.environmental_condition}>{ev.environmental_condition}</div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {regulator.pathoyeastract_url && (
        <a href={regulator.pathoyeastract_url} target="_blank" rel="noopener noreferrer" className="reg-external">
          View this association at PathoYeastract &#8599;
        </a>
      )}
    </div>
  );
}

/**
 * Promoter map: one row per TF with a predicted binding site; + strand sites
 * drawn above the row line, - strand sites below. Coordinates run from -1000
 * to -1 relative to the start codon.
 */
function PromoterMap({ promoter, regulators, selectedTf, onSelectTf }) {
  const rows = regulators.filter(r => r.potential && r.sites.length > 0);
  if (!promoter || rows.length === 0) return null;

  const labelWidth = 110;
  const plotWidth = 760;
  const rowHeight = 22;
  const top = 26;
  const height = top + rows.length * rowHeight + 10;
  const span = promoter.end - promoter.start + 1;
  const x = pos => labelWidth + ((pos - promoter.start) / span) * plotWidth;
  const ticks = [];
  for (let t = promoter.start; t < promoter.end; t += 100) ticks.push(t);

  return (
    <svg
      className="reg-promoter-map"
      viewBox={`0 0 ${labelWidth + plotWidth + 40} ${height}`}
      role="img"
      aria-label="Predicted transcription factor binding sites in the promoter"
    >
      {ticks.map(t => (
        <g key={t}>
          <line x1={x(t)} x2={x(t)} y1={top - 6} y2={height - 6} className="reg-map-grid" />
          <text x={x(t)} y={top - 10} className="reg-map-tick" textAnchor="middle">{t}</text>
        </g>
      ))}
      <text x={x(promoter.end) + 4} y={top - 10} className="reg-map-tick">ATG</text>
      {rows.map((reg, i) => {
        const y = top + i * rowHeight + rowHeight / 2;
        const selected = selectedTf === reg.tf.name;
        return (
          <g
            key={reg.tf.name}
            className={`reg-map-row ${selected ? 'selected' : ''}`}
            onClick={() => onSelectTf(selected ? null : reg.tf.name)}
          >
            <rect x={0} y={y - rowHeight / 2} width={labelWidth + plotWidth} height={rowHeight} className="reg-map-hit" />
            <text x={labelWidth - 8} y={y + 4} textAnchor="end" className="reg-map-label">
              {reg.tf.display_name}
              {reg.documented ? ' *' : ''}
            </text>
            <line x1={x(promoter.start)} x2={x(promoter.end)} y1={y} y2={y} className="reg-map-axis" />
            {reg.sites.map((site, j) => (
              <rect
                key={j}
                x={x(site.start)}
                width={Math.max(3, x(site.end + 1) - x(site.start))}
                y={site.strand === '+' ? y - 8 : y}
                height={8}
                className={site.strand === '+' ? 'reg-site-plus' : 'reg-site-minus'}
              >
                <title>{`${reg.tf.display_name}: ${site.strand} strand ${site.start}..${site.end}`}</title>
              </rect>
            ))}
          </g>
        );
      })}
    </svg>
  );
}

function PromoterSequence({ promoter, regulators, selectedTf }) {
  const marks = useMemo(() => {
    if (!promoter) return [];
    const out = new Array(promoter.sequence.length).fill(null);
    regulators
      .filter(r => r.potential && (!selectedTf || r.tf.name === selectedTf))
      .forEach(r => r.sites.forEach(site => {
        for (let p = site.start; p <= site.end; p += 1) {
          const i = p - promoter.start;
          if (i < 0 || i >= out.length) continue;
          out[i] = out[i] && out[i] !== site.strand ? 'both' : site.strand;
        }
      }));
    return out;
  }, [promoter, regulators, selectedTf]);

  if (!promoter) return null;
  const lines = [];
  for (let i = 0; i < promoter.sequence.length; i += SEQUENCE_LINE) {
    const chars = [];
    // Group consecutive bases with the same mark into one span
    let j = i;
    const end = Math.min(i + SEQUENCE_LINE, promoter.sequence.length);
    while (j < end) {
      const mark = marks[j];
      let k = j;
      while (k < end && marks[k] === mark) k += 1;
      const text = promoter.sequence.slice(j, k);
      chars.push(mark
        ? <span key={j} className={`reg-seq-${mark === '+' ? 'plus' : mark === '-' ? 'minus' : 'both'}`}>{text}</span>
        : <React.Fragment key={j}>{text}</React.Fragment>);
      j = k;
    }
    lines.push(
      <div key={i} className="reg-seq-line">
        <span className="reg-seq-coord">{promoter.start + i}</span>
        {chars}
      </div>
    );
  }
  return <pre className="reg-sequence">{lines}</pre>;
}

function RegulatorsView({ orgData }) {
  const [filter, setFilter] = useState('all');
  const [text, setText] = useState('');
  const [expanded, setExpanded] = useState({});
  const [page, setPage] = useState(0);
  const [selectedTf, setSelectedTf] = useState(null);
  const [showSequence, setShowSequence] = useState(false);

  const regulators = orgData.regulators;
  const counts = useMemo(() => ({
    documented: regulators.filter(r => r.documented).length,
    binding: regulators.filter(r => r.binding_evidence).length,
    expression: regulators.filter(r => r.expression_evidence).length,
    potential: regulators.filter(r => r.potential).length,
    both: regulators.filter(r => r.documented && r.potential).length,
  }), [regulators]);

  const visible = regulators.filter(r => {
    if (filter === 'binding' && !r.binding_evidence) return false;
    if (filter === 'documented' && !r.documented) return false;
    if (filter === 'potential' && !r.potential) return false;
    if (!text.trim()) return true;
    const q = text.trim().toLowerCase();
    return [r.tf.display_name, r.tf.name, r.tf.feature_name, ...r.consensus]
      .some(v => v && v.toLowerCase().includes(q));
  });

  const pageCount = Math.max(1, Math.ceil(visible.length / REGULATORS_PER_PAGE));
  const currentPage = Math.min(page, pageCount - 1);
  const pageRows = visible.slice(currentPage * REGULATORS_PER_PAGE, (currentPage + 1) * REGULATORS_PER_PAGE);
  const changeFilter = id => {
    setFilter(id);
    setPage(0);
  };
  const changeText = value => {
    setText(value);
    setPage(0);
  };

  const toggle = name => setExpanded(prev => ({ ...prev, [name]: !prev[name] }));
  const selectTf = name => {
    setSelectedTf(name);
    if (name) setShowSequence(true);
  };

  return (
    <div className="reg-view">
      <div className="reg-stats">
        <div className="reg-stat"><span className="reg-stat-value">{counts.documented}</span>documented regulators</div>
        <div className="reg-stat"><span className="reg-stat-value">{counts.binding}</span>with DNA binding evidence</div>
        <div className="reg-stat"><span className="reg-stat-value">{counts.expression}</span>with expression evidence</div>
        <div className="reg-stat"><span className="reg-stat-value">{counts.potential}</span>with a predicted site in the promoter</div>
        <div className="reg-stat"><span className="reg-stat-value">{counts.both}</span>documented and predicted</div>
      </div>

      {orgData.promoter && counts.potential > 0 && (
        <section className="reg-section">
          <h4 className="category-header">
            Predicted binding sites in the {orgData.locus_display_name} promoter
            <span className="annotation-count">(upstream -1000 to -1; * = also documented)</span>
          </h4>
          <div className="reg-map-legend">
            <span><span className="reg-swatch reg-site-plus" /> + strand</span>
            <span><span className="reg-swatch reg-site-minus" /> - strand</span>
            <span className="muted">Click a transcription factor to highlight its sites in the sequence.</span>
          </div>
          <PromoterMap
            promoter={orgData.promoter}
            regulators={regulators}
            selectedTf={selectedTf}
            onSelectTf={selectTf}
          />
          <button type="button" className="reg-link-button" onClick={() => setShowSequence(s => !s)}>
            {showSequence ? '▼' : '▶'} Promoter sequence
            {selectedTf && ` - ${regulators.find(r => r.tf.name === selectedTf)?.tf.display_name} sites highlighted`}
          </button>
          {selectedTf && (
            <button type="button" className="reg-link-button" onClick={() => setSelectedTf(null)}>show all sites</button>
          )}
          {showSequence && (
            <PromoterSequence promoter={orgData.promoter} regulators={regulators} selectedTf={selectedTf} />
          )}
        </section>
      )}

      <section className="reg-section">
        <h4 className="category-header">
          Transcription factors regulating {orgData.locus_display_name}
          <span className="annotation-count">({visible.length} of {regulators.length})</span>
        </h4>
        <div className="reg-controls">
          <div className="reg-segmented" role="group" aria-label="Filter regulators">
            {REGULATOR_FILTERS.map(f => (
              <button
                key={f.id}
                type="button"
                className={filter === f.id ? 'active' : ''}
                onClick={() => changeFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
          <input
            type="text"
            className="reg-filter-input"
            value={text}
            onChange={e => changeText(e.target.value)}
            placeholder="Filter by TF or motif..."
          />
        </div>
        <table className="data-table reg-table">
          <thead>
            <tr>
              <th>Transcription factor</th>
              <th>Documented evidence</th>
              <th>Effect on {orgData.locus_display_name}</th>
              <th>References</th>
              <th>Predicted site (consensus)</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map(reg => (
              <React.Fragment key={reg.tf.name}>
                <tr className={expanded[reg.tf.name] ? 'reg-row-open' : ''}>
                  <td>
                    <GeneLink gene={reg.tf} />
                    {reg.tf.name !== reg.tf.display_name && <div className="muted reg-small">{reg.tf.name}</div>}
                  </td>
                  <td>{reg.documented ? <EvidenceBadges binding={reg.binding_evidence} expression={reg.expression_evidence} /> : <span className="muted">-</span>}</td>
                  <td><Direction activated={reg.activator} repressed={reg.repressor} /></td>
                  <td>
                    {reg.documented ? (
                      <button type="button" className="reg-link-button" onClick={() => toggle(reg.tf.name)}>
                        {expanded[reg.tf.name] ? '▼' : '▶'} {reg.reference_count} paper{reg.reference_count === 1 ? '' : 's'}
                      </button>
                    ) : <span className="muted">-</span>}
                  </td>
                  <td>
                    {reg.potential ? (
                      <button
                        type="button"
                        className="reg-link-button reg-motif"
                        title="Highlight in the promoter"
                        onClick={() => selectTf(reg.tf.name)}
                      >
                        {reg.sites.length} site{reg.sites.length === 1 ? '' : 's'}
                        <span className="reg-consensus">{reg.consensus.join(' | ')}</span>
                      </button>
                    ) : <span className="muted">-</span>}
                  </td>
                </tr>
                {expanded[reg.tf.name] && (
                  <tr className="reg-evidence-row">
                    <td colSpan={5}><EvidenceTable regulator={reg} /></td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
        {pageCount > 1 && (
          <div className="reg-pager">
            <button type="button" onClick={() => setPage(0)} disabled={currentPage === 0}>&laquo;</button>
            <button type="button" onClick={() => setPage(currentPage - 1)} disabled={currentPage === 0}>&lsaquo; Prev</button>
            <span>
              {currentPage * REGULATORS_PER_PAGE + 1}-{Math.min((currentPage + 1) * REGULATORS_PER_PAGE, visible.length)}
              {' '}of {visible.length} &middot; page {currentPage + 1} of {pageCount}
            </span>
            <button type="button" onClick={() => setPage(currentPage + 1)} disabled={currentPage >= pageCount - 1}>Next &rsaquo;</button>
            <button type="button" onClick={() => setPage(pageCount - 1)} disabled={currentPage >= pageCount - 1}>&raquo;</button>
          </div>
        )}
      </section>
    </div>
  );
}

function TargetsView({ orgData }) {
  const tf = orgData.tf_targets;
  const [filter, setFilter] = useState('binding');
  const [text, setText] = useState('');

  const rows = useMemo(() => tf.targets.filter(t => {
    if (filter === 'binding') return t.binding;
    if (filter === 'documented') return t.documented;
    if (filter === 'both') return t.documented && t.potential;
    if (filter === 'potential') return t.potential;
    return true;
  }), [tf.targets, filter]);

  const columnDefs = useMemo(() => [
    {
      headerName: 'Target gene',
      flex: 1,
      minWidth: 120,
      valueGetter: p => p.data.gene.display_name,
      cellRenderer: p => <GeneLink gene={p.data.gene} />,
    },
    {
      headerName: 'Systematic name',
      flex: 1,
      minWidth: 120,
      valueGetter: p => p.data.gene.feature_name || p.data.gene.name,
    },
    {
      headerName: 'Documented evidence',
      flex: 1.3,
      minWidth: 170,
      valueGetter: p => [p.data.binding && 'DNA binding', p.data.expression && 'Expression'].filter(Boolean).join(', '),
      cellRenderer: p => <EvidenceBadges binding={p.data.binding} expression={p.data.expression} />,
    },
    {
      headerName: `${orgData.locus_display_name} acts as`,
      flex: 1.2,
      minWidth: 160,
      valueGetter: p => [p.data.activated && 'activator', p.data.repressed && 'repressor'].filter(Boolean).join(', '),
      cellRenderer: p => <Direction activated={p.data.activated} repressed={p.data.repressed} />,
    },
    {
      headerName: 'Predicted site',
      flex: 0.8,
      minWidth: 110,
      valueGetter: p => (p.data.potential ? 'yes' : ''),
      cellRenderer: p => (p.data.potential ? <span className="reg-check">&#10003;</span> : ''),
    },
  ], [orgData.locus_display_name]);

  const downloadTsv = () => {
    const header = ['gene', 'systematic_name', 'dna_binding', 'expression', 'activated', 'repressed', 'predicted_site'];
    const lines = [header.join('\t')].concat(rows.map(t => [
      t.gene.display_name, t.gene.feature_name || t.gene.name,
      t.binding ? 'Y' : '', t.expression ? 'Y' : '', t.activated ? 'Y' : '', t.repressed ? 'Y' : '', t.potential ? 'Y' : '',
    ].join('\t')));
    const blob = new Blob([lines.join('\n') + '\n'], { type: 'text/tab-separated-values' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${orgData.locus_display_name}_targets_${filter}.tsv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="reg-view">
      <p className="reg-note">
        {orgData.locus_display_name} ({tf.tf_protein}) is a transcription factor. Genome-wide expression studies
        make many documented associations indirect; associations with <strong>DNA binding evidence</strong> are
        the most direct, and are shown first.
      </p>
      <div className="reg-stats">
        <div className="reg-stat"><span className="reg-stat-value">{tf.counts.binding}</span>targets with DNA binding evidence</div>
        <div className="reg-stat"><span className="reg-stat-value">{tf.counts.documented}</span>documented targets</div>
        <div className="reg-stat"><span className="reg-stat-value">{tf.counts.activated}</span>activated</div>
        <div className="reg-stat"><span className="reg-stat-value">{tf.counts.repressed}</span>repressed</div>
        <div className="reg-stat"><span className="reg-stat-value">{tf.counts.potential}</span>with a predicted site</div>
      </div>
      {tf.consensus.length > 0 && (
        <p className="reg-small">
          Binding consensus: <span className="reg-consensus">{tf.consensus.join(' | ')}</span>
        </p>
      )}
      {tf.counts.potential > 1000 && tf.counts.potential >= 0.9 * tf.targets.length && (
        <p className="reg-note reg-warning">
          The consensus includes short or degenerate motifs that occur in most promoters, so a predicted site
          says little about regulation by {orgData.locus_display_name}.
        </p>
      )}
      <div className="reg-controls">
        <div className="reg-segmented" role="group" aria-label="Filter targets">
          {TARGET_FILTERS.map(f => (
            <button
              key={f.id}
              type="button"
              className={filter === f.id ? 'active' : ''}
              onClick={() => setFilter(f.id)}
            >
              {f.label} ({tf.counts[f.count]})
            </button>
          ))}
        </div>
        <input
          type="text"
          className="reg-filter-input"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Filter targets..."
        />
        <button type="button" className="reg-download" onClick={downloadTsv} disabled={rows.length === 0}>
          Download ({rows.length})
        </button>
      </div>
      <div className="ag-theme-alpine" style={{ width: '100%' }}>
        <AgGridReact
          rowData={rows}
          columnDefs={columnDefs}
          defaultColDef={{ sortable: true, resizable: true }}
          quickFilterText={text}
          domLayout="autoHeight"
          pagination
          paginationPageSize={25}
          paginationPageSizeSelector={[25, 100, 500]}
          suppressCellFocus
        />
      </div>
    </div>
  );
}

function RegulationDetails({ data, loading, error, selectedOrganism, onOrganismChange, orthologOrganisms = [] }) {
  // The view resets to Regulators whenever the organism changes
  const [viewState, setViewState] = useState({ organism: null, view: 'regulators' });
  const view = viewState.organism === selectedOrganism ? viewState.view : 'regulators';
  const setView = next => setViewState({ organism: selectedOrganism, view: next });

  const results = data?.results;
  const organisms = useMemo(() => (results ? Object.keys(results) : []), [results]);

  useEffect(() => {
    if (organisms.length > 0 && !selectedOrganism) {
      const defaultOrg = getDefaultOrganism(organisms);
      if (defaultOrg && onOrganismChange) onOrganismChange(defaultOrg);
    }
  }, [organisms, selectedOrganism, onOrganismChange]);

  const orgData = selectedOrganism ? data?.results?.[selectedOrganism] : null;
  const isTf = Boolean(orgData?.tf_targets);

  if (loading) return <div className="loading">Loading regulation data...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!data?.results) return <div className="no-data">No regulation data available</div>;

  return (
    <div className="regulation-details">
      <OrganismSelector
        organisms={organisms}
        selectedOrganism={selectedOrganism}
        onOrganismChange={onOrganismChange}
        dataType="regulation"
        orthologOrganisms={orthologOrganisms}
      />

      {orgData && (
        <div className="reg-intro">
          <p>
            Transcriptional regulation of <strong>{orgData.locus_display_name}</strong> from{' '}
            <a href="https://yeastract-plus.org/pathoyeastract/" target="_blank" rel="noopener noreferrer">PathoYeastract</a>.
            {' '}<em>Documented</em> associations are curated from the literature, with direct (DNA binding) or
            indirect (expression) evidence. <em>Predicted</em> associations mean the TF&apos;s binding consensus
            occurs in the 1 kb upstream region; they are not experimentally shown.
          </p>
          {orgData.source?.gene_url && (
            <p className="reg-source">
              <a href={orgData.source.gene_url} target="_blank" rel="noopener noreferrer">
                {orgData.locus_display_name} at PathoYeastract &#8599;
              </a>
              {orgData.source.retrieved && <span className="muted"> &middot; data retrieved {orgData.source.retrieved}</span>}
              {orgData.source.citation_doi && (
                <span className="muted"> &middot; cite{' '}
                  <a href={`https://doi.org/${orgData.source.citation_doi}`} target="_blank" rel="noopener noreferrer">
                    Teixeira et al. (2023) NAR
                  </a>
                </span>
              )}
            </p>
          )}
        </div>
      )}

      {orgData && !orgData.covered && (
        <p className="no-data">
          PathoYeastract does not cover {selectedOrganism}, so no regulatory associations are available for this
          organism. Use the organism selector to view an ortholog in another species.
        </p>
      )}
      {orgData && orgData.covered && !orgData.has_data && (
        <p className="no-data">
          No regulatory associations are loaded for {orgData.locus_display_name}. Check{' '}
          <a href={orgData.source?.gene_url} target="_blank" rel="noopener noreferrer">PathoYeastract</a> directly.
        </p>
      )}

      {orgData?.has_data && (
        <>
          {isTf && (
            <div className="expression-subtabs reg-subtabs">
              <button
                type="button"
                className={`subtab-button ${view === 'regulators' ? 'active' : ''}`}
                onClick={() => setView('regulators')}
              >
                Regulators of {orgData.locus_display_name} ({orgData.regulators.length})
              </button>
              <button
                type="button"
                className={`subtab-button ${view === 'targets' ? 'active' : ''}`}
                onClick={() => setView('targets')}
              >
                Targets of {orgData.locus_display_name} ({orgData.tf_targets.counts.documented + orgData.tf_targets.counts.potential - orgData.tf_targets.counts.documented_and_potential})
              </button>
            </div>
          )}
          {view === 'targets' && isTf
            ? <TargetsView orgData={orgData} />
            : orgData.regulators.length > 0
              ? <RegulatorsView orgData={orgData} />
              : <p className="no-data">PathoYeastract lists no regulators of {orgData.locus_display_name}.</p>}
        </>
      )}

      {!orgData && <p className="no-data">Select an organism to view regulation data</p>}
    </div>
  );
}

export default RegulationDetails;
