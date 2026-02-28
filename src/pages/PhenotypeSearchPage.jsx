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
      // Fetch all results (no pagination - use reasonable limit)
      const result = await phenotypeApi.searchPhenotypes({
        ...params,
        limit: 1000,
      });
      setData(result);
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

  const handleSubmit = (e) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (observable.trim()) params.set('observable', observable.trim());
    if (qualifier.trim()) params.set('qualifier', qualifier.trim());
    if (experimentType.trim()) params.set('experiment_type', experimentType.trim());
    if (mutantType.trim()) params.set('mutant_type', mutantType.trim());

    setSearchParams(params);
  };

  const handleReset = () => {
    setObservable('');
    setQualifier('');
    setExperimentType('');
    setMutantType('');
    setSearchParams({});
    setData(null);
    setHasSearched(false);
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
      flex: 0.8,
      minWidth: 100,
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
      flex: 1.5,
      minWidth: 180,
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

  const renderSearchForm = () => {
    return (
      <div className="section" id="search-form">
        <h2 className="section-header">Phenotype Search</h2>
        <div className="section-content">
          <form onSubmit={handleSubmit} className="search-form">
            <div className="search-form-card">
              <div className="search-fields">
                <div className="form-group">
                  <label htmlFor="observable">Observable</label>
                  <input
                    type="text"
                    id="observable"
                    value={observable}
                    onChange={(e) => setObservable(e.target.value)}
                    placeholder="e.g., cc"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="qualifier">Qualifier</label>
                  <input
                    type="text"
                    id="qualifier"
                    value={qualifier}
                    onChange={(e) => setQualifier(e.target.value)}
                    placeholder="e.g., ab"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="experiment_type">Experiment Type</label>
                  <input
                    type="text"
                    id="experiment_type"
                    value={experimentType}
                    onChange={(e) => setExperimentType(e.target.value)}
                    placeholder="e.g., cl"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="mutant_type">Mutant Type</label>
                  <input
                    type="text"
                    id="mutant_type"
                    value={mutantType}
                    onChange={(e) => setMutantType(e.target.value)}
                    placeholder="e.g., de"
                  />
                </div>
              </div>

              <div className="search-bottom-row">
                <div className="browse-link">
                  <Link to="/phenotype/terms">Browse observable terms</Link>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-search">Search</button>
                  <button type="button" className="btn-reset" onClick={handleReset}>Reset</button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
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
        <div className="results-count">
          Found <strong>{data.total_results}</strong> phenotype annotation{data.total_results !== 1 ? 's' : ''}
        </div>
        {queryParts.length > 0 && (
          <div className="query-summary">Search criteria: {queryParts.join(', ')}</div>
        )}
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
          onGridReady={onGridReady}
          suppressCellFocus={true}
        />
      </div>
    );
  };

  return (
    <div className="phenotype-search-page">
      <header className="page-header">
        <h1>Phenotype Search</h1>
        <p className="subtitle">Search phenotype annotations across all genes in CGD</p>
      </header>

      <nav className="page-nav">
        <Link to="/phenotype/terms">Browse Observable Terms</Link>
        {' | '}
        <Link to="/help/phenotype">Help</Link>
      </nav>

      <div className="divider" />

      {renderSearchForm()}

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
        <div className="section" id="results">
          <h2 className="section-header">Search Results</h2>
          <div className="section-content">
            {renderResultsSummary()}
            {renderResultsTable()}
          </div>
        </div>
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
