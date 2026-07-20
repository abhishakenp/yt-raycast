import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

/**
 * MobileAppHowItWorks — a kinetic staggered onboarding sequence on a calm muted
 * band whose top edge cuts in on a clip-path diagonal seam. An asymmetric header
 * (left-aligned heading with a tilted primary marker block behind the key word,
 * mono "[ SETUP ]" meta right) sits above a 3-up row of sharp hard-offset-shadow
 * step cards that stagger down the page: every card shows a giant ghost step
 * numeral bleeding behind it, a mono "STEP 01" tag with a primary tick, a bold
 * title, a description, and a hairline-chromed mini device frame wrapping a
 * phone-screenshot <Image>; a mono "[ PICK → SCHEDULE → TRACK ]" flow strip runs
 * beneath. Use as the onboarding / process explainer on a habit tracker,
 * fitness / wellness app, productivity or to-do app, or any consumer app landing
 * page. Renders fully with no props via baked-in defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import { PortfolioGrid } from '#/section-kit/PortfolioGrid.tsx'
export const MobileAppHowItWorks = defineCapsule({
  name: 'MobileAppHowItWorks',
  description:
    'Kinetic staggered onboarding sequence on a calm muted band with a clip-path diagonal top seam: an asymmetric header (marker-highlighted heading left, mono setup meta right) above a 3-up row of sharp hard-offset-shadow step cards that stagger down the page, each with a giant ghost step numeral behind it, a mono STEP tag, bold title, description and a hairline-chromed mini device frame wrapping a phone-screenshot image, plus a mono pick→schedule→track flow strip beneath. Use as the onboarding / process explainer on a habit tracker, fitness / wellness app, productivity or to-do app, or any consumer app landing page.',
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
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
    const heading = props.heading ?? 'How it works'
    const description =
      props.description ??
      'Get started in less than 60 seconds. No complicated setup, no lengthy onboarding.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Choose your habits',
            description:
              'Pick from 50+ curated templates or create your own. From drinking more water to reading 10 pages—start small.',
            imageAlt:
              'iPhone displaying habit selection screen with colorful habit icons in a grid layout',
          },
          {
            title: 'Set your schedule',
            description:
              "Daily, weekdays only, or just twice a week? You decide. We'll remind you only when it matters.",
            imageAlt:
              'Smartphone showing a scheduling app interface with time selection and reminder settings',
          },
          {
            title: 'Track & grow',
            description:
              'Check off habits with a tap. Watch your streaks build and celebrate milestones along the way.',
            imageAlt:
              'Smartphone showing habit tracking completion screen with checkmarks and progress statistics',
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
      <section
        className={cn(
          // Muted band with a diagonal top seam — neighbor-independent.
          'relative overflow-hidden bg-muted/40 pt-16 pb-20 [clip-path:polygon(0_3rem,100%_0,100%_100%,0_100%)] sm:pt-20 lg:pt-24 lg:pb-40',
          props.className,
        )}
        aria-labelledby="mobileapp-steps-heading"
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
              <h2
                id="mobileapp-steps-heading"
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
              [ setup ] under 60s
            </p>
          </div>
          <PortfolioGrid cols="1-2-3" className="gap-8 lg:gap-10">
            {items.map((step, i) => (
              <div
                key={step.title}
                className={cn('relative', stagger[i % stagger.length])}
              >
                {/* Giant ghost numeral bleeding behind the card. */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-10 right-0 select-none text-[6rem] font-extrabold leading-none tracking-tighter text-foreground/[0.06] sm:text-[7rem]"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="relative mt-6 border border-foreground/80 bg-card p-5 shadow-[6px_6px_0_0] shadow-foreground/15 sm:p-6">
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
                  {/* Hairline-chromed mini device frame. */}
                  <div className="mx-auto mt-5 w-full max-w-[190px] rounded-[1.75rem] border-[6px] border-foreground bg-foreground">
                    <div className="overflow-hidden rounded-[1.25rem] bg-background">
                      <Image
                        alt={step.imageAlt}
                        w={300}
                        h={600}
                        loading="lazy"
                        className="w-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </PortfolioGrid>
          <MonoTag
            aria-hidden="true"
            tone="faint"
            className="mt-12 block md:mt-28"
          >
            [ pick → schedule → track ]
          </MonoTag>
        </Container>
      </section>
    )
  },
})
