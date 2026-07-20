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
} from '#/section-kit/SiteFooter.tsx'
import { Watermark } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * FaqFooter — an "Editorial Q&A" five-column resource footer for a help-center /
 * SaaS product page. A giant faint brand watermark bleeds behind a spanning brand
 * block (sharp square rounded-none logo mark linking home, wordmark, tagline, and
 * hairline-outlined mono social chips) beside four link columns (Product, Resources,
 * Company, Legal) with mono uppercase column titles and block-fit links, over a
 * hairline bottom bar holding the mono copyright, a Status route link, and an "All
 * systems operational" status pill with a single primary live dot. All links route
 * through section-kit route links. Use as the global footer for SaaS knowledge bases,
 * help centers, documentation landings, or support pages. Renders fully with no props
 * via baked-in "FlowSync" defaults.
 */
export const FaqFooter = defineCapsule({
  name: 'FaqFooter',
  description:
    "An 'Editorial Q&A' five-column resource footer for a help-center / SaaS product page: a giant faint brand watermark behind a spanning brand block (sharp square rounded-none logo mark linking home, wordmark, tagline, and hairline-outlined mono social chips) beside four link columns (Product, Resources, Company, Legal) with mono uppercase column titles and block-fit links, over a hairline bottom bar holding the mono copyright, a Status route link, and an 'All systems operational' status pill with a single primary live dot. All links route through section-kit route links. Use as the global footer for SaaS knowledge bases, help centers, documentation landings, or support pages.",
  props: z.object({
    /** Brand / product name shown beside the logo. */
    brand: z.string().optional(),
    /** Tagline under the brand. */
    tagline: z.string().optional(),
    /** Social icon labels (first letter is shown). */
    socials: z.array(z.string()).optional(),
    /** Link columns: title + link labels. */
    columns: z
      .array(z.object({ title: z.string(), links: z.array(z.string()) }))
      .optional(),
    /** Copyright line in the bottom bar. */
    copyright: z.string().optional(),
    /** Status link label in the bottom bar. */
    statusTarget: z.string().optional(),
    /** Status pill label. */
    statusLabel: z.string().optional(),
    /** Route target for the logo / brand button. */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'FlowSync'
    const tagline =
      props.tagline ?? "Project management that flows with your team's work."
    const socials = props.socials?.length
      ? props.socials
      : ['Twitter', 'LinkedIn', 'GitHub']
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Product',
            links: [
              'Features',
              'Integrations',
              'Pricing',
              'Changelog',
              'Roadmap',
            ],
          },
          {
            title: 'Resources',
            links: [
              'Documentation',
              'API Reference',
              'Community',
              'Templates',
              'Guides',
            ],
          },
          {
            title: 'Company',
            links: ['About', 'Blog', 'Careers', 'Press', 'Contact'],
          },
          {
            title: 'Legal',
            links: ['Privacy', 'Terms', 'Security', 'Cookies', 'Compliance'],
          },
        ]
    const copyright =
      props.copyright ??
      `© ${new Date().getFullYear()} ${brand}, Inc. All rights reserved.`
    const statusTarget = props.statusTarget ?? 'Status'
    const statusLabel = props.statusLabel ?? 'All systems operational'
    const homeTarget = props.homeTarget ?? 'Documentation'
    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          'grid place-items-center rounded-none bg-foreground text-background',
          className,
        )}
        aria-hidden="true"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 7h11a4 4 0 0 1 0 8H8" />
          <polyline points="11 19 7 15 11 11" />
        </svg>
      </span>
    )

    return (
      <SiteFooter className={cn('relative overflow-hidden', props.className)}>
        {/* Giant faint brand watermark. */}
        <Watermark className="-bottom-6 right-0 font-serif text-[5rem] leading-none sm:text-[8rem] lg:text-[10rem]">
          {brand}
        </Watermark>
        <FooterContent className="relative">
          <FooterGrid>
            <FooterBrand
              brand={brand}
              brandMark={
                <NavbarRouteLink
                  aria-label={brand}
                  href={homeTarget}
                  className="inline-flex rounded-none active:translate-y-px"
                >
                  <LogoMark className="size-7" />
                </NavbarRouteLink>
              }
              brandClassName="text-lg font-semibold tracking-tight"
            >
              <FooterTagline className="max-w-xs leading-relaxed">
                {tagline}
              </FooterTagline>
              <FooterSocial className="mt-5 gap-2">
                {socials
                  .map((s) => ({ label: s }))
                  .map((s) => (
                    <FooterSocialLink
                      key={s.label}
                      className="rounded-none border border-border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:border-foreground hover:text-foreground active:translate-y-px"
                    >
                      {s.label}
                    </FooterSocialLink>
                  ))}
              </FooterSocial>
            </FooterBrand>
            {columns.map((col) => (
              <FooterColumn key={col.title}>
                <FooterColumnTitle className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {col.title}
                </FooterColumnTitle>
                <FooterColumnList className="mt-4 flex flex-col items-start gap-2.5">
                  {col.links.map((link) => (
                    <FooterLink
                      key={link}
                      className="block w-fit text-sm text-muted-foreground transition-colors hover:text-foreground active:translate-y-px"
                    >
                      {link}
                    </FooterLink>
                  ))}
                </FooterColumnList>
              </FooterColumn>
            ))}
          </FooterGrid>
          <FooterBottom className="mt-12 border-t border-border pt-6">
            <FooterCopyright className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
              {copyright}
            </FooterCopyright>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <FooterLink
                href={statusTarget}
                className="block w-fit font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground active:translate-y-px"
              >
                {statusTarget}
              </FooterLink>
              <span className="inline-flex items-center gap-2 border border-border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                <span
                  aria-hidden="true"
                  className="size-1.5 animate-pulse bg-primary"
                />
                {statusLabel}
              </span>
            </div>
          </FooterBottom>
        </FooterContent>
      </SiteFooter>
    )
  },
})
