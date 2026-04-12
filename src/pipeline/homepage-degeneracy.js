function stripToVisibleText(html) {
  return String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function countStructuralTags(html) {
  const s = String(html || '')
  const m = s.match(/<\/?(?:section|article|header|footer|nav|main|aside)\b/gi)
  return m ? m.length : 0
}

export function htmlLooksDegenerate(html) {
  const s = String(html || '').trim()
  if (s.length < 350) return true

  const low = s.toLowerCase()
  if (!low.includes('<html') && !low.includes('<!doctype')) return true
  if (!/<body[\s>]/i.test(s)) return true

  const noScripts = s.replace(/<script[\s\S]*?<\/script>/gi, '')
  const angleRatio = (noScripts.match(/</g) || []).length / Math.max(noScripts.length, 1)
  if (noScripts.length > 6000 && angleRatio < 0.012) return true

  const text = stripToVisibleText(s)
  if (text.length > 800) {
    const words = text.split(/\s+/).filter(Boolean)
    if (words.length > 400) {
      const uniq = new Set(words.map((w) => w.toLowerCase()))
      const ratio = uniq.size / words.length
      if (ratio < 0.06) return true
    }

    let run = 1
    let maxRun = 1
    const w = text.split(/\s+/).filter(Boolean)
    for (let i = 1; i < w.length; i++) {
      if (w[i] === w[i - 1]) {
        run++
        maxRun = Math.max(maxRun, run)
      } else {
        run = 1
      }
    }
    if (maxRun > 45) return true

    if (w.length > 80) {
      const bigrams = new Map()
      for (let i = 0; i < w.length - 1; i++) {
        const bg = `${w[i].toLowerCase()} ${w[i + 1].toLowerCase()}`
        bigrams.set(bg, (bigrams.get(bg) || 0) + 1)
      }
      for (const c of bigrams.values()) {
        if (c > 80) return true
      }
    }
  }

  if (text.length > 12000 && countStructuralTags(s) < 4) return true

  return false
}
