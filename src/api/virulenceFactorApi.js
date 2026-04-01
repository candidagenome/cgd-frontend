import api from './config';

export const virulenceFactorApi = {
  /**
   * Get all virulence categories with gene counts
   * @param {Object} params - Optional filter parameters
   * @param {string} [params.organism] - Filter counts by organism
   * @returns {Promise<Array>} List of categories with counts
   */
  getCategories: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.organism) queryParams.append('organism', params.organism);

    const queryString = queryParams.toString();
    const url = queryString ? `/api/virulence/categories?${queryString}` : '/api/virulence/categories';
    const response = await api.get(url);
    return response.data;
  },

  /**
   * Search virulence factors by criteria
   * @param {Object} params - Search parameters
   * @param {Array<string>} [params.categories] - Filter by category keys
   * @param {Array<string>} [params.organisms] - Filter by organism abbreviations
   * @param {string} [params.search_term] - Keyword search
   * @param {Array<string>} [params.evidence_types] - Filter by evidence type
   * @param {number} [params.page] - Page number (default: 1)
   * @param {number} [params.page_size] - Results per page (default: 25)
   * @returns {Promise<Object>} Paginated search results
   */
  getFactors: async (params = {}) => {
    const queryParams = new URLSearchParams();

    if (params.categories && params.categories.length > 0) {
      params.categories.forEach((cat) => queryParams.append('categories', cat));
    }
    if (params.organisms && params.organisms.length > 0) {
      params.organisms.forEach((org) => queryParams.append('organisms', org));
    }
    if (params.search_term) queryParams.append('search_term', params.search_term);
    if (params.evidence_types && params.evidence_types.length > 0) {
      params.evidence_types.forEach((et) => queryParams.append('evidence_types', et));
    }
    if (params.page) queryParams.append('page', params.page);
    if (params.page_size) queryParams.append('page_size', params.page_size);

    const queryString = queryParams.toString();
    const url = queryString ? `/api/virulence/factors?${queryString}` : '/api/virulence/factors';
    const response = await api.get(url);
    return response.data;
  },

  /**
   * Get virulence factor detail for a specific gene
   * @param {string} geneName - Gene name or systematic name
   * @returns {Promise<Object>} Gene's virulence annotations
   */
  getFactorDetail: async (geneName) => {
    const response = await api.get(`/api/virulence/factors/${encodeURIComponent(geneName)}`);
    return response.data;
  },

  /**
   * Get summary statistics
   * @returns {Promise<Object>} Stats including counts per category/organism
   */
  getStats: async () => {
    const response = await api.get('/api/virulence/stats');
    return response.data;
  },

  /**
   * Download virulence factors as TSV/CSV
   * @param {Object} params - Same params as getFactors
   * @param {string} [format='tsv'] - Download format (tsv or csv)
   */
  downloadResults: async (params = {}, format = 'tsv') => {
    try {
      const requestParams = {
        ...params,
        format,
      };

      const response = await api.post('/api/virulence/factors/download', requestParams, {
        responseType: 'blob',
      });

      // Create download link
      const contentType = format === 'csv' ? 'text/csv' : 'text/tab-separated-values';
      const blob = new Blob([response.data], { type: `${contentType};charset=utf-8;` });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `virulence_factors.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      // Handle error - try to parse blob as JSON to get error message
      if (error.response?.data instanceof Blob) {
        const text = await error.response.data.text();
        try {
          const jsonError = JSON.parse(text);
          throw new Error(jsonError.detail || jsonError.message || 'Download failed');
        } catch {
          throw new Error(text || 'Download failed');
        }
      }
      throw error;
    }
  },

  /**
   * Get list of available organisms
   * @returns {Promise<Array>} List of organisms
   */
  getOrganisms: async () => {
    const response = await api.get('/api/organisms');
    return response.data;
  },
};

export default virulenceFactorApi;
