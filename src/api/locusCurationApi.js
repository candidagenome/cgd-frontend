/**
 * Locus Curation API module for feature/locus info updates.
 *
 * Requires curator authentication.
 */
import api from './config';

export const locusCurationApi = {
  /**
   * Get list of organisms for dropdown.
   *
   * @returns {Promise<{organisms: Array}>}
   */
  getOrganisms: async () => {
    const response = await api.get('/api/curation/litreview/organisms');
    return response.data;
  },

  /**
   * Search features by name.
   *
   * @param {string} query - Search query
   * @param {Object} [options] - Search options
   * @param {string} [options.organismAbbrev] - Filter by organism abbreviation
   * @param {number} [options.page=1] - Page number
   * @param {number} [options.pageSize=50] - Results per page
   * @returns {Promise<{features: Array, total: number, page: number, page_size: number}>}
   */
  searchFeatures: async (query, options = {}) => {
    const { organismAbbrev, page = 1, pageSize = 50 } = options;
    const params = { query, page, page_size: pageSize };
    if (organismAbbrev) {
      params.organism_abbrev = organismAbbrev;
    }
    const response = await api.get('/api/curation/locus/search', { params });
    return response.data;
  },

  /**
   * Get full feature details for curation.
   *
   * @param {string|number} identifier - Feature number or name
   * @returns {Promise<Object>} - Full feature details
   */
  getFeatureDetails: async (identifier) => {
    const response = await api.get(`/api/curation/locus/${identifier}`);
    return response.data;
  },

  /**
   * Update feature fields.
   *
   * @param {number} featureNo - Feature number
   * @param {Object} data - Fields to update
   * @returns {Promise<{success: boolean, message: string}>}
   */
  updateFeature: async (featureNo, data) => {
    const response = await api.put(`/api/curation/locus/${featureNo}`, data);
    return response.data;
  },

  /**
   * Add alias to feature.
   *
   * @param {number} featureNo - Feature number
   * @param {string} aliasName - Alias name
   * @param {string} [aliasType='Uniform'] - Alias type
   * @param {number} [referenceNo] - Optional reference number
   * @returns {Promise<{id: number, message: string}>}
   */
  addAlias: async (featureNo, aliasName, aliasType = 'Uniform', referenceNo = null) => {
    const response = await api.post(`/api/curation/locus/${featureNo}/alias`, {
      alias_name: aliasName,
      alias_type: aliasType,
      reference_no: referenceNo,
    });
    return response.data;
  },

  /**
   * Remove alias from feature.
   *
   * @param {number} featAliasNo - Feature alias link number
   * @returns {Promise<{success: boolean, message: string}>}
   */
  removeAlias: async (featAliasNo) => {
    const response = await api.delete(`/api/curation/locus/alias/${featAliasNo}`);
    return response.data;
  },

  /**
   * Add note to feature.
   *
   * @param {number} featureNo - Feature number
   * @param {string} noteType - Note type
   * @param {string} noteText - Note text
   * @returns {Promise<{id: number, message: string}>}
   */
  addNote: async (featureNo, noteType, noteText) => {
    const response = await api.post(`/api/curation/locus/${featureNo}/note`, {
      note_type: noteType,
      note_text: noteText,
    });
    return response.data;
  },

  /**
   * Remove note from feature.
   *
   * @param {number} noteLinkNo - Note link number
   * @returns {Promise<{success: boolean, message: string}>}
   */
  removeNote: async (noteLinkNo) => {
    const response = await api.delete(`/api/curation/locus/note/${noteLinkNo}`);
    return response.data;
  },

  /**
   * Add URL to feature.
   *
   * @param {number} featureNo - Feature number
   * @param {string} urlType - URL type
   * @param {string} link - URL
   * @returns {Promise<{id: number, message: string}>}
   */
  addUrl: async (featureNo, urlType, link) => {
    const response = await api.post(`/api/curation/locus/${featureNo}/url`, {
      url_type: urlType,
      link,
    });
    return response.data;
  },

  /**
   * Remove URL from feature.
   *
   * @param {number} featUrlNo - Feature URL link number
   * @returns {Promise<{success: boolean, message: string}>}
   */
  removeUrl: async (featUrlNo) => {
    const response = await api.delete(`/api/curation/locus/url/${featUrlNo}`);
    return response.data;
  },

  /**
   * Unlink a reference from a feature field.
   *
   * @param {number} refLinkNo - RefLink record ID
   * @returns {Promise<{success: boolean, message: string}>}
   */
  unlinkFieldReference: async (refLinkNo) => {
    const response = await api.delete(`/api/curation/locus/field-ref/${refLinkNo}`);
    return response.data;
  },
};

export default locusCurationApi;
