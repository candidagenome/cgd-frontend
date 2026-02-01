import api from './config';

export const searchApi = {
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
};

export default searchApi;
