import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import phenotypeApi from '../api/phenotypeApi';
import { renderCitationItem } from '../utils/formatCitation.jsx';
import './PhenotypeSearchPage.css';

// Pagination settings
const RESULTS_PER_PAGE = 25;

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
  const [currentPage, setCurrentPage] = useState(1);

  // Track if we've performed a search
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const obs = searchParams.get('observable') || '';
    const qual = searchParams.get('qualifier') || '';
    const expType = searchParams.get('experiment_type') || '';
    const mutType = searchParams.get('mutant_type') || '';
    const page = parseInt(searchParams.get('page'), 10) || 1;

    setObservable(obs);
    setQualifier(qual);
    setExperimentType(expType);
    setMutantType(mutType);
    setCurrentPage(page);

    if (obs || qual || expType || mutType) {
      performSearch({ observable: obs, qualifier: qual, experiment_type: expType, mutant_type: mutType, page });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const performSearch = async (params) => {
    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const result = await phenotypeApi.searchPhenotypes({
        ...params,
        limit: RESULTS_PER_PAGE,
      });
      setData(result);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to search phenotypes');
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
    params.set('page', '1');

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
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
  };

  const renderPagination = () => {
    if (!data || data.total_results <= RESULTS_PER_PAGE) return null;

    const totalPages = Math.ceil(data.total_results / RESULTS_PER_PAGE);
    const pages = [];
    const maxVisiblePages = 10;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      pages.push(
        <button key={1} onClick={() => handlePageChange(1)} className="page-btn">
          1
        </button>
      );
      if (startPage > 2) pages.push(<span key="ellipsis-start" className="ellipsis">...</span>);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`page-btn ${i === currentPage ? 'active' : ''}`}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pages.push(<span key="ellipsis-end" className="ellipsis">...</span>);
      pages.push(
        <button key={totalPages} onClick={() => handlePageChange(totalPages)} className="page-btn">
          {totalPages}
        </button>
      );
    }

    const startIdx = (currentPage - 1) * RESULTS_PER_PAGE + 1;
    const endIdx = Math.min(currentPage * RESULTS_PER_PAGE, data.total_results);

    return (
      <div className="pagination">
        <div className="pagination-info">
          Showing {startIdx}-{endIdx} of {data.total_results} results
        </div>
        <div className="pagination-controls">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="page-btn nav-btn"
          >
            &laquo; Prev
          </button>
          {pages}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="page-btn nav-btn"
          >
            Next &raquo;
          </button>
        </div>
      </div>
    );
  };

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
      <div className="results-table-section">
        {renderPagination()}

        <div className="table-wrapper">
          <table className="results-table">
            <thead>
              <tr>
                <th>Gene</th>
                <th>Organism</th>
                <th>Experiment Type</th>
                <th>Mutant Info</th>
                <th>Phenotype</th>
                <th>References</th>
              </tr>
            </thead>
            <tbody>
              {data.results.map((result, idx) => (
                <tr key={idx} className={idx % 2 === 1 ? 'alt-row' : ''}>
                  <td className="gene-cell">
                    <Link to={`/locus/${result.feature_name}`} className="gene-link">
                      {formatLocusName(result)}
                    </Link>
                  </td>

                  <td className="organism-cell">
                    <em>{getOrganismAbbrev(result.organism)}</em>
                  </td>

                  <td className="experiment-cell">
                    {result.experiment_type || '-'}
                    {result.experiment_comment && (
                      <div className="experiment-comment">({result.experiment_comment})</div>
                    )}
                  </td>

                  <td className="mutant-cell">
                    {result.mutant_type ? (
                      <>
                        <span>Description: {result.mutant_type}</span>
                        {result.strain && <div className="strain-info">Strain: {result.strain}</div>}
                      </>
                    ) : (
                      '-'
                    )}
                  </td>

                  <td className="phenotype-cell">
                    <span className="observable-term">{result.observable}</span>
                    {result.qualifier && <span className="qualifier-info">: {result.qualifier}</span>}
                  </td>

                  <td className="references-cell">
                    {result.references && result.references.length > 0 ? (
                      result.references.map((ref, refIdx) => (
                        <React.Fragment key={refIdx}>
                          {renderCitationItem(ref, { itemClassName: 'reference-item' })}
                        </React.Fragment>
                      ))
                    ) : (
                      '-'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {renderPagination()}
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
