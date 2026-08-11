/**
 * Curator Report API module - canned database statistics for grant reporting.
 *
 * Requires curator authentication.
 */
import api from './config';

export const curatorReportApi = {
  /**
   * Get available reports and their parameter definitions.
   *
   * @returns {Promise<{reports: Array}>}
   */
  getDefinitions: async () => {
    const response = await api.get('/api/curation/reports');
    return response.data;
  },

  /**
   * Run a report.
   *
   * @param {string} reportId - Report id
   * @param {Object} params - Report parameters (empty values are dropped)
   * @returns {Promise<{columns: string[], rows: Array[]}>}
   */
  run: async (reportId, params = {}) => {
    const cleaned = {};
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        cleaned[key] = value;
      }
    });
    const response = await api.get(`/api/curation/reports/${encodeURIComponent(reportId)}`, {
      params: cleaned,
    });
    return response.data;
  },
};

export default curatorReportApi;
