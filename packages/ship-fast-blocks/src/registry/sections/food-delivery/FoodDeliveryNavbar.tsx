import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Logo as BrandLogo, LogoImage, LogoLabel } from '#/section-kit/Logo.tsx'
import {
  NavbarActions,
  NavbarBrand,
  NavbarNav,
  NavbarNavLink,
  SiteNav,
} from '#/section-kit/index.ts'
import { foodDeliveryLakebed } from './food-delivery-lakebed.ts'
import {
  FoodDeliveryAccountButton,
  FoodDeliveryActionButton,
  FoodDeliveryMobileMenu,
  FoodDeliveryMutationSpinner,
  FoodDeliverySearchButton,
} from './food-delivery-interactions.tsx'

/**
 * FoodDeliveryNavbar — playful-bold, translucent top navigation bar for a
 * food-delivery / restaurant-marketplace site. A backdrop-blurred header with a
 * chunky 2px foreground bottom border pinned to the top: a rounded-full sticker
 * location-pin brand badge beside an extrabold wordmark on the left, a
 * horizontal set of bold nav links in the center (desktop), and a search chip,
 * an account chip, and a chunky rounded-full "Get Started" pill CTA with a hard
 * offset shadow + press feedback on the right. Every link and CTA routes through
 * route hrefs so labels can drive page-switching. Use as the sticky site header
 * for food-delivery apps, restaurant aggregators, online-ordering platforms, or
 * takeout services. Renders fully with no props via baked-in "nosh" defaults.
 */
export const FoodDeliveryNavbar = defineCapsule({
  name: 'FoodDeliveryNavbar',
  description:
    'Playful-bold translucent top navigation bar for a food-delivery / restaurant-marketplace site: a backdrop-blurred header with a chunky 2px foreground bottom border pinned to the top, a rounded-full sticker location-pin brand badge + extrabold wordmark on the left, bold horizontal nav links in the center (desktop), and a search chip, an account chip, and a chunky rounded-full Get Started pill CTA with a hard offset shadow and press feedback on the right. Links and CTAs route through route hrefs for page-switching. Use as the sticky site header for food-delivery apps, restaurant aggregators, online-ordering platforms, ghost-kitchen/meal-delivery startups, or takeout services.',
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
      <SiteNav
        position="fixed"
        height="responsive"
        className={cn(
          'border-b-2 border-foreground bg-background/80 backdrop-blur-md',
          props.className,
        )}
      >
        <NavbarBrand href={homeTarget} className="gap-2.5">
          <BrandLogo brand={brand} className="flex items-center gap-2.5">
            <LogoImage
              className="size-7"
              fallback={
                <span
                  aria-hidden="true"
                  className="grid size-9 -rotate-3 place-items-center rounded-full border-2 border-foreground bg-primary text-primary-foreground shadow-[2px_2px_0_0] shadow-foreground"
                >
                  <PinMark className="size-5" />
                </span>
              }
            />
            <LogoLabel className="text-xl font-extrabold tracking-tight" />
          </BrandLogo>
        </NavbarBrand>

        <NavbarNav>
          {nav.map((label) => (
            <NavbarNavLink
              key={label}
              href={label}
              className="text-sm font-bold text-foreground/70 transition-colors hover:text-foreground"
            >
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>

        <NavbarActions className="gap-2.5">
          <FoodDeliverySearchButton
            lakebed={lakebed}
            buttonClassName="inline-flex size-10 items-center justify-center rounded-full border-2 border-transparent text-muted-foreground transition-colors hover:border-foreground hover:bg-background hover:text-foreground"
          />
          <FoodDeliveryAccountButton
            lakebed={lakebed}
            label={signIn}
            buttonClassName="hidden size-10 items-center justify-center rounded-full border-2 border-transparent text-muted-foreground transition-colors hover:border-foreground hover:bg-background hover:text-foreground sm:inline-flex"
          />
          <FoodDeliveryActionButton
            lakebed={lakebed}
            action={getStarted}
            source="navbar"
            pendingChildren={<FoodDeliveryMutationSpinner />}
            className="hidden min-h-10 items-center rounded-full border-2 border-foreground bg-foreground px-5 py-2 text-sm font-bold text-background shadow-[3px_3px_0_0] shadow-primary/40 transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0] hover:shadow-primary/40 active:translate-y-px active:shadow-none disabled:pointer-events-none disabled:opacity-60 md:inline-flex"
          >
            {getStarted}
          </FoodDeliveryActionButton>
          <FoodDeliveryMobileMenu
            brand={brand}
            homeTarget={homeTarget}
            nav={nav}
            buttonClassName="inline-flex size-10 items-center justify-center rounded-full border-2 border-foreground text-foreground transition-colors hover:bg-foreground hover:text-background md:hidden"
          />
        </NavbarActions>
      </SiteNav>
    )
  },
})
