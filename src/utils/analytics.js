// Google Analytics 4 (gtag.js) integration.
//
// Tracking is gated on the VITE_GA_ID env var: it activates only when that var
// is set at build time. By design the id is provided only for the production
// build (see .env.production), so local dev and other environments are not
// tracked -- this mirrors the legacy CGD Perl app, which set the tracking id
// only in its production config.

const GA_ID = import.meta.env.VITE_GA_ID;

let initialized = false;

/** True when a GA measurement id is configured for this build. */
export function isGAEnabled() {
  return Boolean(GA_ID);
}

/**
 * Load gtag.js and initialize GA4. No-op when GA is disabled or already
 * initialized. Safe to call more than once.
 */
export function initGA() {
  if (!isGAEnabled() || initialized || typeof window === 'undefined') {
    return;
  }
  initialized = true;

  // Load the gtag.js library.
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);

  // Bootstrap the dataLayer / gtag shim.
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;

  gtag('js', new Date());
  // Disable the automatic initial page_view; we send page views ourselves on
  // route changes so client-side (SPA) navigation is tracked and not
  // double-counted on the first load.
  gtag('config', GA_ID, { send_page_view: false });
}

/**
 * Report a page view for the given path. No-op when GA is disabled or not yet
 * initialized.
 * @param {string} path - path + search, e.g. "/locus/act1?tab=go"
 */
export function trackPageView(path) {
  if (!isGAEnabled() || typeof window === 'undefined' || typeof window.gtag !== 'function') {
    return;
  }
  window.gtag('event', 'page_view', {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  });
}
