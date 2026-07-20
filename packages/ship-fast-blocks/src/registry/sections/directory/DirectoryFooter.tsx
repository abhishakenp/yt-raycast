import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'
import { Logo as BrandLogo, LogoImage, LogoLabel } from '#/section-kit/Logo.tsx'
/**
 * DirectoryFooter — newsprint colophon footer for a local-business directory.
 * A paper-surface band under a heavy double rule with a giant ghost "INDEX"
 * watermark bleeding off the bottom edge. An asymmetric 12-column grid pairs a
 * wide brand block (location-pin glyph + serif wordmark and the tagline note)
 * with mono-labeled, index-numbered link columns of hairline ledger links;
 * below, a hairline-divided bottom bar carries the copyright line, mono legal
 * links, and a decorative "[ END OF INDEX ]" tag. Every link routes through
 * section-kit route links. Use as the site footer for local directories,
 * business-listing marketplaces, find-a-service platforms, or
 * review-and-discovery sites.
 */
import {
  SiteFooter,
  FooterGrid,
  FooterColumn,
  FooterColumnTitle,
  FooterColumnList,
  FooterLink,
  FooterBottom,
  FooterCopyright,
  FooterLegal,
} from '#/section-kit/SiteFooter.tsx'
export const DirectoryFooter = defineCapsule({
  name: 'DirectoryFooter',
  description:
    'Newsprint colophon footer for a local-business DIRECTORY: a paper-surface band under a heavy double rule with a giant ghost INDEX watermark, an asymmetric 12-column grid pairing a wide brand block (location-pin glyph plus serif wordmark and tagline) with mono-labeled, index-numbered link columns, and a hairline-divided bottom bar with the copyright line, mono legal links, and an END OF INDEX tag. Every link routes through section-kit route links. Use as the site footer for local directories, business-listing marketplaces, find-a-service platforms, or review-and-discovery sites.',
  props: z.object({
    /** Brand / directory name shown in the footer. */
    brand: z.string().optional(),
    /** Short tagline under the brand. */
    note: z.string().optional(),
    /** Link-group columns. */
    columns: z
      .array(
        z.object({
          title: z.string(),
          links: z.array(z.string()),
        }),
      )
      .optional(),
    /** Legal links in the bottom bar. */
    legal: z.array(z.string()).optional(),
    /** Copyright line. */
    copyright: z.string().optional(),
    /** Navigation target for the brand logo. */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'LocalFindr'
    const note =
      props.note ??
      'Connecting communities with the best local businesses since 2020.'
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'For Customers',
            links: [
              'Browse Categories',
              'Write a Review',
              'Saved Businesses',
              'Mobile App',
            ],
          },
          {
            title: 'For Business',
            links: [
              'List Your Business',
              'Pricing Plans',
              'Success Stories',
              'Business Blog',
            ],
          },
          {
            title: 'Company',
            links: ['About Us', 'Careers', 'Press', 'Contact'],
          },
        ]
    const legal = props.legal?.length
      ? props.legal
      : ['Privacy Policy', 'Terms of Service', 'Cookie Settings']
    const copyright =
      props.copyright ??
      `© ${new Date().getFullYear()} ${brand}. All rights reserved.`
    const PinLogo = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
    const brandBlock = (
      <BrandLogo brand={brand} className="flex items-center gap-2">
        <LogoImage
          className="size-7"
          fallback={<PinLogo className="size-7 text-foreground" />}
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
        {/* Giant ghost index watermark bleeding off the bottom edge. */}
        <Watermark className="-bottom-8 -right-3 font-serif text-[5rem] sm:text-[9rem] lg:text-[13rem]">
          INDEX
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
                {note}
              </p>
              <MonoTag tone="faint" className="mt-6 block">
                Classified · Verified · Local
              </MonoTag>
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
              {copyright}
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
