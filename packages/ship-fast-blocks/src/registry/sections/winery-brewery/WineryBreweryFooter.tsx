import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { SiteFooter } from '#/section-kit/SiteFooter.tsx'

/**
 * WineryBreweryFooter — a rich, multi-column closing footer for a winery or
 * brewery site. Thin configuration over the shared `SiteFooter` composite: a
 * serif wordmark beside an inline grape-cluster mark, a tagline, a social row,
 * and a responsive grid of link columns. Visit (address, phone, email), Hours
 * (day/time rows), Explore, and Contact are folded into columns, and the bottom
 * bar carries an auto-updating copyright line. Use as the site-wide footer for
 * wineries, vineyards, cellar doors, breweries, taprooms, or cideries. Renders
 * fully with no props via rustic-premium baked-in defaults.
 */
const GrapeClusterMark = ({ className }: { className?: string }) => (
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
    <path d="M12 4c1.2 0 2-1 2-2" />
    <path d="M12 7v0" />
    <circle cx="12" cy="9" r="2.1" />
    <circle cx="8.4" cy="12" r="2.1" />
    <circle cx="15.6" cy="12" r="2.1" />
    <circle cx="10.2" cy="15.4" r="2.1" />
    <circle cx="13.8" cy="15.4" r="2.1" />
    <circle cx="12" cy="19" r="2.1" />
  </svg>
)

export const WineryBreweryFooter = defineComponent({
  name: 'WineryBreweryFooter',
  description:
    'Rich, multi-column closing footer for a winery or brewery site: a responsive grid with a brand block (serif wordmark + grape-cluster mark + tagline + social row), a Visit column with address plus tappable phone and email, an Hours column of day/time rows, and extra link columns (Explore, Contact, …); a bordered-top bottom bar holds an auto-updating copyright line. Every brand, social, contact, and column link routes through useNavigate. Use as the site-wide footer for wineries, vineyards, cellar doors, breweries, taprooms, or cideries.',
  props: z.object({
    /** Winery / brewery brand name shown as the serif wordmark. */
    brand: z.string().optional(),
    /** Short tagline below the wordmark. */
    tagline: z.string().optional(),
    /** Social channels rendered as a link row under the brand. */
    social: z
      .array(z.object({ label: z.string(), href: z.string().optional() }))
      .optional(),
    /** Link columns (Visit, Hours, Explore, Contact, …), each a title + labels. */
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
      : [{ label: 'Instagram' }, { label: 'Facebook' }, { label: 'Untappd' }]
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Visit',
            links: [
              '4200 Vineyard Lane, Sonoma Valley, CA 95476',
              '(707) 555-0148',
              'hello@cellarandcask.com',
            ],
          },
          {
            title: 'Hours',
            links: [
              'Thu – Fri · 11am – 6pm',
              'Sat – Sun · 11am – 7pm',
              'Mon – Wed · By appointment',
              'Harvest weeks · Extended hours',
            ],
          },
          {
            title: 'Explore',
            links: ['Wines', 'Tastings', 'Tours', 'Wine Club'],
          },
          {
            title: 'Contact',
            links: ['Plan a Visit', 'Private Events', 'Press', 'Our Story'],
          },
        ]

    return (
      <SiteFooter
        brand={props.brand ?? 'Cellar & Cask'}
        brandMark={<GrapeClusterMark className="size-8 text-primary" />}
        brandClassName="font-serif text-xl font-medium"
        tagline={
          props.tagline ??
          'Estate-grown wine and barrel-aged ale from one sun-soaked hillside.'
        }
        social={social}
        columns={columns}
        note={props.note ?? 'All rights reserved.'}
        className={props.className}
      />
    )
  },
})
