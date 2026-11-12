import api from './config';

export const pangenomeApi = {
  // All loaded pangenome studies with summary counts
  getStudies: async () => {
    const response = await api.get('/api/pangenome/studies');
    return response.data;
  },

  // One study: citation, counts, notes and isolates
  getStudy: async (studyId) => {
    const response = await api.get(`/api/pangenome/studies/${encodeURIComponent(studyId)}`);
    return response.data;
  },

  // A page of a study's genes; params: category, reference, stops, q, sort, page, page_size
  getGenes: async (studyId, params) => {
    const response = await api.get(`/api/pangenome/studies/${encodeURIComponent(studyId)}/genes`, { params });
    return response.data;
  },

  // One gene with its premature stop codons per isolate
  getGene: async (studyId, geneId) => {
    const response = await api.get(
      `/api/pangenome/studies/${encodeURIComponent(studyId)}/genes/${encodeURIComponent(geneId)}`
    );
    return response.data;
  },

  // Pangenome records for a locus (empty studies list when none covers it)
  getLocus: async (name) => {
    const response = await api.get(`/api/pangenome/locus/${encodeURIComponent(name)}`);
    return response.data;
  },

  // TSV download URL for a study table: genes, accessory, stop_codons or isolates
  downloadUrl: (studyId, table) =>
    `${api.defaults.baseURL || ''}/api/pangenome/studies/${encodeURIComponent(studyId)}/download/${table}`,
};

export default pangenomeApi;
