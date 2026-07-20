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
import { MonoTag } from '#/section-kit/Decor.tsx'

/**
 * NewsletterFeatures — "What You Get" newsprint-lite value ledger for an
 * editorial newsletter. A hairline meta rail (a primary square + mono "In every
 * issue" label, a mono index tag) tops a left-aligned serif heading + lede; then
 * a 3-up row of square (rounded-none) hairline feature cards, each carrying a
 * giant faint ghost index numeral, a mono "№0X" label, a serif title, and a
 * relaxed description; a hairline divider then opens a collapsed-border 2-up /
 * 4-up perks ledger, each cell a mono index numeral beside a bold title and muted
 * sub-line. Clean paper-toned surface with restrained newspaper structure. Use to
 * explain what lands in subscribers' inbox for newsletters, publications, blogs,
 * or content creators. Renders fully with no props via baked-in defaults.
 */
export const NewsletterFeatures = defineCapsule({
  name: 'NewsletterFeatures',
  description:
    "'What You Get' newsprint-lite value ledger for an editorial newsletter: a hairline meta rail (a primary square + mono 'In every issue' label, a mono index tag) above a left-aligned serif heading + lede, then a 3-up row of square hairline feature cards each with a giant faint ghost index numeral, a mono '№0X' label, a serif title, and a relaxed description; a hairline divider then opens a collapsed-border 2-up / 4-up perks ledger where each cell is a mono index numeral beside a bold title and muted sub-line. Clean paper-toned surface with restrained newspaper structure. Use to explain what lands in subscribers' inbox for newsletters, publications, blogs, essayists, or content creators.",
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

    return (
      <section className={cn('py-16 md:py-24 lg:py-28', props.className)}>
        <Container size="lg">
          <div className="mb-8 flex items-center justify-between gap-4 border-b border-border pb-4">
            <MonoTag className="flex items-center gap-3 tracking-[0.25em]">
              <span aria-hidden="true" className="size-1.5 bg-primary" />
              In every issue
            </MonoTag>
            <MonoTag className="tracking-[0.25em]">
              №{String(items.length).padStart(2, '0')}
            </MonoTag>
          </div>

          <SectionHeading
            title={heading}
            subtitle={description}
            align="left"
            titleClassName="font-serif text-3xl font-medium sm:text-4xl"
            subtitleClassName="max-w-2xl text-lg"
            className="mb-12 max-w-3xl gap-4 md:mb-16"
          />

          <FeatureGrid columns={3}>
            {items.map((f, i) => {
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
                  className="relative gap-4 overflow-hidden rounded-none border-border bg-transparent p-7 hover:translate-y-0 sm:p-8"
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-2 -top-4 select-none font-serif text-[7rem] font-medium leading-none tracking-tight text-foreground/[0.05] tabular-nums"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {__iv__.icon && <FeatureIcon>{__iv__.icon}</FeatureIcon>}
                  <span className="relative font-mono text-[11px] uppercase tracking-[0.2em] text-primary tabular-nums">
                    №{String(i + 1).padStart(2, '0')}
                  </span>
                  <FeatureTitle className="relative font-serif text-xl font-medium">
                    {__iv__.title}
                  </FeatureTitle>
                  <FeatureDescription className="relative leading-relaxed">
                    {__iv__.description}
                  </FeatureDescription>
                </FeatureCard>
              )
            })}
          </FeatureGrid>

          <div className="mt-14 md:mt-20">
            <ResponsiveGrid
              cols="1-2-4"
              className="gap-0 border-l border-t border-border"
            >
              {perks.map((perk, i) => (
                <div
                  key={perk.title}
                  className="flex items-start gap-3 border-b border-r border-border p-5 sm:p-6"
                >
                  <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/70 tabular-nums">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <p className="font-medium text-foreground">{perk.title}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
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
