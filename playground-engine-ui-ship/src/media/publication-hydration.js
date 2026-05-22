/** Stock photo hydration for blog/publication homepages — matches production groq + image-hints pipeline. */

const DOG_PEXELS_IDS = [
  1108099, 1805164, 2253275, 4587995, 4588435, 5732433, 7516465, 6795740, 1851164, 825947,
]

const GENERIC_EDITORIAL_IDS = [
  1152077, 1034812, 1446292, 1628239, 1670770, 1755386, 1855765, 2149475, 2036646, 3760772,
]

function formatPexelsUrl(id, width = 800, height = 600) {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${width}&h=${height}&fit=crop`
}

function photosForBrief(brief = '') {
  const text = String(brief).toLowerCase()
  if (/\b(dog|dogs|puppy|puppies|pup|canine|retriever|beagle|husky|terrier|bulldog)\b/.test(text)) {
    return DOG_PEXELS_IDS.map((id) => formatPexelsUrl(id))
  }
  return GENERIC_EDITORIAL_IDS.map((id) => formatPexelsUrl(id))
}

function escapeAttr(value = '') {
  return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;')
}

function isEmptyThumbnailBlock(tag) {
  if (/<img\b[^>]*\bsrc=["']https?:\/\//i.test(tag)) return false
  if (/\bbackground-image:\s*url\(/i.test(tag)) return false
  if (/\bdata-visual=["']art-surface["']/i.test(tag) && !/\bopacity-\[0\.04\]|data-lucide|mix-blend/i.test(tag)) {
    return true
  }
  if (/\bdata-img=/i.test(tag) && !/<img\b/i.test(tag)) return true
  if (/\bclass="[^"]*\bimg\b[^"]*"/i.test(tag) && !/<img\b/i.test(tag)) return true
  return false
}

/** Fill empty card/cover placeholders with brief-aware Pexels photos (production parity). */
export function hydratePublicationImages(html, brief = '') {
  const source = String(html ?? '')
  if (!source) return source
  const photos = photosForBrief(brief)
  if (!photos.length) return source

  let index = 0
  const nextPhoto = (subject = 'article cover') => {
    const url = photos[index % photos.length]
    index += 1
    return { url, alt: subject.slice(0, 80) }
  }

  let out = source

  out = out.replace(/<img\b([^>]*?)\bsrc=["']https?:\/\/(?!images\.pexels\.com)[^"']+["']([^>]*)>/gi, (full, before, after) => {
    const cls = full.match(/\bclass=["']([^"']*)["']/i)?.[1] || 'w-full h-48 object-cover rounded-md'
    const subject = full.match(/\balt=["']([^"']*)["']/i)?.[1] || 'editorial cover'
    const { url, alt } = nextPhoto(subject)
    const loading = /\bloading=/i.test(full) ? '' : ' loading="eager"'
    const decoding = /\bdecoding=/i.test(full) ? '' : ' decoding="async"'
    return `<img class="${escapeAttr(cls)}" src="${url}" alt="${escapeAttr(alt)}"${loading}${decoding} />`
  })

  out = out.replace(/<div\s+class="([^"]*\bimg\b[^"]*)"[^>]*>\s*<\/div>/gi, (_full, cls) => {
    const { url, alt } = nextPhoto('cover photo')
    return `<img class="${cls}" src="${url}" alt="${escapeAttr(alt)}" loading="eager" decoding="async" />`
  })

  out = out.replace(
    /<div\b([^>]*\bdata-img=["']([^"']*)["'][^>]*)>\s*(?:<!--[\s\S]*?-->)?\s*<\/div>/gi,
    (full, attrs, subject) => {
      if (!isEmptyThumbnailBlock(full)) return full
      const cls = attrs.match(/\bclass=["']([^"']*)["']/i)?.[1] || 'w-full aspect-[4/3] object-cover rounded-xl'
      const { url, alt } = nextPhoto(subject)
      return `<img class="${cls}" src="${url}" alt="${escapeAttr(alt || subject)}" loading="eager" decoding="async" />`
    },
  )

  out = out.replace(
    /(<section\b[^>]*\bid=["']featured["'][\s\S]*?)(<div\b[^>]*\b(?:data-visual=["']art-surface["']|data-img=)[^>]*>[\s\S]*?<\/div>)/i,
    (full, before, divBlock) => {
      if (/<img\b[^>]*\bsrc=["']https?:\/\//i.test(full)) return full
      const { url, alt } = nextPhoto('featured cover')
      const thumb = `<img class="w-full aspect-[16/10] object-cover rounded-xl" src="${url}" alt="${escapeAttr(alt)}" loading="eager" decoding="async" />`
      return `${before}${thumb}`
    },
  )

  out = out.replace(
    (full, attrs) => {
      if (!isEmptyThumbnailBlock(full)) return full
      if (/\bdata-lucide|mix-blend|Visual Journal|Field Study/i.test(full)) return full
      const cls = attrs.match(/\bclass=["']([^"']*)["']/i)?.[1] || 'w-full aspect-[4/3] object-cover rounded-xl'
      const subject = attrs.match(/\bdata-img=["']([^"']*)["']/i)?.[1] || 'editorial cover'
      const { url, alt } = nextPhoto(subject)
      return `<img class="${cls}" src="${url}" alt="${escapeAttr(alt)}" loading="eager" decoding="async" />`
    },
  )

  out = out.replace(
    /<article\b([\s\S]*?)<\/article>/gi,
    (block) => {
      if (/<img\b[^>]*\bsrc=["']https?:\/\//i.test(block)) return block
      const { url, alt } = nextPhoto('article cover')
      const thumb = `<img class="w-full h-48 object-cover rounded-md" src="${url}" alt="${escapeAttr(alt)}" loading="eager" decoding="async" />`
      if (/<div\b[^>]*\bdata-visual=["']art-surface["'][^>]*>/i.test(block)) {
        return block.replace(/<div\b[^>]*\bdata-visual=["']art-surface["'][^>]*>[\s\S]*?<\/div>/i, thumb)
      }
      if (/<div\b[^>]*\bdata-img=/i.test(block)) {
        return block.replace(/<div\b[^>]*\bdata-img=[^>]*>[\s\S]*?<\/div>/i, thumb)
      }
      return block.replace(/<article\b/i, `<article`).replace(
        /(<article[^>]*>)/i,
        `$1\n${thumb}`,
      )
    },
  )

  return out
}

export function countPublicationPhotos(html) {
  return (String(html ?? '').match(/<img\b[^>]*\bsrc=["']https:\/\/images\.pexels\.com/gi) || []).length
}
