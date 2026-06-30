import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Logo as BrandLogo } from '#/section-kit/Logo.tsx'

/**
 * BeautyStoreFooter — slim bottom footer for a beauty / skincare / cosmetics
 * storefront. A single bordered-top row (stacks on mobile): serif brand name on
 * the left, an auto-updating copyright line in the center, and a row of legal /
 * utility links on the right. The brand button and every link route through
 * useNavigate. Use as the closing site footer for beauty stores, skincare shops,
 * cosmetics brands, or any clean e-commerce landing page.
 */
export const BeautyStoreFooter = defineCapsule({
  name: 'BeautyStoreFooter',
  description:
    'Slim bottom footer for a beauty / skincare / cosmetics storefront: a single bordered-top row (stacks on mobile) with a serif brand name on the left, an auto-updating copyright line in the center, and a row of legal / utility links on the right. The brand button and every link route through useNavigate. Use as the closing site footer for beauty stores, skincare shops, cosmetics brands, or any clean e-commerce landing page.',
  props: z.object({
    /** Brand / store name shown in the footer. */
    brand: z.string().optional(),
    /** Copyright note appended after the brand and year. */
    note: z.string().optional(),
    /** Legal / utility link labels on the right. */
    links: z.array(z.string()).optional(),
    /** Navigation target for the brand button. */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'Lumière'
    const note = props.note ?? 'All rights reserved.'
    const links = props.links?.length
      ? props.links
      : ['Privacy', 'Terms', 'Contact']
    const homeTarget = props.homeTarget ?? 'Bestsellers'

    return (
      <footer className={cn('border-t border-border py-10', props.className)}>
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-sm text-muted-foreground sm:px-6 md:flex-row lg:px-8">
          <button
            type="button"
            onClick={() => go(homeTarget)}
            className="font-serif text-xl font-semibold text-foreground"
          >
            <BrandLogo brand={brand} className="mr-2 size-7 align-middle" />
          </button>
          <div>
            © {new Date().getFullYear()} {brand}. {note}
          </div>
          <div className="flex items-center gap-6">
            {links.map((link) => (
              <button
                key={link}
                type="button"
                onClick={() => go(link)}
                className="transition-colors hover:text-foreground"
              >
                {link}
              </button>
            ))}
          </div>
        </div>
      </footer>
    )
  },
})
