import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  HeroSection,
  HeroHeading,
  HeroSubheading,
  HeroActions,
  HeroCta,
  HeroMediaPanel,
  HeroSocialProof,
  HeroSocialProofItem,
} from '#/section-kit/HeroSection.tsx'
import { Card } from '#/section-kit/Card.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { DotGrid, Watermark, MonoTag } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
export const TutoringHero = defineCapsule({
  name: 'TutoringHero',
  description:
    "Editorial-academic split-layout hero for tutoring sites over a faint dot-grid with a giant serif ghost 'A+' watermark. An asymmetric 7:5 split: the left column opens with a mono uppercase eyebrow meta rule (primary square + course-index cue), a warm authoritative serif headline, supporting copy, primary 'Find a Tutor' and bracketed outline 'How it works' CTAs (both routed through section-kit route links, sharp-cornered with a hard offset shadow and press feedback), and a hairline mono trust ledger with rating, session count, and a background-checked note. The right column frames a tutor-with-student photo (alt-driven Image) as a sharp-cornered catalog plate with a hairline border, hard offset shadow, and a mono caption bar. Use it as the opening viewport of a tutoring or education landing page when you want a scholarly, trustworthy, conversion-focused first impression.",
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    subheading: z.string().optional(),
    primaryCta: z.string().optional(),
    primaryTarget: z.string().optional(),
    secondaryCta: z.string().optional(),
    secondaryTarget: z.string().optional(),
    trust: z.array(z.string()).optional(),
    imageAlt: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? '1-on-1 tutoring that clicks'
    const heading =
      props.heading ?? 'Learning made friendly, confident, and fun'
    const subheading =
      props.subheading ??
      'Meet patient, background-checked tutors who meet your child where they are — and help them get where they want to be. Flexible scheduling, real progress, zero pressure.'
    const primaryCta = props.primaryCta ?? 'Find a Tutor'
    const primaryTarget = props.primaryTarget ?? 'Subjects'
    const secondaryCta = props.secondaryCta ?? 'How it works'
    const secondaryTarget = props.secondaryTarget ?? 'How it Works'
    const trust = props.trust?.length
      ? props.trust
      : [
          '4.9/5 average rating',
          '10,000+ sessions delivered',
          'Background-checked tutors',
        ]
    const imageAlt =
      props.imageAlt ?? 'Friendly tutor helping a smiling student with homework'

    return (
      <HeroSection
        className={cn(
          'relative overflow-hidden bg-background py-20 text-foreground sm:py-24',
          props.className,
        )}
      >
        <DotGrid tone="border" className="inset-0 opacity-30" />
        <Watermark
          aria-hidden="true"
          className="-right-2 bottom-0 font-serif text-[9rem] leading-none sm:-right-6 sm:text-[16rem]"
        >
          A+
        </Watermark>
        <Container className="relative grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
              <MonoTag className="flex items-center gap-3">
                <span aria-hidden="true" className="size-2 bg-primary" />
                {eyebrow}
              </MonoTag>
              <span
                aria-hidden="true"
                className="hidden font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/50 sm:inline"
              >
                Est. curriculum
              </span>
            </div>
            <HeroHeading className="mt-6 max-w-xl font-serif text-[clamp(2.25rem,5vw,3.5rem)] font-semibold leading-[1.05] tracking-tight">
              {heading}
            </HeroHeading>
            <HeroSubheading className="max-w-xl leading-8">
              {subheading}
            </HeroSubheading>
            <HeroActions className="flex-col gap-3 sm:flex-row">
              <HeroCta
                asChild
                variant="primary"
                className="rounded-none px-6 py-3.5 font-mono text-sm font-semibold uppercase tracking-[0.12em] shadow-[6px_6px_0_0] shadow-primary/25 transition-[transform,box-shadow,background-color] duration-150 hover:bg-primary/90 active:translate-y-px active:shadow-none"
              >
                <NavbarRouteLink href={primaryTarget}>
                  {primaryCta}
                </NavbarRouteLink>
              </HeroCta>
              <HeroCta
                asChild
                variant="outline"
                className="gap-2 rounded-none px-6 py-3.5 font-mono text-sm font-medium uppercase tracking-[0.12em] transition-colors duration-150 hover:bg-foreground hover:text-background active:translate-y-px"
              >
                <NavbarRouteLink href={secondaryTarget}>
                  <span aria-hidden="true">[</span>
                  {secondaryCta}
                  <span aria-hidden="true">]</span>
                </NavbarRouteLink>
              </HeroCta>
            </HeroActions>
            <HeroSocialProof className="mt-10 flex-col items-stretch gap-0 divide-y divide-border border-t border-border sm:mt-12">
              {trust.map((item, i) => (
                <HeroSocialProofItem key={item} className="gap-3 py-3">
                  <span
                    aria-hidden="true"
                    className="font-mono text-[11px] tabular-nums text-primary"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <svg
                    className="size-4 shrink-0 text-primary"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m5 13 4 4L19 7"
                    />
                  </svg>
                  <span className="text-sm font-medium text-foreground">
                    {item}
                  </span>
                </HeroSocialProofItem>
              ))}
            </HeroSocialProof>
          </div>
          <div className="relative lg:col-span-5">
            <Card
              variant="default"
              className="relative overflow-hidden rounded-none border-border p-0 shadow-[10px_10px_0_0] shadow-foreground/10"
            >
              <HeroMediaPanel
                alt={imageAlt}
                w={900}
                h={760}
                className="aspect-[5/4] rounded-none"
              />
              <div className="flex items-center gap-3 border-t border-border bg-card p-5">
                <span className="inline-flex size-10 shrink-0 items-center justify-center border border-border text-primary">
                  <svg
                    className="size-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>
                </span>
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                    Vetted &amp; background-checked
                  </p>
                  <p className="mt-1 text-sm font-medium text-card-foreground">
                    Every tutor is interviewed before they meet your family.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </Container>
      </HeroSection>
    )
  },
})
