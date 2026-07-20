import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
/**
 * HealthcareFooter — calm Swiss-clinical hairline ledger footer for a
 * medical-clinic page. A border-topped band on a soft muted wash with an
 * asymmetric 12-col grid: a wide brand block (square primary heart-glyph logo
 * tile linking home + clinic name + tagline + square mono social chips), a
 * Services links column, a Company links column, and a Contact column with
 * address / click-to-call phone / email rows — closed by a hairline
 * auto-updating copyright + legal bar. Column titles are mono uppercase
 * micro-labels and every link, social, phone, and email routes through
 * section-kit route links. Use as the closing site footer for doctors' offices,
 * primary-care practices, telehealth or urgent-care clinics, hospitals or
 * medical groups. Renders fully with no props via baked-in clinic defaults.
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
  FooterLegal,
} from '#/section-kit/SiteFooter.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
export const HealthcareFooter = defineCapsule({
  name: 'HealthcareFooter',
  description:
    "Calm Swiss-clinical hairline ledger footer for a medical-clinic page: a border-topped band on a soft muted wash with an asymmetric grid holding a wide brand block (square primary heart-glyph logo tile linking home + clinic name + tagline + square mono social chips), a Services links column, a Company links column, and a Contact column with address / click-to-call phone / email rows, closed by a hairline auto-updating copyright + legal bar. Column titles are mono uppercase micro-labels; every link, social, phone, and email routes through section-kit route links. Use as the closing site footer for doctors' offices, primary-care practices, telehealth or urgent-care clinics, hospitals or medical groups.",
  props: z.object({
    /** Clinic / practice name shown beside the brand mark. */
    brand: z.string().optional(),
    /** Navigation target for the brand button. */
    homeTarget: z.string().optional(),
    /** Tagline paragraph under the brand. */
    tagline: z.string().optional(),
    /** Social link labels (first letter shown in each tile). */
    socials: z.array(z.string()).optional(),
    /** Services column heading. */
    servicesHeading: z.string().optional(),
    /** Services column link labels. */
    servicesLinks: z.array(z.string()).optional(),
    /** Company column heading. */
    companyHeading: z.string().optional(),
    /** Company column link labels. */
    companyLinks: z.array(z.string()).optional(),
    /** Contact column heading. */
    contactHeading: z.string().optional(),
    /** Contact address line. */
    address: z.string().optional(),
    /** Contact phone number. */
    phone: z.string().optional(),
    /** Contact email address. */
    email: z.string().optional(),
    /** Copyright line (auto-built from brand + year if omitted). */
    copyright: z.string().optional(),
    /** Legal / utility link labels in the bottom row. */
    legalLinks: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Vitality Health Partners'
    const homeTarget = props.homeTarget ?? 'Home'
    const tagline =
      props.tagline ??
      'Modern primary care and wellness services for the whole family. Serving San Francisco since 2015.'
    const socials = props.socials?.length
      ? props.socials
      : ['Facebook', 'Instagram', 'LinkedIn']
    const servicesHeading = props.servicesHeading ?? 'Services'
    const servicesLinks = props.servicesLinks?.length
      ? props.servicesLinks
      : [
          'Primary Care',
          'Virtual Visits',
          "Women's Health",
          'Pediatrics',
          'Lab & Diagnostics',
        ]
    const companyHeading = props.companyHeading ?? 'Company'
    const companyLinks = props.companyLinks?.length
      ? props.companyLinks
      : ['About Us', 'Our Team', 'Careers', 'Patient Portal', 'Contact']
    const contactHeading = props.contactHeading ?? 'Contact'
    const address = props.address ?? '1420 Market St, San Francisco, CA 94102'
    const phone = props.phone ?? '(415) 555-1234'
    const email = props.email ?? 'hello@vitalityhealth.com'
    const copyright =
      props.copyright ??
      `© ${new Date().getFullYear()} ${brand}. All rights reserved.`
    const legalLinks = props.legalLinks?.length
      ? props.legalLinks
      : ['Privacy Policy', 'Terms of Service', 'Accessibility']
    const HeartMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          'grid size-7 place-items-center rounded-none bg-primary text-primary-foreground',
          className,
        )}
        aria-hidden="true"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </span>
    )
    return (
      <SiteFooter className={props.className}>
        <FooterContent className="py-14 sm:py-16">
          <FooterGrid className="gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-12">
            <FooterBrand
              brand={brand}
              brandMark={
                <NavbarRouteLink
                  aria-label={brand}
                  href={homeTarget}
                  className="inline-flex active:translate-y-px"
                >
                  <HeartMark />
                </NavbarRouteLink>
              }
              brandClassName="text-lg font-bold tracking-tight"
              className="md:col-span-2 lg:col-span-4"
            >
              <FooterTagline className="mt-3 max-w-xs leading-relaxed">
                {tagline}
              </FooterTagline>
              <FooterSocial className="mt-5 gap-2">
                {socials
                  .map((s) => ({ label: s }))
                  .map((s) => (
                    <FooterSocialLink
                      key={s.label}
                      asChild
                      className="border border-border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground active:translate-y-px"
                    >
                      <NavbarRouteLink href={s.label}>
                        {s.label}
                      </NavbarRouteLink>
                    </FooterSocialLink>
                  ))}
              </FooterSocial>
            </FooterBrand>
            <FooterColumn className="lg:col-span-3">
              <FooterColumnTitle className="font-mono text-[11px] font-normal uppercase tracking-[0.2em] text-muted-foreground">
                {servicesHeading}
              </FooterColumnTitle>
              <FooterColumnList className="mt-4 space-y-2.5">
                {servicesLinks.map((link) => (
                  <li key={link}>
                    <FooterLink className="block w-fit text-foreground/80 hover:text-foreground">
                      {link}
                    </FooterLink>
                  </li>
                ))}
              </FooterColumnList>
            </FooterColumn>
            <FooterColumn className="lg:col-span-2">
              <FooterColumnTitle className="font-mono text-[11px] font-normal uppercase tracking-[0.2em] text-muted-foreground">
                {companyHeading}
              </FooterColumnTitle>
              <FooterColumnList className="mt-4 space-y-2.5">
                {companyLinks.map((link) => (
                  <li key={link}>
                    <FooterLink className="block w-fit text-foreground/80 hover:text-foreground">
                      {link}
                    </FooterLink>
                  </li>
                ))}
              </FooterColumnList>
            </FooterColumn>
            <FooterColumn className="lg:col-span-3">
              <FooterColumnTitle className="font-mono text-[11px] font-normal uppercase tracking-[0.2em] text-muted-foreground">
                {contactHeading}
              </FooterColumnTitle>
              <FooterColumnList className="mt-4 space-y-2.5">
                <li className="text-sm leading-relaxed text-muted-foreground">
                  {address}
                </li>
                <li>
                  <FooterLink
                    href={`Call ${phone}`}
                    className="block w-fit text-foreground/80 tabular-nums hover:text-foreground"
                  >
                    {phone}
                  </FooterLink>
                </li>
                <li>
                  <FooterLink
                    href={`Email ${email}`}
                    className="block w-fit break-all text-foreground/80 hover:text-foreground"
                  >
                    {email}
                  </FooterLink>
                </li>
              </FooterColumnList>
            </FooterColumn>
          </FooterGrid>
          <FooterBottom className="mt-14">
            <FooterCopyright className="font-mono text-[11px] uppercase tracking-[0.15em]">
              {copyright}
            </FooterCopyright>
            <FooterLegal className="gap-x-6 gap-y-2">
              {legalLinks.map((l) => (
                <FooterLink
                  key={l}
                  className="block w-fit text-xs text-muted-foreground hover:text-foreground"
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
