import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * MobileAppFeatures — a kinetic asymmetric collapsed-border bento for a consumer
 * mobile-app marketing page. An asymmetric header (left-aligned heading with a
 * tilted primary marker block behind the key word, mono "[ TOOLKIT ]" meta
 * right) sits above a sharp 12-column bento of hairline-collapsed cells with
 * varying spans (7/5, 4/8 rhythm): every cell carries a mono index numeral, a
 * bold title and description, and the two widest cells add div-built app motifs
 * — a token weekly-progress bar row and a mono "[ INSTALL → TRACK → GROW ]"
 * flow strip. Cells wash to muted on hover. No links, no imagery. Use as the
 * core value-prop / feature grid on a habit tracker, fitness / wellness app,
 * productivity or to-do app, or any consumer app landing page. Renders fully
 * with no props via baked-in defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import {
  FeatureGrid,
  FeatureCard,
  FeatureTitle,
  FeatureDescription,
} from '#/section-kit/FeatureGrid.tsx'
export const MobileAppFeatures = defineCapsule({
  name: 'MobileAppFeatures',
  description:
    'Kinetic asymmetric collapsed-border bento for a consumer mobile-app marketing page: an asymmetric header (marker-highlighted heading left, mono toolkit meta right) above a sharp 12-column bento of hairline-collapsed cells with varying spans, each with a mono index numeral, bold title and description; the widest cells add div-built app motifs (token weekly-progress bar row, mono install→track→grow flow strip) and cells wash to muted on hover. Use as the core value-prop / feature grid on a habit tracker, fitness / wellness app, productivity or to-do app, or any consumer app landing page.',
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
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
    const heading = props.heading ?? 'Everything you need to succeed'
    const description =
      props.description ??
      "We've stripped away the complexity. DailyFlow gives you just the right tools to build habits that stick—without the overwhelm."
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Smart Reminders',
            description:
              'Gentle nudges at the right time. Our AI learns your routine and suggests optimal moments for each habit.',
          },
          {
            title: 'Visual Progress',
            description:
              'Beautiful charts and streak counters that make every small win feel meaningful and motivating.',
          },
          {
            title: 'Self-Compassion Mode',
            description:
              "Miss a day? No problem. We don't break streaks for small slips—life happens, and we get it.",
          },
          {
            title: 'Accountability Groups',
            description:
              'Join small groups of 3-5 people with similar goals. Share progress and celebrate wins together.',
          },
          {
            title: 'Dark Mode',
            description:
              'Easy on the eyes, day or night. Automatic switching based on your system preferences.',
          },
          {
            title: 'Widget Support',
            description:
              'Track habits right from your home screen with beautiful iOS and Android widgets.',
          },
        ]
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
          'relative overflow-hidden bg-background pt-24 pb-20 lg:pt-28 lg:pb-28',
          props.className,
        )}
        aria-labelledby="mobileapp-features-heading"
      >
        <Container>
          {/* Asymmetric header: marker-highlighted heading left, mono meta right. */}
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-16">
            <div className="max-w-2xl">
              <MonoTag className="mb-4 block">
                Features
                <span aria-hidden="true" className="text-primary">
                  {' '}
                  · 01—06
                </span>
              </MonoTag>
              <h2
                id="mobileapp-features-heading"
                className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
              >
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
              [ toolkit ] built for streaks
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
                      [ install → track →{' '}
                      <span className="text-primary">grow</span> ]
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
