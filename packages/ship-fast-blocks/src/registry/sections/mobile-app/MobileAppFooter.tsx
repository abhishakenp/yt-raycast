import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * MobileAppFooter — a kinetic ledger footer for a consumer mobile-app marketing
 * page. A hairline-topped band with a giant ghost brand watermark bleeding off
 * the bottom edge: an asymmetric 12-column grid pairs a wide brand block
 * (check-in-circle logo mark + app name, a tagline, and square mono social chips
 * with hard hover borders — Twitter / Instagram / LinkedIn) with mono-labeled
 * link columns; below, a hairline-divided bottom bar carries the auto-updating
 * copyright note, an optional mono "made in" line and a decorative "[ EOF ]"
 * tag. The brand mark, social chips and every link route through section-kit
 * route links. Use as the closing footer for a habit tracker, fitness / wellness
 * app, productivity or to-do app, or any consumer app landing page. Renders
 * fully with no props via baked-in "DailyFlow" defaults.
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
} from '#/section-kit/SiteFooter.tsx'
export const MobileAppFooter = defineCapsule({
  name: 'MobileAppFooter',
  description:
    'Kinetic ledger footer for a consumer mobile-app marketing page: a hairline-topped band with a giant ghost brand watermark, an asymmetric 12-column grid pairing a wide brand block (check-in-circle logo mark + app name, tagline, square mono social chips) with mono-labeled link columns, and a hairline-divided bottom bar with auto-updating copyright, an optional mono made-in line and an [ EOF ] tag; the brand mark, social chips and every link route through section-kit route links. Use as the closing footer for a habit tracker, fitness / wellness app, productivity or to-do app, or any consumer app landing page.',
  props: z.object({
    /** Brand / app name shown beside the logo mark. */
    brand: z.string().optional(),
    /** Route the brand/logo returns to (usually the homepage). */
    homeTarget: z.string().optional(),
    tagline: z.string().optional(),
    /** Social icon labels (each must be Twitter, Instagram, or LinkedIn). */
    socials: z.array(z.string()).optional(),
    columns: z
      .array(
        z.object({
          title: z.string(),
          links: z.array(z.string()),
        }),
      )
      .optional(),
    note: z.string().optional(),
    madeIn: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'DailyFlow'
    const tagline =
      props.tagline ??
      'Building better habits, one day at a time. Join 50,000+ habit builders worldwide.'
    const socials = props.socials?.length
      ? props.socials
      : ['Twitter', 'Instagram', 'LinkedIn']
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Product',
            links: ['Features', 'Pricing', 'Changelog', 'Roadmap'],
          },
          {
            title: 'Company',
            links: ['About', 'Blog', 'Careers', 'Press'],
          },
          {
            title: 'Support',
            links: ['Help Center', 'Contact', 'Privacy', 'Terms'],
          },
        ]
    const note =
      props.note ??
      `© ${new Date().getFullYear()} ${brand}, Inc. All rights reserved.`
    const LogoMark = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 32 32"
        fill="none"
        className={cn('text-foreground', className)}
        aria-hidden="true"
      >
        <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2" />
        <path
          d="M10 16L14 20L22 12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
    return (
      <SiteFooter
        className={cn(
          'relative overflow-hidden border-t border-border bg-background',
          props.className,
        )}
      >
        {/* Giant ghost brand watermark bleeding off the bottom edge. */}
        <Watermark className="-bottom-6 -right-2 text-[5rem] sm:text-[9rem] lg:text-[12rem]">
          {brand}
        </Watermark>
        <Container className="relative py-14 lg:py-16">
          <FooterGrid className="grid gap-10 md:grid-cols-12 lg:gap-8">
            <FooterBrand
              brand={brand}
              brandMark={<LogoMark />}
              className="md:col-span-5 lg:col-span-6"
            >
              <FooterTagline className="max-w-sm">{tagline}</FooterTagline>
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
              {note}
            </FooterCopyright>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {props.madeIn ? (
                <MonoTag tone="faint">{props.madeIn}</MonoTag>
              ) : null}
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
