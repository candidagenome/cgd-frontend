import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import goSlimMapperApi from '../api/goSlimMapperApi';
import './GoSlimMapperSearchPage.css';

function GoSlimMapperSearchPage() {
  const [loading, setLoading] = useState(false);
  const [configLoading, setConfigLoading] = useState(true);
  const [termsLoading, setTermsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Configuration
  const [config, setConfig] = useState(null);

  // Available terms for selected set/aspect
  const [availableTerms, setAvailableTerms] = useState([]);

  // Form state - initialize from localStorage if available
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('goSlimMapperFormData');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Ignore parse errors
      }
    }
    return {
      genes: '',
      organism_no: '',
      go_set_name: '',
      go_aspect: '',
      selected_terms: [], // Empty = all terms
      annotation_types: ['manually_curated', 'high_throughput', 'computational'],
    };
  });

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('goSlimMapperFormData', JSON.stringify(formData));
  }, [formData]);

  // Load config on mount
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const data = await goSlimMapperApi.getConfig();
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

  // Check for gene list passed from other pages (e.g., phenotype search)
  useEffect(() => {
    const passedGenes = sessionStorage.getItem('phenotypeSearchGeneList');
    if (passedGenes) {
      try {
        const geneList = JSON.parse(passedGenes);
        if (Array.isArray(geneList) && geneList.length > 0) {
          setFormData((prev) => ({
            ...prev,
            genes: geneList.join('\n'),
          }));
        }
        // Clear after reading so it doesn't persist
        sessionStorage.removeItem('phenotypeSearchGeneList');
      } catch (e) {
        console.error('Failed to parse passed gene list:', e);
      }
    }
  }, []);

  // Load terms when set/aspect changes
  useEffect(() => {
    const loadTerms = async () => {
      if (!formData.go_set_name || !formData.go_aspect) {
        setAvailableTerms([]);
        return;
      }

      setTermsLoading(true);
      try {
        const data = await goSlimMapperApi.getSlimTerms(
          formData.go_set_name,
          formData.go_aspect
        );
        setAvailableTerms(data.terms || []);
        // Clear selected terms when set/aspect changes
        setFormData((prev) => ({ ...prev, selected_terms: [] }));
      } catch (err) {
        console.error('Failed to load terms:', err);
        setAvailableTerms([]);
      } finally {
        setTermsLoading(false);
      }
    };
    loadTerms();
  }, [formData.go_set_name, formData.go_aspect]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSetChange = (setName) => {
    // Find the set and its available aspects
    const selectedSet = config?.go_slim_sets?.find((s) => s.go_set_name === setName);
    const defaultAspect = selectedSet?.aspects?.[0] || '';

    setFormData((prev) => ({
      ...prev,
      go_set_name: setName,
      go_aspect: defaultAspect,
      selected_terms: [],
    }));
  };

  const handleAnnotationTypeToggle = (type) => {
    setFormData((prev) => {
      const types = prev.annotation_types.includes(type)
        ? prev.annotation_types.filter((t) => t !== type)
        : [...prev.annotation_types, type];
      return { ...prev, annotation_types: types };
    });
  };

  const handleTermToggle = (goid) => {
    setFormData((prev) => {
      const terms = prev.selected_terms.includes(goid)
        ? prev.selected_terms.filter((t) => t !== goid)
        : [...prev.selected_terms, goid];
      return { ...prev, selected_terms: terms };
    });
  };

  const handleSelectAllTerms = () => {
    const allTermIds = availableTerms.map((t) => t.goid);
    setFormData((prev) => ({ ...prev, selected_terms: allTermIds }));
  };

  const handleClearTerms = () => {
    setFormData((prev) => ({ ...prev, selected_terms: [] }));
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        handleInputChange('genes', e.target.result);
      };
      reader.readAsText(file);
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

      if (!formData.go_set_name) {
        throw new Error('Please select a GO Slim set');
      }

      if (!formData.go_aspect) {
        throw new Error('Please select a GO aspect');
      }

      // Build request
      const request = {
        genes: geneList,
        organism_no: parseInt(formData.organism_no, 10),
        go_set_name: formData.go_set_name,
        go_aspect: formData.go_aspect,
      };

      // Add selected terms if not all
      if (
        formData.selected_terms.length > 0 &&
        formData.selected_terms.length < availableTerms.length
      ) {
        request.selected_terms = formData.selected_terms;
      }

      // Add annotation types filter
      if (formData.annotation_types.length > 0 && formData.annotation_types.length < 3) {
        request.annotation_types = formData.annotation_types;
      }

      // Run analysis
      const result = await goSlimMapperApi.runAnalysis(request);

      // Store results and open in new tab
      localStorage.setItem('goSlimMapperResults', JSON.stringify(result));
      localStorage.setItem('goSlimMapperRequest', JSON.stringify(request));
      window.open('/go-slim-mapper/results', 'gsm_result');
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.response?.data?.detail || err.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  // Get available aspects for selected set
  const selectedSet = config?.go_slim_sets?.find((s) => s.go_set_name === formData.go_set_name);
  const availableAspects = selectedSet?.aspects || [];

  // Aspect display names
  const aspectNames = {
    P: 'Biological Process',
    F: 'Molecular Function',
    C: 'Cellular Component',
  };

  if (configLoading) {
    return (
      <div className="go-slim-mapper-search-page">
        <div className="go-slim-mapper-content">
          <h1>GO Slim Mapper</h1>
          <div className="loading">Loading configuration...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="go-slim-mapper-search-page">
      <div className="go-slim-mapper-content">
        <h1>GO Slim Mapper</h1>
        <hr />

        <p className="page-description">
          Map a list of genes to predefined GO Slim categories. The mapper shows which broader
          GO terms (slim terms) your genes are annotated to, either directly or through more
          specific child terms. <Link to="/help/go-slim">Help</Link>
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
                    onChange={handleFileUpload}
                  />
                  Upload File
                </label>
              </div>
            </div>
          </div>

          {/* Step 3: GO Slim Set Selection */}
          <div className="form-section inline-section">
            <h3>
              <span className="section-number">3</span>
              Select GO Slim Set
            </h3>
            <select
              id="go_set"
              value={formData.go_set_name}
              onChange={(e) => handleSetChange(e.target.value)}
              required
            >
              <option value="">-- Select --</option>
              {config?.go_slim_sets?.map((set) => (
                <option key={set.go_set_name} value={set.go_set_name}>
                  {set.go_set_name} ({set.aspects.join(', ')})
                </option>
              ))}
            </select>

            {formData.go_set_name && availableAspects.length > 0 && (
              <div className="aspect-options">
                {availableAspects.map((aspect) => (
                  <label key={aspect} className="radio-label">
                    <input
                      type="radio"
                      name="go_aspect"
                      value={aspect}
                      checked={formData.go_aspect === aspect}
                      onChange={(e) => handleInputChange('go_aspect', e.target.value)}
                    />
                    <span>{aspectNames[aspect] || aspect}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Step 4: GO Slim Term Selection */}
          {formData.go_set_name && formData.go_aspect && (
            <div className="form-section">
              <h3>
                <span className="section-number">4</span>
                Select GO Slim Terms
              </h3>

              <p className="filter-description">
                Select specific terms to include, or leave all unchecked to use all terms in the
                set.
              </p>

              {termsLoading ? (
                <div className="loading-inline">Loading terms...</div>
              ) : availableTerms.length > 0 ? (
                <>
                  <div className="term-selection-actions">
                    <button type="button" onClick={handleSelectAllTerms}>
                      Select All ({availableTerms.length})
                    </button>
                    <button type="button" onClick={handleClearTerms}>
                      Clear All
                    </button>
                    <span className="selected-count">
                      {formData.selected_terms.length > 0
                        ? `${formData.selected_terms.length} selected`
                        : 'All terms will be used'}
                    </span>
                  </div>

                  <div className="term-selection-list">
                    {availableTerms.map((term) => (
                      <label key={term.goid} className="checkbox-label term-label">
                        <input
                          type="checkbox"
                          checked={formData.selected_terms.includes(term.goid)}
                          onChange={() => handleTermToggle(term.goid)}
                        />
                        <span className="term-goid">{term.goid}</span>
                        <span className="term-name">{term.go_term}</span>
                      </label>
                    ))}
                  </div>
                </>
              ) : (
                <p className="no-terms">No terms found for this set and aspect.</p>
              )}
            </div>
          )}

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

          {/* Submit */}
          <div className="form-actions">
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Mapping...' : 'Map Genes to GO Slim'}
            </button>
            <button
              type="button"
              className="reset-btn"
              onClick={() => {
                setFormData({
                  genes: '',
                  organism_no: config?.organisms?.[0]?.organism_no || '',
                  go_set_name: '',
                  go_aspect: '',
                  selected_terms: [],
                  annotation_types: ['manually_curated', 'high_throughput', 'computational'],
                });
                setAvailableTerms([]);
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

export default GoSlimMapperSearchPage;
