import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { SiteNav } from '#/section-kit/SiteNav.tsx'

/**
 * VacationRentalNavbar — airy sticky top navigation for a vacation-rental /
 * getaway listing site. Thin configuration over the shared `SiteNav` composite:
 * a hand-drawn palm-and-sun logo mark beside the property wordmark, horizontal
 * desktop nav links (Stays, Amenities, Gallery, Reviews, Book Now), a phone
 * number, a pill "Book Now" CTA, and a real mobile drawer (Sheet) on small
 * screens. Every nav item and the CTA route through useNavigate so labels can
 * drive page-switching. Use as the inviting site header for vacation rentals,
 * beach houses, cabins, villas, or boutique short-stay properties. Renders fully
 * with no props via baked-in "Azure Cove Retreats" defaults.
 */
const PalmMark = ({ className }: { className?: string }) => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <circle cx="17.5" cy="6.5" r="2.5" />
    <path d="M12 22v-9" />
    <path d="M12 13c-2-3-5-4-8-3 2-2 6-2 8 0" />
    <path d="M12 13c2-3 5-4 8-3-2-2-6-2-8 0" />
    <path d="M12 13c-1-3-1-6 1-8-3 1-4 5-1 8" />
  </svg>
)

export const VacationRentalNavbar = defineCapsule({
  name: 'VacationRentalNavbar',
  description:
    'Airy sticky top navigation for a vacation-rental / getaway listing site built on the shared SiteNav composite: a palm-and-sun logo mark and property wordmark, horizontal desktop nav links, a phone number, a pill Book Now CTA, and a real mobile drawer. Nav items and CTA route through useNavigate for page-switching. Use as the inviting site header for vacation rentals, beach houses, cabins, villas, or boutique short-stay properties.',
  props: z.object({
    /** Property / brand name shown beside the logo mark. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (should match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Phone number shown in the header. */
    phone: z.string().optional(),
    /** Navigation target for the logo / brand click. */
    homeTarget: z.string().optional(),
    /** Label of the pill CTA on the right. */
    ctaLabel: z.string().optional(),
    /** Navigation target for the CTA button. */
    ctaTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const nav = props.nav?.length
      ? props.nav
      : ['Stays', 'Amenities', 'Gallery', 'Reviews', 'Book Now']
    return (
      <SiteNav
        brand={props.brand ?? 'Azure Cove Retreats'}
        brandMark={<PalmMark className="size-8 text-primary" />}
        brandClassName="text-xl font-semibold tracking-tight"
        nav={nav}
        phone={props.phone ?? '+1 (800) 555-0199'}
        cta={{
          label: props.ctaLabel ?? 'Book Now',
          target: props.ctaTarget ?? 'Book Now',
        }}
        homeTarget={props.homeTarget ?? nav[0]}
        className={props.className}
      />
    )
  },
})
