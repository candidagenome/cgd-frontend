import React from 'react';
import { Link } from 'react-router-dom';
import './InfoPages.css';

function LabsPage() {
  return (
    <div className="info-page">
      <div className="info-page-content">
        <h1><em>Candida</em> Laboratories</h1>
        <hr />

        <div className="placeholder-notice">
          <h3>Page Under Development</h3>
          <p>
            This page will display a directory of <em>Candida</em> research laboratories whose
            members have submitted colleague information to CGD.
          </p>
        </div>

        <section className="info-section">
          <h2>Planned Content</h2>
          <p>When complete, this page will include:</p>
          <ul>
            <li>
              <strong>Laboratory Directory</strong> - Alphabetical listing of Principal
              Investigators (PIs) working on <em>Candida</em> research
            </li>
            <li>
              <strong>Institution Information</strong> - Affiliated universities, research
              institutes, and organizations
            </li>
            <li>
              <strong>Contact Links</strong> - Links to lab websites and email contacts where
              available
            </li>
            <li>
              <strong>Research Focus</strong> - Brief descriptions of research areas for each lab
            </li>
          </ul>
        </section>

        <section className="info-section">
          <h2>Submit Your Lab Information</h2>
          <p>
            If you are a <em>Candida</em> researcher and would like to be included in this
            directory, you can submit your colleague information using the{' '}
            <a href="/cgi-bin/colleague/colleagueSearch">Colleague Submission Form</a>.
          </p>
        </section>

        <section className="info-section">
          <h2>Related Resources</h2>
          <ul>
            <li>
              <a href="/ComContents.shtml">Community Info</a> - Conferences, news, and community
              resources
            </li>
            <li>
              <a href="/JobPostings.shtml">Job Postings</a> - Employment opportunities in{' '}
              <em>Candida</em> research
            </li>
            <li>
              <a href="/Meetings.shtml">Conferences & Courses</a> - Upcoming meetings and
              educational opportunities
            </li>
          </ul>
        </section>

        <div className="placeholder-notice" style={{ marginTop: '30px' }}>
          <p>
            <strong>Note:</strong> For the current live version of this page, please visit the{' '}
            <a href="/cache/Labs.html">backend Labs directory</a>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default LabsPage;
