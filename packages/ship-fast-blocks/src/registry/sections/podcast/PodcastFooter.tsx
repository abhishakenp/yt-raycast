import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { SiteFooter } from '#/section-kit/SiteFooter.tsx'

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

export const PodcastFooter = defineCapsule({
  name: 'PodcastFooter',
  description:
    "Multi-column podcast footer built on SiteFooter: a 'Signal & Static' brand block with a mic/soundwave mark and tagline, a social row (Instagram / Twitter / YouTube), and link columns grouped into Listen, Show, and Company, finished with a bottom copyright note. Designed for podcast and audio-show sites that want a warm, structured close to every page. Renders fully with no props via baked defaults and passes className through for layout control.",
  props: z.object({
    brand: z.string().optional(),
    tagline: z.string().optional(),
    social: z
      .array(z.object({ label: z.string(), href: z.string().optional() }))
      .optional(),
    columns: z
      .array(z.object({ title: z.string(), links: z.array(z.string()) }))
      .optional(),
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const social = props.social?.length
      ? props.social
      : [{ label: 'Instagram' }, { label: 'Twitter' }, { label: 'YouTube' }]
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Listen',
            links: ['Apple Podcasts', 'Spotify', 'Overcast', 'RSS Feed'],
          },
          { title: 'Show', links: ['Episodes', 'About', 'Hosts', 'Topics'] },
          {
            title: 'Company',
            links: ['Sponsor', 'Contact', 'Press', 'Newsletter'],
          },
        ]
    return (
      <SiteFooter
        brand={props.brand ?? 'Signal & Static'}
        brandMark={<MicWaveMark className="size-8 text-primary" />}
        brandClassName="font-semibold tracking-tight text-xl"
        tagline={
          props.tagline ??
          'Conversations on sound, story, and the static in between — a new episode every Thursday.'
        }
        social={social}
        columns={columns}
        note={props.note ?? 'All rights reserved.'}
        className={props.className}
      />
    )
  },
})
