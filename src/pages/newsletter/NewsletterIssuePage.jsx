import React, { useEffect } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { NEWSLETTER_ISSUES, getIssue } from './issues';
import '../InfoPages.css';
import './Newsletter.css';

function NewsletterIssuePage() {
  const { issueId } = useParams();
  const { hash } = useLocation();
  const issue = getIssue(issueId);

  // Jump to an article when arriving from an "In this issue" or archive link
  useEffect(() => {
    if (!hash) return;
    document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView();
  }, [hash, issueId]);

  if (!issue) {
    return (
      <div className="info-page newsletter-page">
        <div className="info-page-content">
          <h1>Newsletter issue not found</h1>
          <p>
            See the <Link to="/newsletter">CGD Newsletter archive</Link> for all issues.
          </p>
        </div>
      </div>
    );
  }

  const index = NEWSLETTER_ISSUES.indexOf(issue);
  const newer = NEWSLETTER_ISSUES[index - 1];
  const older = NEWSLETTER_ISSUES[index + 1];
  const { Component } = issue;

  return (
    <div className="info-page newsletter-page">
      <div className="info-page-content">
        <p className="newsletter-breadcrumb">
          <Link to="/newsletter">CGD Newsletter</Link>
        </p>
        <header className="newsletter-masthead">
          <p className="newsletter-masthead-name">CGD Newsletter</p>
          <h1>{issue.title}</h1>
        </header>

        <nav className="newsletter-contents" aria-label="In this issue">
          <h2>In this issue</h2>
          <ul>
            {issue.articles.map(article => (
              <li key={article.id}>
                <a href={`#${article.id}`}>{article.title}</a>
              </li>
            ))}
          </ul>
        </nav>

        <Component />

        <nav className="newsletter-pager" aria-label="Other issues">
          <span>{older && <Link to={`/newsletter/${older.id}`}>&larr; {older.title}</Link>}</span>
          <Link to="/newsletter">All issues</Link>
          <span>{newer && <Link to={`/newsletter/${newer.id}`}>{newer.title} &rarr;</Link>}</span>
        </nav>
      </div>
    </div>
  );
}

export default NewsletterIssuePage;
