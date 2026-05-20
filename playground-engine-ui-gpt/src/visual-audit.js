const INTERNAL_TERMS = [
  'Proof point',
  'placeholder filler',
  'Signature moves:',
  'Mobbin DNA',
  'deterministic shell',
  'brand asset placeholder',
]

const FLAT_MEDIA_CLASS = /\b(?:bg-current\/10|bg-gray-|bg-neutral-|bg-zinc-|bg-slate-|bg-stone-)\b/i

export function auditVisualSnapshot(snapshot = {}) {
  const issues = []
  const text = String(snapshot.text || '')
  const dataImgs = Array.isArray(snapshot.dataImgs) ? snapshot.dataImgs : []
  const internalHits = INTERNAL_TERMS.filter((term) => text.toLowerCase().includes(term.toLowerCase()))
  const flatMedia = dataImgs.filter((item) => {
    const cls = String(item.className || '')
    const visible = String(item.text || '')
    const hasArtSurface = /\bdata-visual=["']?art-surface/.test(String(item.outerHTML || '')) || /bg-gradient-to-/.test(cls)
    const isSmallBrandChip = /\bw-(?:12|16|20|24|28|32)\b/.test(cls) && /\bh-(?:8|10|12|14|16)\b/.test(cls)
    if (isSmallBrandChip && visible.trim()) return false
    return FLAT_MEDIA_CLASS.test(cls) || /\bplaceholder\b/i.test(visible) || (!hasArtSurface && Number(item.childElementCount || 0) === 0)
  })
  if (internalHits.length) issues.push(`internal copy leaked: ${internalHits.join(', ')}`)
  if (flatMedia.length) issues.push(`${flatMedia.length} image placeholders look flat or unfinished`)
  if (Number(snapshot.overflowCount || 0) > 0) issues.push(`${snapshot.overflowCount} elements overflow their container`)
  return {
    ok: issues.length === 0,
    issues,
    dataImgCount: dataImgs.length,
    flatMediaCount: flatMedia.length,
    internalHits,
    overflowCount: Number(snapshot.overflowCount || 0),
  }
}

export async function collectBrowserVisualAudit(page) {
  const snapshot = await page.evaluate(() => {
    const dataImgs = [...document.querySelectorAll('[data-img]')].map((el) => ({
      className: el.getAttribute('class') || '',
      text: el.textContent || '',
      childElementCount: el.children.length,
      outerHTML: el.outerHTML.slice(0, 240),
    }))
    const overflowing = [...document.querySelectorAll('body *')].filter((el) => {
      const rect = el.getBoundingClientRect()
      if (el.closest('[data-visual="art-surface"]')) return false
      if (rect.width < 40 || rect.height < 1) return false
      if (rect.width > window.innerWidth + 8) return false
      return el.scrollWidth > el.clientWidth + 24
    })
    return {
      text: document.body?.innerText || '',
      dataImgs,
      overflowCount: overflowing.length,
    }
  })
  return auditVisualSnapshot(snapshot)
}
