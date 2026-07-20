import { defineCapsule } from '#/capsules/openui.ts'
import { cn } from '#/lib/utils.ts'
import { z } from 'zod/v4'

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
/**
 * LinkInBioNavbar — minimal, mobile-first, backdrop-blurred header for a
 * single-page link-in-bio hub in the "chunky rounded stack" language: a hard
 * 2px bottom-ruled bar with a spark monogram mark beside an extrabold creator
 * wordmark on the left, one or two bold in-page anchor links, and a rounded-full
 * "Follow" pill CTA carrying a hard offset token shadow plus press feedback on
 * the right. No phone number, no sprawling menu — just enough to frame a
 * personal link hub for a creator, artist, musician, or solo founder; below sm
 * it collapses to the spark mark and a hamburger drawer. Renders fully with no
 * props.
 */
function SparkMark({ className }: { className?: string }) {
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
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5l1.4 3.1 3.1 1.4-3.1 1.4L12 16.5l-1.4-3.1L7.5 12l3.1-1.4z" />
    </svg>
  )
}

export const LinkInBioNavbar = defineCapsule({
  name: 'LinkInBioNavbar',
  description:
    "Minimal, mobile-first, backdrop-blurred header for a single-page link-in-bio hub built on the shared SiteNav composite in a chunky-rounded language: a hard 2px bottom-ruled bar with a spark monogram mark beside an extrabold creator wordmark, one or two bold in-page anchor links, and a rounded-full 'Follow' pill CTA with a hard offset token shadow and press feedback — no phone, no sprawling menu; below sm it collapses to the spark mark plus a hamburger drawer. Use as the header for a creator, artist, musician, influencer, or solo founder link hub. Renders fully with no props.",
  props: z.object({
    /** Creator / brand name shown beside the spark mark. */
    brand: z.string().optional(),
    /** Nav link labels (must match in-page anchors for switching). */
    nav: z.array(z.string()).optional(),
    /** Navigation target for the logo / brand click. */
    homeTarget: z.string().optional(),
    /** Prominent pill CTA label on the right. */
    ctaLabel: z.string().optional(),
    /** Navigation target for the pill CTA. */
    ctaTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const nav = props.nav?.length ? props.nav : ['Links', 'About']
    const brand = props.brand ?? 'Sarah Chen'
    const ctaLabel = props.ctaLabel ?? 'Follow'
    const ctaTarget = props.ctaTarget ?? 'Follow'
    const homeTarget = props.homeTarget ?? nav[0]
    return (
      <SiteNav
        position="fixed"
        height="default"
        className={cn(
          'border-b-2 border-foreground/80 bg-background/95 backdrop-blur',
          props.className,
        )}
      >
        <NavbarBrand href={homeTarget} className="active:translate-y-px">
          <BrandLogo brand={brand} className="flex items-center gap-2">
            <LogoImage
              className="size-7"
              fallback={<SparkMark className="size-7 text-primary" />}
            />
            <LogoLabel className="text-lg font-extrabold tracking-tight" />
          </BrandLogo>
        </NavbarBrand>
        <NavbarNav>
          {nav.map((label) => (
            <NavbarNavLink
              key={label}
              href={label}
              className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground active:translate-y-px"
            >
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>
        <NavbarActions>
          <NavbarCta
            variant="primary-pill"
            className="hidden border-2 border-foreground px-5 py-2 font-bold shadow-[3px_3px_0_0] shadow-foreground/25 transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0] hover:shadow-foreground/25 active:translate-y-px active:shadow-none sm:inline-flex"
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
