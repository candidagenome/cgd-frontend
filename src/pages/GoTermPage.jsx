import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import goApi from '../api/goApi';
import './GoTermPage.css';

// Map GO aspect codes to full names
const ASPECT_NAMES = {
  C: 'Cellular Component',
  F: 'Molecular Function',
  P: 'Biological Process',
};

// Map annotation types to display names
const ANNOTATION_TYPE_NAMES = {
  manually_curated: 'Manually Curated',
  high_throughput: 'High-Throughput',
  computational: 'Computational',
};

// Order for annotation types display
const ANNOTATION_TYPE_ORDER = ['manually_curated', 'high_throughput', 'computational'];

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
      { id: 'annotations', label: 'Annotated Genes' },
      { id: 'external-links', label: 'External Links' },
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

  // Render annotation summary
  const renderAnnotationSummary = () => {
    if (!data.annotations || data.annotations.length === 0) {
      return null;
    }

    return (
      <div className="annotation-summary">
        <h3>Annotation Summary</h3>
        <table className="summary-table">
          <thead>
            <tr>
              <th>Annotation Type</th>
              <th>Gene Count</th>
            </tr>
          </thead>
          <tbody>
            {ANNOTATION_TYPE_ORDER.map((type) => {
              const annotation = data.annotations.find(a => a.annotation_type === type);
              if (!annotation || annotation.gene_count === 0) return null;
              return (
                <tr key={type}>
                  <td>
                    <a href={`#${type}`}>
                      {ANNOTATION_TYPE_NAMES[type] || type}
                    </a>
                  </td>
                  <td className="count-cell">{annotation.gene_count}</td>
                </tr>
              );
            })}
            <tr className="total-row">
              <td><strong>Total</strong></td>
              <td className="count-cell"><strong>{data.total_genes}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  // Render a single gene table for an annotation type
  const renderGeneTable = (annotation) => {
    if (!annotation.genes || annotation.genes.length === 0) {
      return null;
    }

    return (
      <div key={annotation.annotation_type} className="gene-table-section" id={annotation.annotation_type}>
        <h3 className="table-header">
          {ANNOTATION_TYPE_NAMES[annotation.annotation_type] || annotation.annotation_type} Annotations
          <span className="gene-count-badge">({annotation.gene_count} genes)</span>
        </h3>
        <div className="table-wrapper">
          <table className="gene-table">
            <thead>
              <tr>
                <th>Locus</th>
                <th>Systematic Name</th>
                <th>Species</th>
                <th>Evidence / References</th>
              </tr>
            </thead>
            <tbody>
              {annotation.genes.map((gene, geneIdx) => (
                <tr key={geneIdx} className={geneIdx % 2 === 1 ? 'alt-row' : ''}>
                  <td>
                    <Link to={`/locus/${gene.systematic_name}`} className="gene-link">
                      {gene.locus_name || gene.systematic_name}
                    </Link>
                  </td>
                  <td>{gene.systematic_name}</td>
                  <td className="species-cell">
                    <em>{gene.species}</em>
                  </td>
                  <td className="references-cell">
                    {gene.references && gene.references.map((ref, refIdx) => (
                      <div key={refIdx} className="reference-item">
                        <span className="evidence-codes">
                          {ref.evidence_codes.join(', ')}
                        </span>
                        {ref.qualifiers && ref.qualifiers.length > 0 && (
                          <span className="qualifiers">
                            {' '}[{ref.qualifiers.join(', ')}]
                          </span>
                        )}
                        {ref.pmid ? (
                          <a
                            href={`https://pubmed.ncbi.nlm.nih.gov/${ref.pmid}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="pmid-link"
                            title={ref.citation}
                          >
                            PMID:{ref.pmid}
                          </a>
                        ) : ref.citation ? (
                          <span className="citation-text" title={ref.citation}>
                            {ref.citation.length > 50 ? ref.citation.substring(0, 50) + '...' : ref.citation}
                          </span>
                        ) : null}
                      </div>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Render annotations section
  const renderAnnotations = () => {
    if (!data.annotations || data.annotations.length === 0) {
      return (
        <div className="section" id="annotations">
          <h2 className="section-header">Annotated Genes</h2>
          <div className="section-content">
            <p className="no-data">No genes are annotated to this GO term.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="section" id="annotations">
        <h2 className="section-header">Annotated Genes</h2>
        <div className="section-content">
          {renderAnnotationSummary()}

          {ANNOTATION_TYPE_ORDER.map((type) => {
            const annotation = data.annotations.find(a => a.annotation_type === type);
            if (!annotation || annotation.gene_count === 0) return null;
            return renderGeneTable(annotation);
          })}
        </div>
      </div>
    );
  };

  // Render external links section
  const renderExternalLinks = () => {
    const term = data.term;
    return (
      <div className="section" id="external-links">
        <h2 className="section-header">External Links</h2>
        <div className="section-content">
          <ul className="external-links-list">
            <li>
              <a
                href={getAmigoUrl(term.goid)}
                target="_blank"
                rel="noopener noreferrer"
              >
                View {term.goid} at AmiGO
              </a>
            </li>
            <li>
              <a
                href={`http://www.ebi.ac.uk/QuickGO/term/${term.goid}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View {term.goid} at QuickGO
              </a>
            </li>
          </ul>
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

      {renderAnnotations()}

      {renderExternalLinks()}

      <div className="divider" />

      {renderPageNav()}
    </div>
  );
}

export default GoTermPage;
