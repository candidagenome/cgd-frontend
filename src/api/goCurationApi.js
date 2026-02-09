/**
 * GO Curation API module for GO annotation CRUD operations.
 *
 * Requires curator authentication.
 */
import api from './config';

export const goCurationApi = {
  /**
   * Get all GO annotations for a feature.
   *
   * @param {string} featureName - Feature name or gene name
   * @returns {Promise<{feature_no: number, feature_name: string, gene_name: string, annotations: Array}>}
   */
  getAnnotations: async (featureName) => {
    const response = await api.get(`/api/curation/go/${encodeURIComponent(featureName)}`);
    return response.data;
  },

  /**
   * Create a new GO annotation.
   *
   * @param {string} featureName - Feature name
   * @param {Object} data - Annotation data
   * @param {number} data.goid - GO ID (without GO: prefix)
   * @param {string} data.evidence - Evidence code
   * @param {number} data.reference_no - Reference number
   * @param {string} [data.annotation_type] - Annotation type (default: "manually curated")
   * @param {string} [data.source] - Source (default: "CGD")
   * @param {string[]} [data.qualifiers] - GO qualifiers
   * @param {number} [data.ic_from_goid] - GO ID for IC evidence
   * @returns {Promise<{go_annotation_no: number, message: string}>}
   */
  createAnnotation: async (featureName, data) => {
    const response = await api.post(`/api/curation/go/${encodeURIComponent(featureName)}`, data);
    return response.data;
  },

  /**
   * Update date_last_reviewed for an annotation.
   *
   * @param {number} annotationNo - GO annotation number
   * @returns {Promise<{success: boolean, message: string}>}
   */
  markAsReviewed: async (annotationNo) => {
    const response = await api.post(`/api/curation/go/${annotationNo}/review`);
    return response.data;
  },

  /**
   * Delete a GO annotation.
   *
   * @param {number} annotationNo - GO annotation number
   * @returns {Promise<{success: boolean, message: string}>}
   */
  deleteAnnotation: async (annotationNo) => {
    const response = await api.delete(`/api/curation/go/${annotationNo}`);
    return response.data;
  },

  /**
   * Remove a reference from a GO annotation.
   *
   * @param {number} goRefNo - GO reference number
   * @returns {Promise<{success: boolean, message: string}>}
   */
  deleteReference: async (goRefNo) => {
    const response = await api.delete(`/api/curation/go/ref/${goRefNo}`);
    return response.data;
  },

  /**
   * Get list of valid GO evidence codes.
   *
   * @returns {Promise<{evidence_codes: string[]}>}
   */
  getEvidenceCodes: async () => {
    const response = await api.get('/api/curation/go/evidence-codes');
    return response.data;
  },

  /**
   * Get valid GO qualifiers for a given aspect.
   *
   * @param {string} aspect - GO aspect (F/P/C or function/process/component)
   * @returns {Promise<{aspect: string, qualifiers: string[]}>}
   */
  getQualifiers: async (aspect) => {
    const response = await api.get(`/api/curation/go/qualifiers/${encodeURIComponent(aspect)}`);
    return response.data;
  },
};

export default goCurationApi;
