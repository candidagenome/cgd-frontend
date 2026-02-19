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

  /**
   * Get available organisms that have features in the database.
   *
   * @returns {Promise<{organisms: Array}>}
   */
  getOrganisms: async () => {
    const response = await api.get('/api/curation/litguide/organisms');
    return response.data;
  },

  /**
   * Get reference details with all associated features and topics.
   *
   * @param {number} referenceNo - Reference number
   * @param {string} [organism] - Optional organism abbreviation to filter features
   * @returns {Promise<Object>} - Reference with features and topics
   */
  getReferenceLiterature: async (referenceNo, organism = null) => {
    const params = {};
    if (organism) {
      params.organism = organism;
    }
    const response = await api.get(`/api/curation/litguide/reference/${referenceNo}`, { params });
    return response.data;
  },

  /**
   * Add feature-topic association to a reference.
   *
   * @param {number} referenceNo - Reference number
   * @param {string} featureIdentifier - Feature name, gene name, or feature_no
   * @param {string} topic - Literature topic
   * @returns {Promise<Object>}
   */
  addFeatureToReference: async (referenceNo, featureIdentifier, topic) => {
    const response = await api.post(`/api/curation/litguide/reference/${referenceNo}/feature`, {
      feature_identifier: featureIdentifier,
      topic,
    });
    return response.data;
  },

  /**
   * Unlink a feature from a reference.
   *
   * Removes the link between the feature and reference, as well as
   * any topic associations for this feature-reference pair.
   *
   * @param {number} referenceNo - Reference number
   * @param {string} featureIdentifier - Feature name, gene name, or feature_no
   * @returns {Promise<Object>}
   */
  unlinkFeatureFromReference: async (referenceNo, featureIdentifier) => {
    const response = await api.delete(`/api/curation/litguide/reference/${referenceNo}/feature`, {
      data: { feature_identifier: featureIdentifier },
    });
    return response.data;
  },

  /**
   * Get curation notes associated with a reference.
   *
   * Returns notes linked to features (via topics) and non-gene topic notes.
   *
   * @param {number} referenceNo - Reference number
   * @returns {Promise<{reference_no: number, notes: Array}>}
   */
  getReferenceNotes: async (referenceNo) => {
    const response = await api.get(`/api/curation/litguide/reference/${referenceNo}/notes`);
    return response.data;
  },

  /**
   * Get non-gene topics for a reference.
   *
   * Topics linked to reference but NOT associated with any feature.
   *
   * @param {number} referenceNo - Reference number
   * @returns {Promise<{reference_no: number, public_topics: Array, internal_topics: Array}>}
   */
  getNongeneTopics: async (referenceNo) => {
    const response = await api.get(`/api/curation/litguide/reference/${referenceNo}/nongene-topics`);
    return response.data;
  },

  /**
   * Add a non-gene topic to a reference.
   *
   * @param {number} referenceNo - Reference number
   * @param {string} topic - Literature topic
   * @returns {Promise<{ref_property_no: number, message: string}>}
   */
  addNongeneTopic: async (referenceNo, topic) => {
    const response = await api.post(`/api/curation/litguide/reference/${referenceNo}/nongene-topic`, {
      topic,
    });
    return response.data;
  },

  /**
   * Remove a non-gene topic from a reference.
   *
   * @param {number} referenceNo - Reference number
   * @param {number} refPropertyNo - Reference property number
   * @returns {Promise<{success: boolean, message: string}>}
   */
  removeNongeneTopic: async (referenceNo, refPropertyNo) => {
    const response = await api.delete(
      `/api/curation/litguide/reference/${referenceNo}/nongene-topic/${refPropertyNo}`
    );
    return response.data;
  },
};

export default litguideCurationApi;
