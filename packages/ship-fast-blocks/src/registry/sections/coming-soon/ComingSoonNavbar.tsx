import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Logo as BrandLogo, LogoImage, LogoLabel } from '#/section-kit/Logo.tsx'
import { MobileNavDrawer } from '#/section-kit/MobileNavDrawer.tsx'
import {
  NavbarActions,
  NavbarBrand,
  NavbarNavLink,
  SiteNav,
} from '#/section-kit/index.ts'
import { newsletterLakebed } from '../newsletter/newsletter-lakebed.ts'
import {
  NewsletterAccountButton,
  NewsletterSubscribeForm,
  NewsletterSubscribeDrawer,
} from '../newsletter/newsletter-interactions.tsx'

/**
 * ComingSoonNavbar — minimal top navigation bar for a "launching soon" / waitlist
 * pre-launch landing page. A clean, airy header with the brand name on the left
 * and two text-link nav items on the right (desktop); the last nav item gets an
 * underlined "active" treatment. Every link routes through route hrefs so labels
 * can drive page-switching. Use as the site header for SaaS waitlists, app
 * pre-launch pages, beta sign-up landers, or any minimal coming-soon page.
 * Renders fully with no props via baked-in "Nexus" defaults.
 */
export const ComingSoonNavbar = defineCapsule({
  name: 'ComingSoonNavbar',
  description:
    "Minimal top navigation bar for a 'launching soon' / waitlist pre-launch landing page: clean airy header with the brand name on the left and two text-link nav items on the right (desktop), with the last nav item underlined as the active state. Links route through route hrefs for page-switching. Use as the site header for SaaS waitlists, app pre-launch pages, beta sign-up landers, or minimal coming-soon pages.",
  props: z.object({
    /** Brand / product name shown in the navbar. */
    brand: z.string().optional(),
    /** Nav link labels (first is the subtle link, last is the underlined CTA). */
    links: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  lakebed: newsletterLakebed,
  component: ({ props, lakebed }) => {
    const brand = props.brand ?? 'Nexus'
    const links = props.links?.length
      ? props.links
      : ['Features', 'Join Waitlist']

    return (
      <SiteNav
        position="sticky"
        height="outlier"
        className={cn('border-0', props.className)}
        containerClassName="max-w-6xl xl:px-12"
        rowClassName="py-6"
      >
        <NavbarBrand
          href={brand}
          aria-label={`${brand} Home`}
          className="text-xl font-semibold tracking-tight text-foreground"
        >
          <BrandLogo brand={brand} className="mr-2 size-7 align-middle">
            <LogoImage className="mr-2 size-7 align-middle" />
            <LogoLabel />
          </BrandLogo>
        </NavbarBrand>

        <NavbarActions className="gap-6">
          <NavbarNavLink href={links[0]} className="hidden sm:block">
            {links[0]}
          </NavbarNavLink>
          <NewsletterAccountButton
            lakebed={lakebed}
            buttonClassName="hidden size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:inline-flex"
          />
          <NewsletterSubscribeDrawer
            lakebed={lakebed}
            buttonLabel={links[links.length - 1] ?? 'Join Waitlist'}
            source="navbar"
            buttonClassName="hidden border-b border-foreground text-sm font-medium text-foreground transition-colors hover:border-muted-foreground hover:text-muted-foreground sm:inline-flex"
          />
          <MobileNavDrawer
            brand={brand}
            label="Menu"
            nav={links.slice(0, -1)}
            homeTarget={brand}
            buttonClassName="inline-flex size-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:hidden"
            footer={
              <NewsletterSubscribeForm
                lakebed={lakebed}
                source="navbar"
                buttonLabel={links[links.length - 1] ?? 'Join Waitlist'}
                pendingLabel="Joining"
                placeholder="you@example.com"
                successMessage="You're on the waitlist."
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
