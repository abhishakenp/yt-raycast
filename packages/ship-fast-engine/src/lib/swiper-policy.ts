export function shouldUseSwiper(
  siteSpec: { siteType?: string; userPrompt?: string } | null,
): boolean {
  if (!siteSpec) return false
  if (siteSpec.siteType === 'ecommerce') return true
  const p = String(siteSpec.userPrompt || '').toLowerCase()
  return /\b(carousel|slider|swiper|slideshow|swipe(?:able)?|marquee|image\s*gallery)\b/.test(
    p,
  )
}
