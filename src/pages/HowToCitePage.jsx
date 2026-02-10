import React from 'react';
import { Link } from 'react-router-dom';
import './InfoPages.css';

function HowToCitePage() {
  return (
    <div className="info-page">
      <div className="info-page-content">
        <h1>How to Cite CGD</h1>
        <hr />

        <section className="cite-section">
          <h2>CGD Citations</h2>
          <p>The basic format for citing electronic resources is:</p>
          <div className="cite-example">
            <p>
              Author's Last Name, First Name. "Title of Work." Title of Complete Work. [protocol and
              address] [path](date of message or visit).
            </p>
          </div>

          <p>The following are examples that can be used to cite CGD.</p>

          <h4>To cite CGD files obtained via the World Wide Web:</h4>
          <div className="cite-example">
            <p>
              Lew-Smith J, Binkley J, Miyasato SR, and Sherlock G.
              <br />
              "<em>Candida</em> Genome Database" http://www.candidagenome.org/
              <br />
              (date information was obtained).
            </p>
          </div>

          <h4>To cite information obtained from CGD:</h4>
          <div className="cite-example">
            <p>
              Lew-Smith J, Binkley J, Sherlock G (2025). The <em>Candida</em> Genome Database:
              annotation and visualization updates. Genetics, Volume 229, Issue 3, March 2025.
            </p>
          </div>

          <p>
            When citing information obtained in a search of CGD it should be remembered that while
            CGD strives to contain the most current and accurate data, CGD should not be used in
            citations where other primary sources of information are available.
          </p>
        </section>

        <hr />

        <section className="cite-section">
          <h2>CGD Reference List</h2>
          <ul className="reference-list">
            <li>
              Lew-Smith J, Binkley J, Sherlock G.{' '}
              <Link to="/reference/39776186">
                The <em>Candida</em> Genome Database: annotation and visualization updates.
              </Link>{' '}
              <em>Genetics.</em> 2025 Mar 17; 229(3). doi: 10.1093/genetics/iyaf001.
              <span className="available-link">
                <a
                  href="https://academic.oup.com/genetics/article-abstract/229/3/iyaf001/7944773"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Available here.
                </a>
              </span>
            </li>

            <li>
              Skrzypek MS, Binkley J, Sherlock G.{' '}
              <Link to="/reference/36008656">
                How to use the <em>Candida</em> Genome Database.
              </Link>{' '}
              <em>Methods Mol Biol.</em> 2022. 2542:55-69. doi: 10.1007/978-1-0716-2549-1_4.
              <span className="available-link">
                <a
                  href="https://link.springer.com/protocol/10.1007/978-1-0716-2549-1_4"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Available here.
                </a>
              </span>
            </li>

            <li>
              Skrzypek MS, Binkley J, Sherlock G.{' '}
              <Link to="/reference/29761455">
                Using the <em>Candida</em> Genome Database.
              </Link>{' '}
              <em>Methods Mol Biol.</em> 2018. 1757:31-47. doi:10.1007/978-1-4939-7737-6_3.
              <span className="available-link">
                <a
                  href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4896156/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Available here.
                </a>
              </span>
            </li>

            <li>
              Skrzypek MS, Binkley J, Binkley G, Miyasato SR, Simison M, Sherlock G.{' '}
              <a href="/reference/27738138">
                The <em>Candida</em> Genome Database (CGD): incorporation of Assembly 22, systematic
                identifiers and visualization of high throughput sequencing data.
              </a>{' '}
              <em>Nucleic acids Res.</em> 2016; (Epub. ahead of print) doi: 10.1093/nar/gkw924.
              <span className="available-link">
                <a
                  href="http://nar.oxfordjournals.org/cgi/pmidlookup?view=long&pmid=27738138"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Available here.
                </a>
              </span>
            </li>

            <li>
              Binkley J, Arnaud MB, Inglis DO, Skrzypek MS, Shah P, Wymore F, Binkley G, Miyasato SR,
              Simison M, Sherlock G.{' '}
              <a href="/reference/24185697">
                The <em>Candida</em> Genome Database: the new homology information page highlights
                protein similarity and phylogeny.
              </a>{' '}
              <em>Nucleic Acids Res.</em> 2014 Jan; <strong>42(Database issue)</strong>:D711-6. doi:
              10.1093/nar/gkt1046.
              <span className="available-link">
                <a
                  href="http://nar.oxfordjournals.org/content/42/D1/D711.long"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Available here.
                </a>
              </span>
            </li>

            <li>
              Inglis DO, Skrzypek MS, Arnaud MB, Binkley J, Shah P, Wymore F, Sherlock G.
              <br />
              <a href="/reference/23143685">
                Improved Gene Ontology annotation for biofilm formation, filamentous growth and
                phenotypic switching in <em>Candida albicans</em>.
              </a>
              <br />
              <em>Eukaryot Cell</em>. 2013 Jan;<strong>12(1)</strong>:101-8.
              <span className="available-link">
                <a
                  href="http://ec.asm.org/content/12/1/101.long"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Available here.
                </a>
              </span>
            </li>

            <li>
              Inglis DO, Arnaud MB, Binkley J, Shah P, Skrzypek MS, Wymore F, Binkley G, Miyasato SR,
              Simison M, Sherlock G.
              <br />
              <a href="/reference/22064862">
                The <em>Candida</em> genome database incorporates multiple <em>Candida</em> species:
                multispecies search and analysis tools with curated gene and protein information for{' '}
                <em>Candida albicans</em> and <em>Candida glabrata</em>.
              </a>
              <br />
              <em>Nucleic Acids Res.</em> 2012 Jan;<strong>40(Database issue)</strong>:D667-74.
              <span className="available-link">
                <a
                  href="http://nar.oxfordjournals.org/content/40/D1/D667.long"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Available here.
                </a>
              </span>
            </li>

            <li>
              Skrzypek MS, Arnaud MB, Costanzo MC, Inglis DO, Shah P, Binkley G, Miyasato SR,
              Sherlock G.
              <br />
              <a href="/reference/19808938">
                New tools at the <em>Candida</em> Genome Database: biochemical pathways and
                full-text literature search.
              </a>
              <br />
              <em>Nucleic Acids Res.</em> 2010 Jan;<strong>38(Database issue)</strong>:D428-32; doi:
              10.1093/nar/gkp836
              <span className="available-link">
                <a
                  href="http://nar.oxfordjournals.org/cgi/content/full/gkp836v1"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Available here.
                </a>
              </span>
            </li>

            <li>
              Arnaud MB, Costanzo MC, Shah P, Skrzypek MS, Sherlock G.
              <br />
              <a href="/reference/19577928">
                Gene Ontology and the annotation of pathogen genomes: the case of{' '}
                <em>Candida albicans</em>.
              </a>
              <br />
              <em>Trends Microbiol.</em> 2009 Jul 6;<strong>17(7)</strong>:295-303.
              <span className="available-link">
                <a
                  href="http://linkinghub.elsevier.com/retrieve/pii/S0966-842X(09)00111-5"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Available here.
                </a>
              </span>
            </li>

            <li>
              Butler G, Rasmussen MD, Lin MF, Santos MA, Sakthikumar S, Munro CA, et al.
              <br />
              <a href="/reference/19465905">
                Evolution of pathogenicity and sexual reproduction in eight <em>Candida</em>{' '}
                genomes.
              </a>
              <br />
              <em>Nature</em> 2009 Jun 4;<strong>459(7247)</strong>:657-62
              <span className="available-link">
                <a
                  href="http://dx.doi.org/10.1038/nature08064"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Available here.
                </a>
              </span>
            </li>

            <li>
              Arnaud MB, Costanzo MC, Skrzypek MS, Shah P, Binkley G, Lane C, Miyasato SR, Sherlock
              G.
              <br />
              <a href="/reference/43840">
                Sequence resources at the <em>Candida</em> Genome Database.
              </a>
              <br />
              <em>Nucleic Acids Res.</em> 2007 Jan; <strong>35(Database issue)</strong>:D452-6
              <span className="available-link">
                <a
                  href="http://nar.oxfordjournals.org/cgi/content/full/35/suppl_1/D452"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Available here.
                </a>
              </span>
            </li>

            <li>
              Costanzo MC, Arnaud MB, Skrzypek MS, Binkley G, Lane C, Miyasato SR, Sherlock G.
              <br />
              <a href="/reference/41891">
                The <em>Candida</em> Genome Database: Facilitating research on{' '}
                <em>Candida albicans</em> molecular biology.
              </a>
              <br />
              <em>FEMS Yeast Res.</em> 2006 Aug;<strong>6(5)</strong>:671-84.
              <span className="available-link">
                <Link to="/contact">Available on request.</Link>
              </span>
            </li>

            <li>
              Arnaud MB, Costanzo MC, Skrzypek MS, Binkley G, Lane C, Miyasato SR, Sherlock G.
              <br />
              <a href="/reference/10947">
                The <em>Candida</em> Genome Database (CGD), a community resource for{' '}
                <em>Candida albicans</em> gene and protein information.
              </a>
              <br />
              <em>Nucleic Acids Res.</em> 2005 Jan 1;<strong>33(Database issue)</strong>:D358-63.
              <span className="available-link">
                <a
                  href="http://nar.oxfordjournals.org/cgi/content/full/33/suppl_1/D358"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Available here.
                </a>
              </span>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}

export default HowToCitePage;
