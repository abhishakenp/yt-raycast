import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
import { Logo as BrandLogo, LogoImage, LogoLabel } from '#/section-kit/Logo.tsx'
/**
 * JobBoardFooter — newsprint colophon footer for a job-board / careers site. A
 * paper-surface band under a heavy double rule with a giant ghost "CAREERS"
 * watermark bleeding off the bottom edge. An asymmetric 12-column grid pairs a
 * wide brand block (briefcase glyph + serif wordmark, tagline, and a row of
 * square mono social chips with hard hover borders) with mono-labeled,
 * index-numbered link columns of hairline ledger links; below, a hairline-divided
 * bottom bar carries the copyright note, mono legal links, and a decorative
 * "[ END OF INDEX ]" tag. The brand mark, social chips and every link route
 * through section-kit route links. Use as the global footer for job boards,
 * hiring marketplaces, recruiting platforms or talent networks. Renders fully
 * with no props.
 */
import {
  SiteFooter,
  FooterGrid,
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
export const JobBoardFooter = defineCapsule({
  name: 'JobBoardFooter',
  description:
    'Newsprint colophon footer for a job-board / careers site: a paper-surface band under a heavy double rule with a giant ghost CAREERS watermark, an asymmetric 12-column grid pairing a wide brand block (briefcase glyph + serif wordmark, tagline, and square mono social chips) with mono-labeled, index-numbered link columns, and a hairline-divided bottom bar with the copyright note, mono legal links, and an END OF INDEX tag. Brand, social buttons and links route through section-kit route links. Use as the global footer for job boards, hiring marketplaces, recruiting platforms or talent networks.',
  props: z.object({
    /** Brand / product name shown beside the briefcase mark. */
    brand: z.string().optional(),
    /** Brand tagline under the logo. */
    tagline: z.string().optional(),
    /** Social icon button labels (used as aria-labels + nav targets). */
    socials: z.array(z.string()).optional(),
    /** Footer link columns: title + links. */
    columns: z
      .array(z.object({ title: z.string(), links: z.array(z.string()) }))
      .optional(),
    /** Bottom copyright note. */
    note: z.string().optional(),
    /** Inline legal links in the bottom row. */
    legal: z.array(z.string()).optional(),
    /** Where the brand click navigates. */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'WorkFlow'
    const tagline =
      props.tagline ??
      'Connecting exceptional talent with world-class companies. Find your next career move or hire your dream team.'
    const socials = props.socials?.length
      ? props.socials
      : ['Twitter', 'LinkedIn', 'GitHub']
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'For Candidates',
            links: [
              'Browse Jobs',
              'Companies',
              'Salary Guide',
              'Resume Builder',
              'Career Advice',
            ],
          },
          {
            title: 'For Employers',
            links: [
              'Post a Job',
              'Search Resumes',
              'Pricing',
              'Recruiting Solutions',
              'Employer Blog',
            ],
          },
          {
            title: 'Company',
            links: ['About Us', 'Careers', 'Press', 'Contact', 'Help Center'],
          },
        ]
    const note =
      props.note ??
      `© ${new Date().getFullYear()} ${brand} Inc. All rights reserved.`
    const legal = props.legal?.length
      ? props.legal
      : ['Privacy Policy', 'Terms of Service', 'Cookie Settings']
    const BriefcaseMark = ({ className }: { className?: string }) => (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      </svg>
    )
    const brandBlock = (
      <BrandLogo brand={brand} className="flex items-center gap-2">
        <LogoImage
          className="size-7"
          fallback={<BriefcaseMark className="size-7 text-foreground" />}
        />
        <LogoLabel className="font-serif text-xl font-bold tracking-tight text-foreground" />
      </BrandLogo>
    )
    return (
      <SiteFooter
        className={cn(
          'relative overflow-hidden border-t-2 border-foreground bg-background',
          props.className,
        )}
      >
        {/* Second hairline of the newsprint double rule. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-1 border-t border-border"
        />
        {/* Giant ghost watermark bleeding off the bottom edge. */}
        <Watermark className="-bottom-8 -right-3 font-serif text-[5rem] sm:text-[9rem] lg:text-[13rem]">
          CAREERS
        </Watermark>
        <Container className="relative py-14 lg:py-16">
          <FooterGrid className="grid gap-10 md:grid-cols-12 lg:gap-8">
            <div className="md:col-span-5 lg:col-span-6">
              {props.homeTarget ? (
                <NavbarRouteLink
                  href={props.homeTarget}
                  className="inline-flex w-fit"
                >
                  {brandBlock}
                </NavbarRouteLink>
              ) : (
                brandBlock
              )}
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
                {tagline}
              </p>
              <FooterSocial className="mt-6 gap-2">
                {socials
                  .map((s) => ({ label: s }))
                  .map((s) => (
                    <FooterSocialLink
                      key={s.label}
                      className="rounded-none border border-border px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                    >
                      {s.label}
                    </FooterSocialLink>
                  ))}
              </FooterSocial>
            </div>
            {columns.map((col, colIndex) => (
              <FooterColumn key={col.title} className="md:col-span-2">
                <FooterColumnTitle className="flex items-baseline gap-2 font-mono text-[11px] font-normal uppercase tracking-[0.16em] text-muted-foreground">
                  <span aria-hidden="true" className="tabular-nums">
                    {String(colIndex + 1).padStart(2, '0')}
                  </span>
                  {col.title}
                </FooterColumnTitle>
                <FooterColumnList className="mt-4 space-y-2.5 border-l border-border pl-4">
                  {col.links.map((link) => (
                    <FooterLink
                      key={link}
                      className="block w-fit text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link}
                    </FooterLink>
                  ))}
                </FooterColumnList>
              </FooterColumn>
            ))}
          </FooterGrid>
          <FooterBottom className="mt-12 flex flex-col justify-between gap-4 border-t border-border pt-6 sm:flex-row sm:items-center">
            <FooterCopyright className="text-sm text-muted-foreground">
              {note}
            </FooterCopyright>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <FooterLegal className="flex flex-wrap gap-x-5 gap-y-2">
                {legal.map((l) => (
                  <FooterLink
                    key={l}
                    className="block w-fit font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {l}
                  </FooterLink>
                ))}
              </FooterLegal>
              <MonoTag tone="faint" aria-hidden="true">
                [ END OF INDEX ]
              </MonoTag>
            </div>
          </FooterBottom>
        </Container>
      </SiteFooter>
    )
  },
})
