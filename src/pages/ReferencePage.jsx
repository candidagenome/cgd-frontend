import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import useReferenceData from '../hooks/useReferenceData';
import referenceApi from '../api/referenceApi';
import { formatCitationString, CitationLinksBelow, buildCitationLinks } from '../utils/formatCitation.jsx';
import './ReferencePage.css';

const GENES_PER_TABLE = 10;

// Get display name for a gene - use gene_name if available, otherwise strip _A suffix from feature_name
const getGeneDisplayName = (feature) => {
  if (feature.gene_name) {
    return feature.gene_name;
  }
  // Strip _A, _B etc. suffix from feature_name (e.g., "C3_06760W_A" -> "C3_06760W")
  return feature.feature_name.replace(/_[A-Z]$/, '');
};

// Abbreviate organism name (e.g., "Candida albicans SC5314" -> "C. albicans")
const getOrganismAbbrev = (organismName) => {
  if (!organismName) return '';
  // Split into words, take first letter of genus + species name
  const parts = organismName.split(' ');
  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}. ${parts[1]}`;
  }
  return organismName;
};

function ReferencePage() {
  const { id } = useParams();
  const { data, loading, errors, loaders } = useReferenceData(id);
  const [selectedAuthor, setSelectedAuthor] = useState('');
  const [searchType, setSearchType] = useState('CGD');
  const [selectedJumpLabel, setSelectedJumpLabel] = useState('');
  const [authorSearchResults, setAuthorSearchResults] = useState(null);
  const [authorSearchLoading, setAuthorSearchLoading] = useState(false);
  const [authorSearchError, setAuthorSearchError] = useState(null);

  // Load literature topics data on mount
  useEffect(() => {
    if (loaders.loadLiteratureTopics) {
      loaders.loadLiteratureTopics();
    }
  }, [loaders]);

  const handleAuthorSearch = async (e) => {
    e.preventDefault();
    if (!selectedAuthor) return;

    const lastName = selectedAuthor.split(' ')[0];

    switch (searchType) {
      case 'CGD':
        // Search CGD database via API - use full author name
        setAuthorSearchLoading(true);
        setAuthorSearchError(null);
        try {
          const results = await referenceApi.searchByAuthor(selectedAuthor);
          setAuthorSearchResults(results);
        } catch (error) {
          setAuthorSearchError(error.response?.data?.detail || error.message);
          setAuthorSearchResults(null);
        } finally {
          setAuthorSearchLoading(false);
        }
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

  const handleJumpChange = (e) => {
    const label = e.target.value;
    setSelectedJumpLabel(label);
    if (label) {
      const element = document.getElementById(label);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Render citation section
  const renderCitation = () => {
    if (loading.info) return <div className="loading">Loading reference information...</div>;
    if (errors.info) return <div className="error">Error: {errors.info}</div>;
    if (!data.info || !data.info.result) return <div className="no-data">No reference data available</div>;

    const ref = data.info.result;

    // Build links for this reference
    const links = buildCitationLinks({
      dbxref_id: ref.dbxref_id,
      pubmed: ref.pubmed,
      urls: [
        ...(ref.full_text_url ? [{ url: ref.full_text_url, url_type: 'full text' }] : []),
        ...(ref.supplement_url ? [{ url: ref.supplement_url, url_type: 'web supplement' }] : []),
      ],
    });

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
          {ref.pubmed && <span className="citation-pmid"> PMID: {ref.pubmed}</span>}
        </div>
        <CitationLinksBelow links={links} />
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

  // Generate batch labels for jump navigation
  const generateBatchLabels = (features) => {
    const labels = [];
    for (let i = 0; i < features.length; i += GENES_PER_TABLE) {
      const endIdx = Math.min(i + GENES_PER_TABLE - 1, features.length - 1);
      const startNum = i + 1;
      const endNum = endIdx + 1;
      const startGene = getGeneDisplayName(features[i]);
      const endGene = getGeneDisplayName(features[endIdx]);
      const label = `#${startNum}-${endNum}(${startGene}-${endGene})`;
      labels.push({
        id: label,
        startIdx: i,
        endIdx: endIdx,
        displayLabel: `#${startNum}-${endNum}`,
        geneRange: `(${startGene}-${endGene})`
      });
    }
    return labels;
  };

  // Render a single gene-topic matrix table
  const renderGeneTable = (features, topics, topicFeatureMap, nonGeneTopics, label, showNonGene = false) => {
    const allTopics = [...topics.filter(t => t.features.length > 0), ...nonGeneTopics];

    return (
      <div key={label} id={label} className="gene-table-section">
        {label && (
          <h3 className="table-label">Genes linked to topics {label}</h3>
        )}
        <div className="topic-matrix-wrapper">
          <table className="topic-matrix">
            <thead>
              <tr>
                <th className="topic-header">Topic</th>
                {showNonGene && nonGeneTopics.length > 0 && (
                  <th className="non-gene-header">Topics not linked to Genes</th>
                )}
                {features.map((feature, idx) => (
                  <th key={idx} className="gene-header">
                    <Link to={`/locus/${feature.feature_name}`}>
                      {getGeneDisplayName(feature)}
                    </Link>
                    <br />
                    <span className="organism-label">
                      (<em>{getOrganismAbbrev(feature.organism_name)}</em>)
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allTopics.map((topic, tIdx) => {
                const isNonGene = topic.features.length === 0;
                // Only show row if it has at least one marker in this table
                const hasMarkerInTable = features.some(f =>
                  topicFeatureMap[topic.topic]?.has(f.feature_no)
                ) || (showNonGene && isNonGene);

                if (!hasMarkerInTable) return null;

                return (
                  <tr key={tIdx}>
                    <td className="topic-name">{topic.topic}</td>
                    {showNonGene && nonGeneTopics.length > 0 && (
                      <td className="topic-cell non-gene-cell">
                        {isNonGene && (
                          <span className="topic-marker non-gene-marker" title={topic.topic}>●</span>
                        )}
                      </td>
                    )}
                    {features.map((feature, fIdx) => (
                      <td key={fIdx} className="topic-cell">
                        {topicFeatureMap[topic.topic]?.has(feature.feature_no) && (
                          <span className="topic-marker gene-marker" title={`${topic.topic} - ${getGeneDisplayName(feature)}`}>
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
      </div>
    );
  };

  // Render the note explaining the colored balls
  const renderNote = () => (
    <div className="topics-note">
      <ul>
        <li>
          <span className="topic-marker gene-marker">●</span> displays other papers with information about that topic for that gene.
        </li>
        <li>
          <span className="topic-marker non-gene-marker">●</span> displays other papers in CGD that are associated with that topic.
          The topic is addressed in these papers but does not describe a specific gene or chromosomal feature.
        </li>
        <li>To go to the Locus page for a gene, click on the gene name.</li>
      </ul>
    </div>
  );

  // Render jump dropdown for >20 genes
  const renderJumpDropdown = (batchLabels) => (
    <div className="jump-dropdown-container">
      <strong>Jump to Summary Chart for: </strong>
      <select
        value={selectedJumpLabel}
        onChange={handleJumpChange}
        className="jump-select"
      >
        <option value="">-- Select --</option>
        {batchLabels.map((batch) => (
          <option key={batch.id} value={batch.id}>
            {batch.displayLabel}{batch.geneRange}
          </option>
        ))}
      </select>
    </div>
  );

  // Render jump links for 10-20 genes
  const renderJumpLinks = (batchLabels) => (
    <div className="jump-links-container">
      <strong>Jump to Summary Chart for: </strong>
      {batchLabels.map((batch, idx) => (
        <span key={batch.id}>
          {idx > 0 && ' | '}
          <a href={`#${batch.id}`}>{batch.displayLabel}</a>
          {' '}{batch.geneRange}
        </span>
      ))}
    </div>
  );

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

    const geneLinkedTopics = topics.filter(t => t.features.length > 0);
    const nonGeneTopics = topics.filter(t => t.features.length === 0);
    const numGenes = all_features.length;

    // Generate batch labels if needed
    const batchLabels = numGenes > GENES_PER_TABLE ? generateBatchLabels(all_features) : [];

    return (
      <div className="section" id="summary">
        <h2 className="section-header">Topics addressed in this paper</h2>
        <div className="section-content">

          {/* Gene count and jump navigation for many genes */}
          {numGenes > GENES_PER_TABLE && (
            <div className="gene-count-header">
              <p className="gene-count-message">
                There are <span className="gene-count-number">{numGenes}</span> different genes addressed in this paper.
              </p>
              {numGenes > 20 ? renderJumpDropdown(batchLabels) : renderJumpLinks(batchLabels)}
              <div className="divider" />
            </div>
          )}

          {/* Render note */}
          {(geneLinkedTopics.length > 0 || nonGeneTopics.length > 0) && renderNote()}

          {/* Render tables based on number of genes */}
          {numGenes > GENES_PER_TABLE ? (
            // Multiple tables for many genes
            <>
              {batchLabels.map((batch, batchIdx) => {
                const batchFeatures = all_features.slice(batch.startIdx, batch.endIdx + 1);
                return (
                  <div key={batch.id}>
                    {renderGeneTable(
                      batchFeatures,
                      topics,
                      topicFeatureMap,
                      nonGeneTopics,
                      batch.id,
                      batchIdx === 0 // Show non-gene column only in first table
                    )}
                    {batchIdx < batchLabels.length - 1 && (
                      <>
                        {renderNote()}
                        {numGenes > 20 && batchIdx % 3 === 2 && renderJumpDropdown(batchLabels)}
                      </>
                    )}
                  </div>
                );
              })}
              {/* Repeat jump navigation at bottom */}
              <div className="jump-footer">
                {numGenes > 20 ? renderJumpDropdown(batchLabels) : renderJumpLinks(batchLabels)}
              </div>
            </>
          ) : numGenes > 0 ? (
            // Single table for few genes
            renderGeneTable(all_features, topics, topicFeatureMap, nonGeneTopics, '', true)
          ) : (
            // No genes, just list topics
            topics.length > 0 && (
              <div className="topics-list">
                <p>Topics: {topics.map(t => t.topic).join(', ')}</p>
              </div>
            )
          )}

          {/* Gene count summary at bottom for small tables */}
          {numGenes > 0 && numGenes <= GENES_PER_TABLE && (
            <p className="gene-count">
              There {numGenes === 1 ? 'is' : 'are'}{' '}
              <strong>{numGenes}</strong> gene{numGenes !== 1 ? 's' : ''} addressed in this paper.
            </p>
          )}
        </div>
      </div>
    );
  };

  // Render author search section
  // Highlight author name in author list
  const highlightAuthor = (authorList, searchQuery) => {
    if (!searchQuery) return authorList;
    const query = searchQuery.replace(/[*%]/g, '');
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = authorList.split(regex);
    return parts.map((part, idx) =>
      regex.test(part) ? <mark key={idx} className="author-highlight">{part}</mark> : part
    );
  };

  // Render author search results
  const renderAuthorSearchResults = () => {
    if (authorSearchLoading) {
      return <div className="loading">Searching...</div>;
    }

    if (authorSearchError) {
      return <div className="error">Error: {authorSearchError}</div>;
    }

    if (!authorSearchResults) {
      return null;
    }

    const { author_query, author_count, reference_count, references } = authorSearchResults;

    return (
      <div className="author-search-results">
        <p className="search-results-summary">
          There are <span className="highlight-count">{author_count}</span> authors associated with{' '}
          <span className="highlight-count">{reference_count}</span> papers found for author like{' '}
          <span className="highlight-count">{author_query}</span> in database
        </p>

        {references.length > 0 && (
          <table className="author-results-table">
            <thead>
              <tr>
                <th>Author(s)</th>
                <th>Citation</th>
              </tr>
            </thead>
            <tbody>
              {references.map((ref, idx) => (
                <tr key={ref.reference_no} className={idx % 2 === 0 ? '' : 'alt-row'}>
                  <td className="authors-cell">
                    {highlightAuthor(ref.author_list, author_query)}
                  </td>
                  <td className="citation-cell">
                    <div className="citation-line">
                      {formatCitationString(ref.citation)}
                    </div>
                    <CitationLinksBelow links={ref.links} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  };

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
                onChange={(e) => {
                  setSelectedAuthor(e.target.value);
                  setAuthorSearchResults(null); // Clear previous results
                }}
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
                onChange={(e) => {
                  setSearchType(e.target.value);
                  setAuthorSearchResults(null); // Clear previous results
                }}
                className="search-type-select"
              >
                <option value="CGD">Papers in CGD</option>
                <option value="PubMed">PubMed</option>
                <option value="Google Scholar">Google Scholar</option>
              </select>
            </div>
            <div className="search-step">
              <label>(3) Click to implement:</label>
              <button type="submit" className="search-button" disabled={authorSearchLoading}>
                {authorSearchLoading ? 'Searching...' : 'Search!'}
              </button>
            </div>
          </form>

          {renderAuthorSearchResults()}
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
