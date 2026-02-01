import api from './config';

export const goApi = {
  /**
   * Get GO term info and annotations by GOID
   * @param {string} goid - GO identifier (e.g., "GO:0005634" or "5634")
   */
  getGoTerm: async (goid) => {
    const response = await api.get(`/api/go/${encodeURIComponent(goid)}`);
    return response.data;
  },

  /**
   * Get all GO evidence codes with definitions and examples
   */
  getEvidenceCodes: async () => {
    const response = await api.get('/api/go/evidence');
    return response.data;
  },

  /**
   * Get GO term hierarchy (ancestors/descendants) for diagram visualization
   * @param {string} goid - GO identifier (e.g., "GO:0005634" or "5634")
   * @param {Object} options - Optional parameters
   * @param {number} options.maxNodes - Maximum number of nodes to return (default: 30)
   */
  getGoHierarchy: async (goid, options = {}) => {
    const params = new URLSearchParams();
    if (options.maxNodes) params.append('max_nodes', options.maxNodes);
    const url = `/api/go/${encodeURIComponent(goid)}/hierarchy${params.toString() ? '?' + params : ''}`;
    const response = await api.get(url);
    return response.data;
  },
};

export default goApi;
