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
 * AeoNavbar — "Answer Terminal" sticky header for an Answer-Engine-Optimization
 * (AEO) SaaS. A sharp rounded-none primary brand block with a citation-spark
 * glyph sits beside the product name; desktop nav links are mono uppercase
 * micro-labels with a sliding primary underline; the right side keeps command
 * plan search, the Shoo account dropdown, the selected-plan badge, a compact
 * hard-offset-shadow "Start Free" fullstack CTA, and a real mobile drawer.
 * Backdrop blur is preserved and every link routes via route hrefs. Use as the
 * sticky header for AEO, generative-search, or brand-citation analytics
 * products. Renders fully with no props via "Citeable" defaults.
 */
const BrandMark = () => (
  <span
    className="grid size-8 place-items-center rounded-none bg-primary text-primary-foreground"
    aria-hidden="true"
  >
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3l1.9 4.6L18.5 9.5l-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9L12 3Z" />
      <path d="M19 14l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2Z" />
    </svg>
  </span>
)

export const AeoNavbar = defineCapsule({
  name: 'AeoNavbar',
  description:
    "Terminal-styled sticky site header for an Answer-Engine-Optimization (AEO) SaaS: a rounded-none primary brand block with a citation-spark mark, mono uppercase nav micro-labels with sliding underline hovers (Features, How it works, Pricing, FAQ), command plan search, Shoo account dropdown, selected-plan badge, a hard-offset-shadow fullstack 'Start Free' CTA, and a real mobile drawer — all over a backdrop-blur hairline header. Navigation routes through route hrefs while search/auth/conversion state is shared through Lakebed. Use as the sticky header for AEO platforms, generative-search visibility tools, or brand-citation analytics products.",
  props: z.object({
    /** Brand / product name shown beside the logo mark. */
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
  lakebed: saasLakebed,
  component: ({ props, lakebed }) => {
    const brand = props.brand ?? 'Citeable'
    const nav = props.nav?.length
      ? props.nav
      : ['Features', 'How it works', 'Pricing', 'FAQ']
    const ctaLabel = props.ctaLabel ?? 'Start Free'
    const ctaTarget = props.ctaTarget ?? 'Pricing'

    return (
      <SiteNav
        position="sticky"
        height="default"
        className={cn('bg-background/95', props.className)}
      >
        <NavbarBrand href={props.homeTarget ?? brand} className="min-w-0 gap-3">
          <BrandLogo brand={brand}>
            <LogoImage fallback={<BrandMark />} />
            <LogoLabel className="truncate font-mono text-base font-semibold lowercase tracking-tight text-foreground" />
          </BrandLogo>
        </NavbarBrand>

        <NavbarNav className="gap-1">
          {nav.map((label) => (
            <NavbarNavLink
              key={label}
              href={label}
              className="relative rounded-none px-3 py-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground transition-colors duration-150 after:absolute after:inset-x-3 after:bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-primary after:transition-transform after:duration-150 hover:bg-transparent hover:text-foreground hover:after:scale-x-100"
            >
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>

        <NavbarActions className="gap-3">
          <SaasIntentBadge lakebed={lakebed} />
          <SaasSearchButton
            lakebed={lakebed}
            buttonClassName="inline-flex p-2 text-muted-foreground transition-colors duration-150 hover:text-foreground"
          />
          {/* display:contents wrapper squares the kit's rounded Sign-in chip so
              it follows the terminal design language (rounded-none surfaces). */}
          <span className="contents [&_[data-slot=account-dropdown-unauthenticated]]:rounded-none [&_[data-slot=account-dropdown-unauthenticated]]:font-mono [&_[data-slot=account-dropdown-unauthenticated]]:text-[11px] [&_[data-slot=account-dropdown-unauthenticated]]:uppercase [&_[data-slot=account-dropdown-unauthenticated]]:tracking-[0.15em]">
            <SaasAccountButton
              lakebed={lakebed}
              buttonClassName="p-2 text-muted-foreground transition-colors duration-150 hover:text-foreground"
            />
          </span>
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
            className="hidden items-center justify-center gap-2 rounded-none bg-primary px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-primary-foreground shadow-[3px_3px_0_0] shadow-foreground/20 transition-[background-color,box-shadow,transform] duration-150 hover:bg-primary/90 active:translate-y-px active:shadow-none disabled:pointer-events-none disabled:opacity-70 sm:inline-flex"
          >
            {ctaLabel}
          </SaasPlanActionButton>
          <SaasMobileMenu
            brand={brand}
            nav={nav}
            homeTarget={props.homeTarget ?? brand}
            buttonClassName="p-2 text-muted-foreground transition-colors duration-150 hover:text-foreground md:hidden"
          />
        </NavbarActions>
      </SiteNav>
    )
  },
})
