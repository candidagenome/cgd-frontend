import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import batchDownloadApi from '../api/batchDownloadApi';
import './BatchDownloadPage.css';

// Data type display info
const DATA_TYPE_INFO = {
  genomic: {
    name: 'Genomic DNA',
    description: 'DNA sequence of each feature, including introns (FASTA)',
  },
  genomic_flanking: {
    name: 'Genomic DNA + Flanking',
    description: 'Genomic DNA plus upstream/downstream flanking sequence (FASTA)',
  },
  coding: {
    name: 'Coding Sequence',
    description: 'Coding sequence / CDS - exons only (FASTA)',
  },
  protein: {
    name: 'Protein Sequence',
    description: 'Translation of the coding sequence (FASTA)',
  },
  coords: {
    name: 'Chromosomal Coordinates',
    description: 'Feature coordinates and basic information (TSV)',
  },
  go: {
    name: 'GO Annotations',
    description: 'Gene Ontology annotations (GAF 2.2 format)',
  },
  phenotype: {
    name: 'Phenotypes',
    description: 'Phenotype annotations (TSV)',
  },
  ortholog: {
    name: 'Orthologs',
    description: 'Ortholog and best hit data (TSV)',
  },
};

function BatchDownloadPage() {
  // Input method
  const [inputMethod, setInputMethod] = useState('text'); // 'text' or 'file'

  // Form state
  const [geneText, setGeneText] = useState('');
  const [geneFile, setGeneFile] = useState(null);
  const [selectedTypes, setSelectedTypes] = useState(['genomic']);
  const [flankLeft, setFlankLeft] = useState('');
  const [flankRight, setFlankRight] = useState('');
  const [compress, setCompress] = useState(true);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [metadata, setMetadata] = useState(null);

  // Parse gene list from text
  const parseGenes = (text) => {
    return text
      .split(/[\n,]+/)
      .map((g) => g.trim())
      .filter((g) => g.length > 0);
  };

  // Get current gene list
  const getGeneList = () => {
    return parseGenes(geneText);
  };

  // Handle data type selection
  const handleTypeChange = (type) => {
    setSelectedTypes((prev) => {
      if (prev.includes(type)) {
        return prev.filter((t) => t !== type);
      } else {
        return [...prev, type];
      }
    });
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setGeneFile(file);
      // Read file content to show preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setGeneText(event.target.result);
      };
      reader.readAsText(file);
    }
  };

  // Preview metadata
  const handlePreview = async () => {
    const genes = getGeneList();
    if (genes.length === 0) {
      setError('Please enter at least one gene name');
      return;
    }
    if (selectedTypes.length === 0) {
      setError('Please select at least one data type');
      return;
    }

    setLoading(true);
    setError(null);
    setMetadata(null);

    try {
      const result = await batchDownloadApi.getMetadata({
        genes,
        dataTypes: selectedTypes,
        flankLeft: flankLeft ? parseInt(flankLeft, 10) : 0,
        flankRight: flankRight ? parseInt(flankRight, 10) : 0,
        compress,
      });
      setMetadata(result);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to get preview');
    } finally {
      setLoading(false);
    }
  };

  // Handle download
  const handleDownload = async () => {
    const genes = getGeneList();
    if (genes.length === 0) {
      setError('Please enter at least one gene name');
      return;
    }
    if (selectedTypes.length === 0) {
      setError('Please select at least one data type');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await batchDownloadApi.download({
        genes,
        dataTypes: selectedTypes,
        flankLeft: flankLeft ? parseInt(flankLeft, 10) : 0,
        flankRight: flankRight ? parseInt(flankRight, 10) : 0,
        compress,
      });

      // Create download link
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'batch_download';
      if (contentDisposition) {
        const match = contentDisposition.match(/filename=(.+)/);
        if (match) {
          filename = match[1].replace(/"/g, '');
        }
      } else {
        // Determine filename from content type
        const contentType = response.headers['content-type'];
        if (contentType?.includes('zip')) {
          filename = 'batch_download.zip';
        } else if (contentType?.includes('gzip')) {
          filename = selectedTypes.length === 1
            ? `${selectedTypes[0]}.fasta.gz`
            : 'batch_download.gz';
        }
      }

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Download failed');
    } finally {
      setLoading(false);
    }
  };

  // Check if form is valid
  const isFormValid = () => {
    return getGeneList().length > 0 && selectedTypes.length > 0;
  };

  // Check for gene list passed from other pages (e.g., phenotype search)
  useEffect(() => {
    const passedGenes = sessionStorage.getItem('phenotypeSearchGeneList');
    if (passedGenes) {
      try {
        const geneList = JSON.parse(passedGenes);
        if (Array.isArray(geneList) && geneList.length > 0) {
          setGeneText(geneList.join('\n'));
        }
        // Clear after reading so it doesn't persist
        sessionStorage.removeItem('phenotypeSearchGeneList');
      } catch (e) {
        console.error('Failed to parse passed gene list:', e);
      }
    }
  }, []);

  // Check if flanking options should be shown
  const showFlankingOptions = selectedTypes.includes('genomic_flanking');

  return (
    <div className="batch-download-page">
      <div className="batch-download-content">
        <h1>Batch Download</h1>
        <hr />
        <p className="subtitle">
          Retrieve multiple types of data for a list of genes or features.{' '}
          <Link to="/help/batch-download">Help</Link>
        </p>

        <form onSubmit={(e) => e.preventDefault()}>
          {/* Step 1: Input */}
          <div className="form-section">
            <h3>1. Enter Gene/Feature Names</h3>

            <div className="input-method-tabs">
              <button
                type="button"
                className={`input-tab ${inputMethod === 'text' ? 'active' : ''}`}
                onClick={() => setInputMethod('text')}
              >
                Enter Names
              </button>
              <button
                type="button"
                className={`input-tab ${inputMethod === 'file' ? 'active' : ''}`}
                onClick={() => setInputMethod('file')}
              >
                Upload File
              </button>
            </div>

            {inputMethod === 'text' ? (
              <div className="form-group">
                <textarea
                  value={geneText}
                  onChange={(e) => setGeneText(e.target.value)}
                  placeholder="Enter gene names, one per line or comma-separated&#10;&#10;Examples:&#10;ACT1&#10;orf19.5007&#10;CAL0000191689"
                  rows={8}
                />
                <p className="help-text">
                  Enter Feature names (e.g., orf19.2203), Gene names (e.g., ACT1),
                  or CGDIDs (e.g., CAL0001571). One per line or comma-separated.
                </p>
              </div>
            ) : (
              <div className="form-group">
                <input
                  type="file"
                  accept=".txt,.csv,.tsv"
                  onChange={handleFileChange}
                  className="file-input"
                />
                <p className="help-text">
                  Upload a text file with one gene name per line.
                </p>
                {geneFile && (
                  <p className="file-info">
                    Selected: {geneFile.name} ({getGeneList().length} genes detected)
                  </p>
                )}
              </div>
            )}

            {geneText && (
              <p className="gene-count">
                {getGeneList().length} gene(s) entered
              </p>
            )}
          </div>

          {/* Step 2: Data Types */}
          <div className="form-section">
            <h3>2. Select Data Type(s)</h3>
            <p className="section-help">Select one or more data types to download.</p>

            <div className="data-types-grid">
              {Object.entries(DATA_TYPE_INFO).map(([type, info]) => (
                <label
                  key={type}
                  className={`data-type-option ${selectedTypes.includes(type) ? 'selected' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes(type)}
                    onChange={() => handleTypeChange(type)}
                  />
                  <div className="data-type-info">
                    <span className="data-type-name">{info.name}</span>
                    <span className="data-type-desc">{info.description}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Flanking Options (shown when genomic_flanking is selected) */}
          {showFlankingOptions && (
            <div className="form-section flanking-section">
              <h3>Flanking Sequence Options</h3>
              <div className="flanking-inputs">
                <div className="form-group">
                  <label htmlFor="flankLeft">Upstream (5') bp:</label>
                  <input
                    type="number"
                    id="flankLeft"
                    value={flankLeft}
                    onChange={(e) => setFlankLeft(e.target.value)}
                    placeholder="0"
                    min="0"
                    max="100000"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="flankRight">Downstream (3') bp:</label>
                  <input
                    type="number"
                    id="flankRight"
                    value={flankRight}
                    onChange={(e) => setFlankRight(e.target.value)}
                    placeholder="0"
                    min="0"
                    max="100000"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Options */}
          <div className="form-section options-section">
            <h3>3. Options</h3>
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="compress"
                checked={compress}
                onChange={(e) => setCompress(e.target.checked)}
              />
              <label htmlFor="compress">Compress output files (gzip)</label>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="submit-section">
            <button
              type="button"
              className="preview-button"
              onClick={handlePreview}
              disabled={!isFormValid() || loading}
            >
              Preview
            </button>
            <button
              type="button"
              className="download-button"
              onClick={handleDownload}
              disabled={!isFormValid() || loading}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Processing...
                </>
              ) : (
                'Download'
              )}
            </button>
          </div>
        </form>

        {/* Error Display */}
        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Metadata Preview */}
        {metadata && (
          <div className="metadata-preview">
            <h3>Preview</h3>
            <div className="metadata-summary">
              <p>
                <strong>Genes requested:</strong> {metadata.total_requested}
              </p>
              <p>
                <strong>Genes found:</strong> {metadata.total_found}
              </p>
            </div>

            {metadata.not_found && metadata.not_found.length > 0 && (
              <div className="not-found-warning">
                <strong>Not found ({metadata.not_found.length}):</strong>
                <ul>
                  {metadata.not_found.slice(0, 10).map((nf, i) => (
                    <li key={i}>{nf.query}</li>
                  ))}
                  {metadata.not_found.length > 10 && (
                    <li>... and {metadata.not_found.length - 10} more</li>
                  )}
                </ul>
              </div>
            )}

            {metadata.files && metadata.files.length > 0 && (
              <div className="files-preview">
                <strong>Files to be generated:</strong>
                <table className="files-table">
                  <thead>
                    <tr>
                      <th>Data Type</th>
                      <th>Filename</th>
                      <th>Records</th>
                      <th>Size</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metadata.files.map((file, i) => (
                      <tr key={i}>
                        <td>{DATA_TYPE_INFO[file.data_type]?.name || file.data_type}</td>
                        <td>{file.filename}</td>
                        <td>{file.record_count}</td>
                        <td>{(file.size / 1024).toFixed(1)} KB</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default BatchDownloadPage;
