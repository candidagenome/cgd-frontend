import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import './EnrichmentResultsPanel.css';

/**
 * Reusable panel for displaying GO or Phenotype enrichment results.
 *
 * @param {Object} props
 * @param {string} props.title - Panel title (e.g., "GO Enrichment Results")
 * @param {string} props.type - Type of enrichment ('go' or 'phenotype')
 * @param {Object} props.data - Enrichment result data from API
 * @param {boolean} props.loading - Whether analysis is in progress
 * @param {string} props.error - Error message if analysis failed
 * @param {Function} props.onClose - Callback when panel is closed
 * @param {Function} props.onRetry - Callback to retry analysis
 */
function EnrichmentResultsPanel({
  title,
  type,
  data,
  loading,
  error,
  onClose,
  onRetry,
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [sortField, setSortField] = useState('p_value');
  const [sortDirection, setSortDirection] = useState('asc');

  // Get enriched terms based on type
  const enrichedTerms = useMemo(() => {
    if (!data?.result) return [];

    if (type === 'go') {
      // Combine all GO terms from all aspects
      const allTerms = [
        ...(data.result.process_terms || []),
        ...(data.result.function_terms || []),
        ...(data.result.component_terms || []),
      ];
      return allTerms;
    } else {
      // Phenotype enrichment
      return data.result.enriched_phenotypes || [];
    }
  }, [data, type]);

  // Sort terms
  const sortedTerms = useMemo(() => {
    if (!enrichedTerms.length) return [];

    return [...enrichedTerms].sort((a, b) => {
      let aVal, bVal;

      switch (sortField) {
        case 'p_value':
          aVal = a.p_value;
          bVal = b.p_value;
          break;
        case 'fdr':
          aVal = a.fdr ?? 1;
          bVal = b.fdr ?? 1;
          break;
        case 'fold_enrichment':
          aVal = a.fold_enrichment;
          bVal = b.fold_enrichment;
          break;
        case 'query_count':
          aVal = a.query_count;
          bVal = b.query_count;
          break;
        default:
          aVal = a.p_value;
          bVal = b.p_value;
      }

      if (sortDirection === 'asc') {
        return aVal - bVal;
      } else {
        return bVal - aVal;
      }
    });
  }, [enrichedTerms, sortField, sortDirection]);

  // Toggle row expansion to show gene list
  const toggleRow = (index) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRows(newExpanded);
  };

  // Handle sort click
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection(field === 'fold_enrichment' || field === 'query_count' ? 'desc' : 'asc');
    }
  };

  // Format p-value for display
  const formatPValue = (pval) => {
    if (pval == null) return '-';
    if (pval < 0.0001) return pval.toExponential(2);
    return pval.toFixed(4);
  };

  // Get term display name
  const getTermName = (term) => {
    if (type === 'go') {
      return term.go_term;
    } else {
      return term.observable;
    }
  };

  // Get term ID for display
  const getTermId = (term) => {
    if (type === 'go') {
      return term.goid;
    } else {
      return null; // Phenotypes don't have standard IDs
    }
  };

  // Get aspect/category for GO terms
  const getAspect = (term) => {
    if (type === 'go') {
      return term.aspect_name || term.go_aspect;
    }
    return term.mutant_type || '';
  };

  return (
    <div className={`enrichment-results-panel ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Header */}
      <div className="enrichment-panel-header" onClick={() => setIsCollapsed(!isCollapsed)}>
        <div className="header-left">
          <span className={`collapse-icon ${isCollapsed ? 'collapsed' : ''}`}>
            {isCollapsed ? '▶' : '▼'}
          </span>
          <h4>{title}</h4>
          {data?.result && (
            <span className="term-count">
              ({type === 'go' ? data.result.total_enriched_terms : data.result.total_enriched_phenotypes} enriched)
            </span>
          )}
        </div>
        <div className="header-right">
          {loading && <span className="loading-indicator">Analyzing...</span>}
          <button
            className="close-btn"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            title="Close panel"
          >
            ×
          </button>
        </div>
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div className="enrichment-panel-content">
          {/* Loading State */}
          {loading && (
            <div className="enrichment-loading">
              <div className="loading-spinner"></div>
              <p>Running {type === 'go' ? 'GO' : 'phenotype'} enrichment analysis...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="enrichment-error">
              <p>Error: {error}</p>
              {onRetry && (
                <button onClick={onRetry} className="retry-btn">
                  Retry
                </button>
              )}
            </div>
          )}

          {/* Results */}
          {data?.result && !loading && !error && (
            <>
              {/* Summary */}
              <div className="enrichment-summary">
                <span>
                  Query: {data.result.query_genes_found} genes found
                  ({type === 'go' ? data.result.query_genes_with_go : data.result.query_genes_with_phenotype} with annotations)
                </span>
                <span className="summary-sep">|</span>
                <span>Background: {data.result.background_size} genes</span>
                <span className="summary-sep">|</span>
                <span>P-value cutoff: {data.result.p_value_cutoff}</span>
              </div>

              {/* Results Table */}
              {sortedTerms.length > 0 ? (
                <div className="enrichment-table-wrapper">
                  <table className="enrichment-table">
                    <thead>
                      <tr>
                        <th className="expand-col"></th>
                        <th className="term-col">
                          {type === 'go' ? 'GO Term' : 'Observable'}
                        </th>
                        {type === 'go' && <th className="aspect-col">Aspect</th>}
                        <th
                          className={`sortable ${sortField === 'query_count' ? 'sorted' : ''}`}
                          onClick={() => handleSort('query_count')}
                        >
                          Genes
                          {sortField === 'query_count' && (
                            <span className="sort-icon">{sortDirection === 'asc' ? ' ↑' : ' ↓'}</span>
                          )}
                        </th>
                        <th
                          className={`sortable ${sortField === 'fold_enrichment' ? 'sorted' : ''}`}
                          onClick={() => handleSort('fold_enrichment')}
                        >
                          Fold
                          {sortField === 'fold_enrichment' && (
                            <span className="sort-icon">{sortDirection === 'asc' ? ' ↑' : ' ↓'}</span>
                          )}
                        </th>
                        <th
                          className={`sortable ${sortField === 'p_value' ? 'sorted' : ''}`}
                          onClick={() => handleSort('p_value')}
                        >
                          P-value
                          {sortField === 'p_value' && (
                            <span className="sort-icon">{sortDirection === 'asc' ? ' ↑' : ' ↓'}</span>
                          )}
                        </th>
                        <th
                          className={`sortable ${sortField === 'fdr' ? 'sorted' : ''}`}
                          onClick={() => handleSort('fdr')}
                        >
                          FDR
                          {sortField === 'fdr' && (
                            <span className="sort-icon">{sortDirection === 'asc' ? ' ↑' : ' ↓'}</span>
                          )}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedTerms.map((term, index) => (
                        <React.Fragment key={index}>
                          <tr
                            className={`term-row ${expandedRows.has(index) ? 'expanded' : ''}`}
                            onClick={() => toggleRow(index)}
                          >
                            <td className="expand-col">
                              <span className="expand-icon">
                                {expandedRows.has(index) ? '−' : '+'}
                              </span>
                            </td>
                            <td className="term-col">
                              <span className="term-name">{getTermName(term)}</span>
                              {getTermId(term) && (
                                <span className="term-id">{getTermId(term)}</span>
                              )}
                            </td>
                            {type === 'go' && (
                              <td className="aspect-col">
                                <span className={`aspect-badge aspect-${term.go_aspect?.toLowerCase()}`}>
                                  {term.go_aspect}
                                </span>
                              </td>
                            )}
                            <td className="count-col">
                              {term.query_count}/{term.query_total}
                            </td>
                            <td className="fold-col">
                              {term.fold_enrichment?.toFixed(2)}
                            </td>
                            <td className="pval-col">
                              {formatPValue(term.p_value)}
                            </td>
                            <td className="fdr-col">
                              {formatPValue(term.fdr)}
                            </td>
                          </tr>
                          {/* Expanded Gene List */}
                          {expandedRows.has(index) && (
                            <tr className="gene-list-row">
                              <td colSpan={type === 'go' ? 7 : 6}>
                                <div className="gene-list">
                                  <strong>Genes:</strong>{' '}
                                  {term.genes?.map((gene, gIdx) => (
                                    <span key={gIdx}>
                                      <Link
                                        to={`/locus/${gene.systematic_name}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        {gene.gene_name || gene.systematic_name}
                                      </Link>
                                      {gIdx < term.genes.length - 1 && ', '}
                                    </span>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="no-results">
                  No significantly enriched {type === 'go' ? 'GO terms' : 'phenotypes'} found.
                </div>
              )}

              {/* Warnings */}
              {data.warnings?.length > 0 && (
                <div className="enrichment-warnings">
                  {data.warnings.map((warning, idx) => (
                    <p key={idx}>{warning}</p>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default EnrichmentResultsPanel;
