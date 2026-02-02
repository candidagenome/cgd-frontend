import api from './config';

export const searchApi = {
  /**
   * Resolve an identifier to a direct URL (for exact matches)
   * @param {string} query - Identifier to resolve
   * @returns {Promise<Object>} Resolve response with redirect_url if found
   */
  resolve: async (query) => {
    const response = await api.get('/api/search/resolve', {
      params: { query },
    });
    return response.data;
  },

  /**
   * Quick search across all categories (genes, GO terms, phenotypes, references)
   * @param {string} query - Search query string
   * @param {number} limit - Max results per category (default 20)
   * @returns {Promise<Object>} Search response with results grouped by category
   */
  quickSearch: async (query, limit = 20) => {
    const response = await api.get('/api/search/quick', {
      params: { query, limit },
    });
    return response.data;
  },

  /**
   * Get autocomplete suggestions for search input
   * @param {string} query - Search query for suggestions
   * @param {number} limit - Max suggestions to return (default 10)
   * @returns {Promise<Object>} Autocomplete response with flat list of suggestions
   */
  autocomplete: async (query, limit = 10) => {
    const response = await api.get('/api/search/autocomplete', {
      params: { query, limit },
    });
    return response.data;
  },
};

export default searchApi;
