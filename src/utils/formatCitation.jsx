/**
 * Citation formatting utilities
 * Based on Perl FormatReference.pm module
 *
 * Formats citations in the standard format:
 * "Author1 and Author2 (Year) Title. Journal Volume(Issue):Pages"
 * Example: "Losberger C and Ernst JF (1989) Sequence of the Candida albicans gene encoding actin. Nucleic Acids Res 17(22):9488"
 */

import React from 'react';

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
  let rest = authorYearMatch[2] || '';

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
 * Format authors array into string
 * @param {Array} authors - Array of author objects with author_name
 * @returns {string} Formatted author string
 */
export function formatAuthors(authors) {
  if (!authors || authors.length === 0) return null;

  if (Array.isArray(authors)) {
    // If it's an array of objects with author_name
    if (authors[0]?.author_name) {
      const names = authors.map(a => a.author_name);
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

  // Build from parts
  const parts = [];

  // Get first author's last name
  if (ref.authors && ref.authors.length > 0) {
    const firstAuthor = ref.authors[0];
    const name = firstAuthor.author_name || firstAuthor;
    // Extract last name (first word or before comma)
    const lastName = typeof name === 'string'
      ? name.split(/[,\s]/)[0]
      : name;

    parts.push(<strong key="author">{lastName}</strong>);

    if (ref.authors.length === 2) {
      const secondAuthor = ref.authors[1];
      const secondName = secondAuthor.author_name || secondAuthor;
      const secondLastName = typeof secondName === 'string'
        ? secondName.split(/[,\s]/)[0]
        : secondName;
      parts.push(<strong key="and"> and {secondLastName}</strong>);
    } else if (ref.authors.length > 2) {
      parts.push(<strong key="etal"> <em>et al.</em></strong>);
    }
  }

  // Year
  if (ref.year) {
    parts.push(<strong key="year"> ({ref.year})</strong>);
  }

  return <>{parts}</>;
}

/**
 * Format citation for History tab nomenclature references
 * @param {Object|string} ref - Reference object or string
 * @returns {React.ReactNode} Formatted reference
 */
export function formatHistoryReference(ref) {
  if (!ref) return null;

  // If it's just a string, format it
  if (typeof ref === 'string') {
    return formatCitationString(ref);
  }

  // If HTML is provided, use it (already formatted from backend)
  if (ref.html) {
    return <span dangerouslySetInnerHTML={{ __html: ref.html }} />;
  }

  // Try to use display_name or formatted_citation first
  const citation = ref.display_name || ref.formatted_citation || ref.citation;

  if (citation) {
    const formatted = formatCitationString(citation, ref.journal_name || ref.journal);

    // If there's a link, wrap it
    const link = ref.link || ref.url;
    if (link) {
      return (
        <a href={link} target="_blank" rel="noopener noreferrer" className="history-ref-link">
          {formatted}
        </a>
      );
    }

    return formatted;
  }

  // Fallback to title or text
  return ref.title || ref.text || null;
}

export default {
  formatCitationString,
  buildFormattedCitation,
  formatAuthors,
  formatShortCitation,
  formatHistoryReference,
};
