import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import * as d3 from 'd3';
import { locusApi } from '../../api/locusApi';
import { SPECIES_ORDER, SPECIES_ABBREV } from '../../constants/organisms';
import GeneSearch from './GeneSearch';
import './GenomeSyntenyBrowser.css';

// Color scheme for synteny visualization - Sybil-inspired style
const COLORS = {
  queryGene: '#d32f2f',        // Strong red - the gene you searched for
  queryOrtholog: '#ef9a9a',    // Light red - orthologs (clearly lighter than query gene)
  queryOrthologStroke: '#e57373', // Medium red stroke for query orthologs
  queryHighlight: 'rgba(200, 200, 200, 0.08)',  // Very subtle gray highlight (nearly invisible)
  orthologGene: '#3498db',     // Blue - other genes with orthologs
  singletonGene: '#95a5a6',    // Gray - species-specific genes (no orthologs)
  watsonStrand: '#2ecc71',     // Green - Watson strand
  crickStrand: '#9b59b6',      // Purple - Crick strand
  ribbon: '#cccccc',           // Light gray for regular ribbons
  ribbonQuery: '#999999',      // Medium gray for query ortholog ribbons
  ribbonStroke: '#aaaaaa',     // Gray for ribbon borders
  chromosome: '#ecf0f1',       // Very light gray for chromosome
  text: '#2c3e50',             // Dark text
};


// Zoom level thresholds for display
const ZOOM_LEVELS = {
  OVERVIEW: { min: 0, max: 0.8 },
  MEDIUM: { min: 0.8, max: 2 },
  DETAIL: { min: 2, max: Infinity },
};

// Pan step as fraction of viewport width
const PAN_STEP = 0.25;

