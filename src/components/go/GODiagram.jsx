import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import cytoscape from 'cytoscape';
import goApi from '../../api/goApi';
import './GODiagram.css';

// Color scheme matching legacy Perl implementation
const COLORS = {
  withAnnotations: '#4a90d9',    // Blue - terms with gene annotations
  withoutAnnotations: '#d2b48c', // Tan - terms without annotations
  focusTerm: '#2e7d32',          // Green - current focus term
  edge: '#666666',               // Gray for edges
  textLight: '#ffffff',          // White text on dark backgrounds
  textDark: '#333333',           // Dark text on light backgrounds
};

function GODiagram({ goid }) {
  const containerRef = useRef(null);
  const cyRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hierarchyData, setHierarchyData] = useState(null);
  const navigate = useNavigate();

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
    const nodes = hierarchyData.nodes.map(node => ({
      data: {
        id: node.goid,
        label: node.go_term,
        goid: node.goid,
        goAspect: node.go_aspect,
        directGeneCount: node.direct_gene_count,
        inheritedGeneCount: node.inherited_gene_count,
        hasAnnotations: node.has_annotations,
        isFocus: node.is_focus,
        level: node.level,
      },
    }));

    // Build edges array for Cytoscape
    const edges = hierarchyData.edges.map((edge, idx) => ({
      data: {
        id: `edge-${idx}`,
        source: edge.source,
        target: edge.target,
        relationshipType: edge.relationship_type,
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
            'text-max-width': '450px',
            'font-size': '20px',
            'font-weight': 'bold',
            'text-valign': 'center',
            'text-halign': 'center',
            'background-color': (ele) => {
              if (ele.data('isFocus')) return COLORS.focusTerm;
              return ele.data('hasAnnotations') ? COLORS.withAnnotations : COLORS.withoutAnnotations;
            },
            'color': (ele) => {
              if (ele.data('isFocus')) return COLORS.textLight;
              return ele.data('hasAnnotations') ? COLORS.textLight : COLORS.textDark;
            },
            'width': '480px',
            'height': '140px',
            'shape': 'roundrectangle',
            'padding': '20px',
            'border-width': (ele) => ele.data('isFocus') ? '4px' : '2px',
            'border-color': (ele) => ele.data('isFocus') ? '#1b5e20' : '#888888',
            'cursor': 'pointer',
          },
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': COLORS.edge,
            'target-arrow-color': COLORS.edge,
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'arrow-scale': 0.8,
            'line-style': (ele) => ele.data('relationshipType') === 'part_of' ? 'dashed' : 'solid',
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
        spacingFactor: 1.0,
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

    // Initial fit
    setTimeout(() => {
      cy.fit(undefined, 50);
    }, 100);

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
  }, [hierarchyData, goid, navigate]);

  // Handle "Go Up" button click
  const handleGoUp = () => {
    if (hierarchyData?.can_go_up && hierarchyData?.focus_term) {
      // Find the immediate parent of the focus term
      const parentEdge = hierarchyData.edges.find(
        edge => edge.target === hierarchyData.focus_term.goid
      );
      if (parentEdge) {
        navigate(`/go/${parentEdge.source}`);
      }
    }
  };

  // Handle "Go Down" button click
  const handleGoDown = () => {
    if (hierarchyData?.can_go_down && hierarchyData?.focus_term) {
      // Find the immediate child of the focus term
      const childEdge = hierarchyData.edges.find(
        edge => edge.source === hierarchyData.focus_term.goid
      );
      if (childEdge) {
        navigate(`/go/${childEdge.target}`);
      }
    }
  };

  // Handle "Reset View" button click
  const handleResetView = () => {
    if (cyRef.current) {
      cyRef.current.fit(undefined, 50);
    }
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
      <div className="go-diagram-toolbar">
        <div className="go-diagram-buttons">
          <button
            className="go-diagram-btn"
            onClick={handleGoUp}
            disabled={!hierarchyData?.can_go_up}
            title="Navigate to parent term"
          >
            Go Up
          </button>
          <button
            className="go-diagram-btn"
            onClick={handleGoDown}
            disabled={!hierarchyData?.can_go_down}
            title="Navigate to child term"
          >
            Go Down
          </button>
          <button
            className="go-diagram-btn"
            onClick={handleResetView}
            title="Reset view to fit all nodes"
          >
            Reset View
          </button>
        </div>
        <div className="go-diagram-legend">
          <span className="legend-item">
            <span className="legend-color" style={{ backgroundColor: COLORS.focusTerm }}></span>
            Current Term
          </span>
          <span className="legend-item">
            <span className="legend-color" style={{ backgroundColor: COLORS.withAnnotations }}></span>
            With Annotations
          </span>
          <span className="legend-item">
            <span className="legend-color" style={{ backgroundColor: COLORS.withoutAnnotations }}></span>
            Without Annotations
          </span>
        </div>
      </div>
      <div className="go-diagram-canvas" ref={containerRef}></div>
      <div className="go-diagram-help">
        <p>Click a node to navigate to that term. Scroll to zoom. Drag to pan. Double-click to fit all.</p>
      </div>
    </div>
  );
}

export default GODiagram;
