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
function BookMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('text-primary', className)}
      aria-hidden="true"
    >
      <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  )
}

/**
 * OnlineCourseNavbar — "Curriculum LMS" sticky top navigation header for an
 * online-course / e-learning platform. Composes the shared SiteNav kit
 * composite into a blurred, hairline-bordered bar: an open-book brand mark
 * beside the wordmark on the left, mono uppercase wide-tracked nav links in the
 * center (desktop), and a single sharp-cornered primary "Enroll" CTA carrying a
 * hard offset token shadow and mechanical press feedback on the right, with a
 * real mobile drawer. Brand, links, and CTA all route through the kit's route
 * hrefs so labels drive page-switching. Use as the site header for course
 * platforms, e-learning marketplaces, MOOCs, bootcamps, academies, or training
 * providers. Renders fully with no props via baked-in "LearnSpace" defaults.
 */
export const OnlineCourseNavbar = defineCapsule({
  name: 'OnlineCourseNavbar',
  description:
    "Curriculum-LMS sticky top navigation header for an online-course / e-learning platform built on the shared SiteNav kit composite: a blurred hairline-bordered bar with an open-book brand mark + wordmark on the left, mono uppercase wide-tracked nav links in the center (desktop), and a single sharp-cornered primary 'Enroll' CTA with a hard offset token shadow and press feedback on the right, plus a real mobile drawer. Brand, links, and CTA all route through the kit's route hrefs for page-switching. Use as the site header for course platforms, e-learning marketplaces, MOOCs, bootcamps, academies, or training providers.",
  props: z.object({
    /** Brand / platform name shown beside the logo mark. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Retained for backward compatibility; SiteNav exposes a single CTA, so this is not rendered separately. */
    signIn: z.string().optional(),
    /** Solid primary CTA label on the right. */
    cta: z.string().optional(),
    /** Route label the primary CTA navigates to. */
    ctaTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'LearnSpace'
    const nav = props.nav?.length
      ? props.nav
      : ['Courses', 'Instructors', 'Pricing', 'FAQ']
    const ctaLabel = props.cta ?? 'Enroll'
    const ctaTarget = props.ctaTarget ?? 'Pricing'
    const homeTarget = nav[0]

    return (
      <SiteNav
        position="fixed"
        height="default"
        className={cn(
          'border-b border-border bg-background/90 supports-[backdrop-filter]:bg-background/75',
          props.className,
        )}
      >
        <NavbarBrand href={homeTarget} className="gap-2">
          <BrandLogo brand={brand} className="flex items-center gap-2">
            <LogoImage
              className="size-7"
              fallback={<BookMark className="size-7" />}
            />
            <LogoLabel className="text-lg font-semibold tracking-tight" />
          </BrandLogo>
        </NavbarBrand>
        <NavbarNav>
          {nav.map((label) => (
            <NavbarNavLink
              key={label}
              href={label}
              className="font-mono text-xs font-normal uppercase tracking-[0.15em] text-muted-foreground transition-colors hover:text-foreground"
            >
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>
        <NavbarActions>
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
