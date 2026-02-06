/**
 * BLAST Search API Client
 */
import api from './config';

const blastApi = {
  /**
   * Get BLAST configuration (programs, databases, defaults)
   */
  getConfig: async () => {
    const response = await api.get('/api/blast/config');
    return response.data;
  },

  /**
   * Get list of available BLAST programs
   */
  getPrograms: async () => {
    const response = await api.get('/api/blast/programs');
    return response.data;
  },

  /**
   * Get list of available databases, optionally filtered by program
   */
  getDatabases: async (program = null) => {
    const params = program ? { program } : {};
    const response = await api.get('/api/blast/databases', { params });
    return response.data;
  },

  /**
   * Get databases compatible with a specific program
   */
  getDatabasesForProgram: async (program) => {
    const response = await api.get(`/api/blast/databases/${program}`);
    return response.data;
  },

  /**
   * Get programs compatible with a specific database
   */
  getProgramsForDatabase: async (database) => {
    const response = await api.get(`/api/blast/programs/${database}`);
    return response.data;
  },

  /**
   * Get list of available organisms for BLAST
   */
  getOrganisms: async () => {
    const response = await api.get('/api/blast/organisms');
    return response.data;
  },

  /**
   * Get available BLAST tasks for a program
   * @param {string} program - BLAST program (blastn, blastp)
   */
  getTasks: async (program) => {
    const response = await api.get(`/api/blast/tasks/${program}`);
    return response.data;
  },

  /**
   * Get list of available genetic codes
   */
  getGeneticCodes: async () => {
    const response = await api.get('/api/blast/genetic-codes');
    return response.data;
  },

  /**
   * Run a BLAST search
   *
   * @param {Object} params - Search parameters
   * @param {string} params.sequence - Query sequence (optional if locus provided)
   * @param {string} params.locus - Locus name (optional if sequence provided)
   * @param {string} params.program - BLAST program (blastn, blastp, etc.)
   * @param {string} params.database - Target database
   * @param {string[]} params.databases - Multiple databases (for multi-DB search)
   * @param {string} params.task - BLAST task variant (megablast, blastn-short, etc.)
   * @param {number} params.evalue - E-value threshold (default: 10)
   * @param {number} params.max_hits - Maximum hits (default: 50)
   * @param {number} params.word_size - Word size (optional)
   * @param {boolean} params.low_complexity_filter - Filter low complexity (default: true)
   * @param {string} params.matrix - Scoring matrix for protein BLAST
   * @param {string} params.strand - Query strand for nucleotide BLAST
   * @param {number} params.query_gencode - Genetic code for query translation
   * @param {number} params.db_gencode - Genetic code for database translation
   * @param {number} params.reward - Nucleotide match reward
   * @param {number} params.penalty - Nucleotide mismatch penalty
   * @param {boolean} params.ungapped - Perform ungapped alignment only
   */
  search: async (params) => {
    const response = await api.post('/api/blast/search', params);
    return response.data;
  },

  /**
   * Run a BLAST search against multiple databases
   */
  searchMulti: async (params) => {
    const response = await api.post('/api/blast/search/multi', params);
    return response.data;
  },

  /**
   * Run a BLAST search and get results as plain text
   */
  searchText: async (params) => {
    const response = await api.post('/api/blast/search/text', params, {
      responseType: 'text',
    });
    return response.data;
  },

  /**
   * Download BLAST results in specified format
   * @param {string} format - Download format (fasta, tab, raw)
   * @param {Object} params - Original search parameters
   */
  download: async (format, params) => {
    const response = await api.post(`/api/blast/search/download/${format}`, params, {
      responseType: 'blob',
    });
    return response;
  },
};

export default blastApi;
