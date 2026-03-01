import api from './config';

export const goAnnotationSummaryApi = {
  /**
   * Run GO Annotation Summary analysis
   * @param {Object} request - Analysis request parameters
   * @param {string[]} request.genes - List of gene names/IDs (required)
   * @param {number} [request.organism_no] - Organism number (optional)
   * @returns {Promise<Object>} Analysis results with annotation frequencies
   */
  runAnalysis: async (request) => {
    // Use longer timeout for potentially slow analysis with large gene lists
    const response = await api.post('/api/go-annotation-summary/analyze', request, {
      timeout: 300000, // 5 minutes
    });
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
      `/api/go-annotation-summary/download/${format}`,
      request,
      { responseType: 'blob', timeout: 300000 }
    );
    return response.data;
  },
};

export default goAnnotationSummaryApi;
