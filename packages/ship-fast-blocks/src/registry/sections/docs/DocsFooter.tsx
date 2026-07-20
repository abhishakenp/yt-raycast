import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Watermark } from '#/section-kit/Decor.tsx'
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
 * DocsFooter — "Terminal-docs" closing footer for a developer platform or
 * documentation site. Built on the shared `SiteFooter` composite over a giant
 * ghost brand-wordmark watermark: an asymmetric 4+2×4 grid pairs the brand
 * block (stacked-cube mark + wordmark + product tagline + a row of square
 * hairline mono social chips for GitHub / Discord / Twitter) with link
 * columns (Docs, Resources, Community, Company) whose titles are mono
 * uppercase micro-labels and whose links carry a `#` anchor glyph via a CSS
 * pseudo-prefix that warms to primary on hover. A hairline-top bottom bar
 * holds a mono copyright line plus Privacy / Terms / Security legal links.
 * Every column and legal link routes through section-kit route links. Use as
 * the site-wide footer for developer docs, API platforms, SDKs, CLIs, or any
 * technical product landing page. Renders fully with no props via baked-in
 * StackForge defaults. Theme-tokened throughout; no hardcoded colors.
 */
function LogoMark({ className }: { className?: string }) {
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
      <path d="M12 2 3 7l9 5 9-5-9-5Z" />
      <path d="m3 12 9 5 9-5" />
      <path d="m3 17 9 5 9-5" />
    </svg>
  )
}

export const DocsFooter = defineCapsule({
  name: 'DocsFooter',
  description:
    "Terminal-docs closing footer for a developer platform or documentation site over a giant ghost brand-wordmark watermark: an asymmetric grid with a brand block (stacked-cube mark + mono wordmark + product tagline + square hairline mono social chips for GitHub/Discord/Twitter) and link columns (Docs, Resources, Community, Company) whose mono uppercase titles sit above '#'-anchored links that warm to primary on hover; a hairline-top bottom bar holds a mono copyright line and Privacy/Terms/Security legal links. Every brand, social, column, and legal link routes through section-kit route links. Use as the site-wide footer for developer docs, API platforms, SDKs, CLIs, or any technical product landing page.",
  props: z.object({
    /** Product / brand name shown as the wordmark. */
    brand: z.string().optional(),
    /** Short product tagline below the wordmark. */
    tagline: z.string().optional(),
    /** Social channels rendered as a link row under the brand. */
    social: z
      .array(z.object({ label: z.string(), href: z.string().optional() }))
      .optional(),
    /** Link columns (Docs, Resources, Community, Company, …), each a title + labels. */
    columns: z
      .array(z.object({ title: z.string(), links: z.array(z.string()) }))
      .optional(),
    /** Copyright note appended after the brand + year. */
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'StackForge'
    const social = props.social?.length
      ? props.social
      : [{ label: 'GitHub' }, { label: 'Discord' }, { label: 'Twitter' }]
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Docs',
            links: ['Getting Started', 'API Reference', 'SDKs', 'Changelog'],
          },
          {
            title: 'Resources',
            links: ['Guides', 'Tutorials', 'Examples', 'Status'],
          },
          {
            title: 'Community',
            links: ['GitHub', 'Discord', 'Support', 'Roadmap'],
          },
          {
            title: 'Company',
            links: ['About', 'Blog', 'Careers', 'Contact'],
          },
        ]

    const linkClassName =
      "block w-fit text-sm text-muted-foreground transition-colors before:mr-1.5 before:font-mono before:text-muted-foreground/40 before:transition-colors before:content-['#'] hover:text-foreground hover:before:text-primary"

    return (
      <SiteFooter
        className={cn(
          'relative overflow-hidden bg-background',
          props.className,
        )}
      >
        {/* Giant ghost wordmark bleeding off the bottom edge. */}
        <Watermark className="-bottom-8 left-0 font-mono text-[6rem] sm:-bottom-14 sm:text-[10rem] lg:text-[13rem]">
          {brand}
        </Watermark>

        <FooterContent className="relative py-14">
          <FooterGrid className="gap-10 md:grid-cols-12">
            <FooterBrand
              className="md:col-span-4"
              brand={brand}
              brandMark={<LogoMark className="size-7 text-primary" />}
              brandClassName="font-mono text-base font-semibold tracking-tight"
            >
              <FooterTagline className="max-w-xs">
                {props.tagline ??
                  'The developer platform for building, shipping, and scaling APIs.'}
              </FooterTagline>
              <FooterSocial className="mt-5 gap-2">
                {social.map((s) => (
                  <FooterSocialLink
                    key={s.label}
                    className="rounded-none border border-border px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
                  >
                    {s.label}
                  </FooterSocialLink>
                ))}
              </FooterSocial>
            </FooterBrand>
            {columns.map((col) => (
              <FooterColumn key={col.title} className="md:col-span-2">
                <FooterColumnTitle className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {col.title}
                </FooterColumnTitle>
                <FooterColumnList className="mt-4 space-y-2.5">
                  {col.links.map((link) => (
                    <FooterLink key={link} className={linkClassName}>
                      {link}
                    </FooterLink>
                  ))}
                </FooterColumnList>
              </FooterColumn>
            ))}
          </FooterGrid>
          <FooterBottom className="mt-14">
            <FooterCopyright className="font-mono text-[11px] uppercase tracking-[0.15em]">
              {props.note ?? 'All rights reserved.'}
            </FooterCopyright>
            <FooterLegal>
              {['Privacy', 'Terms', 'Security'].map((l) => (
                <FooterLink key={l} className={linkClassName}>
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
