import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import { expressionApi, ORGANISM_MAP, ORGANISM_DISPLAY_MAP } from '../../api/expressionApi';
import MultiGeneHeatmap from './MultiGeneHeatmap';
import './LocusComponents.css';
import './SimilarGenesDetails.css';

// Minimum number of shared conditions for statistically reliable correlations
const MIN_RELIABLE_CONDITIONS = 10;

// Available correlation directions
const DIRECTIONS = [
  { value: 'both', label: 'Both' },
  { value: 'positive', label: 'Correlated' },
  { value: 'negative', label: 'Anticorrelated' },
];

// Gene ranking/sorting options
const RANK_OPTIONS = [
  { value: 'strength', label: 'Strongest relationship |r|' },
  { value: 'correlated', label: 'Most correlated' },
  { value: 'anticorrelated', label: 'Most anticorrelated' },
];

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
  const [direction, setDirection] = useState('both');
  const [rankBy, setRankBy] = useState('strength'); // 'strength' (|r|), 'correlated', 'anticorrelated'

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
      // Request more genes than needed to account for filtering (orf19/21, duplicates)
      // Cap at 100 to avoid backend limits
      const requestLimit = Math.min(limit * 2, 100);

      if (direction === 'both') {
        // Fetch both positive and negative correlations and combine them
        const [positiveResult, negativeResult] = await Promise.all([
          expressionApi.getSimilarGenes(effectiveLocusName, {
            organism,
            metric: 'pearson',
            limit: requestLimit,
            direction: 'positive',
          }),
          expressionApi.getSimilarGenes(effectiveLocusName, {
            organism,
            metric: 'pearson',
            limit: requestLimit,
            direction: 'negative',
          }),
        ]);

        // Combine results - sorting will be applied later based on rankBy
        const combinedGenes = [
          ...(positiveResult.similar_genes || []),
          ...(negativeResult.similar_genes || []),
        ];

        setData({
          ...positiveResult,
          similar_genes: combinedGenes,
        });
      } else {
        const result = await expressionApi.getSimilarGenes(effectiveLocusName, {
          organism,
          metric: 'pearson',
          limit: requestLimit,
          direction,
        });
        setData(result);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to fetch similar genes';
      setError(errorMessage);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [effectiveLocusName, organism, limit, direction]);

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

    // Sort based on rankBy option
    if (rankBy === 'strength') {
      // Sort by absolute correlation descending (strongest relationships first)
      filtered.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
    } else if (rankBy === 'correlated') {
      // Sort by correlation descending (most positive first)
      filtered.sort((a, b) => b.correlation - a.correlation);
    } else if (rankBy === 'anticorrelated') {
      // Sort by correlation ascending (most negative first)
      filtered.sort((a, b) => a.correlation - b.correlation);
    }

    // Limit to requested number of genes
    return filtered.slice(0, limit);
  }, [data?.similar_genes, data?.query_gene, data?.query_feature_name, limit, rankBy]);

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

  // Reset heatmap data when similar genes data or ranking changes
  // (need to reload expression data for the new sorted gene list)
  useEffect(() => {
    setHeatmapData(null);
  }, [data, rankBy]);

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
      `# Metric: pearson`,
      `# Direction: ${direction}`,
      `# Rank by: ${rankBy}`,
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
    link.download = `similar_genes_${queryGene}_${direction}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [deduplicatedGenes, data, effectiveLocusName, organism, direction, rankBy, getOrganismDisplay]);

  return (
    <div className="similar-genes-details">
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
          <label htmlFor="direction-select">Relationship:</label>
          <select
            id="direction-select"
            value={direction}
            onChange={(e) => {
              setDirection(e.target.value);
              // Clear stale data immediately to prevent showing wrong genes during API fetch
              setData(null);
              setHeatmapData(null);
            }}
            disabled={loading}
          >
            {DIRECTIONS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="rank-select">Rank by:</label>
          <select
            id="rank-select"
            value={rankBy}
            onChange={(e) => setRankBy(e.target.value)}
            disabled={loading}
          >
            {RANK_OPTIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
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
            setDirection('both');
            setRankBy('strength');
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

          {/* Helper text explaining current sorting */}
          {direction === 'both' && (
            <div className="similar-genes-helper">
              {rankBy === 'strength' && (
                <>Showing the top {limit} genes ranked by strongest expression relationship, using absolute correlation |r|.</>
              )}
              {rankBy === 'correlated' && (
                <>Showing top {limit} genes sorted from most positive to most negative correlation.</>
              )}
              {rankBy === 'anticorrelated' && (
                <>Showing top {limit} genes sorted from most negative to most positive correlation.</>
              )}
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
              <span className="export-separator">|</span>
              <span className="export-label">Analyze:</span>
              <a
                href="/go-term-finder"
                target="_blank"
                rel="noopener noreferrer"
                className="export-btn analyze-link"
                onClick={handleAnalyzeGeneList}
                title="Find enriched GO terms in gene list"
              >
                GO Term Finder
              </a>
              <a
                href="/go-slim-mapper"
                target="_blank"
                rel="noopener noreferrer"
                className="export-btn analyze-link"
                onClick={handleAnalyzeGeneList}
                title="Map genes to GO Slim categories"
              >
                GO Slim Mapper
              </a>
            </div>
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
