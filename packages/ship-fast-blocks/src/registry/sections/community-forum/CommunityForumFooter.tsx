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
 * CommunityForumFooter — playful-geometric multi-column footer for a
 * community-platform / discussion-forum landing page. A top-bordered band with
 * an asymmetric 4:8 grid: a wide brand column (three-dot logo + bold wordmark,
 * tagline, and rounded-full bordered social chips with press feedback) beside
 * the link columns, whose headings are mono uppercase micro-labels above
 * hairline-topped link lists. A giant ghost "☺" watermark sits behind the
 * band, and the bottom bar pairs the copyright with rounded-full legal chip
 * links. Every link and the brand button route through section-kit route
 * links. Use as the closing site footer for community platforms, SaaS
 * products, or online forum services.
 */
export const CommunityForumFooter = defineCapsule({
  name: 'CommunityForumFooter',
  description:
    'Playful-geometric multi-column footer for a community-platform / discussion-forum landing page: a top-bordered band with an asymmetric grid — a wide brand column (three-dot logo + bold wordmark, tagline, rounded-full bordered social chips with press feedback) beside link columns headed by mono uppercase micro-labels over hairline-topped lists — behind a giant ghost watermark, closing with a bottom bar of copyright and rounded-full legal chip links. Every link and the brand button route through section-kit route links. Use as the closing site footer for community platforms, SaaS products, or online forum services.',
  props: z.object({
    /** Brand / product name shown in the logo and copyright. */
    brand: z.string().optional(),
    /** Brand tagline under the logo. */
    tagline: z.string().optional(),
    /** Link columns: heading + link labels. */
    columns: z
      .array(
        z.object({
          heading: z.string(),
          links: z.array(z.string()),
        }),
      )
      .optional(),
    /** Copyright note appended after the brand + year. */
    note: z.string().optional(),
    /** Legal / utility link labels in the bottom bar. */
    legal: z.array(z.string()).optional(),
    /** Navigation target for the brand button. */
    homeTarget: z.string().optional(),
    /** Social link labels for the social icon buttons. */
    socials: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Threadloom'
    const tagline =
      props.tagline ??
      'The modern platform for communities that value depth, organization, and meaningful connection.'
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            heading: 'Product',
            links: [
              'Features',
              'Pricing',
              'Integrations',
              'Changelog',
              'Roadmap',
            ],
          },
          {
            heading: 'Resources',
            links: [
              'Documentation',
              'API Reference',
              'Community',
              'Blog',
              'Guides',
            ],
          },
          {
            heading: 'Company',
            links: ['About', 'Careers', 'Contact', 'Privacy', 'Terms'],
          },
        ]
    const note = props.note ?? 'All rights reserved.'
    const legal = props.legal?.length
      ? props.legal
      : ['Status', 'Security', 'Sitemap']
    const socials = props.socials?.length
      ? props.socials
      : ['Twitter', 'GitHub', 'Instagram']
    const BrandMark = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 32 32"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <circle cx="8" cy="16" r="3" />
        <circle cx="16" cy="16" r="3" />
        <circle cx="24" cy="16" r="3" />
      </svg>
    )
    return (
      <SiteFooter
        className={`relative overflow-hidden border-t-2 border-foreground/15 bg-background ${props.className ?? ''}`}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-16 -right-6 select-none font-extrabold leading-none tracking-tighter text-foreground/[0.035] text-[10rem] sm:text-[14rem]"
        >
          ☺
        </span>
        <FooterContent className="relative py-14 sm:py-16">
          <FooterGrid className="gap-10 md:grid-cols-12 md:gap-8">
            <FooterBrand
              brand={brand}
              brandMark={<BrandMark />}
              className="md:col-span-5 lg:col-span-4"
              brandClassName="text-xl font-extrabold tracking-tight"
            >
              <FooterTagline className="mt-4 max-w-xs leading-relaxed">
                {tagline}
              </FooterTagline>
              <FooterSocial className="mt-6 gap-2.5">
                {socials
                  .map((s) => ({ label: s }))
                  .map((s, i) => (
                    <FooterSocialLink
                      key={s.label}
                      className={`inline-flex items-center rounded-full border-2 border-foreground/15 bg-card px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground transition-all duration-150 hover:-translate-y-0.5 hover:border-foreground/40 hover:text-foreground active:translate-y-px ${
                        i % 2 === 0 ? '-rotate-1' : 'rotate-1'
                      }`}
                    >
                      {s.label}
                    </FooterSocialLink>
                  ))}
              </FooterSocial>
            </FooterBrand>
            {columns
              .map((c) => ({ title: c.heading, links: c.links }))
              .map((col) => (
                <FooterColumn
                  key={col.title}
                  className="md:col-span-2 lg:col-span-2 lg:col-start-auto"
                >
                  <FooterColumnTitle className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {col.title}
                  </FooterColumnTitle>
                  <FooterColumnList className="mt-4 space-y-2.5 border-t border-border pt-4">
                    {col.links.map((link) => (
                      <FooterLink
                        key={link}
                        className="block w-fit transition-colors"
                      >
                        {link}
                      </FooterLink>
                    ))}
                  </FooterColumnList>
                </FooterColumn>
              ))}
          </FooterGrid>
          <FooterBottom className="mt-12 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            <FooterCopyright className="font-mono text-[11px] uppercase tracking-[0.12em]">
              {note}
            </FooterCopyright>
            <FooterLegal className="gap-2">
              {legal.map((l) => (
                <FooterLink
                  key={l}
                  className="inline-flex items-center rounded-full border border-foreground/15 bg-card px-3 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground transition-all duration-150 hover:border-foreground/40 hover:text-foreground active:translate-y-px"
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
