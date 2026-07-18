import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

import { Container } from '#/section-kit/Container.tsx'
import {
  FeatureGrid,
  FeatureCard,
  FeatureIcon,
  FeatureTitle,
  FeatureDescription,
} from '#/section-kit/FeatureGrid.tsx'

/**
 * DatingAppFeatures — a 6-up feature grid for a dating / matchmaking app. A
 * centered heading + supporting paragraph above a responsive 1/2/3-column grid of
 * soft muted cards, each with a rounded primary-tinted icon tile (rotating through
 * a built-in set of decorative line icons), a bold title, and a description; cards
 * lift to a faint primary tint on hover. Use to showcase product capabilities —
 * smart matching, verified profiles, conversations, events, video dates, safety —
 * for dating apps, singles platforms, or social-connection products. Renders fully
 * with no props via baked-in "HeartLink" feature defaults.
 */
export const DatingAppFeatures = defineCapsule({
  name: 'DatingAppFeatures',
  description:
    '6-up feature grid for a dating / matchmaking app: a centered heading + supporting paragraph above a responsive 1/2/3-column grid of soft muted cards, each with a rounded primary-tinted icon tile (rotating through a built-in set of decorative line icons), a bold title, and a description; cards lift to a faint primary tint on hover. Use to showcase product capabilities — smart matching, verified profiles, conversations, events, video dates, safety — for dating apps, singles platforms, or social-connection products.',
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
      <section className={cn('bg-background py-24', props.className)}>
        <Container>
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
              {featuresHeading}
            </h2>
            <p className="text-lg text-muted-foreground">{featuresDesc}</p>
          </div>
          <FeatureGrid columns={3}>
            {featureItems.map((f) => {
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
                <FeatureCard key={__iv__.title}>
                  {__iv__.icon && <FeatureIcon>{__iv__.icon}</FeatureIcon>}
                  <FeatureTitle>{__iv__.title}</FeatureTitle>
                  <FeatureDescription>{__iv__.description}</FeatureDescription>
                </FeatureCard>
              )
            })}
          </FeatureGrid>
        </Container>
      </section>
    )
  },
})
