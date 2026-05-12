import api from './config';

export const phenotypeEnrichmentApi = {
  /**
   * Get configuration options for Phenotype Enrichment
   * @returns {Promise<Object>} Config with organisms and default settings
   */
  getConfig: async () => {
    const response = await api.get('/api/phenotype-enrichment/config');
    return response.data;
  },

  /**
   * Validate a list of genes against the database
   * @param {string[]} genes - List of gene names/IDs
   * @param {number} organismNo - Organism number
   * @returns {Promise<Object>} Validation results with found/not found genes
   */
  validateGenes: async (genes, organismNo) => {
    const response = await api.post('/api/phenotype-enrichment/validate-genes', {
      genes,
      organism_no: organismNo,
    }, {
      timeout: 300000,
    });
    return response.data;
  },

  /**
   * Run phenotype enrichment analysis
   * @param {Object} request - Analysis request parameters
   * @param {string[]} request.genes - List of gene names/IDs (required)
   * @param {number} request.organism_no - Organism number (required)
   * @param {string[]} [request.background_genes] - Custom background gene set
   * @param {number} [request.p_value_cutoff=0.01] - P-value cutoff
   * @param {string} [request.correction_method='bh'] - Multiple testing correction
   * @param {number} [request.min_genes_in_term=1] - Minimum genes per term
   * @returns {Promise<Object>} Analysis results with enriched phenotypes
   */
  runAnalysis: async (request) => {
    const response = await api.post('/api/phenotype-enrichment/analyze', request, {
      timeout: 300000,
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
      `/api/phenotype-enrichment/download/${format}`,
      request,
      {
        responseType: 'blob',
        timeout: 300000,
      }
    );
    return response.data;
  },
};

export default phenotypeEnrichmentApi;
