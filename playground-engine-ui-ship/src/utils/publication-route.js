/** Shared blog/publication route detection — keep out of contracts/grammars to avoid circular imports. */
export function isPublicationRoute(route, brief = '') {
  return route?.siteHint === 'blog' || (route?.siteHint === 'editorial' && /\bblog\b/i.test(brief))
}
