/**
 * Batch Download API Client
 */
import api, { API_BASE_URL } from './config';

const batchDownloadApi = {
  /**
   * Get available data types
   */
  getDataTypes: async () => {
    const response = await api.get('/api/batch-download/types');
    return response.data;
  },

  /**
   * Get metadata about what would be downloaded
   */
  getMetadata: async (params) => {
    // Use POST for large gene lists to avoid URL length limits
    const requestBody = {
      genes: params.genes,
      data_types: params.dataTypes,
      flank_left: params.flankLeft || 0,
      flank_right: params.flankRight || 0,
      compress: params.compress !== false,
    };
    if (params.organism) {
      requestBody.organism = params.organism;
    }
    const response = await api.post('/api/batch-download/metadata', requestBody, {
      timeout: 300000, // 5 minutes for large gene lists
    });
    return response.data;
  },

  /**
   * Download batch data (returns blob URL for download)
   */
  download: async (params) => {
    const requestBody = {
      genes: params.genes,
      data_types: params.dataTypes,
      flank_left: params.flankLeft || 0,
      flank_right: params.flankRight || 0,
      compress: params.compress !== false,
    };
    if (params.organism) {
      requestBody.organism = params.organism;
    }
    const response = await api.post('/api/batch-download', requestBody, {
      responseType: 'blob',
      timeout: 600000, // 10 minutes for large downloads
    });

    return response;
  },

  /**
   * Get the download URL for GET request (useful for direct browser download)
   */
  getDownloadUrl: (params) => {
    const queryParams = new URLSearchParams();
    queryParams.set('genes', params.genes.join(','));
    queryParams.set('types', params.dataTypes.join(','));
    if (params.flankLeft) queryParams.set('flankl', params.flankLeft);
    if (params.flankRight) queryParams.set('flankr', params.flankRight);
    if (params.compress !== undefined) queryParams.set('compress', params.compress);

    return `${API_BASE_URL}/api/batch-download?${queryParams}`;
  },

  /**
   * Upload file and download batch data
   */
  uploadAndDownload: async (file, params) => {
    const formData = new FormData();
    formData.append('file', file);

    const queryParams = new URLSearchParams();
    queryParams.set('types', params.dataTypes.join(','));
    if (params.flankLeft) queryParams.set('flankl', params.flankLeft);
    if (params.flankRight) queryParams.set('flankr', params.flankRight);
    if (params.compress !== undefined) queryParams.set('compress', params.compress);

    const response = await api.post(
      `/api/batch-download/upload?${queryParams}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        responseType: 'blob',
        timeout: 600000, // 10 minutes for large downloads
      }
    );

    return response;
  },
};

export default batchDownloadApi;
