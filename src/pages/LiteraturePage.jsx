import React from 'react';
import { Link } from 'react-router-dom';
import './InfoPages.css';

function LiteraturePage() {
  return (
    <div className="info-page">
      <div className="info-page-content">
        <h1>Literature</h1>
        <hr />

        <section className="info-section">
          <div className="help-item">
            <h3>
              <a
                href="http://textpresso.candidagenome.org/cgi-bin/textpresso/search"
                target="_blank"
                rel="noopener noreferrer"
              >
                Full-text Search (Textpresso)
              </a>
            </h3>
            <p>
              Search full-text of published papers about <em>Candida</em>, with customizable
              keyword searching of the full-text of over 16,500 published journal articles about{' '}
              <em>Candida</em>, using{' '}
              <a
                href="http://www.plosbiology.org/article/info:doi/10.1371/journal.pbio.0020309"
                target="_blank"
                rel="noopener noreferrer"
              >
                Textpresso
              </a>
              , a tool developed by{' '}
              <a href="http://www.wormbase.org/" target="_blank" rel="noopener noreferrer">
                Wormbase
              </a>{' '}
              at CalTech.
            </p>
          </div>

          <div className="help-item">
            <h3>
              <Link to="/topic-biblios">Highlighted Topics</Link>
            </h3>
            <p>
              Curated reference lists covering a variety of topics relevant to{' '}
              <em>Candida</em> biology.
            </p>
          </div>

          <div className="help-item">
            <h3>
              <Link to="/strains">Laboratory Strains and Lineage</Link>
            </h3>
            <p>
              Reference to some of the more commonly used laboratory strains, with lineage
              diagrams and citations.
            </p>
          </div>

          <div className="help-item">
            <h3>
              <Link to="/genome-wide-analysis">Genome-Wide Analysis Papers</Link>
            </h3>
            <p>
              List of genome-wide analysis papers (e.g., microarray analysis publications)
              curated at CGD.
            </p>
          </div>

          <div className="help-item">
            <h3>
              <Link to="/help/literature-topics">Literature Guide</Link>
            </h3>
            <p>Help documentation for literature resources in CGD.</p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default LiteraturePage;
