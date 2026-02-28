import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import cytoscape from 'cytoscape';
import goApi from '../../api/goApi';
import './GODiagram.css';

// Color scheme matching SGD style
const COLORS = {
  focusTerm: '#f0c040',          // Yellow/gold - current focus term
  otherTerm: '#6b9fd4',          // Blue - other terms
  edge: '#999999',               // Gray for edges
  textDark: '#555555',           // Dark text for labels
};

function GODiagram({ goid }) {
  const containerRef = useRef(null);
  const cyRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hierarchyData, setHierarchyData] = useState(null);

  const navigate = useNavigate();

  // Get current date for stamp
  const dateStamp = new Date().toISOString().split('T')[0];

  // Fetch hierarchy data
  useEffect(() => {
    const fetchHierarchy = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await goApi.getGoHierarchy(goid);
        setHierarchyData(data);
      } catch (err) {
        setError(err.response?.data?.detail || err.message || 'Failed to load hierarchy');
      } finally {
        setLoading(false);
      }
    };

    fetchHierarchy();
  }, [goid]);

  // Initialize Cytoscape when data is available
  useEffect(() => {
    if (!hierarchyData || !containerRef.current) return;

    // Clean up existing instance
    if (cyRef.current) {
      cyRef.current.destroy();
    }

    // Build nodes array for Cytoscape
    const nodes = hierarchyData.nodes.map(node => {
      // Format label with gene count
      const geneCount = node.direct_gene_count || 0;
      const label = `${node.go_term} (${geneCount})`;

      return {
        data: {
          id: node.goid,
          label: label,
          goid: node.goid,
          goAspect: node.go_aspect,
          directGeneCount: node.direct_gene_count,
          inheritedGeneCount: node.inherited_gene_count,
          hasAnnotations: node.has_annotations,
          isFocus: node.is_focus,
          level: node.level,
        },
      };
    });

    // Build edges array for Cytoscape
    const edges = hierarchyData.edges.map((edge, idx) => ({
      data: {
        id: `edge-${idx}`,
        source: edge.source,
        target: edge.target,
        relationshipType: edge.relationship_type,
        label: edge.relationship_type === 'part_of' ? 'part of' : 'is a',
      },
    }));

    // Create Cytoscape instance
    const cy = cytoscape({
      container: containerRef.current,
      elements: { nodes, edges },
      style: [
        {
          selector: 'node',
          style: {
            'label': 'data(label)',
            'text-wrap': 'wrap',
            'text-max-width': '200px',
            'font-size': '12px',
            'text-valign': 'center',
            'text-halign': 'right',
            'text-margin-x': '8px',
            'background-color': (ele) => ele.data('isFocus') ? COLORS.focusTerm : COLORS.otherTerm,
            'color': COLORS.textDark,
            'width': '20px',
            'height': '20px',
            'shape': 'ellipse',
            'border-width': '2px',
            'border-color': (ele) => ele.data('isFocus') ? '#c9a030' : '#5080b0',
            'cursor': 'pointer',
          },
        },
        {
          selector: 'edge',
          style: {
            'width': 1.5,
            'line-color': COLORS.edge,
            'target-arrow-color': COLORS.edge,
            'target-arrow-shape': 'triangle',
            'arrow-scale': 0.6,
            'curve-style': 'bezier',
            'label': 'data(label)',
            'font-size': '10px',
            'text-rotation': 'autorotate',
            'text-margin-y': -8,
            'color': '#888',
          },
        },
        {
          selector: 'node:selected',
          style: {
            'border-width': '3px',
            'border-color': '#ff6600',
          },
        },
      ],
      layout: {
        name: 'breadthfirst',
        directed: true,
        spacingFactor: 1.2,
        avoidOverlap: true,
        roots: nodes
          .filter(n => n.data.level === Math.min(...nodes.map(x => x.data.level)))
          .map(n => n.data.id),
      },
      userZoomingEnabled: true,
      userPanningEnabled: true,
      boxSelectionEnabled: false,
      minZoom: 0.3,
      maxZoom: 3,
    });

    // Add click handler for navigation
    cy.on('tap', 'node', (evt) => {
      const nodeGoid = evt.target.data('goid');
      if (nodeGoid && nodeGoid !== goid) {
        navigate(`/go/${nodeGoid}`);
      }
    });

    // Add double-click to fit
    cy.on('dbltap', (evt) => {
      if (evt.target === cy) {
        cy.fit(undefined, 50);
      }
    });

    cyRef.current = cy;

    // Fit entire graph and center
    setTimeout(() => {
      cy.fit(undefined, 40);
    }, 100);

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
  }, [hierarchyData, goid, navigate]);

  // Handle PNG download
  const handleDownload = () => {
    if (!cyRef.current) return;

    const png = cyRef.current.png({
      output: 'blob',
      bg: 'white',
      scale: 2,
      full: true,
    });

    const url = URL.createObjectURL(png);
    const link = document.createElement('a');
    link.href = url;
    link.download = `GO_${goid.replace(':', '_')}_hierarchy.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Loading state
  if (loading) {
    return (
      <div className="go-diagram-container">
        <div className="go-diagram-loading">
          <div className="go-diagram-spinner"></div>
          <p>Loading hierarchy diagram...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="go-diagram-container">
        <div className="go-diagram-error">
          <p>Failed to load hierarchy: {error}</p>
        </div>
      </div>
    );
  }

  // No data state
  if (!hierarchyData || !hierarchyData.nodes || hierarchyData.nodes.length === 0) {
    return (
      <div className="go-diagram-container">
        <div className="go-diagram-empty">
          <p>No hierarchy data available for this term.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="go-diagram-container">
      <div className="go-diagram-canvas" ref={containerRef}></div>
      <div className="go-diagram-footer">
        <div className="go-diagram-legend">
          <span className="legend-item">
            <span className="legend-dot focus"></span>
            Current Term
          </span>
          <span className="legend-item">
            <span className="legend-dot other"></span>
            Other Term
          </span>
        </div>
        <div className="go-diagram-datestamp">
          CGD {dateStamp}
        </div>
      </div>
      <div className="go-diagram-download">
        <button type="button" className="go-diagram-download-btn" onClick={handleDownload}>
          ⬇ Download (.png)
        </button>
      </div>
    </div>
  );
}

export default GODiagram;
