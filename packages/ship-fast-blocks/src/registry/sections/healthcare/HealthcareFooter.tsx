import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Logo as BrandLogo } from '#/section-kit/Logo.tsx'

/**
 * HealthcareFooter — rich multi-column footer for a medical-clinic page. A
 * dark foreground-colored band with a brand column (heart-in-tile mark + clinic
 * name, tagline, social buttons), a Services links column, a Company links
 * column, and a Contact column with address / phone / email rows (each with an
 * icon), all above a bordered bottom row pairing an auto-updating copyright line
 * with legal links. The brand button, socials, links, phone and email route
 * through useNavigate. Use as the closing site footer for doctors' offices,
 * primary-care practices, telehealth or urgent-care clinics, hospitals or
 * medical groups. Renders fully with no props via baked-in clinic defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
export const HealthcareFooter = defineCapsule({
  name: 'HealthcareFooter',
  description:
    "Rich multi-column footer for a medical-clinic page: a dark foreground-colored band with a brand column (heart-in-tile mark + clinic name, tagline, social buttons), a Services links column, a Company links column, and a Contact column with icon-prefixed address / phone / email rows, all above a bordered bottom row pairing an auto-updating copyright line with legal links. The brand button, socials, links, phone and email route through useNavigate. Use as the closing site footer for doctors' offices, primary-care practices, telehealth or urgent-care clinics, hospitals or medical groups.",
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
    const go = useNavigate()
    const brand = props.brand ?? 'Vitality Health Partners'
    const homeTarget = props.homeTarget ?? 'Services'
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
          'Mental Health',
          'Lab & Diagnostics',
        ]
    const companyHeading = props.companyHeading ?? 'Company'
    const companyLinks = props.companyLinks?.length
      ? props.companyLinks
      : ['Our Doctors', 'About Us', 'Careers', 'Blog', 'Press']
    const contactHeading = props.contactHeading ?? 'Contact'
    const address =
      props.address ?? '1234 Mission Street, San Francisco, CA 94103'
    const phone = props.phone ?? '(415) 555-1234'
    const email = props.email ?? 'hello@vitalityhealth.com'
    const copyright =
      props.copyright ??
      `© ${new Date().getFullYear()} ${brand}. All rights reserved.`
    const legalLinks = props.legalLinks?.length
      ? props.legalLinks
      : ['Privacy Policy', 'Terms of Service', 'Accessibility']
    const HeartMark = ({ className }) => (
      <span
        className={cn(
          'grid place-items-center rounded-xl bg-primary text-primary-foreground',
          className,
        )}
        aria-hidden="true"
      >
        <svg
          width="60%"
          height="60%"
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
      <footer
        className={cn(
          'bg-foreground py-16 text-background/70',
          props.className,
        )}
        role="contentinfo"
      >
        <Container>
          <div className="mb-12 grid gap-12 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <button
                type="button"
                onClick={() => go(homeTarget)}
                className="mb-6 flex items-center gap-3"
              >
                <BrandLogo
                  brand={brand}
                  fallback={<HeartMark className="size-10" />}
                  labelClassName="text-xl font-semibold text-background"
                />
              </button>
              <p className="mb-6 leading-relaxed text-background/60">
                {tagline}
              </p>
              <div className="flex gap-4">
                {socials.map((social) => (
                  <button
                    key={social}
                    type="button"
                    aria-label={social}
                    onClick={() => go(social)}
                    className="grid size-10 place-items-center rounded-lg bg-background/10 text-background/70 transition-colors hover:bg-background/20 hover:text-background"
                  >
                    {social.charAt(0)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="mb-4 font-semibold text-background">
                {servicesHeading}
              </h4>
              <ul className="space-y-3">
                {servicesLinks.map((link) => (
                  <li key={link}>
                    <button
                      type="button"
                      onClick={() => go(link)}
                      className="transition-colors hover:text-background"
                    >
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-semibold text-background">
                {companyHeading}
              </h4>
              <ul className="space-y-3">
                {companyLinks.map((link) => (
                  <li key={link}>
                    <button
                      type="button"
                      onClick={() => go(link)}
                      className="transition-colors hover:text-background"
                    >
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-semibold text-background">
                {contactHeading}
              </h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <svg
                    className="mt-0.5 size-5 shrink-0"
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
                  <span>{address}</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg
                    className="size-5 shrink-0"
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
                  <button
                    type="button"
                    onClick={() => go(phone)}
                    className="transition-colors hover:text-background"
                  >
                    {phone}
                  </button>
                </li>
                <li className="flex items-center gap-3">
                  <svg
                    className="size-5 shrink-0"
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
                  <button
                    type="button"
                    onClick={() => go(email)}
                    className="transition-colors hover:text-background"
                  >
                    {email}
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-4 border-t border-background/20 pt-8 md:flex-row">
            <p className="text-sm text-background/60">{copyright}</p>
            <div className="flex gap-6 text-sm">
              {legalLinks.map((link) => (
                <button
                  key={link}
                  type="button"
                  onClick={() => go(link)}
                  className="transition-colors hover:text-background"
                >
                  {link}
                </button>
              ))}
            </div>
          </div>
        </Container>
      </footer>
    )
  },
})
