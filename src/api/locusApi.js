import api from './config';

export const locusApi = {
  // Get basic locus info (includes aliases and external links)
  getLocusInfo: async (name) => {
    const response = await api.get(`/api/locus/${encodeURIComponent(name)}`);
    return response.data;
  },

  // Get GO annotations
  getGoDetails: async (name) => {
    const response = await api.get(`/api/locus/${encodeURIComponent(name)}/go_details`);
    return response.data;
  },

  // Get phenotype annotations
  getPhenotypeDetails: async (name) => {
    const response = await api.get(`/api/locus/${encodeURIComponent(name)}/phenotype_details`);
    return response.data;
  },

  // Get interactions
  getInteractionDetails: async (name) => {
    const response = await api.get(`/api/locus/${encodeURIComponent(name)}/interaction_details`);
    return response.data;
  },

  // Get protein info
  getProteinDetails: async (name) => {
    const response = await api.get(`/api/locus/${encodeURIComponent(name)}/protein_details`);
    return response.data;
  },

  // Get homology/orthologs
  getHomologyDetails: async (name) => {
    const response = await api.get(`/api/locus/${encodeURIComponent(name)}/homology_details`);
    return response.data;
  },

  // Get sequence and location info
  getSequenceDetails: async (name) => {
    const response = await api.get(`/api/locus/${encodeURIComponent(name)}/sequence_details`);
    return response.data;
  },

  // Get references
  getReferences: async (name) => {
    const response = await api.get(`/api/locus/${encodeURIComponent(name)}/references`);
    return response.data;
  },

  // Get summary notes/paragraphs
  getSummaryNotes: async (name) => {
    const response = await api.get(`/api/locus/${encodeURIComponent(name)}/summary_notes`);
    return response.data;
  },

  // Get locus history
  getHistory: async (name) => {
    const response = await api.get(`/api/locus/${encodeURIComponent(name)}/history`);
    return response.data;
  },

  // Get protein physico-chemical properties
  getProteinProperties: async (name) => {
    const response = await api.get(`/api/locus/${encodeURIComponent(name)}/protein_properties`);
    return response.data;
  },

  // Get protein domain/motif details
  getDomainDetails: async (name) => {
    const response = await api.get(`/api/locus/${encodeURIComponent(name)}/domain_details`);
    return response.data;
  },

  // Get synteny data for visualization
  getSyntenyData: async (name, flankingCount = 10) => {
    const response = await api.get(
      `/api/locus/${encodeURIComponent(name)}/synteny?flanking_count=${flankingCount}`
    );
    return response.data;
  },

  // Get list of all chromosomes for genome synteny browser
  getChromosomeList: async () => {
    const response = await api.get('/api/synteny/chromosomes');
    return response.data;
  },

  // Get genes for a specific chromosome region
  getChromosomeGenes: async (chromosome, windowStart = null, windowEnd = null) => {
    let url = `/api/synteny/chromosome/${encodeURIComponent(chromosome)}`;
    const params = [];
    if (windowStart !== null) params.push(`window_start=${windowStart}`);
    if (windowEnd !== null) params.push(`window_end=${windowEnd}`);
    if (params.length > 0) url += `?${params.join('&')}`;
    const response = await api.get(url);
    return response.data;
  },

  // Search genes for synteny browser autocomplete
  searchGenesForSynteny: async (query) => {
    const response = await api.get(
      `/api/search/category?category=genes&query=${encodeURIComponent(query)}`
    );
    return response.data;
  },

  // Get expression data for a gene
  getExpressionDetails: async (name, organism = 'C_albicans_SC5314_A22') => {
    const response = await api.get(
      `/api/expression/gene/${encodeURIComponent(name)}?organism=${encodeURIComponent(organism)}`
    );
    return response.data;
  },
};

export default locusApi;
