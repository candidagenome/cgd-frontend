/**
 * Coordinate and Relationship Curation API module.
 *
 * Requires curator authentication.
 */
import api from './config';

export const coordinateCurationApi = {
  /**
   * Get available sequence sources (assemblies/strains).
   *
   * @returns {Promise<{sources: string[]}>}
   */
  getSeqSources: async () => {
    const response = await api.get('/api/curation/coordinates/seq-sources');
    return response.data;
  },

  /**
   * Get available feature types.
   *
   * @returns {Promise<{types: string[]}>}
   */
  getFeatureTypes: async () => {
    const response = await api.get('/api/curation/coordinates/feature-types');
    return response.data;
  },

  /**
   * Get available relationship types.
   *
   * @returns {Promise<{types: string[]}>}
   */
  getRelationshipTypes: async () => {
    const response = await api.get('/api/curation/coordinates/relationship-types');
    return response.data;
  },

  /**
   * Get available feature qualifiers.
   *
   * @returns {Promise<{qualifiers: string[]}>}
   */
  getFeatureQualifiers: async () => {
    const response = await api.get('/api/curation/coordinates/feature-qualifiers');
    return response.data;
  },

  /**
   * Get feature information with coordinates and relationships.
   *
   * @param {string} featureName - Feature or gene name
   * @param {string} [seqSource] - Optional assembly/strain to filter by
   * @returns {Promise<{feature_no: number, feature_name: string, location: Object, subfeatures: Array, parents: Array}>}
   */
  getFeatureInfo: async (featureName, seqSource = null) => {
    const params = seqSource ? { seq_source: seqSource } : {};
    const response = await api.get(
      `/api/curation/coordinates/feature/${encodeURIComponent(featureName)}`,
      { params }
    );
    return response.data;
  },

  /**
   * Preview coordinate changes without committing.
   *
   * @param {string} featureName - Feature name
   * @param {string} seqSource - Assembly/strain
   * @param {Array<{feature_no: number, start_coord?: number, stop_coord?: number, strand?: string}>} changes - Coordinate changes
   * @returns {Promise<{feature_name: string, seq_source: string, changes: Array, change_count: number}>}
   */
  previewChanges: async (featureName, seqSource, changes) => {
    const response = await api.post('/api/curation/coordinates/preview', {
      feature_name: featureName,
      seq_source: seqSource,
      changes,
    });
    return response.data;
  },

  /**
   * Search for features by name.
   *
   * @param {string} query - Search term (min 2 characters)
   * @param {number} [limit=20] - Maximum results
   * @returns {Promise<{results: Array, count: number}>}
   */
  searchFeatures: async (query, limit = 20) => {
    const response = await api.get('/api/curation/coordinates/search', {
      params: { query, limit },
    });
    return response.data;
  },
};

export default coordinateCurationApi;
