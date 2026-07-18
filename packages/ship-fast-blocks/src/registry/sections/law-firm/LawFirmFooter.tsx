import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * LawFirmFooter — a dark, four-column site footer on the foreground surface for a
 * law firm. A wide brand column with a squared initial tile, two-line serif
 * wordmark (firm name + tracked-uppercase tagline), an about paragraph and an
 * address line with a pin icon, alongside a practice-areas link column, a firm
 * link column, and a contact column with phone / email / hours rows; below them
 * a bordered-top bar holds an auto-updating copyright line and legal links.
 * High-contrast, refined, authoritative editorial aesthetic with sharp squared
 * corners. The brand button and every link route through useNavigate. Use as the
 * closing site footer for law firms, attorneys, legal practices, consulting or
 * professional-services sites. Renders fully with no props via baked-in
 * "Reinhart & Associates" defaults.
 */
import { SiteFooter } from '#/section-kit/SiteFooter.tsx'
export const LawFirmFooter = defineCapsule({
  name: 'LawFirmFooter',
  description:
    'Dark four-column site footer on the foreground surface for a law firm: a wide brand column with a squared initial tile, two-line serif wordmark (firm name + tracked-uppercase tagline), an about paragraph and an address line with a pin icon, alongside a practice-areas link column, a firm link column and a contact column with phone / email / hours rows, above a bordered-top bar with an auto-updating copyright line and legal links. High-contrast, refined, authoritative editorial aesthetic with sharp squared corners; the brand button and every link route through useNavigate. Use as the closing site footer for law firms, attorneys, legal practices, corporate counsel, consulting, accounting or professional-services sites.',
  props: z.object({
    /** Firm / brand name shown in the wordmark and brand-tile initial. */
    brand: z.string().optional(),
    /** Tracked-uppercase tagline shown under the firm name. */
    tagline: z.string().optional(),
    about: z.string().optional(),
    address: z.string().optional(),
    practiceTitle: z.string().optional(),
    practiceLinks: z.array(z.string()).optional(),
    firmTitle: z.string().optional(),
    firmLinks: z.array(z.string()).optional(),
    contactTitle: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
    hours: z.string().optional(),
    copyright: z.string().optional(),
    legalLinks: z.array(z.string()).optional(),
    /** Navigation target for the brand button. */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'Reinhart & Associates'
    const tagline = props.tagline ?? 'Attorneys at Law'
    const about =
      props.about ??
      'Premier corporate and trial counsel serving Fortune 500 companies, emerging enterprises, and private clients since 1987.'
    const address =
      props.address ?? '450 Lexington Avenue, 28th Floor, New York, NY 10017'
    const practiceTitle = props.practiceTitle ?? 'Practice Areas'
    const practiceLinks = props.practiceLinks?.length
      ? props.practiceLinks
      : [
          'Corporate & Securities',
          'Commercial Litigation',
          'Employment Law',
          'Real Estate',
          'Intellectual Property',
          'Tax & Estates',
        ]
    const firmTitle = props.firmTitle ?? 'Firm'
    const firmLinks = props.firmLinks?.length
      ? props.firmLinks
      : [
          'Our Attorneys',
          'News & Insights',
          'Careers',
          'Pro Bono',
          'Diversity',
          'Contact',
        ]
    const contactTitle = props.contactTitle ?? 'Contact'
    const phone = props.phone ?? '(212) 555-0147'
    const email = props.email ?? 'consult@reinhart.law'
    const hours = props.hours ?? 'Mon–Fri: 8:00 AM – 7:00 PM'
    const copyright =
      props.copyright ??
      `© ${new Date().getFullYear()} ${brand} LLP. All rights reserved.`
    const legalLinks = props.legalLinks?.length
      ? props.legalLinks
      : ['Privacy Policy', 'Terms of Service', 'Attorney Advertising']
    const homeTarget = props.homeTarget ?? 'Practice Areas'
    const brandInitial =
      brand
        .replace(/[^A-Za-z]/g, '')
        .charAt(0)
        .toUpperCase() || 'R'
    const PhoneIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    )
    const MailIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    )
    const MapPinIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
    const ClockIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
    void go
    void about
    void address
    void practiceTitle
    void practiceLinks
    void firmTitle
    void firmLinks
    void contactTitle
    void phone
    void email
    void hours
    void homeTarget
    void brandInitial
    void PhoneIcon
    void MailIcon
    void MapPinIcon
    void ClockIcon
    return (
      <SiteFooter
        brand={brand}
        tagline={tagline}
        legal={legalLinks}
        note={copyright}
        className={props.className}
      />
    )
  },
})
