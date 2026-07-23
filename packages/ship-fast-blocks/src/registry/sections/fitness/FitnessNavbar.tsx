import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Logo as BrandLogo, LogoImage, LogoLabel } from '#/section-kit/Logo.tsx'
import { MobileNavDrawer } from '#/section-kit/MobileNavDrawer.tsx'
import {
  NavbarActions,
  NavbarBrand,
  NavbarNav,
  NavbarNavLink,
  SiteNav,
} from '#/section-kit/SiteNav.tsx'
import { SignInButton } from '#/section-kit/SignInButton.tsx'
import { newsletterLakebed } from '../newsletter/newsletter-lakebed.ts'
import {
  NewsletterAccountButton,
  NewsletterSubscribeForm,
  NewsletterSubscribeDrawer,
} from '../newsletter/newsletter-interactions.tsx'

/**
 * FitnessNavbar — sticky translucent top navigation bar for a gym / fitness-studio
 * site. A backdrop-blurred, border-bottomed header pinned to the top with a square
 * monogram logo tile (first letter of the brand) + short brand wordmark on the left,
 * horizontal muted-to-foreground nav links on the right (desktop), a filled primary
 * pill CTA built from the LAST nav item (e.g. "Start Trial"), and a hamburger menu
 * button on mobile. Every link and CTA routes through route hrefs so PageSwitch can
 * swap pages. Use as the sticky site header for gyms, fitness studios, CrossFit
 * boxes, yoga / pilates / boxing / spin studios or personal-training businesses.
 */
export const FitnessNavbar = defineCapsule({
  name: 'FitnessNavbar',
  description:
    "Sticky translucent top navigation bar for a gym / fitness-studio site: a backdrop-blurred, border-bottomed header with a square monogram logo tile (first letter of the brand) + short brand wordmark on the left, horizontal muted-to-foreground nav links on the right (desktop), a filled primary pill CTA built from the LAST nav item (e.g. 'Start Trial'), and a hamburger menu button on mobile. All links and CTAs route through route hrefs. Use as the sticky site header for gyms, fitness studios, CrossFit boxes, yoga, pilates, boxing, spin / cycle studios, or personal-training businesses.",
  props: z.object({
    /** Brand / studio name; first letter forms the monogram, first word is shown. */
    brand: z.string().optional(),
    /** Nav link labels; the LAST item becomes the filled primary pill CTA. */
    nav: z.array(z.string()).optional(),
    /** Label for the sign-in button. */
    signIn: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: newsletterLakebed,
  component: ({ props, lakebed }) => {
    const brand = props.brand ?? 'Base Fitness Studio'
    const brandShort = brand.split(/\s+/)[0]?.toUpperCase() ?? 'BASE'
    const nav = props.nav?.length
      ? props.nav
      : ['Classes', 'Trainers', 'Schedule', 'Membership', 'Start Trial']
    const navPrimary = nav[nav.length - 1] ?? 'Start Trial'
    const signIn = props.signIn ?? 'Sign in'
    return (
      <SiteNav
        position="sticky"
        height="compact"
        className={cn('bg-background/90', props.className)}
      >
        <NavbarBrand href={nav[0]} className="gap-2">
          <BrandLogo brand={brandShort}>
            <LogoImage
              fallback={
                <span
                  className="grid size-8 place-items-center rounded-sm bg-foreground text-sm font-bold text-background"
                  aria-hidden="true"
                >
                  {brandShort.charAt(0)}
                </span>
              }
            />
            <LogoLabel className="text-lg font-semibold tracking-tight" />
          </BrandLogo>
        </NavbarBrand>

        <NavbarNav className="[&>button]:font-normal">
          {nav.slice(0, -1).map((label) => (
            <NavbarNavLink key={label} href={label}>
              {label}
            </NavbarNavLink>
          ))}
          <NewsletterAccountButton
            lakebed={lakebed}
            buttonClassName="inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          />
          <NewsletterSubscribeDrawer
            lakebed={lakebed}
            buttonLabel={navPrimary}
            source="navbar"
            buttonClassName="rounded-sm bg-primary px-4 py-2 text-sm text-primary-foreground transition-colors hover:bg-primary/90"
          />
        </NavbarNav>

        <NavbarActions>
          <SignInButton
            variant="ghost"
            label={signIn}
            className="hidden sm:block"
          />
          <MobileNavDrawer
            brand={brandShort}
            nav={nav.slice(0, -1)}
            homeTarget={nav[0]}
            buttonClassName="inline-flex size-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
            footer={
              <NewsletterSubscribeForm
                lakebed={lakebed}
                source="navbar"
                buttonLabel={navPrimary}
                pendingLabel="Joining"
                placeholder="you@example.com"
                successMessage="You're on the list for the trial."
                className="grid gap-2"
                inputClassName="min-h-11 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
                buttonClassName="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-60"
              />
            }
          />
        </NavbarActions>
      </SiteNav>
    )
  },
})
