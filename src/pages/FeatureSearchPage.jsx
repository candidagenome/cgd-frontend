import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import featureSearchApi from '../api/featureSearchApi';
import './FeatureSearchPage.css';

function FeatureSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Config state
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [configError, setConfigError] = useState(null);

  // Form state
  const [organism, setOrganism] = useState(searchParams.get('organism') || '');
  const [featureTypes, setFeatureTypes] = useState([]);
  const [includeAllTypes, setIncludeAllTypes] = useState(false);
  const [qualifiers, setQualifiers] = useState([]);
  const [hasIntrons, setHasIntrons] = useState(null);
  const [chromosomes, setChromosomes] = useState([]);
  const [processGoids, setProcessGoids] = useState([]);
  const [functionGoids, setFunctionGoids] = useState([]);
  const [componentGoids, setComponentGoids] = useState([]);
  const [annotationMethods, setAnnotationMethods] = useState(['manually curated', 'high-throughput']);
  const [evidenceCodes, setEvidenceCodes] = useState([]);

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showAdvancedGO, setShowAdvancedGO] = useState(false);

  // Fetch config on mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const data = await featureSearchApi.getConfig();
        setConfig(data);

        // Set default organism if not already set
        if (!organism && data.organisms.length > 0) {
          setOrganism(data.organisms[0].organism_abbrev);
        }
      } catch (err) {
        console.error('Failed to fetch config:', err);
        setConfigError('Failed to load search configuration');
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  // Update URL params (debounced)
  const updateUrlParams = useCallback(() => {
    const params = new URLSearchParams();
    if (organism) params.set('organism', organism);
    setSearchParams(params, { replace: true });
  }, [organism, setSearchParams]);

  useEffect(() => {
    const timeoutId = setTimeout(updateUrlParams, 300);
    return () => clearTimeout(timeoutId);
  }, [updateUrlParams]);

  // Handle feature type toggle
  const toggleFeatureType = (type) => {
    if (type === 'all') {
      setIncludeAllTypes(!includeAllTypes);
      if (!includeAllTypes) {
        setFeatureTypes([]);
      }
    } else {
      setIncludeAllTypes(false);
      setFeatureTypes((prev) =>
        prev.includes(type)
          ? prev.filter((t) => t !== type)
          : [...prev, type]
      );
    }
  };

  // Handle qualifier toggle
  const toggleQualifier = (qual) => {
    setQualifiers((prev) =>
      prev.includes(qual)
        ? prev.filter((q) => q !== qual)
        : [...prev, qual]
    );
  };

  // Handle intron filter change
  const handleIntronChange = (value) => {
    if (value === 'yes') {
      setHasIntrons(hasIntrons === true ? null : true);
    } else if (value === 'no') {
      setHasIntrons(hasIntrons === false ? null : false);
    }
  };

  // Handle chromosome multi-select
  const handleChromosomeChange = (e) => {
    const selected = Array.from(e.target.selectedOptions, (option) => option.value);
    setChromosomes(selected.filter((s) => s !== 'All'));
  };

  // Handle GO term multi-select
  const handleGoTermChange = (setter) => (e) => {
    const selected = Array.from(e.target.selectedOptions, (option) => parseInt(option.value, 10));
    setter(selected.filter((s) => !isNaN(s)));
  };

  // Handle annotation method toggle
  const toggleAnnotationMethod = (method) => {
    setAnnotationMethods((prev) =>
      prev.includes(method)
        ? prev.filter((m) => m !== method)
        : [...prev, method]
    );
  };

  // Handle evidence code toggle
  const toggleEvidenceCode = (code) => {
    setEvidenceCodes((prev) =>
      prev.includes(code)
        ? prev.filter((c) => c !== code)
        : [...prev, code]
    );
  };

  // Select/unselect all evidence codes
  const selectAllEvidenceCodes = () => {
    setEvidenceCodes(config?.evidence_codes || []);
  };

  const unselectAllEvidenceCodes = () => {
    setEvidenceCodes([]);
  };

  // Clear all criteria
  const handleClearAll = () => {
    setFeatureTypes([]);
    setIncludeAllTypes(false);
    setQualifiers([]);
    setHasIntrons(null);
    setChromosomes([]);
    setProcessGoids([]);
    setFunctionGoids([]);
    setComponentGoids([]);
    setAnnotationMethods(['manually curated', 'high-throughput']);
    setEvidenceCodes([]);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate
    if (!organism) {
      setError('Please select an organism');
      return;
    }

    if (featureTypes.length === 0 && !includeAllTypes) {
      setError('Please select at least one feature type');
      return;
    }

    setSubmitting(true);

    try {
      const params = {
        organism,
        feature_types: featureTypes,
        include_all_types: includeAllTypes,
        qualifiers,
        has_introns: hasIntrons,
        chromosomes,
        process_goids: processGoids,
        function_goids: functionGoids,
        component_goids: componentGoids,
        additional_goids: [],
        annotation_methods: annotationMethods,
        evidence_codes: evidenceCodes,
        page: 1,
        page_size: 30,
        sort_by: 'orf',
      };

      // Store search params and navigate to results
      sessionStorage.setItem('featureSearchParams', JSON.stringify(params));
      navigate('/feature-search/results');
    } catch (err) {
      console.error('Search error:', err);
      setError(err.response?.data?.error || err.message || 'Search failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="feature-search-page">
        <div className="feature-search-content">
          <h1>Advanced Search</h1>
          <hr />
          <div className="loading-state">Loading configuration...</div>
        </div>
      </div>
    );
  }

  if (configError) {
    return (
      <div className="feature-search-page">
        <div className="feature-search-content">
          <h1>Advanced Search</h1>
          <hr />
          <div className="error-state">{configError}</div>
        </div>
      </div>
    );
  }

  // Get chromosomes for current organism
  const currentChromosomes = config?.chromosomes?.[organism] || [];

  return (
    <div className="feature-search-page">
      <div className="feature-search-content">
        <h1>Advanced Search</h1>
        <hr />
        <p className="subtitle">
          Search for chromosomal features based on multiple criteria
        </p>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Organism Selection */}
          <div className="form-section">
            <h3>
              Step 1: Select Strain{' '}
              <span className="required">(REQUIRED)</span>
            </h3>
            <div className="form-group">
              <select
                value={organism}
                onChange={(e) => setOrganism(e.target.value)}
              >
                {config?.organisms.map((org) => (
                  <option key={org.organism_abbrev} value={org.organism_abbrev}>
                    {org.organism_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Step 2: Feature Type Selection */}
          <div className="form-section">
            <h3>
              Step 2: Select Chromosomal Feature{' '}
              <span className="required">(REQUIRED)</span>
            </h3>
            <p className="help-text">Select one or more feature types</p>
            <div className="checkbox-grid">
              {config?.feature_types.map((type) => (
                <label key={type} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={featureTypes.includes(type)}
                    onChange={() => toggleFeatureType(type)}
                    disabled={includeAllTypes}
                  />
                  {type}
                </label>
              ))}
            </div>
            <label className="checkbox-label select-all">
              <input
                type="checkbox"
                checked={includeAllTypes}
                onChange={() => toggleFeatureType('all')}
              />
              Select all chromosomal features
            </label>
          </div>

          {/* Step 3: Narrow Results */}
          <div className="form-section">
            <h3>
              Step 3: Narrow Results{' '}
              <span className="optional">(OPTIONAL)</span>
            </h3>
            <p className="help-text">
              Select search criteria to return specific types of genes.
              Results will match all selected criteria.
            </p>

            {/* Annotation/Sequence Properties */}
            <div className="filter-subsection">
              <h4>Annotation/Sequence Properties</h4>

              {/* Feature Qualifiers */}
              <div className="filter-row">
                <label>Is a feature that is:</label>
                <div className="checkbox-list">
                  {config?.qualifiers.map((qual) => (
                    <label key={qual} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={qualifiers.includes(qual)}
                        onChange={() => toggleQualifier(qual)}
                      />
                      {qual}
                    </label>
                  ))}
                </div>
                <p className="hint">
                  Default search excludes Deleted features.
                </p>
              </div>

              {/* Introns */}
              <div className="filter-row">
                <label>Has introns:</label>
                <div className="radio-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={hasIntrons === true}
                      onChange={() => handleIntronChange('yes')}
                    />
                    Yes
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={hasIntrons === false}
                      onChange={() => handleIntronChange('no')}
                    />
                    No
                  </label>
                </div>
              </div>

              {/* Chromosome */}
              <div className="filter-row">
                <label>Located on chromosome:</label>
                <select
                  multiple
                  value={chromosomes}
                  onChange={handleChromosomeChange}
                  className="multi-select"
                >
                  <option value="All">All</option>
                  {currentChromosomes.map((chr) => (
                    <option key={chr} value={chr}>
                      {chr}
                    </option>
                  ))}
                </select>
                <p className="hint">
                  Hold Ctrl (PC) or Cmd (Mac) to select multiple.
                </p>
              </div>
            </div>

            {/* GO Annotation */}
            <div className="filter-subsection">
              <h4>Gene Ontology (GO) Annotation</h4>
              <p className="help-text">
                Is annotated to the following GO-Slim term(s):
              </p>

              <div className="go-selects">
                {/* Process Terms */}
                <div className="go-select-group">
                  <label>Biological Process:</label>
                  <select
                    multiple
                    value={processGoids.map(String)}
                    onChange={handleGoTermChange(setProcessGoids)}
                    className="multi-select go-select"
                  >
                    <option value="">None</option>
                    {config?.go_slim_terms.process.map((term) => (
                      <option key={term.goid} value={term.goid}>
                        {term.term}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Function Terms */}
                <div className="go-select-group">
                  <label>Molecular Function:</label>
                  <select
                    multiple
                    value={functionGoids.map(String)}
                    onChange={handleGoTermChange(setFunctionGoids)}
                    className="multi-select go-select"
                  >
                    <option value="">None</option>
                    {config?.go_slim_terms.function.map((term) => (
                      <option key={term.goid} value={term.goid}>
                        {term.term}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Component Terms */}
                <div className="go-select-group">
                  <label>Cellular Component:</label>
                  <select
                    multiple
                    value={componentGoids.map(String)}
                    onChange={handleGoTermChange(setComponentGoids)}
                    className="multi-select go-select"
                  >
                    <option value="">None</option>
                    {config?.go_slim_terms.component.map((term) => (
                      <option key={term.goid} value={term.goid}>
                        {term.term}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Advanced GO Options */}
              <button
                type="button"
                className="toggle-advanced"
                onClick={() => setShowAdvancedGO(!showAdvancedGO)}
              >
                {showAdvancedGO ? '▼' : '▶'} Advanced GO Options
              </button>

              {showAdvancedGO && (
                <div className="advanced-go-options">
                  {/* Annotation Methods */}
                  <div className="filter-row">
                    <label>Annotation Method:</label>
                    <div className="checkbox-list horizontal">
                      {config?.annotation_methods.map((method) => (
                        <label key={method} className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={annotationMethods.includes(method)}
                            onChange={() => toggleAnnotationMethod(method)}
                          />
                          {method}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Evidence Codes */}
                  <div className="filter-row">
                    <label>
                      Evidence Codes:{' '}
                      <span className="link-buttons">
                        (<button type="button" onClick={selectAllEvidenceCodes}>
                          Check all
                        </button>{' '}
                        /{' '}
                        <button type="button" onClick={unselectAllEvidenceCodes}>
                          Uncheck all
                        </button>)
                      </span>
                    </label>
                    <div className="checkbox-list horizontal evidence-codes">
                      {config?.evidence_codes.map((code) => (
                        <label key={code} className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={evidenceCodes.includes(code)}
                            onChange={() => toggleEvidenceCode(code)}
                          />
                          {code}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="submit-section">
            <button
              type="submit"
              className="submit-button"
              disabled={submitting}
            >
              {submitting ? 'Searching...' : 'Search'}
            </button>
            <button
              type="button"
              className="clear-button"
              onClick={handleClearAll}
            >
              Clear All
            </button>
          </div>
        </form>

        {/* Error Display */}
        {error && (
          <div className="error-state">
            <strong>Error</strong>
            <p>{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default FeatureSearchPage;
