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
function UniversityBrandSeal() {
  return (
    <span
      aria-hidden="true"
      className="grid size-9 shrink-0 place-items-center rounded-none border border-foreground/15 bg-primary text-primary-foreground"
    >
      <svg
        className="size-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M22 10 12 5 2 10l10 5 10-5Z" />
        <path d="M6 12v5c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5" />
        <path d="M22 10v6" />
      </svg>
    </span>
  )
}

export const UniversityNavbar = defineCapsule({
  name: 'UniversityNavbar',
  description:
    "Editorial-academic institutional site header for the University page family. Composes the shared SiteNav kit composite with backdrop blur and a hairline underline: a squared graduation-cap brand seal beside a two-line lockup (a serif wordmark over a mono tracked-uppercase 'established' line) on the left, a row of quiet monochrome nav links plus a thin column-rule separator, an optional admissions phone line hidden on dense widths, and a square-cornered solid 'Apply' CTA with press feedback targeting the Admissions page on the right; a hamburger drawer on mobile. Prestigious catalog aesthetic with binary sharp corners. Use as the top band of any university homepage or as the persistent header across a multi-page campus site.",
  props: z.object({
    brand: z.string().optional(),
    nav: z.array(z.string()).optional(),
    phone: z.string().optional(),
    ctaLabel: z.string().optional(),
    ctaTarget: z.string().optional(),
    homeTarget: z.string().optional(),
    sticky: z.boolean().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Whitmore University'
    const nav = props.nav?.length
      ? props.nav
      : ['Academics', 'Admissions', 'Campus Life', 'Research', 'About']
    const phone = props.phone ?? 'Admissions: (800) 555-0142'
    const ctaLabel = props.ctaLabel ?? 'Apply'
    const ctaTarget = props.ctaTarget ?? 'Admissions'
    const homeTarget = props.homeTarget ?? nav[0]

    return (
      <SiteNav
        position="fixed"
        height="default"
        className={cn('bg-background/80', props.className)}
      >
        <NavbarBrand href={homeTarget} className="gap-3 text-left">
          <BrandLogo brand={brand} className="flex items-center gap-3">
            <LogoImage className="size-9" fallback={<UniversityBrandSeal />} />
            <span className="flex flex-col leading-none">
              <LogoLabel className="font-serif text-lg font-semibold tracking-tight text-foreground" />
              <span
                aria-hidden="true"
                className="mt-1 hidden font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:block"
              >
                Est. 1887
              </span>
            </span>
          </BrandLogo>
        </NavbarBrand>
        <NavbarNav>
          {nav.map((label) => (
            <NavbarNavLink
              key={label}
              href={label}
              className="rounded-none text-muted-foreground hover:bg-transparent hover:text-foreground"
            >
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>
        <NavbarActions>
          {phone ? (
            <a
              href={`tel:${phone.replace(/[^\d+]/g, '')}`}
              className="hidden font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground xl:inline"
            >
              {phone}
            </a>
          ) : null}
          <span
            aria-hidden="true"
            className="hidden h-6 w-px bg-border xl:block"
          />
          <NavbarCta
            variant="primary"
            className="hidden rounded-none px-5 py-2.5 transition-transform duration-150 active:translate-y-px sm:inline-flex"
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
