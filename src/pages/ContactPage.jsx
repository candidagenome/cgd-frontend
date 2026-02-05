import React from 'react';
import { Link } from 'react-router-dom';
import './InfoPages.css';

function ContactPage() {
  return (
    <div className="info-page">
      <div className="info-page-content">
        <h1>CGD Suggestions and Questions</h1>
        <hr />

        <section className="info-section">
          <p>
            Please send questions and suggestions to the CGD curators at the following email address:
          </p>

          <div className="contact-email">
            <a href="mailto:candida-curator@lists.stanford.edu">
              candida-curator@lists.stanford.edu
            </a>
          </div>

          <p>
            We welcome feedback about the database content, suggestions for new features,
            error reports, and questions about <em>Candida</em> biology and genomics.
          </p>
        </section>

        <section className="info-section">
          <h2>Other Ways to Connect</h2>

          <div className="contact-options">
            <div className="contact-option">
              <h3>Gene Registry</h3>
              <p>
                To register a new gene name, please use the{' '}
                <a href="/gene-registry">Gene Registry Form</a>.
              </p>
            </div>

            <div className="contact-option">
              <h3>Colleague Information</h3>
              <p>
                To add or update your information in CGD, use the{' '}
                <a href="/colleague-update">Colleague Submission/Update Form</a>.
              </p>
            </div>

            <div className="contact-option">
              <h3>Follow CGD</h3>
              <p>
                Follow us on{' '}
                <a
                  href="http://www.facebook.com/pages/Candida-Genome-Database/173482099381649"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Facebook
                </a>{' '}
                for news and updates about CGD.
              </p>
            </div>
          </div>
        </section>

        <section className="info-section">
          <h2>Types of Feedback We Welcome</h2>
          <ul>
            <li>
              <strong>Data corrections:</strong> If you notice errors in gene annotations,
              sequences, or other data, please let us know.
            </li>
            <li>
              <strong>New data submissions:</strong> Share your research data including
              phenotypes, GO annotations, or other curated information.
            </li>
            <li>
              <strong>Feature requests:</strong> Suggestions for new tools or improvements
              to existing features.
            </li>
            <li>
              <strong>General questions:</strong> Questions about using CGD resources or
              about <em>Candida</em> genomics.
            </li>
            <li>
              <strong>Bug reports:</strong> If you encounter technical issues with the website.
            </li>
          </ul>
        </section>

        <section className="info-section">
          <h2>Related Resources</h2>
          <ul>
            <li>
              <Link to="/help">Help Resources</Link> - Documentation and guides for using CGD
            </li>
            <li>
              <Link to="/faq">FAQ</Link> - Frequently Asked Questions
            </li>
            <li>
              <Link to="/about">About CGD</Link> - Learn more about the Candida Genome Database
            </li>
            <li>
              <Link to="/staff">CGD Staff</Link> - Meet the team behind CGD
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}

export default ContactPage;
