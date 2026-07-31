import api from './config';

export const statsApi = {
  /**
   * Get database-wide totals (genes, references, phenotypes, GO annotations,
   * ortholog clusters, interactions, colleagues) for the Explore landing page.
   * @returns {Promise<Object>} Summary counts
   */
  getSummary: async () => {
    const response = await api.get('/api/stats/summary');
    return response.data;
  },

  /**
   * Get the deterministic gene of the day (rotates once per calendar day).
   * @returns {Promise<Object>} Gene-of-the-day details
   */
  getGeneOfTheDay: async () => {
    const response = await api.get('/api/gene-of-the-day');
    return response.data;
  },
};

export default statsApi;
