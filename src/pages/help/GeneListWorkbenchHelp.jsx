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
            <li><a href="#how-enrichment-works">How enrichment works</a></li>
            <li><a href="#go-enrichment">GO Enrichment</a></li>
            <li><a href="#phenotype-enrichment">Phenotype Enrichment</a></li>
            <li><a href="#reading-results">Reading the results table</a></li>
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
          <h2 id="how-enrichment-works">How enrichment works</h2>
          <p>
            Enrichment asks whether a GO term or phenotype is shared by more genes in your list than
            you would expect by chance, given how common it is across the whole genome. For each
            term the workbench counts:
          </p>
          <ul>
            <li><strong>k</strong>: genes in your list annotated to the term</li>
            <li><strong>n</strong>: genes in your list that were recognized</li>
            <li><strong>K</strong>: genes in the background annotated to the term</li>
            <li>
              <strong>N</strong>: genes in the background. The background is every gene-level
              feature in the organism's current genome assembly (ORFs, RNA genes, pseudogenes and
              annotated repeats; shown as "Background: N genes" above the results), including genes
              that have no annotations.
            </li>
          </ul>
          <p>
            The <strong>p-value</strong> is the probability of seeing k or more annotated genes in a
            random list of n genes drawn from the background (the hypergeometric test). Because
            hundreds of terms are tested at once, p-values are adjusted for multiple testing with the
            Benjamini-Hochberg method; the adjusted value is shown as the <strong>FDR</strong>{' '}
            (false discovery rate).
          </p>
          <p>A term is listed only when both of these are true:</p>
          <ol>
            <li>at least <strong>2 genes</strong> in your list are annotated to it, and</li>
            <li>its <strong>FDR is below 0.05</strong>.</li>
          </ol>
          <p>
            Terms annotated to only one gene in your list are never listed, however interesting
            they are. Very short lists can therefore return few or no results.
          </p>
        </div>

        <div className="info-section">
          <h2 id="go-enrichment">GO Enrichment</h2>
          <ul>
            <li>
              All three GO aspects (biological process, molecular function, cellular component) are
              tested; the results table can be filtered by aspect.
            </li>
            <li>
              A gene annotated to a specific term also counts for all of that term's more general
              (ancestor) terms. For example, a gene annotated to "regulation of chitin biosynthetic
              process" also counts toward "regulation of biosynthetic process". This is why broad
              terms often appear alongside specific ones.
            </li>
            <li>
              All annotations are used, including computational (IEA) annotations. To restrict the
              analysis to manually curated or high-throughput annotations, to change the p-value
              cutoff, or to use your own background set, use the{' '}
              <Link to="/go-term-finder">GO Term Finder</Link> (the workbench's "Change settings in
              GO Term Finder" link carries your list over). See also{' '}
              <Link to="/help/go-term-finder">GO Term Finder Help</Link>.
            </li>
          </ul>
        </div>

        <div className="info-section">
          <h2 id="phenotype-enrichment">Phenotype Enrichment</h2>
          <p>
            Phenotype enrichment works the same way, but a "phenotype" is matched exactly. Two
            annotations count as the same phenotype only when all of these agree:
          </p>
          <ul>
            <li>the <strong>observable</strong> (e.g. resistance to chemicals, filamentous growth),</li>
            <li>the <strong>mutant type</strong> (e.g. null, repressible, overexpression),</li>
            <li>the <strong>qualifier</strong> (e.g. decreased, increased, abnormal), and</li>
            <li>the <strong>experiment type</strong> (e.g. classical genetics, large-scale survey).</li>
          </ul>
          <p>Two consequences are worth knowing:</p>
          <ul>
            <li>
              <strong>Observables are not grouped.</strong> Unlike GO terms, a gene annotated to a
              specific observable (e.g. hyphal growth) is not counted toward its broader parent
              (e.g. filamentous growth).
            </li>
            <li>
              <strong>Details are not distinguished.</strong> Chemicals, conditions and strains
              recorded with an annotation are not part of the phenotype, so "resistance to
              chemicals, decreased" covers every chemical tested. Open a gene's Phenotype tab to see
              which chemicals were involved.
            </li>
          </ul>

          <h3 id="phenotype-example">Example: why only some phenotypes appear</h3>
          <p>
            A list of two genes, ARV1 and MKC1, returns only two enriched phenotypes, although ARV1
            alone has eight phenotype annotations and MKC1 has 23:
          </p>
          <ul>
            <li>resistance to chemicals (null, decreased): annotated to both ARV1 and MKC1</li>
            <li>viable (null): annotated to both ARV1 and MKC1</li>
          </ul>
          <p>
            Every other phenotype is annotated to only one of the two genes. For example, ARV1 has
            "filamentous growth, decreased" while MKC1 has "hyphal growth, decreased" and
            "filamentous growth, normal". These are different phenotypes, so none reaches the
            2-gene minimum and none is tested.
          </p>
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
                <td>Hypergeometric p-value for that term alone</td>
              </tr>
              <tr>
                <td>FDR</td>
                <td>Benjamini-Hochberg adjusted value; terms are listed when this is below 0.05</td>
              </tr>
              <tr>
                <td>Genes</td>
                <td>The genes in your list annotated to the term (select + to expand the row)</td>
              </tr>
            </tbody>
          </table>
          <p>
            The summary line above the table shows how many of your genes were found, how many have
            annotations of that kind, and the background size. Genes without annotations of that
            kind still count in n and N.
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
