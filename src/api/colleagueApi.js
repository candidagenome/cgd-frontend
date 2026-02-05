/**
 * Colleague Search API Client
 */
import api from './config';

const colleagueApi = {
  /**
   * Search colleagues by last name
   *
   * @param {string} lastName - Last name to search (supports * wildcard)
   * @param {number} page - Page number (1-indexed)
   * @param {number} pageSize - Results per page
   * @returns {Promise<Object>} Search results with pagination
   */
  search: async (lastName, page = 1, pageSize = 20) => {
    const response = await api.get('/api/colleague/search', {
      params: {
        last_name: lastName,
        page,
        page_size: pageSize,
      },
    });
    return response.data;
  },

  /**
   * Get detailed information for a colleague
   *
   * @param {number} colleagueNo - Colleague ID
   * @returns {Promise<Object>} Colleague details
   */
  getDetail: async (colleagueNo) => {
    const response = await api.get(`/api/colleague/${colleagueNo}`);
    return response.data;
  },
};

export default colleagueApi;
