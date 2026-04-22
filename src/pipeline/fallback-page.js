const escapeHtml = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

function renderFallbackSection(section) {
  const headline = section.headline ? `<h2 class="text-2xl md:text-3xl font-bold mb-3">${escapeHtml(section.headline)}</h2>` : ''
  const subheadline = section.subheadline ? `<p class="text-sm uppercase tracking-wider opacity-70 mb-2">${escapeHtml(section.subheadline)}</p>` : ''
  const body = section.body ? `<p class="text-lg opacity-90 mb-6">${escapeHtml(section.body)}</p>` : ''

  const items = (section.items || []).map(item => {
    const itemTitle = item.title || item.label || ''
    const itemBody = item.body || item.quote || item.description || ''
    return `<div class="p-4 rounded-lg bg-white/5">
      ${itemTitle ? `<h3 class="font-semibold mb-1">${escapeHtml(itemTitle)}</h3>` : ''}
      ${itemBody ? `<p class="opacity-80 text-sm">${escapeHtml(itemBody)}</p>` : ''}
    </div>`
  }).join('\n')

  const itemsGrid = items
    ? `<div class="grid gap-4 grid-cols-[repeat(auto-fill,minmax(250px,1fr))]">${items}</div>`
    : ''

  return `<section class="max-w-5xl mx-auto px-4 py-12 md:py-16">
    ${subheadline}${headline}${body}${itemsGrid}
  </section>`
}

export const buildFallbackPageFromHomepage = (homepageHtml, task, sections = []) => {
  const title = escapeHtml(task.title ?? 'Page')
  const desc = escapeHtml(task.description ?? '')

  // Build content from sections if available, otherwise use simple stub
  let contentHtml
  if (sections.length > 0) {
    contentHtml = sections
      .filter(s => s.type !== 'navbar' && s.type !== 'footer')
      .map(renderFallbackSection)
      .join('\n')
    // Add title header if no hero section
    if (!sections.some(s => s.type === 'hero')) {
      contentHtml = `<section class="max-w-3xl mx-auto px-4 pt-16 pb-8"><h1 class="text-3xl md:text-4xl font-bold mb-4">${title}</h1>${desc ? `<p class="text-lg opacity-90">${desc}</p>` : ''}</section>\n` + contentHtml
    }
  } else {
    const t = String(task.title ?? '').toLowerCase()
    const f = String(task.filename ?? '').toLowerCase()
    const isContact = t.includes('contact') || f.includes('contact')
    const contactForm = isContact
      ? `<form class="contact-form mt-8 space-y-4 max-w-xl" onsubmit="event.preventDefault();var m=this.querySelector('[data-form-message]');if(m)m.textContent='Thanks — we will reply soon.';return false">
<label class="block"><span class="block text-sm mb-1 opacity-80">Name</span><input name="name" type="text" required class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3" /></label>
<label class="block"><span class="block text-sm mb-1 opacity-80">Email</span><input name="email" type="email" required class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3" /></label>
<label class="block"><span class="block text-sm mb-1 opacity-80">Message</span><textarea name="message" rows="5" required class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3"></textarea></label>
<button type="submit" class="rounded-full px-8 py-3 font-semibold text-white bg-gradient-to-br from-violet-600 to-violet-400">Send message</button>
<p data-form-message class="text-sm mt-2" aria-live="polite"></p>
</form>`
      : ''
    contentHtml = `<section class="page-fallback max-w-3xl mx-auto px-4 py-16 md:py-24"><h1 class="text-3xl md:text-4xl font-bold mb-4">${title}</h1>${desc ? `<p class="text-lg opacity-90 mb-6">${desc}</p>` : ''}${contactForm}</section>`
  }

  const mainRe = /<main\b[^>]*>[\s\S]*?<\/main>/i
  const bodyRe = /<body\b[^>]*>/i
  let out = String(homepageHtml ?? '')

  if (mainRe.test(out)) {
    out = out.replace(mainRe, (full) => {
      const open = full.match(/^<main\b[^>]*>/i)?.[0] ?? '<main>'
      return `${open}${contentHtml}</main>`
    })
  } else if (bodyRe.test(out)) {
    out = out.replace(bodyRe, (b) => `${b}\n${contentHtml}\n`)
  } else {
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>${title}</title></head><body>${contentHtml}</body></html>`
  }

  if (/<title>/i.test(out)) {
    out = out.replace(/<title>[^<]*<\/title>/i, `<title>${title}</title>`)
  } else if (/<head\b/i.test(out)) {
    out = out.replace(/<head\b[^>]*>/i, (h) => `${h}\n<title>${title}</title>`)
  }
  return out
}
