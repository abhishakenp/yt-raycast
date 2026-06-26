import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { SiteNav } from '#/section-kit/SiteNav.tsx'

const brandMark = (
  <svg
    className="size-8 text-primary"
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

export const TutoringNavbar = defineComponent({
  name: 'TutoringNavbar',
  description:
    "Friendly, trustworthy navigation header for the tutoring page family. Composes the SiteNav kit composite to render a graduation-cap brand mark, warm wordmark, a desktop link row, an optional phone number, and a sticky 'Book a Session' call to action with a real mobile drawer. Use it as the first band of any tutoring site or whenever a generated education/tutoring page needs a consistent, route-aware top nav without hand-rolling markup.",
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

    return (
      <SiteNav
        brand={brand}
        brandMark={brandMark}
        brandClassName="font-semibold"
        nav={nav}
        phone={props.phone ?? '(555) 240-1188'}
        cta={{ label: ctaLabel, target: ctaTarget, variant: 'primary' }}
        homeTarget={props.homeTarget ?? nav[0]}
        sticky={props.sticky ?? true}
        className={props.className}
      />
    )
  },
})
