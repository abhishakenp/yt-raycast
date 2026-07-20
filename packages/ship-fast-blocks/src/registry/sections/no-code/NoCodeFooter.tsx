import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

/**
 * NoCodeFooter — block-builder-kinetic ledger footer for a no-code /
 * app-builder SaaS landing page. A hairline-topped band with a giant ghost
 * brand watermark bleeding off the bottom edge: an asymmetric 12-column grid
 * pairs a wide brand block (stacked-blocks glyph + name, a short descriptor,
 * and square mono social chips with hard hover borders) with mono-labeled link
 * columns; below, a hairline-divided bottom bar carries the auto-updating
 * copyright, mono legal links and a decorative "[ EOF ]" tag. The brand mark,
 * social chips and every link route through section-kit route links. Use as the
 * closing site footer for a no-code / app-builder SaaS or product landing page.
 * Renders fully with no props.
 */
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import {
  SiteFooter,
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
export const NoCodeFooter = defineCapsule({
  name: 'NoCodeFooter',
  description:
    'Block-builder-kinetic ledger footer for a no-code / app-builder SaaS landing page: a hairline-topped band with a giant ghost brand watermark, an asymmetric 12-column grid pairing a wide brand block (stacked-blocks glyph + name, descriptor, square mono social chips) with mono-labeled link columns, and a hairline-divided bottom bar with auto-updating copyright and mono legal links. The brand mark, social chips and every link route through section-kit route links. Use as the closing site footer for a no-code / app-builder SaaS or product landing page.',
  props: z.object({
    /** Brand / product name shown beside the logo tile. */
    brand: z.string().optional(),
    /** Short description under the brand. */
    description: z.string().optional(),
    /** Link columns (title + links). */
    columns: z
      .array(
        z.object({
          title: z.string(),
          links: z.array(z.string()),
        }),
      )
      .optional(),
    /** Social network labels (rendered as round initial buttons). */
    socials: z.array(z.string()).optional(),
    /** Copyright line (defaults to brand + current year). */
    copyright: z.string().optional(),
    /** Legal / utility link labels in the bottom row. */
    legal: z.array(z.string()).optional(),
    /** Navigation target for the brand button. */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Buildr'
    const description =
      props.description ??
      'The no-code platform that empowers anyone to build beautiful, functional apps without writing code.'
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Product',
            links: [
              'Features',
              'Templates',
              'Pricing',
              'Integrations',
              'Changelog',
            ],
          },
          {
            title: 'Company',
            links: ['About', 'Blog', 'Careers', 'Press', 'Partners'],
          },
          {
            title: 'Resources',
            links: [
              'Documentation',
              'Help Center',
              'Community',
              'Contact',
              'Status',
            ],
          },
        ]
    const socials = props.socials?.length
      ? props.socials
      : ['Twitter', 'GitHub', 'LinkedIn']
    const copyright =
      props.copyright ??
      `© ${new Date().getFullYear()} ${brand}, Inc. All rights reserved.`
    const legal = props.legal?.length
      ? props.legal
      : ['Privacy Policy', 'Terms of Service', 'Cookies']
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
              brandMark={
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M12 2 2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              }
              className="md:col-span-5 lg:col-span-6"
            >
              <FooterTagline className="max-w-sm">{description}</FooterTagline>
              <FooterSocial className="mt-5 gap-2">
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
