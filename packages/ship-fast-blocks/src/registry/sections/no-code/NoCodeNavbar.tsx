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
 * NoCodeNavbar — sticky, block-builder-kinetic top navigation bar for a no-code
 * / drag-and-drop app-builder SaaS site. A backdrop-blurred, hairline-bottomed
 * header pinned to the top: a sharp stacked-blocks brand glyph beside the
 * product name on the left, mono uppercase nav links in the center (desktop),
 * and command plan search, Shoo profile dropdown, selected-plan badge plus a
 * square hard-offset-shadow "Start building free" CTA with press feedback on
 * the right. Every link routes through route hrefs so labels can drive
 * page-switching while conversion CTAs write to shared Lakebed state. Use as
 * the sticky site header for no-code / website-builder / page-builder / SaaS
 * platform landing pages. Renders fully with no props via baked-in "Buildr"
 * defaults.
 */
export const NoCodeNavbar = defineCapsule({
  name: 'NoCodeNavbar',
  description:
    'Sticky block-builder-kinetic top navigation bar for a no-code / app-builder SaaS site: backdrop-blurred, hairline-bottomed header pinned to the top with a sharp stacked-blocks brand glyph + product name, mono uppercase nav links, command plan search, Shoo profile dropdown, selected-plan badge, a square hard-offset-shadow scoped fullstack CTA with press feedback, and a reusable Sheet mobile drawer. Nav links route through route hrefs while conversion CTAs write to shared Lakebed state.',
  props: z.object({
    /** Brand / product name shown beside the logo tile. */
    brand: z.string().optional(),
    /** Top-level nav link labels (should match site routes). */
    nav: z.array(z.string()).optional(),
    /** Text link label on the right (e.g. Sign in). */
    signInLabel: z.string().optional(),
    /** Filled primary CTA label on the right. */
    cta: z.string().optional(),
    /** Navigation target for the brand button (defaults to first nav item). */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: saasLakebed,
  component: ({ props, lakebed }) => {
    const brand = props.brand ?? 'Buildr'
    const nav = props.nav?.length
      ? props.nav
      : ['Features', 'Templates', 'Pricing', 'Stories']
    const signInLabel = props.signInLabel ?? 'Sign in'
    const cta = props.cta ?? 'Start building free'
    const homeTarget = props.homeTarget ?? nav[0]

    const LogoMark = ({ className }: { className?: string }) => (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 2 2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    )

    return (
      <SiteNav
        position="sticky"
        height="compact"
        className={cn(
          'border-b border-border bg-background/80 backdrop-blur-md',
          props.className,
        )}
        containerClassName="max-w-7xl px-4 sm:px-6 lg:px-8"
      >
        <NavbarBrand href={homeTarget} className="gap-2">
          <BrandLogo brand={brand} className="flex items-center gap-2">
            <LogoImage
              className="size-7"
              fallback={<LogoMark className="size-7 text-primary" />}
            />
            <LogoLabel className="text-lg font-bold tracking-tight text-foreground" />
          </BrandLogo>
        </NavbarBrand>

        <NavbarNav>
          {nav.map((label) => (
            <NavbarNavLink
              key={label}
              href={label}
              className="font-mono text-xs uppercase tracking-[0.14em]"
            >
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>

        <NavbarActions className="gap-3">
          <SaasIntentBadge lakebed={lakebed} />
          <SaasSearchButton
            lakebed={lakebed}
            buttonClassName="hidden p-2 text-muted-foreground transition-colors hover:text-foreground lg:inline-flex"
          />
          <SaasAccountButton
            lakebed={lakebed}
            label={signInLabel}
            buttonClassName="p-2 text-muted-foreground transition-colors hover:text-foreground"
          />
          <SaasPlanActionButton
            lakebed={lakebed}
            intentLabel={cta}
            plan={cta}
            source="navbar"
            pendingChildren={
              <>
                <SaasMutationSpinner className="size-4" />
                Starting
              </>
            }
            className="hidden items-center gap-2 whitespace-nowrap rounded-none bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[3px_3px_0_0] shadow-foreground transition-[transform,box-shadow,background-color] duration-150 hover:bg-primary/90 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none motion-reduce:transform-none disabled:pointer-events-none disabled:opacity-70 sm:inline-flex"
          >
            {cta}
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
