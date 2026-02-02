import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import blastApi from '../api/blastApi';
import './BlastSearchPage.css';

// Program display info
const PROGRAM_INFO = {
  blastn: {
    name: 'BLASTN',
    description: 'Search nucleotide database with nucleotide query',
    queryType: 'nucleotide',
  },
  blastp: {
    name: 'BLASTP',
    description: 'Search protein database with protein query',
    queryType: 'protein',
  },
  blastx: {
    name: 'BLASTX',
    description: 'Search protein database with translated nucleotide query',
    queryType: 'nucleotide',
  },
  tblastn: {
    name: 'TBLASTN',
    description: 'Search translated nucleotide database with protein query',
    queryType: 'protein',
  },
  tblastx: {
    name: 'TBLASTX',
    description: 'Search translated nucleotide database with translated nucleotide query',
    queryType: 'nucleotide',
  },
};

function BlastSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Form state - determine initial query type based on what params are provided
  const initialLocus = searchParams.get('locus') || '';
  const initialSeq = searchParams.get('seq') || '';
  const [queryType, setQueryType] = useState(
    searchParams.get('qtype') || (initialLocus ? 'locus' : 'sequence')
  );
  const [sequence, setSequence] = useState(initialSeq);
  const [locus, setLocus] = useState(initialLocus);
  const [program, setProgram] = useState(searchParams.get('program') || 'blastn');
  const [database, setDatabase] = useState(searchParams.get('db') || '');
  const [evalue, setEvalue] = useState(searchParams.get('evalue') || '10');
  const [maxHits, setMaxHits] = useState(searchParams.get('hits') || '50');
  const [wordSize, setWordSize] = useState(searchParams.get('word') || '');
  const [lowComplexityFilter, setLowComplexityFilter] = useState(
    searchParams.get('filter') !== 'false'
  );
  const [matrix, setMatrix] = useState(searchParams.get('matrix') || '');
  const [strand, setStrand] = useState(searchParams.get('strand') || 'both');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Config state
  const [config, setConfig] = useState(null);
  const [compatibleDatabases, setCompatibleDatabases] = useState([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch config on mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const data = await blastApi.getConfig();
        setConfig(data);
      } catch (err) {
        console.error('Failed to load BLAST config:', err);
        setError('Failed to load BLAST configuration');
      }
    };
    fetchConfig();
  }, []);

  // Update compatible databases when program changes
  useEffect(() => {
    if (!config) return;

    const programInfo = PROGRAM_INFO[program];
    if (!programInfo) return;

    const dbType =
      program === 'blastn' || program === 'tblastn' || program === 'tblastx'
        ? 'nucleotide'
        : 'protein';

    const compatible = config.databases.filter((db) => db.type === dbType);
    setCompatibleDatabases(compatible);

    // Set default database if current is incompatible
    if (compatible.length > 0) {
      const currentDb = compatible.find((db) => db.name === database);
      if (!currentDb) {
        setDatabase(compatible[0].name);
      }
    }
  }, [program, config, database]);

  // Update URL params
  const updateUrlParams = useCallback(() => {
    const params = new URLSearchParams();

    params.set('qtype', queryType);
    params.set('program', program);

    if (queryType === 'sequence' && sequence) {
      params.set('seq', sequence);
    } else if (queryType === 'locus' && locus) {
      params.set('locus', locus);
    }

    if (database) params.set('db', database);
    if (evalue !== '10') params.set('evalue', evalue);
    if (maxHits !== '50') params.set('hits', maxHits);
    if (wordSize) params.set('word', wordSize);
    if (!lowComplexityFilter) params.set('filter', 'false');
    if (matrix) params.set('matrix', matrix);
    if (strand !== 'both') params.set('strand', strand);

    setSearchParams(params, { replace: true });
  }, [
    queryType,
    sequence,
    locus,
    program,
    database,
    evalue,
    maxHits,
    wordSize,
    lowComplexityFilter,
    matrix,
    strand,
    setSearchParams,
  ]);

  // Update URL when form changes
  useEffect(() => {
    const timeoutId = setTimeout(updateUrlParams, 300);
    return () => clearTimeout(timeoutId);
  }, [updateUrlParams]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) return;

    setLoading(true);
    setError(null);

    try {
      const params = {
        program,
        database,
        evalue: parseFloat(evalue),
        max_hits: parseInt(maxHits, 10),
        low_complexity_filter: lowComplexityFilter,
      };

      if (queryType === 'sequence') {
        params.sequence = sequence;
      } else {
        params.locus = locus;
      }

      if (wordSize) params.word_size = parseInt(wordSize, 10);
      if (matrix) params.matrix = matrix;
      if (strand !== 'both') params.strand = strand;

      const response = await blastApi.search(params);

      if (response.success && response.result) {
        // Store results in session storage and navigate to results page
        sessionStorage.setItem('blastResults', JSON.stringify(response.result));
        sessionStorage.setItem('blastParams', JSON.stringify(params));
        navigate('/blast/results');
      } else {
        setError(response.error || 'BLAST search failed');
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'BLAST search failed');
    } finally {
      setLoading(false);
    }
  };

  // Validate form
  const isFormValid = () => {
    if (queryType === 'sequence') {
      return sequence.trim().length >= 10;
    } else {
      return locus.trim().length > 0;
    }
  };

  // Get current program info
  const currentProgramInfo = PROGRAM_INFO[program];
  const isProteinQuery = currentProgramInfo?.queryType === 'protein';

  return (
    <div className="blast-search-page">
      <div className="blast-content">
        <h1>BLAST Search</h1>
        <hr />
        <p className="subtitle">
          Search Candida genome sequences using BLAST
        </p>

        <form onSubmit={handleSubmit}>
          {/* Program Selection */}
          <div className="form-section">
            <h3>1. Select BLAST Program</h3>
            <div className="program-grid">
              {Object.entries(PROGRAM_INFO).map(([prog, info]) => (
                <label
                  key={prog}
                  className={`program-option ${program === prog ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="program"
                    value={prog}
                    checked={program === prog}
                    onChange={(e) => setProgram(e.target.value)}
                  />
                  <div className="program-info">
                    <span className="program-name">{info.name}</span>
                    <span className="program-desc">{info.description}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Query Input */}
          <div className="form-section">
            <h3>2. Enter Query</h3>

            <div className="query-type-tabs">
              <button
                type="button"
                className={`query-tab ${queryType === 'sequence' ? 'active' : ''}`}
                onClick={() => setQueryType('sequence')}
              >
                Paste Sequence
              </button>
              <button
                type="button"
                className={`query-tab ${queryType === 'locus' ? 'active' : ''}`}
                onClick={() => setQueryType('locus')}
              >
                Enter Locus Name
              </button>
            </div>

            {queryType === 'sequence' ? (
              <div className="form-group">
                <textarea
                  value={sequence}
                  onChange={(e) => setSequence(e.target.value)}
                  placeholder={`Enter ${isProteinQuery ? 'protein' : 'nucleotide'} sequence (FASTA format accepted)`}
                  rows={8}
                />
                <p className="help-text">
                  Paste your {isProteinQuery ? 'protein' : 'nucleotide'} sequence in
                  FASTA format or as raw sequence. Minimum 10 residues.
                </p>
              </div>
            ) : (
              <div className="form-group">
                <input
                  type="text"
                  value={locus}
                  onChange={(e) => setLocus(e.target.value)}
                  placeholder="e.g., ACT1, orf19.5007, CAL0000191689"
                />
                <p className="help-text">
                  Enter a gene name, systematic ORF name, or CGDID. The{' '}
                  {isProteinQuery ? 'protein' : 'genomic'} sequence will be used as
                  the query.
                </p>
              </div>
            )}
          </div>

          {/* Database Selection */}
          <div className="form-section">
            <h3>3. Select Database</h3>
            <div className="form-group">
              <select
                value={database}
                onChange={(e) => setDatabase(e.target.value)}
              >
                <option value="">-- Select Database --</option>
                {compatibleDatabases.map((db) => (
                  <option key={db.name} value={db.name}>
                    {db.display_name}
                  </option>
                ))}
              </select>
              {database && (
                <p className="help-text">
                  {compatibleDatabases.find((db) => db.name === database)?.description}
                </p>
              )}
            </div>
          </div>

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
                <div className="options-grid">
                  <div className="form-group">
                    <label htmlFor="evalue">E-value threshold</label>
                    <input
                      type="text"
                      id="evalue"
                      value={evalue}
                      onChange={(e) => setEvalue(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="maxHits">Max hits</label>
                    <input
                      type="text"
                      id="maxHits"
                      value={maxHits}
                      onChange={(e) => setMaxHits(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="wordSize">Word size</label>
                    <input
                      type="text"
                      id="wordSize"
                      value={wordSize}
                      onChange={(e) => setWordSize(e.target.value)}
                      placeholder="Default"
                    />
                  </div>

                  {isProteinQuery && (
                    <div className="form-group">
                      <label htmlFor="matrix">Scoring matrix</label>
                      <select
                        id="matrix"
                        value={matrix}
                        onChange={(e) => setMatrix(e.target.value)}
                      >
                        <option value="">BLOSUM62 (default)</option>
                        {config?.matrices
                          ?.filter((m) => m !== 'BLOSUM62')
                          .map((m) => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          ))}
                      </select>
                    </div>
                  )}

                  {!isProteinQuery && (
                    <div className="form-group">
                      <label htmlFor="strand">Query strand</label>
                      <select
                        id="strand"
                        value={strand}
                        onChange={(e) => setStrand(e.target.value)}
                      >
                        <option value="both">Both strands</option>
                        <option value="plus">Plus strand only</option>
                        <option value="minus">Minus strand only</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    id="filter"
                    checked={lowComplexityFilter}
                    onChange={(e) => setLowComplexityFilter(e.target.checked)}
                  />
                  <label htmlFor="filter">Filter low complexity regions</label>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="submit-section">
            <button
              type="submit"
              className="submit-button"
              disabled={!isFormValid() || loading || !database}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Running BLAST...
                </>
              ) : (
                'Run BLAST Search'
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

export default BlastSearchPage;
