import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import { expressionApi, ORGANISM_MAP, ORGANISM_DISPLAY_MAP } from '../../api/expressionApi';
import { goTermFinderApi } from '../../api/goTermFinderApi';
import { phenotypeEnrichmentApi } from '../../api/phenotypeEnrichmentApi';
import MultiGeneHeatmap from './MultiGeneHeatmap';
import EnrichmentResultsPanel from './EnrichmentResultsPanel';
import './LocusComponents.css';
import './SimilarGenesDetails.css';

// Minimum number of shared conditions for statistically reliable correlations
const MIN_RELIABLE_CONDITIONS = 10;

// Note: Anticorrelation features temporarily removed pending data quality investigation

// Available limits for results
const LIMITS = [10, 20, 50];

// Available organisms for expression data
const ORGANISMS = Object.entries(ORGANISM_MAP).map(([display, api]) => ({
  display,
  api,
}));

function SimilarGenesDetails({ locusName, selectedOrganism, onOrganismChange, currentFeatureName, orthologMap }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  // Controls state - derive organism from selectedOrganism to stay in sync with parent
  const organism = useMemo(() => {
    if (selectedOrganism) {
      return ORGANISM_MAP[selectedOrganism] || 'C_albicans_SC5314_A22';
    }
    return 'C_albicans_SC5314_A22';
  }, [selectedOrganism]);

  const [limit, setLimit] = useState(20);

  // View mode: 'heatmap' (default) or 'table'
  const [viewMode, setViewMode] = useState('heatmap');
  const [heatmapLoading, setHeatmapLoading] = useState(false);
  const [heatmapData, setHeatmapData] = useState(null);

  // Handle organism change - notify parent which will update selectedOrganism and currentFeatureName together
  const handleOrganismChange = useCallback((newApiOrganism) => {
    if (onOrganismChange) {
      const displayName = ORGANISM_DISPLAY_MAP[newApiOrganism];
      if (displayName) {
        onOrganismChange(displayName);
      }
    }
  }, [onOrganismChange]);

  // Get the effective locus name for the current organism
  // Use currentFeatureName from parent, or look up in orthologMap as fallback
  const effectiveLocusName = useMemo(() => {
    // If we have the current feature name from the selected organism, use it
    if (currentFeatureName) {
      return currentFeatureName;
    }
    // Try looking up in orthologMap using the display name
    if (orthologMap && selectedOrganism) {
      const featureName = orthologMap.get(selectedOrganism);
      if (featureName) {
        return featureName;
      }
    }
    // Fall back to original locus name
    return locusName;
  }, [currentFeatureName, orthologMap, selectedOrganism, locusName]);


  // Fetch similar genes data
  const fetchSimilarGenes = useCallback(async () => {
    if (!effectiveLocusName) return;

    setLoading(true);
    setError(null);

    try {
      // Always fetch 100 genes to ensure consistent results regardless of display limit
      // This prevents situations where changing limit shows different genes
      const requestLimit = 100;

      const result = await expressionApi.getSimilarGenes(effectiveLocusName, {
        organism,
        metric: 'pearson',
        limit: requestLimit,
        direction: 'positive',
      });
      setData(result);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to fetch similar genes';
      setError(errorMessage);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [effectiveLocusName, organism]);

  // Fetch data when component mounts or parameters change
  useEffect(() => {
    fetchSimilarGenes();
  }, [fetchSimilarGenes]);

  // Deduplicate genes by gene_name (A/B alleles have same gene_name)
  // Filter out assembly 19/21 genes (orf19.*, orf21.*)
  // Sort based on ranking option and limit to selected number of genes
  const deduplicatedGenes = useMemo(() => {
    if (!data?.similar_genes) return [];

    // Get query gene identifiers to filter out from similar genes list
    const queryStandard = data.query_gene;  // e.g., "HOG1"
    const querySystematic = data.query_feature_name;  // e.g., "C2_03330C_A"

    const seen = new Set();
    const filtered = data.similar_genes.filter(gene => {
      // Skip assembly 19/21 genes (old assembly identifiers)
      if (gene.feature_name?.startsWith('orf19.') || gene.feature_name?.startsWith('orf21.')) {
        return false;
      }

      // Skip if this is the query gene (same systematic or standard name)
      if (querySystematic && (gene.feature_name === querySystematic || gene.gene_name === querySystematic)) {
        return false;
      }
      if (queryStandard && (gene.feature_name === queryStandard || gene.gene_name === queryStandard)) {
        return false;
      }

      // Use gene_name for deduplication, fall back to feature_name
      const key = gene.gene_name || gene.feature_name;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Sort by correlation descending (most correlated first)
    filtered.sort((a, b) => b.correlation - a.correlation);

    // Limit to requested number of genes
    return filtered.slice(0, limit);
  }, [data?.similar_genes, data?.query_gene, data?.query_feature_name, limit]);

  // Create query gene object for display in table/heatmap
  const queryGeneRow = useMemo(() => {
    if (!data?.query_gene) return null;
    return {
      gene_name: data.query_gene,
      feature_name: data.query_feature_name,
      description: 'Query gene',
      correlation: 1.0,
      p_value: 0,
      shared_conditions: data.conditions_used || 0,
      isQueryGene: true,
    };
  }, [data?.query_gene, data?.query_feature_name, data?.conditions_used]);

  // Combined list: query gene first, then similar genes (sorted by correlation)
  const allGenesForDisplay = useMemo(() => {
    if (!queryGeneRow) return deduplicatedGenes;
    return [queryGeneRow, ...deduplicatedGenes];
  }, [queryGeneRow, deduplicatedGenes]);

  // AG Grid column definitions
  const columnDefs = useMemo(() => [
    {
      headerName: 'Gene Name',
      field: 'gene_name',
      flex: 1,
      minWidth: 100,
      cellRenderer: (params) => {
        const gene = params.data;
        const displayName = gene.gene_name || gene.feature_name;
        return (
          <Link
            to={`/locus/${gene.feature_name || gene.gene_name}?tab=expression&subtab=coexpression`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {displayName}
          </Link>
        );
      },
    },
    {
      headerName: 'Systematic Name',
      field: 'feature_name',
      flex: 1.2,
      minWidth: 120,
      cellRenderer: (params) => {
        const gene = params.data;
        return (
          <Link
            to={`/locus/${gene.feature_name}?tab=expression&subtab=coexpression`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <code>{gene.feature_name}</code>
          </Link>
        );
      },
    },
    {
      headerName: 'Description',
      field: 'description',
      flex: 2.5,
      minWidth: 200,
      autoHeight: true,
      wrapText: true,
      cellRenderer: (params) => (
        <span className="gene-description">{params.value || '-'}</span>
      ),
    },
    {
      headerName: 'Correlation',
      field: 'correlation',
      flex: 0.8,
      minWidth: 90,
      type: 'numericColumn',
      valueFormatter: (params) => {
        if (params.value == null) return '-';
        return params.value.toFixed(3);
      },
      cellClass: (params) => {
        if (params.value == null) return '';
        const absValue = Math.abs(params.value);
        const isNegative = params.value < 0;
        if (isNegative) {
          // Negative correlations (anticorrelated) - use blue shades
          if (absValue >= 0.8) return 'correlation-negative-high';
          if (absValue >= 0.6) return 'correlation-negative-medium';
          return 'correlation-negative-low';
        } else {
          // Positive correlations (correlated) - use existing colors
          if (absValue >= 0.8) return 'correlation-high';
          if (absValue >= 0.6) return 'correlation-medium';
          return 'correlation-low';
        }
      },
    },
    {
      headerName: 'P-value',
      field: 'p_value',
      flex: 0.8,
      minWidth: 90,
      type: 'numericColumn',
      valueFormatter: (params) => {
        if (params.value == null) return '-';
        if (params.value < 0.001) return '<0.001';
        return params.value.toFixed(3);
      },
    },
    {
      headerName: 'Conditions',
      field: 'shared_conditions',
      flex: 0.7,
      minWidth: 80,
      type: 'numericColumn',
    },
  ], []);

  // Default column properties
  const defaultColDef = useMemo(() => ({
    sortable: true,
    resizable: true,
  }), []);

  // Format computation time
  const formatTime = (seconds) => {
    if (seconds == null) return '';
    if (seconds < 1) return `${(seconds * 1000).toFixed(0)}ms`;
    return `${seconds.toFixed(1)}s`;
  };

  // Load heatmap data for query gene + similar genes
  const loadHeatmapData = useCallback(async () => {
    if (!data?.query_gene || !allGenesForDisplay.length) return;

    setHeatmapLoading(true);

    try {
      // Get the organism display name for the API
      const organismDisplay = getOrganismDisplay(organism);

      // Query gene identifiers - with fallback to effectiveLocusName (ortholog if applicable)
      // API returns: query_gene (string, e.g. "HOG1") and query_feature_name (string, e.g. "C2_03330C_A")
      const querySystematicName = data.query_feature_name || effectiveLocusName;
      const queryStandardName = data.query_gene || effectiveLocusName;

      // Use same gene list as table for consistency (query gene + similar genes)
      const geneNamesForApi = allGenesForDisplay.map(g => g.feature_name || g.gene_name);

      // Fetch expression data for all genes
      const expressionResults = await expressionApi.getMultiGeneExpression(geneNamesForApi, organismDisplay);

      // Build ordered results matching allGenesForDisplay order
      const orderedResults = allGenesForDisplay.map(gene => {
        const geneName = gene.feature_name || gene.gene_name;
        const entry = expressionResults.find(r =>
          r.geneName === geneName ||
          r.geneName === gene.gene_name ||
          r.data?.feature_name === gene.feature_name ||
          r.data?.gene_name === gene.gene_name
        );

        return {
          geneName: gene.gene_name || gene.feature_name,
          data: {
            ...(entry?.data || {}),
            gene_name: gene.gene_name || gene.feature_name,
            feature_name: gene.feature_name,
            studies: entry?.data?.studies || []
          },
          error: entry?.error || null,
          isQueryGene: gene.isQueryGene || false,
          correlation: gene.correlation
        };
      });

      setHeatmapData(orderedResults);
    } catch (err) {
      console.error('Failed to load heatmap data:', err);
    } finally {
      setHeatmapLoading(false);
    }
  }, [data, allGenesForDisplay, organism, effectiveLocusName, limit]);

  // Reset heatmap data when similar genes data or limit changes
  useEffect(() => {
    setHeatmapData(null);
  }, [data, limit]);

  // Get the query gene's condition count from the similar genes data
  // The shared_conditions value from similar genes tells us how many conditions
  // the query gene has (since correlation requires both genes to have data)
  const queryGeneConditionCount = useMemo(() => {
    // Try to get from raw API response first (data.similar_genes)
    if (data?.similar_genes?.length > 0) {
      const firstGene = data.similar_genes[0];
      if (firstGene.shared_conditions) {
        return firstGene.shared_conditions;
      }
    }

    // Fallback: try deduplicatedGenes
    if (deduplicatedGenes.length > 0 && deduplicatedGenes[0].shared_conditions) {
      return deduplicatedGenes[0].shared_conditions;
    }

    // Fallback: try to count from heatmap data if available
    if (heatmapData && heatmapData.length > 0) {
      const queryGeneData = heatmapData[0];
      if (queryGeneData?.data?.studies) {
        let count = 0;
        queryGeneData.data.studies.forEach(study => {
          if (study.conditions) {
            count += study.conditions.length;
          }
        });
        if (count > 0) return count;
      }
    }

    return null;
  }, [data?.similar_genes, deduplicatedGenes, heatmapData]);

  // Auto-load heatmap data when similar genes data is available
  useEffect(() => {
    if (data?.query_gene && allGenesForDisplay.length > 0 && !heatmapData && !heatmapLoading) {
      loadHeatmapData();
    }
  }, [data, allGenesForDisplay, heatmapData, heatmapLoading, loadHeatmapData]);

  // Get display name for organism
  const getOrganismDisplay = (apiOrganism) => {
    return ORGANISM_DISPLAY_MAP[apiOrganism] || apiOrganism;
  };

  // State for copy feedback
  const [copyFeedback, setCopyFeedback] = useState(null);

  // State for enrichment analysis
  const [goEnrichment, setGoEnrichment] = useState({ loading: false, data: null, error: null, show: false });
  const [phenoEnrichment, setPhenoEnrichment] = useState({ loading: false, data: null, error: null, show: false });

  // Store gene list and organism in localStorage for analysis tools (GO Term Finder, etc.)
  const handleAnalyzeGeneList = useCallback(() => {
    const geneList = deduplicatedGenes.map(g => g.feature_name || g.gene_name);
    localStorage.setItem('phenotypeSearchGeneList', JSON.stringify(geneList));
    // Also store organism display name for pre-selection in GO tools
    const organismDisplay = getOrganismDisplay(organism);
    localStorage.setItem('phenotypeSearchOrganism', organismDisplay);
  }, [deduplicatedGenes, organism]);

  // Copy gene names to clipboard (excluding query gene)
  const handleCopyGeneList = useCallback(async () => {
    const geneNames = deduplicatedGenes
      .map(g => g.gene_name || g.feature_name)
      .join('\n');

    try {
      await navigator.clipboard.writeText(geneNames);
      setCopyFeedback('copied');
      setTimeout(() => setCopyFeedback(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      setCopyFeedback('error');
      setTimeout(() => setCopyFeedback(null), 2000);
    }
  }, [deduplicatedGenes]);

  // Download CSV with gene details
  const handleDownloadCSV = useCallback(() => {
    const queryGene = data?.query_gene || effectiveLocusName;
    const headers = ['Gene Name', 'Systematic Name', 'Description', 'Correlation', 'P-value', 'Shared Conditions'];
    const rows = deduplicatedGenes.map(g => [
      g.gene_name || '',
      g.feature_name || '',
      (g.description || '').replace(/"/g, '""'),  // Escape quotes
      g.correlation?.toFixed(4) || '',
      g.p_value?.toFixed(6) || '',
      g.shared_conditions || ''
    ]);

    // Build CSV content
    const csvContent = [
      `# Similar genes for ${queryGene}`,
      `# Organism: ${getOrganismDisplay(organism)}`,
      `# Metric: pearson correlation`,
      `# Generated: ${new Date().toISOString()}`,
      '',
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `similar_genes_${queryGene}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [deduplicatedGenes, data, effectiveLocusName, organism, getOrganismDisplay]);

  // Download expression matrix (gene x condition) as TSV
  const [matrixDownloading, setMatrixDownloading] = useState(false);
  const handleDownloadExpressionMatrix = useCallback(async () => {
    if (matrixDownloading || !deduplicatedGenes.length) return;

    setMatrixDownloading(true);
    try {
      // Build gene list: query gene + similar genes
      const queryGene = effectiveLocusName || data?.query_gene;
      const geneNames = [queryGene, ...deduplicatedGenes.map(g => g.feature_name || g.gene_name)];

      // Build correlations map for metadata
      const correlations = {};
      correlations[queryGene] = 1.0; // Query gene has perfect correlation with itself
      deduplicatedGenes.forEach(g => {
        const name = g.feature_name || g.gene_name;
        correlations[name] = g.correlation;
      });

      // Get organism display name
      const organismDisplay = getOrganismDisplay(organism);

      await expressionApi.downloadExpressionMatrix(geneNames, organismDisplay, {
        includeMetadata: true,
        correlations: correlations,
      });
    } catch (err) {
      console.error('Failed to download expression matrix:', err);
      alert('Failed to download expression matrix. Please try again.');
    } finally {
      setMatrixDownloading(false);
    }
  }, [deduplicatedGenes, effectiveLocusName, data, organism, getOrganismDisplay, matrixDownloading]);

  // Run GO enrichment analysis
  const handleGoEnrichment = useCallback(async () => {
    if (!data?.organism_no || !deduplicatedGenes.length) {
      setGoEnrichment(prev => ({
        ...prev,
        show: true,
        error: 'No organism information available. Please refresh and try again.',
      }));
      return;
    }

    setGoEnrichment({ loading: true, data: null, error: null, show: true });

    try {
      const geneNames = deduplicatedGenes.map(g => g.feature_name || g.gene_name);
      const result = await goTermFinderApi.runAnalysis({
        genes: geneNames,
        organism_no: data.organism_no,
        ontology: 'all',
        p_value_cutoff: 0.05,
        correction_method: 'bh',
        min_genes_in_term: 2,
      });

      setGoEnrichment({ loading: false, data: result, error: null, show: true });
    } catch (err) {
      console.error('GO enrichment failed:', err);
      setGoEnrichment({
        loading: false,
        data: null,
        error: err.response?.data?.detail || err.message || 'GO enrichment analysis failed',
        show: true,
      });
    }
  }, [data?.organism_no, deduplicatedGenes]);

  // Run phenotype enrichment analysis
  const handlePhenotypeEnrichment = useCallback(async () => {
    if (!data?.organism_no || !deduplicatedGenes.length) {
      setPhenoEnrichment(prev => ({
        ...prev,
        show: true,
        error: 'No organism information available. Please refresh and try again.',
      }));
      return;
    }

    setPhenoEnrichment({ loading: true, data: null, error: null, show: true });

    try {
      const geneNames = deduplicatedGenes.map(g => g.feature_name || g.gene_name);
      const result = await phenotypeEnrichmentApi.runAnalysis({
        genes: geneNames,
        organism_no: data.organism_no,
        p_value_cutoff: 0.05,
        correction_method: 'bh',
        min_genes_in_term: 2,
      });

      setPhenoEnrichment({ loading: false, data: result, error: null, show: true });
    } catch (err) {
      console.error('Phenotype enrichment failed:', err);
      setPhenoEnrichment({
        loading: false,
        data: null,
        error: err.response?.data?.detail || err.message || 'Phenotype enrichment analysis failed',
        show: true,
      });
    }
  }, [data?.organism_no, deduplicatedGenes]);

  // Close enrichment panels
  const handleCloseGoEnrichment = useCallback(() => {
    setGoEnrichment(prev => ({ ...prev, show: false }));
  }, []);

  const handleClosePhenoEnrichment = useCallback(() => {
    setPhenoEnrichment(prev => ({ ...prev, show: false }));
  }, []);

  return (
    <div className="similar-genes-details">
      {/* Introductory description for newcomers */}
      <p className="similar-genes-intro">
        Profiles of genes with similar expression patterns based on Pearson correlation across RNA-seq conditions.
      </p>

      {/* Controls Bar */}
      <div className="similar-genes-controls">
        <div className="control-group">
          <label htmlFor="organism-select">Organism:</label>
          <select
            id="organism-select"
            value={organism}
            onChange={(e) => handleOrganismChange(e.target.value)}
            disabled={loading}
          >
            {ORGANISMS.map((org) => (
              <option key={org.api} value={org.api}>
                {org.display}
              </option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="limit-select">Limit:</label>
          <select
            id="limit-select"
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            disabled={loading}
          >
            {LIMITS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>

        <div className="control-group view-toggle">
          <label>View:</label>
          <div className="view-toggle-buttons">
            <button
              className={`view-toggle-btn ${viewMode === 'heatmap' ? 'active' : ''}`}
              onClick={() => setViewMode('heatmap')}
            >
              Heatmap
            </button>
            <button
              className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
            >
              Table
            </button>
          </div>
        </div>

        <button
          className="reset-btn"
          onClick={() => {
            setLimit(20);
            setViewMode('heatmap');
          }}
          title="Reset to default settings"
          disabled={loading}
        >
          Reset
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="similar-genes-loading">
          <div className="loading-spinner"></div>
          <p>Computing expression correlations...</p>
          <p className="loading-note">This may take 10-20 seconds for the first query.</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="similar-genes-error">
          <p>Error: {error}</p>
          <button onClick={fetchSimilarGenes} className="retry-btn">
            Retry
          </button>
        </div>
      )}

      {/* Results */}
      {data && !loading && !error && (
        <>
          {/* Query Summary - single line */}
          <div className="similar-genes-summary">
            <span className="summary-label">Query:</span>
            <span className="summary-value">
              {data.query_gene || effectiveLocusName}
              {data.query_feature_name && data.query_gene && (
                <span className="systematic-name"> ({data.query_feature_name})</span>
              )}
            </span>
            <span className="summary-separator">|</span>
            <span className="summary-label">Organism:</span>
            <span className="summary-value">{getOrganismDisplay(data.organism || organism)}</span>
            <span className="summary-separator">|</span>
            <span className="summary-label">Conditions:</span>
            <span className="summary-value">
              {queryGeneConditionCount || data.conditions_used || 'All'}
              {queryGeneConditionCount && queryGeneConditionCount < MIN_RELIABLE_CONDITIONS && (
                <span className="low-conditions-warning" title="Correlations based on few conditions may not be statistically reliable">
                  ⚠
                </span>
              )}
            </span>
          </div>

          {/* Warning for low condition count */}
          {queryGeneConditionCount && queryGeneConditionCount < MIN_RELIABLE_CONDITIONS && (
            <div className="similar-genes-warning">
              <span className="warning-icon">⚠</span>
              <span className="warning-text">
                This gene has expression data for only {queryGeneConditionCount} conditions.
                Correlations based on fewer than {MIN_RELIABLE_CONDITIONS} conditions may not be statistically reliable.
                High r values with few data points can occur by chance.
              </span>
            </div>
          )}

          {/* Results - Heatmap or Table based on viewMode */}
          {allGenesForDisplay.length > 0 ? (
            <>
              {/* Heatmap View */}
              {viewMode === 'heatmap' && (
                <div className="coexpression-heatmap-inline">
                  <MultiGeneHeatmap
                    queryGene={data?.query_gene}
                    queryFeatureName={data?.query_feature_name || effectiveLocusName}
                    similarGenes={allGenesForDisplay}
                    expressionData={heatmapData}
                    loading={heatmapLoading}
                    inline={true}
                  />
                </div>
              )}

              {/* Table View */}
              {viewMode === 'table' && (
                <div className="similar-genes-grid-wrapper ag-theme-alpine">
                  <AgGridReact
                    rowData={allGenesForDisplay}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    domLayout="autoHeight"
                    pagination={true}
                    paginationPageSize={20}
                    paginationPageSizeSelector={[10, 20, 50, 100]}
                    suppressCellFocus={true}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="no-data">
              No similar genes found for this query. This may be because:
              <ul>
                <li>The gene has no expression data in the selected organism</li>
                <li>There are not enough shared conditions with other genes</li>
              </ul>
            </div>
          )}

          {/* Export & Analyze Toolbar - at bottom after results */}
          {deduplicatedGenes.length > 0 && (
            <div className="similar-genes-export-toolbar">
              <span className="export-label">Export ({deduplicatedGenes.length} genes):</span>
              <button
                className="export-btn"
                onClick={handleCopyGeneList}
                title="Copy gene names to clipboard"
              >
                {copyFeedback === 'copied' ? 'Copied!' : copyFeedback === 'error' ? 'Error' : 'Copy Gene List'}
              </button>
              <button
                className="export-btn"
                onClick={handleDownloadCSV}
                title="Download as CSV file"
              >
                Download CSV
              </button>
              <button
                className="export-btn"
                onClick={handleDownloadExpressionMatrix}
                disabled={matrixDownloading}
                title="Download expression matrix (gene × condition) as TSV"
              >
                {matrixDownloading ? 'Downloading...' : 'Expression Matrix'}
              </button>
              <span className="export-separator">|</span>
              <span className="export-label">Analyze:</span>
              <button
                className="export-btn analyze-btn"
                onClick={handleGoEnrichment}
                disabled={goEnrichment.loading || !data?.organism_no}
                title="Find enriched GO terms in this gene list"
              >
                {goEnrichment.loading ? 'Analyzing...' : 'GO Enrichment'}
              </button>
              <button
                className="export-btn analyze-btn"
                onClick={handlePhenotypeEnrichment}
                disabled={phenoEnrichment.loading || !data?.organism_no}
                title="Find enriched phenotypes in this gene list"
              >
                {phenoEnrichment.loading ? 'Analyzing...' : 'Phenotype Enrichment'}
              </button>
              <span className="export-separator">|</span>
              <a
                href="/go-term-finder"
                target="_blank"
                rel="noopener noreferrer"
                className="export-btn analyze-link"
                onClick={handleAnalyzeGeneList}
                title="Open GO Term Finder in new tab"
              >
                GO Term Finder ↗
              </a>
              <a
                href="/go-slim-mapper"
                target="_blank"
                rel="noopener noreferrer"
                className="export-btn analyze-link"
                onClick={handleAnalyzeGeneList}
                title="Open GO Slim Mapper in new tab"
              >
                GO Slim Mapper ↗
              </a>
            </div>
          )}

          {/* GO Enrichment Results Panel */}
          {goEnrichment.show && (
            <EnrichmentResultsPanel
              title="GO Enrichment Results"
              type="go"
              data={goEnrichment.data}
              loading={goEnrichment.loading}
              error={goEnrichment.error}
              onClose={handleCloseGoEnrichment}
              onRetry={handleGoEnrichment}
            />
          )}

          {/* Phenotype Enrichment Results Panel */}
          {phenoEnrichment.show && (
            <EnrichmentResultsPanel
              title="Phenotype Enrichment Results"
              type="phenotype"
              data={phenoEnrichment.data}
              loading={phenoEnrichment.loading}
              error={phenoEnrichment.error}
              onClose={handleClosePhenoEnrichment}
              onRetry={handlePhenotypeEnrichment}
            />
          )}

          {/* Computation Time */}
          {data.computation_time && (
            <div className="similar-genes-footer">
              <span className="computation-time">
                Computation time: {formatTime(data.computation_time)}
              </span>
            </div>
          )}
        </>
      )}

      {/* Initial State - no data yet */}
      {!data && !loading && !error && (
        <div className="no-data">
          Select options above to find genes with similar expression profiles.
        </div>
      )}

    </div>
  );
}

export default SimilarGenesDetails;
