import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './LocusComponents.css';
import OrganismSelector, { getDefaultOrganism } from './OrganismSelector';
import {
  formatCitationString,
  CitationLinksBelow,
  buildCitationLinks,
} from '../../utils/formatCitation.jsx';

// Helper to format date for display
const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

const REFS_PER_PAGE = 30;

function References({ data, loading, error, selectedOrganism, onOrganismChange, locusName }) {
  const [collapsedYears, setCollapsedYears] = useState({});
  const [viewMode, setViewMode] = useState('summary'); // 'summary', 'list', 'grouped', 'topic'
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [localSelectedOrganism, setLocalSelectedOrganism] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Use either the prop or local state for organism selection
  const currentOrganism = selectedOrganism || localSelectedOrganism;
  const setCurrentOrganism = onOrganismChange || setLocalSelectedOrganism;

  const organismNames = data?.results ? Object.keys(data.results) : [];

  useEffect(() => {
    if (organismNames.length > 0 && !currentOrganism) {
      setCurrentOrganism(getDefaultOrganism(organismNames));
    }
  }, [organismNames, currentOrganism, setCurrentOrganism]);

  if (loading) return <div className="loading">Loading literature...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!data || !data.results) return <div className="no-data">No literature data available</div>;

  if (organismNames.length === 0) {
    return <div className="no-data">No references found</div>;
  }

  // Get data for current organism
  const orgData = currentOrganism ? data.results[currentOrganism] : null;
  const refs = orgData?.references || [];
  const displayName = orgData?.locus_display_name || locusName || 'this locus';

  // Calculate reference counts
  const curatedRefs = refs.filter(ref => ref.topics && ref.topics.length > 0 && !ref.topics.includes('Not yet curated'));
  const notYetCuratedRefs = refs.filter(ref => !ref.topics || ref.topics.length === 0 || ref.topics.includes('Not yet curated'));
  const highPriorityRefs = refs.filter(ref => ref.topics && ref.topics.includes('High Priority'));

  // Get references by topic
  const getRefsByTopic = (topic) => {
    if (topic === 'curated') {
      return curatedRefs;
    }
    if (topic === 'Not yet curated') {
      return notYetCuratedRefs;
    }
    return refs.filter(ref => ref.topics && ref.topics.includes(topic));
  };

  // Get all topics present in references
  const presentTopics = new Set();
  refs.forEach(ref => {
    if (ref.topics) {
      ref.topics.forEach(topic => presentTopics.add(topic));
    }
  });

  // Get other genes mentioned in references
  const otherGenes = new Set();
  refs.forEach(ref => {
    if (ref.other_genes) {
      ref.other_genes.forEach(gene => {
        if (gene !== displayName) {
          otherGenes.add(gene);
        }
      });
    }
  });

  // Group references by year
  const groupByYear = (references) => {
    const groups = {};
    (references || []).forEach((ref) => {
      const year = ref?.year || 'Unknown';
      if (!groups[year]) groups[year] = [];
      groups[year].push(ref);
    });

    return Object.entries(groups).sort((a, b) => {
      if (a[0] === 'Unknown') return 1;
      if (b[0] === 'Unknown') return -1;
      return parseInt(b[0], 10) - parseInt(a[0], 10);
    });
  };

  const toggleYear = (key) => {
    setCollapsedYears((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Helper: links below (no brackets)
  const renderLinksBelow = (ref) => {
    const displayLinks =
      ref?.links && ref.links.length > 0 ? ref.links : buildCitationLinks(ref);
    return <CitationLinksBelow links={displayLinks} />;
  };

  // Helper: citation line + optional PMID
  const renderCitationLine = (ref) => {
    const journal = ref?.journal_name || ref?.journal || null;

    return (
      <div className="citation-line">
        {formatCitationString(ref?.citation, journal)}
        {ref?.pubmed ? <span className="citation-pmid"> PMID: {ref.pubmed}</span> : null}
      </div>
    );
  };

  // Build PubMed search URL
  const buildPubMedUrl = (expanded = false) => {
    const geneName = encodeURIComponent(displayName);
    const organism = encodeURIComponent('Candida albicans');
    const field = expanded ? 'ALL' : 'TEXT:noexp';
    return `https://pubmed.ncbi.nlm.nih.gov/?term=(${geneName}[${field}]+AND+${organism}[ALL])`;
  };

  // Render topic entry in sidebar
  const renderTopicEntry = (topic, displayText, linkTopic) => {
    const isActive = selectedTopic === (linkTopic || topic);
    const topicRefs = getRefsByTopic(linkTopic || topic);
    const count = topicRefs.length;

    if (count === 0 && topic !== 'Literature Curation Summary') {
      return null;
    }

    return (
      <div
        key={topic}
        className={`topic-entry ${isActive ? 'active' : ''}`}
        onClick={() => {
          setCurrentPage(1);  // Reset to first page
          if (topic === 'Literature Curation Summary') {
            setSelectedTopic(null);
            setViewMode('summary');
          } else {
            setSelectedTopic(linkTopic || topic);
            setViewMode('topic');
          }
        }}
      >
        {isActive ? (
          <span className="topic-arrow">&#9658;</span>
        ) : (
          <span className="topic-bullet">&#8226;</span>
        )}
        <span className={`topic-label ${isActive ? 'active' : ''}`}>
          {displayText || topic}
          {count > 0 && <span className="topic-count">({count})</span>}
        </span>
      </div>
    );
  };

  // Render topics sidebar using dynamic topic groups from API
  const renderTopicsSidebar = () => {
    // Get topic groups from API response
    const topicGroups = orgData?.topic_groups || [];

    return (
      <div className="literature-sidebar">
        <h4 className="sidebar-title">
          <Link to={`/locus/${displayName}`}>{displayName}</Link>
          <span className="sidebar-subtitle"> LITERATURE TOPICS</span>
        </h4>

        {/* Render dynamic topic groups from API */}
        {topicGroups.map((group) => (
          <div key={group.group_name} className="topic-group">
            <div className="topic-group-header">{group.group_name}</div>
            {group.topics.map((topic) => (
              <div
                key={topic.topic_name}
                className={`topic-entry ${selectedTopic === topic.topic_name ? 'active' : ''}`}
                onClick={() => {
                  setCurrentPage(1);  // Reset to first page
                  setSelectedTopic(topic.topic_name);
                  setViewMode('topic');
                }}
              >
                {selectedTopic === topic.topic_name ? (
                  <span className="topic-arrow">&#9658;</span>
                ) : (
                  <span className="topic-bullet">&#8226;</span>
                )}
                <span className={`topic-label ${selectedTopic === topic.topic_name ? 'active' : ''}`}>
                  {topic.topic_name}
                  <span className="topic-count">({topic.count})</span>
                </span>
              </div>
            ))}
            {/* Add "List of all Curated References" link for Curated Literature group */}
            {group.group_name === 'Curated Literature' && renderTopicEntry('All Curated References', 'List of all Curated References', 'curated')}
          </div>
        ))}

        {/* Additional Information section (always shown) */}
        <div className="topic-group">
          <div className="topic-group-header">Additional Information</div>
          {notYetCuratedRefs.length > 0 && renderTopicEntry('References Not Yet Curated', 'References Not Yet Curated', 'Not yet curated')}
          {highPriorityRefs.length > 0 && renderTopicEntry('References for Curation', 'References for Curation', 'High Priority')}
          {renderTopicEntry('Literature Curation Summary', 'Literature Curation Summary')}

          {/* PubMed Search Links */}
          <div className="pubmed-links">
            <a
              href={buildPubMedUrl(false)}
              target="_blank"
              rel="noopener noreferrer"
              className="pubmed-link"
            >
              &#8226; PubMed Search
            </a>
            <a
              href={buildPubMedUrl(true)}
              target="_blank"
              rel="noopener noreferrer"
              className="pubmed-link"
            >
              &#8226; Expanded PubMed Search
            </a>
          </div>
        </div>
      </div>
    );
  };

  // Render summary section
  const renderSummary = () => {
    // Get dates from organism-specific data
    const lastCurated = formatDate(orgData?.last_curated_date);
    const lastPubMedSearch = formatDate(orgData?.last_pubmed_search_date);

    return (
      <div className="literature-summary">
        <h4>
          <Link to={`/locus/${displayName}`}>{displayName}</Link>
          {' '}Literature Curation Summary
        </h4>

        <div className="summary-stats">
          <p>
            <strong>Curated References for {displayName}: </strong>
            <a
              href="#curated"
              onClick={(e) => {
                e.preventDefault();
                setSelectedTopic('curated');
                setViewMode('topic');
              }}
            >
              {curatedRefs.length}
            </a>
          </p>
          <p>
            <strong>References Not Yet Curated: </strong>
            <a
              href="#not-curated"
              onClick={(e) => {
                e.preventDefault();
                setSelectedTopic('Not yet curated');
                setViewMode('topic');
              }}
            >
              {notYetCuratedRefs.length}
            </a>
          </p>
          {highPriorityRefs.length > 0 && (
            <p>
              <strong>References for Curation (High Priority): </strong>
              <a
                href="#high-priority"
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedTopic('High Priority');
                  setViewMode('topic');
                }}
              >
                {highPriorityRefs.length}
              </a>
            </p>
          )}
          {otherGenes.size > 0 && (
            <p>
              <strong>Number of Other Genes referred to in {displayName} Literature: </strong>
              {otherGenes.size}
            </p>
          )}
          <p>
            <strong>Date of last curation: </strong>{lastCurated}
          </p>
          <p>
            <strong>Date of last PubMed Search: </strong>{lastPubMedSearch}
          </p>
        </div>

        <hr />

        {renderReferencesTable(refs)}
      </div>
    );
  };

  // Render references table with pagination
  const renderReferencesTable = (refsToShow) => {
    if (!refsToShow || refsToShow.length === 0) {
      return <p className="no-data">No references found</p>;
    }

    // Sort by year descending
    const sortedRefs = [...refsToShow].sort((a, b) => (b?.year || 0) - (a?.year || 0));

    // Pagination
    const totalPages = Math.ceil(sortedRefs.length / REFS_PER_PAGE);
    const startIdx = (currentPage - 1) * REFS_PER_PAGE;
    const endIdx = startIdx + REFS_PER_PAGE;
    const paginatedRefs = sortedRefs.slice(startIdx, endIdx);

    const renderPagination = () => {
      if (totalPages <= 1) return null;

      return (
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            &laquo; First
          </button>
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            &lsaquo; Prev
          </button>
          <span className="pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next &rsaquo;
          </button>
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            Last &raquo;
          </button>
        </div>
      );
    };

    return (
      <div className="references-table-container">
        <p className="results-count">
          Showing {startIdx + 1}-{Math.min(endIdx, sortedRefs.length)} of {sortedRefs.length} references
        </p>
        {renderPagination()}
        <table className="data-table references-table literature-table">
          <thead>
            <tr>
              <th style={{ width: '50%' }}>Reference</th>
              <th style={{ width: '15%' }}>Species</th>
              <th style={{ width: '35%' }}>Other Genes Addressed</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRefs.map((ref, idx) => {
              const otherGenesInRef = ref.other_genes
                ? ref.other_genes.filter(g => g !== displayName)
                : [];

              return (
                <tr key={idx} className={idx % 2 === 0 ? '' : 'alt-row'}>
                  <td>
                    <div className="ref-citation">{renderCitationLine(ref)}</div>
                    {renderLinksBelow(ref)}
                  </td>
                  <td className="species-cell">
                    {ref.species || currentOrganism?.split(' ').slice(0, 2).join(' ') || 'C. albicans'}
                  </td>
                  <td className="other-genes-cell">
                    {otherGenesInRef.length > 0 ? (
                      <div className="other-genes-list">
                        {otherGenesInRef.slice(0, 10).map((gene, gIdx) => (
                          <span key={gIdx}>
                            <Link to={`/locus/${gene}`}>{gene}</Link>
                            {gIdx < Math.min(otherGenesInRef.length, 10) - 1 && ', '}
                          </span>
                        ))}
                        {otherGenesInRef.length > 10 && (
                          <span className="more-genes">
                            ... and {otherGenesInRef.length - 10} more
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="no-other-genes">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {renderPagination()}
      </div>
    );
  };

  // Render topic view
  const renderTopicView = () => {
    const topicRefs = getRefsByTopic(selectedTopic);
    let topicTitle = selectedTopic;

    if (selectedTopic === 'curated') {
      topicTitle = 'Curated References';
    } else if (selectedTopic === 'Not yet curated') {
      topicTitle = 'References Not Yet Curated';
    } else if (selectedTopic === 'High Priority') {
      topicTitle = 'References for Curation';
    }

    return (
      <div className="literature-topic-view">
        <h4>
          <span className="gene-name-highlight">{displayName}</span>
          {' '}- {topicTitle}
        </h4>
        {renderReferencesTable(topicRefs)}
      </div>
    );
  };

  // Render grouped by year view
  const renderGroupedByYear = () => {
    const groupedRefs = groupByYear(refs);

    return (
      <div className="references-by-year">
        {groupedRefs.map(([year, yearRefs]) => {
          const yearKey = `${currentOrganism}-${year}`;
          const isCollapsed = collapsedYears[yearKey];

          return (
            <div key={year} className="year-group">
              <div className="year-header" onClick={() => toggleYear(yearKey)}>
                <span className="collapse-icon">{isCollapsed ? '▶' : '▼'}</span>
                <span className="year-label">{year}</span>
                <span className="count-badge">{yearRefs.length}</span>
              </div>

              {!isCollapsed && (
                <div className="year-references">
                  {yearRefs.map((ref, idx) => (
                    <div key={idx} className="reference-card">
                      <div className="ref-citation">{renderCitationLine(ref)}</div>
                      {renderLinksBelow(ref)}
                      {ref?.title && <div className="ref-title-block">"{ref.title}"</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Main content based on view mode
  const renderMainContent = () => {
    if (viewMode === 'topic' && selectedTopic) {
      return renderTopicView();
    }

    if (viewMode === 'grouped') {
      return renderGroupedByYear();
    }

    // Default summary view
    return renderSummary();
  };

  return (
    <div className="references-details literature-guide">
      <OrganismSelector
        organisms={organismNames}
        selectedOrganism={currentOrganism}
        onOrganismChange={setCurrentOrganism}
        dataType="literature"
      />

      <div className="literature-intro">
        <p>
          This page displays all the papers associated with{' '}
          <em>{currentOrganism}</em> {displayName} in CGD, along with all the
          literature topics those papers address. Click on a topic on the left
          to see the papers that address it.
        </p>
      </div>

      <div className="literature-layout">
        {renderTopicsSidebar()}
        <div className="literature-main">
          {renderMainContent()}
        </div>
      </div>
    </div>
  );
}

export default References;
