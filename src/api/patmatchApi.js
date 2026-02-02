/**
 * Pattern Match Search API Client
 */
import api from './config';

const patmatchApi = {
  /**
   * Get pattern match configuration (datasets, limits)
   */
  getConfig: async () => {
    const response = await api.get('/api/patmatch/config');
    return response.data;
  },

  /**
   * Get list of available datasets, optionally filtered by pattern type
   */
  getDatasets: async (patternType = null) => {
    const params = patternType ? { pattern_type: patternType } : {};
    const response = await api.get('/api/patmatch/datasets', { params });
    return response.data;
  },

  /**
   * Run a pattern match search
   *
   * @param {Object} params - Search parameters
   * @param {string} params.pattern - Pattern to search for
   * @param {string} params.pattern_type - Pattern type (dna or protein)
   * @param {string} params.dataset - Dataset to search
   * @param {string} params.strand - Strand option (both, watson, crick)
   * @param {number} params.max_mismatches - Max mismatches (0-3)
   * @param {number} params.max_insertions - Max insertions (0-3)
   * @param {number} params.max_deletions - Max deletions (0-3)
   * @param {number} params.max_results - Max results to return
   */
  search: async (params) => {
    const response = await api.post('/api/patmatch/search', params);
    return response.data;
  },
};

export default patmatchApi;
