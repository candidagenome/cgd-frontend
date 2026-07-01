import React from 'react';

/**
 * Per-page SEO metadata.
 *
 * React 19 automatically hoists <title>, <meta>, and <link> elements rendered
 * anywhere in the component tree into the document <head> (and de-dupes <title>),
 * so this component can be dropped into any page to give crawlers a unique title,
 * description, and canonical URL. This is a client-side improvement; for full
 * crawlability the pages should ultimately be server-rendered or prerendered.
 *
 * @param {string} [title] - Page-specific title; site name is appended automatically.
 * @param {string} [description] - Meta description (falls back to the site default).
 * @param {string} [canonicalPath] - Absolute path (e.g. "/locus/HOG1") for the
 *   canonical URL and og:url. Query strings are intentionally omitted by callers
 *   so tab/subtab variants collapse to a single canonical page.
 * @param {boolean} [noindex] - When true, emit robots=noindex (e.g. not-found pages).
 */

const SITE_NAME = 'Candida Genome Database';

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://www.candidagenome.org')
  .replace(/\/+$/, '');

const DEFAULT_DESCRIPTION =
  'The Candida Genome Database (CGD) provides genomic, genetic, and molecular ' +
  'biological information about the fungal pathogen Candida albicans and related ' +
  'Candida species, including gene, protein, phenotype, and literature data.';

function Seo({ title, description, canonicalPath, noindex = false }) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const desc = description || DEFAULT_DESCRIPTION;
  const canonical = canonicalPath ? `${SITE_URL}${canonicalPath}` : null;

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      {noindex && <meta name="robots" content="noindex, follow" />}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph / social preview */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      {canonical && <meta property="og:url" content={canonical} />}
    </>
  );
}

export default Seo;
