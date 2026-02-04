import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import restrictionMapperApi from '../api/restrictionMapperApi';
import './RestrictionMapperSearchPage.css';

// Enzyme filter options
const ENZYME_FILTERS = [
  { value: 'all', label: 'All Enzymes', desc: 'Show all cutting enzymes' },
  { value: '5_overhang', label: "5' Overhang", desc: "Enzymes producing 5' overhangs (sticky ends)" },
  { value: '3_overhang', label: "3' Overhang", desc: "Enzymes producing 3' overhangs (sticky ends)" },
  { value: 'blunt', label: 'Blunt End', desc: 'Enzymes producing blunt ends' },
  { value: 'cut_once', label: 'Cut Once', desc: 'Enzymes that cut exactly once' },
  { value: 'cut_twice', label: 'Cut Twice', desc: 'Enzymes that cut exactly twice' },
  { value: 'six_base', label: 'Six-Base Cutters', desc: 'Enzymes with 6-base recognition sequences' },
  { value: 'no_cut', label: 'Non-Cutting', desc: 'Show enzymes that do not cut' },
];

function RestrictionMapperSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Form state
  const [inputType, setInputType] = useState(searchParams.get('type') || 'locus');
  const [locus, setLocus] = useState(searchParams.get('locus') || '');
  const [sequence, setSequence] = useState(searchParams.get('seq') || '');
  const [sequenceName, setSequenceName] = useState(searchParams.get('name') || '');
  const [enzymeFilter, setEnzymeFilter] = useState(searchParams.get('filter') || 'all');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalEnzymes, setTotalEnzymes] = useState(null);

  // Fetch config on mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const config = await restrictionMapperApi.getConfig();
        setTotalEnzymes(config.total_enzymes);
      } catch (err) {
        console.error('Failed to fetch config:', err);
      }
    };
    fetchConfig();
  }, []);

  // Update URL params
  const updateUrlParams = useCallback(() => {
    const params = new URLSearchParams();

    params.set('type', inputType);
    if (inputType === 'locus' && locus) {
      params.set('locus', locus);
    } else if (inputType === 'sequence' && sequence) {
      params.set('seq', sequence.substring(0, 100)); // Limit URL length
      if (sequenceName) params.set('name', sequenceName);
    }
    params.set('filter', enzymeFilter);

    setSearchParams(params, { replace: true });
  }, [inputType, locus, sequence, sequenceName, enzymeFilter, setSearchParams]);

  // Update URL when form changes (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(updateUrlParams, 300);
    return () => clearTimeout(timeoutId);
  }, [updateUrlParams]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate input
    if (inputType === 'locus' && !locus.trim()) {
      setError('Please enter a gene name, ORF, or CGDID');
      return;
    }
    if (inputType === 'sequence' && !sequence.trim()) {
      setError('Please enter a DNA sequence');
      return;
    }

    setLoading(true);

    try {
      // Build request params
      const params = {
        enzyme_filter: enzymeFilter,
      };
      if (inputType === 'locus') {
        params.locus = locus.trim();
      } else {
        params.sequence = sequence.trim();
        if (sequenceName.trim()) {
          params.sequence_name = sequenceName.trim();
        }
      }

      // Run search
      const result = await restrictionMapperApi.search(params);

      if (!result.success) {
        setError(result.error || 'Search failed');
        return;
      }

      // Store results in sessionStorage and navigate to results page
      sessionStorage.setItem('restrictionMapperResults', JSON.stringify(result.result));
      sessionStorage.setItem('restrictionMapperParams', JSON.stringify(params));

      navigate('/restriction-mapper/results');
    } catch (err) {
      console.error('Search error:', err);
      setError(err.response?.data?.error || err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  // Get current filter description
  const currentFilterDesc = ENZYME_FILTERS.find((f) => f.value === enzymeFilter)?.desc;

  return (
    <div className="restriction-mapper-page">
      <div className="restriction-mapper-content">
        <h1>Restriction Mapper</h1>
        <hr />
        <p className="subtitle">
          Map restriction enzyme cut sites on DNA sequences
          {totalEnzymes && ` (${totalEnzymes} enzymes in database)`}
        </p>

        <form onSubmit={handleSubmit}>
          {/* Input Type Selection */}
          <div className="form-section">
            <h3>1. Enter Sequence</h3>

            {/* Tab buttons */}
            <div className="input-type-tabs">
              <button
                type="button"
                className={`tab-button ${inputType === 'locus' ? 'active' : ''}`}
                onClick={() => setInputType('locus')}
              >
                Gene/ORF Name
              </button>
              <button
                type="button"
                className={`tab-button ${inputType === 'sequence' ? 'active' : ''}`}
                onClick={() => setInputType('sequence')}
              >
                Paste Sequence
              </button>
            </div>

            {/* Locus input */}
            {inputType === 'locus' && (
              <div className="form-group">
                <input
                  type="text"
                  value={locus}
                  onChange={(e) => setLocus(e.target.value)}
                  placeholder="Enter gene name, ORF name, or CGDID (e.g., ACT1, orf19.5001)"
                />
                <p className="help-text">
                  Enter a gene name (e.g., ACT1), systematic name (e.g., orf19.5001),
                  or CGDID to map restriction sites on its genomic sequence.
                </p>
              </div>
            )}

            {/* Sequence input */}
            {inputType === 'sequence' && (
              <>
                <div className="form-group">
                  <input
                    type="text"
                    value={sequenceName}
                    onChange={(e) => setSequenceName(e.target.value)}
                    placeholder="Sequence name (optional)"
                  />
                </div>
                <div className="form-group">
                  <textarea
                    value={sequence}
                    onChange={(e) => setSequence(e.target.value)}
                    placeholder="Paste DNA sequence (A, C, G, T only)"
                    rows={6}
                  />
                  <p className="help-text">
                    Paste a raw DNA sequence. Non-DNA characters will be ignored.
                    Maximum length: 100,000 bp.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Enzyme Filter */}
          <div className="form-section">
            <h3>2. Select Enzyme Filter</h3>
            <div className="form-group">
              <select
                value={enzymeFilter}
                onChange={(e) => setEnzymeFilter(e.target.value)}
              >
                {ENZYME_FILTERS.map((filter) => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>
              <p className="help-text">{currentFilterDesc}</p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="submit-section">
            <button
              type="submit"
              className="submit-button"
              disabled={
                loading ||
                (inputType === 'locus' && !locus.trim()) ||
                (inputType === 'sequence' && !sequence.trim())
              }
            >
              {loading ? (
                <>
                  <span className="loading-spinner" />
                  Mapping...
                </>
              ) : (
                'Display Map'
              )}
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

export default RestrictionMapperSearchPage;
