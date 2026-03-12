import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './TextSearchPage.css';

function TextSearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [searchField, setSearchField] = useState('both');
  const [matchMode, setMatchMode] = useState('all');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!query.trim()) {
      setError('Please enter a search term.');
      return;
    }

    // Build URL with search options
    const params = new URLSearchParams({
      query: query.trim(),
      search_field: searchField,
      match_mode: matchMode,
    });
    navigate(`/search/text/results?${params.toString()}`);
  };

  return (
    <div className="text-search-page">
      <div className="text-search-content">
        <h1>Text Search</h1>
        <hr />

        <div className="search-description">
          <p>
            Use a keyword to simultaneously search all of the categories of information
            in CGD that are included in the Quick Search, plus locus history notes,
            paper abstracts, gene name descriptions, and more.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="search-form">
          <div className="form-row">
            <input
              type="text"
              id="query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter search term..."
              size="40"
            />
            <button type="submit" className="search-btn">Submit</button>
          </div>

          <div className="search-options">
            <div className="option-group">
              <label className="option-label">Paper search in:</label>
              <div className="option-buttons">
                <label className={`option-btn ${searchField === 'both' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="searchField"
                    value="both"
                    checked={searchField === 'both'}
                    onChange={(e) => setSearchField(e.target.value)}
                  />
                  Title & Abstract
                </label>
                <label className={`option-btn ${searchField === 'title' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="searchField"
                    value="title"
                    checked={searchField === 'title'}
                    onChange={(e) => setSearchField(e.target.value)}
                  />
                  Title Only
                </label>
                <label className={`option-btn ${searchField === 'abstract' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="searchField"
                    value="abstract"
                    checked={searchField === 'abstract'}
                    onChange={(e) => setSearchField(e.target.value)}
                  />
                  Abstract Only
                </label>
              </div>
            </div>

            <div className="option-group">
              <label className="option-label">Multiple terms:</label>
              <div className="option-buttons">
                <label className={`option-btn ${matchMode === 'all' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="matchMode"
                    value="all"
                    checked={matchMode === 'all'}
                    onChange={(e) => setMatchMode(e.target.value)}
                  />
                  Match ALL (AND)
                </label>
                <label className={`option-btn ${matchMode === 'any' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="matchMode"
                    value="any"
                    checked={matchMode === 'any'}
                    onChange={(e) => setMatchMode(e.target.value)}
                  />
                  Match ANY (OR)
                </label>
              </div>
            </div>
          </div>

          {error && (
            <div className="error-message">{error}</div>
          )}
        </form>
      </div>
    </div>
  );
}

export default TextSearchPage;
