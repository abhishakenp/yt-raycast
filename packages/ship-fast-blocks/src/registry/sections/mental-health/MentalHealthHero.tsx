import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  HeroSection,
  HeroHeading,
  HeroHighlight,
  HeroSubheading,
  HeroActions,
  HeroCta,
  HeroMediaPanel,
  HeroSocialProof,
  HeroSocialProofItem,
} from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import {
  LocalServiceBookingButton,
  LocalServiceMutationSpinner,
} from '../local-service/local-service-interactions.tsx'
import { localServiceLakebed } from '../local-service/local-service-lakebed.ts'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * MentalHealthHero — a warm-editorial asymmetric 7/5 hero for a therapy /
 * counseling practice. On a soft layered muted wash with two giant faint halo
 * rings drifting off the corner: a left column with a square hairline status
 * chip (mono micro-label + single primary dot), a large serif two-line headline
 * whose second line is accented in the primary color, a reassuring lede, a
 * square filled-primary "Schedule a Session" CTA plus a square hairline outline
 * link (both with press feedback), and a hairline ledger row of licensed-clinician
 * trust checks with primary tick dashes; the right column shows a calming
 * therapy-office photo in a hairline offset double frame with a square
 * "Next Available" appointment card overlapping its corner. Calm, warm,
 * sage-and-sand wellness aesthetic. CTAs route through section-kit route links;
 * imagery uses the alt-driven Image component. Use as the top hero for
 * therapists, counselors, psychologists, wellness centers, or telehealth
 * practices.
 */
export const MentalHealthHero = defineCapsule({
  name: 'MentalHealthHero',
  description:
    "Warm-editorial asymmetric 7/5 hero for a therapy / counseling practice: a soft layered muted wash with two giant faint halo rings, a left column with a square hairline status chip (mono micro-label), a large serif two-line headline whose second line is accented in the primary color, a reassuring lede, a square filled-primary 'Schedule a Session' CTA plus a square hairline outline link, and a hairline ledger row of licensed-clinician trust checks with primary tick dashes; a right column with a calming therapy-office photo in a hairline offset double frame and a square 'Next Available' appointment card overlapping its corner. Calm, warm, sage-and-sand wellness aesthetic. CTAs route through section-kit route links; imagery uses the Image component. Use as the top hero for therapists, counselors, psychologists, wellness centers, or telehealth practices.",
  props: z.object({
    headingTop: z.string().optional(),
    /** Phrase rendered in the primary accent color (second headline line). */
    highlight: z.string().optional(),
    subheading: z.string().optional(),
    primaryCta: z.string().optional(),
    secondaryCta: z.string().optional(),
    imageAlt: z.string().optional(),
    cardTitle: z.string().optional(),
    cardSubtitle: z.string().optional(),
    trust: z.array(z.string()).optional(),
    /** Navigation target for the primary CTA (e.g. "Book Session"). */
    bookLabel: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: localServiceLakebed,
  component: ({ props, lakebed }) => {
    const headingTop = props.headingTop ?? 'Find your calm.'
    const highlight = props.highlight ?? 'Begin healing.'
    const subheading =
      props.subheading ??
      "Professional therapy services in Portland's Pearl District. Licensed clinicians providing evidence-based care for anxiety, depression, relationships, and life transitions. Most insurance accepted."
    const primaryCta = props.primaryCta ?? 'Schedule a Session'
    const secondaryCta = props.secondaryCta ?? 'Explore Services'
    const imageAlt =
      props.imageAlt ??
      'Serene therapy office with comfortable seating, soft natural lighting, and calming neutral decor'
    const cardTitle = props.cardTitle ?? 'Next Available'
    const cardSubtitle = props.cardSubtitle ?? 'Tomorrow, 10:00 AM'
    const trust = props.trust?.length
      ? props.trust
      : ['Licensed Clinicians', 'In-Person & Virtual']
    const bookLabel = props.bookLabel ?? 'Book Session'

    const Clock = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    )

    return (
      <HeroSection
        className={cn(
          'relative overflow-hidden border-b border-border bg-gradient-to-b from-muted/50 via-background to-muted/30',
          props.className,
        )}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          <span className="absolute -right-40 -top-48 size-[38rem] rounded-full border border-primary/10" />
          <span className="absolute -right-16 -top-24 size-[26rem] rounded-full border border-foreground/[0.06]" />
        </div>
        <Container size="lg" className="relative py-16 sm:py-20 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <div className="mb-7 inline-flex items-center gap-2.5 border border-border bg-background/70 px-3.5 py-2">
                <span
                  aria-hidden="true"
                  className="size-1.5 rounded-full bg-primary"
                />
                <MonoTag>Now welcoming new clients</MonoTag>
              </div>
              <HeroHeading className="mb-6 max-w-2xl font-serif text-[clamp(2.5rem,6vw,4.5rem)] font-medium leading-[1.02] tracking-tight">
                {headingTop}
                <br />
                <HeroHighlight>{highlight}</HeroHighlight>
              </HeroHeading>
              <HeroSubheading className="mb-9 mt-0 max-w-xl text-base leading-relaxed sm:text-lg">
                {subheading}
              </HeroSubheading>
              <HeroActions className="mt-0 flex flex-col gap-3 sm:flex-row sm:gap-4">
                <LocalServiceBookingButton
                  lakebed={lakebed}
                  intentLabel={bookLabel}
                  service={primaryCta}
                  source="hero"
                  pendingChildren={
                    <LocalServiceMutationSpinner className="text-primary-foreground" />
                  }
                  className="inline-flex items-center justify-center rounded-none bg-primary px-7 py-3.5 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:translate-y-px disabled:pointer-events-none disabled:opacity-70"
                >
                  {primaryCta}
                </LocalServiceBookingButton>
                <HeroCta
                  asChild
                  variant="outline"
                  className="rounded-none border-foreground/25 bg-background px-7 py-3.5 text-base font-semibold text-foreground transition-colors hover:bg-muted active:translate-y-px"
                >
                  <NavbarRouteLink href={secondaryCta}>
                    {secondaryCta}
                  </NavbarRouteLink>
                </HeroCta>
              </HeroActions>
              <HeroSocialProof className="mt-12 grid max-w-xl grid-cols-1 gap-0 border-t border-border sm:grid-cols-2">
                {trust.map((t) => (
                  <HeroSocialProofItem
                    key={t}
                    className="gap-3 border-b border-border py-3.5 text-sm text-muted-foreground sm:border-b-0 sm:pr-4"
                  >
                    <span
                      aria-hidden="true"
                      className="h-px w-4 shrink-0 bg-primary"
                    />
                    <span>{t}</span>
                  </HeroSocialProofItem>
                ))}
              </HeroSocialProof>
            </div>
            <div className="relative lg:col-span-5">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-3 border border-border sm:-inset-4"
              />
              <HeroMediaPanel
                alt={imageAlt}
                w={800}
                h={600}
                className="aspect-[4/3] rounded-none border border-border"
              />
              <div className="absolute -bottom-6 -left-3 flex max-w-[15rem] items-center gap-3 border border-border bg-background p-4 sm:-left-8">
                <span
                  aria-hidden="true"
                  className="grid size-10 shrink-0 place-items-center rounded-none bg-primary/10"
                >
                  <Clock className="size-5 text-primary" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-card-foreground">
                    {cardTitle}
                  </p>
                  <MonoTag tone="faint" className="tracking-[0.12em]">
                    {cardSubtitle}
                  </MonoTag>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </HeroSection>
    )
  },
})
