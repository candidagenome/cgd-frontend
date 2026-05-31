import React, { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import OrganismSelector, { getDefaultOrganism } from './OrganismSelector';
import InteractionNetwork from './InteractionNetwork';
import { renderCitationItem } from '../../utils/formatCitation.jsx';
import locusApi from '../../api/locusApi';
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
          Source: All physical and genetic interaction annotations listed in CGD are curated by{' '}
          <a href="https://thebiogrid.org/" target="_blank" rel="noopener noreferrer">BioGRID</a>.
        </p>

        {(totalInteractions > 0 || stringInteractions.length > 0) ? (
          <div className="interaction-summary-viz">
            <div className="interaction-circles">
              {physicalInteractions.length > 0 && (
                <div className="interaction-circle physical">
                  <span className="circle-label">Physical</span>
                  <span className="circle-count">{physicalInteractions.length}</span>
                </div>
              )}
              {geneticInteractions.length > 0 && (
                <div className="interaction-circle genetic">
                  <span className="circle-label">Genetic</span>
                  <span className="circle-count">{geneticInteractions.length}</span>
                </div>
              )}
              {stringInteractions.length > 0 && (
                <div className="interaction-circle string">
                  <span className="circle-label">STRING</span>
                  <span className="circle-count">{stringInteractions.length}</span>
                </div>
              )}
            </div>
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
                    <table className="enrichment-table">
                      <thead>
                        <tr>
                          <th>Category</th>
                          <th>Term</th>
                          <th>Genes</th>
                          <th>FDR</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orgEnrichment.terms.map((t, i) => (
                          <tr key={`${t.term}-${i}`}>
                            <td className="enrichment-cat">{t.category_label}</td>
                            <td>
                              {t.description}{' '}
                              <span className="enrichment-termid">({t.term})</span>
                            </td>
                            <td className="enrichment-num">{t.genes}</td>
                            <td className="enrichment-num">{t.fdr < 0.001 ? t.fdr.toExponential(1) : t.fdr.toFixed(3)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )
              )}
            </div>
          )}
        </div>
      )}

      {/* Resources Section */}
      <div className="interaction-section">
        <h3>Resources</h3>
        <div className="interaction-resources">
          <a href="https://thebiogrid.org/" target="_blank" rel="noopener noreferrer">BioGRID</a>
          {' | '}
          <a href="https://string-db.org/" target="_blank" rel="noopener noreferrer">STRING</a>
        </div>
      </div>
    </div>
  );
}

export default InteractionDetails;
