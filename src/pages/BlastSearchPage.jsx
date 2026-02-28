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

// Organisms available for locus lookup (when using "Locus Name" input)
// Only organisms with curated gene/locus data in the CGD database
const LOCUS_ORGANISM_OPTIONS = [
  { id: '', name: 'Any organism (first match)' },
  { id: 'C_albicans_SC5314', name: 'C. albicans SC5314' },
  { id: 'C_dubliniensis_CD36', name: 'C. dubliniensis CD36' },
  { id: 'C_glabrata_CBS138', name: 'C. glabrata CBS138' },
  { id: 'C_parapsilosis_CDC317', name: 'C. parapsilosis CDC317' },
  { id: 'C_tropicalis_MYA-3404', name: 'C. tropicalis MYA-3404' },
];

// Available genomes for selection (IDs match database file naming convention)
const GENOME_OPTIONS = [
  { id: 'C_albicans_SC5314_A19', name: 'Candida albicans SC5314 Assembly 19' },
  { id: 'C_albicans_SC5314_A21', name: 'Candida albicans SC5314 Assembly 21' },
  { id: 'C_albicans_SC5314_A22', name: 'Candida albicans SC5314 Assembly 22' },
  { id: 'C_albicans_WO-1', name: 'Candida albicans WO-1' },
  { id: 'C_auris_B11221', name: 'Candida auris B11221' },
  { id: 'C_auris_B8441', name: 'Candida auris B8441' },
  { id: 'C_dubliniensis_CD36', name: 'Candida dubliniensis CD36' },
  { id: 'C_glabrata_CBS138', name: 'Candida glabrata CBS138' },
  { id: 'C_guilliermondii_ATCC_6260', name: 'Candida guilliermondii ATCC 6260' },
  { id: 'C_lusitaniae_ATCC_42720', name: 'Candida lusitaniae ATCC 42720' },
  { id: 'C_lusitaniae_CBS6936', name: 'Candida lusitaniae CBS6936' },
  { id: 'C_orthopsilosis_Co_90-125', name: 'Candida orthopsilosis Co 90-125' },
  { id: 'C_parapsilosis_CDC317', name: 'Candida parapsilosis CDC317' },
  { id: 'C_tropicalis_MYA-3404', name: 'Candida tropicalis MYA-3404' },
  { id: 'D_hansenii_CBS767', name: 'Debaryomyces hansenii CBS767' },
  { id: 'L_elongisporus_NRLL_YB-4239', name: 'Lodderomyces elongisporus NRRL YB-4239' },
];

