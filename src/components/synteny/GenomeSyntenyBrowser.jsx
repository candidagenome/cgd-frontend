import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import * as d3 from 'd3';
import { locusApi } from '../../api/locusApi';
import GeneSearch from './GeneSearch';
import './GenomeSyntenyBrowser.css';

// Color scheme for synteny visualization
const COLORS = {
  queryGene: '#e74c3c',        // Red - query gene
  orthologGene: '#3498db',     // Blue - gene with orthologs
  singletonGene: '#95a5a6',    // Gray - gene without orthologs
  watsonStrand: '#2ecc71',     // Green - Watson strand
  crickStrand: '#9b59b6',      // Purple - Crick strand
  connector: '#bdc3c7',        // Light gray for ortholog connections
  chromosome: '#ecf0f1',       // Very light gray for chromosome
  text: '#2c3e50',             // Dark text
};

// Species abbreviations for compact display
const SPECIES_ABBREV = {
  'Candida albicans SC5314': 'C. albicans',
  'Candida glabrata CBS138': 'C. glabrata',
  'Candida parapsilosis CDC317': 'C. parapsilosis',
  'Candida dubliniensis CD36': 'C. dubliniensis',
  'Candida auris B8441': 'C. auris',
};

// Species display order
const SPECIES_ORDER = [
  'Candida albicans SC5314',
  'Candida glabrata CBS138',
  'Candida parapsilosis CDC317',
  'Candida dubliniensis CD36',
  'Candida auris B8441',
];

// Zoom level thresholds for semantic zoom
const ZOOM_LEVELS = {
  OVERVIEW: { min: 0, max: 1.5 },      // No labels
  MEDIUM: { min: 1.5, max: 4 },        // Gene names only
  DETAIL: { min: 4, max: Infinity },   // Names + descriptions
};

