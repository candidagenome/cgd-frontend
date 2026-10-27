import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../InfoPages.css';

function EnrichmentMethodologyHelp() {
  const { hash } = useLocation();

  // Jump to a section when linked from a results page (e.g. #phenotype-enrichment)
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
  }, [hash]);

  return (
    <div className="info-page">
      <div className="info-page-content">
        <h1>Enrichment Methodology</h1>
        <hr />

        <div className="info-section">
          <p>
            CGD offers GO and phenotype enrichment for a list of genes in the{' '}
            <Link to="/gene-list-workbench">Gene List Workbench</Link>, the{' '}
            <Link to="/go-term-finder">GO Term Finder</Link>, and the co-expressed gene lists on locus
            pages. This page explains how the results are calculated, so you can interpret them.
          </p>
          <ul>
            <li><a href="#what-enrichment-means">What enrichment tells you</a></li>
            <li><a href="#the-test">The statistical test</a></li>
            <li><a href="#multiple-testing">Correcting for multiple testing</a></li>
            <li><a href="#which-terms-are-listed">Which terms are listed</a></li>
            <li><a href="#go-enrichment">GO enrichment</a></li>
            <li><a href="#phenotype-enrichment">Phenotype enrichment</a></li>
            <li><a href="#reading-results">Reading the results table</a></li>
            <li><a href="#example">Worked example</a></li>
            <li><a href="#tips">Tips for interpreting results</a></li>
          </ul>
        </div>

        <div className="info-section">
          <h2 id="what-enrichment-means">What enrichment tells you</h2>
          <p>
            Enrichment asks whether a GO term or phenotype is shared by more genes in your list than
            you would expect by chance, given how common it is across the whole genome. A term
            annotated to most genes in your list is not necessarily enriched: if it is also
            annotated to most genes in the genome, sharing it is unremarkable.
          </p>
        </div>

        <div className="info-section">
          <h2 id="the-test">The statistical test</h2>
          <p>For each term, four numbers are counted:</p>
          <ul>
            <li><strong>k</strong>: genes in your list annotated to the term</li>
            <li><strong>n</strong>: genes in your list that were recognized</li>
            <li><strong>K</strong>: genes in the background annotated to the term</li>
            <li><strong>N</strong>: genes in the background</li>
          </ul>
          <p>
            The <strong>background</strong> is, by default, every gene-level feature in the organism's
            current genome assembly (ORFs, RNA genes, pseudogenes and annotated repeats), including
            genes with no annotations. Genes in your list without annotations of that kind still count
            in n. The GO Term Finder lets you supply your own background, for example all genes
            detected in your experiment.
          </p>
          <p>
            The <strong>p-value</strong> is the probability of finding k or more annotated genes in a
            random list of n genes drawn from the background (the hypergeometric test). A small
            p-value means the term is shared by more of your genes than chance would explain.
          </p>
        </div>

        <div className="info-section">
          <h2 id="multiple-testing">Correcting for multiple testing</h2>
          <p>
            Every term annotated to enough genes in your list (see below) is tested, often hundreds
            of terms at once, so some small p-values are expected by chance alone. P-values are therefore
            adjusted for the number of terms tested. By default CGD uses the Benjamini-Hochberg
            method; the adjusted value is shown as the <strong>FDR</strong> (false discovery rate).
            An FDR of 0.05 means that about 5% of the terms listed at that level are expected to be
            false positives. The GO Term Finder also offers the stricter Bonferroni correction, or no
            correction.
          </p>
        </div>

        <div className="info-section">
          <h2 id="which-terms-are-listed">Which terms are listed</h2>
          <p>A term is listed only when both of these are true:</p>
          <ol>
            <li>
              enough genes in your list are annotated to it: at least <strong>2</strong> in the Gene
              List Workbench and on locus pages; set by "Min genes" in the GO Term Finder
              (default 1), and
            </li>
            <li>
              its corrected value (FDR) is below the cutoff: <strong>0.05</strong> in the Gene List
              Workbench and on locus pages; set by "P-value" in the GO Term Finder
              (default 0.01).
            </li>
          </ol>
          <p>
            With a 2-gene minimum, terms annotated to only one gene in your list are never tested,
            however interesting they are, so very short lists can return few or no results.
          </p>
        </div>

        <div className="info-section">
          <h2 id="go-enrichment">GO enrichment</h2>
          <ul>
            <li>
              Biological process, molecular function and cellular component terms are all tested;
              results can be filtered by aspect.
            </li>
            <li>
              A gene annotated to a specific term also counts for all of that term's more general
              (ancestor) terms. For example, a gene annotated to "regulation of chitin biosynthetic
              process" also counts toward "regulation of biosynthetic process". This is why broad
              terms often appear alongside specific ones.
            </li>
            <li>
              All annotations are used by default, including computational (IEA) annotations. The{' '}
              <Link to="/go-term-finder">GO Term Finder</Link> can restrict the analysis by evidence
              code or annotation type (manually curated, high-throughput, computational). See also{' '}
              <Link to="/help/go-term-finder">GO Term Finder Help</Link>.
            </li>
          </ul>
        </div>

        <div className="info-section">
          <h2 id="phenotype-enrichment">Phenotype enrichment</h2>
          <p>
            For enrichment, a phenotype is the combination of three parts of a phenotype
            annotation:
          </p>
          <ul>
            <li>the <strong>observable</strong> (e.g. resistance to chemicals, filamentous growth),</li>
            <li>the <strong>mutant type</strong> (e.g. null, repressible, overexpression), and</li>
            <li>the <strong>qualifier</strong> (e.g. decreased, increased, abnormal).</li>
          </ul>
          <p>Two annotations count as the same phenotype only when all three agree. In addition:</p>
          <ul>
            <li>
              <strong>Experiment types are combined.</strong> The same phenotype found by classical
              genetics, a large-scale survey or a systematic mutant set counts as one phenotype.
            </li>
            <li>
              <strong>Observables are not grouped into broader ones.</strong> Unlike GO terms, a gene
              annotated to a specific observable (e.g. hyphal growth) is not counted toward a broader
              observable (e.g. filamentous growth), because observables are not organized as a
              hierarchy in which a specific phenotype implies the general one.
            </li>
            <li>
              <strong>Chemicals and conditions are not distinguished.</strong> "Resistance to
              chemicals, decreased" covers every chemical tested. Open a gene's Phenotype tab to see
              which chemicals and conditions were involved.
            </li>
          </ul>
        </div>

        <div className="info-section">
          <h2 id="reading-results">Reading the results table</h2>
          <table className="info-table">
            <thead>
              <tr><th>Column</th><th>Meaning</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>#</td>
                <td>k / n: genes in your list annotated to the term, out of the genes recognized</td>
              </tr>
              <tr>
                <td>Fold</td>
                <td>
                  How over-represented the term is: the fraction of your list annotated to it
                  divided by the fraction of the background annotated to it, (k/n) / (K/N)
                </td>
              </tr>
              <tr>
                <td>P-value</td>
                <td>Hypergeometric p-value for that term alone, before correction</td>
              </tr>
              <tr>
                <td>FDR</td>
                <td>The p-value corrected for the number of terms tested; terms are listed when this is below the cutoff</td>
              </tr>
              <tr>
                <td>Genes</td>
                <td>The genes in your list annotated to the term</td>
              </tr>
            </tbody>
          </table>
          <p>
            The summary line above the table shows how many of your genes were found, how many have
            annotations of that kind, the background size and the cutoff.
          </p>
        </div>

        <div className="info-section">
          <h2 id="example">Worked example</h2>
          <p>
            Phenotype enrichment for a two-gene list, ARV1 and MKC1 (<em>C. albicans</em>), returns a
            single enriched phenotype, although ARV1 has 8 phenotype annotations and MKC1 has 23.
            Only two phenotypes are annotated to both genes, so only those two are tested:
          </p>
          <ul>
            <li>
              <strong>resistance to chemicals (null, decreased)</strong>: annotated to about 750 of
              the 6,841 genes in the background (about 11%). Finding it in both genes of a two-gene
              list is unlikely by chance (p &asymp; 0.01), so it is listed.
            </li>
            <li>
              <strong>viable (null)</strong>: also annotated to both genes, but null mutants of most
              genes are viable (about 5,500 of 6,841), so sharing it is expected (p &asymp; 0.65) and
              it is not listed.
            </li>
          </ul>
          <p>
            Every other phenotype of ARV1 or MKC1 is annotated to only one of the two genes. For
            example, ARV1 has "filamentous growth, decreased" while MKC1 has "hyphal growth,
            decreased"; these are different observables, so neither reaches the 2-gene minimum.
          </p>
        </div>

        <div className="info-section">
          <h2 id="tips">Tips for interpreting results</h2>
          <ul>
            <li>
              Larger lists give the test more power; with only a few genes, even real biology may not
              reach significance.
            </li>
            <li>
              Look at the fold enrichment and the genes behind a term, not only the p-value: a term
              shared by 2 of 300 genes can be significant yet describe little of your list.
            </li>
            <li>
              If your genes come from an experiment that could only detect a subset of genes (for
              example, genes expressed in your conditions), use that subset as a custom background in
              the GO Term Finder.
            </li>
            <li>
              Enrichment shows that annotations are shared more than expected; it does not by itself
              show that the genes act together.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default EnrichmentMethodologyHelp;
