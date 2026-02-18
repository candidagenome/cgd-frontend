/**
 * GO Curation API module for GO annotation CRUD operations.
 *
 * Requires curator authentication.
 * Mirrors legacy goCuration CGI functionality (UpdateGO.pm).
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
   * Look up reference by pubmed ID.
   *
   * @param {number|string} pubmed - PubMed ID
   * @returns {Promise<{reference_no: number} | null>}
   */
  getReferenceByPubmed: async (pubmed) => {
    try {
      const response = await api.get(`/api/reference/${pubmed}`);
      return response.data;
    } catch {
      return null;
    }
  },

  /**
   * Create a new GO annotation.
   *
   * @param {string} featureName - Feature name
   * @param {Object} data - Annotation data
   * @param {number} data.goid - GO ID (without GO: prefix)
   * @param {string} data.evidence - Evidence code
   * @param {number} [data.reference_no] - Reference number (or use pubmed/dbxref_id)
   * @param {number} [data.pubmed] - PubMed ID (alternative to reference_no)
   * @param {string} [data.dbxref_id] - CGDID like CAL0080735 (alternative to reference_no)
   * @param {string} [data.annotation_type] - Annotation type (default: "manually curated")
   * @param {string} [data.source] - Source (default: "CGD")
   * @param {string[]} [data.qualifiers] - GO qualifiers
   * @param {number} [data.ic_from_goid] - GO ID for IC evidence
   * @param {string} [data.with_db] - Database for with/from evidence (e.g., "SGD", "UniProtKB")
   * @param {string} [data.with_id] - ID for with/from evidence (separate multiples by |)
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
   * Mark all annotations for a feature as reviewed (bulk operation).
   *
   * @param {string} featureName - Feature name
   * @returns {Promise<{success: boolean, count: number, message: string}>}
   */
  markAllAsReviewed: async (featureName) => {
    const response = await api.post(
      `/api/curation/go/${encodeURIComponent(featureName)}/review-all`
    );
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
