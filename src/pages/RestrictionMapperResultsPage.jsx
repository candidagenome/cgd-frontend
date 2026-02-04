import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import restrictionMapperApi from '../api/restrictionMapperApi';
import './RestrictionMapperResultsPage.css';

// Enzyme type colors
const ENZYME_TYPE_COLORS = {
  '5_prime': { bg: '#e3f2fd', border: '#1976d2', label: "5' Overhang" },
  '3_prime': { bg: '#fff3e0', border: '#f57c00', label: "3' Overhang" },
  'blunt': { bg: '#e8f5e9', border: '#388e3c', label: 'Blunt End' },
};

function RestrictionMapperResultsPage() {
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [params, setParams] = useState(null);
  const [selectedEnzyme, setSelectedEnzyme] = useState(null);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showNonCutting, setShowNonCutting] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Load results from sessionStorage
  useEffect(() => {
    const storedResults = sessionStorage.getItem('restrictionMapperResults');
    const storedParams = sessionStorage.getItem('restrictionMapperParams');

    if (storedResults) {
      setResults(JSON.parse(storedResults));
    }
    if (storedParams) {
      setParams(JSON.parse(storedParams));
    }

    if (!storedResults) {
      // No results, redirect to search
      navigate('/restriction-mapper');
    }
  }, [navigate]);

  // Sort enzymes
  const sortedEnzymes = useMemo(() => {
    if (!results?.cutting_enzymes) return [];

    const sorted = [...results.cutting_enzymes].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.enzyme_name.localeCompare(b.enzyme_name);
          break;
        case 'cuts':
          comparison = a.total_cuts - b.total_cuts;
          break;
        case 'type':
          comparison = a.enzyme_type.localeCompare(b.enzyme_type);
          break;
        default:
          comparison = 0;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [results?.cutting_enzymes, sortBy, sortOrder]);

  // Handle sort change
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Get sort indicator
  const getSortIndicator = (field) => {
    if (sortBy !== field) return '';
    return sortOrder === 'asc' ? ' ▲' : ' ▼';
  };

  // Handle download
  const handleDownload = async (type) => {
    if (!params) return;

    setDownloading(true);
    try {
      if (type === 'results') {
        await restrictionMapperApi.downloadResults(params);
      } else {
        await restrictionMapperApi.downloadNonCutting(params);
      }
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setDownloading(false);
    }
  };

  // Calculate scale for restriction map visualization
  const mapScale = useMemo(() => {
    if (!results) return { width: 800, scale: 1 };
    const width = 800;
    const scale = width / results.seq_length;
    return { width, scale };
  }, [results]);

  // Get all unique cut positions for the map
  const allCutPositions = useMemo(() => {
    if (!results?.cutting_enzymes) return [];

    const positions = new Map();
    results.cutting_enzymes.forEach((enzyme) => {
      const cuts = [...enzyme.cut_positions_watson, ...enzyme.cut_positions_crick];
      cuts.forEach((pos) => {
        if (!positions.has(pos)) {
          positions.set(pos, []);
        }
        positions.get(pos).push({
          name: enzyme.enzyme_name,
          type: enzyme.enzyme_type,
        });
      });
    });

    return Array.from(positions.entries())
      .map(([pos, enzymes]) => ({ position: pos, enzymes }))
      .sort((a, b) => a.position - b.position);
  }, [results?.cutting_enzymes]);

  if (!results) {
    return (
      <div className="restriction-results-page">
        <div className="restriction-content">
          <h1>Restriction Map Results</h1>
          <hr />
          <div className="loading-state">
            <span className="loading-spinner"></span>
            Loading...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="restriction-results-page">
      <div className="restriction-content">
        <h1>Restriction Map Results</h1>
        <hr />

        {/* Summary Section */}
        <div className="results-summary">
          <div className="summary-row">
            <span><strong>Sequence:</strong> {results.seq_name}</span>
            <span><strong>Length:</strong> {results.seq_length.toLocaleString()} bp</span>
            {results.coordinates && (
              <span><strong>Coordinates:</strong> {results.coordinates}</span>
            )}
          </div>
          <div className="summary-row">
            <span>
              <strong>{sortedEnzymes.length} cutting enzyme{sortedEnzymes.length !== 1 ? 's' : ''}</strong>
              {' '}out of {results.total_enzymes_searched} searched
            </span>
            <span>
              <strong>{results.non_cutting_enzymes.length} non-cutting</strong>
            </span>
          </div>
          <Link to="/restriction-mapper" className="new-search-link">
            ← New Search
          </Link>
        </div>

        {/* Enzyme Type Legend */}
        <div className="enzyme-legend">
          <span className="legend-title">Enzyme Types:</span>
          {Object.entries(ENZYME_TYPE_COLORS).map(([type, colors]) => (
            <span
              key={type}
              className="legend-item"
              style={{ backgroundColor: colors.bg, borderColor: colors.border }}
            >
              {colors.label}
            </span>
          ))}
        </div>

        {/* Visual Restriction Map */}
        {sortedEnzymes.length > 0 && (
          <div className="restriction-map-section">
            <h2>Restriction Map</h2>
            <div className="restriction-map-container">
              <div className="map-scale">
                <span>0</span>
                <span>{Math.round(results.seq_length / 4).toLocaleString()}</span>
                <span>{Math.round(results.seq_length / 2).toLocaleString()}</span>
                <span>{Math.round(results.seq_length * 3 / 4).toLocaleString()}</span>
                <span>{results.seq_length.toLocaleString()} bp</span>
              </div>
              <div className="map-sequence-bar" style={{ width: mapScale.width }}>
                {/* Cut site markers */}
                {allCutPositions.slice(0, 100).map(({ position, enzymes }) => {
                  const left = (position / results.seq_length) * 100;
                  const primaryEnzyme = enzymes[0];
                  const color = ENZYME_TYPE_COLORS[primaryEnzyme.type]?.border || '#666';
                  return (
                    <div
                      key={position}
                      className="cut-marker"
                      style={{
                        left: `${left}%`,
                        backgroundColor: color,
                      }}
                      title={`${enzymes.map((e) => e.name).join(', ')} @ ${position}`}
                    />
                  );
                })}
              </div>
              {allCutPositions.length > 100 && (
                <p className="map-note">
                  Showing first 100 of {allCutPositions.length} cut sites
                </p>
              )}
            </div>
          </div>
        )}

        {/* Download Buttons */}
        <div className="download-section">
          <button
            className="download-btn"
            onClick={() => handleDownload('results')}
            disabled={downloading || sortedEnzymes.length === 0}
          >
            Download Cutting Enzymes (TSV)
          </button>
          <button
            className="download-btn secondary"
            onClick={() => handleDownload('non-cutting')}
            disabled={downloading || results.non_cutting_enzymes.length === 0}
          >
            Download Non-Cutting Enzymes (TSV)
          </button>
        </div>

        {/* Cutting Enzymes Table */}
        {sortedEnzymes.length > 0 ? (
          <div className="enzymes-section">
            <h2>Cutting Enzymes ({sortedEnzymes.length})</h2>
            <table className="enzymes-table">
              <thead>
                <tr>
                  <th
                    className="sortable"
                    onClick={() => handleSort('name')}
                  >
                    Enzyme{getSortIndicator('name')}
                  </th>
                  <th>Recognition</th>
                  <th
                    className="sortable"
                    onClick={() => handleSort('type')}
                  >
                    Type{getSortIndicator('type')}
                  </th>
                  <th
                    className="sortable"
                    onClick={() => handleSort('cuts')}
                  >
                    Cuts{getSortIndicator('cuts')}
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedEnzymes.map((enzyme) => {
                  const typeColors = ENZYME_TYPE_COLORS[enzyme.enzyme_type] || {};
                  const isSelected = selectedEnzyme?.enzyme_name === enzyme.enzyme_name;

                  return (
                    <React.Fragment key={enzyme.enzyme_name}>
                      <tr
                        className={isSelected ? 'selected' : ''}
                        style={{
                          backgroundColor: typeColors.bg,
                        }}
                      >
                        <td className="enzyme-name">{enzyme.enzyme_name}</td>
                        <td className="recognition">
                          <code>{enzyme.recognition_seq}</code>
                        </td>
                        <td className="enzyme-type">
                          <span
                            className="type-badge"
                            style={{
                              backgroundColor: typeColors.bg,
                              borderColor: typeColors.border,
                            }}
                          >
                            {typeColors.label || enzyme.enzyme_type}
                          </span>
                        </td>
                        <td className="cuts">{enzyme.total_cuts}</td>
                        <td>
                          <button
                            className="details-btn"
                            onClick={() => setSelectedEnzyme(isSelected ? null : enzyme)}
                          >
                            {isSelected ? 'Hide Details' : 'Show Details'}
                          </button>
                        </td>
                      </tr>
                      {isSelected && (
                        <tr className="enzyme-details-row">
                          <td colSpan="5">
                            <div className="enzyme-details">
                              <div className="details-section">
                                <strong>Cut Positions (Watson strand):</strong>
                                <span className="positions">
                                  {enzyme.cut_positions_watson.length > 0
                                    ? enzyme.cut_positions_watson.join(', ')
                                    : 'None'}
                                </span>
                              </div>
                              <div className="details-section">
                                <strong>Cut Positions (Crick strand):</strong>
                                <span className="positions">
                                  {enzyme.cut_positions_crick.length > 0
                                    ? enzyme.cut_positions_crick.join(', ')
                                    : 'None'}
                                </span>
                              </div>
                              <div className="details-section">
                                <strong>Fragment Sizes:</strong>
                                <span className="fragments">
                                  {enzyme.fragment_sizes.join(', ')} bp
                                </span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="no-results">
            <p>No cutting enzymes found for this sequence with the selected filter.</p>
            <p className="hint">Try selecting "All Enzymes" filter.</p>
          </div>
        )}

        {/* Non-Cutting Enzymes Section */}
        {results.non_cutting_enzymes.length > 0 && (
          <div className="non-cutting-section">
            <button
              className="toggle-btn"
              onClick={() => setShowNonCutting(!showNonCutting)}
            >
              {showNonCutting ? '▼' : '▶'} Non-Cutting Enzymes ({results.non_cutting_enzymes.length})
            </button>
            {showNonCutting && (
              <div className="non-cutting-list">
                {results.non_cutting_enzymes.map((enzyme) => (
                  <span key={enzyme} className="non-cutting-enzyme">
                    {enzyme}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default RestrictionMapperResultsPage;
