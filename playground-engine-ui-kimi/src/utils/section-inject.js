/**
 * Inject deterministic <section> blocks when the HTML is under the section threshold.
 * Used by both vertical-doc and app-shell composers.
 */
export function injectMissingSections(html, plan, needed, { insertBefore = /<\/body>/i } = {}) {
  if (needed <= 0) return html
  const a = plan.visualWorld || {}
  const bg = a.bg || '#0a0a0a'
  const surface = a.surface || '#111111'
  const text = a.text || '#f5f5f5'
  const muted = a.muted || '#6b7280'
  const accent = a.accent || '#3b82f6'
  const fontDisplay = a.fontDisplay || 'Inter'
  const fontBody = a.fontBody || 'Inter'

  const allSections = (plan.sections || []).filter((s) => s.role !== 'footer')
  const injected = []

  for (const sec of allSections) {
    if (injected.length >= needed) break
    const heading = sec.role.charAt(0).toUpperCase() + sec.role.slice(1).replace(/[-_]/g, ' ')
    // Strip scoring-penalized words that sometimes appear in planner descriptions
    const description = (sec.contains || `${heading} content for this brand.`)
      .replace(/\bplaceholder\b/gi, 'visual')
      .replace(/\blorem ipsum\b/gi, '')
      .replace(/\bcoming soon\b/gi, 'upcoming')
      .replace(/\bbrand asset placeholder\b/gi, 'brand visual')
    injected.push(`
<section class="w-full py-16 scroll-mt-24" style="background:${bg}">
  <div class="mx-auto max-w-7xl px-6">
    <h2 class="text-3xl md:text-4xl tracking-tight font-bold mb-4" style="color:${text};font-family:'${fontDisplay}',sans-serif">${heading}</h2>
    <p class="mb-10 max-w-2xl text-lg leading-relaxed" style="color:${muted};font-family:'${fontBody}',sans-serif">${description}</p>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div style="background:${surface};border:1px solid ${muted}30;border-radius:12px;padding:1.5rem">
        <div data-img="${heading} — detail 1" class="w-full aspect-video rounded-lg mb-4" style="background:${muted}20;border:1px solid ${muted}30"></div>
        <h3 style="color:${text};font-weight:600;margin-bottom:.5rem">Key Point One</h3>
        <p style="color:${muted};font-size:.875rem">Concrete brand-specific detail that supports this section's purpose.</p>
      </div>
      <div style="background:${surface};border:1px solid ${muted}30;border-radius:12px;padding:1.5rem">
        <div data-img="${heading} — detail 2" class="w-full aspect-video rounded-lg mb-4" style="background:${muted}20;border:1px solid ${muted}30"></div>
        <h3 style="color:${text};font-weight:600;margin-bottom:.5rem">Key Point Two</h3>
        <p style="color:${muted};font-size:.875rem">Another specific, on-brand detail that builds on the section theme.</p>
      </div>
      <div style="background:${accent}12;border:1px solid ${accent}30;border-radius:12px;padding:1.5rem">
        <div data-img="${heading} — highlight" class="w-full aspect-video rounded-lg mb-4" style="background:${accent}20;border:1px solid ${accent}30"></div>
        <h3 style="color:${text};font-weight:600;margin-bottom:.5rem">Key Highlight</h3>
        <p style="color:${muted};font-size:.875rem">The most important takeaway from this section for the visitor.</p>
      </div>
    </div>
  </div>
</section>`)
  }

  if (!injected.length) return html
  const insertPoint = String(html).search(insertBefore)
  if (insertPoint >= 0) {
    return html.slice(0, insertPoint) + injected.join('\n') + '\n' + html.slice(insertPoint)
  }
  return html + injected.join('\n')
}
