import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * FashionStoreLogos — "Featured In" press logo strip for a minimalist fashion
 * store. A slim border-bottomed band with a centered uppercase tracked eyebrow
 * above a wrapping, centered row of serif publication wordmarks rendered in a
 * muted tone. Use directly under the hero to convey press credibility for
 * clothing brands, boutiques, or any premium retail storefront.
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
    "'Featured In' press logo strip for a minimalist fashion store: a slim border-bottomed band with a centered uppercase tracked eyebrow above a wrapping, centered row of serif publication wordmarks rendered in a muted tone. Use directly under the hero to convey press credibility for clothing brands, boutiques, apparel shops, or any premium retail storefront.",
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
        <LogoStripLabel>{pressEyebrow}</LogoStripLabel>
        <LogoStripItems layout="flex" className="mt-8">
          {pressLogos.filter(Boolean).map((logo) => (
            <LogoStripItem key={logo} variant="text">
              {logo}
            </LogoStripItem>
          ))}
        </LogoStripItems>
      </LogoStrip>
    )
  },
})
