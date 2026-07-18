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
} from './publication-interactions.tsx'
import { publicationLakebed } from './publication-lakebed.ts'

/**
 * BlogNavbar — sticky editorial site header for a blog, magazine, newsroom, or
 * content hub. A clean wordmark beside a gradient brand tile + inline mark,
 * horizontal nav links with a home highlight on desktop, command article search,
 * a Shoo profile dropdown, a Lakebed subscribe drawer, and a real mobile drawer
 * (Sheet) on small screens. No phone number — editorial publications don't show
 * one. Use as the header for blogs, publications, journals, or any content site.
 * Renders fully with no props.
 */
function QuillMark({ className }: { className?: string }) {
  return (
    <span
      className={`grid size-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-sm ${className ?? ''}`}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="5" cy="19" r="2" />
        <circle cx="19" cy="5" r="2" />
        <path d="M5 17C5 9 11 5 17 5" />
      </svg>
    </span>
  )
}

export const BlogNavbar = defineCapsule({
  name: 'BlogNavbar',
  description:
    "Sticky editorial site header for a blog, magazine, newsroom, or content hub: a clean wordmark beside a gradient brand tile + inline mark, horizontal desktop nav links with a home highlight, command article search, a Shoo profile dropdown, a Lakebed subscribe drawer, and a real mobile drawer. No phone number — editorial publications don't show one. Use as the header for blogs, publications, journals, or any content site.",
  props: z.object({
    /** Brand / publication name shown beside the logo tile. */
    brand: z.string().optional(),
    /** Nav link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Navigation target for the logo / brand click. */
    homeTarget: z.string().optional(),
    /** Pill-shaped CTA label on the right. */
    ctaLabel: z.string().optional(),
    /** Navigation target for the pill CTA. */
    ctaTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: publicationLakebed,
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const nav = props.nav?.length
      ? props.nav
      : ['Home', 'Design', 'Engineering', 'Product', 'About']
    const brand = props.brand ?? 'Form & Function'
    const homeTarget = props.homeTarget ?? nav[0]
    const ctaLabel = props.ctaLabel ?? 'Subscribe'
    const ctaTarget = props.ctaTarget ?? 'Subscribe'

    return (
      <SiteNav
        position="sticky"
        height="compact"
        className={cn('bg-background/95', props.className)}
      >
        <NavbarBrand asChild>
          <button
            type="button"
            onClick={() => go(homeTarget)}
            className="min-w-0 gap-3"
          >
            <BrandLogo brand={brand}>
              <LogoImage
                fallback={<QuillMark className="size-8 text-primary" />}
              />
              <LogoLabel className="truncate text-xl font-bold tracking-tight text-foreground" />
            </BrandLogo>
          </button>
        </NavbarBrand>

        <NavbarNav>
          {nav.map((label) => (
            <NavbarNavLink
              key={label}
              onClick={() => go(label)}
              className={cn(
                label === homeTarget
                  ? 'text-foreground'
                  : 'text-muted-foreground',
              )}
            >
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
            buttonLabel={ctaLabel}
            source={ctaTarget}
            buttonClassName="hidden rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:inline-flex"
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
