import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../InfoPages.css';

function GeneListWorkbenchHelp() {
  const { hash } = useLocation();

  // Jump to a section when linked from a workbench tab (e.g. #phenotype-enrichment)
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
  }, [hash]);

  return (
    <div className="info-page">
      <div className="info-page-content">
        <h1>Gene List Workbench Help</h1>
        <hr />

        <div className="info-section">
          <p>
            The <Link to="/gene-list-workbench">Gene List Workbench</Link> analyzes a list of genes
            from one organism in one place: enriched GO terms and phenotypes, expression across
            RNA-seq studies, orthologs in other species, and data downloads.
          </p>
          <ul>
            <li><a href="#building-a-list">Building a gene list</a></li>
            <li><a href="#enrichment">GO and Phenotype Enrichment</a></li>
            <li><a href="#other-tabs">Expression, Orthologs and Download</a></li>
          </ul>
        </div>

        <div className="info-section">
          <h2 id="building-a-list">Building a gene list</h2>
          <p>A list can be built in three ways:</p>
          <ul>
            <li>
              <strong>Paste genes</strong>: standard gene names (e.g. ALS3) or systematic names
              (e.g. C3_04530C_A, orf19.1816), one per line.
            </li>
            <li>
              <strong>From a GO term</strong>: all genes in the chosen organism annotated to the term,
              optionally including more specific (descendant) terms and computational annotations.
            </li>
            <li>
              <strong>From a phenotype</strong>: all genes annotated to an observable, optionally
              including more specific observables.
            </li>
          </ul>
          <p>
            Choose the organism, then select <strong>Analyze</strong>. The workbench reports how many
            entries were recognized; unrecognized names are listed so you can correct them. A gene
            entered under two names (for example ACT1 and C1_13700W_A) is counted once.
          </p>
        </div>

        <div className="info-section">
          <h2 id="enrichment">GO and Phenotype Enrichment</h2>
          <p>
            The GO Enrichment and Phenotype Enrichment tabs list GO terms and phenotypes shared by
            more genes in your list than expected by chance. A term is listed when at least 2 genes
            in your list are annotated to it and its Benjamini-Hochberg corrected p-value (FDR) is
            below 0.05. GO annotations count toward broader parent terms; phenotypes are matched on
            observable, mutant type and qualifier. To use different settings, follow "Change
            settings in GO Term Finder" on the GO tab, which carries your list over.
          </p>
          <p>
            For how the test, background and correction work, what each results column means, and
            a worked example, see <Link to="/help/enrichment-methodology">Enrichment Methodology</Link>.
          </p>
        </div>

        <div className="info-section">
          <h2 id="other-tabs">Expression, Orthologs and Download</h2>
          <ul>
            <li>
              <strong>Expression</strong>: a heatmap of RNA-seq fold changes for the first 50 genes
              in your list across all studies in CGD for that organism. The expression matrix
              download covers the whole list. See <Link to="/help/expression">Expression Help</Link>.
            </li>
            <li>
              <strong>Orthologs</strong>: one row per gene, with its orthologs in each other
              <em> Candida</em> species and <em>S. cerevisiae</em>.
            </li>
            <li>
              <strong>Download</strong>: sequences, coordinates, GO and phenotype annotations, and
              ortholog data for the whole list. See{' '}
              <Link to="/help/batch-download">Batch Download Help</Link> for the file formats.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default GeneListWorkbenchHelp;
