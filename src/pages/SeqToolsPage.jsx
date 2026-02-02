import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import seqToolsApi from '../api/seqToolsApi';
import './SeqToolsPage.css';

const INPUT_TYPES = {
  GENE: 'gene',
  COORDINATES: 'coordinates',
  SEQUENCE: 'sequence',
};

function SeqToolsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize state from URL params
  const [inputType, setInputType] = useState(
    searchParams.get('type') || INPUT_TYPES.GENE
  );
  const [geneQuery, setGeneQuery] = useState(searchParams.get('query') || '');
  const [seqSource, setSeqSource] = useState(searchParams.get('source') || '');
  const [chromosome, setChromosome] = useState(searchParams.get('chr') || '');
  const [startCoord, setStartCoord] = useState(searchParams.get('start') || '');
  const [endCoord, setEndCoord] = useState(searchParams.get('end') || '');
  const [rawSequence, setRawSequence] = useState(searchParams.get('seq') || '');
  const [seqType, setSeqType] = useState(searchParams.get('seqType') || 'dna');
  const [flankLeft, setFlankLeft] = useState(
    parseInt(searchParams.get('flankl'), 10) || 0
  );
  const [flankRight, setFlankRight] = useState(
    parseInt(searchParams.get('flankr'), 10) || 0
  );
  const [reverseComplement, setReverseComplement] = useState(
    searchParams.get('rev') === 'true'
  );

  // Data state
  const [assemblies, setAssemblies] = useState([]);
  const [chromosomes, setChromosomes] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Update URL params when form state changes
  const updateUrlParams = useCallback(() => {
    const params = new URLSearchParams();

    params.set('type', inputType);

    if (inputType === INPUT_TYPES.GENE) {
      if (geneQuery) params.set('query', geneQuery);
      if (seqSource) params.set('source', seqSource);
    } else if (inputType === INPUT_TYPES.COORDINATES) {
      if (chromosome) params.set('chr', chromosome);
      if (startCoord) params.set('start', startCoord);
      if (endCoord) params.set('end', endCoord);
    } else if (inputType === INPUT_TYPES.SEQUENCE) {
      if (rawSequence) params.set('seq', rawSequence);
      if (seqType) params.set('seqType', seqType);
    }

    if (inputType !== INPUT_TYPES.SEQUENCE) {
      if (flankLeft > 0) params.set('flankl', flankLeft.toString());
      if (flankRight > 0) params.set('flankr', flankRight.toString());
      if (reverseComplement) params.set('rev', 'true');
    }

    setSearchParams(params, { replace: true });
  }, [
    inputType,
    geneQuery,
    seqSource,
    chromosome,
    startCoord,
    endCoord,
    rawSequence,
    seqType,
    flankLeft,
    flankRight,
    reverseComplement,
    setSearchParams,
  ]);

  // Update URL when form fields change (debounced effect)
  useEffect(() => {
    const timeoutId = setTimeout(updateUrlParams, 300);
    return () => clearTimeout(timeoutId);
  }, [updateUrlParams]);

  // Fetch assemblies on mount
  useEffect(() => {
    const fetchAssemblies = async () => {
      try {
        const data = await seqToolsApi.getAssemblies();
        setAssemblies(data.assemblies || []);
        // Set default if available and not already set from URL
        if (!seqSource) {
          const defaultAssembly = data.assemblies?.find((a) => a.is_default);
          if (defaultAssembly) {
            setSeqSource(defaultAssembly.name);
          }
        }
      } catch (err) {
        console.error('Failed to load assemblies:', err);
      }
    };
    fetchAssemblies();
  }, []);

  // Fetch chromosomes when assembly changes
  useEffect(() => {
    const fetchChromosomes = async () => {
      try {
        const data = await seqToolsApi.getChromosomes(seqSource);
        setChromosomes(data.chromosomes || []);
      } catch (err) {
        console.error('Failed to load chromosomes:', err);
      }
    };
    fetchChromosomes();
  }, [seqSource]);

  // Build request params based on input type
  const buildRequestParams = () => {
    const params = {
      flank_left: parseInt(flankLeft, 10) || 0,
      flank_right: parseInt(flankRight, 10) || 0,
      reverse_complement: reverseComplement,
    };

    switch (inputType) {
      case INPUT_TYPES.GENE:
        params.query = geneQuery.trim();
        if (seqSource) params.seq_source = seqSource;
        break;
      case INPUT_TYPES.COORDINATES:
        params.chromosome = chromosome;
        params.start = parseInt(startCoord, 10);
        params.end = parseInt(endCoord, 10);
        break;
      case INPUT_TYPES.SEQUENCE:
        params.sequence = rawSequence.trim();
        params.seq_type = seqType;
        break;
      default:
        break;
    }

    return params;
  };

  // Validate form
  const isFormValid = () => {
    switch (inputType) {
      case INPUT_TYPES.GENE:
        return geneQuery.trim().length > 0;
      case INPUT_TYPES.COORDINATES:
        return (
          chromosome &&
          startCoord &&
          endCoord &&
          parseInt(startCoord, 10) <= parseInt(endCoord, 10)
        );
      case INPUT_TYPES.SEQUENCE:
        return rawSequence.trim().length > 0;
      default:
        return false;
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) return;

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const params = buildRequestParams();
      const data = await seqToolsApi.resolve(params);
      setResults(data);
    } catch (err) {
      setError(
        err.response?.data?.detail || err.message || 'An error occurred'
      );
    } finally {
      setLoading(false);
    }
  };

  // Reset results when input type changes
  const handleInputTypeChange = (type) => {
    setInputType(type);
    setResults(null);
    setError(null);
  };

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
              <Link to={`/locus/${feature.feature_name}`}>
                {feature.feature_name}
              </Link>
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

  return (
    <div className="seq-tools-page">
      <div className="seq-tools-content">
        <h1>Gene/Sequence Resources</h1>
        <hr />
        <p className="subtitle">
          Retrieve, display, and analyze gene or sequence information
        </p>

        {/* Input Type Tabs */}
        <div className="input-type-tabs">
          <button
            className={`input-type-tab ${inputType === INPUT_TYPES.GENE ? 'active' : ''}`}
            onClick={() => handleInputTypeChange(INPUT_TYPES.GENE)}
          >
            Gene/ORF Name
          </button>
          <button
            className={`input-type-tab ${inputType === INPUT_TYPES.COORDINATES ? 'active' : ''}`}
            onClick={() => handleInputTypeChange(INPUT_TYPES.COORDINATES)}
          >
            Chromosomal Coordinates
          </button>
          <button
            className={`input-type-tab ${inputType === INPUT_TYPES.SEQUENCE ? 'active' : ''}`}
            onClick={() => handleInputTypeChange(INPUT_TYPES.SEQUENCE)}
          >
            Raw Sequence
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Gene/ORF Input */}
          {inputType === INPUT_TYPES.GENE && (
            <div className="form-section">
              <div className="form-group">
                <label htmlFor="geneQuery">Gene Name, ORF Name, or CGDID</label>
                <input
                  type="text"
                  id="geneQuery"
                  value={geneQuery}
                  onChange={(e) => setGeneQuery(e.target.value)}
                  placeholder="e.g., ACT1, orf19.5007, CAL0000191689"
                />
                <p className="help-text">
                  Enter a standard gene name, systematic ORF name, or CGD
                  identifier
                </p>
              </div>

              {assemblies.length > 0 && (
                <div className="form-group">
                  <label htmlFor="seqSource">Assembly</label>
                  <select
                    id="seqSource"
                    value={seqSource}
                    onChange={(e) => setSeqSource(e.target.value)}
                  >
                    <option value="">-- Select Assembly --</option>
                    {assemblies.map((assembly) => (
                      <option key={assembly.name} value={assembly.name}>
                        {assembly.display_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Coordinates Input */}
          {inputType === INPUT_TYPES.COORDINATES && (
            <div className="form-section">
              <div className="form-group">
                <label htmlFor="chromosome">Chromosome</label>
                <select
                  id="chromosome"
                  value={chromosome}
                  onChange={(e) => setChromosome(e.target.value)}
                >
                  <option value="">-- Select Chromosome --</option>
                  {chromosomes.map((chr) => (
                    <option key={chr.name} value={chr.name}>
                      {chr.display_name}
                      {chr.length && ` (${chr.length.toLocaleString()} bp)`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="startCoord">Start Position</label>
                  <input
                    type="number"
                    id="startCoord"
                    value={startCoord}
                    onChange={(e) => setStartCoord(e.target.value)}
                    min="1"
                    placeholder="e.g., 1000"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="endCoord">End Position</label>
                  <input
                    type="number"
                    id="endCoord"
                    value={endCoord}
                    onChange={(e) => setEndCoord(e.target.value)}
                    min="1"
                    placeholder="e.g., 2000"
                  />
                </div>
              </div>
              <p className="help-text">
                Coordinates are 1-based. End position must be greater than or
                equal to start.
              </p>
            </div>
          )}

          {/* Raw Sequence Input */}
          {inputType === INPUT_TYPES.SEQUENCE && (
            <div className="form-section">
              <div className="form-group">
                <label htmlFor="rawSequence">Paste Sequence</label>
                <textarea
                  id="rawSequence"
                  value={rawSequence}
                  onChange={(e) => setRawSequence(e.target.value)}
                  placeholder="Enter DNA or protein sequence (FASTA format accepted)"
                />
                <p className="help-text">
                  Enter raw sequence or paste in FASTA format. Non-sequence
                  characters will be ignored.
                </p>
              </div>

              <div className="form-group">
                <label htmlFor="seqType">Sequence Type</label>
                <select
                  id="seqType"
                  value={seqType}
                  onChange={(e) => setSeqType(e.target.value)}
                >
                  <option value="dna">DNA</option>
                  <option value="protein">Protein</option>
                </select>
              </div>
            </div>
          )}

          {/* Common Options */}
          {inputType !== INPUT_TYPES.SEQUENCE && (
            <div className="form-section">
              <h4 style={{ margin: '0 0 15px 0', color: '#333' }}>Options</h4>
              <div className="flanking-options">
                <div className="form-group">
                  <label htmlFor="flankLeft">Left Flanking (bp)</label>
                  <input
                    type="text"
                    id="flankLeft"
                    value={flankLeft}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setFlankLeft(parseInt(val, 10) || 0);
                    }}
                    placeholder="0"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="flankRight">Right Flanking (bp)</label>
                  <input
                    type="text"
                    id="flankRight"
                    value={flankRight}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setFlankRight(parseInt(val, 10) || 0);
                    }}
                    placeholder="0"
                  />
                </div>
                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    id="reverseComplement"
                    checked={reverseComplement}
                    onChange={(e) => setReverseComplement(e.target.checked)}
                  />
                  <label htmlFor="reverseComplement">Reverse Complement</label>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="submit-section">
            <button
              type="submit"
              className="submit-button"
              disabled={!isFormValid() || loading}
            >
              {loading ? 'Loading...' : 'Get Tools'}
            </button>
          </div>
        </form>

        {/* Error Display */}
        {error && (
          <div className="error-state">
            <strong>Error</strong>
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="loading-state">
            <span className="loading-spinner"></span>
            Loading tools...
          </div>
        )}

        {/* Results */}
        {results && !loading && (
          <div className="results-section">
            <h2>Available Tools</h2>
            {renderFeatureInfo()}
            {renderSequenceInfo()}
            {renderToolCategories()}
          </div>
        )}
      </div>
    </div>
  );
}

export default SeqToolsPage;
