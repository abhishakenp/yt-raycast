import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Logo as BrandLogo } from '#/section-kit/Logo.tsx'

/**
 * ConstructionFooter — four-column footer for a construction / general
 * contractor page. A multi-column layout with a brand logo tile + company
 * blurb + social buttons on the left, service links and company links in
 * the middle columns, and contact info (address, phone, email) on the right.
 * Every link and social button routes through useNavigate. A bottom bar
 * shows copyright and legal links. Use as the closing site footer for
 * construction firms, contractors, builders, or trades businesses.
 * Renders fully with no props via baked-in defaults.
 */
export const ConstructionFooter = defineCapsule({
  name: 'ConstructionFooter',
  description:
    'Four-column footer for a construction / general contractor page: a multi-column layout with a brand logo tile + company blurb + social buttons on the left, service links and company links in the middle columns, and contact info (address, phone, email) on the right. Every link and social button routes through useNavigate. A bottom bar shows copyright and legal links. Use as the closing site footer for construction firms, contractors, builders, or trades businesses.',
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
    const go = useNavigate()
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
          'Design-Build',
        ]
    const companyTitle = props.companyTitle ?? 'Company'
    const companyLinks = props.companyLinks?.length
      ? props.companyLinks
      : ['About Us', 'Projects', 'Careers', 'News', 'Contact']
    const contactTitle = props.contactTitle ?? 'Contact'
    const address = props.address ?? '1234 Construction Ave, Seattle, WA 98101'
    const phone = props.phone ?? '(206) 555-1234'
    const email = props.email ?? 'info@builtright.com'
    const socials = props.socials?.length
      ? props.socials
      : ['LinkedIn', 'Instagram', 'Facebook']
    const legal = props.legal?.length
      ? props.legal
      : ['Privacy Policy', 'Terms of Service', 'Licenses']
    const note = props.note ?? 'All rights reserved.'
    const homeTarget = props.homeTarget ?? 'Services'

    const LogoMark = ({
      className,
      tone = 'primary',
    }: {
      className?: string
      tone?: 'primary' | 'foreground'
    }) => (
      <span
        className={cn(
          'grid place-items-center rounded-md',
          tone === 'primary'
            ? 'bg-primary text-primary-foreground'
            : 'bg-foreground text-background',
          className,
        )}
        aria-hidden="true"
      >
        <svg
          width="20"
          height="20"
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

    return (
      <footer className={cn('bg-background py-16', props.className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 grid gap-12 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <button
                type="button"
                onClick={() => go(homeTarget)}
                className="mb-6 flex items-center gap-2"
              >
                <BrandLogo
                  brand={brand}
                  fallback={<LogoMark className="size-8" tone="foreground" />}
                  labelClassName="text-xl font-semibold tracking-tight text-foreground"
                />
              </button>
              <p className="mb-6 leading-relaxed text-muted-foreground">
                {about}
              </p>
              <div className="flex gap-4">
                {socials.map((social) => (
                  <button
                    key={social}
                    type="button"
                    aria-label={social}
                    onClick={() => go(social)}
                    className="grid size-10 place-items-center rounded-lg bg-muted text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    <span className="text-xs font-semibold">
                      {social.charAt(0)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="mb-4 font-semibold text-foreground">
                {servicesTitle}
              </h4>
              <ul className="space-y-3">
                {servicesLinks.map((link) => (
                  <li key={link}>
                    <button
                      type="button"
                      onClick={() => go(link)}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-semibold text-foreground">
                {companyTitle}
              </h4>
              <ul className="space-y-3">
                {companyLinks.map((link) => (
                  <li key={link}>
                    <button
                      type="button"
                      onClick={() => go(link)}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-semibold text-foreground">
                {contactTitle}
              </h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3 text-muted-foreground">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="shrink-0"
                    aria-hidden="true"
                  >
                    <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 0 1-2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0z" />
                    <circle cx="12" cy="11" r="3" />
                  </svg>
                  <span>{address}</span>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => go(phone)}
                    className="flex items-center gap-3 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="shrink-0"
                      aria-hidden="true"
                    >
                      <path d="M3 5a2 2 0 0 1 2-2h3.28a1 1 0 0 1 .948.684l1.498 4.493a1 1 0 0 1-.502 1.21l-2.257 1.13a11.042 11.042 0 0 0 5.516 5.516l1.13-2.257a1 1 0 0 1 1.21-.502l4.493 1.498a1 1 0 0 1 .684.949V19a2 2 0 0 1-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {phone}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => go(email)}
                    className="flex items-center gap-3 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="shrink-0"
                      aria-hidden="true"
                    >
                      <path d="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z" />
                    </svg>
                    {email}
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} {brand} Construction. {note}
            </p>
            <div className="flex gap-6 text-sm">
              {legal.map((link) => (
                <button
                  key={link}
                  type="button"
                  onClick={() => go(link)}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link}
                </button>
              ))}
            </div>
          </div>
        </div>
      </footer>
    )
  },
})
