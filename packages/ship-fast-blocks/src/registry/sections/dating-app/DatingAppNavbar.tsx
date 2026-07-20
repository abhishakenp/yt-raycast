import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Logo as BrandLogo, LogoImage, LogoLabel } from '#/section-kit/Logo.tsx'
import {
  NavbarActions,
  NavbarRouteLink,
  NavbarBrand,
  NavbarCta,
  NavbarNav,
  NavbarNavLink,
  SiteNav,
} from '#/section-kit/index.ts'

/**
 * DatingAppNavbar — playful-geometric sticky navigation for a dating /
 * matchmaking app landing page. A backdrop-blurred bg-background/80 header with
 * a 2px foreground bottom rule: on the left a rounded-full primary heart-glyph
 * chip beside the extrabold app wordmark, centered nav links (desktop), and on
 * the right a "Log In" text link plus a rounded-full pill CTA with a 2px
 * foreground border, hard 3px offset token shadow, and press feedback — the
 * page's binary-radius grammar (full pills against sharp structure) starts
 * here. Every link and CTA route through route hrefs so labels drive
 * page-switching. Use as the sticky site header for dating apps, matchmaking
 * services, singles platforms, friend-finders, or any friendly
 * conversion-focused social-connection landing page. Renders fully with no
 * props via baked-in "HeartLink" defaults.
 */
export const DatingAppNavbar = defineCapsule({
  name: 'DatingAppNavbar',
  description:
    "Playful-geometric sticky navigation bar for a dating / matchmaking app landing page: a backdrop-blurred header with a 2px foreground bottom rule, a rounded-full primary heart-glyph chip + extrabold app wordmark on the left, centered nav links (desktop), and a 'Log In' text link plus a rounded-full pill CTA with 2px foreground border, hard 3px offset shadow, and press feedback on the right. Links and CTA route through route hrefs for page-switching. Use as the sticky site header for dating apps, matchmaking services, singles platforms, friend-finders, or any friendly conversion-focused social-connection landing page.",
  props: z.object({
    /** Brand / app name shown beside the heart logo. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Text-link label on the right (defaults to "Log In"). */
    loginLabel: z.string().optional(),
    /** Pill-shaped primary CTA label on the right. */
    cta: z.string().optional(),
    /** Navigation target fired by the primary CTA. */
    ctaTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'HeartLink'
    const nav = props.nav?.length
      ? props.nav
      : ['How It Works', 'Features', 'Success Stories', 'FAQ']
    const loginLabel = props.loginLabel ?? 'Log In'
    const cta = props.cta ?? 'Get the App'
    const ctaTarget = props.ctaTarget ?? 'Download Free'

    const HeartGlyph = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
          clipRule="evenodd"
        />
      </svg>
    )

    return (
      <SiteNav
        position="sticky"
        height="compact"
        className={cn(
          'border-b-2 border-foreground bg-background/80 backdrop-blur-md',
          props.className,
        )}
      >
        <NavbarBrand href={nav[0]} className="gap-2">
          <BrandLogo brand={brand} className="flex items-center gap-2">
            <LogoImage
              className="size-7"
              fallback={
                <span className="grid size-7 place-items-center rounded-full bg-primary text-primary-foreground">
                  <HeartGlyph className="size-4" />
                </span>
              }
            />
            <LogoLabel className="text-xl font-extrabold tracking-tight text-foreground" />
          </BrandLogo>
        </NavbarBrand>

        <NavbarNav>
          {nav.map((label) => (
            <NavbarNavLink key={label} href={label}>
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>

        <NavbarActions>
          <NavbarRouteLink
            href={loginLabel}
            className="hidden text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground sm:block"
          >
            {loginLabel}
          </NavbarRouteLink>
          <NavbarCta
            variant="primary-pill"
            href={ctaTarget}
            className="rounded-full border-2 border-foreground px-4 py-2 font-semibold shadow-[3px_3px_0_0] shadow-foreground transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none motion-reduce:transform-none"
          >
            {cta}
          </NavbarCta>
        </NavbarActions>
      </SiteNav>
    )
  },
})
