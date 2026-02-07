import React, { useEffect, useRef, useState, useId } from 'react';
import { phylotree } from 'phylotree';

/**
 * Phylogenetic tree visualization component using phylotree.js
 */
function PhylogeneticTreeViewer({ newickTree, leafCount }) {
  const containerId = useId().replace(/:/g, '_');
  const containerRef = useRef(null);
  const [error, setError] = useState(null);
  const [showRaw, setShowRaw] = useState(false);
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    if (!newickTree || !containerRef.current) return;

    // Clear previous content
    containerRef.current.innerHTML = '';
    setError(null);
    setRendered(false);

    try {
      // Parse the tree
      const tree = new phylotree(newickTree);

      // Calculate dimensions based on leaf count
      const numLeaves = leafCount || tree.getTips().length;
      const height = Math.max(300, numLeaves * 25);
      const width = Math.min(800, containerRef.current.clientWidth || 700);

      // Render the tree using CSS selector
      tree.render({
        container: `#${containerId}`,
        width: width,
        height: height,
        'left-offset': 10,
        'show-scale': true,
        'align-tips': true,
        'selectable': false,
        'collapsible': false,
        'reroot': false,
        'hide': false,
        'brush': false,
      });

      setRendered(true);

    } catch (e) {
      console.error('Error rendering phylogenetic tree:', e);
      setError(`Unable to render tree: ${e.message}`);
    }
  }, [newickTree, leafCount, containerId]);

  if (!newickTree) {
    return <div style={{ color: '#666', fontStyle: 'italic' }}>No tree data available</div>;
  }

  return (
    <div>
      {error ? (
        <div style={{ color: '#c62828', marginBottom: '10px' }}>
          {error}
          <div style={{ marginTop: '10px' }}>
            <strong>Raw Newick format:</strong>
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
                maxHeight: '200px',
                overflowY: 'auto',
              }}
            >
              {newickTree}
            </div>
          </div>
        </div>
      ) : null}

      {/* Tree visualization container */}
      <div
        id={containerId}
        ref={containerRef}
        style={{
          backgroundColor: '#fff',
          border: '1px solid #ddd',
          borderRadius: '4px',
          padding: '10px',
          overflowX: 'auto',
          minHeight: '200px',
          display: error ? 'none' : 'block',
        }}
      />

      {/* Toggle for raw Newick display - only show if tree rendered successfully */}
      {rendered && !error && (
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
      )}

      {/* Raw Newick string (collapsible) */}
      {showRaw && !error && (
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
