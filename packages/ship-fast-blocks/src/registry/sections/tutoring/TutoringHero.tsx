import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
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

export const TutoringHero = defineCapsule({
  name: 'TutoringHero',
  description:
    "Friendly, trustworthy split-layout hero for tutoring sites. Renders a warm eyebrow pill, a large reassuring headline, supporting copy, primary 'Find a Tutor' and outline 'How it works' CTAs (both routed through useNavigate), and a trust strip with rating, session count, and a background-checked badge. The right column shows a rounded, bordered photo of a tutor working with a student via the alt-driven Image component. Use it as the opening viewport of a tutoring or education landing page when you want an inviting, conversion-focused first impression.",
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
    const go = useNavigate()
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
          'bg-background py-20 text-foreground sm:py-24',
          props.className,
        )}
      >
        <Container className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-2 text-sm font-medium text-muted-foreground">
              <span
                className="size-2 rounded-full bg-primary"
                aria-hidden="true"
              />
              {eyebrow}
            </span>
            <HeroHeading className="mt-6 max-w-xl lg:text-5xl">
              {heading}
            </HeroHeading>
            <HeroSubheading className="max-w-xl leading-8">
              {subheading}
            </HeroSubheading>
            <HeroActions className="flex-col gap-3 sm:flex-row">
              <HeroCta
                asChild
                variant="primary"
                className="rounded-full px-6 py-3 font-semibold"
              >
                <button type="button" onClick={() => go(primaryTarget)}>
                  {primaryCta}
                </button>
              </HeroCta>
              <HeroCta
                asChild
                variant="outline"
                className="rounded-full px-6 py-3 font-semibold"
              >
                <button type="button" onClick={() => go(secondaryTarget)}>
                  {secondaryCta}
                </button>
              </HeroCta>
            </HeroActions>
            <HeroSocialProof className="mt-10 gap-y-3 border-t border-border pt-8">
              {trust.map((item) => (
                <HeroSocialProofItem key={item}>
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
                  <span className="font-medium text-foreground">{item}</span>
                </HeroSocialProofItem>
              ))}
            </HeroSocialProof>
          </div>
          <div className="relative">
            <div
              className="absolute inset-6 rounded-3xl bg-primary/10 blur-3xl"
              aria-hidden="true"
            />
            <Card
              variant="default"
              className="relative overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.12)] rounded-3xl p-0"
            >
              <HeroMediaPanel
                alt={imageAlt}
                w={900}
                h={760}
                rounded="3xl"
                className="aspect-[5/4]"
              />
              <div className="flex items-center gap-3 border-t border-border bg-card/95 p-5">
                <span className="inline-flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
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
                  <p className="text-sm font-semibold text-card-foreground">
                    Background-checked & vetted
                  </p>
                  <p className="text-xs text-muted-foreground">
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
