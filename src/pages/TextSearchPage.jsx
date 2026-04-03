import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchApi } from '../api/searchApi';
import './TextSearchPage.css';

// Default organisms to show if API doesn't return them
const DEFAULT_ORGANISMS = [
  { organism_abbrev: 'C_albicans_SC5314', organism_name: 'Candida albicans SC5314' },
  { organism_abbrev: 'C_glabrata_CBS138', organism_name: 'Candida glabrata CBS138' },
  { organism_abbrev: 'C_parapsilosis_CDC317', organism_name: 'Candida parapsilosis CDC317' },
  { organism_abbrev: 'C_tropicalis_MYA-3404', organism_name: 'Candida tropicalis MYA-3404' },
  { organism_abbrev: 'C_auris_B8441', organism_name: 'Candida auris B8441' },
];

function TextSearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [organism, setOrganism] = useState('all');
  const [searchField, setSearchField] = useState('all');
  const [matchMode, setMatchMode] = useState('any'); // Default to OR
  const [organisms, setOrganisms] = useState([]);
  const [error, setError] = useState('');

  // Fetch organisms on mount, merge with defaults
  useEffect(() => {
    const fetchOrganisms = async () => {
      try {
        const data = await searchApi.getOrganisms();
        const apiOrganisms = data.organisms || [];
        // Merge API organisms with defaults, avoiding duplicates
        const existingAbbrevs = new Set(apiOrganisms.map(o => o.organism_abbrev));
        const mergedOrganisms = [
          ...apiOrganisms,
          ...DEFAULT_ORGANISMS.filter(o => !existingAbbrevs.has(o.organism_abbrev))
        ];
        setOrganisms(mergedOrganisms);
      } catch (err) {
        console.error('Failed to fetch organisms:', err);
        // Use defaults on error
        setOrganisms(DEFAULT_ORGANISMS);
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
            gene name descriptions, and more.
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
            <select
              id="matchMode"
              value={matchMode}
              onChange={(e) => setMatchMode(e.target.value)}
              className="option-select"
              title="Match mode"
            >
              <option value="any">Any word</option>
              <option value="all">All words</option>
              <option value="exact">Exact phrase</option>
            </select>
            <button type="submit" className="search-btn">Search</button>
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
                  <option value="all">All Categories</option>
                  <option value="genes">Genes / Loci</option>
                  <option value="descriptions">Locus Descriptions</option>
                  <option value="go_terms">GO Terms</option>
                  <option value="colleagues">Colleagues</option>
                  <option value="authors">Authors</option>
                  <option value="pathways">Pathways</option>
                  <option value="paragraphs">Locus Summary Notes</option>
                  <option value="paper_titles">Paper Titles</option>
                  <option value="name_descriptions">Gene Name Descriptions</option>
                  <option value="phenotypes">Phenotypes</option>
                  <option value="notes">History Notes</option>
                  <option value="external_ids">External Database IDs</option>
                  <option value="orthologs">Orthologs / Best Hits</option>
                  <option value="literature_topics">Literature Topics</option>
                </select>
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
