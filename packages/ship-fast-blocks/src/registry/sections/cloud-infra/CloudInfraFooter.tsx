import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
/**
 * CloudInfraFooter — terminal-industrial multi-column footer for a cloud-
 * infrastructure / developer-platform SaaS landing page. A hairline-topped
 * footer with a 5-column grid: the first columns show a square brand logo
 * tile + name, tagline, and square bordered mono social chips; the remaining
 * columns list link groups under mono uppercase titles. A hairline-ruled
 * bottom row pairs the copyright note with a mono status line and pulsing
 * primary square. A faint giant brand watermark sits behind. Every button
 * routes through section-kit route links. Tokens-only. Renders fully on zero
 * arguments.
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
import { Watermark } from '#/section-kit/Decor.tsx'
export const CloudInfraFooter = defineCapsule({
  name: 'CloudInfraFooter',
  description:
    'Terminal-industrial multi-column footer for a cloud-infrastructure / developer-platform SaaS landing page: a hairline-topped footer with a 5-column grid — square brand logo tile plus name, tagline, and square bordered mono social chips in the first columns; link groups under mono uppercase titles in the rest. A hairline bottom row pairs the copyright note with a mono status line and pulsing primary square; a faint giant brand watermark sits behind. Every button routes through section-kit route links. Use as the site footer for cloud hosting, IaaS, PaaS, serverless, or developer-tooling sites.',
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
          'grid place-items-center rounded-none bg-foreground text-background',
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
      <SiteFooter
        className={cn(
          'relative overflow-hidden bg-background',
          props.className,
        )}
      >
        <Watermark className="-bottom-4 right-0 font-mono text-[3.5rem] text-foreground/[0.03] sm:text-[6rem]">
          {brand}
        </Watermark>
        <FooterContent className="relative">
          <FooterGrid className="md:grid-cols-5">
            <FooterBrand
              brand={brand}
              brandMark={<LogoMark className="size-7" />}
              brandClassName="font-mono text-base font-bold tracking-tight"
              className="md:col-span-2"
            >
              <FooterTagline className="max-w-xs text-sm leading-relaxed">
                {tagline}
              </FooterTagline>
              <FooterSocial className="mt-5 gap-2">
                {socials
                  .map((s) => ({ label: s }))
                  .map((s) => (
                    <FooterSocialLink
                      key={s.label}
                      className="border border-border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground active:translate-y-px"
                    >
                      {s.label}
                    </FooterSocialLink>
                  ))}
              </FooterSocial>
            </FooterBrand>
            {groups.map((col) => (
              <FooterColumn key={col.title}>
                <FooterColumnTitle className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {col.title}
                </FooterColumnTitle>
                <FooterColumnList className="mt-4 flex flex-col items-start gap-2.5">
                  {col.links.map((link) => (
                    <FooterLink
                      key={link}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground active:translate-y-px"
                    >
                      {link}
                    </FooterLink>
                  ))}
                </FooterColumnList>
              </FooterColumn>
            ))}
          </FooterGrid>
          <FooterBottom className="mt-10 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            <FooterCopyright className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
              {note}
            </FooterCopyright>
            <p
              aria-hidden="true"
              className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground/70"
            >
              <span className="size-1.5 animate-pulse bg-primary" />[ status ]
              all systems operational
            </p>
          </FooterBottom>
        </FooterContent>
      </SiteFooter>
    )
  },
})
