import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import {
  LogoStrip,
  LogoStripLabel,
  LogoStripItems,
  LogoStripItem,
} from '#/section-kit/LogoStrip.tsx'

/**
 * InteriorDesignLogos — understated editorial "trusted by" wordmark ledger for an
 * upscale interior-design / architecture studio site. A muted, hairline-ruled
 * band (border-top-and-bottom) whose content sits in the shared max-w-7xl
 * Container: a mono micro-label caption with a small primary swatch above a
 * responsive collapsed-hairline row of light-weight wordmark logos at reduced
 * opacity that lift to full on hover (extra items hide below large screens).
 * Minimal, gallery-like, binary radius — pure social proof, no links. Use beneath
 * the hero to signal partner brands, press, retailers or showroom affiliations
 * for design studios, architecture firms or furniture businesses. Renders fully
 * with no props via baked-in defaults.
 */
export const InteriorDesignLogos = defineCapsule({
  name: 'InteriorDesignLogos',
  description:
    "Understated editorial 'trusted by' wordmark ledger for an upscale interior-design / architecture studio site: a muted, hairline-ruled band (border-top-and-bottom) whose content sits in the shared max-w-7xl Container, with a mono micro-label caption + small primary swatch above a responsive collapsed-hairline row of light-weight wordmark logos at reduced opacity that lift to full on hover (extra items hide below large screens). Minimal, gallery-like, binary radius — pure social proof. Use beneath the hero to signal partner brands, press, retailers or showroom affiliations for design studios, architecture firms or furniture businesses.",
  props: z.object({
    heading: z.string().optional(),
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Trusted by leading brands'
    const items = props.items?.length
      ? props.items
      : [
          'West Elm',
          'Restoration',
          'Crate&Barrel',
          'Design Within',
          'Herman Miller',
          'Knoll',
        ]

    return (
      <LogoStrip
        className={cn(
          'border-y border-border bg-muted/40 py-14 md:py-16',
          props.className,
        )}
      >
        <Container>
          <LogoStripLabel className="flex items-center justify-center gap-2.5 font-mono text-[11px] font-normal normal-case tracking-[0.2em]">
            <span aria-hidden="true" className="size-2 bg-primary" />
            {heading}
          </LogoStripLabel>
          <LogoStripItems
            layout="flex"
            className="mt-8 gap-x-8 gap-y-6 border-t border-border pt-8 md:gap-x-12"
          >
            {items.filter(Boolean).map((logo) => (
              <LogoStripItem
                key={logo}
                variant="opacity-hover"
                className="text-base font-light tracking-tight text-muted-foreground/70 transition-colors hover:text-foreground"
              >
                {logo}
              </LogoStripItem>
            ))}
          </LogoStripItems>
        </Container>
      </LogoStrip>
    )
  },
})
