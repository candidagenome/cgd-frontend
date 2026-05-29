import React, { useEffect, useRef, useState, useMemo } from 'react';
import cytoscape from 'cytoscape';
import './InteractionNetwork.css';

// Genetic interaction types (from BioGRID)
const GENETIC_TYPES = new Set([
  'Dosage Lethality',
  'Dosage Rescue',
  'Dosage Growth Defect',
  'Negative Genetic',
  'Positive Genetic',
  'Phenotypic Enhancement',
  'Phenotypic Suppression',
  'Synthetic Growth Defect',
  'Synthetic Haploinsufficiency',
  'Synthetic Lethality',
  'Synthetic Rescue',
]);

function InteractionNetwork({ interactions, locusName, locusDisplayName }) {
  const containerRef = useRef(null);
  const cyRef = useRef(null);
  const [filterType, setFilterType] = useState('all'); // 'all', 'physical', 'genetic'
  const [minExperiments, setMinExperiments] = useState(1);

  // Transform interactions into Cytoscape elements (nodes and edges)
  const { elements, maxExperiments } = useMemo(() => {
    if (!interactions || interactions.length === 0) {
      return { elements: [], maxExperiments: 1 };
    }

    const nodes = new Map();
    const edges = [];
    const edgeCounts = new Map(); // Track experiment counts per edge

    // Add the current locus as the central node
    const currentLocusId = locusDisplayName || locusName;
    nodes.set(currentLocusId, {
      data: { id: currentLocusId, label: currentLocusId, isCurrent: true }
    });

    interactions.forEach(interaction => {
      const interactionType = GENETIC_TYPES.has(interaction.experiment_type) ? 'genetic' : 'physical';

      // Skip if filtered out
      if (filterType !== 'all' && filterType !== interactionType) {
        return;
      }

      interaction.interactors?.forEach(interactor => {
        const interactorId = interactor.gene_name || interactor.feature_name;
        if (!interactorId || interactorId === currentLocusId) return;

        // Add interactor node
        if (!nodes.has(interactorId)) {
          nodes.set(interactorId, {
            data: {
              id: interactorId,
              label: interactorId,
              isCurrent: false,
              featureName: interactor.feature_name
            }
          });
        }

        // Create edge key for counting
        const edgeKey = [currentLocusId, interactorId, interactionType].sort().join('|');
        const count = (edgeCounts.get(edgeKey) || 0) + 1;
        edgeCounts.set(edgeKey, count);

        // Add edge (we'll dedupe later)
        edges.push({
          data: {
            id: `${currentLocusId}-${interactorId}-${interaction.interaction_no}`,
            source: currentLocusId,
            target: interactorId,
            type: interactionType,
            experimentType: interaction.experiment_type,
            edgeKey: edgeKey
          }
        });
      });
    });

    // Deduplicate edges and add experiment counts
    const seenEdges = new Set();
    const uniqueEdges = [];
    let maxExp = 1;

    edges.forEach(edge => {
      const key = `${edge.data.source}-${edge.data.target}-${edge.data.type}`;
      if (!seenEdges.has(key)) {
        seenEdges.add(key);
        const count = edgeCounts.get(edge.data.edgeKey) || 1;
        maxExp = Math.max(maxExp, count);
        uniqueEdges.push({
          data: {
            ...edge.data,
            experimentCount: count
          }
        });
      }
    });

    // Filter by minimum experiments
    const filteredEdges = uniqueEdges.filter(e => e.data.experimentCount >= minExperiments);

    // Only include nodes that have edges after filtering
    const connectedNodes = new Set([currentLocusId]);
    filteredEdges.forEach(e => {
      connectedNodes.add(e.data.source);
      connectedNodes.add(e.data.target);
    });

    const filteredNodes = Array.from(nodes.values()).filter(n => connectedNodes.has(n.data.id));

    return {
      elements: [...filteredNodes, ...filteredEdges],
      maxExperiments: maxExp
    };
  }, [interactions, locusName, locusDisplayName, filterType, minExperiments]);

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
          selector: 'node[?isCurrent]',
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
      const featureName = node.data('featureName');
      if (featureName && !node.data('isCurrent')) {
        window.open(`/locus/${featureName}?tab=interactions`, '_blank');
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

  if (!interactions || interactions.length === 0) {
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
      </div>
    </div>
  );
}

export default InteractionNetwork;
