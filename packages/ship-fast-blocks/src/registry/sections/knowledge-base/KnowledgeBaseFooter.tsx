import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Watermark } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
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
 * KnowledgeBaseFooter — "Terminal-docs" closing footer for a help center /
 * knowledge-base site. Built on the shared `SiteFooter` composite over a giant
 * ghost brand-wordmark watermark: an asymmetric grid pairs the brand block (a
 * routed stroked book-glyph home mark + mono wordmark + product tagline + a row
 * of square hairline mono social chips) with product / resources / company link
 * columns whose titles are mono uppercase micro-labels and whose links carry a
 * `#` anchor glyph via a CSS pseudo-prefix that warms to primary on hover. A
 * hairline-top bottom bar holds a mono copyright line plus legal links. Calm,
 * hairline, reference aesthetic; the brand mark, socials and every link route
 * through section-kit route links. Use as the closing footer for a knowledge
 * base, support portal, docs site or FAQ hub. Renders fully with no props via
 * baked-in "Help Center" defaults. Theme tokens only.
 */
export const KnowledgeBaseFooter = defineCapsule({
  name: 'KnowledgeBaseFooter',
  description:
    "Terminal-docs closing footer for a help center / knowledge-base site over a giant ghost brand-wordmark watermark: an asymmetric grid with a brand block (routed stroked book-glyph home mark + mono wordmark + product tagline + square hairline mono social chips) and product/resources/company link columns whose mono uppercase titles sit above '#'-anchored links that warm to primary on hover; a hairline-top bottom bar holds a mono copyright line and legal links. Calm, hairline, reference aesthetic; the brand mark, socials and every link route through section-kit route links. Use as the closing footer for a knowledge base, support portal, docs site or FAQ hub.",
  props: z.object({
    /** Brand / help-center name shown beside the logo tile. */
    brand: z.string().optional(),
    tagline: z.string().optional(),
    columns: z
      .array(z.object({ title: z.string(), links: z.array(z.string()) }))
      .optional(),
    socials: z.array(z.string()).optional(),
    copyright: z.string().optional(),
    legal: z.array(z.string()).optional(),
    /** Navigation target for the brand button (defaults to "Categories"). */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Help Center'
    const homeTarget = props.homeTarget ?? 'Categories'
    const tagline =
      props.tagline ??
      'Comprehensive documentation, guides, and support to help you get the most out of our platform.'
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Product',
            links: ['Features', 'Pricing', 'Integrations', 'API', 'Security'],
          },
          {
            title: 'Resources',
            links: ['Documentation', 'Guides', 'Blog', 'Community', 'Status'],
          },
          {
            title: 'Company',
            links: ['About', 'Careers', 'Contact', 'Privacy', 'Terms'],
          },
        ]
    const socials = props.socials?.length
      ? props.socials
      : ['Twitter', 'LinkedIn', 'GitHub', 'YouTube']
    const copyright =
      props.copyright ??
      `© ${new Date().getFullYear()} ${brand}. All rights reserved.`
    const legal = props.legal?.length
      ? props.legal
      : ['Privacy Policy', 'Terms of Service', 'Cookie Settings']
    const LogoMark = ({ className }: { className?: string }) => (
      <NavbarRouteLink
        href={homeTarget}
        aria-label={`${brand} home`}
        className="inline-flex text-primary"
      >
        <svg
          className={cn('size-7', className)}
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      </NavbarRouteLink>
    )

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
        <Watermark className="-bottom-8 left-0 font-mono text-[5rem] sm:-bottom-14 sm:text-[9rem] lg:text-[12rem]">
          {brand}
        </Watermark>

        <FooterContent className="relative py-14">
          <FooterGrid className="gap-10 md:grid-cols-12">
            <FooterBrand
              className="md:col-span-6"
              brand={brand}
              brandMark={<LogoMark />}
              brandClassName="font-mono text-base font-semibold tracking-tight"
            >
              <FooterTagline className="max-w-sm">{tagline}</FooterTagline>
              <FooterSocial className="mt-5 gap-2">
                {socials
                  .map((s) => ({ label: s }))
                  .map((s) => (
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
              {copyright}
            </FooterCopyright>
            <FooterLegal>
              {legal.map((l) => (
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
