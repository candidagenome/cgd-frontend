import React from 'react';
import { Link } from 'react-router-dom';
import { NEWSLETTER_ISSUES } from './issues';
import '../InfoPages.css';
import './Newsletter.css';

function NewsletterArchivePage() {
  return (
    <div className="info-page newsletter-page">
      <div className="info-page-content">
        <h1>CGD Newsletter</h1>
        <hr />

        <div className="info-section">
          <p>
            The goals of the CGD newsletter are to connect with the <em>Candida</em> community,
            inform researchers about new features in the database, and solicit input from you, our
            community members. Given that we strive to read most <em>Candida</em> reports, we will
            also offer "research spotlights" on intriguing new results.
          </p>
          <p>
            Please feel free to make suggestions for the newsletter and/or the research spotlight
            by <Link to="/contact">contacting us</Link>.
          </p>
        </div>

        <h2>Issues</h2>
        <ul className="newsletter-issue-list">
          {NEWSLETTER_ISSUES.map(issue => (
            <li key={issue.id} className="newsletter-issue-card">
              <Link to={`/newsletter/${issue.id}`} className="newsletter-issue-title">
                CGD Newsletter, {issue.title}
              </Link>
              <ul>
                {issue.articles.map(article => (
                  <li key={article.id}>
                    <Link to={`/newsletter/${issue.id}#${article.id}`}>{article.title}</Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default NewsletterArchivePage;
