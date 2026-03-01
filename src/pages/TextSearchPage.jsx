import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './TextSearchPage.css';

function TextSearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!query.trim()) {
      setError('Please enter a search term.');
      return;
    }

    // Navigate to results page with search term
    navigate(`/search/text/results?query=${encodeURIComponent(query.trim())}`);
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

          {error && (
            <div className="error-message">{error}</div>
          )}
        </form>
      </div>
    </div>
  );
}

export default TextSearchPage;
