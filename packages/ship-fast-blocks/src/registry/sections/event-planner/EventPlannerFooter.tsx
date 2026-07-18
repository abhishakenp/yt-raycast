import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { useNavigate } from '#/lib/use-navigate.tsx'
import { SiteFooter } from '#/section-kit/SiteFooter.tsx'

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

    const Clock = ({ className }: { className?: string }) => (
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

    void go
    void footerLegalLinks
    void footerLegal
    void Clock
    return (
      <SiteFooter
        brand={brand}
        columns={footerColumns}
        note={footerTagline}
        className={props.className}
      />
    )
  },
})
