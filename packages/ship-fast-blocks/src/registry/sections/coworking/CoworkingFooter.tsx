import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { SiteFooter } from '#/section-kit/SiteFooter.tsx'

/**
 * CoworkingFooter — rich, multi-column closing footer for a coworking or shared-
 * workspace site. Thin configuration over the shared `SiteFooter` composite: a
 * rounded brand-initial logo tile beside the workspace name, a tagline, a social
 * row, and a responsive grid of link columns (Spaces, Company, Resources,
 * Contact). The bottom bar carries an auto-updating copyright line. Use as the
 * site-wide footer for coworking spaces, shared offices, flex-office providers,
 * or business centers. Renders fully with no props via baked-in "Northside"
 * defaults.
 */
const BrandTile = ({ letter }: { letter: string }) => (
  <span
    className="grid size-8 place-items-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground"
    aria-hidden="true"
  >
    {letter}
  </span>
)

export const CoworkingFooter = defineComponent({
  name: 'CoworkingFooter',
  description:
    'Rich, multi-column closing footer for a coworking or shared-workspace site built on the shared SiteFooter composite: a brand block (rounded brand-initial logo tile + workspace name + tagline + social row) beside a responsive grid of link columns (Spaces, Company, Resources, Contact), with a bordered-top bottom bar holding an auto-updating copyright line. Every brand, social, and column link routes through useNavigate. Use as the site-wide footer for coworking spaces, shared offices, flex-office providers, or business centers.',
  props: z.object({
    /** Brand / workspace name shown beside the logo tile. */
    brand: z.string().optional(),
    /** Short tagline below the wordmark. */
    tagline: z.string().optional(),
    /** Social channels rendered as a link row under the brand. */
    social: z
      .array(z.object({ label: z.string(), href: z.string().optional() }))
      .optional(),
    /** Link columns (Spaces, Company, Resources, Contact, …). */
    columns: z
      .array(z.object({ title: z.string(), links: z.array(z.string()) }))
      .optional(),
    /** Copyright note appended after the brand + year. */
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Northside'
    const social = props.social?.length
      ? props.social
      : [{ label: 'Instagram' }, { label: 'LinkedIn' }, { label: 'X' }]
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Spaces',
            links: [
              'Hot Desks',
              'Dedicated Desks',
              'Private Offices',
              'Meeting Rooms',
            ],
          },
          {
            title: 'Company',
            links: ['About', 'Careers', 'Community', 'Events'],
          },
          {
            title: 'Resources',
            links: ['Pricing', 'Amenities', 'Member Perks', 'FAQ'],
          },
          {
            title: 'Contact',
            links: [
              '123 Pearl Street, Portland, OR 97209',
              '(503) 555-0145',
              'hello@northside.work',
            ],
          },
        ]

    return (
      <SiteFooter
        brand={brand}
        brandMark={<BrandTile letter={brand.charAt(0).toUpperCase()} />}
        brandClassName="text-lg font-semibold"
        tagline={
          props.tagline ??
          'A bright, modern workspace where independent professionals and growing teams do their best work.'
        }
        social={social}
        columns={columns}
        note={props.note ?? 'All rights reserved.'}
        className={props.className}
      />
    )
  },
})
