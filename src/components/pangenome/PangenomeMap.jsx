import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import pangenomeApi from '../../api/pangenomeApi';

const LABEL_W = 92;
const DEFAULT_WINDOW = 60000;
const MIN_WINDOW = 2000;
const fmt = (v) => Number(v).toLocaleString();

// Accessory gene colour by the share of isolates carrying it
const frequencyColor = (presence, total) => {
  if (presence === null || presence === undefined) return '#9e9e9e';
  const f = presence / total;
  if (f < 0.1) return '#c62828';
  if (f < 0.5) return '#ef6c00';
  return '#f9a825';
};
const geneLabel = (g) => (g.placed_by === 'own' && g.gene_name ? g.gene_name : g.id);
const shortChrom = (name) => name.replace(/^.*_Chr_?/i, 'Chr ');

/** Lay out overlapping intervals in lanes; returns [{item, lane}] and the lane count */
function stack(items, gap) {
  const laneEnds = [];
  const placed = items.map((item) => {
    let lane = laneEnds.findIndex((end) => item.start > end + gap);
    if (lane < 0) {
      lane = laneEnds.length;
      laneEnds.push(0);
    }
    laneEnds[lane] = item.end;
    return { item, lane };
  });
  return { placed, lanes: Math.max(1, laneEnds.length) };
}

function useWidth(ref) {
  const [width, setWidth] = useState(900);
  useEffect(() => {
    if (!ref.current) return undefined;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(320, Math.floor(entry.contentRect.width))));
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);
  return width;
}

/**
 * Graphical pangenome browser: a genome overview of every chromosome with
 * accessory genes and premature stop codons, and a zoomable region view with
 * gene, variant, isolate-frequency and stop-codon tracks.
 */
