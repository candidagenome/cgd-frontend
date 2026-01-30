import React from 'react';
import { Link } from 'react-router-dom';
import '../InfoPages.css';

function GenomeSnapshotHelp() {
  return (
    <div className="info-page">
      <div className="info-page-content">
        <h1>CGD Help: Genome Snapshot</h1>
        <hr />

        <div className="info-section">
          <h2>Contents</h2>
          <ul>
            <li><a href="#description">Description</a></li>
            <li><a href="#graph">Graphical View of Protein Coding Genes</a></li>
            <li><a href="#snapshot">Genome Inventory</a></li>
            <li><a href="#go">Summary of GO annotations</a></li>
            <li><a href="#goslim">Distribution of Gene Products by Process, Function and Component</a></li>
            <li><a href="#accessing">Accessing the Genome Snapshot</a></li>
            <li><a href="#links">Other Relevant Links</a></li>
          </ul>
        </div>

        <hr />

        <div className="info-section">
          <h2 id="description">Description</h2>
          <p>
            This resource, which is updated daily, provides information on the status of each genome in CGD.
            It includes information on the genomic features and GO annotations. All the data displayed on
            this page are available in one or more files (Chromosomal Feature File; GO Annotations File) on
            the CGD <Link to="/download">Download Data</Link> page. The{' '}
            <a href="/cgi-bin/search/featureSearch">Advanced Search</a> tool can also be used to retrieve
            chromosomal features that match specific criteria.
          </p>
        </div>

        <div className="info-section">
          <h2 id="graph">Graphical View of Protein Coding Genes</h2>
          <p>
            This pie chart shows the breakdown of the number of ORFs classified as Verified, Uncharacterized,
            and Dubious in the genome. ORFs are classified as "Verified", "Uncharacterized", or "Dubious" by
            CGD according to the degree of certainty that each ORF actually encodes a protein (see the "ORF
            classification" section of the CGD{' '}
            <Link to="/help/sequence#Refinements">Sequence Documentation</Link> for details).
          </p>
        </div>

        <div className="info-section">
          <h2 id="snapshot">Genome Inventory</h2>
          <p>
            The Genome Inventory table provides a count of each feature type in the genome and in each
            chromosome. In addition, the table also lists the size of the genome and of each chromosome.
            Clicking on any of the feature types will provide a complete list of features of that type,
            along with their coordinates and other details such as gene names and descriptions. Only the
            feature types that are currently annotated in the genome are listed in this table.
          </p>
          <p>
            Note that there may be small differences between the total number of each type of feature as
            shown in the Genome Inventory table, and as derived from the Advanced Search. The number shown
            in the Genome Inventory table includes only genomic features that are mapped to chromosomes,
            while results from the Advanced Search tool may include features that are not mapped to Assembly
            21 chromosomes - for example, genes of the MTLalpha locus, which are not included in Assembly 21
            because it is a haploid assembly that includes the <strong>a</strong> mating type allele of this
            locus. Additionally, the Genome Snapshot view is updated once per day while the data in AspGD
            are updated multiple times per day.
          </p>
        </div>

        <div className="info-section">
          <h2 id="go">Summary of GO annotations</h2>
          <p>
            This summary table provides the current total number of gene products (protein and RNA gene
            products) that have been annotated to one or more terms in each GO aspect (Biological Process,
            Molecular Function and Cellular Component). Please note that these counts do not include the GO
            annotations made for ORFs classified as "Dubious", or for features of type "Pseudogene" or "Not
            physically mapped". Also note that the number of annotations displayed in the "Total Number of
            Annotations" column does not include annotations to the three terms representing lack of
            knowledge at this time, i.e. "molecular_function unknown", "biological_process unknown", or
            "cellular_component unknown". The GO Annotations File available at CGD's{' '}
            <Link to="/download">Download Data</Link> page provides the CGD GO annotations for download in bulk.
          </p>
        </div>

        <div className="info-section">
          <h2 id="goslim">Distribution of Gene Products by Process, Function and Component</h2>
          <p>
            This section provides three bar graphs that represent the GO annotation status of the entire
            genome using the <em>Candida</em> GO-Slim (a high-level subset of Gene Ontology terms that allows
            grouping of genes into broad categories such as "DNA replication", "protein kinase activity", or
            "nucleus", tailored to <em>Candida</em> biology). GO-Slim terms representing broad categories from
            a single aspect are listed for each graph, along with the percentage of gene products annotated
            to a specific term that maps up the ontology to the GO-Slim term. Only the distribution of
            "known" Molecular Functions, Biological Processes, and Cellular Components are included in these
            graphs; annotations to "unknown" are excluded.
          </p>
          <p>
            More information on GO and GO-Slim can be found at{' '}
            <a href="http://www.yeastgenome.org/help/GO.html" target="_blank" rel="noopener noreferrer">
              SGD's GO help
            </a>{' '}
            page or in the Gene Ontology{' '}
            <a href="http://www.geneontology.org/GO.doc.shtml" target="_blank" rel="noopener noreferrer">
              documentation
            </a>
            . The bar graphs are generated once a day.
          </p>
        </div>

        <div className="info-section">
          <h2 id="accessing">Accessing the Genome Snapshot</h2>
          <p>
            The Genome Snapshot can be accessed via the following links: on{' '}
            <Link to="/">CGD's home page</Link> under CGD Curation News; in the left-hand sidebar of CGD's
            home page and other index pages, in the "About CGD" section; and on the{' '}
            <Link to="/about">About CGD</Link> page.
          </p>
        </div>

        <div className="info-section">
          <h2 id="links">Other Relevant Links</h2>
          <ol>
            <li>
              <a href="/cgi-bin/search/featureSearch">Advanced Search Tool</a>
            </li>
            <li>
              <Link to="/download">CGD's Download Data page</Link>
            </li>
            <li>
              <a href="http://www.yeastgenome.org/help/GO.shtml" target="_blank" rel="noopener noreferrer">
                SGD's GO Help page
              </a>
            </li>
            <li>
              Gene Ontology{' '}
              <a href="http://www.geneontology.org/GO.doc.shtml" target="_blank" rel="noopener noreferrer">
                documentation
              </a>
            </li>
          </ol>
        </div>

        <p>
          <strong>
            Go to the <a href="/cache/genomesnapshot.html">Genome Snapshot</a>
          </strong>
        </p>
      </div>
    </div>
  );
}

export default GenomeSnapshotHelp;
