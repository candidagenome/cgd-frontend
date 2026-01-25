import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/locus/${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="home-page">
      <header className="home-header">
        <h1>Candida Genome Database</h1>
        <p className="tagline">A resource for the Candida research community</p>
      </header>

      <section className="search-section">
        <h2>Search for a Gene/Locus</h2>
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter gene name, ORF name, or CGDID..."
            className="search-input"
          />
          <button type="submit" className="search-button">
            Search
          </button>
        </form>
        <div className="search-examples">
          <span>Examples: </span>
          <button onClick={() => navigate('/locus/ACT1')}>ACT1</button>
          <button onClick={() => navigate('/locus/orf19.2203')}>orf19.2203</button>
          <button onClick={() => navigate('/locus/WOR1')}>WOR1</button>
        </div>
      </section>

      <section className="quick-links">
        <h2>Quick Links</h2>
        <div className="link-grid">
          <a href="#browse" className="link-card">
            <h3>Browse Genes</h3>
            <p>Explore all annotated genes</p>
          </a>
          <a href="#go" className="link-card">
            <h3>Gene Ontology</h3>
            <p>Search by GO terms</p>
          </a>
          <a href="#phenotype" className="link-card">
            <h3>Phenotypes</h3>
            <p>Browse phenotype data</p>
          </a>
          <a href="#download" className="link-card">
            <h3>Downloads</h3>
            <p>Download data files</p>
          </a>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
