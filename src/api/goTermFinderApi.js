import api from './config';

export const goTermFinderApi = {
  /**
   * Get configuration options for GO Term Finder
   * @returns {Promise<Object>} Config with organisms, evidence codes, annotation types
   */
  getConfig: async () => {
    const response = await api.get('/api/go-term-finder/config');
    return response.data;
  },

  /**
   * Validate a list of genes against the database
   * @param {string[]} genes - List of gene names/IDs
   * @param {number} organismNo - Organism number
   * @returns {Promise<Object>} Validation results with found/not found genes
   */
  validateGenes: async (genes, organismNo) => {
    const response = await api.post('/api/go-term-finder/validate-genes', {
      genes,
      organism_no: organismNo,
    });
    return response.data;
  },

  /**
   * Run GO Term Finder enrichment analysis
   * @param {Object} request - Analysis request parameters
   * @param {string[]} request.genes - List of gene names/IDs (required)
   * @param {number} request.organism_no - Organism number (required)
   * @param {string} [request.ontology='all'] - GO ontology filter (P/F/C/all)
   * @param {string[]} [request.background_genes] - Custom background gene set
   * @param {string[]} [request.evidence_codes] - Evidence codes to include
   * @param {string[]} [request.annotation_types] - Annotation types to include
   * @param {number} [request.p_value_cutoff=0.01] - P-value cutoff
   * @param {string} [request.correction_method='bh'] - Multiple testing correction
   * @returns {Promise<Object>} Analysis results with enriched terms
   */
  runAnalysis: async (request) => {
    const response = await api.post('/api/go-term-finder/analyze', request);
    return response.data;
  },

  /**
   * Get enrichment graph for visualization
   * @param {Object} request - Analysis request parameters (same as runAnalysis)
   * @param {Object} [options] - Additional options
   * @param {number} [options.maxNodes=50] - Maximum nodes in graph
   * @returns {Promise<Object>} Graph with nodes and edges
   */
  getEnrichmentGraph: async (request, options = {}) => {
    const params = new URLSearchParams();
    if (options.maxNodes) params.append('max_nodes', options.maxNodes);
    const url = `/api/go-term-finder/graph${params.toString() ? '?' + params : ''}`;
    const response = await api.post(url, request);
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
      `/api/go-term-finder/download/${format}`,
      request,
      { responseType: 'blob' }
    );
    return response.data;
  },
};

export default goTermFinderApi;
