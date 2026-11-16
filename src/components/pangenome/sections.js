// Two sections share these pages: pangenomes (gene families across isolates) and strain variation
// (how reference genes vary across isolates: copy number, variants). A study's section picks its home.
export const SECTIONS = {
  pangenome: {
    path: '/pangenome',
    title: 'Pangenome Browser',
    intro:
      'Published pangenome studies of CGD species: which genes are shared by all or nearly all isolates of a ' +
      'species (core), which vary between isolates (accessory), and genes absent from the CGD reference strain.',
    browser: 'Pangenome browser',
    row: 'Pangenome',
    link: 'View in pangenome browser',
    core: 'core genes',
    accessory: 'accessory genes',
  },
  strain_variation: {
    path: '/strain-variation',
    title: 'Strain Variation Browser',
    intro:
      "Published studies of how CGD reference genes vary across a species' isolates, such as gene copy number " +
      'and gene loss. Unlike a pangenome, these studies follow the reference genes only.',
    browser: 'Genome browser',
    row: 'Strain variation',
    link: 'View in strain variation browser',
    core: 'genes detected in all isolates',
    accessory: 'genes absent from some isolates',
  },
};

export const sectionOf = (study) => SECTIONS[study?.section] || SECTIONS.pangenome;

/** A copy number for display: gene counts as whole numbers, read-coverage estimates to one decimal */
export const fmtCopies = (cn, study) => (study?.copy_number_kind === 'count' ? String(Math.round(cn)) : cn.toFixed(1));
