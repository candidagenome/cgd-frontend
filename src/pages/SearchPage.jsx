import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './InfoPages.css';

const SearchPage = () => {
  const navigate = useNavigate();
  const [quickSearchQuery, setQuickSearchQuery] = useState('');
  const [textSearchQuery, setTextSearchQuery] = useState('');

  const handleQuickSearch = (e) => {
    e.preventDefault();
    if (quickSearchQuery.trim()) {
      navigate(`/search/results?query=${encodeURIComponent(quickSearchQuery)}`);
    }
  };

  const handleTextSearch = (e) => {
    e.preventDefault();
    if (textSearchQuery.trim()) {
      navigate(`/search/text?query=${encodeURIComponent(textSearchQuery)}`);
    }
  };

  return (
    <div className="info-page">
      <div className="info-page-content">
        <h1>CGD Search Options</h1>
        <hr />

        <p style={{ fontSize: '0.9em', marginBottom: '20px' }}>
          All the search options listed below search for information within the <em>Candida</em> Genome Database
        </p>

        {/* Quick Search */}
        <div className="info-section">
          <h2>CGD Quick Search</h2>

          <div className="search-block">
            <p style={{ fontSize: '0.9em', fontStyle: 'italic', marginBottom: '15px' }}>
              Note: All searches are case insensitive; wildcard character (*) ok; only last names of colleagues are searched
            </p>

            <div className="search-form-container">
              <form onSubmit={handleQuickSearch} className="inline-search-form">
                <input
                  type="text"
                  value={quickSearchQuery}
                  onChange={(e) => setQuickSearchQuery(e.target.value)}
                  size="20"
                  placeholder="Search..."
                />
                <button type="submit">Submit</button>
              </form>
              <p style={{ fontSize: '0.9em', marginTop: '8px' }}>
                Use a keyword to simultaneously search by major categories of information in CGD (gene name,
                locus description, GO terms, GO IDs, phenotypes, colleagues, authors, PubMed IDs, biochemical
                pathway names, orthologs and best hits in <em>S. cerevisiae</em> and other <em>Candida</em> species.
                Examples: 'ACT1', 'orf19.2203', 'orf6.1022', 'transcription', 'Smith'. The asterisk character (*)
                may be used as a wild card.
              </p>
            </div>
          </div>
        </div>

        {/* Search Categories */}
        <div className="info-section">
          <h2>Search Categories</h2>

          <div className="help-item">
            <h3><Link to="/feature-search">Advanced Feature Search</Link></h3>
            <p>Find a chromosomal feature (e.g., gene, ORF, centromere) based on selected criteria (e.g., chromosome number, GO-Slim terms, etc.)</p>
          </div>

          <div className="help-item">
            <h3><Link to="/literature-topic-search">Literature Search</Link></h3>
            <p>Search <em>Candida</em> literature by topic, author, or keyword</p>
          </div>

          <div className="help-item">
            <h3>Text Search</h3>
            <div className="search-form-container" style={{ marginTop: '10px' }}>
              <form onSubmit={handleTextSearch} className="inline-search-form">
                <input
                  type="text"
                  value={textSearchQuery}
                  onChange={(e) => setTextSearchQuery(e.target.value)}
                  size="20"
                  placeholder="Search..."
                />
                <button type="submit">Submit</button>
              </form>
              <p style={{ fontSize: '0.9em', marginTop: '8px' }}>
                Use a keyword to simultaneously search all of the categories of information in CGD that are
                included in the Quick Search, plus locus history notes, paper abstracts, and gene name descriptions.
              </p>
            </div>
          </div>

          <div className="help-item">
            <h3><Link to="/phenotype/search">Phenotype Search</Link></h3>
            <p>
              Search the text of all phenotype information to find phenotypes of interest and view the genes
              associated with them, or <Link to="/phenotype/terms">browse the entire list</Link> of phenotype terms
            </p>
          </div>

          <div className="help-item">
            <h3><Link to="/colleague">Colleague Search</Link></h3>
            <p>Search contact information submitted to CGD by <em>Candida</em> researchers</p>
          </div>

          <div className="help-item">
            <h3><Link to="/external-resources">External Resources</Link></h3>
            <p>Links to external databases and resources for <em>Candida</em> research</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
