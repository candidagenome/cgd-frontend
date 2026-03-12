import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchApi } from '../api/searchApi';
import './TextSearchPage.css';

function TextSearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [organism, setOrganism] = useState('all');
  const [searchField, setSearchField] = useState('all');
  const [matchMode, setMatchMode] = useState('any'); // Default to OR
  const [organisms, setOrganisms] = useState([]);
  const [error, setError] = useState('');

  // Fetch organisms on mount
  useEffect(() => {
    const fetchOrganisms = async () => {
      try {
        const data = await searchApi.getOrganisms();
        setOrganisms(data.organisms || []);
      } catch (err) {
        console.error('Failed to fetch organisms:', err);
      }
    };
    fetchOrganisms();
  }, []);

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
    if (organism !== 'all') {
      params.set('organism', organism);
    }
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
            <div className="option-row">
              <div className="option-group">
                <label className="option-label" htmlFor="organism">Organism:</label>
                <select
                  id="organism"
                  value={organism}
                  onChange={(e) => setOrganism(e.target.value)}
                  className="option-select"
                >
                  <option value="all">All Organisms</option>
                  {organisms.map((org) => (
                    <option key={org.organism_abbrev} value={org.organism_abbrev}>
                      {org.organism_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="option-group">
                <label className="option-label" htmlFor="searchField">Search in:</label>
                <select
                  id="searchField"
                  value={searchField}
                  onChange={(e) => setSearchField(e.target.value)}
                  className="option-select"
                >
                  <option value="all">All Fields</option>
                  <option value="title">Paper Titles Only</option>
                  <option value="abstract">Paper Abstracts Only</option>
                </select>
              </div>

              <div className="option-group">
                <label className="option-label">Multiple terms:</label>
                <div className="option-buttons">
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
                </div>
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
