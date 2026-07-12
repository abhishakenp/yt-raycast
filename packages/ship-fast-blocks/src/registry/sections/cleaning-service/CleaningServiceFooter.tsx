import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Logo as BrandLogo } from '#/section-kit/Logo.tsx'

/**
 * CleaningServiceFooter — a multi-column footer for a home-cleaning / maid-service landing page. A dark card-background footer with a 5-column layout: brand sparkle-mark + company name + tagline + social-icon buttons on the left (spanning 2 columns on desktop), followed by link-column groups (Services, Company, Support) and a bottom bar with copyright, location, phone, and email — all routable through useNavigate. Every brand click, footer link, phone, email, and social button routes through useNavigate. Use as the closing site footer for residential cleaning companies, maid services, housekeeping platforms, janitorial businesses, or any local home-service brand. Renders fully with no props via baked-in "PureSpace" defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
export const CleaningServiceFooter = defineCapsule({
  name: 'CleaningServiceFooter',
  description:
    'Multi-column footer for a home-cleaning / maid-service landing page: dark card-background with a 5-column layout. Left side has brand sparkle-mark + company name + tagline + social-icon buttons (spanning 2 columns on desktop); right side has link-column groups (Services, Company, Support). Bottom bar carries copyright, location, phone, and email — all routable through useNavigate. Use as the closing site footer for residential cleaning, maid services, housekeeping, janitorial, or local home-service brands.',
  props: z.object({
    /** Brand / company name shown beside the logo tile. */
    brand: z.string().optional(),
    /** Tagline paragraph under the brand name. */
    tagline: z.string().optional(),
    /** Footer column groups: title + array of link labels. */
    columns: z
      .array(
        z.object({
          title: z.string(),
          links: z.array(z.string()),
        }),
      )
      .optional(),
    /** Copyright line; brand + current year are auto-inserted. */
    copyright: z.string().optional(),
    /** Location string shown in the bottom bar. */
    location: z.string().optional(),
    /** Phone number shown and routed in the bottom bar. */
    phone: z.string().optional(),
    /** Email address shown and routed in the bottom bar. */
    email: z.string().optional(),
    /** Social platform labels shown as first-character icon buttons. */
    socials: z.array(z.string()).optional(),
    /** Navigation target for the brand logo click. */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'PureSpace'
    const tagline =
      props.tagline ??
      'Professional home cleaning services in Seattle. Making homes sparkle since 2018.'
    const homeTarget = props.homeTarget ?? 'Services'
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Services',
            links: [
              'Standard Cleaning',
              'Deep Cleaning',
              'Move In/Out',
              'Post-Construction',
              'Eco-Friendly',
            ],
          },
          {
            title: 'Company',
            links: ['About Us', 'Careers', 'Press', 'Blog', 'Gift Cards'],
          },
          {
            title: 'Support',
            links: [
              'Help Center',
              'Contact Us',
              'Become a Cleaner',
              'Privacy Policy',
              'Terms of Service',
            ],
          },
        ]
    const copyright =
      props.copyright ??
      `© ${new Date().getFullYear()} ${brand} Cleaning Services. All rights reserved.`
    const location = props.location ?? 'Seattle, WA'
    const phone = props.phone ?? '(555) 123-4567'
    const email = props.email ?? 'hello@purespace.com'
    const socials = props.socials?.length
      ? props.socials
      : ['Facebook', 'Twitter', 'Instagram']
    const SparkleMark = ({ className }) => (
      <span
        className={cn(
          'grid place-items-center rounded-lg bg-primary text-primary-foreground',
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
          <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      </span>
    )
    return (
      <footer
        className={cn(
          'bg-card py-16 text-muted-foreground lg:py-20',
          props.className,
        )}
      >
        <Container>
          <div className="mb-12 grid gap-12 md:grid-cols-2 lg:grid-cols-5 lg:gap-8">
            <div className="lg:col-span-2">
              <button
                type="button"
                onClick={() => go(homeTarget)}
                className="mb-4 flex items-center gap-2"
              >
                <BrandLogo
                  brand={brand}
                  fallback={<SparkleMark className="size-8" />}
                  labelClassName="text-xl font-semibold text-card-foreground"
                />
              </button>
              <p className="mb-6 max-w-sm text-muted-foreground">{tagline}</p>
              <div className="flex items-center gap-4">
                {socials.map((social) => (
                  <button
                    key={social}
                    type="button"
                    aria-label={social}
                    onClick={() => go(social)}
                    className="grid size-10 place-items-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    {social.charAt(0)}
                  </button>
                ))}
              </div>
            </div>
            {columns.map((col) => (
              <div key={col.title}>
                <h4 className="mb-4 font-semibold text-card-foreground">
                  {col.title}
                </h4>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link}>
                      <button
                        type="button"
                        onClick={() => go(link)}
                        className="transition-colors hover:text-card-foreground"
                      >
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
            <p className="text-sm">{copyright}</p>
            <div className="flex items-center gap-6 text-sm">
              <span>{location}</span>
              <button
                type="button"
                onClick={() => go(phone)}
                className="transition-colors hover:text-card-foreground"
              >
                {phone}
              </button>
              <button
                type="button"
                onClick={() => go(email)}
                className="transition-colors hover:text-card-foreground"
              >
                {email}
              </button>
            </div>
          </div>
        </Container>
      </footer>
    )
  },
})
