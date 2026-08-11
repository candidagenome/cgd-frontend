/**
 * CV Admin API module - maintain CGD-managed controlled vocabularies
 * (phenotype strains, literature topics, etc.).
 *
 * Requires curator authentication.
 */
import api from './config';

export const cvAdminApi = {
  /**
   * List the CVs curators may edit through this tool.
   *
   * @returns {Promise<{cvs: Array}>}
   */
  getCvs: async () => {
    const response = await api.get('/api/curation/cv-admin/cvs');
    return response.data;
  },

  /**
   * Get all terms of a CV with parent assignments.
   *
   * @param {string} cvName - CV name (e.g. 'strain_background')
   * @returns {Promise<{cv_no: number, cv_name: string, terms: Array}>}
   */
  getTerms: async (cvName) => {
    const response = await api.get(`/api/curation/cv-admin/cv/${encodeURIComponent(cvName)}/terms`);
    return response.data;
  },

  /**
   * Add a new term to a CV.
   *
   * @param {string} cvName - CV name
   * @param {string} termName - New term name
   * @param {number|null} parentCvTermNo - Parent term, or null for top-level
   * @returns {Promise<Object>} - The created term with its cv_term_no
   */
  addTerm: async (cvName, termName, parentCvTermNo = null) => {
    const response = await api.post(`/api/curation/cv-admin/cv/${encodeURIComponent(cvName)}/terms`, {
      term_name: termName,
      parent_cv_term_no: parentCvTermNo,
    });
    return response.data;
  },
};

export default cvAdminApi;
