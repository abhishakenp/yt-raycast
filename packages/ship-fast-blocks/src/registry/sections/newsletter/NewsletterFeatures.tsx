import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  FeatureGrid,
  FeatureCard,
  FeatureIcon,
  FeatureTitle,
  FeatureDescription,
} from '#/section-kit/FeatureGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { ResponsiveGrid } from '#/section-kit/ResponsiveGrid.tsx'

/**
 * NewsletterFeatures — "What You Get" value grid for an editorial newsletter.
 * A centered serif heading + lede introduces a 3-up grid of feature cards, each
 * with a rounded muted icon tile (rotating book / links / chat line icons), a
 * serif title, and a relaxed description; a bordered divider then opens a 2-up /
 * 4-up checklist of smaller perks, each a circular check badge beside a bold
 * title and muted sub-line. Warm, calm, literary mood on a paper-toned surface.
 * Use to explain what lands in subscribers' inbox for newsletters, publications,
 * blogs, or content creators. Renders fully with no props via baked-in defaults.
 */
export const NewsletterFeatures = defineCapsule({
  name: 'NewsletterFeatures',
  description:
    "'What You Get' value grid for an editorial newsletter: a centered serif heading + lede introduces a 3-up grid of feature cards, each with a rounded muted icon tile (rotating book / links / chat line icons), a serif title, and a relaxed description; a bordered divider then opens a 2-up / 4-up checklist of smaller perks, each a circular check badge beside a bold title and muted sub-line. Warm, calm, literary mood on a paper-toned surface. Use to explain what lands in subscribers' inbox for newsletters, publications, blogs, essayists, or content creators.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting lede under the heading. */
    description: z.string().optional(),
    /** Primary feature cards. */
    items: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    /** Smaller checklist perks below the divider. */
    perks: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'What You Get'
    const description =
      props.description ??
      "Every issue is crafted with care. Here's what lands in your inbox each Sunday."
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'One Deep Essay',
            description:
              "A 1,500-2,000 word essay exploring a single topic with nuance. No listicles. No clickbait. Just thoughtful analysis on technology's impact on our lives.",
          },
          {
            title: 'Curated Links',
            description:
              'Five carefully selected articles, books, and podcasts that informed my thinking this week. Each with a personal note on why it matters.',
          },
          {
            title: 'Community Replies',
            description:
              "Every email is a conversation. Reply directly and I'll respond. The best reader insights get featured (anonymously) in the next issue.",
          },
        ]
    const perks = props.perks?.length
      ? props.perks
      : [
          { title: 'Archive Access', description: 'All 156 past issues' },
          { title: 'Audio Versions', description: 'Listen on the go' },
          { title: 'No Ads', description: 'Reader-supported only' },
          { title: 'Private Discord', description: 'Join the conversation' },
        ]

    const Check = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M5 13l4 4L19 7" />
      </svg>
    )

    return (
      <section className={cn('py-16 md:py-24 lg:py-28', props.className)}>
        <Container size="lg">
          <SectionHeading
            title={heading}
            subtitle={description}
            align="center"
            titleClassName="font-serif text-3xl font-medium sm:text-4xl"
            subtitleClassName="text-lg"
            className="mx-auto mb-12 max-w-2xl gap-6 md:mb-16"
          />

          <FeatureGrid columns={3}>
            {items.map((f) => {
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

          <div className="mt-16 border-t border-border pt-16 md:mt-20 md:pt-20">
            <ResponsiveGrid cols="1-2-4" gap="md">
              {perks.map((perk) => (
                <div key={perk.title} className="flex items-start gap-3">
                  <span className="mt-0.5 grid size-5 flex-shrink-0 place-items-center rounded-full bg-muted text-foreground">
                    <Check className="size-3" />
                  </span>
                  <div>
                    <p className="font-medium text-foreground">{perk.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {perk.description}
                    </p>
                  </div>
                </div>
              ))}
            </ResponsiveGrid>
          </div>
        </Container>
      </section>
    )
  },
})
