import api from './config';

export const orthologApi = {
  // Get available target organisms
  getTargets: async () => {
    const response = await api.get('/api/orthologs/targets');
    return response.data;
  },

  // Convert gene list to orthologs
  convert: async (geneIds, targetOrganism) => {
    const response = await api.post('/api/orthologs/convert', {
      gene_ids: geneIds,
      target_organism: targetOrganism,
    });
    return response.data;
  },

  // Download conversion results as CSV/TSV
  downloadConversion: async (geneIds, targetOrganism, format = 'csv') => {
    const response = await api.post(
      `/api/orthologs/convert/download?format=${format}`,
      {
        gene_ids: geneIds,
        target_organism: targetOrganism,
      },
      {
        responseType: 'blob',
      }
    );
    return response.data;
  },

  // Get just the ortholog IDs as plain text
  getOrthologIdsOnly: async (geneIds, targetOrganism, includeMissing = false) => {
    const response = await api.post(
      `/api/orthologs/convert/ids-only?include_missing=${includeMissing}`,
      {
        gene_ids: geneIds,
        target_organism: targetOrganism,
      },
      {
        responseType: 'text',
      }
    );
    return response.data;
  },
};
