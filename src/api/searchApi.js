import api from './config';

export const searchApi = {
  /**
   * Get list of organisms for search filtering
   * @returns {Promise<Object>} List of organisms with organism_abbrev and organism_name
   */
  getOrganisms: async () => {
    const response = await api.get('/api/genome-snapshot/organisms');
    return response.data;
  },

  /**
   * Resolve an identifier to a direct URL (for exact matches)
   * @param {string} query - Identifier to resolve
   * @returns {Promise<Object>} Resolve response with redirect_url if found
   */
  resolve: async (query) => {
    const response = await api.get('/api/search/resolve', {
      params: { query },
    });
    return response.data;
  },

  /**
   * Quick search across all categories (genes, GO terms, phenotypes, references)
   * @param {string} query - Search query string
   * @param {number} limit - Max results per category (default 20)
   * @returns {Promise<Object>} Search response with results grouped by category
   */
  quickSearch: async (query, limit = 20) => {
    const response = await api.get('/api/search/quick', {
      params: { query, limit },
    });
    return response.data;
  },

  /**
   * Get autocomplete suggestions for search input
   * @param {string} query - Search query for suggestions
   * @param {number} limit - Max suggestions to return (default 10)
   * @returns {Promise<Object>} Autocomplete response with flat list of suggestions
   */
  autocomplete: async (query, limit = 10) => {
    const response = await api.get('/api/search/autocomplete', {
      params: { query, limit },
    });
    return response.data;
  },

  /**
   * Search within a specific category (returns all results)
   * @param {string} query - Search query string
   * @param {string} category - Category to search (genes, go_terms, phenotypes, references)
   * @returns {Promise<Object>} Search response with all results and total_count
   */
  searchCategory: async (query, category) => {
    const response = await api.get('/api/search/category', {
      params: { query, category },
    });
    return response.data;
  },

  /**
   * Full text search across all CGD categories
   * @param {string} query - Search query string
   * @param {number} limit - Max results per category (default 10)
   * @param {string} type - Optional filter: 'homolog' for orthologs only
   * @param {string} searchField - For papers: 'title', 'abstract', 'both', or 'all' (maps to 'both')
   * @param {string} matchMode - For multi-term: 'all' (AND) or 'any' (OR)
   * @returns {Promise<Object>} Text search response with results grouped by category
   */
  textSearch: async (query, limit = 10, type = null, searchField = 'both', matchMode = 'any') => {
    // Map 'all' (all fields) to 'both' for backend
    const apiSearchField = searchField === 'all' ? 'both' : searchField;
    const params = { query, limit, search_field: apiSearchField, match_mode: matchMode };
    if (type) params.type = type;
    const response = await api.get('/api/search/text', { params });
    return response.data;
  },

  /**
   * Text search within a specific category (returns all results)
   * @param {string} query - Search query string
   * @param {string} category - Category to search
   * @param {string} searchField - For papers: 'title', 'abstract', 'both', or 'all' (maps to 'both')
   * @param {string} matchMode - For multi-term: 'all' (AND) or 'any' (OR)
   * @returns {Promise<Object>} Text search response with all results and total_count
   */
  textSearchCategory: async (query, category, searchField = 'both', matchMode = 'any') => {
    // Map 'all' (all fields) to 'both' for backend
    const apiSearchField = searchField === 'all' ? 'both' : searchField;
    const response = await api.get('/api/search/text/category', {
      params: { query, category, search_field: apiSearchField, match_mode: matchMode },
    });
    return response.data;
  },
};

export default searchApi;
