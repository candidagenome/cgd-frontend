import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import './EnrichmentResultsPanel.css';

const ROWS_PER_PAGE = 10;

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
  const [currentPage, setCurrentPage] = useState(1);

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

  // Pagination
  const totalPages = Math.ceil(sortedTerms.length / ROWS_PER_PAGE);
  const paginatedTerms = useMemo(() => {
    const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
    return sortedTerms.slice(startIndex, startIndex + ROWS_PER_PAGE);
  }, [sortedTerms, currentPage]);

  // Reset to page 1 when sort changes
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection(field === 'fold_enrichment' || field === 'query_count' ? 'desc' : 'asc');
    }
    setCurrentPage(1);
  };

  // Toggle row expansion to show gene list
  const toggleRow = (index) => {
    const globalIndex = (currentPage - 1) * ROWS_PER_PAGE + index;
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(globalIndex)) {
      newExpanded.delete(globalIndex);
    } else {
      newExpanded.add(globalIndex);
    }
    setExpandedRows(newExpanded);
  };

  // Check if row is expanded
  const isRowExpanded = (index) => {
    const globalIndex = (currentPage - 1) * ROWS_PER_PAGE + index;
    return expandedRows.has(globalIndex);
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
      // For phenotypes, include mutant_type to distinguish similar observables
      return term.observable;
    }
  };

  // Get phenotype subtext (mutant_type, qualifier)
  const getPhenotypeSubtext = (term) => {
    if (type !== 'phenotype') return null;
    const parts = [];
    if (term.mutant_type) parts.push(term.mutant_type);
    if (term.qualifier) parts.push(term.qualifier);
    return parts.length > 0 ? parts.join(', ') : null;
  };

  // Get term ID for display
  const getTermId = (term) => {
    if (type === 'go') {
      return term.goid;
    } else {
      return null; // Phenotypes don't have standard IDs
    }
  };

  // Format genes for inline display (show first few, truncate if needed)
  const formatGenesInline = (genes, maxShow = 5) => {
    if (!genes || genes.length === 0) return '-';
    const geneNames = genes.map(g => g.gene_name || g.systematic_name);
    if (geneNames.length <= maxShow) {
      return geneNames.join(', ');
    }
    return `${geneNames.slice(0, maxShow).join(', ')} +${geneNames.length - maxShow} more`;
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
                <>
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
                            className={`sortable count-col ${sortField === 'query_count' ? 'sorted' : ''}`}
                            onClick={() => handleSort('query_count')}
                          >
                            #
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
                          <th className="genes-col">Genes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedTerms.map((term, index) => (
                          <React.Fragment key={index}>
                            <tr
                              className={`term-row ${isRowExpanded(index) ? 'expanded' : ''}`}
                              onClick={() => toggleRow(index)}
                            >
                              <td className="expand-col">
                                <span className="expand-icon">
                                  {isRowExpanded(index) ? '−' : '+'}
                                </span>
                              </td>
                              <td className="term-col">
                                <span className="term-name">{getTermName(term)}</span>
                                {getTermId(term) && (
                                  <span className="term-id">{getTermId(term)}</span>
                                )}
                                {getPhenotypeSubtext(term) && (
                                  <span className="term-subtext">{getPhenotypeSubtext(term)}</span>
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
                              <td className="genes-col">
                                <span className="genes-inline">{formatGenesInline(term.genes)}</span>
                              </td>
                            </tr>
                            {/* Expanded Gene List with links */}
                            {isRowExpanded(index) && (
                              <tr className="gene-list-row">
                                <td colSpan={type === 'go' ? 8 : 7}>
                                  <div className="gene-list">
                                    <strong>Genes:</strong>{' '}
                                    {term.genes?.map((gene, gIdx) => (
                                      <span key={gIdx}>
                                        <Link
                                          to={`/locus/${gene.systematic_name}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          onClick={(e) => e.stopPropagation()}
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

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="enrichment-pagination">
                      <button
                        className="page-btn"
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        title="First page"
                      >
                        ««
                      </button>
                      <button
                        className="page-btn"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        title="Previous page"
                      >
                        «
                      </button>
                      <span className="page-info">
                        Page {currentPage} of {totalPages}
                        <span className="page-rows">
                          ({(currentPage - 1) * ROWS_PER_PAGE + 1}-{Math.min(currentPage * ROWS_PER_PAGE, sortedTerms.length)} of {sortedTerms.length})
                        </span>
                      </span>
                      <button
                        className="page-btn"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        title="Next page"
                      >
                        »
                      </button>
                      <button
                        className="page-btn"
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        title="Last page"
                      >
                        »»
                      </button>
                    </div>
                  )}
                </>
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
