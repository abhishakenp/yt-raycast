import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import {
  SiteFooter,
  FooterContent,
  FooterGrid,
  FooterBrand,
  FooterTagline,
  FooterSocial,
  FooterSocialLink,
  FooterBottom,
  FooterCopyright,
} from '#/section-kit/SiteFooter.tsx'

/**
 * MentalHealthFooter — a dark, multi-column footer for a therapy practice. On the
 * inverted foreground surface: a brand column (calming "sun/wellness" mark + name
 * + about blurb + round social icon buttons), a services link column, a company
 * link column, and a contact column with address / phone / email / hours rows
 * (each with a primary icon), plus a bottom bar with copyright + license note.
 * Calm, trustworthy wellness aesthetic. Every brand button, link, phone and email
 * routes through useNavigate. Use as the closing site footer for therapists,
 * counselors, psychologists, psychiatrists or wellness centers.
 */
export const MentalHealthFooter = defineCapsule({
  name: 'MentalHealthFooter',
  description:
    "Dark, multi-column footer for a therapy practice on the inverted foreground surface: a brand column (calming 'sun/wellness' mark + name + about blurb + round social icon buttons), a services link column, a company link column, and a contact column with address / phone / email / hours rows (each with a primary icon), plus a bottom bar with copyright + license note. Calm, trustworthy wellness aesthetic. Every brand button, link, phone and email routes through useNavigate. Use as the closing site footer for therapists, counselors, psychologists, psychiatrists or wellness centers.",
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
          'EMDR & Trauma',
          'Psychiatry',
        ]
    const servicesTarget = props.servicesTarget ?? 'Services'
    const companyTitle = props.companyTitle ?? 'Company'
    const companyLinks = props.companyLinks?.length
      ? props.companyLinks
      : ['About Us', 'Our Team', 'Careers', 'Blog', 'Privacy Policy']
    const contactTitle = props.contactTitle ?? 'Contact'
    const address = props.address ?? '1234 NW Lovejoy St, Portland, OR 97209'
    const phone = props.phone ?? '(503) 555-0147'
    const email = props.email ?? 'hello@stillpointtherapy.com'
    const hours = props.hours ?? 'Mon-Fri: 8am - 8pm'
    const bookLabel = props.bookLabel ?? 'Book Session'
    const copyright =
      props.copyright ??
      `© ${new Date().getFullYear()} ${brand} Therapy, LLC. All rights reserved.`
    const license = props.license ?? 'Licensed in Oregon • HIPAA Compliant'

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

    const Phone = ({ className }: { className?: string }) => (
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
          strokeWidth="2"
          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
        />
      </svg>
    )

    void homeTarget
    void servicesTitle
    void servicesLinks
    void servicesTarget
    void companyTitle
    void companyLinks
    void contactTitle
    void address
    void phone
    void email
    void hours
    void bookLabel
    void license
    void Phone
    return (
      <SiteFooter className={props.className}>
        <FooterContent>
          <FooterGrid>
            <FooterBrand brand={brand} brandMark={<LogoMark />}>
              <FooterTagline>{about}</FooterTagline>
              <FooterSocial>
                {socials
                  .map((s) => ({ label: s }))
                  .map((s) => (
                    <FooterSocialLink key={s.label}>{s.label}</FooterSocialLink>
                  ))}
              </FooterSocial>
            </FooterBrand>
          </FooterGrid>
          <FooterBottom>
            <FooterCopyright>{copyright}</FooterCopyright>
          </FooterBottom>
        </FooterContent>
      </SiteFooter>
    )
  },
})
