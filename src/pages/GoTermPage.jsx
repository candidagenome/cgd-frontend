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

// Map annotation types to display names (matching Perl)
const ANNOTATION_TYPE_NAMES = {
  manually_curated: 'Manually Curated GO Annotations',
  high_throughput: 'GO Annotations from High-Throughput Experiments',
  computational: 'Computational GO Annotations',
};

// Order for annotation types display
const ANNOTATION_TYPE_ORDER = ['manually_curated', 'high_throughput', 'computational'];

// Pagination settings
const GENES_PER_PAGE = 20;

function GoTermPage() {
  const { goid } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Track current page for each annotation type
  const [currentPages, setCurrentPages] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await goApi.getGoTerm(goid);
        setData(result);
        // Initialize pages for each annotation type
        const pages = {};
        if (result.annotations) {
          result.annotations.forEach(ann => {
            pages[ann.annotation_type] = 1;
          });
        }
        setCurrentPages(pages);
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

  // Handle page change for an annotation type
  const handlePageChange = (annotationType, newPage) => {
    setCurrentPages(prev => ({
      ...prev,
      [annotationType]: newPage,
    }));
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
        <p className="summary-text">
          In total, <span className="highlight-count">{data.total_genes}</span> genes
          have been directly annotated to the term <strong>{data.term.go_term}</strong>.
        </p>
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

  // Render pagination controls
  const renderPagination = (annotation, currentPage) => {
    const totalPages = Math.ceil(annotation.gene_count / GENES_PER_PAGE);
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 10;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // First page and ellipsis
    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => handlePageChange(annotation.annotation_type, 1)}
          className="page-btn"
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(<span key="ellipsis-start" className="ellipsis">...</span>);
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(annotation.annotation_type, i)}
          className={`page-btn ${i === currentPage ? 'active' : ''}`}
        >
          {i}
        </button>
      );
    }

    // Last page and ellipsis
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<span key="ellipsis-end" className="ellipsis">...</span>);
      }
      pages.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(annotation.annotation_type, totalPages)}
          className="page-btn"
        >
          {totalPages}
        </button>
      );
    }

    const startIdx = (currentPage - 1) * GENES_PER_PAGE + 1;
    const endIdx = Math.min(currentPage * GENES_PER_PAGE, annotation.gene_count);

    return (
      <div className="pagination">
        <div className="pagination-info">
          Showing {startIdx}-{endIdx} of {annotation.gene_count} genes
        </div>
        <div className="pagination-controls">
          <button
            onClick={() => handlePageChange(annotation.annotation_type, currentPage - 1)}
            disabled={currentPage === 1}
            className="page-btn nav-btn"
          >
            &laquo; Prev
          </button>
          {pages}
          <button
            onClick={() => handlePageChange(annotation.annotation_type, currentPage + 1)}
            disabled={currentPage === totalPages}
            className="page-btn nav-btn"
          >
            Next &raquo;
          </button>
        </div>
      </div>
    );
  };

  // Render a single gene table for an annotation type
  const renderGeneTable = (annotation) => {
    if (!annotation.genes || annotation.genes.length === 0) {
      return null;
    }

    const currentPage = currentPages[annotation.annotation_type] || 1;
    const startIdx = (currentPage - 1) * GENES_PER_PAGE;
    const endIdx = Math.min(startIdx + GENES_PER_PAGE, annotation.genes.length);
    const displayedGenes = annotation.genes.slice(startIdx, endIdx);

    return (
      <div key={annotation.annotation_type} className="gene-table-section" id={annotation.annotation_type}>
        <h3 className="table-header">
          {ANNOTATION_TYPE_NAMES[annotation.annotation_type] || annotation.annotation_type}
          <span className="gene-count-badge">({annotation.gene_count} genes)</span>
        </h3>

        {renderPagination(annotation, currentPage)}

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
              {displayedGenes.map((gene, geneIdx) => (
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
                        {ref.qualifiers && ref.qualifiers.length > 0 && (
                          <span className={`qualifier-badge ${ref.qualifiers.includes('NOT') ? 'not-qualifier' : ''}`}>
                            {ref.qualifiers.join(', ')}
                          </span>
                        )}
                        <span className="evidence-codes">
                          {ref.evidence_codes.join(', ')}
                        </span>
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

        {renderPagination(annotation, currentPage)}
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
          {renderAnnotationSummary()}

          <p className="annotation-note">
            The tables below show the genes that have been directly annotated to the term{' '}
            <strong>{data.term.go_term}</strong> or its variants containing one or more
            qualifiers (<em>NOT, contributes to, or colocalizes with</em>).
          </p>

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
