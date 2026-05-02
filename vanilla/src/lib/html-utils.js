/**
 * HTML processing utilities for the Ship Fast application
 * Centralized functions for HTML sanitization, parsing, and manipulation
 */

/**
 * Basic HTML sanitization - removes dangerous tags and attributes
 * @param {string} html - HTML string to sanitize
 * @returns {string} Sanitized HTML
 */
export function sanitizeHtml(html) {
  if (!html || typeof html !== 'string') {
    return ''
  }

  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '') // Remove style tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // Remove event handlers
    .replace(/<iframe\b[^>]*>/gi, '') // Remove iframe tags
    .replace(/<embed\b[^>]*>/gi, '') // Remove embed tags
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '') // Remove object tags
}

/**
 * Strips HTML tags and returns plain text
 * @param {string} html - HTML string to convert to text
 * @returns {string} Plain text content
 */
export function stripHtml(html) {
  if (!html || typeof html !== 'string') {
    return ''
  }

  return html
    .replace(/<[^>]*>/g, '') // Remove all HTML tags
    .replace(/&nbsp;/g, ' ') // Replace &nbsp; with regular spaces
    .replace(/&amp;/g, '&') // Decode common entities
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
}

/**
 * Extracts text content from HTML, preserving basic structure
 * @param {string} html - HTML string to extract text from
 * @returns {string} Extracted text content
 */
export function extractTextContent(html) {
  if (!html || typeof html !== 'string') {
    return ''
  }

  return html
    .replace(/<\/?(div|p|br|h[1-6]|li|ul|ol)\b[^>]*>/gi, '\n') // Replace block elements with newlines
    .replace(/<[^>]*>/g, '') // Remove remaining tags
    .replace(/\n\s*\n/g, '\n') // Remove empty lines
    .replace(/^\s+|\s+$/g, '') // Trim start/end
    .trim()
}

/**
 * Escapes HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} HTML-escaped text
 */
export function escapeHtml(text) {
  if (!text || typeof text !== 'string') {
    return ''
  }

  const htmlEscapes = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }

  return text.replace(/[&<>"']/g, (match) => htmlEscapes[match])
}

/**
 * Injects content before closing tag
 * @param {string} html - HTML string
 * @param {string} tagName - Tag to inject before (e.g., 'body', 'head')
 * @param {string} content - Content to inject
 * @returns {string} HTML with injected content
 */
export function injectBeforeClosingTag(html, tagName, content) {
  if (!html || !tagName || !content) {
    return html || ''
  }

  const closingTag = new RegExp(`<\/${tagName}>`, 'i')
  if (closingTag.test(html)) {
    return html.replace(closingTag, `${content}</${tagName}>`)
  }

  return html
}

/**
 * Compacts inline styles and removes unnecessary whitespace
 * @param {string} html - HTML string to compact
 * @returns {string} Compacted HTML
 */
export function compactHtml(html) {
  if (!html || typeof html !== 'string') {
    return ''
  }

  return html
    .replace(/>\s+</g, '><') // Remove whitespace between tags
    .replace(/\s+/g, ' ') // Normalize internal whitespace
    .trim()
}
