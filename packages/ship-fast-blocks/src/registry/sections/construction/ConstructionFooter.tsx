import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * ConstructionFooter — industrial-brutalist inverted site footer for a
 * construction / general contractor page. A foreground-inversion band opened
 * by a token-built hazard stripe, with a giant ghost brand watermark and an
 * asymmetric 5/2/2/3 column grid: square brand tile + extrabold uppercase
 * wordmark + blurb + square mono social chips on the left, mono-titled
 * services and company link columns in the middle, and a mono contact ledger
 * (address, phone, email) on the right. Every link and social chip routes
 * through section-kit route links. A hairline bottom bar carries the mono
 * copyright and legal links. Use as the closing site footer for construction
 * firms, contractors, builders, or trades businesses. Renders fully with no
 * props via baked-in defaults.
 */
import { Logo as BrandLogo, LogoImage, LogoLabel } from '#/section-kit/Logo.tsx'
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
export const ConstructionFooter = defineCapsule({
  name: 'ConstructionFooter',
  description:
    'Industrial-brutalist inverted site footer for a construction / general contractor page: a foreground-inversion band opened by a token-built hazard stripe, with a giant ghost brand watermark and an asymmetric column grid — square brand tile + extrabold uppercase wordmark + blurb + square mono social chips on the left, mono-titled services and company link columns in the middle, and a mono contact ledger (address, phone, email) on the right. Every link and social chip routes through section-kit route links. A hairline bottom bar carries the mono copyright and legal links. Use as the closing site footer for construction firms, contractors, builders, or trades businesses.',
  props: z.object({
    /** Brand / company name shown beside the logo tile. */
    brand: z.string().optional(),
    /** Blurb paragraph under the brand name. */
    about: z.string().optional(),
    /** Services column title. */
    servicesTitle: z.string().optional(),
    /** Services link labels. */
    servicesLinks: z.array(z.string()).optional(),
    /** Company column title. */
    companyTitle: z.string().optional(),
    /** Company link labels. */
    companyLinks: z.array(z.string()).optional(),
    /** Contact column title. */
    contactTitle: z.string().optional(),
    /** Street address. */
    address: z.string().optional(),
    /** Phone number. */
    phone: z.string().optional(),
    /** Email address. */
    email: z.string().optional(),
    /** Social link labels (first letter shown as a button). */
    socials: z.array(z.string()).optional(),
    /** Legal link labels in the bottom bar. */
    legal: z.array(z.string()).optional(),
    /** Copyright note appended after the year. */
    note: z.string().optional(),
    /** Navigation target for the brand button. */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'BuiltRight'
    const about =
      props.about ??
      'Building excellence since 1987. Commercial and residential construction across the Pacific Northwest.'
    const servicesTitle = props.servicesTitle ?? 'Services'
    const servicesLinks = props.servicesLinks?.length
      ? props.servicesLinks
      : [
          'Commercial Construction',
          'Residential Building',
          'Renovation & Remodeling',
          'Project Management',
        ]
    const companyTitle = props.companyTitle ?? 'Company'
    const companyLinks = props.companyLinks?.length
      ? props.companyLinks
      : ['About', 'Projects', 'Reviews', 'Contact']
    const contactTitle = props.contactTitle ?? 'Contact'
    const address = props.address ?? '4215 Industrial Way S, Seattle, WA 98108'
    const phone = props.phone ?? '(555) 123-4567'
    const email = props.email ?? 'hello@builtright.com'
    const socials = props.socials?.length
      ? props.socials
      : ['LinkedIn', 'Instagram', 'Facebook']
    const legal = props.legal?.length
      ? props.legal
      : ['Privacy Policy', 'Terms of Service', 'Licenses']
    const note = props.note ?? 'All rights reserved.'
    const homeTarget = props.homeTarget
    const LogoMark = ({
      className,
      tone = 'primary',
    }: {
      className?: string
      tone?: string
    }) => (
      <span
        className={cn(
          'grid place-items-center rounded-none',
          tone === 'primary'
            ? 'bg-primary text-primary-foreground'
            : 'bg-background text-foreground',
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
          <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5m-4 0h4" />
        </svg>
      </span>
    )
    const columnTitleCls =
      'font-mono text-[11px] uppercase tracking-[0.2em] text-background/50'
    const linkCls =
      'text-sm text-background/60 transition-colors hover:text-background'
    const brandBlock = (
      <BrandLogo brand={brand} className="flex items-center gap-2">
        <LogoImage
          className="size-7"
          fallback={<LogoMark className="size-7" />}
        />
        <LogoLabel className="text-lg font-extrabold uppercase tracking-tight text-background" />
      </BrandLogo>
    )
    return (
      <SiteFooter
        className={cn(
          'relative overflow-hidden border-t-0 bg-foreground text-background',
          props.className,
        )}
      >
        {/* Token-built hazard stripe opening the footer band. */}
        <div
          aria-hidden="true"
          className="h-2.5 bg-[repeating-linear-gradient(-45deg,currentColor_0,currentColor_10px,transparent_10px,transparent_20px)] text-primary"
        />
        <Watermark className="-bottom-6 right-0 text-[clamp(5rem,16vw,13rem)] uppercase text-background/[0.04]">
          {brand}
        </Watermark>
        <FooterContent className="relative py-14 lg:py-16">
          <FooterGrid className="gap-10 md:grid-cols-2 lg:grid-cols-12">
            <FooterColumn className="md:col-span-2 lg:col-span-5">
              {homeTarget ? (
                <NavbarRouteLink href={homeTarget} className="inline-flex">
                  {brandBlock}
                </NavbarRouteLink>
              ) : (
                brandBlock
              )}
              <FooterTagline className="max-w-sm text-background/60">
                {about}
              </FooterTagline>
              <FooterSocial>
                {socials.map((s) => (
                  <FooterSocialLink key={s} asChild>
                    <NavbarRouteLink
                      href={s}
                      className="inline-flex items-center border border-background/25 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-background/70 transition-all duration-100 hover:border-background hover:text-background active:translate-y-px"
                    >
                      {s}
                    </NavbarRouteLink>
                  </FooterSocialLink>
                ))}
              </FooterSocial>
            </FooterColumn>
            <FooterColumn className="lg:col-span-2">
              <FooterColumnTitle className={columnTitleCls}>
                {servicesTitle}
              </FooterColumnTitle>
              <FooterColumnList className="mt-4 space-y-2.5">
                {servicesLinks.map((l) => (
                  <li key={l}>
                    <FooterLink className={linkCls}>{l}</FooterLink>
                  </li>
                ))}
              </FooterColumnList>
            </FooterColumn>
            <FooterColumn className="lg:col-span-2">
              <FooterColumnTitle className={columnTitleCls}>
                {companyTitle}
              </FooterColumnTitle>
              <FooterColumnList className="mt-4 space-y-2.5">
                {companyLinks.map((l) => (
                  <li key={l}>
                    <FooterLink className={linkCls}>{l}</FooterLink>
                  </li>
                ))}
              </FooterColumnList>
            </FooterColumn>
            <FooterColumn className="lg:col-span-3">
              <FooterColumnTitle className={columnTitleCls}>
                {contactTitle}
              </FooterColumnTitle>
              <FooterColumnList className="mt-4 space-y-0 border-l border-background/20">
                <li className="border-b border-background/15 py-2.5 pl-4 text-sm text-background/60">
                  {address}
                </li>
                <li className="border-b border-background/15 py-2.5 pl-4">
                  <a
                    href={`tel:${phone.replace(/[^\d+]/g, '')}`}
                    className="font-mono text-sm tabular-nums text-background/60 transition-colors hover:text-background"
                  >
                    {phone}
                  </a>
                </li>
                <li className="py-2.5 pl-4">
                  <a
                    href={`mailto:${email}`}
                    className="font-mono text-sm text-background/60 transition-colors hover:text-background"
                  >
                    {email}
                  </a>
                </li>
              </FooterColumnList>
            </FooterColumn>
          </FooterGrid>
          <FooterBottom className="border-background/20">
            <FooterCopyright className="font-mono text-[11px] uppercase tracking-[0.1em] text-background/50">
              © {new Date().getFullYear()} {brand}. {note}
            </FooterCopyright>
            <FooterLegal>
              {legal.map((l) => (
                <FooterLink
                  key={l}
                  className="font-mono text-[11px] uppercase tracking-[0.1em] text-background/50 transition-colors hover:text-background"
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
