/**
 * Chromosome API Client
 */
import api from './config';

const chromosomeApi = {
  /**
   * List all chromosomes grouped by organism
   *
   * @returns {Promise<Object>} List of organisms with their chromosomes
   */
  list: async () => {
    const response = await api.get('/api/chromosome');
    return response.data;
  },

  /**
   * Get basic chromosome/contig info
   *
   * @param {string} name - Chromosome/contig name
   * @returns {Promise<Object>} Chromosome info
   */
  getInfo: async (name) => {
    const response = await api.get(`/api/chromosome/${encodeURIComponent(name)}`);
    return response.data;
  },

  /**
   * Get chromosome history (sequence changes, annotation changes, notes)
   *
   * @param {string} name - Chromosome/contig name
   * @returns {Promise<Object>} History data
   */
  getHistory: async (name) => {
    const response = await api.get(`/api/chromosome/${encodeURIComponent(name)}/history`);
    return response.data;
  },

  /**
   * Get chromosome references
   *
   * @param {string} name - Chromosome/contig name
   * @returns {Promise<Object>} References list
   */
  getReferences: async (name) => {
    const response = await api.get(`/api/chromosome/${encodeURIComponent(name)}/references`);
    return response.data;
  },

  /**
   * Get chromosome summary notes/paragraphs
   *
   * @param {string} name - Chromosome/contig name
   * @returns {Promise<Object>} Summary notes
   */
  getSummaryNotes: async (name) => {
    const response = await api.get(`/api/chromosome/${encodeURIComponent(name)}/summary_notes`);
    return response.data;
  },
};

export default chromosomeApi;
