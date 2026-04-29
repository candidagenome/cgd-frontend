import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import crisprApi from '../api/crisprApi';
import './CrisprSearchPage.css';

// PAM options with descriptions
const PAM_OPTIONS = [
  { value: 'NGG', label: 'NGG (SpCas9)', description: 'Most common, standard SpCas9' },
  { value: 'NAG', label: 'NAG (SpCas9)', description: 'Lower efficiency SpCas9 site' },
  { value: 'NNGRRT', label: 'NNGRRT (SaCas9)', description: 'Smaller Cas9 from S. aureus' },
  { value: 'TTTV', label: 'TTTV (Cas12a)', description: 'Cpf1/Cas12a system' },
];

// Target region options
const TARGET_REGIONS = [
  { value: '5_prime', label: "5' Region (Recommended)", description: 'First 20% of CDS - best for knockouts' },
  { value: '3_prime', label: "3' Region", description: 'Last 20% of CDS' },
  { value: 'full_cds', label: 'Full CDS', description: 'Entire coding sequence' },
];

// Available organisms (will be loaded from API)
const DEFAULT_ORGANISMS = [
  { tag: 'C_albicans_SC5314_A22', name: 'Candida albicans SC5314 Assembly 22' },
  { tag: 'C_auris_B8441', name: 'Candida auris B8441' },
  { tag: 'C_glabrata_CBS138', name: 'Candida glabrata CBS138' },
  { tag: 'C_dubliniensis_CD36', name: 'Candida dubliniensis CD36' },
  { tag: 'C_parapsilosis_CDC317', name: 'Candida parapsilosis CDC317' },
];

