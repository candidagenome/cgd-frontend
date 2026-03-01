import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import './LocusComponents.css';
import OrganismSelector, { getDefaultOrganism } from './OrganismSelector';
import { renderCitationItem } from '../../utils/formatCitation.jsx';

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

function References({ data, loading, error, selectedOrganism, onOrganismChange, locusName }) {
  const [collapsedYears, setCollapsedYears] = useState({});
  const [viewMode, setViewMode] = useState('summary'); // 'summary', 'list', 'grouped', 'topic'
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [localSelectedOrganism, setLocalSelectedOrganism] = useState(null);
  const [expandedGeneRows, setExpandedGeneRows] = useState(new Set()); // Track which rows have expanded gene lists

  // Use either the prop or local state for organism selection
  const currentOrganism = selectedOrganism || localSelectedOrganism;
  const setCurrentOrganism = onOrganismChange || setLocalSelectedOrganism;

  const organismNames = data?.results ? Object.keys(data.results) : [];

  // Get data for current organism (computed early for hooks)
  const orgData = currentOrganism && data?.results ? data.results[currentOrganism] : null;
  const refs = orgData?.references || [];
  const displayName = orgData?.locus_display_name || locusName || 'this locus';

  useEffect(() => {
    if (organismNames.length > 0 && !currentOrganism) {
      setCurrentOrganism(getDefaultOrganism(organismNames));
    }
  }, [organismNames, currentOrganism, setCurrentOrganism]);

  // Toggle expanded gene list for a row
  const toggleGeneRowExpanded = useCallback((rowId) => {
    setExpandedGeneRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(rowId)) {
        newSet.delete(rowId);
      } else {
        newSet.add(rowId);
      }
      return newSet;
    });
  }, []);

  // AG Grid column definitions for references table
  const columnDefs = useMemo(() => [
    {
      headerName: 'Reference',
      field: 'reference',
      flex: 2,
      minWidth: 300,
      autoHeight: true,
      wrapText: true,
      sortable: true,
      filter: true,
      valueGetter: (params) => {
        const ref = params.data;
        const authors = ref.authors || '';
        const year = ref.year || '';
        const title = ref.title || '';
        return `${authors} (${year}) ${title}`;
      },
      cellRenderer: (params) => {
        return renderCitationItem(params.data, { itemClassName: 'ref-citation' });
      },
    },
    {
      headerName: 'Species',
      field: 'species',
      flex: 0.5,
      minWidth: 100,
      sortable: true,
      filter: true,
      valueGetter: (params) => {
        return params.data.species || currentOrganism?.split(' ').slice(0, 2).join(' ') || 'C. albicans';
      },
    },
    {
      headerName: 'Other Genes Addressed',
      field: 'other_genes',
      flex: 1,
      minWidth: 200,
      autoHeight: true,
      wrapText: true,
      sortable: true,
      filter: true,
      valueGetter: (params) => {
        const otherGenesInRef = params.data.other_genes
          ? params.data.other_genes.filter(g => g !== displayName)
          : [];
        return otherGenesInRef.join(', ') || '-';
      },
      cellRenderer: (params) => {
        const otherGenesInRef = params.data.other_genes
          ? params.data.other_genes.filter(g => g !== displayName)
          : [];

        if (otherGenesInRef.length === 0) {
          return <span className="no-other-genes">-</span>;
        }

        const rowId = params.data.pubmed_id || params.rowIndex;
        const isExpanded = expandedGeneRows.has(rowId);
        const genesToShow = isExpanded ? otherGenesInRef : otherGenesInRef.slice(0, 10);
        const hasMore = otherGenesInRef.length > 10;

        return (
          <div className="other-genes-list">
            {genesToShow.map((gene, gIdx) => (
              <span key={gIdx}>
                <Link to={`/locus/${gene}`}>{gene}</Link>
                {gIdx < genesToShow.length - 1 && ', '}
              </span>
            ))}
            {hasMore && !isExpanded && (
              <span
                className="more-genes-link"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleGeneRowExpanded(rowId);
                }}
                role="button"
                tabIndex={0}
              >
                ... and {otherGenesInRef.length - 10} more
              </span>
            )}
            {hasMore && isExpanded && (
              <span
                className="less-genes-link"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleGeneRowExpanded(rowId);
                }}
                role="button"
                tabIndex={0}
              >
                {' '}[show less]
              </span>
            )}
          </div>
        );
      },
    },
  ], [displayName, currentOrganism, expandedGeneRows, toggleGeneRowExpanded]);

  // Default column properties
  const defaultColDef = useMemo(() => ({
    sortable: true,
    filter: true,
    resizable: true,
  }), []);

  // Grid ready callback
  const onGridReady = useCallback((params) => {
    params.api.sizeColumnsToFit();
  }, []);

  // Download references as TSV
  const handleDownloadTSV = useCallback((refsToDownload) => {
    if (!refsToDownload || refsToDownload.length === 0) return;

    // Build TSV content
    const headers = ['Authors', 'Year', 'Title', 'Journal', 'PubMed ID', 'Species', 'Other Genes'];
    const rows = refsToDownload.map(ref => {
      const otherGenesInRef = ref.other_genes
        ? ref.other_genes.filter(g => g !== displayName)
        : [];
      const species = ref.species || currentOrganism?.split(' ').slice(0, 2).join(' ') || 'C. albicans';

      return [
        ref.authors || '',
        ref.year || '',
        ref.title || '',
        ref.journal || '',
        ref.pubmed_id || '',
        species,
        otherGenesInRef.join(', '),
      ].map(field => `"${String(field).replace(/"/g, '""')}"`).join('\t');
    });

    const tsvContent = [headers.join('\t'), ...rows].join('\n');
    const blob = new Blob([tsvContent], { type: 'text/tab-separated-values;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${displayName}_references.tsv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [displayName, currentOrganism]);

  if (loading) return <div className="loading">Loading literature...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!data || !data.results) return <div className="no-data">No literature data available</div>;

  if (organismNames.length === 0) {
    return <div className="no-data">No references found</div>;
  }

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

  // Build PubMed search URL
  const buildPubMedUrl = (expanded = false) => {
    const geneName = encodeURIComponent(displayName);
    const organism = encodeURIComponent('Candida albicans');
    const field = expanded ? 'ALL' : 'TEXT:noexp';
    return `https://pubmed.ncbi.nlm.nih.gov/?term=(${geneName}[${field}]+AND+${organism}[ALL])`;
  };

  // Render topic entry in sidebar
  const renderTopicEntry = (topic, displayText, linkTopic, alwaysShow = false) => {
    const isActive = selectedTopic === (linkTopic || topic);
    const topicRefs = getRefsByTopic(linkTopic || topic);
    const count = topicRefs.length;

    // Always show Literature Curation Summary and entries marked alwaysShow
    const isAlwaysVisible = topic === 'Literature Curation Summary' || alwaysShow;
    if (count === 0 && !isAlwaysVisible) {
      return null;
    }

    return (
      <div
        key={topic}
        className={`topic-entry ${isActive ? 'active' : ''}`}
        onClick={() => {
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
          {renderTopicEntry('References Not Yet Curated', 'References Not Yet Curated', 'Not yet curated', true)}
          {renderTopicEntry('References for Curation', 'References for Curation', 'High Priority', true)}
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

  // Render references table with AgGrid
  const renderReferencesTable = (refsToShow) => {
    if (!refsToShow || refsToShow.length === 0) {
      return <p className="no-data">No references found</p>;
    }

    // Sort by year descending
    const sortedRefs = [...refsToShow].sort((a, b) => (b?.year || 0) - (a?.year || 0));

    return (
      <div className="references-table-container">
        <div className="references-table-header">
          <p className="results-count">
            {sortedRefs.length} reference{sortedRefs.length !== 1 ? 's' : ''}
          </p>
          <button
            className="download-btn"
            onClick={() => handleDownloadTSV(sortedRefs)}
            title="Download as TSV"
          >
            Download TSV
          </button>
        </div>
        <div className="references-grid-wrapper ag-theme-alpine">
          <AgGridReact
            rowData={sortedRefs}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            domLayout="autoHeight"
            pagination={sortedRefs.length > 10}
            paginationPageSize={10}
            paginationPageSizeSelector={[10, 25, 50]}
            onGridReady={onGridReady}
            suppressCellFocus={true}
          />
        </div>
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
                      {renderCitationItem(ref, { itemClassName: 'ref-citation' })}
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
