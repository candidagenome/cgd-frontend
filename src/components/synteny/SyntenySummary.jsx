import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import * as d3 from 'd3';
import { locusApi } from '../../api/locusApi';
import './SyntenySummary.css';

// Color scheme matching the full viewer - Sybil-inspired style
const COLORS = {
  queryGene: '#d32f2f',        // Strong red
  queryOrtholog: '#ef9a9a',    // Light-medium red
  queryHighlight: 'rgba(255, 182, 193, 0.4)',  // Light pink for vertical query column
  orthologGene: '#3498db',
  singletonGene: '#95a5a6',
  ribbon: '#c0c0c0',           // Gray for Sybil-style ribbons
  ribbonStroke: '#a0a0a0',     // Slightly darker gray for ribbon borders
};

// Species display order and abbreviations
const SPECIES_ORDER = [
  'Candida albicans SC5314',
  'Candida glabrata CBS138',
  'Candida parapsilosis CDC317',
  'Candida dubliniensis CD36',
  'Candida auris B8441',
];

const SPECIES_ABBREV = {
  'Candida albicans SC5314': 'C. albicans',
  'Candida glabrata CBS138': 'C. glabrata',
  'Candida parapsilosis CDC317': 'C. parapsilosis',
  'Candida dubliniensis CD36': 'C. dubliniensis',
  'Candida auris B8441': 'C. auris',
};

