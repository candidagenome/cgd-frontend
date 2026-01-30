import React from 'react';
import { Link } from 'react-router-dom';
import '../InfoPages.css';

function ColleagueUpdateHelp() {
  return (
    <div className="info-page">
      <div className="info-page-content">
        <h1>CGD Help: Colleague Submission/Update Search</h1>
        <hr />

        <div className="info-section">
          <h2>Contents</h2>
          <ul>
            <li><a href="#description">Description</a></li>
            <li><a href="#using">Using the Colleague Submission/Update Search</a></li>
            <li><a href="#viewing">Viewing the Results Table</a></li>
            <li><a href="#links">Other Relevant Links</a></li>
            <li><a href="#glossary">Associated Glossary Terms</a></li>
          </ul>
        </div>

        <hr />

        <div className="info-section">
          <h2 id="description">Description</h2>
          <p>
            <a href="/cgi-bin/colleague/colleagueSearch">The Colleague Submission/Update Search</a> page allows you to
            edit your existing colleague entry or create a new one in CGD.
          </p>
        </div>

        <div className="info-section">
          <h2 id="using">Using the Colleague Submission/Update Search</h2>
          <p>
            Enter your <strong>LAST</strong> name. If you think your name may be misspelled or are unsure of the
            spelling that CGD may have (eg. Smith vs. Smyth), you may want to use the{' '}
            <a
              href="http://www.yeastgenome.org/help/glossary.html#wildcardcharacter"
              target="_blank"
              rel="noopener noreferrer"
            >
              wildcard character (*)
            </a>{' '}
            in your search. To find both <span style={{ color: 'red' }}>Smith</span> and{' '}
            <span style={{ color: 'red' }}>Smyth</span>, enter <span style={{ color: 'red' }}>Sm*th</span>. This would
            retrieve all colleagues with last names that start with <span style={{ color: 'red' }}>Sm</span> and end in{' '}
            <span style={{ color: 'red' }}>th</span>.
          </p>
        </div>

        <div className="info-section">
          <h2 id="viewing">Viewing the Results Table</h2>
          <p>
            The program will present you with a <strong>Results Table</strong> that lists all the colleagues in CGD with
            the last name that you entered. Check the list for your name. If you are not sure whether one of the entries
            in the results table is yours, click on a likely name to check it; use the Back button on your browser to
            return to the Results table if it is not you.
          </p>

          <h4>Editing your existing entry</h4>
          <p>
            To edit your existing entry, click on your name in the Results Table to retrieve a Colleague Update Form
            filled out with your existing information. Edit the form and click <span style={{ color: 'red' }}>Submit</span>.
            After CGD curators process your form, it will be available on-line.
          </p>

          <h4>Adding a new entry</h4>
          <p>
            If you cannot find your name in CGD and would like to add yourself as a colleague, click on{' '}
            <a href="/cgi-bin/colleague/colleagueUpdate">Add New Colleague Form</a> at the bottom of the page. You will
            be presented with a blank form to provide your contact information. After CGD curators process your form,
            this information will be available on-line.
          </p>
        </div>

        <div className="info-section">
          <h2 id="links">Other Relevant Links</h2>
          <ul>
            <li>
              <Link to="/search">Colleague Search</Link>: search for colleagues that are listed in CGD.
            </li>
          </ul>
        </div>

        <div className="info-section">
          <h2 id="glossary">Associated Glossary Terms</h2>
          <ul>
            <li>
              <a
                href="http://www.yeastgenome.org/help/glossary.html#wildcardcharacter"
                target="_blank"
                rel="noopener noreferrer"
              >
                Wildcard character
              </a>
            </li>
          </ul>
        </div>

        <p>
          <strong>
            Go to <a href="/cgi-bin/colleague/colleagueSearch">Colleague Submission/Update</a>
          </strong>
        </p>
      </div>
    </div>
  );
}

export default ColleagueUpdateHelp;
