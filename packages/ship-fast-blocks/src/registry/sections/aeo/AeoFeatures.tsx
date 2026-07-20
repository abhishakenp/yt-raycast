import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import type { ReactNode } from 'react'

import {
  FeatureGrid,
  FeatureCard,
  FeatureIcon as KitFeatureIcon,
  FeatureTitle,
  FeatureDescription,
} from '#/section-kit/FeatureGrid.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { Container } from '#/section-kit/Container.tsx'

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

function featureFlag(title: string) {
  const word = String(title).trim().split(/\s+/)[0] ?? 'feature'
  const slug = word.toLowerCase().replace(/[^a-z0-9]/g, '')
  return `--${slug || 'feature'}`
}

/** Decorative mini AI-answer mock built from pure divs for the lead bento cell. */
function AnswerMock() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none mt-auto select-none border border-border bg-background p-4"
    >
      <p className="font-mono text-[11px] text-muted-foreground">
        <span className="text-primary">&gt;_</span> which brands do AI answers
        cite?
      </p>
      <div className="mt-3 space-y-1.5">
        <div className="h-1.5 w-11/12 bg-muted-foreground/20" />
        <div className="h-1.5 w-full bg-muted-foreground/20" />
        <div className="h-1.5 w-2/3 bg-muted-foreground/20" />
      </div>
      <p className="mt-3 flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
        <span className="inline-flex items-center rounded-full bg-primary/10 px-1.5 py-0.5 font-semibold text-primary">
          [1]
        </span>
        cited source — you
      </p>
    </div>
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

/**
 * AeoFeatures — "Answer Terminal" bento capability grid for an Answer-Engine-
 * Optimization (AEO) SaaS. An asymmetric left-aligned header (mono index label
 * + title) sits above a bento of hairline rounded-none cells: the lead feature
 * spans two columns and embeds a div-built mini AI-answer mock with a "[1]"
 * citation chip; every cell carries a mono "--flag" index label, a small plain
 * stroke icon, and floods to muted on hover. Use to communicate product value
 * on AEO, generative-search visibility, or brand-citation analytics pages.
 */
export const AeoFeatures = defineCapsule({
  name: 'AeoFeatures',
  description:
    "Terminal-styled bento feature grid for an Answer-Engine-Optimization (AEO) SaaS: an asymmetric mono-labeled header above hairline rounded-none cells — the lead capability spans two columns with an embedded div-built mini AI-answer mock and '[1]' citation chip, and every cell pairs a mono '--flag' index label with a small stroke icon and a benefit-led description, flooding to muted on hover. Capabilities cover answer tracking, citation optimization, share-of-voice monitoring, source & sentiment reporting, prompt opportunity finding, and change alerts. Use to communicate product value on AEO, generative-search visibility, or brand-citation analytics landing pages.",
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
        <Container size="xl" className="px-6">
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              align="left"
              eyebrow="01 / Capabilities"
              title={heading}
              subtitle={subheading}
              className="max-w-2xl gap-2"
              eyebrowClassName="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
              titleClassName="text-3xl font-semibold tracking-tight md:text-4xl"
            />
            <p
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60"
            >
              ## feature index
            </p>
          </div>
          <FeatureGrid
            columns={props.columns ?? 3}
            className="max-md:[&>div]:gap-0 max-md:[&>div]:border-l max-md:[&>div]:border-t max-md:[&>div]:border-border sm:max-md:[&>div]:grid-cols-2"
          >
            {features.map((f, index) => {
              const __iv__ = f as {
                title: string
                description: string
                icon?: React.ReactNode
                points?: string[]
                cta?: string
                price?: string
                imageAlt?: string
              }
              return (
                <FeatureCard
                  key={`${__iv__.title}-${index}`}
                  className={
                    'rounded-none border-border bg-card p-5 transition-colors duration-150 hover:bg-muted max-md:border-0 max-md:border-b max-md:border-r sm:p-6' +
                    (index === 0 ? ' sm:col-span-2 md:row-span-1' : '')
                  }
                >
                  <span className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    <span className="normal-case tracking-normal text-primary">
                      {featureFlag(__iv__.title)}
                    </span>
                    <span aria-hidden="true">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </span>
                  {__iv__.icon && (
                    <KitFeatureIcon className="size-8 rounded-none bg-transparent text-foreground [&>svg]:size-5">
                      {__iv__.icon}
                    </KitFeatureIcon>
                  )}
                  <FeatureTitle className="tracking-tight">
                    {__iv__.title}
                  </FeatureTitle>
                  <FeatureDescription>{__iv__.description}</FeatureDescription>
                  {index === 0 ? <AnswerMock /> : null}
                </FeatureCard>
              )
            })}
          </FeatureGrid>
        </Container>
      </section>
    )
  },
})
