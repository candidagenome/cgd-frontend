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

  /**
   * Search for references by various criteria.
   *
   * @param {Object} params - Search parameters
   * @param {number} [params.pubmed] - PubMed ID
   * @param {number} [params.reference_no] - Reference number
   * @param {string} [params.dbxref_id] - CGDID
   * @param {string} [params.volume] - Journal volume
   * @param {string} [params.page] - Page number/range
   * @param {string} [params.author] - Author name (partial)
   * @param {string} [params.keyword] - Keyword in title/abstract
   * @param {number} [params.min_year] - Minimum year
   * @param {number} [params.max_year] - Maximum year
   * @param {number} [params.limit=100] - Max results
   * @returns {Promise<{results: Array, count: number}>}
   */
  searchReferences: async (params) => {
    const response = await api.post('/api/curation/reference/search', params);
    return response.data;
  },

  /**
   * Get year range for publications in database.
   *
   * @returns {Promise<{min_year: number, max_year: number}>}
   */
  getYearRange: async () => {
    const response = await api.get('/api/curation/reference/year-range');
    return response.data;
  },

  /**
   * Check if a reference has linked data.
   *
   * @param {number} referenceNo - Reference number
   * @returns {Promise<Object>} Usage counts
   */
  getReferenceUsage: async (referenceNo) => {
    const response = await api.get(`/api/curation/reference/${referenceNo}/usage`);
    return response.data;
  },

  /**
   * Delete a reference with full cleanup.
   *
   * @param {number} referenceNo - Reference number
   * @param {Object} [options] - Delete options
   * @param {string} [options.delete_log_comment] - Comment for delete log
   * @param {number} [options.make_secondary_for] - Make CGDID secondary for this reference
   * @returns {Promise<{success: boolean, messages: string[], dbxref_id: string}>}
   */
  deleteWithCleanup: async (referenceNo, options = {}) => {
    const response = await api.delete(`/api/curation/reference/${referenceNo}/full`, {
      data: options,
    });
    return response.data;
  },

  /**
   * Get URL types and sources for adding reference URLs.
   *
   * @returns {Promise<{url_types: string[], url_sources: string[]}>}
   */
  getUrlOptions: async () => {
    const response = await api.get('/api/curation/reference/url-options');
    return response.data;
  },

  /**
   * Add a URL to a reference.
   *
   * @param {number} referenceNo - Reference number
   * @param {string} url - The URL to add
   * @param {string} urlType - Type of URL (Full-text, Abstract, etc.)
   * @param {string} source - Source of URL (Author, NCBI, Publisher)
   * @returns {Promise<{url_no: number, ref_url_no: number, message: string}>}
   */
  addReferenceUrl: async (referenceNo, url, urlType, source) => {
    const response = await api.post(`/api/curation/reference/${referenceNo}/url`, {
      url,
      url_type: urlType,
      source,
    });
    return response.data;
  },
};

export default referenceCurationApi;
