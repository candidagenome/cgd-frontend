import React from 'react';
import { Link } from 'react-router-dom';
import './InfoPages.css';

const SubmitDataPage = () => {
  const submissionOptions = [
    {
      title: 'Gene Registry Form',
      url: '/cgi-bin/registry/geneRegistry',
      description: 'Form to register a gene name'
    },
    {
      title: 'Gene Naming Guidelines',
      url: '/nomenclature',
      isReactRoute: true,
      description: 'Guidelines for registering a gene name'
    },
    {
      title: 'Colleague Submission/Update Form',
      url: '/cgi-bin/colleague/colleagueSearch',
      description: 'Add or update your information in CGD'
    },
    {
      title: 'Contact CGD',
      url: '/cgi-bin/suggestion',
      description: 'Send suggestions or questions to CGD'
    }
  ];

  return (
    <div className="info-page">
      <div className="info-page-content">
        <h1>Submit Data</h1>
        <hr />

        <div className="info-section">
          <h2>Submit data to CGD</h2>

          {submissionOptions.map((option, index) => (
            <div key={index} className="help-item">
              <h3>
                {option.isReactRoute ? (
                  <Link to={option.url}>{option.title}</Link>
                ) : (
                  <a href={option.url}>{option.title}</a>
                )}
              </h3>
              <p>{option.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubmitDataPage;
