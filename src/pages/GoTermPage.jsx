import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import goApi from '../api/goApi';
import { renderCitationItem } from '../utils/formatCitation.jsx';
import { GODiagram } from '../components/go';
import './GoTermPage.css';

// Map GO aspect codes to full names
const ASPECT_NAMES = {
  C: 'Cellular Component',
  F: 'Molecular Function',
  P: 'Biological Process',
};

// Map annotation types to display names (matching Perl)
const ANNOTATION_TYPE_NAMES = {
  manually_curated: 'Manually Curated GO Annotations',
  high_throughput: 'GO Annotations from High-Throughput Experiments',
  computational: 'Computational GO Annotations',
};

// Order for annotation types display
const ANNOTATION_TYPE_ORDER = ['manually_curated', 'high_throughput', 'computational'];

// Abbreviate organism name (e.g., "Candida albicans SC5314" -> "C. albicans")
const getOrganismAbbrev = (organismName) => {
  if (!organismName) return '';
  const parts = organismName.split(' ');
  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}. ${parts[1]}`;
  }
  return organismName;
};

// Format locus display name like Perl: "AAF1/C3_06470W_A"
const formatLocusName = (gene) => {
  if (gene.locus_name && gene.locus_name !== gene.systematic_name) {
    return `${gene.locus_name}/${gene.systematic_name}`;
  }
  return gene.systematic_name;
};

function GoTermPage() {
  const { goid } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await goApi.getGoTerm(goid);
        setData(result);
      } catch (err) {
        setError(err.response?.data?.detail || err.message || 'Failed to load GO term');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [goid]);

  // AG Grid column definitions for gene table
  // Locus=22%, Species=13%, Reference(s)=57%, Evidence=8%
  const geneColumnDefs = useMemo(() => [
    {
      headerName: 'Locus',
      field: 'locus_name',
      flex: 2.2,
      minWidth: 140,
      valueGetter: (params) => formatLocusName(params.data),
      cellRenderer: (params) => (
        <Link to={`/locus/${params.data.systematic_name}`} className="gene-link">
          {formatLocusName(params.data)}
        </Link>
      ),
    },
    {
      headerName: 'Species',
      field: 'species',
      flex: 1.3,
      minWidth: 90,
      valueGetter: (params) => getOrganismAbbrev(params.data.species),
      cellRenderer: (params) => (
        <em>{getOrganismAbbrev(params.data.species)}</em>
      ),
    },
    {
      headerName: 'Reference(s)',
      field: 'references',
      flex: 5.7,
      minWidth: 280,
      autoHeight: true,
      valueGetter: (params) => {
        const refs = params.data.references || [];
        return refs.map(ref => ref.display_name || ref.pubmed_id || '').join('; ');
      },
      cellRenderer: (params) => (
        <div className="references-cell">
          {params.data.references?.map((ref, refIdx) => (
            <React.Fragment key={refIdx}>
              {renderCitationItem(ref, { itemClassName: 'reference-item' })}
            </React.Fragment>
          ))}
        </div>
      ),
    },
    {
      headerName: 'Evidence',
      field: 'evidence',
      flex: 0.8,
      minWidth: 60,
      autoHeight: true,
      valueGetter: (params) => {
        const refs = params.data.references || [];
        return refs.flatMap(ref => ref.evidence_codes || []).join(', ');
      },
      cellRenderer: (params) => (
        <div className="evidence-cell">
          {params.data.references?.map((ref, refIdx) => (
            <div key={refIdx} className="evidence-item">
              {ref.evidence_codes?.map((code, codeIdx) => (
                <span key={codeIdx}>
                  {codeIdx > 0 && ', '}
                  <Link to={`/go/evidence#${code}`}>{code}</Link>
                </span>
              ))}
            </div>
          ))}
        </div>
      ),
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

  // Build AmiGO URL
  const getAmigoUrl = (goid) => {
    return `http://amigo.geneontology.org/amigo/term/${goid}`;
  };

  // Format GOID for display (ensure GO:XXXXXXX format)
  const formatGoid = (goid) => {
    if (!goid) return '';
    if (goid.startsWith('GO:')) return goid;
    return `GO:${goid.padStart(7, '0')}`;
  };

  // Render page navigation
  const renderPageNav = () => {
    if (!data) return null;

    const links = [
      { id: 'definition', label: 'Definition' },
      { id: 'graphical-display', label: 'Graphical Display' },
      { id: 'summary', label: 'Number of Genes Annotated' },
      { id: 'additional-links', label: 'Links to Additional Annotations' },
      { id: 'annotations', label: 'Genes Annotated with this Term' },
    ];

    return (
      <nav className="page-nav">
        {links.map((link, idx) => (
          <span key={link.id}>
            {idx > 0 && ' | '}
            <a href={`#${link.id}`}>{link.label}</a>
          </span>
        ))}
      </nav>
    );
  };

  // Render definition section
  const renderDefinition = () => {
    const term = data.term;
    return (
      <div className="section" id="definition">
        <h2 className="section-header">Definition</h2>
        <div className="section-content">
          <table className="info-table">
            <tbody>
              <tr>
                <th>GO Term</th>
                <td>{term.go_term}</td>
              </tr>
              <tr>
                <th>GOID</th>
                <td>
                  <a
                    href={getAmigoUrl(term.goid)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {term.goid}
                  </a>
                </td>
              </tr>
              <tr>
                <th>Ontology</th>
                <td>{term.aspect_name}</td>
              </tr>
              {term.go_definition && (
                <tr>
                  <th>Definition</th>
                  <td className="definition-text">{term.go_definition}</td>
                </tr>
              )}
              {term.synonyms && term.synonyms.length > 0 && (
                <tr>
                  <th>Synonyms</th>
                  <td>
                    <ul className="synonyms-list">
                      {term.synonyms.map((syn, idx) => (
                        <li key={idx}>{syn}</li>
                      ))}
                    </ul>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Render the "Graphical Display" section with GO hierarchy diagram
  const renderGraphicalDisplay = () => {
    return (
      <div className="section" id="graphical-display">
        <h2 className="section-header">Graphical Display</h2>
        <div className="section-content">
          <p className="diagram-description">
            This diagram shows the local area of the Gene Ontology hierarchy centered on
            the term <strong>{data.term.go_term}</strong>. Parent terms (ancestors) are shown
            above the current term. Click any node to navigate to that term.
          </p>
          <GODiagram goid={goid} />
        </div>
      </div>
    );
  };

  // Render the "Number of Genes Annotated" section (matching Perl format)
  const renderAnnotationSummarySection = () => {
    if (!data.annotations || data.annotations.length === 0) {
      return null;
    }

    return (
      <div className="section" id="summary">
        <h2 className="section-header">Number of Genes Annotated</h2>
        <div className="section-content">
          <table className="summary-detail-table">
            <thead>
              <tr>
                <th>GO Term</th>
                {ANNOTATION_TYPE_ORDER.map(type => {
                  const annotation = data.annotations.find(a => a.annotation_type === type);
                  if (!annotation) return null;
                  return (
                    <th key={type}>
                      <a href={`#${type}`}>{ANNOTATION_TYPE_NAMES[type]}</a>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {/* Collect all unique qualifier display names across all annotation types */}
              {(() => {
                // Get all unique display names (qualifier groups)
                const allDisplayNames = new Set();
                data.annotations.forEach(ann => {
                  if (ann.qualifier_groups) {
                    ann.qualifier_groups.forEach(group => {
                      allDisplayNames.add(group.display_name);
                    });
                  }
                });

                return Array.from(allDisplayNames).map(displayName => (
                  <tr key={displayName}>
                    <td>
                      <a href={`#qualifier-${displayName.replace(/\s+/g, '-')}`}>
                        {displayName}
                      </a>
                    </td>
                    {ANNOTATION_TYPE_ORDER.map(type => {
                      const annotation = data.annotations.find(a => a.annotation_type === type);
                      if (!annotation) return null;

                      const group = annotation.qualifier_groups?.find(g => g.display_name === displayName);
                      if (!group || group.species_counts.length === 0) {
                        return <td key={type} className="species-count-cell">none</td>;
                      }

                      return (
                        <td key={type} className="species-count-cell">
                          {group.species_counts.map((sc, idx) => (
                            <div key={idx}>
                              {sc.count} in <em>{sc.species}</em>
                            </div>
                          ))}
                        </td>
                      );
                    })}
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Render "Links to Additional Annotations" section
  const renderAdditionalLinksSection = () => {
    const term = data.term;
    return (
      <div className="section" id="additional-links">
        <h2 className="section-header">Links to Additional Annotations</h2>
        <div className="section-content">
          <ul className="external-links-list">
            <li>
              <a
                href={getAmigoUrl(term.goid)}
                target="_blank"
                rel="noopener noreferrer"
              >
                View annotations in multiple organisms using AmiGO
              </a>
            </li>
            <li>
              Search for Candida genes manually annotated to this term or to any
              manually annotated terms that are descended from this term, i.e.,
              child terms representing more specific biology than this term.
            </li>
          </ul>
        </div>
      </div>
    );
  };

  // Render a gene table for a qualifier group using AG Grid
  const renderQualifierGroupTable = (annotationType, group) => {
    if (!group.genes || group.genes.length === 0) {
      return null;
    }

    const totalGenes = group.genes.length;

    return (
      <div
        key={group.display_name}
        className="qualifier-group-section"
        id={`qualifier-${group.display_name.replace(/\s+/g, '-')}`}
      >
        <h4 className="qualifier-header">
          {group.display_name}
        </h4>
        <p className="qualifier-summary">
          {totalGenes} gene{totalGenes !== 1 ? 's have' : ' has'} been directly annotated to this term
          in the {ANNOTATION_TYPE_NAMES[annotationType]?.replace(' GO Annotations', '') || annotationType} set
        </p>

        <div className="gene-grid-wrapper ag-theme-alpine">
          <AgGridReact
            rowData={group.genes}
            columnDefs={geneColumnDefs}
            defaultColDef={defaultColDef}
            domLayout="autoHeight"
            pagination={true}
            paginationPageSize={10}
            paginationPageSizeSelector={[10, 25, 50]}
            onGridReady={onGridReady}
            suppressCellFocus={true}
          />
        </div>
      </div>
    );
  };

  // Render gene tables for an annotation type
  const renderAnnotationTypeSection = (annotation) => {
    if (!annotation.qualifier_groups || annotation.qualifier_groups.length === 0) {
      return (
        <div key={annotation.annotation_type} className="annotation-type-section" id={annotation.annotation_type}>
          <h3 className="table-header">
            {ANNOTATION_TYPE_NAMES[annotation.annotation_type] || annotation.annotation_type}
          </h3>
          <p className="no-data">No annotations of this type.</p>
        </div>
      );
    }

    // Build qualifier group links for navigation within section
    const qualifierLinks = annotation.qualifier_groups.map(group => ({
      id: `qualifier-${group.display_name.replace(/\s+/g, '-')}`,
      label: group.display_name,
    }));

    return (
      <div key={annotation.annotation_type} className="annotation-type-section" id={annotation.annotation_type}>
        <h3 className="table-header">
          {ANNOTATION_TYPE_NAMES[annotation.annotation_type] || annotation.annotation_type}
          <span className="gene-count-badge">({annotation.gene_count} genes)</span>
        </h3>

        {/* Qualifier group navigation links */}
        {qualifierLinks.length > 1 && (
          <nav className="qualifier-nav">
            {qualifierLinks.map((link, idx) => (
              <span key={link.id}>
                {idx > 0 && ' | '}
                <a href={`#${link.id}`}>{link.label}</a>
              </span>
            ))}
          </nav>
        )}

        {/* Render each qualifier group */}
        {annotation.qualifier_groups.map(group =>
          renderQualifierGroupTable(annotation.annotation_type, group)
        )}
      </div>
    );
  };

  // Render annotations section
  const renderAnnotations = () => {
    if (!data.annotations || data.annotations.length === 0) {
      return (
        <div className="section" id="annotations">
          <h2 className="section-header">Genes Annotated with this Term</h2>
          <div className="section-content">
            <p className="no-data">No genes are annotated to this GO term.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="section" id="annotations">
        <h2 className="section-header">Genes Annotated with this Term</h2>
        <div className="section-content">
          <p className="annotation-note">
            The tables below show the genes that have been directly annotated to the term{' '}
            <strong>{data.term.go_term}</strong> or its variants containing one or more
            qualifiers (<em>NOT, contributes to, or colocalizes with</em>) in the manually
            curated set and any annotations made from high-throughput experiments or
            computational analysis.
          </p>

          {ANNOTATION_TYPE_ORDER.map((type) => {
            const annotation = data.annotations.find(a => a.annotation_type === type);
            if (!annotation) return null;
            return renderAnnotationTypeSection(annotation);
          })}
        </div>
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="go-term-page">
        <div className="loading-page">
          <div className="loading-spinner"></div>
          <p>Loading GO term information for <strong>{formatGoid(goid)}</strong>...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="go-term-page">
        <div className="error-page">
          <div className="error-icon">&#9888;</div>
          <h1>GO Term Not Found</h1>
          <p className="error-message">
            The GO term <strong>"{formatGoid(goid)}"</strong> was not found in the database.
          </p>
          <div className="error-suggestions">
            <h3>Suggestions:</h3>
            <ul>
              <li>Check the GO identifier format (e.g., GO:0005634)</li>
              <li>Try searching for the GO term at{' '}
                <a href="http://amigo.geneontology.org/" target="_blank" rel="noopener noreferrer">
                  AmiGO
                </a>
              </li>
              <li>Use the <Link to="/go-resources">GO Resources</Link> page to explore GO tools</li>
            </ul>
          </div>
          <div className="error-actions">
            <Link to="/" className="btn-home">Return to Home</Link>
            <Link to="/go-resources" className="btn-go">GO Resources</Link>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!data || !data.term) {
    return (
      <div className="go-term-page">
        <div className="no-data-page">
          <p>No data available for this GO term.</p>
          <Link to="/">Return to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="go-term-page">
      <header className="go-term-header">
        <h1>{data.term.go_term}</h1>
        <p className="subtitle">
          <a
            href={getAmigoUrl(data.term.goid)}
            target="_blank"
            rel="noopener noreferrer"
          >
            {data.term.goid}
          </a>
          {' - '}
          <span className="aspect">{data.term.aspect_name}</span>
        </p>
      </header>

      {renderPageNav()}

      <div className="divider" />

      {renderDefinition()}

      {renderGraphicalDisplay()}

      {renderAnnotationSummarySection()}

      {renderAdditionalLinksSection()}

      {renderAnnotations()}

      <div className="divider" />

      {renderPageNav()}
    </div>
  );
}

export default GoTermPage;
