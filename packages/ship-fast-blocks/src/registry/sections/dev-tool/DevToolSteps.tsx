import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  StepTimeline,
  StepTimelineGrid,
  StepItem,
} from '#/section-kit/StepTimeline.tsx'

/**
 * DevToolSteps — shell-session quickstart for a developer tool / API platform.
 * A muted band with an asymmetric 4/8 split: a left rail holding the heading,
 * intro, and an aria-hidden mono "[ quickstart ]" step-count meta (sticky on
 * desktop), beside a single sharp-cornered terminal window pane — mono title
 * bar with square chrome dots and a "~/quickstart" tab — whose body lists each
 * step as a hairline-divided prompt row: a mono "$ step 01" prompt line with a
 * giant ghost tabular numeral, the step title, and its description, closing
 * with an aria-hidden "[ done ] exit 0" status row. Static (no links). Use to
 * explain onboarding / quickstart flow for developer tools, API platforms, or
 * technical SaaS.
 */
export const DevToolSteps = defineCapsule({
  name: 'DevToolSteps',
  description:
    "Shell-session quickstart for a developer tool / API platform: a muted band with an asymmetric 4/8 split — a sticky left rail with the heading, intro, and aria-hidden mono step-count meta beside a single sharp terminal window pane (mono title bar, square chrome dots, '~/quickstart' tab) listing each step as a hairline-divided prompt row with a mono '$ step 01' line, a giant ghost tabular numeral, the step title, and description, closing with an aria-hidden '[ done ] exit 0' status row. Use to explain onboarding / quickstart flow for developer tools, API platforms, or technical SaaS.",
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    items: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Get started in minutes'
    const description =
      props.description ??
      'From signup to production in three simple steps. No complex configuration needed.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Create your project',
            description:
              'Sign up free and create a new project. Choose your framework — we support React, Vue, Svelte, Next.js, and more.',
          },
          {
            title: 'Install the SDK',
            description:
              'Run npm install @devstack/sdk and initialize with your API key. Auto-generated code for your stack.',
          },
          {
            title: 'Deploy to production',
            description:
              'Push your code. We handle scaling, security, and monitoring. Go from localhost to global in seconds.',
          },
        ]

    return (
      <StepTimeline
        className={cn('bg-muted/40 py-16 lg:py-24', props.className)}
        aria-labelledby="steps-heading"
      >
        <Container>
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-24">
                <MonoTag aria-hidden="true" tone="faint" className="mb-4 block">
                  [ quickstart ] {String(items.length).padStart(2, '0')} steps
                </MonoTag>
                <SectionHeading
                  align="left"
                  title={heading}
                  subtitle={description}
                  titleId="steps-heading"
                  className="gap-4"
                  titleClassName="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl"
                  subtitleClassName="text-lg text-muted-foreground"
                />
              </div>
            </div>

            {/* Terminal session pane */}
            <div className="overflow-hidden border border-foreground/20 bg-card lg:col-span-8">
              <div className="flex items-center gap-2 border-b border-border bg-muted px-4 py-3">
                <div className="flex gap-1.5" aria-hidden="true">
                  <div className="size-2 bg-foreground/25" />
                  <div className="size-2 bg-foreground/25" />
                  <div className="size-2 bg-foreground/50" />
                </div>
                <span className="ml-2 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                  ~/quickstart
                </span>
                <span
                  aria-hidden="true"
                  className="ml-auto font-mono text-[11px] text-muted-foreground/60"
                >
                  — sh
                </span>
              </div>
              <StepTimelineGrid
                columns={3}
                className="grid-cols-1 gap-0 divide-y divide-border md:grid-cols-1"
              >
                {items.map((step, i) => (
                  <StepItem
                    key={step.title}
                    className="relative overflow-hidden p-6 sm:p-8"
                  >
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -right-2 -top-5 select-none font-mono text-8xl font-bold tabular-nums leading-none text-foreground/[0.06]"
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <p
                      aria-hidden="true"
                      className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
                    >
                      <span className="text-primary">$ </span>
                      step {String(i + 1).padStart(2, '0')}
                    </p>
                    <h3 className="mt-3 font-mono text-lg font-bold tracking-tight text-foreground">
                      {step.title}
                    </h3>
                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </StepItem>
                ))}
              </StepTimelineGrid>
              <div
                aria-hidden="true"
                className="flex items-center justify-between border-t border-border px-6 py-3 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground/70 sm:px-8"
              >
                <span className="text-chart-1">[ done ]</span>
                <span>exit 0</span>
              </div>
            </div>
          </div>
        </Container>
      </StepTimeline>
    )
  },
})
