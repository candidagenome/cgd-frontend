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

  /**
   * Get form configuration for colleague registration/update
   *
   * @returns {Promise<Object>} Form configuration (countries, states, etc.)
   */
  getFormConfig: async () => {
    const response = await api.get('/api/colleague/form-config');
    return response.data;
  },

  /**
   * Submit colleague registration or update
   *
   * @param {number|null} colleagueNo - Colleague ID for updates, null for new
   * @param {Object} data - Colleague data
   * @returns {Promise<Object>} Submission response
   */
  submit: async (colleagueNo, data) => {
    const response = await api.post('/api/colleague/submit', {
      colleague_no: colleagueNo,
      data,
    });
    return response.data;
  },
};

export default colleagueApi;
