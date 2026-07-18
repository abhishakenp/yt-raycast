import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * JobBoardFeatures — a centered 3-up "why choose us" feature row for a job-board
 * / careers site. A muted band with a centered heading + description above a
 * 3-column grid of centered feature cards, each with a rounded outlined icon
 * chip, a bold title, and a supporting paragraph. Use to explain the value
 * proposition (verified employers, one-click apply, smart alerts) on job boards,
 * hiring marketplaces or recruiting platforms. Static (no links). Renders fully
 * with no props; built-in line icons rotate across the items.
 */
import { Container } from '#/section-kit/Container.tsx'
import { FeatureGrid } from '#/section-kit/FeatureGrid.tsx'
export const JobBoardFeatures = defineCapsule({
  name: 'JobBoardFeatures',
  description:
    "Centered 3-up 'why choose us' feature row for a job-board / careers site: a muted band with a centered heading + description above a 3-column grid of centered feature cards, each with a rounded outlined icon chip, a bold title and a supporting paragraph. Use to explain the value proposition (verified employers, one-click apply, smart alerts) on job boards, hiring marketplaces or recruiting platforms.",
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
      <section className={cn('bg-muted/40 py-20', props.className)}>
        <Container>
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground">
              {heading}
            </h2>
            <p className="mx-auto max-w-xl text-muted-foreground">
              {description}
            </p>
          </div>
          <FeatureGrid features={items} columns={3} />
        </Container>
      </section>
    )
  },
})
