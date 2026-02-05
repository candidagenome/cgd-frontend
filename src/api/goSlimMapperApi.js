import api from './config';

export const goSlimMapperApi = {
  /**
   * Get configuration options for GO Slim Mapper
   * @returns {Promise<Object>} Config with organisms, GO Slim sets, annotation types
   */
  getConfig: async () => {
    const response = await api.get('/api/go-slim-mapper/config');
    return response.data;
  },

  /**
   * Get all available GO Slim sets
   * @returns {Promise<Array>} List of GO Slim sets with their available aspects
   */
  getSlimSets: async () => {
    const response = await api.get('/api/go-slim-mapper/slim-sets');
    return response.data;
  },

  /**
   * Get GO Slim terms for a specific set and aspect
   * @param {string} setName - Name of the GO Slim set
   * @param {string} aspect - GO aspect code (P, F, or C)
   * @returns {Promise<Object>} Set detail with list of terms
   */
  getSlimTerms: async (setName, aspect) => {
    const response = await api.get(
      `/api/go-slim-mapper/slim-terms/${encodeURIComponent(setName)}/${aspect}`
    );
    return response.data;
  },

  /**
   * Run GO Slim Mapper analysis
   * @param {Object} request - Analysis request parameters
   * @param {string[]} request.genes - List of gene names/IDs (required)
   * @param {number} request.organism_no - Organism number (required)
   * @param {string} request.go_set_name - Name of GO Slim set (required)
   * @param {string} request.go_aspect - GO aspect code P/F/C (required)
   * @param {string[]} [request.selected_terms] - Specific term IDs to include
   * @param {string[]} [request.annotation_types] - Annotation types to include
   * @returns {Promise<Object>} Analysis results with mapped terms
   */
  runAnalysis: async (request) => {
    const response = await api.post('/api/go-slim-mapper/analyze', request);
    return response.data;
  },

  /**
   * Download results in specified format
   * @param {Object} request - Analysis request parameters (same as runAnalysis)
   * @param {string} format - Output format ('tsv' or 'csv')
   * @returns {Promise<Blob>} File data as blob
   */
  downloadResults: async (request, format = 'tsv') => {
    const response = await api.post(
      `/api/go-slim-mapper/download/${format}`,
      request,
      { responseType: 'blob' }
    );
    return response.data;
  },
};

export default goSlimMapperApi;
