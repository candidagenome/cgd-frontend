import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import patmatchApi from '../api/patmatchApi';
import './PatmatchSearchPage.css';

function PatmatchSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Form state
  const [pattern, setPattern] = useState(searchParams.get('pattern') || '');
  const [patternType, setPatternType] = useState(searchParams.get('type') || 'dna');
  const [dataset, setDataset] = useState(searchParams.get('ds') || '');
  const [strand, setStrand] = useState(searchParams.get('strand') || 'both');
  const [maxMismatches, setMaxMismatches] = useState(
    parseInt(searchParams.get('mm'), 10) || 0
  );
  const [maxInsertions, setMaxInsertions] = useState(
    parseInt(searchParams.get('ins'), 10) || 0
  );
  const [maxDeletions, setMaxDeletions] = useState(
    parseInt(searchParams.get('del'), 10) || 0
  );
  const [maxResults, setMaxResults] = useState(
    parseInt(searchParams.get('max'), 10) || 100
  );
  const [showAdvanced, setShowAdvanced] = useState(false);

  // UI state
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allDatasets, setAllDatasets] = useState([]);

  // Fetch datasets from API on mount
  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        const config = await patmatchApi.getConfig();
        setAllDatasets(config.datasets || []);

        // Set default dataset if none selected
        if (!dataset && config.datasets?.length > 0) {
          // Find DNA dataset, preferring Assembly 22 (newest)
          const dnaDatasets = config.datasets.filter((ds) => ds.pattern_type === 'dna');
          // Prefer A22 dataset, fall back to first available
          const defaultDs = dnaDatasets.find((ds) => ds.display_name?.includes('A22'))
            || dnaDatasets[0];
          if (defaultDs) {
            setDataset(defaultDs.name);
          }
        }
      } catch (err) {
        console.error('Failed to fetch datasets:', err);
        setError('Failed to load datasets. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };
    fetchDatasets();
  }, [dataset]);

  // Group datasets by organism
  const datasetGroups = useMemo(() => {
    const dnaDatasets = allDatasets.filter((ds) => ds.pattern_type === 'dna');
    const proteinDatasets = allDatasets.filter((ds) => ds.pattern_type === 'protein');

    // Group by organism (extract from display_name)
    const groupByOrganism = (datasets) => {
      const groups = {};
      datasets.forEach((ds) => {
        // Extract organism from display_name (e.g., "C. albicans SC5314 A22 - Chromosomes/Contigs")
        const parts = ds.display_name.split(' - ');
        const organism = parts[0] || 'Other';
        if (!groups[organism]) {
          groups[organism] = [];
        }
        groups[organism].push(ds);
      });

      // Sort groups so newer assemblies appear first (A22 before A21/A19)
      // Extract assembly number from organism label (e.g., "C. albicans SC5314 A22" -> 22)
      const getAssemblyNumber = (label) => {
        const match = label.match(/A(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      };

      const sortedEntries = Object.entries(groups).sort((a, b) => {
        // Sort by assembly number descending (newer first)
        return getAssemblyNumber(b[0]) - getAssemblyNumber(a[0]);
      });

      return sortedEntries.map(([label, datasets]) => ({
        label,
        datasets,
      }));
    };

    return {
      dna: groupByOrganism(dnaDatasets),
      protein: groupByOrganism(proteinDatasets),
    };
  }, [allDatasets]);

  // Update dataset when pattern type changes
  useEffect(() => {
    if (allDatasets.length === 0) return;

    const currentDs = allDatasets.find((ds) => ds.name === dataset);
    if (currentDs && currentDs.pattern_type !== patternType) {
      // Need to switch to a dataset of the correct type, preferring A22
      const datasetsOfType = allDatasets.filter((ds) => ds.pattern_type === patternType);
      const newDs = datasetsOfType.find((ds) => ds.display_name?.includes('A22'))
        || datasetsOfType[0];
      if (newDs) {
        setDataset(newDs.name);
      }
    }
  }, [patternType, dataset, allDatasets]);

  // Update URL params
  const updateUrlParams = useCallback(() => {
    const params = new URLSearchParams();

    if (pattern) params.set('pattern', pattern);
    params.set('type', patternType);
    if (dataset) params.set('ds', dataset);
    if (patternType === 'dna') params.set('strand', strand);
    if (maxMismatches > 0) params.set('mm', maxMismatches.toString());
    if (maxInsertions > 0) params.set('ins', maxInsertions.toString());
    if (maxDeletions > 0) params.set('del', maxDeletions.toString());
    if (maxResults !== 100) params.set('max', maxResults.toString());

    setSearchParams(params, { replace: true });
  }, [
    pattern,
    patternType,
    dataset,
    strand,
    maxMismatches,
    maxInsertions,
    maxDeletions,
    maxResults,
    setSearchParams,
  ]);

  // Update URL when form changes
  useEffect(() => {
    const timeoutId = setTimeout(updateUrlParams, 300);
    return () => clearTimeout(timeoutId);
  }, [updateUrlParams]);

  // Build results URL
  const buildResultsUrl = () => {
    const params = new URLSearchParams();
    params.set('pattern', pattern.trim());
    params.set('type', patternType);
    params.set('ds', dataset);
    if (patternType === 'dna') params.set('strand', strand);
    if (maxMismatches > 0) params.set('mm', maxMismatches.toString());
    if (maxInsertions > 0) params.set('ins', maxInsertions.toString());
    if (maxDeletions > 0) params.set('del', maxDeletions.toString());
    if (maxResults !== 100) params.set('max', maxResults.toString());
    return `/patmatch/results?${params.toString()}`;
  };

  // Handle form submission - open results in new tab
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!pattern.trim()) {
      setError('Please enter a pattern to search for');
      return;
    }

    if (!dataset) {
      setError('Please select a dataset');
      return;
    }

    setError(null);

    // Open results in new tab
    const resultsUrl = buildResultsUrl();
    window.open(resultsUrl, '_blank');
  };

  // Get available dataset groups for current pattern type
  const availableGroups = patternType === 'protein'
    ? datasetGroups.protein
    : datasetGroups.dna;

  // Get description for current dataset
  const currentDatasetInfo = allDatasets.find((ds) => ds.name === dataset);

  if (loading) {
    return (
      <div className="patmatch-page">
        <div className="patmatch-content">
          <h1>Pattern Match</h1>
          <hr />
          <div className="loading-state">
            <span className="loading-spinner"></span>
            Loading datasets...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="patmatch-page">
      <div className="patmatch-content">
        <h1>Pattern Match</h1>
        <hr />
        <p className="subtitle">
          Search for DNA or protein sequence patterns in Candida genomes
        </p>

        <form onSubmit={handleSubmit}>
          {/* Pattern Input */}
          <div className="form-section">
            <h3>1. Enter Pattern</h3>
            <div className="form-group">
              <textarea
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder={
                  patternType === 'dna'
                    ? 'Enter DNA pattern (e.g., ATGCN, GAATTC, or IUPAC codes)'
                    : 'Enter protein pattern (e.g., MKTL, or with ambiguity codes)'
                }
                rows={3}
              />
              <p className="help-text">
                {patternType === 'dna' ? (
                  <>
                    Use IUPAC codes: R (A/G), Y (C/T), S (G/C), W (A/T), K (G/T),
                    M (A/C), N (any)
                  </>
                ) : (
                  <>
                    Use standard amino acids. X = any residue, B = D/N, Z = E/Q
                  </>
                )}
              </p>
            </div>

            {/* Pattern Type Toggle */}
            <div className="pattern-type-toggle">
              <label>
                <input
                  type="radio"
                  name="patternType"
                  value="dna"
                  checked={patternType === 'dna'}
                  onChange={(e) => setPatternType(e.target.value)}
                />
                DNA
              </label>
              <label>
                <input
                  type="radio"
                  name="patternType"
                  value="protein"
                  checked={patternType === 'protein'}
                  onChange={(e) => setPatternType(e.target.value)}
                />
                Protein
              </label>
            </div>
          </div>

          {/* Dataset Selection */}
          <div className="form-section">
            <h3>2. Select Dataset</h3>
            <div className="form-group">
              <select
                value={dataset}
                onChange={(e) => setDataset(e.target.value)}
              >
                {availableGroups.length === 0 ? (
                  <option value="">No datasets available</option>
                ) : (
                  availableGroups.map((group) => (
                    <optgroup key={group.label} label={group.label}>
                      {group.datasets.map((ds) => (
                        <option key={ds.name} value={ds.name}>
                          {ds.display_name}
                        </option>
                      ))}
                    </optgroup>
                  ))
                )}
              </select>
              <p className="help-text">
                {currentDatasetInfo?.description || 'Select a sequence dataset to search'}
              </p>
            </div>
          </div>

          {/* Strand Option (DNA only) */}
          {patternType === 'dna' && (
            <div className="form-section">
              <h3>3. Strand Options</h3>
              <div className="strand-options">
                <label>
                  <input
                    type="radio"
                    name="strand"
                    value="both"
                    checked={strand === 'both'}
                    onChange={(e) => setStrand(e.target.value)}
                  />
                  Both strands
                </label>
                <label>
                  <input
                    type="radio"
                    name="strand"
                    value="watson"
                    checked={strand === 'watson'}
                    onChange={(e) => setStrand(e.target.value)}
                  />
                  Watson strand (+) only
                </label>
                <label>
                  <input
                    type="radio"
                    name="strand"
                    value="crick"
                    checked={strand === 'crick'}
                    onChange={(e) => setStrand(e.target.value)}
                  />
                  Crick strand (-) only
                </label>
              </div>
            </div>
          )}

          {/* Advanced Options */}
          <div className="form-section advanced-section">
            <button
              type="button"
              className="advanced-toggle"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? '▼' : '▶'} Advanced Options
            </button>

            {showAdvanced && (
              <div className="advanced-options">
                <div className="options-row">
                  <div className="form-group">
                    <label>Max Mismatches</label>
                    <select
                      value={maxMismatches}
                      onChange={(e) => setMaxMismatches(parseInt(e.target.value, 10))}
                    >
                      <option value="0">0 (exact match)</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Max Insertions</label>
                    <select
                      value={maxInsertions}
                      onChange={(e) => setMaxInsertions(parseInt(e.target.value, 10))}
                    >
                      <option value="0">0</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Max Deletions</label>
                    <select
                      value={maxDeletions}
                      onChange={(e) => setMaxDeletions(parseInt(e.target.value, 10))}
                    >
                      <option value="0">0</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Max Results</label>
                    <select
                      value={maxResults}
                      onChange={(e) => setMaxResults(parseInt(e.target.value, 10))}
                    >
                      <option value="50">50</option>
                      <option value="100">100</option>
                      <option value="250">250</option>
                      <option value="500">500</option>
                      <option value="1000">1000</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="submit-section">
            <button
              type="submit"
              className="submit-button"
              disabled={!pattern.trim() || !dataset}
            >
              Search
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

export default PatmatchSearchPage;
