import React from 'react';
import { Link } from 'react-router-dom';
import './InfoPages.css';

function HelpPage() {
  return (
    <div className="info-page">
      <div className="info-page-content">
        <h1>Help Resources</h1>
        <hr />

        <div className="help-item">
          <h3>
            <Link to="/sitemap">Site Map</Link>
          </h3>
          <p>
            A brief description of CGD resources & tools, organized by topic. Links to help
            documentation. Compares and contrasts similar resources.
          </p>
        </div>

        <div className="help-item">
          <h3>
            <Link to="/help/getting-started">Getting Started with CGD</Link>
          </h3>
          <p>Common uses of CGD</p>
        </div>

        <div className="help-item">
          <h3>
            <Link to="/nomenclature">Gene Nomenclature Guide</Link>
          </h3>
          <p>
            Information about the various types of gene names/identifiers that are in use.
            Guidelines for registering a new gene name, as agreed upon by the members of the
            research community.
          </p>
        </div>

        <div className="help-item">
          <h3>
            <Link to="/help/sequence">Sequence Documentation</Link>
          </h3>
          <p>
            Information about the DNA and protein sequences in CGD. How to access sequence
            information. The source of these sequences and further explanation of some
            sequence-related issues.
          </p>
        </div>

        <div className="help-item">
          <h3>
            <Link to="/help/search-form">Search Help</Link>
          </h3>
          <p>Documentation about search tools in CGD. Additional tool-specific documentation:</p>
          <div className="help-links">
            <Link to="/help/feature-search">Advanced Search</Link>
            <Link to="/help/batch-download">Batch Download</Link>
            <Link to="/help/gs-resources">Get Sequence</Link>
          </div>
        </div>

        <div className="help-item">
          <h3>
            <Link to="/help/jbrowse">JBrowse Help</Link>
          </h3>
          <p>
            Navigating the genome using the JBrowse Genome Browser. How to view nucleotide and
            protein sequence in JBrowse.
          </p>
        </div>

        <div className="help-item">
          <h3>
            <Link to="/help/blast">BLAST Documentation</Link>
          </h3>
          <p>
            How to use the BLAST tool to query sequence similarity in CGD. A detailed description
            of the search output is found on the{' '}
            <Link to="/help/blast-results">BLAST Results</Link> help page.
          </p>
        </div>

        <div className="help-item">
          <h3>
            <Link to="/help/crispr">CRISPR Guide RNA Designer</Link>
          </h3>
          <p>
            How to use the CRISPR tool to design guide RNAs for gene editing in <em>Candida</em> species.
            Includes efficiency prediction, off-target analysis, and cloning primer generation.
          </p>
        </div>

        <div className="help-item">
          <h3>
            <Link to="/help/code-tables">
              Non-standard Genetic Code Usage in <em>Candida</em>
            </Link>
          </h3>
          <p>
            Information about translation tables used in CGD. <em>Candida albicans</em> and some
            related species (often called the "CTG clade") use a non-standard genetic code,
            "Translation table 12: Alternative Yeast Nuclear Code," to translate nuclear genes.
          </p>
        </div>

        <div className="help-item">
          <h3>
            <Link to="/help/patmatch">Pattern Matching Tool Documentation</Link>
          </h3>
          <p>How to use the Patmatch tool to locate DNA or protein sequence patterns in CGD.</p>
        </div>

        <div className="help-item">
          <h3>
            <Link to="/help/webprimer">Primer Design Tool Documentation</Link>
          </h3>
          <p>How to use the Webprimer tool to design primers for PCR or for sequencing.</p>
        </div>

        <div className="help-item">
          <h3>
            <Link to="/help/restriction-map">Restriction Analysis</Link>
          </h3>
          <p>
            How to use the Genome Restriction Analysis tool to compute a restriction map based on
            DNA sequence.
          </p>
        </div>

        <div className="help-item">
          <h3>
            <Link to="/help/biochem-pathways">Biochemical Pathways</Link>
          </h3>
          <p>How to search and navigate metabolic pathway information in CGD.</p>
        </div>

        <div className="help-item">
          <h3>Gene Ontology (GO) Documentation</h3>
          <p>A guide to the Gene Ontology information and tools in CGD:</p>
          <div className="help-links">
            <a
              href="https://geneontology.org/docs/introduction-to-go"
              target="_blank"
              rel="noopener noreferrer"
            >
              What is GO?
            </a>
            <a
              href="https://sites.google.com/view/yeastgenome-help/function-help/gene-ontology-go"
              target="_blank"
              rel="noopener noreferrer"
            >
              SGD GO Tutorial
            </a>
            <Link to="/help/go-slim">GO Slim Mapper Help</Link>
            <Link to="/help/go-term-finder">GO Term Finder Help</Link>
          </div>
        </div>

        <div className="help-item">
          <h3>CGD Web Page Help</h3>
          <p>A guide to the types of information found on CGD web pages:</p>
          <div className="help-links">
            <Link to="/help/locus">Locus</Link>
            <Link to="/help/literature-topics">Literature Guide</Link>
            <Link to="/help/curated-paper">CGD Paper</Link>
            <Link to="/help/phenotype">Mutant Phenotype</Link>
          </div>
        </div>

        <div className="help-item">
          <h3>Protein Pages</h3>
          <p>
            A guide to the resources available from the Protein tab on the Locus Summary page for
            each ORF:
          </p>
          <div className="help-links">
            <Link to="/help/protein-page">Protein Information Page</Link>
            <Link to="/help/protein-motifs">Domains/Motifs Page</Link>
            <Link to="/help/protein-properties">Protein Physicochemical Properties</Link>
            <Link to="/help/pdb-homolog">PDB Homolog Page</Link>
          </div>
        </div>

        <div className="help-item">
          <h3>CGD Download Help</h3>
          <p>
            README documents describing some of files available for download from CGD (full list on
            the <Link to="/download">Download Index</Link> page):
          </p>
          <div className="help-links">
            <a href="/download/go/gene_association_README.txt">Gene Ontology (GO) Annotations File</a>
            <a href="/download/chromosomal_feature_files/README">Chromosomal Feature File</a>
            <a href="/download/sequence/README">Sequence Files</a>
          </div>
        </div>

        <div className="help-item">
          <h3>CGD Quick Resource Guide</h3>
          <p>
            A pamphlet (<a href="/help/CGDPamphlet2010.pdf">download pdf</a>) that describes the
            content and usage of many resources available at CGD. The guide was developed a few
            years ago and so it does not include the latest features added to CGD, but it provides
            an overview of the basic functions and types of information available.
          </p>
        </div>

        <div className="help-item">
          <h3>
            <a
              href="https://sites.google.com/view/yeastgenome-help/sgd-general-help/glossary"
              target="_blank"
              rel="noopener noreferrer"
            >
              Glossary
            </a>
          </h3>
          <p>
            Terms and definitions, provided by <em>Saccharomyces</em> Genome Database
          </p>
        </div>

        <div className="help-item">
          <h3>
            <Link to="/faq">FAQ (Frequently Asked Questions)</Link>
          </h3>
          <p>Answers to some of the most common questions asked by CGD users</p>
        </div>

        <div className="help-item">
          <h3>
            <Link to="/">What's New in CGD</Link>
          </h3>
          <p>Changes and additions to CGD services</p>
        </div>

        <div className="help-item">
          <h3>
            <Link to="/contact">Contact CGD</Link>
          </h3>
          <p>Send suggestions or questions to CGD</p>
        </div>
      </div>
    </div>
  );
}

export default HelpPage;
