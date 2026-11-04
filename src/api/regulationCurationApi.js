/**
 * Regulation Curation API module.
 *
 * Curator entry of regulator -> target gene associations: DNA binding and
 * expression changes in single-gene mutants. Rows are stored as CGD curation
 * and shown on the locus Regulation tab alongside PathoYeastract's
 * associations and RNA accumulation phenotypes. Requires curator authentication.
 */
import api from './config';

export const regulationCurationApi = {
  /** Evidence types, experiments, condition groups and effects for the entry form. */
  getVocabulary: async () => {
    const response = await api.get('/api/curation/regulation/vocabulary');
    return response.data;
  },

  /** A paper (by PubMed ID) and the associations already curated from it. */
  getReference: async (pubmed) => {
    const response = await api.get(`/api/curation/regulation/reference/${encodeURIComponent(pubmed)}`);
    return response.data;
  },

  /** Associations curated for a gene, as a TF and as a target. */
  getGene: async (name, organism) => {
    const response = await api.get(`/api/curation/regulation/gene/${encodeURIComponent(name)}`, {
      params: { organism },
    });
    return response.data;
  },

  /**
   * Resolve and check a batch without saving it.
   * @param {Object} batch - { organism, pubmed, tf, targets, evidence_code, experiment, mutant_type,
   *   expression_change, association_type, strain_background, condition_group,
   *   environmental_condition, regulation_note }
   */
  preview: async (batch) => {
    const response = await api.post('/api/curation/regulation/preview', batch);
    return response.data;
  },

  /** Save a batch (the targets that resolve to new associations). */
  create: async (batch) => {
    const response = await api.post('/api/curation/regulation', batch);
    return response.data;
  },

  /** Edit one association's evidence fields. */
  update: async (regulationNo, data) => {
    const response = await api.put(`/api/curation/regulation/${regulationNo}`, data);
    return response.data;
  },

  /** Delete associations. */
  remove: async (regulationNos) => {
    const response = await api.post('/api/curation/regulation/delete', { regulation_nos: regulationNos });
    return response.data;
  },

  /** Genome-wide binding: genes whose promoters hold the peaks of a BED/narrowPeak/table text. */
  assignPeaks: async (organism, text, window) => {
    const response = await api.post('/api/curation/regulation/peaks', { organism, text, window });
    return response.data;
  },

  /** Admitted regulators, phenotype regulators left off the tab, and reporters needing review. */
  getReview: async (organism) => {
    const response = await api.get('/api/curation/regulation/review', { params: { organism } });
    return response.data;
  },

  /** Admit a gene as a regulator (it has no GO DNA-binding TF annotation and is not in PathoYeastract). */
  allowRegulator: async (organism, gene, note) => {
    const response = await api.post('/api/curation/regulation/regulators/allow', { organism, gene, note });
    return response.data;
  },

  /** Withdraw a curator admission. */
  removeRegulator: async (organism, gene) => {
    const response = await api.post('/api/curation/regulation/regulators/remove', { organism, gene });
    return response.data;
  },
};

export default regulationCurationApi;
