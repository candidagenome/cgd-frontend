import React, { useEffect, useRef, useState } from 'react';
import { phylotree } from 'phylotree';
import 'd3';

/**
 * Phylogenetic tree visualization component using phylotree.js
 */
function PhylogeneticTreeViewer({ newickTree, leafCount }) {
  const containerRef = useRef(null);
  const [error, setError] = useState(null);
  const [showRaw, setShowRaw] = useState(false);

  useEffect(() => {
    if (!newickTree || !containerRef.current) return;

    // Clear previous content
    containerRef.current.innerHTML = '';
    setError(null);

    try {
      // Parse and render the tree
      const tree = new phylotree(newickTree);

      // Calculate dimensions based on leaf count
      const numLeaves = leafCount || tree.get_tips().length;
      const height = Math.max(300, numLeaves * 25);
      const width = Math.min(800, containerRef.current.clientWidth || 700);

      // Render the tree
      tree.render({
        container: containerRef.current,
        width: width,
        height: height,
        'left-offset': 10,
        'show-scale': true,
        'align-tips': true,
        'node-styler': (element, node) => {
          // Style leaf nodes
          if (node.is_leaf()) {
            element.select('text')
              .style('font-size', '11px')
              .style('font-family', 'monospace');
          }
        },
        'edge-styler': (element, edge) => {
          element.style('stroke', '#666')
                 .style('stroke-width', '1.5px');
        }
      });

    } catch (e) {
      console.error('Error rendering phylogenetic tree:', e);
      setError('Unable to render tree visualization');
    }
  }, [newickTree, leafCount]);

  if (!newickTree) {
    return <div style={{ color: '#666', fontStyle: 'italic' }}>No tree data available</div>;
  }

  return (
    <div>
      {error ? (
        <div style={{ color: '#c62828', marginBottom: '10px' }}>{error}</div>
      ) : null}

      {/* Tree visualization container */}
      <div
        ref={containerRef}
        style={{
          backgroundColor: '#fff',
          border: '1px solid #ddd',
          borderRadius: '4px',
          padding: '10px',
          overflowX: 'auto',
          minHeight: '200px',
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
