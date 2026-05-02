/**
 * Text processing utilities for the Ship Fast application
 * Centralized functions for slug generation, text normalization, and string manipulation
 */

/**
 * Creates a URL-friendly slug from text
 * @param {string} text - Text to convert to slug
 * @param {Object} options - Options for slug generation
 * @param {boolean} options.toLowerCase - Convert to lowercase (default: true)
 * @param {string} options.separator - Character to use as separator (default: '-')
 * @param {number} options.maxLength - Maximum length of slug (default: 50)
 * @returns {string} URL-friendly slug
 */
export function createSlug(text, options = {}) {
  const { toLowerCase = true, separator = '-', maxLength = 50 } = options

  if (!text || typeof text !== 'string') {
    return ''
  }

  let slug = text
    .trim()
    .replace(/\s+/g, separator) // Replace spaces with separator
    .replace(/[^\w\-]+/g, '') // Remove special characters except word chars and hyphens
    .replace(new RegExp(`${separator}+`, 'g'), separator) // Remove duplicate separators
    .replace(new RegExp(`^${separator}+|${separator}+$`, 'g'), '') // Remove leading/trailing separators

  if (toLowerCase) {
    slug = slug.toLowerCase()
  }

  if (maxLength > 0 && slug.length > maxLength) {
    slug = slug.substring(0, maxLength).replace(new RegExp(`${separator}+$`), '')
  }

  return slug
}

/**
 * Normalizes a slug by ensuring it's clean and consistent
 * @param {string} slug - Slug to normalize
 * @returns {string} Normalized slug
 */
export function normalizeSlug(slug) {
  return String(slug || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\-]/g, '')
    .replace(/\-+/g, '-')
    .replace(/^\-+|\-+$/g, '')
}

/**
 * Trims whitespace and normalizes text
 * @param {string} text - Text to normalize
 * @returns {string} Normalized text
 */
export function normalizeText(text) {
  if (!text || typeof text !== 'string') {
    return ''
  }

  return text
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/[\r\n\t]+/g, ' ') // Replace newlines and tabs with spaces
}

/**
 * Capitalizes the first letter of each word
 * @param {string} text - Text to capitalize
 * @returns {string} Title-cased text
 */
export function toTitleCase(text) {
  if (!text || typeof text !== 'string') {
    return ''
  }

  return text
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Truncates text to a specified length with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @param {string} suffix - Suffix to add when truncated (default: '...')
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength, suffix = '...') {
  if (!text || typeof text !== 'string' || text.length <= maxLength) {
    return text || ''
  }

  return text.substring(0, maxLength - suffix.length).trim() + suffix
}
