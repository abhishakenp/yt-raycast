import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  SaasMutationSpinner,
  SaasPlanActionButton,
} from '../saas/saas-interactions.tsx'
import { saasLakebed } from '../saas/saas-lakebed.ts'

import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import {
  StepTimeline,
  StepTimelineGrid,
  StepItem,
} from '#/section-kit/StepTimeline.tsx'

/**
 * AiProductSteps — kinetic tech-editorial inverted onboarding band for an AI
 * SaaS / product page. A full bg-foreground/text-background inversion band
 * that cuts in on a diagonal clip-path seam, with a giant ghost "123"
 * watermark: an asymmetric header (left-aligned heading + paragraph, mono
 * "[ 3 steps / ~5 min ]" meta right) above a collapsed-border 3-column grid of
 * hairline step cells, each led by a giant ghost mono numeral over a bold
 * title and dimmed description; below, a footer rail pairs a skewed primary
 * CTA block (label counter-skews upright) with a mono "[ eof ]" end mark. The
 * CTA routes through section-kit route links. Use to explain a simple
 * sign-up-to-value flow for AI tools, SaaS apps, or any product with quick
 * onboarding. Renders fully with no props via a built-in 3-step flow.
 */
export const AiProductSteps = defineCapsule({
  name: 'AiProductSteps',
  description:
    'Kinetic tech-editorial inverted onboarding band for an AI SaaS / product page: a full foreground-inversion band cutting in on a diagonal clip-path seam with a giant ghost "123" watermark — an asymmetric header (left-aligned heading and paragraph, mono steps meta right) above a collapsed-border 3-column grid of hairline step cells, each led by a giant ghost mono numeral over a bold title and dimmed description, then a footer rail pairing a skewed primary fullstack CTA block with a mono end mark. The CTA writes to shared Lakebed conversion state. Use to explain a simple sign-up-to-value flow for AI tools, SaaS apps, or any product with quick onboarding.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
    /** Centered CTA button label below the steps. */
    cta: z.string().optional(),
    /** Steps (title + description), rendered with auto-incrementing numbers. */
    items: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: saasLakebed,
  component: ({ props, lakebed }) => {
    const heading = props.heading ?? 'Start writing smarter in 3 steps'
    const description =
      props.description ??
      'From signup to your first AI-assisted document in under 5 minutes.'
    const cta = props.cta ?? "Get started now — it's free"
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Create your account',
            description:
              'Sign up with your email or Google account. No credit card required for the 14-day trial. Choose your primary use case during onboarding.',
          },
          {
            title: 'Set your preferences',
            description:
              'Tell us about your writing style, preferred tone, and industry. The AI learns from examples you provide to match your unique voice.',
          },
          {
            title: 'Start creating',
            description:
              'Open the editor, pick a template or start from scratch, and experience AI-assisted writing. Export to any format or publish directly.',
          },
        ]

    return (
      <StepTimeline
        className={cn(
          'relative overflow-hidden bg-foreground py-16 pt-24 text-background [clip-path:polygon(0_3rem,100%_0,100%_100%,0_100%)] lg:py-24 lg:pt-32',
          props.className,
        )}
      >
        <Watermark className="-right-4 bottom-0 font-mono text-[9rem] text-background/[0.05] sm:text-[18rem]">
          123
        </Watermark>
        <Container className="relative">
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-16">
            <SectionHeading
              align="left"
              title={heading}
              subtitle={description}
              className="max-w-2xl gap-4"
              titleClassName="text-[clamp(2rem,4.5vw,3.5rem)] font-semibold leading-[0.95] tracking-tighter text-background"
              subtitleClassName="max-w-xl text-base text-background/60 sm:text-lg"
            />
            <MonoTag aria-hidden="true" tone="inverted" className="shrink-0">
              [ {items.length} steps / ~5 min ]
            </MonoTag>
          </div>
          <StepTimelineGrid
            columns={3}
            className="gap-0 border-l border-t border-background/15"
          >
            {items.map((step, i) => (
              <StepItem
                key={step.title}
                className="group relative grid list-none grid-cols-[auto_1fr] items-start gap-x-4 border-b border-r border-background/15 p-5 md:block md:p-8"
              >
                <span
                  aria-hidden="true"
                  className="font-mono text-3xl font-bold leading-none text-background/15 transition-colors duration-150 group-hover:text-primary md:text-6xl"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="text-lg font-semibold tracking-tight text-background md:mt-5">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-background/60">
                    {step.description}
                  </p>
                </div>
              </StepItem>
            ))}
          </StepTimelineGrid>
          <div className="mt-12 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <SaasPlanActionButton
              lakebed={lakebed}
              intentLabel={cta}
              plan={cta}
              source="steps"
              pendingChildren={
                <span className="inline-flex skew-x-6 items-center justify-center gap-2">
                  <SaasMutationSpinner className="size-5" />
                  Starting
                </span>
              }
              className="inline-flex -skew-x-6 items-center justify-center rounded-none bg-primary px-6 py-4 font-mono text-sm font-semibold uppercase tracking-[0.12em] text-primary-foreground transition-[background-color,transform] duration-150 hover:bg-background hover:text-foreground active:translate-y-px disabled:pointer-events-none disabled:opacity-70 sm:px-8"
            >
              <span className="inline-block skew-x-6">{cta}</span>
            </SaasPlanActionButton>
            <MonoTag
              aria-hidden="true"
              tone="inverted"
              className="text-background/40"
            >
              [ eof ]
            </MonoTag>
          </div>
        </Container>
      </StepTimeline>
    )
  },
})
