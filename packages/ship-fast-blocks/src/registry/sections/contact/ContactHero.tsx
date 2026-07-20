import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import { HeroSection, HeroHeading } from '#/section-kit/HeroSection.tsx'

/**
 * ContactHero — minimal editorial hero for a contact / get-in-touch page.
 * A mono metadata rail (primary square + uppercase eyebrow — hairline rule —
 * "01 / Contact" index) sits above an asymmetric 8:4 split: a huge extrabold
 * tight-tracked left-aligned heading on the left, and the lead paragraph
 * tucked against a hairline left rule at the bottom-right. A giant ghost "@"
 * watermark bleeds off the right edge. Sharp edges, tokens-only colors, so it
 * flips with the active theme. Use as the top-of-page introduction for
 * contact, support, book-a-demo, or inquiry pages. Renders fully with no
 * props via baked-in defaults.
 */
export const ContactHero = defineCapsule({
  name: 'ContactHero',
  description:
    'Minimal editorial hero for a contact / get-in-touch page: a mono metadata rail (primary square + uppercase eyebrow, hairline rule, "01 / Contact" index) above an asymmetric 8:4 split — huge extrabold tight-tracked left-aligned heading, lead paragraph against a hairline left rule at bottom-right — with a giant ghost "@" watermark bleeding off the edge. Sharp edges, token-only colors flip with the active theme. Use as the top-of-page introduction for contact, support, book-a-demo, or inquiry pages.',
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
        className={cn(
          'relative overflow-hidden bg-background pt-16 pb-14 sm:pt-24 sm:pb-20',
          props.className,
        )}
      >
        {/* Giant ghost glyph bleeding off the right edge. */}
        <Watermark className="-right-8 -bottom-16 text-[14rem] sm:text-[20rem] lg:-bottom-24 lg:text-[26rem]">
          @
        </Watermark>

        <Container className="relative">
          {/* Mono metadata rail: eyebrow — hairline rule — page index. */}
          <div className="flex items-center gap-4">
            <MonoTag className="inline-flex items-center gap-2.5 text-foreground">
              <span
                aria-hidden="true"
                className="inline-block size-1.5 shrink-0 bg-primary"
              />
              {eyebrow}
            </MonoTag>
            <span aria-hidden="true" className="h-px flex-1 bg-border" />
            <MonoTag aria-hidden="true" tone="faint">
              01 / Contact
            </MonoTag>
          </div>

          <div className="mt-10 grid items-end gap-8 sm:mt-14 lg:grid-cols-12 lg:gap-12">
            <HeroHeading
              variant="extra-bold"
              className="max-w-none text-[2.75rem] leading-[0.95] tracking-tighter sm:text-6xl lg:col-span-8 lg:text-7xl"
            >
              {heading}
            </HeroHeading>
            <p className="max-w-md border-l border-border pl-5 text-base leading-relaxed text-muted-foreground sm:pl-6 lg:col-span-4 lg:max-w-none">
              {lead}
            </p>
          </div>
        </Container>
      </HeroSection>
    )
  },
})
