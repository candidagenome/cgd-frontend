import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import OrganismSelector, { getDefaultOrganism } from './OrganismSelector';
import { renderCitationItem } from '../../utils/formatCitation.jsx';
import './LocusComponents.css';

// Annotation type labels (matching Perl format)
const ANNOTATION_TYPE_LABELS = {
  'manually curated': 'Manually Curated',
  'high-throughput': 'High-Throughput Experiments',
  'computational': 'Computational',
};

// Aspect labels
const ASPECT_LABELS = {
  'F': 'Molecular Function',
  'P': 'Biological Process',
  'C': 'Cellular Component',
};

// Section explanatory notes (matching Perl _section_note)
const SECTION_NOTES = {
  'manually curated': 'Manually Curated GO annotations reflect our best understanding of the basic molecular function, biological process, and cellular component for this gene product. Manually Curated annotations are assigned by CGD curators based on published, small-scale experiments. Curators periodically review all Manually Curated GO annotations for accuracy and completeness.',
  'high-throughput': 'GO annotation from High-throughput Experiments are made based on a variety of large scale high-throughput experiments, including genome-wide experiments. Many of these annotations are made based on GO annotations (or mappings to GO annotations) assigned by the authors, rather than CGD curators. While CGD curators read these publications and often work closely with authors to incorporate the information, each individual annotation is not necessarily reviewed by a curator.',
  'computational': 'Computational GO annotations are predictions based on computational methods (e.g., sequence similarity comparisons) and are not individually reviewed by a curator.',
};

// Evidence code descriptions
const EVIDENCE_DESCRIPTIONS = {
  'EXP': 'Inferred from Experiment',
  'IDA': 'Inferred from Direct Assay',
  'IPI': 'Inferred from Physical Interaction',
  'IMP': 'Inferred from Mutant Phenotype',
  'IGI': 'Inferred from Genetic Interaction',
  'IEP': 'Inferred from Expression Pattern',
  'HTP': 'High Throughput Experiment',
  'HDA': 'High Throughput Direct Assay',
  'HMP': 'High Throughput Mutant Phenotype',
  'HGI': 'High Throughput Genetic Interaction',
  'HEP': 'High Throughput Expression Pattern',
  'IBA': 'Inferred from Biological Aspect of Ancestor',
  'IBD': 'Inferred from Biological Aspect of Descendant',
  'IKR': 'Inferred from Key Residues',
  'IRD': 'Inferred from Rapid Divergence',
  'ISS': 'Inferred from Sequence or Structural Similarity',
  'ISO': 'Inferred from Sequence Orthology',
  'ISA': 'Inferred from Sequence Alignment',
  'ISM': 'Inferred from Sequence Model',
  'IGC': 'Inferred from Genomic Context',
  'RCA': 'Reviewed Computational Analysis',
  'TAS': 'Traceable Author Statement',
  'NAS': 'Non-traceable Author Statement',
  'IC': 'Inferred by Curator',
  'ND': 'No Biological Data Available',
  'IEA': 'Inferred from Electronic Annotation',
};

