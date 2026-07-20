import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Logo as BrandLogo, LogoImage, LogoLabel } from '#/section-kit/Logo.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import { MobileNavDrawer } from '#/section-kit/MobileNavDrawer.tsx'
import {
  NavbarActions,
  NavbarBrand,
  NavbarCta,
  NavbarNav,
  NavbarNavLink,
  SiteNav,
} from '#/section-kit/SiteNav.tsx'
function Mark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="9" cy="13" r="5" />
      <circle cx="15" cy="13" r="5" />
      <path d="M9 8c0-2 1.3-3.5 3-3.5S15 6 15 8" />
    </svg>
  )
}

export const WeddingNavbar = defineCapsule({
  name: 'WeddingNavbar',
  description:
    'Romantic-editorial sticky wedding header on the shared SiteNav composite: a delicate serif couple wordmark with an interlocking-rings brand mark, a mono micro-label behind a hairline divider, quiet muted nav links (Story, Gallery, Details, RSVP), and a sharp-cornered RSVP call to action with press feedback, over a thin backdrop-blurred hairline-bordered bar. Use as the page header for a wedding invitation or celebration site, or as the top band of any generated wedding page family.',
  props: z.object({
    brand: z.string().optional(),
    nav: z.array(z.string()).optional(),
    homeTarget: z.string().optional(),
    ctaLabel: z.string().optional(),
    ctaTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const nav = props.nav?.length
      ? props.nav
      : ['Story', 'Gallery', 'Details', 'RSVP']
    const brand = props.brand ?? 'Ava & Liam'
    const brandMark = <Mark className="size-7 text-primary" />
    const brandClassName = 'font-serif text-xl font-medium tracking-tight'
    const ctaLabel = props.ctaLabel ?? 'RSVP'
    const ctaTarget = props.ctaTarget ?? 'RSVP'
    const homeTarget = props.homeTarget ?? nav[0]
    return (
      <SiteNav
        position="fixed"
        height="default"
        className={cn('bg-background/90', props.className)}
      >
        <NavbarBrand href={homeTarget} className="gap-3 text-left">
          <BrandLogo brand={brand} className="flex items-center gap-2">
            <LogoImage className="size-7" fallback={brandMark} />
            <LogoLabel className={brandClassName} />
          </BrandLogo>
          <span
            aria-hidden="true"
            className="hidden h-4 w-px bg-border lg:block"
          />
          <MonoTag className="hidden lg:inline-block">The Wedding</MonoTag>
        </NavbarBrand>
        <NavbarNav className="gap-8 [&>button]:font-normal">
          {nav.map((label) => (
            <NavbarNavLink
              key={label}
              href={label}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>
        <NavbarActions>
          <NavbarCta
            variant="primary-pill"
            className="hidden rounded-none px-5 py-2.5 transition-colors active:translate-y-px sm:inline-flex"
            href={ctaTarget}
          >
            {ctaLabel}
          </NavbarCta>
          <MobileNavDrawer
            brand={brand}
            nav={nav}
            homeTarget={homeTarget}
            cta={{ label: ctaLabel, target: ctaTarget }}
            buttonClassName="inline-flex size-9 items-center justify-center rounded-none border border-border p-0 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:translate-y-px md:hidden"
          />
        </NavbarActions>
      </SiteNav>
    )
  },
})
