import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Logo as BrandLogo } from '#/section-kit/Logo.tsx'

/**
 * CafeFooter — rich multi-column footer for a cozy cafe / coffee shop page on
 * a dark inverted band. Four columns: brand mark + blurb, quick links, business
 * links, and plain-text contact lines. A bottom row holds an auto-updating
 * copyright line + legal links. The brand mark is an inline owl SVG (currentColor
 * → token), copied locally so the footer is self-contained. Every link routes
 * through useNavigate. Use as the closing footer for cafes, bakeries, tea
 * houses, or any warm food-and-drink small business. Renders fully with no props
 * via baked-in defaults.
 */
export const CafeFooter = defineCapsule({
  name: 'CafeFooter',
  description:
    'Rich multi-column footer for a cozy cafe page on a dark inverted band: four columns with brand mark + blurb, quick links, business links, and plain-text contact lines. A bottom row holds an auto-updating copyright line and legal links. The owl brand mark is an inline SVG (currentColor → token), copied locally so the footer is self-contained. Every link routes through useNavigate. Use as the closing footer for cafes, bakeries, tea houses, or warm food-and-drink small businesses.',
  props: z.object({
    /** Cafe / brand name shown with the owl mark. */
    brand: z.string().optional(),
    /** Short brand blurb. */
    blurb: z.string().optional(),
    /** Quick-link labels. */
    quickLinks: z.array(z.string()).optional(),
    /** Business-link labels. */
    businessLinks: z.array(z.string()).optional(),
    /** Contact lines (address, phone, email). */
    contactLines: z.array(z.string()).optional(),
    /** Legal / utility link labels. */
    legalLinks: z.array(z.string()).optional(),
    /** Copyright note. */
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'Little Owl Coffee'
    const blurb =
      props.blurb ??
      'Specialty coffee, house-made pastries, and a space to slow down. Est. 2018 in Portland, Oregon.'
    const quickLinks = props.quickLinks?.length
      ? props.quickLinks
      : ['Our Menu', 'Our Story', 'Location & Hours', 'Careers']
    const businessLinks = props.businessLinks?.length
      ? props.businessLinks
      : ['Wholesale', 'Catering', 'Private Events', 'Gift Cards']
    const contactLines = props.contactLines?.length
      ? props.contactLines
      : [
          '1242 NW Glisan Street',
          'Portland, OR 97209',
          '(503) 555-0192',
          'hello@littleowlcoffee.com',
        ]
    const legalLinks = props.legalLinks?.length
      ? props.legalLinks
      : ['Privacy Policy', 'Terms of Service', 'Accessibility']
    const note = props.note ?? 'All rights reserved.'

    const OwlMark = ({ className }) => (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path d="M12 2C10.9 2 10 2.9 10 4C10 5.1 10.9 6 12 6C13.1 6 14 5.1 14 4C14 2.9 13.1 2 12 2ZM12 18C10.9 18 10 18.9 10 20C10 21.1 10.9 22 12 22C13.1 22 14 21.1 14 20C14 18.9 13.1 18 12 18ZM6 12C6 10.9 5.1 10 4 10C2.9 10 2 10.9 2 12C2 13.1 2.9 14 4 14C5.1 14 6 13.1 6 12ZM20 10C18.9 10 18 10.9 18 12C18 13.1 18.9 14 20 14C21.1 14 22 13.1 22 12C22 10.9 21.1 10 20 10ZM16.24 17.24L14.83 15.83C14.09 16.57 13.11 17 12 17C9.79 17 8 15.21 8 13C8 11.89 8.43 10.91 9.17 10.17L7.76 8.76C6.67 9.85 6 11.35 6 13C6 16.31 8.69 19 12 19C13.65 19 15.15 18.33 16.24 17.24ZM15.72 7.3C15.89 7.68 16 8.07 16 8.5C16 10.43 14.43 12 12.5 12C12.07 12 11.68 11.89 11.3 11.72L9.88 13.14C10.38 13.64 10.97 14.03 11.62 14.29L12 16.5L12.38 14.29C14.07 13.62 15.25 12 15.25 10.13C15.25 9.25 14.99 8.43 14.54 7.73L15.72 7.3Z" />
      </svg>
    )

    return (
      <footer
        className={cn(
          'bg-foreground py-12 text-background/60',
          props.className,
        )}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <BrandLogo
                  brand={brand}
                  fallback={<OwlMark className="size-7 text-primary" />}
                  labelClassName="font-serif text-lg font-medium text-background"
                />
              </div>
              <p className="text-sm">{blurb}</p>
            </div>

            <div>
              <h4 className="mb-4 font-medium text-background">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                {quickLinks.map((link) => (
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

            <div>
              <h4 className="mb-4 font-medium text-background">For Business</h4>
              <ul className="space-y-2 text-sm">
                {businessLinks.map((link) => (
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

            <div>
              <h4 className="mb-4 font-medium text-background">Contact</h4>
              <address className="space-y-2 text-sm not-italic">
                {contactLines.map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </address>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-4 border-t border-background/20 pt-8 sm:flex-row">
            <p className="text-sm">
              &copy; {new Date().getFullYear()} {brand}. {note}
            </p>
            <div className="flex gap-6 text-sm">
              {legalLinks.map((link) => (
                <button
                  key={link}
                  type="button"
                  onClick={() => go(link)}
                  className="transition-colors hover:text-background"
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
