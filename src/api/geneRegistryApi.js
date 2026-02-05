/**
 * Gene Registry API Client
 */
import api from './config';

const geneRegistryApi = {
  /**
   * Get form configuration (species list, etc.)
   *
   * @returns {Promise<Object>} Configuration data
   */
  getConfig: async () => {
    const response = await api.get('/api/gene-registry/config');
    return response.data;
  },

  /**
   * Search and validate gene registration
   *
   * @param {string} lastName - Colleague last name
   * @param {string} geneName - Proposed gene name
   * @param {string} orfName - ORF name (optional)
   * @param {string} organism - Organism abbreviation
   * @returns {Promise<Object>} Validation and colleague results
   */
  search: async (lastName, geneName, orfName, organism) => {
    const params = {
      last_name: lastName,
      gene_name: geneName,
      organism,
    };
    if (orfName) {
      params.orf_name = orfName;
    }
    const response = await api.get('/api/gene-registry/search', { params });
    return response.data;
  },

  /**
   * Submit gene registration
   *
   * @param {Object} data - Registration data
   * @returns {Promise<Object>} Submission response
   */
  submit: async (data) => {
    const response = await api.post('/api/gene-registry/submit', { data });
    return response.data;
  },
};

export default geneRegistryApi;
