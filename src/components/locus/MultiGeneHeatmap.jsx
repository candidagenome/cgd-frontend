import React, { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './LocusComponents.css';

// Color palette matching ExpressionDetails
const COLORS = {
  up: '#c07a7a',
  down: '#5f7fa6',
  neutral: '#e5e7eb',
  noData: '#f5f5f5',
};

// Get color for heatmap cell based on fold change
const getHeatmapColor = (fc, colors) => {
  if (fc == null) return colors.noData;

  const logFc = Math.log2(fc);
  const magnitude = Math.abs(logFc);

  if (magnitude < 0.15) {
    return colors.neutral;
  }

  const isUp = fc >= 1;
  const baseColor = isUp ? colors.up : colors.down;

  const clampedMag = Math.min(magnitude, 2.0);
  const opacity = 0.45 + (clampedMag * 0.225);

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
  onClose
}) {
  const [hoveredCell, setHoveredCell] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [selectedStudy, setSelectedStudy] = useState('all');

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

  // Filter conditions by selected study
  const filteredConditions = useMemo(() => {
    if (selectedStudy === 'all') return conditions;
    return conditions.filter(c => c.studyId === selectedStudy);
  }, [conditions, selectedStudy]);

  // Handle cell hover
  const handleCellHover = useCallback((gene, condition, fc, event) => {
    if (gene && condition) {
      const rect = event.currentTarget.getBoundingClientRect();
      setTooltipPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
      });
      setHoveredCell({ gene, condition, fc });
    } else {
      setHoveredCell(null);
    }
  }, []);

  if (loading) {
    return (
      <div className="multi-gene-heatmap-overlay">
        <div className="multi-gene-heatmap-modal">
          <div className="multi-gene-heatmap-loading">
            <div className="loading-spinner"></div>
            <p>Loading expression data for {expressionData?.length || 0} genes...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!expressionData || expressionData.length === 0) {
    return (
      <div className="multi-gene-heatmap-overlay">
        <div className="multi-gene-heatmap-modal">
          <div className="multi-gene-heatmap-header">
            <h3>Co-expression Heatmap</h3>
            <button className="close-btn" onClick={onClose}>&times;</button>
          </div>
          <div className="no-data">No expression data available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="multi-gene-heatmap-overlay" onClick={onClose}>
      <div className="multi-gene-heatmap-modal" onClick={e => e.stopPropagation()}>
        <div className="multi-gene-heatmap-header">
          <h3>Co-expression Heatmap</h3>
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
          </div>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="multi-gene-heatmap-legend">
          <span className="legend-title">Fold Change:</span>
          <span className="legend-item" style={{ backgroundColor: COLORS.down, opacity: 0.9 }}>↓ &lt;0.5x</span>
          <span className="legend-item" style={{ backgroundColor: COLORS.down, opacity: 0.6 }}>↓ 0.5–0.8x</span>
          <span className="legend-item" style={{ backgroundColor: COLORS.neutral }}>~1x</span>
          <span className="legend-item" style={{ backgroundColor: COLORS.up, opacity: 0.6 }}>↑ 1.2–2x</span>
          <span className="legend-item" style={{ backgroundColor: COLORS.up, opacity: 0.9 }}>↑ &gt;2x</span>
          <span className="legend-item" style={{ backgroundColor: COLORS.noData }}>No data</span>
        </div>

        <div className="multi-gene-heatmap-container">
          <div className="heatmap-content">
            {/* Gene labels column */}
            <div className="heatmap-gene-labels">
              <div className="heatmap-corner"></div>
              {geneRows.map((gene, idx) => (
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
                  {filteredConditions.map(condition => {
                    const fc = gene.foldChanges[condition.id];
                    return (
                      <div
                        key={`${gene.geneName}-${condition.id}`}
                        className="heatmap-cell"
                        style={{
                          backgroundColor: getHeatmapColor(fc, COLORS)
                        }}
                        onMouseEnter={(e) => handleCellHover(gene, condition, fc, e)}
                        onMouseLeave={() => handleCellHover(null, null, null, null)}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tooltip */}
        {hoveredCell && (
          <div
            className="heatmap-tooltip"
            style={{
              left: tooltipPosition.x,
              top: tooltipPosition.y,
              position: 'fixed',
              transform: 'translateX(-50%) translateY(-100%)',
            }}
          >
            <div className="tooltip-gene">{hoveredCell.gene.displayName}</div>
            <div className="tooltip-condition">{hoveredCell.condition.label}</div>
            <div className="tooltip-fold-change">
              {formatFoldChange(hoveredCell.fc)}
              {hoveredCell.fc > 1 ? ' ↑' : hoveredCell.fc < 1 ? ' ↓' : ''}
            </div>
            <div className="tooltip-study">{hoveredCell.condition.studyName}</div>
          </div>
        )}

        <div className="multi-gene-heatmap-footer">
          <span className="heatmap-info">
            {geneRows.length} genes × {filteredConditions.length} conditions
          </span>
        </div>
      </div>
    </div>
  );
}

export default MultiGeneHeatmap;
