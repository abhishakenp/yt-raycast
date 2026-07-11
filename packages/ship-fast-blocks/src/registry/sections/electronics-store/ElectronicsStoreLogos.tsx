import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * ElectronicsStoreLogos — a centered trusted-brand logo strip for an electronics
 * storefront. A small caption line above a wrapping, dimmed row of wordmark text
 * logos for leading tech brands, separated from neighbors by a bottom border.
 * Use beneath a hero to establish credibility on electronics stores, gadget
 * shops, consumer-tech retailers, or audio/camera storefronts.
 */
import { Container } from '#/section-kit/Container.tsx'
export const ElectronicsStoreLogos = defineCapsule({
  name: 'ElectronicsStoreLogos',
  description:
    'Centered trusted-brand logo strip for an electronics storefront: a small caption line above a wrapping, dimmed row of wordmark text logos for leading tech brands (e.g. Apple, Sony, Samsung, Bose, Logitech, DJI), with a bottom border separating it from neighbors. Use beneath a hero to establish credibility on electronics stores, gadget shops, consumer-tech retailers, or audio/camera storefronts.',
  props: z.object({
    /** Caption above the logo row. */
    caption: z.string().optional(),
    /** Brand wordmarks shown in the strip. */
    brands: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const caption = props.caption ?? 'Trusted by leading tech brands worldwide'
    const brands = props.brands?.length
      ? props.brands
      : ['Apple', 'Sony', 'Samsung', 'Bose', 'Logitech', 'DJI']
    return (
      <section className={cn('border-b border-border py-12', props.className)}>
        <Container>
          <p className="mb-8 text-center text-sm text-muted-foreground">
            {caption}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-60 lg:gap-16">
            {brands.map((b) => (
              <span key={b} className="text-lg font-semibold text-foreground">
                {b}
              </span>
            ))}
          </div>
        </Container>
      </section>
    )
  },
})
