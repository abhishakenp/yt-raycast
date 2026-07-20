import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
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
 * BlogPostFooter — newsprint colophon footer for an editorial blog post /
 * article detail page. Thin configuration over the shared `SiteFooter`
 * composite, opened by a double-ruled top edge: a feather / pen mark beside a
 * serif bold wordmark and an italic serif tagline, square hairline social
 * chips that invert to ink on hover, link columns headed by mono small-caps
 * titles (Explore, Company, Legal, …), a centered ✦ ✦ ✦ ornament divider, and
 * a mono bottom bar with an auto-updating copyright line. Use as the
 * site-wide footer for a blog, magazine, journal, or any editorial
 * publication. Renders fully with no props via baked-in defaults.
 */
function FeatherMark({ className }: { className?: string }) {
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
      <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
      <path d="M16 8 2 22" />
      <path d="M17.5 15H9" />
    </svg>
  )
}

export const BlogPostFooter = defineCapsule({
  name: 'BlogPostFooter',
  description:
    'Newsprint colophon footer for an editorial blog post / article detail page built on the shared SiteFooter composite: a double-ruled top edge, a feather/pen mark beside a serif bold wordmark with an italic serif tagline, square hairline social chips that invert to ink on hover, link columns headed by mono small-caps titles (Explore, Company, Legal, …), a centered ornament divider, and a mono bottom bar with an auto-updating copyright line. Use as the site-wide footer for a blog, magazine, journal, or any editorial publication.',
  props: z.object({
    /** Publication / brand name shown as the wordmark. */
    brand: z.string().optional(),
    /** Short tagline below the wordmark. */
    tagline: z.string().optional(),
    /** Link columns (Explore, Company, Legal, …), each a title + labels. */
    columns: z
      .array(z.object({ title: z.string(), links: z.array(z.string()) }))
      .optional(),
    /** Social channels rendered as a link row under the brand. */
    social: z
      .array(z.object({ label: z.string(), href: z.string().optional() }))
      .optional(),
    /** Legal / utility link labels on the bottom bar. */
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
            title: 'Explore',
            links: ['Latest', 'Topics', 'Archive', 'Authors'],
          },
          {
            title: 'Company',
            links: ['About', 'Newsletter', 'Contact', 'RSS'],
          },
          { title: 'Legal', links: ['Privacy', 'Terms', 'Cookies'] },
        ]
    const social = props.social?.length
      ? props.social
      : [{ label: 'Twitter' }, { label: 'GitHub' }, { label: 'RSS' }]
    const legal = props.legal?.length ? props.legal : ['Privacy', 'Terms']

    return (
      <SiteFooter
        className={cn(
          'border-t-[3px] border-foreground/40 bg-background [border-top-style:double]',
          props.className,
        )}
      >
        <FooterContent className="max-w-5xl">
          <FooterGrid>
            <FooterBrand
              brand={props.brand ?? 'The Editorial'}
              brandMark={<FeatherMark className="size-6 text-primary" />}
              brandClassName={'font-serif text-xl font-bold tracking-tight'}
            >
              <FooterTagline className="font-serif italic">
                {props.tagline ??
                  'Thoughtful writing on design, code, and the craft of building.'}
              </FooterTagline>
              <FooterSocial>
                {social.map((s) => (
                  <FooterSocialLink
                    key={s.label}
                    className="rounded-none border border-foreground/25 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:bg-foreground hover:text-background"
                  >
                    {s.label}
                  </FooterSocialLink>
                ))}
              </FooterSocial>
            </FooterBrand>
            {columns.map((col) => (
              <FooterColumn key={col.title}>
                <FooterColumnTitle className="font-mono text-[11px] font-normal uppercase tracking-[0.2em] text-muted-foreground">
                  {col.title}
                </FooterColumnTitle>
                <FooterColumnList className="mt-4">
                  {col.links.map((link) => (
                    <FooterLink
                      key={link}
                      className="block font-serif text-foreground/80 underline-offset-4 hover:underline"
                    >
                      {link}
                    </FooterLink>
                  ))}
                </FooterColumnList>
              </FooterColumn>
            ))}
          </FooterGrid>
          {/* Colophon ornament divider. */}
          <div
            aria-hidden="true"
            className="mt-10 text-center font-serif text-sm tracking-[1em] text-muted-foreground/60"
          >
            ✦ ✦ ✦
          </div>
          <FooterBottom className="border-foreground/20">
            <FooterCopyright className="font-mono text-[11px] uppercase tracking-[0.12em]">
              {props.note ?? 'All rights reserved.'}
            </FooterCopyright>
            <FooterLegal>
              {legal.map((l) => (
                <FooterLink
                  key={l}
                  className="font-mono text-[11px] uppercase tracking-[0.12em]"
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
