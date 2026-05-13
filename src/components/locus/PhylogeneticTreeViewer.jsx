import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';

/**
 * Build a mapping from feature_name to display name (sequence_id which includes gene name)
 * e.g., "C1_13700W_A" -> "ACT1/C1_13700W_A"
 */
function buildNameMapping(orthologs) {
  const mapping = {};
  if (!orthologs) return mapping;

  for (const orth of orthologs) {
    if (orth.feature_name && orth.sequence_id) {
      mapping[orth.feature_name] = orth.sequence_id;
    }
  }
  return mapping;
}

/**
 * Build a mapping from display name (sequence_id) to organism name
 * e.g., "ACT1/C1_13700W_A" -> "Candida albicans SC5314"
 */
function buildOrganismMapping(orthologs) {
  const mapping = {};
  if (!orthologs) return mapping;

  for (const orth of orthologs) {
    // Map both feature_name and sequence_id to organism
    if (orth.feature_name && orth.organism_name) {
      mapping[orth.feature_name] = orth.organism_name;
    }
    if (orth.sequence_id && orth.organism_name) {
      mapping[orth.sequence_id] = orth.organism_name;
    }
  }
  return mapping;
}

/**
 * Parse Newick format into a tree structure with proper branch lengths
 */
function parseNewick(newickStr) {
  let idx = 0;
  const str = newickStr.trim();

  function parseNode() {
    const node = { name: '', length: 0, children: null };

    if (str[idx] === '(') {
      idx++; // skip '('
      node.children = [];

      // Parse first child
      node.children.push(parseNode());

      // Parse remaining children
      while (str[idx] === ',') {
        idx++; // skip ','
        node.children.push(parseNode());
      }

      if (str[idx] === ')') {
        idx++; // skip ')'
      }
    }

    // Parse node name and branch length
    let nameAndLength = '';
    while (idx < str.length && str[idx] !== ',' && str[idx] !== ')' && str[idx] !== ';') {
      nameAndLength += str[idx];
      idx++;
    }

    // Split name and branch length
    const colonIdx = nameAndLength.indexOf(':');
    if (colonIdx !== -1) {
      node.name = nameAndLength.substring(0, colonIdx).trim();
      node.length = parseFloat(nameAndLength.substring(colonIdx + 1)) || 0;
    } else {
      node.name = nameAndLength.trim();
    }

    return node;
  }

  try {
    return parseNode();
  } catch (e) {
    console.error('Error parsing Newick:', e);
    return null;
  }
}

/**
 * Apply name mapping to all nodes in the tree
 */
function applyNameMapping(node, mapping) {
  if (!node) return;

  if (node.name && mapping[node.name]) {
    node.name = mapping[node.name];
  }

  if (node.children) {
    node.children.forEach(child => applyNameMapping(child, mapping));
  }
}

/**
 * Get all leaf nodes from the tree
 */
function getLeaves(node) {
  if (!node) return [];
  if (!node.children || node.children.length === 0) {
    return [node];
  }
  return node.children.flatMap(getLeaves);
}

/**
 * Calculate the maximum depth (sum of branch lengths from root to any leaf)
 */
function getMaxDepth(node, currentDepth = 0) {
  const nodeDepth = currentDepth + (node.length || 0);

  if (!node.children || node.children.length === 0) {
    return nodeDepth;
  }

  return Math.max(...node.children.map(child => getMaxDepth(child, nodeDepth)));
}

/**
 * Assign x positions (depth from root) and y positions (leaf ordering) to all nodes
 */
function layoutTree(node, xOffset = 0, yCounter = { value: 0 }, positions = new Map()) {
  const x = xOffset + (node.length || 0);

  if (!node.children || node.children.length === 0) {
    // Leaf node
    const y = yCounter.value;
    yCounter.value += 1;
    positions.set(node, { x, y });
    return { minY: y, maxY: y };
  }

  // Internal node - layout children first
  let minY = Infinity;
  let maxY = -Infinity;

  for (const child of node.children) {
    const childBounds = layoutTree(child, x, yCounter, positions);
    minY = Math.min(minY, childBounds.minY);
    maxY = Math.max(maxY, childBounds.maxY);
  }

  // Place internal node at vertical center of its children
  const y = (minY + maxY) / 2;
  positions.set(node, { x, y });

  return { minY, maxY };
}

