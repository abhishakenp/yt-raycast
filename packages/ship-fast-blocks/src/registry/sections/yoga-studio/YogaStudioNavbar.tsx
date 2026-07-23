import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { Logo as BrandLogo, LogoImage, LogoLabel } from '#/section-kit/Logo.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import { MobileNavDrawer } from '#/section-kit/MobileNavDrawer.tsx'
import { cn } from '#/lib/utils.ts'
import {
  NavbarActions,
  NavbarBrand,
  NavbarCta,
  NavbarNav,
  NavbarNavLink,
  SiteNav,
} from '#/section-kit/SiteNav.tsx'
import { SignInButton } from '#/section-kit/SignInButton.tsx'
/**
 * YogaStudioNavbar — serene, airy top navigation for a yoga-studio site. A thin,
 * backdrop-blurred, hairline-bordered header on the shared `SiteNav` composite:
 * a clean-sans wordmark paired with a mono micro-label behind a hairline divider
 * on the left, quiet muted nav links (Classes / Schedule / Teachers / Pricing)
 * on the right, a sharp-cornered filled-primary "Start Free Trial" CTA with press
 * feedback, and a real mobile drawer (Sheet) on small screens. The wordmark and
 * every nav item route through route hrefs. Use as the opening site navigation
 * for yoga studios, movement spaces, pilates studios, and mindfulness centers.
 * Renders fully with no props via baked-in defaults.
 */
export const YogaStudioNavbar = defineCapsule({
  name: 'YogaStudioNavbar',
  description:
    "Serene airy top navigation for a yoga-studio site on the shared SiteNav composite: a thin backdrop-blurred hairline-bordered header with a clean-sans wordmark and a mono micro-label behind a hairline divider on the left, quiet muted nav links (Classes / Schedule / Teachers / Pricing) on the right, a sharp-cornered filled-primary 'Start Free Trial' CTA with press feedback, and a real mobile drawer on small screens. The wordmark and links route through route hrefs. Use as the opening site navigation for yoga studios, movement spaces, pilates studios, and mindfulness centers.",
  props: z.object({
    /** Wordmark / brand name on the left. */
    brand: z.string().optional(),
    /** Center nav link labels. */
    links: z.array(z.string()).optional(),
    /** Primary trial CTA label. */
    cta: z.string().optional(),
    /** Route label the CTA navigates to. */
    ctaTarget: z.string().optional(),
    /** Route label the wordmark navigates to. */
    homeTarget: z.string().optional(),
    /** Label for the sign-in button. */
    signIn: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const links = props.links?.length
      ? props.links
      : ['Classes', 'Schedule', 'Teachers', 'Pricing']
    const brand = props.brand ?? 'Grove Yoga'
    const brandClassName = 'text-xl font-semibold tracking-tight'
    const ctaLabel = props.cta ?? 'Start Free Trial'
    const ctaTarget = props.ctaTarget ?? 'Trial'
    const homeTarget = props.homeTarget ?? 'Home'
    const signIn = props.signIn ?? 'Sign in'
    return (
      <SiteNav
        position="fixed"
        height="default"
        className={cn('bg-background/90', props.className)}
      >
        <NavbarBrand href={homeTarget} className="gap-3 text-left">
          <BrandLogo brand={brand} className="flex items-center gap-2">
            <LogoImage className="size-7" />
            <LogoLabel className={brandClassName} />
          </BrandLogo>
          <span
            aria-hidden="true"
            className="hidden h-4 w-px bg-border lg:block"
          />
          <MonoTag className="hidden lg:inline-block">Studio</MonoTag>
        </NavbarBrand>
        <NavbarNav className="gap-8 [&>button]:font-normal">
          {links.map((label) => (
            <NavbarNavLink
              key={label}
              href={label}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>
        <NavbarActions>
          <SignInButton
            variant="ghost"
            label={signIn}
            className="hidden sm:block"
          />
          <NavbarCta
            variant="primary-pill"
            className="hidden rounded-none px-5 py-2.5 transition-colors active:translate-y-px sm:inline-flex"
            href={ctaTarget}
          >
            {ctaLabel}
          </NavbarCta>
          <MobileNavDrawer
            brand={brand}
            nav={links}
            homeTarget={homeTarget}
            cta={{ label: ctaLabel, target: ctaTarget }}
            buttonClassName="inline-flex size-9 items-center justify-center rounded-none border border-border p-0 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:translate-y-px md:hidden"
          />
        </NavbarActions>
      </SiteNav>
    )
  },
})
