/**
 * Reference Curation API module for reference management.
 *
 * Requires curator authentication.
 */
import api from './config';

export const referenceCurationApi = {
  /**
   * Create a new reference from a PubMed ID.
   *
   * @param {number} pubmed - PubMed ID
   * @param {string} [status='Published'] - Reference status
   * @param {boolean} [overrideBad=false] - Override bad reference list
   * @returns {Promise<{reference_no: number, pubmed: number, message: string}>}
   */
  createFromPubmed: async (pubmed, status = 'Published', overrideBad = false) => {
    const response = await api.post('/api/curation/reference/pubmed', {
      pubmed,
      status,
      override_bad: overrideBad,
    });
    return response.data;
  },

  /**
   * Create a new reference manually (without PubMed ID).
   *
   * @param {Object} data - Reference data
   * @param {string} data.title - Reference title
   * @param {number} data.year - Publication year
   * @param {string} [data.status='Published'] - Reference status
   * @param {string[]} [data.authors] - Author names
   * @param {string} [data.journal_abbrev] - Journal abbreviation
   * @param {string} [data.volume] - Volume number
   * @param {string} [data.pages] - Page range
   * @param {string} [data.abstract] - Abstract text
   * @param {string[]} [data.publication_types] - Publication types
   * @returns {Promise<{reference_no: number, message: string}>}
   */
  createManual: async (data) => {
    const response = await api.post('/api/curation/reference/manual', data);
    return response.data;
  },

  /**
   * Get full curation details for a reference.
   *
   * @param {number} referenceNo - Reference number
   * @returns {Promise<Object>} Reference details including curation status, topics, etc.
   */
  getCurationDetails: async (referenceNo) => {
    const response = await api.get(`/api/curation/reference/${referenceNo}`);
    return response.data;
  },

  /**
   * Update reference metadata.
   *
   * @param {number} referenceNo - Reference number
   * @param {Object} data - Fields to update
   * @param {string} [data.title]
   * @param {string} [data.status]
   * @param {number} [data.year]
   * @param {string} [data.volume]
   * @param {string} [data.pages]
   * @returns {Promise<{success: boolean, message: string}>}
   */
  updateReference: async (referenceNo, data) => {
    const response = await api.put(`/api/curation/reference/${referenceNo}`, data);
    return response.data;
  },

  /**
   * Delete a reference.
   *
   * @param {number} referenceNo - Reference number
   * @returns {Promise<{success: boolean, message: string}>}
   */
  deleteReference: async (referenceNo) => {
    const response = await api.delete(`/api/curation/reference/${referenceNo}`);
    return response.data;
  },

  /**
   * Set or update the curation status for a reference.
   *
   * @param {number} referenceNo - Reference number
   * @param {string} curationStatus - Curation status value
   * @returns {Promise<{ref_property_no: number, message: string}>}
   */
  setCurationStatus: async (referenceNo, curationStatus) => {
    const response = await api.post(`/api/curation/reference/${referenceNo}/status`, {
      curation_status: curationStatus,
    });
    return response.data;
  },

  /**
   * Link a reference to features via literature guide.
   *
   * @param {number} referenceNo - Reference number
   * @param {string[]} featureNames - Feature names to link
   * @param {string} topic - Literature topic
   * @returns {Promise<{linked_count: number, refprop_feat_nos: number[], message: string}>}
   */
  linkToLitGuide: async (referenceNo, featureNames, topic) => {
    const response = await api.post(`/api/curation/reference/${referenceNo}/litguide`, {
      feature_names: featureNames,
      topic,
    });
    return response.data;
  },

  /**
   * Get list of valid reference status values.
   *
   * @returns {Promise<{statuses: string[]}>}
   */
  getReferenceStatuses: async () => {
    const response = await api.get('/api/curation/reference/statuses/reference');
    return response.data;
  },

  /**
   * Get list of valid curation status values.
   *
   * @returns {Promise<{statuses: string[]}>}
   */
  getCurationStatuses: async () => {
    const response = await api.get('/api/curation/reference/statuses/curation');
    return response.data;
  },
};

export default referenceCurationApi;