function GenomeSyntenyBrowser() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // State
  const [syntenyData, setSyntenyData] = useState(null);
  const [queryGeneName, setQueryGeneName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, content: null });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [visibleSpecies, setVisibleSpecies] = useState({});
  const [flankingCount, setFlankingCount] = useState(15);

  // Refs
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const zoomRef = useRef(null);

  const dateStamp = new Date().toISOString().split('T')[0];

  // Load synteny data for a gene
  const loadSyntenyData = useCallback(async (geneName) => {
    if (!geneName) return;

    setLoading(true);
    setError(null);
    setQueryGeneName(geneName);

    try {
      const data = await locusApi.getSyntenyData(geneName, flankingCount);
      setSyntenyData(data);

      // Initialize all species as visible
      const visible = {};
      Object.keys(data.synteny_regions || {}).forEach(sp => {
        visible[sp] = true;
      });
      setVisibleSpecies(visible);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to load synteny data');
      setSyntenyData(null);
    } finally {
      setLoading(false);
    }
  }, [flankingCount]);

  // Check for gene parameter in URL on mount
  useEffect(() => {
    const geneParam = searchParams.get('gene');
    if (geneParam) {
      loadSyntenyData(geneParam);
    }
  }, [searchParams, loadSyntenyData]);

  // Handle gene search selection
  const handleGeneSelect = useCallback((gene) => {
    const geneName = gene.feature_name || gene.gene_name || gene.name;
    if (geneName) {
      loadSyntenyData(geneName);
    }
  }, [loadSyntenyData]);

  // Handle gene click navigation
  const handleGeneClick = useCallback((featureName) => {
    navigate(`/locus/${encodeURIComponent(featureName)}`);
  }, [navigate]);

  // Toggle species visibility
  const toggleSpecies = (species) => {
    setVisibleSpecies(prev => ({
      ...prev,
      [species]: !prev[species],
    }));
  };

  // Build gene-to-ortholog lookup from connections
  const geneToOrtholog = useMemo(() => {
    const lookup = {};
    if (syntenyData?.ortholog_connections) {
      syntenyData.ortholog_connections.forEach(conn => {
        conn.genes.forEach(gene => {
          lookup[gene] = conn.ortholog_id;
        });
      });
    }
    return lookup;
  }, [syntenyData]);

  // Generate color scale for ortholog groups
  const colorScale = useMemo(() => {
    const orthologIds = syntenyData?.ortholog_connections?.map(c => c.ortholog_id) || [];
    return d3.scaleOrdinal(d3.schemeTableau10).domain(orthologIds);
  }, [syntenyData]);

  // Draw the visualization
  useEffect(() => {
    if (!containerRef.current || !syntenyData) return;

    const regions = syntenyData.synteny_regions || {};
    const connections = syntenyData.ortholog_connections || [];

    // Clear existing SVG
    d3.select(containerRef.current).selectAll('svg').remove();

    // Filter to visible species
    const visibleRegions = Object.entries(regions)
      .filter(([sp]) => visibleSpecies[sp])
      .sort(([a], [b]) => SPECIES_ORDER.indexOf(a) - SPECIES_ORDER.indexOf(b))
      .map(([sp, region]) => ({ species: sp, ...region }));

    if (visibleRegions.length === 0) return;

    // Layout configuration
    const margin = { top: 40, right: 40, bottom: 40, left: 160 };
    const trackHeight = 50;
    const trackSpacing = 80;
    const geneHeight = 30;
    const containerWidth = containerRef.current.clientWidth;
    const width = containerWidth - margin.left - margin.right;
    const height = visibleRegions.length * (trackHeight + trackSpacing) + margin.top + margin.bottom;

    // Create SVG
    const svg = d3.select(containerRef.current)
      .append('svg')
      .attr('width', containerWidth)
      .attr('height', height)
      .attr('class', 'genome-synteny-svg');

    svgRef.current = svg.node();

    // Create main group for zoom/pan
    const g = svg.append('g')
      .attr('class', 'main-group')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales for each species track (each has its own coordinate range)
    const speciesData = visibleRegions.map((region, idx) => {
      const genes = region.genes || [];
      const minCoord = genes.length > 0 ? Math.min(...genes.map(g => g.start)) : 0;
      const maxCoord = genes.length > 0 ? Math.max(...genes.map(g => g.stop)) : 1000;
      const padding = (maxCoord - minCoord) * 0.05;
      return {
        ...region,
        index: idx,
        minCoord: minCoord - padding,
        maxCoord: maxCoord + padding,
        yPosition: idx * (trackHeight + trackSpacing),
      };
    });

    // Create x scales for each track
    const xScales = {};
    speciesData.forEach(sd => {
      xScales[sd.species] = d3.scaleLinear()
        .domain([sd.minCoord, sd.maxCoord])
        .range([0, width]);
    });

    // Draw each species track
    speciesData.forEach(sd => {
      const trackGroup = g.append('g')
        .attr('class', 'species-track')
        .attr('data-organism', sd.species)
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
          .attr('data-feature', gene.feature_name)
          .style('cursor', 'pointer');

        const x = xScale(gene.start);
        const geneWidth = Math.max(xScale(gene.stop) - xScale(gene.start), 4);
        const y = (trackHeight - geneHeight) / 2;

        // Determine fill color
        const orthologId = geneToOrtholog[gene.feature_name];
        let fillColor;

        if (gene.is_query) {
          fillColor = COLORS.queryGene;
        } else if (orthologId) {
          fillColor = colorScale(orthologId);
        } else {
          fillColor = COLORS.singletonGene;
        }

        // Gene shape with direction indicator
        const points = gene.strand === 'W' || gene.strand === '+'
          ? [
              [x, y],
              [x + geneWidth - 6, y],
              [x + geneWidth, y + geneHeight / 2],
              [x + geneWidth - 6, y + geneHeight],
              [x, y + geneHeight],
            ]
          : [
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

        // Gene label
        const label = geneGroup.append('text')
          .attr('x', x + geneWidth / 2)
          .attr('y', y + geneHeight / 2)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('class', 'gene-label')
          .style('font-size', '10px')
          .style('fill', '#fff')
          .style('pointer-events', 'none')
          .style('opacity', 0)
          .text(gene.gene_name || gene.feature_name?.substring(0, 8) || '');

        // Show label for query gene or if enough space
        if (gene.is_query || geneWidth > 50) {
          label.style('opacity', 1);
        }

        // Click handler
        geneGroup.on('click', () => handleGeneClick(gene.feature_name));

        // Hover handlers
        geneGroup.on('mouseenter', (event) => {
          const rect = containerRef.current.getBoundingClientRect();
          setTooltip({
            show: true,
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
            content: {
              featureName: gene.feature_name,
              geneName: gene.gene_name,
              start: gene.start,
              stop: gene.stop,
              strand: gene.strand === 'W' || gene.strand === '+' ? 'Watson (+)' : 'Crick (-)',
              orthologId: orthologId,
              isQuery: gene.is_query,
              organism: sd.species,
            },
          });
        });

        geneGroup.on('mouseleave', () => {
          setTooltip({ show: false, x: 0, y: 0, content: null });
        });
      });
    });

    // Draw ortholog connections between tracks
    const connectionsGroup = g.append('g').attr('class', 'connections-group');

    connections.forEach(conn => {
      const connColor = colorScale(conn.ortholog_id);
      const genePositions = [];

      // Find gene positions across species
      speciesData.forEach(sd => {
        const genes = sd.genes || [];
        genes.forEach(gene => {
          if (conn.genes.includes(gene.feature_name)) {
            const xScale = xScales[sd.species];
            genePositions.push({
              species: sd.species,
              x: xScale((gene.start + gene.stop) / 2),
              y: sd.yPosition + trackHeight / 2,
            });
          }
        });
      });

      // Draw bezier curves between consecutive species
      for (let i = 0; i < genePositions.length - 1; i++) {
        const p1 = genePositions[i];
        const p2 = genePositions[i + 1];

        if (p1.species === p2.species) continue;

        const midY = (p1.y + p2.y) / 2;
        connectionsGroup.append('path')
          .attr('d', `M${p1.x},${p1.y + geneHeight / 2} C${p1.x},${midY} ${p2.x},${midY} ${p2.x},${p2.y - geneHeight / 2}`)
          .attr('fill', 'none')
          .attr('stroke', connColor)
          .attr('stroke-width', 1.5)
          .attr('stroke-opacity', 0.4)
          .attr('class', 'ortholog-connection');
      }
    });

    // Zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.5, 10])
      .on('zoom', (event) => {
        setZoomLevel(event.transform.k);
        g.attr('transform', `translate(${event.transform.x + margin.left},${event.transform.y + margin.top}) scale(${event.transform.k})`);

        // Update label visibility based on zoom
        const currentZoom = event.transform.k;
        g.selectAll('.gene-label').each(function() {
          const label = d3.select(this);
          const parent = d3.select(this.parentNode);
          const polygon = parent.select('.gene-shape');
          const isQuery = parent.select('.gene-shape').attr('stroke') === '#c0392b';

          const points = polygon.attr('points').split(' ').map(p => p.split(',').map(Number));
          const geneWidth = (Math.max(...points.map(p => p[0])) - Math.min(...points.map(p => p[0]))) * currentZoom;

          if (isQuery || (currentZoom >= ZOOM_LEVELS.MEDIUM.min && geneWidth > 30)) {
            label.style('opacity', 1);
          } else {
            label.style('opacity', 0);
          }
        });
      });

    zoomRef.current = zoom;
    svg.call(zoom);

  }, [syntenyData, visibleSpecies, handleGeneClick, colorScale, geneToOrtholog]);

  // Zoom controls
  const handleZoomIn = () => {
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current)
        .transition()
        .duration(300)
        .call(zoomRef.current.scaleBy, 1.5);
    }
  };

  const handleZoomOut = () => {
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current)
        .transition()
        .duration(300)
        .call(zoomRef.current.scaleBy, 0.67);
    }
  };

  const handleZoomReset = () => {
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current)
        .transition()
        .duration(300)
        .call(zoomRef.current.transform, d3.zoomIdentity);
    }
  };

  // Handle flanking count change
  const handleFlankingChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (value >= 5 && value <= 50) {
      setFlankingCount(value);
    }
  };

  // Reload with new flanking count
  const handleReload = () => {
    if (queryGeneName) {
      loadSyntenyData(queryGeneName);
    }
  };

  // Download PNG
  const handleDownload = () => {
    if (!svgRef.current) return;

    const svgElement = svgRef.current;
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

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
        link.download = `synteny_${queryGeneName || 'view'}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(downloadUrl);
      });

      URL.revokeObjectURL(url);
    };

    img.src = url;
  };

  // Get zoom level label
  const getZoomLabel = () => {
    if (zoomLevel < ZOOM_LEVELS.MEDIUM.min) return 'Overview';
    if (zoomLevel < ZOOM_LEVELS.DETAIL.min) return 'Medium';
    return 'Detail';
  };

  const allSpecies = Object.keys(syntenyData?.synteny_regions || {});

  return (
    <div className="genome-synteny-browser">
      {/* Header controls */}
      <div className="browser-header">
        <div className="header-left">
          <GeneSearch onGeneSelect={handleGeneSelect} disabled={loading} />
        </div>
        <div className="header-center">
          <div className="flanking-control">
            <label htmlFor="flanking-count">Flanking genes:</label>
            <input
              id="flanking-count"
              type="number"
              min="5"
              max="50"
              value={flankingCount}
              onChange={handleFlankingChange}
              disabled={loading}
            />
            <button
              type="button"
              onClick={handleReload}
              disabled={loading || !queryGeneName}
              className="reload-btn"
            >
              Reload
            </button>
          </div>
        </div>
        <div className="header-right">
          <div className="zoom-controls">
            <button type="button" onClick={handleZoomOut} disabled={loading || !syntenyData} title="Zoom out">
              −
            </button>
            <span className="zoom-level">{Math.round(zoomLevel * 100)}% ({getZoomLabel()})</span>
            <button type="button" onClick={handleZoomIn} disabled={loading || !syntenyData} title="Zoom in">
              +
            </button>
            <button type="button" onClick={handleZoomReset} disabled={loading || !syntenyData} title="Reset zoom">
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Species filter */}
      {allSpecies.length > 0 && (
        <div className="species-filter">
          <span className="filter-label">Show species:</span>
          {SPECIES_ORDER.filter(org => allSpecies.includes(org)).map(org => (
            <label key={org} className="species-checkbox">
              <input
                type="checkbox"
                checked={visibleSpecies[org] || false}
                onChange={() => toggleSpecies(org)}
              />
              <span style={{ fontStyle: 'italic' }}>{SPECIES_ABBREV[org] || org}</span>
            </label>
          ))}
        </div>
      )}

      {/* Query gene info */}
      {syntenyData?.query_gene && (
        <div className="query-info">
          <strong>Query:</strong>{' '}
          <span className="query-gene-name">
            {syntenyData.query_gene.gene_name || syntenyData.query_gene.feature_name}
          </span>
          {' '}({syntenyData.query_gene.feature_name}) on {syntenyData.query_gene.chromosome}
          {' '}in <em>{SPECIES_ABBREV[syntenyData.query_gene.organism] || syntenyData.query_gene.organism}</em>
        </div>
      )}

      {/* Main canvas area */}
      <div className="browser-canvas-wrapper">
        {loading && (
          <div className="browser-loading">
            <div className="browser-spinner" />
            <p>Loading synteny data...</p>
          </div>
        )}

        {error && (
          <div className="browser-error">
            <p>Error: {error}</p>
          </div>
        )}

        {!loading && !error && !syntenyData && (
          <div className="browser-empty">
            <p>Search for a gene to view its syntenic region across species.</p>
            <p className="hint">Enter a gene name (e.g., ACT1, CDC19, ERG11) in the search box above.</p>
          </div>
        )}

        <div className="browser-canvas" ref={containerRef} />

        {/* Tooltip */}
        {tooltip.show && tooltip.content && (
          <div
            className="browser-tooltip"
            style={{
              left: tooltip.x + 10,
              top: tooltip.y + 10,
            }}
          >
            <div className="tooltip-header">
              <strong>{tooltip.content.geneName || tooltip.content.featureName}</strong>
              {tooltip.content.isQuery && <span className="query-badge">Query</span>}
            </div>
            {tooltip.content.geneName && tooltip.content.featureName !== tooltip.content.geneName && (
              <div>Systematic: {tooltip.content.featureName}</div>
            )}
            <div>Location: {tooltip.content.start?.toLocaleString()} - {tooltip.content.stop?.toLocaleString()}</div>
            <div>Strand: {tooltip.content.strand}</div>
            {tooltip.content.orthologId && (
              <div>Ortholog cluster: {tooltip.content.orthologId}</div>
            )}
            <div className="tooltip-organism" style={{ fontStyle: 'italic' }}>
              {SPECIES_ABBREV[tooltip.content.organism] || tooltip.content.organism}
            </div>
            <div className="tooltip-hint">Click to view locus page</div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="browser-footer">
        <div className="browser-legend">
          <span className="legend-item">
            <span className="legend-box query" />
            Query Gene
          </span>
          <span className="legend-item">
            <span className="legend-box ortholog" />
            Has Ortholog
          </span>
          <span className="legend-item">
            <span className="legend-box singleton" />
            Species-specific
          </span>
          <span className="legend-item">
            <span className="legend-arrow watson" />
            Watson (+)
          </span>
          <span className="legend-item">
            <span className="legend-arrow crick" />
            Crick (-)
          </span>
        </div>
        <div className="browser-datestamp">
          CGD {dateStamp}
        </div>
      </div>

      {/* Download */}
      <div className="browser-download">
        <button
          type="button"
          className="download-btn"
          onClick={handleDownload}
          disabled={!syntenyData}
        >
          Download (.png)
        </button>
      </div>
    </div>
  );
}

export default GenomeSyntenyBrowser;
