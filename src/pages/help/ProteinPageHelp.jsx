import React from 'react';
import { Link } from 'react-router-dom';
import '../InfoPages.css';

function ProteinPageHelp() {
  return (
    <div className="info-page">
      <div className="info-page-content">
        <h1>CGD Help: Protein Information Page</h1>
        <hr />

        <div className="info-section">
          <h2>Contents</h2>
          <ul>
            <li><a href="#descrip">Page Description and Navigation</a></li>
            <li>
              <a href="#organization">Organization of Protein Information</a>
              <ul>
                <li><a href="#nomenclature">Nomenclature and Function</a></li>
                <li><a href="#structure">Structural Information</a></li>
                <li><a href="#domains">Conserved Domains</a></li>
                <li><a href="#sequence">Sequence Detail</a></li>
                <li><a href="#homologs">Homologs</a></li>
                <li><a href="#external">External Sequence Databases</a></li>
                <li><a href="#references">References</a></li>
              </ul>
            </li>
            <li><a href="#related">Related CGD Help Documents</a></li>
          </ul>
        </div>

        <hr />

        <div className="info-section">
          <h2 id="descrip">Page Description and Navigation</h2>
          <p>
            The CGD Protein Information Page provides basic property, structure, and homology information for
            all verified or predicted CGD proteins. The primary information is listed in the major column on
            the left of the page, and includes links to interactive displays and other data resources.
          </p>
          <p>
            The top of the protein page provides a site-wide quick search, links to the major CGD
            informational resources, and a bar with links to popular tools, such as a local BLAST search.
            Beneath this is a series of tabs linking to other locus-specific information pages, including{' '}
            <Link to="/help/locus">Locus Summary</Link>,{' '}
            <Link to="/help/literature-topics">Literature</Link>,{' '}
            <a href="http://www.yeastgenome.org/help/GO.html" target="_blank" rel="noopener noreferrer">
              Gene Ontology
            </a>
            , and <Link to="/help/phenotype">Phenotype</Link>.
          </p>
        </div>

        <div className="info-section">
          <h2 id="organization">Organization of Protein Information</h2>
          <p>
            Individual sections can be expanded or collapsed (hidden) by clicking on the small +/- icons next
            to the section headings.
          </p>

          <h3 id="nomenclature">Nomenclature and Function</h3>
          <ul>
            <li>
              <strong>Standard Name and Systematic Name:</strong> The protein names are based upon the
              corresponding gene names found on the <Link to="/help/locus">Locus Summary</Link> page (gene
              naming conventions are outlined in the{' '}
              <Link to="/nomenclature">Gene Nomenclature Guide</Link>). Standard protein names are
              non-italicized, and are derived from gene names by making the first character uppercase, the
              remaining alphabetical characters lowercase, and appending the lowercase letter "p". For
              example, the protein encoded by the <em>C. albicans</em> gene <em>ABC1</em> (systematic name
              orf19.3331, allele name orf19.10842) has standard name Abc1p, systematic name Orf19.3331p, and
              allele name Orf19.10842p. See the CGD{' '}
              <Link to="/help/sequence#classification">Sequence Documentation Page</Link> for more details.
            </li>
            <li>
              <strong>Description:</strong> A concise summary of the biological role and molecular function
              of the protein.
            </li>
          </ul>

          <h3 id="structure">Structural Information</h3>
          <p>Provides:</p>
          <ul>
            <li>
              A link to a page listing the structurally related proteins identified by a BLASTP search of the{' '}
              <a href="http://www.rcsb.org/pdb/home/home.do" target="_blank" rel="noopener noreferrer">
                RCSB Protein Databank (PDB)
              </a>
              ; please see the <Link to="/help/pdb-homolog">PDB Homolog documentation</Link> page for more
              details about this page.
            </li>
            <li>
              A link directly to the{' '}
              <a href="http://www.rcsb.org/pdb/home/home.do" target="_blank" rel="noopener noreferrer">
                RCSB Protein Databank (PDB)
              </a>
              .
            </li>
            <li>
              Summary information for the top PDB hit, including a thumbnail diagram and link to the protein
              alignment.
            </li>
          </ul>

          <h3 id="domains">Conserved Domains</h3>
          <p>Provides:</p>
          <ul>
            <li>
              A link to the <Link to="/help/protein-motifs">Domains/Motifs</Link> page, which lists conserved
              features in the protein.
            </li>
            <li>
              A thumbnail image and link to the CGD Proteome Browser, which interactively displays conserved
              domains identified using the protein sequence to query the{' '}
              <a href="http://www.ebi.ac.uk/interpro/" target="_blank" rel="noopener noreferrer">
                InterPro
              </a>{' '}
              database.
            </li>
          </ul>

          <h3 id="sequence">Sequence Detail</h3>
          <p>Summary of the predicted ORF translation, including:</p>
          <ul>
            <li>
              <strong>Length (a.a.):</strong> the predicted full length of the translated gene product.
            </li>
            <li>
              <strong>Molecular Weight (Da):</strong> calculated for the predicted full-length sequence.
            </li>
            <li>
              A link to the <Link to="/help/protein-properties">Physicochemical Properties</Link> page, which
              displays other properties and statistics calculated for the sequence.
            </li>
            <li>
              <strong>Predicted Sequence:</strong> the amino acid sequence itself, with a button to download
              the sequence in FASTA format.
            </li>
          </ul>

          <h3 id="homologs">Homologs</h3>
          <p>Provides links to CGD resources that can be used to identify homologs of the query protein:</p>
          <ul>
            <li>
              <Link to="/help/blast">BLAST</Link> against other <em>Candida</em> sequences: Runs BLAST
              locally using protein sequence as query to identify <em>Candida</em> homologs.
            </li>
          </ul>

          <h3 id="external">External Sequence Databases</h3>
          <p>Provides links to various other databases containing the protein sequence.</p>

          <h3 id="references">References</h3>
          <p>
            This section lists the references used to curate information displayed in the Standard Name,
            Systematic Name, and Description fields on the page. Note that this section is not a
            comprehensive listing of publications relevant to this gene. To retrieve a list of all
            publications annotated to this gene, select the "Literature" tab at the top of the page.
          </p>
        </div>

        <div className="info-section">
          <h2 id="related">Related CGD Help Documents</h2>
          <ul>
            <li>
              <Link to="/help/locus">Locus Summary Help Page</Link>
            </li>
            <li>
              <Link to="/help/protein-motifs">Protein Domain/Motif Help Page</Link>
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

export default ProteinPageHelp;
