import React, { useState } from 'react';
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import './BrowseCategoryPage.css';

const EXPLORERS = {
  'biological-processes': {
    eyebrow: 'Gene Ontology',
    title: 'Biological Processes',
    description: 'Explore the pathways and broader biological programs in which Candida genes participate.',
    placeholder: 'Search processes, for example biofilm formation',
    topics: ['biofilm formation', 'drug transport', 'cell wall organization', 'hyphal growth', 'pathogenesis'],
  },
  'molecular-functions': {
    eyebrow: 'Gene Ontology',
    title: 'Molecular Functions',
    description: 'Explore the biochemical activities performed by Candida gene products.',
    placeholder: 'Search functions, for example kinase activity',
    topics: ['kinase activity', 'DNA binding', 'RNA binding', 'transporter activity', 'catalytic activity'],
  },
  'cellular-components': {
    eyebrow: 'Gene Ontology',
    title: 'Cellular Components',
    description: 'Explore the cellular locations and complexes associated with Candida gene products.',
    placeholder: 'Search components, for example cell wall',
    topics: ['nucleus', 'cytoplasm', 'cell wall', 'plasma membrane', 'mitochondrion'],
  },
  interactions: {
    eyebrow: 'Genes and Networks',
    title: 'Interactions',
    description: 'Open a gene’s physical and genetic interactions, network view, and supporting evidence.',
    placeholder: 'Enter a gene name, for example HOG1',
    topics: ['HOG1', 'EFG1', 'BCR1', 'ERG11', 'FKS1'],
    interactions: true,
  },
};

function BrowseCategoryPage() {
  const { category } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const config = EXPLORERS[category];
  const organism = searchParams.get('organism');

  if (!config) return <Navigate to="/search2" replace />;

  const destinationFor = (term) => {
    if (config.interactions) {
      return `/locus/${encodeURIComponent(term)}?tab=interactions`;
    }
    return `/search/text/results?query=${encodeURIComponent(term)}&search_field=go_terms&match_mode=all`;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const term = query.trim();
    if (term) navigate(destinationFor(term));
  };

  return (
    <div className="browse-category-page">
      <div className="browse-category-inner">
        <Link className="browse-category-back" to={organism ? `/search2?organism=${encodeURIComponent(organism)}` : '/search2'}>
          ← Back to Explore
        </Link>
        <header className="browse-category-hero">
          <span className="browse-category-eyebrow">{config.eyebrow}</span>
          <h1>{config.title}</h1>
          <p>{config.description}</p>
          {organism && <div className="browse-category-scope">Selected organism: {organism.replaceAll('_', ' ')}</div>}
        </header>

        <form className="browse-category-search" onSubmit={handleSubmit} role="search">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={config.placeholder}
            aria-label={`Search ${config.title}`}
          />
          <button type="submit">Search</button>
        </form>

        <section className="browse-category-section">
          <h2>{config.interactions ? 'Popular genes' : 'Popular topics'}</h2>
          <div className="browse-category-topics">
            {config.topics.map((topic) => (
              <Link key={topic} to={destinationFor(topic)}>{topic}</Link>
            ))}
          </div>
        </section>

        <section className="browse-category-section">
          <h2>Related tools</h2>
          <div className="browse-category-tools">
            {config.interactions ? (
              <>
                <Link to={organism ? `/feature-search?organism=${encodeURIComponent(organism)}` : '/feature-search'}>Feature Search</Link>
                <Link to="/virulence-factor-browser">Virulence Factor Browser</Link>
              </>
            ) : (
              <>
                <Link to="/go-resources">GO Resources</Link>
                <Link to="/go-slim-mapper">GO Slim Mapper</Link>
                <Link to="/go-term-finder">GO Term Finder</Link>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default BrowseCategoryPage;
