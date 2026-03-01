import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import goAnnotationSummaryApi from '../api/goAnnotationSummaryApi';
import './GoAnnotationSummaryPage.css';

function GoAnnotationSummaryPage() {
  const [genes, setGenes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  // Check for gene list passed from other pages (e.g., phenotype search)
  useEffect(() => {
    const passedGenes = localStorage.getItem('phenotypeSearchGeneList');
    if (passedGenes) {
      try {
        const geneList = JSON.parse(passedGenes);
        if (Array.isArray(geneList) && geneList.length > 0) {
          setGenes(geneList);
          // Auto-run analysis
          runAnalysis(geneList);
        }
        // Clear after reading so it doesn't persist
        localStorage.removeItem('phenotypeSearchGeneList');
      } catch (e) {
        console.error('Failed to parse passed gene list:', e);
      }
    }
  }, []);

  const runAnalysis = async (geneList) => {
    setLoading(true);
    setError(null);

    try {
      const response = await goAnnotationSummaryApi.runAnalysis({
        genes: geneList,
      });

      if (!response.success) {
        throw new Error(response.error || 'Analysis failed');
      }

      setResult(response.result);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.response?.data?.detail || err.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (format) => {
    try {
      const blob = await goAnnotationSummaryApi.downloadResults({ genes }, format);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `go_annotation_summary.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      setError('Failed to download results');
    }
  };

  const renderOntologyTable = (title, terms, aspectCode) => {
    if (!terms || terms.length === 0) {
      return null;
    }

    return (
      <div className="ontology-section">
        <h2>GO {title} Annotation Report</h2>
        <table className="annotation-table">
          <thead>
            <tr>
              <th>Ontology term</th>
              <th>Cluster frequency</th>
              <th>Genome frequency</th>
              <th>Genes annotated to the term</th>
            </tr>
          </thead>
          <tbody>
            {terms.map((term, idx) => (
              <tr key={term.go_no} className={idx % 2 === 0 ? 'even' : 'odd'}>
                <td>
                  <Link to={`/go/${term.goid}`}>{term.go_term}</Link>
                </td>
                <td>
                  {term.cluster_count} out of {term.cluster_total} genes, {term.cluster_frequency.toFixed(2)}%
                </td>
                <td>
                  {term.genome_count} out of {term.genome_total} annotated genes, {term.genome_frequency.toFixed(2)}%
                </td>
                <td className="gene-list-cell">
                  {term.genes.map((gene, gIdx) => (
                    <span key={gene.feature_no}>
                      {gIdx > 0 && ', '}
                      <Link to={`/locus/${gene.systematic_name}`}>
                        {gene.gene_name || gene.systematic_name}
                      </Link>
                      {gene.organism && (
                        <span className="organism-name"> (<em>{gene.organism}</em>)</span>
                      )}
                    </span>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="go-annotation-summary-page">
      <div className="go-annotation-summary-content">
        <h1>GO Annotation Summary</h1>
        <hr />
        <p className="subtitle">
          View all GO terms used to describe genes in your list, with cluster and genome frequencies.
        </p>

        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
          </div>
        )}

        {loading && (
          <div className="loading-section">
            <div className="loading-spinner"></div>
            <p>Analyzing {genes.length} genes...</p>
          </div>
        )}

        {!loading && genes.length > 0 && !result && !error && (
          <div className="genes-received">
            <h3>Genes Received ({genes.length})</h3>
            <div className="gene-list-preview">
              {genes.slice(0, 20).map((gene, idx) => (
                <span key={idx} className="gene-tag">
                  <Link to={`/locus/${gene}`}>{gene}</Link>
                </span>
              ))}
              {genes.length > 20 && (
                <span className="more-genes">... and {genes.length - 20} more</span>
              )}
            </div>
            <button
              className="analyze-btn"
              onClick={() => runAnalysis(genes)}
            >
              Generate Summary
            </button>
          </div>
        )}

        {!loading && result && (
          <div className="results-section">
            <div className="results-summary">
              <p>
                <strong>Genes submitted:</strong> {result.query_genes_submitted} |{' '}
                <strong>Genes found:</strong> {result.query_genes_found} |{' '}
                <strong>Genome total:</strong> {result.genome_annotated_genes} annotated genes
              </p>
              {result.query_genes_not_found.length > 0 && (
                <p className="not-found-warning">
                  <strong>Not found ({result.query_genes_not_found.length}):</strong>{' '}
                  {result.query_genes_not_found.slice(0, 10).join(', ')}
                  {result.query_genes_not_found.length > 10 && '...'}
                </p>
              )}
              <div className="download-buttons">
                <button onClick={() => handleDownload('tsv')}>Download TSV</button>
                <button onClick={() => handleDownload('csv')}>Download CSV</button>
              </div>
            </div>

            {renderOntologyTable('Process', result.process_terms, 'P')}
            {renderOntologyTable('Function', result.function_terms, 'F')}
            {renderOntologyTable('Component', result.component_terms, 'C')}

            {result.process_terms.length === 0 &&
             result.function_terms.length === 0 &&
             result.component_terms.length === 0 && (
              <div className="no-results">
                <p>No GO annotations found for the provided genes.</p>
              </div>
            )}
          </div>
        )}

        {!loading && genes.length === 0 && (
          <div className="no-genes">
            <p>No genes were provided.</p>
            <p>
              To view a GO annotation summary, navigate from a search results page
              (such as <Link to="/phenotype/search">Phenotype Search</Link>) and click
              "View GO Annotation Summary" in the Analyze Gene List section.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default GoAnnotationSummaryPage;
