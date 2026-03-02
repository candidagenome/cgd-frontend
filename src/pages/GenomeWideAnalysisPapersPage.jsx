import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import referenceApi from '../api/referenceApi';
import { renderCitationItem } from '../utils/formatCitation';
import './GenomeWideAnalysisPapersPage.css';

function GenomeWideAnalysisPapersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentTopic = searchParams.get('topic') || null;

  useEffect(() => {
    const fetchAllPages = async () => {
      try {
        setLoading(true);
        // Fetch first page to get total count
        const firstPage = await referenceApi.getGenomeWideAnalysisPapers(
          currentTopic,
          1,
          100
        );

        let allReferences = [...(firstPage.references || [])];

        // Fetch remaining pages if needed
        if (firstPage.total_pages > 1) {
          const pagePromises = [];
          for (let p = 2; p <= firstPage.total_pages; p++) {
            pagePromises.push(
              referenceApi.getGenomeWideAnalysisPapers(currentTopic, p, 100)
            );
          }
          const pages = await Promise.all(pagePromises);
          for (const page of pages) {
            allReferences = allReferences.concat(page.references || []);
          }
        }

        setData({
          ...firstPage,
          references: allReferences,
        });
      } catch (err) {
        // Handle FastAPI validation errors (array of objects) or string errors
        let errorMsg = 'Failed to load genome-wide analysis papers';
        const detail = err.response?.data?.detail;
        if (typeof detail === 'string') {
          errorMsg = detail;
        } else if (Array.isArray(detail) && detail.length > 0) {
          errorMsg = detail.map((d) => d.msg || JSON.stringify(d)).join('; ');
        } else if (err.message) {
          errorMsg = err.message;
        }
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchAllPages();
  }, [currentTopic]);

  const handleTopicClick = (topic) => {
    const params = new URLSearchParams();
    if (topic) params.set('topic', topic);
    setSearchParams(params);
  };

  const formatSpecies = (species) => {
    if (!species || species.length === 0) return '-';
    return species.map((s) => {
      const match = s.match(/^(\w)\w*\s+(.+)$/);
      if (match) return `${match[1]}. ${match[2]}`;
      return s;
    }).join(', ');
  };

  // AG Grid column definitions - Literature Topic first, then Reference
  const columnDefs = useMemo(() => [
    {
      headerName: 'Literature Topic',
      field: 'topics',
      flex: 1,
      minWidth: 180,
      valueGetter: (params) => params.data.topics?.join(', ') || '-',
      filter: 'agTextColumnFilter',
    },
    {
      headerName: 'Reference',
      field: 'citation',
      flex: 2,
      minWidth: 300,
      wrapText: true,
      cellStyle: { whiteSpace: 'normal', lineHeight: '1.5' },
      cellRenderer: (params) => {
        const paper = params.data;
        return (
          <div className="reference-cell">
            {renderCitationItem(paper, { itemClassName: '' })}
          </div>
        );
      },
      filter: 'agTextColumnFilter',
      filterParams: {
        filterOptions: ['contains'],
        defaultOption: 'contains',
      },
    },
    {
      headerName: 'Species',
      field: 'species',
      flex: 1,
      minWidth: 150,
      valueGetter: (params) => formatSpecies(params.data.species),
      filter: 'agTextColumnFilter',
    },
    {
      headerName: 'Genes Addressed',
      field: 'genes',
      flex: 1.5,
      minWidth: 200,
      wrapText: true,
      cellStyle: { whiteSpace: 'normal', lineHeight: '1.5' },
      cellRenderer: (params) => {
        const genes = params.data.genes || [];
        if (genes.length === 0) return '-';
        return (
          <div className="genes-cell">
            {genes.map((g, idx) => (
              <span key={idx}>
                {idx > 0 && ' '}
                <Link to={`/locus/${g.feature_name}`}>
                  {g.gene_name || g.feature_name}
                </Link>
              </span>
            ))}
          </div>
        );
      },
      valueGetter: (params) => {
        const genes = params.data.genes || [];
        return genes.map(g => g.gene_name || g.feature_name).join(', ');
      },
      filter: 'agTextColumnFilter',
    },
  ], []);

  const defaultColDef = useMemo(() => ({
    sortable: true,
    filter: true,
    resizable: true,
    floatingFilter: true,
  }), []);

  const renderTopicFilters = () => {
    if (!data?.available_topics) return null;

    const topics = data.available_topics;
    const midpoint = Math.ceil(topics.length / 2);
    const leftTopics = topics.slice(0, midpoint);
    const rightTopics = topics.slice(midpoint);

    return (
      <div className="topic-filters">
        <p className="filter-instruction">Click on a topic to see papers for that topic:</p>
        <div className="topic-columns">
          <div className="topic-column">
            {leftTopics.map((topic) => (
              <button
                key={topic}
                className={`topic-btn ${currentTopic === topic ? 'selected' : ''}`}
                onClick={() => handleTopicClick(topic)}
              >
                {topic}
              </button>
            ))}
          </div>
          <div className="topic-column">
            {rightTopics.map((topic) => (
              <button
                key={topic}
                className={`topic-btn ${currentTopic === topic ? 'selected' : ''}`}
                onClick={() => handleTopicClick(topic)}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
        {currentTopic && (
          <button className="clear-filter-btn" onClick={() => handleTopicClick(null)}>
            Show all topics
          </button>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="genome-wide-papers-page">
        <div className="loading">Loading genome-wide analysis papers...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="genome-wide-papers-page">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="genome-wide-papers-page">
      <header className="page-header">
        <h1>Genome-wide Analysis Papers</h1>
      </header>

      {renderTopicFilters()}

      {data?.references?.length > 0 ? (
        <div className="papers-grid-wrapper ag-theme-alpine">
          <AgGridReact
            rowData={data.references}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            domLayout="autoHeight"
            pagination={true}
            paginationPageSize={10}
            paginationPageSizeSelector={[10, 25, 50, 100]}
            suppressCellFocus={true}
            rowHeight={80}
            suppressRowVirtualisation={true}
          />
        </div>
      ) : (
        <div className="no-papers">
          <p>No genome-wide analysis papers found.</p>
        </div>
      )}

    </div>
  );
}

export default GenomeWideAnalysisPapersPage;
