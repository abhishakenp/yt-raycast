import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { SiteFooter } from '#/section-kit/SiteFooter.tsx'

/**
 * YogaStudioFooter — full footer for a yoga-studio site. Thin configuration over
 * the shared `SiteFooter` composite: a wordmark + tagline with a social row, and
 * a responsive grid of link columns. Hours, location, and contact details are
 * folded into a "Visit" column alongside the navigational columns, and the
 * bottom bar carries an auto-updating copyright line. The wordmark, social, and
 * every column link route through useNavigate. Use as the closing site footer
 * for yoga studios, movement spaces, and mindfulness centers. Renders fully with
 * no props via baked-in defaults.
 */
export const YogaStudioFooter = defineComponent({
  name: 'YogaStudioFooter',
  description:
    'Full footer for a yoga-studio site built on the shared SiteFooter composite: a wordmark + tagline with a social row, and a responsive grid of link columns where hours / location / contact details fold into a Visit column, closing with an auto-updating copyright row. The wordmark, social, and column links route through useNavigate. Use as the closing site footer for yoga studios, movement spaces, and mindfulness centers.',
  props: z.object({
    /** Wordmark / brand name. */
    brand: z.string().optional(),
    /** Tagline beneath the wordmark. */
    tagline: z.string().optional(),
    /** Opening hours line. */
    hours: z.string().optional(),
    /** Location / address line. */
    location: z.string().optional(),
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
    const hours = props.hours ?? 'Open Daily · 6am–9pm'
    const location = props.location ?? '48 Cedar Street, Portland, OR'
    const contact = props.contact ?? '(503) 555-0163 · hello@groveyoga.com'
    const social = props.social?.length
      ? props.social
      : [{ label: 'Instagram' }, { label: 'Facebook' }, { label: 'YouTube' }]
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Visit',
            links: [hours, location, contact],
          },
          {
            title: 'Practice',
            links: ['Classes', 'Schedule', 'Pricing', 'Trial'],
          },
          {
            title: 'Studio',
            links: ['Teachers', 'About', 'Workshops', 'Contact'],
          },
        ]

    return (
      <SiteFooter
        brand={props.brand ?? 'Grove Yoga'}
        brandClassName="text-xl font-bold tracking-tight"
        tagline={
          props.tagline ?? 'A welcoming studio to move, breathe, and belong.'
        }
        social={social}
        columns={columns}
        note={props.note ?? 'All rights reserved.'}
        className={props.className}
      />
    )
  },
})
