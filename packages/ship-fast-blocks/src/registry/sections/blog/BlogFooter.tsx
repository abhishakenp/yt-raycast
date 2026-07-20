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
 * BlogFooter — newsprint colophon footer for an editorial blog or
 * publication. Opens on a heavy double masthead rule (thick top border plus a
 * hairline echo), then lays out a brand block — serif wordmark beside a
 * square ink-block pen mark, an editorial tagline, and a mono small-caps
 * social row — alongside link columns whose mono uppercase titles sit on
 * hairline rules (Explore, Topics, More). A hairline-ruled bottom bar carries
 * the auto-updating copyright line and a mono legal link row, closing the
 * page like a printer's colophon. Every brand, social, and column link routes
 * through section-kit route links. Use as the site-wide footer for blogs,
 * magazines, newsrooms, or content hubs. Renders fully with no props via
 * baked-in "Form & Function" defaults.
 */
function PenMark({ className }: { className?: string }) {
  return (
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
}

export const BlogFooter = defineCapsule({
  name: 'BlogFooter',
  description:
    'Newsprint colophon footer for an editorial blog or publication: a heavy double masthead rule opens a grid with a brand block (serif wordmark + square ink-block pen mark + editorial tagline + mono small-caps social row) and link columns whose mono uppercase titles sit on hairline rules (Explore, Topics, More), plus a hairline-ruled bottom bar holding an auto-updating copyright line and a mono legal link row. Every brand, social, and column link routes through section-kit route links. Use as the site-wide footer for blogs, magazines, newsrooms, or content hubs.',
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
        className={
          'border-t-2 border-foreground bg-background shadow-[inset_0_3px_0_-2px] shadow-border ' +
          (props.className ?? '')
        }
      >
        <FooterContent className="py-14">
          <FooterGrid className="grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:gap-10">
            <FooterBrand
              className="col-span-2 md:col-span-1"
              brand={props.brand ?? 'Form & Function'}
              brandMark={
                <span className="grid size-7 place-items-center rounded-none bg-foreground text-background">
                  <PenMark className="size-4" />
                </span>
              }
              brandClassName={'font-serif text-2xl font-black tracking-tight'}
            >
              <FooterTagline className="mt-4 max-w-xs border-l border-border pl-4 leading-relaxed">
                {props.tagline ??
                  'Essays on design, engineering, and the craft of building products.'}
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
              {['Privacy', 'Terms', 'RSS'].map((l) => (
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
