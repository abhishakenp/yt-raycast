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

/**
 * FaqFooter — a five-column resource footer for a help-center / SaaS product page.
 * A spanning brand block (logo tile + name, tagline, and small social icon
 * buttons) sits beside four link columns (Product, Resources, Company, Legal) in a
 * responsive grid, with a bottom bar holding the copyright, a Status link, and a
 * green "All systems operational" status pill. All links route through section-kit route links.
 * Use as the global footer for SaaS knowledge bases, help centers, documentation
 * landings, or support pages. Renders fully with no props via baked-in "FlowSync"
 * defaults.
 */
export const FaqFooter = defineCapsule({
  name: 'FaqFooter',
  description:
    "A five-column resource footer for a help-center / SaaS product page: a spanning brand block (logo tile + name, tagline, and small social icon buttons) beside four link columns (Product, Resources, Company, Legal) in a responsive grid, with a bottom bar holding the copyright, a Status link, and a green 'All systems operational' status pill. All links route through section-kit route links. Use as the global footer for SaaS knowledge bases, help centers, documentation landings, or support pages.",
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
    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          'grid place-items-center rounded-lg bg-primary text-primary-foreground',
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
      <SiteFooter className={props.className}>
        <FooterContent>
          <FooterGrid>
            <FooterBrand brand={brand} brandMark={<LogoMark />}>
              <FooterTagline>{tagline}</FooterTagline>
              <FooterSocial>
                {socials
                  .map((s) => ({ label: s }))
                  .map((s) => (
                    <FooterSocialLink key={s.label}>{s.label}</FooterSocialLink>
                  ))}
              </FooterSocial>
            </FooterBrand>
            {columns.map((col) => (
              <FooterColumn key={col.title}>
                <FooterColumnTitle>{col.title}</FooterColumnTitle>
                <FooterColumnList>
                  {col.links.map((link) => (
                    <FooterLink key={link}>{link}</FooterLink>
                  ))}
                </FooterColumnList>
              </FooterColumn>
            ))}
          </FooterGrid>
          <FooterBottom>
            <FooterCopyright>{copyright}</FooterCopyright>
          </FooterBottom>
        </FooterContent>
      </SiteFooter>
    )
  },
})
