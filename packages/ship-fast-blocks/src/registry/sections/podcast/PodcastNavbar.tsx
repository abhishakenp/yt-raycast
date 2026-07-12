import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { SiteNav } from '#/section-kit/SiteNav.tsx'

function MicWaveMark({ className }: { className?: string }) {
  return (
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
      <rect x="9" y="2" width="6" height="11" rx="3" />
      <path d="M5 10v1a7 7 0 0 0 14 0v-1" />
      <path d="M12 18v3" />
      <path d="M2 14v-3" />
      <path d="M22 14v-3" />
      <path d="M5 15v-1" />
      <path d="M19 15v-1" />
    </svg>
  )
}

export const PodcastNavbar = defineCapsule({
  name: 'PodcastNavbar',
  description:
    "Sticky podcast site header built on SiteNav: a 'Signal & Static' wordmark paired with a mic/soundwave mark, a centered desktop nav, a Subscribe CTA, and a mobile drawer. Designed for podcasts and audio shows that want a warm, on-air feel at the top of every page. Renders fully with no props via baked defaults and passes className through for layout control.",
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
      : ['Episodes', 'About', 'Hosts', 'Subscribe']
    return (
      <SiteNav
        brand={props.brand ?? 'Signal & Static'}
        brandMark={<MicWaveMark className="size-8 text-primary" />}
        brandClassName="font-semibold tracking-tight text-xl"
        nav={nav}
        cta={{
          label: props.ctaLabel ?? 'Subscribe',
          target: props.ctaTarget ?? 'Subscribe',
        }}
        homeTarget={props.homeTarget ?? nav[0]}
        className={props.className}
      />
    )
  },
})
