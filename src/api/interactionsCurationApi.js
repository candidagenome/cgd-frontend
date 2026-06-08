/**
 * Interaction Curation API module.
 *
 * Curator CRUD for physical and genetic interactions. Curator-entered
 * interactions are tagged source='CGD'; BioGRID interactions are read-only.
 * Requires curator authentication.
 */
import api from './config';

export const interactionsCurationApi = {
  /**
   * Get a gene's interactions, split into physical and genetic.
   * @param {string} featureName - Feature/gene name
   * @param {string} [organismAbbrev] - Optional organism abbreviation to disambiguate
   */
  getInteractions: async (featureName, organismAbbrev = null) => {
    const params = {};
    if (organismAbbrev) params.organism = organismAbbrev;
    const response = await api.get(
      `/api/curation/interactions/${encodeURIComponent(featureName)}`,
      { params }
    );
    return response.data;
  },

  /**
   * Create a CGD interaction. The queried gene is recorded as Bait.
   * @param {string} featureName - Queried (Bait) gene
   * @param {Object} data - { organism, interactor, experiment_type, pubmed, description }
   */
  createInteraction: async (featureName, data) => {
    const response = await api.post(
      `/api/curation/interactions/${encodeURIComponent(featureName)}`,
      data
    );
    return response.data;
  },

  /** Delete a CGD-curated interaction (BioGRID rows cannot be deleted). */
  deleteInteraction: async (interactionNo) => {
    const response = await api.delete(`/api/curation/interactions/${interactionNo}`);
    return response.data;
  },

  /** Get the physical/genetic experiment-type vocabularies for dropdowns. */
  getExperimentTypes: async () => {
    const response = await api.get('/api/curation/interactions/experiment-types');
    return response.data;
  },
};

export default interactionsCurationApi;
