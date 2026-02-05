import React from 'react';
import { Link } from 'react-router-dom';
import '../InfoPages.css';

function PhenotypeHelp() {
  return (
    <div className="info-page">
      <div className="info-page-content">
        <h1>CGD Help: Phenotype Pages</h1>
        <hr />

        <div className="info-section">
          <h2>Contents</h2>
          <ul>
            <li><a href="#description">Description</a></li>
            <li><a href="#using">Mutant phenotype data</a></li>
            <li><a href="#accessing">Navigating mutant phenotype data</a></li>
            <li><a href="#links">Other Relevant Links</a></li>
            <li><a href="#glossary">Associated Glossary Terms</a></li>
          </ul>
        </div>

        <hr />

        <div className="info-section">
          <h2 id="description">Description</h2>
          <p>
            The Phenotype page presents detailed information about single mutant phenotypes for a particular
            gene, along with references for each observation. This page is accessible from the 'Phenotype'
            tab of the Locus Summary and is also linked from the Mutant Phenotypes section of the Locus
            Summary, where the phenotype data are presented in summary form. Data are presented in tabular
            form on the Phenotype page and may continue onto additional pages if the number of phenotypes is
            greater than 30.
          </p>
          <p>
            All of the phenotype data for a particular gene may be downloaded to your computer, as a
            tab-delimited text file, through the 'Download Data' links near the top and bottom of the page. A
            file containing phenotype data for all genes, 'phenotype_data.tab', is available for download
            from CGD's <Link to="/download">Download Data</Link> page.
          </p>
        </div>

        <div className="info-section">
          <h2 id="using">Mutant phenotype data</h2>

          <h3>What is a mutant phenotype?</h3>
          <p>
            Broadly defined, the phenotype of a mutation is the observable effect that it has on an organism.
            At CGD, our working definition of a phenotype is the effect of a mutation on any observable or
            detectable feature of <em>Candida</em> cells or cultures. We limit our curation to those features
            that are observable in living cells or that occur in living cells (they may be detected by assays
            that disrupt cells). For example, an effect of a mutation in a protease-encoding gene on the
            processing of its substrates would be considered a mutant phenotype, even though biochemical
            methods must be used to detect the lack of processing. In contrast, the effect of a mutation in
            an enzyme on the in vitro activity of that enzyme would not be curated as a mutant phenotype. We
            focus on curating the primary observation rather than its interpretation. Many of the more
            detailed, molecular effects that could be considered phenotypes, as well as the molecular
            interpretations of observed effects, are captured in CGD as{' '}
            <a href="http://www.geneontology.org/" target="_blank" rel="noopener noreferrer">
              Gene Ontology (GO)
            </a>{' '}
            annotations. Additionally, only single mutant phenotypes are curated at present.
          </p>

          <h3>How phenotype data are recorded in CGD</h3>
          <p>
            In order to facilitate searching and comparison of related phenotypes, we have developed a system
            for recording mutant phenotype data that uses a controlled vocabulary to describe most aspects of
            the phenotype.
          </p>
          <p>
            Mutant phenotype data are presented in a table that contains the following columns:{' '}
            <strong>Experiment type</strong>, <strong>Mutant information</strong>,{' '}
            <strong>Strain background</strong>, <strong>Phenotype</strong>,{' '}
            <strong>Anatomical structure</strong>, <strong>Chemical</strong>, <strong>Details</strong>,{' '}
            <strong>Virulence model</strong>, and <strong>References</strong>.
          </p>

          <ul>
            <li>
              <strong>Experiment type</strong> indicates the method used to detect and analyze mutant
              phenotypes. The major experiment types are <strong>classical genetics</strong> and{' '}
              <strong>large-scale survey</strong>. These indicate the scope of the experiment and the methods
              used. Experiments of the type <strong>classical genetics</strong> are small-scale, focusing on
              one or a few genes. <strong>Large-scale survey</strong> experiments are those designed with a
              knowledge of the genome sequence, often using high-throughput, robot-assisted techniques.
              <p>
                <strong>Classical genetics</strong> experiments are further categorized into three sub-types
                to indicate the ploidy of the strain in which the phenotype was analyzed: aneuploid,
                homozygous diploid, and heterozygous diploid.
              </p>
              <p>
                <strong>Large-scale survey</strong> experiments are further categorized into sub-types
                reflecting the ploidy of the strain used and also the experimental methodology:
              </p>
              <ul>
                <li>
                  <strong>systematic mutation set</strong> refers to the use of genome-wide mutant
                  collections.
                </li>
                <li>
                  <strong>competitive growth</strong> refers to experiments in which pools of mutant strains
                  are grown together for many generations to assess their relative fitness.
                </li>
              </ul>
            </li>
            <li>
              <strong>Mutant information</strong> includes a description of the impact of the mutation on the
              activity of the gene product. Mutations are classified into the following types:
              <ul>
                <li><strong>activation</strong> - the mutation increases the normal activity of a gene product</li>
                <li><strong>conditional</strong> - the activity of the gene product appears wild-type under some conditions and altered under others</li>
                <li><strong>dominant negative</strong> - the mutant gene product negatively affects the activity of the wild-type gene product</li>
                <li><strong>gain of function</strong> - the mutation confers a new activity on the gene product</li>
                <li><strong>misexpression</strong> - the gene product is expressed at a developmental stage, in a cell type, or at a subcellular location different from that at which the wild-type gene is expressed</li>
                <li><strong>null</strong> - synonymous with "loss of function", this type of mutation abolishes the function of a gene product</li>
                <li><strong>overexpression</strong> - the gene is expressed under control of a strong promoter and/or on a high copy number plasmid</li>
                <li><strong>reduction of function</strong> - the mutation reduces the activity of the gene product</li>
                <li><strong>repressible</strong> - synonymous with depletion, this represents cases where there is a reduction of levels of the gene product</li>
                <li><strong>unspecified</strong> - used when the mutant type cannot be determined</li>
              </ul>
            </li>
            <li>
              <strong>Strain background</strong> captures the genetic background in which the mutant
              phenotype was analyzed, for some of the most commonly used strains. For <em>C. albicans</em>:
              BWP17, CAF2-1, CAI-4, CAI-8, P37005, RM1000, SC5314, SN152, SN87, SN95, WO-1, Other, Not
              recorded. For <em>C. glabrata</em>: 2001HT, 2001T, BG14, BG2, CBS138 (ATCC2001), NCCLS84, Other{' '}
              <em>C. glabrata</em>.
            </li>
            <li>
              <strong>Phenotype</strong> combines a term describing the observed feature with a qualifier
              that indicates the direction of the change in that feature relative to wild type (abnormal,
              arrested, decreased, decreased duration, decreased rate, delayed, absent, increased, increased
              duration, increased rate, premature, normal, normal duration, normal rate). The controlled-
              vocabulary terms used to describe phenotypes are a subset of the terms in the{' '}
              <a
                href="http://www.obofoundry.org/cgi-bin/detail.cgi?id=ascomycete_phenotype"
                target="_blank"
                rel="noopener noreferrer"
              >
                Ascomycete Phenotype Ontology
              </a>{' '}
              (APO).
            </li>
            <li>
              <strong>Anatomical structure</strong> indicates any anatomical structure that is affected by
              the mutation. Structures are described using terms from the{' '}
              <a
                href="http://www.obofoundry.org/cgi-bin/detail.cgi?id=fungal_anatomy"
                target="_blank"
                rel="noopener noreferrer"
              >
                Fungal Anatomy Ontology
              </a>{' '}
              (FAO).
            </li>
            <li>
              <strong>Chemical</strong> indicates any chemical compounds used in the phenotype assay, most
              commonly exogenous chemicals that affect the growth of the mutant strain. Chemical compound
              names are derived, where possible, from the Chemical Entities of Biological Interest (
              <a href="http://www.ebi.ac.uk/chebi/" target="_blank" rel="noopener noreferrer">
                ChEBI
              </a>
              ) database.
            </li>
            <li>
              <strong>Details</strong> includes additional types of information about the phenotype, captured
              as free text:
              <ul>
                <li><strong>Condition</strong> summarizes relevant experimental conditions such as growth media or temperature</li>
                <li><strong>Details</strong> includes any additional facts that are important to understanding the phenotype</li>
                <li><strong>Reporter</strong> identifies the protein(s) or RNA(s) that are used in an experiment to track a process</li>
              </ul>
            </li>
            <li>
              <strong>Virulence model</strong> indicates the type of model system used to assess the
              virulence of a mutant. Model systems include: <em>C. elegans</em> infection, ex vivo model of
              infection, guinea pig intravenous infection, immunosuppressed mouse intravenous infection, in
              vitro model of infection, insect infection, mouse corneal infection, mouse cutaneous infection,
              mouse gastrointestinal tract infection, mouse intravenous infection, mouse mammary gland
              infection, mouse oropharyngeal infection, mouse peritoneal infection, mouse pulmonary
              infection, mouse vaginal infection, other model, rabbit corneal infection, rat oropharyngeal
              infection, rat peritoneal infection, rat vaginal infection.
            </li>
            <li>
              <strong>References</strong> lists the publication(s) in which the phenotype is described, with
              links to their "CGD Curated Paper" pages as well as to their abstracts in PubMed.
            </li>
          </ul>
        </div>

        <div className="info-section">
          <h2 id="accessing">Navigating mutant phenotype data</h2>
          <p>
            If there are more than 30 mutant phenotypes recorded for a single gene, they are separated onto
            multiple pages. A navigation bar above the table on each page lists the total number of
            phenotypes and pages, and indicates which page you are viewing. Links at the top of the page
            allow you to jump down to the 'Download data' link.
          </p>
          <p>
            Within the table of phenotype data, <strong>phenotypes</strong> and <strong>chemicals</strong>{' '}
            are hyperlinked. Clicking on a phenotype term will take you to a list of all annotations to that
            phenotype, with the associated genes. Clicking on the name of a chemical will take you to a list
            of all phenotypes and genes associated with that chemical.
          </p>
          <p>
            Additional options for searching phenotype data include a search of the major phenotype terms via
            the CGD Quick Search, which is accessed via a text entry box located at the top of most CGD
            pages; and a complete search of phenotypes and associated data via the{' '}
            <a href="/phenotype/search">Expanded Phenotype Search</a>, which may be accessed
            from a link on the <Link to="/search">Search Options</Link> page as well as from the table of
            Quick Search results. Please see the <Link to="/help/pheno-search">Phenotype Search Help</Link>{' '}
            page for more details on searching phenotype data.
          </p>
        </div>

        <div className="info-section">
          <h2 id="links">Other Relevant Links</h2>
          <ol>
            <li>
              <strong>CGD Pages</strong>
              <ol type="a">
                <li>
                  <Link to="/search">Search Options</Link> page
                </li>
                <li>
                  <a href="/phenotype/search">Expanded Phenotype Search</a>
                </li>
                <li>
                  <Link to="/help/pheno-search">Phenotype Search Help</Link> page
                </li>
                <li>
                  <a href="/cache/PhenotypeTree.html">List of phenotype terms</a> in use at CGD
                </li>
              </ol>
            </li>
            <li>
              <strong>External Sites</strong>
              <ol type="a">
                <li>
                  <a href="http://www.obofoundry.org/" target="_blank" rel="noopener noreferrer">
                    Open Biomedical Ontologies
                  </a>{' '}
                  site: view and download the Ascomycete Phenotype Ontology and the Fungal Anatomy Ontology
                </li>
                <li>
                  Home page of the{' '}
                  <a
                    href="http://www.yeastgenome.org/fungi/fungal_anatomy_ontology/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Fungal Anatomy Ontology
                  </a>{' '}
                  project
                </li>
                <li>
                  Chemical Entities of Biological Interest (
                  <a href="http://www.ebi.ac.uk/chebi/" target="_blank" rel="noopener noreferrer">
                    ChEBI
                  </a>
                  )
                </li>
              </ol>
            </li>
          </ol>
        </div>

        <div className="info-section">
          <h2 id="glossary">Associated SGD Glossary Terms</h2>
          <ul>
            <li>
              <a
                href="http://www.yeastgenome.org/help/glossary.html#gene-ontology"
                target="_blank"
                rel="noopener noreferrer"
              >
                Gene Ontology (GO)
              </a>
            </li>
            <li>
              <a
                href="http://www.yeastgenome.org/help/glossary.html#null"
                target="_blank"
                rel="noopener noreferrer"
              >
                Null mutation
              </a>
            </li>
            <li>
              <a
                href="http://www.yeastgenome.org/help/glossary.html#phenotype"
                target="_blank"
                rel="noopener noreferrer"
              >
                Phenotype
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default PhenotypeHelp;
