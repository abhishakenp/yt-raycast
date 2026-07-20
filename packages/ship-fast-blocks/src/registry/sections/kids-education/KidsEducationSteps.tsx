import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

/**
 * KidsEducationSteps — playful-primary "how it works" flow for a kids / family
 * learning platform. On a muted band under a giant ghost watermark: an
 * asymmetric mono-labeled header (eyebrow + heading left, index meta right)
 * above a staggered 3-up grid of chunky sharp-cornered 2px-bordered step cards;
 * each card carries a sharp soft-tint numbered block, a bold title, a
 * description, and a sharp-bordered photo, with large connector arrows between
 * cards on desktop. Use to explain onboarding / get-started flows for
 * kids-education startups, children's e-learning platforms, tutoring services,
 * and family learning apps. Renders fully with no props via baked-in defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  StepTimeline,
  StepTimelineGrid,
  StepItem,
} from '#/section-kit/StepTimeline.tsx'
export const KidsEducationSteps = defineCapsule({
  name: 'KidsEducationSteps',
  description:
    "Playful-primary 'how it works' flow for a kids / family learning platform on a muted band under a giant ghost watermark: an asymmetric mono-labeled header (eyebrow + heading left, index meta right) above a staggered 3-up grid of chunky sharp-cornered 2px-bordered step cards, each with a sharp soft-tint numbered block, a bold title, a description, and a sharp-bordered photo, with large connector arrows between cards on desktop. Use to explain onboarding / get-started flows for kids-education startups, children's e-learning platforms, tutoring services, and family learning apps.",
  props: z.object({
    /** Uppercase eyebrow above the heading. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting description under the heading. */
    description: z.string().optional(),
    /** Step cards. */
    items: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
          imageAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'How It Works'
    const heading = props.heading ?? 'Learning Made Simple'
    const description =
      props.description ??
      'Get started in minutes. Our guided approach ensures every child finds activities matched to their interests and level.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Create a Profile',
            description:
              'Set up personalized profiles for each child. Tell us their age, interests, and learning goals.',
            imageAlt:
              'Parent and child creating a learning profile on a tablet together',
          },
          {
            title: 'Get Recommendations',
            description:
              "Our smart system suggests activities tailored to your child's age, skills, and interests.",
            imageAlt:
              'Tablet screen showing colorful learning app interface with activity recommendations',
          },
          {
            title: 'Learn & Track Progress',
            description:
              'Complete activities, earn badges, and watch skills grow. Parents get detailed progress reports.',
            imageAlt:
              'Child proudly showing completed artwork with achievement badges displayed on screen',
          },
        ]
    const stepTints = [
      'bg-primary/15 text-primary',
      'bg-secondary/15 text-secondary-foreground',
      'bg-accent/15 text-accent-foreground',
    ]
    const ArrowRight = ({ className }: { className?: string }) => (
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
        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    )
    return (
      <StepTimeline
        className={cn(
          'relative overflow-hidden bg-muted/40 py-20 lg:py-24',
          props.className,
        )}
      >
        <Watermark className="-left-4 bottom-4 text-[7rem] sm:text-[10rem] lg:text-[13rem]">
          STEPS
        </Watermark>
        <Container className="relative">
          <div className="mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              align="left"
              eyebrow={eyebrow}
              title={heading}
              subtitle={description}
              className="max-w-2xl gap-0"
              eyebrowClassName="mb-3 inline-block font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground"
              titleClassName="mb-5 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
              subtitleClassName="text-lg text-muted-foreground"
            />
            <MonoTag
              aria-hidden="true"
              className="shrink-0 text-muted-foreground/60"
            >
              [ 03 ] onboarding
            </MonoTag>
          </div>

          <StepTimelineGrid columns={3} className="items-start gap-8 lg:gap-12">
            {items.map((step, i) => (
              <StepItem key={step.title} className="relative">
                <div
                  className={cn(
                    'rounded-none border-2 border-foreground bg-card p-6 shadow-[5px_5px_0_0] shadow-transparent transition-[transform,box-shadow] duration-150 hover:-translate-y-1 hover:shadow-foreground motion-reduce:transform-none',
                    i % 3 === 1 && 'lg:mt-10',
                  )}
                >
                  <div
                    className={cn(
                      'mb-6 grid size-14 place-items-center rounded-none border-2 border-foreground',
                      stepTints[i % stepTints.length],
                    )}
                  >
                    <span className="font-mono text-2xl font-extrabold tabular-nums">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className="mb-3 text-xl font-extrabold tracking-tight text-card-foreground">
                    {step.title}
                  </h3>
                  <p className="mb-6 text-muted-foreground">
                    {step.description}
                  </p>
                  <div className="overflow-hidden rounded-none border-2 border-foreground">
                    <Image
                      alt={step.imageAlt}
                      w={400}
                      h={300}
                      loading="lazy"
                      className="h-48 w-full object-cover"
                    />
                  </div>
                </div>
                {i < items.length - 1 && (
                  <div className="absolute top-20 -right-6 hidden -translate-y-1/2 md:block lg:-right-9">
                    <ArrowRight className="size-10 text-foreground/40" />
                  </div>
                )}
              </StepItem>
            ))}
          </StepTimelineGrid>
        </Container>
      </StepTimeline>
    )
  },
})
