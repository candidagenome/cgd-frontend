/**
 * Parse a curator's comma/space-separated reference list. Each entry is a CGD
 * reference_no or a PubMed ID (optionally written "PMID:12345"); the server
 * resolves which. Returns the numeric ids and any entries that are not numbers.
 */
export function parseReferenceInput(text) {
  const ids = [];
  const invalid = [];
  text.split(/[,;\s]+/).filter(Boolean).forEach((token) => {
    const value = token.replace(/^pmid:?/i, '');
    if (/^\d+$/.test(value)) ids.push(parseInt(value, 10));
    else invalid.push(token);
  });
  return { ids, invalid };
}

export const REFERENCE_INPUT_LABEL =
  'References to link (optional, comma-separated CGD reference_no or PMID; the paper must already be in CGD):';
