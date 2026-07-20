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
 * AiProductNavbar — kinetic tech-editorial sticky top navigation bar for an AI
 * SaaS / product landing page. A backdrop-blurred, hairline-bordered header
 * pinned to the top with a sharp-cornered near-black brand tile + pen glyph
 * and tight-tracked product name on the left, mono uppercase micro-label nav
 * links (desktop), and on the right a "Sign in" text link plus a skewed
 * near-black primary CTA block whose label counter-skews upright. Every link
 * and CTA routes through route hrefs for page-switching. Use as the sticky
 * site header for AI writing assistants, AI copilots, generative-AI tools,
 * developer-AI products, or any modern minimal SaaS marketing site. Renders
 * fully with no props.
 */
export const AiProductNavbar = defineCapsule({
  name: 'AiProductNavbar',
  description:
    'Kinetic tech-editorial sticky backdrop-blurred top navigation bar for an AI SaaS / product landing page: a sharp-cornered near-black brand tile with a pen/edit glyph + tight-tracked product name on the left, mono uppercase micro-label nav links, command plan search, Shoo profile dropdown, selected-plan badge, a skewed near-black fullstack primary CTA block whose label counter-skews upright, and a real mobile drawer. Links route through route hrefs while auth and conversion actions use shared Lakebed state. Use as the sticky site header for AI writing assistants, AI copilots, generative-AI tools, developer-AI products, or any modern minimal conversion-focused SaaS marketing site.',
  props: z.object({
    /** Brand / product name shown beside the logo tile. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Muted text link label on the right. */
    signInLabel: z.string().optional(),
    /** Filled primary CTA button label on the right. */
    cta: z.string().optional(),
    /** Navigation target for the primary CTA (defaults to the hero's start action). */
    ctaTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: saasLakebed,
  component: ({ props, lakebed }) => {
    const brand = props.brand ?? 'WriteFlow'
    const nav = props.nav?.length
      ? props.nav
      : ['Features', 'Pricing', 'Stories', 'FAQ']
    const signInLabel = props.signInLabel ?? 'Sign in'
    const cta = props.cta ?? 'Start free trial'
    const ctaTarget = props.ctaTarget ?? 'Start writing free'

    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          'grid place-items-center rounded-none bg-foreground text-background',
          className,
        )}
        aria-hidden="true"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      </span>
    )

    return (
      <SiteNav
        position="sticky"
        height="responsive"
        className={cn(
          'border-b border-border bg-background/80 backdrop-blur-md',
          props.className,
        )}
      >
        <NavbarBrand
          href={brand}
          className="gap-2.5 text-lg font-semibold tracking-tighter text-foreground"
        >
          <BrandLogo brand={brand}>
            <LogoImage fallback={<LogoMark className="size-8" />} />
            <LogoLabel />
          </BrandLogo>
        </NavbarBrand>

        <NavbarNav>
          {nav.map((label) => (
            <NavbarNavLink
              key={label}
              href={label}
              className="rounded-none px-2.5 py-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground hover:bg-transparent hover:text-foreground"
            >
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>

        <NavbarActions className="gap-3 sm:gap-4">
          <SaasIntentBadge lakebed={lakebed} />
          <SaasSearchButton
            lakebed={lakebed}
            buttonClassName="hidden p-2 text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          />
          <SaasAccountButton
            lakebed={lakebed}
            label={signInLabel}
            buttonClassName="rounded-none p-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
          />
          <SaasPlanActionButton
            lakebed={lakebed}
            intentLabel={ctaTarget}
            plan={ctaTarget}
            source="navbar"
            pendingChildren={
              <span className="inline-flex skew-x-6 items-center gap-2">
                <SaasMutationSpinner className="size-4" />
                Starting
              </span>
            }
            className="inline-flex -skew-x-6 items-center justify-center rounded-none bg-foreground px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-background transition-[background-color,transform] duration-150 hover:bg-primary hover:text-primary-foreground active:translate-y-px disabled:pointer-events-none disabled:opacity-70"
          >
            <span className="inline-block skew-x-6">{cta}</span>
          </SaasPlanActionButton>
          <SaasMobileMenu
            brand={brand}
            nav={nav}
            homeTarget={brand}
            buttonClassName="p-2 text-muted-foreground transition-colors hover:text-foreground md:hidden"
          />
        </NavbarActions>
      </SiteNav>
    )
  },
})
