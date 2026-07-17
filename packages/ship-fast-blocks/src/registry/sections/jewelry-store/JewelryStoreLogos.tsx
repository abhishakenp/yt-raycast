import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { LogoStrip } from '#/section-kit/LogoStrip.tsx'

/**
 * JewelryStoreLogos — press / awards recognition strip for a luxury jewelry
 * brand. A bordered band with a centered wide letter-spaced uppercase
 * caption above a responsive grid of dimmed serif publication wordmarks
 * (2 cols mobile, 4 tablet, 6 desktop; the last items reveal only on large
 * screens). Use directly below the hero to establish editorial credibility
 * via Vogue / Bazaar / Tatler-style press logos. Renders fully with no props
 * via baked-in defaults.
 */
export const JewelryStoreLogos = defineCapsule({
  name: 'JewelryStoreLogos',
  description:
    'Press / awards recognition strip for a luxury jewelry brand: a bordered band with a centered wide letter-spaced uppercase caption above a responsive grid of dimmed serif publication wordmarks (2 cols mobile, 4 tablet, 6 desktop; trailing items reveal only on large screens). Use directly below the hero to establish editorial credibility via Vogue / Bazaar / Tatler-style press logos for fine jewelers, diamond houses, or any premium luxury-retail brand.',
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
        lead={label}
        logos={items}
        layout="grid"
        leadClassName="text-xs tracking-[0.3em]"
        logoClassName="font-serif tracking-widest"
        className={cn(
          'border-b border-border bg-background py-20 opacity-60',
          props.className,
        )}
      />
    )
  },
})
