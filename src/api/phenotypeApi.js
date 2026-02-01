import api from './config';

export const phenotypeApi = {
  /**
   * Search phenotypes by criteria
   * @param {Object} params - Search parameters
   * @param {string} [params.observable] - Observable term to search for
   * @param {string} [params.qualifier] - Qualifier filter
   * @param {string} [params.experiment_type] - Experiment type filter
   * @param {string} [params.mutant_type] - Mutant type filter
   * @param {number} [params.page] - Page number (default: 1)
   * @param {number} [params.limit] - Results per page (default: 25)
   */
  searchPhenotypes: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.observable) queryParams.append('observable', params.observable);
    if (params.qualifier) queryParams.append('qualifier', params.qualifier);
    if (params.experiment_type) queryParams.append('experiment_type', params.experiment_type);
    if (params.mutant_type) queryParams.append('mutant_type', params.mutant_type);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);

    const queryString = queryParams.toString();
    const url = queryString ? `/api/phenotype/search?${queryString}` : '/api/phenotype/search';
    const response = await api.get(url);
    return response.data;
  },

  /**
   * Get hierarchical tree of observable CV terms
   */
  getObservableTree: async () => {
    const response = await api.get('/api/phenotype/observables');
    return response.data;
  },
};

export default phenotypeApi;
