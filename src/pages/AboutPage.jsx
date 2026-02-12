import React from 'react';
import { Link } from 'react-router-dom';
import './InfoPages.css';

function AboutPage() {
  return (
    <div className="info-page">
      <div className="info-page-content">
        <h1>About CGD</h1>
        <hr />

        <section className="info-section">
          <p>
            The <em>Candida</em> HELLO Genome Database (CGD) provides online access to genomic sequence
            data and manually curated functional information about genes and proteins of the human
            pathogen <em>Candida albicans</em> and related species.
          </p>
          <p>
            <em>C. albicans</em> is the best studied of the human fungal pathogens. It is a common
            commensal organism of healthy individuals, but can cause debilitating mucosal infections
            and life-threatening systemic infections, especially in immunocompromised patients.
            <em>C. albicans</em> also serves as a model organism for the study of other fungal pathogens.
          </p>
          <p>
            The <em>Candida</em> Genome Database (CGD<sup>TM</sup>) project is funded by the{' '}
            <a href="http://www.nidcr.nih.gov/" target="_blank" rel="noopener noreferrer">
              National Institute of Dental &amp; Craniofacial Research
            </a>{' '}
            at the{' '}
            <a href="http://www.nih.gov/" target="_blank" rel="noopener noreferrer">
              US National Institutes of Health
            </a>
            . The CGD<sup>TM</sup> is in the{' '}
            <a href="http://genetics.stanford.edu/" target="_blank" rel="noopener noreferrer">
              Department of Genetics
            </a>{' '}
            at the{' '}
            <a href="http://www.med.stanford.edu/" target="_blank" rel="noopener noreferrer">
              School of Medicine
            </a>
            ,{' '}
            <a href="http://www.stanford.edu/" target="_blank" rel="noopener noreferrer">
              Stanford University
            </a>
            . The trademark on CGD<sup>TM</sup> is held by The Board of Trustees, Leland Stanford
            Junior University.
          </p>
        </section>

        <section className="info-section">
          <h2>
            <Link to="/help/getting-started">Getting Started with CGD</Link>
          </h2>
          <p>Information for someone new to CGD</p>
        </section>

        <section className="info-section">
          <h2>Genome Snapshot</h2>
          <p>Daily inventory of genomic features and summary of GO annotations:</p>
          <ul>
            <li>
              <Link to="/genome-snapshot/C_albicans_SC5314">
                <em>C. albicans</em> SC5314
              </Link>
            </li>
            <li>
              <Link to="/genome-snapshot/C_auris_B8441">
                <em>C. auris</em> B8441
              </Link>
            </li>
            <li>
              <Link to="/genome-snapshot/C_dubliniensis_CD36">
                <em>C. dubliniensis</em> CD36
              </Link>
            </li>
            <li>
              <Link to="/genome-snapshot/C_glabrata_CBS138">
                <em>C. glabrata</em> CBS138
              </Link>
            </li>
            <li>
              <Link to="/genome-snapshot/C_parapsilosis_CDC317">
                <em>C. parapsilosis</em> CDC317
              </Link>
            </li>
          </ul>
        </section>

        <section className="info-section">
          <h2>
            <Link to="/help/sequence">Sequence Documentation</Link>
          </h2>
          <p>
            Detailed information about the sequence data in CGD, including the sources from which
            sequence-based information are derived, and a history of the reference strain genome
            assemblies.
          </p>
        </section>

        <section className="info-section">
          <h2>
            <Link to="/">What's New in CGD</Link>
          </h2>
          <p>Changes and additions to CGD services</p>
        </section>

        <section className="info-section">
          <h2>
            <Link to="/how-to-cite">Citing CGD</Link>
          </h2>
          <p>How to cite CGD in publications</p>
        </section>

        <section className="info-section">
          <h2>
            <Link to="/staff">Staff</Link>
          </h2>
          <p>CGD Staff Members</p>
        </section>

        <section className="info-note">
          <p>
            <strong>Note:</strong> CGD staff are not physicians and cannot give medical advice.
            Information about pathogenic yeast infections such as candidiasis can be found online in
            the{' '}
            <a
              href="http://www.ncbi.nlm.nih.gov/entrez/query.fcgi"
              target="_blank"
              rel="noopener noreferrer"
            >
              PubMed
            </a>{' '}
            database or at the{' '}
            <a
              href="http://www.nlm.nih.gov/medlineplus/candidiasis.html"
              target="_blank"
              rel="noopener noreferrer"
            >
              Candidiasis information
            </a>{' '}
            page at Medline Plus.
          </p>
        </section>
      </div>
    </div>
  );
}

export default AboutPage;
