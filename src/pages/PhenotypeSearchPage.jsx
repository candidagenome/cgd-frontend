import React, { useState, useEffect, useMemo } from 'react';
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

  // Form state - all search parameters
  const [query, setQuery] = useState('');
  const [observable, setObservable] = useState('');
  const [qualifier, setQualifier] = useState('');
  const [experimentType, setExperimentType] = useState('');
  const [mutantType, setMutantType] = useState('');
  const [propertyValue, setPropertyValue] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [pubmed, setPubmed] = useState('');
  const [organism, setOrganism] = useState('');
  const [searchType, setSearchType] = useState(''); // 'wildcard' for wildcard search

  // Dropdown options
  const [organisms, setOrganisms] = useState([]);

  // Results state
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Track if we've performed a search
  const [hasSearched, setHasSearched] = useState(false);

  // Show/hide advanced search
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Load organisms on mount
  useEffect(() => {
    const loadOrganisms = async () => {
      try {
        const orgData = await phenotypeApi.getOrganisms();
        setOrganisms(orgData || []);
      } catch (err) {
        console.error('Failed to load organisms:', err);
      }
    };
    loadOrganisms();
  }, []);

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

    // Update form state
    setQuery(params.query);
    setObservable(params.observable);
    setQualifier(params.qualifier);
    setExperimentType(params.experiment_type);
    setMutantType(params.mutant_type);
    setPropertyValue(params.property_value);
    setPropertyType(params.property_type);
    setPubmed(params.pubmed);
    setOrganism(params.organism);
    setSearchType(params.type);

    // Check if any advanced params are set
    if (params.property_value || params.property_type || params.pubmed || params.organism) {
      setShowAdvanced(true);
    }

    // Perform search if any parameter is present
    const hasParams = Object.values(params).some((v) => v);
    if (hasParams) {
      performSearch(params);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const performSearch = async (params) => {
    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      // Clean params - remove empty values
      const cleanParams = {};
      Object.entries(params).forEach(([key, value]) => {
        if (value) cleanParams[key] = value;
      });

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
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Build query params
    const params = new URLSearchParams();
    if (query) params.set('query', query);
    if (observable) params.set('observable', observable);
    if (qualifier) params.set('qualifier', qualifier);
    if (experimentType) params.set('experiment_type', experimentType);
    if (mutantType) params.set('mutant_type', mutantType);
    if (propertyValue) params.set('property_value', propertyValue);
    if (propertyType) params.set('property_type', propertyType);
    if (pubmed) params.set('pubmed', pubmed);
    if (organism) params.set('organism', organism);
    if (searchType) params.set('type', searchType);

    // Open results in a new tab
    window.open(`/phenotype/search?${params.toString()}`, '_blank');
  };

  const handleReset = () => {
    setQuery('');
    setObservable('');
    setQualifier('');
    setExperimentType('');
    setMutantType('');
    setPropertyValue('');
    setPropertyType('');
    setPubmed('');
    setOrganism('');
    setSearchType('');
    setData(null);
    setHasSearched(false);
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
        headerName: 'Chemical/Condition',
        field: 'chemicals',
        flex: 1,
        minWidth: 120,
        valueGetter: (params) => {
          const chemicals = params.data.chemicals || [];
          const conditions = params.data.conditions || [];
          return [...chemicals, ...conditions].join(', ') || '-';
        },
        cellRenderer: (params) => {
          const chemicals = params.data.chemicals || [];
          const conditions = params.data.conditions || [];
          const all = [...chemicals, ...conditions];
          if (all.length === 0) return '-';
          return <span>{all.join(', ')}</span>;
        },
      },
      {
        headerName: 'References',
        field: 'references',
        flex: 2,
        minWidth: 200,
        autoHeight: true,
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
        <form onSubmit={handleSubmit} className="phenotype-search-form">
          {/* Keyword Search */}
          <div className="form-section">
            <h3>Keyword Search</h3>
            <div className="form-row">
              <label htmlFor="query">Search all fields:</label>
              <input
                type="text"
                id="query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., fluconazole, inviable, biofilm"
                className="form-input wide"
              />
              <span className="help-text">
                Search phenotypes, chemicals, conditions, experiment comments. Wildcard (*) allowed.
              </span>
            </div>
          </div>

          {/* Phenotype Search */}
          <div className="form-section">
            <h3>Search by Phenotype</h3>
            <div className="form-row">
              <label htmlFor="observable">Observable:</label>
              <input
                type="text"
                id="observable"
                value={observable}
                onChange={(e) => setObservable(e.target.value)}
                placeholder="e.g., inviable, colony morphology"
                className="form-input"
              />
              <Link to="/phenotype/terms" className="browse-link">
                Browse terms
              </Link>
            </div>
            <div className="form-row">
              <label htmlFor="qualifier">Qualifier:</label>
              <input
                type="text"
                id="qualifier"
                value={qualifier}
                onChange={(e) => setQualifier(e.target.value)}
                placeholder="e.g., increased, decreased"
                className="form-input"
              />
            </div>
          </div>

          {/* Experiment Search */}
          <div className="form-section">
            <h3>Search by Experiment</h3>
            <div className="form-row">
              <label htmlFor="experimentType">Experiment Type:</label>
              <input
                type="text"
                id="experimentType"
                value={experimentType}
                onChange={(e) => setExperimentType(e.target.value)}
                placeholder="e.g., classical genetics, large-scale survey"
                className="form-input"
              />
            </div>
            <div className="form-row">
              <label htmlFor="mutantType">Mutant Type:</label>
              <input
                type="text"
                id="mutantType"
                value={mutantType}
                onChange={(e) => setMutantType(e.target.value)}
                placeholder="e.g., null, overexpression"
                className="form-input"
              />
            </div>
          </div>

          {/* Advanced Search - Collapsible */}
          <div className="form-section advanced-section">
            <h3
              className="collapsible-header"
              onClick={() => setShowAdvanced(!showAdvanced)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setShowAdvanced(!showAdvanced)}
            >
              <span className={`collapse-icon ${showAdvanced ? 'expanded' : ''}`}>&#9656;</span>
              Advanced Search Options
            </h3>
            {showAdvanced && (
              <div className="advanced-fields">
                <div className="form-row">
                  <label htmlFor="propertyValue">Chemical/Condition:</label>
                  <input
                    type="text"
                    id="propertyValue"
                    value={propertyValue}
                    onChange={(e) => setPropertyValue(e.target.value)}
                    placeholder="e.g., fluconazole, virgineone, 37C"
                    className="form-input"
                  />
                  <span className="help-text">Search for phenotypes associated with specific chemicals or conditions</span>
                </div>
                <div className="form-row">
                  <label htmlFor="propertyType">Property Type:</label>
                  <select
                    id="propertyType"
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="form-select"
                  >
                    <option value="">Any</option>
                    <option value="chemical">Chemical</option>
                    <option value="condition">Condition</option>
                    <option value="reporter">Reporter</option>
                    <option value="allele">Allele</option>
                    <option value="strain_background">Strain Background</option>
                  </select>
                </div>
                <div className="form-row">
                  <label htmlFor="pubmed">PubMed ID:</label>
                  <input
                    type="text"
                    id="pubmed"
                    value={pubmed}
                    onChange={(e) => setPubmed(e.target.value)}
                    placeholder="e.g., 12345678"
                    className="form-input"
                  />
                </div>
                <div className="form-row">
                  <label htmlFor="organism">Organism:</label>
                  <select
                    id="organism"
                    value={organism}
                    onChange={(e) => setOrganism(e.target.value)}
                    className="form-select"
                  >
                    <option value="">All organisms</option>
                    {organisms.map((org) => (
                      <option key={org.organism_abbrev || org.name} value={org.organism_abbrev}>
                        {org.common_name || org.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-row">
                  <label htmlFor="searchType">Search Mode:</label>
                  <select
                    id="searchType"
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                    className="form-select"
                  >
                    <option value="">Exact match</option>
                    <option value="wildcard">Wildcard search</option>
                  </select>
                  <span className="help-text">Wildcard mode treats * as a wildcard character</span>
                </div>
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="form-actions">
            <button type="submit" className="btn-primary">
              Search
            </button>
            <button type="button" className="btn-secondary" onClick={handleReset}>
              Reset
            </button>
          </div>
        </form>
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
        <p className="subtitle">Search phenotype annotations across all genes in CGD</p>
      </header>

      <nav className="page-nav">
        <Link to="/phenotype/terms">Browse Observable Terms</Link>
        {' | '}
        <Link to="/help/phenotype">Help</Link>
      </nav>

      <div className="divider" />

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
          <strong>Note:</strong> To view phenotypes for a specific gene, visit the gene&apos;s locus page and select the
          Phenotype tab.
        </p>
        <p>
          Curation of mutant phenotypes is an ongoing project at CGD. Please <Link to="/contact">contact CGD curators</Link>{' '}
          to let us know of additional phenotype information that should be incorporated.
        </p>
      </div>
    </div>
  );
}

export default PhenotypeSearchPage;
