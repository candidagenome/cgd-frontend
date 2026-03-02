import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import literatureTopicApi from '../api/literatureTopicApi';
import { renderCitationItem } from '../utils/formatCitation.jsx';
import './LiteratureTopicSearchPage.css';

// Abbreviate organism name
const getOrganismAbbrev = (organismName) => {
  if (!organismName) return '';
  const parts = organismName.split(' ');
  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}. ${parts[1]}`;
  }
  return organismName;
};

// Format locus display name
const formatLocusName = (gene) => {
  if (gene.gene_name && gene.gene_name !== gene.feature_name) {
    return `${gene.gene_name}/${gene.feature_name}`;
  }
  return gene.feature_name;
};

// Recursive component to render topic tree
function TopicTreeNode({ node, selectedTopics, onToggle, level = 0 }) {
  const [expanded, setExpanded] = useState(level === 0); // Expand first level by default
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedTopics.has(node.cv_term_no);

  return (
    <div className="topic-tree-node" style={{ marginLeft: level * 20 }}>
      <div className="topic-tree-item">
        {hasChildren && (
          <button
            className="topic-tree-toggle"
            onClick={() => setExpanded(!expanded)}
            type="button"
          >
            {expanded ? '−' : '+'}
          </button>
        )}
        {!hasChildren && <span className="topic-tree-spacer" />}
        <label className="topic-tree-label">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggle(node.cv_term_no, node.term)}
          />
          <span className="topic-term">{node.term}</span>
          {node.count > 0 && <span className="topic-count">({node.count})</span>}
        </label>
      </div>
      {hasChildren && expanded && (
        <div className="topic-tree-children">
          {node.children.map((child) => (
            <TopicTreeNode
              key={child.cv_term_no}
              node={child}
              selectedTopics={selectedTopics}
              onToggle={onToggle}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function LiteratureTopicSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Topic tree state
  const [topicTree, setTopicTree] = useState([]);
  const [topicTreeLoading, setTopicTreeLoading] = useState(true);
  const [topicTreeError, setTopicTreeError] = useState(null);
  const [showTopicSelector, setShowTopicSelector] = useState(false);

  // Selected topics: Map of cv_term_no -> term name
  const [selectedTopics, setSelectedTopics] = useState(new Map());

  // Results state
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Load topic tree on mount
  useEffect(() => {
    const loadTopicTree = async () => {
      try {
        setTopicTreeLoading(true);
        const response = await literatureTopicApi.getTopicTree();
        setTopicTree(response.tree || []);
      } catch (err) {
        setTopicTreeError('Failed to load topic tree');
        console.error(err);
      } finally {
        setTopicTreeLoading(false);
      }
    };
    loadTopicTree();
  }, []);

  // Handle URL params on load
  useEffect(() => {
    const topicsParam = searchParams.get('topics');
    if (topicsParam && topicTree.length > 0) {
      // Parse topic IDs from URL
      const topicIds = topicsParam.split(',').map(Number).filter(Boolean);
      if (topicIds.length > 0) {
        // Build a map of cv_term_no -> term name from the tree
        const findTopicNames = (nodes, map) => {
          for (const node of nodes) {
            map.set(node.cv_term_no, node.term);
            if (node.children && node.children.length > 0) {
              findTopicNames(node.children, map);
            }
          }
        };
        const allTopics = new Map();
        findTopicNames(topicTree, allTopics);

        // Set selected topics
        const newSelected = new Map();
        for (const id of topicIds) {
          if (allTopics.has(id)) {
            newSelected.set(id, allTopics.get(id));
          }
        }
        setSelectedTopics(newSelected);

        // Perform search
        if (newSelected.size > 0) {
          performSearch([...newSelected.keys()]);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicTree]);

  const toggleTopic = useCallback((cvTermNo, termName) => {
    setSelectedTopics((prev) => {
      const newMap = new Map(prev);
      if (newMap.has(cvTermNo)) {
        newMap.delete(cvTermNo);
      } else {
        newMap.set(cvTermNo, termName);
      }
      return newMap;
    });
  }, []);

  const removeTopic = useCallback((cvTermNo) => {
    setSelectedTopics((prev) => {
      const newMap = new Map(prev);
      newMap.delete(cvTermNo);
      return newMap;
    });
  }, []);

  const clearAllTopics = useCallback(() => {
    setSelectedTopics(new Map());
  }, []);

  const performSearch = async (topicIds) => {
    if (!topicIds || topicIds.length === 0) {
      setError('Please select at least one topic');
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const response = await literatureTopicApi.searchByTopics(topicIds);
      setData(response);

      // Update URL
      setSearchParams({ topics: topicIds.join(',') });
    } catch (err) {
      let errorMsg = 'Failed to search literature topics';
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        errorMsg = detail;
      } else if (err.message) {
        errorMsg = err.message;
      }
      setError(errorMsg);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const topicIds = [...selectedTopics.keys()];
    if (topicIds.length === 0) {
      setError('Please select at least one topic');
      return;
    }
    // Open results in a new tab
    const url = `/literature-topic-search?topics=${topicIds.join(',')}`;
    window.open(url, 'lit');
  };

  // Check if we're in results mode (URL has topics param)
  const isResultsMode = searchParams.has('topics');

  // AG Grid column definitions - Reference=40%, Associated Genes=60%
  const columnDefs = useMemo(() => [
    {
      headerName: 'Reference',
      field: 'reference',
      flex: 4,  // 40%
      minWidth: 250,
      wrapText: true,
      cellStyle: { whiteSpace: 'normal', lineHeight: '1.4' },
      cellRenderer: (params) => {
        const ref = params.data;
        if (!ref) return '-';
        return (
          <div className="reference-cell">
            {renderCitationItem(ref, { itemClassName: 'reference-item' })}
          </div>
        );
      },
    },
    {
      headerName: 'Associated Genes',
      field: 'genes',
      flex: 6,  // 60%
      minWidth: 400,
      wrapText: true,
      cellStyle: { whiteSpace: 'normal', lineHeight: '1.4' },
      cellRenderer: (params) => {
        const genes = params.data.genes || [];
        if (genes.length === 0) return <span className="muted">-</span>;

        // Show first 10 genes, with "and N more" if there are more
        const displayGenes = genes.slice(0, 10);
        const remaining = genes.length - 10;

        return (
          <div className="genes-cell">
            {displayGenes.map((gene, idx) => (
              <span key={gene.feature_no}>
                {idx > 0 && ', '}
                <Link to={`/locus/${gene.feature_name}`} className="gene-link">
                  {formatLocusName(gene)}
                </Link>
                {gene.organism && (
                  <span className="gene-organism"> ({getOrganismAbbrev(gene.organism)})</span>
                )}
              </span>
            ))}
            {remaining > 0 && (
              <span className="more-genes"> and {remaining} more</span>
            )}
          </div>
        );
      },
    },
  ], []);

  // Default column properties
  const defaultColDef = useMemo(() => ({
    sortable: true,
    filter: false,
    resizable: true,
    wrapText: true,
  }), []);

  // Calculate row height based on content
  const getRowHeight = useCallback((params) => {
    const minHeight = 60;
    const lineHeight = 22;

    // Estimate citation lines (approx 80 chars per line in Reference column)
    const citation = params.data.citation || '';
    const citationLines = Math.ceil(citation.length / 80) + 2; // +2 for PMID and links

    // Estimate gene lines (approx 3 genes per line)
    const genes = params.data.genes || [];
    const geneLines = Math.ceil(Math.min(genes.length, 10) / 3) + (genes.length > 10 ? 1 : 0);

    const maxLines = Math.max(citationLines, geneLines);
    return Math.max(minHeight, maxLines * lineHeight + 20);
  }, []);

  // Transform data into grid rows - memoized per topic to prevent re-renders
  const topicRowsMap = useMemo(() => {
    if (!data || !data.results) return new Map();

    const map = new Map();
    for (const topicResult of data.results) {
      const rows = topicResult.references.map((ref) => ({
        ...ref,
        genes: ref.genes || [],
      }));
      map.set(topicResult.cv_term_no, rows);
    }
    return map;
  }, [data]);

  // Grid ready callback
  const onGridReady = useCallback((params) => {
    params.api.sizeColumnsToFit();
  }, []);

  const handleDownload = () => {
    if (!data || !data.results || data.results.length === 0) return;

    // CSV headers
    const headers = ['Topic', 'Reference', 'PubMed ID', 'Year', 'Genes'];

    // Convert data to CSV rows
    const rows = [];
    for (const topicResult of data.results) {
      for (const ref of topicResult.references) {
        const geneList = (ref.genes || [])
          .map(g => formatLocusName(g))
          .join('; ');

        rows.push([
          topicResult.topic,
          ref.citation || '',
          ref.pubmed || '',
          ref.year || '',
          geneList,
        ]);
      }
    }

    // Escape CSV values
    const escapeCSV = (val) => {
      const str = String(val || '');
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    // Build CSV content
    const csvContent = [
      headers.map(escapeCSV).join(','),
      ...rows.map(row => row.map(escapeCSV).join(','))
    ].join('\n');

    // Trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'literature_topic_search_results.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderResultsSummary = () => {
    if (!data) return null;

    return (
      <div className="results-summary">
        <div className="results-summary-row">
          <div className="results-summary-left">
            <div className="results-count">
              Found <strong>{data.total_references}</strong> reference{data.total_references !== 1 ? 's' : ''}{' '}
              and <strong>{data.total_genes}</strong> associated gene{data.total_genes !== 1 ? 's' : ''}
            </div>
            <div className="query-summary">
              Selected topics: {data.query.topic_names.join(', ')}
            </div>
          </div>
          {topicRowsMap.size > 0 && (
            <button type="button" className="btn-download" onClick={handleDownload}>
              Download CSV
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderResultsTable = () => {
    if (!data || !data.results || data.results.length === 0) {
      return (
        <div className="no-results">
          <p>No references found for the selected topics.</p>
          <p>Try selecting different topics from the topic tree.</p>
        </div>
      );
    }

    // Render one table per topic
    return (
      <div className="results-by-topic">
        {data.results.map((topicResult) => {
          const topicRows = topicRowsMap.get(topicResult.cv_term_no) || [];

          return (
            <div key={topicResult.cv_term_no} className="topic-section">
              <h3 className="topic-header">{topicResult.topic}</h3>
              <div className="results-grid-wrapper ag-theme-alpine" style={{ width: '100%' }}>
                <AgGridReact
                  rowData={topicRows}
                  columnDefs={columnDefs}
                  defaultColDef={defaultColDef}
                  domLayout="autoHeight"
                  pagination={true}
                  paginationPageSize={10}
                  paginationPageSizeSelector={[10, 25, 50, 100]}
                  onGridReady={onGridReady}
                  suppressCellFocus={true}
                  getRowHeight={getRowHeight}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Results mode: show only results with title
  if (isResultsMode) {
    return (
      <div className="literature-topic-search-page">
        <header className="page-header">
          <h1>Literature Topic Search Results</h1>
          <p className="subtitle">References and genes associated with selected topics</p>
        </header>

        <nav className="page-nav">
          <Link to="/literature-topic-search">New Search</Link>
          {' | '}
          <Link to="/literature">Literature Guide</Link>
          {' | '}
          <Link to="/help/literature-topics">Help</Link>
        </nav>

        <div className="divider" />

        {loading && (
          <div className="loading-section">
            <div className="loading-spinner"></div>
            <p>Searching...</p>
          </div>
        )}

        {error && (
          <div className="error-section">
            <div className="error-icon">&#9888;</div>
            <p className="error-message">{error}</p>
          </div>
        )}

        {!loading && !error && hasSearched && (
          <>
            {renderResultsSummary()}
            {renderResultsTable()}
          </>
        )}

        <div className="divider" />

        <div className="page-footer">
          <p>
            <strong>Note:</strong> Literature topics are assigned by CGD curators to indicate
            the subject matter of each reference. Use this search to find papers and genes
            associated with specific research topics.
          </p>
        </div>
      </div>
    );
  }

  // Search mode: show form
  return (
    <div className="literature-topic-search-page">
      <header className="page-header">
        <h1>Literature Topic Search</h1>
        <p className="subtitle">Search references by literature curation topics</p>
      </header>

      <nav className="page-nav">
        <Link to="/literature">Literature Guide</Link>
        {' | '}
        <Link to="/help/literature-topics">Help</Link>
      </nav>

      <div className="divider" />

      {/* Topic Selection Form */}
      <form onSubmit={handleSubmit} className="topic-search-form">
        <div className="form-section">
          <h3>Select Topics</h3>
          <p className="section-help">
            Select one or more literature topics to search for associated references and genes.
          </p>

          {/* Selected Topics Chips */}
          {selectedTopics.size > 0 && (
            <div className="selected-topics">
              <div className="selected-topics-header">
                <span>Selected Topics ({selectedTopics.size}):</span>
                <button
                  type="button"
                  className="clear-all-btn"
                  onClick={clearAllTopics}
                >
                  Clear All
                </button>
              </div>
              <div className="selected-topics-chips">
                {[...selectedTopics.entries()].map(([cvTermNo, termName]) => (
                  <span key={cvTermNo} className="topic-chip">
                    {termName}
                    <button
                      type="button"
                      className="chip-remove"
                      onClick={() => removeTopic(cvTermNo)}
                      aria-label={`Remove ${termName}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Topic Selector Button */}
          <button
            type="button"
            className="toggle-selector-btn"
            onClick={() => setShowTopicSelector(!showTopicSelector)}
          >
            {showTopicSelector ? 'Hide Topic Tree' : 'Show Topic Tree'}
          </button>

          {/* Topic Tree */}
          {showTopicSelector && (
            <div className="topic-selector">
              {topicTreeLoading && (
                <div className="loading-inline">Loading topics...</div>
              )}
              {topicTreeError && (
                <div className="error-inline">{topicTreeError}</div>
              )}
              {!topicTreeLoading && !topicTreeError && topicTree.length > 0 && (
                <div className="topic-tree">
                  {topicTree.map((node) => (
                    <TopicTreeNode
                      key={node.cv_term_no}
                      node={node}
                      selectedTopics={new Set(selectedTopics.keys())}
                      onToggle={toggleTopic}
                    />
                  ))}
                </div>
              )}
              {!topicTreeLoading && !topicTreeError && topicTree.length === 0 && (
                <div className="no-topics">No literature topics found.</div>
              )}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="submit-section">
          <button
            type="submit"
            className="submit-btn"
            disabled={selectedTopics.size === 0}
          >
            Search
          </button>
        </div>
      </form>

      {error && (
        <div className="error-section">
          <div className="error-icon">&#9888;</div>
          <p className="error-message">{error}</p>
        </div>
      )}

      <div className="divider" />

      <div className="page-footer">
        <p>
          <strong>Note:</strong> Literature topics are assigned by CGD curators to indicate
          the subject matter of each reference. Use this search to find papers and genes
          associated with specific research topics.
        </p>
      </div>
    </div>
  );
}

export default LiteratureTopicSearchPage;
