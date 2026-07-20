import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Logo as BrandLogo, LogoImage, LogoLabel } from '#/section-kit/Logo.tsx'
import { MobileNavDrawer } from '#/section-kit/MobileNavDrawer.tsx'
import {
  NavbarActions,
  NavbarBrand,
  NavbarCta,
  NavbarNav,
  NavbarNavLink,
  SiteNav,
} from '#/section-kit/SiteNav.tsx'
function MicWaveMark({ className }: { className?: string }) {
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
      <rect x="9" y="2" width="6" height="11" rx="3" />
      <path d="M5 10v1a7 7 0 0 0 14 0v-1" />
      <path d="M12 18v3" />
      <path d="M2 14v-3" />
      <path d="M22 14v-3" />
      <path d="M5 15v-1" />
      <path d="M19 15v-1" />
    </svg>
  )
}

/**
 * PodcastNavbar — sticky audio-editorial masthead for a podcast / audio-show
 * site, built on SiteNav. A soundwave mic mark sits beside the 'Signal & Static'
 * wordmark on the left; the desktop nav renders as mono small-caps labels
 * separated by hairline column rules; a square (rounded-none) invert-on-hover
 * mono "Subscribe" button anchors the right with press feedback; a real mobile
 * drawer opens on small screens. Keeps the bar's backdrop blur. Every item
 * routes through route hrefs for page-switching. Use as the header for
 * podcasts, audio shows, or any show that wants an on-air, broadsheet feel.
 * Renders fully with no props via baked defaults and passes className through.
 */
export const PodcastNavbar = defineCapsule({
  name: 'PodcastNavbar',
  description:
    "Sticky audio-editorial podcast site header built on SiteNav: a 'Signal & Static' wordmark beside a mic/soundwave mark on the left, mono small-caps desktop nav labels separated by hairline column rules in the center, and a square invert-on-hover mono 'Subscribe' button with press feedback on the right; a real mobile drawer on small screens. Keeps backdrop blur. Every item routes through route hrefs for page-switching. Designed for podcasts and audio shows that want a warm, on-air broadsheet feel. Renders fully with no props via baked defaults and passes className through for layout control.",
  props: z.object({
    brand: z.string().optional(),
    nav: z.array(z.string()).optional(),
    phone: z.string().optional(),
    homeTarget: z.string().optional(),
    ctaLabel: z.string().optional(),
    ctaTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const nav = props.nav?.length
      ? props.nav
      : ['Episodes', 'About', 'Hosts', 'Subscribe']
    const brand = props.brand ?? 'Signal & Static'
    const ctaLabel = props.ctaLabel ?? 'Subscribe'
    const ctaTarget = props.ctaTarget ?? 'Subscribe'
    const homeTarget = props.homeTarget ?? nav[0]

    return (
      <SiteNav
        position="fixed"
        height="default"
        className={cn('bg-background/80', props.className)}
      >
        <NavbarBrand href={homeTarget} className="min-w-0">
          <BrandLogo brand={brand} className="flex items-center gap-2">
            <LogoImage
              className="size-7"
              fallback={<MicWaveMark className="size-7 text-primary" />}
            />
            <LogoLabel className="text-lg font-semibold tracking-tight text-foreground" />
          </BrandLogo>
        </NavbarBrand>

        <NavbarNav className="gap-0">
          {nav.map((label, i) => (
            <NavbarNavLink
              key={label}
              href={label}
              className={cn(
                'rounded-none px-3 font-mono text-[11px] font-normal uppercase tracking-[0.18em] transition-colors hover:bg-transparent hover:text-foreground',
                i > 0 && 'border-l border-border',
                label === homeTarget
                  ? 'text-foreground underline decoration-2 underline-offset-4'
                  : 'text-muted-foreground',
              )}
            >
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>

        <NavbarActions className="gap-2.5">
          <NavbarCta
            variant="primary-pill"
            className="hidden rounded-none border border-foreground bg-foreground px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-background transition-colors duration-150 hover:bg-background hover:text-foreground active:translate-y-px sm:inline-flex"
            href={ctaTarget}
          >
            {ctaLabel}
          </NavbarCta>
          <MobileNavDrawer
            brand={brand}
            nav={nav}
            homeTarget={homeTarget}
            cta={{ label: ctaLabel, target: ctaTarget }}
            buttonClassName="p-2 text-muted-foreground hover:text-foreground md:hidden"
          />
        </NavbarActions>
      </SiteNav>
    )
  },
})
