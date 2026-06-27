import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { SiteFooter } from '#/section-kit/SiteFooter.tsx'

/**
 * PhotographyFooter — a rich, multi-column closing footer for a fine-art /
 * wedding photographer portfolio. Thin configuration over the shared
 * `SiteFooter` composite: a serif wordmark, a tagline, a social row
 * (Instagram, Pinterest, Behance), and a responsive grid of link columns
 * (Explore, Services, Contact) where contact details fold in as links. The
 * bottom bar carries an auto-updating copyright line. Use as the site-wide
 * footer for wedding photographers, portrait studios, or elopement shooters.
 * Renders fully with no props via baked-in "Elena Vossen" defaults.
 */
export const PhotographyFooter = defineCapsule({
  name: 'PhotographyFooter',
  description:
    'Rich, multi-column closing footer for a fine-art / wedding photographer portfolio built on the shared SiteFooter composite: a serif wordmark + tagline + social row (Instagram, Pinterest, Behance), a responsive grid of link columns (Explore, Services, Contact) with contact details folded in as links, and a bordered-top bottom bar with an auto-updating copyright line. Every brand, social, and column link routes through useNavigate. Use as the site-wide footer for wedding photographers, portrait studios, or elopement shooters.',
  props: z.object({
    /** Photographer / studio name shown as the serif wordmark. */
    brand: z.string().optional(),
    /** Short tagline below the wordmark. */
    tagline: z.string().optional(),
    /** Social channels rendered as a link row under the brand. */
    social: z
      .array(z.object({ label: z.string(), href: z.string().optional() }))
      .optional(),
    /** Link columns (Explore, Services, Contact, …), each a title + labels. */
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
      : [{ label: 'Instagram' }, { label: 'Pinterest' }, { label: 'Behance' }]
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Explore',
            links: ['Work', 'Testimonials', 'About', 'Journal'],
          },
          {
            title: 'Services',
            links: ['Weddings', 'Elopements', 'Portraits', 'Pricing'],
          },
          {
            title: 'Contact',
            links: [
              'hello@elenavossen.com',
              'Based in Portland · Available worldwide',
              'Book a Shoot',
            ],
          },
        ]

    return (
      <SiteFooter
        brand={props.brand ?? 'Elena Vossen'}
        brandClassName="font-serif text-xl font-medium"
        tagline={
          props.tagline ??
          'Documentary wedding and portrait photography for couples who value emotion over perfection.'
        }
        social={social}
        columns={columns}
        note={props.note ?? 'All rights reserved.'}
        className={props.className}
      />
    )
  },
})
