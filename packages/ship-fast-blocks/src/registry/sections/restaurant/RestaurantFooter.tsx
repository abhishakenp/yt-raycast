import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { SiteFooter } from '#/section-kit/SiteFooter.tsx'

/**
 * RestaurantFooter — a rich, multi-column closing footer for a restaurant or
 * dining site. Thin configuration over the shared `SiteFooter` composite: a
 * serif wordmark beside an inline fork-and-knife mark, a tagline, a social row,
 * and a responsive grid of link columns. Hours (day/time rows) and Visit
 * (address, phone, email) are folded into columns alongside Explore and About,
 * and the bottom bar carries an auto-updating copyright line. Use as the
 * site-wide footer for restaurants, cafés, bistros, bars, or any hospitality
 * landing page. Renders fully with no props via baked-in "Saffron & Sage"
 * defaults.
 */
const ForkKnifeMark = ({ className }: { className?: string }) => (
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
    <path d="M6 3v6a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V3" />
    <path d="M8 11v10" />
    <path d="M16 3c-1.66 0-3 2.24-3 5s1.34 5 3 5" />
    <path d="M16 3v18" />
  </svg>
)

export const RestaurantFooter = defineComponent({
  name: 'RestaurantFooter',
  description:
    'Rich, multi-column closing footer for a restaurant or dining site: a responsive grid with a brand block (serif wordmark + tagline + social row), an Hours column of day/time rows, a Visit column with address plus tappable phone and email, and extra link columns (Explore, About, …); a bordered-top bottom bar holds an auto-updating copyright line. Every brand, social, contact, and column link routes through useNavigate. Use as the site-wide footer for restaurants, cafés, bistros, bars, or any hospitality landing page.',
  props: z.object({
    /** Restaurant / brand name shown as the serif wordmark. */
    brand: z.string().optional(),
    /** Short tagline below the wordmark. */
    tagline: z.string().optional(),
    /** Social channels rendered as a link row under the brand. */
    social: z
      .array(z.object({ label: z.string(), href: z.string().optional() }))
      .optional(),
    /** Link columns (Hours, Visit, Explore, About, …), each a title + labels. */
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
      : [{ label: 'Instagram' }, { label: 'Facebook' }, { label: 'TikTok' }]
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Hours',
            links: [
              'Tue – Thu · 5pm – 10pm',
              'Fri – Sat · 5pm – 11pm',
              'Sunday · 4pm – 9pm',
              'Monday · Closed',
            ],
          },
          {
            title: 'Visit',
            links: [
              '123 Market Street, San Francisco, CA 94103',
              '(415) 555-0182',
              'hello@saffronandsage.com',
            ],
          },
          {
            title: 'Explore',
            links: ['Menu', 'Reservations', 'Private Events', 'Gift Cards'],
          },
          {
            title: 'About',
            links: ['Our Story', 'Press', 'Careers', 'Contact'],
          },
        ]

    return (
      <SiteFooter
        brand={props.brand ?? 'Saffron & Sage'}
        brandMark={<ForkKnifeMark className="size-8 text-primary" />}
        brandClassName="font-serif text-xl font-medium"
        tagline={
          props.tagline ??
          'Seasonal Californian dining in the heart of the city.'
        }
        social={social}
        columns={columns}
        note={props.note ?? 'All rights reserved.'}
        className={props.className}
      />
    )
  },
})
