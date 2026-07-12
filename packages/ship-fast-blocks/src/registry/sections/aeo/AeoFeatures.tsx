import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import type { ReactNode } from 'react'

import { FeatureGrid } from '#/section-kit/FeatureGrid.tsx'

const ICONS: ReactNode[] = [
  <>
    <path d="M3 3v18h18" />
    <path d="m7 14 3-3 3 3 5-6" />
  </>,
  <>
    <path d="M12 3l1.9 4.6L18.5 9.5l-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9L12 3Z" />
  </>,
  <>
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </>,
  <>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
    <path d="M9 14h6M9 18h4" />
  </>,
  <>
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </>,
  <>
    <path d="m9 11 3 3L22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </>,
]

function FeatureIcon({ glyph }: { glyph: ReactNode }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {glyph}
    </svg>
  )
}

const DEFAULT_FEATURES: { title: string; description: string }[] = [
  {
    title: 'Answer tracking',
    description:
      'Monitor exactly how ChatGPT, Perplexity, and Google AI Overviews answer the prompts that matter — and whether your brand is cited.',
  },
  {
    title: 'Citation optimization',
    description:
      'Get concrete, prompt-level recommendations to restructure content so answer engines pull and attribute your pages.',
  },
  {
    title: 'Share-of-voice monitoring',
    description:
      "See your brand's share of AI answers against competitors over time, broken down by engine, topic, and intent.",
  },
  {
    title: 'Source & sentiment reporting',
    description:
      'Know which sources engines trust, what they say about you, and where sentiment drifts — with weekly executive reports.',
  },
  {
    title: 'Prompt opportunity finder',
    description:
      'Surface high-value, low-coverage prompts where you can realistically win the cited answer first.',
  },
  {
    title: 'Alerts & change detection',
    description:
      'Get notified the moment an engine changes how it answers a tracked query or drops your citation.',
  },
]

export const AeoFeatures = defineCapsule({
  name: 'AeoFeatures',
  description:
    'Feature grid for an Answer-Engine-Optimization (AEO) SaaS, composing the shared FeatureGrid composite into a set of capability cards — answer tracking, citation optimization, share-of-voice monitoring, source & sentiment reporting, prompt opportunity finding, and change alerts. Each card pairs a line icon with a benefit-led description. Use to communicate product value on AEO, generative-search visibility, or brand-citation analytics landing pages.',
  props: z.object({
    heading: z.string().optional(),
    subheading: z.string().optional(),
    features: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
        }),
      )
      .optional(),
    columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Everything you need to win the AI answer'
    const subheading =
      props.subheading ??
      'One platform to track, optimize, and prove your visibility across every answer engine.'
    const source = props.features?.length ? props.features : DEFAULT_FEATURES
    const features = source.map((f, i) => ({
      title: f.title,
      description: f.description,
      icon: <FeatureIcon glyph={ICONS[i % ICONS.length]} />,
    }))

    return (
      <section
        className={
          'bg-background py-20 lg:py-28' +
          (props.className ? ' ' + props.className : '')
        }
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <FeatureGrid
            heading={heading}
            subheading={subheading}
            features={features}
            columns={props.columns ?? 3}
          />
        </div>
      </section>
    )
  },
})
