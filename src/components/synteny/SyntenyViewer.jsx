import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import * as d3 from 'd3';
import { locusApi } from '../../api/locusApi';
import './SyntenyViewer.css';

// Color scheme for synteny visualization - Sybil-inspired style
const COLORS = {
  queryGene: '#d32f2f',        // Strong red - query gene
  queryHighlight: 'rgba(255, 182, 193, 0.4)',  // Light pink for vertical query column
  orthologGene: '#3498db',     // Blue - gene with orthologs
  singletonGene: '#95a5a6',    // Gray - gene without orthologs
  watsonStrand: '#2ecc71',     // Green - Watson strand indicator
  crickStrand: '#9b59b6',      // Purple - Crick strand indicator
  ribbon: '#c0c0c0',           // Gray for Sybil-style ribbons
  ribbonStroke: '#a0a0a0',     // Slightly darker gray for ribbon borders
  chromosome: '#ecf0f1',       // Very light gray for chromosome
  text: '#2c3e50',             // Dark text
};

// Species abbreviations for compact display
const SPECIES_ABBREV = {
  'Candida albicans SC5314': 'C. albicans',
  'Candida glabrata CBS138': 'C. glabrata',
  'Candida parapsilosis CDC317': 'C. parapsilosis',
  'Candida dubliniensis CD36': 'C. dubliniensis',
  'Candida tropicalis MYA-3404': 'C. tropicalis',
};

// Generate distinct colors for ortholog groups
function getOrthologColor(orthologId, colorScale) {
  if (!orthologId) return COLORS.singletonGene;
  return colorScale(orthologId);
}

