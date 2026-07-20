import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

/**
 * FurnitureStoreDesign — the page's one restrained ink-inverted design-service
 * band (bg-foreground / text-background). An asymmetric 7:5 two-column section
 * (stacks on mobile) over a giant faint ghost numeral watermark: a left copy
 * column with a mono index micro-label, heading, paragraph, a numbered 3-step
 * collapsed-hairline process ledger (mono "STEP 01" label + title + caption)
 * and a square light CTA button with press feedback; a right column with a tall
 * rounded-none image plate and a floating light museum-label card pinned to its
 * corner showing a stat callout (mono label, big tabular-num value, caption).
 * The CTA routes through section-kit route links. Use to promote a
 * complimentary / paid interior-design or consultation service for furniture,
 * home-decor, or interiors brands. Renders fully with no props via baked-in
 * "Haven & Home" defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { SplitStory } from '#/section-kit/SplitStory.tsx'
import { Watermark } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

export const FurnitureStoreDesign = defineCapsule({
  name: 'FurnitureStoreDesign',
  description:
    'The page\'s one restrained ink-inverted design-service band (bg-foreground / text-background): an asymmetric 7:5 two-column section (stacks on mobile) over a giant faint ghost numeral watermark, with a left copy column (mono index micro-label, heading, paragraph, a numbered 3-step collapsed-hairline process ledger of mono "STEP 01" label + title + caption, and a square light CTA button with press feedback) beside a right column with a tall rounded-none image plate and a floating light museum-label card showing a stat callout (mono label, big tabular-num value, caption); CTA routes through section-kit route links. Use to promote a complimentary or paid interior-design / consultation service for furniture, home-decor, or interiors brands.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    description: z.string().optional(),
    cta: z.string().optional(),
    imageAlt: z.string().optional(),
    steps: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
        }),
      )
      .optional(),
    statLabel: z.string().optional(),
    statValue: z.string().optional(),
    statCaption: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Complimentary Design Service'
    const heading = props.heading ?? "Not sure where to start? We'll help."
    const description =
      props.description ??
      "Our design experts will work with you to create a space you'll love. From mood boards to floor plans, we're with you every step of the way—completely free."
    const cta = props.cta ?? 'Book free consultation'
    const imageAlt =
      props.imageAlt ??
      'Interior designer consulting with clients in a bright modern showroom with furniture samples'
    const steps = props.steps?.length
      ? props.steps
      : [
          {
            title: 'Book a free consultation',
            description:
              'Schedule a 30-minute video call with one of our design experts.',
          },
          {
            title: 'Share your space',
            description:
              'Upload photos and measurements. Tell us about your lifestyle and budget.',
          },
          {
            title: 'Get your custom plan',
            description:
              'Receive a personalized design board, floor plan, and curated product list.',
          },
        ]
    const statLabel = props.statLabel ?? 'Designer consultations'
    const statValue = props.statValue ?? '12,000+'
    const statCaption = props.statCaption ?? 'Completed this year'
    const ArrowLong = ({ className }: { className?: string }) => (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    )
    return (
      <SplitStory
        className={cn(
          'relative overflow-hidden bg-foreground py-16 text-background lg:py-24',
          props.className,
        )}
        aria-labelledby="furniture-design-heading"
      >
        {/* Giant faint ghost numeral watermark for editorial gravitas. */}
        <Watermark className="-bottom-16 right-0 text-background/[0.05] text-[14rem] leading-none sm:text-[20rem]">
          {String(steps.length).padStart(2, '0')}
        </Watermark>
        <Container className="relative">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <SectionHeading
                align="left"
                eyebrow={eyebrow}
                title={heading}
                subtitle={description}
                titleId="furniture-design-heading"
                className="mb-10 gap-0"
                eyebrowClassName="mb-4 font-mono text-[11px] font-normal uppercase tracking-[0.2em] text-background/60"
                titleClassName="mb-6 text-3xl font-medium tracking-tight text-background lg:text-4xl"
                subtitleClassName="text-lg leading-relaxed text-background/70"
              />

              <div className="grid gap-0 border-l border-t border-background/20 sm:grid-cols-3">
                {steps.map((step, i) => (
                  <div
                    key={step.title}
                    className="border-b border-r border-background/20 p-5 sm:p-6"
                  >
                    <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-background/50">
                      Step {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 className="mb-1 mt-3 font-medium text-background">
                      {step.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-background/60">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>

              <NavbarRouteLink
                className="mt-10 inline-flex items-center rounded-none bg-background px-6 py-3.5 text-sm font-medium text-foreground transition-[background-color,transform] duration-150 hover:bg-background/90 active:translate-y-px motion-reduce:active:translate-y-0"
                href={cta}
              >
                {cta}
                <ArrowLong className="ml-2 size-4" />
              </NavbarRouteLink>
            </div>

            <div className="relative lg:col-span-5">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -translate-x-3 -translate-y-3 border border-background/20"
              />
              <Image
                alt={imageAlt}
                w={800}
                h={900}
                loading="lazy"
                className="relative h-auto w-full rounded-none object-cover"
              />
              <div className="absolute -bottom-6 -left-6 hidden rounded-none border border-border bg-background p-6 text-foreground shadow-[8px_8px_0_0] shadow-foreground/10 sm:block">
                <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  {statLabel}
                </p>
                <p className="text-3xl font-semibold tabular-nums tracking-tight">
                  {statValue}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {statCaption}
                </p>
              </div>
            </div>
          </div>
        </Container>
      </SplitStory>
    )
  },
})
