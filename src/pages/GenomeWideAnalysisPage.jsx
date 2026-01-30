import React from 'react';
import { Link } from 'react-router-dom';
import './InfoPages.css';

function GenomeWideAnalysisPage() {
  return (
    <div className="info-page">
      <div className="info-page-content">
        <h1>Genome-Wide Analysis Papers</h1>
        <hr />

        <div className="placeholder-notice">
          <h3>Page Under Development</h3>
          <p>
            This page will display a curated list of genome-wide analysis papers, including
            microarray studies, RNA-Seq experiments, ChIP-Seq analyses, and other high-throughput
            studies in <em>Candida</em> species.
          </p>
        </div>

        <section className="info-section">
          <h2>Planned Content</h2>
          <p>When complete, this page will include:</p>
          <ul>
            <li>
              <strong>Publication List</strong> - Curated references to genome-wide analysis papers
              with links to PubMed and full-text articles
            </li>
            <li>
              <strong>Study Types</strong> - Papers organized by analysis type (expression
              profiling, ChIP studies, comparative genomics, etc.)
            </li>
            <li>
              <strong>Species Coverage</strong> - Studies across all <em>Candida</em> species in CGD
            </li>
            <li>
              <strong>Data Links</strong> - Where available, links to supplementary datasets and
              downloadable data files
            </li>
          </ul>
        </section>

        <section className="info-section">
          <h2>Types of Genome-Wide Studies</h2>
          <ul>
            <li>
              <strong>Transcriptomics</strong> - Microarray and RNA-Seq studies analyzing gene
              expression under various conditions
            </li>
            <li>
              <strong>ChIP Studies</strong> - Chromatin immunoprecipitation studies identifying
              protein-DNA interactions
            </li>
            <li>
              <strong>Comparative Genomics</strong> - Studies comparing genomes across species or
              strains
            </li>
            <li>
              <strong>Proteomics</strong> - Large-scale protein identification and quantification
              studies
            </li>
            <li>
              <strong>Functional Genomics</strong> - Systematic gene deletion and phenotype screens
            </li>
          </ul>
        </section>

        <section className="info-section">
          <h2>Related Resources</h2>
          <ul>
            <li>
              <a
                href="http://textpresso.candidagenome.org/cgi-bin/textpresso/search"
                target="_blank"
                rel="noopener noreferrer"
              >
                Full-text Literature Search (Textpresso)
              </a>{' '}
              - Search the full text of <em>Candida</em> publications
            </li>
            <li>
              <a href="/Download_Datasets.shtml">Datasets Archived at CGD</a> - Download published
              datasets
            </li>
            <li>
              <a href="/help/Literature_Topics.shtml">Literature Guide</a> - Help documentation for
              literature resources
            </li>
            <li>
              <Link to="/help">Help Resources</Link> - General CGD help and documentation
            </li>
          </ul>
        </section>

        <div className="placeholder-notice" style={{ marginTop: '30px' }}>
          <p>
            <strong>Note:</strong> For the current live version of this page, please visit the{' '}
            <a href="/cache/genome-wide-analysis.html">backend Genome-Wide Analysis page</a>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default GenomeWideAnalysisPage;
