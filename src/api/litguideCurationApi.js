/**
 * Literature Guide Curation API module for feature-centric literature curation.
 *
 * Requires curator authentication.
 */
import api from './config';

export const litguideCurationApi = {
  /**
   * Get available literature topics.
   *
   * @returns {Promise<{topics: string[]}>}
   */
  getTopics: async () => {
    const response = await api.get('/api/curation/litguide/topics');
    return response.data;
  },

  /**
   * Get available curation statuses.
   *
   * @returns {Promise<{statuses: string[]}>}
   */
  getStatuses: async () => {
    const response = await api.get('/api/curation/litguide/statuses');
    return response.data;
  },

  /**
   * Get all literature for a feature.
   *
   * @param {string|number} identifier - Feature number or name
   * @returns {Promise<Object>} - Feature with curated and uncurated references
   */
  getFeatureLiterature: async (identifier) => {
    const response = await api.get(`/api/curation/litguide/feature/${identifier}`);
    return response.data;
  },

  /**
   * Add topic association between feature and reference.
   *
   * @param {number} featureNo - Feature number
   * @param {number} referenceNo - Reference number
   * @param {string} topic - Literature topic
   * @returns {Promise<{refprop_feat_no: number, message: string}>}
   */
  addTopicAssociation: async (featureNo, referenceNo, topic) => {
    const response = await api.post(`/api/curation/litguide/feature/${featureNo}/topic`, {
      reference_no: referenceNo,
      topic,
    });
    return response.data;
  },

  /**
   * Remove topic association.
   *
   * @param {number} refpropFeatNo - Topic association ID
   * @returns {Promise<{success: boolean, message: string}>}
   */
  removeTopicAssociation: async (refpropFeatNo) => {
    const response = await api.delete(`/api/curation/litguide/topic/${refpropFeatNo}`);
    return response.data;
  },

  /**
   * Set curation status for a reference.
   *
   * @param {number} referenceNo - Reference number
   * @param {string} curationStatus - Curation status
   * @returns {Promise<{success: boolean, message: string}>}
   */
  setReferenceStatus: async (referenceNo, curationStatus) => {
    const response = await api.put(`/api/curation/litguide/reference/${referenceNo}/status`, {
      curation_status: curationStatus,
    });
    return response.data;
  },

  /**
   * Search references by pubmed, title, or citation.
   *
   * @param {string} query - Search query
   * @param {number} [page=1] - Page number
   * @param {number} [pageSize=50] - Results per page
   * @returns {Promise<{references: Array, total: number, page: number, page_size: number}>}
   */
  searchReferences: async (query, page = 1, pageSize = 50) => {
    const response = await api.get('/api/curation/litguide/reference/search', {
      params: { query, page, page_size: pageSize },
    });
    return response.data;
  },
};

export default litguideCurationApi;
