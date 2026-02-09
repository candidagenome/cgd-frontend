/**
 * Todo List API module for curator todo lists.
 *
 * Provides access to GO and Literature Guide todo lists.
 */
import api from './config';

export const todoListApi = {
  /**
   * Get valid years for GO todo list.
   *
   * @returns {Promise<{years: number[]}>}
   */
  getGoYears: async () => {
    const response = await api.get('/api/curation/todo/years/go');
    return response.data;
  },

  /**
   * Get GO annotations last reviewed in specified year.
   *
   * @param {number} year - Year to filter by
   * @param {string} [organism] - Optional organism filter
   * @param {number} [limit=50] - Max results per organism
   * @returns {Promise<{year: number, total_count: number, items: Array}>}
   */
  getGoTodoList: async (year, organism = null, limit = 50) => {
    const params = { year, limit };
    if (organism) params.organism = organism;

    const response = await api.get('/api/curation/todo/go', { params });
    return response.data;
  },

  /**
   * Get valid years for Literature Guide todo list.
   *
   * @returns {Promise<{years: number[]}>}
   */
  getLitguideYears: async () => {
    const response = await api.get('/api/curation/todo/years/litguide');
    return response.data;
  },

  /**
   * Get valid curation status values.
   *
   * @returns {Promise<{statuses: string[]}>}
   */
  getLitguideStatuses: async () => {
    const response = await api.get('/api/curation/todo/statuses/litguide');
    return response.data;
  },

  /**
   * Get literature references by curation status.
   *
   * @param {string} status - Curation status to filter by
   * @param {number} [year] - Optional year filter
   * @param {number} [limit=100] - Max results
   * @returns {Promise<{year: number|null, status: string, total_count: number, items: Array}>}
   */
  getLitguideTodoList: async (status = 'Not Yet Curated', year = null, limit = 100) => {
    const params = { status, limit };
    if (year) params.year = year;

    const response = await api.get('/api/curation/todo/litguide', { params });
    return response.data;
  },
};

export default todoListApi;
