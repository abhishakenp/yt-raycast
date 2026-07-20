import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

/**
 * MarketingAgencyFooter — kinetic ledger footer. A hairline-topped band with a
 * giant ghost brand watermark bleeding off the bottom edge: an asymmetric
 * 12-column grid pairs a wide brand block (layered-diamond glyph + name + short
 * about blurb) with mono-labeled link columns; below, a hairline-divided bottom
 * bar carries a copyright line, mono legal links, and a decorative
 * "[ EOF ]" tag. Every link routes through section-kit route links. Use as the
 * closing footer for a marketing / growth agency, SaaS, or B2B services site.
 * Renders fully with no props.
 */
import {
  SiteFooter,
  FooterGrid,
  FooterBrand,
  FooterTagline,
  FooterColumn,
  FooterColumnTitle,
  FooterColumnList,
  FooterLink,
  FooterBottom,
  FooterCopyright,
  FooterLegal,
} from '#/section-kit/SiteFooter.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
export const MarketingAgencyFooter = defineCapsule({
  name: 'MarketingAgencyFooter',
  description:
    'Kinetic ledger footer: a hairline-topped band with a giant ghost brand watermark, an asymmetric 12-column grid pairing a wide brand block (layered-diamond glyph + name + short about blurb) with mono-labeled link columns, and a hairline-divided bottom bar with a copyright line, mono legal links, and a decorative [ EOF ] tag. Every link routes through section-kit route links. Use as the closing footer for a marketing / growth agency, SaaS, or B2B services site.',
  props: z.object({
    /** Agency / brand name shown beside the logo glyph. */
    brand: z.string().optional(),
    /** Nav target the brand button routes to (typically the home label). */
    homeTarget: z.string().optional(),
    about: z.string().optional(),
    columns: z
      .array(
        z.object({
          title: z.string(),
          links: z.array(z.string()),
        }),
      )
      .optional(),
    copyright: z.string().optional(),
    legal: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Nexus Growth'
    const about =
      props.about ??
      'Data-driven marketing for ambitious brands. Based in San Francisco, working with clients globally.'
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Services',
            links: [
              'Performance Marketing',
              'SEO & Content',
              'Email Marketing',
              'CRO',
            ],
          },
          {
            title: 'Company',
            links: ['About', 'Case Studies', 'Careers', 'Contact'],
          },
          {
            title: 'Connect',
            links: ['Twitter', 'LinkedIn', 'YouTube', 'Newsletter'],
          },
        ]
    const copyright = props.copyright ?? 'All rights reserved.'
    const legal = props.legal?.length
      ? props.legal
      : ['Privacy Policy', 'Terms of Service', 'Cookie Policy']
    const LogoMark = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className={className}
        aria-hidden="true"
      >
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    )
    return (
      <SiteFooter
        className={
          'relative overflow-hidden border-t border-border bg-background' +
          (props.className ? ' ' + props.className : '')
        }
      >
        {/* Giant ghost brand watermark bleeding off the bottom edge. */}
        <Watermark className="-bottom-6 -right-2 text-[5rem] sm:text-[9rem] lg:text-[12rem]">
          {brand}
        </Watermark>
        <Container className="relative py-14 lg:py-16">
          <FooterGrid className="grid gap-10 md:grid-cols-12 lg:gap-8">
            <FooterBrand
              brand={brand}
              brandMark={<LogoMark className="size-7 text-primary" />}
              className="md:col-span-6"
            >
              <FooterTagline className="max-w-sm">{about}</FooterTagline>
            </FooterBrand>
            {columns.map((col) => (
              <FooterColumn key={col.title} className="md:col-span-2">
                <FooterColumnTitle className="font-mono text-[11px] font-normal uppercase tracking-[0.2em] text-muted-foreground">
                  <span aria-hidden="true" className="text-primary">
                    /{' '}
                  </span>
                  {col.title}
                </FooterColumnTitle>
                <FooterColumnList className="mt-4 space-y-2.5">
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
                [ EOF ]
              </MonoTag>
            </div>
          </FooterBottom>
        </Container>
      </SiteFooter>
    )
  },
})
