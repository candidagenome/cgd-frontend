import React from 'react';
import { Link } from 'react-router-dom';
import '../InfoPages.css';

function RepeatTEHelp() {
  return (
    <div className="info-page">
      <div className="info-page-content">
        <h1>Repeat and Transposable Element Annotations</h1>
        <hr />

        <div className="info-section">
          <p>
            Historically, curated repeat and transposable element (TE) annotation in CGD was
            largely limited to <em>Candida albicans</em> (the Tca retrotransposons, Greek-letter
            LTRs, MRS repeat regions, and Zorro LINEs). In 2026, CGD systematically annotated
            repeats and transposable elements across all six species &mdash; adding them for{' '}
            <em>C. dubliniensis</em>, <em>C. tropicalis</em>, <em>C. glabrata</em>,{' '}
            <em>C. parapsilosis</em>, and <em>C. auris</em> for the first time, and filling gaps
            in the curated <em>C. albicans</em> set. All families and their genomic copies were
            reviewed by a CGD curator before loading.
          </p>
        </div>

        <div className="info-section">
          <h2>What was added, by species</h2>
          <table className="sitemap-table">
            <thead>
              <tr>
                <th>Species</th>
                <th>Retrotransposon</th>
                <th>Long terminal repeat</th>
                <th>DNA transposon</th>
                <th>Repeat region</th>
                <th>Highlights</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><em>C. dubliniensis</em></td>
                <td>56</td>
                <td>292</td>
                <td>10</td>
                <td>104</td>
                <td>
                  The TE hotspot of the genus: intact Gypsy and Copia retrotransposons, Zorro
                  LINEs, MRS homologs, and elements named for their <em>C. albicans</em>{' '}
                  homologs (TCA3, iota, zeta&hellip;)
                </td>
              </tr>
              <tr>
                <td><em>C. tropicalis</em></td>
                <td>11</td>
                <td>14</td>
                <td>&mdash;</td>
                <td>160</td>
                <td>
                  First-ever annotation of full-length Gypsy retrotransposons (to 6.9 kb) in this
                  species &mdash; its equivalents of the <em>C. albicans</em> Tca elements
                </td>
              </tr>
              <tr>
                <td><em>C. glabrata</em></td>
                <td>1</td>
                <td>3</td>
                <td>&mdash;</td>
                <td>117</td>
                <td>
                  Repeats without transposons: dominated by megasatellite-scale tandem repeats
                  (copies to 27.7 kb) inside cell-wall/adhesin genes
                </td>
              </tr>
              <tr>
                <td><em>C. parapsilosis</em></td>
                <td>&mdash;</td>
                <td>&mdash;</td>
                <td>19</td>
                <td>84</td>
                <td>
                  No LTR retrotransposons, but a genuine Tc1/mariner-family DNA transposon
                  (TcMar-ISRm11)
                </td>
              </tr>
              <tr>
                <td><em>C. auris</em></td>
                <td>&mdash;</td>
                <td>&mdash;</td>
                <td>&mdash;</td>
                <td>27</td>
                <td>
                  The most TE-poor genome of the six &mdash; no LTR retrotransposons detected at
                  all
                </td>
              </tr>
              <tr>
                <td><em>C. albicans</em></td>
                <td>13</td>
                <td>37</td>
                <td>&mdash;</td>
                <td>112</td>
                <td>
                  Gap-fill of the curated reference set: novel copies missed by earlier manual
                  curation, loaded as haplotype-paired A/B alleles
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="info-section">
          <h2>How the features were identified</h2>

          <h3>De novo family discovery</h3>
          <p>
            Each genome was analyzed with <strong>RepeatModeler2</strong> (including the
            LTR-structural pipeline: LTRharvest &rarr; LTR_retriever) to build a species-specific
            repeat family library from the genome sequence itself, with no prior assumptions.
            Candidate families were then classified by their protein domains with{' '}
            <strong>TEsorter</strong> against the REXdb transposable-element protein database
            (confirming, for example, intact gag/pol domains in Gypsy and Copia elements), and
            each genome was annotated with its own library using <strong>RepeatMasker</strong>.
          </p>

          <h3>Homology to curated <em>C. albicans</em> elements</h3>
          <p>
            In parallel, all 366 curated <em>C. albicans</em> repeat/TE sequences were used as a
            RepeatMasker library against every genome. This route matters most for{' '}
            <em>C. dubliniensis</em>, the closest relative of <em>C. albicans</em>, where most
            elements could be identified and named directly by their albicans homolog (e.g. TCA3
            at 2.7% divergence, the iota and zeta LTR families, MRS repeats, ZORRO3). Where the
            de novo and homology routes found the same element, the homology identification and
            name were used. For the other four species, <em>C. albicans</em> homology detects
            almost nothing (&le;0.03% of each genome) &mdash; their repeats are
            species-specific, which is why the de novo route was essential.
          </p>

          <h3>Feature types</h3>
          <p>Evidence was mapped onto CGD feature types with fixed rules:</p>
          <table className="sitemap-table">
            <thead>
              <tr>
                <th>Evidence</th>
                <th>Feature type</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Full-length LTR retrotransposon (&ge;1 kb, or the internal region of an
                  LTR-pipeline family); LINE elements</td>
                <td><code>retrotransposon</code></td>
              </tr>
              <tr>
                <td>Solo or flanking LTR (100&ndash;999 bp, LTR-classified family)</td>
                <td><code>long_terminal_repeat</code></td>
              </tr>
              <tr>
                <td>Class II (DNA) transposon with transposase homology</td>
                <td><code>DNA_transposon</code> (SO:0000182) &mdash; a new feature type
                  introduced for this release</td>
              </tr>
              <tr>
                <td>Unclassified dispersed repeat family (&ge;200 bp copies, &le;~30%
                  divergence)</td>
                <td><code>repeat_region</code></td>
              </tr>
              <tr>
                <td>Simple repeats, low-complexity sequence, microsatellites</td>
                <td>not annotated as features</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="info-section">
          <h2>Curator review</h2>
          <p>
            Every candidate family was reviewed by a CGD curator before loading. Families were
            required to have at least 5 genomic copies or 5 kb of total sequence (with judgment
            applied near the threshold), and individual <code>repeat_region</code> copies that
            substantially overlap protein-coding genes were removed to avoid confusion with gene
            paralogy &mdash; with one deliberate exception: the <em>C. glabrata</em>{' '}
            <strong>megasatellites</strong>, kilobase-scale tandem repeats that genuinely live
            inside cell-wall and adhesin genes, are annotated as <code>repeat_region</code>{' '}
            features with &ldquo;megasatellite&rdquo; noted in their descriptions.
            Retrotransposons and DNA transposons legitimately contain their own coding genes
            (gag/pol, transposase) and are annotated over them.
          </p>
        </div>

        <div className="info-section">
          <h2>Naming</h2>
          <ul>
            <li>
              <strong>Systematic name</strong>: <code>&lt;PREFIX&gt;_RPT_NNNN</code> per species
              (e.g. <code>CTRG_RPT_0001</code>, <code>Cd36_RPT_0001</code>,{' '}
              <code>CAGL_RPT_0001</code>, <code>CPAR2_RPT_0001</code>,{' '}
              <code>B9J08_RPT_0001</code>). <em>C. albicans</em> copies are haplotype-paired{' '}
              <code>CALB_RPT_NNNN_A/_B</code> alleles.
            </li>
            <li>
              <strong>Display name</strong>: classified families carry species-tagged
              Wicker-style family identifiers (e.g. <code>CtRLG1</code> = the first{' '}
              <em>C. tropicalis</em> Gypsy family), with copy numbers (<code>CtRLG1-2</code>).
              {' '}<em>C. dubliniensis</em> elements identified by homology instead inherit their{' '}
              <em>C. albicans</em> family name (e.g. <code>TCA3</code>, <code>iota</code>,{' '}
              <code>ZORRO3</code>).
            </li>
            <li>
              <strong>Description</strong>: each feature&rsquo;s description records the
              RepeatModeler family, its classification, and percent divergence from the family
              consensus.
            </li>
          </ul>
        </div>

        <div className="info-section">
          <h2>Where to find them</h2>
          <ul>
            <li>
              <strong>Genome Snapshot</strong>: per-species counts appear in each{' '}
              <Link to="/genome-snapshot/C_albicans_SC5314">Genome Inventory</Link> under
              Retrotransposon, Long_terminal_repeat, DNA_transposon, and Repeat_region.
            </li>
            <li>
              <strong>Search</strong>: features are indexed by systematic name and family/display
              name (e.g. searching <code>CaRLX1</code> returns all copies of that family).
            </li>
            <li>
              <strong>Gene pages</strong>: each feature has a standard locus page with type,
              coordinates, sequence, and provenance. Expression data are intentionally not shown
              for repeat features, since short-read coverage over repeats is dominated by
              multi-mapping reads.
            </li>
            <li>
              <strong>Downloads and BLAST</strong>: the features are included in the
              &ldquo;other features&rdquo; sequence downloads and BLAST datasets.
            </li>
          </ul>
        </div>

        <div className="info-note">
          <h3>Caveats</h3>
          <p>
            These features are <strong>computational predictions</strong> reviewed at the family
            level; individual copy boundaries come from RepeatMasker alignments and may be
            refined by future curation. Coverage is deliberately high-confidence rather than
            exhaustive: families below the copy/size floor, low-complexity sequence, and
            candidate copies overlapping protein-coding genes (outside the documented megasatellite
            and transposon cases) were not loaded. Protein-coding gene sequences and coordinates
            were not changed by this work.
          </p>
        </div>

        <div className="info-section">
          <p>
            <Link to="/help">&larr; Back to Help</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RepeatTEHelp;
