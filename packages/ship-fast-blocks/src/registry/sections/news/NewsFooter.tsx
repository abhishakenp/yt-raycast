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
  FooterLegal,
} from '#/section-kit/SiteFooter.tsx'

/**
 * NewsFooter — newsprint colophon footer for a news / editorial publication.
 * Thin configuration over the shared `SiteFooter` composite, styled like a
 * printer's colophon: it opens on a heavy double masthead rule, then lays out
 * a brand block — serif wordmark beside a square ink-block newspaper mark, an
 * editorial tagline on a hairline column rule, and a mono small-caps social
 * row — alongside link columns whose mono uppercase titles sit on hairline
 * rules (Sections / Company / Support / Legal). A hairline-ruled bottom bar
 * carries an auto-updating mono copyright line and a mono legal-link row. Use
 * as the closing footer of a newspaper, magazine or publication homepage.
 * Renders fully with no props via baked-in "The Chronicle" defaults.
 */
function NewspaperMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="16" rx="0" />
      <path d="M7 8h10M7 12h10M7 16h6" />
    </svg>
  )
}

export const NewsFooter = defineCapsule({
  name: 'NewsFooter',
  description:
    'Newsprint colophon footer for a news / editorial publication built on the shared SiteFooter composite: a heavy double masthead rule opens a grid with a brand block (serif wordmark + square ink-block newspaper mark + editorial tagline on a hairline column rule + mono small-caps social row) and link columns whose mono uppercase titles sit on hairline rules (Sections / Company / Support / Legal), plus a hairline-ruled bottom bar holding an auto-updating mono copyright line and a mono legal-link row. Every brand, social and column link routes through section-kit route links. Use as the closing footer of a newspaper, magazine or publication homepage.',
  props: z.object({
    /** Publication / masthead name shown beside the logo. */
    brand: z.string().optional(),
    /** Tagline under the brand. */
    tagline: z.string().optional(),
    /** Link columns, each a title + labels. */
    columns: z
      .array(z.object({ title: z.string(), links: z.array(z.string()) }))
      .optional(),
    /** Social channels rendered as a link row under the brand. */
    social: z
      .array(z.object({ label: z.string(), href: z.string().optional() }))
      .optional(),
    /** Legal links in the bottom bar. */
    legal: z.array(z.string()).optional(),
    /** Copyright note appended after the brand + year. */
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Sections',
            links: [
              'World News',
              'Politics',
              'Business',
              'Technology',
              'Science',
              'Health',
            ],
          },
          {
            title: 'Company',
            links: [
              'About Us',
              'Careers',
              'Code of Ethics',
              'Press Center',
              'Advertise',
            ],
          },
          {
            title: 'Support',
            links: [
              'Help Center',
              'Contact Us',
              'Subscription',
              'Accessibility',
              'Apps',
            ],
          },
          {
            title: 'Legal',
            links: [
              'Privacy Policy',
              'Terms of Service',
              'Cookie Policy',
              'Your Privacy Choices',
            ],
          },
        ]
    const social = props.social?.length
      ? props.social
      : [
          { label: 'Twitter' },
          { label: 'Facebook' },
          { label: 'LinkedIn' },
          { label: 'Instagram' },
        ]
    const legal = props.legal?.length
      ? props.legal
      : ['Privacy', 'Terms', 'Cookies', 'Sitemap']

    return (
      <SiteFooter
        className={
          'border-t-2 border-foreground bg-background shadow-[inset_0_3px_0_-2px] shadow-border ' +
          (props.className ?? '')
        }
      >
        <FooterContent className="py-14">
          <FooterGrid className="grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-[1.4fr_1fr_1fr_1fr_1fr] md:gap-10">
            <FooterBrand
              className="col-span-2 md:col-span-1"
              brand={props.brand ?? 'The Chronicle'}
              brandMark={
                <span className="grid size-7 place-items-center rounded-none bg-foreground text-background">
                  <NewspaperMark className="size-4" />
                </span>
              }
              brandClassName={'font-serif text-2xl font-black tracking-tight'}
            >
              <FooterTagline className="mt-4 max-w-xs border-l border-border pl-4 leading-relaxed">
                {props.tagline ??
                  'Independent journalism since 1923. Committed to truth, accuracy, and the public interest.'}
              </FooterTagline>
              <FooterSocial className="mt-5 gap-4">
                {social.map((s) => (
                  <FooterSocialLink
                    key={s.label}
                    className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                  >
                    {s.label}
                  </FooterSocialLink>
                ))}
              </FooterSocial>
            </FooterBrand>
            {columns.map((col) => (
              <FooterColumn key={col.title}>
                <FooterColumnTitle className="border-b border-border pb-2 font-mono text-[11px] font-normal uppercase tracking-[0.22em] text-muted-foreground">
                  {col.title}
                </FooterColumnTitle>
                <FooterColumnList className="mt-4 space-y-2.5">
                  {col.links.map((link) => (
                    <FooterLink
                      key={link}
                      className="block w-fit text-left text-sm text-foreground/80 underline-offset-4 transition-colors hover:text-foreground hover:underline"
                    >
                      {link}
                    </FooterLink>
                  ))}
                </FooterColumnList>
              </FooterColumn>
            ))}
          </FooterGrid>
          <FooterBottom className="mt-12 border-t border-border pt-6">
            <FooterCopyright className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              {props.note ?? 'All rights reserved.'}
            </FooterCopyright>
            <FooterLegal className="gap-4">
              {legal.map((l) => (
                <FooterLink
                  key={l}
                  className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
                >
                  {l}
                </FooterLink>
              ))}
            </FooterLegal>
          </FooterBottom>
        </FooterContent>
      </SiteFooter>
    )
  },
})
