import { resolveDna, synthesizeDna } from './dna'
import { fetchLiveScreensForApp, isMobbinLiveEnabled } from './session'
import type { MobbinAnchor, MobbinDna, MobbinScreen } from './types'

function normApp(name: string): string {
  return String(name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
}

/** Enrich ship-engine anchor with live Mobbin screen metadata when Pro auth is available. */
export async function enrichAnchorWithLiveMobbin(
  primary: MobbinAnchor,
): Promise<MobbinAnchor> {
  if (!isMobbinLiveEnabled() || !primary?.app) return primary

  const screens = await fetchLiveScreensForApp(primary.app, { limit: 2 })
  if (!screens.length) return primary

  const elements = [
    ...new Set(
      screens.flatMap((s: MobbinScreen) => s.elements || []).filter(Boolean),
    ),
  ].slice(0, 12)
  const patterns = [
    ...new Set(
      screens.flatMap((s: MobbinScreen) => s.patterns || []).filter(Boolean),
    ),
  ].slice(0, 6)
  const dna: MobbinDna | null =
    primary.dna ||
    resolveDna(primary.app) ||
    synthesizeDna(primary.palette || [])

  const liveLayout =
    elements.length || patterns.length
      ? `Live Mobbin Pro (${primary.app}): patterns ${patterns.join(', ') || 'Home'}; observed elements ${elements.slice(0, 8).join(', ') || 'hero, nav'}.`
      : ''

  return {
    ...primary,
    dna: {
      ...dna,
      layout: liveLayout
        ? `${dna?.layout || ''} ${liveLayout}`.trim()
        : dna?.layout,
      doctrine: [
        ...(Array.isArray(dna?.doctrine) ? dna.doctrine : []),
        ...(elements.length
          ? [
              `Include visible ${elements.slice(0, 3).join(' / ')} surfaces like the live Mobbin reference`,
            ]
          : []),
      ].slice(0, 5),
      _liveMobbin: true,
      _liveScreens: screens.length,
    },
    liveScreens: screens,
  }
}

export function anchorAppMatchesLiveScreen(
  primary: MobbinAnchor,
  screen: MobbinScreen,
): boolean {
  if (!primary?.app || !screen?.app) return false
  const a = normApp(primary.app)
  const b = normApp(screen.app)
  return a === b || b.includes(a) || a.includes(b)
}
