import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * BeautyStoreLogos — trusted-by beauty-brand logo strip for a cosmetics / skincare
 * storefront. A centered uppercase eyebrow above a responsive grid of clickable
 * brand-name buttons rendered in muted serif text. Every brand routes through
 * useNavigate. Use as a social-proof logo bar for beauty stores, skincare shops,
 * cosmetics brands, clean beauty retailers, or any premium personal-care DTC
 * storefront wanting to display partner / stocked brand credibility.
 */
export const BeautyStoreLogos = defineComponent({
  name: 'BeautyStoreLogos',
  description:
    'Trusted-by beauty-brand logo strip for a cosmetics / skincare storefront: a centered uppercase eyebrow above a responsive 2/3/6-column grid of clickable brand-name buttons rendered in muted serif text. Every brand routes through useNavigate. Use as a social-proof logo bar for beauty stores, skincare shops, cosmetics brands, or premium personal-care DTC storefronts wanting to display partner / stocked brand credibility.',
  props: z.object({
    /** Section eyebrow / label text. */
    heading: z.string().optional(),
    /** Brand names displayed as clickable text logos. */
    brands: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading = props.heading ?? 'Trusted by Leading Beauty Brands'
    const brands = props.brands?.length
      ? props.brands
      : [
          'Glow Recipe',
          'Fenty Beauty',
          'Rare Beauty',
          'Summer Fridays',
          'Tower 28',
          'Kosas',
        ]

    return (
      <section className={cn('border-b border-border py-16', props.className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-10 text-center text-sm font-medium uppercase tracking-widest text-muted-foreground">
            {heading}
          </p>
          <div className="grid grid-cols-2 items-center gap-8 opacity-60 md:grid-cols-3 lg:grid-cols-6">
            {brands.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => go(name)}
                className="flex h-12 items-center justify-center"
              >
                <span className="font-serif text-xl text-muted-foreground">
                  {name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
