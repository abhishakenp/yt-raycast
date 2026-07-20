import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  FeatureGrid,
  FeatureCard,
  FeatureTitle,
  FeatureDescription,
} from '#/section-kit/FeatureGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'

/**
 * MarketingFeatures — bold-kinetic collapsed-border bento grid for a SaaS /
 * product-marketing landing page. An asymmetric header (left-aligned heading
 * with a tilted primary marker block behind the key word, mono "[ CAPABILITIES ]"
 * meta right) above a sharp 12-column bento of hairline-collapsed cells with
 * varying spans (7/5, 4/8 rhythm): every cell carries a mono index numeral, a
 * bold title and a description, and the two widest cells add div-built data
 * motifs — a token bar-chart row and a mono workflow-stage strip. Cells wash to
 * muted on hover. Confident kinetic-SaaS aesthetic with binary radius. Use to
 * showcase product capabilities on B2B SaaS, team/project-management,
 * productivity, or developer-platform pages.
 */
export const MarketingFeatures = defineCapsule({
  name: 'MarketingFeatures',
  description:
    'Bold-kinetic collapsed-border bento grid for a SaaS / product-marketing landing page: an asymmetric header (marker-highlighted heading left, mono capabilities meta right) above a sharp 12-column bento of hairline-collapsed cells with varying spans, each with a mono index numeral, bold title and description; the widest cells add div-built data motifs (token bar-chart row, mono workflow-stage strip) and cells wash to muted on hover. Confident kinetic-SaaS aesthetic with binary radius. Use to showcase product capabilities on B2B SaaS, team/project-management, productivity, or developer-platform pages.',
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    items: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Everything your team needs to ship faster'
    const description =
      props.description ??
      'Powerful, flexible tools that adapt to how you work — not the other way around.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Intuitive Task Boards',
            description:
              'Drag-and-drop Kanban boards that make it easy to visualize work, limit WIP, and spot bottlenecks before they derail your sprint.',
          },
          {
            title: 'Real-time Collaboration',
            description:
              'Work together in the same document, comment inline, and mention teammates so everyone stays aligned without endless threads.',
          },
          {
            title: 'Advanced Analytics',
            description:
              'Track velocity, burndown, and cycle time with beautiful dashboards. Turn raw data into actionable insights in one click.',
          },
          {
            title: 'Automated Workflows',
            description:
              'Automate repetitive tasks with customizable rules. Move cards, send updates, and trigger alerts so nothing slips through.',
          },
          {
            title: 'Enterprise Security',
            description:
              'SOC 2 Type II certified with end-to-end encryption, SSO, and granular permissions. Your data stays yours — always.',
          },
          {
            title: 'Seamless Integrations',
            description:
              'Connect with GitHub, Slack, Figma, and 50+ tools you already use. Keep your workflow in one place, not fifty.',
          },
        ]

    // Bento span rhythm: 7/5, 4/8, 5/7 — never 50/50.
    const spans = [
      'md:col-span-7',
      'md:col-span-5',
      'md:col-span-4',
      'md:col-span-8',
      'md:col-span-5',
      'md:col-span-7',
    ]
    const barHeights = ['h-3', 'h-6', 'h-4', 'h-9', 'h-7', 'h-12', 'h-10']
    const headingWords = heading.split(' ')
    const headingLead = headingWords.slice(0, -1).join(' ')
    const headingMark = headingWords.at(-1) ?? ''

    return (
      <section
        className={cn(
          'relative overflow-hidden bg-background py-16 lg:py-24',
          props.className,
        )}
      >
        <Container>
          {/* Asymmetric header: marker-highlighted heading left, mono meta right. */}
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-16">
            <div className="max-w-2xl">
              <MonoTag className="mb-4 block">
                Capabilities
                <span aria-hidden="true" className="text-primary">
                  {' '}
                  · 01—06
                </span>
              </MonoTag>
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                {headingLead}{' '}
                <span className="relative ml-[0.12em] inline-block whitespace-nowrap">
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-[-0.15em] inset-y-[0.05em] rotate-1 bg-primary"
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
              [ toolkit ] built to ship
            </p>
          </div>

          {/* Collapsed-border bento: hairline cells, asymmetric spans. */}
          <FeatureGrid className="gap-0 border-l border-t border-border [&>div]:grid [&>div]:grid-cols-1 [&>div]:gap-0 md:[&>div]:grid-cols-12">
            {items.map((f, index) => {
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
                  className={cn(
                    'gap-0 rounded-none border-0 border-b border-r border-border bg-card p-6 shadow-none transition-colors duration-150 hover:translate-y-0 hover:border-border hover:bg-muted/60 sm:p-8',
                    spans[index % spans.length],
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
                  >
                    {String(index + 1).padStart(2, '0')}
                    <span className="text-primary"> /</span>
                  </span>
                  <FeatureTitle className="mt-3 text-xl font-bold tracking-tight">
                    {__iv__.title}
                  </FeatureTitle>
                  <FeatureDescription className="mt-2 max-w-md text-sm leading-6">
                    {__iv__.description}
                  </FeatureDescription>
                  {index === 0 ? (
                    <span
                      aria-hidden="true"
                      className="mt-6 flex items-end gap-1.5"
                    >
                      {barHeights.map((h, i) => (
                        <span
                          key={i}
                          className={cn(
                            'w-4 sm:w-6',
                            h,
                            i === barHeights.length - 1
                              ? 'bg-primary'
                              : 'bg-foreground/15',
                          )}
                        />
                      ))}
                    </span>
                  ) : null}
                  {index === 3 ? (
                    <span
                      aria-hidden="true"
                      className="mt-6 block font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground/70"
                    >
                      [ plan → track →{' '}
                      <span className="text-primary">ship</span> ]
                    </span>
                  ) : null}
                </FeatureCard>
              )
            })}
          </FeatureGrid>
        </Container>
      </section>
    )
  },
})
