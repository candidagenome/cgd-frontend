import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './LocusComponents.css';
import OrganismSelector, { getDefaultOrganism } from './OrganismSelector';
import { formatCitationString, CitationLinks } from '../../utils/formatCitation.jsx';

function References({ data, loading, error }) {
  const [collapsedYears, setCollapsedYears] = useState({});
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grouped'
  const [selectedOrganism, setSelectedOrganism] = useState(null);

  const organismNames = data?.results ? Object.keys(data.results) : [];

  useEffect(() => {
    if (organismNames.length > 0 && !selectedOrganism) {
      setSelectedOrganism(getDefaultOrganism(organismNames));
    }
  }, [organismNames, selectedOrganism]);

  if (loading) return <div className="loading">Loading references...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!data || !data.results) return <div className="no-data">No reference data available</div>;

  if (organismNames.length === 0) {
    return <div className="no-data">No references found</div>;
  }

  // Filter to selected organism only
  const organisms = selectedOrganism
    ? [[selectedOrganism, data.results[selectedOrganism]]].filter(([, v]) => v)
    : Object.entries(data.results);

  // Group references by year
  const groupByYear = (references) => {
    const groups = {};
    references.forEach(ref => {
      const year = ref.year || 'Unknown';
      if (!groups[year]) {
        groups[year] = [];
      }
      groups[year].push(ref);
    });
    // Sort years descending
    return Object.entries(groups).sort((a, b) => {
      if (a[0] === 'Unknown') return 1;
      if (b[0] === 'Unknown') return -1;
      return parseInt(b[0]) - parseInt(a[0]);
    });
  };

  const toggleYear = (key) => {
    setCollapsedYears(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="references-details">
      <OrganismSelector
        organisms={organismNames}
        selectedOrganism={selectedOrganism}
        onOrganismChange={setSelectedOrganism}
        dataType="references"
      />
      {organisms.map(([orgName, orgData]) => {
        const refs = orgData.references || [];
        const groupedRefs = groupByYear(refs);

        return (
          <div key={orgName} className="organism-section">
            <h3 className="organism-name">{orgName}</h3>
            <p className="locus-display">
              Locus: {orgData.locus_display_name}
              {refs.length > 0 && (
                <span className="total-count"> ({refs.length} references)</span>
              )}
            </p>

            {refs.length > 0 ? (
              <>
                {/* View toggle */}
                <div className="view-toggle">
                  <button
                    className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                    onClick={() => setViewMode('list')}
                  >
                    📋 List View
                  </button>
                  <button
                    className={`toggle-btn ${viewMode === 'grouped' ? 'active' : ''}`}
                    onClick={() => setViewMode('grouped')}
                  >
                    📅 By Year
                  </button>
                </div>

                {viewMode === 'list' ? (
                  <table className="data-table references-table">
                    <thead>
                      <tr>
                        <th>Year</th>
                        <th>Citation</th>
                        <th>Links</th>
                      </tr>
                    </thead>
                    <tbody>
                      {refs
                        .sort((a, b) => (b.year || 0) - (a.year || 0))
                        .map((ref, idx) => (
                          <tr key={idx}>
                            <td className="year-cell">{ref.year || '-'}</td>
                            <td>
                              {formatCitationString(ref.citation, ref.journal_name || ref.journal)}
                              {ref.title && <div className="ref-title">{ref.title}</div>}
                            </td>
                            <td>
                              {ref.links && ref.links.length > 0 ? (
                                <CitationLinks links={ref.links} />
                              ) : (
                                <span className="citation-links">
                                  {'['}
                                  <Link to={`/reference/${ref.dbxref_id || ref.reference_no}`}>CGD Paper</Link>
                                  {ref.pubmed && (
                                    <>
                                      {' | '}
                                      <a
                                        href={`https://pubmed.ncbi.nlm.nih.gov/${ref.pubmed}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        PubMed
                                      </a>
                                    </>
                                  )}
                                  {']'}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="references-by-year">
                    {groupedRefs.map(([year, yearRefs]) => {
                      const yearKey = `${orgName}-${year}`;
                      const isCollapsed = collapsedYears[yearKey];

                      return (
                        <div key={year} className="year-group">
                          <div
                            className="year-header"
                            onClick={() => toggleYear(yearKey)}
                          >
                            <span className="collapse-icon">{isCollapsed ? '▶' : '▼'}</span>
                            <span className="year-label">{year}</span>
                            <span className="count-badge">{yearRefs.length}</span>
                          </div>

                          {!isCollapsed && (
                            <div className="year-references">
                              {yearRefs.map((ref, idx) => (
                                <div key={idx} className="reference-card">
                                  <div className="ref-citation">
                                    {formatCitationString(ref.citation, ref.journal_name || ref.journal)}
                                  </div>
                                  {ref.title && (
                                    <div className="ref-title-block">
                                      "{ref.title}"
                                    </div>
                                  )}
                                  <div className="ref-links">
                                    {ref.links && ref.links.length > 0 ? (
                                      <CitationLinks links={ref.links} />
                                    ) : (
                                      <span className="citation-links">
                                        {'['}
                                        <Link to={`/reference/${ref.dbxref_id || ref.reference_no}`}>CGD Paper</Link>
                                        {ref.pubmed && (
                                          <>
                                            {' | '}
                                            <a
                                              href={`https://pubmed.ncbi.nlm.nih.gov/${ref.pubmed}`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                            >
                                              PubMed
                                            </a>
                                          </>
                                        )}
                                        {']'}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              <p className="no-data">No references for this organism</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default References;
