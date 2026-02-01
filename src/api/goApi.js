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
};

export default goApi;
