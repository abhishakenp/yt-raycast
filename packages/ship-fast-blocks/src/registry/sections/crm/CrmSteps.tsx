import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

/**
 * CrmSteps — staggered onboarding sequence for a CRM / SaaS landing page on a
 * muted wash band. An asymmetric header (left-aligned heading with a tilted
 * primary marker block behind the key word, mono "[ SETUP ]" meta right) above
 * a 3-up row of sharp step cards with hard offset shadows that stagger down
 * the page (each card sits lower than the last on desktop): every card carries
 * a giant ghost step numeral bleeding behind it, a mono "STEP 01" tag with
 * primary tick, a bold title, description and an alt-driven image; a mono
 * pipeline arrow strip runs beneath. Use to explain getting-started / setup /
 * how-it-works flows for CRM, sales-pipeline or B2B SaaS products. Renders
 * fully with no props.
 */
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import {
  StepTimeline,
  StepTimelineGrid,
  StepItem,
  StepContent,
} from '#/section-kit/StepTimeline.tsx'
export const CrmSteps = defineCapsule({
  name: 'CrmSteps',
  description:
    'Staggered onboarding sequence for a CRM / SaaS landing page on a muted wash band: an asymmetric header (marker-highlighted heading left, mono setup meta right) above a 3-up row of sharp hard-shadow step cards that stagger down the page, each with a giant ghost step numeral behind it, a mono STEP tag, bold title, description and an alt-driven image, plus a mono pipeline arrow strip beneath. Use to explain getting-started / setup / how-it-works flows for CRM, sales-pipeline or B2B SaaS products.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
    /** Ordered step cards (rendered with auto-incrementing numbers). */
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
    const heading = props.heading ?? 'Get started in minutes, not months'
    const description =
      props.description ??
      'Our guided setup process helps you import data, configure your pipeline, and start closing deals quickly.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Import your data',
            description:
              'Connect your existing tools or upload a CSV. We automatically map fields and detect duplicates during import.',
            imageAlt:
              'computer screen showing data migration interface with progress bars',
          },
          {
            title: 'Customize pipeline',
            description:
              'Define your stages, set probability weights, and create custom fields that match your unique sales process.',
            imageAlt:
              'digital kanban board showing workflow columns on tablet screen',
          },
          {
            title: 'Close more deals',
            description:
              'Start tracking opportunities, automate follow-ups, and watch your conversion rates improve week over week.',
            imageAlt:
              'business professionals shaking hands in modern office meeting room',
          },
        ]
    const stagger = [
      'md:translate-y-0',
      'md:translate-y-8',
      'md:translate-y-16',
    ]
    const headingWords = heading.split(' ')
    const headingLead = headingWords.slice(0, -1).join(' ')
    const headingMark = headingWords.at(-1) ?? ''
    return (
      <StepTimeline
        className={cn(
          'relative overflow-hidden bg-muted/40 py-16 lg:py-24 lg:pb-40',
          props.className,
        )}
      >
        <Container>
          {/* Asymmetric header: marker-highlighted heading left, mono meta right. */}
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-16">
            <div className="max-w-2xl">
              <MonoTag className="mb-4 block">
                Onboarding
                <span aria-hidden="true" className="text-primary">
                  {' '}
                  · 3 steps
                </span>
              </MonoTag>
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                {headingLead}{' '}
                <span className="relative ml-[0.12em] inline-block whitespace-nowrap">
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-[-0.15em] inset-y-[0.05em] -rotate-1 bg-primary"
                  />
                  <span className="relative text-primary-foreground">
                    {headingMark}
                  </span>
                </span>
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                {description}
              </p>
            </div>
            <p
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60"
            >
              [ setup ] avg. 23 min
            </p>
          </div>
          <StepTimelineGrid columns={3} className="gap-8 lg:gap-10">
            {items.map((step, i) => (
              <StepItem
                key={step.title}
                className={cn(
                  'relative list-none',
                  stagger[i % stagger.length],
                )}
              >
                {/* Giant ghost numeral bleeding behind the card. */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-10 right-0 select-none font-extrabold leading-none tracking-tighter text-foreground/[0.06] text-[6rem] sm:text-[7rem]"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <StepContent className="relative mt-6 gap-0 border border-foreground/80 bg-card p-5 shadow-[6px_6px_0_0] shadow-foreground/15 sm:p-6">
                  <MonoTag className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="size-1.5 shrink-0 bg-primary"
                    />
                    Step {String(i + 1).padStart(2, '0')}
                  </MonoTag>
                  <h3 className="mt-3 text-xl font-bold tracking-tight text-card-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {step.description}
                  </p>
                  <Image
                    alt={step.imageAlt}
                    w={400}
                    h={200}
                    loading="lazy"
                    className="mt-4 h-40 w-full border border-border object-cover"
                  />
                </StepContent>
              </StepItem>
            ))}
          </StepTimelineGrid>
          <MonoTag
            aria-hidden="true"
            tone="faint"
            className="mt-12 block md:mt-28"
          >
            [ import → customize → close ]
          </MonoTag>
        </Container>
      </StepTimeline>
    )
  },
})
