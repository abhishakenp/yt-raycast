import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Logo as BrandLogo } from '#/section-kit/Logo.tsx'

/**
 * FurnitureStoreFooter — a rich, multi-column footer on the dark primary
 * background. A 5-column grid (responsive): a wide brand column with a house-glyph
 * logo tile + store name, an about blurb, and a stacked store address / hours
 * block, beside several link columns (each a heading over a list of nav buttons).
 * A bordered-top bottom bar holds an auto-updating copyright line and a wrapping
 * row of legal links. The brand button and every link route through useNavigate.
 * Use as the closing site footer for furniture stores, home-decor or interiors
 * brands, or any warm boutique-retail site. Renders fully with no props via
 * baked-in "Haven & Home" defaults.
 */
export const FurnitureStoreFooter = defineCapsule({
  name: 'FurnitureStoreFooter',
  description:
    'Rich multi-column footer on the dark primary background: a responsive 5-column grid with a wide brand column (house-glyph logo tile + store name, about blurb, stacked store address / hours block) beside several link columns (heading over a list of nav buttons), plus a bordered-top bottom bar with an auto-updating copyright line and a wrapping row of legal links; the brand button and every link route through useNavigate. Use as the closing site footer for furniture stores, home-decor or interiors brands, or any warm boutique-retail site.',
  props: z.object({
    /** Brand / store name shown beside the logo tile. */
    brand: z.string().optional(),
    about: z.string().optional(),
    address: z.array(z.string()).optional(),
    columns: z
      .array(z.object({ title: z.string(), links: z.array(z.string()) }))
      .optional(),
    copyright: z.string().optional(),
    legal: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'Haven & Home'
    const about =
      props.about ??
      'Thoughtfully designed furniture for modern living. Made with sustainable materials, built to last for generations.'
    const address = props.address?.length
      ? props.address
      : [
          '1234 Design District',
          'San Francisco, CA 94102',
          'Mon–Sat: 10am–7pm, Sun: 11am–6pm',
        ]
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Shop',
            links: [
              'Living Room',
              'Bedroom',
              'Dining',
              'Home Office',
              'Outdoor',
              'Sale',
            ],
          },
          {
            title: 'Company',
            links: [
              'Our Story',
              'Sustainability',
              'Careers',
              'Press',
              'Design Services',
            ],
          },
          {
            title: 'Support',
            links: [
              'Contact Us',
              'FAQs',
              'Shipping & Delivery',
              'Returns',
              'Warranty',
              'Track Order',
            ],
          },
        ]
    const copyright = props.copyright ?? 'Haven & Home. All rights reserved.'
    const legal = props.legal?.length
      ? props.legal
      : [
          'Privacy Policy',
          'Terms of Service',
          'Accessibility',
          'Do Not Sell My Info',
        ]

    const LogoMark = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path d="M12 2L2 9v11h8v-7h4v7h8V9L12 2z" />
      </svg>
    )

    return (
      <footer
        className={cn(
          'bg-primary py-16 text-primary-foreground/70',
          props.className,
        )}
        aria-label="Footer"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-12">
            <div className="lg:col-span-2">
              <button
                type="button"
                onClick={() => go(brand)}
                className="mb-4 flex items-center gap-2"
                aria-label={`${brand} - Return to homepage`}
              >
                <BrandLogo
                  brand={brand}
                  fallback={
                    <LogoMark className="size-8 text-primary-foreground" />
                  }
                  labelClassName="text-xl font-semibold tracking-tight text-primary-foreground"
                />
              </button>
              <p className="mb-4 max-w-sm text-sm leading-relaxed">{about}</p>
              <p className="text-sm text-primary-foreground/60">
                {address.map((line, i) => (
                  <span key={line}>
                    {line}
                    {i < address.length - 1 ? <br /> : null}
                  </span>
                ))}
              </p>
            </div>

            {columns.map((col) => (
              <div key={col.title}>
                <h3 className="mb-4 font-medium text-primary-foreground">
                  {col.title}
                </h3>
                <ul className="space-y-3 text-sm">
                  {col.links.map((link) => (
                    <li key={link}>
                      <button
                        type="button"
                        onClick={() => go(link)}
                        className="transition-colors hover:text-primary-foreground"
                      >
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center justify-between gap-4 border-t border-primary-foreground/15 pt-8 sm:flex-row">
            <p className="text-sm text-primary-foreground/60">
              © {new Date().getFullYear()} {copyright}
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              {legal.map((link) => (
                <button
                  key={link}
                  type="button"
                  onClick={() => go(link)}
                  className="transition-colors hover:text-primary-foreground"
                >
                  {link}
                </button>
              ))}
            </div>
          </div>
        </div>
      </footer>
    )
  },
})
