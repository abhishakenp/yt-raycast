import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { Logo as BrandLogo } from '#/section-kit/Logo.tsx'

/**
 * MembershipClubNavbar — sticky, translucent top navigation bar for a private
 * membership club / exclusive community site. A backdrop-blurred, border-bottomed
 * header pinned to the top: a thin concentric "compass" club mark beside the
 * light-weight club name on the left, a horizontal set of nav links centered on
 * desktop, and a solid rounded-pill primary "Apply Now" CTA on the right. Every
 * nav item and the CTA route through useNavigate so labels can drive page
 * switching. Use as the calm, refined, premium site header for members clubs,
 * founders/social clubs, professional networks, curated communities, alumni
 * collectives or paid community subscriptions. Renders fully with no props via
 * baked-in "The Guild" defaults.
 */
export const MembershipClubNavbar = defineCapsule({
  name: 'MembershipClubNavbar',
  description:
    "Sticky translucent top navigation bar for a private membership club / exclusive community site: backdrop-blurred, border-bottomed header pinned to the top with a thin concentric 'compass' club mark + light-weight club name on the left, horizontal nav links centered on desktop, and a solid rounded-pill primary 'Apply Now' CTA on the right. Nav items and CTA route through useNavigate for page switching. Use as the calm, refined, quietly premium site header for members clubs, founders/social clubs, professional networks, curated communities, alumni collectives, coworking/clubhouse memberships or paid community subscriptions.",
  props: z.object({
    /** Brand / club name shown in the navbar. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (should match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Primary CTA label on the right. */
    cta: z.string().optional(),
    /** Route target fired by the primary CTA (application flow). */
    ctaTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'The Guild'
    const nav = props.nav?.length
      ? props.nav
      : ['Benefits', 'Membership', 'About', 'FAQ']
    const cta = props.cta ?? 'Apply Now'
    const ctaTarget = props.ctaTarget ?? 'Apply for Membership'

    const LogoMark = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className={className}
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2L12 12L19 19" />
      </svg>
    )

    return (
      <header
        className={cn(
          'sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-sm',
          props.className,
        )}
      >
        <Container asChild>
          <nav aria-label="Main navigation">
            <div className="flex h-16 items-center justify-between lg:h-20">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-2"
                aria-label={`${brand} Home`}
              >
                <BrandLogo
                  brand={brand}
                  fallback={<LogoMark className="size-8 text-foreground" />}
                  labelClassName="text-xl font-light tracking-tight text-foreground"
                />
              </button>
              <div className="hidden items-center gap-8 md:flex">
                {nav.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => go(label)}
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => go(ctaTarget)}
                className="inline-flex items-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {cta}
              </button>
            </div>
          </nav>
        </Container>
      </header>
    )
  },
})
