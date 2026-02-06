import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import blastApi from '../api/blastApi';
import './BlastSearchPage.css';

// Program display info
const PROGRAM_INFO = {
  blastn: {
    name: 'BLASTN',
    description: 'DNA query → DNA database',
    queryType: 'nucleotide',
    hasTasks: true,
    hasScoring: true,
  },
  blastp: {
    name: 'BLASTP',
    description: 'Protein query → Protein database',
    queryType: 'protein',
    hasTasks: true,
    hasScoring: false,
  },
  blastx: {
    name: 'BLASTX',
    description: 'Translated DNA query → Protein database',
    queryType: 'nucleotide',
    hasTasks: false,
    hasScoring: false,
    usesQueryGencode: true,
  },
  tblastn: {
    name: 'TBLASTN',
    description: 'Protein query → Translated DNA database',
    queryType: 'protein',
    hasTasks: false,
    hasScoring: false,
    usesDbGencode: true,
  },
  tblastx: {
    name: 'TBLASTX',
    description: 'Translated DNA query → Translated DNA database',
    queryType: 'nucleotide',
    hasTasks: false,
    hasScoring: false,
    usesQueryGencode: true,
    usesDbGencode: true,
  },
};

// E-value presets for dropdown
const EVALUE_OPTIONS = [
  { value: '1e-20', label: '1e-20' },
  { value: '1e-10', label: '1e-10' },
  { value: '0.0001', label: '0.0001' },
  { value: '0.01', label: '0.01' },
  { value: '1', label: '1' },
  { value: '10', label: '10 (default)' },
  { value: '100', label: '100' },
  { value: '1000', label: '1000' },
];

// Max alignments/hits options
const MAX_HITS_OPTIONS = [
  { value: '10', label: '10' },
  { value: '25', label: '25' },
  { value: '50', label: '50 (default)' },
  { value: '100', label: '100' },
  { value: '250', label: '250' },
  { value: '500', label: '500' },
];

// Word size options for nucleotide searches
const NT_WORD_SIZES = ['7', '9', '11', '13', '16', '20', '24', '28', '32', '48', '64', '128', '256'];

// Word size options for protein searches
const PROT_WORD_SIZES = ['2', '3', '4', '5', '6', '7'];