/**
 * Phylogenetic tree visualization component using D3 directly
 */
function PhylogeneticTreeViewer({ newickTree, leafCount, orthologs }) {
  const [showRaw, setShowRaw] = useState(false);
  const [hoveredGene, setHoveredGene] = useState(null);
  const svgRef = useRef(null);
  const containerRef = useRef(null);

  // Build name mapping from orthologs
  const nameMapping = useMemo(() => buildNameMapping(orthologs), [orthologs]);

  // Build organism mapping from orthologs
  const organismMapping = useMemo(() => buildOrganismMapping(orthologs), [orthologs]);

  // Parse the Newick tree
  const treeData = useMemo(() => {
    if (!newickTree) return null;
    const parsed = parseNewick(newickTree);
    if (parsed) {
      applyNameMapping(parsed, nameMapping);
    }
    return parsed;
  }, [newickTree, nameMapping]);

  // Render the tree using D3
  useEffect(() => {
    if (!treeData || !containerRef.current) return;

    const container = containerRef.current;
    const leaves = getLeaves(treeData);
    const numLeaves = leaves.length;

    // Layout configuration
    const margin = { top: 20, right: 200, bottom: 20, left: 20 };
    const rowHeight = 28;
    const height = numLeaves * rowHeight + margin.top + margin.bottom;
    const width = container.clientWidth || 800;
    const treeWidth = width - margin.left - margin.right;

    // Clear previous SVG
    d3.select(container).selectAll('svg').remove();

    // Create SVG
    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('class', 'phylo-tree-svg');

    svgRef.current = svg.node();

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Calculate tree layout
    const positions = new Map();
    layoutTree(treeData, 0, { value: 0 }, positions);

    // Get scales
    const maxDepth = getMaxDepth(treeData);
    const xScale = d3.scaleLinear()
      .domain([0, maxDepth])
      .range([0, treeWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, numLeaves - 1])
      .range([0, (numLeaves - 1) * rowHeight]);

    // Draw branches recursively
    function drawBranches(node, parentX = null, parentY = null) {
      const pos = positions.get(node);
      if (!pos) return;

      const x = xScale(pos.x);
      const y = yScale(pos.y);

      // Draw branch from parent to this node (elbow style)
      if (parentX !== null && parentY !== null) {
        // Horizontal line from parent's x to this node's x at parent's y
        g.append('line')
          .attr('x1', parentX)
          .attr('y1', parentY)
          .attr('x2', parentX)
          .attr('y2', y)
          .attr('stroke', '#555')
          .attr('stroke-width', 1.5);

        // Vertical line at this node's x
        g.append('line')
          .attr('x1', parentX)
          .attr('y1', y)
          .attr('x2', x)
          .attr('y2', y)
          .attr('stroke', '#555')
          .attr('stroke-width', 1.5);
      }

      // Draw children
      if (node.children && node.children.length > 0) {
        for (const child of node.children) {
          drawBranches(child, x, y);
        }
      }

      // Draw node
      const isLeaf = !node.children || node.children.length === 0;
      g.append('circle')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', isLeaf ? 4 : 3)
        .attr('fill', isLeaf ? '#2e7d32' : '#666');

      // Draw label for leaf nodes
      if (isLeaf && node.name) {
        const organism = organismMapping[node.name] || null;

        g.append('text')
          .attr('x', x + 8)
          .attr('y', y)
          .attr('dy', '0.35em')
          .attr('font-size', '13px')
          .attr('font-family', 'monospace')
          .attr('fill', '#222')
          .attr('class', 'gene-label')
          .style('cursor', 'pointer')
          .text(node.name)
          .on('mouseenter', function() {
            d3.select(this).attr('fill', '#1976d2').attr('font-weight', 'bold');
            setHoveredGene({ name: node.name, organism });
          })
          .on('mouseleave', function() {
            d3.select(this).attr('fill', '#222').attr('font-weight', 'normal');
            setHoveredGene(null);
          });
      }
    }

    // Start drawing from root
    const rootPos = positions.get(treeData);
    if (rootPos) {
      drawBranches(treeData);
    }

    // Add scale bar
    const scaleBarLength = maxDepth * 0.1; // 10% of total tree depth
    const scaleBarPixels = xScale(scaleBarLength) - xScale(0);
    const scaleBarY = height - margin.bottom - 5;

    g.append('line')
      .attr('x1', 10)
      .attr('y1', scaleBarY)
      .attr('x2', 10 + scaleBarPixels)
      .attr('y2', scaleBarY)
      .attr('stroke', '#333')
      .attr('stroke-width', 2);

    g.append('text')
      .attr('x', 10 + scaleBarPixels / 2)
      .attr('y', scaleBarY + 15)
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .attr('fill', '#333')
      .text(scaleBarLength.toFixed(3) + ' subs/site');

    return () => {
      d3.select(container).selectAll('svg').remove();
    };
  }, [treeData, organismMapping]);

  if (!newickTree) {
    return <div style={{ color: '#666', fontStyle: 'italic' }}>No tree data available</div>;
  }

  if (!treeData) {
    return (
      <div>
        <div style={{ color: '#c62828', marginBottom: '10px' }}>
          Unable to parse tree data
        </div>
        <div
          style={{
            backgroundColor: '#f9f9f9',
            border: '1px solid #ddd',
            borderRadius: '4px',
            padding: '10px',
            fontFamily: 'monospace',
            fontSize: '11px',
            wordBreak: 'break-all',
            whiteSpace: 'pre-wrap',
            maxHeight: '200px',
            overflowY: 'auto',
          }}
        >
          {newickTree}
        </div>
      </div>
    );
  }

  const leaves = getLeaves(treeData);
  const treeHeight = Math.max(400, leaves.length * 28 + 60);

  return (
    <div>
      {/* Organism tooltip bar - shows instantly on hover */}
      <div
        style={{
          backgroundColor: hoveredGene ? '#1976d2' : '#f5f5f5',
          color: hoveredGene ? '#fff' : '#666',
          padding: '6px 12px',
          fontSize: '12px',
          borderRadius: '4px 4px 0 0',
          border: '1px solid #ddd',
          borderBottom: 'none',
          minHeight: '20px',
          transition: 'background-color 0.15s, color 0.15s',
        }}
      >
        {hoveredGene ? (
          <>
            <strong>{hoveredGene.name}</strong>
            {hoveredGene.organism && (
              <span style={{ marginLeft: '8px', fontStyle: 'italic' }}>
                {hoveredGene.organism}
              </span>
            )}
          </>
        ) : (
          <span>Hover over a gene name to see organism</span>
        )}
      </div>

      {/* Tree visualization container */}
      <div
        ref={containerRef}
        style={{
          backgroundColor: '#fff',
          border: '1px solid #ddd',
          borderTop: 'none',
          borderRadius: '0 0 4px 4px',
          width: '100%',
          minHeight: `${treeHeight}px`,
          overflow: 'auto',
        }}
      />

      {/* Toggle for raw Newick display */}
      <div style={{ marginTop: '10px' }}>
        <button
          onClick={() => setShowRaw(!showRaw)}
          style={{
            background: 'none',
            border: 'none',
            color: '#0066cc',
            cursor: 'pointer',
            fontSize: '12px',
            textDecoration: 'underline',
            padding: 0,
          }}
        >
          {showRaw ? 'Hide' : 'Show'} Newick format
        </button>
      </div>

      {/* Raw Newick string (collapsible) */}
      {showRaw && (
        <div
          style={{
            marginTop: '8px',
            backgroundColor: '#f9f9f9',
            border: '1px solid #ddd',
            borderRadius: '4px',
            padding: '10px',
            fontFamily: 'monospace',
            fontSize: '11px',
            wordBreak: 'break-all',
            whiteSpace: 'pre-wrap',
            maxHeight: '150px',
            overflowY: 'auto',
          }}
        >
          {newickTree}
        </div>
      )}
    </div>
  );
}

export default PhylogeneticTreeViewer;
