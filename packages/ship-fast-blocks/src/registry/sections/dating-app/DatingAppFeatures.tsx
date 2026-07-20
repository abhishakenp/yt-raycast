import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import {
  FeatureGrid,
  FeatureCard,
  FeatureIcon,
  FeatureTitle,
  FeatureDescription,
} from '#/section-kit/FeatureGrid.tsx'

/**
 * DatingAppFeatures — playful-geometric collapsed-border feature ledger for a
 * dating / matchmaking app. An asymmetric header (left-aligned extrabold
 * heading + lede, mono "[ 06 ] compatibility factors" meta right) above a
 * sharp-cornered 2/3-column collapsed-border grid: every cell shares hairline
 * rules and carries a mono primary index numeral beside a tiny rounded-full
 * dot, a bold title, and a description; alternating cells sit on a faint muted
 * wash and hover floods a faint primary tint. Use to showcase product
 * capabilities — smart matching, verified profiles, conversations, events,
 * video dates, safety — for dating apps, singles platforms, or
 * social-connection products. Renders fully with no props via baked-in
 * "HeartLink" feature defaults.
 */
export const DatingAppFeatures = defineCapsule({
  name: 'DatingAppFeatures',
  description:
    'Playful-geometric collapsed-border feature ledger for a dating / matchmaking app: an asymmetric header (left-aligned extrabold heading + lede, mono count meta right) above a sharp 2/3-column collapsed-border grid whose cells share hairline rules and carry a mono primary index numeral beside a tiny rounded-full dot, a bold title, and a description; alternating cells sit on a faint muted wash and hover floods a faint primary tint. Use to showcase product capabilities — smart matching, verified profiles, conversations, events, video dates, safety — for dating apps, singles platforms, or social-connection products.',
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    items: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const featuresHeading = props.heading ?? 'Why millions choose HeartLink'
    const featuresDesc =
      props.description ??
      "We've designed every feature to help you find meaningful connections safely and efficiently."
    const featureItems = props.items?.length
      ? props.items
      : [
          {
            title: 'Smart Matching',
            description:
              "Our AI analyzes 32 compatibility factors—from communication style to relationship goals—to find people you'll genuinely click with.",
          },
          {
            title: 'Verified Profiles',
            description:
              "Every photo is verified through live selfie checks. Know exactly who you're talking to—no catfishing, no surprises.",
          },
          {
            title: 'Meaningful Conversations',
            description:
              'Icebreaker prompts and conversation starters based on shared interests. No more "hey" messages or awkward silences.',
          },
          {
            title: 'Local Events',
            description:
              'Discover singles events, mixers, and group activities in your city. Meet matches in safe, social settings curated by HeartLink.',
          },
          {
            title: 'Video Dates',
            description:
              'Built-in video calling with fun filters and games. Have a mini date from your couch before meeting in person.',
          },
          {
            title: 'Safety First',
            description:
              'Share your date plans with friends, access 24/7 support, and block/report with one tap. Your safety is our priority.',
          },
        ]

    return (
      <section className={cn('bg-background py-16 lg:py-24', props.className)}>
        <Container>
          {/* Asymmetric header: heading left, mono meta right. */}
          <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-14">
            <SectionHeading
              align="left"
              title={featuresHeading}
              subtitle={featuresDesc}
              className="max-w-2xl gap-0"
              titleClassName="mb-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
              subtitleClassName="text-lg text-muted-foreground"
            />
            <MonoTag aria-hidden="true" tone="faint" className="shrink-0">
              [ {String(featureItems.length).padStart(2, '0')} ] compatibility
              factors
            </MonoTag>
          </div>
          <FeatureGrid
            columns={3}
            className="gap-0 [&>div]:grid-cols-1 [&>div]:gap-0 [&>div]:border-l [&>div]:border-t [&>div]:border-border sm:[&>div]:grid-cols-2 md:[&>div]:grid-cols-3"
          >
            {featureItems.map((f, i) => {
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
                  key={__iv__.title}
                  className={cn(
                    'gap-3 rounded-none border-0 border-b border-r border-border p-5 transition-colors duration-150 hover:-translate-y-0 hover:bg-primary/5 sm:p-7',
                    i % 2 === 1 ? 'bg-muted/40' : 'bg-background',
                  )}
                >
                  <span className="flex items-center gap-2">
                    <MonoTag tone="primary" className="tabular-nums">
                      {String(i + 1).padStart(2, '0')}
                    </MonoTag>
                    <span
                      aria-hidden="true"
                      className="size-1.5 rounded-full bg-primary/40"
                    />
                  </span>
                  {__iv__.icon && <FeatureIcon>{__iv__.icon}</FeatureIcon>}
                  <FeatureTitle className="text-lg font-bold tracking-tight">
                    {__iv__.title}
                  </FeatureTitle>
                  <FeatureDescription className="text-sm leading-relaxed">
                    {__iv__.description}
                  </FeatureDescription>
                </FeatureCard>
              )
            })}
          </FeatureGrid>
        </Container>
      </section>
    )
  },
})
