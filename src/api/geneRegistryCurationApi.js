/**
 * Gene Registry Curation API - Process gene registry submissions.
 */

import api from './config';

const BASE_URL = '/api/curation/gene-registry';

/**
 * List all pending gene registry submissions.
 * @returns {Promise<{submissions: Array}>}
 */
export const listPendingSubmissions = async () => {
  const response = await api.get(`${BASE_URL}/pending`);
  return response.data;
};

/**
 * Get full details of a submission.
 * @param {string} submissionId - Submission ID
 * @returns {Promise<{found: boolean, submission?: Object}>}
 */
export const getSubmissionDetails = async (submissionId) => {
  const response = await api.get(`${BASE_URL}/${encodeURIComponent(submissionId)}`);
  return response.data;
};

/**
 * Process (commit) a gene registry submission.
 * @param {Object} data - Processing data
 * @param {string} data.submission_id - Submission ID
 * @param {string} data.gene_name - Gene name to register
 * @param {string} [data.orf_name] - ORF name
 * @param {string} data.organism_abbrev - Organism abbreviation
 * @param {string} [data.description] - Gene description
 * @param {string} [data.headline] - Gene headline
 * @param {string[]} [data.aliases] - Gene aliases
 * @param {number} [data.reference_no] - Reference number
 * @returns {Promise<{success: boolean, feature_no?: number, ...}>}
 */
export const processSubmission = async (data) => {
  const response = await api.post(`${BASE_URL}/process`, data);
  return response.data;
};

/**
 * Delay a submission for later processing.
 * @param {string} submissionId - Submission ID
 * @param {string} [comment] - Delay comment
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const delaySubmission = async (submissionId, comment) => {
  const response = await api.post(`${BASE_URL}/delay`, {
    submission_id: submissionId,
    comment,
  });
  return response.data;
};

/**
 * Delete a submission.
 * @param {string} submissionId - Submission ID
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const deleteSubmission = async (submissionId) => {
  const response = await api.delete(`${BASE_URL}/${encodeURIComponent(submissionId)}`);
  return response.data;
};

export default {
  listPendingSubmissions,
  getSubmissionDetails,
  processSubmission,
  delaySubmission,
  deleteSubmission,
};
