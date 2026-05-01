import React, { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './LocusComponents.css';

// Color palette - publication-quality with balanced visual weight
const COLORS = {
  up: '#C41E3A',      // crimson red for upregulation (slightly more vibrant)
  down: '#5080B0',    // softer steel blue for downregulation (less heavy)
  neutral: '#f7f7f7', // very light neutral (almost white)
  noData: '#eeeeee',  // slightly visible for "no data"
};

// Category/bucket colors for the category bar
const CATEGORY_COLORS = {
  control: '#9e9e9e',
  basic_biology: '#4caf50',
  kill_candida: '#f44336',
  stress: '#ff9800',
};

const CATEGORY_LABELS = {
  control: 'Control',
  basic_biology: 'Growth & Physiology',
  kill_candida: 'Host Interaction',
  stress: 'Stress Response',
};

// Sort options
const SORT_OPTIONS = [
  { value: 'study', label: 'By Study' },
  { value: 'foldchange', label: 'By Fold Change' },
  { value: 'clustered', label: 'Clustered' },
];

// Get color for heatmap cell based on fold change (log2 scale)
const getHeatmapColor = (fc, colors) => {
  if (fc == null) return colors.noData;

  const logFc = Math.log2(fc);
  const magnitude = Math.abs(logFc);

  // Very small changes → neutral (almost white)
  if (magnitude < 0.2) {
    return colors.neutral;
  }

  const isUp = fc >= 1;
  const baseColor = isUp ? colors.up : colors.down;

  // Asymmetric scaling: reds get more contrast at high end, blues stay softer
  const clampedMag = Math.min(magnitude, 2.5);
  let opacity;
  if (isUp) {
    // Reds: steeper curve for more contrast at high end (>2x pops more)
    opacity = 0.30 + (clampedMag * 0.28);
  } else {
    // Blues: gentler curve to reduce visual weight
    opacity = 0.25 + (clampedMag * 0.22);
  }

  const r = parseInt(baseColor.slice(1, 3), 16);
  const g = parseInt(baseColor.slice(3, 5), 16);
  const b = parseInt(baseColor.slice(5, 7), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// Format fold change for display
const formatFoldChange = (fc) => {
  if (fc == null) return '-';
  return `${fc.toFixed(2)}x`;
};

function MultiGeneHeatmap({
  queryGene,
  similarGenes,
  expressionData,
  loading,
  onClose,
  inline = false
}) {
  const [hoveredCell, setHoveredCell] = useState(null);
  const [selectedStudy, setSelectedStudy] = useState('all');
  const [sortBy, setSortBy] = useState('clustered');

  // Build condition map from all genes' expression data
  const { conditions, studies, geneRows } = useMemo(() => {
    if (!expressionData || expressionData.length === 0) {
      return { conditions: [], studies: [], geneRows: [] };
    }

    // Collect all unique conditions and studies
    const conditionMap = new Map(); // condition_id -> { label, studyId, studyName }
    const studySet = new Set();

    expressionData.forEach(({ data }) => {
      if (!data?.studies) return;
      data.studies.forEach(study => {
        studySet.add(study.study_id);
        study.conditions.forEach(condition => {
          if (!conditionMap.has(condition.condition_id)) {
            conditionMap.set(condition.condition_id, {
              id: condition.condition_id,
              label: condition.label,
              studyId: study.study_id,
              studyName: study.study_id.replace(/_/g, ' '),
              bucket: condition.bucket || 'basic_biology',
            });
          }
        });
      });
    });

    // Convert to arrays
    const conditionsArr = Array.from(conditionMap.values());
    const studiesArr = Array.from(studySet).sort();

    // Build gene rows with fold change for each condition
    const rows = expressionData.map(({ geneName, data }, index) => {
      const foldChanges = {};

      if (data?.studies) {
        data.studies.forEach(study => {
          study.conditions.forEach(condition => {
            foldChanges[condition.condition_id] = condition.fold_change;
          });
        });
      }

      return {
        geneName,
        displayName: data?.gene_name || geneName,
        featureName: data?.feature_name || geneName,
        isQuery: index === 0,
        correlation: similarGenes?.find(g =>
          g.feature_name === geneName || g.gene_name === geneName
        )?.correlation,
        foldChanges,
      };
    });

    return {
      conditions: conditionsArr,
      studies: studiesArr,
      geneRows: rows
    };
  }, [expressionData, similarGenes]);

  // Filter and sort conditions
  const filteredConditions = useMemo(() => {
    let filtered = selectedStudy === 'all'
      ? [...conditions]
      : conditions.filter(c => c.studyId === selectedStudy);

    // Apply sorting
    if (sortBy === 'study') {
      // Sort by study, then by condition label within study
      filtered.sort((a, b) => {
        const studyCompare = a.studyId.localeCompare(b.studyId);
        if (studyCompare !== 0) return studyCompare;
        return a.label.localeCompare(b.label);
      });
    } else if (sortBy === 'foldchange') {
      // Sort by query gene's fold change magnitude (most extreme first)
      const queryRow = geneRows[0];
      if (queryRow) {
        filtered.sort((a, b) => {
          const fcA = queryRow.foldChanges[a.id];
          const fcB = queryRow.foldChanges[b.id];
          const magA = fcA != null ? Math.abs(Math.log2(fcA)) : -1;
          const magB = fcB != null ? Math.abs(Math.log2(fcB)) : -1;
          return magB - magA; // Descending by magnitude
        });
      }
    } else if (sortBy === 'clustered') {
      // Simple clustering: sort by average fold change pattern similarity
      // Compute average fold change across all genes for each condition
      const conditionAvgs = new Map();
      filtered.forEach(cond => {
        let sum = 0;
        let count = 0;
        geneRows.forEach(gene => {
          const fc = gene.foldChanges[cond.id];
          if (fc != null) {
            sum += Math.log2(fc);
            count++;
          }
        });
        conditionAvgs.set(cond.id, count > 0 ? sum / count : 0);
      });

      // Sort by average (groups similar conditions together)
      filtered.sort((a, b) => {
        const avgA = conditionAvgs.get(a.id) || 0;
        const avgB = conditionAvgs.get(b.id) || 0;
        return avgB - avgA; // Descending (upregulated first)
      });
    }

    return filtered;
  }, [conditions, selectedStudy, sortBy, geneRows]);

  // Get unique categories for the category bar
  const uniqueCategories = useMemo(() => {
    const cats = new Set(filteredConditions.map(c => c.bucket));
    return Array.from(cats);
  }, [filteredConditions]);

  // Handle cell hover - updates the info bar above heatmap
  const handleCellHover = useCallback((gene, condition, fc) => {
    if (gene && condition) {
      setHoveredCell({ gene, condition, fc });
    } else {
      setHoveredCell(null);
    }
  }, []);

  if (loading) {
    const loadingContent = (
      <div className="multi-gene-heatmap-loading">
        <div className="loading-spinner"></div>
        <p>Loading expression data...</p>
      </div>
    );

    if (inline) {
      return <div className="multi-gene-heatmap-inline">{loadingContent}</div>;
    }

    return (
      <div className="multi-gene-heatmap-overlay">
        <div className="multi-gene-heatmap-modal">{loadingContent}</div>
      </div>
    );
  }

  if (!expressionData || expressionData.length === 0) {
    const emptyContent = <div className="no-data">No expression data available</div>;

    if (inline) {
      return <div className="multi-gene-heatmap-inline">{emptyContent}</div>;
    }

    return (
      <div className="multi-gene-heatmap-overlay">
        <div className="multi-gene-heatmap-modal">
          <div className="multi-gene-heatmap-header">
            <h3>Co-expression Heatmap</h3>
            <button className="close-btn" onClick={onClose}>&times;</button>
          </div>
          {emptyContent}
        </div>
      </div>
    );
  }

  // Header with controls
  const headerContent = (
    <div className={`multi-gene-heatmap-header ${inline ? 'inline-header' : ''}`}>
      {!inline && <h3>Co-expression Heatmap</h3>}
      <div className="heatmap-controls">
        <label>Study:</label>
        <select
          value={selectedStudy}
          onChange={(e) => setSelectedStudy(e.target.value)}
        >
          <option value="all">All studies ({conditions.length} conditions)</option>
          {studies.map(studyId => {
            const count = conditions.filter(c => c.studyId === studyId).length;
            return (
              <option key={studyId} value={studyId}>
                {studyId.replace(/_/g, ' ')} ({count})
              </option>
            );
          })}
        </select>

        <label>Sort:</label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          {SORT_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      {!inline && <button className="close-btn" onClick={onClose}>&times;</button>}
    </div>
  );

  // Legend content with gradient bar
  const legendContent = (
    <div className="multi-gene-heatmap-legend">
      <span className="legend-title">Fold Change:</span>
      <div className="fold-change-gradient-legend">
        <span className="gradient-label">↓ 0.5x</span>
        <div className="gradient-bar">
          <div className="gradient-fill"></div>
        </div>
        <span className="gradient-label">2x ↑</span>
      </div>
      <span className="legend-item no-data-legend" style={{ backgroundColor: COLORS.noData }}>No data</span>

      <span className="legend-divider">|</span>
      <span className="legend-title">Category:</span>
      {Object.entries(CATEGORY_COLORS).map(([key, color]) => (
        <span key={key} className="legend-item category-legend-item">
          <span className="category-swatch" style={{ backgroundColor: color }}></span>
          {CATEGORY_LABELS[key]}
        </span>
      ))}
    </div>
  );

  // Main heatmap content
  const heatmapContent = (
    <>
      {/* Hover info bar - fixed position above heatmap */}
      <div className="heatmap-hover-info">
        {hoveredCell ? (
          <>
            <span className="hover-info-gene">{hoveredCell.gene.displayName}</span>
            <span className="hover-info-separator">|</span>
            <span className="hover-info-condition">{hoveredCell.condition.label}</span>
            <span className="hover-info-separator">|</span>
            <span className={`hover-info-fc ${hoveredCell.fc > 1 ? 'fc-up' : hoveredCell.fc < 1 ? 'fc-down' : ''}`}>
              {formatFoldChange(hoveredCell.fc)}
              {hoveredCell.fc > 1 ? ' ↑' : hoveredCell.fc < 1 ? ' ↓' : ''}
            </span>
            <span className="hover-info-separator">|</span>
            <span className="hover-info-category">{CATEGORY_LABELS[hoveredCell.condition.bucket] || hoveredCell.condition.bucket}</span>
            <span className="hover-info-separator">|</span>
            <span className="hover-info-study">{hoveredCell.condition.studyName}</span>
          </>
        ) : (
          <span className="hover-info-placeholder">Hover over a cell to see details</span>
        )}
      </div>

      <div className="multi-gene-heatmap-container">
        <div className="heatmap-content">
          {/* Gene labels column */}
          <div className="heatmap-gene-labels">
            <div className="heatmap-corner">
              <div className="corner-category-label">Category</div>
            </div>
            {geneRows.map((gene) => (
              <div
                key={gene.geneName}
                className={`heatmap-gene-label ${gene.isQuery ? 'query-gene' : ''}`}
              >
                <Link to={`/locus/${gene.featureName}`}>
                  {gene.displayName}
                </Link>
                {gene.correlation != null && (
                  <span className="gene-correlation">
                    r={gene.correlation.toFixed(2)}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Heatmap grid */}
          <div className="heatmap-grid-wrapper">
            {/* Category color bar */}
            <div className="heatmap-category-bar">
              {filteredConditions.map((condition, idx) => {
                const prevBucket = idx > 0 ? filteredConditions[idx - 1].bucket : null;
                const isBoundary = prevBucket && prevBucket !== condition.bucket;
                return (
                  <div
                    key={`cat-${condition.id}`}
                    className={`category-cell ${isBoundary ? 'category-boundary' : ''}`}
                    style={{
                      backgroundColor: CATEGORY_COLORS[condition.bucket] || '#ccc'
                    }}
                    title={CATEGORY_LABELS[condition.bucket] || condition.bucket}
                  />
                );
              })}
            </div>

            {/* Condition headers */}
            <div className="heatmap-condition-headers">
              {filteredConditions.map(condition => (
                <div
                  key={condition.id}
                  className="heatmap-condition-header"
                  title={`${condition.label} (${condition.studyName})`}
                >
                  <span className="condition-label-rotated">
                    {condition.label.length > 15
                      ? condition.label.slice(0, 15) + '...'
                      : condition.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Gene rows */}
            {geneRows.map((gene) => (
              <div
                key={gene.geneName}
                className={`heatmap-row ${gene.isQuery ? 'query-row' : ''}`}
              >
                {filteredConditions.map((condition, idx) => {
                  const fc = gene.foldChanges[condition.id];
                  const prevBucket = idx > 0 ? filteredConditions[idx - 1].bucket : null;
                  const isBoundary = prevBucket && prevBucket !== condition.bucket;
                  return (
                    <div
                      key={`${gene.geneName}-${condition.id}`}
                      className={`heatmap-cell ${isBoundary ? 'category-boundary' : ''}`}
                      style={{
                        backgroundColor: getHeatmapColor(fc, COLORS)
                      }}
                      onMouseEnter={() => handleCellHover(gene, condition, fc)}
                      onMouseLeave={() => handleCellHover(null, null, null)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="multi-gene-heatmap-footer">
        <span className="heatmap-info">
          {geneRows.length} genes × {filteredConditions.length} conditions
        </span>
      </div>
    </>
  );

  // Render inline or modal
  if (inline) {
    return (
      <div className="multi-gene-heatmap-inline">
        {headerContent}
        {legendContent}
        {heatmapContent}
      </div>
    );
  }

  return (
    <div className="multi-gene-heatmap-overlay" onClick={onClose}>
      <div className="multi-gene-heatmap-modal" onClick={e => e.stopPropagation()}>
        {headerContent}
        {legendContent}
        {heatmapContent}
      </div>
    </div>
  );
}

export default MultiGeneHeatmap;