function SyntenyViewer({ locusName, queryOrganism, flankingCount = 10 }) {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syntenyData, setSyntenyData] = useState(null);
  const [visibleSpecies, setVisibleSpecies] = useState({});
  const [tooltip, setTooltip] = useState({ show: false, content: null });

  const navigate = useNavigate();
  const dateStamp = new Date().toISOString().split('T')[0];

  // Fetch synteny data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await locusApi.getSyntenyData(locusName, flankingCount);
        setSyntenyData(data);
        // Initialize all species as visible
        const speciesVisible = {};
        Object.keys(data.synteny_regions || {}).forEach(sp => {
          speciesVisible[sp] = true;
        });
        setVisibleSpecies(speciesVisible);
      } catch (err) {
        setError(err.response?.data?.detail || err.message || 'Failed to load synteny data');
      } finally {
        setLoading(false);
      }
    };

    if (locusName) {
      fetchData();
    }
  }, [locusName, flankingCount]);

  // Handle gene click navigation
  const handleGeneClick = useCallback((featureName) => {
    navigate(`/locus/${encodeURIComponent(featureName)}`);
  }, [navigate]);

  // Draw the synteny visualization
  useEffect(() => {
    if (!syntenyData || !containerRef.current) return;

    // Clear existing SVG
    d3.select(containerRef.current).selectAll('svg').remove();

    const regions = syntenyData.synteny_regions || {};
    const connections = syntenyData.ortholog_connections || [];

    // Filter to visible species
    const visibleRegions = Object.entries(regions)
      .filter(([sp]) => visibleSpecies[sp])
      .map(([sp, region]) => ({ species: sp, ...region }));

    if (visibleRegions.length === 0) {
      return;
    }

    // Layout configuration
    const margin = { top: 40, right: 40, bottom: 40, left: 160 };
    const trackHeight = 50;
    const trackSpacing = 80;
    const geneHeight = 30;
    const width = containerRef.current.clientWidth - margin.left - margin.right;
    const height = visibleRegions.length * (trackHeight + trackSpacing) + margin.top + margin.bottom;

    // Create SVG
    const svg = d3.select(containerRef.current)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height)
      .attr('class', 'synteny-svg');

    svgRef.current = svg.node();

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create color scale for ortholog groups
    const orthologIds = new Set();
    connections.forEach(conn => orthologIds.add(conn.ortholog_id));
    const colorScale = d3.scaleOrdinal(d3.schemeTableau10)
      .domain(Array.from(orthologIds));

    // Build gene-to-ortholog lookup
    const geneToOrtholog = {};
    connections.forEach(conn => {
      conn.genes.forEach(gene => {
        geneToOrtholog[gene] = conn.ortholog_id;
      });
    });

    // Calculate coordinate ranges for each species
    const speciesData = visibleRegions.map((region, idx) => {
      const genes = region.genes || [];
      const minCoord = genes.length > 0 ? Math.min(...genes.map(g => g.start)) : 0;
      const maxCoord = genes.length > 0 ? Math.max(...genes.map(g => g.stop)) : 1000;
      return {
        ...region,
        index: idx,
        minCoord,
        maxCoord,
        yPosition: idx * (trackHeight + trackSpacing),
      };
    });

    // Create scales for each species track
    const xScales = {};
    speciesData.forEach(sd => {
      const padding = (sd.maxCoord - sd.minCoord) * 0.05;
      xScales[sd.species] = d3.scaleLinear()
        .domain([sd.minCoord - padding, sd.maxCoord + padding])
        .range([0, width]);
    });

    // Draw tracks and genes for each species
    speciesData.forEach(sd => {
      const trackGroup = g.append('g')
        .attr('class', 'species-track')
        .attr('transform', `translate(0,${sd.yPosition})`);

      // Species label
      trackGroup.append('text')
        .attr('x', -10)
        .attr('y', trackHeight / 2)
        .attr('text-anchor', 'end')
        .attr('dominant-baseline', 'middle')
        .attr('class', 'species-label')
        .style('font-style', 'italic')
        .text(SPECIES_ABBREV[sd.species] || sd.species);

      // Chromosome line
      trackGroup.append('line')
        .attr('x1', 0)
        .attr('x2', width)
        .attr('y1', trackHeight / 2)
        .attr('y2', trackHeight / 2)
        .attr('class', 'chromosome-line');

      // Draw genes
      const xScale = xScales[sd.species];
      const genes = sd.genes || [];

      genes.forEach(gene => {
        const geneGroup = trackGroup.append('g')
          .attr('class', 'gene-group')
          .style('cursor', 'pointer');

        const x = xScale(gene.start);
        const geneWidth = Math.max(xScale(gene.stop) - xScale(gene.start), 4);
        const y = (trackHeight - geneHeight) / 2;

        const orthologId = geneToOrtholog[gene.feature_name];
        let fillColor;
        if (gene.is_query) {
          fillColor = COLORS.queryGene;
        } else if (orthologId) {
          fillColor = getOrthologColor(orthologId, colorScale);
        } else {
          fillColor = COLORS.singletonGene;
        }

        // Gene rectangle with direction indicator
        if (gene.strand === 'W') {
          // Watson strand - arrow pointing right
          const points = [
            [x, y],
            [x + geneWidth - 6, y],
            [x + geneWidth, y + geneHeight / 2],
            [x + geneWidth - 6, y + geneHeight],
            [x, y + geneHeight],
          ];
          geneGroup.append('polygon')
            .attr('points', points.map(p => p.join(',')).join(' '))
            .attr('fill', fillColor)
            .attr('stroke', gene.is_query ? '#c0392b' : '#666')
            .attr('stroke-width', gene.is_query ? 2 : 1)
            .attr('class', 'gene-shape');
        } else {
          // Crick strand - arrow pointing left
          const points = [
            [x, y + geneHeight / 2],
            [x + 6, y],
            [x + geneWidth, y],
            [x + geneWidth, y + geneHeight],
            [x + 6, y + geneHeight],
          ];
          geneGroup.append('polygon')
            .attr('points', points.map(p => p.join(',')).join(' '))
            .attr('fill', fillColor)
            .attr('stroke', gene.is_query ? '#c0392b' : '#666')
            .attr('stroke-width', gene.is_query ? 2 : 1)
            .attr('class', 'gene-shape');
        }

        // Gene label (only show for query gene or if enough space)
        if (gene.is_query || geneWidth > 50) {
          geneGroup.append('text')
            .attr('x', x + geneWidth / 2)
            .attr('y', y + geneHeight / 2)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('class', 'gene-label')
            .style('font-size', '10px')
            .style('fill', '#fff')
            .style('pointer-events', 'none')
            .text(gene.gene_name || gene.feature_name.substring(0, 8));
        }

        // Click handler
        geneGroup.on('click', () => handleGeneClick(gene.feature_name));

        // Hover handlers for tooltip
        geneGroup.on('mouseenter', () => {
          setTooltip({
            show: true,
            content: {
              featureName: gene.feature_name,
              geneName: gene.gene_name,
              start: gene.start,
              stop: gene.stop,
              strand: gene.strand === 'W' ? 'Watson (+)' : 'Crick (-)',
              orthologId: orthologId,
            },
          });
        });

        geneGroup.on('mouseleave', () => {
          setTooltip({ show: false, content: null });
        });
      });
    });

    // Find query gene's ortholog_id for highlighting
    let queryOrthologId = null;
    speciesData.forEach(sd => {
      const genes = sd.genes || [];
      const queryGene = genes.find(g => g.is_query);
      if (queryGene) {
        queryOrthologId = geneToOrtholog[queryGene.feature_name];
      }
    });

    // Draw Sybil-style ribbon connections between tracks (insert at beginning so genes render on top)
    const connectionsGroup = g.insert('g', ':first-child').attr('class', 'connections-group');

    connections.forEach(conn => {
      const isQueryConnection = conn.ortholog_id === queryOrthologId;
      const genePositions = [];

      // Find gene positions across species (with full boundary info for ribbons)
      speciesData.forEach(sd => {
        const genes = sd.genes || [];
        genes.forEach(gene => {
          if (conn.genes.includes(gene.feature_name)) {
            const xScale = xScales[sd.species];
            const x = xScale(gene.start);
            const geneWidth = Math.max(xScale(gene.stop) - xScale(gene.start), 4);
            genePositions.push({
              species: sd.species,
              speciesIndex: sd.index,
              xLeft: x,
              xRight: x + geneWidth,
              yTop: sd.yPosition + (trackHeight - geneHeight) / 2,
              yBottom: sd.yPosition + (trackHeight + geneHeight) / 2,
            });
          }
        });
      });

      // Sort by species index to ensure correct drawing order
      genePositions.sort((a, b) => a.speciesIndex - b.speciesIndex);

      // Draw trapezoid ribbons between consecutive species (Sybil style)
      for (let i = 0; i < genePositions.length - 1; i++) {
        const p1 = genePositions[i];
        const p2 = genePositions[i + 1];

        if (p1.species === p2.species) continue;

        // Create trapezoid polygon connecting the two genes
        const points = [
          [p1.xLeft, p1.yBottom],   // bottom-left of top gene
          [p1.xRight, p1.yBottom],  // bottom-right of top gene
          [p2.xRight, p2.yTop],     // top-right of bottom gene
          [p2.xLeft, p2.yTop],      // top-left of bottom gene
        ];

        connectionsGroup.append('polygon')
          .attr('points', points.map(p => p.join(',')).join(' '))
          .attr('fill', COLORS.ribbon)
          .attr('fill-opacity', isQueryConnection ? 0.7 : 0.5)
          .attr('stroke', COLORS.ribbonStroke)
          .attr('stroke-width', 0.5)
          .attr('stroke-opacity', 0.3)
          .attr('class', 'ortholog-connection');
      }
    });

    // Draw vertical query highlight column (Sybil style)
    if (queryOrthologId) {
      const queryGenePositions = [];
      speciesData.forEach(sd => {
        const genes = sd.genes || [];
        genes.forEach(gene => {
          const orthologId = geneToOrtholog[gene.feature_name];
          if (orthologId === queryOrthologId) {
            const xScale = xScales[sd.species];
            const x = xScale(gene.start);
            const geneWidth = Math.max(xScale(gene.stop) - xScale(gene.start), 4);
            queryGenePositions.push({
              xLeft: x,
              xRight: x + geneWidth,
              yTop: sd.yPosition,
              yBottom: sd.yPosition + trackHeight,
            });
          }
        });
      });

      // Draw highlight rectangles for each query ortholog
      if (queryGenePositions.length > 0) {
        const highlightGroup = g.insert('g', ':first-child').attr('class', 'query-highlight-group');
        queryGenePositions.forEach(pos => {
          const padding = 6;
          highlightGroup.append('rect')
            .attr('x', pos.xLeft - padding)
            .attr('y', pos.yTop - 6)
            .attr('width', pos.xRight - pos.xLeft + padding * 2)
            .attr('height', pos.yBottom - pos.yTop + 12)
            .attr('fill', COLORS.queryHighlight)
            .attr('rx', 4)
            .attr('class', 'query-highlight');
        });
      }
    }

    // Add zoom/pan behavior
    const zoom = d3.zoom()
      .scaleExtent([0.5, 5])
      .on('zoom', (event) => {
        g.attr('transform', `translate(${event.transform.x + margin.left},${event.transform.y + margin.top}) scale(${event.transform.k})`);
      });

    svg.call(zoom);

  }, [syntenyData, visibleSpecies, handleGeneClick]);

  // Handle species filter toggle
  const toggleSpecies = (species) => {
    setVisibleSpecies(prev => ({
      ...prev,
      [species]: !prev[species],
    }));
  };

  // Center on query gene
  const centerOnQuery = () => {
    // Re-render with default view
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      svg.transition().duration(500).call(
        d3.zoom().transform,
        d3.zoomIdentity
      );
    }
  };

  // Download PNG
  const handleDownload = () => {
    if (!svgRef.current) return;

    const svgElement = svgRef.current;
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);

    // Create canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    // Add white background and proper dimensions
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      canvas.width = svgElement.width.baseVal.value * 2;
      canvas.height = svgElement.height.baseVal.value * 2;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.scale(2, 2);
      ctx.drawImage(img, 0, 0);

      canvas.toBlob((blob) => {
        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `synteny_${locusName}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(downloadUrl);
      });

      URL.revokeObjectURL(url);
    };

    img.src = url;
  };

  // Loading state
  if (loading) {
    return (
      <div className="synteny-container">
        <div className="synteny-loading">
          <div className="synteny-spinner"></div>
          <p>Loading synteny data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="synteny-container">
        <div className="synteny-error">
          <p>Failed to load synteny data: {error}</p>
        </div>
      </div>
    );
  }

  // No data state
  if (!syntenyData || Object.keys(syntenyData.synteny_regions || {}).length === 0) {
    return (
      <div className="synteny-container">
        <div className="synteny-empty">
          <p>No synteny data available for this locus.</p>
        </div>
      </div>
    );
  }

  const allSpecies = Object.keys(syntenyData.synteny_regions || {});

  return (
    <div className="synteny-container">
      {/* Controls */}
      <div className="synteny-controls">
        <div className="synteny-species-filters">
          <span className="filter-label">Show species:</span>
          {allSpecies.map(sp => (
            <label key={sp} className="species-checkbox">
              <input
                type="checkbox"
                checked={visibleSpecies[sp] || false}
                onChange={() => toggleSpecies(sp)}
              />
              <span style={{ fontStyle: 'italic' }}>{SPECIES_ABBREV[sp] || sp}</span>
            </label>
          ))}
        </div>
        <div className="synteny-buttons">
          <button type="button" onClick={centerOnQuery} className="synteny-btn">
            Center on Query
          </button>
        </div>
      </div>

      {/* Fixed Tooltip Bar - shows above the canvas */}
      <div className="synteny-tooltip-bar" style={{ color: '#fff' }}>
        {tooltip.show && tooltip.content ? (
          <>
            <span className="tooltip-gene-name"><strong>{tooltip.content.geneName || tooltip.content.featureName}</strong></span>
            <span className="tooltip-separator">|</span>
            <span>Systematic: {tooltip.content.featureName}</span>
            <span className="tooltip-separator">|</span>
            <span>Location: {tooltip.content.start.toLocaleString()} - {tooltip.content.stop.toLocaleString()}</span>
            <span className="tooltip-separator">|</span>
            <span>Strand: {tooltip.content.strand}</span>
            {tooltip.content.orthologId && (
              <>
                <span className="tooltip-separator">|</span>
                <span>Ortholog: {tooltip.content.orthologId}</span>
              </>
            )}
            <span className="tooltip-hint">(Click to view locus)</span>
          </>
        ) : (
          <span>Hover over a gene for details</span>
        )}
      </div>

      {/* SVG Canvas */}
      <div className="synteny-canvas" ref={containerRef}></div>

      {/* Footer */}
      <div className="synteny-footer">
        <div className="synteny-legend">
          <span className="legend-item">
            <span className="legend-box query"></span>
            Query Gene
          </span>
          <span className="legend-item">
            <span className="legend-box ortholog"></span>
            Has Ortholog
          </span>
          <span className="legend-item">
            <span className="legend-box singleton"></span>
            Species-specific
          </span>
          <span className="legend-item">
            <span className="legend-arrow watson"></span>
            Watson (+)
          </span>
          <span className="legend-item">
            <span className="legend-arrow crick"></span>
            Crick (-)
          </span>
        </div>
        <div className="synteny-datestamp">
          CGD {dateStamp}
        </div>
      </div>

      {/* Download and Genome Browser link */}
      <div className="synteny-download">
        <button type="button" className="synteny-download-btn" onClick={handleDownload}>
          Download (.png)
        </button>
        <Link
          to={`/synteny-browser?gene=${encodeURIComponent(locusName)}`}
          className="synteny-genome-link"
        >
          Open in Genome Browser &rarr;
        </Link>
      </div>
    </div>
  );
}

export default SyntenyViewer;
