import React, { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import OrganismSelector, { getDefaultOrganism } from './OrganismSelector';
import InteractionNetwork from './InteractionNetwork';
import NetworkEnrichmentTable from './NetworkEnrichmentTable';
import { renderCitationItem } from '../../utils/formatCitation.jsx';
import locusApi from '../../api/locusApi';
import { goTermFinderApi } from '../../api/goTermFinderApi';
import { phenotypeEnrichmentApi } from '../../api/phenotypeEnrichmentApi';
import { venn as vennCompute, normalizeSolution, scaleSolution, computeTextCentres } from '@upsetjs/venn.js';
import './LocusComponents.css';

// Genetic interaction types (from BioGRID)
const GENETIC_TYPES = new Set([
  'Dosage Lethality',
  'Dosage Rescue',
  'Dosage Growth Defect',
  'Negative Genetic',
  'Positive Genetic',
  'Phenotypic Enhancement',
  'Phenotypic Suppression',
  'Synthetic Growth Defect',
  'Synthetic Haploinsufficiency',
  'Synthetic Lethality',
  'Synthetic Rescue',
]);

function InteractionDetails({ data, networkData, loading, networkLoading, error, selectedOrganism, onOrganismChange, orthologOrganisms = [], locusName }) {
  const [physicalFilter, setPhysicalFilter] = useState('');
  const [geneticFilter, setGeneticFilter] = useState('');
  const [stringFilter, setStringFilter] = useState('');
  const [showStringTable, setShowStringTable] = useState(false);
  const [showEnrichment, setShowEnrichment] = useState(false);
  const [enrichment, setEnrichment] = useState(null);
  const [enrichmentLoading, setEnrichmentLoading] = useState(false);
  const [enrichmentError, setEnrichmentError] = useState(null);
  // Export / Analyze toolbar (CGD GO Term Finder + Phenotype Enrichment over interactors)
  const [copyFeedback, setCopyFeedback] = useState(null);
  const [goEnrichment, setGoEnrichment] = useState({ loading: false, data: null, error: null, show: false });
  const [phenoEnrichment, setPhenoEnrichment] = useState({ loading: false, data: null, error: null, show: false });
  const [goManualOnly, setGoManualOnly] = useState(false);

  // Get available organisms from the data
  const organisms = useMemo(() => {
    return data?.results ? Object.keys(data.results) : [];
  }, [data?.results]);

  // Get the current organism's data
  const currentOrganism = selectedOrganism || getDefaultOrganism(organisms);
  const orgData = data?.results?.[currentOrganism];

  // Separate physical and genetic interactions
  const { physicalInteractions, geneticInteractions } = useMemo(() => {
    if (!orgData?.interactions) return { physicalInteractions: [], geneticInteractions: [] };

    const physical = [];
    const genetic = [];

    orgData.interactions.forEach(interaction => {
      if (GENETIC_TYPES.has(interaction.experiment_type)) {
        genetic.push(interaction);
      } else {
        physical.push(interaction);
      }
    });

    return { physicalInteractions: physical, geneticInteractions: genetic };
  }, [orgData]);

  // Get STRING interactions
  const stringInteractions = useMemo(() => {
    return orgData?.string_interactions || [];
  }, [orgData]);

  // Count unique interactors
  const { physicalGeneCount, geneticGeneCount } = useMemo(() => {
    const physicalGenes = new Set();
    const geneticGenes = new Set();

    physicalInteractions.forEach(i => {
      i.interactors?.forEach(int => physicalGenes.add(int.gene_name || int.feature_name));
    });
    geneticInteractions.forEach(i => {
      i.interactors?.forEach(int => geneticGenes.add(int.gene_name || int.feature_name));
    });

    return {
      physicalGeneCount: physicalGenes.size,
      geneticGeneCount: geneticGenes.size
    };
  }, [physicalInteractions, geneticInteractions]);

  // Build a 3-set Venn (Physical / Genetic / STRING) over shared interactor
  // genes. `size` is the inclusive overlap size (for the area-proportional
  // layout); `count` is the exclusive region count (shown as the label).
  const vennData = useMemo(() => {
    const keyOf = (gn, fn) => (gn || fn || '').toUpperCase();
    const P = new Set();
    const G = new Set();
    const S = new Set();
    physicalInteractions.forEach(i => i.interactors?.forEach(int => {
      const k = keyOf(int.gene_name, int.feature_name);
      if (k) P.add(k);
    }));
    geneticInteractions.forEach(i => i.interactors?.forEach(int => {
      const k = keyOf(int.gene_name, int.feature_name);
      if (k) G.add(k);
    }));
    stringInteractions.forEach(s => {
      const k = keyOf(s.interactor, s.interactor_feature_name);
      if (k) S.add(k);
    });

    let pgs = 0, pg = 0, ps = 0, gs = 0, pOnly = 0, gOnly = 0, sOnly = 0;
    new Set([...P, ...G, ...S]).forEach(k => {
      const inP = P.has(k), inG = G.has(k), inS = S.has(k);
      if (inP && inG && inS) pgs++;
      else if (inP && inG) pg++;
      else if (inP && inS) ps++;
      else if (inG && inS) gs++;
      else if (inP) pOnly++;
      else if (inG) gOnly++;
      else if (inS) sOnly++;
    });

    const sizes = { P: P.size, G: G.size, S: S.size };
    const areas = [];
    if (sizes.P) areas.push({ sets: ['Physical'], size: sizes.P, count: pOnly });
    if (sizes.G) areas.push({ sets: ['Genetic'], size: sizes.G, count: gOnly });
    if (sizes.S) areas.push({ sets: ['STRING'], size: sizes.S, count: sOnly });
    if (pg + pgs) areas.push({ sets: ['Physical', 'Genetic'], size: pg + pgs, count: pg });
    if (ps + pgs) areas.push({ sets: ['Physical', 'STRING'], size: ps + pgs, count: ps });
    if (gs + pgs) areas.push({ sets: ['Genetic', 'STRING'], size: gs + pgs, count: gs });
    if (pgs) areas.push({ sets: ['Physical', 'Genetic', 'STRING'], size: pgs, count: pgs });

    return {
      sizes,
      areas,
      present: { P: sizes.P > 0, G: sizes.G > 0, S: sizes.S > 0 },
    };
  }, [physicalInteractions, geneticInteractions, stringInteractions]);

  // Area-proportional Venn layout (circle positions + region/label centres).
  const VENN_FILL = { Physical: '#9575cd', Genetic: '#81c784', STRING: '#2196f3' };
  const VENN_STROKE = { Physical: '#6f54a8', Genetic: '#5aa05e', STRING: '#1976d2' };
  const vennLayout = useMemo(() => {
    const areas = vennData.areas;
    if (!areas.length) return null;
    try {
      const layoutAreas = areas.map(a => ({ sets: a.sets, size: a.size }));
      let solution = vennCompute(layoutAreas);
      solution = normalizeSolution(solution, Math.PI / 2);
      const circles = scaleSolution(solution, 300, 270, 38);
      const centres = computeTextCentres(circles, layoutAreas);

      // Place each set name centered just above its own circle. (Pushing labels
      // radially outward clipped them at the edges and collided when sets sit
      // close together.)
      const labels = Object.entries(circles).map(([name, c]) => ({
        name,
        x: c.x,
        y: c.y - c.radius - 8,
        anchor: 'middle',
      }));

      return { circles, centres, labels };
    } catch {
      return null;
    }
  }, [vennData]);

  // Flatten interactions for table display
  const flattenInteractions = useCallback((interactions) => {
    const rows = [];
    interactions.forEach(interaction => {
      if (interaction.interactors && interaction.interactors.length > 0) {
        interaction.interactors.forEach(interactor => {
          rows.push({
            ...interaction,
            interactor_gene_name: interactor.gene_name,
            interactor_feature_name: interactor.feature_name,
            interactor_action: interactor.action,
          });
        });
      } else {
        // Self-interaction
        rows.push({
          ...interaction,
          interactor_gene_name: orgData?.locus_display_name,
          interactor_feature_name: null,
          interactor_action: 'Self',
        });
      }
    });
    return rows;
  }, [orgData]);

  const physicalRows = useMemo(() => flattenInteractions(physicalInteractions), [physicalInteractions, flattenInteractions]);
  const geneticRows = useMemo(() => flattenInteractions(geneticInteractions), [geneticInteractions, flattenInteractions]);

  // Reference cell renderer - displays as citation with links
  const referenceCellRenderer = (params) => {
    const refs = params.data.references || [];
    if (refs.length === 0) return '-';
    return (
      <div className="reference-list">
        {refs.map((ref, idx) => (
          <div key={idx} className="interaction-reference-item">
            {renderCitationItem(ref, { showPmid: false, itemClassName: 'interaction-citation' })}
          </div>
        ))}
      </div>
    );
  };

  // Column definitions for Physical Interactions table
  const physicalColumnDefs = useMemo(() => [
    {
      headerName: 'Interactor',
      field: 'interactor_gene_name',
      flex: 0.6,
      minWidth: 80,
      cellRenderer: (params) => {
        const featureName = params.data.interactor_feature_name;
        const geneName = params.data.interactor_gene_name;
        if (!featureName) return geneName || '-';
        return (
          <Link to={`/locus/${featureName}`}>
            {geneName || featureName}
          </Link>
        );
      },
    },
    {
      headerName: 'Assay',
      field: 'experiment_type',
      flex: 1,
      minWidth: 160,
      wrapText: true,
      autoHeight: true,
      cellStyle: { 'white-space': 'normal' },
    },
    {
      headerName: 'Action',
      field: 'interactor_action',
      flex: 0.5,
      minWidth: 80,
    },
    {
      headerName: 'Source',
      field: 'source',
      flex: 0.5,
      minWidth: 90,
      valueGetter: (params) => params.data.source || '-',
    },
    {
      headerName: 'Description',
      field: 'description',
      flex: 0.8,
      minWidth: 100,
      wrapText: true,
      autoHeight: true,
      cellStyle: { 'white-space': 'normal' },
      valueGetter: (params) => params.data.description || '-',
    },
    {
      headerName: 'Reference',
      field: 'references',
      flex: 2,
      minWidth: 350,
      autoHeight: true,
      wrapText: true,
      cellStyle: { 'white-space': 'normal', 'line-height': '1.4' },
      cellRenderer: referenceCellRenderer,
    },
  ], []);

  // Column definitions for Genetic Interactions table
  const geneticColumnDefs = useMemo(() => [
    {
      headerName: 'Interactor',
      field: 'interactor_gene_name',
      flex: 0.6,
      minWidth: 80,
      cellRenderer: (params) => {
        const featureName = params.data.interactor_feature_name;
        const geneName = params.data.interactor_gene_name;
        if (!featureName) return geneName || '-';
        return (
          <Link to={`/locus/${featureName}`}>
            {geneName || featureName}
          </Link>
        );
      },
    },
    {
      headerName: 'Assay',
      field: 'experiment_type',
      flex: 1,
      minWidth: 160,
      wrapText: true,
      autoHeight: true,
      cellStyle: { 'white-space': 'normal' },
    },
    {
      headerName: 'Action',
      field: 'interactor_action',
      flex: 0.5,
      minWidth: 80,
    },
    {
      headerName: 'Source',
      field: 'source',
      flex: 0.5,
      minWidth: 90,
      valueGetter: (params) => params.data.source || '-',
    },
    {
      headerName: 'Phenotype',
      field: 'description',
      flex: 0.8,
      minWidth: 100,
      wrapText: true,
      autoHeight: true,
      cellStyle: { 'white-space': 'normal' },
      valueGetter: (params) => params.data.description || '-',
    },
    {
      headerName: 'Reference',
      field: 'references',
      flex: 2,
      minWidth: 350,
      autoHeight: true,
      wrapText: true,
      cellStyle: { 'white-space': 'normal', 'line-height': '1.4' },
      cellRenderer: referenceCellRenderer,
    },
  ], []);

  // Column definitions for STRING Interactions table
  const stringColumnDefs = useMemo(() => [
    {
      headerName: 'Interactor',
      field: 'interactor',
      flex: 0.8,
      minWidth: 100,
      cellRenderer: (params) => {
        const featureName = params.data.interactor_feature_name;
        const geneName = params.data.interactor;
        if (!featureName) return geneName || '-';
        return (
          <Link to={`/locus/${featureName}`}>
            {geneName}
          </Link>
        );
      },
    },
    {
      headerName: 'Combined Score',
      field: 'combined_score',
      flex: 0.6,
      minWidth: 110,
      cellRenderer: (params) => {
        const score = params.value;
        const percentage = (score / 10).toFixed(1);
        return `${score} (${percentage}%)`;
      },
    },
    {
      headerName: 'Experimental',
      field: 'experimental_score',
      flex: 0.5,
      minWidth: 90,
      valueFormatter: (params) => params.value || 0,
    },
    {
      headerName: 'Database',
      field: 'database_score',
      flex: 0.5,
      minWidth: 80,
      valueFormatter: (params) => params.value || 0,
    },
    {
      headerName: 'Text Mining',
      field: 'textmining_score',
      flex: 0.5,
      minWidth: 90,
      valueFormatter: (params) => params.value || 0,
    },
    {
      headerName: 'Co-expression',
      field: 'coexpression_score',
      flex: 0.5,
      minWidth: 100,
      valueFormatter: (params) => params.value || 0,
    },
  ], []);

  const defaultColDef = useMemo(() => ({
    sortable: true,
    resizable: true,
    filter: true,
  }), []);

  // Calculate table height based on row count
  const getTableHeight = useCallback((rowCount, maxHeight = 850, rowHeight = 90) => {
    const headerHeight = 48;
    const paginationHeight = 52;
    const pageSize = 10;
    const visibleRows = Math.min(rowCount, pageSize);
    const calculatedHeight = headerHeight + (visibleRows * rowHeight) + paginationHeight;
    return Math.max(200, Math.min(calculatedHeight, maxHeight));
  }, []);

  // Lazily fetch STRING functional enrichment when the section is expanded
  const handleToggleEnrichment = useCallback(async () => {
    const next = !showEnrichment;
    setShowEnrichment(next);
    if (next && !enrichment && !enrichmentLoading && locusName) {
      setEnrichmentLoading(true);
      setEnrichmentError(null);
      try {
        const resp = await locusApi.getStringEnrichment(locusName);
        setEnrichment(resp);
      } catch {
        setEnrichmentError('Could not load functional enrichment.');
      } finally {
        setEnrichmentLoading(false);
      }
    }
  }, [showEnrichment, enrichment, enrichmentLoading, locusName]);

  const orgEnrichment = enrichment?.results?.[currentOrganism] || null;

  // Curated BioGRID interaction partners (matches the Physical + Genetic
  // tables), deduped, query excluded. STRING-predicted partners are NOT
  // included so the gene count matches the visible interactors.
  const interactorGenes = useMemo(() => {
    if (!orgData) return [];
    const queryUpper = (orgData.locus_display_name || '').toUpperCase();
    const byKey = new Map();
    const add = (featureName, geneName) => {
      const key = (geneName || featureName || '').toUpperCase();
      if (!key || key === queryUpper) return;
      if (!byKey.has(key)) byKey.set(key, { feature_name: featureName || null, gene_name: geneName || null });
    };
    (orgData.interactions || []).forEach(i =>
      (i.interactors || []).forEach(int => add(int.feature_name, int.gene_name))
    );
    return [...byKey.values()];
  }, [orgData]);

  const geneNamesForApi = useMemo(
    () => interactorGenes.map(g => g.feature_name || g.gene_name).filter(Boolean),
    [interactorGenes]
  );
  const organismNo = orgData?.organism_no;

  // Store gene list + organism for the GO Term Finder / GO Slim Mapper pages
  const handleAnalyzeGeneList = useCallback(() => {
    localStorage.setItem('phenotypeSearchGeneList', JSON.stringify(geneNamesForApi));
    if (currentOrganism) localStorage.setItem('phenotypeSearchOrganism', currentOrganism);
  }, [geneNamesForApi, currentOrganism]);

  const handleCopyGeneList = useCallback(async () => {
    const text = interactorGenes.map(g => g.gene_name || g.feature_name).join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback('copied');
    } catch {
      setCopyFeedback('error');
    }
    setTimeout(() => setCopyFeedback(null), 2000);
  }, [interactorGenes]);

  const handleDownloadGeneCsv = useCallback(() => {
    const header = ['gene_name', 'systematic_name'];
    const rows = interactorGenes.map(g => [g.gene_name || '', g.feature_name || '']);
    const csv = [
      `# Interaction partners of ${orgData?.locus_display_name || locusName}`,
      header.join(','),
      ...rows.map(r => r.map(c => `"${c}"`).join(',')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${orgData?.locus_display_name || locusName}_interactors.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }, [interactorGenes, orgData, locusName]);

  const handleGoEnrichment = useCallback(async () => {
    if (!organismNo || geneNamesForApi.length === 0) {
      setGoEnrichment({ loading: false, data: null, show: true,
        error: 'No interaction partners available for enrichment.' });
      return;
    }
    setGoEnrichment({ loading: true, data: null, error: null, show: true });
    try {
      const params = {
        genes: geneNamesForApi, organism_no: organismNo, ontology: 'all',
        p_value_cutoff: 0.05, correction_method: 'bh', min_genes_in_term: 2,
      };
      if (goManualOnly) params.annotation_types = ['manually_curated'];
      const result = await goTermFinderApi.runAnalysis(params);
      setGoEnrichment({ loading: false, data: result, error: null, show: true });
    } catch (err) {
      setGoEnrichment({ loading: false, data: null, show: true,
        error: err.response?.data?.detail || err.message || 'GO enrichment failed' });
    }
  }, [organismNo, geneNamesForApi, goManualOnly]);

  const handlePhenotypeEnrichment = useCallback(async () => {
    if (!organismNo || geneNamesForApi.length === 0) {
      setPhenoEnrichment({ loading: false, data: null, show: true,
        error: 'No interaction partners available for enrichment.' });
      return;
    }
    setPhenoEnrichment({ loading: true, data: null, error: null, show: true });
    try {
      const result = await phenotypeEnrichmentApi.runAnalysis({
        genes: geneNamesForApi, organism_no: organismNo,
        p_value_cutoff: 0.05, correction_method: 'bh', min_genes_in_term: 2,
      });
      setPhenoEnrichment({ loading: false, data: result, error: null, show: true });
    } catch (err) {
      setPhenoEnrichment({ loading: false, data: null, show: true,
        error: err.response?.data?.detail || err.message || 'Phenotype enrichment failed' });
    }
  }, [organismNo, geneNamesForApi]);

  // Normalize GO Term Finder / Phenotype API results into NetworkEnrichmentTable rows
  const goRows = useMemo(() => {
    const r = goEnrichment.data?.result;
    if (!r) return [];
    const all = [...(r.process_terms || []), ...(r.function_terms || []), ...(r.component_terms || [])];
    all.sort((a, b) => (a.fdr ?? a.p_value) - (b.fdr ?? b.p_value));
    return all.map((t, i) => ({
      key: `go-${t.goid}-${i}`,
      category: t.aspect_name,
      description: t.go_term,
      termId: t.goid,
      termUrl: `/go/${t.goid}`,
      count: t.query_count,
      fold: t.fold_enrichment,
      fdr: t.fdr ?? t.p_value,
      genes: (t.genes || []).map(g => ({ label: g.gene_name || g.systematic_name, feature_name: g.systematic_name })),
    }));
  }, [goEnrichment.data]);

  const phenoRows = useMemo(() => {
    const r = phenoEnrichment.data?.result;
    if (!r) return [];
    const all = [...(r.enriched_phenotypes || [])];
    all.sort((a, b) => (a.fdr ?? a.p_value) - (b.fdr ?? b.p_value));
    return all.map((p, i) => {
      const extra = [p.qualifier, p.mutant_type].filter(Boolean).join(', ');
      return {
        key: `ph-${p.phenotype_no}-${i}`,
        description: extra ? `${p.observable} (${extra})` : p.observable,
        termId: null,
        termUrl: `/phenotype/search?observable=${encodeURIComponent(p.observable)}`,
        count: p.query_count,
        fold: p.fold_enrichment,
        fdr: p.fdr ?? p.p_value,
        genes: (p.genes || []).map(g => ({ label: g.gene_name || g.systematic_name, feature_name: g.systematic_name })),
      };
    });
  }, [phenoEnrichment.data]);

  if (loading) return <div className="loading">Loading interaction data...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!data || !data.results) return <div className="no-data">No interaction data available</div>;

  if (!orgData) {
    return (
      <div className="interaction-details">
        <OrganismSelector
          organisms={organisms}
          selectedOrganism={currentOrganism}
          onOrganismChange={onOrganismChange}
          orthologOrganisms={orthologOrganisms}
        />
        <div className="no-data">No interaction data available for {currentOrganism}.</div>
      </div>
    );
  }

  const totalInteractions = (orgData.interactions?.length || 0);

  return (
    <div className="interaction-details">
      <OrganismSelector
        organisms={organisms}
        selectedOrganism={currentOrganism}
        onOrganismChange={onOrganismChange}
        orthologOrganisms={orthologOrganisms}
      />

      {/* Overview Section */}
      <div className="interaction-overview-section">
        <h2>{orgData.locus_display_name} Interactions</h2>

        <p className="interaction-source-note">
          Source: All physical and genetic interaction annotations listed in CGD are curated by CGD and{' '}
          <a href="https://thebiogrid.org/" target="_blank" rel="noopener noreferrer">BioGRID</a>.
          {' '}STRING associations are computational predictions from{' '}
          <a href="https://string-db.org/" target="_blank" rel="noopener noreferrer">STRING</a>, not manually curated.
        </p>

        {(totalInteractions > 0 || stringInteractions.length > 0) ? (
          <div className="interaction-summary-viz">
            {vennLayout && (
              <svg
                className="interaction-venn"
                viewBox="0 0 300 270"
                width="320"
                role="img"
                aria-label="Area-proportional Venn diagram of physical, genetic, and STRING interaction partners"
              >
                {Object.entries(vennLayout.circles).map(([name, c]) => (
                  <circle
                    key={`c-${name}`}
                    cx={c.x}
                    cy={c.y}
                    r={c.radius}
                    fill={VENN_FILL[name]}
                    fillOpacity={name === 'STRING' ? 0.4 : 0.5}
                    stroke={VENN_STROKE[name]}
                  />
                ))}
                {vennLayout.labels.map((l) => (
                  <text key={`l-${l.name}`} x={l.x} y={l.y} className="venn-set-label" textAnchor={l.anchor}>
                    {l.name}
                  </text>
                ))}
                {vennData.areas.map((a) => {
                  const centre = vennLayout.centres[a.sets.toString()];
                  if (!centre || !a.count) return null;
                  return (
                    <text key={`n-${a.sets.join('_')}`} x={centre.x} y={centre.y} className="venn-count">
                      {a.count}
                    </text>
                  );
                })}
              </svg>
            )}

            <div className="interaction-venn-legend">
              {vennData.present.P && (
                <span className="venn-legend-item"><span className="venn-swatch physical" />Physical ({vennData.sizes.P})</span>
              )}
              {vennData.present.G && (
                <span className="venn-legend-item"><span className="venn-swatch genetic" />Genetic ({vennData.sizes.G})</span>
              )}
              {vennData.present.S && (
                <span className="venn-legend-item"><span className="venn-swatch string" />STRING ({vennData.sizes.S})</span>
              )}
            </div>
            <p className="venn-caption">Counts are interactor genes; overlaps are genes shared between interaction types.</p>
          </div>
        ) : (
          <p className="no-data">No interactions found for this gene.</p>
        )}
      </div>

      {/* Physical Interactions Section */}
      {physicalRows.length > 0 && (
        <div className="interaction-section">
          <div className="section-header-row">
            <h3>Physical Interactions</h3>
            <span className="section-entry-count">{physicalRows.length} entries for {physicalGeneCount} genes</span>
          </div>
          <div className="table-controls">
            <input
              type="text"
              placeholder="Filter table..."
              value={physicalFilter}
              onChange={(e) => setPhysicalFilter(e.target.value)}
              className="quick-filter-input"
            />
          </div>

          <div className="ag-theme-alpine interaction-table" style={{ height: getTableHeight(physicalRows.length), width: '100%' }}>
            <AgGridReact
              rowData={physicalRows}
              columnDefs={physicalColumnDefs}
              defaultColDef={defaultColDef}
              quickFilterText={physicalFilter}
              pagination={true}
              paginationPageSize={10}
              paginationPageSizeSelector={[10, 25, 50]}
              domLayout="normal"
            />
          </div>
        </div>
      )}

      {/* Genetic Interactions Section */}
      {geneticRows.length > 0 && (
        <div className="interaction-section" style={{ marginTop: '2rem' }}>
          <div className="section-header-row">
            <h3>Genetic Interactions</h3>
            <span className="section-entry-count">{geneticRows.length} entries for {geneticGeneCount} genes</span>
          </div>
          <div className="table-controls">
            <input
              type="text"
              placeholder="Filter table..."
              value={geneticFilter}
              onChange={(e) => setGeneticFilter(e.target.value)}
              className="quick-filter-input"
            />
          </div>

          <div className="ag-theme-alpine interaction-table" style={{ height: getTableHeight(geneticRows.length, 1000), width: '100%' }}>
            <AgGridReact
              rowData={geneticRows}
              columnDefs={geneticColumnDefs}
              defaultColDef={defaultColDef}
              quickFilterText={geneticFilter}
              pagination={true}
              paginationPageSize={10}
              paginationPageSizeSelector={[10, 25, 50]}
              domLayout="normal"
            />
          </div>
        </div>
      )}

      {/* Interaction Network - shows all interaction types */}
      {(totalInteractions > 0 || stringInteractions.length > 0) && (
        <InteractionNetwork
          networkData={networkData?.results?.[currentOrganism]}
          loading={networkLoading}
          locusName={orgData?.locus_display_name}
        />
      )}

      {/* Export & Analyze the interaction partners (CGD GO + Phenotype enrichment) */}
      {interactorGenes.length > 0 && (
        <div className="interaction-section" style={{ marginTop: '2rem' }}>
          <div className="similar-genes-export-toolbar">
            <span className="export-label">Export ({interactorGenes.length} genes):</span>
            <button className="export-btn" onClick={handleCopyGeneList} title="Copy interactor gene names to clipboard">
              {copyFeedback === 'copied' ? 'Copied!' : copyFeedback === 'error' ? 'Error' : 'Copy'}
            </button>
            <button className="export-btn" onClick={handleDownloadGeneCsv} title="Download interactor gene list as CSV">
              CSV
            </button>
            <span className="export-separator">|</span>
            <span className="export-label">Analyze:</span>
            <button
              className="export-btn analyze-btn"
              onClick={handleGoEnrichment}
              disabled={goEnrichment.loading || !organismNo}
              title="Find enriched GO terms among the interaction partners"
            >
              {goEnrichment.loading ? 'Analyzing…' : 'GO Enrich'}
            </button>
            <label className="manual-only-toggle" title="Exclude computational annotations (IEA, ISO, etc.) from GO enrichment">
              <input type="checkbox" checked={goManualOnly} onChange={(e) => setGoManualOnly(e.target.checked)} />
              <span>Manual only</span>
            </label>
            <button
              className="export-btn analyze-btn"
              onClick={handlePhenotypeEnrichment}
              disabled={phenoEnrichment.loading || !organismNo}
              title="Find enriched phenotypes among the interaction partners"
            >
              {phenoEnrichment.loading ? 'Analyzing…' : 'Phenotype'}
            </button>
            <span className="export-separator">|</span>
            <span className="export-label">GO Tools:</span>
            <a href="/go-term-finder" target="_blank" rel="noopener noreferrer"
               className="export-btn analyze-link" onClick={handleAnalyzeGeneList}
               title="Open GO Term Finder in a new tab">Term Finder ↗</a>
            <a href="/go-slim-mapper" target="_blank" rel="noopener noreferrer"
               className="export-btn analyze-link" onClick={handleAnalyzeGeneList}
               title="Open GO Slim Mapper in a new tab">Slim Mapper ↗</a>
          </div>

          {/* GO Enrichment results */}
          {goEnrichment.show && (
            <div style={{ marginTop: '14px' }}>
              <h4 className="enrichment-subhead">GO Enrichment</h4>
              {goEnrichment.loading && <div className="loading">Running GO enrichment…</div>}
              {goEnrichment.error && <div className="error">{goEnrichment.error}</div>}
              {!goEnrichment.loading && !goEnrichment.error && (
                goRows.length === 0
                  ? <p className="no-data">No significantly enriched GO terms found.</p>
                  : <NetworkEnrichmentTable rows={goRows} showCategory showFold pageSize={10} />
              )}
            </div>
          )}

          {/* Phenotype Enrichment results */}
          {phenoEnrichment.show && (
            <div style={{ marginTop: '14px' }}>
              <h4 className="enrichment-subhead">Phenotype Enrichment</h4>
              {phenoEnrichment.loading && <div className="loading">Running phenotype enrichment…</div>}
              {phenoEnrichment.error && <div className="error">{phenoEnrichment.error}</div>}
              {!phenoEnrichment.loading && !phenoEnrichment.error && (
                phenoRows.length === 0
                  ? <p className="no-data">No significantly enriched phenotypes found.</p>
                  : <NetworkEnrichmentTable rows={phenoRows} showCategory={false} showFold pageSize={10} />
              )}
            </div>
          )}
        </div>
      )}

      {/* Predicted Functional Associations from STRING */}
      {stringInteractions.length > 0 && (
        <div className="interaction-section" style={{ marginTop: '2rem' }}>
          <div className="section-header-row">
            <h3>Predicted Functional Associations from STRING</h3>
            <span className="section-entry-count">{stringInteractions.length} associations</span>
          </div>
          <p className="string-source-note">
            These are predicted protein-protein functional associations from{' '}
            <a href="https://string-db.org/" target="_blank" rel="noopener noreferrer">STRING</a>.
            They may include physical interactions, pathway relationships, co-expression, text-mining associations,
            and other evidence types. Higher-confidence associations are shown in the network above.
          </p>

          <button
            className="string-toggle-btn"
            onClick={() => setShowStringTable(!showStringTable)}
          >
            {showStringTable ? '▼ Hide STRING evidence scores' : '▶ Show STRING evidence scores'}
          </button>

          {showStringTable && (
            <>
              <div className="table-controls" style={{ marginTop: '10px' }}>
                <input
                  type="text"
                  placeholder="Filter table..."
                  value={stringFilter}
                  onChange={(e) => setStringFilter(e.target.value)}
                  className="quick-filter-input"
                />
              </div>

              <div className="ag-theme-alpine interaction-table" style={{ height: getTableHeight(stringInteractions.length, 550, 42), width: '100%' }}>
                <AgGridReact
                  rowData={stringInteractions}
                  columnDefs={stringColumnDefs}
                  defaultColDef={defaultColDef}
                  quickFilterText={stringFilter}
                  pagination={true}
                  paginationPageSize={10}
                  paginationPageSizeSelector={[10, 25, 50]}
                  domLayout="normal"
                />
              </div>
            </>
          )}
        </div>
      )}


      {/* Functional Enrichment of the STRING network */}
      {stringInteractions.length > 0 && (
        <div className="interaction-section" style={{ marginTop: '2rem' }}>
          <div className="section-header-row">
            <h3>Functional Enrichment of Network (STRING)</h3>
          </div>
          <p className="string-source-note">
            GO terms and pathways over-represented among {orgData.locus_display_name}&apos;s{' '}
            <a href="https://string-db.org/" target="_blank" rel="noopener noreferrer">STRING</a>{' '}
            network partners &mdash; i.e. the functions this gene&apos;s neighborhood is enriched for.
          </p>

          <button className="string-toggle-btn" onClick={handleToggleEnrichment}>
            {showEnrichment ? '▼ Hide functional enrichment' : '▶ Show functional enrichment'}
          </button>

          {showEnrichment && (
            <div style={{ marginTop: '10px' }}>
              {enrichmentLoading && <div className="loading">Computing enrichment…</div>}
              {enrichmentError && <div className="error">{enrichmentError}</div>}
              {!enrichmentLoading && !enrichmentError && (
                !orgEnrichment || orgEnrichment.terms.length === 0 ? (
                  <p className="no-data">No significant functional enrichment found.</p>
                ) : (
                  <>
                    <p className="section-entry-count" style={{ marginBottom: '8px' }}>
                      {orgEnrichment.terms.length} enriched terms across {orgEnrichment.network_size} network genes
                    </p>
                    <NetworkEnrichmentTable
                      rows={orgEnrichment.terms.map((t, i) => ({
                        key: `st-${i}`,
                        category: t.category_label,
                        description: t.description,
                        termId: t.term,
                        count: t.genes,
                        fold: null,
                        fdr: t.fdr,
                        genes: t.gene_list || [],
                      }))}
                      showCategory
                      showFold={false}
                    />
                  </>
                )
              )}
            </div>
          )}
        </div>
      )}

      {/* Resources Section */}
      <div className="interaction-section" style={{ marginTop: '2.5rem' }}>
        <h3 style={{ marginBottom: 0, paddingBottom: '6px' }}>Resources</h3>
        <div className="interaction-resources" style={{ marginTop: '4px' }}>
          <a href="https://thebiogrid.org/" target="_blank" rel="noopener noreferrer">BioGRID</a>
          {' | '}
          <a href="https://string-db.org/" target="_blank" rel="noopener noreferrer">STRING</a>
        </div>
      </div>
    </div>
  );
}

export default InteractionDetails;
