import React, { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import OrganismSelector, { getDefaultOrganism } from './OrganismSelector';
import { renderCitationItem } from '../../utils/formatCitation.jsx';
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

function InteractionDetails({ data, loading, error, selectedOrganism, onOrganismChange, orthologOrganisms = [] }) {
  const [physicalFilter, setPhysicalFilter] = useState('');
  const [geneticFilter, setGeneticFilter] = useState('');

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

  const defaultColDef = useMemo(() => ({
    sortable: true,
    resizable: true,
    filter: true,
  }), []);

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

        {totalInteractions > 0 ? (
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
            </div>

            <div className="interaction-stats">
              <div className="stat-row">
                <span className="stat-label">Physical Interactions:</span>
                <span className="stat-value">
                  {physicalInteractions.length} entries for {physicalGeneCount} genes
                </span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Genetic Interactions:</span>
                <span className="stat-value">
                  {geneticInteractions.length} entries for {geneticGeneCount} genes
                </span>
              </div>
            </div>
          </div>
        ) : (
          <p className="no-data">No interactions found for this gene.</p>
        )}
      </div>

      {/* Physical Interactions Section */}
      {physicalRows.length > 0 && (
        <div className="interaction-section">
          <h3>Physical Interactions</h3>
          <p className="section-subtitle">
            {physicalRows.length} entries for {physicalGeneCount} genes
          </p>

          <div className="table-controls">
            <input
              type="text"
              placeholder="Filter table..."
              value={physicalFilter}
              onChange={(e) => setPhysicalFilter(e.target.value)}
              className="quick-filter-input"
            />
          </div>

          <div className="ag-theme-alpine interaction-table" style={{ height: 400, width: '100%' }}>
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
        <div className="interaction-section">
          <h3>Genetic Interactions</h3>
          <p className="section-subtitle">
            {geneticRows.length} entries for {geneticGeneCount} genes
          </p>

          <div className="table-controls">
            <input
              type="text"
              placeholder="Filter table..."
              value={geneticFilter}
              onChange={(e) => setGeneticFilter(e.target.value)}
              className="quick-filter-input"
            />
          </div>

          <div className="ag-theme-alpine interaction-table" style={{ height: 400, width: '100%' }}>
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

      {/* Resources Section */}
      <div className="interaction-section">
        <h3>Resources</h3>
        <div className="interaction-resources">
          <a href="https://thebiogrid.org/" target="_blank" rel="noopener noreferrer">BioGRID</a>
          {' | '}
          <a href="https://string-db.org/" target="_blank" rel="noopener noreferrer">STRING</a>
          {' | '}
          <a href="https://www.ebi.ac.uk/intact/" target="_blank" rel="noopener noreferrer">IntAct</a>
          {' | '}
          <a href="https://dip.doe-mbi.ucla.edu/" target="_blank" rel="noopener noreferrer">DIP</a>
        </div>
      </div>
    </div>
  );
}

export default InteractionDetails;
