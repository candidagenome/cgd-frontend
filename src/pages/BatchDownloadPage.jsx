import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/config';
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

// Organisms with locus data in CGD database
const ORGANISM_OPTIONS = [
  { id: '', name: 'All organisms' },
  { id: 'C_albicans_SC5314', name: 'C. albicans SC5314' },
  { id: 'C_dubliniensis_CD36', name: 'C. dubliniensis CD36' },
  { id: 'C_glabrata_CBS138', name: 'C. glabrata CBS138' },
  { id: 'C_parapsilosis_CDC317', name: 'C. parapsilosis CDC317' },
  { id: 'C_tropicalis_MYA-3404', name: 'C. tropicalis MYA-3404' },
];

function BatchDownloadPage() {
  // Input method
  const [inputMethod, setInputMethod] = useState('text'); // 'text', 'file', or 'region'

  // Form state
  const [geneText, setGeneText] = useState('');
  const [geneFile, setGeneFile] = useState(null);
  const [selectedOrganism, setSelectedOrganism] = useState('');
  const [selectedTypes, setSelectedTypes] = useState(['genomic']);
  const [flankLeft, setFlankLeft] = useState('');
  const [flankRight, setFlankRight] = useState('');
  const [compress, setCompress] = useState(true);

  // Chromosome region state
  const [chromosomeData, setChromosomeData] = useState(null);
  const [regionOrganism, setRegionOrganism] = useState('');
  const [selectedChromosome, setSelectedChromosome] = useState('');
  const [regionStart, setRegionStart] = useState('');
  const [regionEnd, setRegionEnd] = useState('');
  const [regionStrand, setRegionStrand] = useState('W');

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
    if (selectedTypes.length === 0) {
      setError('Please select at least one data type');
      return;
    }

    const region = getRegionData();
    const genes = inputMethod !== 'region' ? getGeneList() : [];

    if (inputMethod !== 'region' && genes.length === 0) {
      setError('Please enter at least one gene name');
      return;
    }
    if (inputMethod === 'region' && !region) {
      setError('Please specify a valid chromosome region');
      return;
    }

    setLoading(true);
    setError(null);
    setMetadata(null);

    try {
      const result = await batchDownloadApi.getMetadata({
        genes: genes.length > 0 ? genes : undefined,
        regions: region ? [region] : undefined,
        organism: inputMethod !== 'region' ? (selectedOrganism || undefined) : undefined,
        dataTypes: selectedTypes,
        flankLeft: flankLeft ? parseInt(flankLeft, 10) : 0,
        flankRight: flankRight ? parseInt(flankRight, 10) : 0,
        compress,
      });
      setMetadata(result);
    } catch (err) {
      console.error('Preview error:', err);
      console.error('Error response:', err.response);
      console.error('Error request:', err.request);
      const errorMsg = err.response?.data?.detail
        || err.response?.data?.message
        || err.message
        || 'Failed to get preview';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Handle download
  const handleDownload = async () => {
    if (selectedTypes.length === 0) {
      setError('Please select at least one data type');
      return;
    }

    const region = getRegionData();
    const genes = inputMethod !== 'region' ? getGeneList() : [];

    if (inputMethod !== 'region' && genes.length === 0) {
      setError('Please enter at least one gene name');
      return;
    }
    if (inputMethod === 'region' && !region) {
      setError('Please specify a valid chromosome region');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await batchDownloadApi.download({
        genes: genes.length > 0 ? genes : undefined,
        regions: region ? [region] : undefined,
        organism: inputMethod !== 'region' ? (selectedOrganism || undefined) : undefined,
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
      console.error('Download error:', err);
      console.error('Error response:', err.response);
      const errorMsg = err.response?.data?.detail
        || err.response?.data?.message
        || err.message
        || 'Download failed';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Check if form is valid
  const isFormValid = () => {
    if (selectedTypes.length === 0) return false;

    if (inputMethod === 'region') {
      return (
        selectedChromosome &&
        regionStart &&
        regionEnd &&
        parseInt(regionStart, 10) > 0 &&
        parseInt(regionEnd, 10) > 0 &&
        parseInt(regionStart, 10) <= parseInt(regionEnd, 10)
      );
    }

    return getGeneList().length > 0;
  };

  // Get region data for API call
  const getRegionData = () => {
    if (inputMethod !== 'region' || !selectedChromosome) return null;
    return {
      chromosome: selectedChromosome,
      start: parseInt(regionStart, 10),
      end: parseInt(regionEnd, 10),
      strand: regionStrand,
    };
  };

  // Fetch chromosome data when component mounts
  useEffect(() => {
    const fetchChromosomes = async () => {
      try {
        const response = await api.get('/api/chromosome');
        setChromosomeData(response.data);
      } catch (err) {
        console.error('Failed to fetch chromosomes:', err);
      }
    };
    fetchChromosomes();
  }, []);

  // Check for gene list passed from other pages (e.g., phenotype search)
  useEffect(() => {
    const passedGenes = localStorage.getItem('phenotypeSearchGeneList');
    if (passedGenes) {
      try {
        const geneList = JSON.parse(passedGenes);
        if (Array.isArray(geneList) && geneList.length > 0) {
          setGeneText(geneList.join('\n'));
        }
        // Clear after reading so it doesn't persist
        localStorage.removeItem('phenotypeSearchGeneList');
      } catch (e) {
        console.error('Failed to parse passed gene list:', e);
      }
    }
  }, []);

  // Get chromosomes for selected region organism
  const getChromosomesForOrganism = () => {
    if (!chromosomeData || !regionOrganism) return [];
    const org = chromosomeData.organisms?.find(
      (o) => o.organism_abbrev === regionOrganism
    );
    return org?.chromosomes || [];
  };

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
              <button
                type="button"
                className={`input-tab ${inputMethod === 'region' ? 'active' : ''}`}
                onClick={() => {
                  setInputMethod('region');
                  // Filter out data types not available for region input
                  setSelectedTypes((prev) => {
                    const filtered = prev.filter((t) => ['genomic', 'genomic_flanking'].includes(t));
                    // Default to genomic if nothing selected after filtering
                    return filtered.length > 0 ? filtered : ['genomic'];
                  });
                }}
              >
                Chromosome Region
              </button>
            </div>

            {inputMethod === 'text' && (
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
            )}

            {inputMethod === 'file' && (
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

            {inputMethod === 'region' && (
              <div className="region-input-section">
                <div className="region-row">
                  <div className="form-group">
                    <label htmlFor="regionOrganism">Organism/Strain:</label>
                    <select
                      id="regionOrganism"
                      value={regionOrganism}
                      onChange={(e) => {
                        setRegionOrganism(e.target.value);
                        setSelectedChromosome('');
                      }}
                    >
                      <option value="">Select organism...</option>
                      {chromosomeData?.organisms?.map((org) => (
                        <option key={org.organism_abbrev} value={org.organism_abbrev}>
                          {org.organism_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="selectedChromosome">Chromosome:</label>
                    <select
                      id="selectedChromosome"
                      value={selectedChromosome}
                      onChange={(e) => setSelectedChromosome(e.target.value)}
                      disabled={!regionOrganism}
                    >
                      <option value="">Select chromosome...</option>
                      {getChromosomesForOrganism().map((chr) => (
                        <option key={chr.feature_name} value={chr.feature_name}>
                          {chr.feature_name} {chr.length ? `(${(chr.length / 1000000).toFixed(2)} Mb)` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="region-row">
                  <div className="form-group">
                    <label htmlFor="regionStart">Start (bp):</label>
                    <input
                      type="number"
                      id="regionStart"
                      value={regionStart}
                      onChange={(e) => setRegionStart(e.target.value)}
                      placeholder="1"
                      min="1"
                      disabled={!selectedChromosome}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="regionEnd">End (bp):</label>
                    <input
                      type="number"
                      id="regionEnd"
                      value={regionEnd}
                      onChange={(e) => setRegionEnd(e.target.value)}
                      placeholder="10000"
                      min="1"
                      disabled={!selectedChromosome}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="regionStrand">Strand:</label>
                    <select
                      id="regionStrand"
                      value={regionStrand}
                      onChange={(e) => setRegionStrand(e.target.value)}
                      disabled={!selectedChromosome}
                    >
                      <option value="W">Watson (+)</option>
                      <option value="C">Crick (-)</option>
                    </select>
                  </div>
                </div>
                <p className="help-text">
                  Specify a chromosomal region to retrieve sequence data. Enter 1-based coordinates.
                </p>
              </div>
            )}

            {inputMethod !== 'region' && geneText && (
              <p className="gene-count">
                {getGeneList().length} gene(s) entered
              </p>
            )}

            {/* Organism Selection - only for gene-based input */}
            {inputMethod !== 'region' && (
              <div className="organism-selection">
                <label htmlFor="organism">Organism/Strain:</label>
                <select
                  id="organism"
                  value={selectedOrganism}
                  onChange={(e) => setSelectedOrganism(e.target.value)}
                >
                  {ORGANISM_OPTIONS.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
                <p className="help-text">
                  Filter results to a specific organism. Leave as "All organisms" to include all matches.
                </p>
              </div>
            )}
          </div>

          {/* Step 2: Data Types */}
          <div className="form-section">
            <h3>2. Select Data Type(s)</h3>
            <p className="section-help">
              Select one or more data types to download.
              {inputMethod === 'region' && (
                <span className="region-note"> (Only sequence data types are available for chromosome region input)</span>
              )}
            </p>

            <div className="data-types-grid">
              {Object.entries(DATA_TYPE_INFO).map(([type, info]) => {
                // For region input, only genomic and genomic_flanking are available
                const isDisabledForRegion = inputMethod === 'region' &&
                  !['genomic', 'genomic_flanking'].includes(type);

                return (
                <label
                  key={type}
                  className={`data-type-option ${selectedTypes.includes(type) ? 'selected' : ''} ${isDisabledForRegion ? 'disabled' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes(type)}
                    onChange={() => handleTypeChange(type)}
                    disabled={isDisabledForRegion}
                  />
                  <div className="data-type-info">
                    <span className="data-type-name">{info.name}</span>
                    <span className="data-type-desc">{info.description}</span>
                  </div>
                </label>
              );
              })}
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
                <strong>{inputMethod === 'region' ? 'Regions' : 'Genes'} requested:</strong> {metadata.total_requested}
              </p>
              <p>
                <strong>{inputMethod === 'region' ? 'Regions' : 'Genes'} found:</strong> {metadata.total_found}
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
