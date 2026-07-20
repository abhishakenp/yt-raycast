import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  StepBadge,
  StepConnector,
  StepItem,
  StepTimeline,
  StepTimelineGrid,
  StepTimelineHeader,
} from '#/section-kit/StepTimeline.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'

/**
 * CommunityForumSteps — playful-geometric staggered step timeline for a
 * community-platform / discussion-forum landing page. An asymmetric header
 * (mono "05 / how it works" rail + left-aligned tight-tracked heading and
 * lead, mono "[ 03 steps ]" meta right) above a 3-column timeline where each
 * step is a sharp-cornered bordered plate tilted ±1deg, the middle step nudged
 * down for a stagger. Every plate carries a rounded-full sticker number badge
 * with a hard offset shadow overlapping its top edge, a giant ghost step
 * numeral in the corner, a bold title, and a description; dashed connectors
 * run between plates on desktop. No links — instructional / persuasive only.
 * Use as the "how it works" / "get started" section for community platforms,
 * SaaS onboarding flows, or product walkthroughs.
 */
export const CommunityForumSteps = defineCapsule({
  name: 'CommunityForumSteps',
  description:
    "Playful-geometric staggered step timeline for a community-platform / discussion-forum landing page: an asymmetric header (mono metadata rail + left-aligned tight-tracked heading, mono meta tag right) above a 3-column timeline of sharp-cornered bordered plates tilted ±1deg with a staggered middle step, each carrying a rounded-full sticker number badge with hard offset shadow overlapping its top edge, a giant ghost step numeral, a bold title, and a description, with dashed connectors between plates on desktop. No links — instructional / persuasive only. Use as the 'how it works' / 'get started' section for community platforms, SaaS onboarding flows, or product walkthroughs.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Step items: title + description. */
    items: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Launch your community in minutes'
    const description =
      props.description ??
      'From zero to thriving community in three simple steps.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Create your space',
            description:
              'Choose your community name, customize the look and feel, and set up your initial topic categories. No technical skills required.',
          },
          {
            title: 'Invite your people',
            description:
              'Send invitation links, import your existing mailing list, or make your community discoverable. Set membership rules that work for you.',
          },
          {
            title: 'Start conversations',
            description:
              'Post your first discussion topic, welcome new members, and watch your community flourish with meaningful exchanges.',
          },
        ]
    const tilts = ['-rotate-1', 'rotate-1', '-rotate-1']

    return (
      <StepTimeline
        className={cn(
          'relative overflow-hidden py-16 sm:py-20 lg:py-28',
          props.className,
        )}
      >
        <Container size="lg" className="relative">
          <StepTimelineHeader className="mx-0 mb-12 flex max-w-none flex-col gap-6 text-left sm:mb-16 md:mb-16 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <div className="mb-5 flex items-center gap-4">
                <MonoTag>05 / How it works</MonoTag>
                <span
                  aria-hidden="true"
                  className="h-px w-16 bg-border sm:w-24"
                />
              </div>
              <SectionHeading
                align="left"
                title={heading}
                subtitle={description}
                className="gap-0"
                titleClassName="mb-4 text-3xl font-extrabold tracking-tighter text-foreground sm:text-4xl lg:text-5xl"
                subtitleClassName="text-lg text-muted-foreground"
              />
            </div>
            <MonoTag
              aria-hidden="true"
              tone="faint"
              className="shrink-0 md:mb-2"
            >
              [ {String(items.length).padStart(2, '0')} steps ]
            </MonoTag>
          </StepTimelineHeader>
          <StepTimelineGrid columns={3} className="gap-6 pt-4 lg:gap-10">
            {items.map((step, i) => (
              <StepItem
                key={step.title}
                className={cn(
                  'list-none rounded-none border-2 border-foreground/15 bg-card p-6 pt-9 transition-all duration-150 hover:-translate-y-1 hover:border-foreground/40 hover:shadow-[5px_5px_0_0] hover:shadow-primary/25 sm:p-7 sm:pt-10',
                  tilts[i % tilts.length],
                  i % 2 === 1 && 'md:translate-y-8',
                )}
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -bottom-4 right-2 select-none font-extrabold leading-none tracking-tighter text-foreground/[0.05] text-[6rem] sm:text-[7rem]"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <StepBadge
                  index={i}
                  variant="filled-square"
                  className="absolute -top-6 left-6 size-12 rounded-full border-2 border-background font-mono text-base font-bold shadow-[3px_3px_0_0] shadow-foreground/20"
                />
                <h3 className="relative mb-3 text-xl font-bold tracking-tight text-foreground">
                  {step.title}
                </h3>
                <p className="relative leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
                {i < items.length - 1 && (
                  <StepConnector
                    variant="dashed"
                    className="left-full top-1/2 w-10 border-primary/40 lg:w-16"
                  />
                )}
              </StepItem>
            ))}
          </StepTimelineGrid>
        </Container>
      </StepTimeline>
    )
  },
})
