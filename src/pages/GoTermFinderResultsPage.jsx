import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import cytoscape from 'cytoscape';
import goTermFinderApi from '../api/goTermFinderApi';
import './GoTermFinderResultsPage.css';

// Color scheme for the graph
const COLORS = {
  process: '#4a90d9',      // Blue for Biological Process
  function: '#d4a057',     // Orange for Molecular Function
  component: '#6ab04c',    // Green for Cellular Component
  edge: '#666666',
  textLight: '#ffffff',
  textDark: '#333333',
};

function GoTermFinderResultsPage() {
  const navigate = useNavigate();
  const graphContainerRef = useRef(null);
  const cyRef = useRef(null);

  const [results, setResults] = useState(null);
  const [request, setRequest] = useState(null);
  const [activeTab, setActiveTab] = useState('process');
  const [expandedTerms, setExpandedTerms] = useState(new Set());
  const [graphData, setGraphData] = useState(null);
  const [graphLoading, setGraphLoading] = useState(false);
  const [showGraph, setShowGraph] = useState(false);

  // Load results from session storage
  useEffect(() => {
    const storedResults = sessionStorage.getItem('goTermFinderResults');
    const storedRequest = sessionStorage.getItem('goTermFinderRequest');

    if (storedResults) {
      const parsed = JSON.parse(storedResults);
      setResults(parsed);

      // Set initial tab based on which has results
      if (parsed.result) {
        if (parsed.result.process_terms.length > 0) {
          setActiveTab('process');
        } else if (parsed.result.function_terms.length > 0) {
          setActiveTab('function');
        } else if (parsed.result.component_terms.length > 0) {
          setActiveTab('component');
        }
      }
    } else {
      // No results, redirect to search
      navigate('/go-term-finder');
    }

    if (storedRequest) {
      setRequest(JSON.parse(storedRequest));
    }
  }, [navigate]);

  // Load graph data
  const loadGraph = async () => {
    if (!request) return;

    setGraphLoading(true);
    try {
      const data = await goTermFinderApi.getEnrichmentGraph(request, { maxNodes: 50 });
      setGraphData(data);
      setShowGraph(true);
    } catch (err) {
      console.error('Failed to load graph:', err);
    } finally {
      setGraphLoading(false);
    }
  };

  // Initialize Cytoscape graph
  useEffect(() => {
    if (!showGraph || !graphData || !graphContainerRef.current) return;

    // Clean up existing instance
    if (cyRef.current) {
      cyRef.current.destroy();
    }

    if (graphData.nodes.length === 0) return;

    // Build nodes
    const nodes = graphData.nodes.map((node) => ({
      data: {
        id: node.goid,
        label: node.go_term,
        goid: node.goid,
        goAspect: node.go_aspect,
        pValue: node.p_value,
        fdr: node.fdr,
        queryCount: node.query_count,
      },
    }));

    // Build edges
    const edges = graphData.edges.map((edge, idx) => ({
      data: {
        id: `edge-${idx}`,
        source: edge.source,
        target: edge.target,
        relationshipType: edge.relationship_type,
      },
    }));

    // Create Cytoscape instance
    const cy = cytoscape({
      container: graphContainerRef.current,
      elements: { nodes, edges },
      style: [
        {
          selector: 'node',
          style: {
            'label': 'data(label)',
            'text-wrap': 'wrap',
            'text-max-width': '280px',
            'font-size': '14px',
            'text-valign': 'center',
            'text-halign': 'center',
            'background-color': (ele) => {
              const aspect = ele.data('goAspect');
              if (aspect === 'P') return COLORS.process;
              if (aspect === 'F') return COLORS.function;
              if (aspect === 'C') return COLORS.component;
              return '#888';
            },
            'color': COLORS.textLight,
            'width': '300px',
            'height': '90px',
            'shape': 'roundrectangle',
            'padding': '12px',
            'border-width': '1px',
            'border-color': '#666',
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
            'line-style': (ele) =>
              ele.data('relationshipType') === 'part_of' ? 'dashed' : 'solid',
          },
        },
      ],
      layout: {
        name: 'breadthfirst',
        directed: true,
        spacingFactor: 1.2,
        avoidOverlap: true,
      },
      userZoomingEnabled: true,
      userPanningEnabled: true,
      minZoom: 0.3,
      maxZoom: 3,
    });

    // Click handler - navigate to GO term page
    cy.on('tap', 'node', (evt) => {
      const goid = evt.target.data('goid');
      if (goid) {
        navigate(`/go/${goid}`);
      }
    });

    cyRef.current = cy;

    // Fit graph after layout
    setTimeout(() => {
      cy.fit(undefined, 50);
    }, 100);

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
  }, [showGraph, graphData, navigate]);

  const toggleTermExpansion = (goid) => {
    setExpandedTerms((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(goid)) {
        newSet.delete(goid);
      } else {
        newSet.add(goid);
      }
      return newSet;
    });
  };

  const handleDownload = async (format) => {
    if (!request) return;

    try {
      const blob = await goTermFinderApi.downloadResults(request, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `go_term_finder_results.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
      alert('Download failed. Please try again.');
    }
  };

  if (!results) {
    return (
      <div className="go-term-finder-results-page">
        <div className="results-content">
          <h1>GO Term Finder Results</h1>
          <div className="loading">Loading results...</div>
        </div>
      </div>
    );
  }

  if (!results.success) {
    return (
      <div className="go-term-finder-results-page">
        <div className="results-content">
          <h1>GO Term Finder Results</h1>
          <div className="error-message">
            <strong>Analysis Error:</strong> {results.error}
          </div>
          <Link to="/go-term-finder" className="back-link">
            Back to Search
          </Link>
        </div>
      </div>
    );
  }

  const { result } = results;
  const termsByTab = {
    process: result.process_terms || [],
    function: result.function_terms || [],
    component: result.component_terms || [],
  };

  const currentTerms = termsByTab[activeTab];

  return (
    <div className="go-term-finder-results-page">
      <div className="results-content">
        <h1>GO Term Finder Results</h1>
        <hr />

        {/* Warnings */}
        {results.warnings && results.warnings.length > 0 && (
          <div className="warnings">
            {results.warnings.map((warning, idx) => (
              <div key={idx} className="warning-message">
                {warning}
              </div>
            ))}
          </div>
        )}

        {/* Summary Panel */}
        <div className="summary-panel">
          <h2>Analysis Summary</h2>
          <div className="summary-grid">
            <div className="summary-item">
              <span className="label">Genes submitted:</span>
              <span className="value">{result.query_genes_submitted}</span>
            </div>
            <div className="summary-item">
              <span className="label">Genes found:</span>
              <span className="value">{result.query_genes_found}</span>
            </div>
            <div className="summary-item">
              <span className="label">Genes with GO annotations:</span>
              <span className="value">{result.query_genes_with_go}</span>
            </div>
            <div className="summary-item">
              <span className="label">Background size:</span>
              <span className="value">
                {result.background_size} ({result.background_type})
              </span>
            </div>
            <div className="summary-item">
              <span className="label">P-value cutoff:</span>
              <span className="value">{result.p_value_cutoff}</span>
            </div>
            <div className="summary-item">
              <span className="label">Correction method:</span>
              <span className="value">
                {result.correction_method === 'bh'
                  ? 'Benjamini-Hochberg'
                  : result.correction_method === 'bonferroni'
                  ? 'Bonferroni'
                  : 'None'}
              </span>
            </div>
            <div className="summary-item">
              <span className="label">Enriched terms found:</span>
              <span className="value highlight">{result.total_enriched_terms}</span>
            </div>
          </div>

          {result.query_genes_not_found.length > 0 && (
            <div className="not-found-genes">
              <strong>Genes not found ({result.query_genes_not_found.length}):</strong>{' '}
              {result.query_genes_not_found.join(', ')}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="action-buttons">
          <Link to="/go-term-finder" className="action-btn">
            New Search
          </Link>
          <button
            className="action-btn"
            onClick={() => loadGraph()}
            disabled={graphLoading || result.total_enriched_terms === 0}
          >
            {graphLoading ? 'Loading...' : showGraph ? 'Reload Graph' : 'Show Graph'}
          </button>
          <button className="action-btn" onClick={() => handleDownload('tsv')}>
            Download TSV
          </button>
          <button className="action-btn" onClick={() => handleDownload('csv')}>
            Download CSV
          </button>
        </div>

        {/* Graph Visualization */}
        {showGraph && (
          <div className="graph-section">
            <h2>GO Enrichment Graph</h2>
            <div className="graph-legend">
              <span className="legend-item">
                <span className="legend-color" style={{ backgroundColor: COLORS.process }}></span>
                Biological Process
              </span>
              <span className="legend-item">
                <span className="legend-color" style={{ backgroundColor: COLORS.function }}></span>
                Molecular Function
              </span>
              <span className="legend-item">
                <span className="legend-color" style={{ backgroundColor: COLORS.component }}></span>
                Cellular Component
              </span>
            </div>
            <div className="graph-container" ref={graphContainerRef}></div>
            <p className="graph-help">
              Click a node to view the GO term page. Scroll to zoom. Drag to pan.
            </p>
          </div>
        )}

        {/* Results Tabs */}
        {result.total_enriched_terms > 0 && (
          <>
            <div className="results-tabs">
              <button
                className={`tab ${activeTab === 'process' ? 'active' : ''}`}
                onClick={() => setActiveTab('process')}
              >
                Biological Process ({result.process_terms.length})
              </button>
              <button
                className={`tab ${activeTab === 'function' ? 'active' : ''}`}
                onClick={() => setActiveTab('function')}
              >
                Molecular Function ({result.function_terms.length})
              </button>
              <button
                className={`tab ${activeTab === 'component' ? 'active' : ''}`}
                onClick={() => setActiveTab('component')}
              >
                Cellular Component ({result.component_terms.length})
              </button>
            </div>

            {/* Results Table */}
            <div className="results-table-container">
              {currentTerms.length === 0 ? (
                <p className="no-results">No enriched terms in this category.</p>
              ) : (
                <table className="results-table">
                  <thead>
                    <tr>
                      <th>GO Term</th>
                      <th>
                        Query
                        <br />
                        <span className="sub-header">(genes / %)</span>
                      </th>
                      <th>
                        Background
                        <br />
                        <span className="sub-header">(genes / %)</span>
                      </th>
                      <th>
                        Fold
                        <br />
                        Enrichment
                      </th>
                      <th>P-value</th>
                      {result.correction_method !== 'none' && <th>FDR</th>}
                      <th>Genes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentTerms.map((term) => (
                      <React.Fragment key={term.goid}>
                        <tr>
                          <td className="term-cell">
                            <Link to={`/go/${term.goid}`} className="term-link">
                              {term.goid}
                            </Link>
                            <br />
                            <span className="term-name">{term.go_term}</span>
                          </td>
                          <td className="count-cell">
                            {term.query_count} / {term.query_total}
                            <br />
                            <span className="percentage">{term.query_frequency}%</span>
                          </td>
                          <td className="count-cell">
                            {term.background_count} / {term.background_total}
                            <br />
                            <span className="percentage">{term.background_frequency}%</span>
                          </td>
                          <td className="fold-cell">{term.fold_enrichment}x</td>
                          <td className="pvalue-cell">{term.p_value.toExponential(2)}</td>
                          {result.correction_method !== 'none' && (
                            <td className="pvalue-cell">
                              {term.fdr != null ? term.fdr.toExponential(2) : 'N/A'}
                            </td>
                          )}
                          <td className="genes-cell">
                            <button
                              className="expand-btn"
                              onClick={() => toggleTermExpansion(term.goid)}
                            >
                              {expandedTerms.has(term.goid) ? 'Hide' : 'Show'}{' '}
                              {term.genes.length} genes
                            </button>
                          </td>
                        </tr>
                        {expandedTerms.has(term.goid) && (
                          <tr className="genes-row">
                            <td colSpan={result.correction_method !== 'none' ? 7 : 6}>
                              <div className="genes-list">
                                {term.genes.map((gene) => (
                                  <Link
                                    key={gene.feature_no}
                                    to={`/locus/${gene.systematic_name}`}
                                    className="gene-link"
                                    title={`Evidence: ${gene.evidence_codes.join(', ') || 'N/A'}`}
                                  >
                                    {gene.gene_name || gene.systematic_name}
                                  </Link>
                                ))}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {result.total_enriched_terms === 0 && (
          <div className="no-results-message">
            <h2>No Enriched Terms Found</h2>
            <p>
              No GO terms were significantly enriched at the specified p-value cutoff.
              Try adjusting the parameters:
            </p>
            <ul>
              <li>Increase the p-value cutoff</li>
              <li>Use a different multiple testing correction method</li>
              <li>Include more annotation types</li>
              <li>Remove evidence code restrictions</li>
            </ul>
            <Link to="/go-term-finder" className="back-link">
              Modify Search
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default GoTermFinderResultsPage;
