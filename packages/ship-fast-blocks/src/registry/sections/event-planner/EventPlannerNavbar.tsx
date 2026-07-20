import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Logo as BrandLogo, LogoImage, LogoLabel } from '#/section-kit/Logo.tsx'
import { MobileNavDrawer } from '#/section-kit/MobileNavDrawer.tsx'
import {
  NavbarBrand,
  NavbarNav,
  NavbarNavLink,
  SiteNav,
} from '#/section-kit/SiteNav.tsx'
import { inquiryLakebed } from '../contact/inquiry-lakebed.ts'
import {
  InquiryActionButton,
  InquiryMutationSpinner,
} from '../contact/inquiry-interactions.tsx'

/**
 * EventPlannerNavbar — fixed kinetic-poster top navigation for an elegant
 * event-planning studio. A backdrop-blurred, hairline-bottomed header pinned to
 * the top with a thin clock-glyph mark + tight-tracked wordmark on the left,
 * horizontal nav links on the right (desktop), a squared-off ticket-stub
 * "Book Consultation" CTA carrying a hard primary offset shadow with mechanical
 * press feedback, and a hamburger menu button on mobile. Nav links route through
 * route hrefs while consultation CTAs record real Lakebed contact actions. Use as
 * the sticky site header for wedding/event planners, party and gala organizers,
 * or any premium celebration studio.
 */
export const EventPlannerNavbar = defineCapsule({
  name: 'EventPlannerNavbar',
  description:
    "Fixed kinetic-poster top navigation bar for an elegant event-planning studio: backdrop-blurred, hairline-bottomed header with a thin clock-glyph mark + tight-tracked wordmark on the left, horizontal nav links on the right (desktop), a squared-off ticket-stub 'Book Consultation' CTA with a hard primary offset shadow and mechanical press feedback, and a hamburger menu button on mobile. Nav links route through route hrefs while consultation CTAs record real Lakebed contact actions. Use as the sticky site header for wedding/event planners, party, celebration, corporate-event and gala organizers, or any premium hospitality service.",
  lakebed: inquiryLakebed,
  props: z.object({
    /** Brand / studio name shown beside the logo. */
    brand: z.string().optional(),
    /** Top-level navbar link labels. */
    nav: z.array(z.string()).optional(),
    /** Filled primary pill CTA label. */
    ctaLabel: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props, lakebed }) => {
    const brand = props.brand ?? 'Serene Events'
    const nav = props.nav?.length
      ? props.nav
      : ['Services', 'Gallery', 'Process', 'Testimonials', 'FAQ']
    const ctaLabel = props.ctaLabel ?? 'Book Consultation'

    const Clock = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    )

    return (
      <SiteNav
        position="fixed"
        height="default"
        className={cn('bg-background/95', props.className)}
      >
        <NavbarBrand href={nav[0]}>
          <BrandLogo brand={brand} className="flex items-center gap-2">
            <LogoImage
              className="size-7"
              fallback={<Clock className="size-7 text-foreground" />}
            />
            <LogoLabel className="text-lg font-bold tracking-tight text-foreground" />
          </BrandLogo>
        </NavbarBrand>

        <NavbarNav className="lg:gap-7">
          {nav.map((label) => (
            <NavbarNavLink key={label} href={label}>
              {label}
            </NavbarNavLink>
          ))}
          <InquiryActionButton
            lakebed={lakebed}
            label={ctaLabel}
            source="Event planner navbar"
            target={ctaLabel}
            kind="cta"
            pendingChildren={
              <>
                <InquiryMutationSpinner />
                Recording
              </>
            }
            className="inline-flex items-center gap-2 rounded-none border-2 border-foreground bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[3px_3px_0_0] shadow-foreground transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0] active:translate-y-0 active:shadow-[1px_1px_0_0] disabled:pointer-events-none disabled:opacity-70"
          >
            {ctaLabel}
          </InquiryActionButton>
        </NavbarNav>

        <MobileNavDrawer
          brand={brand}
          nav={nav}
          homeTarget={nav[0]}
          buttonClassName="p-2 text-muted-foreground md:hidden"
          footer={(close) => (
            <InquiryActionButton
              lakebed={lakebed}
              label={ctaLabel}
              source="Event planner mobile menu"
              target={ctaLabel}
              kind="cta"
              onRecorded={close}
              pendingChildren={
                <>
                  <InquiryMutationSpinner />
                  Recording
                </>
              }
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-none border-2 border-foreground bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[3px_3px_0_0] shadow-foreground transition-all duration-150 active:translate-y-px active:shadow-[1px_1px_0_0] disabled:pointer-events-none disabled:opacity-70"
            >
              {ctaLabel}
            </InquiryActionButton>
          )}
        />
      </SiteNav>
    )
  },
})
