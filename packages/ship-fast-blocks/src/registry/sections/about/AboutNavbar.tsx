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
} from '#/section-kit/index.ts'

/**
 * AboutNavbar — studio-editorial sticky top navigation bar for a modern
 * company / ABOUT page. A backdrop-blurred, hairline-bordered header pinned to
 * the top of the viewport: a sharp square primary-block zap-glyph brand mark
 * beside an uppercase wide-tracked brand name on the left; centered desktop
 * nav links set in tiny uppercase mono type, each prefixed with a numbered
 * index ("01", "02"…) and underlined by a primary hairline that slides in on
 * hover; and on the right a square hard-offset-shadow "Work with us" block
 * button (mono uppercase, presses down on click) with a trailing arrow. Every
 * nav item and the CTA route through route hrefs so labels can drive
 * page-switching. Use as the sticky site header for product studios, agencies,
 * startups, or any design-led brand's about/company page. Renders fully with
 * no props via baked-in "Kinetic Labs" defaults.
 */
export const AboutNavbar = defineCapsule({
  name: 'AboutNavbar',
  description:
    "Studio-editorial sticky top navigation bar for a modern company / ABOUT page: a backdrop-blurred, hairline-bordered header pinned to the top with a sharp square primary-block zap-glyph brand mark + uppercase wide-tracked brand name on the left, centered desktop nav links in tiny uppercase mono type with numbered index prefixes and a primary slide-in hover underline, and a square hard-offset-shadow 'Work with us' block CTA (mono uppercase, mechanical press feedback) with a trailing arrow on the right. Every nav item and the CTA route through route hrefs for page-switching. Use as the sticky site header for product studios, agencies, startups, or any design-led brand's about/company page.",
  props: z.object({
    /** Brand / company name shown beside the logo tile. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Right-side pill CTA label. */
    cta: z.string().optional(),
    /** Navigation target for the right-side CTA button. */
    ctaTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Kinetic Labs'
    const nav = props.nav?.length
      ? props.nav
      : ['Our Story', 'Values', 'Team', 'Stats']
    const cta = props.cta ?? 'Work with us'
    const ctaTarget = props.ctaTarget ?? 'Get in touch'

    // Shared brand mark — sharp primary block + zap glyph (decorative brand asset).
    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          'grid size-7 place-items-center rounded-none bg-primary text-primary-foreground',
          className,
        )}
        aria-hidden="true"
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      </span>
    )

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    )

    return (
      <SiteNav
        position="sticky"
        height="compact"
        className={cn(
          'border-border bg-background/80 supports-[backdrop-filter]:bg-background/65',
          props.className,
        )}
        containerClassName="max-w-6xl px-6 sm:px-8 lg:px-12"
      >
        <NavbarBrand
          href={nav[0]}
          className="gap-2.5 text-sm font-extrabold uppercase tracking-[0.08em] text-foreground"
        >
          <BrandLogo brand={brand}>
            <LogoImage fallback={<LogoMark />} />
            <LogoLabel />
          </BrandLogo>
        </NavbarBrand>

        <NavbarNav className="gap-7">
          {nav.map((label, i) => (
            <NavbarNavLink
              key={label}
              href={label}
              className="group relative rounded-none px-0.5 py-1 font-mono text-[11px] font-normal uppercase tracking-[0.18em] text-muted-foreground after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:scale-x-0 after:bg-primary after:transition-transform after:duration-200 hover:bg-transparent hover:text-foreground hover:after:scale-x-100"
            >
              <span aria-hidden="true" className="mr-1.5 text-primary/70">
                {String(i + 1).padStart(2, '0')}
              </span>
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>

        <NavbarActions>
          <NavbarCta
            variant="dark"
            href={ctaTarget}
            className="gap-2 rounded-none px-4 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.15em] shadow-[4px_4px_0_0] shadow-primary/40 transition-all hover:-translate-y-px hover:bg-foreground active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            <span className="hidden sm:inline">{cta}</span>
            <ArrowRight />
          </NavbarCta>
          <MobileNavDrawer
            brand={brand}
            nav={nav}
            homeTarget={nav[0]}
            cta={{ label: cta, target: ctaTarget }}
            buttonClassName="p-2 text-muted-foreground hover:text-foreground md:hidden"
          />
        </NavbarActions>
      </SiteNav>
    )
  },
})
