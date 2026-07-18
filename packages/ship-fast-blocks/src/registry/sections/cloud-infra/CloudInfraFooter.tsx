import { defineCapsule } from '#/capsules/openui.ts'
import type { ReactNode } from 'react'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * CloudInfraFooter — fat multi-column footer for a cloud-infrastructure / developer-
 * platform SaaS landing page. A bordered-top footer with a 5-column grid: the first
 * two columns show a brand logo tile + name, tagline, and social icons; the remaining
 * columns list link groups (title + links). Every button routes through useNavigate.
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
    'Fat multi-column footer for a cloud-infrastructure / developer-platform SaaS landing page: a bordered-top footer with a 5-column grid. The first two columns show a brand logo tile plus name, a tagline paragraph, and social icon buttons; the remaining columns list link groups (title + routable links). Every button routes through useNavigate. Use as the site footer for cloud hosting, IaaS, PaaS, serverless, or developer-tooling sites.',
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
    const meta = props.meta?.length
      ? props.meta
      : ['35 regions', '99.99% uptime', 'SOC 2 certified']
    const socials = props.socials?.length
      ? props.socials
      : ['Twitter', 'GitHub', 'Discord']
    const homeTarget = props.homeTarget ?? 'Features'
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
    const socialIcons: Record<string, ReactNode> = {
      Twitter: (
        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
      ),
      GitHub: (
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
        />
      ),
      Discord: (
        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
      ),
    }
    void meta
    void homeTarget
    void socialIcons
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
