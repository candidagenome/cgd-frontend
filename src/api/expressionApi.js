import api from './config';

// Organism mapping from frontend display names to API organism identifiers
export const ORGANISM_MAP = {
  'Candida albicans SC5314': 'C_albicans_SC5314_A22',
  'Candida auris B8441': 'C_auris_B8441',
  'Candida glabrata CBS138': 'C_glabrata_CBS138',
  'Candida dubliniensis CD36': 'C_dubliniensis_CD36',
  'Candida parapsilosis CDC317': 'C_parapsilosis_CDC317',
};

// Reverse mapping from API organism identifiers to display names
export const ORGANISM_DISPLAY_MAP = Object.fromEntries(
  Object.entries(ORGANISM_MAP).map(([display, api]) => [api, display])
);

// Import locusApi for expression details
import locusApi from './locusApi';

export const expressionApi = {
  /**
   * Get expression details for multiple genes using batch endpoint.
   * Much faster than making separate requests for each gene.
   *
   * @param {string[]} geneNames - Array of gene names to fetch
   * @param {string} organism - Organism display name (e.g., "Candida albicans SC5314")
   * @returns {Promise<Array>} Array of expression data for each gene
   */
  getMultiGeneExpression: async (geneNames, organism) => {
    try {
      // Use the new batch endpoint for better performance
      const response = await api.post('/api/expression/batch', {
        gene_names: geneNames,
        organism: organism,
      });

      // Transform response to match expected format
      return response.data.results.map((result) => ({
        geneName: result.gene_name,
        data: result.data,
        error: result.error,
      }));
    } catch (err) {
      // Fallback to parallel individual requests if batch fails
      console.warn('Batch expression endpoint failed, falling back to individual requests:', err.message);
      const results = await Promise.all(
        geneNames.map(async (name) => {
          try {
            const data = await locusApi.getExpressionDetails(name);
            const orgData = data?.results?.[organism];
            return {
              geneName: name,
              data: orgData || null,
              error: orgData ? null : 'No data for organism',
            };
          } catch (fetchErr) {
            return {
              geneName: name,
              data: null,
              error: fetchErr.message,
            };
          }
        })
      );
      return results;
    }
  },

  /**
   * Get genes with similar expression profiles to a given gene.
   *
   * @param {string} geneName - The gene name or systematic name to query
   * @param {Object} options - Query options
   * @param {string} options.organism - Organism identifier (e.g., 'C_albicans_SC5314_A22')
   * @param {number} options.limit - Maximum number of similar genes to return (default: 20)
   * @param {string} options.metric - Similarity metric: 'pearson', 'spearman', or 'cosine' (default: 'pearson')
   * @param {number} options.minConditions - Minimum number of shared conditions required (default: 5)
   * @returns {Promise<Object>} Response containing similar genes data
   */
  getSimilarGenes: async (geneName, options = {}) => {
    const params = new URLSearchParams();

    if (options.organism) {
      params.append('organism', options.organism);
    }
    if (options.limit) {
      params.append('limit', options.limit.toString());
    }
    if (options.metric) {
      params.append('metric', options.metric);
    }
    if (options.minConditions) {
      params.append('min_conditions', options.minConditions.toString());
    }

    const queryString = params.toString();
    const url = `/api/expression/gene/${encodeURIComponent(geneName)}/similar${queryString ? '?' + queryString : ''}`;

    const response = await api.get(url);
    return response.data;
  },
};

export default expressionApi;
