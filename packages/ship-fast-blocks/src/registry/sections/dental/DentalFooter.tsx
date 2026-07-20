import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * DentalFooter — hairline 4-column ledger footer for a dental practice site.
 * A calm border-topped band on a soft muted wash with an asymmetric 12-col
 * grid: a wide brand block (square primary tooth-glyph logo tile linking home
 * + practice name + mono tagline + square mono social chips), a services link
 * column, an office-hours column rendered as a hairline day / time ledger with
 * tabular times, and a contact column with address, click-to-call phone, and
 * email — closed by a hairline copyright + legal bar. Column titles are mono
 * uppercase micro-labels and every link, social, phone, and email routes
 * through section-kit route links. Use as the closing footer for dentists,
 * dental offices, orthodontists, or clinics.
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
import { MonoTag } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'
export const DentalFooter = defineCapsule({
  name: 'DentalFooter',
  description:
    'Hairline 4-column ledger footer for a dental practice site: a calm border-topped band on a soft muted wash with an asymmetric grid holding a wide brand block (square primary tooth-glyph logo tile linking home + practice name + mono tagline + square mono social chips), a services link column, an office-hours column rendered as a hairline day / time ledger with tabular times, and a contact column with address, click-to-call phone, and email, closed by a hairline copyright + legal bar. Column titles are mono uppercase micro-labels; every link, social, phone, and email routes through section-kit route links. Use as the closing footer for dentists, dental offices, orthodontists, or clinics.',
  props: z.object({
    /** Practice / brand name shown beside the logo tile. */
    brand: z.string().optional(),
    /** Small eyebrow line under the brand name. */
    brandTagline: z.string().optional(),
    /** Navigation target for the brand logo (typically the first nav item). */
    homeTarget: z.string().optional(),
    tagline: z.string().optional(),
    servicesHeading: z.string().optional(),
    serviceLinks: z.array(z.string()).optional(),
    hoursHeading: z.string().optional(),
    hours: z
      .array(
        z.object({
          day: z.string(),
          time: z.string(),
        }),
      )
      .optional(),
    contactHeading: z.string().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
    socials: z.array(z.string()).optional(),
    copyright: z.string().optional(),
    legal: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Bright Smile'
    const brandTagline = props.brandTagline ?? 'Dental Care'
    const homeTarget = props.homeTarget ?? 'Home'
    const footerTagline =
      props.tagline ??
      'Modern, compassionate dental care for the whole family. Your smile is our passion.'
    const servicesHeading = props.servicesHeading ?? 'Services'
    const serviceLinks = props.serviceLinks?.length
      ? props.serviceLinks
      : [
          'Preventive Care',
          'Cosmetic Dentistry',
          'Dental Implants',
          'Orthodontics',
          'Emergency Care',
        ]
    const hoursHeading = props.hoursHeading ?? 'Office Hours'
    const hours = props.hours?.length
      ? props.hours
      : [
          { day: 'Mon – Thu', time: '8:00 AM – 6:00 PM' },
          { day: 'Friday', time: '8:00 AM – 4:00 PM' },
          { day: 'Saturday', time: '9:00 AM – 2:00 PM' },
          { day: 'Sunday', time: 'Closed' },
        ]
    const contactHeading = props.contactHeading ?? 'Contact'
    const address = props.address ?? '2450 NW Lovejoy St, Portland, OR 97210'
    const phone = props.phone ?? '(503) 555-0142'
    const email = props.email ?? 'hello@brightsmile.dental'
    const footerSocials = props.socials?.length
      ? props.socials
      : ['Facebook', 'Instagram', 'Google']
    const footerCopyright =
      props.copyright ?? 'Bright Smile Dental. All rights reserved.'
    const footerLegal = props.legal?.length
      ? props.legal
      : ['Privacy Policy', 'Terms of Service', 'Accessibility']
    const ToothMark = () => (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M14.828 14.828a4 4 0 0 1-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
      </svg>
    )
    const LogoBadge = ({ className }: { className?: string }) => (
      <span
        className={cn(
          'grid size-7 place-items-center rounded-none bg-primary text-primary-foreground',
          className,
        )}
        aria-hidden="true"
      >
        <ToothMark />
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
                  <LogoBadge />
                </NavbarRouteLink>
              }
              brandClassName="text-lg font-bold tracking-tight"
              className="md:col-span-2 lg:col-span-4"
            >
              <MonoTag className="mt-2 block">{brandTagline}</MonoTag>
              <FooterTagline className="mt-3 max-w-xs leading-relaxed">
                {footerTagline}
              </FooterTagline>
              <FooterSocial className="mt-5 gap-2">
                {footerSocials
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
                {serviceLinks.map((link) => (
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
                {hoursHeading}
              </FooterColumnTitle>
              <FooterColumnList className="mt-4 space-y-0">
                {hours.map((row) => (
                  <li
                    key={row.day}
                    className="flex items-baseline justify-between gap-4 border-b border-border/70 py-2 text-sm"
                  >
                    <span className="text-muted-foreground">{row.day}</span>
                    <span className="text-right text-foreground tabular-nums">
                      {row.time}
                    </span>
                  </li>
                ))}
              </FooterColumnList>
            </FooterColumn>
            <FooterColumn className="lg:col-span-2">
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
              {footerCopyright}
            </FooterCopyright>
            <FooterLegal className="gap-x-6 gap-y-2">
              {footerLegal.map((l) => (
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
