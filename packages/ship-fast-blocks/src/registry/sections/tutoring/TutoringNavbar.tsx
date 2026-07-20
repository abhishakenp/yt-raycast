import { defineCapsule } from '#/capsules/openui.ts'
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
function CapMark({ className }: { className?: string }) {
  return (
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
      <path d="M22 10 12 5 2 10l10 5 10-5Z" />
      <path d="M6 12v5c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5" />
      <path d="M22 10v6" />
    </svg>
  )
}

export const TutoringNavbar = defineCapsule({
  name: 'TutoringNavbar',
  description:
    "Editorial-academic navigation header for the tutoring page family. Composes the shared SiteNav kit composite into a blurred, hairline-bordered bar: a graduation-cap brand mark beside a serif wordmark on the left, a row of mono uppercase wide-tracked nav links in the center (desktop), an optional phone number, and a single sharp-cornered 'Book a Session' CTA carrying a hard offset token shadow and mechanical press feedback, plus a real mobile drawer. Brand, links, and CTA all route through the kit's route hrefs so labels drive page-switching. Use it as the first band of any tutoring / education site whenever a generated page needs a scholarly, route-aware top nav without hand-rolling markup.",
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
    const brand = props.brand ?? 'BrightPath Tutoring'
    const nav = props.nav?.length
      ? props.nav
      : ['Subjects', 'How it Works', 'Pricing', 'Tutors', 'Contact']
    const ctaLabel = props.ctaLabel ?? 'Book a Session'
    const ctaTarget = props.ctaTarget ?? 'Contact'
    const phone = props.phone ?? '(555) 240-1188'
    const homeTarget = props.homeTarget ?? nav[0]

    return (
      <SiteNav
        position={props.sticky === false ? 'sticky' : 'fixed'}
        height="default"
        className={props.className}
      >
        <NavbarBrand href={homeTarget} className="gap-2">
          <BrandLogo brand={brand} className="flex items-center gap-2">
            <LogoImage
              className="size-7 text-primary"
              fallback={<CapMark className="size-7 text-primary" />}
            />
            <LogoLabel className="font-serif text-lg font-semibold tracking-tight" />
          </BrandLogo>
        </NavbarBrand>
        <NavbarNav>
          {nav.map((label) => (
            <NavbarNavLink
              key={label}
              href={label}
              className="font-mono text-xs font-normal uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
            >
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>
        <NavbarActions>
          {phone ? (
            <a
              href={`tel:${phone.replace(/[^\d+]/g, '')}`}
              className="hidden font-mono text-xs tracking-[0.08em] text-muted-foreground transition-colors hover:text-foreground lg:inline"
            >
              {phone}
            </a>
          ) : null}
          <NavbarCta
            variant="primary"
            className="hidden rounded-none px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-[0.12em] shadow-[4px_4px_0_0] shadow-primary/25 transition-[transform,box-shadow,background-color] duration-150 hover:bg-primary/90 active:translate-y-px active:shadow-none sm:inline-flex"
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
