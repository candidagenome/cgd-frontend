import api from './config';

// Organism mapping from frontend display names to API organism identifiers
export const ORGANISM_MAP = {
  'Candida albicans SC5314': 'C_albicans_SC5314_A22',
  'Candida auris B8441': 'C_auris_B8441',
  'Candida dubliniensis CD36': 'C_dubliniensis_CD36',
  'Candida glabrata CBS138': 'C_glabrata_CBS138',
  'Candida parapsilosis CDC317': 'C_parapsilosis_CDC317',
  'Candida tropicalis MYA-3404': 'C_tropicalis',
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
   * @param {string} options.direction - Correlation direction: 'positive', 'negative', or 'both' (default: 'positive')
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
    if (options.direction) {
      params.append('direction', options.direction);
    }

    const queryString = params.toString();
    const url = `/api/expression/gene/${encodeURIComponent(geneName)}/similar${queryString ? '?' + queryString : ''}`;

    const response = await api.get(url);
    return response.data;
  },

  /**
   * Download expression matrix as TSV file.
   *
   * @param {string[]} geneNames - Array of gene names to include in matrix
   * @param {string} organism - Organism display name
   * @param {Object} options - Optional parameters
   * @param {boolean} options.includeMetadata - Include description and correlation columns
   * @param {Object} options.correlations - Dict mapping gene names to correlation values
   */
  downloadExpressionMatrix: async (geneNames, organism, options = {}) => {
    const response = await api.post(
      '/api/expression/matrix/download',
      {
        gene_names: geneNames,
        organism: organism,
        include_metadata: options.includeMetadata !== false,
        correlations: options.correlations || null,
      },
      {
        responseType: 'blob',
      }
    );

    // Extract filename from Content-Disposition header or use default
    const contentDisposition = response.headers['content-disposition'];
    let filename = 'expression_matrix.tsv';
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?(.+?)"?$/);
      if (match) {
        filename = match[1];
      }
    }

    // Create download link
    const blob = new Blob([response.data], { type: 'text/tab-separated-values' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

export default expressionApi;
