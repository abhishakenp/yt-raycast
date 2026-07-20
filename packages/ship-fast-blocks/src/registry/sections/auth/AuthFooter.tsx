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
  FooterLegal,
} from '#/section-kit/SiteFooter.tsx'

/**
 * AuthFooter — closing footer for Authly, a developer authentication product.
 * Thin configuration over the shared `SiteFooter` composite: the keyhole mark
 * set in a filled primary tile beside a sharp sans wordmark, a
 * developer-focused tagline, a social row rendered as pill chips (GitHub, X,
 * Discord), and a responsive grid of link columns whose mono uppercase titles
 * carry a primary tick. The bottom bar pairs the copyright note with an
 * "all systems operational" status pulse and legal links. Use as the site-wide
 * footer for auth platforms, identity APIs, login SDKs, or developer SaaS.
 * Renders fully with no props.
 */
function KeyholeMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2a7 7 0 0 0-7 7c0 2.9 1.76 5.39 4.27 6.46L8 22h8l-1.27-6.54A7 7 0 0 0 12 2Z" />
      <circle cx="12" cy="9" r="2.2" />
    </svg>
  )
}

export const AuthFooter = defineCapsule({
  name: 'AuthFooter',
  description:
    "Closing footer for a developer-auth product built on the shared SiteFooter composite: a keyhole brand tile + sharp wordmark, a developer-focused tagline, a social pill row (GitHub, X, Discord), and a responsive grid of link columns with mono uppercase titles (Product, Developers, Company, Legal); the bottom bar pairs the copyright note with an 'all systems operational' status pulse and legal links. Use as the site-wide footer for auth platforms, identity APIs, login SDKs, or developer SaaS landing pages.",
  props: z.object({
    /** Product / brand name shown as the wordmark. */
    brand: z.string().optional(),
    /** Short tagline below the wordmark. */
    tagline: z.string().optional(),
    /** Social channels rendered as a link row under the brand. */
    social: z
      .array(z.object({ label: z.string(), href: z.string().optional() }))
      .optional(),
    /** Link columns (Product, Developers, Company, Legal, …). */
    columns: z
      .array(z.object({ title: z.string(), links: z.array(z.string()) }))
      .optional(),
    /** Copyright note appended after the brand + year. */
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const social = props.social?.length
      ? props.social
      : [{ label: 'GitHub' }, { label: 'X' }, { label: 'Discord' }]
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Product',
            links: ['Features', 'Pricing', 'Customers', 'Changelog', 'Status'],
          },
          {
            title: 'Developers',
            links: ['Docs', 'API Reference', 'SDKs', 'Quickstart', 'Examples'],
          },
          {
            title: 'Company',
            links: ['About', 'Blog', 'Careers', 'Security', 'Contact'],
          },
          {
            title: 'Legal',
            links: ['Privacy', 'Terms', 'DPA', 'Compliance'],
          },
        ]

    return (
      <SiteFooter
        className={cn(
          'border-t border-border bg-muted/20 text-foreground',
          props.className,
        )}
      >
        <FooterContent className="px-5 py-14 sm:px-6 lg:px-8">
          <FooterGrid className="grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-2 sm:gap-10 lg:grid-cols-[1.4fr_repeat(4,minmax(0,1fr))]">
            <FooterBrand
              brand={props.brand ?? 'Authly'}
              brandMark={
                <span className="inline-grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm shadow-primary/30">
                  <KeyholeMark className="size-4.5" />
                </span>
              }
              brandClassName={'text-xl font-semibold tracking-tight'}
              className="col-span-2 min-w-0 sm:col-span-2 lg:col-span-1"
            >
              <FooterTagline className="max-w-sm text-pretty leading-6">
                {props.tagline ??
                  'Authentication for developers — secure sign-in, SSO, and MFA behind a clean API.'}
              </FooterTagline>
              <FooterSocial className="gap-2">
                {social.map((s) => (
                  <FooterSocialLink
                    key={s.label}
                    href={s.href ?? '#'}
                    aria-label={s.label}
                    className="rounded-full border border-border bg-background px-3.5 py-2 font-mono text-xs font-medium transition-colors hover:border-primary/40 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {s.label}
                  </FooterSocialLink>
                ))}
              </FooterSocial>
            </FooterBrand>
            {columns.map((col) => (
              <FooterColumn key={col.title} className="min-w-0">
                <FooterColumnTitle className="flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground">
                  <span
                    aria-hidden="true"
                    className="h-px w-4 shrink-0 bg-primary"
                  />
                  {col.title}
                </FooterColumnTitle>
                <FooterColumnList className="mt-3 space-y-2.5 sm:mt-4 sm:space-y-3">
                  {col.links.map((link) => (
                    <li key={link}>
                      <FooterLink className="text-sm font-medium text-foreground/75 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                        {link}
                      </FooterLink>
                    </li>
                  ))}
                </FooterColumnList>
              </FooterColumn>
            ))}
          </FooterGrid>
          <FooterBottom className="mt-12 border-t border-dashed border-border pt-6">
            <FooterCopyright className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              <span
                aria-hidden="true"
                className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground"
              >
                end of file
              </span>
              <span
                aria-hidden="true"
                className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground"
              >
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60 motion-reduce:animate-none" />
                  <span className="relative inline-flex size-2 rounded-full bg-primary" />
                </span>
                all systems operational
              </span>
              {props.note ?? 'All rights reserved.'}
            </FooterCopyright>
            <FooterLegal>
              {['Privacy', 'Terms', 'Security'].map((link) => (
                <FooterLink
                  key={link}
                  className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {link}
                </FooterLink>
              ))}
            </FooterLegal>
          </FooterBottom>
        </FooterContent>
      </SiteFooter>
    )
  },
})
