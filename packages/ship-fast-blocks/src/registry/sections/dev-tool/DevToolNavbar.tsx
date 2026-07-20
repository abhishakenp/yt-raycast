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
} from '#/section-kit/SiteNav.tsx'
import {
  SaasAccountButton,
  SaasIntentBadge,
  SaasMobileMenu,
  SaasMutationSpinner,
  SaasPlanActionButton,
  SaasSearchButton,
} from '../saas/saas-interactions.tsx'
import { saasLakebed } from '../saas/saas-lakebed.ts'

/**
 * DevToolNavbar — terminal-grammar sticky navigation bar for a developer tool /
 * API platform marketing site. A hairline-bottomed, backdrop-blurred header
 * with a square primary "bolt" logo tile + product wordmark on the left, mono
 * uppercase nav links (each prefixed with a faint "./" path glyph) across the
 * center, and on the right the command plan search, Shoo account dropdown,
 * selected-plan badge, and a square-cornered mono "Get Started" CTA with a hard
 * offset shadow and press feedback, plus a real mobile drawer. Navigation
 * routes through route hrefs while auth/search/conversion state is shared
 * through Lakebed. Use as the sticky site header for developer tools, API
 * platforms, backend-as-a-service, or technical SaaS products.
 */
export const DevToolNavbar = defineCapsule({
  name: 'DevToolNavbar',
  description:
    "Terminal-grammar sticky navigation bar for a developer tool / API platform site: a hairline-bottomed, backdrop-blurred header with a square primary 'bolt' logo tile + product wordmark, mono uppercase './'-prefixed nav links, command plan search, Shoo account dropdown, selected-plan badge, a square hard-shadow fullstack 'Get Started' CTA with press feedback, and a real mobile drawer. Navigation routes through route hrefs while auth/search/conversion state is shared through Lakebed. Use as the sticky site header for developer tools, API platforms, backend-as-a-service, or technical SaaS.",
  props: z.object({
    /** Brand / product name shown beside the logo tile. */
    brand: z.string().optional(),
    /** Top-level navbar link labels. */
    nav: z.array(z.string()).optional(),
    /** Navigation target for the brand logo button (e.g. nav[0]). */
    homeTarget: z.string().optional(),
    /** Label for the secondary text link. */
    signInLabel: z.string().optional(),
    /** Label shown on the primary filled CTA button. */
    ctaLabel: z.string().optional(),
    /** Navigation target for the primary CTA button. */
    ctaTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: saasLakebed,
  component: ({ props, lakebed }) => {
    const brand = props.brand ?? 'DevStack'
    const nav = props.nav?.length
      ? props.nav
      : ['Features', 'Pricing', 'Docs', 'Blog']
    const homeTarget = props.homeTarget ?? 'Features'
    const ctaLabel = props.ctaLabel ?? 'Get Started'
    const ctaTarget = props.ctaTarget ?? 'Start Building Free'

    const BoltMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          'grid place-items-center rounded-none bg-primary text-primary-foreground',
          className,
        )}
        aria-hidden="true"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </span>
    )

    return (
      <SiteNav
        position="sticky"
        height="compact"
        className={cn('bg-background/90 backdrop-blur-md', props.className)}
      >
        <NavbarBrand href={homeTarget} className="gap-2">
          <BrandLogo brand={brand} className="flex items-center gap-2">
            <LogoImage
              className="size-7"
              fallback={<BoltMark className="size-7" />}
            />
            <LogoLabel className="font-mono text-lg font-bold tracking-tight text-foreground" />
          </BrandLogo>
        </NavbarBrand>

        <NavbarNav>
          {nav.map((label) => (
            <NavbarNavLink
              key={label}
              href={label}
              className="font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-foreground"
            >
              <span
                aria-hidden="true"
                className="mr-1 text-muted-foreground/50"
              >
                ./
              </span>
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>

        <NavbarActions className="gap-3">
          <SaasIntentBadge lakebed={lakebed} />
          <SaasSearchButton
            lakebed={lakebed}
            buttonClassName="hidden p-2 text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          />
          <SaasAccountButton
            lakebed={lakebed}
            buttonClassName="p-2 text-muted-foreground transition-colors hover:text-foreground"
          />
          <SaasPlanActionButton
            lakebed={lakebed}
            intentLabel={ctaTarget}
            plan={ctaLabel}
            source="navbar"
            pendingChildren={
              <>
                <SaasMutationSpinner className="size-4" />
                Starting
              </>
            }
            className="hidden items-center rounded-none bg-primary px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.08em] text-primary-foreground shadow-[3px_3px_0_0] shadow-foreground transition-[transform,box-shadow,background-color] duration-150 hover:bg-primary/90 active:translate-x-px active:translate-y-px active:shadow-none motion-reduce:transform-none disabled:pointer-events-none disabled:opacity-70 sm:inline-flex md:hidden lg:inline-flex"
          >
            {ctaLabel}
          </SaasPlanActionButton>
          <SaasMobileMenu
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
