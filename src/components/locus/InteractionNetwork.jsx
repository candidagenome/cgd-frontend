import React, { useEffect, useRef, useState, useMemo } from 'react';
import cytoscape from 'cytoscape';
import './InteractionNetwork.css';

// Distinct, color-blind-friendly palette for GO category node coloring.
// Assigned deterministically by sorted category name so colors are stable
// across renders.
const GO_PALETTE = [
  '#4e79a7', '#59a14f', '#e15759', '#b07aa1', '#76b7b2',
  '#edc948', '#ff9da7', '#9c755f', '#f28e2b', '#86bcb6',
  '#d37295', '#a0cbe8', '#8cd17d', '#b6992d', '#499894',
];
const GO_UNCATEGORIZED = '#9e9e9e';

// Only the most common GO functions get a distinct color; the long tail is
// bucketed into a single grey "Other" entry so the legend stays readable on
// large hub networks (which can otherwise produce 50+ categories).
const GO_MAX_CATEGORIES = 12;

// Compute a GO-clustered radial layout: query at the center, other genes
// grouped into angular wedges by GO function (wedge size ∝ group membership),
// arranged in arcs (multiple rings when a wedge is crowded). This makes the
// node coloring form contiguous spatial clusters instead of being scattered.
function computeClusteredPositions(queryId, displayNodes) {
  const positions = {};
  positions[queryId] = { x: 0, y: 0 };

  const others = displayNodes.filter(n => n.id !== queryId);
  if (others.length === 0) return positions;

  const groups = new Map();
  others.forEach(n => {
    const key = n.go_category || '__other__';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(n);
  });
  // Largest group first for a balanced, stable arrangement.
  const groupList = Array.from(groups.entries())
    .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));

  const total = others.length;
  const baseR = 160;
  const ringGap = 80;
  const nodeSpacing = 72; // approx px between adjacent nodes along an arc
  const maxRings = 3;     // cap radial depth so populous wedges don't streak outward

  let cursor = -Math.PI / 2; // start at the top
  groupList.forEach(([, members]) => {
    const span = (2 * Math.PI * members.length) / total;
    const pad = Math.min(span * 0.12, 0.14);
    const usable = Math.max(span - pad, 1e-4);
    const start = cursor + pad / 2;

    // Nodes per ring: enough to fit the arc, but if that would need more than
    // maxRings, pack more per ring instead of growing the wedge radially.
    const perRingByArc = Math.max(1, Math.floor((usable * baseR) / nodeSpacing));
    const perRing = Math.max(perRingByArc, Math.ceil(members.length / maxRings));
    members.forEach((n, i) => {
      const ring = Math.floor(i / perRing);
      const idxInRing = i % perRing;
      const countInRing = Math.min(perRing, members.length - ring * perRing);
      const r = baseR + ring * ringGap;
      const t = countInRing === 1 ? 0.5 : idxInRing / (countInRing - 1);
      const ang = start + t * usable;
      positions[n.id] = { x: r * Math.cos(ang), y: r * Math.sin(ang) };
    });

    cursor += span;
  });

  return positions;
}

function buildCategoryColors(nodes) {
  const counts = new Map();
  nodes.forEach(n => {
    if (n.go_category) {
      counts.set(n.go_category, (counts.get(n.go_category) || 0) + 1);
    }
  });
  // Most frequent first; tie-break by name for deterministic colors.
  const top = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, GO_MAX_CATEGORIES)
    .map(([cat]) => cat);
  const map = new Map();
  top.forEach((cat, idx) => {
    map.set(cat, GO_PALETTE[idx % GO_PALETTE.length]);
  });
  return map;
}

