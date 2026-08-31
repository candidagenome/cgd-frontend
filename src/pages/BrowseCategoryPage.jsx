import React, { useState } from 'react';
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import './BrowseCategoryPage.css';

const EXPLORERS = {
  'biological-processes': {
    eyebrow: 'Gene Ontology',
    title: 'Biological Processes',
    description: 'Explore the pathways and broader biological programs in which Candida genes participate.',
    placeholder: 'Search processes, for example biofilm formation',
    topics: [
      { label: 'biofilm formation', goid: 42710 },
      { label: 'response to xenobiotic stimulus', goid: 9410 },
      { label: 'cell wall organization', goid: 71555 },
      { label: 'hyphal growth', goid: 30448 },
      { label: 'filamentous growth', goid: 30447 },
    ],
  },
  'molecular-functions': {
    eyebrow: 'Gene Ontology',
    title: 'Molecular Functions',
    description: 'Explore the biochemical activities performed by Candida gene products.',
    placeholder: 'Search functions, for example kinase activity',
    topics: [
      { label: 'kinase activity', goid: 16301 },
      { label: 'DNA binding', goid: 3677 },
      { label: 'RNA binding', goid: 3723 },
      { label: 'transporter activity', goid: 5215 },
      { label: 'catalytic activity', goid: 3824 },
    ],
  },
  'cellular-components': {
    eyebrow: 'Gene Ontology',
    title: 'Cellular Components',
    description: 'Explore the cellular locations and complexes associated with Candida gene products.',
    placeholder: 'Search components, for example cell wall',
    topics: [
      { label: 'nucleus', goid: 5634 },
      { label: 'cytoplasm', goid: 5737 },
      { label: 'cell wall', goid: 5618 },
      { label: 'plasma membrane', goid: 5886 },
      { label: 'mitochondrion', goid: 5739 },
    ],
  },
  references: {
    eyebrow: 'CGD Literature',
    title: 'References',
    description: 'Search curated publications or browse recent papers and major Candida research topics.',
    placeholder: 'Search publications, for example biofilm review',
    topics: ['Recent papers', 'Reviews', 'Drug resistance', 'Biofilm', 'Virulence', 'Pathogenesis'],
    references: true,
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
  const [annotationScope, setAnnotationScope] = useState('experimental');
  const config = EXPLORERS[category];
  const organism = searchParams.get('organism');

  if (!config) return <Navigate to="/search2" replace />;

  const isGoCategory = !config.references && !config.interactions;

  const goTermLink = (goid) => {
    const formatted = `GO:${String(goid).padStart(7, '0')}`;
    return `/go/${formatted}?annotations=${annotationScope}`;
  };

  const destinationFor = (term) => {
    if (config.interactions) {
      return `/locus/${encodeURIComponent(term)}?tab=interactions`;
    }
    if (config.references) {
      if (term === 'Recent papers') return '/reference/NewPapersThisWeek?days=90';
      if (term === 'Reviews') {
        return '/search/text/results?query=review&search_field=paper_titles&match_mode=any';
      }
      return `/search/text/results?query=${encodeURIComponent(term)}&search_field=paper_titles&match_mode=all`;
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
          {organism && !config.references && <div className="browse-category-scope">Selected organism: {organism.replaceAll('_', ' ')}</div>}
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

        {isGoCategory && (
          <div className="browse-category-filter" style={{ display: 'flex', gap: '18px', alignItems: 'center', margin: '2px 0 6px' }}>
            <span style={{ fontWeight: 600 }}>Annotations:</span>
            {[
              ['experimental', 'Experimental results'],
              ['computational', 'Computational predictions'],
              ['all', 'Both'],
            ].map(([value, label]) => (
              <label key={value} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="annotation-scope"
                  checked={annotationScope === value}
                  onChange={() => setAnnotationScope(value)}
                />
                {label}
              </label>
            ))}
          </div>
        )}

        <section className="browse-category-section">
          <h2>{config.interactions ? 'Popular genes' : 'Popular topics'}</h2>
          <div className="browse-category-topics">
            {config.topics.map((topic) => (
              typeof topic === 'object'
                ? <Link key={topic.label} to={goTermLink(topic.goid)}>{topic.label}</Link>
                : <Link key={topic} to={destinationFor(topic)}>{topic}</Link>
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
            ) : config.references ? (
              <>
                <Link to="/literature-topic-search">Literature Topic Search</Link>
                <Link to="/topic-biblios">Highlighted Topics</Link>
                <Link to="/genome-wide-analysis-papers">Genome-Wide Analysis Papers</Link>
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
