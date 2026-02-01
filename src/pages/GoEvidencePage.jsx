import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import goApi from '../api/goApi';
import './GoEvidencePage.css';

function GoEvidencePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await goApi.getEvidenceCodes();
        setData(result);
      } catch (err) {
        setError(err.response?.data?.detail || err.message || 'Failed to load evidence codes');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="go-evidence-page">
        <div className="loading-page">
          <div className="loading-spinner"></div>
          <p>Loading GO evidence codes...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="go-evidence-page">
        <div className="error-page">
          <div className="error-icon">&#9888;</div>
          <h1>Error Loading Evidence Codes</h1>
          <p className="error-message">{error}</p>
          <div className="error-actions">
            <Link to="/" className="btn-home">Return to Home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="go-evidence-page">
      <header className="page-header">
        <h1>Evidence Codes for the Gene Ontology (GO)</h1>
      </header>

      <div className="description-section">
        <p>
          This table presents the evidence codes used by the Gene Ontology
          <sup>TM</sup> Consortium, with examples of the types of experiments,
          data, or statements that are included by each code. The evidence code
          is linked with a specific GO annotation and literature reference to
          describe what type of evidence was present in that reference to make
          the annotation. Additional information about the GO Evidence Codes is
          available in documentation on the GO site, in{' '}
          <a
            href="http://geneontology.org/docs/guide-go-evidence-codes/"
            target="_blank"
            rel="noopener noreferrer"
          >
            GO Evidence Codes
          </a>.
        </p>
      </div>

      <div className="table-wrapper">
        <table className="evidence-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Definition</th>
              <th>Examples</th>
            </tr>
          </thead>
          <tbody>
            {data?.evidence_codes?.map((ec, idx) => (
              <tr key={ec.code} id={ec.code}>
                <td className="code-cell">
                  <strong>{ec.code}</strong>
                </td>
                <td className="definition-cell">
                  {ec.definition}
                </td>
                <td className="examples-cell">
                  {ec.examples && ec.examples.length > 0 ? (
                    <ul className="examples-list">
                      {ec.examples.map((example, exIdx) => (
                        <li key={exIdx}>{example}</li>
                      ))}
                    </ul>
                  ) : (
                    <span className="no-examples">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default GoEvidencePage;
