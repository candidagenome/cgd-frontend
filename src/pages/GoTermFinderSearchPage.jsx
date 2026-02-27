import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import goTermFinderApi from '../api/goTermFinderApi';
import './GoTermFinderSearchPage.css';

function GoTermFinderSearchPage() {
  const [loading, setLoading] = useState(false);
  const [configLoading, setConfigLoading] = useState(true);
  const [error, setError] = useState(null);
  const [validationResult, setValidationResult] = useState(null);

  // Configuration
  const [config, setConfig] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    genes: '',
    organism_no: '',
    ontology: 'P',
    use_custom_background: false,
    background_genes: '',
    evidence_codes: [],
    annotation_types: ['manually_curated', 'high_throughput', 'computational'],
    p_value_cutoff: 0.01,
    correction_method: 'bh',
    min_genes_in_term: 1,
  });

  // Load config on mount
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const data = await goTermFinderApi.getConfig();
        setConfig(data);
        // Set default organism if available
        if (data.organisms && data.organisms.length > 0) {
          setFormData((prev) => ({
            ...prev,
            organism_no: data.organisms[0].organism_no,
          }));
        }
      } catch (err) {
        setError('Failed to load configuration');
        console.error(err);
      } finally {
        setConfigLoading(false);
      }
    };
    loadConfig();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear validation when genes change
    if (field === 'genes') {
      setValidationResult(null);
    }
  };

  const handleEvidenceCodeToggle = (code) => {
    setFormData((prev) => {
      const codes = prev.evidence_codes.includes(code)
        ? prev.evidence_codes.filter((c) => c !== code)
        : [...prev.evidence_codes, code];
      return { ...prev, evidence_codes: codes };
    });
  };

  const handleAnnotationTypeToggle = (type) => {
    setFormData((prev) => {
      const types = prev.annotation_types.includes(type)
        ? prev.annotation_types.filter((t) => t !== type)
        : [...prev.annotation_types, type];
      return { ...prev, annotation_types: types };
    });
  };

  const handleFileUpload = (field) => (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        handleInputChange(field, e.target.result);
      };
      reader.readAsText(file);
    }
  };

  const handleValidate = async () => {
    if (!formData.genes.trim() || !formData.organism_no) {
      setError('Please enter genes and select an organism');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const geneList = formData.genes
        .split(/[\s,;\n]+/)
        .map((g) => g.trim())
        .filter((g) => g);

      const result = await goTermFinderApi.validateGenes(geneList, formData.organism_no);
      setValidationResult(result);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Validation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Parse gene list
      const geneList = formData.genes
        .split(/[\s,;\n]+/)
        .map((g) => g.trim())
        .filter((g) => g);

      if (geneList.length === 0) {
        throw new Error('Please enter at least one gene');
      }

      if (!formData.organism_no) {
        throw new Error('Please select an organism');
      }

      // Build request
      const request = {
        genes: geneList,
        organism_no: parseInt(formData.organism_no, 10),
        ontology: formData.ontology,
        p_value_cutoff: parseFloat(formData.p_value_cutoff),
        correction_method: formData.correction_method,
        min_genes_in_term: parseInt(formData.min_genes_in_term, 10),
      };

      console.log('Submitting request:', request);

      // Add custom background if enabled
      if (formData.use_custom_background && formData.background_genes.trim()) {
        request.background_genes = formData.background_genes
          .split(/[\s,;\n]+/)
          .map((g) => g.trim())
          .filter((g) => g);
      }

      // Add evidence codes filter if not all selected
      if (formData.evidence_codes.length > 0 && config?.evidence_codes) {
        if (formData.evidence_codes.length < config.evidence_codes.length) {
          request.evidence_codes = formData.evidence_codes;
        }
      }

      // Add annotation types filter
      if (formData.annotation_types.length > 0 && formData.annotation_types.length < 3) {
        request.annotation_types = formData.annotation_types;
      }

      // Run analysis
      const result = await goTermFinderApi.runAnalysis(request);

      // Store results and open in new tab
      localStorage.setItem('goTermFinderResults', JSON.stringify(result));
      localStorage.setItem('goTermFinderRequest', JSON.stringify(request));
      window.open('/go-term-finder/results', 'gtf_result');
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.response?.data?.detail || err.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  if (configLoading) {
    return (
      <div className="go-term-finder-search-page">
        <div className="go-term-finder-content">
          <h1>GO Term Finder</h1>
          <div className="loading">Loading configuration...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="go-term-finder-search-page">
      <div className="go-term-finder-content">
        <h1>GO Term Finder</h1>
        <hr />

        <p className="page-description">
          Find statistically significant Gene Ontology (GO) terms associated with a list of genes.
          Uses the hypergeometric distribution to identify enriched terms, with optional multiple
          testing correction. <Link to="/help/go-term-finder">Help</Link>
        </p>

        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Step 1: Organism Selection */}
          <div className="form-section inline-section">
            <h3>
              <span className="section-number">1</span>
              Select Organism
            </h3>
            <select
              id="organism"
              value={formData.organism_no}
              onChange={(e) => handleInputChange('organism_no', e.target.value)}
              required
            >
              <option value="">-- Select --</option>
              {config?.organisms?.map((org) => (
                <option key={org.organism_no} value={org.organism_no}>
                  {org.display_name}
                </option>
              ))}
            </select>
          </div>

          {/* Step 2: Gene Input */}
          <div className="form-section">
            <h3>
              <span className="section-number">2</span>
              Enter Gene List
            </h3>

            <div className="gene-input-container">
              <label htmlFor="genes">
                Genes (one per line, or separated by spaces, commas, or semicolons):
              </label>
              <textarea
                id="genes"
                value={formData.genes}
                onChange={(e) => handleInputChange('genes', e.target.value)}
                placeholder="ACT1&#10;CDC28&#10;TUB1&#10;TUB2"
                rows={8}
                required
              />
              <div className="gene-input-actions">
                <span className="gene-count">
                  {formData.genes.trim()
                    ? `${formData.genes.split(/[\s,;\n]+/).filter((g) => g.trim()).length} genes`
                    : ''}
                </span>
                <label className="file-upload-label">
                  <input
                    type="file"
                    accept=".txt,.csv,.tsv"
                    onChange={handleFileUpload('genes')}
                  />
                  Upload File
                </label>
                <button
                  type="button"
                  className="validate-btn"
                  onClick={handleValidate}
                  disabled={loading || !formData.genes.trim() || !formData.organism_no}
                >
                  Validate Genes
                </button>
              </div>
            </div>

            {validationResult && (
              <div className="validation-result">
                <div className="validation-summary">
                  <span className="found">
                    {validationResult.total_found} found
                  </span>
                  <span className="with-go">
                    ({validationResult.total_with_go} with GO annotations)
                  </span>
                  {validationResult.not_found.length > 0 && (
                    <span className="not-found">
                      {validationResult.not_found.length} not found
                    </span>
                  )}
                </div>
                {validationResult.not_found.length > 0 && (
                  <div className="not-found-list">
                    <strong>Not found:</strong> {validationResult.not_found.join(', ')}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Step 3: Ontology Selection */}
          <div className="form-section inline-section">
            <h3>
              <span className="section-number">3</span>
              Ontology
            </h3>
            <div className="ontology-options">
              <label className="radio-label">
                <input
                  type="radio"
                  name="ontology"
                  value="P"
                  checked={formData.ontology === 'P'}
                  onChange={(e) => handleInputChange('ontology', e.target.value)}
                />
                <span>Biological Process</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="ontology"
                  value="F"
                  checked={formData.ontology === 'F'}
                  onChange={(e) => handleInputChange('ontology', e.target.value)}
                />
                <span>Molecular Function</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="ontology"
                  value="C"
                  checked={formData.ontology === 'C'}
                  onChange={(e) => handleInputChange('ontology', e.target.value)}
                />
                <span>Cellular Component</span>
              </label>
            </div>
          </div>

          {/* Step 4: Background Set */}
          <div className="form-section inline-section">
            <h3>
              <span className="section-number">4</span>
              Background
            </h3>
            <div className="background-options">
              <label className="radio-label">
                <input
                  type="radio"
                  name="background"
                  checked={!formData.use_custom_background}
                  onChange={() => handleInputChange('use_custom_background', false)}
                />
                <span>Default (all genes with GO)</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="background"
                  checked={formData.use_custom_background}
                  onChange={() => handleInputChange('use_custom_background', true)}
                />
                <span>Custom</span>
              </label>
            </div>
            {formData.use_custom_background && (
              <div className="custom-background">
                <label htmlFor="background_genes">Background genes:</label>
                <textarea
                  id="background_genes"
                  value={formData.background_genes}
                  onChange={(e) => handleInputChange('background_genes', e.target.value)}
                  placeholder="Enter background genes..."
                  rows={5}
                />
                <label className="file-upload-label">
                  <input
                    type="file"
                    accept=".txt,.csv,.tsv"
                    onChange={handleFileUpload('background_genes')}
                  />
                  Upload File
                </label>
              </div>
            )}
          </div>

          {/* Step 5: Annotation Type Filter */}
          <div className="form-section inline-section">
            <h3>
              <span className="section-number">5</span>
              Annotation Types
            </h3>
            <div className="annotation-type-options">
              {config?.annotation_types?.map((type) => (
                <label key={type.value} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.annotation_types.includes(type.value)}
                    onChange={() => handleAnnotationTypeToggle(type.value)}
                  />
                  <span>{type.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Step 6: Evidence Code Filter (collapsible) */}
          <div className="form-section collapsible">
            <details>
              <summary>
                <h3>
                  <span className="section-number">6</span>
                  Evidence Codes (Advanced)
                </h3>
              </summary>

              <p className="filter-description">
                Select specific evidence codes to include, or leave all unchecked to include all.
              </p>

              <div className="evidence-code-options">
                {config?.evidence_codes?.map((ec) => (
                  <label key={ec.code} className="checkbox-label" title={ec.description}>
                    <input
                      type="checkbox"
                      checked={formData.evidence_codes.includes(ec.code)}
                      onChange={() => handleEvidenceCodeToggle(ec.code)}
                    />
                    <span>{ec.code}</span>
                  </label>
                ))}
              </div>

              <div className="evidence-code-actions">
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      evidence_codes: config?.evidence_codes?.map((ec) => ec.code) || [],
                    }))
                  }
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, evidence_codes: [] }))}
                >
                  Clear All
                </button>
              </div>
            </details>
          </div>

          {/* Step 7: Statistical Parameters */}
          <div className="form-section inline-section">
            <h3>
              <span className="section-number">7</span>
              Statistics
            </h3>
            <div className="stat-params">
              <div className="form-row-inline">
                <label htmlFor="p_value_cutoff">P-value:</label>
                <select
                  id="p_value_cutoff"
                  value={formData.p_value_cutoff}
                  onChange={(e) => handleInputChange('p_value_cutoff', e.target.value)}
                >
                  <option value="0.001">0.001</option>
                  <option value="0.01">0.01</option>
                  <option value="0.05">0.05</option>
                  <option value="0.1">0.1</option>
                </select>
              </div>
              <div className="form-row-inline">
                <label htmlFor="correction_method">Correction:</label>
                <select
                  id="correction_method"
                  value={formData.correction_method}
                  onChange={(e) => handleInputChange('correction_method', e.target.value)}
                >
                  {config?.correction_methods?.map((method) => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-row-inline">
                <label htmlFor="min_genes">Min genes:</label>
                <input
                  type="number"
                  id="min_genes"
                  value={formData.min_genes_in_term}
                  onChange={(e) => handleInputChange('min_genes_in_term', e.target.value)}
                  min={1}
                  max={10}
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="form-actions">
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Analyzing...' : 'Find Enriched Terms'}
            </button>
            <button
              type="button"
              className="reset-btn"
              onClick={() => {
                setFormData({
                  genes: '',
                  organism_no: config?.organisms?.[0]?.organism_no || '',
                  ontology: 'P',
                  use_custom_background: false,
                  background_genes: '',
                  evidence_codes: [],
                  annotation_types: ['manually_curated', 'high_throughput', 'computational'],
                  p_value_cutoff: 0.01,
                  correction_method: 'bh',
                  min_genes_in_term: 1,
                });
                setValidationResult(null);
                setError(null);
              }}
            >
              Reset Form
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default GoTermFinderSearchPage;
