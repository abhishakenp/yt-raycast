/**
 * Strip non-ASCII characters from a stock-photo query.
 *
 * Pexels/Unsplash index in English. Non-ASCII text (Malayalam Unicode,
 * Tamil Unicode, etc.) in alt text returns irrelevant or zero results.
 * This strips non-ASCII characters, leaving only ASCII-printable text.
 *
 * This is a MINIMAL safety net. The primary fix is the LLM prompt that
 * instructs the model to always write alt text in English. This module
 * only handles the case where the LLM slips and includes non-English script.
 */
export const stripNonAscii = (query: string): string =>
  query
    .replace(/[^\x20-\x7E]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
