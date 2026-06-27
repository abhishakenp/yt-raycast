import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { SiteFooter } from '#/section-kit/SiteFooter.tsx'

/**
 * NonprofitFooter — a warm, mission-driven closing footer for a nonprofit /
 * charity / NGO site. Thin configuration over the shared `SiteFooter`
 * composite: a layered sprout-glyph logo mark beside the organization name, a
 * tagline, a social row, and a responsive grid of link columns (Get Involved,
 * About, Resources, Contact). The bottom bar carries an auto-updating copyright
 * line plus a note. Every link routes through useNavigate. Use as the site-wide
 * footer for nonprofits, charities, NGOs, foundations, or humanitarian
 * organizations. Renders fully with no props via baked-in "Roots of Hope"
 * defaults.
 */
const SproutMark = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 22V12" />
    <path d="M12 12C12 8 9 5 4 5c0 5 3 8 8 8z" />
    <path d="M12 11c0-4 3-7 8-7 0 5-3 8-8 8" />
  </svg>
)

export const NonprofitFooter = defineCapsule({
  name: 'NonprofitFooter',
  description:
    'Warm, mission-driven closing footer for a nonprofit / charity / NGO site built on the shared SiteFooter composite: a layered sprout-glyph logo mark + organization name, a tagline, a social row, and a responsive grid of link columns (Get Involved, About, Resources, Contact), with an auto-updating copyright line and note in the bottom bar. Every link routes through useNavigate. Use as the site-wide footer for nonprofits, charities, NGOs, foundations, or humanitarian organizations.',
  props: z.object({
    /** Organization / brand name shown beside the logo mark. */
    brand: z.string().optional(),
    /** Short tagline below the wordmark. */
    tagline: z.string().optional(),
    /** Social channels rendered as a link row under the brand. */
    social: z
      .array(z.object({ label: z.string(), href: z.string().optional() }))
      .optional(),
    /** Link columns (Get Involved, About, Resources, Contact, …). */
    columns: z
      .array(z.object({ title: z.string(), links: z.array(z.string()) }))
      .optional(),
    /** Copyright note appended after the brand + year. */
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const social = props.social?.length
      ? props.social
      : [{ label: 'Instagram' }, { label: 'Facebook' }, { label: 'LinkedIn' }]
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Get Involved',
            links: ['Donate', 'Volunteer', 'Fundraise', 'Partner with us'],
          },
          {
            title: 'About',
            links: ['Our Mission', 'Our Impact', 'Annual Report', 'Careers'],
          },
          {
            title: 'Resources',
            links: ['Stories', 'News', 'Events', 'FAQ'],
          },
          {
            title: 'Contact',
            links: ['Get in Touch', 'Press', 'Newsletter', 'Find a Chapter'],
          },
        ]

    return (
      <SiteFooter
        brand={props.brand ?? 'Roots of Hope'}
        brandMark={<SproutMark className="size-8 text-primary" />}
        brandClassName="text-lg font-semibold"
        tagline={
          props.tagline ??
          'Planting hope and growing brighter futures with communities around the world.'
        }
        social={social}
        columns={columns}
        note={
          props.note ?? 'A registered 501(c)(3) nonprofit. All rights reserved.'
        }
        className={props.className}
      />
    )
  },
})
