import React from 'react';
import { Link } from 'react-router-dom';
import '../InfoPages.css';

function OrthologNameTransferHelp() {
  return (
    <div className="info-page">
      <div className="info-page-content">
        <h1>Ortholog-Based Gene Name Transfers</h1>
        <hr />

        <div className="info-section">
          <p>
            Most genes outside <em>Candida albicans</em> have historically carried only a
            systematic name (e.g. CAGL0I00484g, CTRG_04334), even when a well-characterized,
            named ortholog exists in another species. In 2026, CGD assigned standard gene names
            to nearly 9,900 such genes by transferring the conserved name from their orthologs.
            Every transferred name links back to a methods reference from the locus page, and
            the full gene list is available for download (see below).
          </p>
        </div>

        <div className="info-section">
          <h2>How names were transferred</h2>
          <p>
            Orthology relationships were drawn from the synteny-based pillars of the{' '}
            <a href="http://cgob3.ucd.ie/" target="_blank" rel="noopener noreferrer">
              Candida Gene Order Browser (CGOB)
            </a>{' '}
            and, for <em>Candida glabrata</em>, the{' '}
            <a href="http://ygob.ucd.ie/" target="_blank" rel="noopener noreferrer">
              Yeast Gene Order Browser (YGOB)
            </a>
            . A name was transferred to an unnamed gene only when it was conserved and
            unambiguous across the ortholog group:
          </p>
          <ul>
            <li>all named members of the ortholog group agree on the name;</li>
            <li>
              the name follows the <em>S. cerevisiae</em> standard name where an{' '}
              <em>S. cerevisiae</em> ortholog exists;
            </li>
            <li>
              the transferred name does not conflict with any existing standard name,
              systematic name, or alias in the target species;
            </li>
            <li>
              genes in expanded families with conflicting names (co-orthologs) were excluded
              and reviewed separately as curated gene family clusters.
            </li>
          </ul>
          <p>
            Candidate transfers were generated and checked computationally, then reviewed by
            CGD curators over several rounds before being applied. For <em>C. albicans</em>, a
            name assigned to an Assembly 22 feature was also assigned to the corresponding
            unnamed Assembly 21 feature.
          </p>
        </div>

        <div className="info-section">
          <h2>How transferred names are displayed</h2>
          <p>
            On locus pages, a transferred standard name carries a superscript citation linking
            to the methods reference,{' '}
            <em>
              CGD (2026) Conserved name transfer based on orthology, as determined by the
              Candida Gene Order Browser and the Yeast Gene Order Browser
            </em>
            . Names supported by direct experimental literature instead cite those papers. The
            original systematic name remains the primary identifier and is always shown
            alongside the standard name.
          </p>
        </div>

        <div className="info-section">
          <h2>Genes named, by species</h2>
          <table className="sitemap-table">
            <thead>
              <tr>
                <th>Species</th>
                <th>Genes named by transfer</th>
              </tr>
            </thead>
            <tbody>
              <tr><td><em>C. dubliniensis</em> CD36</td><td>2,175</td></tr>
              <tr><td><em>C. tropicalis</em> MYA-3404</td><td>2,061</td></tr>
              <tr><td><em>C. parapsilosis</em> CDC317</td><td>1,998</td></tr>
              <tr><td><em>C. auris</em> B8441</td><td>1,968</td></tr>
              <tr><td><em>C. glabrata</em> CBS138</td><td>1,502</td></tr>
              <tr><td><em>C. albicans</em> SC5314 (incl. Assembly 21 alleles)</td><td>176</td></tr>
            </tbody>
          </table>
        </div>

        <div className="info-section">
          <h2>Download the full gene list</h2>
          <p>
            The complete list of transferred names (species, systematic name, standard name,
            CGDID, and transfer date) is available from the{' '}
            <a href="/download/ortholog_name_transfers/">download site</a>, and is also linked
            from the methods reference page.
          </p>
        </div>

        <div className="info-section">
          <h2>Questions or corrections</h2>
          <p>
            Gene names remain community-governed: if you have evidence that a transferred name
            is incorrect for your gene of interest, or you wish to reserve a different name,
            please <Link to="/contact">contact the CGD curators</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default OrthologNameTransferHelp;
