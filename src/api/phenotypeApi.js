import api from './config';

export const phenotypeApi = {
  /**
   * Search phenotypes by criteria
   * @param {Object} params - Search parameters
   * @param {string} [params.query] - General keyword search (searches all fields)
   * @param {string} [params.observable] - Observable term to search for
   * @param {string} [params.qualifier] - Qualifier filter
   * @param {string} [params.experiment_type] - Experiment type filter
   * @param {string} [params.mutant_type] - Mutant type filter
   * @param {string} [params.property_value] - Chemical/property value search
   * @param {string} [params.property_type] - Property type filter
   * @param {string} [params.pubmed] - PubMed ID search
   * @param {string} [params.organism] - Organism filter
   * @param {string} [params.type] - Search type ('wildcard' for wildcard search)
   * @param {number} [params.page] - Page number (default: 1)
   * @param {number} [params.limit] - Results per page (default: 25)
   */
  searchPhenotypes: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.query) queryParams.append('query', params.query);
    if (params.observable) queryParams.append('observable', params.observable);
    if (params.qualifier) queryParams.append('qualifier', params.qualifier);
    if (params.experiment_type) queryParams.append('experiment_type', params.experiment_type);
    if (params.mutant_type) queryParams.append('mutant_type', params.mutant_type);
    if (params.property_value) queryParams.append('property_value', params.property_value);
    if (params.property_type) queryParams.append('property_type', params.property_type);
    if (params.pubmed) queryParams.append('pubmed', params.pubmed);
    if (params.organism) queryParams.append('organism', params.organism);
    if (params.type) queryParams.append('type', params.type);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);

    const queryString = queryParams.toString();
    const url = queryString ? `/api/phenotype/search?${queryString}` : '/api/phenotype/search';
    const response = await api.get(url);
    return response.data;
  },

  /**
   * Get summary of phenotype search results grouped by observable
   * @param {string} query - Keyword to search for
   */
  searchPhenotypesSummary: async (query) => {
    const response = await api.get(`/api/phenotype/search/summary?query=${encodeURIComponent(query)}`);
    return response.data;
  },

  /**
   * Get hierarchical tree of observable CV terms
   */
  getObservableTree: async () => {
    const response = await api.get('/api/phenotype/observables');
    return response.data;
  },

  /**
   * Get list of experiment types for dropdown
   */
  getExperimentTypes: async () => {
    const response = await api.get('/api/phenotype/experiment-types');
    return response.data;
  },

  /**
   * Get list of property types for dropdown
   */
  getPropertyTypes: async () => {
    const response = await api.get('/api/phenotype/property-types');
    return response.data;
  },

  /**
   * Get list of organisms for dropdown
   */
  getOrganisms: async () => {
    const response = await api.get('/api/organisms');
    return response.data;
  },
};

export default phenotypeApi;
