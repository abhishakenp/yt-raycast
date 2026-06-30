import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Logo as BrandLogo } from '#/section-kit/Logo.tsx'
import { MobileNavDrawer } from '#/section-kit/MobileNavDrawer.tsx'

/**
 * ChurchNavbar — fixed translucent top navigation bar for a church or faith-community
 * site. A blurred, border-bottomed header pinned to the top with a star brand mark
 * + church name on the left, horizontal nav links plus a pill-shaped "Give Today" CTA
 * on the right (desktop), and a hamburger menu button on mobile. Every link and the
 * CTA route through useNavigate so labels can drive page-switching. Use as the sticky
 * site header for churches, parishes, worship centers, ministries, or religious nonprofits.
 * Renders fully with no props via baked-in "Grace Community" defaults.
 */
export const ChurchNavbar = defineCapsule({
  name: 'ChurchNavbar',
  description:
    "Fixed translucent top navigation bar for a church or faith-community site: backdrop-blurred, border-bottomed header pinned to the top with a star brand mark + church name on the left, horizontal nav links and a pill-shaped 'Give Today' CTA on the right (desktop), and a hamburger menu button on mobile. Links and CTA route through useNavigate for page-switching. Use as the sticky site header for churches, parishes, worship centers, ministries, or religious nonprofits.",
  props: z.object({
    /** Church / community name shown beside the star mark. */
    brand: z.string().optional(),
    /** Nav link labels shown in the horizontal desktop menu. */
    nav: z.array(z.string()).optional(),
    /** Target for the brand logo and mobile menu button. Defaults to first nav item. */
    homeTarget: z.string().optional(),
    /** Label for the right-side pill CTA button. */
    ctaLabel: z.string().optional(),
    /** Navigation target for the right-side pill CTA button. */
    ctaTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'Grace Community'
    const nav = props.nav?.length
      ? props.nav
      : ['Services', 'About', 'Events', 'Give', 'Contact']
    const homeTarget = props.homeTarget ?? nav[0]
    const ctaLabel = props.ctaLabel ?? 'Give Today'
    const ctaTarget = props.ctaTarget ?? 'Give'

    const Star = () => (
      <span className="text-2xl text-muted-foreground" aria-hidden="true">
        ✦
      </span>
    )

    return (
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm',
          props.className,
        )}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <nav
            className="flex h-20 items-center justify-between"
            aria-label="Main navigation"
          >
            <button
              type="button"
              onClick={() => go(homeTarget)}
              className="flex items-center gap-2"
            >
              <BrandLogo
                brand={brand}
                fallback={<Star />}
                labelClassName="text-xl font-medium tracking-tight text-foreground"
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
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => go(ctaTarget)}
                className="hidden items-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:inline-flex"
              >
                {ctaLabel}
              </button>
              <MobileNavDrawer
                brand={brand}
                nav={nav}
                homeTarget={homeTarget}
                cta={{ label: ctaLabel, target: ctaTarget }}
                buttonClassName="p-2 text-muted-foreground md:hidden"
              />
            </div>
          </nav>
        </div>
      </header>
    )
  },
})
