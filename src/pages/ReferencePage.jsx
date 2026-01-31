import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import useReferenceData from '../hooks/useReferenceData';
import { formatCitationString } from '../utils/formatCitation.jsx';
import './ReferencePage.css';

const GENES_PER_TABLE = 10;

function ReferencePage() {
  const { id } = useParams();
  const { data, loading, errors, loaders } = useReferenceData(id);
  const [selectedAuthor, setSelectedAuthor] = useState('');
  const [searchType, setSearchType] = useState('CGD');
  const [selectedJumpLabel, setSelectedJumpLabel] = useState('');

  // Load literature topics data on mount
  useEffect(() => {
    if (loaders.loadLiteratureTopics) {
      loaders.loadLiteratureTopics();
    }
  }, [loaders]);

  const handleAuthorSearch = (e) => {
    e.preventDefault();
    if (!selectedAuthor) return;

    const lastName = selectedAuthor.split(' ')[0];

    switch (searchType) {
      case 'CGD':
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

  // Generate batch labels for jump navigation
  const generateBatchLabels = (features) => {
    const labels = [];
    for (let i = 0; i < features.length; i += GENES_PER_TABLE) {
      const endIdx = Math.min(i + GENES_PER_TABLE - 1, features.length - 1);
      const startNum = i + 1;
      const endNum = endIdx + 1;
      const startGene = features[i].gene_name || features[i].feature_name;
      const endGene = features[endIdx].gene_name || features[endIdx].feature_name;
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
                          <span className="topic-marker gene-marker" title={`${topic.topic} - ${feature.gene_name || feature.feature_name}`}>
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
