import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Logo as BrandLogo } from '#/section-kit/Logo.tsx'

/**
 * EventPlannerFooter — inverted four-column site footer. A foreground-colored band
 * with a brand column (thin clock-glyph logo + light brand name + tagline) beside
 * link columns of grouped navigation buttons, then a top-bordered bottom bar with
 * a copyright line and legal links. Every link routes through useNavigate. Use as
 * the closing footer for event/wedding planners, agencies, or premium service
 * businesses.
 */
export const EventPlannerFooter = defineCapsule({
  name: 'EventPlannerFooter',
  description:
    'Inverted four-column site footer: a foreground-colored band with a brand column (thin clock-glyph logo + light brand name + tagline) beside link columns of grouped navigation buttons, then a top-bordered bottom bar with a copyright line and legal links. Every link routes through useNavigate. Use as the closing footer for event/wedding planners, agencies, or premium service businesses.',
  props: z.object({
    /** Brand / studio name shown beside the footer logo. */
    brand: z.string().optional(),
    tagline: z.string().optional(),
    columns: z
      .array(z.object({ title: z.string(), links: z.array(z.string()) }))
      .optional(),
    legal: z.string().optional(),
    legalLinks: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'Serene Events'
    const footerTagline =
      props.tagline ??
      'Creating unforgettable moments with elegance, precision, and heart since 2012.'
    const footerColumns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Services',
            links: [
              'Wedding Planning',
              'Corporate Events',
              'Private Celebrations',
              'Destination Events',
            ],
          },
          {
            title: 'Company',
            links: ['Portfolio', 'Testimonials', 'Our Process', 'FAQ'],
          },
          {
            title: 'Connect',
            links: ['Instagram', 'Pinterest', 'LinkedIn', 'Contact Us'],
          },
        ]
    const footerLegal =
      props.legal ??
      `© ${new Date().getFullYear()} ${brand}. All rights reserved.`
    const footerLegalLinks = props.legalLinks?.length
      ? props.legalLinks
      : ['Privacy Policy', 'Terms of Service']

    const Clock = ({ className }) => (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    )

    return (
      <footer
        className={cn(
          'bg-foreground px-4 py-12 sm:px-6 lg:px-8 lg:py-16',
          props.className,
        )}
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 grid gap-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            <div className="lg:col-span-1">
              <div className="mb-4 flex items-center gap-2">
                <BrandLogo
                  brand={brand}
                  fallback={<Clock className="size-8 text-background/60" />}
                  labelClassName="text-xl font-light text-background"
                />
              </div>
              <p className="text-sm leading-relaxed text-background/60">
                {footerTagline}
              </p>
            </div>
            {footerColumns.map((col) => (
              <div key={col.title}>
                <h4 className="mb-4 text-sm font-medium uppercase tracking-wider text-background">
                  {col.title}
                </h4>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link}>
                      <button
                        type="button"
                        onClick={() => go(link)}
                        className="text-sm text-background/60 transition-colors hover:text-background"
                      >
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex flex-col items-center justify-between gap-4 border-t border-background/20 pt-8 sm:flex-row">
            <p className="text-sm text-background/50">{footerLegal}</p>
            <div className="flex gap-6">
              {footerLegalLinks.map((link) => (
                <button
                  key={link}
                  type="button"
                  onClick={() => go(link)}
                  className="text-sm text-background/50 transition-colors hover:text-background"
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
