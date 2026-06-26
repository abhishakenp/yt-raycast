import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { SiteFooter } from '#/section-kit/SiteFooter.tsx'

/**
 * SpaWellnessFooter — full footer for a day-spa / wellness site. Thin
 * configuration over the shared `SiteFooter` composite: a serif wordmark +
 * tagline with a social row, and a responsive grid of link columns. Hours,
 * address, and contact details are folded into a "Visit" column alongside the
 * navigational columns, and the bottom bar carries an auto-updating copyright
 * line. The wordmark, social, and every column link route through useNavigate.
 * Use as the closing site footer for spas, wellness retreats, and treatment
 * studios. Renders fully with no props via baked-in defaults.
 */
export const SpaWellnessFooter = defineComponent({
  name: 'SpaWellnessFooter',
  description:
    'Full footer for a day-spa / wellness site built on the shared SiteFooter composite: a serif wordmark + tagline with a social row, and a responsive grid of link columns where hours / address / contact details fold into a Visit column, closing with an auto-updating copyright row. The wordmark, social, and column links route through useNavigate. Use as the closing site footer for spas, wellness retreats, and treatment studios.',
  props: z.object({
    /** Serif wordmark / brand name. */
    brand: z.string().optional(),
    /** Tagline beneath the wordmark. */
    tagline: z.string().optional(),
    /** Opening hours line. */
    hours: z.string().optional(),
    /** Address line. */
    address: z.string().optional(),
    /** Contact line (phone / email). */
    contact: z.string().optional(),
    /** Social channels rendered as a link row under the brand. */
    social: z
      .array(z.object({ label: z.string(), href: z.string().optional() }))
      .optional(),
    /** Footer link columns. */
    columns: z
      .array(z.object({ title: z.string(), links: z.array(z.string()) }))
      .optional(),
    /** Copyright note appended after the brand + year. */
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const hours = props.hours ?? 'Open Daily · 9am–8pm'
    const address = props.address ?? '12 Willow Lane, Sausalito, CA'
    const contact = props.contact ?? '(415) 555-0147 · hello@lumenspa.com'
    const social = props.social?.length
      ? props.social
      : [{ label: 'Instagram' }, { label: 'Facebook' }, { label: 'Pinterest' }]
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Visit',
            links: [hours, address, contact],
          },
          {
            title: 'Explore',
            links: ['Treatments', 'Memberships', 'Gift Cards', 'Booking'],
          },
          {
            title: 'Studio',
            links: ['About', 'Our Therapists', 'Careers', 'Contact'],
          },
        ]

    return (
      <SiteFooter
        brand={props.brand ?? 'Lumen Spa'}
        brandClassName="font-serif text-xl font-semibold tracking-tight"
        tagline={
          props.tagline ??
          'A quiet sanctuary for rest, renewal, and everyday calm.'
        }
        social={social}
        columns={columns}
        note={props.note ?? 'All rights reserved.'}
        className={props.className}
      />
    )
  },
})
