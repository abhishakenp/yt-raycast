export const shouldUseSwiper = (siteSpec) => {
  if (!siteSpec) return false
  if (siteSpec.siteType === 'ecommerce') return true
  const p = String(siteSpec.userPrompt || '').toLowerCase()
  return /\b(carousel|slider|swiper|slideshow|swipe|marquee|image\s*gallery)\b/.test(
    p,
  )
}
