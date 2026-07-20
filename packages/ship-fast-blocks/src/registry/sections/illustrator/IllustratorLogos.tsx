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
import { MonoTag } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * IllustratorLogos — a hand-made "featured in" credits strip for an illustrator
 * / visual-artist portfolio on a paper-wash muted band framed by dashed top and
 * bottom rules. A mono index micro-label leads a wrapping row of publication /
 * brand names rendered as rounded-full sticker chips (dashed outlines, gently
 * rotated) that route through route hrefs. Use directly beneath an illustrator
 * or creative hero to establish credibility with the magazines, publishers, and
 * brands the artist has worked with. Renders fully with no props via baked-in
 * publication defaults.
 */
export const IllustratorLogos = defineCapsule({
  name: 'IllustratorLogos',
  description:
    "Hand-made 'featured in' credits strip for an illustrator / visual-artist portfolio on a paper-wash muted band framed by dashed top and bottom rules: a mono index micro-label above a wrapping row of publication / brand names rendered as rounded-full sticker chips (dashed outlines, gently rotated), each routing through route hrefs. Use directly beneath an illustrator or creative hero to establish credibility with the magazines, publishers, and brands the artist has worked with.",
  props: z.object({
    /** Small uppercase caption above the names row. */
    heading: z.string().optional(),
    /** Publication / brand names to display. */
    names: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Trusted by leading publications & brands'
    const names = props.names?.length
      ? props.names
      : [
          'The New Yorker',
          'Penguin Random House',
          'Chronicle Books',
          'Anthropologie',
          'Patagonia',
        ]
    const tilt = ['-rotate-2', 'rotate-1', '-rotate-1', 'rotate-2', 'rotate-0']

    return (
      <LogoStrip
        className={cn(
          'border-y-2 border-dashed border-border/70 bg-muted/30 py-12 sm:py-16',
          props.className,
        )}
      >
        <Container>
          <div className="flex flex-col items-center gap-8">
            <LogoStripLabel asChild>
              <MonoTag className="flex items-center gap-2 text-muted-foreground">
                <span aria-hidden="true">*</span>
                {heading}
              </MonoTag>
            </LogoStripLabel>
            <LogoStripItems layout="flex" className="gap-x-4 gap-y-4">
              {names.filter(Boolean).map((logo, i) => (
                <LogoStripItem
                  key={logo}
                  variant="opacity-hover"
                  asChild
                  className={cn(
                    'rounded-full border-2 border-dashed border-foreground/30 bg-background px-4 py-1.5 font-serif text-base text-muted-foreground transition-[color,transform,border-color] duration-150 hover:-translate-y-0.5 hover:border-foreground/60 hover:text-foreground',
                    tilt[i % tilt.length],
                  )}
                >
                  <NavbarRouteLink href={logo}>{logo}</NavbarRouteLink>
                </LogoStripItem>
              ))}
            </LogoStripItems>
          </div>
        </Container>
      </LogoStrip>
    )
  },
})
