import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { SiteFooter } from '#/section-kit/SiteFooter.tsx'

/** Inline compass brand mark — adventurous, currentColor → theme token. */
function CompassMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m15.5 8.5-2.2 5.3-5.3 2.2 2.2-5.3 5.3-2.2Z"
      />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

/**
 * TourExperiencesFooter — closing multi-column footer for an adventure /
 * guided-tour brand. Composes the shared SiteFooter composite with an inline
 * compass brand mark, a tagline, a social row, and four link columns (Tours,
 * Company, Support, Legal), plus an auto-updating copyright note. Every link
 * routes through the shared navigation. Use as the site footer for tour
 * operators, expedition companies, and travel-experience landing pages. Renders
 * fully with no props via baked-in "Wanderwild Tours" defaults.
 */
export const TourExperiencesFooter = defineCapsule({
  name: 'TourExperiencesFooter',
  description:
    'Closing multi-column footer for an adventure / guided-tour brand. Composes the shared SiteFooter composite with an inline compass brand mark, a tagline, a social row, and four link columns (Tours, Company, Support, Legal), plus an auto-updating copyright note. Every link routes through the shared navigation. Use as the site footer for tour operators, expedition companies, and travel-experience landing pages.',
  props: z.object({
    /** Brand / company name shown with the compass mark. */
    brand: z.string().optional(),
    /** Short brand tagline under the name. */
    tagline: z.string().optional(),
    /** Link columns (title + link labels). */
    columns: z
      .array(z.object({ title: z.string(), links: z.array(z.string()) }))
      .optional(),
    /** Social links (label + optional href). */
    social: z
      .array(z.object({ label: z.string(), href: z.string().optional() }))
      .optional(),
    /** Legal / utility link labels in the bottom bar. */
    legal: z.array(z.string()).optional(),
    /** Copyright note appended after the brand. */
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Tours',
            links: [
              'City Tours',
              'Food Tours',
              'Adventure Tours',
              'Cultural Tours',
            ],
          },
          {
            title: 'Company',
            links: ['About Us', 'Our Guides', 'Sustainability', 'Careers'],
          },
          {
            title: 'Support',
            links: [
              'Help Center',
              'Booking & Cancellation',
              'Travel Insurance',
              'Contact',
            ],
          },
          {
            title: 'Legal',
            links: ['Privacy Policy', 'Terms of Service', 'Accessibility'],
          },
        ]
    const social = props.social?.length
      ? props.social
      : [
          { label: 'Instagram' },
          { label: 'YouTube' },
          { label: 'TikTok' },
          { label: 'Facebook' },
        ]
    const legal = props.legal?.length
      ? props.legal
      : ['Privacy Policy', 'Terms of Service', 'Cookies']

    return (
      <SiteFooter
        brand={props.brand ?? 'Wanderwild Tours'}
        brandMark={<CompassMark className="size-7 text-primary" />}
        tagline={
          props.tagline ??
          'Small-group adventures led by local guides. Big experiences, light footprints, lifelong memories.'
        }
        columns={columns}
        social={social}
        legal={legal}
        note={props.note ?? 'Adventure responsibly.'}
        className={props.className}
      />
    )
  },
})
