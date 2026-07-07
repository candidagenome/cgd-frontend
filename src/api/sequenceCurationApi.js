/**
 * Sequence Curation API module for chromosome/contig sequence updates.
 *
 * Requires curator authentication.
 */
import api from './config';

export const sequenceCurationApi = {
  /**
   * Get all root sequences (chromosomes/contigs) grouped by assembly.
   *
   * @returns {Promise<{assemblies: Array<{assembly: string, sequences: Array}>}>}
   */
  getRootSequences: async () => {
    const response = await api.get('/api/curation/sequence/root-sequences');
    return response.data;
  },

  /**
   * Get a segment of sequence starting at a coordinate.
   *
   * @param {string} featureName - Chromosome/contig name
   * @param {number} start - Starting coordinate (1-based)
   * @param {number} [length=100] - Number of nucleotides to return
   * @returns {Promise<{feature_name: string, seq_length: number, start: number, end: number, sequence: string}>}
   */
  getSequenceSegment: async (featureName, start, length = 100) => {
    const response = await api.get('/api/curation/sequence/segment', {
      params: { feature_name: featureName, start, length },
    });
    return response.data;
  },

  /**
   * Preview sequence changes without committing.
   *
   * @param {string} featureName - Chromosome/contig name
   * @param {Array<{type: string, position?: number, start?: number, end?: number, sequence?: string}>} changes - List of changes
   * @returns {Promise<{feature_name: string, old_length: number, new_length: number, net_change: number, changes: Array, affected_features: Array}>}
   */
  previewChanges: async (featureName, changes) => {
    const response = await api.post('/api/curation/sequence/preview', {
      feature_name: featureName,
      changes,
    });
    return response.data;
  },

  /**
   * Commit sequence changes (v1: equal-length substitutions only).
   *
   * @param {string} featureName - Chromosome/contig name
   * @param {Array<{type: string, start?: number, end?: number, sequence?: string}>} changes
   * @param {string} note - Required note describing the change
   * @param {Object} [opts]
   * @param {number[]} [opts.referenceNos=[]] - CGD reference_no(s) to link to the note
   * @param {boolean} [opts.dryRun=false] - If true, validate against the DB and roll back
   * @returns {Promise<Object>} apply result (new_root_seq_no, feat_locations_repointed, ...)
   */
  applyChanges: async (featureName, changes, note, { referenceNos = [], dryRun = false } = {}) => {
    const response = await api.post('/api/curation/sequence/apply', {
      feature_name: featureName,
      changes,
      note,
      reference_nos: referenceNos,
      dry_run: dryRun,
    });
    return response.data;
  },

  /**
   * Get features near a given coordinate.
   *
   * @param {string} featureName - Chromosome/contig name
   * @param {number} position - Coordinate to search around
   * @param {number} [rangeSize=5000] - Size of range to search
   * @returns {Promise<{features: Array, position: number, range_size: number}>}
   */
  getNearbyFeatures: async (featureName, position, rangeSize = 5000) => {
    const response = await api.get('/api/curation/sequence/nearby-features', {
      params: { feature_name: featureName, position, range_size: rangeSize },
    });
    return response.data;
  },
};

export default sequenceCurationApi;
