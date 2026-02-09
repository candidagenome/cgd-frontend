/**
 * Database Search API module for searching phenotypes and related data.
 *
 * Requires curator authentication.
 */
import api from './config';

export const dbSearchApi = {
  /**
   * Search for phenotypes matching a query string.
   *
   * @param {string} query - Search term (min 2 characters)
   * @param {number} [limit=100] - Maximum results to return
   * @returns {Promise<{results: Array, count: number, query: string}>}
   */
  searchPhenotypes: async (query, limit = 100) => {
    const response = await api.get('/api/curation/db-search/phenotype/search', {
      params: { query, limit },
    });
    return response.data;
  },

  /**
   * Get details for a specific phenotype including associated features.
   *
   * @param {number} phenotypeNo - Phenotype ID
   * @returns {Promise<{phenotype_no: number, observable: string, qualifier: string, experiment_type: string, mutant_type: string, source: string, display_text: string, features: Array, feature_count: number}>}
   */
  getPhenotypeDetails: async (phenotypeNo) => {
    const response = await api.get(`/api/curation/db-search/phenotype/${phenotypeNo}`);
    return response.data;
  },

  /**
   * Get distinct observable values for autocomplete.
   *
   * @returns {Promise<{values: string[]}>}
   */
  getObservableValues: async () => {
    const response = await api.get('/api/curation/db-search/phenotype/values/observable');
    return response.data;
  },

  /**
   * Get distinct qualifier values for autocomplete.
   *
   * @returns {Promise<{values: string[]}>}
   */
  getQualifierValues: async () => {
    const response = await api.get('/api/curation/db-search/phenotype/values/qualifier');
    return response.data;
  },

  /**
   * Get distinct experiment types for autocomplete.
   *
   * @returns {Promise<{values: string[]}>}
   */
  getExperimentTypes: async () => {
    const response = await api.get('/api/curation/db-search/phenotype/values/experiment-type');
    return response.data;
  },

  /**
   * Get distinct mutant types for autocomplete.
   *
   * @returns {Promise<{values: string[]}>}
   */
  getMutantTypes: async () => {
    const response = await api.get('/api/curation/db-search/phenotype/values/mutant-type');
    return response.data;
  },
};

export default dbSearchApi;
