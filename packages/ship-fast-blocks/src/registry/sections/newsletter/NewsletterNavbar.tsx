import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Logo as BrandLogo } from '#/section-kit/Logo.tsx'
import {
  NavbarActions,
  NavbarBrand,
  NavbarNav,
  NavbarNavLink,
  SiteNav,
} from '#/section-kit/index.ts'
import { newsletterLakebed } from './newsletter-lakebed.ts'
import {
  NewsletterAccountButton,
  NewsletterMobileMenu,
  NewsletterSubscribeDrawer,
} from './newsletter-interactions.tsx'

/**
 * NewsletterNavbar — sticky, backdrop-blurred top navigation bar for an editorial
 * newsletter / subscription site. A serif initial-mark logo tile + publication
 * name sit on the left; on desktop the remaining nav labels render as quiet text
 * links with the final label promoted to an outlined "Subscribe" pill on the
 * right; on mobile a hamburger button collapses to the first nav route. Warm,
 * calm, literary aesthetic on a light paper-toned surface. Every item routes
 * through useNavigate for page-switching. Use as the sticky site header for
 * newsletters, Substack-style publications, blogs, essayists, or content
 * creators. Renders fully with no props via baked-in defaults.
 */
export const NewsletterNavbar = defineCapsule({
  name: 'NewsletterNavbar',
  description:
    "Sticky, backdrop-blurred top navigation bar for an editorial newsletter / subscription site: a serif initial-mark logo tile + publication name on the left, quiet text nav links in the center, and the final nav label promoted to an outlined 'Subscribe' pill on the right (desktop); a hamburger button on mobile. Warm, calm, literary aesthetic on a light paper-toned surface. Items route through useNavigate for page-switching. Use as the sticky site header for newsletters, Substack-style publications, blogs, essayists, digests, or content creators.",
  props: z.object({
    /** Brand / publication name shown beside the serif logo mark. */
    brand: z.string().optional(),
    /** Nav link labels; the last becomes the outlined CTA pill (must match site routes). */
    nav: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  lakebed: newsletterLakebed,
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'The Quiet Observer'
    const nav = props.nav?.length
      ? props.nav
      : ['Recent Issues', 'About', 'Subscribe']

    const LogoMark = ({ className }) => (
      <span
        className={cn(
          'grid place-items-center rounded-lg bg-foreground font-serif font-medium text-background',
          className,
        )}
        aria-hidden="true"
      >
        {brand.charAt(0).toUpperCase()}
      </span>
    )

    return (
      <SiteNav
        position="sticky"
        height="compact"
        className={cn('bg-background/80', props.className)}
        containerClassName="max-w-6xl px-4 sm:px-6 lg:px-8"
      >
        <NavbarBrand asChild>
          <button
            type="button"
            onClick={() => go(brand)}
            className="group flex items-center gap-2"
          >
            <BrandLogo
              brand={brand}
              fallback={<LogoMark className="size-8 text-lg" />}
              labelClassName="font-serif text-xl font-medium tracking-tight text-foreground"
            />
          </button>
        </NavbarBrand>

        <NavbarNav>
          {nav.slice(0, -1).map((label) => (
            <NavbarNavLink key={label} onClick={() => go(label)}>
              {label}
            </NavbarNavLink>
          ))}
          <NewsletterAccountButton
            lakebed={lakebed}
            buttonClassName="inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          />
          <NewsletterSubscribeDrawer
            lakebed={lakebed}
            buttonLabel={nav[nav.length - 1] ?? 'Subscribe'}
            source="navbar"
            buttonClassName="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-foreground disabled:pointer-events-none disabled:opacity-60"
          />
        </NavbarNav>

        <NavbarActions>
          <NewsletterMobileMenu
            brand={brand}
            homeTarget={brand}
            nav={nav}
            buttonClassName="inline-flex size-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
          />
        </NavbarActions>
      </SiteNav>
    )
  },
})
