import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { SiteNav } from '#/section-kit/SiteNav.tsx'

const Mark = ({ className }: { className?: string }) => (
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

export const WeddingNavbar = defineCapsule({
  name: 'WeddingNavbar',
  description:
    'Elegant sticky wedding header built on the shared SiteNav composite: serif couple wordmark, interlocking-rings brand mark, romantic nav links (Story, Gallery, Details, RSVP), and an RSVP call to action. Use as the page header for a wedding invitation or celebration site, or as the top band of any generated wedding page family.',
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
    return (
      <SiteNav
        brand={props.brand ?? 'Ava & Liam'}
        brandMark={<Mark className="size-8 text-primary" />}
        brandClassName="font-serif text-xl font-medium"
        nav={nav}
        cta={{
          label: props.ctaLabel ?? 'RSVP',
          target: props.ctaTarget ?? 'RSVP',
        }}
        homeTarget={props.homeTarget ?? nav[0]}
        className={props.className}
      />
    )
  },
})
