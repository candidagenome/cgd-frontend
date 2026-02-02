import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import './PatmatchSearchPage.css';

// Dataset display info - organized by organism/assembly
const DATASET_GROUPS = {
  dna: {
    label: 'DNA Datasets',
    groups: [
      {
        label: 'C. albicans Assembly 22',
        datasets: [
          { value: 'ca22_chromosomes', label: 'Chromosomes/Contigs', desc: 'Complete chromosome sequences' },
          { value: 'ca22_orf_genomic', label: 'ORF Genomic DNA', desc: 'ORF sequences including introns' },
          { value: 'ca22_orf_coding', label: 'ORF Coding DNA', desc: 'Coding sequences (exons only)' },
          { value: 'ca22_orf_genomic_1kb', label: 'ORF Genomic +/- 1kb', desc: 'ORF with 1kb flanking regions' },
          { value: 'ca22_intergenic', label: 'Intergenic Regions', desc: 'Sequences between genes' },
          { value: 'ca22_noncoding', label: 'Non-coding Features', desc: 'ncRNA, tRNA, rRNA, etc.' },
        ],
      },
      {
        label: 'C. albicans Assembly 21',
        datasets: [
          { value: 'ca21_chromosomes', label: 'Chromosomes/Contigs', desc: 'Complete chromosome sequences' },
          { value: 'ca21_orf_genomic', label: 'ORF Genomic DNA', desc: 'ORF sequences including introns' },
          { value: 'ca21_orf_coding', label: 'ORF Coding DNA', desc: 'Coding sequences (exons only)' },
          { value: 'ca21_orf_genomic_1kb', label: 'ORF Genomic +/- 1kb', desc: 'ORF with 1kb flanking regions' },
          { value: 'ca21_intergenic', label: 'Intergenic Regions', desc: 'Sequences between genes' },
          { value: 'ca21_noncoding', label: 'Non-coding Features', desc: 'ncRNA, tRNA, rRNA, etc.' },
        ],
      },
      {
        label: 'C. glabrata',
        datasets: [
          { value: 'cg_chromosomes', label: 'Chromosomes/Contigs', desc: 'Complete chromosome sequences' },
          { value: 'cg_orf_genomic', label: 'ORF Genomic DNA', desc: 'ORF sequences including introns' },
          { value: 'cg_orf_coding', label: 'ORF Coding DNA', desc: 'Coding sequences (exons only)' },
        ],
      },
      {
        label: 'All Organisms',
        datasets: [
          { value: 'all_chromosomes', label: 'All Chromosomes/Contigs', desc: 'All chromosome sequences' },
          { value: 'all_orf_genomic', label: 'All ORF Genomic DNA', desc: 'All ORF sequences' },
          { value: 'all_orf_coding', label: 'All ORF Coding DNA', desc: 'All coding sequences' },
        ],
      },
    ],
  },
  protein: {
    label: 'Protein Datasets',
    groups: [
      {
        label: 'C. albicans Assembly 22',
        datasets: [
          { value: 'ca22_orf_protein', label: 'Protein Sequences', desc: 'Translated ORF proteins' },
        ],
      },
      {
        label: 'C. albicans Assembly 21',
        datasets: [
          { value: 'ca21_orf_protein', label: 'Protein Sequences', desc: 'Translated ORF proteins' },
        ],
      },
      {
        label: 'C. glabrata',
        datasets: [
          { value: 'cg_orf_protein', label: 'Protein Sequences', desc: 'Translated ORF proteins' },
        ],
      },
      {
        label: 'All Organisms',
        datasets: [
          { value: 'all_orf_protein', label: 'All Protein Sequences', desc: 'All translated proteins' },
        ],
      },
    ],
  },
};

function PatmatchSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Form state
  const [pattern, setPattern] = useState(searchParams.get('pattern') || '');
  const [patternType, setPatternType] = useState(searchParams.get('type') || 'dna');
  const [dataset, setDataset] = useState(searchParams.get('ds') || 'ca22_chromosomes');
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

  // Update dataset when pattern type changes
  useEffect(() => {
    if (patternType === 'protein' && !dataset.includes('protein')) {
      setDataset('ca22_orf_protein');
    } else if (patternType === 'dna' && dataset.includes('protein')) {
      setDataset('ca22_chromosomes');
    }
  }, [patternType, dataset]);

  // Update URL params
  const updateUrlParams = useCallback(() => {
    const params = new URLSearchParams();

    if (pattern) params.set('pattern', pattern);
    params.set('type', patternType);
    params.set('ds', dataset);
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

    setError(null);

    // Open results in new tab
    const resultsUrl = buildResultsUrl();
    window.open(resultsUrl, '_blank');
  };

  // Get available dataset groups for current pattern type
  const availableGroups = patternType === 'protein'
    ? DATASET_GROUPS.protein.groups
    : DATASET_GROUPS.dna.groups;

  // Get flat list of all available datasets for description lookup
  const allAvailableDatasets = availableGroups.flatMap((g) => g.datasets);

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
                {availableGroups.map((group) => (
                  <optgroup key={group.label} label={group.label}>
                    {group.datasets.map((ds) => (
                      <option key={ds.value} value={ds.value}>
                        {ds.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <p className="help-text">
                {allAvailableDatasets.find((ds) => ds.value === dataset)?.desc}
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
              disabled={!pattern.trim()}
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
