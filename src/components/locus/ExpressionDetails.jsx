import React, { useState, useMemo } from 'react';
import './LocusComponents.css';

// Color scale for fold changes
const getFoldChangeColor = (fc) => {
  if (fc >= 2) return '#c62828'; // Strong up - dark red
  if (fc >= 1.5) return '#ef5350'; // Moderate up - red
  if (fc > 1.1) return '#ffcdd2'; // Slight up - light red
  if (fc <= 0.5) return '#1565c0'; // Strong down - dark blue
  if (fc <= 0.67) return '#42a5f5'; // Moderate down - blue
  if (fc < 0.9) return '#bbdefb'; // Slight down - light blue
  return '#e0e0e0'; // No change - gray
};

// Format fold change for display
const formatFoldChange = (fc) => {
  if (fc >= 1) {
    return `${fc.toFixed(2)}x`;
  }
  return `${fc.toFixed(2)}x`;
};

// Bucket labels and colors
const BUCKET_INFO = {
  control: { label: 'Control', color: '#9e9e9e' },
  basic_biology: { label: 'Basic Biology', color: '#4caf50' },
  kill_candida: { label: 'Antifungal/Immune', color: '#f44336' },
  stress: { label: 'Stress Response', color: '#ff9800' },
};

function ExpressionDetails({ data, loading, error }) {
  const [expandedStudies, setExpandedStudies] = useState({});
  const [filterBucket, setFilterBucket] = useState('all');

  // Handle loading state
  if (loading) {
    return <div className="loading">Loading expression data...</div>;
  }

  // Handle error state
  if (error) {
    return <div className="error">Error loading expression data: {error}</div>;
  }

  // Handle no data
  if (!data) {
    return <div className="no-data">No expression data available</div>;
  }

  // Handle API error response
  if (!data.success) {
    return (
      <div className="expression-details">
        <div className="expression-error">
          <p>{data.error || 'Expression data not available for this gene'}</p>
        </div>
      </div>
    );
  }

  // Handle no studies
  if (!data.studies || data.studies.length === 0) {
    return (
      <div className="expression-details">
        <div className="no-data">
          <p>No expression data available for <strong>{data.gene_name || data.feature_name}</strong></p>
          {data.warnings && data.warnings.length > 0 && (
            <div className="expression-warnings">
              {data.warnings.map((w, i) => <p key={i}>{w}</p>)}
            </div>
          )}
        </div>
      </div>
    );
  }

  const toggleStudy = (studyId) => {
    setExpandedStudies(prev => ({
      ...prev,
      [studyId]: !prev[studyId]
    }));
  };

  // Filter conditions by bucket
  const filteredStudies = useMemo(() => {
    if (filterBucket === 'all') return data.studies;

    return data.studies.map(study => ({
      ...study,
      conditions: study.conditions.filter(c => c.bucket === filterBucket)
    })).filter(study => study.conditions.length > 0);
  }, [data.studies, filterBucket]);

  // Get unique buckets for filter
  const availableBuckets = useMemo(() => {
    const buckets = new Set();
    data.studies.forEach(study => {
      study.conditions.forEach(c => buckets.add(c.bucket));
    });
    return Array.from(buckets);
  }, [data.studies]);

  return (
    <div className="expression-details">
      {/* Header with gene info */}
      <div className="expression-header">
        <h3>RNA-seq Expression Data for {data.gene_name || data.feature_name}</h3>
        {data.description && (
          <p className="gene-description">{data.description}</p>
        )}
        <div className="expression-summary">
          <span className="summary-item">
            <strong>{data.total_conditions}</strong> conditions across <strong>{data.studies.length}</strong> studies
          </span>
          {data.max_upregulation && (
            <span className="summary-item upregulated">
              Max upregulation: <strong>{formatFoldChange(data.max_upregulation)}</strong>
            </span>
          )}
          {data.max_downregulation && (
            <span className="summary-item downregulated">
              Max downregulation: <strong>{formatFoldChange(data.max_downregulation)}</strong>
            </span>
          )}
        </div>
      </div>

      {/* Filter controls */}
      <div className="expression-filters">
        <label>Filter by category: </label>
        <select
          value={filterBucket}
          onChange={(e) => setFilterBucket(e.target.value)}
          className="bucket-filter"
        >
          <option value="all">All categories</option>
          {availableBuckets.map(bucket => (
            <option key={bucket} value={bucket}>
              {BUCKET_INFO[bucket]?.label || bucket}
            </option>
          ))}
        </select>
      </div>

      {/* Legend */}
      <div className="expression-legend">
        <span className="legend-title">Fold Change:</span>
        <span className="legend-item" style={{ backgroundColor: '#c62828', color: 'white' }}>&gt;2x up</span>
        <span className="legend-item" style={{ backgroundColor: '#ef5350', color: 'white' }}>1.5-2x up</span>
        <span className="legend-item" style={{ backgroundColor: '#ffcdd2' }}>1.1-1.5x up</span>
        <span className="legend-item" style={{ backgroundColor: '#e0e0e0' }}>~1x</span>
        <span className="legend-item" style={{ backgroundColor: '#bbdefb' }}>0.67-0.9x down</span>
        <span className="legend-item" style={{ backgroundColor: '#42a5f5', color: 'white' }}>0.5-0.67x down</span>
        <span className="legend-item" style={{ backgroundColor: '#1565c0', color: 'white' }}>&lt;0.5x down</span>
      </div>

      {/* Studies list */}
      <div className="expression-studies">
        {filteredStudies.map(study => {
          const isExpanded = expandedStudies[study.study_id] !== false; // Default expanded

          return (
            <div key={study.study_id} className="expression-study">
              <div
                className="study-header"
                onClick={() => toggleStudy(study.study_id)}
                role="button"
                tabIndex={0}
              >
                <span className="collapse-icon">{isExpanded ? '▼' : '▶'}</span>
                <span className="study-name">{study.study_id.replace(/_/g, ' ')}</span>
                <span className="study-category">{study.category}</span>
                {study.pmid && (
                  <a
                    href={`https://pubmed.ncbi.nlm.nih.gov/${study.pmid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pubmed-link"
                    onClick={(e) => e.stopPropagation()}
                  >
                    PMID:{study.pmid}
                  </a>
                )}
                <span className="condition-count">
                  ({study.conditions.length} conditions)
                </span>
              </div>

              {isExpanded && (
                <div className="study-conditions">
                  <div className="control-info">
                    Control: {study.control_id} (value: {study.control_value})
                  </div>
                  <div className="conditions-grid">
                    {study.conditions.map(condition => (
                      <div
                        key={condition.condition_id}
                        className="condition-item"
                        title={`${condition.label}: ${formatFoldChange(condition.fold_change)} (raw value: ${condition.value})`}
                      >
                        <div className="condition-label">
                          {condition.label}
                          <span
                            className="bucket-badge"
                            style={{ backgroundColor: BUCKET_INFO[condition.bucket]?.color || '#9e9e9e' }}
                          >
                            {BUCKET_INFO[condition.bucket]?.label || condition.bucket}
                          </span>
                        </div>
                        <div className="fold-change-bar">
                          <div
                            className="fold-change-fill"
                            style={{
                              backgroundColor: getFoldChangeColor(condition.fold_change),
                              width: `${Math.min(Math.max(condition.fold_change * 30, 10), 100)}%`
                            }}
                          >
                            <span className="fold-change-value">
                              {formatFoldChange(condition.fold_change)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Warnings */}
      {data.warnings && data.warnings.length > 0 && (
        <div className="expression-warnings">
          <h4>Notes:</h4>
          <ul>
            {data.warnings.map((warning, i) => (
              <li key={i}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Attribution */}
      <div className="expression-attribution">
        <p>
          Expression values are fold changes relative to control conditions within each study.
          Data derived from RNA-seq experiments aligned to the <em>C. albicans</em> SC5314 Assembly 22 genome.
        </p>
      </div>
    </div>
  );
}

export default ExpressionDetails;
