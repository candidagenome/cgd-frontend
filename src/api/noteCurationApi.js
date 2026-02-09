/**
 * Note Curation API module for curator notes.
 *
 * Requires curator authentication.
 */
import api from './config';

export const noteCurationApi = {
  /**
   * Get available note types.
   *
   * @returns {Promise<{note_types: string[]}>}
   */
  getNoteTypes: async () => {
    const response = await api.get('/api/curation/note/types');
    return response.data;
  },

  /**
   * Get tables that can be linked to notes.
   *
   * @returns {Promise<{tables: string[]}>}
   */
  getLinkableTables: async () => {
    const response = await api.get('/api/curation/note/linkable-tables');
    return response.data;
  },

  /**
   * Search notes by text or type.
   *
   * @param {Object} params - Search parameters
   * @param {string} [params.query] - Search text
   * @param {string} [params.noteType] - Note type filter
   * @param {number} [params.page=1] - Page number
   * @param {number} [params.pageSize=50] - Results per page
   * @returns {Promise<{notes: Array, total: number, page: number, page_size: number}>}
   */
  searchNotes: async ({ query, noteType, page = 1, pageSize = 50 } = {}) => {
    const params = { page, page_size: pageSize };
    if (query) params.query = query;
    if (noteType) params.note_type = noteType;

    const response = await api.get('/api/curation/note/search', { params });
    return response.data;
  },

  /**
   * Get full note details including linked entities.
   *
   * @param {number} noteNo - Note number
   * @returns {Promise<Object>} - Note details with linked entities
   */
  getNoteDetails: async (noteNo) => {
    const response = await api.get(`/api/curation/note/${noteNo}`);
    return response.data;
  },

  /**
   * Create a new note with optional entity links.
   *
   * @param {string} noteText - Note text
   * @param {string} noteType - Note type
   * @param {Array} [linkedEntities] - Entities to link [{tab_name, primary_key}]
   * @returns {Promise<{note_no: number, message: string}>}
   */
  createNote: async (noteText, noteType, linkedEntities = null) => {
    const data = {
      note_text: noteText,
      note_type: noteType,
    };
    if (linkedEntities && linkedEntities.length > 0) {
      data.linked_entities = linkedEntities;
    }

    const response = await api.post('/api/curation/note/', data);
    return response.data;
  },

  /**
   * Update note text and/or type.
   *
   * @param {number} noteNo - Note number
   * @param {Object} data - Fields to update
   * @param {string} [data.noteText] - New note text
   * @param {string} [data.noteType] - New note type
   * @returns {Promise<{success: boolean, message: string}>}
   */
  updateNote: async (noteNo, { noteText, noteType }) => {
    const data = {};
    if (noteText !== undefined) data.note_text = noteText;
    if (noteType !== undefined) data.note_type = noteType;

    const response = await api.put(`/api/curation/note/${noteNo}`, data);
    return response.data;
  },

  /**
   * Delete a note and all its entity links.
   *
   * @param {number} noteNo - Note number
   * @returns {Promise<{success: boolean, message: string}>}
   */
  deleteNote: async (noteNo) => {
    const response = await api.delete(`/api/curation/note/${noteNo}`);
    return response.data;
  },

  /**
   * Link a note to an entity.
   *
   * @param {number} noteNo - Note number
   * @param {string} tabName - Table name
   * @param {number} primaryKey - Primary key in the table
   * @returns {Promise<{note_link_no: number, message: string}>}
   */
  linkNoteToEntity: async (noteNo, tabName, primaryKey) => {
    const response = await api.post(`/api/curation/note/${noteNo}/link`, {
      tab_name: tabName,
      primary_key: primaryKey,
    });
    return response.data;
  },

  /**
   * Unlink a note from an entity.
   *
   * @param {number} noteLinkNo - Note link number
   * @returns {Promise<{success: boolean, message: string}>}
   */
  unlinkNoteFromEntity: async (noteLinkNo) => {
    const response = await api.delete(`/api/curation/note/link/${noteLinkNo}`);
    return response.data;
  },

  /**
   * Get all notes linked to a specific entity.
   *
   * @param {string} tabName - Table name
   * @param {number} primaryKey - Primary key
   * @returns {Promise<{notes: Array}>}
   */
  getNotesForEntity: async (tabName, primaryKey) => {
    const response = await api.get(`/api/curation/note/entity/${tabName}/${primaryKey}`);
    return response.data;
  },
};

export default noteCurationApi;
