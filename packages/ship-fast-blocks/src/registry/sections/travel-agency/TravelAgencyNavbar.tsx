import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { SiteNav } from '#/section-kit/SiteNav.tsx'

const CompassMark = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M15.5 8.5l-2 5-5 2 2-5z" />
  </svg>
)

export const TravelAgencyNavbar = defineComponent({
  name: 'TravelAgencyNavbar',
  description:
    "Premium, wanderlust-themed navigation header for the Travel Agency page family. Composes the shared SiteNav kit composite with a travel-forward brand, compass brandmark, destination-led links, a contact phone, and a prominent 'Plan a Trip' call to action. Use as the first band of a travel agency page or whenever a generated travel site needs a polished, token-styled top navigation without hand-rolled markup.",
  props: z.object({
    brand: z.string().optional(),
    nav: z.array(z.string()).optional(),
    phone: z.string().optional(),
    homeTarget: z.string().optional(),
    ctaLabel: z.string().optional(),
    ctaTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const nav = props.nav?.length
      ? props.nav
      : ['Destinations', 'Flights', 'Hotels', 'Packages', 'Plan a Trip']
    return (
      <SiteNav
        brand={props.brand ?? 'Voyage & Co'}
        brandMark={<CompassMark className="size-8 text-primary" />}
        nav={nav}
        phone={props.phone ?? '+1 (800) 555-0182'}
        cta={{
          label: props.ctaLabel ?? 'Plan a Trip',
          target: props.ctaTarget ?? 'Plan a Trip',
        }}
        homeTarget={props.homeTarget ?? nav[0]}
        className={props.className}
      />
    )
  },
})
