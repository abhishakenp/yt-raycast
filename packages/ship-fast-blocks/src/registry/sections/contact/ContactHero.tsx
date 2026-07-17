import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { HeroSection, HeroHeading } from '#/section-kit/HeroSection.tsx'

/**
 * ContactHero — centered hero section for a contact / get-in-touch page.
 * A compact, text-centered band with an eyebrow rule + label, a bold multi-line
 * heading, and a supporting lead paragraph. Uses token-only colors so it flips with
 * the active theme. Use as the top-of-page introduction for contact, support,
 * book-a-demo, or inquiry pages. Renders fully with no props via baked-in defaults.
 */
export const ContactHero = defineCapsule({
  name: 'ContactHero',
  description:
    'Centered hero section for a contact / get-in-touch page: a compact text-centered band with an eyebrow rule + label, a bold multi-line heading, and a supporting lead paragraph. Token-only colors flip with the active theme. Use as the top-of-page introduction for contact, support, book-a-demo, or inquiry pages.',
  props: z.object({
    /** Eyebrow rule label (e.g. 'Get in Touch'). */
    eyebrow: z.string().optional(),
    /** Main headline. */
    heading: z.string().optional(),
    /** Supporting paragraph under the headline. */
    lead: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Get in Touch'
    const heading = props.heading ?? "Let's start a conversation"
    const lead =
      props.lead ??
      'Whether you have a question about our services, pricing, need a demo, or anything else, our team is ready to answer all your questions.'

    return (
      <HeroSection
        variant="default"
        className={cn('px-4 pt-20 pb-14 text-center lg:px-8', props.className)}
      >
        <span className="mb-5 inline-flex items-center gap-2 text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-primary">
          <span
            aria-hidden="true"
            className="inline-block h-0.5 w-7 rounded-full bg-primary"
          />
          {eyebrow}
        </span>
        <HeroHeading
          variant="extra-bold"
          className="mx-auto mb-5 max-w-3xl tracking-[-0.03em] lg:text-[3.4rem]"
        >
          {heading}
        </HeroHeading>
        <p className="mx-auto max-w-[560px] text-lg leading-[1.7] text-muted-foreground">
          {lead}
        </p>
      </HeroSection>
    )
  },
})