// Nucleotide scoring presets
const SCORING_PRESETS = [
  { value: '', label: 'Default', reward: null, penalty: null },
  { value: '1,-4', label: '1, -4 (megablast default)', reward: 1, penalty: -4 },
  { value: '1,-3', label: '1, -3', reward: 1, penalty: -3 },
  { value: '1,-2', label: '1, -2', reward: 1, penalty: -2 },
  { value: '2,-3', label: '2, -3 (blastn default)', reward: 2, penalty: -3 },
  { value: '4,-5', label: '4, -5', reward: 4, penalty: -5 },
  { value: '1,-1', label: '1, -1', reward: 1, penalty: -1 },
];

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

  // New advanced options
  const [task, setTask] = useState(searchParams.get('task') || '');
  const [queryGencode, setQueryGencode] = useState(searchParams.get('query_gencode') || '');
  const [dbGencode, setDbGencode] = useState(searchParams.get('db_gencode') || '');
  const [scoringPreset, setScoringPreset] = useState(searchParams.get('scoring') || '');
  const [ungapped, setUngapped] = useState(searchParams.get('ungapped') === 'true');
  const [queryComment, setQueryComment] = useState(searchParams.get('comment') || '');

  // Config state
  const [config, setConfig] = useState(null);
  const [compatibleDatabases, setCompatibleDatabases] = useState([]);
  const [availableTasks, setAvailableTasks] = useState([]);
  const [geneticCodes, setGeneticCodes] = useState([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch config and genetic codes on mount
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
    const fetchGeneticCodes = async () => {
      try {
        const codes = await blastApi.getGeneticCodes();
        setGeneticCodes(codes);
      } catch (err) {
        console.error('Failed to load genetic codes:', err);
      }
    };
    fetchConfig();
    fetchGeneticCodes();
  }, []);

  // Fetch available tasks when program changes
  useEffect(() => {
    const fetchTasks = async () => {
      const programInfo = PROGRAM_INFO[program];
      if (!programInfo?.hasTasks) {
        setAvailableTasks([]);
        setTask('');
        return;
      }
      try {
        const tasks = await blastApi.getTasks(program);
        setAvailableTasks(tasks);
      } catch (err) {
        console.error('Failed to load tasks:', err);
        setAvailableTasks([]);
      }
    };
    fetchTasks();
  }, [program]);

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
    if (task) params.set('task', task);
    if (queryGencode) params.set('query_gencode', queryGencode);
    if (dbGencode) params.set('db_gencode', dbGencode);
    if (scoringPreset) params.set('scoring', scoringPreset);
    if (ungapped) params.set('ungapped', 'true');
    if (queryComment) params.set('comment', queryComment);

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
    task,
    queryGencode,
    dbGencode,
    scoringPreset,
    ungapped,
    queryComment,
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

      // New parameters
      if (task) params.task = task;
      if (queryGencode) params.query_gencode = parseInt(queryGencode, 10);
      if (dbGencode) params.db_gencode = parseInt(dbGencode, 10);
      if (scoringPreset) {
        const preset = SCORING_PRESETS.find(p => p.value === scoringPreset);
        if (preset && preset.reward !== null) {
          params.reward = preset.reward;
          params.penalty = preset.penalty;
        }
      }
      if (ungapped) params.ungapped = true;
      if (queryComment.trim()) params.query_comment = queryComment.trim();

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
      // Handle Pydantic validation errors (array of objects) or string errors
      const detail = err.response?.data?.detail;
      let errorMsg = 'BLAST search failed';
      if (Array.isArray(detail)) {
        // Pydantic validation error format
        errorMsg = detail.map(e => e.msg || e.message || JSON.stringify(e)).join('; ');
      } else if (typeof detail === 'string') {
        errorMsg = detail;
      } else if (err.message) {
        errorMsg = err.message;
      }
      setError(errorMsg);
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

  // Get word size options based on query type
  const wordSizeOptions = isProteinQuery ? PROT_WORD_SIZES : NT_WORD_SIZES;

  return (
    <div className="blast-search-page">
      <div className="blast-content">
        <h1>CGD BLAST Search</h1>
        <p className="subtitle">
          Search Candida genome and protein sequences using{' '}
          <a href="https://blast.ncbi.nlm.nih.gov/Blast.cgi?CMD=Web&PAGE_TYPE=BlastDocs"
             target="_blank"
             rel="noopener noreferrer">
            NCBI BLAST+
          </a>
        </p>

        <form onSubmit={handleSubmit}>
          {/* Query Input Section */}
          <div className="form-section">
            <div className="section-header">
              <span className="section-number">1</span>
              <h3>Enter Query Sequence</h3>
            </div>

            <div className="query-input-row">
              <div className="query-type-toggle">
                <button
                  type="button"
                  className={`toggle-btn ${queryType === 'sequence' ? 'active' : ''}`}
                  onClick={() => setQueryType('sequence')}
                >
                  Paste Sequence
                </button>
                <button
                  type="button"
                  className={`toggle-btn ${queryType === 'locus' ? 'active' : ''}`}
                  onClick={() => setQueryType('locus')}
                >
                  Locus Name
                </button>
              </div>
            </div>

            {queryType === 'sequence' ? (
              <div className="form-group">
                <textarea
                  value={sequence}
                  onChange={(e) => setSequence(e.target.value)}
                  placeholder={`Enter ${isProteinQuery ? 'protein' : 'nucleotide'} sequence (FASTA or raw format)`}
                  rows={5}
                />
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
                  Gene name, ORF name, or CGDID
                </p>
              </div>
            )}

            <div className="inline-field">
              <label htmlFor="queryComment">Query name (optional):</label>
              <input
                type="text"
                id="queryComment"
                value={queryComment}
                onChange={(e) => setQueryComment(e.target.value)}
                placeholder="Description for your query"
              />
            </div>
          </div>

          {/* Program and Database Selection - Combined Row */}
          <div className="form-section">
            <div className="section-header">
              <span className="section-number">2</span>
              <h3>Select Program &amp; Database</h3>
            </div>

            <div className="program-db-row">
              <div className="form-group compact">
                <label htmlFor="program">BLAST Program</label>
                <select
                  id="program"
                  value={program}
                  onChange={(e) => setProgram(e.target.value)}
                >
                  {Object.entries(PROGRAM_INFO).map(([prog, info]) => (
                    <option key={prog} value={prog}>
                      {info.name} - {info.description}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group compact">
                <label htmlFor="database">Target Database</label>
                <select
                  id="database"
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
              </div>
            </div>
            {database && (
              <p className="help-text db-desc">
                {compatibleDatabases.find((db) => db.name === database)?.description}
              </p>
            )}
          </div>

          {/* BLAST Options */}
          <div className="form-section options-section">
            <div className="section-header">
              <span className="section-number">3</span>
              <h3>BLAST Options</h3>
              <button
                type="button"
                className="options-toggle"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                {showAdvanced ? 'Hide advanced' : 'Show advanced'}
              </button>
            </div>

            {/* Basic options - always visible */}
            <div className="options-row">
              <div className="form-group compact">
                <label htmlFor="evalue">E-value</label>
                <select
                  id="evalue"
                  value={evalue}
                  onChange={(e) => setEvalue(e.target.value)}
                >
                  {EVALUE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group compact">
                <label htmlFor="maxHits">Max alignments</label>
                <select
                  id="maxHits"
                  value={maxHits}
                  onChange={(e) => setMaxHits(e.target.value)}
                >
                  {MAX_HITS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Task selection for BLASTN/BLASTP */}
              {currentProgramInfo?.hasTasks && availableTasks.length > 0 && (
                <div className="form-group compact">
                  <label htmlFor="task">Search strategy</label>
                  <select
                    id="task"
                    value={task}
                    onChange={(e) => setTask(e.target.value)}
                  >
                    <option value="">Default for query</option>
                    {availableTasks.map((t) => (
                      <option key={t.name} value={t.name}>
                        {t.display_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="checkbox-group inline">
                <input
                  type="checkbox"
                  id="filter"
                  checked={lowComplexityFilter}
                  onChange={(e) => setLowComplexityFilter(e.target.checked)}
                />
                <label htmlFor="filter">Filter low complexity</label>
              </div>
            </div>

            {/* Advanced options - collapsible */}
            {showAdvanced && (
              <div className="advanced-options">
                <div className="options-row">
                  <div className="form-group compact">
                    <label htmlFor="wordSize">Word size</label>
                    <select
                      id="wordSize"
                      value={wordSize}
                      onChange={(e) => setWordSize(e.target.value)}
                    >
                      <option value="">Default</option>
                      {wordSizeOptions.map((w) => (
                        <option key={w} value={w}>{w}</option>
                      ))}
                    </select>
                  </div>

                  {isProteinQuery && (
                    <div className="form-group compact">
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
                            <option key={m} value={m}>{m}</option>
                          ))}
                      </select>
                    </div>
                  )}

                  {!isProteinQuery && (
                    <>
                      <div className="form-group compact">
                        <label htmlFor="strand">Query strand</label>
                        <select
                          id="strand"
                          value={strand}
                          onChange={(e) => setStrand(e.target.value)}
                        >
                          <option value="both">Both</option>
                          <option value="plus">Plus only</option>
                          <option value="minus">Minus only</option>
                        </select>
                      </div>

                      {/* Nucleotide match/mismatch scoring for BLASTN */}
                      {currentProgramInfo?.hasScoring && (
                        <div className="form-group compact">
                          <label htmlFor="scoring">Match/Mismatch</label>
                          <select
                            id="scoring"
                            value={scoringPreset}
                            onChange={(e) => setScoringPreset(e.target.value)}
                          >
                            {SCORING_PRESETS.map((preset) => (
                              <option key={preset.value} value={preset.value}>
                                {preset.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </>
                  )}

                  {/* Genetic code for query translation (BLASTX, TBLASTX) */}
                  {currentProgramInfo?.usesQueryGencode && geneticCodes.length > 0 && (
                    <div className="form-group compact">
                      <label htmlFor="queryGencode">Query genetic code</label>
                      <select
                        id="queryGencode"
                        value={queryGencode}
                        onChange={(e) => setQueryGencode(e.target.value)}
                      >
                        <option value="">Standard (1)</option>
                        {geneticCodes.map((code) => (
                          <option key={code.code} value={code.code}>
                            {code.code}: {code.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Genetic code for database translation (TBLASTN, TBLASTX) */}
                  {currentProgramInfo?.usesDbGencode && geneticCodes.length > 0 && (
                    <div className="form-group compact">
                      <label htmlFor="dbGencode">DB genetic code</label>
                      <select
                        id="dbGencode"
                        value={dbGencode}
                        onChange={(e) => setDbGencode(e.target.value)}
                      >
                        <option value="">Standard (1)</option>
                        {geneticCodes.map((code) => (
                          <option key={code.code} value={code.code}>
                            {code.code}: {code.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="checkbox-group inline">
                    <input
                      type="checkbox"
                      id="ungapped"
                      checked={ungapped}
                      onChange={(e) => setUngapped(e.target.checked)}
                    />
                    <label htmlFor="ungapped">Ungapped only</label>
                  </div>
                </div>

                {(currentProgramInfo?.usesQueryGencode || currentProgramInfo?.usesDbGencode) && (
                  <p className="help-text gencode-hint">
                    Use code 12 (Alternative Yeast Nuclear) for CTG clade yeasts (C. albicans)
                  </p>
                )}
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
