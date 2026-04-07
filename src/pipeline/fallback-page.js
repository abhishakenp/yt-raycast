const escapeHtml = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

export const buildFallbackPageFromHomepage = (homepageHtml, task) => {
  const title = escapeHtml(task.title ?? 'Page')
  const desc = escapeHtml(task.description ?? '')
  const section = `<section class="page-fallback max-w-3xl mx-auto px-4 py-16 md:py-24"><h1 class="text-3xl md:text-4xl font-bold mb-4">${title}</h1><p class="text-lg opacity-90 mb-6">${desc}</p></section>`
  const mainRe = /<main\b[^>]*>[\s\S]*?<\/main>/i
  const bodyRe = /<body\b[^>]*>/i
  let out = String(homepageHtml ?? '')

  if (mainRe.test(out)) {
    out = out.replace(mainRe, (full) => {
      const open = full.match(/^<main\b[^>]*>/i)?.[0] ?? '<main>'
      return `${open}${section}</main>`
    })
  } else if (bodyRe.test(out)) {
    out = out.replace(bodyRe, (b) => `${b}\n${section}\n`)
  } else {
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>${title}</title></head><body>${section}</body></html>`
  }

  if (/<title>/i.test(out)) {
    out = out.replace(/<title>[^<]*<\/title>/i, `<title>${title}</title>`)
  } else if (/<head\b/i.test(out)) {
    out = out.replace(/<head\b[^>]*>/i, (h) => `${h}\n<title>${title}</title>`)
  }
  return out
}
