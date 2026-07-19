/**
 * Shared types for the section-kit: generic, reusable, prop-driven React
 * composites that vertical section capsules compose. Single source of truth
 * for the action contract used by nav CTAs, CTA bands, pricing tiers, etc.
 */

/**
 * A routable action rendered as a pill button. `target` (falling back to
 * `label`) is rendered through section-kit route links so any label resolves to the
 * best site route. `variant` selects the pill styling.
 */
export type KitAction = {
  label: string
  target?: string
  variant?: 'primary' | 'outline' | 'ghost'
}

/**
 * Maps a {@link KitAction} variant to its pill classes. Every action is a
 * rounded-full pill (px-5 py-2.5 text-sm font-medium) so callers stay
 * consistent across the kit. Pass `invert` for tone="primary" bands where the
 * primary action must read against a primary background.
 */
export function kitActionClasses(
  variant: KitAction['variant'] = 'primary',
  invert = false,
): string {
  const base =
    'inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium transition-colors'
  if (variant === 'outline') {
    return `${base} border border-border bg-background text-foreground hover:bg-muted`
  }
  if (variant === 'ghost') {
    return `${base} text-foreground hover:bg-muted`
  }
  // primary
  return invert
    ? `${base} bg-background text-foreground hover:bg-background/90`
    : `${base} bg-primary text-primary-foreground hover:bg-primary/90`
}
