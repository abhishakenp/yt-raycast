import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
/**
 * CloudInfraFooter — fat multi-column footer for a cloud-infrastructure / developer-
 * platform SaaS landing page. A bordered-top footer with a 5-column grid: the first
 * two columns show a brand logo tile + name, tagline, and social icons; the remaining
 * columns list link groups (title + links). Every button routes through section-kit route links.
 * Tokens-only. Renders fully on zero arguments.
 */
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
export const CloudInfraFooter = defineCapsule({
  name: 'CloudInfraFooter',
  description:
    'Fat multi-column footer for a cloud-infrastructure / developer-platform SaaS landing page: a bordered-top footer with a 5-column grid. The first two columns show a brand logo tile plus name, a tagline paragraph, and social icon buttons; the remaining columns list link groups (title + routable links). Every button routes through section-kit route links. Use as the site footer for cloud hosting, IaaS, PaaS, serverless, or developer-tooling sites.',
  props: z.object({
    /** Brand / product name shown beside the logo tile. */
    brand: z.string().optional(),
    /** Tagline paragraph under the brand. */
    tagline: z.string().optional(),
    /** Link groups: title + array of link labels. */
    groups: z
      .array(
        z.object({
          title: z.string(),
          links: z.array(z.string()),
        }),
      )
      .optional(),
    /** Copyright / footer note line. */
    note: z.string().optional(),
    /** Meta badges shown in the bottom-right. */
    meta: z.array(z.string()).optional(),
    /** Social network labels (Twitter, GitHub, Discord). */
    socials: z.array(z.string()).optional(),
    /** Navigation target for the brand button and social fallback. */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'CloudShift'
    const tagline =
      props.tagline ??
      'Elastic cloud infrastructure for modern engineering teams. Deploy globally in seconds.'
    const groups = props.groups?.length
      ? props.groups
      : [
          {
            title: 'Product',
            links: [
              'Features',
              'Pricing',
              'Changelog',
              'Documentation',
              'API Reference',
            ],
          },
          {
            title: 'Company',
            links: ['About', 'Blog', 'Careers', 'Contact', 'Status'],
          },
          {
            title: 'Legal',
            links: [
              'Privacy Policy',
              'Terms of Service',
              'Cookie Policy',
              'Security',
              'Compliance',
            ],
          },
        ]
    const note =
      props.note ??
      `© ${new Date().getFullYear()} ${brand}, Inc. All rights reserved.`
    const socials = props.socials?.length
      ? props.socials
      : ['Twitter', 'GitHub', 'Discord']
    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          'grid place-items-center rounded-lg bg-primary text-primary-foreground',
          className,
        )}
        aria-hidden="true"
      >
        <svg
          className="size-[60%]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
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
            {groups.map((col) => (
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
            <FooterCopyright>{note}</FooterCopyright>
          </FooterBottom>
        </FooterContent>
      </SiteFooter>
    )
  },
})