function PangenomeMap({ studyId, referenceStrain, focusId, onShowInTable }) {
  const containerRef = useRef(null);
  const width = useWidth(containerRef);
  const [map, setMap] = useState(null);
  const [error, setError] = useState(null);
  const [view, setView] = useState(null); // { chrom, start, end }
  const [selectedId, setSelectedId] = useState(null);
  const [showUnplaced, setShowUnplaced] = useState(false);

  useEffect(() => {
    pangenomeApi
      .getMap(studyId)
      .then(setMap)
      .catch(() => setError('Could not load the pangenome map.'));
  }, [studyId]);

  const byChrom = useMemo(() => {
    const out = {};
    (map?.genes || []).forEach((g) => {
      (out[g.chromosome] = out[g.chromosome] || []).push(g);
    });
    return out;
  }, [map]);
  const accessory = useMemo(() => (map?.genes || []).filter((g) => g.category === 'accessory'), [map]);
  const lengths = useMemo(
    () => Object.fromEntries((map?.chromosomes || []).map((c) => [c.name, c.length])),
    [map]
  );

  const centerOn = (gene, windowSize) => {
    const size = windowSize || Math.max(DEFAULT_WINDOW / 2, (gene.end - gene.start) * 6);
    const mid = (gene.start + gene.end) / 2;
    const start = Math.max(0, Math.round(mid - size / 2));
    setView({ chrom: gene.chromosome, start, end: Math.min(lengths[gene.chromosome], start + size) });
    setSelectedId(gene.id);
  };

  // Initial view: the gene named in the page's search, else the first accessory gene
  const focusKey = `${map ? 'loaded' : ''}:${focusId || ''}`;
  const [appliedFocus, setAppliedFocus] = useState(null);
  if (map && appliedFocus !== focusKey) {
    setAppliedFocus(focusKey);
    const wanted = focusId && map.genes.find((g) => g.id.toUpperCase() === focusId.toUpperCase());
    const target = wanted || accessory[0] || map.genes[0];
    if (target) {
      const size = Math.max(DEFAULT_WINDOW / 2, (target.end - target.start) * 6);
      const mid = (target.start + target.end) / 2;
      const start = Math.max(0, Math.round(mid - size / 2));
      setView({ chrom: target.chromosome, start, end: Math.min(lengths[target.chromosome], start + size) });
      setSelectedId(target.id);
    }
  }

  if (error || !map || !view) {
    return (
      <div className="pg-browser" ref={containerRef}>
        {error ? <div className="error">{error}</div> : <div className="loading">Loading pangenome map...</div>}
      </div>
    );
  }

  const total = map.isolate_count;
  const maxLen = Math.max(...map.chromosomes.map((c) => c.length));
  const trackW = width - LABEL_W - 12;
  const selected = map.genes.find((g) => g.id === selectedId);

  // ---------- overview ----------
  const rowH = 26;
  const overviewH = map.chromosomes.length * rowH + 6;
  const ox = (pos) => LABEL_W + (pos / maxLen) * trackW;

  const overview = (
    <svg className="pg-overview" width={width} height={overviewH} role="img" aria-label="Genome overview">
      {map.chromosomes.map((c, i) => {
        const y = i * rowH + 10;
        const genes = byChrom[c.name] || [];
        const barEnd = ox(c.length);
        return (
          <g key={c.name}>
            <text x={LABEL_W - 8} y={y + 8} className="pg-axis-label" textAnchor="end">
              {shortChrom(c.name)}
            </text>
            <rect
              x={LABEL_W}
              y={y}
              width={barEnd - LABEL_W}
              height={10}
              rx={5}
              className="pg-chrom-bar"
              onClick={(e) => {
                const rect = e.currentTarget.ownerSVGElement.getBoundingClientRect();
                const pos = ((e.clientX - rect.left - LABEL_W) / trackW) * maxLen;
                const size = view.end - view.start;
                const start = Math.max(0, Math.min(c.length - size, Math.round(pos - size / 2)));
                setView({ chrom: c.name, start, end: Math.min(c.length, start + size) });
              }}
            />
            {genes
              .filter((g) => g.stops?.length)
              .map((g) => (
                <line
                  key={`s-${g.id}`}
                  x1={ox(g.start)}
                  x2={ox(g.start)}
                  y1={y + 11}
                  y2={y + 15}
                  className="pg-ov-stop"
                />
              ))}
            {genes
              .filter((g) => g.category === 'accessory')
              .map((g) => (
                <rect
                  key={`a-${g.id}`}
                  x={ox(g.start) - 1.5}
                  y={y - 3}
                  width={3}
                  height={16}
                  fill={frequencyColor(g.presence, total)}
                  className="pg-ov-accessory"
                  onClick={() => centerOn(g)}
                >
                  <title>{`${g.id}: ${g.presence}/${total} isolates`}</title>
                </rect>
              ))}
            {view.chrom === c.name && (
              <rect
                x={ox(view.start)}
                y={y - 5}
                width={Math.max(3, ox(view.end) - ox(view.start))}
                height={20}
                className="pg-ov-window"
              />
            )}
          </g>
        );
      })}
    </svg>
  );

  // ---------- region view ----------
  const span = view.end - view.start;
  const rx = (pos) => LABEL_W + ((pos - view.start) / span) * trackW;
  const inView = (byChrom[view.chrom] || []).filter((g) => g.end >= view.start && g.start <= view.end);
  const refGenes = inView.filter((g) => g.placed_by === 'own' && g.in_reference);
  const variants = inView.filter((g) => !(g.placed_by === 'own' && g.in_reference));
  const pxPerBp = trackW / span;
  const geneStack = stack(refGenes, 2 / pxPerBp);
  const variantStack = stack(variants, 90 / pxPerBp);
  const stopsInView = inView.flatMap((g) =>
    (g.stops || []).filter((s) => s.position >= view.start && s.position <= view.end).map((s) => ({ ...s, gene: g }))
  );

  const laneH = 18; // variants: label beside the box
  const geneLaneH = 30; // reference genes: label under the box
  let y = 0;
  const axisY = (y += 22);
  const genesY = (y += 14);
  y += geneStack.lanes * geneLaneH + 8;
  const variantsY = y;
  y += Math.max(1, variantStack.lanes) * laneH + 22;
  const freqY = y;
  const freqH = 46;
  y += freqH + 22;
  const stopsY = y;
  const stopsH = 46;
  y += stopsH + 10;
  const regionH = y;

  const tickStep = (() => {
    const raw = span / 6;
    const pow = 10 ** Math.floor(Math.log10(raw));
    return [1, 2, 5, 10].map((m) => m * pow).find((s) => s >= raw);
  })();
  const ticks = [];
  for (let t = Math.ceil(view.start / tickStep) * tickStep; t <= view.end; t += tickStep) ticks.push(t);

  const right = LABEL_W + trackW;
  const textW = (text) => text.length * 6.1;
  // Reference-gene labels go under their box; one that would overlap its lane neighbour's label is
  // dropped (the selected and accessory genes are placed first so they keep theirs)
  const labelX = {};
  {
    const order = [...geneStack.placed].sort(
      (a, b) =>
        (b.item.id === selectedId) - (a.item.id === selectedId) ||
        (b.item.category === 'accessory') - (a.item.category === 'accessory') ||
        a.item.start - b.item.start
    );
    const taken = {};
    order.forEach(({ item: g, lane }) => {
      const half = textW(geneLabel(g)) / 2;
      const mid = (Math.max(LABEL_W, rx(g.start)) + Math.min(right, rx(g.end))) / 2;
      const x = Math.min(right - half, Math.max(LABEL_W + half, mid));
      const spans = taken[lane] || [];
      if (spans.some(([a, b]) => x - half < b + 4 && x + half > a - 4)) return;
      spans.push([x - half, x + half]);
      taken[lane] = spans;
      labelX[g.id] = x;
    });
  }

  const geneBox = ({ item: g, lane }, top, isVariant) => {
    const x1 = Math.max(LABEL_W, rx(g.start));
    const x2 = Math.min(right, rx(g.end));
    const w = Math.max(2, x2 - x1);
    const label = geneLabel(g);
    const boxY = top + lane * (isVariant ? laneH : geneLaneH);
    const fill = g.category === 'accessory' ? frequencyColor(g.presence, total) : '#7cb342';
    return (
      <g
        key={g.id}
        className={`pg-gene ${selectedId === g.id ? 'selected' : ''}`}
        onClick={() => setSelectedId(g.id)}
      >
        <rect
          x={x1}
          y={boxY}
          width={w}
          height={12}
          rx={2}
          fill={isVariant ? '#fff' : fill}
          stroke={isVariant ? fill : 'none'}
          strokeWidth={isVariant ? 2 : 0}
          strokeDasharray={isVariant && !g.in_reference ? '4 2' : undefined}
        />
        {isVariant ? (
          // beside the box; on its left when the right edge is too close
          x2 + 3 + textW(label) <= right ? (
            <text x={x2 + 3} y={boxY + 10} className="pg-gene-label">
              {label}
            </text>
          ) : (
            <text x={x1 - 3} y={boxY + 10} className="pg-gene-label" textAnchor="end">
              {label}
            </text>
          )
        ) : labelX[g.id] !== undefined ? (
          <text
            x={labelX[g.id]}
            y={boxY + 23}
            className={`pg-gene-label ${g.category === 'accessory' ? 'pg-label-accessory' : ''}`}
            textAnchor="middle"
          >
            {label}
          </text>
        ) : null}
        <title>
          {`${g.id}${g.gene_name ? ` (${g.gene_name})` : ''}: ${g.category}${
            g.presence !== null && g.presence !== undefined ? `, ${g.presence}/${total} isolates` : ''
          }${g.type ? `, ${g.type}` : ''}`}
        </title>
      </g>
    );
  };

  const maxStop = Math.max(1, ...stopsInView.map((s) => s.isolates));
  const region = (
    <svg className="pg-region" width={width} height={regionH} role="img" aria-label="Region view">
      {ticks.map((t) => (
        <g key={t}>
          <line x1={rx(t)} x2={rx(t)} y1={axisY - 6} y2={regionH} className="pg-grid" />
          <text x={rx(t)} y={axisY - 10} className="pg-axis-label" textAnchor="middle">
            {t >= 1e6 ? `${(t / 1e6).toFixed(t % 1e6 ? 2 : 0)} Mb` : `${fmt(t / 1000)} kb`}
          </text>
        </g>
      ))}
      <line x1={LABEL_W} x2={LABEL_W + trackW} y1={axisY} y2={axisY} className="pg-axis" />

      <text x={6} y={genesY + 10} className="pg-track-label">
        {referenceStrain} genes
      </text>
      {geneStack.placed.map((p) => geneBox(p, genesY, false))}

      <text x={6} y={variantsY + 10} className="pg-track-label">
        Variants
      </text>
      <text x={6} y={variantsY + 22} className="pg-track-sublabel">
        drawn at related gene
      </text>
      {variants.length === 0 && (
        <text x={LABEL_W + 4} y={variantsY + 10} className="pg-empty">
          none in this region
        </text>
      )}
      {variantStack.placed.map((p) => geneBox(p, variantsY, true))}

      <text x={6} y={freqY + 12} className="pg-track-label">
        Isolates
      </text>
      <text x={6} y={freqY + 24} className="pg-track-sublabel">
        carrying gene
      </text>
      <line x1={LABEL_W} x2={LABEL_W + trackW} y1={freqY + freqH} y2={freqY + freqH} className="pg-axis" />
      {(() => {
        // Variants drawn at the same gene share a position: put their bars side by side
        const bars = inView.filter((g) => g.category === 'accessory' && g.presence !== null && g.presence !== undefined);
        const groups = {};
        bars.forEach((g) => {
          (groups[`${g.start}-${g.end}`] = groups[`${g.start}-${g.end}`] || []).push(g);
        });
        return Object.values(groups).flatMap((group) =>
          group.map((g, i) => {
            const mid = rx((Math.max(g.start, view.start) + Math.min(g.end, view.end)) / 2);
            const x = mid - (group.length * 12) / 2 + i * 12 + 1;
            const h = Math.max(2, (g.presence / total) * freqH);
            return (
              <g key={`f-${g.id}`} onClick={() => setSelectedId(g.id)} className={`pg-gene ${selectedId === g.id ? 'selected' : ''}`}>
                <rect x={x} y={freqY + freqH - h} width={10} height={h} fill={frequencyColor(g.presence, total)} />
                <title>{`${g.id}: ${g.presence}/${total}`}</title>
              </g>
            );
          })
        );
      })()}
      {inView.some((g) => g.category === 'accessory') ? null : (
        <text x={LABEL_W + 4} y={freqY + freqH - 4} className="pg-empty">
          all genes here are core
        </text>
      )}

      <text x={6} y={stopsY + 12} className="pg-track-label">
        Premature
      </text>
      <text x={6} y={stopsY + 24} className="pg-track-label">
        stops
      </text>
      <line x1={LABEL_W} x2={LABEL_W + trackW} y1={stopsY + stopsH} y2={stopsY + stopsH} className="pg-axis" />
      {stopsInView.length === 0 && (
        <text x={LABEL_W + 4} y={stopsY + stopsH - 4} className="pg-empty">
          none in this region
        </text>
      )}
      {stopsInView.map((s) => {
        const x = rx(s.position);
        const h = 6 + (Math.log(s.isolates + 1) / Math.log(maxStop + 1)) * (stopsH - 10);
        return (
          <g key={`${s.gene.id}-${s.position}`} className="pg-gene" onClick={() => setSelectedId(s.gene.id)}>
            <line x1={x} x2={x} y1={stopsY + stopsH} y2={stopsY + stopsH - h} className="pg-stop-stem" />
            <circle
              cx={x}
              cy={stopsY + stopsH - h}
              r={3.5}
              className={s.homozygous > 0 ? 'pg-stop-hom' : 'pg-stop-het'}
            />
            <title>{`${s.gene.id} stop at ${fmt(s.position)}: ${s.isolates} isolates (${s.homozygous} homozygous)`}</title>
          </g>
        );
      })}
    </svg>
  );

  // ---------- controls ----------
  const len = lengths[view.chrom];
  const setWindow = (start, size) => {
    const clamped = Math.max(MIN_WINDOW, Math.min(len, size));
    const s = Math.max(0, Math.min(len - clamped, Math.round(start)));
    setView({ chrom: view.chrom, start: s, end: s + clamped });
  };
  const zoom = (factor) => {
    const mid = (view.start + view.end) / 2;
    const size = span * factor;
    setWindow(mid - size / 2, size);
  };
  const step = (dir) => {
    const mid = (view.start + view.end) / 2;
    const ordered = accessory;
    const pos = (g) => [map.chromosomes.findIndex((c) => c.name === g.chromosome), g.start];
    const here = [map.chromosomes.findIndex((c) => c.name === view.chrom), mid];
    const cmp = (a, b) => a[0] - b[0] || a[1] - b[1];
    const next =
      dir > 0
        ? ordered.find((g) => cmp(pos(g), here) > 0 && g.id !== selectedId)
        : [...ordered].reverse().find((g) => cmp(pos(g), here) < 0 && g.id !== selectedId);
    if (next) centerOn(next, Math.max(span, DEFAULT_WINDOW / 2));
  };

  return (
    <div className="pg-browser" ref={containerRef}>
      <div className="pg-legend">
        <span>
          <i className="pg-swatch" style={{ background: '#7cb342' }} /> core
        </span>
        <span>
          Accessory, carried by: <i className="pg-swatch" style={{ background: '#c62828' }} /> &lt;10%{' '}
          <i className="pg-swatch" style={{ background: '#ef6c00' }} /> 10&ndash;50%{' '}
          <i className="pg-swatch" style={{ background: '#f9a825' }} /> &ge;50% of isolates
        </span>
        <span>
          <i className="pg-swatch pg-swatch-outline" /> variant not in {referenceStrain} (dashed)
        </span>
        <span>
          <i className="pg-dot pg-stop-hom" /> stop, homozygous in some isolates <i className="pg-dot pg-stop-het" />{' '}
          heterozygous only
        </span>
      </div>

      <h3 className="pg-subhead">Genome overview</h3>
      <p className="pg-hint">Coloured ticks are accessory genes; purple marks are premature stop codons. Click to zoom in.</p>
      {overview}

      <h3 className="pg-subhead">
        {shortChrom(view.chrom)}: {fmt(view.start + 1)}&ndash;{fmt(view.end)}
      </h3>
      <div className="pg-controls">
        <select
          value={view.chrom}
          onChange={(e) => setView({ chrom: e.target.value, start: 0, end: Math.min(lengths[e.target.value], span) })}
        >
          {map.chromosomes.map((c) => (
            <option key={c.name} value={c.name}>
              {shortChrom(c.name)} ({fmt(Math.round(c.length / 1000))} kb)
            </option>
          ))}
        </select>
        <button onClick={() => setWindow(view.start - span / 2, span)} title="Pan left">
          &larr;
        </button>
        <button onClick={() => setWindow(view.start + span / 2, span)} title="Pan right">
          &rarr;
        </button>
        <button onClick={() => zoom(0.5)}>Zoom in</button>
        <button onClick={() => zoom(2)}>Zoom out</button>
        <button onClick={() => step(-1)}>&lsaquo; Previous accessory gene</button>
        <button onClick={() => step(1)}>Next accessory gene &rsaquo;</button>
      </div>
      {region}

      {selected && (
        <div className="pg-selected">
          <strong>{selected.id}</strong>
          {selected.gene_name && ` (${selected.gene_name})`}: <span className={`pangenome-badge ${selected.category}`}>{selected.category}</span>
          {!selected.in_reference && <span className="pangenome-badge novel">not in {referenceStrain}</span>}
          {selected.presence !== null && selected.presence !== undefined && (
            <> present in {selected.presence} of {total} isolates.</>
          )}
          {selected.type && <> {selected.type}.</>}
          {selected.ortholog && <> Ortholog {selected.ortholog}.</>}
          {selected.stops?.length > 0 && (
            <>
              {' '}
              Premature stop at {selected.stops.map((s) => `${fmt(s.position)} (${s.isolates} isolates)`).join(', ')}.
            </>
          )}
          {selected.drawn_at && (
            <>
              {' '}
              The study gives it no coordinates of its own; drawn at {selected.drawn_at}.
            </>
          )}
          <div className="pg-selected-links">
            {selected.reference_gene && <Link to={`/locus/${selected.reference_gene}`}>Locus page</Link>}
            <button className="pangenome-link-button" onClick={() => onShowInTable(selected.id)}>
              Show in gene table
            </button>
          </div>
        </div>
      )}

      {map.unplaced.length > 0 && (
        <p className="pg-hint">
          {map.unplaced.length} genes are not drawn: the study gives no coordinates or {referenceStrain} gene for
          them.{' '}
          <button className="pangenome-link-button pg-inline" onClick={() => setShowUnplaced(!showUnplaced)}>
            {showUnplaced ? 'Hide list' : 'Show list'}
          </button>
          {showUnplaced && ': '}
          {showUnplaced && map.unplaced.map((g, i) => (
            <React.Fragment key={g.id}>
              {i > 0 && ', '}
              <button className="pangenome-link-button pg-inline" onClick={() => onShowInTable(g.id)}>
                {g.id}
              </button>
            </React.Fragment>
          ))}
        </p>
      )}
    </div>
  );
}

export default PangenomeMap;
