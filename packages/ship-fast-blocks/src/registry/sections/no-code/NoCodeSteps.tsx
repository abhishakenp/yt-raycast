import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

/**
 * NoCodeSteps — block-builder-kinetic staggered "how it works" flow for a
 * no-code / app-builder SaaS landing page on a muted wash band. An asymmetric
 * header (mono eyebrow, a left-aligned heading with a tilted primary marker
 * block behind the key word, and mono meta right) sits above a 3-up row of
 * sharp step cards with hard offset shadows that stagger down the page (each
 * card sits lower than the last on desktop): every card carries a giant ghost
 * step numeral bleeding behind it, a mono "STEP 01" tag with a primary tick, a
 * bold title, description and an alt-driven image; a mono "[ template → build →
 * publish ]" pipeline strip runs beneath. Use as the "from idea to live" /
 * onboarding flow on a no-code / app-builder SaaS or product landing page.
 * Renders fully with no props.
 */
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import {
  StepTimeline,
  StepTimelineGrid,
  StepItem,
  StepContent,
} from '#/section-kit/StepTimeline.tsx'
export const NoCodeSteps = defineCapsule({
  name: 'NoCodeSteps',
  description:
    "Block-builder-kinetic staggered 'how it works' flow for a no-code / app-builder SaaS landing page on a muted wash band: an asymmetric header (mono eyebrow, marker-highlighted heading left, mono meta right) above a 3-up row of sharp hard-shadow step cards that stagger down the page, each with a giant ghost step numeral behind it, a mono STEP tag, bold title, description and an alt-driven image, plus a mono template → build → publish pipeline strip beneath. Use as the 'from idea to live' / onboarding flow on a no-code / app-builder SaaS or product landing page.",
  props: z.object({
    /** Muted uppercase eyebrow above the heading. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
    /** Step cards (title + description + image alt). */
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
    const heading = props.heading ?? 'From idea to live app in 3 simple steps'
    const description =
      props.description ??
      'No coding required. No setup headaches. Just pure creation.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Choose a Template',
            description:
              'Browse 200+ professionally designed templates. Filter by category, style, or industry to find your perfect starting point.',
            imageAlt: 'Designer browsing template gallery on laptop screen',
          },
          {
            title: 'Customize Everything',
            description:
              'Drag, drop, and edit with our visual builder. Change colors, fonts, images, and content to match your brand perfectly.',
            imageAlt:
              'Person customizing app interface with drag and drop editor',
          },
          {
            title: 'Publish & Grow',
            description:
              'Hit publish and your app goes live instantly. Get a custom domain, analytics, and scale as your audience grows.',
            imageAlt:
              'Live analytics dashboard showing app performance metrics',
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
        aria-labelledby="nc-steps"
      >
        <Container>
          {/* Asymmetric header: mono eyebrow, marker heading left, mono meta right. */}
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-16">
            <div className="max-w-2xl">
              <MonoTag className="mb-4 block">
                {eyebrow}
                <span aria-hidden="true" className="text-primary">
                  {' '}
                  · 3 steps
                </span>
              </MonoTag>
              <h2
                id="nc-steps"
                className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
              >
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
              [ build ] avg. 12 min
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
                <StepContent className="relative mt-6 gap-0 border-2 border-foreground/80 bg-card p-5 shadow-[6px_6px_0_0] shadow-foreground/15 sm:p-6">
                  <MonoTag className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="size-1.5 shrink-0 bg-primary"
                    />
                    Step {String(i + 1).padStart(2, '0')}
                  </MonoTag>
                  <h3 className="mt-3 text-lg font-bold tracking-tight text-card-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {step.description}
                  </p>
                  <div className="mt-4 aspect-video overflow-hidden border border-border bg-muted">
                    <Image
                      alt={step.imageAlt}
                      w={600}
                      h={340}
                      loading="lazy"
                      className="size-full object-cover"
                    />
                  </div>
                </StepContent>
              </StepItem>
            ))}
          </StepTimelineGrid>
          <MonoTag
            aria-hidden="true"
            tone="faint"
            className="mt-12 block md:mt-28"
          >
            [ template → build → publish ]
          </MonoTag>
        </Container>
      </StepTimeline>
    )
  },
})
