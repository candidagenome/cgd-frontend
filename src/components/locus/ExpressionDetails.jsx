import React, { useState, useMemo } from 'react';
import './LocusComponents.css';

// Default number of conditions to show per study
const DEFAULT_VISIBLE_CONDITIONS = 6;

// Color scale for fold changes with opacity based on magnitude
const getFoldChangeStyle = (fc) => {
  // Calculate how "extreme" the change is (distance from 1.0)
  const logFc = Math.log2(fc);
  const magnitude = Math.abs(logFc);

  // Base colors
  let baseColor;
  if (fc >= 1) {
    baseColor = { r: 198, g: 40, b: 40 }; // Red for upregulation
  } else {
    baseColor = { r: 21, g: 101, b: 192 }; // Blue for downregulation
  }

  // Calculate opacity based on magnitude (0.3 to 1.0)
  // log2(2) = 1, log2(1.5) ≈ 0.58, log2(1.1) ≈ 0.14
  const opacity = Math.min(0.3 + (magnitude * 0.7), 1.0);

  // For very small changes (near 1.0), use gray
  if (magnitude < 0.1) {
    return {
      backgroundColor: '#e0e0e0',
      opacity: 1
    };
  }

  return {
    backgroundColor: `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, ${opacity})`,
    opacity: 1
  };
};

// Format fold change for display
const formatFoldChange = (fc) => {
  return `${fc.toFixed(2)}x`;
};

// Bucket labels and colors
const BUCKET_INFO = {
  control: { label: 'Control', color: '#9e9e9e' },
  basic_biology: { label: 'Basic Biology', color: '#4caf50' },
  kill_candida: { label: 'Antifungal/Immune', color: '#f44336' },
  stress: { label: 'Stress Response', color: '#ff9800' },
};

// Calculate per-study summary stats
const getStudySummary = (conditions) => {
  let maxUp = 1;
  let maxDown = 1;
  let upCount = 0;
  let downCount = 0;

  conditions.forEach(c => {
    if (c.fold_change > 1) {
      upCount++;
      if (c.fold_change > maxUp) maxUp = c.fold_change;
    } else if (c.fold_change < 1) {
      downCount++;
      if (c.fold_change < maxDown) maxDown = c.fold_change;
    }
  });

  return { maxUp, maxDown, upCount, downCount };
};

// Sort conditions by magnitude (most extreme first)
const sortByMagnitude = (conditions) => {
  return [...conditions].sort((a, b) => {
    const magA = Math.abs(Math.log2(a.fold_change));
    const magB = Math.abs(Math.log2(b.fold_change));
    return magB - magA;
  });
};

function ExpressionDetails({ data, loading, error }) {
  const [expandedStudies, setExpandedStudies] = useState({});
  const [showAllConditions, setShowAllConditions] = useState({});
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

  const toggleShowAll = (studyId, e) => {
    e.stopPropagation();
    setShowAllConditions(prev => ({
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
        <span className="legend-item legend-down" style={{ backgroundColor: 'rgba(21, 101, 192, 1)' }}>↓ Strong</span>
        <span className="legend-item legend-down" style={{ backgroundColor: 'rgba(21, 101, 192, 0.5)' }}>↓ Moderate</span>
        <span className="legend-item" style={{ backgroundColor: '#e0e0e0' }}>~1x</span>
        <span className="legend-item legend-up" style={{ backgroundColor: 'rgba(198, 40, 40, 0.5)' }}>↑ Moderate</span>
        <span className="legend-item legend-up" style={{ backgroundColor: 'rgba(198, 40, 40, 1)' }}>↑ Strong</span>
        <span className="legend-baseline">|← down | 1.0 | up →|</span>
      </div>

      {/* Studies list */}
      <div className="expression-studies">
        {filteredStudies.map(study => {
          const isExpanded = expandedStudies[study.study_id] !== false; // Default expanded
          const showAll = showAllConditions[study.study_id] || false;
          const summary = getStudySummary(study.conditions);

          // Sort by magnitude and limit display
          const sortedConditions = sortByMagnitude(study.conditions);
          const visibleConditions = showAll
            ? sortedConditions
            : sortedConditions.slice(0, DEFAULT_VISIBLE_CONDITIONS);
          const hiddenCount = sortedConditions.length - DEFAULT_VISIBLE_CONDITIONS;

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
                {/* Per-study summary */}
                <span className="study-summary">
                  {summary.maxUp > 1 && (
                    <span className="study-stat up">↑{formatFoldChange(summary.maxUp)}</span>
                  )}
                  {summary.maxDown < 1 && (
                    <span className="study-stat down">↓{formatFoldChange(summary.maxDown)}</span>
                  )}
                </span>
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
                    Control: {study.control_id}
                  </div>
                  <div className="conditions-grid">
                    {visibleConditions.map(condition => {
                      const isControl = condition.bucket === 'control';
                      const foldStyle = getFoldChangeStyle(condition.fold_change);

                      // Calculate bar position for centered baseline
                      // 1.0 = center (50%), <1 goes left, >1 goes right
                      const logFc = Math.log2(condition.fold_change);
                      // Clamp to reasonable range (-2 to +2 in log scale = 0.25x to 4x)
                      const clampedLog = Math.max(-2, Math.min(2, logFc));
                      // Convert to percentage: -2 = 0%, 0 = 50%, +2 = 100%
                      const barWidth = Math.abs(clampedLog) * 25; // 25% per log unit
                      const isUp = condition.fold_change >= 1;

                      return (
                        <div
                          key={condition.condition_id}
                          className={`condition-item ${isControl ? 'condition-control' : ''}`}
                          title={`${condition.label}: ${formatFoldChange(condition.fold_change)} (raw value: ${condition.value?.toFixed(2)})`}
                        >
                          <div className="condition-label">
                            <span className="condition-name">{condition.label}</span>
                            {!isControl && (
                              <span
                                className="bucket-badge"
                                style={{
                                  backgroundColor: BUCKET_INFO[condition.bucket]?.color || '#9e9e9e',
                                  opacity: 0.7
                                }}
                              >
                                {BUCKET_INFO[condition.bucket]?.label || condition.bucket}
                              </span>
                            )}
                            {isControl && <span className="control-badge">Control</span>}
                          </div>
                          <div className="fold-change-bar-centered">
                            <div className="bar-baseline"></div>
                            <div
                              className={`bar-fill ${isUp ? 'bar-up' : 'bar-down'}`}
                              style={{
                                width: `${barWidth}%`,
                                ...foldStyle
                              }}
                            ></div>
                            <span className={`fold-change-value ${isUp ? 'value-up' : 'value-down'}`}>
                              {formatFoldChange(condition.fold_change)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Show all toggle */}
                  {hiddenCount > 0 && (
                    <button
                      className="show-all-toggle"
                      onClick={(e) => toggleShowAll(study.study_id, e)}
                    >
                      {showAll
                        ? `Show top ${DEFAULT_VISIBLE_CONDITIONS} only`
                        : `Show all ${sortedConditions.length} conditions (+${hiddenCount} more)`
                      }
                    </button>
                  )}
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
          Values show fold change vs control (1.0 = no change).
          Data from RNA-seq experiments aligned to <em>C. albicans</em> SC5314 Assembly 22.
        </p>
      </div>
    </div>
  );
}

export default ExpressionDetails;
