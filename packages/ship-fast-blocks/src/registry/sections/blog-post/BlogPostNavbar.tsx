import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Logo as BrandLogo, LogoImage, LogoLabel } from '#/section-kit/Logo.tsx'
import {
  NavbarActions,
  NavbarBrand,
  NavbarNav,
  NavbarNavLink,
  SiteNav,
} from '#/section-kit/index.ts'
import {
  PublicationAccountButton,
  PublicationMobileMenu,
  PublicationSearchButton,
  PublicationSubscribeDrawer,
} from '../blog/publication-interactions.tsx'
import { publicationLakebed } from '../blog/publication-lakebed.ts'

/**
 * BlogPostNavbar — sticky reading-page header for a single-article / editorial
 * blog page. A feather / pen wordmark on the left, centered desktop nav links,
 * command article search, a Shoo profile dropdown, a Lakebed subscribe drawer,
 * and a real mobile drawer on small screens. Clean editorial voice. Use as the
 * sticky site header for a blog post, magazine article, journal, or any
 * editorial publication detail page. Renders fully with no props via baked-in
 * defaults.
 */
function FeatherMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
      <path d="M16 8 2 22" />
      <path d="M17.5 15H9" />
    </svg>
  )
}

export const BlogPostNavbar = defineCapsule({
  name: 'BlogPostNavbar',
  description:
    'Sticky reading-page header for a single-article / editorial blog page: a feather/pen wordmark, centered desktop nav links, command article search, a Shoo profile dropdown, a Lakebed subscribe drawer, and a real mobile drawer on small screens. Clean editorial voice. Use as the sticky site header for a blog post, magazine article, journal, or any editorial publication detail page.',
  props: z.object({
    /** Publication / brand name shown in the navbar. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Label for the subscribe CTA on the right. */
    subscribeCta: z.string().optional(),
    /** Navigation target for the logo / brand click (defaults to first nav item). */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: publicationLakebed,
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const nav = props.nav?.length
      ? props.nav
      : ['Home', 'Articles', 'Topics', 'About']
    const brand = props.brand ?? 'The Editorial'
    const homeTarget = props.homeTarget ?? nav[0]
    const subscribeCta = props.subscribeCta ?? 'Subscribe'

    return (
      <SiteNav
        position="sticky"
        height="compact"
        className={cn('bg-background/95', props.className)}
        containerClassName="max-w-5xl px-6 lg:px-8"
      >
        <NavbarBrand asChild>
          <button
            type="button"
            onClick={() => go(homeTarget)}
            className="min-w-0 gap-3"
          >
            <BrandLogo brand={brand}>
              <LogoImage
                fallback={<FeatherMark className="size-7 text-primary" />}
              />
              <LogoLabel className="truncate text-xl font-semibold text-foreground" />
            </BrandLogo>
          </button>
        </NavbarBrand>

        <NavbarNav>
          {nav.map((label) => (
            <NavbarNavLink key={label} onClick={() => go(label)}>
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>

        <NavbarActions className="gap-3">
          <PublicationSearchButton
            lakebed={lakebed}
            buttonClassName="hidden p-2 text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          />
          <PublicationAccountButton
            lakebed={lakebed}
            buttonClassName="p-2 text-muted-foreground transition-colors hover:text-foreground"
          />
          <PublicationSubscribeDrawer
            lakebed={lakebed}
            buttonLabel={subscribeCta}
            source="blog post navbar"
            buttonClassName="hidden rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-foreground sm:inline-flex"
          />
          <PublicationMobileMenu
            brand={brand}
            nav={nav}
            homeTarget={homeTarget}
            buttonClassName="p-2 text-muted-foreground transition-colors hover:text-foreground md:hidden"
          />
        </NavbarActions>
      </SiteNav>
    )
  },
})
