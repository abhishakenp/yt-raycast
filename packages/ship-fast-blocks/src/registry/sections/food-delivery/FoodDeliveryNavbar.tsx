import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Logo as BrandLogo } from '#/section-kit/Logo.tsx'
import { foodDeliveryLakebed } from './food-delivery-lakebed.ts'
import {
  FoodDeliveryAccountButton,
  FoodDeliveryActionButton,
  FoodDeliveryMobileMenu,
  FoodDeliveryMutationSpinner,
  FoodDeliverySearchButton,
} from './food-delivery-interactions.tsx'

/**
 * FoodDeliveryNavbar — fixed, translucent top navigation bar for a food-delivery
 * / restaurant-marketplace site. A backdrop-blurred, border-bottomed header
 * pinned to the top: a location-pin brand mark beside the brand name on the
 * left, a horizontal set of nav links in the center (desktop), and a text
 * "Sign In" link plus a rounded-full filled "Get Started" CTA on the right.
 * Every link and CTA routes through useNavigate so labels can drive
 * page-switching. Use as the sticky site header for food-delivery apps,
 * restaurant aggregators, online-ordering platforms, or takeout services.
 * Renders fully with no props via baked-in "nosh" defaults.
 */
export const FoodDeliveryNavbar = defineCapsule({
  name: 'FoodDeliveryNavbar',
  description:
    'Fixed translucent top navigation bar for a food-delivery / restaurant-marketplace site: backdrop-blurred, border-bottomed header pinned to the top with a location-pin brand mark + brand name on the left, horizontal nav links in the center (desktop), and a text Sign In link plus a rounded-full filled Get Started CTA on the right. Links and CTAs route through useNavigate for page-switching. Use as the sticky site header for food-delivery apps, restaurant aggregators, online-ordering platforms, ghost-kitchen/meal-delivery startups, or takeout services.',
  props: z.object({
    /** Brand name shown beside the pin mark. */
    brand: z.string().optional(),
    /** Top-level nav link labels (match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Target label for the brand/logo click (usually the home route). */
    homeTarget: z.string().optional(),
    /** Text Sign In link label. */
    signIn: z.string().optional(),
    /** Rounded-full filled primary CTA label. */
    getStarted: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: foodDeliveryLakebed,
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'nosh'
    const nav = props.nav?.length
      ? props.nav
      : ['Restaurants', 'How it Works', 'About']
    const homeTarget = props.homeTarget ?? 'Home'
    const signIn = props.signIn ?? 'Sign In'
    const getStarted = props.getStarted ?? 'Get Started'

    const PinMark = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
      </svg>
    )

    return (
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md',
          props.className,
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between lg:h-20">
            <button
              type="button"
              onClick={() => go(homeTarget)}
              className="flex items-center gap-2"
            >
              <BrandLogo
                brand={brand}
                fallback={<PinMark className="size-8 text-foreground" />}
                labelClassName="text-xl font-semibold tracking-tight"
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
            <div className="flex items-center gap-3">
              <FoodDeliverySearchButton
                lakebed={lakebed}
                buttonClassName="inline-flex size-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              />
              <FoodDeliveryAccountButton
                lakebed={lakebed}
                label={signIn}
                buttonClassName="hidden size-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:inline-flex"
              />
              <FoodDeliveryActionButton
                lakebed={lakebed}
                action={getStarted}
                source="navbar"
                pendingChildren={<FoodDeliveryMutationSpinner />}
                className="hidden min-h-10 items-center rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-foreground/90 disabled:pointer-events-none disabled:opacity-60 md:inline-flex"
              >
                {getStarted}
              </FoodDeliveryActionButton>
              <FoodDeliveryMobileMenu
                brand={brand}
                homeTarget={homeTarget}
                nav={nav}
                buttonClassName="inline-flex size-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
              />
            </div>
          </div>
        </div>
      </header>
    )
  },
})