function GoDetails({ data, loading, error, selectedOrganism, onOrganismChange }) {
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

  if (loading) return <div className="loading">Loading GO annotations...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!data || !data.results) return <div className="no-data">No GO annotation data available</div>;

  if (organisms.length === 0) {
    return <div className="no-data">No GO annotations found</div>;
  }

  // Get data for the selected organism
  const orgData = selectedOrganism ? data.results[selectedOrganism] : null;

  // Group annotations by annotation_type, then by aspect
  const groupAnnotations = (annotations) => {
    const groups = {};

    // Initialize groups for each annotation type
    Object.keys(ANNOTATION_TYPE_LABELS).forEach(type => {
      groups[type] = {
        'F': [],  // Molecular Function
        'P': [],  // Biological Process
        'C': [],  // Cellular Component
      };
    });

    annotations.forEach(ann => {
      const type = ann.annotation_type?.toLowerCase() || 'manually curated';
      const aspect = ann.term?.aspect?.toUpperCase() || 'P';

      if (groups[type] && groups[type][aspect]) {
        groups[type][aspect].push(ann);
      }
    });

    return groups;
  };

  const toggleSection = (key) => {
    setCollapsedSections(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Group annotations for the selected organism
  const grouped = orgData ? groupAnnotations(orgData.annotations || []) : null;

  // Count total annotations per type
  const countAnnotationsForType = (typeData) => {
    return Object.values(typeData).reduce((sum, arr) => sum + arr.length, 0);
  };

  // AG Grid column definitions for GO annotations
  const columnDefs = useMemo(() => [
    {
      headerName: 'Annotation',
      field: 'term',
      flex: 2,
      minWidth: 200,
      autoHeight: true,
      cellRenderer: (params) => {
        const ann = params.data;
        return (
          <div className="go-annotation-cell">
            {ann.qualifier && (
              <span className={`go-qualifier ${ann.qualifier.toLowerCase() === 'not' ? 'qualifier-not' : ''}`}>
                {ann.qualifier}
              </span>
            )}
            {' '}
            <a href={`/go/${ann.term?.goid}`} target="go_tab">
              {ann.term?.display_name}
            </a>
          </div>
        );
      },
    },
    {
      headerName: 'Reference',
      field: 'references',
      flex: 2,
      minWidth: 200,
      autoHeight: true,
      cellRenderer: (params) => {
        const ann = params.data;
        return (
          <div className="go-reference-cell">
            {ann.references?.map((ref, refIdx) => (
              <div key={refIdx} className="go-reference-item">
                {renderCitationItem(ref, { itemClassName: 'go-reference-item' })}
              </div>
            ))}
          </div>
        );
      },
    },
    {
      headerName: 'Evidence',
      field: 'evidence',
      flex: 2,
      minWidth: 180,
      autoHeight: true,
      cellRenderer: (params) => {
        const ann = params.data;
        return (
          <div className="go-evidence-cell">
            <span title={EVIDENCE_DESCRIPTIONS[ann.evidence?.code] || ann.evidence?.code}>
              {ann.evidence?.code}
            </span>
            {EVIDENCE_DESCRIPTIONS[ann.evidence?.code] && (
              <span className="evidence-description">
                {' : '}{EVIDENCE_DESCRIPTIONS[ann.evidence?.code]}
              </span>
            )}
            {ann.evidence?.with_from && (
              <div className="evidence-with">with {ann.evidence.with_from}</div>
            )}
            {ann.date_created && (
              <div className="assigned-date">Assigned on {ann.date_created}</div>
            )}
          </div>
        );
      },
    },
    {
      headerName: 'Assigned By',
      field: 'source',
      flex: 1,
      minWidth: 100,
      valueGetter: (params) => params.data.source || '-',
    },
  ], []);

  // Default column properties
  const defaultColDef = useMemo(() => ({
    sortable: true,
    resizable: true,
    wrapText: true,
  }), []);

  // Grid ready callback
  const onGridReady = useCallback((params) => {
    params.api.sizeColumnsToFit();
  }, []);

  // Render a single GO annotation table for an aspect
  const renderAspectTable = (annotations, aspectKey, typeKey) => {
    if (!annotations || annotations.length === 0) return null;

    const sectionKey = `${selectedOrganism}-${typeKey}-${aspectKey}`;
    const isCollapsed = collapsedSections[sectionKey];

    return (
      <div key={aspectKey} className="go-aspect-section">
        <h5
          className="aspect-subheader"
          onClick={() => toggleSection(sectionKey)}
        >
          <span className="collapse-icon">{isCollapsed ? '>' : 'v'}</span>
          {ASPECT_LABELS[aspectKey]}
          <span className="count-badge">{annotations.length}</span>
        </h5>

        {!isCollapsed && (
          <div className="go-grid-wrapper ag-theme-alpine">
            <AgGridReact
              rowData={annotations}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              domLayout="autoHeight"
              suppressPaginationPanel={true}
              onGridReady={onGridReady}
              suppressCellFocus={true}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="go-details">
      {/* Organism Selector */}
      <OrganismSelector
        organisms={organisms}
        selectedOrganism={selectedOrganism}
        onOrganismChange={onOrganismChange}
        dataType="go"
      />

      {/* Introductory text */}
      <div className="go-intro">
        <p>This page displays GO annotations in different sections according to the methods used in the reference from which the annotation was made:</p>
        <ul>
          <li><a href="#manually-curated"><strong>Manually Curated GO Annotations</strong></a>: includes annotations based on published experiments or analyses that focus on specific genes.</li>
          <li><a href="#high-throughput"><strong>GO Annotations from High-throughput Experiments</strong></a>: includes annotations made from published experiments performed on a high-throughput or genome-wide basis.</li>
          <li><a href="#computational"><strong>Computational GO Annotations</strong></a>: includes annotations that are predicted by computational methods (e.g., sequence similarity comparisons) and are not individually reviewed.</li>
        </ul>
      </div>

      {/* Display data for selected organism */}
      {selectedOrganism && orgData ? (
        <div className="organism-section">
          <h3 className="organism-name">{selectedOrganism}</h3>
          <p className="locus-display">Locus: {orgData.locus_display_name}</p>

          {orgData.annotations && orgData.annotations.length > 0 ? (
            <div className="go-annotation-types">
              {/* Iterate through annotation types in order */}
              {Object.entries(ANNOTATION_TYPE_LABELS).map(([typeKey, typeLabel]) => {
                const typeData = grouped[typeKey];
                const totalCount = countAnnotationsForType(typeData);

                // Get last reviewed date for manually curated section
                const lastReviewedDate = typeKey === 'manually curated' && orgData.last_reviewed_date
                  ? new Date(orgData.last_reviewed_date).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'short', day: 'numeric'
                    })
                  : null;

                if (totalCount === 0) {
                  return (
                    <div key={typeKey} id={typeKey.replace(/\s+/g, '-')} className="annotation-type-section">
                      <h4 className="annotation-type-header">{typeLabel} GO Annotations</h4>
                      <p className="no-data">No {typeLabel} GO Annotations for {orgData.locus_display_name}.</p>
                    </div>
                  );
                }

                return (
                  <div key={typeKey} id={typeKey.replace(/\s+/g, '-')} className="annotation-type-section">
                    <h4 className="annotation-type-header">
                      {typeLabel} GO Annotations
                      <span className="count-badge">{totalCount}</span>
                    </h4>

                    {/* Last reviewed date for manually curated */}
                    {lastReviewedDate && (
                      <p className="last-reviewed">Last Reviewed on: {lastReviewedDate}</p>
                    )}

                    {/* Section note */}
                    <p className="section-note">{SECTION_NOTES[typeKey]}</p>

                    {/* Render each aspect (F, P, C) */}
                    {['F', 'P', 'C'].map(aspectKey =>
                      renderAspectTable(typeData[aspectKey], aspectKey, typeKey)
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="no-data">No GO annotations for this organism</p>
          )}
        </div>
      ) : (
        <p className="no-data">Select an organism to view GO annotations</p>
      )}
    </div>
  );
}

export default GoDetails;
