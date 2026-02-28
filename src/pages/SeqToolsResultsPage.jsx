import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './SeqToolsResultsPage.css';

function SeqToolsResultsPage() {
  const [results, setResults] = useState(null);

  // Load results from localStorage
  useEffect(() => {
    const storedResults = localStorage.getItem('seqToolsResults');
    if (storedResults) {
      setResults(JSON.parse(storedResults));
    }
  }, []);

  // Render feature info card
  const renderFeatureInfo = () => {
    if (!results?.feature) return null;

    const { feature } = results;
    return (
      <div className="feature-info-card">
        <h3>Feature Information</h3>
        <div className="feature-info-grid">
          <div className="feature-info-item">
            <span className="label">Feature Name</span>
            <span className="value">
              <a href={`/locus/${feature.feature_name}`} target="gsr">
                {feature.feature_name}
              </a>
            </span>
          </div>
          {feature.gene_name && (
            <div className="feature-info-item">
              <span className="label">Gene Name</span>
              <span className="value">{feature.gene_name}</span>
            </div>
          )}
          <div className="feature-info-item">
            <span className="label">CGDID</span>
            <span className="value">{feature.dbxref_id}</span>
          </div>
          <div className="feature-info-item">
            <span className="label">Organism</span>
            <span className="value">{feature.organism}</span>
          </div>
          {feature.chromosome && (
            <div className="feature-info-item">
              <span className="label">Location</span>
              <span className="value">
                {feature.chromosome}:{feature.start}-{feature.end}
                {feature.strand &&
                  ` (${feature.strand === 'W' ? '+' : '-'})`}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render sequence info
  const renderSequenceInfo = () => {
    if (results?.input_type !== 'sequence' || !results?.sequence_length)
      return null;

    return (
      <div className="sequence-info">
        <p>
          <strong>Sequence Length:</strong> {results.sequence_length} residues
        </p>
      </div>
    );
  };

  // Render tool categories
  const renderToolCategories = () => {
    if (!results?.categories?.length) {
      return (
        <div className="no-results">
          <p>No tools available for this input.</p>
        </div>
      );
    }

    return (
      <div className="tool-categories">
        {results.categories.map((category, idx) => (
          <div key={idx} className="tool-category">
            <h3>{category.name}</h3>
            <div className="tool-list">
              {category.tools.map((tool, toolIdx) => (
                <a
                  key={toolIdx}
                  href={tool.url}
                  className="tool-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="tool-name">
                    {tool.name}
                    {tool.external && (
                      <span className="external-icon">&#8599;</span>
                    )}
                  </span>
                  {tool.description && (
                    <span className="tool-description">{tool.description}</span>
                  )}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (!results) {
    return (
      <div className="seq-tools-results-page">
        <div className="results-content">
          <h1>Gene/Sequence Resources</h1>
          <hr />
          <div className="loading">Loading results...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="seq-tools-results-page">
      <div className="results-content">
        <h1>Gene/Sequence Resources</h1>
        <hr />

        {/* Action buttons */}
        <div className="action-buttons">
          <Link to="/seq-tools" className="action-btn">
            New Search
          </Link>
        </div>

        {/* Results */}
        <div className="results-section">
          <h2>Available Tools</h2>
          {renderFeatureInfo()}
          {renderSequenceInfo()}
          {renderToolCategories()}
        </div>
      </div>
    </div>
  );
}

export default SeqToolsResultsPage;
