import api from './config';

export const seqToolsApi = {
  /**
   * Resolve gene/coordinates/sequence and get available tools
   * @param {Object} params - Request parameters
   * @param {string} [params.query] - Gene name, ORF, or CGDID
   * @param {string} [params.seq_source] - Assembly selector
   * @param {string} [params.chromosome] - Chromosome name
   * @param {number} [params.start] - Start coordinate
   * @param {number} [params.end] - End coordinate
   * @param {string} [params.sequence] - Raw sequence
   * @param {string} [params.seq_type] - Sequence type (dna or protein)
   * @param {number} [params.flank_left] - Left flanking bp
   * @param {number} [params.flank_right] - Right flanking bp
   * @param {boolean} [params.reverse_complement] - Reverse complement flag
   */
  resolve: async (params) => {
    const response = await api.post('/api/seq-tools/resolve', params);
    return response.data;
  },

  /**
   * Get list of available assemblies
   */
  getAssemblies: async () => {
    const response = await api.get('/api/seq-tools/assemblies');
    return response.data;
  },

  /**
   * Get list of chromosomes for an assembly
   * @param {string} [seqSource] - Assembly name
   */
  getChromosomes: async (seqSource) => {
    const params = seqSource ? { seq_source: seqSource } : {};
    const response = await api.get('/api/seq-tools/chromosomes', { params });
    return response.data;
  },
};

export default seqToolsApi;
