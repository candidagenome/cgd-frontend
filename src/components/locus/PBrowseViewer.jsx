import React, { useState } from 'react';
import './PBrowseViewer.css';

/**
 * PBrowse (Protein Browser) Viewer Component
 * Displays JBrowse viewer for protein domain visualization
 * Based on Perl implementation in DomainMotifPage.pm
 */
function PBrowseViewer({ url, featureName }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  if (!url) {
    return null;
  }

  const handleLoad = () => {
    setLoading(false);
  };

  const handleError = () => {
    setError('Failed to load domain viewer');
    setLoading(false);
  };

  return (
    <div className="pbrowse-wrapper">
      <div className="pbrowse-header">
        <h4>JBrowse for feature {featureName}</h4>
      </div>
      <div className="pbrowse-viewer-container">
        {loading && <div className="pbrowse-loading-overlay">Loading domain viewer...</div>}
        {error && <div className="pbrowse-error-overlay">{error}</div>}
        <iframe
          src={url}
          className="pbrowse-iframe"
          title={`Domain viewer for ${featureName}`}
          onLoad={handleLoad}
          onError={handleError}
        />
      </div>
    </div>
  );
}

export default PBrowseViewer;
