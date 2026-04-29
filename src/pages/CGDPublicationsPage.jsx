import React from "react";

const references = [
  {
    authors: "Lew-Smith J, Binkley J, Sherlock G.",
    title: "The Candida Genome Database: annotation and visualization updates.",
    journal: "Genetics",
    year: "2025",
    details: "229(3), Mar 17",
    doi: "https://doi.org/10.1093/genetics/iyaf001",
  },
  {
    authors: "Skrzypek MS, Binkley J, Sherlock G.",
    title: "How to use the Candida Genome Database.",
    journal: "Methods Mol Biol",
    year: "2022",
    details: "2542:55–69",
    doi: "https://doi.org/10.1007/978-1-0716-2549-1_4",
  },
  {
    authors: "Skrzypek MS, Binkley J, Sherlock G.",
    title: "Using the Candida Genome Database.",
    journal: "Methods Mol Biol",
    year: "2018",
    details: "1757:31–47",
    doi: "https://doi.org/10.1007/978-1-4939-7737-6_3",
  },
  {
    authors:
      "Skrzypek MS, Binkley J, Binkley G, Miyasato SR, Simison M, Sherlock G.",
    title:
      "The Candida Genome Database (CGD): incorporation of Assembly 22, systematic identifiers and visualization of high throughput sequencing data.",
    journal: "Nucleic Acids Res",
    year: "2016",
    doi: "https://doi.org/10.1093/nar/gkw924",
  },
  {
    authors:
      "Binkley J, Arnaud MB, Inglis DO, Skrzypek MS, Shah P, Wymore F, et al.",
    title:
      "The Candida Genome Database: the new homology information page highlights protein similarity and phylogeny.",
    journal: "Nucleic Acids Res",
    year: "2014",
    details: "42(Database issue):D711–6",
    doi: "https://doi.org/10.1093/nar/gkt1046",
  },
  {
    authors:
      "Inglis DO, Skrzypek MS, Arnaud MB, Binkley J, Shah P, Wymore F, Sherlock G.",
    title:
      "Improved Gene Ontology annotation for biofilm formation, filamentous growth and phenotypic switching in Candida albicans.",
    journal: "Eukaryot Cell",
    year: "2013",
    details: "12(1):101–8",
  },
  {
    authors:
      "Inglis DO, Arnaud MB, Binkley J, Shah P, Skrzypek MS, Wymore F, et al.",
    title:
      "The Candida genome database incorporates multiple Candida species: multispecies search and analysis tools.",
    journal: "Nucleic Acids Res",
    year: "2012",
    details: "40(Database issue):D667–74",
  },
  {
    authors:
      "Skrzypek MS, Arnaud MB, Costanzo MC, Inglis DO, Shah P, Binkley G, et al.",
    title:
      "New tools at the Candida Genome Database: biochemical pathways and full-text literature search.",
    journal: "Nucleic Acids Res",
    year: "2010",
    details: "38(Database issue):D428–32",
    doi: "https://doi.org/10.1093/nar/gkp836",
  },
  {
    authors:
      "Arnaud MB, Costanzo MC, Shah P, Skrzypek MS, Sherlock G.",
    title:
      "Gene Ontology and the annotation of pathogen genomes: the case of Candida albicans.",
    journal: "Trends Microbiol",
    year: "2009",
    details: "17(7):295–303",
  },
  {
    authors:
      "Butler G, Rasmussen MD, Lin MF, Santos MA, Sakthikumar S, Munro CA, et al.",
    title:
      "Evolution of pathogenicity and sexual reproduction in eight Candida genomes.",
    journal: "Nature",
    year: "2009",
    details: "459(7247):657–62",
  },
  {
    authors:
      "Arnaud MB, Costanzo MC, Skrzypek MS, Shah P, Binkley G, Lane C, et al.",
    title: "Sequence resources at the Candida Genome Database.",
    journal: "Nucleic Acids Res",
    year: "2007",
    details: "35(Database issue):D452–6",
  },
  {
    authors:
      "Costanzo MC, Arnaud MB, Skrzypek MS, Binkley G, Lane C, Miyasato SR, Sherlock G.",
    title:
      "The Candida Genome Database: Facilitating research on Candida albicans molecular biology.",
    journal: "FEMS Yeast Res",
    year: "2006",
    details: "6(5):671–84",
  },
  {
    authors:
      "Arnaud MB, Costanzo MC, Skrzypek MS, Binkley G, Lane C, Miyasato SR, Sherlock G.",
    title:
      "The Candida Genome Database (CGD), a community resource for Candida albicans gene and protein information.",
    journal: "Nucleic Acids Res",
    year: "2005",
    details: "33(Database issue):D358–63",
  },
];

export default function CGDPublicationsPage() {
  return (
    <div className="bibliography">
      <h2>References</h2>
      <ol>
        {references.map((ref, index) => (
          <li key={index} style={{ marginBottom: "1rem" }}>
            <span>
              {ref.authors} <strong>{ref.title}</strong>{" "}
              <em>{ref.journal}</em>. {ref.year}
              {ref.details ? `; ${ref.details}` : ""}.
              {ref.doi && (
                <>
                  {" "}
                  <a href={ref.doi} target="_blank" rel="noopener noreferrer">
                    {ref.doi}
                  </a>
                </>
              )}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
