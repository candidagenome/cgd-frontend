import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { searchApi } from '../api/searchApi';
import './SearchResultsPage.css';

const CATEGORY_LABELS = {
  genes: 'Genes / Loci',
  go_terms: 'GO Terms',
  phenotypes: 'Phenotypes',
  references: 'References',
};

const CATEGORY_ORDER = ['genes', 'go_terms', 'phenotypes', 'references'];

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('query') || '';

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults(null);
        setSelectedCategory(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // First, try to resolve the query as an exact identifier
        const resolveResult = await searchApi.resolve(query);

        if (resolveResult.resolved && resolveResult.redirect_url) {
          // Exact match found - redirect directly using React Router
          navigate(resolveResult.redirect_url, { replace: true });
          return;
        }

        // No exact match - perform full search
        const data = await searchApi.quickSearch(query);
        setResults(data);

        // Auto-select first category with results
        const firstCategoryWithResults = CATEGORY_ORDER.find(
          cat => data.results_by_category?.[cat]?.length > 0
        );
        setSelectedCategory(firstCategoryWithResults || null);
      } catch (err) {
        console.error('Search error:', err);
        setError('Failed to perform search. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, navigate]);

  // Get categories that have results
  const categoriesWithResults = CATEGORY_ORDER.filter(
    cat => results?.results_by_category?.[cat]?.length > 0
  );

  const renderResultItem = (result) => {
    return (
      <div key={`${result.category}-${result.id}`} className="search-result-item">
        <div className="search-result-name">
          <Link to={result.link}>{result.name}</Link>
          <span className="search-result-id">({result.id})</span>
        </div>
        {result.description && (
          <div className="search-result-description">{result.description}</div>
        )}
        {result.organism && (
          <div className="search-result-organism">{result.organism}</div>
        )}
      </div>
    );
  };

  const renderFacets = () => {
    return (
      <div className="search-facets">
        <h3>Categories</h3>
        <ul className="facet-list">
          {CATEGORY_ORDER.map(categoryKey => {
            const count = results?.results_by_category?.[categoryKey]?.length || 0;
            const isSelected = selectedCategory === categoryKey;
            const hasResults = count > 0;

            return (
              <li
                key={categoryKey}
                className={`facet-item ${isSelected ? 'selected' : ''} ${!hasResults ? 'disabled' : ''}`}
                onClick={() => hasResults && setSelectedCategory(categoryKey)}
              >
                <span className="facet-label">{CATEGORY_LABELS[categoryKey]}</span>
                <span className="facet-count">{count}</span>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  const renderResults = () => {
    if (!selectedCategory) {
      return (
        <div className="search-no-selection">
          Select a category to view results.
        </div>
      );
    }

    const categoryResults = results?.results_by_category?.[selectedCategory] || [];

    return (
      <div className={`search-results-list ${selectedCategory}`}>
        <h2>
          {CATEGORY_LABELS[selectedCategory]}
          <span className="category-count">({categoryResults.length} results)</span>
        </h2>
        {categoryResults.map(renderResultItem)}
      </div>
    );
  };

  return (
    <div className="search-results-page">
      <div className="search-results-content">
        <h1>Search Results</h1>
        <hr />

        {query && (
          <p className="search-query-info">
            Results for: <strong>"{query}"</strong>
            {results && ` - ${results.total_results} total results found`}
          </p>
        )}

        {!query && (
          <div className="search-no-results">
            Please enter a search term.
          </div>
        )}

        {loading && (
          <div className="search-loading">
            Searching...
          </div>
        )}

        {error && (
          <div className="search-error">
            {error}
          </div>
        )}

        {!loading && !error && results && results.total_results === 0 && (
          <div className="search-no-results">
            No results found for "{query}". Try a different search term.
          </div>
        )}

        {!loading && !error && results && results.total_results > 0 && (
          <div className="search-layout">
            <aside className="search-sidebar">
              {renderFacets()}
            </aside>
            <main className="search-main">
              {renderResults()}
            </main>
          </div>
        )}

        <div className="back-to-search">
          <Link to="/search">Back to Search Options</Link>
        </div>
      </div>
    </div>
  );
};

export default SearchResultsPage;
