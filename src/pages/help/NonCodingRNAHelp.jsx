import React from 'react';
import { Link } from 'react-router-dom';
import '../InfoPages.css';

function NonCodingRNAHelp() {
  return (
    <div className="info-page">
      <div className="info-page-content">
        <h1>Non-coding RNA Gene Annotations</h1>
        <hr />

        <div className="info-section">
          <p>
            Historically, detailed non-coding RNA (ncRNA) gene annotation in CGD was largely
            limited to <em>Candida albicans</em>. In 2026, CGD expanded non-coding RNA gene
            annotation across the five species of <em>C. tropicalis</em>, <em>C. dubliniensis</em>,{' '}
            <em>C. glabrata</em>, <em>C. parapsilosis</em>, and <em>C. auris</em> by adding transfer
            RNAs (tRNA), ribosomal RNAs (rRNA), small nucleolar RNAs (snoRNA), small nuclear
            (spliceosomal) RNAs (snRNA), and other non-coding RNAs. These features now appear in
            their genome browsers, gene pages, and search results.
          </p>
        </div>

        <div className="info-section">
          <h2>What was added, by species</h2>
          <p>
            Counts reflect features newly added or, where noted, existing features whose type was
            corrected. All features are computationally predicted (see Caveats below).
          </p>
          <table className="sitemap-table">
            <thead>
              <tr>
                <th>Species</th>
                <th>tRNA</th>
                <th>rRNA</th>
                <th>Other ncRNA</th>
                <th>snoRNA</th>
                <th>snRNA</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><em>C. tropicalis</em></td>
                <td>185 reclassified + 5 new</td>
                <td>14 new</td>
                <td>8 new</td>
                <td>38 new</td>
                <td>5 new</td>
              </tr>
              <tr>
                <td><em>C. dubliniensis</em></td>
                <td>&mdash;</td>
                <td>5 new</td>
                <td>&mdash;</td>
                <td>33 new</td>
                <td>5 new</td>
              </tr>
              <tr>
                <td><em>C. glabrata</em></td>
                <td>&mdash;</td>
                <td>&mdash;</td>
                <td>&mdash;</td>
                <td>8 new + 48 reclassified</td>
                <td>5 reclassified</td>
              </tr>
              <tr>
                <td><em>C. parapsilosis</em></td>
                <td>&mdash;</td>
                <td>&mdash;</td>
                <td>&mdash;</td>
                <td>33 new</td>
                <td>4 new</td>
              </tr>
              <tr>
                <td><em>C. auris</em></td>
                <td>&mdash;</td>
                <td>&mdash;</td>
                <td>&mdash;</td>
                <td>27 new</td>
                <td>5 new</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="info-section">
          <h2>How the features were identified</h2>
          <p>
            Each RNA class was annotated with the standard, purpose-built tool for that class, run
            against the same genome assembly and coordinate system CGD already uses for each
            species, so that predicted coordinates map directly onto the existing gene models.
          </p>

          <h3>Transfer RNAs (tRNA)</h3>
          <p>
            Predicted with <strong>tRNAscan-SE 2.0.13</strong>. In <em>C. tropicalis</em>, 185
            tRNA genes were already present in the genome but had been imported with the generic
            type &ldquo;ORF&rdquo; (an artifact of the original Liftoff-based annotation, which
            typed every gene line as ORF). These were reclassified to tRNA and enriched with their
            decoded amino acid (isotype) and anticodon. A fresh tRNAscan-SE scan additionally
            identified 5 genuinely novel tRNAs, added as new features.
          </p>

          <h3>Ribosomal RNAs (rRNA)</h3>
          <p>
            The 18S, 5.8S, 25S/28S, and 5S ribosomal RNA genes were predicted with{' '}
            <strong>barrnap 0.9</strong> and added where they were previously absent: 14 in{' '}
            <em>C. tropicalis</em> and 5 in <em>C. dubliniensis</em>.
          </p>

          <h3>Other non-coding RNAs</h3>
          <p>
            For <em>C. tropicalis</em>, 8 further non-coding RNAs were added: 6{' '}
            <strong>internal transcribed spacers (ITS)</strong>, derived from the spacer regions
            within the ribosomal DNA repeat (between the newly annotated rRNA genes), plus{' '}
            <strong>RPR1</strong> (the RNA subunit of RNase P) and <strong>SCR1</strong> (the
            signal recognition particle RNA), identified by sequence homology
            (<strong>BLAST+ 2.17.0</strong>) to their characterized <em>C. albicans</em>
            {' '}counterparts. The telomerase RNA (TER1) was not annotated in this pass because it
            is too divergent to locate reliably by homology, and remains a candidate for future
            manual curation.
          </p>

          <h3>Small nucleolar and spliceosomal RNAs (snoRNA, snRNA)</h3>
          <p>
            snoRNAs (both C/D-box and H/ACA-box classes) and spliceosomal snRNAs (U1&ndash;U6)
            were identified by scanning each genome against the <strong>Rfam 15</strong> covariance
            model database using <strong>Infernal 1.1.5</strong> (<code>cmscan</code>) at the
            family-specific gathering score threshold (<code>--cut_ga</code>), which retains only
            high-confidence, curated-threshold hits. Family assignments (for example snR3, snR10,
            U2, U5) come directly from the matching Rfam family. Because the <em>Candida</em> U1
            snRNA is too divergent to be caught by Rfam, U1 was added separately by homology to the{' '}
            <em>C. albicans</em> U1 in the two species where the match was full-length and
            unambiguous (<em>C. tropicalis</em> and <em>C. dubliniensis</em>).
          </p>
          <p>
            For <em>C. glabrata</em>, most of these RNAs were already in the database but were
            typed as generic &ldquo;ncRNA&rdquo;; the scan was used to reclassify 53 of them to
            their correct type (snoRNA or snRNA) and Rfam family name, and to add 8 additional
            novel snoRNAs.
          </p>
        </div>

        <div className="info-section">
          <h2>Methods summary</h2>
          <table className="sitemap-table">
            <thead>
              <tr>
                <th>Feature class</th>
                <th>Tool</th>
                <th>Version</th>
                <th>Basis</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>tRNA</td>
                <td>tRNAscan-SE</td>
                <td>2.0.13</td>
                <td>covariance-model gene finding</td>
              </tr>
              <tr>
                <td>rRNA</td>
                <td>barrnap</td>
                <td>0.9</td>
                <td>HMM (nhmmer) prediction of rRNA subunits</td>
              </tr>
              <tr>
                <td>snoRNA / snRNA</td>
                <td>Infernal + Rfam</td>
                <td>Infernal 1.1.5, Rfam 15</td>
                <td>covariance-model scan, <code>--cut_ga</code> threshold</td>
              </tr>
              <tr>
                <td>ITS / RPR1 / SCR1 / U1</td>
                <td>BLAST+ (blastn)</td>
                <td>2.17.0</td>
                <td>homology to <em>C. albicans</em> + rDNA structure</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="info-section">
          <h2>Naming</h2>
          <ul>
            <li>
              <strong>Systematic name</strong>: a stable identifier following each species&rsquo;
              conventions.
            </li>
            <li>
              <strong>Standard / gene name</strong>: the biological family name where one exists
              &mdash; the Rfam family for snoRNAs/snRNAs (e.g. <code>snR10</code>, <code>U2</code>),
              the isotype&ndash;anticodon for tRNAs, and the standard name for characterized ncRNAs
              (<code>RPR1</code>, <code>SCR1</code>). Multi-copy families are distinguished with
              numeric suffixes (e.g. <code>snR43-1</code>, <code>snR43-2</code>).
            </li>
          </ul>
        </div>

        <div className="info-section">
          <h2>Where to find them</h2>
          <ul>
            <li>
              <strong>Genome browser</strong>: the new features appear in each species&rsquo; CGD
              gene-model track in <Link to="/help/jbrowse">JBrowse</Link>, browsable by position
              alongside protein-coding genes.
            </li>
            <li>
              <strong>Search</strong>: the features are indexed and retrievable by systematic name
              and by family/standard name.
            </li>
            <li>
              <strong>Gene pages</strong>: each feature has a standard <Link to="/help/locus">locus
              page</Link> with its type, coordinates, sequence, and provenance.
            </li>
          </ul>
        </div>

        <div className="info-note">
          <h3>Caveats</h3>
          <p>
            All of these features are <strong>computational predictions</strong>, marked as
            <em> Uncharacterized</em>; their systematic and family names are provisional and may
            change during curation. Coverage is intentionally high-confidence rather than
            exhaustive &mdash; for example, the snoRNA set reflects Rfam&rsquo;s curated core
            families and is smaller than the manually curated <em>C. albicans</em> set; low-
            confidence or highly divergent elements were deliberately not annotated. Protein-coding
            gene sequences and coordinates were not changed by this work.
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

export default NonCodingRNAHelp;
