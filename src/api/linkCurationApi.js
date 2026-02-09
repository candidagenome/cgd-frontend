/**
 * Link Curation API - Manage links and pull-downs for Locus page.
 */

import api from './config';

const BASE_URL = '/api/curation/links';

/**
 * Get feature info for link management.
 * @param {string} organismAbbrev - Organism abbreviation
 * @param {string} featureName - Feature name to look up
 * @returns {Promise<{found: boolean, feature?: Object}>}
 */
export const getFeatureInfo = async (organismAbbrev, featureName) => {
  const response = await api.get(
    `${BASE_URL}/feature/${encodeURIComponent(organismAbbrev)}/${encodeURIComponent(featureName)}`
  );
  return response.data;
};

/**
 * Get available link types for a feature type.
 * @param {string} featureType - Feature type (e.g., "ORF", "pseudogene")
 * @returns {Promise<{links: Array, feature_type: string}>}
 */
export const getAvailableLinks = async (featureType) => {
  const response = await api.get(
    `${BASE_URL}/available/${encodeURIComponent(featureType)}`
  );
  return response.data;
};

/**
 * Get currently selected links for a feature.
 * @param {number} featureNo - Feature number
 * @returns {Promise<{links: Array}>}
 */
export const getCurrentLinks = async (featureNo) => {
  const response = await api.get(`${BASE_URL}/current/${featureNo}`);
  return response.data;
};

/**
 * Update links for a feature.
 * @param {number} featureNo - Feature number
 * @param {Array} selectedLinks - Array of {url_no, link_table} objects
 * @returns {Promise<{success: boolean, added: number, removed: number, total: number, message: string}>}
 */
export const updateLinks = async (featureNo, selectedLinks) => {
  const response = await api.post(`${BASE_URL}/update`, {
    feature_no: featureNo,
    selected_links: selectedLinks,
  });
  return response.data;
};

export default {
  getFeatureInfo,
  getAvailableLinks,
  getCurrentLinks,
  updateLinks,
};
