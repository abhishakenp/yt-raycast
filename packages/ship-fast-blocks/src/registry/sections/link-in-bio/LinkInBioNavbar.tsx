import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { SiteNav } from '#/section-kit/SiteNav.tsx'

/**
 * LinkInBioNavbar — minimal, mobile-first header for a single-page link-in-bio
 * hub. Thin configuration over the shared `SiteNav` composite: a bold monogram
 * spark mark beside a creator name, one or two in-page anchor links, and a
 * prominent "Follow" CTA. No phone number, no sprawling menu — just enough to
 * frame a personal link hub for a creator, artist, musician, or solo founder.
 * Renders fully with no props.
 */
const SparkMark = ({ className }: { className?: string }) => (
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
    <path d="M12 7.5l1.4 3.1 3.1 1.4-3.1 1.4L12 16.5l-1.4-3.1L7.5 12l3.1-1.4z" />
  </svg>
)

export const LinkInBioNavbar = defineCapsule({
  name: 'LinkInBioNavbar',
  description:
    "Minimal, mobile-first header for a single-page link-in-bio hub built on the shared SiteNav composite: a bold monogram spark mark beside a creator name, one or two in-page anchor links, and a prominent 'Follow' CTA — no phone, no sprawling menu. Use as the header for a creator, artist, musician, influencer, or solo founder link hub. Renders fully with no props.",
  props: z.object({
    /** Creator / brand name shown beside the spark mark. */
    brand: z.string().optional(),
    /** Nav link labels (must match in-page anchors for switching). */
    nav: z.array(z.string()).optional(),
    /** Navigation target for the logo / brand click. */
    homeTarget: z.string().optional(),
    /** Prominent pill CTA label on the right. */
    ctaLabel: z.string().optional(),
    /** Navigation target for the pill CTA. */
    ctaTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const nav = props.nav?.length ? props.nav : ['Links', 'About']
    return (
      <SiteNav
        brand={props.brand ?? 'Sarah Chen'}
        brandMark={<SparkMark className="size-8 text-primary" />}
        brandClassName="text-lg font-semibold tracking-tight"
        nav={nav}
        cta={{
          label: props.ctaLabel ?? 'Follow',
          target: props.ctaTarget ?? 'Follow',
        }}
        homeTarget={props.homeTarget ?? nav[0]}
        className={props.className}
      />
    )
  },
})