function SyntenySummary({ geneName, maxSpecies = 3, flankingCount = 2 }) {
  const [syntenyData, setSyntenyData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orthologCount, setOrthologCount] = useState(0);
  const containerRef = useRef(null);

  // Load synteny data
  useEffect(() => {
    if (!geneName) return;

    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await locusApi.getSyntenyData(geneName, flankingCount);
        setSyntenyData(data);
      } catch (err) {
        setError(err.response?.data?.detail || err.message || 'Failed to load synteny data');
        setSyntenyData(null);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [geneName, flankingCount]);

  // Build gene-to-ortholog lookup
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

    const regions = syntenyData.synteny_regions || {};
    const connections = syntenyData.ortholog_connections || [];

    // Clear existing SVG
    d3.select(containerRef.current).selectAll('svg').remove();

    // Get query gene's species and ortholog_id
    const queryGeneInfo = syntenyData.query_gene;
    const querySpecies = queryGeneInfo?.organism;

    // Find query gene's ortholog_id
    let queryOrthologId = null;
    Object.values(regions).forEach(region => {
      const genes = region.genes || [];
      const queryGene = genes.find(g => g.is_query);
      if (queryGene) {
        queryOrthologId = geneToOrtholog[queryGene.feature_name];
      }
    });

    // Select species to show: query species + species with query orthologs
    const speciesWithQueryOrthologs = new Set();
    if (queryOrthologId) {
      const queryConn = connections.find(c => c.ortholog_id === queryOrthologId);
      if (queryConn) {
        Object.entries(regions).forEach(([species, region]) => {
          const genes = region.genes || [];
          if (genes.some(g => queryConn.genes.includes(g.feature_name))) {
            speciesWithQueryOrthologs.add(species);
          }
        });
      }
    }

    // Build visible species list: prioritize query species and those with orthologs
    let visibleSpeciesList = SPECIES_ORDER.filter(sp => regions[sp]);

    // Sort to prioritize: 1) query species, 2) species with query orthologs, 3) others
    visibleSpeciesList.sort((a, b) => {
      if (a === querySpecies) return -1;
      if (b === querySpecies) return 1;
      const aHasOrtholog = speciesWithQueryOrthologs.has(a);
      const bHasOrtholog = speciesWithQueryOrthologs.has(b);
      if (aHasOrtholog && !bHasOrtholog) return -1;
      if (!aHasOrtholog && bHasOrtholog) return 1;
      return 0;
    });

    // Count total species with orthologs before limiting
    const totalWithOrthologs = speciesWithQueryOrthologs.size;
    setOrthologCount(totalWithOrthologs);

    // Limit to maxSpecies
    visibleSpeciesList = visibleSpeciesList.slice(0, maxSpecies);

    const visibleRegions = visibleSpeciesList.map(sp => ({
      species: sp,
      ...regions[sp],
    }));

    if (visibleRegions.length === 0) return;

    // Layout configuration - compact
    const margin = { top: 8, right: 16, bottom: 8, left: 90 };
    const trackHeight = 24;
    const trackSpacing = 28;
    const geneHeight = 16;
    const containerWidth = containerRef.current.clientWidth;
    const width = containerWidth - margin.left - margin.right;
    const height = visibleRegions.length * (trackHeight + trackSpacing) + margin.top + margin.bottom - trackSpacing;

    // Create SVG
    const svg = d3.select(containerRef.current)
      .append('svg')
      .attr('width', containerWidth)
      .attr('height', height)
      .attr('class', 'synteny-summary-svg');

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales for each species track
    const speciesData = visibleRegions.map((region, idx) => {
      const genes = region.genes || [];
      const allCoords = genes.flatMap(gene => [gene.start, gene.stop]);
      const minCoord = allCoords.length > 0 ? Math.min(...allCoords) : 0;
      const maxCoord = allCoords.length > 0 ? Math.max(...allCoords) : 1000;
      const padding = (maxCoord - minCoord) * 0.05;
      return {
        ...region,
        index: idx,
        minCoord: minCoord - padding,
        maxCoord: maxCoord + padding,
        yPosition: idx * (trackHeight + trackSpacing),
      };
    });

    // Create x scales
    const xScales = {};
    speciesData.forEach(sd => {
      xScales[sd.species] = d3.scaleLinear()
        .domain([sd.minCoord, sd.maxCoord])
        .range([0, width]);
    });

    // Draw each species track
    speciesData.forEach(sd => {
      // Species label
      g.append('text')
        .attr('x', -6)
        .attr('y', sd.yPosition + trackHeight / 2)
        .attr('text-anchor', 'end')
        .attr('dominant-baseline', 'middle')
        .attr('class', 'species-label')
        .style('font-style', 'italic')
        .style('font-size', '10px')
        .style('fill', '#666')
        .text(SPECIES_ABBREV[sd.species] || sd.species);

      const trackGroup = g.append('g')
        .attr('transform', `translate(0,${sd.yPosition})`);

      // Chromosome line
      trackGroup.append('line')
        .attr('x1', 0)
        .attr('x2', width)
        .attr('y1', trackHeight / 2)
        .attr('y2', trackHeight / 2)
        .attr('stroke', '#e0e0e0')
        .attr('stroke-width', 1.5);

      // Draw genes
      const xScale = xScales[sd.species];
      const genes = sd.genes || [];

      genes.forEach(gene => {
        const orthologId = geneToOrtholog[gene.feature_name];
        const geneLeft = Math.min(gene.start, gene.stop);
        const geneRight = Math.max(gene.start, gene.stop);
        const x = xScale(geneLeft);
        const geneWidth = Math.max(xScale(geneRight) - xScale(geneLeft), 3);
        const y = (trackHeight - geneHeight) / 2;

        // Determine fill color
        let fillColor;
        const isQueryGene = gene.is_query && sd.species === querySpecies;
        if (isQueryGene) {
          fillColor = COLORS.queryGene;
        } else if (orthologId && orthologId === queryOrthologId) {
          fillColor = COLORS.queryOrtholog;
        } else if (orthologId) {
          fillColor = COLORS.orthologGene;
        } else {
          fillColor = COLORS.singletonGene;
        }

        // Arrow size
        const arrowSize = Math.min(6, Math.max(3, geneWidth * 0.25));
        const isForward = gene.strand === 'W' || gene.strand === '+';

        // Gene shape
        const points = isForward
          ? [
              [x, y],
              [x + geneWidth - arrowSize, y],
              [x + geneWidth, y + geneHeight / 2],
              [x + geneWidth - arrowSize, y + geneHeight],
              [x, y + geneHeight],
            ]
          : [
              [x, y + geneHeight / 2],
              [x + arrowSize, y],
              [x + geneWidth, y],
              [x + geneWidth, y + geneHeight],
              [x + arrowSize, y + geneHeight],
            ];

        trackGroup.append('polygon')
          .attr('points', points.map(p => p.join(',')).join(' '))
          .attr('fill', fillColor)
          .attr('stroke', isQueryGene ? '#b71c1c' : '#888')
          .attr('stroke-width', isQueryGene ? 1.5 : 0.5)
          .attr('class', 'gene-shape');

        // Only show label for query gene or query orthologs
        if ((gene.is_query || (orthologId === queryOrthologId)) && geneWidth > 25) {
          const labelText = gene.gene_name || gene.feature_name?.substring(0, 8) || '';
          trackGroup.append('text')
            .attr('x', x + geneWidth / 2)
            .attr('y', y + geneHeight / 2)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .style('font-size', '8px')
            .style('fill', '#fff')
            .style('pointer-events', 'none')
            .text(labelText.length > 8 ? labelText.substring(0, 8) : labelText);
        }
      });
    });

    // Draw Sybil-style ribbon connections (only for query ortholog)
    if (queryOrthologId) {
      const queryConn = connections.find(c => c.ortholog_id === queryOrthologId);
      if (queryConn) {
        const genePositions = [];

        speciesData.forEach(sd => {
          const genes = sd.genes || [];
          genes.forEach(gene => {
            if (queryConn.genes.includes(gene.feature_name)) {
              const xScale = xScales[sd.species];
              const geneLeft = Math.min(gene.start, gene.stop);
              const geneRight = Math.max(gene.start, gene.stop);
              const xLeft = xScale(geneLeft);
              const xRight = xScale(geneRight);
              const geneWidth = Math.max(xRight - xLeft, 3);
              genePositions.push({
                species: sd.species,
                speciesIndex: sd.index,
                xLeft: xLeft,
                xRight: xLeft + geneWidth,
                yTop: sd.yPosition + (trackHeight - geneHeight) / 2,
                yBottom: sd.yPosition + (trackHeight + geneHeight) / 2,
              });
            }
          });
        });

        // Sort by species index
        genePositions.sort((a, b) => a.speciesIndex - b.speciesIndex);

        // Draw trapezoid ribbons between consecutive species
        const connectionsGroup = g.insert('g', ':first-child').attr('class', 'connections-group');
        for (let i = 0; i < genePositions.length - 1; i++) {
          const p1 = genePositions[i];
          const p2 = genePositions[i + 1];
          if (p1.species === p2.species) continue;

          const points = [
            [p1.xLeft, p1.yBottom],
            [p1.xRight, p1.yBottom],
            [p2.xRight, p2.yTop],
            [p2.xLeft, p2.yTop],
          ];

          connectionsGroup.append('polygon')
            .attr('points', points.map(p => p.join(',')).join(' '))
            .attr('fill', COLORS.ribbon)
            .attr('fill-opacity', 0.6)
            .attr('stroke', COLORS.ribbonStroke)
            .attr('stroke-width', 0.5)
            .attr('stroke-opacity', 0.3);
        }

        // Draw vertical query highlight
        if (genePositions.length > 0) {
          const highlightGroup = g.insert('g', ':first-child').attr('class', 'query-highlight-group');
          genePositions.forEach(pos => {
            const padding = 3;
            highlightGroup.append('rect')
              .attr('x', pos.xLeft - padding)
              .attr('y', pos.yTop - 3)
              .attr('width', pos.xRight - pos.xLeft + padding * 2)
              .attr('height', pos.yBottom - pos.yTop + 6)
              .attr('fill', COLORS.queryHighlight)
              .attr('rx', 2)
              .attr('class', 'query-highlight');
          });
        }
      }
    }

  }, [syntenyData, geneToOrtholog, maxSpecies]);

  if (loading) {
    return (
      <div className="synteny-summary synteny-summary-loading">
        <div className="loading-spinner" />
        <span>Loading synteny...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="synteny-summary synteny-summary-error">
        <span>Unable to load synteny data</span>
      </div>
    );
  }

  if (!syntenyData) {
    return null;
  }

  return (
    <div className="synteny-summary">
      <div className="synteny-summary-header">
        <span className="synteny-summary-title">Synteny</span>
        <Link
          to={`/synteny-browser?gene=${encodeURIComponent(geneName)}`}
          className="synteny-summary-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          {orthologCount > maxSpecies
            ? `View all ${orthologCount} species →`
            : 'View full synteny →'}
        </Link>
      </div>
      <div className="synteny-summary-canvas" ref={containerRef} />
      <div className="synteny-summary-legend">
        <span className="legend-item query-item">
          <span className="legend-box query" />
          Query
        </span>
        <span className="legend-item ortholog-item">
          <span className="legend-box ortholog" />
          Ortholog
        </span>
        <span className="legend-item">
          <span className="legend-box other-ortholog" />
          Other ortholog
        </span>
        <span className="legend-item">
          <span className="legend-box other" />
          No ortholog
        </span>
      </div>
    </div>
  );
}

export default SyntenySummary;
