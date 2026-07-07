/**
 * Feature Merge API module.
 *
 * Merge two ORF features into one after a sequence-error correction makes them a
 * single gene. Requires curator authentication.
 */
import api from './config';

export const featureMergeApi = {
  /**
   * Get a feature summary (location, CDS children, annotation counts) for the
   * merge form.
   *
   * @param {string} featureName
   * @returns {Promise<Object>}
   */
  getFeatureSummary: async (featureName) => {
    const response = await api.get('/api/curation/feature-merge/feature-summary', {
      params: { feature_name: featureName },
    });
    return response.data;
  },

  /**
   * Merge (or preview merging) two features.
   *
   * @param {Object} params
   * @param {string} params.survivorName - Feature that survives and is extended
   * @param {string} params.retireName - Feature retired into the survivor
   * @param {number} params.newStopCoord - New far-boundary coord for the survivor
   * @param {string} params.note - Required note describing the merge
   * @param {number[]} [params.referenceNos=[]] - CGD reference_no(s) to link
   * @param {boolean} [params.dryRun=false] - If true, validate and roll back
   * @returns {Promise<Object>} merge plan/result
   */
  merge: async ({ survivorName, retireName, newStopCoord, note, referenceNos = [], dryRun = false }) => {
    const response = await api.post('/api/curation/feature-merge/merge', {
      survivor_name: survivorName,
      retire_name: retireName,
      new_stop_coord: newStopCoord,
      note,
      reference_nos: referenceNos,
      dry_run: dryRun,
    });
    return response.data;
  },
};

export default featureMergeApi;
