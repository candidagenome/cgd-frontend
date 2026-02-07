/**
 * Pattern Match Search API Client
 */
import api from './config';

const patmatchApi = {
  /**
   * Download pattern match results as TSV
   *
   * @param {Object} params - Same as search params
   */
  downloadResults: async (params) => {
    const response = await api.post('/api/patmatch/download', params, {
      responseType: 'blob',
    });

    // Create download link
    const blob = new Blob([response.data], { type: 'text/tab-separated-values' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    // Get filename from Content-Disposition header or use default
    const contentDisposition = response.headers['content-disposition'];
    let filename = 'patmatch_results.tsv';
    if (contentDisposition) {
      const match = contentDisposition.match(/filename=([^;]+)/);
      if (match) {
        filename = match[1].replace(/"/g, '');
      }
    }

    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

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
