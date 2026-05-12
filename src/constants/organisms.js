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
  'Candida tropicalis MYA-3404',
];

/**
 * Species display order for synteny viewer - ordered by phylogenetic relationship.
 *
 * Order reflects evolutionary distance from C. albicans:
 * - C. dubliniensis: Sister species to C. albicans (CTG clade)
 * - C. parapsilosis: CTG clade, more distant
 * - C. auris: CTG clade, more distant
 * - C. glabrata: WGD clade (closer to S. cerevisiae), most distant
 *
 * References:
 * - Butler et al. (2009) Nature 459:657-662 https://doi.org/10.1038/nature08064
 * - Gabaldón et al. (2016) https://doi.org/10.3390/jof6030138
 */
export const SPECIES_ORDER = [
  'Candida albicans SC5314',
  'Candida dubliniensis CD36',
  'Candida tropicalis MYA-3404',
  'Candida parapsilosis CDC317',
  'Candida auris B8441',
  'Candida glabrata CBS138',
];

/**
 * Species abbreviations for compact display.
 */
export const SPECIES_ABBREV = {
  'Candida albicans SC5314': 'C. albicans',
  'Candida dubliniensis CD36': 'C. dubliniensis',
  'Candida tropicalis MYA-3404': 'C. tropicalis',
  'Candida parapsilosis CDC317': 'C. parapsilosis',
  'Candida auris B8441': 'C. auris',
  'Candida glabrata CBS138': 'C. glabrata',
};

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
