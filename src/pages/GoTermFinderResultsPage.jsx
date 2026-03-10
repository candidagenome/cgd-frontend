import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import cytoscape from 'cytoscape';
import goTermFinderApi from '../api/goTermFinderApi';
import './GoTermFinderResultsPage.css';

// Register AG Grid modules once
if (!ModuleRegistry.__cgdGoTermFinderRegistered) {
  ModuleRegistry.registerModules([AllCommunityModule]);
  ModuleRegistry.__cgdGoTermFinderRegistered = true;
}

// P-value color scheme for the graph (matching Perl/SGD style)
const PVALUE_COLORS = {
  level1: '#FFCC66',  // Orange/tan: <=1e-10
  level2: '#FFFF00',  // Yellow: 1e-10 to 1e-8
  level3: '#00FF00',  // Green: 1e-8 to 1e-6
  level4: '#00FFFF',  // Cyan: 1e-6 to 1e-4
  level5: '#6699FF',  // Blue: 1e-4 to 0.05
  level6: '#DDCCAA',  // Tan/beige: >0.05
  gene: '#B8D4E8',    // Light blue for gene nodes
  edge: '#333333',
  textDark: '#000000',
};

// Get color based on p-value (matching Perl thresholds)
const getPvalueColor = (pValue) => {
  if (pValue <= 1e-10) return PVALUE_COLORS.level1;
  if (pValue <= 1e-8) return PVALUE_COLORS.level2;
  if (pValue <= 1e-6) return PVALUE_COLORS.level3;
  if (pValue <= 1e-4) return PVALUE_COLORS.level4;
  if (pValue <= 0.05) return PVALUE_COLORS.level5;
  return PVALUE_COLORS.level6;
};

const GENES_TO_SHOW = 5;

// Cell renderer for GO Term column
const GoTermRenderer = (props) => {
  const { data } = props;
  if (!data) return null;

  return (
    <div className="term-cell-content">
      <a
        href={`/go/${data.goid}`}
        target="gotools"
        className="term-link"
      >
        {data.goid}
      </a>
      <br />
      <span className="term-name">{data.go_term}</span>
    </div>
  );
};

// Cell renderer for count columns (query/background)
const CountRenderer = (props) => {
  const { value, data, colDef } = props;
  if (!data) return null;

  const isQuery = colDef.field === 'query_display';
  const count = isQuery ? data.query_count : data.background_count;
  const total = isQuery ? data.query_total : data.background_total;
  const frequency = isQuery ? data.query_frequency : data.background_frequency;

  return (
    <div className="count-cell-content">
      {count}/{total}
      <br />
      <span className="percentage">{frequency}%</span>
    </div>
  );
};

// Cell renderer for genes column
const GenesRenderer = (props) => {
  const { data, context } = props;
  if (!data || !data.genes) return null;

  const genes = data.genes;
  const isExpanded = context?.expandedTerms?.has(data.goid);
  const genesToShow = isExpanded ? genes : genes.slice(0, GENES_TO_SHOW);
  const hasMore = genes.length > GENES_TO_SHOW;

  return (
    <div className="genes-inline">
      {genesToShow.map((gene, idx) => (
        <React.Fragment key={gene.feature_no}>
          <a
            href={`/locus/${gene.systematic_name}`}
            target="gotools"
            className="gene-link-inline"
            title={`${gene.systematic_name}${gene.evidence_codes?.length > 0 ? ` (${gene.evidence_codes.join(', ')})` : ''}`}
          >
            {gene.gene_name || gene.systematic_name}
          </a>
          {idx < genesToShow.length - 1 && ', '}
        </React.Fragment>
      ))}
      {hasMore && !isExpanded && (
        <button
          className="more-genes-btn"
          onClick={() => context?.toggleTermExpansion(data.goid)}
        >
          +{genes.length - GENES_TO_SHOW} more
        </button>
      )}
      {hasMore && isExpanded && (
        <button
          className="more-genes-btn"
          onClick={() => context?.toggleTermExpansion(data.goid)}
        >
          show less
        </button>
      )}
    </div>
  );
};

