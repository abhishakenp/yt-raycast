import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { SiteFooter } from '#/section-kit/SiteFooter.tsx'

/**
 * BlogFooter — a rich, multi-column closing footer for an editorial blog or
 * publication. Thin configuration over the shared `SiteFooter` composite: a
 * wordmark beside an inline glyph mark, an editorial tagline, a social row, and
 * a responsive grid of link columns (Explore, Topics, More) folded alongside a
 * bottom bar that carries an auto-updating copyright line plus a small legal
 * link row. Use as the site-wide footer for blogs, magazines, newsrooms, or
 * content hubs. Renders fully with no props via baked-in "Form & Function"
 * defaults.
 */
const PenMark = ({ className }: { className?: string }) => (
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
    <path d="M12 19l7-7 3 3-7 7-3-3z" />
    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
    <path d="M2 2l7.586 7.586" />
    <circle cx="11" cy="11" r="2" />
  </svg>
)

export const BlogFooter = defineComponent({
  name: 'BlogFooter',
  description:
    'Rich, multi-column closing footer for an editorial blog or publication: a responsive grid with a brand block (wordmark + inline glyph mark + editorial tagline + social row) and link columns (Explore, Topics, More), plus a bordered-top bottom bar holding an auto-updating copyright line and a small legal link row. Every brand, social, and column link routes through useNavigate. Use as the site-wide footer for blogs, magazines, newsrooms, or content hubs.',
  props: z.object({
    /** Publication / brand name shown as the wordmark. */
    brand: z.string().optional(),
    /** Editorial tagline below the wordmark. */
    tagline: z.string().optional(),
    /** Social channels rendered as a link row under the brand. */
    social: z
      .array(z.object({ label: z.string(), href: z.string().optional() }))
      .optional(),
    /** Link columns (Explore, Topics, More, …), each a title + labels. */
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
      : [{ label: 'Twitter' }, { label: 'GitHub' }, { label: 'RSS' }]
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Explore',
            links: ['Latest', 'Topics', 'Authors', 'Archive'],
          },
          {
            title: 'Topics',
            links: ['Design', 'Engineering', 'Product', 'Culture'],
          },
          {
            title: 'More',
            links: ['About', 'Newsletter', 'Contact'],
          },
        ]

    return (
      <SiteFooter
        brand={props.brand ?? 'Form & Function'}
        brandMark={<PenMark className="size-8 text-primary" />}
        brandClassName="font-serif text-xl font-medium"
        tagline={
          props.tagline ??
          'Essays on design, engineering, and the craft of building products.'
        }
        social={social}
        columns={columns}
        legal={['Privacy', 'Terms', 'RSS']}
        note={props.note ?? 'All rights reserved.'}
        className={props.className}
      />
    )
  },
})
