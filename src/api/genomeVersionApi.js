/**
 * Genome Version History API Client
 */
import api from './config';

const genomeVersionApi = {
  /**
   * Get genome version page configuration
   * Returns available strains/assemblies and version format explanation
   */
  getConfig: async () => {
    const response = await api.get('/api/genome-version/config');
    return response.data;
  },

  /**
   * Get genome version history for a specific strain/assembly
   *
   * @param {string} seqSource - Organism abbreviation (e.g., C_albicans_SC5314)
   * @returns {Promise<Object>} Genome version history
   */
  getHistory: async (seqSource) => {
    const response = await api.get(`/api/genome-version/history/${encodeURIComponent(seqSource)}`);
    return response.data;
  },
};

export default genomeVersionApi;
