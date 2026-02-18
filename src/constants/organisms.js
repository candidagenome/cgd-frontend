/**
 * Allowed Candida species for curation interfaces.
 *
 * This list restricts the species selection dropdown to only
 * show these specific Candida species.
 */
export const ALLOWED_SPECIES = [
  'Candida albicans SC5314',
  'Candida glabrata CBS138',
  'Candida auris B8441',
  'Candida dubliniensis CD36',
  'Candida parapsilosis CDC317',
];

/**
 * Filter organisms list to only include allowed species.
 * @param {Array} organisms - Full list of organisms from API
 * @returns {Array} Filtered list of organisms
 */
export const filterAllowedOrganisms = (organisms) => {
  if (!organisms || !Array.isArray(organisms)) {
    return [];
  }
  return organisms.filter((org) =>
    ALLOWED_SPECIES.includes(org.organism_name)
  );
};
