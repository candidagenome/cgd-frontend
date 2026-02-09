/**
 * Colleague Curation API module for colleague CRUD operations.
 *
 * Requires curator authentication.
 */
import api from './config';

export const colleagueCurationApi = {
  /**
   * Get paginated list of all colleagues.
   *
   * @param {number} [page=1] - Page number
   * @param {number} [pageSize=50] - Results per page
   * @returns {Promise<{colleagues: Array, total: number, page: number, page_size: number}>}
   */
  listColleagues: async (page = 1, pageSize = 50) => {
    const response = await api.get('/api/curation/colleague/list', {
      params: { page, page_size: pageSize },
    });
    return response.data;
  },

  /**
   * Get full colleague details for curation.
   *
   * @param {number} colleagueNo - Colleague number
   * @returns {Promise<Object>} - Full colleague details
   */
  getColleagueDetails: async (colleagueNo) => {
    const response = await api.get(`/api/curation/colleague/${colleagueNo}`);
    return response.data;
  },

  /**
   * Create a new colleague.
   *
   * @param {Object} data - Colleague data
   * @returns {Promise<{colleague_no: number, message: string}>}
   */
  createColleague: async (data) => {
    const response = await api.post('/api/curation/colleague/', data);
    return response.data;
  },

  /**
   * Update an existing colleague.
   *
   * @param {number} colleagueNo - Colleague number
   * @param {Object} data - Fields to update
   * @returns {Promise<{success: boolean, message: string}>}
   */
  updateColleague: async (colleagueNo, data) => {
    const response = await api.put(`/api/curation/colleague/${colleagueNo}`, data);
    return response.data;
  },

  /**
   * Delete a colleague.
   *
   * @param {number} colleagueNo - Colleague number
   * @returns {Promise<{success: boolean, message: string}>}
   */
  deleteColleague: async (colleagueNo) => {
    const response = await api.delete(`/api/curation/colleague/${colleagueNo}`);
    return response.data;
  },

  /**
   * Add URL to colleague.
   *
   * @param {number} colleagueNo - Colleague number
   * @param {string} urlType - URL type (Lab, Personal, etc.)
   * @param {string} link - URL
   * @returns {Promise<{id: number, message: string}>}
   */
  addUrl: async (colleagueNo, urlType, link) => {
    const response = await api.post(`/api/curation/colleague/${colleagueNo}/url`, {
      url_type: urlType,
      link,
    });
    return response.data;
  },

  /**
   * Remove URL from colleague.
   *
   * @param {number} collUrlNo - Colleague URL link number
   * @returns {Promise<{success: boolean, message: string}>}
   */
  removeUrl: async (collUrlNo) => {
    const response = await api.delete(`/api/curation/colleague/url/${collUrlNo}`);
    return response.data;
  },

  /**
   * Add keyword to colleague.
   *
   * @param {number} colleagueNo - Colleague number
   * @param {string} keyword - Keyword
   * @returns {Promise<{id: number, message: string}>}
   */
  addKeyword: async (colleagueNo, keyword) => {
    const response = await api.post(`/api/curation/colleague/${colleagueNo}/keyword`, {
      keyword,
    });
    return response.data;
  },

  /**
   * Remove keyword from colleague.
   *
   * @param {number} collKwNo - Colleague keyword link number
   * @returns {Promise<{success: boolean, message: string}>}
   */
  removeKeyword: async (collKwNo) => {
    const response = await api.delete(`/api/curation/colleague/keyword/${collKwNo}`);
    return response.data;
  },

  /**
   * Add feature association to colleague.
   *
   * @param {number} colleagueNo - Colleague number
   * @param {string} featureName - Feature/gene name
   * @returns {Promise<{id: number, message: string}>}
   */
  addFeature: async (colleagueNo, featureName) => {
    const response = await api.post(`/api/curation/colleague/${colleagueNo}/feature`, {
      feature_name: featureName,
    });
    return response.data;
  },

  /**
   * Remove feature from colleague.
   *
   * @param {number} collFeatNo - Colleague feature link number
   * @returns {Promise<{success: boolean, message: string}>}
   */
  removeFeature: async (collFeatNo) => {
    const response = await api.delete(`/api/curation/colleague/feature/${collFeatNo}`);
    return response.data;
  },

  /**
   * Add relationship between colleagues.
   *
   * @param {number} colleagueNo - Colleague number
   * @param {number} associateNo - Associate colleague number
   * @param {string} relationshipType - Relationship type
   * @returns {Promise<{id: number, message: string}>}
   */
  addRelationship: async (colleagueNo, associateNo, relationshipType) => {
    const response = await api.post(`/api/curation/colleague/${colleagueNo}/relationship`, {
      associate_no: associateNo,
      relationship_type: relationshipType,
    });
    return response.data;
  },

  /**
   * Remove relationship between colleagues.
   *
   * @param {number} collRelationshipNo - Relationship link number
   * @returns {Promise<{success: boolean, message: string}>}
   */
  removeRelationship: async (collRelationshipNo) => {
    const response = await api.delete(`/api/curation/colleague/relationship/${collRelationshipNo}`);
    return response.data;
  },

  /**
   * Add remark to colleague.
   *
   * @param {number} colleagueNo - Colleague number
   * @param {string} remarkType - Remark type
   * @param {string} remarkText - Remark text
   * @returns {Promise<{id: number, message: string}>}
   */
  addRemark: async (colleagueNo, remarkType, remarkText) => {
    const response = await api.post(`/api/curation/colleague/${colleagueNo}/remark`, {
      remark_type: remarkType,
      remark_text: remarkText,
    });
    return response.data;
  },
};

export default colleagueCurationApi;
