import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import genomeVersionApi from '../api/genomeVersionApi';
import './GenomeVersionHistoryPage.css';

function GenomeVersionHistoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [config, setConfig] = useState(null);
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSeqSource, setSelectedSeqSource] = useState('');

  // Load config on mount
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const data = await genomeVersionApi.getConfig();
        setConfig(data);

        // Set initial seq_source from URL or default
        const urlSeqSource = searchParams.get('seq_source');
        if (urlSeqSource) {
          setSelectedSeqSource(urlSeqSource);
        } else if (data.default_seq_source) {
          setSelectedSeqSource(data.default_seq_source);
        }
      } catch (err) {
        console.error('Failed to load config:', err);
        setError('Failed to load configuration');
      }
    };

    loadConfig();
  }, [searchParams]);

  // Load history when seq_source changes
  useEffect(() => {
    if (!selectedSeqSource) return;

    const loadHistory = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await genomeVersionApi.getHistory(selectedSeqSource);
        if (data.success) {
          setHistory(data);
        } else {
          setError(data.error || 'Failed to load genome version history');
        }
      } catch (err) {
        console.error('Failed to load history:', err);
        setError(err.response?.data?.detail || err.message || 'Failed to load history');
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [selectedSeqSource]);

  // Handle seq_source change
  const handleSeqSourceChange = (e) => {
    const value = e.target.value;
    setSelectedSeqSource(value);
    setSearchParams({ seq_source: value });
  };

  // Format date for display
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get display name for selected strain
  const getSelectedStrainDisplay = () => {
    if (!config || !selectedSeqSource) return selectedSeqSource;
    const source = config.seq_sources.find(s => s.seq_source === selectedSeqSource);
    return source ? source.display_name : selectedSeqSource;
  };

  if (loading && !history) {
    return (
      <div className="genome-version-page">
        <div className="genome-version-content">
          <h1>Summary of Genome Versions</h1>
          <hr />
          <div className="loading-state">
            <span className="loading-spinner"></span>
            Loading...
          </div>
        </div>
      </div>
    );
  }

  if (error && !history) {
    return (
      <div className="genome-version-page">
        <div className="genome-version-content">
          <h1>Summary of Genome Versions</h1>
          <hr />
          <div className="error-state">
            <strong>Error</strong>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="genome-version-page">
      <div className="genome-version-content">
        <h1>Summary of Genome Versions</h1>
        <hr />

        {/* Version Format Explanation */}
        {config?.version_format_explanation && (
          <div
            className="version-explanation"
            dangerouslySetInnerHTML={{ __html: config.version_format_explanation }}
          />
        )}

        {/* Strain Selector */}
        <div className="strain-selector">
          <p>
            This page is displaying Summary of Genome Versions for{' '}
            <span className="selected-strain">{getSelectedStrainDisplay()}</span>.
          </p>
          <div className="selector-row">
            <label htmlFor="seq-source">
              If you wish to view details for a different Strain or Assembly, please make the appropriate selection:
            </label>
            <select
              id="seq-source"
              value={selectedSeqSource}
              onChange={handleSeqSourceChange}
            >
              {config?.seq_sources.map((source) => (
                <option key={source.seq_source} value={source.seq_source}>
                  {source.display_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading Overlay */}
        {loading && (
          <div className="loading-overlay">
            <span className="loading-spinner"></span>
          </div>
        )}

        {/* Version History Table */}
        {history?.versions?.length > 0 ? (
          <table className="version-table">
            <thead>
              <tr>
                <th>Genome Version</th>
                <th>Strain Name</th>
                <th>Is current?</th>
                <th>Date</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {history.versions.map((version, idx) => (
                <tr
                  key={idx}
                  className={version.is_major_version ? 'major-version' : 'minor-version'}
                >
                  <td className="version-cell">{version.genome_version}</td>
                  <td className="strain-cell">
                    <em>{version.strain_name}</em>
                  </td>
                  <td className="current-cell">
                    {version.is_current ? 'Yes' : 'No'}
                  </td>
                  <td className="date-cell">{formatDate(version.date_created)}</td>
                  <td className="description-cell">{version.description || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-versions">
            <p>No genome versions found for this strain/assembly.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default GenomeVersionHistoryPage;
