import React, { useState, useMemo } from 'react';
import Tree from 'react-d3-tree';

/**
 * Build a mapping from feature_name to display name (sequence_id which includes gene name)
 * e.g., "C1_13700W_A" -> "ACT1/C1_13700W_A"
 */
function buildNameMapping(orthologs) {
  const mapping = {};
  if (!orthologs) return mapping;

  for (const orth of orthologs) {
    if (orth.feature_name && orth.sequence_id) {
      // sequence_id is like "ACT1/C1_13700W_A" or just "C1_13700W_A"
      mapping[orth.feature_name] = orth.sequence_id;
    }
  }
  return mapping;
}

/**
 * Parse Newick format string into hierarchical tree structure
 * for react-d3-tree
 */
function parseNewick(newickStr, nameMapping = {}) {
  let idx = 0;
  const str = newickStr.trim();

  function parseNode() {
    const node = { name: '', children: [], branchLength: 0 };

    if (str[idx] === '(') {
      // Internal node with children
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
      node.name = nameAndLength.substring(0, colonIdx);
      node.branchLength = parseFloat(nameAndLength.substring(colonIdx + 1)) || 0;
    } else {
      node.name = nameAndLength;
    }

    // Clean up name
    node.name = node.name.trim();

    // Apply name mapping (e.g., C1_13700W_A -> ACT1/C1_13700W_A)
    if (node.name && nameMapping[node.name]) {
      node.name = nameMapping[node.name];
    }

    // If no children, it's a leaf
    if (node.children && node.children.length === 0) {
      delete node.children;
    }

    return node;
  }

  try {
    const tree = parseNode();
    return tree;
  } catch (e) {
    console.error('Error parsing Newick:', e);
    return null;
  }
}

/**
 * Custom node renderer for the tree
 */
const renderCustomNode = ({ nodeDatum }) => {
  const isLeaf = !nodeDatum.children;

  return (
    <g>
      <circle
        r={isLeaf ? 5 : 4}
        fill={isLeaf ? "#2e7d32" : "#666"}
      />
      {nodeDatum.name && (
        <text
          x={isLeaf ? 10 : -10}
          y={5}
          textAnchor={isLeaf ? "start" : "end"}
          style={{
            fontSize: '14px',
            fontFamily: 'monospace',
            fontWeight: '500',
            fill: '#222',
          }}
        >
          {nodeDatum.name}
        </text>
      )}
    </g>
  );
};

/**
 * Phylogenetic tree visualization component
 */
function PhylogeneticTreeViewer({ newickTree, leafCount, orthologs }) {
  const [showRaw, setShowRaw] = useState(false);

  // Build name mapping from orthologs (feature_name -> sequence_id with gene name)
  const nameMapping = useMemo(() => {
    return buildNameMapping(orthologs);
  }, [orthologs]);

  // Parse the Newick tree into hierarchical format
  const treeData = useMemo(() => {
    if (!newickTree) return null;
    const parsed = parseNewick(newickTree, nameMapping);
    return parsed;
  }, [newickTree, nameMapping]);

  // Calculate tree dimensions - larger for better readability
  const numLeaves = leafCount || 10;
  const treeHeight = Math.max(500, numLeaves * 45);

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

  return (
    <div>
      {/* Tree visualization container */}
      <div
        style={{
          backgroundColor: '#fff',
          border: '1px solid #ddd',
          borderRadius: '4px',
          width: '100%',
          height: `${treeHeight}px`,
          overflow: 'hidden',
        }}
      >
        <Tree
          data={treeData}
          orientation="horizontal"
          pathFunc="elbow"
          translate={{ x: 80, y: treeHeight / 2 }}
          nodeSize={{ x: 100, y: 35 }}
          renderCustomNodeElement={renderCustomNode}
          separation={{ siblings: 1, nonSiblings: 1.2 }}
          zoom={1.0}
          enableLegacyTransitions={false}
          pathClassFunc={() => 'tree-branch'}
        />
      </div>

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

      {/* CSS for tree branches */}
      <style>{`
        .tree-branch {
          stroke: #444;
          stroke-width: 2px;
          fill: none;
        }
      `}</style>
    </div>
  );
}

export default PhylogeneticTreeViewer;
