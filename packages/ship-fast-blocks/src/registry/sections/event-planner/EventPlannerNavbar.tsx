import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { MobileNavDrawer } from '#/section-kit/MobileNavDrawer.tsx'
import { inquiryLakebed } from '../contact/inquiry-lakebed.ts'
import {
  InquiryActionButton,
  InquiryMutationSpinner,
} from '../contact/inquiry-interactions.tsx'

/**
 * EventPlannerNavbar — fixed translucent top navigation for a luxury event-planning
 * agency site. A backdrop-blurred, border-bottomed header pinned to the top with a
 * thin clock-glyph logo + light-weight brand name on the left, horizontal nav links
 * in the center-right (desktop), a filled primary pill "Book Consultation" CTA, and
 * a hamburger menu button on mobile. Nav links route through useNavigate while
 * consultation CTAs record real Lakebed contact actions. Use as the sticky site
 * header for wedding/event planners, party and gala organizers, or any premium
 * hospitality service.
 */
export const EventPlannerNavbar = defineCapsule({
  name: 'EventPlannerNavbar',
  description:
    "Fixed translucent top navigation bar for a luxury event-planning agency site: backdrop-blurred, border-bottomed header with a thin clock-glyph logo + light-weight brand name on the left, horizontal nav links on the right (desktop), a filled primary pill 'Book Consultation' CTA, and a hamburger menu button on mobile. Nav links route through useNavigate while consultation CTAs record real Lakebed contact actions. Use as the sticky site header for wedding/event planners, party, celebration, corporate-event and gala organizers, or any premium hospitality service.",
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
    const go = useNavigate()
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
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm',
          props.className,
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav
            className="flex h-20 items-center justify-between"
            aria-label="Main navigation"
          >
            <button
              type="button"
              onClick={() => go(nav[0])}
              className="flex items-center gap-2"
            >
              <Clock className="size-8 text-foreground/80" />
              <span className="text-xl font-light tracking-tight text-foreground">
                {brand}
              </span>
            </button>
            <div className="hidden items-center gap-8 md:flex">
              {nav.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => go(label)}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {label}
                </button>
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
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-70"
              >
                {ctaLabel}
              </InquiryActionButton>
            </div>
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
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-70"
                >
                  {ctaLabel}
                </InquiryActionButton>
              )}
            />
          </nav>
        </div>
      </header>
    )
  },
})
