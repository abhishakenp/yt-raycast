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
import { MonoTag } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * MentalHealthFooter — a warm hairline ledger footer for a therapy practice. A
 * calm border-topped band on a soft muted wash with an asymmetric 12-column
 * grid: a wide brand block (square "sun/wellness" glyph tile linking home +
 * serif practice name + about blurb + square mono social chips), a services
 * link column, a practice link column, and a contact column with address,
 * click-to-call phone, email, and an office-hours line — closed by a hairline
 * copyright + license bar. Column titles are mono uppercase micro-labels and
 * every brand mark, link, phone, and email routes through section-kit route
 * links. Calm, trustworthy wellness aesthetic. Use as the closing site footer
 * for therapists, counselors, psychologists, psychiatrists or wellness centers.
 */
export const MentalHealthFooter = defineCapsule({
  name: 'MentalHealthFooter',
  description:
    "Warm hairline ledger footer for a therapy practice: a calm border-topped band on a soft muted wash with an asymmetric grid holding a wide brand block (square 'sun/wellness' glyph tile linking home + serif practice name + about blurb + square mono social chips), a services link column, a practice link column, and a contact column with address, click-to-call phone, email, and an office-hours line, closed by a hairline copyright + license bar. Column titles are mono uppercase micro-labels; every brand mark, link, phone, and email routes through section-kit route links. Calm, trustworthy wellness aesthetic. Use as the closing site footer for therapists, counselors, psychologists, psychiatrists or wellness centers.",
  props: z.object({
    /** Practice / brand name shown in the footer. */
    brand: z.string().optional(),
    /** Navigation target for the brand logo button (e.g. nav[0]). */
    homeTarget: z.string().optional(),
    about: z.string().optional(),
    /** Social icon link labels. */
    socials: z.array(z.string()).optional(),
    servicesTitle: z.string().optional(),
    servicesLinks: z.array(z.string()).optional(),
    /** Navigation target shared by every services-column link. */
    servicesTarget: z.string().optional(),
    companyTitle: z.string().optional(),
    companyLinks: z.array(z.string()).optional(),
    contactTitle: z.string().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
    hours: z.string().optional(),
    /** Navigation target for phone + email buttons (e.g. "Book Session"). */
    bookLabel: z.string().optional(),
    copyright: z.string().optional(),
    license: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Stillpoint'
    const homeTarget = props.homeTarget ?? 'Services'
    const about =
      props.about ??
      "Professional mental health services in Portland's Pearl District. Licensed, compassionate care for individuals, couples, and families."
    const socials = props.socials?.length
      ? props.socials
      : ['Facebook', 'Instagram', 'LinkedIn']
    const servicesTitle = props.servicesTitle ?? 'Services'
    const servicesLinks = props.servicesLinks?.length
      ? props.servicesLinks
      : [
          'Individual Therapy',
          'Couples Therapy',
          'Family Therapy',
          'Psychiatry',
        ]
    const servicesTarget = props.servicesTarget ?? 'Services'
    const companyTitle = props.companyTitle ?? 'Practice'
    const companyLinks = props.companyLinks?.length
      ? props.companyLinks
      : ['About Us', 'Our Team', 'Insurance', 'Careers']
    const contactTitle = props.contactTitle ?? 'Contact'
    const address = props.address ?? '1200 NW Marshall St, Portland, OR 97209'
    const phone = props.phone ?? '(503) 555-0147'
    const email = props.email ?? 'hello@stillpoint.co'
    const hours = props.hours ?? 'Mon–Fri, 8am–6pm'
    const bookLabel = props.bookLabel ?? 'Book Session'
    const copyright =
      props.copyright ??
      `© ${new Date().getFullYear()} ${brand} Therapy, LLC. All rights reserved.`
    const license =
      props.license ?? 'Licensed clinical practice in the State of Oregon.'

    const LogoMark = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    )
    const LogoBadge = ({ className }: { className?: string }) => (
      <span
        className={cn(
          'grid size-8 place-items-center rounded-none bg-primary text-primary-foreground',
          className,
        )}
        aria-hidden="true"
      >
        <LogoMark className="size-5" />
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
              brandClassName="font-serif text-xl font-medium tracking-tight"
              className="md:col-span-2 lg:col-span-4"
            >
              <FooterTagline className="mt-3 max-w-xs leading-relaxed">
                {about}
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
                {servicesTitle}
              </FooterColumnTitle>
              <FooterColumnList className="mt-4 space-y-2.5">
                {servicesLinks.map((link) => (
                  <li key={link}>
                    <FooterLink
                      href={servicesTarget}
                      className="block w-fit text-foreground/80 hover:text-foreground"
                    >
                      {link}
                    </FooterLink>
                  </li>
                ))}
              </FooterColumnList>
            </FooterColumn>
            <FooterColumn className="lg:col-span-2">
              <FooterColumnTitle className="font-mono text-[11px] font-normal uppercase tracking-[0.2em] text-muted-foreground">
                {companyTitle}
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
                {contactTitle}
              </FooterColumnTitle>
              <FooterColumnList className="mt-4 space-y-2.5">
                <li className="text-sm leading-relaxed text-muted-foreground">
                  {address}
                </li>
                <li>
                  <FooterLink
                    href={bookLabel}
                    className="block w-fit text-foreground/80 tabular-nums hover:text-foreground"
                  >
                    {phone}
                  </FooterLink>
                </li>
                <li>
                  <FooterLink
                    href={bookLabel}
                    className="block w-fit break-all text-foreground/80 hover:text-foreground"
                  >
                    {email}
                  </FooterLink>
                </li>
                <li>
                  <MonoTag tone="faint" className="block">
                    {hours}
                  </MonoTag>
                </li>
              </FooterColumnList>
            </FooterColumn>
          </FooterGrid>
          <FooterBottom className="mt-14">
            <FooterCopyright className="font-mono text-[11px] uppercase tracking-[0.15em]">
              {copyright}
            </FooterCopyright>
            <FooterLegal className="gap-x-6 gap-y-2">
              <span className="block w-fit text-xs text-muted-foreground">
                {license}
              </span>
            </FooterLegal>
          </FooterBottom>
        </FooterContent>
      </SiteFooter>
    )
  },
})
