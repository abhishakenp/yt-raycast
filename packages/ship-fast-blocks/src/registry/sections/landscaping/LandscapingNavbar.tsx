import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Logo as BrandLogo } from '#/section-kit/Logo.tsx'
import { MobileNavDrawer } from '#/section-kit/MobileNavDrawer.tsx'

import { Container } from '#/section-kit/Container.tsx'

/**
 * LandscapingNavbar — sticky, translucent top navigation bar for a landscaping /
 * outdoor-design company. A backdrop-blurred, border-bottomed header pinned to
 * the top: a layered-diamond brand mark + wordmark on the left, a horizontal set
 * of nav links in the center, and a pill-shaped primary CTA on the right
 * (desktop), with a hamburger menu button on mobile. Calm, organic and premium
 * on a warm stone canvas with a sage-green accent. Every link and the CTA route
 * through useNavigate so labels can drive page-switching. Use as the sticky site
 * header for landscapers, lawn-care and yard-maintenance services, garden
 * designers, hardscaping/patio contractors or grounds-keeping companies. Renders
 * fully with no props via baked-in "Earth & Edge" defaults.
 */
export const LandscapingNavbar = defineCapsule({
  name: 'LandscapingNavbar',
  description:
    'Sticky translucent top navigation bar for a landscaping / outdoor-design company: backdrop-blurred, border-bottomed header pinned to the top with a layered-diamond brand mark + wordmark on the left, horizontal nav links in the center, and a pill-shaped primary CTA on the right (desktop), plus a hamburger menu on mobile. Calm, organic and premium on a warm stone canvas with a sage-green accent. Links and CTA route through useNavigate for page-switching. Use as the sticky site header for landscapers, lawn-care and yard-maintenance services, garden designers, hardscaping/patio contractors, irrigation specialists or grounds-keeping companies.',
  props: z.object({
    /** Brand / company name shown beside the mark. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (should match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Pill-shaped primary CTA label on the right. */
    cta: z.string().optional(),
    /** Navigation target for the CTA (defaults to the last nav item / "Get a Quote"). */
    contactTarget: z.string().optional(),
    /** Navigation target for the brand mark and mobile menu button. */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'Earth & Edge'
    const nav = props.nav?.length
      ? props.nav
      : ['Services', 'Portfolio', 'Pricing', 'About', 'Get a Quote']
    const cta = props.cta ?? nav[nav.length - 1] ?? 'Get a Quote'
    const contactTarget =
      props.contactTarget ?? nav[nav.length - 1] ?? 'Get a Quote'
    const homeTarget = props.homeTarget ?? nav[0] ?? 'Services'

    const LogoMark = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn('text-primary', className)}
        aria-hidden="true"
      >
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    )

    return (
      <header
        className={cn(
          'sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md',
          props.className,
        )}
      >
        <Container>
          <div className="flex h-16 items-center justify-between lg:h-20">
            <button
              type="button"
              onClick={() => go(homeTarget)}
              className="flex items-center gap-2"
            >
              <BrandLogo
                brand={brand}
                fallback={<LogoMark className="size-8" />}
                labelClassName="text-xl font-semibold tracking-tight text-foreground"
              />
            </button>
            <div className="hidden items-center gap-8 md:flex">
              {nav.slice(0, -1).map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => go(label)}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                  {label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => go(contactTarget)}
                className="inline-flex items-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {cta}
              </button>
            </div>
            <MobileNavDrawer
              brand={brand}
              nav={nav}
              homeTarget={homeTarget}
              cta={{ label: cta, target: contactTarget }}
              buttonClassName="p-2 text-muted-foreground md:hidden"
            />
          </div>
        </Container>
      </header>
    )
  },
})
