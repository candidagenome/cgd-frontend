/**
 * WebPrimer API Client
 */
import api from './config';

const webprimerApi = {
  /**
   * Get default configuration for primer design
   *
   * @returns {Promise<Object>} Default parameters
   */
  getConfig: async () => {
    const response = await api.get('/api/webprimer/config');
    return response.data;
  },

  /**
   * Get genomic sequence for a locus
   *
   * @param {string} locus - Gene/ORF name
   * @returns {Promise<Object>} Sequence data
   */
  getSequence: async (locus) => {
    const response = await api.get(`/api/webprimer/sequence/${encodeURIComponent(locus)}`);
    return response.data;
  },

  /**
   * Design primers
   *
   * @param {Object} params - Primer design parameters
   * @returns {Promise<Object>} Primer design results
   */
  design: async (params) => {
    const response = await api.post('/api/webprimer/design', params);
    return response.data;
  },
};

export default webprimerApi;
