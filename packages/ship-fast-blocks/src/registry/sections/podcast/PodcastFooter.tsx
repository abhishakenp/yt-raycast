import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  SiteFooter,
  FooterContent,
  FooterGrid,
  FooterBrand,
  FooterTagline,
  FooterSocial,
  FooterSocialLink,
  FooterColumn,
  FooterColumnTitle,
  FooterColumnList,
  FooterLink,
  FooterBottom,
  FooterCopyright,
} from '#/section-kit/SiteFooter.tsx'

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

/** Div-built token waveform accent under the brand block. */
const WAVEFORM_BARS = [
  'h-2',
  'h-4',
  'h-3',
  'h-6',
  'h-3',
  'h-5',
  'h-4',
  'h-7',
  'h-3',
  'h-5',
  'h-2',
  'h-6',
  'h-4',
  'h-3',
  'h-5',
]

function Waveform({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn('flex items-center gap-[3px]', className)}
    >
      {WAVEFORM_BARS.map((h, i) => (
        <span
          key={i}
          className={cn(
            'w-[3px] shrink-0 rounded-none',
            h,
            i % 5 === 3 ? 'bg-primary' : 'bg-foreground/20',
          )}
        />
      ))}
    </div>
  )
}

export const PodcastFooter = defineCapsule({
  name: 'PodcastFooter',
  description:
    "Multi-column audio-editorial podcast footer built on SiteFooter: a 'Signal & Static' brand block with a mic/soundwave mark, a div-built token waveform accent, and a tagline, a mono social row (Instagram / Twitter / YouTube), and link columns grouped under mono uppercase Listen, Show, and Company headings, finished with a hairline bottom copyright note. Designed for podcast and audio-show sites that want a warm, structured broadsheet close to every page. Renders fully with no props via baked defaults and passes className through for layout control.",
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
      <SiteFooter className={props.className}>
        <FooterContent>
          <FooterGrid>
            <FooterBrand
              brand={props.brand ?? 'Signal & Static'}
              brandMark={<MicWaveMark className="size-8 text-primary" />}
              brandClassName={'text-xl font-extrabold tracking-tight'}
            >
              <FooterTagline>
                {props.tagline ??
                  'Conversations on sound, story, and the static in between — a new episode every Thursday.'}
              </FooterTagline>
              <Waveform className="mt-5 h-7" />
              <FooterSocial>
                {social.map((s) => (
                  <FooterSocialLink
                    key={s.label}
                    className="block w-fit font-mono text-[11px] uppercase tracking-[0.14em]"
                  >
                    {s.label}
                  </FooterSocialLink>
                ))}
              </FooterSocial>
            </FooterBrand>
            {columns.map((col) => (
              <FooterColumn key={col.title}>
                <FooterColumnTitle className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  {col.title}
                </FooterColumnTitle>
                <FooterColumnList>
                  {col.links.map((link) => (
                    <FooterLink key={link} className="block w-fit">
                      {link}
                    </FooterLink>
                  ))}
                </FooterColumnList>
              </FooterColumn>
            ))}
          </FooterGrid>
          <FooterBottom>
            <FooterCopyright className="font-mono text-[11px] uppercase tracking-[0.14em]">
              {props.note ?? 'All rights reserved.'}
            </FooterCopyright>
          </FooterBottom>
        </FooterContent>
      </SiteFooter>
    )
  },
})
