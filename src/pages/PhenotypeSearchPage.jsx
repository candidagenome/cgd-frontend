import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
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
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Form state - search query (simplified form only uses query)
  const [query, setQuery] = useState('');

  // Results state
  const [data, setData] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Track if we've performed a search and what type
  const [hasSearched, setHasSearched] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  // Parse URL parameters and perform search if present
  useEffect(() => {
    const params = {
      query: searchParams.get('query') || '',
      observable: searchParams.get('observable') || searchParams.get('obs') || '',
      qualifier: searchParams.get('qualifier') || searchParams.get('qual') || '',
      experiment_type: searchParams.get('experiment_type') || searchParams.get('expt') || '',
      mutant_type: searchParams.get('mutant_type') || '',
      property_value: searchParams.get('property_value') || searchParams.get('prop_val') || '',
      property_type: searchParams.get('property_type') || searchParams.get('prop_type') || '',
      pubmed: searchParams.get('pubmed') || searchParams.get('pmid') || '',
      organism: searchParams.get('organism') || '',
      type: searchParams.get('type') || '',
    };

    // Update form state (only query is shown in simplified form)
    setQuery(params.query);

    // Perform search if any parameter is present, otherwise reset to show form
    const hasParams = Object.values(params).some((v) => v);
    if (hasParams) {
      performSearch(params);
    } else {
      // Reset state to show search form
      setData(null);
      setSummaryData(null);
      setHasSearched(false);
      setShowSummary(false);
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const performSearch = async (params) => {
    setLoading(true);
    setError(null);
    setHasSearched(true);
    setSummaryData(null);
    setData(null);

    try {
      // Clean params - remove empty values
      const cleanParams = {};
      Object.entries(params).forEach(([key, value]) => {
        if (value) cleanParams[key] = value;
      });

      // If only query is provided (keyword search), show summary first
      const isKeywordSearchOnly = cleanParams.query && !cleanParams.observable;

      if (isKeywordSearchOnly) {
        // Fetch summary view
        const summary = await phenotypeApi.searchPhenotypesSummary(cleanParams.query);
        setSummaryData(summary);
        setShowSummary(true);
      } else {
        // Fetch detailed results
        setShowSummary(false);
        await fetchDetailedResults(cleanParams);
      }
    } catch (err) {
      // Handle FastAPI validation errors (array of objects) or string errors
      let errorMsg = 'Failed to search phenotypes';
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        errorMsg = detail;
      } else if (Array.isArray(detail) && detail.length > 0) {
        errorMsg = detail.map((d) => d.msg || JSON.stringify(d)).join('; ');
      } else if (err.message) {
        errorMsg = err.message;
      }
      setError(errorMsg);
      setData(null);
      setSummaryData(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchDetailedResults = async (cleanParams) => {
    // Fetch all results by paginating through all pages (backend max limit is 100)
    const PAGE_SIZE = 100;
    let allResults = [];
    let totalResults = 0;
    let queryInfo = null;

    // Fetch first page to get total count
    const firstPage = await phenotypeApi.searchPhenotypes({
      ...cleanParams,
      page: 1,
      limit: PAGE_SIZE,
    });

    totalResults = firstPage.total_results;
    queryInfo = firstPage.query;
    allResults = firstPage.results || [];

    // Fetch remaining pages if needed
    const totalPages = Math.ceil(totalResults / PAGE_SIZE);
    if (totalPages > 1) {
      const remainingPages = [];
      for (let p = 2; p <= totalPages; p++) {
        remainingPages.push(
          phenotypeApi.searchPhenotypes({
            ...cleanParams,
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
      query: queryInfo,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Build query params (simplified form only uses query)
    const params = new URLSearchParams();
    if (query) params.set('query', query);

    // Open results in a new tab
    window.open(`/phenotype/search?${params.toString()}`, '_blank');
  };

  const handleReset = () => {
    setQuery('');
    setData(null);
    setSummaryData(null);
    setHasSearched(false);
    setShowSummary(false);
    setError(null);
    navigate('/phenotype/search');
  };

  // AG Grid column definitions
  const columnDefs = useMemo(
    () => [
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
        wrapText: true,
        cellStyle: { whiteSpace: 'normal', lineHeight: '1.5' },
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
        headerName: 'Details',
        field: 'details',
        flex: 1.5,
        minWidth: 150,
        wrapText: true,
        cellStyle: { whiteSpace: 'normal', lineHeight: '1.4' },
        valueGetter: (params) => {
          const details = params.data.details || [];
          return details.map((d) => `${d.property_type}: ${d.property_value}`).join('; ') || '-';
        },
        cellRenderer: (params) => {
          const details = params.data.details || [];
          if (details.length === 0) return '-';
          const linkableTypes = ['Chemical', 'Allele'];
          return (
            <div className="details-cell">
              {details.map((d, idx) => (
                <div key={idx} className="detail-item">
                  <span className="detail-type">{d.property_type}:</span>{' '}
                  {linkableTypes.includes(d.property_type) ? (
                    <Link
                      to={`/phenotype/search?property_value=${encodeURIComponent(d.property_value)}`}
                      className="detail-value-link"
                    >
                      {d.property_value}
                    </Link>
                  ) : (
                    d.property_value
                  )}
                </div>
              ))}
            </div>
          );
        },
      },
      {
        headerName: 'References',
        field: 'references',
        flex: 2,
        minWidth: 200,
        wrapText: true,
        cellStyle: { whiteSpace: 'normal', lineHeight: '1.4' },
        valueGetter: (params) => {
          const refs = params.data.references || [];
          return refs.map((r) => r.display_name || r.pubmed_id || '').join('; ');
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
    ],
    []
  );

  // Default column properties
  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      wrapText: true,
    }),
    []
  );

  // Calculate row height based on content
  const getRowHeight = useCallback((params) => {
    const minHeight = 75;
    const lineHeight = 22;

    // Count references - each has citation + links
    const refs = params.data.references || [];
    const refLines = refs.length * 3;

    // Count details
    const details = params.data.details || [];
    const detailLines = details.length * 2;

    // Get max lines needed
    const maxLines = Math.max(2, refLines, detailLines);

    return Math.max(minHeight, maxLines * lineHeight + 15);
  }, []);

  const handleDownload = () => {
    if (!data || !data.results || data.results.length === 0) return;

    // CSV headers
    const headers = [
      'Gene',
      'Organism',
      'Experiment Type',
      'Experiment Comment',
      'Mutant Type',
      'Strain',
      'Phenotype',
      'Qualifier',
      'Chemicals',
      'Conditions',
      'References',
    ];

    // Convert data to CSV rows
    const rows = data.results.map((result) => {
      const refs = (result.references || [])
        .map((ref) => ref.display_name || ref.pubmed_id || '')
        .join('; ');
      const chemicals = (result.chemicals || []).join('; ');
      const conditions = (result.conditions || []).join('; ');

      return [
        formatLocusName(result),
        getOrganismAbbrev(result.organism),
        result.experiment_type || '',
        result.experiment_comment || '',
        result.mutant_type || '',
        result.strain || '',
        result.observable || '',
        result.qualifier || '',
        chemicals,
        conditions,
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
    const csvContent = [headers.map(escapeCSV).join(','), ...rows.map((row) => row.map(escapeCSV).join(','))].join(
      '\n'
    );

    // Trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'phenotype_search_results.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderSearchForm = () => {
    return (
      <div className="search-form-container">
        <div className="search-instructions">
          <p>
            Enter keywords associated with a phenotype (e.g. &apos;hyphal&apos;, &apos;virulence&apos;) or experimental
            condition (e.g. &apos;Spider&apos;, &apos;mouse&apos;) to search for features with a specific phenotype.
            To broaden your search, use one or more wildcard characters (*) to indicate the location(s) where any
            text will be tolerated. Single words or short phrases are better search criteria than are longer phrases.
          </p>
          <p>
            This search looks at the text associated with mutant phenotypes in CGD; it does not search gene names.
            To search for mutant phenotypes for a particular gene, enter the gene or systematic name in the Search
            box at the top of this page to go to the Locus Summary page for that gene; then click on the Phenotype tab.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="phenotype-search-form simple-form">
          <div className="simple-search-row">
            <label htmlFor="query">Enter phenotype:</label>
            <input
              type="text"
              id="query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="form-input"
              size="40"
              placeholder="Enter search term..."
            />
            <button type="submit" className="btn-submit">Submit</button>
            <button type="button" className="btn-reset" onClick={handleReset}>Reset</button>
          </div>
        </form>

        <div className="browse-section">
          <span>OR: </span>
          <a
            href="/phenotype/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="browse-terms-link"
          >
            Browse phenotype terms
          </a>
        </div>
      </div>
    );
  };

  const renderResultsSummary = () => {
    if (!data) return null;

    const queryParts = [];
    if (data.query?.query) queryParts.push(`Keyword: "${data.query.query}"`);
    if (data.query?.observable) queryParts.push(`Observable: "${data.query.observable}"`);
    if (data.query?.qualifier) queryParts.push(`Qualifier: "${data.query.qualifier}"`);
    if (data.query?.experiment_type) queryParts.push(`Experiment Type: "${data.query.experiment_type}"`);
    if (data.query?.mutant_type) queryParts.push(`Mutant Type: "${data.query.mutant_type}"`);
    if (data.query?.property_value) queryParts.push(`Chemical/Condition: "${data.query.property_value}"`);
    if (data.query?.pubmed) queryParts.push(`PubMed: "${data.query.pubmed}"`);
    if (data.query?.organism) queryParts.push(`Organism: "${data.query.organism}"`);

    return (
      <div className="results-summary">
        <div className="results-summary-row">
          <div className="results-summary-left">
            <div className="results-count">
              Found <strong>{data.total_results}</strong> phenotype annotation
              {data.total_results !== 1 ? 's' : ''}
            </div>
            {queryParts.length > 0 && <div className="query-summary">Search criteria: {queryParts.join(', ')}</div>}
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

  const renderSearchSummary = () => {
    if (!summaryData) return null;

    const handleDirectMatchClick = (obs) => {
      // Direct match: observable contains the search term, just filter by observable
      window.open(`/phenotype/search?observable=${encodeURIComponent(obs)}`, '_blank');
    };

    const handleRelatedMatchClick = (obs) => {
      // Related match: include original query to filter by property_value/qualifier
      const params = new URLSearchParams();
      params.set('observable', obs);
      params.set('property_value', summaryData.query);
      window.open(`/phenotype/search?${params.toString()}`, '_blank');
    };

    return (
      <div className="search-summary-container">
        <div className="search-summary-header">
          <h2>Expanded Phenotype Search Results Summary</h2>
          <p>Your search for &apos;<strong>{summaryData.query}</strong>&apos; results in the following:</p>
        </div>

        {summaryData.direct_matches && summaryData.direct_matches.length > 0 && (
          <div className="match-section">
            <h3>Matches associated directly with the phenotype:</h3>
            <ul className="match-list">
              {summaryData.direct_matches.map((match, idx) => (
                <li key={idx} className="match-item">
                  <span className="match-count">{match.count} matches:</span>
                  <button
                    type="button"
                    className="match-link"
                    onClick={() => handleDirectMatchClick(match.observable)}
                  >
                    {match.observable}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {summaryData.related_matches && summaryData.related_matches.length > 0 && (
          <div className="match-section">
            <h3>Matches in related data or details associated with the phenotype:</h3>
            <ul className="match-list">
              {summaryData.related_matches.map((match, idx) => (
                <li key={idx} className="match-item">
                  <span className="match-count">{match.count} matches:</span>
                  <button
                    type="button"
                    className="match-link"
                    onClick={() => handleRelatedMatchClick(match.observable)}
                  >
                    {match.observable}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {(!summaryData.direct_matches || summaryData.direct_matches.length === 0) &&
         (!summaryData.related_matches || summaryData.related_matches.length === 0) && (
          <div className="no-results">
            <p>No phenotype annotations found matching &apos;{summaryData.query}&apos;.</p>
            <p>
              Try a different search term or <Link to="/phenotype/terms">browse observable terms</Link>.
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderResultsTable = () => {
    if (!data || !data.results || data.results.length === 0) {
      return (
        <div className="no-results">
          <p>No phenotype annotations found matching your search criteria.</p>
          <p>
            Try broadening your search or <Link to="/phenotype/terms">browse observable terms</Link>.
          </p>
        </div>
      );
    }

    return (
      <div className="results-grid-wrapper ag-theme-alpine" style={{ width: '100%' }}>
        <AgGridReact
          rowData={data.results}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          domLayout="autoHeight"
          pagination={true}
          paginationPageSize={10}
          paginationPageSizeSelector={[10, 25, 50, 100]}
          suppressCellFocus={true}
          getRowHeight={getRowHeight}
        />
      </div>
    );
  };

  const renderAnalyzeSection = () => {
    if (!data || !data.results || data.results.length === 0) return null;

    // Get unique gene names for the gene list
    const geneList = [...new Set(data.results.map((r) => r.feature_name))];

    // Helper to store gene list before navigating
    const handleToolClick = () => {
      localStorage.setItem('phenotypeSearchGeneList', JSON.stringify(geneList));
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
                <a
                  href="/go-term-finder"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="analyze-link"
                  onClick={handleToolClick}
                >
                  GO Term Finder
                </a>
                <span className="analyze-desc">Find common features of genes in list</span>
              </td>
              <td>
                <a
                  href="/go-slim-mapper"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="analyze-link"
                  onClick={handleToolClick}
                >
                  GO Slim Mapper
                </a>
                <span className="analyze-desc">Sort genes into broad categories</span>
              </td>
              <td>
                <a
                  href="/go-annotation-summary"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="analyze-link"
                  onClick={handleToolClick}
                >
                  View GO Annotation Summary
                </a>
                <span className="analyze-desc">View all GO terms used to describe genes in list</span>
              </td>
            </tr>
            <tr>
              <td className="analyze-label">Download:</td>
              <td>
                <button type="button" className="analyze-link-btn" onClick={handleDownload}>
                  Download All Search Results
                </button>
                <span className="analyze-desc">Download data for the entire gene list in a tab-delimited file</span>
              </td>
              <td colSpan="2">
                <a
                  href="/batch-download"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="analyze-link"
                  onClick={handleToolClick}
                >
                  Batch Download
                </a>
                <span className="analyze-desc">
                  Download selected information for entire gene list. Available information types include Sequence,
                  Coordinates, Chromosomal Feature information, GO annotations, Phenotypes, and Ortholog or Best Hit.
                </span>
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
        <h1>Expanded Phenotype Search</h1>
        <hr />
      </header>

      {hasSearched && (
        <nav className="page-nav">
          <Link to="/phenotype/search">New Search</Link>
        </nav>
      )}

      {!hasSearched && renderSearchForm()}

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

      {!loading && !error && hasSearched && showSummary && renderSearchSummary()}

      {!loading && !error && hasSearched && !showSummary && (
        <>
          {renderResultsSummary()}
          {renderResultsTable()}
          {renderAnalyzeSection()}
        </>
      )}
    </div>
  );
}

export default PhenotypeSearchPage;
