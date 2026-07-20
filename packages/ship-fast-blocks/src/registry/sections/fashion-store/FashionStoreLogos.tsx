import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * FashionStoreLogos — "Featured In" press logo strip for a luxury fashion
 * store. A slim hairline-bottomed band with a centered mono kicker eyebrow
 * above a wrapping, centered row of large serif publication wordmarks rendered
 * in a muted tone that warms to full ink on hover. Use directly under the hero
 * to convey press credibility for clothing brands, boutiques, or any premium
 * retail storefront.
 */
import {
  LogoStrip,
  LogoStripLabel,
  LogoStripItems,
  LogoStripItem,
} from '#/section-kit/LogoStrip.tsx'
export const FashionStoreLogos = defineCapsule({
  name: 'FashionStoreLogos',
  description:
    "'Featured In' press logo strip for a luxury fashion store: a slim hairline-bottomed band with a centered mono kicker eyebrow above a wrapping, centered row of large serif publication wordmarks rendered in a muted tone that warms to full ink on hover. Use directly under the hero to convey press credibility for clothing brands, boutiques, apparel shops, or any premium retail storefront.",
  props: z.object({
    eyebrow: z.string().optional(),
    logos: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const pressEyebrow = props.eyebrow ?? 'Featured In'
    const pressLogos = props.logos?.length
      ? props.logos
      : ['VOGUE', "Harper's Bazaar", 'Elle', 'GQ', 'W Magazine', 'The Cut']
    return (
      <LogoStrip
        className={cn('border-b border-border pt-28 pb-12', props.className)}
      >
        <LogoStripLabel className="font-mono text-[11px] font-medium uppercase tracking-[0.24em]">
          {pressEyebrow}
        </LogoStripLabel>
        <LogoStripItems layout="flex" className="mt-8 gap-x-12">
          {pressLogos.filter(Boolean).map((logo) => (
            <LogoStripItem
              key={logo}
              variant="text"
              className="font-serif text-xl font-normal tracking-tight text-muted-foreground transition-colors hover:text-foreground"
            >
              {logo}
            </LogoStripItem>
          ))}
        </LogoStripItems>
      </LogoStrip>
    )
  },
})
