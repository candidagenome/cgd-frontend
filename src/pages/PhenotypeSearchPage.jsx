import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import phenotypeApi from '../api/phenotypeApi';
import { renderCitationItem } from '../utils/formatCitation.jsx';
import './PhenotypeSearchPage.css';

// Abbreviate organism name (e.g., "Candida albicans SC5314" -> "C. albicans")
const getOrganismAbbrev = (organismName) => {
  if (!organismName) return '';
  const parts = organismName.split(' ');
  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}. ${parts[1]}`;
  }
  return organismName;
};

// Format locus display name like Perl: "AAF1/C3_06470W_A"
const formatLocusName = (result) => {
  if (result.gene_name && result.gene_name !== result.feature_name) {
    return `${result.gene_name}/${result.feature_name}`;
  }
  return result.feature_name;
};

function PhenotypeSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Form state
  const [observable, setObservable] = useState(searchParams.get('observable') || '');
  const [qualifier, setQualifier] = useState(searchParams.get('qualifier') || '');
  const [experimentType, setExperimentType] = useState(searchParams.get('experiment_type') || '');
  const [mutantType, setMutantType] = useState(searchParams.get('mutant_type') || '');

  // Results state
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Track if we've performed a search
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const obs = searchParams.get('observable') || '';
    const qual = searchParams.get('qualifier') || '';
    const expType = searchParams.get('experiment_type') || '';
    const mutType = searchParams.get('mutant_type') || '';

    setObservable(obs);
    setQualifier(qual);
    setExperimentType(expType);
    setMutantType(mutType);

    if (obs || qual || expType || mutType) {
      performSearch({ observable: obs, qualifier: qual, experiment_type: expType, mutant_type: mutType });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const performSearch = async (params) => {
    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      // Fetch all results by paginating through all pages (backend max limit is 100)
      const PAGE_SIZE = 100;
      let allResults = [];
      let page = 1;
      let totalResults = 0;
      let query = null;

      // Fetch first page to get total count
      const firstPage = await phenotypeApi.searchPhenotypes({
        ...params,
        page: 1,
        limit: PAGE_SIZE,
      });

      totalResults = firstPage.total_results;
      query = firstPage.query;
      allResults = firstPage.results || [];

      // Fetch remaining pages if needed
      const totalPages = Math.ceil(totalResults / PAGE_SIZE);
      if (totalPages > 1) {
        const remainingPages = [];
        for (let p = 2; p <= totalPages; p++) {
          remainingPages.push(
            phenotypeApi.searchPhenotypes({
              ...params,
              page: p,
              limit: PAGE_SIZE,
            })
          );
        }
        const pageResults = await Promise.all(remainingPages);
        for (const pr of pageResults) {
          allResults = allResults.concat(pr.results || []);
        }
      }

      setData({
        results: allResults,
        total_results: totalResults,
        query: query,
      });
    } catch (err) {
      // Handle FastAPI validation errors (array of objects) or string errors
      let errorMsg = 'Failed to search phenotypes';
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        errorMsg = detail;
      } else if (Array.isArray(detail) && detail.length > 0) {
        errorMsg = detail.map(d => d.msg || JSON.stringify(d)).join('; ');
      } else if (err.message) {
        errorMsg = err.message;
      }
      setError(errorMsg);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  // AG Grid column definitions
  const columnDefs = useMemo(() => [
    {
      headerName: 'Gene',
      field: 'gene',
      flex: 1,
      minWidth: 120,
      valueGetter: (params) => formatLocusName(params.data),
      cellRenderer: (params) => (
        <Link to={`/locus/${params.data.feature_name}`} className="gene-link">
          {formatLocusName(params.data)}
        </Link>
      ),
    },
    {
      headerName: 'Organism',
      field: 'organism',
      flex: 0.4,
      minWidth: 80,
      valueGetter: (params) => getOrganismAbbrev(params.data.organism),
      cellRenderer: (params) => <em>{getOrganismAbbrev(params.data.organism)}</em>,
    },
    {
      headerName: 'Experiment Type',
      field: 'experiment_type',
      flex: 1,
      minWidth: 120,
      valueGetter: (params) => params.data.experiment_type || '-',
      cellRenderer: (params) => (
        <div>
          {params.data.experiment_type || '-'}
          {params.data.experiment_comment && (
            <div className="experiment-comment">({params.data.experiment_comment})</div>
          )}
        </div>
      ),
    },
    {
      headerName: 'Mutant Info',
      field: 'mutant_type',
      flex: 1,
      minWidth: 120,
      autoHeight: true,
      valueGetter: (params) => params.data.mutant_type || '-',
      cellRenderer: (params) => {
        const result = params.data;
        if (!result.mutant_type) return '-';
        return (
          <div>
            <span>Description: {result.mutant_type}</span>
            {result.strain && <div className="strain-info">Strain: {result.strain}</div>}
          </div>
        );
      },
    },
    {
      headerName: 'Phenotype',
      field: 'phenotype',
      flex: 1,
      minWidth: 120,
      valueGetter: (params) => params.data.observable || '-',
      cellRenderer: (params) => {
        const result = params.data;
        return (
          <span>
            <span className="observable-term">{result.observable}</span>
            {result.qualifier && <span className="qualifier-info">: {result.qualifier}</span>}
          </span>
        );
      },
    },
    {
      headerName: 'References',
      field: 'references',
      flex: 2.25,
      minWidth: 250,
      autoHeight: true,
      valueGetter: (params) => {
        const refs = params.data.references || [];
        return refs.map(r => r.display_name || r.pubmed_id || '').join('; ');
      },
      cellRenderer: (params) => {
        const refs = params.data.references || [];
        if (refs.length === 0) return '-';
        return (
          <div>
            {refs.map((ref, refIdx) => (
              <React.Fragment key={refIdx}>
                {renderCitationItem(ref, { itemClassName: 'reference-item' })}
              </React.Fragment>
            ))}
          </div>
        );
      },
    },
  ], []);

  // Default column properties
  const defaultColDef = useMemo(() => ({
    sortable: true,
    filter: true,
    resizable: true,
    wrapText: true,
  }), []);

  // Grid ready callback
  const onGridReady = useCallback((params) => {
    params.api.sizeColumnsToFit();
  }, []);

  const handleDownload = () => {
    if (!data || !data.results || data.results.length === 0) return;

    // CSV headers
    const headers = ['Gene', 'Organism', 'Experiment Type', 'Experiment Comment', 'Mutant Type', 'Strain', 'Phenotype', 'Qualifier', 'References'];

    // Convert data to CSV rows
    const rows = data.results.map(result => {
      const refs = (result.references || [])
        .map(ref => ref.display_name || ref.pubmed_id || '')
        .join('; ');

      return [
        formatLocusName(result),
        getOrganismAbbrev(result.organism),
        result.experiment_type || '',
        result.experiment_comment || '',
        result.mutant_type || '',
        result.strain || '',
        result.observable || '',
        result.qualifier || '',
        refs,
      ];
    });

    // Escape CSV values
    const escapeCSV = (val) => {
      const str = String(val || '');
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    // Build CSV content
    const csvContent = [
      headers.map(escapeCSV).join(','),
      ...rows.map(row => row.map(escapeCSV).join(','))
    ].join('\n');

    // Trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `phenotype_search_results.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderResultsSummary = () => {
    if (!data) return null;

    const queryParts = [];
    if (data.query?.observable) queryParts.push(`Observable: "${data.query.observable}"`);
    if (data.query?.qualifier) queryParts.push(`Qualifier: "${data.query.qualifier}"`);
    if (data.query?.experiment_type) queryParts.push(`Experiment Type: "${data.query.experiment_type}"`);
    if (data.query?.mutant_type) queryParts.push(`Mutant Type: "${data.query.mutant_type}"`);

    return (
      <div className="results-summary">
        <div className="results-summary-row">
          <div className="results-summary-left">
            <div className="results-count">
              Found <strong>{data.total_results}</strong> phenotype annotation{data.total_results !== 1 ? 's' : ''}
            </div>
            {queryParts.length > 0 && (
              <div className="query-summary">Search criteria: {queryParts.join(', ')}</div>
            )}
          </div>
          {data.results && data.results.length > 0 && (
            <button type="button" className="btn-download" onClick={handleDownload}>
              Download CSV
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderResultsTable = () => {
    if (!data || !data.results || data.results.length === 0) {
      return (
        <div className="no-results">
          <p>No phenotype annotations found matching your search criteria.</p>
          <p>Try broadening your search or <Link to="/phenotype/terms">browse observable terms</Link>.</p>
        </div>
      );
    }

    return (
      <div className="results-grid-wrapper ag-theme-alpine">
        <AgGridReact
          rowData={data.results}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          domLayout="autoHeight"
          pagination={true}
          paginationPageSize={10}
          paginationPageSizeSelector={[10, 25, 50, 100]}
          onGridReady={onGridReady}
          suppressCellFocus={true}
        />
      </div>
    );
  };

  const renderAnalyzeSection = () => {
    if (!data || !data.results || data.results.length === 0) return null;

    // Get unique gene names for the gene list
    const geneList = [...new Set(data.results.map(r => r.feature_name))];

    // Helper to store gene list before navigating
    const handleToolClick = (e) => {
      // Store gene list in localStorage (not sessionStorage, which isn't shared across tabs)
      localStorage.setItem('phenotypeSearchGeneList', JSON.stringify(geneList));
      // Let the default anchor behavior handle navigation
    };

    return (
      <div className="analyze-section">
        <div className="analyze-header">
          Analyze gene list: further analyze the gene list displayed above or download information for this list
        </div>
        <table className="analyze-table">
          <tbody>
            <tr>
              <td className="analyze-label">Further Analysis:</td>
              <td>
                <a href="/go-term-finder" target="_blank" rel="noopener noreferrer" className="analyze-link" onClick={handleToolClick}>
                  GO Term Finder
                </a>
                <span className="analyze-desc">Find common features of genes in list</span>
              </td>
              <td>
                <a href="/go-slim-mapper" target="_blank" rel="noopener noreferrer" className="analyze-link" onClick={handleToolClick}>
                  GO Slim Mapper
                </a>
                <span className="analyze-desc">Sort genes into broad categories</span>
              </td>
              <td>
                <a href="/go-annotation-summary" target="_blank" rel="noopener noreferrer" className="analyze-link" onClick={handleToolClick}>
                  View GO Annotation Summary
                </a>
                <span className="analyze-desc">View all GO terms used to describe genes in list</span>
              </td>
            </tr>
            <tr>
              <td className="analyze-label">Download:</td>
              <td>
                <button type="button" className="analyze-link-btn" onClick={handleDownload}>Download All Search Results</button>
                <span className="analyze-desc">Download data for the entire gene list in a tab-delimited file</span>
              </td>
              <td colSpan="2">
                <a href="/batch-download" target="_blank" rel="noopener noreferrer" className="analyze-link" onClick={handleToolClick}>
                  Batch Download
                </a>
                <span className="analyze-desc">Download selected information for entire gene list. Available information types include Sequence, Coordinates, Chromosomal Feature information, GO annotations, Phenotypes, and Ortholog or Best Hit.</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="phenotype-search-page">
      <header className="page-header">
        <h1>Phenotype Search Results</h1>
        <p className="subtitle">Search phenotype annotations across all genes in CGD</p>
      </header>

      <nav className="page-nav">
        <Link to="/phenotype/terms">Browse Observable Terms</Link>
        {' | '}
        <Link to="/help/phenotype">Help</Link>
      </nav>

      <div className="divider" />

      {loading && (
        <div className="loading-section">
          <div className="loading-spinner"></div>
          <p>Searching phenotypes...</p>
        </div>
      )}

      {error && (
        <div className="error-section">
          <div className="error-icon">&#9888;</div>
          <p className="error-message">{error}</p>
        </div>
      )}

      {!loading && !error && hasSearched && (
        <>
          {renderResultsSummary()}
          {renderResultsTable()}
          {renderAnalyzeSection()}
        </>
      )}

      <div className="divider" />

      <div className="page-footer">
        <p>
          <strong>Note:</strong> To view phenotypes for a specific gene, visit the gene's locus page and
          select the Phenotype tab.
        </p>
        <p>
          Curation of mutant phenotypes is an ongoing project at CGD. Please{' '}
          <Link to="/contact">contact CGD curators</Link> to let us know of additional phenotype
          information that should be incorporated.
        </p>
      </div>
    </div>
  );
}

export default PhenotypeSearchPage;
