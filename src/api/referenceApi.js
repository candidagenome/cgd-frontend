import api from './config';

export const referenceApi = {
  // Get basic reference info
  getReferenceInfo: async (pubmedId) => {
    const response = await api.get(`/api/reference/${encodeURIComponent(pubmedId)}`);
    return response.data;
  },

  // Get loci addressed in this paper
  getLocusDetails: async (pubmedId) => {
    const response = await api.get(`/api/reference/${encodeURIComponent(pubmedId)}/locus_details`);
    return response.data;
  },

  // Get GO annotations citing this reference
  getGoDetails: async (pubmedId) => {
    const response = await api.get(`/api/reference/${encodeURIComponent(pubmedId)}/go_details`);
    return response.data;
  },

  // Get phenotype annotations citing this reference
  getPhenotypeDetails: async (pubmedId) => {
    const response = await api.get(`/api/reference/${encodeURIComponent(pubmedId)}/phenotype_details`);
    return response.data;
  },

  // Get interactions citing this reference
  getInteractionDetails: async (pubmedId) => {
    const response = await api.get(`/api/reference/${encodeURIComponent(pubmedId)}/interaction_details`);
    return response.data;
  },

  // Get literature topics for this reference
  getLiteratureTopics: async (pubmedId) => {
    const response = await api.get(`/api/reference/${encodeURIComponent(pubmedId)}/literature_topics`);
    return response.data;
  },
};

export default referenceApi;
