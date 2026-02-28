import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './GoAnnotationSummaryPage.css';

function GoAnnotationSummaryPage() {
  const [genes, setGenes] = useState([]);
  const [loading, setLoading] = useState(false);

  // Check for gene list passed from other pages (e.g., phenotype search)
  useEffect(() => {
    const passedGenes = sessionStorage.getItem('phenotypeSearchGeneList');
    if (passedGenes) {
      try {
        const geneList = JSON.parse(passedGenes);
        if (Array.isArray(geneList) && geneList.length > 0) {
          setGenes(geneList);
        }
        // Clear after reading so it doesn't persist
        sessionStorage.removeItem('phenotypeSearchGeneList');
      } catch (e) {
        console.error('Failed to parse passed gene list:', e);
      }
    }
  }, []);

  return (
    <div className="go-annotation-summary-page">
      <div className="go-annotation-summary-content">
        <h1>GO Annotation Summary</h1>
        <hr />
        <p className="subtitle">
          View all GO terms used to describe genes in your list.
        </p>

        {genes.length > 0 ? (
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

            <div className="coming-soon">
              <p>
                GO Annotation Summary analysis for this gene list is being processed.
              </p>
              <p>
                In the meantime, you can view individual gene GO annotations by clicking on the gene links above,
                or use the <Link to="/go-term-finder">GO Term Finder</Link> to find enriched GO terms.
              </p>
            </div>
          </div>
        ) : (
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
