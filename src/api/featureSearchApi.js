/**
 * Feature Search (Advanced Search) API Client
 */
import api from './config';

const featureSearchApi = {
  /**
   * Get feature search configuration (organisms, feature types, qualifiers, etc.)
   */
  getConfig: async (organism = null) => {
    const params = organism ? { organism } : {};
    const response = await api.get('/api/feature-search/config', { params });
    return response.data;
  },

  /**
   * Execute feature search
   *
   * @param {Object} params - Search parameters
   * @param {string} params.organism - Organism abbreviation (required)
   * @param {string[]} params.feature_types - Feature types to include
   * @param {boolean} params.include_all_types - Include all feature types
   * @param {string[]} params.qualifiers - Feature qualifiers filter
   * @param {boolean|null} params.has_introns - Intron presence filter
   * @param {string[]} params.chromosomes - Chromosome filter
   * @param {number[]} params.process_goids - GO Process term GOIDs
   * @param {number[]} params.function_goids - GO Function term GOIDs
   * @param {number[]} params.component_goids - GO Component term GOIDs
   * @param {number[]} params.additional_goids - Additional GOIDs
   * @param {string[]} params.annotation_methods - GO annotation methods
   * @param {string[]} params.evidence_codes - GO evidence codes
   * @param {number} params.page - Page number
   * @param {number} params.page_size - Results per page
   * @param {string} params.sort_by - Sort field
   */
  search: async (params) => {
    const response = await api.post('/api/feature-search/search', params);
    return response.data;
  },

  /**
   * Get chromosomes for a specific organism
   */
  getChromosomes: async (organism) => {
    const response = await api.get(`/api/feature-search/chromosomes/${organism}`);
    return response.data;
  },

  /**
   * Download search results as TSV
   */
  downloadResults: async (params) => {
    const response = await api.post('/api/feature-search/download', params, {
      responseType: 'blob',
    });

    // Create download link
    const blob = new Blob([response.data], { type: 'text/tab-separated-values' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'feature_search_results.tsv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};

export default featureSearchApi;
