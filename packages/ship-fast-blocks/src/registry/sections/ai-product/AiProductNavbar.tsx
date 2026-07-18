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
 * AiProductNavbar — sticky, blurred top navigation bar for a clean, light AI
 * SaaS / product landing page. A backdrop-blurred header pinned to the top with
 * a near-black brand tile + pen glyph and product name on the left, a centered
 * horizontal set of nav links (desktop), and a "Sign in" text link plus a
 * near-black filled primary CTA on the right. Every link and CTA routes through
 * useNavigate for page-switching. Use as the sticky site header for AI writing
 * assistants, AI copilots, generative-AI tools, developer-AI products, or any
 * modern minimal SaaS marketing site. Renders fully with no props.
 */
export const AiProductNavbar = defineCapsule({
  name: 'AiProductNavbar',
  description:
    'Sticky backdrop-blurred top navigation bar for a clean, light AI SaaS / product landing page: a near-black rounded brand tile with a pen/edit glyph + product name on the left, horizontal nav links, command plan search, Shoo profile dropdown, selected-plan badge, near-black fullstack primary CTA, and a real mobile drawer. Links route through useNavigate while auth and conversion actions use shared Lakebed state. Use as the sticky site header for AI writing assistants, AI copilots, generative-AI tools, developer-AI products, or any modern minimal conversion-focused SaaS marketing site.',
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
    const go = useNavigate()
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
          'grid place-items-center rounded-lg bg-foreground text-background',
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
        className={cn('bg-background/80 backdrop-blur-md', props.className)}
      >
        <NavbarBrand asChild>
          <button
            type="button"
            onClick={() => go(brand)}
            className="gap-2 text-xl font-semibold tracking-tight text-foreground"
          >
            <BrandLogo
              brand={brand}
              fallback={<LogoMark className="size-8" />}
            />
          </button>
        </NavbarBrand>

        <NavbarNav>
          {nav.map((label) => (
            <NavbarNavLink key={label} onClick={() => go(label)}>
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
            label={signInLabel}
            buttonClassName="p-2 text-muted-foreground transition-colors hover:text-foreground"
          />
          <SaasPlanActionButton
            lakebed={lakebed}
            intentLabel={ctaTarget}
            plan={ctaTarget}
            source="navbar"
            pendingChildren={
              <>
                <SaasMutationSpinner className="size-4" />
                Starting
              </>
            }
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/90 disabled:pointer-events-none disabled:opacity-70"
          >
            {cta}
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
