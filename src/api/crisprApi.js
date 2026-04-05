/**
 * CRISPR Guide RNA Designer API Client
 */
import api from './config';

const crisprApi = {
  /**
   * Get CRISPR configuration (PAM options, organisms, defaults)
   */
  getConfig: async () => {
    const response = await api.get('/api/crispr/config');
    return response.data;
  },

  /**
   * Get list of available organisms
   */
  getOrganisms: async () => {
    const response = await api.get('/api/crispr/organisms');
    return response.data;
  },

  /**
   * Get available PAM options
   */
  getPamOptions: async () => {
    const response = await api.get('/api/crispr/pam-options');
    return response.data;
  },

  /**
   * Get gene information and sequence
   * @param {string} geneName - Gene name to look up
   * @param {string} organism - Organism tag (e.g., 'C_albicans_SC5314_A22')
   */
  getGene: async (geneName, organism = 'C_albicans_SC5314_A22') => {
    const response = await api.get(`/api/crispr/gene/${encodeURIComponent(geneName)}`, {
      params: { organism },
    });
    return response.data;
  },

  /**
   * Design CRISPR guide RNAs
   *
   * @param {Object} params - Design parameters
   * @param {string} params.gene_name - Gene name (optional if sequence provided)
   * @param {string} params.sequence - Raw DNA sequence (optional if gene_name provided)
   * @param {string} params.organism - Target organism (default: C_albicans_SC5314_A22)
   * @param {string} params.pam - PAM sequence (default: NGG)
   * @param {number} params.guide_length - Guide length (default: 20)
   * @param {string} params.target_region - Target region (5_prime, 3_prime, full_cds)
   * @param {boolean} params.check_offtargets - Enable off-target analysis
   * @param {number} params.max_guides - Maximum guides to return
   * @param {boolean} params.include_homology_arms - Include homology arms
   * @param {number} params.homology_arm_length - Homology arm length
   */
  design: async (params) => {
    const response = await api.post('/api/crispr/design', params);
    return response.data;
  },

  /**
   * Design guides via GET (simple query)
   */
  designSimple: async (geneName, organism = 'C_albicans_SC5314_A22', pam = 'NGG') => {
    const response = await api.get('/api/crispr/design', {
      params: {
        gene: geneName,
        organism,
        pam,
      },
    });
    return response.data;
  },

  /**
   * Download results in specified format
   * @param {string} format - Download format (tsv, csv, fasta)
   * @param {Object} params - Download parameters including guides and gene_info
   */
  download: async (format, params) => {
    const response = await api.post(`/api/crispr/download/${format}`, params, {
      responseType: 'blob',
    });
    return response;
  },
};

export default crisprApi;