function InteractionNetwork({ networkData, loading, locusName }) {
  const containerRef = useRef(null);
  const cyRef = useRef(null);
  const tooltipRef = useRef(null);
  const [filterType, setFilterType] = useState('all'); // 'all', 'physical', 'genetic', 'string'
  const [minExperiments, setMinExperiments] = useState(1);
  const [colorByGo, setColorByGo] = useState(true);
  const [showSharedGo, setShowSharedGo] = useState(false);
  const [showAll, setShowAll] = useState(false); // override the large-network node cap
  const [tooltip, setTooltip] = useState(null); // { x, y, node }
  const [focusedCategory, setFocusedCategory] = useState(null); // GO legend click-to-isolate

  // Map of GO category -> color, stable for the whole network
  const categoryColors = useMemo(
    () => buildCategoryColors(networkData?.nodes || []),
    [networkData?.nodes]
  );

  // Transform API network data into Cytoscape elements
  const {
    elements, maxExperiments, categoriesInView, hasOtherCategory,
    shownNodeCount, totalNodeCount, isCapped, exceedsCap, hasGoLayout,
  } = useMemo(() => {
    const EMPTY = {
      elements: [], maxExperiments: 1, categoriesInView: [], hasOtherCategory: false,
      shownNodeCount: 0, totalNodeCount: 0, isCapped: false, exceedsCap: false,
      hasGoLayout: false,
    };
    if (!networkData?.nodes || !networkData?.edges) {
      return EMPTY;
    }

    // Filter edges by type
    const filteredEdges = networkData.edges.filter(edge => {
      if (filterType === 'all') return true;
      return edge.interaction_type === filterType;
    });

    // Filter edges by experiment count
    const experimentFilteredEdges = filteredEdges.filter(
      edge => edge.experiment_count >= minExperiments
    );

    // Find max experiments for slider
    const maxExp = Math.max(1, ...networkData.edges.map(e => e.experiment_count));

    // Find query node
    const queryNode = networkData.nodes.find(n => n.is_query);
    if (!queryNode) {
      return { ...EMPTY, maxExperiments: maxExp };
    }

    // Build adjacency list for BFS to find connected component
    const adjacency = new Map();
    experimentFilteredEdges.forEach(edge => {
      if (!adjacency.has(edge.source)) adjacency.set(edge.source, []);
      if (!adjacency.has(edge.target)) adjacency.set(edge.target, []);
      adjacency.get(edge.source).push(edge.target);
      adjacency.get(edge.target).push(edge.source);
    });

    // BFS from query node to find all reachable nodes
    const reachableNodes = new Set([queryNode.id]);
    const queue = [queryNode.id];
    while (queue.length > 0) {
      const current = queue.shift();
      const neighbors = adjacency.get(current) || [];
      for (const neighbor of neighbors) {
        if (!reachableNodes.has(neighbor)) {
          reachableNodes.add(neighbor);
          queue.push(neighbor);
        }
      }
    }

    // Nodes reachable from the query (before any large-network cap)
    const reachableNodeList = networkData.nodes.filter(node => reachableNodes.has(node.id));
    const reachableEdgesAll = experimentFilteredEdges.filter(
      edge => reachableNodes.has(edge.source) && reachableNodes.has(edge.target)
    );

    // Large-network cap: above NODE_CAP nodes, keep only the query plus the
    // strongest-evidence interactors (curated BioGRID outranks predicted
    // STRING; within a tier, higher experiment count / confidence wins).
    // Nothing is lost — the user can flip "show all".
    const NODE_CAP = 75;
    const totalReachable = reachableNodeList.length;
    let filteredNodes = reachableNodeList;
    let capped = false;
    if (!showAll && totalReachable > NODE_CAP) {
      const nodeScore = new Map(); // id -> { tier, score }
      reachableEdgesAll.forEach(e => {
        const isBio = e.interaction_type !== 'string';
        const tier = isBio ? 1 : 0;
        const val = isBio ? (e.experiment_count || 1) : (e.score || 0);
        for (const id of [e.source, e.target]) {
          const cur = nodeScore.get(id);
          if (!cur || tier > cur.tier || (tier === cur.tier && val > cur.score)) {
            nodeScore.set(id, { tier, score: val });
          }
        }
      });
      const others = reachableNodeList
        .filter(n => n.id !== queryNode.id)
        .sort((a, b) => {
          const sa = nodeScore.get(a.id) || { tier: -1, score: -1 };
          const sb = nodeScore.get(b.id) || { tier: -1, score: -1 };
          return sb.tier - sa.tier || sb.score - sa.score || a.label.localeCompare(b.label);
        });
      const keepIds = new Set([queryNode.id, ...others.slice(0, NODE_CAP - 1).map(n => n.id)]);
      filteredNodes = reachableNodeList.filter(n => keepIds.has(n.id));
      capped = true;
    }

    const keptIds = new Set(filteredNodes.map(n => n.id));
    const reachableEdges = reachableEdgesAll.filter(
      edge => keptIds.has(edge.source) && keptIds.has(edge.target)
    );

    // Max STRING score for normalizing STRING edge widths
    const maxScore = Math.max(
      1,
      ...reachableEdges.map(e => e.score || 0)
    );

    // GO-clustered positions (used by the preset layout when coloring by GO)
    const clusterPositions = computeClusteredPositions(queryNode.id, filteredNodes);
    const hasGoLayout = filteredNodes.some(n => n.go_category);

    // Convert to Cytoscape format
    const cyNodes = filteredNodes.map(node => {
      const sharedGo = node.shared_go || [];
      return {
        data: {
          id: node.id,
          label: node.label,
          isQuery: node.is_query,
          goCategory: node.go_category || null,
          goCategoryId: node.go_category_id || null,
          goTerms: node.go_terms || [],
          sharedGo,
          sharedCount: sharedGo.length,
          color: node.go_category
            ? (categoryColors.get(node.go_category) || GO_UNCATEGORIZED)
            : GO_UNCATEGORIZED,
        },
        position: { ...clusterPositions[node.id] },
      };
    });

    const cyEdges = reachableEdges.map((edge, idx) => {
      // Edge width encodes evidence strength: experiment count for
      // curated BioGRID edges, confidence score for STRING edges.
      let weight;
      if (edge.interaction_type === 'string') {
        weight = 1.5 + 4 * ((edge.score || 0) / maxScore);
      } else {
        weight = 1.5 + 3 * Math.min(1, (edge.experiment_count - 1) / Math.max(1, maxExp - 1));
      }
      return {
        data: {
          id: `edge-${idx}`,
          source: edge.source,
          target: edge.target,
          type: edge.interaction_type,
          experimentType: edge.experiment_type,
          experimentCount: edge.experiment_count,
          score: edge.score || null,
          weight,
        }
      };
    });

    // Shared-GO overlay edges (between displayed nodes only)
    const cySharedGoEdges = showSharedGo
      ? (networkData.shared_go_edges || [])
          .filter(e => keptIds.has(e.source) && keptIds.has(e.target))
          .map((edge, idx) => ({
            data: {
              id: `sharedgo-${idx}`,
              source: edge.source,
              target: edge.target,
              type: 'shared_go',
              sharedTerms: edge.shared_terms || [],
              weight: 1.5,
            }
          }))
      : [];

    // Legend: colored categories present in view (ordered by the palette
    // assignment = frequency), plus whether any in-view node falls outside
    // the top-N (rendered grey as "Other").
    const inView = new Set(filteredNodes.map(n => n.go_category).filter(Boolean));
    const categories = Array.from(categoryColors.keys()).filter(c => inView.has(c));
    const hasOther = filteredNodes.some(
      n => !n.go_category || !categoryColors.has(n.go_category)
    ) && filteredNodes.some(n => (n.go_terms || []).length > 0);

    return {
      elements: [...cyNodes, ...cyEdges, ...cySharedGoEdges],
      maxExperiments: maxExp,
      categoriesInView: categories,
      hasOtherCategory: hasOther,
      shownNodeCount: filteredNodes.length,
      totalNodeCount: totalReachable,
      isCapped: capped,
      exceedsCap: totalReachable > NODE_CAP,
      hasGoLayout,
    };
  }, [networkData, filterType, minExperiments, showSharedGo, showAll, categoryColors]);

  // Initialize and update Cytoscape
  useEffect(() => {
    if (!containerRef.current || elements.length === 0) return;

    // Destroy previous instance
    if (cyRef.current) {
      cyRef.current.destroy();
    }

    cyRef.current = cytoscape({
      container: containerRef.current,
      elements: elements,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': colorByGo ? 'data(color)' : '#666',
            'label': 'data(label)',
            'text-valign': 'center',
            'text-halign': 'center',
            'font-size': '10px',
            'color': '#fff',
            'text-outline-color': colorByGo ? 'data(color)' : '#666',
            'text-outline-width': 2,
            'width': 50,
            'height': 50,
          }
        },
        {
          // Genes that share a GO Slim term with the query gene
          selector: 'node[sharedCount > 0]',
          style: {
            'border-width': 4,
            'border-color': '#ff7f0e',
            'border-style': 'solid',
          }
        },
        {
          selector: 'node[?isQuery]',
          style: {
            'background-color': '#f0c800',
            'text-outline-color': '#f0c800',
            'border-width': 3,
            'border-color': '#c9a600',
            'border-style': 'solid',
            'width': 60,
            'height': 60,
          }
        },
        {
          selector: 'edge[type = "physical"]',
          style: {
            'line-color': '#4caf50',
            'width': 'data(weight)',
            'curve-style': 'bezier',
            'opacity': 0.7,
          }
        },
        {
          selector: 'edge[type = "genetic"]',
          style: {
            'line-color': '#9c27b0',
            'width': 'data(weight)',
            'curve-style': 'bezier',
            'opacity': 0.7,
          }
        },
        {
          selector: 'edge[type = "string"]',
          style: {
            'line-color': '#2196f3',
            'width': 'data(weight)',
            'curve-style': 'bezier',
            'opacity': 0.7,
            'line-style': 'dashed',
          }
        },
        {
          selector: 'edge[type = "shared_go"]',
          style: {
            'line-color': '#ff7f0e',
            'width': 'data(weight)',
            'curve-style': 'bezier',
            'opacity': 0.45,
            'line-style': 'dotted',
          }
        },
        {
          selector: 'node:selected',
          style: {
            'border-width': 3,
            'border-color': '#1976d2',
          }
        },
        {
          // Faded elements when a GO function is isolated via the legend
          selector: '.dimmed',
          style: { 'opacity': 0.12 }
        },
      ],
      layout: (colorByGo && hasGoLayout)
        ? {
            // GO-clustered radial layout from precomputed node positions
            name: 'preset',
            fit: true,
            padding: 40,
          }
        : {
            name: 'cose',
            animate: false,
            randomize: false, // deterministic layout across re-renders
            nodeRepulsion: 8000,
            idealEdgeLength: 100,
            nodeOverlap: 20,
            gravity: 0.5,
            numIter: 1000,
            initialTemp: 200,
            coolingFactor: 0.95,
            minTemp: 1.0,
          },
      minZoom: 0.3,
      maxZoom: 3,
    });

    // Click handler: open the interactor's locus page
    cyRef.current.on('tap', 'node', (evt) => {
      const node = evt.target;
      const nodeId = node.data('id');
      if (nodeId && !node.data('isQuery')) {
        window.open(`/locus/${nodeId}?tab=interactions`, '_blank');
      }
    });

    // Hover tooltip with gene + GO details
    const showTip = (evt) => {
      const node = evt.target;
      const pos = evt.renderedPosition || node.renderedPosition();
      setTooltip({
        x: pos.x,
        y: pos.y,
        data: {
          label: node.data('label'),
          isQuery: node.data('isQuery'),
          goCategory: node.data('goCategory'),
          goTerms: node.data('goTerms') || [],
          sharedGo: node.data('sharedGo') || [],
        }
      });
    };
    cyRef.current.on('mouseover', 'node', showTip);
    cyRef.current.on('mouseout', 'node', () => setTooltip(null));
    // Move tooltip with the node while dragging/panning
    cyRef.current.on('pan zoom drag', () => setTooltip(null));

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
  }, [elements, colorByGo, hasGoLayout]);

  const handleReset = () => {
    if (cyRef.current) {
      cyRef.current.fit();
      cyRef.current.center();
    }
    setFocusedCategory(null);
  };

  // Isolate a GO function in the graph: dim everything not in that category.
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.batch(() => {
      cy.elements().removeClass('dimmed');
      if (focusedCategory) {
        const keep = cy.nodes().filter(n =>
          n.data('isQuery') || n.data('goCategory') === focusedCategory
        );
        const keepIds = new Set(keep.map(n => n.id()));
        cy.nodes().forEach(n => { if (!keepIds.has(n.id())) n.addClass('dimmed'); });
        cy.edges().forEach(e => {
          if (!(keepIds.has(e.source().id()) && keepIds.has(e.target().id()))) {
            e.addClass('dimmed');
          }
        });
      }
    });
  }, [focusedCategory, elements]);

  const handleExportPng = () => {
    if (!cyRef.current) return;
    const png = cyRef.current.png({ full: true, scale: 2, bg: '#ffffff' });
    const a = document.createElement('a');
    a.href = png;
    a.download = `${locusName || 'interaction'}_network.png`;
    a.click();
  };

  const handleExportCsv = () => {
    if (!networkData?.edges) return;
    const labelById = new Map((networkData.nodes || []).map(n => [n.id, n.label]));
    const esc = (v) => {
      const s = v == null ? '' : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const header = ['source', 'source_name', 'target', 'target_name', 'type',
      'experiment_type', 'experiment_count', 'string_score', 'source_db'];
    const rows = networkData.edges.map(e => [
      e.source, labelById.get(e.source) || e.source,
      e.target, labelById.get(e.target) || e.target,
      e.interaction_type, e.experiment_type, e.experiment_count,
      e.score ?? '', e.source_db,
    ].map(esc).join(','));
    const csv = [header.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${locusName || 'interaction'}_interactions.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  if (loading) {
    return (
      <div className="interaction-network-section">
        <h3>Interaction Network</h3>
        <div className="loading">Loading network data...</div>
      </div>
    );
  }

  if (!networkData?.nodes || networkData.nodes.length === 0) {
    return (
      <div className="interaction-network-section">
        <h3>Interaction Network</h3>
        <p className="no-data">No interaction data available for network visualization.</p>
      </div>
    );
  }

  const hasGoData = networkData.nodes.some(n => (n.go_terms || []).length > 0);
  const hasSharedGoEdges = (networkData.shared_go_edges || []).length > 0;
  const hasStringData = (networkData.edges || []).some(e => e.interaction_type === 'string');
  const stringDeepLink = (hasStringData && networkData.taxon_id && locusName)
    ? `https://string-db.org/cgi/network?identifiers=${encodeURIComponent(locusName)}&species=${networkData.taxon_id}`
    : null;

  return (
    <div className="interaction-network-section">
      <h3>Interaction Network</h3>

      <div className="network-controls">
        <button className="reset-btn" onClick={handleReset}>Reset</button>
        <span className="filter-label">Filter by Type:</span>
        <label><input type="radio" name="filterType" value="all" checked={filterType === 'all'} onChange={(e) => setFilterType(e.target.value)} /> All</label>
        <label><input type="radio" name="filterType" value="physical" checked={filterType === 'physical'} onChange={(e) => setFilterType(e.target.value)} /> Physical</label>
        <label><input type="radio" name="filterType" value="genetic" checked={filterType === 'genetic'} onChange={(e) => setFilterType(e.target.value)} /> Genetic</label>
        <label><input type="radio" name="filterType" value="string" checked={filterType === 'string'} onChange={(e) => setFilterType(e.target.value)} /> STRING</label>
        {maxExperiments > 1 && (
          <>
            <span className="filter-label">Min Experiments:</span>
            <input type="range" min="1" max={maxExperiments} value={minExperiments} onChange={(e) => setMinExperiments(parseInt(e.target.value))} />
            <span className="filter-value">{minExperiments}</span>
          </>
        )}
        <span className="network-toolbar-spacer" />
        <button className="network-tool-btn" onClick={handleExportPng} title="Download network as PNG image">⬇ PNG</button>
        <button className="network-tool-btn" onClick={handleExportCsv} title="Download interactions as CSV">⬇ CSV</button>
        {stringDeepLink && (
          <a className="network-tool-btn" href={stringDeepLink} target="_blank" rel="noopener noreferrer"
             title="Open the full network on STRING">STRING ↗</a>
        )}
      </div>

      {hasGoData && (
        <div className="network-controls go-controls">
          <span className="filter-label">GO annotations:</span>
          <label>
            <input
              type="checkbox"
              checked={colorByGo}
              onChange={(e) => setColorByGo(e.target.checked)}
            /> Color nodes by GO function
          </label>
          {hasSharedGoEdges && (
            <label>
              <input
                type="checkbox"
                checked={showSharedGo}
                onChange={(e) => setShowSharedGo(e.target.checked)}
              /> Show shared-GO links
            </label>
          )}
          <span className="go-hint">Orange ring = shares a GO term with {locusName || 'this gene'}. Hover a node for details.</span>
        </div>
      )}

      {(isCapped || (showAll && exceedsCap)) && (
        <div className="network-cap-notice">
          {isCapped ? (
            <>
              Showing the <strong>{shownNodeCount}</strong> strongest-evidence interactors
              of <strong>{totalNodeCount}</strong>.{' '}
              <button className="link-btn" onClick={() => setShowAll(true)}>Show all {totalNodeCount}</button>
            </>
          ) : (
            <>
              Showing all <strong>{totalNodeCount}</strong> interactors (dense).{' '}
              <button className="link-btn" onClick={() => setShowAll(false)}>Show top interactors only</button>
            </>
          )}
        </div>
      )}

      <div className="network-container-wrapper">
        <div className="network-container" ref={containerRef}></div>
        {tooltip && (
          <div
            ref={tooltipRef}
            className="network-tooltip"
            style={{ left: tooltip.x + 12, top: tooltip.y + 12 }}
          >
            <div className="tooltip-title">
              {tooltip.data.label}
              {tooltip.data.isQuery && <span className="tooltip-badge">query</span>}
            </div>
            {tooltip.data.goCategory && (
              <div className="tooltip-row">
                <span className="tooltip-label">Function:</span> {tooltip.data.goCategory}
              </div>
            )}
            {tooltip.data.sharedGo.length > 0 && (
              <div className="tooltip-shared">
                <span className="tooltip-label">Shared with {locusName}:</span>
                <ul>
                  {tooltip.data.sharedGo.slice(0, 6).map((t, i) => (
                    <li key={i}>{t.term} <span className="tooltip-aspect">({t.aspect})</span></li>
                  ))}
                </ul>
              </div>
            )}
            {tooltip.data.goTerms.length > 0 && tooltip.data.sharedGo.length === 0 && (
              <div className="tooltip-row tooltip-terms">
                {tooltip.data.goTerms.slice(0, 5).map(t => t.term).join(', ')}
                {tooltip.data.goTerms.length > 5 ? '…' : ''}
              </div>
            )}
            {!tooltip.data.isQuery && (
              <div className="tooltip-hint">Click to open locus page</div>
            )}
          </div>
        )}
      </div>

      <div className="network-legend">
        <div className="legend-item">
          <span className="legend-node current"></span>
          <span>Current Locus</span>
        </div>
        <div className="legend-item">
          <span className="legend-node other"></span>
          <span>Other Locus</span>
        </div>
        <div className="legend-item">
          <span className="legend-edge physical"></span>
          <span>Physical Interaction</span>
        </div>
        <div className="legend-item">
          <span className="legend-edge genetic"></span>
          <span>Genetic Interaction</span>
        </div>
        <div className="legend-item">
          <span className="legend-edge string"></span>
          <span>STRING (predicted)</span>
        </div>
        {showSharedGo && (
          <div className="legend-item">
            <span className="legend-edge shared-go"></span>
            <span>Shared GO term</span>
          </div>
        )}
      </div>

      {colorByGo && categoriesInView.length > 0 && (
        <div className="network-legend go-legend">
          <span className="filter-label">GO function:</span>
          {focusedCategory && (
            <button className="go-clear-btn" onClick={() => setFocusedCategory(null)}>
              ✕ clear focus
            </button>
          )}
          {categoriesInView.map(cat => (
            <button
              type="button"
              className={`legend-item legend-clickable${focusedCategory === cat ? ' active' : ''}`}
              key={cat}
              onClick={() => setFocusedCategory(focusedCategory === cat ? null : cat)}
              title={`Isolate "${cat}" in the graph`}
            >
              <span
                className="legend-node"
                style={{ backgroundColor: categoryColors.get(cat) || GO_UNCATEGORIZED }}
              ></span>
              <span>{cat}</span>
            </button>
          ))}
          {hasOtherCategory && (
            <div className="legend-item" key="__other__">
              <span
                className="legend-node"
                style={{ backgroundColor: GO_UNCATEGORIZED }}
              ></span>
              <span>Other / uncategorized</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default InteractionNetwork;
