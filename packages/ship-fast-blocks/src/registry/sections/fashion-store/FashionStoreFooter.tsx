import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * FashionStoreFooter — rich multi-column dark footer for a minimalist fashion
 * store. A foreground-colored closing section with a brand block (serif
 * wordmark + tagline + text social links) beside four link columns (Shop,
 * Company, Customer Care, Legal), closed by a bottom bar with a dynamic-year
 * copyright and a "We accept" row of small payment-mark chips. Every link,
 * social and the brand logo route through useNavigate. Use as the closing
 * footer for clothing brands, boutiques, apparel and accessories shops, or any
 * premium minimalist retail storefront.
 */
export const FashionStoreFooter = defineComponent({
  name: 'FashionStoreFooter',
  description:
    "Rich multi-column dark footer for a minimalist fashion store: a foreground-colored closing section with a brand block (serif wordmark + tagline + text social links) beside four link columns (Shop, Company, Customer Care, Legal), closed by a bottom bar with a dynamic-year copyright and a 'We accept' row of small payment-mark chips. Every link, social and the brand logo route through useNavigate. Use as the closing footer for clothing brands, boutiques, apparel and accessories shops, or any premium minimalist retail storefront.",
  props: z.object({
    /** Brand / store name shown as the serif wordmark. */
    brand: z.string().optional(),
    /** Navigation target for the brand logo (typically the first nav item). */
    homeTarget: z.string().optional(),
    tagline: z.string().optional(),
    columns: z
      .array(z.object({ title: z.string(), links: z.array(z.string()) }))
      .optional(),
    socials: z.array(z.string()).optional(),
    copyright: z.string().optional(),
    payments: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'NOIRE'
    const homeTarget = props.homeTarget ?? 'Collections'
    const footerTagline =
      props.tagline ??
      'Timeless essentials for the modern wardrobe. Designed in Copenhagen, made with intention.'
    const footerColumns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Shop',
            links: [
              'New Arrivals',
              'Outerwear',
              'Knitwear',
              'Trousers',
              'Shirts & Tops',
              'Accessories',
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
              'Stockists',
            ],
          },
          {
            title: 'Customer Care',
            links: [
              'Contact Us',
              'Shipping & Returns',
              'Size Guide',
              'FAQ',
              'Gift Cards',
            ],
          },
          {
            title: 'Legal',
            links: [
              'Privacy Policy',
              'Terms of Service',
              'Cookie Policy',
              'Accessibility',
            ],
          },
        ]
    const footerSocials = props.socials?.length
      ? props.socials
      : ['Instagram', 'Pinterest', 'Twitter']
    const footerCopyright = props.copyright ?? 'All rights reserved.'
    const footerPayments = props.payments?.length
      ? props.payments
      : ['VISA', 'MC', 'AMEX', 'Pay']

    return (
      <footer
        aria-label="Footer"
        className={cn(
          'bg-foreground py-16 text-background lg:py-20',
          props.className,
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5 lg:gap-12">
            {/* Brand column */}
            <div className="col-span-2 md:col-span-4 lg:col-span-1">
              <button
                type="button"
                onClick={() => go(homeTarget)}
                className="mb-4 inline-block font-serif text-3xl font-medium text-background"
              >
                {brand}
              </button>
              <p className="mb-6 max-w-xs text-sm text-background/60">
                {footerTagline}
              </p>
              <div className="flex items-center gap-4">
                {footerSocials.map((social) => (
                  <button
                    key={social}
                    type="button"
                    aria-label={social}
                    onClick={() => go(social)}
                    className="text-sm font-medium text-background/60 transition-colors hover:text-background"
                  >
                    {social}
                  </button>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {footerColumns.map((col) => (
              <div key={col.title}>
                <h4 className="mb-4 font-medium text-background">
                  {col.title}
                </h4>
                <ul className="space-y-3 text-sm text-background/60">
                  {col.links.map((link) => (
                    <li key={link}>
                      <button
                        type="button"
                        onClick={() => go(link)}
                        className="transition-colors hover:text-background"
                      >
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center justify-between gap-4 border-t border-background/10 pt-8 md:flex-row">
            <p className="text-sm text-background/50">
              © {new Date().getFullYear()} {brand}. {footerCopyright}
            </p>
            <div className="flex items-center gap-4">
              <span className="text-sm text-background/50">We accept:</span>
              <div className="flex items-center gap-3">
                {footerPayments.map((pay) => (
                  <span
                    key={pay}
                    className="flex h-5 w-8 items-center justify-center rounded-sm bg-background/10 text-[8px] font-medium text-background/60"
                  >
                    {pay}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>
    )
  },
})