function GoTermFinderResultsPage() {
  const navigate = useNavigate();
  const graphContainerRef = useRef(null);
  const cyRef = useRef(null);
  const gridRef = useRef(null);

  const [results, setResults] = useState(null);
  const [request, setRequest] = useState(null);
  const [expandedTerms, setExpandedTerms] = useState(new Set());
  const [graphData, setGraphData] = useState(null);
  const [graphLoading, setGraphLoading] = useState(false);
  const [showGraph, setShowGraph] = useState(false);
  const [graphGeneratedDate, setGraphGeneratedDate] = useState(null);
  // Quick filter state: pending (what user types) vs applied (what filters)
  const [pendingQuickFilter, setPendingQuickFilter] = useState('');
  const [appliedQuickFilter, setAppliedQuickFilter] = useState('');

  const applyFilter = () => {
    setAppliedQuickFilter(pendingQuickFilter);
  };

  const clearFilter = () => {
    setPendingQuickFilter('');
    setAppliedQuickFilter('');
  };

  const hasPendingChanges = pendingQuickFilter !== appliedQuickFilter;


  // Load results from session storage
  useEffect(() => {
    const storedResults = localStorage.getItem('goTermFinderResults');
    const storedRequest = localStorage.getItem('goTermFinderRequest');

    if (storedResults) {
      const parsed = JSON.parse(storedResults);
      setResults(parsed);
    } else {
      // No results, redirect to search
      navigate('/go-term-finder');
    }

    if (storedRequest) {
      setRequest(JSON.parse(storedRequest));
    }
  }, [navigate]);

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
    // Refresh the grid cells to update the genes display
    setTimeout(() => {
      if (gridRef.current?.api) {
        gridRef.current.api.refreshCells({ columns: ['genes'], force: true });
      }
    }, 0);
  };

  // AG Grid context for cell renderers
  const gridContext = useMemo(() => ({
    expandedTerms,
    toggleTermExpansion,
  }), [expandedTerms]);

  // AG Grid column definitions
  const columnDefs = useMemo(() => {
    const cols = [
      {
        headerName: 'GO Term',
        field: 'goid',
        cellRenderer: GoTermRenderer,
        flex: 2.5,
        minWidth: 220,
        wrapText: true,
        autoHeight: true,
        cellStyle: { lineHeight: '1.4', padding: '8px' },
      },
      {
        headerName: 'Query',
        field: 'query_display',
        cellRenderer: CountRenderer,
        flex: 0.8,
        minWidth: 80,
        cellStyle: { textAlign: 'center', padding: '8px' },
      },
      {
        headerName: 'Background',
        field: 'background_display',
        cellRenderer: CountRenderer,
        flex: 0.9,
        minWidth: 90,
        cellStyle: { textAlign: 'center', padding: '8px' },
      },
      {
        headerName: 'Fold',
        field: 'fold_enrichment',
        flex: 0.8,
        minWidth: 70,
        cellStyle: { textAlign: 'center', fontWeight: '500', color: '#006600', padding: '8px' },
        valueFormatter: (params) => params.value ? `${params.value}x` : '',
      },
      {
        headerName: 'P-value',
        field: 'p_value',
        flex: 0.9,
        minWidth: 85,
        cellStyle: { textAlign: 'center', fontFamily: 'monospace', padding: '8px' },
        valueFormatter: (params) => params.value?.toExponential(2) || '',
      },
    ];

    // Add FDR column if correction method is not 'none'
    if (results?.result?.correction_method !== 'none') {
      cols.push({
        headerName: 'FDR',
        field: 'fdr',
        flex: 0.9,
        minWidth: 85,
        cellStyle: { textAlign: 'center', fontFamily: 'monospace', padding: '8px' },
        valueFormatter: (params) => params.value != null ? params.value.toExponential(2) : 'N/A',
      });
    }

    cols.push({
      headerName: 'Genes',
      field: 'genes',
      cellRenderer: GenesRenderer,
      flex: 2.5,
      minWidth: 180,
      wrapText: true,
      autoHeight: true,
      cellStyle: { lineHeight: '1.5', padding: '8px' },
    });

    return cols;
  }, [results?.result?.correction_method]);

  // AG Grid default column definitions
  const defaultColDef = useMemo(() => ({
    resizable: true,
    sortable: true,
  }), []);

  // Get terms for the selected ontology, filtering out single-gene terms
  const getFilteredTerms = () => {
    if (!results?.result || !request?.ontology) return [];

    let terms = [];
    if (request.ontology === 'P') terms = results.result.process_terms || [];
    else if (request.ontology === 'F') terms = results.result.function_terms || [];
    else if (request.ontology === 'C') terms = results.result.component_terms || [];

    // Filter out terms with only one gene
    return terms.filter(term => term.query_count > 1);
  };

  // Filter terms by quick filter text
  const filteredCurrentTerms = useMemo(() => {
    const terms = getFilteredTerms();
    if (!appliedQuickFilter.trim()) return terms;
    const searchLower = appliedQuickFilter.toLowerCase().trim();
    return terms.filter((term) => {
      const searchFields = [
        term.goid,
        term.go_term,
        ...(term.genes || []).map(g => g.gene_name || g.systematic_name),
      ];
      return searchFields.some((field) => field && String(field).toLowerCase().includes(searchLower));
    });
  }, [results, request, appliedQuickFilter]);

  // Load graph data from backend API
  const loadGraph = async () => {
    if (!request) return;

    setGraphLoading(true);
    try {
      const data = await goTermFinderApi.getEnrichmentGraph(request, { maxNodes: 50 });
      setGraphData(data);
      setGraphGeneratedDate(new Date());
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

    if (!graphData.nodes || graphData.nodes.length === 0) return;

    const nodes = [];
    const edges = [];
    const geneToTerms = new Map(); // Track which terms each gene is directly annotated to

    // Build GO term nodes from API data
    graphData.nodes.forEach((node) => {
      nodes.push({
        data: {
          id: node.goid,
          label: node.go_term,
          goid: node.goid,
          nodeType: 'goterm',
          pValue: node.p_value,
          queryCount: node.query_count,
          isEnriched: node.is_enriched,
        },
      });

      // Track genes for enriched terms
      if (node.is_enriched && node.genes && node.genes.length > 0) {
        node.genes.forEach((gene) => {
          const geneName = gene.gene_name || gene.systematic_name;
          if (!geneToTerms.has(geneName)) {
            geneToTerms.set(geneName, []);
          }
          geneToTerms.get(geneName).push(node.goid);
        });
      }
    });

    // Add hierarchy edges from API
    if (graphData.edges) {
      graphData.edges.forEach((edge, idx) => {
        edges.push({
          data: {
            id: `hierarchy-${idx}`,
            source: edge.source,
            target: edge.target,
            edgeType: 'hierarchy',
            relationshipType: edge.relationship_type,
          },
        });
      });
    }

    // Group genes by their term associations to create gene cluster nodes
    const termSetToGenes = new Map();
    geneToTerms.forEach((termIds, geneName) => {
      const key = termIds.sort().join('|');
      if (!termSetToGenes.has(key)) {
        termSetToGenes.set(key, { genes: [], termIds });
      }
      termSetToGenes.get(key).genes.push(geneName);
    });

    // Create gene cluster nodes and edges
    let geneNodeIdx = 0;
    termSetToGenes.forEach(({ genes, termIds }) => {
      const geneNodeId = `genes-${geneNodeIdx++}`;
      const geneLabel = genes.join(' ');

      nodes.push({
        data: {
          id: geneNodeId,
          label: geneLabel,
          nodeType: 'gene',
          geneCount: genes.length,
        },
      });

      // Connect gene node to all its associated GO terms
      termIds.forEach((termId) => {
        edges.push({
          data: {
            id: `gene-edge-${geneNodeId}-${termId}`,
            source: termId,
            target: geneNodeId,
            edgeType: 'gene-annotation',
          },
        });
      });
    });

    // Find root node (node with no incoming hierarchy edges)
    const nodesWithParents = new Set(
      edges.filter(e => e.data.edgeType === 'hierarchy').map(e => e.data.target)
    );
    const rootNodes = nodes
      .filter(n => n.data.nodeType === 'goterm' && !nodesWithParents.has(n.data.id))
      .map(n => n.data.id);

    // Create Cytoscape instance
    const cy = cytoscape({
      container: graphContainerRef.current,
      elements: { nodes, edges },
      style: [
        {
          selector: 'node[nodeType="goterm"]',
          style: {
            'label': 'data(label)',
            'text-wrap': 'wrap',
            'text-max-width': '130px',
            'font-size': '10px',
            'font-family': 'monospace',
            'text-valign': 'center',
            'text-halign': 'center',
            'background-color': (ele) => {
              // Non-enriched terms (ancestors) get gray color
              if (!ele.data('isEnriched')) return PVALUE_COLORS.level6;
              return getPvalueColor(ele.data('pValue'));
            },
            'color': PVALUE_COLORS.textDark,
            'width': '140px',
            'height': (ele) => {
              const label = ele.data('label') || '';
              const lines = Math.ceil(label.length / 16);
              return Math.max(45, lines * 14 + 16) + 'px';
            },
            'shape': 'roundrectangle',
            'border-width': '1px',
            'border-color': '#666',
            'cursor': 'pointer',
          },
        },
        {
          selector: 'node[nodeType="gene"]',
          style: {
            'label': 'data(label)',
            'text-wrap': 'wrap',
            'text-max-width': '180px',
            'font-size': '9px',
            'font-family': 'monospace',
            'text-valign': 'center',
            'text-halign': 'center',
            'background-color': PVALUE_COLORS.gene,
            'color': PVALUE_COLORS.textDark,
            'width': (ele) => {
              const label = ele.data('label') || '';
              return Math.max(80, Math.min(220, label.length * 5 + 16)) + 'px';
            },
            'height': (ele) => {
              const label = ele.data('label') || '';
              const words = label.split(' ').length;
              const lines = Math.ceil(words / 5);
              return Math.max(25, lines * 12 + 8) + 'px';
            },
            'shape': 'roundrectangle',
            'border-width': '1px',
            'border-color': '#999',
          },
        },
        {
          selector: 'edge[edgeType="hierarchy"]',
          style: {
            'width': 1.5,
            'line-color': PVALUE_COLORS.edge,
            'curve-style': 'bezier',
            'target-arrow-shape': 'none',
          },
        },
        {
          selector: 'edge[edgeType="gene-annotation"]',
          style: {
            'width': 1,
            'line-color': '#999',
            'curve-style': 'bezier',
            'target-arrow-shape': 'none',
          },
        },
      ],
      layout: {
        name: 'breadthfirst',
        directed: true,
        spacingFactor: 1.3,
        avoidOverlap: true,
        roots: rootNodes.length > 0 ? rootNodes : undefined,
      },
      userZoomingEnabled: true,
      userPanningEnabled: true,
      minZoom: 0.15,
      maxZoom: 3,
    });

    // Click handler - navigate to GO term page in gotools tab
    cy.on('tap', 'node[nodeType="goterm"]', (evt) => {
      const goid = evt.target.data('goid');
      if (goid) {
        window.open(`/go/${goid}`, 'gotools');
      }
    });

    cyRef.current = cy;

    // Fit graph after layout
    setTimeout(() => {
      cy.fit(undefined, 30);
    }, 100);

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
  }, [showGraph, graphData]);

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
  const currentTerms = getFilteredTerms();

  return (
    <div className="go-term-finder-results-page">
      <div className="results-content wide">
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
              <span className="label">Enriched terms (2+ genes):</span>
              <span className="value highlight">{getFilteredTerms().length}</span>
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
            disabled={graphLoading || getFilteredTerms().length === 0}
          >
            {graphLoading ? 'Loading...' : showGraph ? 'Reload Graph' : 'Show Graph'}
          </button>
          <button className="action-btn download-btn" onClick={() => handleDownload('tsv')}>
            Download Results (TSV)
          </button>
        </div>

        {/* Graph Visualization */}
        {showGraph && (
          <div className="graph-section">
            <h2>GO Enrichment Graph</h2>
            <p className="graph-description">
              Nodes in the graph are color-coded according to their p-value.
              Genes are shown with the GO term(s) to which they are directly annotated.
            </p>
            <div className="graph-container" ref={graphContainerRef}></div>
            <div className="graph-footer">
              <div className="pvalue-legend">
                <span className="legend-item">
                  <span className="legend-color" style={{ backgroundColor: PVALUE_COLORS.level1 }}></span>
                  &lt;=1e-10
                </span>
                <span className="legend-item">
                  <span className="legend-color" style={{ backgroundColor: PVALUE_COLORS.level2 }}></span>
                  1e-10 to 1e-8
                </span>
                <span className="legend-item">
                  <span className="legend-color" style={{ backgroundColor: PVALUE_COLORS.level3 }}></span>
                  1e-8 to 1e-6
                </span>
                <span className="legend-item">
                  <span className="legend-color" style={{ backgroundColor: PVALUE_COLORS.level4 }}></span>
                  1e-6 to 1e-4
                </span>
                <span className="legend-item">
                  <span className="legend-color" style={{ backgroundColor: PVALUE_COLORS.level5 }}></span>
                  1e-4 to 0.05
                </span>
                <span className="legend-item">
                  <span className="legend-color" style={{ backgroundColor: PVALUE_COLORS.level6 }}></span>
                  &gt;0.05
                </span>
              </div>
              <div className="graph-date">
                {graphGeneratedDate && graphGeneratedDate.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </div>
            </div>
            <p className="graph-help">
              Click a GO term node to view its page. Scroll to zoom. Drag to pan.
            </p>
          </div>
        )}

        {/* Results Header */}
        {currentTerms.length > 0 && (
          <>
            <div className="results-header">
              <h2>
                {request?.ontology === 'P' && `Biological Process (${currentTerms.length})`}
                {request?.ontology === 'F' && `Molecular Function (${currentTerms.length})`}
                {request?.ontology === 'C' && `Cellular Component (${currentTerms.length})`}
              </h2>
            </div>

            {/* Quick Filter Box */}
            <div className="filter-controls" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 15px', background: '#f8f9fa', border: '1px solid #e0e0e0', borderRadius: '4px', marginBottom: '10px' }}>
              <label htmlFor="quick-filter" style={{ fontWeight: 500, color: '#333', whiteSpace: 'nowrap' }}>Filter results: </label>
              <input
                type="text"
                id="quick-filter"
                value={pendingQuickFilter}
                onChange={(e) => setPendingQuickFilter(e.target.value)}
                placeholder="Type to filter..."
                style={{ padding: '6px 10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px', width: '200px' }}
              />
              <button
                type="button"
                onClick={applyFilter}
                disabled={!hasPendingChanges}
                style={{ padding: '6px 12px', border: 'none', background: hasPendingChanges ? '#1976d2' : '#90caf9', color: 'white', fontWeight: 500, cursor: hasPendingChanges ? 'pointer' : 'not-allowed', borderRadius: '4px', fontSize: '14px' }}
              >
                Apply
              </button>
              {(appliedQuickFilter || pendingQuickFilter) && (
                <button
                  type="button"
                  onClick={clearFilter}
                  title="Clear filter"
                  style={{ padding: '4px 8px', border: 'none', background: '#e0e0e0', color: '#666', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', borderRadius: '4px', lineHeight: 1 }}
                >
                  ×
                </button>
              )}
              {appliedQuickFilter && (
                <span style={{ fontSize: '0.9rem', color: '#555' }}>
                  Showing {filteredCurrentTerms.length} of {currentTerms.length} results
                </span>
              )}
            </div>

            {/* AG Grid Results Table */}
            <div className="results-table-container">
              {filteredCurrentTerms.length === 0 ? (
                <p className="no-results">No enriched terms match your filter.</p>
              ) : (
                <div className="ag-grid-wrapper" style={{ width: '100%' }}>
                  <AgGridReact
                    ref={gridRef}
                    rowData={filteredCurrentTerms}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    context={gridContext}
                    domLayout="autoHeight"
                    suppressCellFocus={true}
                    enableCellTextSelection={true}
                    pagination={true}
                    paginationPageSize={10}
                    paginationPageSizeSelector={[10, 25, 50, 100]}
                    getRowId={(params) => params.data.goid}
                  />
                </div>
              )}
            </div>
          </>
        )}

        {currentTerms.length === 0 && (
          <div className="no-results-message">
            <h2>No Enriched Terms Found</h2>
            <p>
              No GO terms with multiple genes were significantly enriched at the specified p-value cutoff.
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
