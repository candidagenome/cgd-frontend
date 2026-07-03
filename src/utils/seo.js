const DEFAULT_TITLE = 'Candida Genome Database';
const LOCUS_TITLE_SUFFIX = 'Candida Genome Database (CGD)';
const DEFAULT_DESCRIPTION =
  'The Candida Genome Database provides curated genomic, gene, protein, phenotype, literature, and sequence information for Candida species.';
const DEFAULT_CANONICAL_ORIGIN = 'https://www.candidagenome.org';

const stripHtml = (value) => {
  if (!value) return '';
  return String(value)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const truncate = (value, maxLength = 170) => {
  if (!value || value.length <= maxLength) return value || '';
  return `${value.slice(0, maxLength - 3).replace(/\s+\S*$/, '')}...`;
};

const setMeta = (selector, attributes) => {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
};

const setLink = (rel, href) => {
  let element = document.head.querySelector(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
};

export const buildCanonicalUrl = (path) => {
  const pathname = path || window.location.pathname;
  return `${DEFAULT_CANONICAL_ORIGIN}${pathname}`;
};

export const applySeo = ({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  canonicalPath,
  type = 'website',
} = {}) => {
  const canonicalUrl = buildCanonicalUrl(canonicalPath);
  const safeDescription = truncate(stripHtml(description)) || DEFAULT_DESCRIPTION;

  document.title = title;
  setMeta('meta[name="description"]', { name: 'description', content: safeDescription });
  setMeta('meta[property="og:title"]', { property: 'og:title', content: title });
  setMeta('meta[property="og:description"]', { property: 'og:description', content: safeDescription });
  setMeta('meta[property="og:type"]', { property: 'og:type', content: type });
  setMeta('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl });
  setLink('canonical', canonicalUrl);
};

export const buildLocusSeo = ({ name, feature, organismName }) => {
  const displayName = feature?.gene_name || feature?.feature_name || name;
  const featureName = feature?.feature_name;
  const organism = organismName || feature?.organism || feature?.organism_name;
  const featureType = feature?.feature_type || feature?.locus_type || 'locus';
  const qualifier = feature?.feature_qualifier || feature?.qualifier;
  const summary = stripHtml(
    feature?.headline ||
    feature?.description ||
    feature?.description_with_refs ||
    feature?.name_description
  );

  const identifiers = [
    displayName,
    featureName && featureName !== displayName ? featureName : null,
    organism,
    [qualifier, featureType].filter(Boolean).join(' '),
  ].filter(Boolean);

  return {
    title: `${displayName} | ${LOCUS_TITLE_SUFFIX}`,
    description: truncate(
      summary
        ? `${identifiers.join(' - ')}. ${summary}`
        : `${identifiers.join(' - ')} in the Candida Genome Database.`
    ),
    canonicalPath: `/locus/${encodeURIComponent(name || featureName || displayName)}`,
    type: 'profile',
  };
};

export const applyDefaultSeo = () => {
  applySeo();
};

export { DEFAULT_TITLE, DEFAULT_DESCRIPTION };
