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
 * ComingSoonNavbar — kinetic teaser top navigation bar for a "launching soon" /
 * waitlist pre-launch landing page. A sharp hairline-bottom sticky header with
 * the brand on the left and, on the right, a mono uppercase nav link plus a
 * square sharp-cornered "join" chip with a hard offset shadow and press
 * feedback (desktop); mobile collapses into a drawer with an inline subscribe
 * form. Every link routes through route hrefs so labels can drive
 * page-switching. Use as the site header for SaaS waitlists, app pre-launch
 * pages, beta sign-up landers, or any minimal coming-soon page. Renders fully
 * with no props via baked-in "Nexus" defaults.
 */
export const ComingSoonNavbar = defineCapsule({
  name: 'ComingSoonNavbar',
  description:
    "Kinetic teaser top navigation bar for a 'launching soon' / waitlist pre-launch landing page: sharp hairline-bottom sticky header with the brand on the left and, on the right, a mono uppercase nav link plus a square sharp-cornered 'join' chip with hard offset shadow and press feedback (desktop); mobile collapses into a drawer with an inline subscribe form. Links route through route hrefs for page-switching. Use as the site header for SaaS waitlists, app pre-launch pages, beta sign-up landers, or minimal coming-soon pages.",
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
        className={cn('border-b-2 border-foreground', props.className)}
        containerClassName="max-w-6xl xl:px-12"
        rowClassName="py-4"
      >
        <NavbarBrand
          href={brand}
          aria-label={`${brand} Home`}
          className="font-extrabold uppercase tracking-tighter text-foreground"
        >
          <BrandLogo brand={brand} className="flex items-center gap-2">
            <LogoImage className="size-7" />
            <LogoLabel className="text-xl font-extrabold uppercase tracking-tighter" />
          </BrandLogo>
        </NavbarBrand>

        <NavbarActions className="gap-5">
          <NavbarNavLink
            href={links[0]}
            className="hidden font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground sm:block"
          >
            {links[0]}
          </NavbarNavLink>
          <NewsletterAccountButton
            lakebed={lakebed}
            buttonClassName="hidden size-9 items-center justify-center rounded-none border border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground active:translate-y-px sm:inline-flex"
          />
          <NewsletterSubscribeDrawer
            lakebed={lakebed}
            buttonLabel={links[links.length - 1] ?? 'Join Waitlist'}
            source="navbar"
            buttonClassName="hidden items-center whitespace-nowrap rounded-none bg-primary px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-foreground shadow-[3px_3px_0_0] shadow-foreground transition-[transform,box-shadow] duration-100 hover:-translate-y-0.5 active:translate-y-px active:shadow-[1px_1px_0_0] active:shadow-foreground sm:inline-flex"
          />
          <MobileNavDrawer
            brand={brand}
            label="Menu"
            nav={links.slice(0, -1)}
            homeTarget={brand}
            buttonClassName="inline-flex size-10 items-center justify-center rounded-none border border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground active:translate-y-px sm:hidden"
            footer={
              <NewsletterSubscribeForm
                lakebed={lakebed}
                source="navbar"
                buttonLabel={links[links.length - 1] ?? 'Join Waitlist'}
                pendingLabel="Joining"
                placeholder="you@example.com"
                successMessage="You're on the waitlist."
                className="grid gap-2"
                inputClassName="min-h-11 rounded-none border-2 border-foreground/25 bg-background px-3 font-mono text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
                buttonClassName="inline-flex min-h-11 items-center justify-center rounded-none bg-primary px-4 py-2 font-mono text-[12px] font-semibold uppercase tracking-[0.14em] text-primary-foreground shadow-[3px_3px_0_0] shadow-foreground transition-[transform,box-shadow] duration-100 active:translate-y-px active:shadow-[1px_1px_0_0] active:shadow-foreground disabled:pointer-events-none disabled:opacity-60"
              />
            }
          />
        </NavbarActions>
      </SiteNav>
    )
  },
})
