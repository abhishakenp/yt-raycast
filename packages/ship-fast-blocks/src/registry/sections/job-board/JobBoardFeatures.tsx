import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * JobBoardFeatures — a newsprint "why choose us" column ledger for a job-board /
 * careers site. A muted paper band with an asymmetric hairline header (serif
 * heading + description left, mono meta right) above a 3-column row of
 * open-ledger feature entries, each opened by a heavy top rule with a mono index
 * numeral, a serif title, and a supporting paragraph. Use to explain the value
 * proposition (verified employers, one-click apply, smart alerts) on job boards,
 * hiring marketplaces or recruiting platforms. Static (no links). Renders fully
 * with no props.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import {
  FeatureGrid,
  FeatureCard,
  FeatureTitle,
  FeatureDescription,
} from '#/section-kit/FeatureGrid.tsx'
export const JobBoardFeatures = defineCapsule({
  name: 'JobBoardFeatures',
  description:
    "Newsprint 'why choose us' column ledger for a job-board / careers site: a muted paper band with an asymmetric hairline header (serif heading and description left, mono meta right) above a 3-column row of open-ledger feature entries, each opened by a heavy top rule with a mono index numeral, a serif title and a supporting paragraph. Use to explain the value proposition (verified employers, one-click apply, smart alerts) on job boards, hiring marketplaces or recruiting platforms.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting description under the heading. */
    description: z.string().optional(),
    /** Feature cards: title + description. */
    items: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Why job seekers choose WorkFlow'
    const description =
      props.description ??
      'We have designed every feature to help you land your dream job faster'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Verified Employers',
            description:
              'Every company is vetted to ensure legitimate opportunities. No scams, no fake listings, just real jobs from real businesses.',
          },
          {
            title: 'One-Click Apply',
            description:
              'Apply to multiple positions with your saved profile. No more filling out the same information over and over again.',
          },
          {
            title: 'Smart Alerts',
            description:
              'Get notified instantly when jobs matching your skills are posted. Be among the first applicants and increase your chances.',
          },
        ]
    return (
      <section className={cn('bg-muted/40 py-16 lg:py-24', props.className)}>
        <Container>
          <div className="mb-10 flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between lg:mb-14">
            <SectionHeading
              align="left"
              title={heading}
              subtitle={description}
              className="max-w-2xl gap-2"
              titleClassName="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
              subtitleClassName="text-muted-foreground"
            />
            <MonoTag tone="faint" aria-hidden="true" className="shrink-0">
              The difference
            </MonoTag>
          </div>
          <FeatureGrid columns={3} className="gap-0">
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
                  className="gap-3 rounded-none border-0 border-t-2 border-foreground bg-transparent p-0 pt-5 transition-none hover:translate-y-0 hover:border-foreground"
                >
                  <span
                    aria-hidden="true"
                    className="font-mono text-[11px] tabular-nums text-muted-foreground/70"
                  >
                    {String(i + 1).padStart(3, '0')}
                  </span>
                  <FeatureTitle className="font-serif text-xl font-bold tracking-tight text-foreground">
                    {__iv__.title}
                  </FeatureTitle>
                  <FeatureDescription className="leading-relaxed text-muted-foreground">
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
