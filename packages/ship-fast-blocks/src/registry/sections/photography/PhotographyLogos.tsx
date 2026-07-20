import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  LogoStrip,
  LogoStripLabel,
  LogoStripItems,
  LogoStripItem,
} from '#/section-kit/LogoStrip.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * PhotographyLogos — a hairline "Featured In" press band for a fine-art /
 * wedding photographer portfolio. A quiet, hairline-bordered strip inside a
 * plain Container: a left-aligned mono, wide-tracked press label sits on its
 * own hairline rule above a faded wrapping row of serif publication wordmarks,
 * each faded until hover and routing through section-kit route links. Extreme
 * restraint, tokens-only, so it reads in both light and dark themes. Use as a
 * social-proof / press-credibility band beneath a hero for photographers,
 * studios, and editorial creatives. Renders fully with no props via baked-in
 * wedding-press defaults.
 */
export const PhotographyLogos = defineCapsule({
  name: 'PhotographyLogos',
  description:
    "A hairline 'Featured In' press band for a fine-art / wedding photographer portfolio: a quiet, hairline-bordered strip inside a plain Container pairing a left-aligned mono, wide-tracked press label on its own hairline rule with a faded wrapping row of serif publication wordmarks that sharpen on hover, each routing through section-kit route links. Extreme restraint, tokens-only. Use as a social-proof / press-credibility band beneath a hero for photographers, studios, and editorial creatives.",
  props: z.object({
    /** Uppercase tracked label above the logos. */
    label: z.string().optional(),
    /** Publication wordmarks shown in the strip. */
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const label = props.label ?? 'Featured In'
    const items = props.items?.length
      ? props.items
      : [
          'Vogue',
          "Harper's Bazaar",
          'The Knot',
          'Martha Stewart Weddings',
          'Style Me Pretty',
          'Green Wedding Shoes',
        ]

    return (
      <LogoStrip
        className={cn('border-y border-border bg-background', props.className)}
      >
        <Container className="py-14 lg:py-16">
          <div className="flex items-center gap-4">
            <LogoStripLabel className="text-left font-mono text-[11px] tracking-[0.2em] text-muted-foreground">
              {label}
            </LogoStripLabel>
            <span aria-hidden="true" className="h-px flex-1 bg-border" />
            <span
              aria-hidden="true"
              className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60"
            >
              Press
            </span>
          </div>
          <LogoStripItems
            layout="flex"
            className="mt-8 justify-start gap-x-10 gap-y-5"
          >
            {items.filter(Boolean).map((logo) => (
              <LogoStripItem
                key={logo}
                variant="opacity-hover"
                asChild
                className="font-serif text-xl tracking-tight"
              >
                <NavbarRouteLink href={logo}>{logo}</NavbarRouteLink>
              </LogoStripItem>
            ))}
          </LogoStripItems>
        </Container>
      </LogoStrip>
    )
  },
})
