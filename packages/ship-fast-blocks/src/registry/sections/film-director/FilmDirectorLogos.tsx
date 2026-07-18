import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * FilmDirectorLogos — a minimal "trusted by" brand-logo strip for a film
 * director / cinematographer portfolio. A bordered (top + bottom) band with a
 * small centered muted caption above a responsive 2/4/6-column grid of slightly
 * dimmed wordmark-style brand names rendered as bold tracked text. Use as a
 * social-proof / client-roster band beneath the hero for filmmakers, directors,
 * cinematographers, DPs, or production houses.
 */
import {
  LogoStrip,
  LogoStripLabel,
  LogoStripItems,
  LogoStripItem,
} from '#/section-kit/LogoStrip.tsx'
export const FilmDirectorLogos = defineCapsule({
  name: 'FilmDirectorLogos',
  description:
    "Minimal 'trusted by' brand-logo strip for a film director / cinematographer portfolio: a bordered (top + bottom) band with a small centered muted caption above a responsive 2/4/6-column grid of slightly dimmed wordmark-style brand names rendered as bold tracked text. Use as a social-proof / client-roster band beneath the hero for filmmakers, directors, cinematographers, DPs, or production houses.",
  props: z.object({
    label: z.string().optional(),
    brands: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const logosLabel = props.label ?? 'Trusted by leading brands and agencies'
    const logoBrands = props.brands?.length
      ? props.brands
      : ['NIKE', 'APPLE', 'SONY', 'NETFLIX', 'SPOTIFY', 'ADOBE']
    return (
      <LogoStrip
        className={cn(
          'border-y border-border pt-28 pb-16 md:pt-32 md:pb-24',
          props.className,
        )}
      >
        <LogoStripLabel>{logosLabel}</LogoStripLabel>
        <LogoStripItems layout="flex" className="mt-8">
          {logoBrands.filter(Boolean).map((logo) => (
            <LogoStripItem key={logo} variant="opacity-hover">
              {logo}
            </LogoStripItem>
          ))}
        </LogoStripItems>
      </LogoStrip>
    )
  },
})
