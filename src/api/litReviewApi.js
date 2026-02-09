/**
 * Literature Review API - Triage PubMed papers from review queue.
 */

import api from './config';

const BASE_URL = '/api/curation/litreview';

/**
 * Get papers pending review from REF_TEMP.
 * @param {Object} params
 * @param {number} [params.limit=200] - Maximum papers to return
 * @param {number} [params.offset=0] - Offset for pagination
 * @returns {Promise<{papers: Array, total: number, limit: number, offset: number}>}
 */
export const getPendingPapers = async (params = {}) => {
  const response = await api.get(`${BASE_URL}/papers`, { params });
  return response.data;
};

/**
 * Get a single paper from review queue by PubMed ID.
 * @param {number} pubmed - PubMed ID
 * @returns {Promise<Object>}
 */
export const getPaper = async (pubmed) => {
  const response = await api.get(`${BASE_URL}/papers/${pubmed}`);
  return response.data;
};

/**
 * Get list of organisms for dropdown.
 * @returns {Promise<{organisms: Array}>}
 */
export const getOrganisms = async () => {
  const response = await api.get(`${BASE_URL}/organisms`);
  return response.data;
};

/**
 * Add a paper with "Not yet curated" status.
 * @param {number} pubmed - PubMed ID
 * @returns {Promise<Object>}
 */
export const triageAdd = async (pubmed) => {
  const response = await api.post(`${BASE_URL}/triage/add`, { pubmed });
  return response.data;
};

/**
 * Add a paper with "High Priority" status.
 * @param {Object} data
 * @param {number} data.pubmed - PubMed ID
 * @param {string[]} [data.feature_names] - Gene names to link
 * @param {string} [data.organism_abbrev] - Organism abbreviation
 * @returns {Promise<Object>}
 */
export const triageHighPriority = async (data) => {
  const response = await api.post(`${BASE_URL}/triage/high-priority`, data);
  return response.data;
};

/**
 * Discard a paper (add to REF_BAD).
 * @param {number} pubmed - PubMed ID
 * @returns {Promise<Object>}
 */
export const triageDiscard = async (pubmed) => {
  const response = await api.post(`${BASE_URL}/triage/discard`, { pubmed });
  return response.data;
};

/**
 * Process multiple triage actions in one request.
 * @param {Array<{pubmed: number, action: string, feature_names?: string[], organism_abbrev?: string}>} actions
 * @returns {Promise<{results: Array, total_processed: number, successful: number}>}
 */
export const triageBatch = async (actions) => {
  const response = await api.post(`${BASE_URL}/triage/batch`, { actions });
  return response.data;
};

export default {
  getPendingPapers,
  getPaper,
  getOrganisms,
  triageAdd,
  triageHighPriority,
  triageDiscard,
  triageBatch,
};
