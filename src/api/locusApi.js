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
};

export default locusApi;
