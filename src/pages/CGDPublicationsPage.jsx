import React from 'react';
import './InfoPages.css';

const publications = [
  {
    authors: "Lew-Smith J, Binkley J, Sherlock G.",
    title: "The Candida Genome Database: annotation and visualization updates.",
    link: "https://pubmed.ncbi.nlm.nih.gov/39776186/",
    journal: "Genetics. 2025 Mar 17; 229(3). doi: 10.1093/genetics/iyaf001."
  },
  {
    authors: "Skrzypek MS, Binkley J, Sherlock G.",
    title: "How to use the Candida Genome Database.",
    link: "https://pubmed.ncbi.nlm.nih.gov/36008656/",
    journal: "Methods Mol Biol. 2022. 2542:55-69. doi: 10.1007/978-1-0716-2549-1_4."
  },
  {
    authors: "Skrzypek MS, Binkley J, Sherlock G.",
    title: "Using the Candida Genome Database.",
    link: "https://pubmed.ncbi.nlm.nih.gov/29761455/",
    journal: "Methods Mol Biol. 2018. 1757:31-47. doi:10.1007/978-1-4939-7737-6_3."
  },
  {
    authors: "Skrzypek MS, Binkley J, Binkley G, Miyasato SR, Simison M, Sherlock G.",
    title: "The Candida Genome Database (CGD): incorporation of Assembly 22, systematic identifiers and visualization of high throughput sequencing data.",
    link: "https://pubmed.ncbi.nlm.nih.gov/27738138/",
    journal: "Nucleic Acids Res. 2016. doi: 10.1093/nar/gkw924."
  },
  {
    authors: "Binkley J, Arnaud MB, Inglis DO, Skrzypek MS, Shah P, Wymore F, et al.",
    title: "The Candida Genome Database: the new homology information page highlights protein similarity and phylogeny.",
    link: "https://pubmed.ncbi.nlm.nih.gov/24185697/",
    journal: "Nucleic Acids Res. 2014 Jan; 42(Database issue):D711-6."
  },
  {
    authors: "Inglis DO, Skrzypek MS, Arnaud MB, Binkley J, Shah P, Wymore F, Sherlock G.",
    title: "Improved Gene Ontology annotation for biofilm formation, filamentous growth and phenotypic switching in Candida albicans.",
    link: "https://pubmed.ncbi.nlm.nih.gov/23143685/",
    journal: "Eukaryot Cell. 2013 Jan;12(1):101-8."
  },
  {
    authors: "Inglis DO, Arnaud MB, Binkley J, Shah P, Skrzypek MS, Wymore F, et al.",
    title: "The Candida genome database incorporates multiple Candida species: multispecies search and analysis tools.",
    link: "https://pubmed.ncbi.nlm.nih.gov/22064862/",
    journal: "Nucleic Acids Res. 2012 Jan;40(Database issue):D667-74."
  },
  {
    authors: "Skrzypek MS, Arnaud MB, Costanzo MC, Inglis DO, Shah P, Binkley G, et al.",
    title: "New tools at the Candida Genome Database: biochemical pathways and full-text literature search.",
    link: "https://pubmed.ncbi.nlm.nih.gov/19808938/",
    journal: "Nucleic Acids Res. 2010 Jan;38(Database issue):D428-32."
  },
  {
    authors: "Arnaud MB, Costanzo MC, Shah P, Skrzypek MS, Sherlock G.",
    title: "Gene Ontology and the annotation of pathogen genomes: the case of Candida albicans.",
    link: "https://pubmed.ncbi.nlm.nih.gov/19577928/",
    journal: "Trends Microbiol. 2009 Jul 6;17(7):295-303."
  },
  {
    authors: "Butler G et al.",
    title: "Evolution of pathogenicity and sexual reproduction in eight Candida genomes.",
    link: "https://pubmed.ncbi.nlm.nih.gov/19465905/",
    journal: "Nature 2009 Jun 4;459(7247):657-62."
  },
  {
    authors: "Arnaud MB et al.",
    title: "Sequence resources at the Candida Genome Database.",
    link: "https://pubmed.ncbi.nlm.nih.gov/17090582/",
    journal: "Nucleic Acids Res. 2007 Jan;35(Database issue):D452-6."
  },
  {
    authors: "Costanzo MC et al.",
    title: "The Candida Genome Database: Facilitating research on Candida albicans molecular biology.",
    link: "https://pubmed.ncbi.nlm.nih.gov/16879419/",
    journal: "FEMS Yeast Res. 2006 Aug;6(5):671-84."
  },
  {
    authors: "Arnaud MB et al.",
    title: "The Candida Genome Database (CGD), a community resource for Candida albicans gene and protein information.",
    link: "https://pubmed.ncbi.nlm.nih.gov/15608216/",
    journal: "Nucleic Acids Res. 2005 Jan 1;33(Database issue):D358-63."
  }
];

function CGDPublicationsPage() {
  return (
    <div className="info-page">
      <div className="info-page-content">
        <h1>CGD Publications</h1>
        <hr />

        <section className="cite-section">
          <ul className="reference-list">
            {publications.map((pub, index) => (
              <li key={index}>
                {pub.authors}{' '}
                <a href={pub.link} target="_blank" rel="noopener noreferrer">
                  {pub.title}
                </a>{' '}
                {pub.journal}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

export default CGDPublicationsPage;
