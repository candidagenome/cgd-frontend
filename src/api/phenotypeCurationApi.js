/**
 * Phenotype Curation API module for phenotype annotation CRUD operations.
 *
 * Requires curator authentication.
 */
import api from './config';

// Cache for CV term data to avoid redundant API calls
const cvTreeCache = new Map();
const cvTermsCache = new Map();

export const phenotypeCurationApi = {
  /**
   * Get all phenotype annotations for a feature.
   *
   * @param {string} featureName - Feature name or gene name
   * @param {string} [organismAbbrev] - Optional organism abbreviation to filter by
   * @returns {Promise<{feature_no: number, feature_name: string, gene_name: string, annotations: Array}>}
   */
  getAnnotations: async (featureName, organismAbbrev = null) => {
    const params = {};
    if (organismAbbrev) {
      params.organism = organismAbbrev;
    }
    const response = await api.get(`/api/curation/phenotype/${encodeURIComponent(featureName)}`, { params });
    return response.data;
  },

  /**
   * Create a new phenotype annotation.
   *
   * @param {string} featureName - Feature name
   * @param {Object} data - Annotation data
   * @param {string} data.experiment_type - Experiment type (CV term)
   * @param {string} data.mutant_type - Mutant type (CV term)
   * @param {string} data.observable - Observable (CV term)
   * @param {string} [data.qualifier] - Qualifier (CV term)
   * @param {number} data.reference_no - Reference number
   * @param {string} [data.experiment_comment] - Experiment comment
   * @param {Array<{property_type: string, property_value: string, property_description?: string}>} [data.properties] - Properties
   * @returns {Promise<{pheno_annotation_no: number, message: string}>}
   */
  createAnnotation: async (featureName, data) => {
    const response = await api.post(`/api/curation/phenotype/${encodeURIComponent(featureName)}`, data);
    return response.data;
  },

  /**
   * Delete a phenotype annotation.
   *
   * @param {number} annotationNo - Phenotype annotation number
   * @returns {Promise<{success: boolean, message: string}>}
   */
  deleteAnnotation: async (annotationNo) => {
    const response = await api.delete(`/api/curation/phenotype/${annotationNo}`);
    return response.data;
  },

  /**
   * Get CV terms for dropdowns (cached).
   *
   * @param {string} cvName - CV name (experiment_type, mutant_type, qualifier)
   * @returns {Promise<{cv_name: string, terms: string[]}>}
   */
  getCVTerms: async (cvName) => {
    // Return cached data if available
    if (cvTermsCache.has(cvName)) {
      return cvTermsCache.get(cvName);
    }
    const response = await api.get(`/api/curation/phenotype/cv/${encodeURIComponent(cvName)}`);
    cvTermsCache.set(cvName, response.data);
    return response.data;
  },

  /**
   * Get hierarchical CV terms as a tree structure (cached).
   *
   * @param {string} cvName - CV name (experiment_type, mutant_type, qualifier, observable)
   * @returns {Promise<{cv_name: string, tree: Array<{term: string, depth: number, children: Array}>}>}
   */
  getCVTermTree: async (cvName) => {
    // Return cached data if available
    if (cvTreeCache.has(cvName)) {
      return cvTreeCache.get(cvName);
    }
    const response = await api.get(`/api/curation/phenotype/cv-tree/${encodeURIComponent(cvName)}`);
    cvTreeCache.set(cvName, response.data);
    return response.data;
  },

  /**
   * Get valid property types for experiment properties.
   *
   * @returns {Promise<{property_types: string[]}>}
   */
  getPropertyTypes: async () => {
    const response = await api.get('/api/curation/phenotype/property-types');
    return response.data;
  },
};

export default phenotypeCurationApi;
