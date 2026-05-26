import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import './GeneDiagram.css';

/**
 * GeneDiagram - Visualizes guide RNA positions on a gene structure
 *
 * @param {Object} props
 * @param {number} props.geneLength - Length of the target sequence in bp
 * @param {string} props.geneName - Gene name for display
 * @param {string} props.strand - Gene strand (+ or -)
 * @param {Array} props.guides - Array of guide objects with position, strand, rank, combinedScore
 * @param {Function} props.onGuideClick - Optional callback when a guide marker is clicked
 */
function GeneDiagram({ geneLength, geneName, strand, guides, onGuideClick }) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!svgRef.current || !geneLength || !guides?.length) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    // Dimensions
    const margin = { top: 12, right: 40, bottom: 26, left: 60 };
    const width = containerRef.current?.clientWidth || 800;
    const geneHeight = 30;
    const innerWidth = width - margin.left - margin.right;
    const geneY = 90;
    const topLabelBaseY = 68;
    const bottomLabelBaseY = 158;
    const labelLaneHeight = 16;

    const svg = d3.select(svgRef.current)
      .attr('width', width);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scale for gene coordinates
    const xScale = d3.scaleLinear()
      .domain([1, geneLength])
      .range([0, innerWidth]);

    // Gene body (arrow shape showing direction)
    const arrowWidth = 15;

    let geneShape;
    if (strand === '+' || strand === 'W') {
      // Arrow pointing right (5' to 3')
      geneShape = [
        [0, geneY],
        [innerWidth - arrowWidth, geneY],
        [innerWidth, geneY + geneHeight / 2],
        [innerWidth - arrowWidth, geneY + geneHeight],
        [0, geneY + geneHeight]
      ];
    } else {
      // Arrow pointing left (3' to 5')
      geneShape = [
        [arrowWidth, geneY],
        [innerWidth, geneY],
        [innerWidth, geneY + geneHeight],
        [arrowWidth, geneY + geneHeight],
        [0, geneY + geneHeight / 2]
      ];
    }

    // Draw gene body
    g.append('polygon')
      .attr('points', geneShape.map(p => p.join(',')).join(' '))
      .attr('class', 'gene-body');

    // Color scale for guide scores (green = good, red = poor)
    const colorScale = d3.scaleLinear()
      .domain([0, 40, 60, 80, 100])
      .range(['#c62828', '#ff8f00', '#f9a825', '#7cb342', '#2e7d32']);

    // Create tooltip
    const tooltip = d3.select('body').append('div')
      .attr('class', 'gene-diagram-tooltip')
      .style('opacity', 0);

    // Draw guide markers
    const markerHeight = 25;
    const markerWidth = 3;

    const assignLabelLanes = (strandGuides) => {
      const lanes = [];
      const labelPlacementByRank = new Map();
      // Estimate label width based on rank digits (each digit ~7px, plus padding)
      const getLabelWidth = (rank) => String(rank).length * 7 + 8;
      const maxLanes = 5;

      strandGuides.forEach((guide) => {
        const guideX = xScale(guide.position);
        const labelWidth = getLabelWidth(guide.rank);
        let placement = null;

        for (let lane = 0; lane < maxLanes && !placement; lane += 1) {
          if (!lanes[lane]) {
            lanes[lane] = [];
          }

          // Check collision with existing labels in this lane
          const hasCollision = lanes[lane].some(existing => {
            const minSpacing = (labelWidth + existing.width) / 2 + 6;
            return Math.abs(guideX - existing.x) < minSpacing;
          });

          if (!hasCollision) {
            lanes[lane].push({ x: guideX, width: labelWidth });
            placement = { lane, xOffset: 0 };
          }
        }

        // If no lane available, use the last lane with a horizontal offset
        if (!placement) {
          const lane = maxLanes - 1;
          // Find a small horizontal offset to avoid direct overlap
          const existingInLane = lanes[lane].filter(existing => Math.abs(guideX - existing.x) < 20);
          const xOffset = existingInLane.length > 0 ? (existingInLane.length % 2 === 0 ? 8 : -8) : 0;
          lanes[lane].push({ x: guideX + xOffset, width: labelWidth });
          placement = { lane, xOffset };
        }

        labelPlacementByRank.set(guide.rank, placement);
      });

      return labelPlacementByRank;
    };

    // Sort guides by position and place labels into lanes to avoid overlap
    const topGuides = guides.filter(g => g.strand === '+').sort((a, b) => a.position - b.position);
    const bottomGuides = guides.filter(g => g.strand !== '+').sort((a, b) => a.position - b.position);
    const topLabelPlacements = assignLabelLanes(topGuides);
    const bottomLabelPlacements = assignLabelLanes(bottomGuides);
    const bottomLaneCount = bottomLabelPlacements.size
      ? Math.max(...Array.from(bottomLabelPlacements.values(), placement => placement.lane)) + 1
      : 1;
    const axisY = bottomLabelBaseY + ((bottomLaneCount - 1) * labelLaneHeight) + 24;
    const height = margin.top + axisY + margin.bottom;
    svg.attr('height', height);

    guides.forEach((guide) => {
      const x = xScale(guide.position);
      const isTopStrand = guide.strand === '+';
      const markerY = isTopStrand ? geneY - markerHeight + 10 : geneY + geneHeight - 10;

      const labelPlacement = (isTopStrand ? topLabelPlacements : bottomLabelPlacements).get(guide.rank) || { lane: 0, xOffset: 0 };
      const labelXOffset = labelPlacement.xOffset || 0;

      // Guide marker group
      const markerGroup = g.append('g')
        .attr('class', 'guide-marker')
        .attr('transform', `translate(${x}, 0)`)
        .style('cursor', 'pointer');

      // Vertical line
      markerGroup.append('rect')
        .attr('x', -markerWidth / 2)
        .attr('y', isTopStrand ? markerY : geneY + geneHeight)
        .attr('width', markerWidth)
        .attr('height', markerHeight)
        .attr('fill', colorScale(guide.combinedScore || guide.combined_score || 50))
        .attr('class', 'guide-line');

      // Arrow head indicating strand direction
      const arrowSize = 6;
      const arrowY = isTopStrand ? markerY : markerY + markerHeight;
      markerGroup.append('polygon')
        .attr('points', isTopStrand
          ? `${-arrowSize},${arrowY + arrowSize} 0,${arrowY} ${arrowSize},${arrowY + arrowSize}`
          : `${-arrowSize},${arrowY - arrowSize} 0,${arrowY} ${arrowSize},${arrowY - arrowSize}`)
        .attr('fill', colorScale(guide.combinedScore || guide.combined_score || 50));

      const labelY = isTopStrand
        ? topLabelBaseY - (labelPlacement.lane * labelLaneHeight)
        : bottomLabelBaseY + (labelPlacement.lane * labelLaneHeight);

      // Draw leader line connecting label to arrow when label is offset (in higher lanes or horizontally shifted)
      if (labelPlacement.lane > 0 || labelXOffset !== 0) {
        const arrowTipY = isTopStrand ? arrowY + arrowSize : arrowY - arrowSize;
        const labelBottomY = isTopStrand ? labelY + 3 : labelY - 10;
        markerGroup.append('path')
          .attr('d', `M0,${arrowTipY} L${labelXOffset},${labelBottomY}`)
          .attr('stroke', '#999')
          .attr('stroke-width', 1)
          .attr('stroke-dasharray', '2,2')
          .attr('fill', 'none')
          .attr('class', 'guide-leader-line');
      }

      markerGroup.append('text')
        .attr('x', labelXOffset)
        .attr('y', labelY)
        .attr('text-anchor', 'middle')
        .attr('class', 'guide-rank')
        .text(guide.rank);

      // Mouse events
      markerGroup
        .on('mouseover', (event) => {
          tooltip.transition()
            .duration(200)
            .style('opacity', 0.95);
          tooltip.html(`
            <div class="tooltip-title">Guide #${guide.rank}</div>
            <div><strong>Position:</strong> ${guide.position} bp (${guide.strand})</div>
            <div><strong>Sequence:</strong> <code>${guide.sequence}</code></div>
            <div><strong>Score:</strong> ${(guide.combinedScore || guide.combined_score || 0).toFixed(1)}</div>
          `)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 10) + 'px');
        })
        .on('mouseout', () => {
          tooltip.transition()
            .duration(300)
            .style('opacity', 0);
        })
        .on('click', () => {
          if (onGuideClick) {
            onGuideClick(guide.rank);
          }
        });
    });

    // X-axis (bp scale)
    const xAxis = d3.axisBottom(xScale)
      .ticks(Math.min(10, Math.floor(geneLength / 100)))
      .tickFormat(d => `${d} bp`);

    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${axisY})`)
      .call(xAxis);

    // Gene name label
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', geneY + geneHeight / 2 + 4)
      .attr('text-anchor', 'middle')
      .attr('class', 'gene-label')
      .text(geneName);

    // 5' / 3' labels
    g.append('text')
      .attr('x', strand === '+' || strand === 'W' ? -10 : innerWidth + 10)
      .attr('y', geneY + geneHeight / 2 + 4)
      .attr('text-anchor', strand === '+' || strand === 'W' ? 'end' : 'start')
      .attr('class', 'end-label')
      .text("5'");

    g.append('text')
      .attr('x', strand === '+' || strand === 'W' ? innerWidth + 10 : -10)
      .attr('y', geneY + geneHeight / 2 + 4)
      .attr('text-anchor', strand === '+' || strand === 'W' ? 'start' : 'end')
      .attr('class', 'end-label')
      .text("3'");

    // Legend
    const legendX = innerWidth - 190;
    const legendY = 18;
    const legendPadding = 6;
    const legendWidth = 250;
    const legendHeight = 22;
    const legendItemSpacing = 65;
    const legendItems = [
      { label: 'High', color: '#2e7d32' },
      { label: 'Med', color: '#f9a825' },
      { label: 'Low', color: '#c62828' }
    ];

    // Legend background with padding
    g.append('rect')
      .attr('x', legendX - 45 - legendPadding)
      .attr('y', legendY - legendPadding)
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .attr('rx', 3)
      .attr('ry', 3)
      .attr('fill', '#f5f5f5')
      .attr('stroke', '#e0e0e0')
      .attr('stroke-width', 1);

    g.append('text')
      .attr('x', legendX - 40)
      .attr('y', legendY + 10)
      .attr('class', 'legend-title')
      .text('Score:');

    legendItems.forEach((item, i) => {
      g.append('rect')
        .attr('x', legendX + 10 + i * legendItemSpacing)
        .attr('y', legendY)
        .attr('width', 12)
        .attr('height', 12)
        .attr('fill', item.color);

      g.append('text')
        .attr('x', legendX + 10 + i * legendItemSpacing + 16)
        .attr('y', legendY + 10)
        .attr('class', 'legend-label')
        .text(item.label);
    });

    // Cleanup tooltip on unmount
    return () => {
      d3.selectAll('.gene-diagram-tooltip').remove();
    };
  }, [geneLength, geneName, strand, guides, onGuideClick]);

  if (!geneLength || !guides?.length) {
    return null;
  }

  return (
    <div className="gene-diagram-container" ref={containerRef}>
      <div className="gene-diagram-header">
        <h4>Guide Distribution</h4>
        <span className="guide-count">{guides.length} guides shown</span>
      </div>
      <svg ref={svgRef} className="gene-diagram-svg" />
      <div className="gene-diagram-legend">
        <span className="legend-item">
          <span className="marker top">▲</span> sense strand (+)
        </span>
        <span className="legend-item">
          <span className="marker bottom">▼</span> antisense strand (-)
        </span>
      </div>
    </div>
  );
}

export default GeneDiagram;
