import React, { useState, useMemo, useEffect } from 'react';
import OrganismSelector, { getDefaultOrganism } from './OrganismSelector';
import './LocusComponents.css';

// Default number of conditions to show per study
const DEFAULT_VISIBLE_CONDITIONS = 6;

// Color scale for fold changes with smooth gradient based on magnitude
const getFoldChangeStyle = (fc) => {
  // Calculate how "extreme" the change is (distance from 1.0)
  const logFc = Math.log2(fc);
  const magnitude = Math.abs(logFc);

  // For very small changes (near 1.0), use gray
  if (magnitude < 0.15) {
    return {
      backgroundColor: '#d0d0d0',
      opacity: 1
    };
  }

  // Base colors - use HSL for smoother gradient
  // Red for up: hsl(0, 70%, L%)
  // Blue for down: hsl(210, 70%, L%)
  const isUp = fc >= 1;
  const hue = isUp ? 0 : 210;

  // Map magnitude to saturation and lightness
  // magnitude 0.15 -> light (sat: 50%, light: 65%)
  // magnitude 1.0 (2x) -> medium (sat: 70%, light: 50%)
  // magnitude 2.0 (4x) -> strong (sat: 85%, light: 40%)
  const clampedMag = Math.min(magnitude, 2.0);
  const saturation = 50 + (clampedMag * 17.5); // 50% to 85%
  const lightness = 65 - (clampedMag * 12.5);  // 65% to 40%

  return {
    backgroundColor: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
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

function ExpressionDetails({ data, loading, error, selectedOrganism, onOrganismChange, orthologOrganisms = [] }) {
  const [expandedStudies, setExpandedStudies] = useState({});
  const [showAllConditions, setShowAllConditions] = useState({});
  const [filterBucket, setFilterBucket] = useState('all');

  // Get available organisms from the data - memoize to prevent new array reference each render
  const organisms = useMemo(() => {
    return data?.results ? Object.keys(data.results) : [];
  }, [data?.results]);

  // Set default organism if not already set and data is available
  useEffect(() => {
    if (organisms.length > 0 && !selectedOrganism) {
      const defaultOrg = getDefaultOrganism(organisms);
      if (defaultOrg && onOrganismChange) {
        onOrganismChange(defaultOrg);
      }
    }
  }, [organisms, selectedOrganism, onOrganismChange]);

  // Handle loading state
  if (loading) {
    return <div className="loading">Loading expression data...</div>;
  }

  // Handle error state
  if (error) {
    return <div className="error">Error loading expression data: {error}</div>;
  }

  // Handle no data
  if (!data || !data.results) {
    return <div className="no-data">No expression data available</div>;
  }

  if (organisms.length === 0) {
    return <div className="no-data">No expression data found</div>;
  }

  // Get data for the selected organism
  const orgData = selectedOrganism ? data.results[selectedOrganism] : null;

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

  // Filter conditions by bucket for the selected organism's studies
  const filteredStudies = useMemo(() => {
    if (!orgData?.studies) return [];
    if (filterBucket === 'all') return orgData.studies;

    return orgData.studies.map(study => ({
      ...study,
      conditions: study.conditions.filter(c => c.bucket === filterBucket)
    })).filter(study => study.conditions.length > 0);
  }, [orgData?.studies, filterBucket]);

  // Get unique buckets for filter from the selected organism's data
  const availableBuckets = useMemo(() => {
    if (!orgData?.studies) return [];
    const buckets = new Set();
    orgData.studies.forEach(study => {
      study.conditions.forEach(c => buckets.add(c.bucket));
    });
    return Array.from(buckets);
  }, [orgData?.studies]);

  return (
    <div className="expression-details">
      {/* Organism Selector */}
      <OrganismSelector
        organisms={organisms}
        selectedOrganism={selectedOrganism}
        onOrganismChange={onOrganismChange}
        dataType="expression"
        orthologOrganisms={orthologOrganisms}
      />

      {/* Display data for selected organism */}
      {selectedOrganism && orgData ? (
        <>
          {/* Header with gene info */}
          <div className="expression-header">
            <h3>RNA-seq Expression Data for {orgData.gene_name || orgData.feature_name}</h3>
            {orgData.description && (
              <p className="gene-description">{orgData.description}</p>
            )}
            <div className="expression-summary">
              <span className="summary-item">
                <strong>{orgData.total_conditions}</strong> conditions across <strong>{orgData.studies?.length || 0}</strong> studies
              </span>
              {orgData.max_upregulation && (
                <span className="summary-item upregulated">
                  Max upregulation: <strong>{formatFoldChange(orgData.max_upregulation)}</strong>
                </span>
              )}
              {orgData.max_downregulation && (
                <span className="summary-item downregulated">
                  Max downregulation: <strong>{formatFoldChange(orgData.max_downregulation)}</strong>
                </span>
              )}
            </div>
          </div>

          {orgData.studies && orgData.studies.length > 0 ? (
            <>
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
                <span className="legend-item legend-down" style={{ backgroundColor: 'hsl(210, 85%, 40%)' }}>↓ &lt;0.5x</span>
                <span className="legend-item legend-down" style={{ backgroundColor: 'hsl(210, 60%, 55%)' }}>↓ 0.5–0.8x</span>
                <span className="legend-item" style={{ backgroundColor: '#d0d0d0' }}>~1x</span>
                <span className="legend-item legend-up" style={{ backgroundColor: 'hsl(0, 60%, 55%)' }}>↑ 1.2–2x</span>
                <span className="legend-item legend-up" style={{ backgroundColor: 'hsl(0, 85%, 40%)' }}>↑ &gt;2x</span>
              </div>
              <div className="expression-baseline-guide">
                <span className="baseline-label-down">← down</span>
                <span className="baseline-center">1.0</span>
                <span className="baseline-label-up">up →</span>
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
                                    {/* Only show bucket badge for non-control conditions */}
                                    {!isControl && (
                                      <span
                                        className="bucket-badge"
                                        style={{
                                          borderColor: BUCKET_INFO[condition.bucket]?.color || '#9e9e9e',
                                          color: BUCKET_INFO[condition.bucket]?.color || '#9e9e9e'
                                        }}
                                      >
                                        {BUCKET_INFO[condition.bucket]?.label || condition.bucket}
                                      </span>
                                    )}
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
                                : `Show all conditions (${sortedConditions.length} total)`
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
              {orgData.warnings && orgData.warnings.length > 0 && (
                <div className="expression-warnings">
                  <h4>Notes:</h4>
                  <ul>
                    {orgData.warnings.map((warning, i) => (
                      <li key={i}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Attribution */}
              <div className="expression-attribution">
                <p>
                  Values show fold change vs control (1.0 = no change).
                  Data from RNA-seq experiments.
                </p>
              </div>
            </>
          ) : (
            <div className="no-data">
              <p>No expression data available for this gene in {selectedOrganism}</p>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}

export default ExpressionDetails;
