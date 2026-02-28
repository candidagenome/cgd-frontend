import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import OrganismSelector, { getDefaultOrganism } from './OrganismSelector';
import { renderCitationItem } from '../../utils/formatCitation.jsx';
import './LocusComponents.css';

function PhenotypeDetails({ data, loading, error, selectedOrganism, onOrganismChange }) {
  const [collapsedSections, setCollapsedSections] = useState({});

  // Get available organisms from the data - memoize to prevent new array reference each render
  const organisms = useMemo(() => {
    return data?.results ? Object.keys(data.results) : [];
  }, [data?.results]);

  // Set default organism if not already set and data is available
  useEffect(() => {
    if (organisms.length > 0 && !selectedOrganism) {
      const defaultOrg = getDefaultOrganism(organisms);
      if (defaultOrg && onOrganismChange) {
        onOrganismChange(defaultOrg);
      }
    }
  }, [organisms, selectedOrganism, onOrganismChange]);

  if (loading) return <div className="loading">Loading phenotype data...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!data || !data.results) return <div className="no-data">No phenotype data available</div>;

  if (organisms.length === 0) {
    return <div className="no-data">No phenotype annotations found</div>;
  }

  // Get data for the selected organism
  const orgData = selectedOrganism ? data.results[selectedOrganism] : null;

  // Map experiment types to root categories (like Perl does)
  // IMPORTANT: Do NOT produce an "Other" category.
  const getExperimentCategory = (experimentType) => {
    // Default missing/unknown experiment types into "Classical Genetics"
    if (!experimentType) return 'Classical Genetics';

    const type = experimentType.toLowerCase();
    if (type.includes('large-scale') || type.includes('large scale') || type.includes('survey')) {
      return 'Large-Scale Survey';
    }
    return 'Classical Genetics';
  };

  // Group annotations by experiment category, then by experiment type
  const groupAnnotations = (annotations) => {
    const groups = {};

    (annotations || []).forEach((ann) => {
      const category = getExperimentCategory(ann.experiment_type);
      const expType = ann.experiment_type || 'Unspecified';

      if (!groups[category]) groups[category] = {};
      if (!groups[category][expType]) groups[category][expType] = [];
      groups[category][expType].push(ann);
    });

    return groups;
  };

  const toggleSection = (key) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Category colors matching Perl style
  const categoryColors = {
    'Classical Genetics': '#1976d2',
    'Large-Scale Survey': '#7b1fa2',
  };

  // Group annotations for the selected organism
  const grouped = orgData ? groupAnnotations(orgData.annotations || []) : null;

  // AG Grid column definitions for phenotype table
  const columnDefs = useMemo(() => [
    {
      headerName: 'Experiment Type',
      field: 'experiment_type',
      flex: 1,
      minWidth: 120,
      valueGetter: (params) => params.data.experiment_type || params.data.experiment || '-',
      cellRenderer: (params) => (
        <div>
          {params.data.experiment_type || params.data.experiment || '-'}
          {params.data.experiment_comment && (
            <div className="experiment-comment">({params.data.experiment_comment})</div>
          )}
        </div>
      ),
    },
    {
      headerName: 'Mutant Information',
      field: 'mutant_type',
      flex: 1,
      minWidth: 140,
      autoHeight: true,
      valueGetter: (params) => params.data.mutant_type || '-',
      cellRenderer: (params) => {
        const ann = params.data;
        if (!ann.mutant_type) return '-';
        return (
          <div>
            <span>Description: {ann.mutant_type}</span>
            {ann.alleles && ann.alleles.length > 0 &&
              ann.alleles.map((allele, aIdx) => (
                <div key={aIdx}>
                  Allele: {allele.property_value}
                  {allele.property_description && <span> ({allele.property_description})</span>}
                </div>
              ))}
          </div>
        );
      },
    },
    {
      headerName: 'Strain Background',
      field: 'strain',
      flex: 1,
      minWidth: 100,
      valueGetter: (params) => params.data.strain || '-',
    },
    {
      headerName: 'Phenotype',
      field: 'phenotype',
      flex: 1,
      minWidth: 120,
      valueGetter: (params) => params.data.phenotype?.display_name || '-',
      cellRenderer: (params) => {
        const ann = params.data;
        if (!ann.phenotype?.display_name) return '-';
        return (
          <span>
            <Link
              to={`/phenotype/search?observable=${encodeURIComponent(ann.phenotype.display_name)}`}
              className="phenotype-link"
            >
              {ann.phenotype.display_name}
            </Link>
            {ann.qualifier && `: ${ann.qualifier}`}
          </span>
        );
      },
    },
    {
      headerName: 'Chemical',
      field: 'chemicals',
      flex: 1,
      minWidth: 100,
      autoHeight: true,
      valueGetter: (params) => {
        const chems = params.data.chemicals || [];
        return chems.map(c => c.property_value).join(', ') || '-';
      },
      cellRenderer: (params) => {
        const ann = params.data;
        if (!ann.chemicals || ann.chemicals.length === 0) return '-';
        return (
          <div>
            {ann.chemicals.map((chem, cIdx) => (
              <div key={cIdx}>
                {chem.property_value}
                {chem.property_description && <div>({chem.property_description})</div>}
              </div>
            ))}
          </div>
        );
      },
    },
    {
      headerName: 'Details',
      field: 'details',
      flex: 1,
      minWidth: 100,
      autoHeight: true,
      valueGetter: (params) => {
        const details = params.data.details || [];
        return details.map(d => `${d.property_type}: ${d.property_value}`).join(', ') || '-';
      },
      cellRenderer: (params) => {
        const ann = params.data;
        if (!ann.details || ann.details.length === 0) return '-';
        return (
          <div>
            {ann.details.map((detail, dIdx) => (
              <div key={dIdx}>
                {detail.property_type}: {detail.property_value}
                {detail.property_description && <div>({detail.property_description})</div>}
              </div>
            ))}
          </div>
        );
      },
    },
    {
      headerName: 'References',
      field: 'references',
      flex: 1.5,
      minWidth: 180,
      autoHeight: true,
      valueGetter: (params) => {
        const refs = params.data.references || (params.data.reference ? [params.data.reference] : []);
        return refs.map(r => r.display_name || r.pubmed_id || '').join('; ');
      },
      cellRenderer: (params) => {
        const refs = params.data.references || (params.data.reference ? [params.data.reference] : []);
        if (refs.length === 0) return '-';
        return (
          <div>
            {refs.map((ref, refIdx) => (
              <React.Fragment key={refIdx}>
                {renderCitationItem(ref, { itemClassName: 'phenotype-reference-item' })}
              </React.Fragment>
            ))}
          </div>
        );
      },
    },
  ], []);

  // Default column properties
  const defaultColDef = useMemo(() => ({
    sortable: true,
    filter: true,
    resizable: true,
    wrapText: true,
  }), []);

  // Grid ready callback
  const onGridReady = useCallback((params) => {
    params.api.sizeColumnsToFit();
  }, []);

  return (
    <div className="phenotype-details">
      {/* Organism Selector */}
      <OrganismSelector
        organisms={organisms}
        selectedOrganism={selectedOrganism}
        onOrganismChange={onOrganismChange}
        dataType="phenotype"
      />

      {/* Introductory text */}
      {selectedOrganism && orgData && (
        <div className="phenotype-intro">
          <p>
            This page lists all curated single mutant phenotypes associated with{' '}
            <strong>{orgData.locus_display_name}</strong>. Click on a term in the Phenotype
            column to see other genes associated with that term.
          </p>
        </div>
      )}

      {/* Display data for selected organism */}
      {selectedOrganism && orgData ? (
        <div className="phenotype-container">
          {grouped && Object.keys(grouped).length > 0 ? (
            <div className="phenotype-groups">
              {Object.entries(grouped).map(([category, expTypes]) => (
                <div key={category} className="phenotype-category">
                  <h4
                    className="category-header"
                    style={{ borderLeftColor: categoryColors[category] || '#616161' }}
                  >
                    {category}
                    <span className="annotation-count">
                      ({Object.values(expTypes).flat().length} annotations)
                    </span>
                  </h4>

                  {Object.entries(expTypes).map(([expType, annotations]) => {
                    const sectionKey = `${selectedOrganism}-${category}-${expType}`;
                    const isCollapsed = collapsedSections[sectionKey];

                    const showHeader = expType !== 'Unspecified';

                    return (
                      <div key={expType} className="experiment-type-section">
                        {showHeader && (
                          <div
                            className="experiment-type-header"
                            onClick={() => toggleSection(sectionKey)}
                            role="button"
                            tabIndex={0}
                          >
                            <span className="collapse-icon">{isCollapsed ? '▶' : '▼'}</span>
                            <span className="experiment-type-name">{expType}</span>
                            <span className="annotation-count">({annotations.length})</span>
                          </div>
                        )}

                        {!isCollapsed && (
                          <div className="phenotype-grid-wrapper ag-theme-alpine">
                            <AgGridReact
                              rowData={annotations}
                              columnDefs={columnDefs}
                              defaultColDef={defaultColDef}
                              domLayout="autoHeight"
                              pagination={annotations.length > 10}
                              paginationPageSize={10}
                              paginationPageSizeSelector={[10, 25, 50]}
                              onGridReady={onGridReady}
                              suppressCellFocus={true}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No phenotype annotations for this organism</p>
          )}

          {/* Curation note */}
          <div className="curation-note">
            <p>
              Curation of mutant phenotypes is an ongoing project at CGD. Please contact CGD
              curators to let us know of additional phenotype information that should be
              incorporated.
            </p>
          </div>
        </div>
      ) : (
        <p className="no-data">Select an organism to view phenotype annotations</p>
      )}
    </div>
  );
}

export default PhenotypeDetails;
