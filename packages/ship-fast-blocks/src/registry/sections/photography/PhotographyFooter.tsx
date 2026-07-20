import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import {
  SiteFooter,
  FooterContent,
  FooterGrid,
  FooterBrand,
  FooterTagline,
  FooterSocial,
  FooterSocialLink,
  FooterColumn,
  FooterColumnTitle,
  FooterColumnList,
  FooterLink,
  FooterBottom,
  FooterCopyright,
} from '#/section-kit/SiteFooter.tsx'

/**
 * PhotographyFooter — a quiet, hairline closing footer for a fine-art /
 * wedding photographer portfolio. Thin configuration over the shared
 * `SiteFooter` composite: a serif wordmark + tagline beside a mono social row
 * (Instagram, Pinterest, Behance), and a responsive grid of link columns with
 * mono, wide-tracked column heads (Explore, Services, Contact) whose links each
 * sit on their own `block w-fit` hit line so contact details fold in cleanly.
 * The hairline-topped bottom bar carries a mono edition slate and an
 * auto-updating copyright line. Every brand, social, and column link routes
 * through section-kit route links. Use as the site-wide footer for wedding
 * photographers, portrait studios, or elopement shooters. Renders fully with no
 * props via baked-in "Elena Vossen" defaults.
 */
export const PhotographyFooter = defineCapsule({
  name: 'PhotographyFooter',
  description:
    'Quiet, hairline closing footer for a fine-art / wedding photographer portfolio built on the shared SiteFooter composite: a serif wordmark + tagline beside a mono social row (Instagram, Pinterest, Behance), a responsive grid of link columns with mono wide-tracked column heads (Explore, Services, Contact) whose links each sit on their own block w-fit hit line, and a hairline-topped bottom bar with a mono edition slate and an auto-updating copyright line. Every brand, social, and column link routes through section-kit route links. Use as the site-wide footer for wedding photographers, portrait studios, or elopement shooters.',
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
      <SiteFooter className={props.className}>
        <FooterContent>
          <FooterGrid>
            <FooterBrand
              brand={props.brand ?? 'Elena Vossen'}
              brandClassName={'font-serif text-2xl font-medium'}
            >
              <FooterTagline className="max-w-xs">
                {props.tagline ??
                  'Documentary wedding and portrait photography for couples who value emotion over perfection.'}
              </FooterTagline>
              <FooterSocial>
                {social.map((s) => (
                  <FooterSocialLink
                    key={s.label}
                    className="font-mono text-[11px] uppercase tracking-[0.18em]"
                  >
                    {s.label}
                  </FooterSocialLink>
                ))}
              </FooterSocial>
            </FooterBrand>
            {columns.map((col) => (
              <FooterColumn key={col.title}>
                <FooterColumnTitle className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  {col.title}
                </FooterColumnTitle>
                <FooterColumnList>
                  {col.links.map((link) => (
                    <FooterLink key={link} className="block w-fit">
                      {link}
                    </FooterLink>
                  ))}
                </FooterColumnList>
              </FooterColumn>
            ))}
          </FooterGrid>
          <FooterBottom>
            <span
              aria-hidden="true"
              className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60"
            >
              Vol. I · Portland
            </span>
            <FooterCopyright className="font-mono text-[11px] uppercase tracking-[0.16em]">
              {props.note ?? 'All rights reserved.'}
            </FooterCopyright>
          </FooterBottom>
        </FooterContent>
      </SiteFooter>
    )
  },
})
