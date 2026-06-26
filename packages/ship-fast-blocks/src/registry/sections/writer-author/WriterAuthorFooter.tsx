import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { SiteFooter } from '#/section-kit/SiteFooter.tsx'

/**
 * WriterAuthorFooter — a rich, multi-column closing footer for a literary
 * author or novelist site. Thin configuration over the shared `SiteFooter`
 * composite: a serif wordmark beside an inline open-book feather mark, a
 * tagline, a social row (Instagram, Twitter, Goodreads), and a responsive grid
 * of link columns covering Books, About, and Connect. A small legal row
 * (Privacy, Terms) and an auto-updating copyright line sit in the bottom bar.
 * Use as the site-wide footer for author landing pages, book-launch microsites,
 * poets, essayists, or any writer's personal brand. Renders fully with no props
 * via baked-in "Eleanor Vance" defaults.
 */
const FeatherMark = ({ className }: { className?: string }) => (
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
    <path d="M20 4C10 5 7 11 7 17l-3 3" />
    <path d="M20 4c0 6-3 12-13 13" />
    <path d="M11 14h5" />
    <path d="M9 18h5" />
  </svg>
)

export const WriterAuthorFooter = defineComponent({
  name: 'WriterAuthorFooter',
  description:
    'Rich, multi-column closing footer for a literary author or novelist site: a responsive grid with a brand block (serif wordmark + open-book feather mark + tagline + social row of Instagram, Twitter, Goodreads), plus Books, About, and Connect link columns; a bordered-top bottom bar holds a Privacy/Terms legal row and an auto-updating copyright line. Every brand, social, and column link routes through useNavigate. Use as the site-wide footer for author landing pages, book-launch microsites, poets, or essayists.',
  props: z.object({
    /** Author / brand name shown as the serif wordmark. */
    brand: z.string().optional(),
    /** Short tagline below the wordmark. */
    tagline: z.string().optional(),
    /** Social channels rendered as a link row under the brand. */
    social: z
      .array(z.object({ label: z.string(), href: z.string().optional() }))
      .optional(),
    /** Link columns (Books, About, Connect, …), each a title + labels. */
    columns: z
      .array(z.object({ title: z.string(), links: z.array(z.string()) }))
      .optional(),
    /** Legal links shown in the bottom bar. */
    legal: z.array(z.string()).optional(),
    /** Copyright note appended after the brand + year. */
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const social = props.social?.length
      ? props.social
      : [{ label: 'Instagram' }, { label: 'Twitter' }, { label: 'Goodreads' }]
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Books',
            links: [
              'The Latest Novel',
              'Backlist',
              'Signed Editions',
              'Audiobooks',
            ],
          },
          {
            title: 'About',
            links: ['Biography', 'Press Kit', 'Events', 'Contact'],
          },
          {
            title: 'Connect',
            links: ['Newsletter', 'Book Clubs', 'Speaking', 'Rights & Agent'],
          },
        ]

    return (
      <SiteFooter
        brand={props.brand ?? 'Eleanor Vance'}
        brandMark={<FeatherMark className="size-8 text-primary" />}
        brandClassName="font-serif text-xl font-medium"
        tagline={
          props.tagline ?? 'Novelist. Storyteller. Letters from the page.'
        }
        social={social}
        columns={columns}
        legal={props.legal?.length ? props.legal : ['Privacy', 'Terms']}
        note={props.note ?? 'All rights reserved.'}
        className={props.className}
      />
    )
  },
})
