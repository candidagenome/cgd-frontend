import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import patmatchApi from '../api/patmatchApi';
import './PatmatchResultsPage.css';

// Register AG Grid modules once
if (!ModuleRegistry.__cgdRegistered) {
  ModuleRegistry.registerModules([AllCommunityModule]);
  ModuleRegistry.__cgdRegistered = true;
}

function PatmatchResultsPage() {
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [selectedHit, setSelectedHit] = useState(null);

  // Extract search parameters from URL
  const pattern = searchParams.get('pattern') || '';
  const patternType = searchParams.get('type') || 'dna';
  const dataset = searchParams.get('ds') || 'chromosomes';
  const strand = searchParams.get('strand') || 'both';
  const maxMismatches = parseInt(searchParams.get('mm'), 10) || 0;
  const maxInsertions = parseInt(searchParams.get('ins'), 10) || 0;
  const maxDeletions = parseInt(searchParams.get('del'), 10) || 0;
  const maxResults = parseInt(searchParams.get('max'), 10) || 100;

  // Fetch results on mount
  useEffect(() => {
    const fetchResults = async () => {
      if (!pattern) {
        setError('No pattern specified');
        setLoading(false);
        return;
      }

      try {
        const params = {
          pattern,
          pattern_type: patternType,
          dataset,
          strand,
          max_mismatches: maxMismatches,
          max_insertions: maxInsertions,
          max_deletions: maxDeletions,
          max_results: maxResults,
        };

        const response = await patmatchApi.search(params);

        if (response.success && response.result) {
          setResults(response.result);
        } else {
          setError(response.error || 'Pattern match search failed');
        }
      } catch (err) {
        // Handle Pydantic validation errors (array of error objects)
        const detail = err.response?.data?.detail;
        let errorMsg = 'Search failed';
        if (Array.isArray(detail)) {
          // Extract messages from validation errors
          errorMsg = detail.map((e) => e.msg || e.message || JSON.stringify(e)).join('; ');
        } else if (typeof detail === 'string') {
          errorMsg = detail;
        } else if (err.message) {
          errorMsg = err.message;
        }
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [pattern, patternType, dataset, strand, maxMismatches, maxInsertions, maxDeletions, maxResults]);

  // Build new search URL
  const buildNewSearchUrl = () => {
    const params = new URLSearchParams();
    if (pattern) params.set('pattern', pattern);
    params.set('type', patternType);
    params.set('ds', dataset);
    if (patternType === 'dna') params.set('strand', strand);
    if (maxMismatches > 0) params.set('mm', maxMismatches.toString());
    if (maxInsertions > 0) params.set('ins', maxInsertions.toString());
    if (maxDeletions > 0) params.set('del', maxDeletions.toString());
    return `/patmatch?${params.toString()}`;
  };

  // Handle download - request all results up to 50000
  const handleDownload = async () => {
    setDownloading(true);
    try {
      // Request the actual total (capped at 50000 by API)
      const downloadMax = Math.min(results?.total_hits || 10000, 50000);
      await patmatchApi.downloadResults({
        pattern,
        pattern_type: patternType,
        dataset,
        strand,
        max_mismatches: maxMismatches,
        max_insertions: maxInsertions,
        max_deletions: maxDeletions,
        max_results: downloadMax,
      });
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setDownloading(false);
    }
  };

  // Handle sequence click to show modal
  const handleSequenceClick = (hit) => {
    setSelectedHit(hit);
  };

  // Close modal
  const closeModal = () => {
    setSelectedHit(null);
  };

  // Render sequence modal
  const renderSequenceModal = () => {
    if (!selectedHit) return null;

    return (
      <div className="sequence-modal-overlay" onClick={closeModal}>
        <div className="sequence-modal" onClick={(e) => e.stopPropagation()}>
          <div className="sequence-modal-header">
            <h3>Sequence Match Details</h3>
            <button className="sequence-modal-close" onClick={closeModal}>×</button>
          </div>
          <div className="sequence-modal-content">
            <div className="sequence-modal-info">
              <span><strong>Sequence:</strong> {selectedHit.sequence_name}</span>
              <span><strong>Position:</strong> {selectedHit.match_start.toLocaleString()}-{selectedHit.match_end.toLocaleString()}</span>
              <span><strong>Strand:</strong> {selectedHit.strand}</span>
              {selectedHit.sequence_description && selectedHit.sequence_description !== selectedHit.sequence_name && (
                <span><strong>Description:</strong> {selectedHit.sequence_description}</span>
              )}
            </div>
            <div className="sequence-modal-sequence">
              <span className="seq-before">{selectedHit.context_before}</span>
              <span className="seq-match">{selectedHit.matched_sequence}</span>
              <span className="seq-after">{selectedHit.context_after}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // AG Grid column definitions
  const columnDefs = useMemo(() => [
    {
      headerName: '#',
      valueGetter: (params) => params.node.rowIndex + 1,
      width: 60,
      suppressSizeToFit: true,
    },
    {
      headerName: 'Sequence',
      field: 'sequence_name',
      cellRenderer: (params) => {
        const hit = params.data;
        if (!hit) return '-';
        const nameLink = hit.locus_link ? (
          <Link to={hit.locus_link} target="_blank" rel="noopener noreferrer">
            {hit.sequence_name}
          </Link>
        ) : (
          hit.sequence_name
        );
        return (
          <span>
            {nameLink}
            {hit.sequence_description && hit.sequence_description !== hit.sequence_name && (
              <span className="seq-desc"> ({hit.sequence_description})</span>
            )}
          </span>
        );
      },
      flex: 2,
    },
    {
      headerName: 'Position',
      cellRenderer: (params) => {
        const hit = params.data;
        if (!hit) return '-';
        return (
          <span>
            {hit.match_start.toLocaleString()}-{hit.match_end.toLocaleString()}
            {hit.jbrowse_link && (
              <a
                href={hit.jbrowse_link}
                target="_blank"
                rel="noopener noreferrer"
                className="jbrowse-link"
                title="View in JBrowse"
              >
                JB
              </a>
            )}
          </span>
        );
      },
      width: 150,
    },
    {
      headerName: 'Strand',
      field: 'strand',
      width: 80,
    },
    {
      headerName: 'Match',
      field: 'matched_sequence',
      cellRenderer: (params) => {
        const hit = params.data;
        if (!hit) return '-';
        return (
          <code
            onClick={() => handleSequenceClick(hit)}
            style={{ cursor: 'pointer' }}
            title="Click to view full sequence"
          >
            {hit.matched_sequence}
          </code>
        );
      },
      flex: 1,
    },
    {
      headerName: 'Context',
      cellRenderer: (params) => {
        const hit = params.data;
        if (!hit) return '-';
        return (
          <code
            onClick={() => handleSequenceClick(hit)}
            style={{ cursor: 'pointer' }}
            title="Click to view full sequence"
          >
            <span className="context-before">{hit.context_before}</span>
            <span className="context-match">{hit.matched_sequence}</span>
            <span className="context-after">{hit.context_after}</span>
          </code>
        );
      },
      flex: 2,
    },
  ], []);

  const defaultColDef = useMemo(() => ({
    sortable: true,
    resizable: true,
  }), []);

  if (loading) {
    return (
      <div className="patmatch-results-page">
        <div className="patmatch-content">
          <h1>Pattern Match Results</h1>
          <hr />
          <div className="loading-state">
            <span className="loading-spinner"></span>
            Searching for pattern "{pattern}"...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="patmatch-results-page">
        <div className="patmatch-content">
          <h1>Pattern Match Results</h1>
          <hr />
          <div className="error-state">
            <strong>Error</strong>
            <p>{error}</p>
          </div>
          <div className="back-link">
            <Link to={buildNewSearchUrl()}>← Back to Search</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="patmatch-results-page">
      <div className="patmatch-content">
        <h1>Pattern Match Results</h1>
        <hr />

        {/* Search Summary */}
        <div className="results-summary">
          <div className="summary-row">
            <span><strong>Pattern:</strong> <code>{results.pattern}</code></span>
            <span><strong>Type:</strong> {results.pattern_type}</span>
            <span><strong>Dataset:</strong> {results.dataset}</span>
            {patternType === 'dna' && <span><strong>Strand:</strong> {results.strand}</span>}
          </div>
          <div className="summary-row">
            <span>
              <strong>Found {results.total_hits.toLocaleString()} match{results.total_hits !== 1 ? 'es' : ''}</strong>
              {results.hits.length < results.total_hits && (
                <span className="truncated-notice"> (showing first {results.hits.length})</span>
              )}
              {' '}in {results.sequences_searched.toLocaleString()} sequences
              ({results.total_residues_searched.toLocaleString()} residues)
            </span>
          </div>
          <div className="action-links">
            <Link to={buildNewSearchUrl()} className="new-search-link">
              ← New Search
            </Link>
            {results.total_hits > 0 && (
              <button
                className="download-btn"
                onClick={handleDownload}
                disabled={downloading}
              >
                {downloading
                  ? 'Downloading...'
                  : `Download All ${Math.min(results.total_hits, 50000).toLocaleString()} Results (TSV)`}
              </button>
            )}
          </div>
        </div>

        {results.total_hits === 0 ? (
          <div className="no-results">
            <p>No matches found for pattern "{results.pattern}"</p>
            <p className="hint">
              Try using IUPAC ambiguity codes or allow mismatches in Advanced Options.
            </p>
          </div>
        ) : (
          <div className="ag-grid-wrapper" style={{ width: '100%' }}>
            <AgGridReact
              rowData={results.hits}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              domLayout="autoHeight"
              suppressCellFocus={true}
              enableCellTextSelection={true}
              pagination={true}
              paginationPageSize={10}
              paginationPageSizeSelector={[10, 25, 50, 100]}
              getRowId={(params) => `${params.data.sequence_name}-${params.data.match_start}-${params.data.match_end}`}
            />
          </div>
        )}

        {renderSequenceModal()}
      </div>
    </div>
  );
}

export default PatmatchResultsPage;
