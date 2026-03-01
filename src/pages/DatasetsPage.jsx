import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import referenceApi from '../api/referenceApi';
import './InfoPages.css';
import './DatasetsPage.css';

const DatasetsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      autoHeight: true,
      wrapText: true,
      cellRenderer: CitationCellRenderer,
      filter: 'agTextColumnFilter',
      filterParams: {
        filterOptions: ['contains', 'startsWith'],
        defaultOption: 'contains',
      },
    },
  ], []);

  const defaultColDef = useMemo(() => ({
    sortable: true,
    filter: true,
    resizable: true,
    floatingFilter: true,
  }), []);

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

        {years.map((year) => (
          <div key={year} className="year-section" id={`year-${year}`}>
            <h3>{year}</h3>
            <div className="datasets-grid ag-theme-alpine">
              <AgGridReact
                rowData={groupedRefs[year] || []}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                domLayout="autoHeight"
                pagination={true}
                paginationPageSize={10}
                paginationPageSizeSelector={[10, 25, 50, 100]}
                suppressCellFocus={true}
              />
            </div>
          </div>
        ))}

        {data && data.total_count === 0 && (
          <p>No datasets found.</p>
        )}
      </div>
    </div>
  );
};

export default DatasetsPage;
