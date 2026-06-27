import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { SiteNav } from '#/section-kit/SiteNav.tsx'

/**
 * VideoStreamingNavbar — sticky site header for a cinematic video-streaming
 * brand (think "Lumen" or "Nova+"). Thin configuration over the shared `SiteNav`
 * composite: a bold wordmark beside an inline play-triangle mark in the primary
 * accent, centered nav links (Browse, Shows, Movies, Pricing), and a high-intent
 * "Start Watching" CTA, with a real mobile drawer on small screens. Use as the
 * header for streaming services, on-demand video apps, or OTT platforms.
 * Renders fully with no props via baked-in defaults.
 */
const PlayMark = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M7 4.5v15a1 1 0 0 0 1.52.85l12-7.5a1 1 0 0 0 0-1.7l-12-7.5A1 1 0 0 0 7 4.5Z" />
  </svg>
)

export const VideoStreamingNavbar = defineCapsule({
  name: 'VideoStreamingNavbar',
  description:
    "Sticky site header for a cinematic video-streaming brand built on the shared SiteNav composite: a bold wordmark + inline primary play-triangle mark, centered desktop nav links (Browse, Shows, Movies, Pricing), a 'Start Watching' CTA, and a real mobile drawer. Use as the header for streaming services, on-demand video apps, or OTT platforms where signup is the primary action.",
  props: z.object({
    /** Streaming brand name shown beside the play mark. */
    brand: z.string().optional(),
    /** Nav link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Navigation target for the logo / brand click. */
    homeTarget: z.string().optional(),
    /** Pill-shaped CTA label on the right. */
    ctaLabel: z.string().optional(),
    /** Navigation target for the pill CTA. */
    ctaTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const nav = props.nav?.length
      ? props.nav
      : ['Browse', 'Shows', 'Movies', 'Pricing']
    return (
      <SiteNav
        brand={props.brand ?? 'Lumen'}
        brandMark={<PlayMark className="size-7 text-primary" />}
        brandClassName="font-bold tracking-tight"
        nav={nav}
        cta={{
          label: props.ctaLabel ?? 'Start Watching',
          target: props.ctaTarget ?? 'Pricing',
        }}
        homeTarget={props.homeTarget ?? nav[0]}
        className={props.className}
      />
    )
  },
})
