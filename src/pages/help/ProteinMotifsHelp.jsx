import React from 'react';
import { Link } from 'react-router-dom';
import '../InfoPages.css';

function ProteinMotifsHelp() {
  return (
    <div className="info-page">
      <div className="info-page-content">
        <h1>CGD Help: Domains/Motifs Page</h1>
        <hr />

        <div className="info-section">
          <h2>Contents</h2>
          <ul>
            <li><a href="#descrip">Page Description and Navigation</a></li>
            <li>
              <a href="#organization">Page Organization</a>
              <ul>
                <li><a href="#browser">Proteome Browser</a></li>
                <li><a href="#shared">Shared Domains/Motifs</a></li>
                <li><a href="#unique">Unique Domains/Motifs</a></li>
                <li><a href="#trans">Transmembrane Domains</a></li>
                <li><a href="#signal">Signal Peptides</a></li>
                <li><a href="#external">External Links</a></li>
              </ul>
            </li>
            <li><a href="#related">Related CGD Help Documents</a></li>
          </ul>
        </div>

        <hr />

        <div className="info-section">
          <h2 id="descrip">Page Description and Navigation</h2>
          <p>
            The CGD Domains/Motifs Page displays information on conserved sequence features for a subject CGD
            protein, predicted using the{' '}
            <a href="http://www.ebi.ac.uk/InterProScan" target="_blank" rel="noopener noreferrer">
              InterProScan
            </a>{' '}
            program from the{' '}
            <a href="http://www.ebi.ac.uk/interpro/" target="_blank" rel="noopener noreferrer">
              InterPro database
            </a>
            . The page lists other proteins in the same organism that share domains in common with the
            subject protein, and conversely lists the domains that are unique to the subject. Additionally,
            links are provided to search external databases directly with the subject protein sequence.
          </p>
          <p>
            The top of the page provides a site-wide quick search, links to the major CGD informational
            resources, and a bar with links to popular tools, such as a local BLAST search. Beneath this is a
            series of tabs linking to other locus-specific information pages, including{' '}
            <Link to="/help/locus">Locus Summary</Link>,{' '}
            <Link to="/help/literature-topics">Literature</Link>,{' '}
            <a href="http://www.yeastgenome.org/help/GO.html" target="_blank" rel="noopener noreferrer">
              Gene Ontology
            </a>
            , and <Link to="/help/phenotype">Phenotype</Link>.
          </p>
        </div>

        <div className="info-section">
          <h2 id="organization">Page Organization</h2>

          <h3 id="browser">Proteome Browser</h3>
          <p>
            The CGD Proteome Browser interactively displays conserved domains identified using the protein
            sequence to query the{' '}
            <a href="http://www.ebi.ac.uk/interpro/" target="_blank" rel="noopener noreferrer">
              InterPro
            </a>{' '}
            database. The Domains/Motifs page displays a thumbnail image of the browser; clicking on that
            brings up the browser itself.
          </p>

          <h3 id="shared">Shared Domains/Motifs</h3>
          <p>
            Table providing information about other proteins (in the same organism) that also contain
            features identified in the query protein sequence. The table has three columns:
          </p>
          <ol>
            <li>
              <strong>Protein.</strong> The name of the protein sharing features with the query, with a link
              to its <Link to="/help/locus">Locus Summary</Link> page.
            </li>
            <li>
              <strong>Features in common with query protein.</strong> List of{' '}
              <a href="http://www.ebi.ac.uk/interpro/" target="_blank" rel="noopener noreferrer">
                InterPro
              </a>{' '}
              domains or motifs identified in both query protein and this protein. Includes the source
              database, the feature accession number (linked to a description of the feature), and a brief
              description of the feature.
            </li>
            <li>
              <strong>Other features in this protein (but not in query protein).</strong> List of{' '}
              <a href="http://www.ebi.ac.uk/interpro/" target="_blank" rel="noopener noreferrer">
                InterPro
              </a>{' '}
              domains or motifs identified in this protein but absent in query. Includes the source database,
              the feature accession number (linked to a description of the feature), and a brief description
              of the feature.
            </li>
          </ol>

          <h3 id="unique">Unique Domains/Motifs</h3>
          <p>
            Table listing features found in the query protein, but which are found in no other other proteins
            in the organism. The table has three columns:
          </p>
          <ol>
            <li>
              <strong>Database source.</strong>{' '}
              <a href="http://www.ebi.ac.uk/interpro/" target="_blank" rel="noopener noreferrer">
                InterPro
              </a>{' '}
              member database where the feature was defined.
            </li>
            <li>
              <strong>Accession number.</strong> Feature identifier, linked to a description of the feature
              at the source database.
            </li>
            <li>
              <strong>Description</strong> Brief description of the name and function of the feature, if
              known.
            </li>
          </ol>

          <h3 id="trans">Transmembrane Domains</h3>
          <p>
            Table showing transmembrane domains (if any) identified in the query protein using the{' '}
            <a
              href="http://www.cbs.dtu.dk/services/TMHMM/TMHMM2.0b.guide.php"
              target="_blank"
              rel="noopener noreferrer"
            >
              TMHMM
            </a>{' '}
            program. The table has two columns:
          </p>
          <ol>
            <li>
              <strong>Predicted Transmembrane Domain(s).</strong> A Proteome Browser thumbnail image showing
              the relative position in the protein of transmembrane domains. Clicking on the image opens a
              browser session.
            </li>
            <li>
              <strong>Amino Acid Coordinates.</strong> A table listing the start and end positions of each
              transmembrane domain.
            </li>
          </ol>

          <h3 id="signal">Signal Peptides</h3>
          <p>
            Table showing signal peptides (if any) identified in the query protein using the{' '}
            <a
              href="http://www.cbs.dtu.dk/services/SignalP/background/"
              target="_blank"
              rel="noopener noreferrer"
            >
              SignalP
            </a>{' '}
            program. The table has two columns:
          </p>
          <ol>
            <li>
              <strong>Predicted Signal Peptide(s).</strong> A Proteome Browser thumbnail image showing the
              relative position in the protein of signal peptides. Clicking on the image opens a browser
              session.
            </li>
            <li>
              <strong>Amino Acid Coordinates.</strong> A table listing the start and end positions of each
              signal peptide.
            </li>
          </ol>

          <h3 id="external">External Links</h3>
          <p>
            For your convenience, we also provide several links for searching external resources with the
            query sequence. Depending on your specific problem or interest, one or the other of these may
            produce the best results for you. For specific help with any of these other resources, you will
            be best served at the original source. Currently we support searches of the following resources:
          </p>
          <ul>
            <li>
              <a
                href="http://www.ncbi.nlm.nih.gov/Structure/lexington/lexington.cgi"
                target="_blank"
                rel="noopener noreferrer"
              >
                NCBI CDART
              </a>
            </li>
            <li>
              <a href="http://smart.embl-heidelberg.de/" target="_blank" rel="noopener noreferrer">
                SMART
              </a>
            </li>
            <li>
              <a href="http://us.expasy.org/prosite/" target="_blank" rel="noopener noreferrer">
                PROSITE
              </a>
            </li>
          </ul>
        </div>

        <div className="info-section">
          <h2 id="related">Related CGD Help Documents</h2>
          <ul>
            <li>
              <Link to="/help/locus">Locus Summary Help Page</Link>
            </li>
            <li>
              <Link to="/help/protein-page">Protein Information Help Page</Link>
            </li>
            <li>
              <Link to="/help/protein-properties">Physicochemical Properties Help Page</Link>
            </li>
            <li>
              <Link to="/help/pdb-homolog">PDB Homologs Help Page</Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ProteinMotifsHelp;
