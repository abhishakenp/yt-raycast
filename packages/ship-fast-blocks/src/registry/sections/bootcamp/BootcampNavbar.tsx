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
 * BootcampNavbar — sticky translucent top navigation bar for a coding bootcamp /
 * career-school landing page. A blurred, border-bottomed header pinned to the
 * top of the viewport: a solid brand-initial logo tile beside the academy name
 * on the left, a horizontal set of nav links in the center (desktop), and a
 * rounded primary CTA on the right. The brand button routes to `homeTarget`,
 * nav links route to their own labels, and the CTA routes to `ctaTarget`.
 * Every link routes through route hrefs so labels can drive page-switching.
 * Use as the sticky site header for coding bootcamps, dev academies, vocational
 * tech schools, or any cohort-based education brand.
 */
export const BootcampNavbar = defineCapsule({
  name: 'BootcampNavbar',
  description:
    'Sticky translucent top navigation bar for a coding bootcamp / career-school landing page: blurred, border-bottomed header pinned to the top with a solid brand-initial logo tile + academy name on the left, horizontal nav links in the center (desktop), and a rounded primary CTA on the right. Brand button routes to homeTarget, nav links route to their own labels, and the CTA routes to ctaTarget through route hrefs. Use as the sticky site header for coding bootcamps, dev academies, vocational tech schools, or cohort-based education brands.',
  props: z.object({
    /** Brand / academy name shown beside the logo tile. */
    brand: z.string().optional(),
    /** Nav link labels; each drives its own route target. */
    nav: z.array(z.string()).optional(),
    /** Navigation target for the brand button (first nav item). */
    homeTarget: z.string().optional(),
    /** CTA button route target. */
    ctaTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'CodeCraft Academy'
    const nav = props.nav?.length
      ? props.nav
      : ['Curriculum', 'Outcomes', 'Mentors', 'Pricing', 'FAQ']
    const homeTarget = props.homeTarget ?? nav[0]
    const ctaTarget = props.ctaTarget ?? 'Start Your Application'

    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          'grid place-items-center rounded-lg bg-primary font-bold text-primary-foreground',
          className,
        )}
        aria-hidden="true"
      >
        {brand
          .split(' ')
          .map((w) => w.charAt(0))
          .join('')
          .slice(0, 2)
          .toUpperCase()}
      </span>
    )

    return (
      <SiteNav
        position="sticky"
        height="responsive"
        className={cn('bg-background/95', props.className)}
      >
        <NavbarBrand href={homeTarget} className="gap-2">
          <BrandLogo brand={brand}>
            <LogoImage fallback={<LogoMark className="size-8 text-sm" />} />
            <LogoLabel className="text-lg font-semibold" />
          </BrandLogo>
        </NavbarBrand>

        <NavbarNav>
          {nav.map((label) => (
            <NavbarNavLink key={label} href={label} className="font-normal">
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>

        <NavbarActions>
          <NavbarCta
            variant="primary"
            href={ctaTarget}
            className="hidden px-5 py-2.5 sm:inline-flex"
          >
            Apply Now
          </NavbarCta>
          <MobileNavDrawer
            brand={brand}
            nav={nav}
            homeTarget={homeTarget}
            cta={{ label: 'Apply Now', target: ctaTarget }}
            buttonClassName="p-2 text-muted-foreground hover:text-foreground md:hidden"
          />
        </NavbarActions>
      </SiteNav>
    )
  },
})
