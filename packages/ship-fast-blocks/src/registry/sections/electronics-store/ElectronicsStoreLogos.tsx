import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * ElectronicsStoreLogos — a tech-brutalist trusted-brand logo strip for an
 * electronics storefront. A mono uppercase caption line above a wrapping row of
 * bold wordmark text logos for leading tech brands, framed by heavy border-2
 * top/bottom rules like a spec-sheet manifest. Use beneath a hero to establish
 * credibility on electronics stores, gadget shops, consumer-tech retailers, or
 * audio/camera storefronts.
 */
import {
  LogoStrip,
  LogoStripLabel,
  LogoStripItems,
  LogoStripItem,
} from '#/section-kit/LogoStrip.tsx'
export const ElectronicsStoreLogos = defineCapsule({
  name: 'ElectronicsStoreLogos',
  description:
    'Tech-brutalist trusted-brand logo strip for an electronics storefront: a mono uppercase caption line above a wrapping row of bold wordmark text logos for leading tech brands (e.g. Apple, Sony, Samsung, Bose, Logitech, DJI), framed by heavy border-2 top/bottom rules like a spec-sheet manifest. Use beneath a hero to establish credibility on electronics stores, gadget shops, consumer-tech retailers, or audio/camera storefronts.',
  props: z.object({
    /** Caption above the logo row. */
    caption: z.string().optional(),
    /** Brand wordmarks shown in the strip. */
    brands: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brands = props.brands?.length
      ? props.brands
      : ['Apple', 'Sony', 'Samsung', 'Bose', 'Logitech', 'DJI']
    const caption = props.caption ?? 'Trusted by leading electronics brands'
    return (
      <LogoStrip
        className={cn('border-y-2 border-foreground py-10', props.className)}
      >
        <LogoStripLabel className="flex items-center justify-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          <span aria-hidden="true" className="tabular-nums text-primary">
            [ * ]
          </span>
          {caption}
        </LogoStripLabel>
        <LogoStripItems layout="flex" className="mt-6 gap-x-8 gap-y-4">
          {brands.filter(Boolean).map((logo) => (
            <LogoStripItem
              key={logo}
              variant="opacity-hover"
              className="text-lg font-extrabold uppercase tracking-tight text-foreground/70 transition-colors hover:text-foreground"
            >
              {logo}
            </LogoStripItem>
          ))}
        </LogoStripItems>
      </LogoStrip>
    )
  },
})
