import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * CorporateFooter — Swiss-corporate fat footer for an enterprise / corporate
 * B2B site. A double-rule-topped section on the page surface with a giant
 * ghost brand watermark along its bottom edge and an asymmetric 12-column
 * grid: a clickable square-tile brand block + about paragraph + hairline
 * square social icon chips (built from each social's SVG path) spanning five
 * columns, followed by three link columns whose titles carry mono index
 * numerals, and a hairline-topped mono copyright / legal bar. Every brand
 * button, link, and social icon routes through section-kit route links. Use
 * as the closing site footer for enterprise software vendors, SaaS platforms,
 * consultancies, or any corporate site with extensive navigation.
 */
import {
  SiteFooter,
  FooterContent,
  FooterGrid,
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
import { Logo as BrandLogo, LogoImage, LogoLabel } from '#/section-kit/Logo.tsx'
import { Watermark } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
export const CorporateFooter = defineCapsule({
  name: 'CorporateFooter',
  description:
    'Swiss-corporate fat footer for an enterprise / corporate B2B site: a double-rule-topped section with a giant ghost brand watermark along the bottom edge and an asymmetric 12-column grid — clickable square-tile brand block + about paragraph + hairline square social icon chips (SVG-path driven) spanning five columns, three link columns with mono-indexed titles, and a hairline-topped mono copyright/legal bar. Every brand button, link, and social icon routes through section-kit route links. Use as the closing site footer for enterprise software, SaaS, consultancies, or any corporate site.',
  props: z.object({
    /** Brand / company name shown in the footer. */
    brand: z.string().optional(),
    /** Navigation target for the brand logo button (e.g. nav[0]). */
    homeTarget: z.string().optional(),
    /** About paragraph under the brand. */
    about: z.string().optional(),
    /** Social icon links: label + SVG path. */
    socials: z
      .array(
        z.object({
          label: z.string(),
          path: z.string(),
        }),
      )
      .optional(),
    /** Footer link columns: title + array of labels. */
    columns: z
      .array(
        z.object({
          title: z.string(),
          links: z.array(z.string()),
        }),
      )
      .optional(),
    /** Full copyright line. */
    copyright: z.string().optional(),
    /** Legal link labels. */
    legal: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Nexus'
    const about =
      props.about ??
      'Nexus Enterprise Solutions delivers mission-critical cloud infrastructure and digital transformation services to organizations worldwide.'
    const socials = props.socials?.length
      ? props.socials
      : [
          {
            label: 'LinkedIn',
            path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
          },
          {
            label: 'Twitter',
            path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
          },
          {
            label: 'YouTube',
            path: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
          },
        ]
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Solutions',
            links: [
              'Cloud Infrastructure',
              'Security',
              'Data Analytics',
              'Digital Transformation',
              'Managed Services',
            ],
          },
          {
            title: 'Company',
            links: [
              'About Us',
              'Careers',
              'Press',
              'Partners',
              'Investor Relations',
            ],
          },
          {
            title: 'Resources',
            links: [
              'Documentation',
              'API Reference',
              'Case Studies',
              'Blog',
              'Contact',
            ],
          },
        ]
    const copyright =
      props.copyright ??
      '© 2026 Nexus Enterprise Solutions, Inc. All rights reserved.'
    const legal = props.legal?.length
      ? props.legal
      : ['Privacy Policy', 'Terms of Service', 'Cookie Policy']
    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          'grid place-items-center rounded-none bg-foreground font-bold text-background',
          className,
        )}
        aria-hidden="true"
      >
        {brand.charAt(0).toUpperCase()}
      </span>
    )
    return (
      <SiteFooter
        className={cn(
          'relative overflow-hidden border-t-2 border-foreground bg-background',
          props.className,
        )}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-1 block border-t border-border"
        />
        <Watermark className="-bottom-8 left-0 text-[7rem] text-foreground/[0.03] sm:text-[11rem]">
          {brand}
        </Watermark>
        <FooterContent className="relative py-14 lg:py-16">
          <FooterGrid className="gap-10 md:grid-cols-2 lg:grid-cols-12">
            <div className="md:col-span-2 lg:col-span-5 lg:pr-10">
              <NavbarRouteLink
                href={props.homeTarget ?? brand}
                className="inline-flex items-center gap-2"
              >
                <BrandLogo brand={brand} className="flex items-center gap-2">
                  <LogoImage
                    className="size-7 rounded-none"
                    fallback={<LogoMark className="size-7 text-sm" />}
                  />
                  <LogoLabel className="text-lg font-semibold tracking-tight text-foreground" />
                </BrandLogo>
              </NavbarRouteLink>
              <FooterTagline className="mt-4 max-w-sm leading-relaxed">
                {about}
              </FooterTagline>
              <FooterSocial className="mt-6 gap-0 border-l border-border">
                {socials
                  .map((s) => ({ label: s.label, path: s.path }))
                  .map((s) => (
                    <FooterSocialLink key={s.label} asChild>
                      <NavbarRouteLink
                        href={s.label}
                        className="grid size-10 place-items-center border-b border-r border-t border-border text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground active:translate-y-px"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d={s.path} />
                        </svg>
                        <span className="sr-only">{s.label}</span>
                      </NavbarRouteLink>
                    </FooterSocialLink>
                  ))}
              </FooterSocial>
            </div>
            {columns.map((col, i) => (
              <FooterColumn
                key={col.title}
                className={cn('lg:col-span-2', i === 0 && 'lg:col-start-7')}
              >
                <FooterColumnTitle className="flex items-baseline gap-2 border-b border-border pb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  <span
                    aria-hidden="true"
                    className="tabular-nums text-primary"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {col.title}
                </FooterColumnTitle>
                <FooterColumnList className="mt-4 space-y-2.5">
                  {col.links.map((link) => (
                    <FooterLink
                      key={link}
                      className="block w-fit transition-colors duration-150"
                    >
                      {link}
                    </FooterLink>
                  ))}
                </FooterColumnList>
              </FooterColumn>
            ))}
          </FooterGrid>
          <FooterBottom className="mt-14 gap-4 pt-5">
            <FooterCopyright className="font-mono text-[11px] uppercase tracking-[0.14em]">
              {copyright}
            </FooterCopyright>
            <FooterLegal className="gap-5">
              {legal.map((l) => (
                <FooterLink
                  key={l}
                  className="font-mono text-[11px] uppercase tracking-[0.14em]"
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
