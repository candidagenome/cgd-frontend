import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import { expressionApi, ORGANISM_MAP, ORGANISM_DISPLAY_MAP } from '../../api/expressionApi';
import './LocusComponents.css';
import './SimilarGenesDetails.css';

// Available metrics for correlation
const METRICS = [
  { value: 'pearson', label: 'Pearson' },
  { value: 'spearman', label: 'Spearman' },
  { value: 'cosine', label: 'Cosine' },
];

// Available limits for results
const LIMITS = [10, 20, 50, 100];

// Available organisms for expression data
const ORGANISMS = Object.entries(ORGANISM_MAP).map(([display, api]) => ({
  display,
  api,
}));

function SimilarGenesDetails({ locusName, selectedOrganism }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  // Controls state
  const [organism, setOrganism] = useState('C_albicans_SC5314_A22');
  const [metric, setMetric] = useState('pearson');
  const [limit, setLimit] = useState(20);

  // Set organism based on selected organism from parent
  useEffect(() => {
    if (selectedOrganism) {
      // Try to map the selected organism to an API organism
      const apiOrganism = ORGANISM_MAP[selectedOrganism];
      if (apiOrganism) {
        setOrganism(apiOrganism);
      }
    }
  }, [selectedOrganism]);

  // Fetch similar genes data
  const fetchSimilarGenes = useCallback(async () => {
    if (!locusName) return;

    setLoading(true);
    setError(null);

    try {
      const result = await expressionApi.getSimilarGenes(locusName, {
        organism,
        metric,
        limit,
      });
      setData(result);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to fetch similar genes';
      setError(errorMessage);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [locusName, organism, metric, limit]);

  // Fetch data when component mounts or parameters change
  useEffect(() => {
    fetchSimilarGenes();
  }, [fetchSimilarGenes]);

  // Deduplicate genes by gene_name (A/B alleles have same gene_name)
  const deduplicatedGenes = useMemo(() => {
    if (!data?.similar_genes) return [];

    const seen = new Set();
    return data.similar_genes.filter(gene => {
      // Use gene_name for deduplication, fall back to feature_name
      const key = gene.gene_name || gene.feature_name;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [data?.similar_genes]);

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
          <Link to={`/locus/${gene.feature_name || gene.gene_name}`}>
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
          <Link to={`/locus/${gene.feature_name}`}>
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
        if (params.value >= 0.8) return 'correlation-high';
        if (params.value >= 0.6) return 'correlation-medium';
        return 'correlation-low';
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

  // Get display name for organism
  const getOrganismDisplay = (apiOrganism) => {
    return ORGANISM_DISPLAY_MAP[apiOrganism] || apiOrganism;
  };

  return (
    <div className="similar-genes-details">
      {/* Controls Bar */}
      <div className="similar-genes-controls">
        <div className="control-group">
          <label htmlFor="organism-select">Organism:</label>
          <select
            id="organism-select"
            value={organism}
            onChange={(e) => setOrganism(e.target.value)}
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
          <label htmlFor="metric-select">Metric:</label>
          <select
            id="metric-select"
            value={metric}
            onChange={(e) => setMetric(e.target.value)}
            disabled={loading}
          >
            {METRICS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
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
          {/* Query Summary */}
          <div className="similar-genes-summary">
            <div className="summary-item">
              <span className="summary-label">Query:</span>
              <span className="summary-value">
                {data.query_gene?.gene_name || data.query_gene?.systematic_name || locusName}
                {data.query_gene?.systematic_name && data.query_gene?.gene_name && (
                  <span className="systematic-name"> ({data.query_gene.systematic_name})</span>
                )}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Organism:</span>
              <span className="summary-value">{getOrganismDisplay(data.organism || organism)}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Conditions:</span>
              <span className="summary-value">{data.conditions_used || '-'}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Genes compared:</span>
              <span className="summary-value">{data.genes_compared?.toLocaleString() || '-'}</span>
            </div>
          </div>

          {/* Results Table */}
          {deduplicatedGenes.length > 0 ? (
            <div className="similar-genes-grid-wrapper ag-theme-alpine">
              <AgGridReact
                rowData={deduplicatedGenes}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                domLayout="autoHeight"
                pagination={true}
                paginationPageSize={20}
                paginationPageSizeSelector={[10, 20, 50, 100]}
                suppressCellFocus={true}
              />
            </div>
          ) : (
            <div className="no-data">
              No similar genes found for this query. This may be because:
              <ul>
                <li>The gene has no expression data in the selected organism</li>
                <li>There are not enough shared conditions with other genes</li>
              </ul>
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
