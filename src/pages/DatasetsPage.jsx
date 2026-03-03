import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import referenceApi from '../api/referenceApi';
import './InfoPages.css';
import './DatasetsPage.css';

const DatasetsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quickFilter, setQuickFilter] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await referenceApi.getReferencesWithDatasets();
        setData(response);
      } catch (err) {
        setError('Failed to load datasets. Please try again later.');
        console.error('Error fetching datasets:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Group references by year
  const groupByYear = (references) => {
    const grouped = {};
    for (const ref of references) {
      if (!grouped[ref.year]) {
        grouped[ref.year] = [];
      }
      grouped[ref.year].push(ref);
    }
    return grouped;
  };

  // Cell renderer for citation with links below
  const CitationCellRenderer = (params) => {
    const ref = params.data;
    return (
      <div className="citation-cell">
        <div
          className="citation-text"
          dangerouslySetInnerHTML={{ __html: ref.citation }}
        />
        <div className="citation-links">
          {ref.links.map((link, idx) => (
            <span key={idx} className="citation-link">
              {link.link_type === 'internal' ? (
                <Link to={link.url}>{link.name}</Link>
              ) : (
                <a href={link.url} target="_blank" rel="noopener noreferrer">
                  {link.name}
                </a>
              )}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const columnDefs = useMemo(() => [
    {
      headerName: 'Citation',
      field: 'citation',
      flex: 1,
      minWidth: 400,
      wrapText: true,
      cellStyle: { whiteSpace: 'normal', lineHeight: '1.4' },
      cellRenderer: CitationCellRenderer,
    },
  ], []);

  const defaultColDef = useMemo(() => ({
    sortable: true,
    resizable: true,
  }), []);

  // Filter references by quick filter text
  const getFilteredRefs = useCallback((refs) => {
    if (!quickFilter.trim()) return refs;
    const searchLower = quickFilter.toLowerCase().trim();
    return refs.filter((ref) => {
      const searchFields = [ref.citation, ref.year?.toString()];
      return searchFields.some((field) => field && String(field).toLowerCase().includes(searchLower));
    });
  }, [quickFilter]);

  // Calculate row height based on citation content
  const getRowHeight = useCallback((params) => {
    const minHeight = 75;
    const lineHeight = 20;

    // Estimate citation lines
    const citation = params.data.citation || '';
    const citationLines = Math.ceil(citation.length / 100) + 2; // +2 for links

    return Math.max(minHeight, citationLines * lineHeight + 15);
  }, []);

  if (loading) {
    return (
      <div className="info-page">
        <div className="info-page-content">
          <h1>Datasets archived at CGD</h1>
          <hr />
          <p>Loading datasets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="info-page">
        <div className="info-page-content">
          <h1>Datasets archived at CGD</h1>
          <hr />
          <p className="error-message">{error}</p>
        </div>
      </div>
    );
  }

  const years = data?.years || [];
  const groupedRefs = data ? groupByYear(data.references) : {};

  return (
    <div className="info-page datasets-page">
      <div className="info-page-content">
        <h1>Datasets archived at CGD</h1>
        <hr />

        <p className="datasets-intro">
          CGD collects only published and freely available datasets.<br />
          Contact CGD Curators if you want to contribute your results.
        </p>

        <p>
          <a
            href="http://www.candidagenome.org/download/systematic_results/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Browse the archive directory here
          </a>
        </p>

        {years.length > 0 && (
          <div className="year-nav">
            {years.map((year, idx) => (
              <span key={year}>
                {idx > 0 && ' | '}
                <a href={`#year-${year}`}>{year}</a>
              </span>
            ))}
          </div>
        )}

        <p className="datasets-note">
          <span className="note-label">Note:</span> the strains used in some of the experiments
          listed below may have chromosomal abnormalities such as aneuploidy, which introduces
          chromosome-specific bias into microarray and other results. For more details, see
          Arbour et al. (2009).
        </p>

        {/* Quick Filter Box */}
        <div className="filter-controls" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 15px', background: '#f8f9fa', border: '1px solid #e0e0e0', borderRadius: '4px', marginBottom: '10px' }}>
          <label htmlFor="quick-filter" style={{ fontWeight: 500, color: '#333', whiteSpace: 'nowrap' }}>Filter results: </label>
          <input
            type="text"
            id="quick-filter"
            value={quickFilter}
            onChange={(e) => setQuickFilter(e.target.value)}
            placeholder="Type to filter..."
            style={{ padding: '6px 10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px', width: '200px' }}
          />
          {quickFilter && (
            <button
              type="button"
              onClick={() => setQuickFilter('')}
              title="Clear filter"
              style={{ padding: '4px 8px', border: 'none', background: '#e0e0e0', color: '#666', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', borderRadius: '4px', lineHeight: 1 }}
            >
              ×
            </button>
          )}
        </div>

        {years.map((year) => {
          const yearRefs = getFilteredRefs(groupedRefs[year] || []);
          if (yearRefs.length === 0 && quickFilter) return null;
          return (
            <div key={year} className="year-section" id={`year-${year}`}>
              <h3>{year}</h3>
              <div className="datasets-grid ag-theme-alpine">
                <AgGridReact
                  rowData={yearRefs}
                  columnDefs={columnDefs}
                  defaultColDef={defaultColDef}
                  domLayout="autoHeight"
                  pagination={true}
                  paginationPageSize={10}
                  paginationPageSizeSelector={[10, 25, 50, 100]}
                  suppressCellFocus={true}
                  getRowHeight={getRowHeight}
                />
              </div>
            </div>
          );
        })}

        {data && data.total_count === 0 && (
          <p>No datasets found.</p>
        )}
      </div>
    </div>
  );
};

export default DatasetsPage;
