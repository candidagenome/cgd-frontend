import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import OrganismSelector, { getDefaultOrganism } from './OrganismSelector';
import './LocusComponents.css';

// Default number of conditions to show per study
const DEFAULT_VISIBLE_CONDITIONS = 6;

// Get color for heatmap cell based on fold change
const getHeatmapColor = (fc, colors) => {
  const logFc = Math.log2(fc);
  const magnitude = Math.abs(logFc);

  // For very small changes (near 1.0), use neutral gray
  if (magnitude < 0.15) {
    return colors.neutral;
  }

  const isUp = fc >= 1;
  const baseColor = isUp ? colors.up : colors.down;

  // Map magnitude to opacity: 0.45 to 0.9
  const clampedMag = Math.min(magnitude, 2.0);
  const opacity = 0.45 + (clampedMag * 0.225);

  // Convert hex to rgba
  const r = parseInt(baseColor.slice(1, 3), 16);
  const g = parseInt(baseColor.slice(3, 5), 16);
  const b = parseInt(baseColor.slice(5, 7), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// Muted color palette for fold changes
// Up = warm muted rose, Down = cool muted slate blue
// Uses opacity to indicate magnitude (cleaner, less visual noise)
const COLORS = {
  up: '#c07a7a',      // softer muted rose (less aggressive)
  down: '#5f7fa6',    // slightly darker slate blue (better contrast)
  neutral: '#e5e7eb', // soft gray for ~1x
};

const getFoldChangeStyle = (fc) => {
  const logFc = Math.log2(fc);
  const magnitude = Math.abs(logFc);

  // For very small changes (near 1.0), use neutral gray
  if (magnitude < 0.15) {
    return {
      backgroundColor: COLORS.neutral,
      opacity: 1
    };
  }

  // Use base color with opacity based on magnitude
  // magnitude 0.15 -> weak (opacity: 0.45)
  // magnitude 1.0 (2x) -> medium (opacity: 0.65)
  // magnitude 2.0+ (4x) -> strong (opacity: 0.9)
  // This creates clear visual ranking: strong → clear, medium → soft, weak → subtle
  const isUp = fc >= 1;
  const baseColor = isUp ? COLORS.up : COLORS.down;

  // Map magnitude to opacity: 0.45 to 0.9 (ensures weak bars stay visible)
  const clampedMag = Math.min(magnitude, 2.0);
  const opacity = 0.45 + (clampedMag * 0.225); // 0.45 to 0.9

  return {
    backgroundColor: baseColor,
    opacity: opacity
  };
};

// Format fold change for display
const formatFoldChange = (fc) => {
  return `${fc.toFixed(2)}x`;
};

// Bucket labels - grey styling matching "conditions" text (#777)
const BUCKET_INFO = {
  control: { label: 'Control', color: '#777', bg: 'transparent', border: '#999' },
  basic_biology: { label: 'Basic Biology', color: '#777', bg: 'transparent', border: '#999' },
  kill_candida: { label: 'Antifungal/Immune', color: '#777', bg: 'transparent', border: '#999' },
  stress: { label: 'Stress Response', color: '#777', bg: 'transparent', border: '#999' },
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
  const [hoveredCondition, setHoveredCondition] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Get available organisms from the data - memoize to prevent new array reference each render
  const organisms = useMemo(() => {
    return data?.results ? Object.keys(data.results) : [];
  }, [data?.results]);

  // Get data for the selected organism
  const orgData = useMemo(() => {
    return selectedOrganism && data?.results ? data.results[selectedOrganism] : null;
  }, [selectedOrganism, data?.results]);

  // Filter conditions by bucket for the selected organism's studies
  const filteredStudies = useMemo(() => {
    if (!orgData?.studies) return [];
    if (filterBucket === 'all') return orgData.studies;

    return orgData.studies.map(study => ({
      ...study,
      conditions: study.conditions.filter(c => c.bucket === filterBucket)
    })).filter(study => study.conditions.length > 0);
  }, [orgData?.studies, filterBucket]);

  // Flatten all conditions for heatmap strip (sorted by magnitude within each study)
  const allConditions = useMemo(() => {
    if (!filteredStudies.length) return [];

    const conditions = [];
    filteredStudies.forEach(study => {
      // Sort conditions by magnitude (most extreme first) within each study
      const sortedConditions = sortByMagnitude(study.conditions);
      sortedConditions.forEach(condition => {
        conditions.push({
          ...condition,
          studyId: study.study_id,
          studyName: study.study_id.replace(/_/g, ' '),
        });
      });
    });
    return conditions;
  }, [filteredStudies]);

  // Refs for scrolling to studies
  const studyRefs = useRef({});

  // Scroll to a specific study when clicking on heatmap
  const scrollToStudy = useCallback((studyId) => {
    // Make sure the study is expanded
    setExpandedStudies(prev => ({
      ...prev,
      [studyId]: true
    }));

    // Scroll to the study after a short delay to allow expansion
    setTimeout(() => {
      const studyElement = studyRefs.current[studyId];
      if (studyElement) {
        studyElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }, []);

  // Handle heatmap cell hover
  const handleHeatmapHover = useCallback((condition, event) => {
    if (condition) {
      const rect = event.currentTarget.getBoundingClientRect();
      setTooltipPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 10
      });
      setHoveredCondition(condition);
    } else {
      setHoveredCondition(null);
    }
  }, []);

  // Get unique buckets for filter from the selected organism's data
  const availableBuckets = useMemo(() => {
    if (!orgData?.studies) return [];
    const buckets = new Set();
    orgData.studies.forEach(study => {
      study.conditions.forEach(c => buckets.add(c.bucket));
    });
    return Array.from(buckets);
  }, [orgData?.studies]);

  // Set default organism if not already set and data is available
  useEffect(() => {
    if (organisms.length > 0 && !selectedOrganism) {
      const defaultOrg = getDefaultOrganism(organisms);
      if (defaultOrg && onOrganismChange) {
        onOrganismChange(defaultOrg);
      }
    }
  }, [organisms, selectedOrganism, onOrganismChange]);

  // Toggle handlers
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

  // Handle loading state
  if (loading) {
    return <div className="loading">Loading expression data...</div>;
  }

  // Handle error state
  if (error) {
    return <div className="error">Error loading expression data: {error}</div>;
  }

  // Handle no data at all
  if (!data || !data.results) {
    return <div className="no-data">No expression data available</div>;
  }

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
              <span className="summary-text">
                <strong>{orgData.total_conditions}</strong> conditions across <strong>{orgData.studies?.length || 0}</strong> studies
                {orgData.max_upregulation && (
                  <span className="summary-stat upregulated">
                    Max upregulation: <strong>{formatFoldChange(orgData.max_upregulation)}</strong>
                  </span>
                )}
                {orgData.max_downregulation && (
                  <span className="summary-stat downregulated">
                    Max downregulation: <strong>{formatFoldChange(orgData.max_downregulation)}</strong>
                  </span>
                )}
              </span>
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

              {/* Legend - matches bar opacity scale */}
              <div className="expression-legend">
                <span className="legend-title">Fold Change:</span>
                <span className="legend-item legend-down" style={{ backgroundColor: COLORS.down, opacity: 0.9 }}>↓ &lt;0.5x</span>
                <span className="legend-item legend-down" style={{ backgroundColor: COLORS.down, opacity: 0.6 }}>↓ 0.5–0.8x</span>
                <span className="legend-item" style={{ backgroundColor: COLORS.neutral }}>~1x</span>
                <span className="legend-item legend-up" style={{ backgroundColor: COLORS.up, opacity: 0.6 }}>↑ 1.2–2x</span>
                <span className="legend-item legend-up" style={{ backgroundColor: COLORS.up, opacity: 0.9 }}>↑ &gt;2x</span>
              </div>
              <div className="expression-baseline-guide">
                <span className="baseline-label-down">← down</span>
                <span className="baseline-center">1.0</span>
                <span className="baseline-label-up">up →</span>
              </div>

              {/* Debug: Always show heatmap section info */}
              {console.log('HEATMAP DEBUG:', { filteredStudies: filteredStudies.length, allConditions: allConditions.length, first3: allConditions.slice(0, 3) })}
              <div style={{ padding: '8px 12px', background: '#e3f2fd', border: '1px solid #2196f3', borderRadius: '4px', margin: '15px 0', fontSize: '13px' }}>
                <strong>Heatmap Debug:</strong> filteredStudies={filteredStudies.length}, allConditions={allConditions.length}
              </div>

              {/* Global Heatmap Strip */}
              {allConditions.length > 0 ? (
                <div className="expression-heatmap-strip">
                  <div className="heatmap-label">
                    <span className="heatmap-gene-name">{orgData.gene_name || orgData.feature_name}</span>
                    <span className="heatmap-condition-count">{allConditions.length} conditions</span>
                  </div>
                  <div className="heatmap-cells">
                    {allConditions.map((condition, index) => (
                      <div
                        key={`${condition.studyId}-${condition.condition_id}-${index}`}
                        className="heatmap-cell"
                        style={{
                          backgroundColor: getHeatmapColor(condition.fold_change, COLORS)
                        }}
                        onClick={() => scrollToStudy(condition.studyId)}
                        onMouseEnter={(e) => handleHeatmapHover(condition, e)}
                        onMouseLeave={() => handleHeatmapHover(null)}
                        role="button"
                        tabIndex={0}
                        aria-label={`${condition.label}: ${formatFoldChange(condition.fold_change)}`}
                      />
                    ))}
                  </div>
                  {/* Tooltip */}
                  {hoveredCondition && (
                    <div
                      className="heatmap-tooltip"
                      style={{
                        left: tooltipPosition.x,
                        top: tooltipPosition.y,
                      }}
                    >
                      <div className="tooltip-condition">{hoveredCondition.label}</div>
                      <div className="tooltip-fold-change">
                        {formatFoldChange(hoveredCondition.fold_change)}
                        {hoveredCondition.fold_change > 1 ? ' ↑' : hoveredCondition.fold_change < 1 ? ' ↓' : ''}
                      </div>
                      <div className="tooltip-study">{hoveredCondition.studyName}</div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ padding: '10px', background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '4px', margin: '20px 0' }}>
                  Debug: allConditions is empty (filteredStudies: {filteredStudies.length}, total conditions: {filteredStudies.reduce((sum, s) => sum + s.conditions.length, 0)})
                </div>
              )}

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
                    <div
                      key={study.study_id}
                      className="expression-study"
                      ref={el => studyRefs.current[study.study_id] = el}
                    >
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
                                          backgroundColor: BUCKET_INFO[condition.bucket]?.bg || 'transparent',
                                          color: BUCKET_INFO[condition.bucket]?.color || '#6b7280',
                                          border: `1px solid ${BUCKET_INFO[condition.bucket]?.border || '#d1d5db'}`
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
      ) : (
        <div className="no-data">
          {selectedOrganism
            ? `No expression data available for this gene in ${selectedOrganism}`
            : organisms.length === 0
              ? 'No expression data found'
              : 'Select an organism to view expression data'
          }
        </div>
      )}
    </div>
  );
}

export default ExpressionDetails;
