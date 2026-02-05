/**
 * Restriction Mapper API Client
 */
import api, { API_BASE_URL } from './config';

const restrictionMapperApi = {
  /**
   * Get restriction mapper configuration (enzyme filters, total enzymes)
   */
  getConfig: async () => {
    const response = await api.get('/api/restriction-mapper/config');
    return response.data;
  },

  /**
   * Run restriction enzyme mapping
   *
   * @param {Object} params - Search parameters
   * @param {string} params.locus - Gene name, ORF, or CGDID (optional)
   * @param {string} params.sequence - Raw DNA sequence (optional)
   * @param {string} params.sequence_name - Name for the sequence (optional)
   * @param {string} params.enzyme_filter - Enzyme filter type
   */
  search: async (params) => {
    const response = await api.post('/api/restriction-mapper/search', params);
    return response.data;
  },

  /**
   * Get download URL for restriction mapping results TSV
   *
   * @param {Object} params - Same as search params
   * @returns {string} URL for downloading results
   */
  getDownloadUrl: (params) => {
    // For downloads, we use a form submission approach or direct URL
    const queryParams = new URLSearchParams();
    if (params.locus) queryParams.set('locus', params.locus);
    if (params.sequence) queryParams.set('seq', params.sequence);
    if (params.sequence_name) queryParams.set('name', params.sequence_name);
    if (params.enzyme_filter) queryParams.set('filter', params.enzyme_filter);
    return `${API_BASE_URL}/api/restriction-mapper/search?${queryParams.toString()}`;
  },

  /**
   * Download restriction mapping results as TSV
   *
   * @param {Object} params - Search parameters
   */
  downloadResults: async (params) => {
    const response = await api.post('/api/restriction-mapper/download', params, {
      responseType: 'blob',
    });

    // Create download link
    const blob = new Blob([response.data], { type: 'text/tab-separated-values' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    // Get filename from Content-Disposition header or use default
    const contentDisposition = response.headers['content-disposition'];
    let filename = 'restriction_map.tsv';
    if (contentDisposition) {
      const match = contentDisposition.match(/filename=([^;]+)/);
      if (match) {
        filename = match[1].replace(/"/g, '');
      }
    }

    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  /**
   * Download non-cutting enzymes list as TSV
   *
   * @param {Object} params - Search parameters
   */
  downloadNonCutting: async (params) => {
    const response = await api.post('/api/restriction-mapper/download/no-cut', params, {
      responseType: 'blob',
    });

    // Create download link
    const blob = new Blob([response.data], { type: 'text/tab-separated-values' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    // Get filename from Content-Disposition header or use default
    const contentDisposition = response.headers['content-disposition'];
    let filename = 'non_cutting_enzymes.tsv';
    if (contentDisposition) {
      const match = contentDisposition.match(/filename=([^;]+)/);
      if (match) {
        filename = match[1].replace(/"/g, '');
      }
    }

    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};

export default restrictionMapperApi;
