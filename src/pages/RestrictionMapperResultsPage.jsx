import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import restrictionMapperApi from '../api/restrictionMapperApi';
import './RestrictionMapperResultsPage.css';

// Register AG Grid modules once
if (!ModuleRegistry.__cgdRegistered) {
  ModuleRegistry.registerModules([AllCommunityModule]);
  ModuleRegistry.__cgdRegistered = true;
}

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
  const [showNonCutting, setShowNonCutting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  // Quick filter state: pending (what user types) vs applied (what filters)
  const [pendingQuickFilter, setPendingQuickFilter] = useState('');
  const [appliedQuickFilter, setAppliedQuickFilter] = useState('');
  const [showAllCutSites, setShowAllCutSites] = useState(false);
  const [enzymeTypeFilter, setEnzymeTypeFilter] = useState(null); // null = all types

  const applyFilter = () => {
    setAppliedQuickFilter(pendingQuickFilter);
  };

  const clearFilter = () => {
    setPendingQuickFilter('');
    setAppliedQuickFilter('');
  };

  const hasPendingChanges = pendingQuickFilter !== appliedQuickFilter;

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

  // AG Grid column definitions
  const columnDefs = useMemo(() => [
    {
      headerName: 'Enzyme',
      field: 'enzyme_name',
      sortable: true,
      flex: 1,
      minWidth: 120,
    },
    {
      headerName: 'Recognition',
      field: 'recognition_seq',
      cellRenderer: (params) => {
        return <code>{params.value}</code>;
      },
      flex: 1.5,
      minWidth: 150,
    },
    {
      headerName: 'Type',
      field: 'enzyme_type',
      sortable: true,
      cellRenderer: (params) => {
        const enzyme = params.data;
        if (!enzyme) return '-';
        const typeColors = ENZYME_TYPE_COLORS[enzyme.enzyme_type] || {};
        return (
          <span
            className="type-badge"
            style={{
              backgroundColor: typeColors.bg,
              borderColor: typeColors.border,
            }}
          >
            {typeColors.label || enzyme.enzyme_type}
          </span>
        );
      },
      flex: 1,
      minWidth: 130,
    },
    {
      headerName: 'Cuts',
      field: 'total_cuts',
      sortable: true,
      flex: 0.5,
      minWidth: 80,
    },
    {
      headerName: 'Actions',
      cellRenderer: (params) => {
        const enzyme = params.data;
        if (!enzyme) return '-';
        const isSelected = selectedEnzyme?.enzyme_name === enzyme.enzyme_name;
        return (
          <button
            className="details-btn"
            onClick={() => setSelectedEnzyme(isSelected ? null : enzyme)}
          >
            {isSelected ? 'Hide Details' : 'Show Details'}
          </button>
        );
      },
      flex: 1,
      minWidth: 120,
      sortable: false,
    },
  ], [selectedEnzyme]);

  const defaultColDef = useMemo(() => ({
    resizable: true,
  }), []);

  // Filter cutting enzymes by quick filter text and enzyme type
  const filteredCuttingEnzymes = useMemo(() => {
    if (!results?.cutting_enzymes) return [];
    let filtered = results.cutting_enzymes;

    // Filter by enzyme type
    if (enzymeTypeFilter) {
      filtered = filtered.filter((enzyme) => enzyme.enzyme_type === enzymeTypeFilter);
    }

    // Filter by quick filter text
    if (appliedQuickFilter.trim()) {
      const searchLower = appliedQuickFilter.toLowerCase().trim();
      filtered = filtered.filter((enzyme) => {
        const searchFields = [
          enzyme.enzyme_name,
          enzyme.recognition_seq,
          enzyme.enzyme_type,
        ];
        return searchFields.some((field) => field && String(field).toLowerCase().includes(searchLower));
      });
    }

    return filtered;
  }, [results?.cutting_enzymes, appliedQuickFilter, enzymeTypeFilter]);

  // Filter cut positions by enzyme type for the map
  const filteredCutPositions = useMemo(() => {
    if (!allCutPositions.length) return [];

    let positions = allCutPositions;

    // Filter by enzyme type if selected
    if (enzymeTypeFilter) {
      positions = positions
        .map(({ position, enzymes }) => ({
          position,
          enzymes: enzymes.filter((e) => e.type === enzymeTypeFilter),
        }))
        .filter(({ enzymes }) => enzymes.length > 0);
    }

    return positions;
  }, [allCutPositions, enzymeTypeFilter]);

  // Row style based on enzyme type
  const getRowStyle = (params) => {
    const enzyme = params.data;
    if (!enzyme) return {};
    const typeColors = ENZYME_TYPE_COLORS[enzyme.enzyme_type] || {};
    return { backgroundColor: typeColors.bg };
  };

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

  const cuttingEnzymes = results.cutting_enzymes || [];

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
              <strong>{cuttingEnzymes.length} cutting enzyme{cuttingEnzymes.length !== 1 ? 's' : ''}</strong>
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

        {/* Enzyme Type Filter */}
        <div className="enzyme-legend">
          <span className="legend-title">Filter by Type:</span>
          <button
            type="button"
            className={`legend-item legend-btn ${enzymeTypeFilter === null ? 'active' : ''}`}
            style={{
              backgroundColor: enzymeTypeFilter === null ? '#e0e0e0' : '#fff',
              borderColor: '#999',
            }}
            onClick={() => setEnzymeTypeFilter(null)}
          >
            All Types
          </button>
          {Object.entries(ENZYME_TYPE_COLORS).map(([type, colors]) => (
            <button
              type="button"
              key={type}
              className={`legend-item legend-btn ${enzymeTypeFilter === type ? 'active' : ''}`}
              style={{
                backgroundColor: enzymeTypeFilter === type ? colors.border : colors.bg,
                borderColor: colors.border,
                color: enzymeTypeFilter === type ? '#fff' : 'inherit',
              }}
              onClick={() => setEnzymeTypeFilter(enzymeTypeFilter === type ? null : type)}
            >
              {colors.label}
            </button>
          ))}
        </div>

        {/* Visual Restriction Map */}
        {cuttingEnzymes.length > 0 && (
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
                {(showAllCutSites ? filteredCutPositions : filteredCutPositions.slice(0, 100)).map(({ position, enzymes }) => {
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
              {filteredCutPositions.length > 100 && (
                <div className="map-controls">
                  {showAllCutSites ? (
                    <p className="map-note">
                      Showing all {filteredCutPositions.length} cut sites
                      <button
                        type="button"
                        className="show-toggle-btn"
                        onClick={() => setShowAllCutSites(false)}
                      >
                        Show fewer
                      </button>
                    </p>
                  ) : (
                    <p className="map-note">
                      Showing first 100 of {filteredCutPositions.length} cut sites
                      <button
                        type="button"
                        className="show-toggle-btn"
                        onClick={() => setShowAllCutSites(true)}
                      >
                        Show all
                      </button>
                    </p>
                  )}
                </div>
              )}
              {filteredCutPositions.length <= 100 && filteredCutPositions.length > 0 && (
                <p className="map-note">
                  Showing {filteredCutPositions.length} cut site{filteredCutPositions.length !== 1 ? 's' : ''}
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
            disabled={downloading || cuttingEnzymes.length === 0}
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

        {/* Cutting Enzymes Table with AG Grid */}
        {cuttingEnzymes.length > 0 ? (
          <div className="enzymes-section">
            <h2>Cutting Enzymes ({cuttingEnzymes.length})</h2>

            {/* Quick Filter Box */}
            <div className="filter-controls" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 15px', background: '#f8f9fa', border: '1px solid #e0e0e0', borderRadius: '4px', marginBottom: '10px' }}>
              <label htmlFor="quick-filter" style={{ fontWeight: 500, color: '#333', whiteSpace: 'nowrap' }}>Filter results: </label>
              <input
                type="text"
                id="quick-filter"
                value={pendingQuickFilter}
                onChange={(e) => setPendingQuickFilter(e.target.value)}
                placeholder="Type to filter..."
                style={{ padding: '6px 10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px', width: '200px' }}
              />
              <button
                type="button"
                onClick={applyFilter}
                disabled={!hasPendingChanges}
                style={{ padding: '6px 12px', border: 'none', background: hasPendingChanges ? '#1976d2' : '#90caf9', color: 'white', fontWeight: 500, cursor: hasPendingChanges ? 'pointer' : 'not-allowed', borderRadius: '4px', fontSize: '14px' }}
              >
                Apply
              </button>
              {(appliedQuickFilter || pendingQuickFilter) && (
                <button
                  type="button"
                  onClick={clearFilter}
                  title="Clear filter"
                  style={{ padding: '4px 8px', border: 'none', background: '#e0e0e0', color: '#666', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', borderRadius: '4px', lineHeight: 1 }}
                >
                  ×
                </button>
              )}
              {appliedQuickFilter && (
                <span style={{ fontSize: '0.9rem', color: '#555' }}>
                  Showing {filteredCuttingEnzymes.length} of {cuttingEnzymes.length} results
                </span>
              )}
            </div>

            <div className="ag-grid-wrapper" style={{ width: '100%' }}>
              <AgGridReact
                rowData={filteredCuttingEnzymes}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                domLayout="autoHeight"
                suppressCellFocus={true}
                enableCellTextSelection={true}
                pagination={true}
                paginationPageSize={10}
                paginationPageSizeSelector={[10, 25, 50, 100]}
                getRowStyle={getRowStyle}
                getRowId={(params) => params.data.enzyme_name}
              />
            </div>

            {/* Selected Enzyme Details */}
            {selectedEnzyme && (
              <div className="enzyme-details-panel">
                <h3>{selectedEnzyme.enzyme_name} Details</h3>
                <div className="enzyme-details">
                  <div className="details-section">
                    <strong>Cut Positions (Watson strand):</strong>
                    <span className="positions">
                      {selectedEnzyme.cut_positions_watson.length > 0
                        ? selectedEnzyme.cut_positions_watson.join(', ')
                        : 'None'}
                    </span>
                  </div>
                  <div className="details-section">
                    <strong>Cut Positions (Crick strand):</strong>
                    <span className="positions">
                      {selectedEnzyme.cut_positions_crick.length > 0
                        ? selectedEnzyme.cut_positions_crick.join(', ')
                        : 'None'}
                    </span>
                  </div>
                  <div className="details-section">
                    <strong>Fragment Sizes:</strong>
                    <span className="fragments">
                      {selectedEnzyme.fragment_sizes.join(', ')} bp
                    </span>
                  </div>
                </div>
              </div>
            )}
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
