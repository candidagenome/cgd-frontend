/**
 * Paragraph Curation API - Manage locus page paragraphs.
 */

import api from './config';

const BASE_URL = '/api/curation/paragraph';

/**
 * Get list of organisms for dropdown.
 * @returns {Promise<{organisms: Array}>}
 */
export const getOrganisms = async () => {
  const response = await api.get(`${BASE_URL}/organisms`);
  return response.data;
};

/**
 * Get all paragraphs for a feature.
 * @param {string} featureName - Feature name
 * @param {string} [organism] - Organism abbreviation
 * @returns {Promise<Object>}
 */
export const getParagraphsForFeature = async (featureName, organism) => {
  const params = organism ? { organism } : {};
  const response = await api.get(
    `${BASE_URL}/feature/${encodeURIComponent(featureName)}`,
    { params }
  );
  return response.data;
};

/**
 * Get full details for a paragraph.
 * @param {number} paragraphNo - Paragraph number
 * @returns {Promise<Object>}
 */
export const getParagraphDetails = async (paragraphNo) => {
  const response = await api.get(`${BASE_URL}/${paragraphNo}`);
  return response.data;
};

/**
 * Create a new paragraph and link to features.
 * @param {Object} data
 * @param {string} data.paragraph_text - Paragraph text
 * @param {string[]} data.feature_names - Feature names to link
 * @param {string} data.organism_abbrev - Organism abbreviation
 * @returns {Promise<Object>}
 */
export const createParagraph = async (data) => {
  const response = await api.post(BASE_URL, data);
  return response.data;
};

/**
 * Update paragraph text.
 * @param {number} paragraphNo - Paragraph number
 * @param {Object} data
 * @param {string} data.paragraph_text - New text
 * @param {boolean} data.update_date - Whether to update date_edited
 * @returns {Promise<Object>}
 */
export const updateParagraph = async (paragraphNo, data) => {
  const response = await api.put(`${BASE_URL}/${paragraphNo}`, data);
  return response.data;
};

/**
 * Reorder paragraphs for a feature.
 * @param {number} featureNo - Feature number
 * @param {Array<{paragraph_no: number, order: number}>} paragraphOrders
 * @returns {Promise<Object>}
 */
export const reorderParagraphs = async (featureNo, paragraphOrders) => {
  const response = await api.post(`${BASE_URL}/feature/${featureNo}/reorder`, {
    paragraph_orders: paragraphOrders,
  });
  return response.data;
};

/**
 * Link a paragraph to a feature.
 * @param {number} paragraphNo - Paragraph number
 * @param {string} featureName - Feature name
 * @param {string} organismAbbrev - Organism abbreviation
 * @returns {Promise<Object>}
 */
export const linkFeature = async (paragraphNo, featureName, organismAbbrev) => {
  const response = await api.post(`${BASE_URL}/${paragraphNo}/link`, {
    feature_name: featureName,
    organism_abbrev: organismAbbrev,
  });
  return response.data;
};

/**
 * Unlink a paragraph from a feature.
 * @param {number} paragraphNo - Paragraph number
 * @param {number} featureNo - Feature number
 * @returns {Promise<Object>}
 */
export const unlinkFeature = async (paragraphNo, featureNo) => {
  const response = await api.delete(
    `${BASE_URL}/${paragraphNo}/feature/${featureNo}`
  );
  return response.data;
};

export default {
  getOrganisms,
  getParagraphsForFeature,
  getParagraphDetails,
  createParagraph,
  updateParagraph,
  reorderParagraphs,
  linkFeature,
  unlinkFeature,
};
