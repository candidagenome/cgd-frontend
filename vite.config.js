import process from 'node:process'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const DEFAULT_SITE_TITLE = 'Candida Genome Database'
const CANONICAL_ORIGIN = 'https://www.candidagenome.org'
const DEFAULT_SEO_API_URL = 'https://backend.dev.candidagenome.org'
const ENABLE_SEO_HTML = process.env.ENABLE_SEO_HTML === 'true'

const stripHtml = (value) => {
  if (!value) return ''
  return String(value)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const truncate = (value, maxLength = 170) => {
  if (!value || value.length <= maxLength) return value || ''
  return `${value.slice(0, maxLength - 3).replace(/\s+\S*$/, '')}...`
}

const escapeHtml = (value) => String(value || '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;')

const removeExistingSeoTags = (html) => html
  .replace(/<title>[\s\S]*?<\/title>/i, '')
  .replace(/\s*<meta\s+name=["']description["'][^>]*>/gi, '')
  .replace(/\s*<link\s+rel=["']canonical["'][^>]*>/gi, '')
  .replace(/\s*<meta\s+property=["']og:[^"']+["'][^>]*>/gi, '')
  .replace(/\s*<script\s+type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi, '')

const selectPrimaryFeature = (payload) => {
  const results = payload?.results
  if (!results || typeof results !== 'object') return { feature: null, organismName: null }

  const queryOrganism = payload.query_organism
  if (queryOrganism && results[queryOrganism]) {
    return { feature: results[queryOrganism], organismName: queryOrganism }
  }

  const [organismName, feature] = Object.entries(results)[0] || []
  return { feature, organismName }
}

const buildLocusSeo = (locusName, payload) => {
  const { feature, organismName } = selectPrimaryFeature(payload)
  if (!feature) return null

  const displayName = feature.gene_name || feature.feature_name || locusName
  const featureName = feature.feature_name
  const organism = organismName || feature.organism || feature.organism_name
  const featureType = feature.feature_type || feature.locus_type || 'locus'
  const qualifier = feature.feature_qualifier || feature.qualifier
  const summary = stripHtml(
    feature.headline ||
    feature.description ||
    feature.description_with_refs ||
    feature.name_description
  )
  const identifiers = [
    displayName,
    featureName && featureName !== displayName ? featureName : null,
    organism,
    [qualifier, featureType].filter(Boolean).join(' '),
  ].filter(Boolean)
  const canonicalPath = `/locus/${encodeURIComponent(locusName)}`
  const canonicalUrl = `${CANONICAL_ORIGIN}${canonicalPath}`
  const description = truncate(
    summary
      ? `${identifiers.join(' - ')}. ${summary}`
      : `${identifiers.join(' - ')} in the Candida Genome Database.`
  )

  return {
    title: `${displayName} | ${DEFAULT_SITE_TITLE}`,
    description,
    canonicalUrl,
    displayName,
    featureName,
    organism,
    featureType,
  }
}

const buildSeoHead = (seo) => {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: seo.title,
    description: seo.description,
    url: seo.canonicalUrl,
    isPartOf: {
      '@type': 'Dataset',
      name: DEFAULT_SITE_TITLE,
      url: CANONICAL_ORIGIN,
    },
  }

  return [
    `<title>${escapeHtml(seo.title)}</title>`,
    `<meta name="description" content="${escapeHtml(seo.description)}">`,
    `<link rel="canonical" href="${escapeHtml(seo.canonicalUrl)}">`,
    `<meta property="og:title" content="${escapeHtml(seo.title)}">`,
    `<meta property="og:description" content="${escapeHtml(seo.description)}">`,
    '<meta property="og:type" content="profile">',
    `<meta property="og:url" content="${escapeHtml(seo.canonicalUrl)}">`,
    `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>`,
  ].join('\n    ')
}

const buildSeoNoScript = (seo) => {
  const subtitle = [seo.featureName, seo.organism, seo.featureType].filter(Boolean).join(' - ')
  return [
    '<noscript id="seo-locus-summary">',
    `  <main><h1>${escapeHtml(seo.displayName)}</h1>`,
    subtitle ? `  <p>${escapeHtml(subtitle)}</p>` : '',
    `  <p>${escapeHtml(seo.description)}</p></main>`,
    '</noscript>',
  ].filter(Boolean).join('\n    ')
}

const locusSeoPlugin = () => {
  const cache = new Map()

  return {
    name: 'cgd-locus-seo-html',
    async transformIndexHtml(html, ctx) {
      const path = ctx.originalUrl || ctx.path || '/'
      const match = path.match(/^\/locus\/([^/?#]+)/i)
      if (!match) return html

      const locusName = decodeURIComponent(match[1])
      const cacheKey = locusName.toLowerCase()
      const apiBaseUrl = process.env.SEO_API_URL || process.env.VITE_API_URL || DEFAULT_SEO_API_URL

      try {
        if (!cache.has(cacheKey)) {
          const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/api/locus/${encodeURIComponent(locusName)}`)
          if (!response.ok) return html
          cache.set(cacheKey, buildLocusSeo(locusName, await response.json()))
        }

        const seo = cache.get(cacheKey)
        if (!seo) return html

        const withoutSeo = removeExistingSeoTags(html)
        return withoutSeo
          .replace('</head>', `    ${buildSeoHead(seo)}\n  </head>`)
          .replace('<div id="root"></div>', `<div id="root"></div>\n    ${buildSeoNoScript(seo)}`)
      } catch (error) {
        console.warn(`[seo] Unable to render locus metadata for ${locusName}:`, error.message)
        return html
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), ENABLE_SEO_HTML && locusSeoPlugin()].filter(Boolean),
  server: {
    allowedHosts: ['frontend.dev.candidagenome.org'],
    proxy: {
      '/api': {
        target: 'https://backend.dev.candidagenome.org',
        changeOrigin: true,
        secure: true,
        // Ensure cookies are properly forwarded
        cookieDomainRewrite: {
          'backend.dev.candidagenome.org': 'frontend.dev.candidagenome.org',
        },
      },
      '/cgi-bin': {
        target: 'https://www.candidagenome.org',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