function CrisprSearchPage() {
  const navigate = useNavigate();

  // Form state
  const [inputType, setInputType] = useState('gene'); // 'gene' or 'sequence'
  const [geneName, setGeneName] = useState('');
  const [sequence, setSequence] = useState('');
  const [organism, setOrganism] = useState('C_albicans_SC5314_A22');
  const [pam, setPam] = useState('NGG');
  const [guideLength, setGuideLength] = useState(20);
  const [targetRegion, setTargetRegion] = useState('5_prime');
  const [maxGuides, setMaxGuides] = useState(20);
  const [checkOfftargets, setCheckOfftargets] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Config state (loaded from API)
  const [organisms, setOrganisms] = useState(DEFAULT_ORGANISMS);
  const [configLoaded, setConfigLoaded] = useState(false);

  // Gene preview state
  const [genePreview, setGenePreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load config on mount
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const config = await crisprApi.getConfig();
        if (config.organisms && config.organisms.length > 0) {
          setOrganisms(config.organisms);
        }
        setConfigLoaded(true);
      } catch (err) {
        console.error('Failed to load CRISPR config:', err);
        // Use defaults if config fails to load
        setConfigLoaded(true);
      }
    };
    loadConfig();
  }, []);

  // Load gene preview when gene name changes (debounced)
  useEffect(() => {
    if (inputType !== 'gene' || !geneName.trim()) {
      setGenePreview(null);
      setPreviewError(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setPreviewLoading(true);
      setPreviewError(null);
      try {
        const data = await crisprApi.getGene(geneName.trim(), organism);
        setGenePreview(data);
      } catch (err) {
        setPreviewError(err.response?.data?.detail || 'Gene not found');
        setGenePreview(null);
      } finally {
        setPreviewLoading(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [geneName, organism, inputType]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const params = {
        organism,
        pam,
        guide_length: guideLength,
        target_region: targetRegion,
        max_guides: maxGuides,
        check_offtargets: checkOfftargets,
      };

      if (inputType === 'gene') {
        if (!geneName.trim()) {
          setError('Please enter a gene name');
          setLoading(false);
          return;
        }
        params.gene_name = geneName.trim();
      } else {
        if (!sequence.trim()) {
          setError('Please enter a DNA sequence');
          setLoading(false);
          return;
        }
        params.sequence = sequence.trim();
      }

      const results = await crisprApi.design(params);

      if (!results.success) {
        setError(results.error || 'Design failed');
        setLoading(false);
        return;
      }

      // Store results in sessionStorage for results page
      sessionStorage.setItem('crisprResults', JSON.stringify(results));
      sessionStorage.setItem('crisprParams', JSON.stringify(params));

      // Navigate to results page
      navigate('/crispr/results');
    } catch (err) {
      console.error('CRISPR design error:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to design guides');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="crispr-search-page">
      <div className="crispr-content">
        <h1>CRISPR Guide RNA Designer</h1>
        <p className="subtitle">
          Design sgRNAs for Candida species with efficiency prediction and off-target analysis.
          {' '}
          <Link to="/help/crispr" className="help-link">
            About this tool
          </Link>
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-columns">
            {/* Left Column: Input */}
            <div className="form-column">
              {/* Input Section */}
              <div className="form-section">
                <div className="section-header">
                  <span className="section-number">1</span>
                  <h3>Target Input</h3>
                </div>

                {/* Input type toggle */}
                <div className="input-type-toggle">
                  <button
                    type="button"
                    className={`toggle-btn ${inputType === 'gene' ? 'active' : ''}`}
                    onClick={() => setInputType('gene')}
                  >
                    Gene Name
                  </button>
                  <button
                    type="button"
                    className={`toggle-btn ${inputType === 'sequence' ? 'active' : ''}`}
                    onClick={() => setInputType('sequence')}
                  >
                    DNA Sequence
                  </button>
                </div>

                {inputType === 'gene' ? (
                  <div className="form-group">
                    <label htmlFor="geneName">Gene Name</label>
                    <input
                      type="text"
                      id="geneName"
                      value={geneName}
                      onChange={(e) => setGeneName(e.target.value)}
                      placeholder="e.g., HOG1, EFG1, ALS3"
                    />
                    <p className="help-text">
                      Enter a standard gene name, systematic name, or CGD ID
                    </p>

                    {/* Gene Preview */}
                    {previewLoading && (
                      <div className="gene-preview loading">
                        Looking up gene...
                      </div>
                    )}
                    {previewError && (
                      <div className="gene-preview error">
                        {previewError}
                      </div>
                    )}
                    {genePreview && genePreview.gene_info && (
                      <div className="gene-preview success">
                        <div className="preview-name">
                          <strong>{genePreview.gene_info.gene_name || genePreview.gene_info.feature_name}</strong>
                          {genePreview.gene_info.gene_name && (
                            <span className="preview-systematic">({genePreview.gene_info.feature_name})</span>
                          )}
                        </div>
                        {genePreview.gene_info.description && (
                          <div className="preview-desc">{genePreview.gene_info.description}</div>
                        )}
                        <div className="preview-details">
                          <span>Length: {genePreview.sequence_length} bp</span>
                          {genePreview.gene_info.chromosome && (
                            <span>Chr: {genePreview.gene_info.chromosome}</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="form-group">
                    <label htmlFor="sequence">DNA Sequence</label>
                    <textarea
                      id="sequence"
                      value={sequence}
                      onChange={(e) => setSequence(e.target.value)}
                      placeholder="Paste DNA sequence here (FASTA format or raw sequence)"
                      rows={6}
                    />
                    <p className="help-text">
                      Paste genomic or coding DNA sequence (max 50kb)
                    </p>
                  </div>
                )}
              </div>

              {/* Target Region (only for gene input) */}
              {inputType === 'gene' && (
                <div className="form-section">
                  <div className="section-header">
                    <span className="section-number">2</span>
                    <h3>Target Region</h3>
                  </div>
                  <div className="target-region-list">
                    {TARGET_REGIONS.map((region) => (
                      <label key={region.value} className="target-region-item">
                        <input
                          type="radio"
                          name="targetRegion"
                          value={region.value}
                          checked={targetRegion === region.value}
                          onChange={(e) => setTargetRegion(e.target.value)}
                        />
                        <div className="region-info">
                          <span className="region-label">{region.label}</span>
                          <span className="region-desc">{region.description}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Options */}
            <div className="form-column">
              {/* Organism Selection */}
              <div className="form-section">
                <div className="section-header">
                  <span className="section-number">{inputType === 'gene' ? '3' : '2'}</span>
                  <h3>Organism</h3>
                </div>
                <div className="form-group">
                  <select
                    id="organism"
                    value={organism}
                    onChange={(e) => setOrganism(e.target.value)}
                  >
                    {organisms.map((org) => (
                      <option key={org.tag} value={org.tag}>
                        {org.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* CRISPR Settings */}
              <div className="form-section">
                <div className="section-header">
                  <span className="section-number">{inputType === 'gene' ? '4' : '3'}</span>
                  <h3>CRISPR Settings</h3>
                </div>

                <div className="form-group">
                  <label htmlFor="pam">PAM Sequence</label>
                  <select
                    id="pam"
                    value={pam}
                    onChange={(e) => setPam(e.target.value)}
                  >
                    {PAM_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <p className="help-text">
                    {PAM_OPTIONS.find(p => p.value === pam)?.description}
                  </p>
                </div>

                <div className="options-row">
                  <div className="form-group compact">
                    <label htmlFor="guideLength">Guide Length</label>
                    <select
                      id="guideLength"
                      value={guideLength}
                      onChange={(e) => setGuideLength(Number(e.target.value))}
                    >
                      {[17, 18, 19, 20, 21, 22, 23].map((len) => (
                        <option key={len} value={len}>
                          {len} bp{len === 20 ? ' (default)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group compact">
                    <label htmlFor="maxGuides">Max Guides</label>
                    <select
                      id="maxGuides"
                      value={maxGuides}
                      onChange={(e) => setMaxGuides(Number(e.target.value))}
                    >
                      {[10, 20, 50, 100].map((num) => (
                        <option key={num} value={num}>
                          {num}{num === 20 ? ' (default)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    id="checkOfftargets"
                    checked={checkOfftargets}
                    onChange={(e) => setCheckOfftargets(e.target.checked)}
                  />
                  <label htmlFor="checkOfftargets">Check off-targets</label>
                </div>

                {/* Advanced Options Toggle */}
                <button
                  type="button"
                  className="advanced-toggle"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                >
                  {showAdvanced ? 'Hide' : 'Show'} Advanced Options
                </button>

                {showAdvanced && (
                  <div className="advanced-options">
                    <div className="form-group compact">
                      <label htmlFor="maxMismatches">Max Off-target Mismatches</label>
                      <select id="maxMismatches" defaultValue="3">
                        {[1, 2, 3, 4, 5].map((num) => (
                          <option key={num} value={num}>
                            {num} mismatch{num > 1 ? 'es' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="error-state">
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Submit Button */}
          <div className="submit-section">
            <button
              type="submit"
              className="submit-button"
              disabled={loading || (inputType === 'gene' && !geneName.trim()) || (inputType === 'sequence' && !sequence.trim())}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Designing Guides...
                </>
              ) : (
                'Design Guides'
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default CrisprSearchPage;
