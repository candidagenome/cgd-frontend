/**
 * Sequence Alignment API module for comparing sequences.
 *
 * Requires curator authentication.
 */
import api from './config';

export const seqAlignmentApi = {
  /**
   * Align two sequences.
   *
   * @param {string} seq1 - First sequence
   * @param {string} seq2 - Second sequence
   * @param {string} [seq1Name='Current'] - Name for first sequence
   * @param {string} [seq2Name='New'] - Name for second sequence
   * @returns {Promise<{identity_percent: number, matches: number, blocks: Array}>}
   */
  alignSequences: async (seq1, seq2, seq1Name = 'Current', seq2Name = 'New') => {
    const response = await api.post('/api/curation/seq-alignment/align', {
      seq1,
      seq2,
      seq1_name: seq1Name,
      seq2_name: seq2Name,
    });
    return response.data;
  },

  /**
   * Quick comparison of two sequences.
   *
   * @param {string} seq1 - First sequence
   * @param {string} seq2 - Second sequence
   * @returns {Promise<{identical: boolean, difference_count: number, differences: Array}>}
   */
  compareSequences: async (seq1, seq2) => {
    const response = await api.post('/api/curation/seq-alignment/compare', {
      seq1,
      seq2,
    });
    return response.data;
  },
};

export default seqAlignmentApi;
