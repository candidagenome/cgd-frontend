/**
 * Feature Curation API - Create new features (ORFs, genes, etc.)
 */

import api from './config';

const BASE_URL = '/api/curation/feature';

/**
 * Get list of organisms for dropdown.
 * @returns {Promise<{organisms: Array}>}
 */
export const getOrganisms = async () => {
  const response = await api.get(`${BASE_URL}/organisms`);
  return response.data;
};

/**
 * Get chromosomes for an organism.
 * @param {string} organismAbbrev - Organism abbreviation
 * @returns {Promise<{chromosomes: Array}>}
 */
export const getChromosomes = async (organismAbbrev) => {
  const response = await api.get(`${BASE_URL}/chromosomes/${encodeURIComponent(organismAbbrev)}`);
  return response.data;
};

/**
 * Get valid feature types.
 * @returns {Promise<{feature_types: string[]}>}
 */
export const getFeatureTypes = async () => {
  const response = await api.get(`${BASE_URL}/feature-types`);
  return response.data;
};

/**
 * Get valid feature qualifiers.
 * @returns {Promise<{qualifiers: string[]}>}
 */
export const getFeatureQualifiers = async () => {
  const response = await api.get(`${BASE_URL}/qualifiers`);
  return response.data;
};

/**
 * Get valid strand values.
 * @returns {Promise<{strands: string[]}>}
 */
export const getStrands = async () => {
  const response = await api.get(`${BASE_URL}/strands`);
  return response.data;
};

/**
 * Check if a feature name already exists.
 * @param {string} featureName - Feature name to check
 * @returns {Promise<{exists: boolean, feature_no?: number, feature_name?: string, gene_name?: string, feature_type?: string}>}
 */
export const checkFeatureExists = async (featureName) => {
  const response = await api.post(`${BASE_URL}/check`, {
    feature_name: featureName,
  });
  return response.data;
};

/**
 * Create a new feature.
 * @param {Object} data - Feature data
 * @param {string} data.feature_name - Systematic name for the feature
 * @param {string} data.feature_type - Feature type (ORF, pseudogene, etc.)
 * @param {string} data.organism_abbrev - Organism abbreviation
 * @param {string} [data.chromosome_name] - Chromosome name (for mapped features)
 * @param {number} [data.start_coord] - Start coordinate
 * @param {number} [data.stop_coord] - Stop coordinate
 * @param {string} [data.strand] - Strand: W (Watson) or C (Crick)
 * @param {string[]} [data.qualifiers] - Feature qualifiers
 * @param {number} [data.reference_no] - Reference number
 * @returns {Promise<{feature_no: number, feature_name: string, message: string}>}
 */
export const createFeature = async (data) => {
  const response = await api.post(`${BASE_URL}/`, data);
  return response.data;
};

/**
 * Delete a feature.
 * @param {number} featureNo - Feature number to delete
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const deleteFeature = async (featureNo) => {
  const response = await api.delete(`${BASE_URL}/${featureNo}`);
  return response.data;
};

/**
 * Get info about an existing feature for the add location form.
 * @param {string} organismAbbrev - Organism abbreviation
 * @param {string} featureName - Feature name to look up
 * @returns {Promise<{found: boolean, feature_no?: number, feature_name?: string, gene_name?: string, feature_type?: string, locations?: Array}>}
 */
export const getFeatureInfo = async (organismAbbrev, featureName) => {
  const response = await api.get(
    `${BASE_URL}/info/${encodeURIComponent(organismAbbrev)}/${encodeURIComponent(featureName)}`
  );
  return response.data;
};

/**
 * Add a new location to an existing feature.
 * @param {Object} data - Location data
 * @param {string} data.feature_name - Existing feature name
 * @param {string} data.organism_abbrev - Organism abbreviation
 * @param {string} data.chromosome_name - Chromosome name
 * @param {number} data.start_coord - Start coordinate
 * @param {number} data.stop_coord - Stop coordinate
 * @param {string} [data.strand] - Strand: W (Watson) or C (Crick)
 * @returns {Promise<{feature_no: number, feature_name: string, feat_location_no: number, message: string}>}
 */
export const addLocation = async (data) => {
  const response = await api.post(`${BASE_URL}/location`, data);
  return response.data;
};

export default {
  getOrganisms,
  getChromosomes,
  getFeatureTypes,
  getFeatureQualifiers,
  getStrands,
  checkFeatureExists,
  createFeature,
  deleteFeature,
  getFeatureInfo,
  addLocation,
};
