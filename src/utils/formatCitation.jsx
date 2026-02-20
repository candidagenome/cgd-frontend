/**
 * Citation formatting utilities
 * Based on Perl FormatReference.pm module
 *
 * Formats citations in the standard format:
 * "Author1 and Author2 (Year) Title. Journal Volume(Issue):Pages"
 * Example: "Losberger C and Ernst JF (1989) Sequence of the Candida albicans gene encoding actin. Nucleic Acids Res 17(22):9488"
 */

import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Format a citation string with proper styling (bold author/year, italic journal)
 * @param {string} citation - The raw citation string
 * @param {string} journal - Optional journal name to italicize
 * @returns {React.ReactNode} Formatted citation as JSX
 */
export function formatCitationString(citation, journal = null) {
  if (!citation) return null;

  // Pattern: "Author(s) (Year) Rest of citation"
  // Match author portion up to and including (Year)
  const authorYearMatch = citation.match(/^([^(]+\([0-9]{4}\))(.*)$/);

  if (!authorYearMatch) {
    // If no match, return citation with journal italicized if provided
    if (journal) {
      return italicizeJournal(citation, journal);
    }
    return citation;
  }

  const authorYear = authorYearMatch[1];
  const rest = authorYearMatch[2] || '';

  // Italicize "et al." in author portion
  const formattedAuthorYear = formatAuthorYear(authorYear);

  // Italicize journal name in the rest
  const formattedRest = journal ? italicizeJournal(rest, journal) : rest;

  return (
    <>
      <strong>{formattedAuthorYear}</strong>
      {typeof formattedRest === 'string' ? formattedRest : formattedRest}
    </>
  );
}

/**
 * Format author/year portion, italicizing "et al."
 * @param {string} authorYear - The author and year portion
 * @returns {React.ReactNode} Formatted author/year
 */
function formatAuthorYear(authorYear) {
  if (!authorYear) return null;

  // Check for "et al."
  const etAlMatch = authorYear.match(/^(.+?)(et al\.)(.*)$/i);

  if (etAlMatch) {
    return (
      <>
        {etAlMatch[1]}
        <em>et al.</em>
        {etAlMatch[3]}
      </>
    );
  }

  return authorYear;
}

/**
 * Italicize journal name within text
 * @param {string} text - Text containing journal name
 * @param {string} journal - Journal name to italicize
 * @returns {React.ReactNode} Text with italicized journal
 */
function italicizeJournal(text, journal) {
  if (!text || !journal) return text;

  const journalIndex = text.indexOf(journal);
  if (journalIndex === -1) return text;

  const before = text.substring(0, journalIndex);
  const after = text.substring(journalIndex + journal.length);

  return (
    <>
      {before}
      <em>{journal}</em>
      {after}
    </>
  );
}

/**
 * Build a full citation from reference object parts
 * @param {Object} ref - Reference object with author, year, title, journal info
 * @returns {React.ReactNode} Formatted citation as JSX
 */
export function buildFormattedCitation(ref) {
  if (!ref) return null;

  // If citation string exists, format it
  if (ref.citation) {
    return formatCitationString(ref.citation, ref.journal_name || ref.journal);
  }

  // Build citation from parts
  const parts = [];

  // Authors
  const authors = formatAuthors(ref.authors);
  if (authors) {
    parts.push(<strong key="authors">{authors}</strong>);
  }

  // Year
  if (ref.year) {
    parts.push(<strong key="year"> ({ref.year})</strong>);
  }

  // Title
  if (ref.title) {
    parts.push(<span key="title"> {ref.title}</span>);
    // Add period after title if it doesn't end with punctuation
    if (!/[.!?]$/.test(ref.title)) {
      parts.push('.');
    }
  }

  // Journal info
  const journalInfo = buildJournalInfo(ref);
  if (journalInfo) {
    parts.push(' ');
    parts.push(journalInfo);
  }

  return <>{parts}</>;
}

/**
 * New: render citation links on a separate line, no surrounding [ ]
 * This matches SGD-ish layout (links below the citation, separated by spaces)
 */
export function CitationLinksBelow({ links, className = '' }) {
  if (!links || links.length === 0) return null;

  return (
    <div className={`citation-links-below ${className}`.trim()}>
      {links.map((link, idx) => (
        <React.Fragment key={`${link.name}-${idx}`}>
          {idx > 0 && <span className="citation-link-sep"> </span>}
          {link.link_type === 'internal' ? (
            <Link to={link.url} className="citation-link">
              {link.name}
            </Link>
          ) : (
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="citation-link"
            >
              {link.name}
            </a>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

/**
 * Format authors array into string
 * @param {Array} authors - Array of author objects with author_name
 * @returns {string|React.ReactNode} Formatted author string
 */
export function formatAuthors(authors) {
  if (!authors || authors.length === 0) return null;

  if (Array.isArray(authors)) {
    // If it's an array of objects with author_name
    if (authors[0]?.author_name) {
      const names = authors.map((a) => a.author_name);
      if (names.length === 1) return names[0];
      if (names.length === 2) return `${names[0]} and ${names[1]}`;
      // More than 2 authors: use "et al."
      return (
        <>
          {names[0]} <em>et al.</em>
        </>
      );
    }

    // If it's an array of strings
    if (typeof authors[0] === 'string') {
      if (authors.length === 1) return authors[0];
      if (authors.length === 2) return `${authors[0]} and ${authors[1]}`;
      return (
        <>
          {authors[0]} <em>et al.</em>
        </>
      );
    }
  }

  // If it's already a string
  if (typeof authors === 'string') return authors;

  return null;
}

/**
 * Build journal info string (journal name, volume, issue, pages)
 * @param {Object} ref - Reference object
 * @returns {React.ReactNode} Journal info as JSX
 */
function buildJournalInfo(ref) {
  const parts = [];

  // Journal name (italicized)
  if (ref.journal_name || ref.journal) {
    parts.push(<em key="journal">{ref.journal_name || ref.journal}</em>);
  }

  // Volume
  if (ref.volume) {
    parts.push(<span key="volume"> {ref.volume}</span>);
  }

  // Issue (in parentheses)
  if (ref.issue) {
    parts.push(<span key="issue">({ref.issue})</span>);
  }

  // Pages
  if (ref.page || ref.pages) {
    parts.push(<span key="pages">:{ref.page || ref.pages}</span>);
  }

  if (parts.length === 0) return null;

  return <>{parts}</>;
}

/**
 * Format a short citation (for inline references)
 * Example: "Losberger and Ernst (1989)"
 * @param {Object} ref - Reference object
 * @returns {React.ReactNode} Short citation
 */
export function formatShortCitation(ref) {
  if (!ref) return null;

  // If display_name exists, use it
  if (ref.display_name) {
    return formatCitationString(ref.display_name);
  }

  const parts = [];

  // Get first author's last name
  if (ref.authors && ref.authors.length > 0) {
    const firstAuthor = ref.authors[0];
    const name = firstAuthor.author_name || firstAuthor;

    // Extract last name (first word or before comma)
    const lastName = typeof name === 'string' ? name.split(/[,\s]/)[0] : name;

    parts.push(<strong key="author">{lastName}</strong>);

    if (ref.authors.length === 2) {
      const secondAuthor = ref.authors[1];
      const secondName = secondAuthor.author_name || secondAuthor;
      const secondLastName =
        typeof secondName === 'string' ? secondName.split(/[,\s]/)[0] : secondName;
      parts.push(<strong key="and"> and {secondLastName}</strong>);
    } else if (ref.authors.length > 2) {
      parts.push(
        <strong key="etal">
          {' '}
          <em>et al.</em>
        </strong>
      );
    }
  }

  // Year
  if (ref.year) {
    parts.push(<strong key="year"> ({ref.year})</strong>);
  }

  return <>{parts}</>;
}

/**
 * Format a single reference item (helper for formatHistoryReference)
 * Uses the same display pattern as Gene Ontology tab
 * @param {Object|string} ref - Reference object or string
 * @param {number} idx - Index for key generation
 * @returns {React.ReactNode} Formatted reference
 */
function formatSingleReference(ref, idx = 0) {
  if (!ref) return null;

  // Handle string references (like "PMID:12345" or "CGD_REF:CAL0000001")
  if (typeof ref === 'string') {
    // Check if it's a PMID string
    if (ref.startsWith('PMID:')) {
      const pmid = ref.replace('PMID:', '');
      return (
        <div key={idx} className="go-reference-item">
          <a
            href={`https://pubmed.ncbi.nlm.nih.gov/${pmid}`}
            target="_blank"
            rel="noopener noreferrer"
            className="pubmed-link-small"
          >
            {ref}
          </a>
        </div>
      );
    }

    // Check if it's a CGD_REF or CA reference
    if (ref.startsWith('CGD_REF:') || ref.startsWith('CA')) {
      return (
        <div key={idx} className="go-reference-item">
          <Link to={`/reference/${ref}`}>{ref}</Link>
        </div>
      );
    }

    // Otherwise format as citation string
    return (
      <div key={idx} className="go-reference-item">
        {formatCitationString(ref)}
      </div>
    );
  }

  // If HTML is provided, use it (already formatted from backend)
  if (ref.html) {
    return (
      <div key={idx} className="go-reference-item">
        <span dangerouslySetInnerHTML={{ __html: ref.html }} />
      </div>
    );
  }

  // Extract reference identifiers (same logic as GO tab)
  const refId =
    ref.dbxref_id || ref.reference_id || (ref.pubmed ? `PMID:${ref.pubmed}` : null);

  // Prioritize full citation over display_name (which may be shortened)
  const citation = ref.citation || ref.display_name || ref.formatted_citation;
  const journal = ref.journal_name || ref.journal;

  // Prefer backend-provided links
  const links = ref.links;

  /**
   * IMPORTANT: Your screenshot still showed "[CGD Paper | PubMed]" which comes from
   * `CitationLinks`. That usually means some refs are coming through WITHOUT `ref.citation`
   * (so they hit fallback branches), OR other call sites use formatCitationWithLinks().
   *
   * To make behavior consistent, we render "below" links whenever we have *any* link set.
   */

  // Display full formatted citation when available (links on next line)
  if (citation) {
    const computedLinks =
      links && links.length > 0
        ? links
        : buildCitationLinks({
            dbxref_id: ref.dbxref_id,
            reference_id: ref.reference_id,
            pubmed: ref.pubmed,
            urls: ref.urls,
          });

    return (
      <div key={idx} className="go-reference-item">
        <div className="citation-line">
          {formatCitationString(citation, journal)}
          {ref.pubmed ? <span className="citation-pmid"> PMID: {ref.pubmed}</span> : null}
        </div>

        {/* Links below citation (no brackets) */}
        <CitationLinksBelow links={computedLinks} />
      </div>
    );
  }

  // Fallback to showing reference ID as link (links below, no brackets)
  if (refId) {
    // If backend links exist, show them below the id
    if (links && links.length > 0) {
      return (
        <div key={idx} className="go-reference-item">
          <div className="citation-line">
            {typeof refId === 'string' &&
            (refId.startsWith('CGD_REF:') || refId.startsWith('CA')) ? (
              <Link to={`/reference/${refId}`}>{refId}</Link>
            ) : typeof refId === 'string' && refId.startsWith('PMID:') ? (
              <a
                href={`https://pubmed.ncbi.nlm.nih.gov/${refId.replace('PMID:', '')}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {refId}
              </a>
            ) : (
              refId
            )}
          </div>
          <CitationLinksBelow links={links} />
        </div>
      );
    }

    // Otherwise build minimal links from the id if possible (CGD Paper + PubMed when pubmed exists)
    if (typeof refId === 'string' && (refId.startsWith('CGD_REF:') || refId.startsWith('CA'))) {
      return (
        <div key={idx} className="go-reference-item">
          <div className="citation-line">
            <Link to={`/reference/${refId}`}>{refId}</Link>
          </div>
        </div>
      );
    }

    if (typeof refId === 'string' && refId.startsWith('PMID:')) {
      const pmid = refId.replace('PMID:', '');
      return (
        <div key={idx} className="go-reference-item">
          <div className="citation-line">
            <a
              href={`https://pubmed.ncbi.nlm.nih.gov/${pmid}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {refId}
            </a>
          </div>
          {/* If we only have a PMID, at least provide PubMed link below (matches SGD-ish behavior) */}
          <CitationLinksBelow
            links={[
              {
                name: 'PubMed',
                url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}`,
                link_type: 'external',
              },
            ]}
          />
        </div>
      );
    }

    // Final fallback: render the id as-is
    return (
      <div key={idx} className="go-reference-item">
        {refId}
      </div>
    );
  }

  // Final fallback to title or text
  const fallback = ref.title || ref.text;
  if (fallback) {
    return (
      <div key={idx} className="go-reference-item">
        {fallback}
      </div>
    );
  }

  return null;
}

/**
 * Format citation for History tab nomenclature references
 * Uses the same display pattern as Gene Ontology tab:
 * - Full citation with PMID link when available
 * - Fallback to PMID link, CGD_REF/CA internal link, or plain text
 * - Supports both single references and arrays of references
 * @param {Object|string|Array} ref - Reference object, string, or array of references
 * @returns {React.ReactNode} Formatted reference(s)
 */
export function formatHistoryReference(ref) {
  if (!ref) return null;

  // Handle array of references (like GO tab)
  if (Array.isArray(ref)) {
    if (ref.length === 0) return null;
    return <>{ref.map((r, idx) => formatSingleReference(r, idx))}</>;
  }

  // Handle single reference
  return formatSingleReference(ref, 0);
}

export function renderPmidSuffix(pubmed) {
  if (!pubmed) return null;
  return <span className="citation-pmid"> PMID: {pubmed}</span>;
}

/**
 * Render citation links as plain text links separated by " | " (CGD-style inline)
 * Links: CGD Paper | PubMed | Access Full Text | Download Datasets | Web Supplement
 * @param {Array} links - Array of link objects with name, url, link_type
 * @returns {React.ReactNode} Formatted links
 */
export function CitationLinks({ links }) {
  if (!links || links.length === 0) return null;

  return (
    <span className="citation-links">
      {' ['}
      {links.map((link, idx) => (
        <React.Fragment key={`${link.name}-${idx}`}>
          {idx > 0 && ' | '}
          {link.link_type === 'internal' ? (
            <Link to={link.url}>{link.name}</Link>
          ) : (
            <a href={link.url} target="_blank" rel="noopener noreferrer">
              {link.name}
            </a>
          )}
        </React.Fragment>
      ))}
      {']'}
    </span>
  );
}

/**
 * Build citation links from reference data (when backend doesn't provide pre-built links)
 * @param {Object} ref - Reference object with pubmed, dbxref_id, urls
 * @returns {Array} Array of link objects
 */
export function buildCitationLinks(ref) {
  if (!ref) return [];

  const links = [];

  // CGD Paper link (always present) - always use dbxref_id (CGDID)
  const cgdPaperUrl = `/reference/${ref.dbxref_id || ref.reference_id || ref.pubmed}`;
  links.push({
    name: 'CGD Paper',
    url: cgdPaperUrl,
    link_type: 'internal',
  });

  // PubMed link
  if (ref.pubmed) {
    links.push({
      name: 'PubMed',
      url: `https://pubmed.ncbi.nlm.nih.gov/${ref.pubmed}`,
      link_type: 'external',
    });
  }

  // Process URLs if available (check url_type for categorization)
  // Match backend logic from locus_service.py _build_citation_links_for_locus
  if (ref.urls && Array.isArray(ref.urls)) {
    ref.urls.forEach((urlItem) => {
      // Handle both string URLs and URL objects
      const url = typeof urlItem === 'string' ? urlItem : urlItem.url;
      const urlType = (urlItem.url_type || '').toLowerCase();

      if (urlType.includes('supplement')) {
        // Reference supplement
        links.push({
          name: 'Reference Supplement',
          url,
          link_type: 'external',
        });
      } else if (urlType.includes('reference data')) {
        // Skip Reference Data (not shown as full text, matching Perl behavior)
      } else if (urlType.includes('download') || urlType.includes('dataset')) {
        // Download Datasets
        links.push({
          name: 'Download Datasets',
          url,
          link_type: 'external',
        });
      } else {
        // All other URL types shown as Full Text (matching Perl default behavior)
        // This includes: Reference LINKOUT, Reference full text, and any others
        links.push({
          name: 'Full Text',
          url,
          link_type: 'external',
        });
      }
    });
  }

  return links;
}

/**
 * Format a complete citation with text and links
 * OLD behavior: "Author... Journal... [CGD Paper | PubMed | ...]"
 * NEW behavior: links on next line (SGD-ish), to match your screenshot target.
 * @param {Object} ref - Reference object with citation info and links
 * @returns {React.ReactNode} Complete formatted citation with links
 */
export function formatCitationWithLinks(ref) {
  if (!ref) return null;

  // Use pre-built links from backend if available, otherwise build them
  const links =
    ref.links && ref.links.length > 0 ? ref.links : buildCitationLinks(ref);

  return (
    <span className="citation-with-links">
      <span className="citation-line">
        {formatCitationString(ref.citation, ref.journal_name || ref.journal)}
        {ref.pubmed ? <span className="citation-pmid"> PMID: {ref.pubmed}</span> : null}
      </span>
      <CitationLinksBelow links={links} />
    </span>
  );
}

/**
 * Render a simple inline citation with just CGD Paper and PubMed links
 * For use in tables or compact displays
 * (Kept inline/bracketed for compact areas)
 * @param {Object} ref - Reference object
 * @returns {React.ReactNode} Compact citation with basic links
 */
export function formatCompactCitationWithLinks(ref) {
  if (!ref) return null;

  const shortCitation = formatShortCitation(ref);

  // Build minimal links (CGD Paper and PubMed only)
  const links = [];

  // CGD Paper link - always use dbxref_id (CGDID) first
  const cgdId = ref.dbxref_id || ref.reference_id || ref.pubmed;
  if (cgdId) {
    links.push({
      name: 'CGD Paper',
      url: `/reference/${cgdId}`,
      link_type: 'internal',
    });
  }

  // PubMed link
  if (ref.pubmed) {
    links.push({
      name: 'PubMed',
      url: `https://pubmed.ncbi.nlm.nih.gov/${ref.pubmed}`,
      link_type: 'external',
    });
  }

  return (
    <span className="citation-compact">
      {shortCitation}
      {links.length > 0 && <CitationLinks links={links} />}
    </span>
  );
}

export default {
  formatCitationString,
  buildFormattedCitation,
  formatAuthors,
  formatShortCitation,
  formatHistoryReference,
  CitationLinks,
  CitationLinksBelow,
  buildCitationLinks,
  formatCitationWithLinks,
  formatCompactCitationWithLinks,
};
