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

  /** Get recent creation counts for the Explore activity panel. */
  getRecentActivity: async (days = 90) => {
    const response = await api.get(`/api/stats/recent-activity?days=${days}`);
    return response.data;
  },

  /** Get a paginated list of ortholog clusters created in a recent window. */
  getRecentOrthologClusters: async ({ days = 90, page = 1, limit = 25, query = '' } = {}) => {
    const params = new URLSearchParams({ days, page, limit });
    if (query) params.set('query', query);
    const response = await api.get(`/api/stats/recent-ortholog-clusters?${params}`);
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

  /**
   * Get per-organism category totals for the Explore-page organism filter.
   * @returns {Promise<Object>} { by_organism: { <abbrev>: {...counts} } }
   */
  getCountsByOrganism: async () => {
    const response = await api.get('/api/stats/counts-by-organism');
    return response.data;
  },
};

export default statsApi;
