import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import goSlimMapperApi from '../api/goSlimMapperApi';
import './GoSlimMapperResultsPage.css';

const GENES_TO_SHOW = 5;

function GoSlimMapperResultsPage() {
  const [results, setResults] = useState(null);
  const [request, setRequest] = useState(null);
  const [expandedTerms, setExpandedTerms] = useState(new Set());

  // Load results from localStorage
  useEffect(() => {
    const storedResults = localStorage.getItem('goSlimMapperResults');
    const storedRequest = localStorage.getItem('goSlimMapperRequest');

    if (storedResults) {
      setResults(JSON.parse(storedResults));
    }

    if (storedRequest) {
      setRequest(JSON.parse(storedRequest));
    }
  }, []);

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
      const blob = await goSlimMapperApi.downloadResults(request, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `go_slim_mapper_results.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
      alert('Download failed. Please try again.');
    }
  };

  // Render gene links with "more" functionality
  const renderGeneLinks = (genes, termId) => {
    const isExpanded = expandedTerms.has(termId);
    const genesToShow = isExpanded ? genes : genes.slice(0, GENES_TO_SHOW);
    const hasMore = genes.length > GENES_TO_SHOW;

    return (
      <div className="genes-inline">
        {genesToShow.map((gene, idx) => (
          <React.Fragment key={gene.feature_no}>
            <Link
              to={`/locus/${gene.systematic_name}`}
              className="gene-link-inline"
            >
              {gene.gene_name || gene.systematic_name}
            </Link>
            {idx < genesToShow.length - 1 && ', '}
          </React.Fragment>
        ))}
        {hasMore && !isExpanded && (
          <button
            className="more-genes-btn"
            onClick={() => toggleTermExpansion(termId)}
          >
            +{genes.length - GENES_TO_SHOW} more
          </button>
        )}
        {hasMore && isExpanded && (
          <button
            className="more-genes-btn"
            onClick={() => toggleTermExpansion(termId)}
          >
            show less
          </button>
        )}
      </div>
    );
  };

  // Aspect display names
  const aspectNames = {
    P: 'Biological Process',
    F: 'Molecular Function',
    C: 'Cellular Component',
  };

  // AG Grid column definitions
  const columnDefs = useMemo(() => [
    {
      headerName: 'GO Slim Term',
      field: 'goid',
      flex: 2,
      minWidth: 300,
      cellRenderer: (params) => {
        const term = params.data;
        return (
          <div className="term-cell-content">
            <Link to={`/go/${term.goid}`} className="term-link">
              {term.goid}
            </Link>
            <br />
            <span className="term-name">{term.go_term}</span>
          </div>
        );
      },
      autoHeight: true,
    },
    {
      headerName: 'Cluster Frequency',
      field: 'gene_count',
      flex: 1,
      minWidth: 180,
      cellRenderer: (params) => {
        const term = params.data;
        return (
          <div className="count-cell-content">
            {term.gene_count} out of {term.total_genes} genes
            <br />
            <span className="percentage">{term.frequency_percent}%</span>
          </div>
        );
      },
      autoHeight: true,
    },
    {
      headerName: 'Genes',
      field: 'genes',
      flex: 2,
      minWidth: 300,
      cellRenderer: (params) => {
        const term = params.data;
        return renderGeneLinks(term.genes, term.goid);
      },
      autoHeight: true,
    },
  ], [expandedTerms]);

  // Default column properties
  const defaultColDef = useMemo(() => ({
    sortable: true,
    resizable: true,
    wrapText: true,
  }), []);

  // Grid ready callback
  const onGridReady = useCallback((params) => {
    params.api.sizeColumnsToFit();
  }, []);

  if (!results) {
    return (
      <div className="go-slim-mapper-results-page">
        <div className="results-content">
          <h1>GO Slim Mapper Results</h1>
          <div className="loading">Loading results...</div>
        </div>
      </div>
    );
  }

  if (!results.success) {
    return (
      <div className="go-slim-mapper-results-page">
        <div className="results-content">
          <h1>GO Slim Mapper Results</h1>
          <div className="error-message">
            <strong>Analysis Error:</strong> {results.error}
          </div>
          <Link to="/go-slim-mapper" className="back-link">
            Back to Search
          </Link>
        </div>
      </div>
    );
  }

  const { result } = results;

  return (
    <div className="go-slim-mapper-results-page">
      <div className="results-content">
        <h1>GO Slim Mapper Results</h1>
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
              <span className="label">Organism:</span>
              <span className="value">{result.organism_name}</span>
            </div>
            <div className="summary-item">
              <span className="label">GO Slim Set:</span>
              <span className="value">{result.go_set_name}</span>
            </div>
            <div className="summary-item">
              <span className="label">GO Aspect:</span>
              <span className="value">{aspectNames[result.go_aspect] || result.go_aspect}</span>
            </div>
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
              <span className="label">Slim terms with mappings:</span>
              <span className="value highlight">{result.mapped_terms.length}</span>
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
          <Link to="/go-slim-mapper" className="action-btn">
            New Search
          </Link>
          <button className="action-btn download-btn" onClick={() => handleDownload('tsv')}>
            Download Results (TSV)
          </button>
        </div>

        {/* Results Table */}
        <div className="results-table-container">
          <h2>Mapped GO Slim Terms</h2>

          {result.mapped_terms.length === 0 ? (
            <p className="no-results">
              No genes were mapped to any GO Slim terms in this set.
            </p>
          ) : (
            <div className="ag-grid-wrapper ag-theme-alpine">
              <AgGridReact
                rowData={result.mapped_terms}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                domLayout="autoHeight"
                pagination={true}
                paginationPageSize={10}
                paginationPageSizeSelector={[10, 25, 50]}
                onGridReady={onGridReady}
                suppressCellFocus={true}
              />
            </div>
          )}
        </div>

        {/* Other genes section */}
        {result.other_genes.length > 0 && (
          <div className="special-section">
            <h3>Other GO Annotations</h3>
            <p className="section-description">
              These genes have GO annotations in the {aspectNames[result.go_aspect] || result.go_aspect} aspect,
              but are not mapped to any of the selected slim terms:
            </p>
            <div className="gene-list">
              <span className="gene-count">
                {result.other_genes.length} out of {result.query_genes_with_go} genes
                ({((result.other_genes.length / result.query_genes_with_go) * 100).toFixed(2)}%)
              </span>
              <div className="genes-inline">
                {renderGeneLinks(result.other_genes, 'other')}
              </div>
            </div>
          </div>
        )}

        {/* Not annotated genes section */}
        {result.not_annotated_genes.length > 0 && (
          <div className="special-section">
            <h3>Genes Without GO Annotations</h3>
            <p className="section-description">
              These genes do not have any GO annotations in the {aspectNames[result.go_aspect] || result.go_aspect} aspect:
            </p>
            <div className="gene-list">
              <span className="gene-count">
                {result.not_annotated_genes.length} out of {result.query_genes_found} genes
                ({((result.not_annotated_genes.length / result.query_genes_found) * 100).toFixed(2)}%)
              </span>
              <div className="genes-inline">
                {renderGeneLinks(result.not_annotated_genes, 'not_annotated')}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default GoSlimMapperResultsPage;
