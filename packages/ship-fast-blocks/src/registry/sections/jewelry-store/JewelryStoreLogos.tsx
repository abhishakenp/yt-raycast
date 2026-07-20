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
 * JewelryStoreLogos — press / awards recognition strip for a luxury jewelry
 * maison. A hairline top-and-bottom bordered band, contained to page width, with
 * a centered mono micro-label caption above a quiet responsive grid of dimmed
 * serif publication wordmarks (2 cols mobile, 4 tablet, 6 desktop; trailing
 * items reveal only on large screens). Use directly below the hero to establish
 * editorial credibility via Vogue / Bazaar / Tatler-style press logos. Renders
 * fully with no props via baked-in defaults.
 */
export const JewelryStoreLogos = defineCapsule({
  name: 'JewelryStoreLogos',
  description:
    'Press / awards recognition strip for a luxury jewelry maison: a hairline top-and-bottom bordered band, contained to page width, with a centered mono micro-label caption above a quiet responsive grid of dimmed serif publication wordmarks (2 cols mobile, 4 tablet, 6 desktop; trailing items reveal only on large screens). Use directly below the hero to establish editorial credibility via Vogue / Bazaar / Tatler-style press logos for fine jewelers, diamond houses, or any premium luxury-retail brand.',
  props: z.object({
    label: z.string().optional(),
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const label = props.label ?? 'Recognized Excellence'
    const items = props.items?.length
      ? props.items
      : ['VOGUE', 'BAZAAR', 'TATLER', 'WWD', 'JCK JEWELRY', 'ELLE']

    return (
      <LogoStrip
        className={cn(
          'border-y border-border bg-background py-16',
          props.className,
        )}
      >
        <Container>
          <LogoStripLabel className="font-mono text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
            {label}
          </LogoStripLabel>
          <LogoStripItems layout="grid" className="mt-10">
            {items.filter(Boolean).map((logo) => (
              <LogoStripItem
                key={logo}
                className="font-serif text-lg font-normal tracking-[0.15em] text-muted-foreground/70 transition-colors hover:text-foreground"
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
