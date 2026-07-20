import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * CloudInfraSteps — terminal-industrial "deploy in minutes" 3-step onboarding
 * ledger for a cloud-infrastructure / developer-platform SaaS landing page.
 * An asymmetric header (left-aligned heading + description, mono `$ init`
 * meta on the right) above a collapsed-border 3-column step ledger. Each cell
 * carries a square inverted step index chip beside a giant ghost numeral, a
 * title, a description, and step-specific terminal content: step 1 shows an
 * inverted chamfered CLI pane with a `$` prompt; step 2 shows mono `[ok]`
 * checklist rows; step 3 shows a hairline metrics ledger with tabular
 * numerals. Tokens-only. Renders fully on zero arguments.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  StepTimeline,
  StepTimelineGrid,
  StepItem,
} from '#/section-kit/StepTimeline.tsx'
export const CloudInfraSteps = defineCapsule({
  name: 'CloudInfraSteps',
  description:
    'Terminal-industrial three-step onboarding ledger for a cloud-infrastructure / developer-platform SaaS landing page: an asymmetric header (left heading plus description, mono command meta right) above a collapsed-border 3-column step ledger. Each cell has a square inverted step index chip beside a giant ghost numeral, a title, a description, and step-specific terminal content (inverted chamfered CLI pane for step 1, mono `[ok]` checklist for step 2, hairline metrics ledger for step 3). Tokens-only. Use to showcase quick-start or getting-started flows on cloud hosting, IaaS, PaaS, serverless, or developer-tooling sites.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Step cards: title + description. */
    items: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
        }),
      )
      .optional(),
    /** CLI install command shown in the first step. */
    code: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Deploy in minutes, not days'
    const description =
      props.description ??
      "Our CLI and web dashboard make infrastructure management simple. Here's how teams get started."
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Install the CLI',
            description:
              "One command to install on macOS, Linux, or Windows. Authenticate with your API key and you're ready.",
          },
          {
            title: 'Initialize your project',
            description:
              'Run cloudshift init in your repo. We detect your framework and generate the configuration automatically.',
          },
          {
            title: 'Deploy globally',
            description:
              'Push your code and watch it deploy across 35 regions. Rollbacks, canary releases, and traffic splitting included.',
          },
        ]
    const code = props.code ?? 'curl -sSL https://cloudshift.io/install | sh'
    return (
      <StepTimeline
        className={cn('bg-muted/40 py-14 sm:py-20 lg:py-28', props.className)}
      >
        <Container>
          <div className="mb-10 flex flex-col gap-4 sm:mb-14 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              align="left"
              title={heading}
              subtitle={description}
              className="max-w-2xl gap-3"
              titleClassName="text-3xl font-extrabold tracking-tight sm:text-4xl"
              subtitleClassName="text-base sm:text-lg"
            />
            <p
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60"
            >
              <span className="text-primary">$</span> cloudshift init
            </p>
          </div>
          <StepTimelineGrid
            columns={3}
            className="gap-px border border-border bg-border"
          >
            {items.map((step, i) => (
              <StepItem
                key={step.title}
                className="relative flex flex-col overflow-hidden bg-background p-5 sm:p-7"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-2 -top-5 select-none font-mono text-[6rem] font-extrabold leading-none tracking-tighter text-foreground/[0.05]"
                >
                  {`0${i + 1}`.slice(-2)}
                </span>
                <div className="mb-5 flex items-center gap-3">
                  <span className="grid size-8 place-items-center bg-foreground font-mono text-sm font-semibold text-background">
                    {i + 1}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
                    step / {`0${i + 1}`.slice(-2)}
                  </span>
                </div>
                <h3 className="mb-2 text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                  {step.title}
                </h3>
                <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
                {i === 0 && (
                  <div className="mt-auto overflow-x-auto bg-foreground p-4 font-mono text-xs text-background [clip-path:polygon(0_0,100%_0,100%_calc(100%-0.875rem),calc(100%-0.875rem)_100%,0_100%)] sm:text-sm">
                    <code>
                      <span aria-hidden="true" className="text-background/60">
                        ${' '}
                      </span>
                      {code}
                    </code>
                  </div>
                )}
                {i === 1 && (
                  <ul className="mt-auto space-y-2 font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <span aria-hidden="true" className="text-primary">
                        [ok]
                      </span>
                      Auto-detects Node.js, Python, Go, Ruby
                    </li>
                    <li className="flex items-center gap-2">
                      <span aria-hidden="true" className="text-primary">
                        [ok]
                      </span>
                      Generates optimal resource profiles
                    </li>
                  </ul>
                )}
                {i === 2 && (
                  <div className="mt-auto border border-border">
                    <p className="flex items-baseline justify-between gap-3 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                      Average cold start
                      <span className="font-semibold text-foreground tabular-nums">
                        89ms
                      </span>
                    </p>
                    <p className="flex items-baseline justify-between gap-3 border-t border-border px-3 py-2 font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                      Regions available
                      <span className="font-semibold text-foreground tabular-nums">
                        35
                      </span>
                    </p>
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
