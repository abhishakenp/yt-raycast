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
import { Container } from '#/section-kit/Container.tsx'
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
    const eyebrowCls =
      'text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground'
    return (
      <section
        aria-label="Featured press"
        className={cn('border-b border-border pt-28 pb-12', props.className)}
      >
        <Container>
          <p className={cn(eyebrowCls, 'mb-8 text-center')}>{pressEyebrow}</p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 lg:gap-16">
            {pressLogos.map((logo) => (
              <span
                key={logo}
                className="font-serif text-xl tracking-tight text-muted-foreground sm:text-2xl"
              >
                {logo}
              </span>
            ))}
          </div>
        </Container>
      </section>
    )
  },
})
