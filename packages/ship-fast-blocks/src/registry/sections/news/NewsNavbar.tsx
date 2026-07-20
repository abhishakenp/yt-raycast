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
/**
 * NewsNavbar — sticky newspaper masthead header for a news / editorial
 * publication. Thin configuration over the shared `SiteNav` composite in a
 * full newsprint idiom: a serif wordmark beside a square ink-block newspaper
 * mark, a row of mono small-caps section links separated by hairline column
 * rules on desktop (demoted below lg since the bar carries many sections), a
 * square invert-on-hover "Subscribe" CTA on the right, and a real mobile
 * drawer on small screens. The bar keeps its backdrop blur and closes with a
 * heavy masthead rule. Use as the sticky site header for newspapers,
 * magazines, online publications, media brands or article-heavy blog indexes
 * where a Subscribe action matters. Renders fully with no props via baked-in
 * "The Chronicle" defaults.
 */
function NewspaperMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'grid place-items-center rounded-none bg-foreground text-background',
        className,
      )}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-4"
        aria-hidden="true"
      >
        <rect x="3" y="4" width="18" height="16" rx="0" />
        <path d="M7 8h10M7 12h10M7 16h6" />
      </svg>
    </span>
  )
}

export const NewsNavbar = defineCapsule({
  name: 'NewsNavbar',
  description:
    "Sticky newspaper masthead header built on the shared SiteNav composite in a full newsprint idiom: a serif wordmark + square ink-block newspaper mark, a row of mono small-caps section links separated by hairline column rules on desktop (demoted below lg for many sections), a square invert-on-hover 'Subscribe' CTA on the right, and a real mobile drawer. Keeps backdrop blur and closes with a heavy masthead rule. Use as the sticky site header for newspapers, magazines, online publications, media brands or article-heavy blog indexes where a Subscribe action matters.",
  props: z.object({
    /** Publication / masthead name shown beside the logo. */
    brand: z.string().optional(),
    /** Top-level navbar section labels (first item also drives the brand/home target). */
    nav: z.array(z.string()).optional(),
    /** Subscribe CTA label on the right. */
    subscribeCta: z.string().optional(),
    /** Navigation target for the logo / brand click. */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const nav = props.nav?.length
      ? props.nav
      : ['News', 'Politics', 'Business', 'Tech', 'Culture', 'Science', 'Health']
    const brand = props.brand ?? 'The Chronicle'
    const ctaLabel = props.subscribeCta ?? 'Subscribe'
    const ctaTarget = 'Subscribe'
    const homeTarget = props.homeTarget ?? nav[0]
    return (
      <SiteNav
        position="fixed"
        height="default"
        className={cn(
          'border-b-2 border-foreground bg-background/95 shadow-[0_2px_0_0] shadow-border',
          props.className,
        )}
      >
        <NavbarBrand href={homeTarget} className="min-w-0">
          <BrandLogo brand={brand} className="flex items-center gap-2.5">
            <LogoImage fallback={<NewspaperMark />} className="size-8" />
            <LogoLabel className="font-serif text-xl font-bold tracking-tight text-foreground" />
          </BrandLogo>
        </NavbarBrand>
        <NavbarNav breakpoint="lg" className="gap-0">
          {nav.map((label, i) => (
            <NavbarNavLink
              key={label}
              href={label}
              className={cn(
                'px-3 font-mono text-[11px] font-normal uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground',
                i > 0 && 'border-l border-border',
                label === homeTarget &&
                  'text-foreground underline decoration-2 underline-offset-4',
              )}
            >
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>
        <NavbarActions className="gap-2.5">
          <NavbarCta
            variant="dark"
            className="hidden rounded-none border border-foreground px-4 py-2 font-mono text-[11px] uppercase tracking-[0.16em] transition-colors duration-150 hover:bg-background hover:text-foreground active:translate-y-px sm:inline-flex"
            href={ctaTarget}
          >
            {ctaLabel}
          </NavbarCta>
          <MobileNavDrawer
            brand={brand}
            nav={nav}
            homeTarget={homeTarget}
            cta={{ label: ctaLabel, target: ctaTarget }}
            buttonClassName="p-2 text-muted-foreground hover:text-foreground lg:hidden"
          />
        </NavbarActions>
      </SiteNav>
    )
  },
})
