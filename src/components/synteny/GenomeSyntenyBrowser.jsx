import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import * as d3 from 'd3';
import { locusApi } from '../../api/locusApi';
import ChromosomeSelector from './ChromosomeSelector';
import GeneSearch from './GeneSearch';
import './GenomeSyntenyBrowser.css';

// Color scheme for synteny visualization
const COLORS = {
  queryGene: '#e74c3c',        // Red - highlighted/query gene
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
  const [selectedChromosome, setSelectedChromosome] = useState(null);
  const [chromosomeData, setChromosomeData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, content: null });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [highlightedGene, setHighlightedGene] = useState(null);
  const [visibleSpecies, setVisibleSpecies] = useState({});

  // Refs
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const zoomRef = useRef(null);
  const transformRef = useRef(d3.zoomIdentity);

  const dateStamp = new Date().toISOString().split('T')[0];

  // Check for gene parameter in URL
  useEffect(() => {
    const geneParam = searchParams.get('gene');
    if (geneParam) {
      setHighlightedGene(geneParam);
    }
  }, [searchParams]);

  // Load chromosome data when chromosome is selected
  const loadChromosomeData = useCallback(async (chromosome) => {
    if (!chromosome) return;

    setLoading(true);
    setError(null);

    try {
      // Load data for all species
      const dataPromises = SPECIES_ORDER.map(async (organism) => {
        try {
          // Find matching chromosome for this organism
          const chrName = findMatchingChromosome(chromosome.chromosome, organism);
          if (chrName) {
            const data = await locusApi.getChromosomeGenes(chrName);
            return { organism, data };
          }
        } catch (err) {
          console.warn(`No data for ${organism}:`, err.message);
        }
        return { organism, data: null };
      });

      const results = await Promise.all(dataPromises);
      const newData = {};
      results.forEach(({ organism, data }) => {
        if (data) {
          newData[organism] = data;
        }
      });

      setChromosomeData(newData);

      // Initialize visible species
      const visible = {};
      Object.keys(newData).forEach(org => {
        visible[org] = true;
      });
      setVisibleSpecies(visible);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to load chromosome data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Find matching chromosome name for organism
  const findMatchingChromosome = (baseChr, organism) => {
    // Extract chromosome number/letter
    const match = baseChr.match(/chr(\d+|[A-Z])/i);
    if (!match) return baseChr;

    const chrId = match[1];

    // Construct chromosome name based on organism naming convention
    if (organism.includes('albicans')) {
      return `Ca22chr${chrId}A_C_albicans_SC5314`;
    } else if (organism.includes('glabrata')) {
      return `Chr${chrId}_C_glabrata_CBS138`;
    } else if (organism.includes('parapsilosis')) {
      // Parapsilosis uses contig naming
      return null;
    } else if (organism.includes('dubliniensis')) {
      return `Chr${chrId}_C_dubliniensis_CD36`;
    } else if (organism.includes('auris')) {
      return `Chr${chrId}_C_auris_B8441`;
    }

    return baseChr;
  };

  // Handle chromosome selection
  const handleChromosomeSelect = useCallback((chrData) => {
    setSelectedChromosome(chrData);
    loadChromosomeData(chrData);
  }, [loadChromosomeData]);

  // Handle gene search selection
  const handleGeneSelect = useCallback((gene) => {
    setHighlightedGene(gene.feature_name || gene.name);
    // If gene has chromosome info, load that chromosome
    if (gene.chromosome) {
      handleChromosomeSelect({
        chromosome: gene.chromosome,
        organism_name: gene.organism_name,
      });
    }
  }, [handleChromosomeSelect]);

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

  // Build ortholog lookup from all loaded data
  const orthologLookup = useMemo(() => {
    const lookup = {};
    Object.values(chromosomeData).forEach(data => {
      if (data?.genes) {
        data.genes.forEach(gene => {
          if (gene.ortholog_id) {
            if (!lookup[gene.ortholog_id]) {
              lookup[gene.ortholog_id] = [];
            }
            lookup[gene.ortholog_id].push(gene.feature_name);
          }
        });
      }
    });
    return lookup;
  }, [chromosomeData]);

  // Generate color for ortholog group
  const colorScale = useMemo(() => {
    const orthologIds = Object.keys(orthologLookup);
    return d3.scaleOrdinal(d3.schemeTableau10).domain(orthologIds);
  }, [orthologLookup]);

  // Draw the visualization
  useEffect(() => {
    if (!containerRef.current || Object.keys(chromosomeData).length === 0) return;

    // Clear existing SVG
    d3.select(containerRef.current).selectAll('svg').remove();

    // Filter to visible species
    const visibleData = Object.entries(chromosomeData)
      .filter(([organism]) => visibleSpecies[organism])
      .sort(([a], [b]) => SPECIES_ORDER.indexOf(a) - SPECIES_ORDER.indexOf(b));

    if (visibleData.length === 0) return;

    // Layout configuration
    const margin = { top: 40, right: 40, bottom: 40, left: 160 };
    const trackHeight = 50;
    const trackSpacing = 80;
    const geneHeight = 30;
    const containerWidth = containerRef.current.clientWidth;
    const width = containerWidth - margin.left - margin.right;
    const height = visibleData.length * (trackHeight + trackSpacing) + margin.top + margin.bottom;

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

    // Calculate global coordinate range
    let globalMin = Infinity;
    let globalMax = -Infinity;
    visibleData.forEach(([, data]) => {
      if (data?.genes) {
        data.genes.forEach(gene => {
          globalMin = Math.min(globalMin, gene.start);
          globalMax = Math.max(globalMax, gene.stop);
        });
      }
    });

    // Add padding
    const padding = (globalMax - globalMin) * 0.02;
    globalMin -= padding;
    globalMax += padding;

    // Create global x scale
    const xScale = d3.scaleLinear()
      .domain([globalMin, globalMax])
      .range([0, width]);

    // Draw each species track
    visibleData.forEach(([speciesName, data], idx) => {
      const yPosition = idx * (trackHeight + trackSpacing);
      const genes = data?.genes || [];

      const trackGroup = g.append('g')
        .attr('class', 'species-track')
        .attr('data-organism', speciesName)
        .attr('transform', `translate(0,${yPosition})`);

      // Species label
      trackGroup.append('text')
        .attr('x', -10)
        .attr('y', trackHeight / 2)
        .attr('text-anchor', 'end')
        .attr('dominant-baseline', 'middle')
        .attr('class', 'species-label')
        .style('font-style', 'italic')
        .text(SPECIES_ABBREV[speciesName] || speciesName);

      // Chromosome line
      trackGroup.append('line')
        .attr('x1', 0)
        .attr('x2', width)
        .attr('y1', trackHeight / 2)
        .attr('y2', trackHeight / 2)
        .attr('class', 'chromosome-line');

      // Draw genes
      genes.forEach(gene => {
        const geneGroup = trackGroup.append('g')
          .attr('class', 'gene-group')
          .attr('data-feature', gene.feature_name)
          .style('cursor', 'pointer');

        const x = xScale(gene.start);
        const geneWidth = Math.max(xScale(gene.stop) - xScale(gene.start), 4);
        const y = (trackHeight - geneHeight) / 2;

        // Determine fill color
        let fillColor;
        const isHighlighted = highlightedGene === gene.feature_name ||
                              highlightedGene === gene.gene_name;

        if (isHighlighted) {
          fillColor = COLORS.queryGene;
        } else if (gene.ortholog_id) {
          fillColor = colorScale(gene.ortholog_id);
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
          .attr('stroke', isHighlighted ? '#c0392b' : '#666')
          .attr('stroke-width', isHighlighted ? 2 : 1)
          .attr('class', 'gene-shape');

        // Gene label (visible based on zoom level and space)
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

        // Show label based on initial zoom level
        if (geneWidth > 50 || isHighlighted) {
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
              orthologId: gene.ortholog_id,
              headline: gene.headline,
              organism: speciesName,
            },
          });
        });

        geneGroup.on('mouseleave', () => {
          setTooltip({ show: false, x: 0, y: 0, content: null });
        });
      });
    });

    // Draw ortholog connections
    const connectionsGroup = g.append('g').attr('class', 'connections-group');

    Object.entries(orthologLookup).forEach(([orthologId, geneNames]) => {
      if (geneNames.length < 2) return;

      const connColor = colorScale(orthologId);
      const positions = [];

      // Find gene positions across tracks
      visibleData.forEach(([orgName, data], idx) => {
        if (!data?.genes) return;
        const yPosition = idx * (trackHeight + trackSpacing);

        data.genes.forEach(gene => {
          if (geneNames.includes(gene.feature_name)) {
            positions.push({
              species: orgName,
              x: xScale((gene.start + gene.stop) / 2),
              y: yPosition + trackHeight / 2,
            });
          }
        });
      });

      // Draw connections between consecutive species
      for (let i = 0; i < positions.length - 1; i++) {
        const p1 = positions[i];
        const p2 = positions[i + 1];

        if (p1.species === p2.species) continue;

        const midY = (p1.y + p2.y) / 2;
        connectionsGroup.append('path')
          .attr('d', `M${p1.x},${p1.y + geneHeight / 2} C${p1.x},${midY} ${p2.x},${midY} ${p2.x},${p2.y - geneHeight / 2}`)
          .attr('fill', 'none')
          .attr('stroke', connColor)
          .attr('stroke-width', 1.5)
          .attr('stroke-opacity', 0.3)
          .attr('class', 'ortholog-connection');
      }
    });

    // Zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.5, 20])
      .on('zoom', (event) => {
        transformRef.current = event.transform;
        setZoomLevel(event.transform.k);

        g.attr('transform', `translate(${event.transform.x + margin.left},${event.transform.y + margin.top}) scale(${event.transform.k})`);

        // Update label visibility based on zoom
        const currentZoom = event.transform.k;
        g.selectAll('.gene-label').each(function() {
          const label = d3.select(this);
          const parent = d3.select(this.parentNode);
          const polygon = parent.select('.gene-shape');

          // Get computed width
          const points = polygon.attr('points').split(' ').map(p => p.split(',').map(Number));
          const geneWidth = (Math.max(...points.map(p => p[0])) - Math.min(...points.map(p => p[0]))) * currentZoom;

          if (currentZoom >= ZOOM_LEVELS.MEDIUM.min && geneWidth > 30) {
            label.style('opacity', 1);
          } else if (parent.attr('data-feature') === highlightedGene) {
            label.style('opacity', 1);
          } else {
            label.style('opacity', 0);
          }
        });
      });

    zoomRef.current = zoom;
    svg.call(zoom);

    // If there's a highlighted gene, zoom to it
    if (highlightedGene) {
      // Find the gene in the data
      let targetGene = null;
      visibleData.forEach(([, data]) => {
        if (data?.genes) {
          const gene = data.genes.find(g =>
            g.feature_name === highlightedGene || g.gene_name === highlightedGene
          );
          if (gene) {
            targetGene = gene;
          }
        }
      });

      if (targetGene) {
        const targetX = xScale((targetGene.start + targetGene.stop) / 2);
        const newX = width / 2 - targetX * 3;

        svg.call(zoom.transform, d3.zoomIdentity.translate(newX, 0).scale(3));
      }
    }

  }, [chromosomeData, visibleSpecies, highlightedGene, handleGeneClick, colorScale, orthologLookup]);

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
        link.download = `genome_synteny_${selectedChromosome?.chromosome || 'view'}.png`;
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

  return (
    <div className="genome-synteny-browser">
      {/* Header controls */}
      <div className="browser-header">
        <div className="header-left">
          <GeneSearch onGeneSelect={handleGeneSelect} disabled={loading} />
        </div>
        <div className="header-center">
          <ChromosomeSelector
            selectedChromosome={selectedChromosome}
            onSelect={handleChromosomeSelect}
            loading={loading}
          />
        </div>
        <div className="header-right">
          <div className="zoom-controls">
            <button type="button" onClick={handleZoomOut} disabled={loading} title="Zoom out">
              −
            </button>
            <span className="zoom-level">{Math.round(zoomLevel * 100)}% ({getZoomLabel()})</span>
            <button type="button" onClick={handleZoomIn} disabled={loading} title="Zoom in">
              +
            </button>
            <button type="button" onClick={handleZoomReset} disabled={loading} title="Reset zoom">
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Species filter */}
      {Object.keys(chromosomeData).length > 0 && (
        <div className="species-filter">
          <span className="filter-label">Show species:</span>
          {SPECIES_ORDER.filter(org => chromosomeData[org]).map(org => (
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

      {/* Main canvas area */}
      <div className="browser-canvas-wrapper">
        {loading && (
          <div className="browser-loading">
            <div className="browser-spinner" />
            <p>Loading chromosome data...</p>
          </div>
        )}

        {error && (
          <div className="browser-error">
            <p>Error: {error}</p>
          </div>
        )}

        {!loading && !error && Object.keys(chromosomeData).length === 0 && (
          <div className="browser-empty">
            <p>Select a chromosome to view synteny data across species.</p>
            <p className="hint">Use the dropdown above to select a chromosome, or search for a gene.</p>
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
            </div>
            {tooltip.content.geneName && tooltip.content.featureName !== tooltip.content.geneName && (
              <div>Systematic: {tooltip.content.featureName}</div>
            )}
            <div>Location: {tooltip.content.start?.toLocaleString()} - {tooltip.content.stop?.toLocaleString()}</div>
            <div>Strand: {tooltip.content.strand}</div>
            {tooltip.content.orthologId && (
              <div>Ortholog cluster: {tooltip.content.orthologId}</div>
            )}
            {tooltip.content.headline && (
              <div className="tooltip-description">{tooltip.content.headline}</div>
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
            Highlighted Gene
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
          disabled={Object.keys(chromosomeData).length === 0}
        >
          Download (.png)
        </button>
      </div>
    </div>
  );
}

export default GenomeSyntenyBrowser;
