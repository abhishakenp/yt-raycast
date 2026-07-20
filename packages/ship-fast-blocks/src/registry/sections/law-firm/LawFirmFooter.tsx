import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * LawFirmFooter — an inverted (bg-foreground / text-background) four-column
 * colophon footer for a law firm. A wide brand column routes a hairline-framed
 * squared initial seal beside a two-line lockup (serif wordmark over a mono
 * tracked-uppercase tagline), an about paragraph and a pin-marked address line;
 * alongside sit a practice-areas link column, a firm link column and a contact
 * column with mono-labelled phone / email / hours rows — every link a routed
 * `block w-fit` anchor. A bordered-top bar carries an auto-updating copyright
 * line and legal links. High-contrast, authoritative, traditional-yet-modern
 * newsprint gravitas with sharp binary corners. The brand seal and every link
 * route through section-kit route links. Use as the closing site footer for law
 * firms, attorneys, legal practices, consulting or professional-services sites.
 * Renders fully with no props via baked-in "Reinhart & Associates" defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import {
  SiteFooter,
  FooterColumnTitle,
  FooterColumnList,
  FooterLink,
  FooterBottom,
  FooterCopyright,
  FooterLegal,
} from '#/section-kit/SiteFooter.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
export const LawFirmFooter = defineCapsule({
  name: 'LawFirmFooter',
  description:
    'Inverted (bg-foreground / text-background) four-column colophon footer for a law firm: a wide brand column routing a hairline-framed squared initial seal beside a two-line lockup (serif wordmark over a mono tracked-uppercase tagline), an about paragraph and a pin-marked address line, alongside a practice-areas link column, a firm link column and a contact column with mono-labelled phone / email / hours rows — every link a routed block w-fit anchor — above a bordered-top bar with an auto-updating copyright line and legal links. High-contrast, authoritative, traditional-yet-modern newsprint gravitas with sharp binary corners; the brand seal and every link route through section-kit route links. Use as the closing site footer for law firms, attorneys, legal practices, corporate counsel, consulting, accounting or professional-services sites.',
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
    const brand = props.brand ?? 'Reinhart & Associates'
    const tagline = props.tagline ?? 'Attorneys at Law'
    const about =
      props.about ??
      'Sophisticated legal representation for Fortune 500 companies, emerging enterprises and private clients across corporate, litigation and regulatory matters since 1987.'
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
      : ['Attorneys', 'About', 'Careers', 'News', 'Contact']
    const contactTitle = props.contactTitle ?? 'Contact'
    const phone = props.phone ?? '(212) 555-0147'
    const email = props.email ?? 'consult@reinhart.law'
    const hours = props.hours ?? 'Mon–Fri, 8:30am–6:00pm'
    const homeTarget = props.homeTarget ?? brand
    const copyright =
      props.copyright ??
      `© ${new Date().getFullYear()} ${brand} LLP. All rights reserved.`
    const legalLinks = props.legalLinks?.length
      ? props.legalLinks
      : ['Privacy Policy', 'Terms of Service', 'Attorney Advertising']
    const brandInitial =
      brand
        .replace(/[^A-Za-z]/g, '')
        .charAt(0)
        .toUpperCase() || 'R'
    const MapPinIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
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
        <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
    return (
      <SiteFooter
        className={cn(
          'border-background/10 bg-foreground text-background',
          props.className,
        )}
      >
        <Container className="py-14 lg:py-16">
          <div className="grid gap-10 md:grid-cols-12 lg:gap-12">
            <div className="md:col-span-5">
              <NavbarRouteLink
                href={homeTarget}
                className="inline-flex items-center gap-3 transition-opacity hover:opacity-80"
              >
                <span
                  aria-hidden="true"
                  className="grid size-10 shrink-0 place-items-center rounded-none border border-background/20 bg-primary font-serif text-lg font-bold text-primary-foreground"
                >
                  {brandInitial}
                </span>
                <span className="flex flex-col leading-none">
                  <span className="font-serif text-lg font-semibold tracking-tight text-background">
                    {brand}
                  </span>
                  <span className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-background/50">
                    {tagline}
                  </span>
                </span>
              </NavbarRouteLink>
              <p className="mt-5 max-w-sm text-sm leading-relaxed text-background/60">
                {about}
              </p>
              <p className="mt-5 flex items-start gap-2 text-sm text-background/70">
                <MapPinIcon className="mt-0.5 size-4 shrink-0 text-background/40" />
                <span>{address}</span>
              </p>
            </div>

            <div className="md:col-span-3">
              <FooterColumnTitle className="font-mono text-[11px] uppercase tracking-[0.2em] text-background/50">
                {practiceTitle}
              </FooterColumnTitle>
              <FooterColumnList>
                {practiceLinks.map((l) => (
                  <FooterLink
                    key={l}
                    className="block w-fit text-background/70 hover:text-background"
                  >
                    {l}
                  </FooterLink>
                ))}
              </FooterColumnList>
            </div>

            <div className="md:col-span-2">
              <FooterColumnTitle className="font-mono text-[11px] uppercase tracking-[0.2em] text-background/50">
                {firmTitle}
              </FooterColumnTitle>
              <FooterColumnList>
                {firmLinks.map((l) => (
                  <FooterLink
                    key={l}
                    className="block w-fit text-background/70 hover:text-background"
                  >
                    {l}
                  </FooterLink>
                ))}
              </FooterColumnList>
            </div>

            <div className="md:col-span-2">
              <FooterColumnTitle className="font-mono text-[11px] uppercase tracking-[0.2em] text-background/50">
                {contactTitle}
              </FooterColumnTitle>
              <FooterColumnList className="space-y-3">
                <li>
                  <FooterLink
                    href={phone}
                    className="block w-fit tabular-nums text-background/70 hover:text-background"
                  >
                    {phone}
                  </FooterLink>
                </li>
                <li>
                  <FooterLink
                    href={email}
                    className="block w-fit text-background/70 hover:text-background"
                  >
                    {email}
                  </FooterLink>
                </li>
                <li className="text-sm text-background/50">{hours}</li>
              </FooterColumnList>
            </div>
          </div>

          <FooterBottom className="mt-12 border-background/15">
            <FooterCopyright className="text-background/50">
              {copyright}
            </FooterCopyright>
            <FooterLegal>
              {legalLinks.map((l) => (
                <FooterLink
                  key={l}
                  className="block w-fit text-background/50 hover:text-background"
                >
                  {l}
                </FooterLink>
              ))}
            </FooterLegal>
          </FooterBottom>
        </Container>
      </SiteFooter>
    )
  },
})
