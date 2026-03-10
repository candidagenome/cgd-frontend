/**
 * Genome Snapshot API Client
 */
import api from './config';

const genomeSnapshotApi = {
  /**
   * Get list of available organisms for genome snapshot
   */
  getOrganisms: async () => {
    const response = await api.get('/api/genome-snapshot/organisms');
    return response.data;
  },

  /**
   * Get genome snapshot statistics for a specific organism
   *
   * @param {string} organismAbbrev - Organism abbreviation (e.g., C_albicans_SC5314)
   * @returns {Promise<Object>} Genome snapshot statistics
   */
  getSnapshot: async (organismAbbrev) => {
    const response = await api.get(`/api/genome-snapshot/${encodeURIComponent(organismAbbrev)}`);
    return response.data;
  },

  /**
   * Get GO Slim distribution for genome snapshot visualization
   *
   * @param {string} organismAbbrev - Organism abbreviation (e.g., C_albicans_SC5314)
   * @returns {Promise<Object>} GO Slim distribution data
   */
  getGoSlimDistribution: async (organismAbbrev) => {
    const response = await api.get(`/api/genome-snapshot/${encodeURIComponent(organismAbbrev)}/go-slim`);
    return response.data;
  },
};

export default genomeSnapshotApi;
