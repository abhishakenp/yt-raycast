import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * CloudInfraSteps — "deploy in minutes" 3-step onboarding guide for a cloud-
 * infrastructure / developer-platform SaaS landing page. A centered heading +
 * description above a 3-column step grid. Each step has a numbered circle, a title,
 * a description, and a step-specific content block: step 1 shows a CLI code box;
 * step 2 shows a checklist; step 3 shows a metrics panel. Tokens-only. Renders
 * fully on zero arguments.
 */
import { Container } from '#/section-kit/Container.tsx'
export const CloudInfraSteps = defineCapsule({
  name: 'CloudInfraSteps',
  description:
    'Three-step onboarding guide for a cloud-infrastructure / developer-platform SaaS landing page: a centered heading plus description above a 3-column step grid. Each step has a numbered circle, a title, a description, and step-specific content (CLI code box for step 1, checklist for step 2, metrics panel for step 3). Tokens-only. Use to showcase quick-start or getting-started flows on cloud hosting, IaaS, PaaS, serverless, or developer-tooling sites.',
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
    const Check = ({ className }: { className?: string }) => (
      <svg
        className={className}
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
      <section className={cn('bg-muted/40 py-20 lg:py-28', props.className)}>
        <Container>
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
            {items.map((step, i) => (
              <div key={step.title} className="relative">
                <div className="mb-6 flex items-center gap-4">
                  <div className="grid size-12 place-items-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
                    {i + 1}
                  </div>
                  {i < items.length - 1 && (
                    <div
                      aria-hidden="true"
                      className="hidden h-px flex-1 bg-border md:block"
                    />
                  )}
                </div>
                <h3 className="mb-3 text-xl font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mb-4 text-muted-foreground">{step.description}</p>
                {i === 0 && (
                  <div className="overflow-x-auto rounded-lg bg-primary p-4 font-mono text-sm text-primary-foreground/80">
                    <code>{code}</code>
                  </div>
                )}
                {i === 1 && (
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Check className="size-4 text-chart-2" />
                      Auto-detects Node.js, Python, Go, Ruby
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="size-4 text-chart-2" />
                      Generates optimal resource profiles
                    </li>
                  </ul>
                )}
                {i === 2 && (
                  <div className="rounded-lg bg-primary/10 p-4">
                    <p className="text-sm text-muted-foreground">
                      Average cold start:{' '}
                      <span className="font-semibold text-foreground">
                        89ms
                      </span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Regions available:{' '}
                      <span className="font-semibold text-foreground">35</span>
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Container>
      </section>
    )
  },
})
