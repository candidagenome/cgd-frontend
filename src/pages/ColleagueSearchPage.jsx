import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ColleagueSearchPage.css';

function ColleagueSearchPage() {
  const navigate = useNavigate();
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!lastName.trim()) {
      setError('Please enter a last name to search.');
      return;
    }

    // Navigate to results page with search term
    navigate(`/colleague/search?last_name=${encodeURIComponent(lastName.trim())}`);
  };

  return (
    <div className="colleague-search-page">
      <div className="colleague-search-content">
        <h1>Search CGD Colleague Information</h1>
        <hr />

        <div className="search-description">
          <p>
            This form allows you to <strong>search</strong> existing colleague
            information in CGD.
          </p>
          <p>
            Please enter your <strong>LAST name</strong> in the box provided below
            and click on <strong>Search</strong>. The program will then present you
            with a list of all the CGD Colleague entries containing your last name.
            Click on the specified name to display all information about this colleague.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="search-form">
          <div className="form-row">
            <label htmlFor="lastName">Last (Family) Name:</label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="e.g. Botstein, Jones, Smith"
              size="30"
            />
          </div>

          <p className="search-note">
            <strong style={{ color: '#c00' }}>Note:</strong> This search is case
            insensitive. You may use the wildcard character (*) at any position
            in your query.
          </p>

          {error && (
            <div className="error-message">{error}</div>
          )}

          <div className="form-buttons">
            <button type="submit" className="search-btn">Search</button>
            <button
              type="button"
              className="reset-btn"
              onClick={() => setLastName('')}
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ColleagueSearchPage;
