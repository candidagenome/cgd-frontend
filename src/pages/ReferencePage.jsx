import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import useReferenceData from '../hooks/useReferenceData';
import { formatCitationString } from '../utils/formatCitation.jsx';
import './ReferencePage.css';

function ReferencePage() {
  const { id } = useParams();
  const { data, loading, errors, loaders } = useReferenceData(id);
  const [selectedAuthor, setSelectedAuthor] = useState('');
  const [searchType, setSearchType] = useState('CGD');

  // Load literature topics data on mount
  useEffect(() => {
    if (loaders.loadLiteratureTopics) {
      loaders.loadLiteratureTopics();
    }
  }, [loaders]);

  const handleAuthorSearch = (e) => {
    e.preventDefault();
    if (!selectedAuthor) return;

    // Extract last name for search
    const lastName = selectedAuthor.split(' ')[0];

    switch (searchType) {
      case 'CGD':
        // Search within CGD - could link to a search page
        window.open(`/search?type=reference&author=${encodeURIComponent(lastName)}`, '_blank');
        break;
      case 'PubMed':
        window.open(`https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(selectedAuthor)}`, '_blank');
        break;
      case 'Google Scholar':
        window.open(`https://scholar.google.com/scholar?q=author:${encodeURIComponent(lastName)}`, '_blank');
        break;
      default:
        break;
    }
  };

  // Render citation section
  const renderCitation = () => {
    if (loading.info) return <div className="loading">Loading reference information...</div>;
    if (errors.info) return <div className="error">Error: {errors.info}</div>;
    if (!data.info || !data.info.result) return <div className="no-data">No reference data available</div>;

    const ref = data.info.result;

    return (
      <div className="citation-section">
        <div className="citation-text">
          {ref.citation ? (
            formatCitationString(ref.citation, ref.journal_name)
          ) : (
            <>
              <strong>{ref.authors?.map(a => a.author_name).join(', ')}</strong>
              {ref.year && ` (${ref.year})`}
              {ref.title && ` ${ref.title}`}
              {ref.journal_name && <> <em>{ref.journal_name}</em></>}
              {ref.volume && ` ${ref.volume}`}
              {ref.issue && `(${ref.issue})`}
              {ref.page && `:${ref.page}`}
            </>
          )}
        </div>

        <div className="citation-links">
          {ref.pubmed && (
            <a
              href={`https://pubmed.ncbi.nlm.nih.gov/${ref.pubmed}`}
              target="_blank"
              rel="noopener noreferrer"
              className="citation-link"
            >
              PubMed: {ref.pubmed}
            </a>
          )}
          {ref.full_text_url && (
            <a
              href={ref.full_text_url}
              target="_blank"
              rel="noopener noreferrer"
              className="citation-link"
            >
              Full Text
            </a>
          )}
          {ref.supplement_url && (
            <a
              href={ref.supplement_url}
              target="_blank"
              rel="noopener noreferrer"
              className="citation-link"
            >
              Supplemental Materials
            </a>
          )}
        </div>
      </div>
    );
  };

  // Render abstract section
  const renderAbstract = () => {
    if (!data.info?.result?.abstract) return null;

    return (
      <div className="section" id="abstract">
        <h2 className="section-header">Abstract</h2>
        <div className="section-content">
          <p className="abstract-text">{data.info.result.abstract}</p>
        </div>
      </div>
    );
  };

  // Render topics/gene matrix section
  const renderTopicsSection = () => {
    if (loading.literatureTopics) {
      return (
        <div className="section" id="summary">
          <h2 className="section-header">Topics addressed in this paper</h2>
          <div className="section-content">
            <div className="loading">Loading topics...</div>
          </div>
        </div>
      );
    }

    if (errors.literatureTopics || !data.literatureTopics) {
      return null;
    }

    const { topics, all_features } = data.literatureTopics;

    if (topics.length === 0 && all_features.length === 0) {
      return null;
    }

    // Build a lookup for quick checking: topic -> Set of feature_nos
    const topicFeatureMap = {};
    topics.forEach(t => {
      topicFeatureMap[t.topic] = new Set(t.features.map(f => f.feature_no));
    });

    // Separate topics with features (gene-linked) from topics without (non-gene)
    const geneLinkedTopics = topics.filter(t => t.features.length > 0);
    const nonGeneTopics = topics.filter(t => t.features.length === 0);

    return (
      <div className="section" id="summary">
        <h2 className="section-header">Topics addressed in this paper</h2>
        <div className="section-content">
          {/* Gene-topic matrix */}
          {(geneLinkedTopics.length > 0 || nonGeneTopics.length > 0) && all_features.length > 0 && (
            <div className="topic-matrix-wrapper">
              <table className="topic-matrix">
                <thead>
                  <tr>
                    <th className="topic-header">Topic</th>
                    {nonGeneTopics.length > 0 && (
                      <th className="non-gene-header">Not linked to Genes</th>
                    )}
                    {all_features.map((feature, idx) => (
                      <th key={idx} className="gene-header">
                        <Link to={`/locus/${feature.feature_name}`}>
                          {feature.gene_name || feature.feature_name}
                        </Link>
                        <br />
                        <span className="organism-label">
                          (<em>{feature.organism_name}</em>)
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Render all topics */}
                  {[...geneLinkedTopics, ...nonGeneTopics].map((topic, tIdx) => {
                    const isNonGene = topic.features.length === 0;
                    return (
                      <tr key={tIdx}>
                        <td className="topic-name">{topic.topic}</td>
                        {nonGeneTopics.length > 0 && (
                          <td className="topic-cell">
                            {isNonGene && (
                              <span className="topic-marker" title={topic.topic}>●</span>
                            )}
                          </td>
                        )}
                        {all_features.map((feature, fIdx) => (
                          <td key={fIdx} className="topic-cell">
                            {topicFeatureMap[topic.topic]?.has(feature.feature_no) && (
                              <span className="topic-marker" title={`${topic.topic} - ${feature.gene_name || feature.feature_name}`}>
                                ●
                              </span>
                            )}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* If no features but has topics, just list them */}
          {all_features.length === 0 && topics.length > 0 && (
            <div className="topics-list">
              <p>Topics: {topics.map(t => t.topic).join(', ')}</p>
            </div>
          )}

          {/* Gene count summary */}
          {all_features.length > 0 && (
            <p className="gene-count">
              There {all_features.length === 1 ? 'is' : 'are'}{' '}
              <strong>{all_features.length}</strong> gene{all_features.length !== 1 ? 's' : ''} addressed in this paper.
            </p>
          )}
        </div>
      </div>
    );
  };

  // Render author search section
  const renderAuthorSearch = () => {
    if (!data.info?.result?.authors || data.info.result.authors.length === 0) {
      return null;
    }

    const authors = data.info.result.authors;

    // Set default author if not set
    if (!selectedAuthor && authors.length > 0) {
      setSelectedAuthor(authors[0].author_name);
    }

    return (
      <div className="section" id="author">
        <h2 className="section-header">Author Searches</h2>
        <div className="section-content author-search-content">
          <p>
            To find contact information or other publications by the authors of this paper,
            follow these three steps:
          </p>
          <form onSubmit={handleAuthorSearch} className="author-search-form">
            <div className="search-step">
              <label>(1) Choose an author:</label>
              <select
                value={selectedAuthor}
                onChange={(e) => setSelectedAuthor(e.target.value)}
                className="author-select"
              >
                {authors.map((author, idx) => (
                  <option key={idx} value={author.author_name}>
                    {author.author_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="search-step">
              <label>(2) Choose a search parameter:</label>
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="search-type-select"
              >
                <option value="CGD">Papers in CGD</option>
                <option value="PubMed">PubMed</option>
                <option value="Google Scholar">Google Scholar</option>
              </select>
            </div>
            <div className="search-step">
              <label>(3) Click to implement:</label>
              <button type="submit" className="search-button">Search!</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Page navigation links
  const renderPageNav = () => {
    const links = [];

    if (data.info?.result?.abstract) {
      links.push({ id: 'abstract', label: 'Abstract' });
    }

    if (data.literatureTopics?.all_features?.length > 0 || data.literatureTopics?.topics?.length > 0) {
      links.push({ id: 'summary', label: 'Summary Chart' });
    }

    if (data.info?.result?.authors?.length > 0) {
      links.push({ id: 'author', label: 'Author Search' });
    }

    if (links.length === 0) return null;

    return (
      <nav className="page-nav">
        {links.map((link, idx) => (
          <span key={link.id}>
            {idx > 0 && ' | '}
            <a href={`#${link.id}`}>{link.label}</a>
          </span>
        ))}
      </nav>
    );
  };

  // Get display title for the page
  const getDisplayTitle = () => {
    if (data.info && data.info.result) {
      return 'CGD Paper';
    }
    return `Reference: ${id}`;
  };

  return (
    <div className="reference-page">
      <header className="reference-header">
        <h1>{getDisplayTitle()}</h1>
      </header>

      {renderPageNav()}

      <div className="divider" />

      {renderCitation()}

      {renderAbstract()}

      {renderTopicsSection()}

      {renderAuthorSearch()}

      <div className="divider" />

      {renderPageNav()}
    </div>
  );
}

export default ReferencePage;
