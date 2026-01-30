import React from 'react';
import { Link } from 'react-router-dom';
import '../InfoPages.css';

const PhenoSearchHelp = () => {
  return (
    <div className="info-page">
      <h1 className="info-page-title">CGD Help: Searching Phenotype Data</h1>

      <hr className="info-divider" />

      <div className="info-content-block">
        <h2>Contents</h2>
        <ul>
          <li><a href="#using">Searching and Browsing Phenotype Data</a></li>
          <li><a href="#accessing">Downloading and Analyzing Search Results</a></li>
        </ul>
      </div>

      <hr className="info-divider" />

      <section id="using">
        <h2>Searching and Browsing Phenotype Data</h2>
        <p>
          The organization of mutant phenotype data in CGD is described in the{' '}
          <Link to="/help/phenotype">Phenotype Pages Help</Link> document. The data may be browsed
          and searched via several avenues:
        </p>

        <ul>
          <li>
            <strong>Locus Summary.</strong> Locus-specific lists of single mutant phenotypes are
            displayed on the Locus Summary page for each gene or feature; the Phenotype tab leads
            to a table containing all mutant phenotypes curated for that gene.
          </li>

          <li>
            <strong>CGD Quick Search.</strong> Any text entered into the <strong>Quick Search</strong>{' '}
            box is used to search the list of phenotype terms describing observed features, as well
            as other kinds of data in CGD. When a query is entered into the search box, the results
            page lists the matches found in various types of data. A typical Phenotype result would
            appear as:
            <ul>
              <li>
                10 Phenotypes [<Link to="/phenotype-search">Expanded Phenotype Search</Link>]
              </li>
            </ul>
            <p>
              The phrase "10 Phenotypes" is hyperlinked to a list of phenotypes for which the search
              criterion matches all or part of a phenotype term. The "Expanded Phenotype Search"
              link is hyperlinked to a list of search results in which the original search criterion
              has been used to search all phenotype data, including the terms describing observable
              features and other associated information such as details, conditions, chemical names,
              and virulence models.
            </p>
          </li>

          <li>
            <strong>
              <Link to="/phenotype-search">Expanded Phenotype Search</Link>.
            </strong>{' '}
            This interface allowing a complete search of phenotype data may be accessed directly
            from the <Link to="/search">Search Options</Link> page. Note that gene names, systematic
            names, and aliases are not included in this search, although gene names may be found
            within phenotype data where they are part of allele or Reporter names.
          </li>

          <li>
            <strong>Phenotype Terms page.</strong> This page allows you to view the entire
            hierarchical list of phenotype terms that are in use at CGD. Clicking on any term on
            this page leads to a list of all phenotypes annotated using this term, and the genes
            associated with them.
          </li>

          <li>
            <strong>Tables displaying phenotype data.</strong> Phenotype terms and chemical names
            that occur within any tables of phenotype data (e.g., on the Phenotype Details page
            showing mutant phenotypes for a single gene, as well as in tables of phenotype search
            results) provide access to additional related phenotypes and the genes associated with
            them. Clicking on a hyperlinked phenotype term will take you to a list of all
            annotations to that phenotype, with the associated genes. Clicking on the name of a
            chemical will take you to a list of all phenotypes and genes associated with that
            chemical.
          </li>
        </ul>
      </section>

      <section id="accessing">
        <h2>Downloading and Analyzing Search Results</h2>
        <ul>
          <li>
            The <strong>Analyze Gene List</strong> link at the top of every phenotype search results
            page leads to a box at the bottom of the page containing several links that allow you to
            further analyze or to download the list of genes displayed.
            <ul>
              <li>
                <Link to="/go-term-finder">GO Term Finder</Link>: leads to the GO Term Finder
                interface pre-filled with the list of genes. GO Term Finder finds{' '}
                <a
                  href="http://www.geneontology.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Gene Ontology (GO)
                </a>{' '}
                terms that the genes have in common, revealing shared biological processes,
                functions, or subcellular locations of the gene products. A detailed description of
                the GO Term Finder tool is available on its{' '}
                <Link to="/help/go-term-finder">help page</Link>.
              </li>

              <li>
                <Link to="/go-slim-mapper">GO Slim Mapper</Link>: leads to the GO Slim Mapper
                interface, pre-filled with the list of genes. GO Slim Mapper maps specific GO terms
                to broader parent terms (GO Slim terms), giving an overview of the processes,
                functions, or cellular components to which genes in a list are annotated. More
                information about the GO Slim Mapper tool is available on its{' '}
                <Link to="/help/go-slim-mapper">help page</Link>.
              </li>

              <li>
                <strong>View GO Annotation Summary</strong>: leads to a summary of the GO
                annotations for the genes in the list. The list is divided into three tables, each
                containing terms from one aspect of GO (biological process, molecular function,
                cellular component) and showing how many of the genes in the list are annotated to
                each term.
              </li>

              <li>
                <strong>Download Data</strong>: allows you to download all of the search results,
                including the list of genes and the associated phenotype data, as a tab-delimited
                file.
              </li>

              <li>
                <strong>Download options</strong>: leads to the{' '}
                <Link to="/batch-download">Batch Download</Link> interface, pre-filled with the list
                of genes. This interface allows you to download various types of information for the
                genes in a list, including DNA and protein sequence, chromosomal feature
                information, GO annotations, phenotype annotations, and <em>S. cerevisiae</em>{' '}
                orthologs and best hits.
              </li>
            </ul>
          </li>

          <li>
            In addition, files containing phenotype data for all genes in each species are available
            for download from CGD's <Link to="/download">Download Data</Link> page.
          </li>
        </ul>

        <p>
          <strong>
            Go to the <Link to="/phenotype-search">Expanded Phenotype Search</Link> interface
          </strong>
        </p>
      </section>

      <hr className="info-divider" />
    </div>
  );
};

export default PhenoSearchHelp;
