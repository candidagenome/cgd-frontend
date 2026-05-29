import React, { useEffect, useRef, useState, useMemo } from 'react';
import cytoscape from 'cytoscape';
import './InteractionNetwork.css';

function InteractionNetwork({ networkData, loading, locusName }) {
  const containerRef = useRef(null);
  const cyRef = useRef(null);
  const [filterType, setFilterType] = useState('all'); // 'all', 'physical', 'genetic'
  const [minExperiments, setMinExperiments] = useState(1);

  // Transform API network data into Cytoscape elements
  const { elements, maxExperiments } = useMemo(() => {
    if (!networkData?.nodes || !networkData?.edges) {
      return { elements: [], maxExperiments: 1 };
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
      return { elements: [], maxExperiments: maxExp };
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

    // Filter nodes to only those reachable from query node
    const filteredNodes = networkData.nodes.filter(node => reachableNodes.has(node.id));

    // Filter edges to only those between reachable nodes
    const reachableEdges = experimentFilteredEdges.filter(
      edge => reachableNodes.has(edge.source) && reachableNodes.has(edge.target)
    );

    // Convert to Cytoscape format
    const cyNodes = filteredNodes.map(node => ({
      data: {
        id: node.id,
        label: node.label,
        isQuery: node.is_query,
      }
    }));

    const cyEdges = reachableEdges.map((edge, idx) => ({
      data: {
        id: `edge-${idx}`,
        source: edge.source,
        target: edge.target,
        type: edge.interaction_type,
        experimentType: edge.experiment_type,
        experimentCount: edge.experiment_count,
      }
    }));

    return {
      elements: [...cyNodes, ...cyEdges],
      maxExperiments: maxExp,
    };
  }, [networkData, filterType, minExperiments]);

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
            'background-color': '#666',
            'label': 'data(label)',
            'text-valign': 'center',
            'text-halign': 'center',
            'font-size': '10px',
            'color': '#fff',
            'text-outline-color': '#666',
            'text-outline-width': 1,
            'width': 50,
            'height': 50,
          }
        },
        {
          selector: 'node[?isQuery]',
          style: {
            'background-color': '#f0c800',
            'text-outline-color': '#f0c800',
            'border-width': 3,
            'border-color': '#c9a600',
            'width': 60,
            'height': 60,
          }
        },
        {
          selector: 'edge[type = "physical"]',
          style: {
            'line-color': '#4caf50',
            'width': 2,
            'curve-style': 'bezier',
            'opacity': 0.7,
          }
        },
        {
          selector: 'edge[type = "genetic"]',
          style: {
            'line-color': '#9c27b0',
            'width': 2,
            'curve-style': 'bezier',
            'opacity': 0.7,
          }
        },
        {
          selector: 'edge[type = "string"]',
          style: {
            'line-color': '#2196f3',
            'width': 2,
            'curve-style': 'bezier',
            'opacity': 0.7,
            'line-style': 'dashed',
          }
        },
        {
          selector: 'node:selected',
          style: {
            'border-width': 3,
            'border-color': '#1976d2',
          }
        },
      ],
      layout: {
        name: 'cose',
        animate: false,
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

    // Add click handler for nodes
    cyRef.current.on('tap', 'node', (evt) => {
      const node = evt.target;
      const nodeId = node.data('id');
      if (nodeId && !node.data('isQuery')) {
        window.open(`/locus/${nodeId}?tab=interactions`, '_blank');
      }
    });

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
  }, [elements]);

  const handleReset = () => {
    if (cyRef.current) {
      cyRef.current.fit();
      cyRef.current.center();
    }
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
      </div>

      <div className="network-container" ref={containerRef}></div>

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
      </div>
    </div>
  );
}

export default InteractionNetwork;
