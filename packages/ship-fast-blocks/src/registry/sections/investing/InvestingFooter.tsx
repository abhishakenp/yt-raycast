import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Logo, LogoImage, LogoLabel } from '#/section-kit/Logo.tsx'
import { Watermark } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
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

/**
 * InvestingFooter — Swiss-fintech multi-column site footer for an investing /
 * brokerage site. A muted, hairline-topped footer with financial-broadsheet
 * discipline: a square trend-line brand glyph tile + wordmark routed to the home
 * target, a tagline, a row of mono social labels, a giant ghost brand watermark
 * bleeding behind the columns, and mono index-numbered Product / Company /
 * Resources / Legal columns whose links sit as block w-fit rows. A hairline
 * bottom bar carries an auto-updating copyright line and a mono FINRA/SIPC-style
 * legal disclosure. The brand link and every column link route through route
 * links. Use as the closing site footer for a brokerage, trading app,
 * robo-advisor or crypto exchange. Renders fully with no props via baked-in
 * "Vestora" defaults.
 */
export const InvestingFooter = defineCapsule({
  name: 'InvestingFooter',
  description:
    'Swiss-fintech multi-column footer for an investing / brokerage site: a muted hairline-topped footer with a square trend-line brand glyph tile + wordmark routed to the home target, a tagline, a mono social row, a giant ghost brand watermark behind the columns, and mono index-numbered Product / Company / Resources / Legal columns with block w-fit routed link rows, above a hairline bottom bar with an auto-updating copyright line and a mono FINRA/SIPC-style legal disclosure. The brand link and every column link route through route links. Use as the closing site footer for a brokerage, trading app, robo-advisor or crypto exchange.',
  props: z.object({
    /** Brand / platform name shown beside the logo tile. */
    brand: z.string().optional(),
    /** Navigation target for the brand button. */
    homeTarget: z.string().optional(),
    /** Tagline beneath the brand. */
    tagline: z.string().optional(),
    /** Footer link columns. */
    columns: z
      .array(
        z.object({
          title: z.string(),
          links: z.array(z.string()),
        }),
      )
      .optional(),
    /** Copyright line (auto-built from brand + year if omitted). */
    copyright: z.string().optional(),
    /** Small legal disclosure line. */
    disclosure: z.string().optional(),
    /** Social link labels (rendered as initial buttons). */
    socials: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Vestora'
    const homeTarget = props.homeTarget ?? brand
    const tagline =
      props.tagline ??
      'Modern investing for everyone. Trade stocks, ETFs, options, and crypto with zero commission.'
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Product',
            links: ['Features', 'Pricing', 'Mobile App', 'API'],
          },
          {
            title: 'Company',
            links: ['About', 'Careers', 'Press', 'Blog'],
          },
          {
            title: 'Resources',
            links: [
              'Help Center',
              'Investing 101',
              'Market News',
              'Tax Center',
            ],
          },
          {
            title: 'Legal',
            links: ['Privacy', 'Terms', 'Disclosures', 'FINRA'],
          },
        ]
    const copyright =
      props.copyright ??
      `© ${new Date().getFullYear()} ${brand} Inc. All rights reserved.`
    const disclosure =
      props.disclosure ??
      'Securities products are not FDIC insured, are not bank guaranteed, and may lose value. Brokerage services provided to self-directed investors. Member FINRA / SIPC.'
    const socials = props.socials?.length
      ? props.socials
      : ['Twitter', 'LinkedIn', 'Instagram']
    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          'grid place-items-center rounded-none bg-primary text-primary-foreground',
          className,
        )}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-[62%]"
        >
          <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      </span>
    )
    return (
      <SiteFooter className={props.className}>
        <FooterContent className="relative overflow-hidden">
          <Watermark className="-bottom-10 -left-2 text-[9rem] leading-none sm:text-[13rem]">
            {brand}
          </Watermark>
          <FooterGrid className="relative gap-10 md:grid-cols-[1.4fr_repeat(4,1fr)]">
            <div className="md:col-span-1">
              <NavbarRouteLink
                href={homeTarget}
                className="inline-flex w-fit items-center gap-2"
              >
                <Logo brand={brand}>
                  <LogoImage
                    className="size-7"
                    fallback={<LogoMark className="size-7" />}
                  />
                  <LogoLabel className="text-lg font-semibold tracking-tight text-foreground" />
                </Logo>
              </NavbarRouteLink>
              <FooterTagline className="max-w-xs">{tagline}</FooterTagline>
              <FooterSocial className="mt-5 gap-4">
                {socials
                  .map((s) => ({ label: s }))
                  .map((s) => (
                    <FooterSocialLink
                      key={s.label}
                      className="font-mono text-[11px] uppercase tracking-[0.2em]"
                    >
                      {s.label}
                    </FooterSocialLink>
                  ))}
              </FooterSocial>
            </div>
            {columns.map((col, ci) => (
              <FooterColumn key={col.title}>
                <FooterColumnTitle className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  <span
                    aria-hidden="true"
                    className="tabular-nums text-primary"
                  >
                    {String(ci + 1).padStart(2, '0')}
                  </span>
                  {col.title}
                </FooterColumnTitle>
                <FooterColumnList className="mt-4 space-y-2.5">
                  {col.links.map((link) => (
                    <FooterLink
                      key={link}
                      className="block w-fit text-[13px] tracking-tight"
                    >
                      {link}
                    </FooterLink>
                  ))}
                </FooterColumnList>
              </FooterColumn>
            ))}
          </FooterGrid>
          <FooterBottom className="relative mt-14 flex-col items-start gap-4 border-border sm:flex-row sm:items-center">
            <FooterCopyright className="font-mono text-[11px] uppercase tracking-[0.16em]">
              {copyright}
            </FooterCopyright>
            <FooterLegal className="max-w-2xl">
              <p className="text-[11px] leading-relaxed text-muted-foreground/70">
                {disclosure}
              </p>
            </FooterLegal>
          </FooterBottom>
        </FooterContent>
      </SiteFooter>
    )
  },
})