// Dataset types for selection
const DATASET_TYPES = [
  { id: 'GENOME', name: 'GENOME', description: 'complete genome sequence', seqType: 'DNA' },
  { id: 'GENES', name: 'GENES', description: 'gene models -- introns included', seqType: 'DNA' },
  { id: 'CODING', name: 'CODING', description: 'gene models -- introns removed', seqType: 'DNA' },
  { id: 'PROTEIN', name: 'PROTEIN', description: 'translation of coding sequence', seqType: 'PROTEIN' },
  { id: 'OTHER', name: 'OTHER', description: 'non-coding features -- introns included', seqType: 'DNA' },
  { id: 'OTHER_SPLICED', name: 'OTHER SPLICED', description: 'non-coding features -- introns removed', seqType: 'DNA' },
];

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
  const [locusOrganism, setLocusOrganism] = useState(searchParams.get('locus_organism') || '');
  const [program, setProgram] = useState(searchParams.get('program') || 'blastn');
  const [database, setDatabase] = useState(searchParams.get('db') || '');
  const [selectedGenomes, setSelectedGenomes] = useState(() => {
    const genomes = searchParams.get('genomes');
    return genomes ? genomes.split(',') : ['C_albicans_SC5314_A22']; // Default to latest C. albicans assembly
  });
  const [datasetType, setDatasetType] = useState(searchParams.get('dataset') || 'GENOME');
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

  // Filter dataset types based on program (PROTEIN only for protein programs)
  const getCompatibleDatasetTypes = () => {
    const programInfo = PROGRAM_INFO[program];
    if (!programInfo) return DATASET_TYPES;

    // blastp needs protein databases, blastn/tblastn/tblastx need nucleotide
    const needsProtein = program === 'blastp' || program === 'blastx';

    return DATASET_TYPES.filter((dt) => {
      if (needsProtein) {
        return dt.seqType === 'PROTEIN';
      } else {
        return dt.seqType === 'DNA';
      }
    });
  };

  // Update dataset type when program changes (ensure compatibility)
  useEffect(() => {
    const programInfo = PROGRAM_INFO[program];
    if (!programInfo) return;

    const needsProtein = program === 'blastp' || program === 'blastx';
    const compatible = DATASET_TYPES.filter((dt) =>
      needsProtein ? dt.seqType === 'PROTEIN' : dt.seqType === 'DNA'
    );

    const currentValid = compatible.find((dt) => dt.id === datasetType);
    if (!currentValid && compatible.length > 0) {
      setDatasetType(compatible[0].id);
    }
  }, [program, datasetType]);

  // Toggle genome selection
  const toggleGenome = (genomeId) => {
    setSelectedGenomes((prev) => {
      if (prev.includes(genomeId)) {
        // Don't allow deselecting if it's the last one
        if (prev.length === 1) return prev;
        return prev.filter((id) => id !== genomeId);
      } else {
        return [...prev, genomeId];
      }
    });
  };

  // Select/deselect all genomes
  const selectAllGenomes = () => {
    setSelectedGenomes(GENOME_OPTIONS.map((g) => g.id));
  };

  const deselectAllGenomes = () => {
    // Keep at least one selected
    setSelectedGenomes([GENOME_OPTIONS[0].id]);
  };

  // Update URL params
  const updateUrlParams = useCallback(() => {
    const params = new URLSearchParams();

    params.set('qtype', queryType);
    params.set('program', program);

    if (queryType === 'sequence' && sequence) {
      params.set('seq', sequence);
    } else if (queryType === 'locus' && locus) {
      params.set('locus', locus);
      if (locusOrganism) params.set('locus_organism', locusOrganism);
    }

    if (database) params.set('db', database);
    if (selectedGenomes.length > 0) params.set('genomes', selectedGenomes.join(','));
    if (datasetType) params.set('dataset', datasetType);
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
    locusOrganism,
    program,
    database,
    selectedGenomes,
    datasetType,
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
        genomes: selectedGenomes,
        dataset_type: datasetType,
        evalue: parseFloat(evalue),
        max_hits: parseInt(maxHits, 10),
        low_complexity_filter: lowComplexityFilter,
      };

      if (queryType === 'sequence') {
        params.sequence = sequence;
      } else {
        params.locus = locus;
        if (locusOrganism) params.locus_organism = locusOrganism;
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
    // Check query
    const hasQuery = queryType === 'sequence'
      ? sequence.trim().length >= 10
      : locus.trim().length > 0;

    // Check genome selection
    const hasGenomes = selectedGenomes.length > 0;

    return hasQuery && hasGenomes;
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

            {/* Error Display - show at top of query section */}
            {error && (
              <div className="error-message query-error">
                <strong>Error:</strong> {error}
              </div>
            )}

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
                <div className="locus-input-row">
                  <input
                    type="text"
                    value={locus}
                    onChange={(e) => setLocus(e.target.value)}
                    placeholder="e.g., ACT1, orf19.5007, CAL0000191689"
                    className="locus-input"
                  />
                  <select
                    value={locusOrganism}
                    onChange={(e) => setLocusOrganism(e.target.value)}
                    className="locus-organism-select"
                  >
                    {LOCUS_ORGANISM_OPTIONS.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="help-text">
                  Gene name, ORF name, or CGDID. Select organism if the gene exists in multiple species.
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

          {/* Two-column layout for Program/Genomes and Dataset/Options */}
          <div className="form-columns">
            {/* Left Column: Program + Genomes */}
            <div className="form-column">
              {/* Program Selection */}
              <div className="form-section">
                <div className="section-header">
                  <span className="section-number">2</span>
                  <h3>Select BLAST Program</h3>
                </div>

                <div className="form-group compact">
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
              </div>

              {/* Genome Selection */}
              <div className="form-section">
                <div className="section-header">
                  <span className="section-number">3</span>
                  <h3>Select Genome(s)</h3>
                  <div className="genome-select-actions">
                    <button type="button" className="select-action-btn" onClick={selectAllGenomes}>
                      Select All
                    </button>
                    <button type="button" className="select-action-btn" onClick={deselectAllGenomes}>
                      Clear
                    </button>
                  </div>
                </div>

                <div className="genome-list">
                  {GENOME_OPTIONS.map((genome) => (
                    <label key={genome.id} className="genome-item">
                      <input
                        type="checkbox"
                        checked={selectedGenomes.includes(genome.id)}
                        onChange={() => toggleGenome(genome.id)}
                      />
                      <span className="genome-name">{genome.name}</span>
                    </label>
                  ))}
                </div>
                <p className="help-text">
                  {selectedGenomes.length} genome{selectedGenomes.length !== 1 ? 's' : ''} selected
                </p>
              </div>
            </div>

            {/* Right Column: Dataset + Options */}
            <div className="form-column">
              {/* Dataset Type Selection */}
              <div className="form-section">
            <div className="section-header">
              <span className="section-number">4</span>
              <h3>Select Dataset Type</h3>
            </div>

            <div className="dataset-list">
              {getCompatibleDatasetTypes().map((dt) => (
                <label key={dt.id} className="dataset-item">
                  <input
                    type="radio"
                    name="datasetType"
                    value={dt.id}
                    checked={datasetType === dt.id}
                    onChange={(e) => setDatasetType(e.target.value)}
                  />
                  <span className="dataset-name">
                    <strong>{dt.name}</strong> - {dt.description} ({dt.seqType})
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* BLAST Options */}
          <div className="form-section options-section">
            <div className="section-header">
              <span className="section-number">5</span>
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
            </div>
            {/* End Right Column */}
          </div>
          {/* End Two-column layout */}

          {/* Submit Button */}
          <div className="submit-section">
            <button
              type="submit"
              className="submit-button"
              disabled={!isFormValid() || loading}
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
      </div>
    </div>
  );
}

export default BlastSearchPage;
