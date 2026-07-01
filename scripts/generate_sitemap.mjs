#!/usr/bin/env node
/**
 * Generate sitemap.xml (+ per-organism gene sitemaps) for the CGD frontend.
 *
 * Crawlers can't discover client-rendered SPA routes on their own, so we emit a
 * sitemap index that points at:
 *   - a "static" sitemap of curated top-level pages, and
 *   - one gene sitemap per organism, built by asking the backend feature-search
 *     API for every feature and turning each ORF into a /locus/<orf> URL.
 *
 * Output is written into public/ so Vite serves it at the site root
 * (/sitemap.xml, /sitemaps/*.xml).
 *
 * Usage:
 *   node scripts/generate_sitemap.mjs
 *
 * Environment:
 *   SITE_URL   Public base URL for <loc> entries (default https://www.candidagenome.org)
 *   API_URL    Backend base URL to query (default https://backend.dev.candidagenome.org)
 *
 * Re-run whenever the gene set changes (e.g. as a periodic/deploy step).
 */

import { writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const SITE_URL = (process.env.SITE_URL || 'https://www.candidagenome.org').replace(/\/+$/, '');
const API_URL = (process.env.API_URL || 'https://backend.dev.candidagenome.org').replace(/\/+$/, '');

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = join(__dirname, '..', 'public');
const SITEMAP_DIR = join(PUBLIC_DIR, 'sitemaps');

// Feature types that have a real, indexable locus page. Deliberately excludes
// sub-features (CDS, introns, UTRs, exons), repeats, and structural annotations
// (chromosome, contig, gap, ARS, centromere, telomere) which either lack a
// standalone page or add no search value.
const INDEXABLE_FEATURE_TYPES = [
  'ORF',
  'pseudogene',
  'tRNA',
  'rRNA',
  'ncRNA',
  'snRNA',
  'snoRNA',
];

// Sitemaps allow at most 50,000 URLs per file; split below that with headroom.
const MAX_URLS_PER_FILE = 45000;

// Top-level informational pages worth indexing (excludes curator/auth tools and
// pages that require query params). Mirror src/App.jsx public routes.
const STATIC_PATHS = [
  '/',
  '/about',
  '/help',
  '/faq',
  '/how-to-cite',
  '/community',
  '/labs',
  '/staff',
  '/meetings',
  '/job-postings',
  '/external-resources',
  '/submit-data',
  '/genome-wide-analysis',
  '/go-resources',
  '/developer/api',
  '/sitemap',
];

function xmlEscape(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function urlsetXml(paths) {
  const urls = paths
    .map((p) => `  <url>\n    <loc>${xmlEscape(SITE_URL + p)}</loc>\n  </url>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

function indexXml(sitemapFiles, lastmod) {
  const entries = sitemapFiles
    .map((f) => `  <sitemap>\n    <loc>${xmlEscape(`${SITE_URL}/sitemaps/${f}`)}</loc>\n` +
      `    <lastmod>${lastmod}</lastmod>\n  </sitemap>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</sitemapindex>\n`;
}

async function apiGet(path) {
  const res = await fetch(`${API_URL}${path}`, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`GET ${path} -> ${res.status} ${res.statusText}`);
  return res.json();
}

async function apiPost(path, body) {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${path} -> ${res.status} ${res.statusText}`);
  return res.json();
}

async function getOrganisms() {
  const config = await apiGet('/api/feature-search/config');
  const organisms = config.organisms || [];
  if (!organisms.length) throw new Error('feature-search config returned no organisms');
  return organisms; // [{ organism_abbrev, organism_name }, ...]
}

async function getFeatureOrfs(organismAbbrev) {
  const data = await apiPost('/api/feature-search/search', {
    organism: organismAbbrev,
    feature_types: INDEXABLE_FEATURE_TYPES,
    sort_by: 'orf',
  });
  const features = data.features || [];
  // De-dupe ORFs and drop blanks; each becomes /locus/<orf>.
  const orfs = new Set();
  for (const f of features) {
    if (f.orf && String(f.orf).trim()) orfs.add(String(f.orf).trim());
  }
  return [...orfs];
}

async function main() {
  const lastmod = new Date().toISOString().slice(0, 10);
  console.log(`SITE_URL=${SITE_URL}`);
  console.log(`API_URL=${API_URL}`);

  await mkdir(SITEMAP_DIR, { recursive: true });

  const sitemapFiles = [];

  // Static pages sitemap.
  await writeFile(join(SITEMAP_DIR, 'static.xml'), urlsetXml(STATIC_PATHS), 'utf8');
  sitemapFiles.push('static.xml');
  console.log(`static.xml: ${STATIC_PATHS.length} URLs`);

  // Per-organism gene sitemaps.
  const organisms = await getOrganisms();
  let totalGenes = 0;
  for (const org of organisms) {
    const abbrev = org.organism_abbrev;
    if (!abbrev) continue;
    let orfs;
    try {
      orfs = await getFeatureOrfs(abbrev);
    } catch (err) {
      console.warn(`WARNING: skipping ${abbrev}: ${err.message}`);
      continue;
    }
    if (!orfs.length) {
      console.warn(`WARNING: ${abbrev} returned 0 features`);
      continue;
    }
    const paths = orfs.map((orf) => `/locus/${encodeURIComponent(orf)}`);
    // Split into ≤MAX_URLS_PER_FILE chunks (single file when it fits).
    const chunks = [];
    for (let i = 0; i < paths.length; i += MAX_URLS_PER_FILE) {
      chunks.push(paths.slice(i, i + MAX_URLS_PER_FILE));
    }
    for (let idx = 0; idx < chunks.length; idx++) {
      const file = chunks.length > 1
        ? `genes-${abbrev}-${idx + 1}.xml`
        : `genes-${abbrev}.xml`;
      await writeFile(join(SITEMAP_DIR, file), urlsetXml(chunks[idx]), 'utf8');
      sitemapFiles.push(file);
    }
    totalGenes += paths.length;
    console.log(`${abbrev}: ${paths.length} URLs in ${chunks.length} file(s) (${org.organism_name || abbrev})`);
  }

  // Sitemap index at the site root.
  await writeFile(join(PUBLIC_DIR, 'sitemap.xml'), indexXml(sitemapFiles, lastmod), 'utf8');
  console.log(`\nsitemap.xml index -> ${sitemapFiles.length} sitemaps, ${totalGenes} gene URLs total`);
}

main().catch((err) => {
  console.error(`\nsitemap generation failed: ${err.message}`);
  process.exit(1);
});
