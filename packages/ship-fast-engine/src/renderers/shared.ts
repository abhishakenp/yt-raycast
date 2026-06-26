export function escapeHtml(value: any = ''): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function routeToHtmlFile(route = '/'): string {
  if (route === '/' || route === '') return 'index.html'
  const clean = route
    .replace(/^\/+/, '')
    .replace(/\/+$/, '')
    .split('/')
    .filter(Boolean)
    .join('-')
  return `${clean || 'index'}.html`
}

export function routeToNextSegments(route = '/'): string[] {
  if (route === '/' || route === '') return []
  return route
    .replace(/^\/+/, '')
    .replace(/\/+$/, '')
    .split('/')
    .filter(Boolean)
}