function GenomeSyntenyBrowser({ geneName: propGeneName, embedded = false }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // State
  const [syntenyData, setSyntenyData] = useState(null);
  const [queryGeneName, setQueryGeneName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tooltip, setTooltip] = useState({ show: false, content: null });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState(0);
  const [visibleSpecies, setVisibleSpecies] = useState({});
  const [baseFlankingCount, setBaseFlankingCount] = useState(5);
  const [flankingInput, setFlankingInput] = useState('5'); // Text input value
  const [currentFlankingCount, setCurrentFlankingCount] = useState(5);
  const [needsInitialCenter, setNeedsInitialCenter] = useState(false);
  const [hoveredOrtholog, setHoveredOrtholog] = useState(null);
  const [selectedGene, setSelectedGene] = useState(null); // For gene detail popup

  // Refs
  const containerRef = useRef(null);
  const hoverTimeoutRef = useRef(null); // Debounce hover changes
  const svgRef = useRef(null);
  const zoomRef = useRef(null);
  const transformRef = useRef({ k: 1, x: 0 });
  const baseWidthRef = useRef(0);
  const queryGeneXRef = useRef(0); // Store query gene's x position for centering
  const queryGeneRelativeXRef = useRef(0.5); // Store query gene's relative position (0-1)
  const isMountedRef = useRef(true); // Track if component is mounted

  // Track mount status to prevent state updates after unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const dateStamp = new Date().toISOString().split('T')[0];

  // Load synteny data for a gene
  const loadSyntenyData = useCallback(async (geneName, flankingOverride = null, preserveZoom = false) => {
    if (!geneName || !isMountedRef.current) return;

    setLoading(true);
    setError(null);
    setQueryGeneName(geneName);

    const flankingToUse = flankingOverride !== null ? flankingOverride : baseFlankingCount;

    try {
      const data = await locusApi.getSyntenyData(geneName, flankingToUse);

      // Check if still mounted before updating state
      if (!isMountedRef.current) return;

      setSyntenyData(data);
      setCurrentFlankingCount(flankingToUse);

      if (!preserveZoom) {
        // Reset zoom when loading new data (not when expanding region)
        transformRef.current = { k: 1, x: 0 };
        setZoomLevel(1);
        setPanOffset(0);
      }
      setNeedsInitialCenter(true); // Flag to center after first render

      // Initialize all species as visible
      const visible = {};
      Object.keys(data.synteny_regions || {}).forEach(sp => {
        visible[sp] = true;
      });
      setVisibleSpecies(visible);
    } catch (err) {
      // Check if still mounted before updating state
      if (!isMountedRef.current) return;

      setError(err.response?.data?.detail || err.message || 'Failed to load synteny data');
      setSyntenyData(null);
    } finally {
      // Check if still mounted before updating state
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [baseFlankingCount]);

  // Check for gene parameter in URL or prop on mount
  useEffect(() => {
    // Prop takes precedence over URL param
    if (propGeneName) {
      loadSyntenyData(propGeneName);
    } else {
      const geneParam = searchParams.get('gene');
      if (geneParam) {
        loadSyntenyData(geneParam);
      }
    }
  }, [searchParams, propGeneName, loadSyntenyData]);

  // Handle gene search selection
  // Prefer feature_name (systematic name) since it's unique and unambiguous.
  // Names like "MDR1" can be both a standard name for one gene AND an alias
  // for another gene (e.g., GYP2), causing the wrong gene to load.
  const handleGeneSelect = useCallback((gene) => {
    const geneName = gene.feature_name || gene.gene_name || gene.name;
    if (geneName) {
      loadSyntenyData(geneName);
    }
  }, [loadSyntenyData]);

  // Handle gene click - show detail popup instead of navigating directly
  const handleGeneClick = useCallback((gene, species) => {
    setSelectedGene({ ...gene, species });
    setTooltip({ show: false, content: null }); // Hide tooltip
  }, []);

  // Close gene detail popup
  const closeGenePopup = useCallback(() => {
    setSelectedGene(null);
  }, []);

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

  // Draw the visualization
  useEffect(() => {
    if (!containerRef.current || !syntenyData) return;

    // Store ref locally for cleanup
    const container = containerRef.current;

    const regions = syntenyData.synteny_regions || {};
    const connections = syntenyData.ortholog_connections || [];

    // Clear existing SVG
    d3.select(container).selectAll('svg').remove();

    // Filter to visible species
    const visibleRegions = Object.entries(regions)
      .filter(([sp]) => visibleSpecies[sp])
      .sort(([a], [b]) => SPECIES_ORDER.indexOf(a) - SPECIES_ORDER.indexOf(b))
      .map(([sp, region]) => ({ species: sp, ...region }));

    if (visibleRegions.length === 0) return;

    // Layout configuration - these stay constant regardless of zoom
    const margin = { top: 16, right: 40, bottom: 50, left: 120 }; // Increased bottom for scale bar
    const trackHeight = 40;
    const trackSpacing = 52;  // Increased for better readability
    const geneHeight = 24;
    const containerWidth = containerRef.current.clientWidth;
    const baseWidth = containerWidth - margin.left - margin.right;
    const height = visibleRegions.length * (trackHeight + trackSpacing) + margin.top + margin.bottom - trackSpacing;

    // Store base width for navigation calculations
    baseWidthRef.current = baseWidth;

    // Get current zoom/pan
    const currentZoom = zoomLevel;
    const currentPan = panOffset;

    // Calculate effective width based on zoom
    // When zoomed out (zoomLevel < 1), we fetch more data instead of compressing
    // So effectiveWidth should never be less than baseWidth
    const effectiveWidth = currentZoom >= 1 ? baseWidth * currentZoom : baseWidth;

    // Create SVG
    const svg = d3.select(containerRef.current)
      .append('svg')
      .attr('width', containerWidth)
      .attr('height', height)
      .attr('class', 'genome-synteny-svg');

    svgRef.current = svg.node();

    // Create defs for clip path and filters
    const defs = svg.append('defs');

    // Clip path for content area
    defs.append('clipPath')
      .attr('id', 'content-clip')
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', baseWidth)
      .attr('height', height);

    // Glow filter for query orthologs
    const glowFilter = defs.append('filter')
      .attr('id', 'query-glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');
    glowFilter.append('feGaussianBlur')
      .attr('stdDeviation', '2')
      .attr('result', 'coloredBlur');
    const feMerge = glowFilter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Create main group
    const g = svg.append('g')
      .attr('class', 'main-group')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create content group with clipping
    const contentGroup = g.append('g')
      .attr('class', 'content-group')
      .attr('clip-path', 'url(#content-clip)');

    // Create group for panned content
    const pannedGroup = contentGroup.append('g')
      .attr('class', 'panned-group')
      .attr('transform', `translate(${currentPan},0)`);

    // Find query gene's ortholog_id FIRST (needed for alignment calculation)
    let queryOrthologId = null;
    const querySpecies = syntenyData.query_gene?.organism;
    visibleRegions.forEach(region => {
      const genes = region.genes || [];
      const queryGene = genes.find(g => g.is_query);
      if (queryGene) {
        queryOrthologId = geneToOrtholog[queryGene.feature_name];
      }
    });

    // Create scales for each species track (each has its own coordinate range)
    // Also find the ortholog midpoint for alignment
    const speciesData = visibleRegions.map((region, idx) => {
      const genes = region.genes || [];
      // Use both start and stop for min/max since Crick strand genes have start > stop
      const allCoords = genes.flatMap(g => [g.start, g.stop]);
      const minCoord = allCoords.length > 0 ? Math.min(...allCoords) : 0;
      const maxCoord = allCoords.length > 0 ? Math.max(...allCoords) : 1000;

      // Find the ortholog (query gene or its ortholog in this species) midpoint
      let orthologMidpoint = null;
      genes.forEach(gene => {
        const orthologId = geneToOrtholog[gene.feature_name];
        if (gene.is_query || (orthologId && orthologId === queryOrthologId)) {
          orthologMidpoint = (Math.min(gene.start, gene.stop) + Math.max(gene.start, gene.stop)) / 2;
        }
      });

      return {
        ...region,
        index: idx,
        minCoord,
        maxCoord,
        span: maxCoord - minCoord,
        yPosition: idx * (trackHeight + trackSpacing),
        orthologMidpoint,
      };
    });

    // Find the maximum span across all species for consistent scaling
    const maxSpan = Math.max(...speciesData.map(sd => sd.span));
    const globalPadding = maxSpan * 0.05;
    const totalDomain = maxSpan + globalPadding * 2;

    // Create a single global scale (bp per pixel) based on the largest span
    const bpPerPixel = totalDomain / effectiveWidth;

    // Calculate the target x-coordinate where all orthologs should align (viewport center)
    const alignmentTargetX = effectiveWidth / 2;

    // Create x scales for each track, aligned by ortholog position
    const xScales = {};
    speciesData.forEach(sd => {
      const regionWidth = sd.span / bpPerPixel;

      // Calculate xOffset to align ortholog at the target x-coordinate
      let xOffset;
      if (sd.orthologMidpoint !== null) {
        // Position so ortholog midpoint lands at alignmentTargetX
        const orthologRelativePos = (sd.orthologMidpoint - sd.minCoord) / bpPerPixel;
        xOffset = alignmentTargetX - orthologRelativePos;
      } else {
        // No ortholog in this species - fall back to centering the region
        xOffset = (effectiveWidth - regionWidth) / 2;
      }

      xScales[sd.species] = (coord) => {
        const relativePos = (coord - sd.minCoord) / bpPerPixel;
        return xOffset + relativePos;
      };
      xScales[sd.species].offset = xOffset;
      xScales[sd.species].regionWidth = regionWidth;
    });

    // Find and store query gene position for centering (used for pan calculations)
    let queryGeneX = effectiveWidth / 2; // default to center
    let queryGeneRelative = 0.5; // relative position (0-1)
    speciesData.forEach(sd => {
      const genes = sd.genes || [];
      const queryGene = genes.find(g => g.is_query);
      if (queryGene) {
        const xScale = xScales[sd.species];
        queryGeneX = xScale((queryGene.start + queryGene.stop) / 2);
        // Calculate relative position within the coordinate range
        const coordRange = sd.maxCoord - sd.minCoord;
        const queryCoord = (queryGene.start + queryGene.stop) / 2;
        queryGeneRelative = (queryCoord - sd.minCoord) / coordRange;
      }
    });
    queryGeneXRef.current = queryGeneX;
    queryGeneRelativeXRef.current = queryGeneRelative;

    // Draw each species track
    speciesData.forEach(sd => {
      // Species label (outside clipped area, doesn't move with pan)
      g.append('text')
        .attr('x', -10)
        .attr('y', sd.yPosition + trackHeight / 2)
        .attr('text-anchor', 'end')
        .attr('dominant-baseline', 'middle')
        .attr('class', 'species-label')
        .style('font-style', 'italic')
        .style('font-size', '12px')
        .text(SPECIES_ABBREV[sd.species] || sd.species);

      const trackGroup = pannedGroup.append('g')
        .attr('class', 'species-track')
        .attr('data-organism', sd.species)
        .attr('transform', `translate(0,${sd.yPosition})`);

      // Chromosome line - spans only the region with genes
      const xScale = xScales[sd.species];
      trackGroup.append('line')
        .attr('x1', xScale.offset)
        .attr('x2', xScale.offset + xScale.regionWidth)
        .attr('y1', trackHeight / 2)
        .attr('y2', trackHeight / 2)
        .attr('class', 'chromosome-line');

      // Draw genes
      const genes = sd.genes || [];

      genes.forEach(gene => {
        const orthologId = geneToOrtholog[gene.feature_name];
        const geneGroup = trackGroup.append('g')
          .attr('class', 'gene-group')
          .attr('data-feature', gene.feature_name)
          .attr('data-ortholog', orthologId || '')
          .style('cursor', 'pointer');

        // Handle both Watson (start < stop) and Crick (start > stop) strand genes
        const geneLeft = Math.min(gene.start, gene.stop);
        const geneRight = Math.max(gene.start, gene.stop);
        const x = xScale(geneLeft);
        const geneWidth = Math.max(xScale(geneRight) - xScale(geneLeft), 4);
        const y = (trackHeight - geneHeight) / 2;

        // Determine fill color and styling
        // Dark red = query gene, Light red = query's orthologs, Blue = other orthologs, Gray = no orthologs
        let fillColor;
        let strokeColor;
        let strokeWidth;
        const isQueryGene = gene.is_query && sd.species === querySpecies;
        const isQueryOrtholog = !isQueryGene && orthologId && orthologId === queryOrthologId;

        if (isQueryGene) {
          fillColor = COLORS.queryGene;  // Dark red - the gene you searched for
          strokeColor = '#b71c1c';
          strokeWidth = 2.5;
        } else if (isQueryOrtholog) {
          fillColor = COLORS.queryOrtholog;  // Light red - orthologs of your query gene
          strokeColor = COLORS.queryOrthologStroke;
          strokeWidth = 2;
        } else if (orthologId) {
          fillColor = COLORS.orthologGene;  // Blue - other genes with orthologs
          strokeColor = '#2980b9';
          strokeWidth = 1;
        } else {
          fillColor = COLORS.singletonGene;  // Gray - species-specific genes
          strokeColor = '#7f8c8d';
          strokeWidth = 1;
        }

        // Arrow point size - more prominent for better strand visibility
        const arrowSize = Math.min(10, Math.max(5, geneWidth * 0.3));

        // Gene shape with direction indicator (arrow points in transcription direction)
        const isForward = gene.strand === 'W' || gene.strand === '+';
        const points = isForward
          ? [
              // Forward strand: arrow points RIGHT
              [x, y],
              [x + geneWidth - arrowSize, y],
              [x + geneWidth, y + geneHeight / 2],
              [x + geneWidth - arrowSize, y + geneHeight],
              [x, y + geneHeight],
            ]
          : [
              // Reverse strand: arrow points LEFT
              [x, y + geneHeight / 2],
              [x + arrowSize, y],
              [x + geneWidth, y],
              [x + geneWidth, y + geneHeight],
              [x + arrowSize, y + geneHeight],
            ];

        // Check if gene has introns (multiple exons)
        const hasExons = gene.exons && gene.exons.length > 1;

        if (hasExons) {
          // Gene has introns - draw outline and fill only exons
          // First draw light grey background for introns (to cover chromosome line)
          geneGroup.append('rect')
            .attr('x', x)
            .attr('y', y)
            .attr('width', geneWidth)
            .attr('height', geneHeight)
            .attr('fill', '#e8e8e8');

          // Draw filled exons
          gene.exons.forEach(exon => {
            const exonLeft = Math.min(exon.start, exon.stop);
            const exonRight = Math.max(exon.start, exon.stop);
            const exonX = xScale(exonLeft);
            const exonWidth = Math.max(xScale(exonRight) - exonX, 2);
            geneGroup.append('rect')
              .attr('x', exonX)
              .attr('y', y)
              .attr('width', exonWidth)
              .attr('height', geneHeight)
              .attr('fill', fillColor)
              .attr('class', 'exon-shape')
              .style('pointer-events', 'none');
          });

          // Draw gene outline on top
          geneGroup.append('polygon')
            .attr('points', points.map(p => p.join(',')).join(' '))
            .attr('fill', 'none')
            .attr('stroke', strokeColor)
            .attr('stroke-width', strokeWidth)
            .attr('class', 'gene-shape gene-outline');

          // Add invisible hit area on top to capture mouse events
          geneGroup.append('rect')
            .attr('x', x)
            .attr('y', y)
            .attr('width', geneWidth)
            .attr('height', geneHeight)
            .attr('fill', 'rgba(0,0,0,0)')
            .style('pointer-events', 'all')
            .attr('class', 'gene-hit-area');
        } else {
          // No introns - draw solid filled gene
          geneGroup.append('polygon')
            .attr('points', points.map(p => p.join(',')).join(' '))
            .attr('fill', fillColor)
            .attr('stroke', strokeColor)
            .attr('stroke-width', strokeWidth)
            .attr('class', 'gene-shape');
        }


        // Gene label - position in largest exon for genes with introns
        const rawLabel = gene.gene_name || gene.feature_name || '';

        // For genes with introns, find the largest exon for label placement
        let labelX = x + geneWidth / 2;
        let labelWidth = geneWidth;
        if (hasExons && gene.exons.length > 0) {
          // Find the largest exon
          let largestExon = gene.exons[0];
          let largestWidth = 0;
          gene.exons.forEach(exon => {
            const exonLeft = Math.min(exon.start, exon.stop);
            const exonRight = Math.max(exon.start, exon.stop);
            const exonW = xScale(exonRight) - xScale(exonLeft);
            if (exonW > largestWidth) {
              largestWidth = exonW;
              largestExon = exon;
            }
          });
          const exonLeft = Math.min(largestExon.start, largestExon.stop);
          const exonRight = Math.max(largestExon.start, largestExon.stop);
          labelX = xScale(exonLeft) + (xScale(exonRight) - xScale(exonLeft)) / 2;
          labelWidth = Math.max(xScale(exonRight) - xScale(exonLeft), 4);
        }

        // Estimate ~6px per character at 9px font size
        const maxChars = Math.max(3, Math.floor((labelWidth - 10) / 6));
        const labelText = rawLabel.length > maxChars ? rawLabel.substring(0, maxChars) : rawLabel;
        // Show label if query gene or enough space for at least 3 chars
        const showLabel = gene.is_query || labelWidth > 30;

        if (showLabel) {
          geneGroup.append('text')
            .attr('x', labelX)
            .attr('y', y + geneHeight / 2)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('class', 'gene-label')
            .style('font-size', '9px')
            .style('fill', '#fff')
            .style('pointer-events', 'none')
            .text(labelText);
        }

        // Click handler - open detail popup
        geneGroup.on('click', () => handleGeneClick(gene, sd.species));

        // Double-click handler - center view on this gene
        geneGroup.on('dblclick', (event) => {
          event.preventDefault();
          event.stopPropagation();
          centerOnGene(gene, sd.species);
        });

        // Hover handlers - highlight this gene's ortholog connections
        geneGroup.on('mouseenter', () => {
          // Clear any pending mouseleave timeout
          if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = null;
          }
          setTooltip({
            show: true,
            content: {
              featureName: gene.feature_name,
              geneName: gene.gene_name,
              start: gene.start,
              stop: gene.stop,
              strand: gene.strand === 'W' || gene.strand === '+' ? 'Forward (+)' : 'Reverse (-)',
              orthologId: orthologId,
              isQuery: gene.is_query,
              organism: sd.species,
              exonCount: gene.exons ? gene.exons.length : 0,
            },
          });
          // Highlight connections for this gene's ortholog group
          if (orthologId) {
            setHoveredOrtholog(orthologId);
          }
        });

        geneGroup.on('mouseleave', () => {
          // Debounce mouseleave to prevent flicker
          hoverTimeoutRef.current = setTimeout(() => {
            setTooltip({ show: false, content: null });
            setHoveredOrtholog(null);
          }, 50);
        });
      });
    });

    // Draw Sybil-style ribbon connections between tracks (drawn BEFORE genes so genes appear on top)
    const connectionsGroup = pannedGroup.insert('g', ':first-child').attr('class', 'connections-group');

    connections.forEach(conn => {
      const isQueryConnection = conn.ortholog_id === queryOrthologId;
      const genePositions = [];

      // Find gene positions across species (with full boundary info for ribbons)
      speciesData.forEach(sd => {
        const genes = sd.genes || [];
        genes.forEach(gene => {
          if (conn.genes.includes(gene.feature_name)) {
            const xScale = xScales[sd.species];
            const geneLeft = Math.min(gene.start, gene.stop);
            const geneRight = Math.max(gene.start, gene.stop);
            const xLeft = xScale(geneLeft);
            const xRight = xScale(geneRight);
            const geneWidth = Math.max(xRight - xLeft, 4);
            const isForward = gene.strand === 'W' || gene.strand === '+';
            genePositions.push({
              species: sd.species,
              speciesIndex: sd.index,
              xLeft: xLeft,
              xRight: xLeft + geneWidth,
              yTop: sd.yPosition + (trackHeight - geneHeight) / 2,
              yBottom: sd.yPosition + (trackHeight + geneHeight) / 2,
              isForward: isForward,
            });
          }
        });
      });

      // Sort by species index to ensure correct drawing order
      genePositions.sort((a, b) => a.speciesIndex - b.speciesIndex);

      // Draw trapezoid ribbons between consecutive species (Sybil style)
      // Use crossed/bowtie shape when genes are on opposite strands
      for (let i = 0; i < genePositions.length - 1; i++) {
        const p1 = genePositions[i];
        const p2 = genePositions[i + 1];

        if (p1.species === p2.species) continue;

        // Check if genes are on opposite strands
        const sameStrand = p1.isForward === p2.isForward;

        // Create polygon connecting the two genes
        // Same strand: normal trapezoid (straight sides)
        // Opposite strand: crossed/bowtie shape (X pattern)
        let points;
        if (sameStrand) {
          // Normal trapezoid: left connects to left, right connects to right
          points = [
            [p1.xLeft, p1.yBottom],   // bottom-left of top gene
            [p1.xRight, p1.yBottom],  // bottom-right of top gene
            [p2.xRight, p2.yTop],     // top-right of bottom gene
            [p2.xLeft, p2.yTop],      // top-left of bottom gene
          ];
        } else {
          // Crossed bowtie: left connects to right, right connects to left
          points = [
            [p1.xLeft, p1.yBottom],   // bottom-left of top gene
            [p1.xRight, p1.yBottom],  // bottom-right of top gene
            [p2.xLeft, p2.yTop],      // top-LEFT of bottom gene (crossed)
            [p2.xRight, p2.yTop],     // top-RIGHT of bottom gene (crossed)
          ];
        }

        connectionsGroup.append('polygon')
          .attr('points', points.map(p => p.join(',')).join(' '))
          .attr('fill', isQueryConnection ? COLORS.ribbonQuery : COLORS.ribbon)
          .attr('fill-opacity', isQueryConnection ? 0.25 : 0.12)
          .attr('stroke', COLORS.ribbonStroke)
          .attr('stroke-width', 0.5)
          .attr('stroke-opacity', 0.1)
          .attr('data-ortholog', conn.ortholog_id)
          .attr('class', isQueryConnection ? 'ortholog-connection query-connection' : 'ortholog-connection');
      }
    });

    // Draw vertical query highlight column (Sybil style - pink/red background for query gene and orthologs)
    if (queryOrthologId) {
      const queryGenePositions = [];
      speciesData.forEach(sd => {
        const genes = sd.genes || [];
        genes.forEach(gene => {
          const orthologId = geneToOrtholog[gene.feature_name];
          if (orthologId === queryOrthologId) {
            const xScale = xScales[sd.species];
            const geneLeft = Math.min(gene.start, gene.stop);
            const geneRight = Math.max(gene.start, gene.stop);
            const xLeft = xScale(geneLeft);
            const xRight = xScale(geneRight);
            const geneWidth = Math.max(xRight - xLeft, 4);
            queryGenePositions.push({
              species: sd.species,
              xLeft: xLeft,
              xRight: xLeft + geneWidth,
              yTop: sd.yPosition,
              yBottom: sd.yPosition + trackHeight,
            });
          }
        });
      });

    }

    // Draw scale bar at the bottom to show consistent scaling
    const scaleBarGroup = g.append('g')
      .attr('class', 'scale-bar-group')
      .attr('transform', `translate(0, ${height - margin.top - margin.bottom + 15})`);

    // Calculate a nice round scale bar length based on bpPerPixel
    // Choose a scale that results in a bar between 50-150 pixels wide
    const targetPixelWidth = 100;
    const targetBp = targetPixelWidth * bpPerPixel;

    // Find the nearest "nice" number (1, 2, 5, 10, 20, 50, 100 kb, etc.)
    const magnitude = Math.pow(10, Math.floor(Math.log10(targetBp)));
    const normalized = targetBp / magnitude;
    let niceNumber;
    if (normalized < 1.5) niceNumber = 1;
    else if (normalized < 3.5) niceNumber = 2;
    else if (normalized < 7.5) niceNumber = 5;
    else niceNumber = 10;

    const scaleBarBp = niceNumber * magnitude;
    const scaleBarWidth = scaleBarBp / bpPerPixel;

    // Format the label (show as kb if >= 1000 bp)
    let scaleLabel;
    if (scaleBarBp >= 1000) {
      scaleLabel = `${scaleBarBp / 1000} kb`;
    } else {
      scaleLabel = `${scaleBarBp} bp`;
    }

    // Position scale bar at the right side of the visualization
    const scaleBarX = baseWidth - scaleBarWidth - 20;

    // Draw scale bar line
    scaleBarGroup.append('line')
      .attr('x1', scaleBarX)
      .attr('x2', scaleBarX + scaleBarWidth)
      .attr('y1', 0)
      .attr('y2', 0)
      .attr('stroke', '#333')
      .attr('stroke-width', 2);

    // Draw end caps
    scaleBarGroup.append('line')
      .attr('x1', scaleBarX)
      .attr('x2', scaleBarX)
      .attr('y1', -4)
      .attr('y2', 4)
      .attr('stroke', '#333')
      .attr('stroke-width', 2);

    scaleBarGroup.append('line')
      .attr('x1', scaleBarX + scaleBarWidth)
      .attr('x2', scaleBarX + scaleBarWidth)
      .attr('y1', -4)
      .attr('y2', 4)
      .attr('stroke', '#333')
      .attr('stroke-width', 2);

    // Add label
    scaleBarGroup.append('text')
      .attr('x', scaleBarX + scaleBarWidth / 2)
      .attr('y', 16)
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .attr('fill', '#333')
      .text(scaleLabel);

    // Setup drag behavior for panning (only when zoomed in beyond 100%)
    if (currentZoom > 1 && effectiveWidth > baseWidth) {
      const drag = d3.drag()
        .on('drag', (event) => {
          const newPan = panOffset + event.dx;
          // Limit panning to keep content in view
          const minPan = baseWidth - effectiveWidth;
          const maxPan = 0;
          const clampedPan = Math.max(minPan, Math.min(maxPan, newPan));
          setPanOffset(clampedPan);
        });

      svg.call(drag);
      svg.style('cursor', 'grab');
    } else {
      svg.style('cursor', 'default');
    }

    // Cleanup function to remove D3 elements when component unmounts
    return () => {
      if (container) {
        d3.select(container).selectAll('svg').remove();
      }
      svgRef.current = null;
    };
  }, [syntenyData, visibleSpecies, handleGeneClick, geneToOrtholog, zoomLevel, panOffset]);

  // Handle hover highlighting - fade non-matching elements when a gene is hovered
  useEffect(() => {
    if (!containerRef.current) return;

    const svg = d3.select(containerRef.current).select('svg');
    if (svg.empty()) return;

    if (hoveredOrtholog) {
      // Check if there are any visible connections for this ortholog
      let hasVisibleConnections = false;
      svg.selectAll('.ortholog-connection').each(function() {
        if (d3.select(this).attr('data-ortholog') === hoveredOrtholog) {
          hasVisibleConnections = true;
        }
      });

      // Count how many genes share this ortholog
      let matchingGeneCount = 0;
      svg.selectAll('.gene-group').each(function() {
        if (d3.select(this).attr('data-ortholog') === hoveredOrtholog) {
          matchingGeneCount++;
        }
      });

      // Only apply strong fade effect if there are connections to show
      // or multiple genes in the same ortholog cluster
      const shouldHighlight = hasVisibleConnections || matchingGeneCount > 1;

      // Fade/highlight genes - only change opacity on non-hovered genes
      svg.selectAll('.gene-group').each(function() {
        const el = d3.select(this);
        const ortholog = el.attr('data-ortholog');
        if (ortholog !== hoveredOrtholog) {
          // Only fade non-hovered genes
          el.style('opacity', shouldHighlight ? 0.3 : 0.6);
        }
      });

      // Highlight matching ribbon connections, fade others
      svg.selectAll('.ortholog-connection').each(function() {
        const el = d3.select(this);
        const ortholog = el.attr('data-ortholog');
        if (ortholog === hoveredOrtholog) {
          el.attr('fill-opacity', 0.5)
            .attr('stroke-opacity', 0.3)
            .attr('stroke-width', 1);
        } else {
          // Softer fade if no connections to highlight
          el.attr('fill-opacity', shouldHighlight ? 0.05 : 0.1);
        }
      });
    } else {
      // Reset all to default state - just restore opacity
      svg.selectAll('.gene-group').style('opacity', 1);

      // Reset ribbon connections to their base opacity
      svg.selectAll('.ortholog-connection').each(function() {
        const el = d3.select(this);
        const isQuery = el.classed('query-connection');
        el.attr('fill-opacity', isQuery ? 0.25 : 0.12)
          .attr('stroke-opacity', 0.1)
          .attr('stroke-width', 0.5);
      });
    }
  }, [hoveredOrtholog]);

  // Calculate pan offset to center query gene at a given zoom level
  const calculateCenterOffset = useCallback((targetZoom) => {
    const baseWidth = baseWidthRef.current;
    if (!baseWidth) return 0;

    // When zoomed out, we fetch more data instead of compressing
    // So effectiveWidth = baseWidth when targetZoom < 1
    const effectiveWidth = targetZoom >= 1 ? baseWidth * targetZoom : baseWidth;

    if (effectiveWidth <= baseWidth) {
      // Zoomed out or at 100%: content fits in viewport, center the entire content
      return (baseWidth - effectiveWidth) / 2;
    } else {
      // Zoomed in: content larger than viewport, center on query gene
      const queryGeneXAtZoom = queryGeneRelativeXRef.current * effectiveWidth;
      const centerOffset = baseWidth / 2 - queryGeneXAtZoom;
      // Clamp to valid range (content must stay within viewport bounds)
      const minPan = baseWidth - effectiveWidth; // negative (shows right side)
      const maxPan = 0; // shows left side
      return Math.max(minPan, Math.min(maxPan, centerOffset));
    }
  }, []);

  // Center view on a specific gene
  const centerOnGene = useCallback((gene, species) => {
    if (!syntenyData) return;

    const regions = syntenyData.synteny_regions || {};
    const region = regions[species];
    if (!region) return;

    // Find the gene's position in its region
    const genes = region.genes || [];
    const targetGene = genes.find(g => g.feature_name === gene.feature_name);
    if (!targetGene) return;

    // Calculate relative position of this gene
    const allCoords = genes.flatMap(g => [g.start, g.stop]);
    const minCoord = Math.min(...allCoords);
    const maxCoord = Math.max(...allCoords);
    const padding = (maxCoord - minCoord) * 0.05;
    const coordRange = (maxCoord + padding) - (minCoord - padding);
    const geneCoord = (targetGene.start + targetGene.stop) / 2;
    const relativePos = (geneCoord - (minCoord - padding)) / coordRange;

    // Update the relative position ref and recalculate pan
    queryGeneRelativeXRef.current = relativePos;
    const newPan = calculateCenterOffset(zoomLevel);
    setPanOffset(newPan);

    closeGenePopup();
  }, [syntenyData, zoomLevel, calculateCenterOffset, closeGenePopup]);

  // Effect to handle initial centering after first render
  useEffect(() => {
    if (needsInitialCenter && baseWidthRef.current > 0) {
      const centerOffset = calculateCenterOffset(zoomLevel);
      setPanOffset(centerOffset);
      setNeedsInitialCenter(false);
    }
  }, [needsInitialCenter, zoomLevel, calculateCenterOffset]);

  // Calculate required flanking count based on zoom level
  // When zoomed out, we need more genes to fill the view
  const calculateFlankingForZoom = useCallback((targetZoom) => {
    if (targetZoom >= 1) {
      // Zoomed in or normal: use base flanking count
      return baseFlankingCount;
    }
    // Zoomed out: increase flanking count inversely proportional to zoom
    // At zoom 0.5, we need 2x the genes; at zoom 0.3, we need ~3x
    const multiplier = 1 / targetZoom;
    const newFlanking = Math.min(50, Math.round(baseFlankingCount * multiplier));
    return newFlanking;
  }, [baseFlankingCount]);

  // Zoom controls
  const handleZoomIn = () => {
    const newK = Math.min(zoomLevel * 1.5, 5);
    const newPan = calculateCenterOffset(newK);
    setZoomLevel(newK);
    setPanOffset(newPan);

    // Check if we can reduce data when zooming in significantly
    const requiredFlanking = calculateFlankingForZoom(newK);
    if (requiredFlanking < currentFlankingCount && queryGeneName) {
      // We could reload with less data, but it's not necessary for UX
      // Just keep the current data for smooth zooming
    }
  };

  const handleZoomOut = () => {
    const newK = Math.max(zoomLevel * 0.67, 0.3);
    const requiredFlanking = calculateFlankingForZoom(newK);

    // If we need more genes than currently loaded, reload with more data
    if (requiredFlanking > currentFlankingCount && queryGeneName) {
      // Reload with more flanking genes to expand the region
      loadSyntenyData(queryGeneName, requiredFlanking, true);
      setZoomLevel(newK);
      // Pan offset will be set by needsInitialCenter effect
    } else {
      const newPan = calculateCenterOffset(newK);
      setZoomLevel(newK);
      setPanOffset(newPan);
    }
  };

  // Navigation controls
  const handlePanLeft = () => {
    const baseWidth = baseWidthRef.current;
    // When zoomed out, effectiveWidth = baseWidth (no panning needed)
    const effectiveWidth = zoomLevel >= 1 ? baseWidth * zoomLevel : baseWidth;
    if (effectiveWidth <= baseWidth) return; // Can't pan when zoomed out or at 100%

    const step = baseWidth * PAN_STEP;
    const minPan = baseWidth - effectiveWidth;
    const newPan = Math.max(minPan, panOffset - step);
    setPanOffset(newPan);
  };

  const handlePanRight = () => {
    const baseWidth = baseWidthRef.current;
    // When zoomed out, effectiveWidth = baseWidth (no panning needed)
    const effectiveWidth = zoomLevel >= 1 ? baseWidth * zoomLevel : baseWidth;
    if (effectiveWidth <= baseWidth) return; // Can't pan when zoomed out or at 100%

    const step = baseWidth * PAN_STEP;
    const newPan = Math.min(0, panOffset + step);
    setPanOffset(newPan);
  };

  // Check if can pan in each direction (only when zoomed in beyond 100%)
  const effectiveWidth = zoomLevel >= 1 ? baseWidthRef.current * zoomLevel : baseWidthRef.current;
  const canPanLeft = effectiveWidth > baseWidthRef.current && panOffset > (baseWidthRef.current - effectiveWidth);
  const canPanRight = effectiveWidth > baseWidthRef.current && panOffset < 0;

  // Handle flanking count change - allow any input while typing
  const handleFlankingChange = (e) => {
    const rawValue = e.target.value;
    // Allow empty or numeric input while typing
    if (rawValue === '' || /^\d*$/.test(rawValue)) {
      setFlankingInput(rawValue);
    }
  };

  // Validate and apply flanking count on blur
  const handleFlankingBlur = () => {
    const value = parseInt(flankingInput, 10);
    if (isNaN(value) || value < 5) {
      setBaseFlankingCount(5);
      setFlankingInput('5');
    } else if (value > 50) {
      setBaseFlankingCount(50);
      setFlankingInput('50');
    } else {
      setBaseFlankingCount(value);
      setFlankingInput(String(value));
    }
  };

  // Reload with new flanking count
  const handleReload = () => {
    if (queryGeneName) {
      loadSyntenyData(queryGeneName);
    }
  };

  // Download PNG
  const handleDownloadPNG = () => {
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

  // Download SVG (publication quality)
  const handleDownloadSVG = () => {
    if (!svgRef.current) return;

    const svgElement = svgRef.current.cloneNode(true);

    // Add white background
    const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bgRect.setAttribute('width', '100%');
    bgRect.setAttribute('height', '100%');
    bgRect.setAttribute('fill', 'white');
    svgElement.insertBefore(bgRect, svgElement.firstChild);

    // Add XML declaration and doctype for better compatibility
    const serializer = new XMLSerializer();
    let svgString = serializer.serializeToString(svgElement);

    // Add namespace if missing
    if (!svgString.includes('xmlns=')) {
      svgString = svgString.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
    }

    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `synteny_${queryGeneName || 'view'}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Get zoom level label
  const getZoomLabel = () => {
    if (zoomLevel < 1) {
      // Zoomed out - show expanded region info
      return `${currentFlankingCount} genes`;
    }
    if (zoomLevel < ZOOM_LEVELS.MEDIUM.min) return 'Overview';
    if (zoomLevel < ZOOM_LEVELS.DETAIL.min) return 'Medium';
    return 'Detail';
  };

  const allSpecies = Object.keys(syntenyData?.synteny_regions || {});

  return (
    <div className="genome-synteny-browser">
      {/* Header controls */}
      <div className="browser-header">
        {!embedded && (
          <div className="header-left">
            <GeneSearch onGeneSelect={handleGeneSelect} disabled={loading} />
          </div>
        )}
        <div className={embedded ? "header-left" : "header-center"}>
          <div className="flanking-control">
            <label htmlFor="flanking-count">Flanking genes:</label>
            <input
              id="flanking-count"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={flankingInput}
              onChange={handleFlankingChange}
              onBlur={handleFlankingBlur}
              disabled={loading}
              style={{ width: '50px', textAlign: 'center' }}
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
          <div className="nav-controls">
            <button
              type="button"
              onClick={handlePanRight}
              disabled={loading || !syntenyData || !canPanRight}
              title="Pan left (view earlier genes)"
              className="nav-btn"
            >
              ◀
            </button>
            <button
              type="button"
              onClick={handlePanLeft}
              disabled={loading || !syntenyData || !canPanLeft}
              title="Pan right (view later genes)"
              className="nav-btn"
            >
              ▶
            </button>
          </div>
          <div className="zoom-controls" title="Use mouse wheel to zoom when hovering over the visualization">
            <span className="zoom-label">Zoom:</span>
            <button type="button" onClick={handleZoomOut} disabled={loading || !syntenyData || zoomLevel <= 0.3} title="Zoom out (show more genes)">
              −
            </button>
            <span className="zoom-level">{Math.round(zoomLevel * 100)}% ({getZoomLabel()})</span>
            <button type="button" onClick={handleZoomIn} disabled={loading || !syntenyData || zoomLevel >= 5} title="Zoom in (show fewer genes with more detail)">
              +
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
          <div className="query-main">
            <strong>Query:</strong>{' '}
            <span className="query-gene-name">
              {syntenyData.query_gene.gene_name || syntenyData.query_gene.feature_name}
            </span>
            {' '}({syntenyData.query_gene.feature_name}) on {syntenyData.query_gene.chromosome}
            {' '}in <em>{SPECIES_ABBREV[syntenyData.query_gene.organism] || syntenyData.query_gene.organism}</em>
          </div>
          <div className="query-hint">
            Genes are aligned by orthologous relationships, not exact genomic position. Gene sizes are drawn to a consistent scale across species.
          </div>
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

        {!loading && !error && syntenyData && Object.keys(syntenyData.synteny_regions || {}).length === 0 && (
          <div className="browser-error">
            <p>No synteny data available for {queryGeneName}</p>
          </div>
        )}

        {/* Fixed Tooltip Bar - shows above the canvas */}
        <div className="browser-tooltip-bar" style={{ color: '#fff' }}>
          {tooltip.show && tooltip.content ? (
            <>
              <span className="tooltip-gene-name">
                <strong>{tooltip.content.geneName || tooltip.content.featureName}</strong>
              </span>
              {tooltip.content.isQuery && <span className="query-badge">Query</span>}
              <span className="tooltip-separator">|</span>
              <span>Systematic: {tooltip.content.featureName}</span>
              <span className="tooltip-separator">|</span>
              <span>Location: {tooltip.content.start?.toLocaleString()} - {tooltip.content.stop?.toLocaleString()}</span>
              <span className="tooltip-separator">|</span>
              <span>Strand: {tooltip.content.strand}</span>
              {tooltip.content.orthologId && (
                <>
                  <span className="tooltip-separator">|</span>
                  <span>Ortholog: {tooltip.content.geneName || tooltip.content.featureName}</span>
                </>
              )}
              {tooltip.content.exonCount > 1 && (
                <>
                  <span className="tooltip-separator">|</span>
                  <span>{tooltip.content.exonCount} exons</span>
                </>
              )}
              <span className="tooltip-separator">|</span>
              <span className="tooltip-organism">
                {SPECIES_ABBREV[tooltip.content.organism] || tooltip.content.organism}
              </span>
              <span className="tooltip-hint">(Click for details | Double-click to center)</span>
            </>
          ) : (
            <>
              <span className="tooltip-gene-name">
                <strong>Hover over a gene for details</strong>
              </span>
            </>
          )}
        </div>

        <div className="browser-canvas" ref={containerRef} />
      </div>

      {/* Footer */}
      <div className="browser-footer">
        <div className="browser-legend">
          <span className="legend-item query-gene-item">
            <span className="legend-box query" />
            Query Gene
          </span>
          <span className="legend-item query-ortholog-item">
            <span className="legend-box query-ortholog" />
            Query Ortholog
          </span>
          <span className="legend-item">
            <span className="legend-box ortholog" />
            Other Ortholog
          </span>
          <span className="legend-item">
            <span className="legend-box singleton" />
            Species-specific
          </span>
          <span className="legend-item">
            <span className="legend-box intron" />
            Intron
          </span>
          <span className="legend-item">
            <span className="legend-arrow watson" />
            Forward (+)
          </span>
          <span className="legend-item">
            <span className="legend-arrow crick" />
            Reverse (-)
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
          onClick={handleDownloadPNG}
          disabled={!syntenyData}
        >
          Download PNG
        </button>
        <button
          type="button"
          className="download-btn download-svg"
          onClick={handleDownloadSVG}
          disabled={!syntenyData}
        >
          Download SVG
        </button>
      </div>

      {/* Gene Detail Popup */}
      {selectedGene && (
        <div className="gene-popup-overlay" onClick={closeGenePopup}>
          <div className="gene-popup" onClick={(e) => e.stopPropagation()}>
            <button className="gene-popup-close" onClick={closeGenePopup} type="button">
              &times;
            </button>
            <div className="gene-popup-header">
              <h3>{selectedGene.gene_name || selectedGene.feature_name}</h3>
              {selectedGene.is_query && <span className="query-badge">Query Gene</span>}
            </div>

            <div className="gene-popup-content">
              <div className="gene-popup-section">
                <div className="gene-popup-row">
                  <span className="label">Systematic Name:</span>
                  <span className="value">{selectedGene.feature_name}</span>
                </div>
                {selectedGene.gene_name && selectedGene.gene_name !== selectedGene.feature_name && (
                  <div className="gene-popup-row">
                    <span className="label">Standard Name:</span>
                    <span className="value">{selectedGene.gene_name}</span>
                  </div>
                )}
                <div className="gene-popup-row">
                  <span className="label">Species:</span>
                  <span className="value" style={{ fontStyle: 'italic' }}>
                    {SPECIES_ABBREV[selectedGene.species] || selectedGene.species}
                  </span>
                </div>
                <div className="gene-popup-row">
                  <span className="label">Location:</span>
                  <span className="value">
                    {selectedGene.start?.toLocaleString()} - {selectedGene.stop?.toLocaleString()}
                  </span>
                </div>
                <div className="gene-popup-row">
                  <span className="label">Strand:</span>
                  <span className="value">
                    {selectedGene.strand === 'W' || selectedGene.strand === '+' ? 'Forward (+)' : 'Reverse (-)'}
                  </span>
                </div>
                {geneToOrtholog[selectedGene.feature_name] && (
                  <div className="gene-popup-row">
                    <span className="label">Ortholog Cluster:</span>
                    <span className="value">{geneToOrtholog[selectedGene.feature_name]}</span>
                  </div>
                )}
                {selectedGene.exons && selectedGene.exons.length > 1 && (
                  <div className="gene-popup-row">
                    <span className="label">Structure:</span>
                    <span className="value">{selectedGene.exons.length} exons ({selectedGene.exons.length - 1} introns)</span>
                  </div>
                )}
              </div>

              <div className="gene-popup-links">
                <a
                  href={`/locus/${encodeURIComponent(selectedGene.feature_name)}`}
                  className="gene-popup-link primary"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Locus Page
                </a>
              </div>

              <div className="gene-popup-actions">
                <button
                  type="button"
                  className="gene-popup-action secondary"
                  onClick={() => {
                    loadSyntenyData(selectedGene.gene_name || selectedGene.feature_name);
                    closeGenePopup();
                  }}
                >
                  Set as Query Gene
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GenomeSyntenyBrowser;
