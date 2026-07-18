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
} from '#/section-kit/index.ts'
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
 * CybersecurityNavbar — sticky, translucent top navigation bar for an
 * enterprise security-platform site. A backdrop-blurred, border-bottomed header
 * pinned to the top of the viewport: a shield-glyph logo beside the brand name
 * on the left, a horizontal set of nav links in the center (desktop), and a
 * "Contact Sales" text link plus a solid primary "Get Demo" CTA on the right.
 * Every nav item, the contact link and the CTA route through route hrefs so
 * labels can drive page-switching. Use as the sticky site header for
 * cybersecurity vendors, SOC/MDR/XDR/SIEM providers, zero-trust, cloud-security,
 * compliance-automation, or any authoritative B2B security SaaS landing page.
 * Renders fully with no props via baked-in "SentinelGuard" defaults.
 */
export const CybersecurityNavbar = defineCapsule({
  name: 'CybersecurityNavbar',
  description:
    'Sticky translucent top navigation bar for an enterprise cybersecurity / security-platform site: backdrop-blurred, border-bottomed header pinned to the top with a shield-glyph logo + brand name, horizontal nav links, command plan search, Shoo profile dropdown, selected-plan badge, scoped contact/demo CTAs, and a reusable Sheet mobile drawer. Nav links route through route hrefs while conversion CTAs write to shared Lakebed state.',
  props: z.object({
    /** Brand / product name shown beside the shield logo. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Right-side text link label (sales contact). */
    contactLabel: z.string().optional(),
    /** Solid primary CTA button label. */
    ctaLabel: z.string().optional(),
    /** Navigation target fired by the primary CTA button. */
    ctaTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: saasLakebed,
  component: ({ props, lakebed }) => {
    const brand = props.brand ?? 'SentinelGuard'
    const nav = props.nav?.length
      ? props.nav
      : ['Platform', 'Solutions', 'Pricing', 'Resources']
    const contactLabel = props.contactLabel ?? 'Contact Sales'
    const ctaLabel = props.ctaLabel ?? 'Get Demo'
    const ctaTarget = props.ctaTarget ?? 'Schedule Live Demo'

    const ShieldMark = ({ className }: { className?: string }) => (
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
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    )

    return (
      <SiteNav
        position="sticky"
        height="compact"
        className={cn('bg-background/95', props.className)}
      >
        <NavbarBrand href={nav[0]} className="gap-2">
          <BrandLogo brand={brand}>
            <LogoImage
              fallback={<ShieldMark className="size-8 text-foreground" />}
            />
            <LogoLabel className="text-xl font-bold tracking-tight" />
          </BrandLogo>
        </NavbarBrand>

        <NavbarNav className="[&>button]:font-normal">
          {nav.map((label) => (
            <NavbarNavLink key={label} href={label}>
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>

        <NavbarActions className="gap-4">
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
            intentLabel={contactLabel}
            plan={contactLabel}
            source="navbar-contact"
            pendingChildren={<SaasMutationSpinner className="size-4" />}
            className="hidden items-center justify-center gap-2 text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-70 lg:inline-flex"
          >
            {contactLabel}
          </SaasPlanActionButton>
          <SaasPlanActionButton
            lakebed={lakebed}
            intentLabel={ctaTarget}
            plan={ctaTarget}
            source="navbar"
            pendingChildren={
              <>
                <SaasMutationSpinner className="size-4" />
                Scheduling
              </>
            }
            className="hidden items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-70 sm:inline-flex"
          >
            {ctaLabel}
          </SaasPlanActionButton>
          <SaasMobileMenu
            brand={brand}
            nav={nav}
            homeTarget={nav[0]}
            buttonClassName="p-2 text-muted-foreground transition-colors hover:text-foreground md:hidden"
          />
        </NavbarActions>
      </SiteNav>
    )
  },
})
