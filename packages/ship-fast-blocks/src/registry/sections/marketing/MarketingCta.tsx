import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  CtaBand,
  CtaBandInner,
  CtaBandTitle,
  CtaBandSubtitle,
} from '#/section-kit/CtaBand.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import { newsletterLakebed } from '../newsletter/newsletter-lakebed.ts'
import { NewsletterSubscribeForm } from '../newsletter/newsletter-interactions.tsx'

/**
 * MarketingCta — bold-kinetic inverted diagonal-seam conversion band with email
 * capture for a SaaS / product-marketing landing page. A full-width
 * bg-foreground/text-background band whose top edge cuts in on a clip-path
 * diagonal, with a giant ghost "GROW" watermark and a mono "[ FINAL STEP ]"
 * micro-label: an asymmetric 7:5 grid pairs a large tight-tracked headline +
 * supporting paragraph on the left with a stacked email capture on the right —
 * a hairline email input, a square filled primary submit button with press
 * feedback, and a mono trust footnote. The submit writes to the shared Lakebed
 * subscriber list. Use as the final conversion banner before the footer on B2B
 * SaaS, productivity, or developer-platform pages.
 */
export const MarketingCta = defineCapsule({
  name: 'MarketingCta',
  description:
    'Bold-kinetic inverted diagonal-seam conversion band with email capture for a SaaS / product-marketing landing page: a full-width bg-foreground/text-background band cut on a clip-path diagonal with a giant ghost GROW watermark and mono final-step micro-label, an asymmetric 7:5 grid pairing a large headline + supporting paragraph with a stacked email capture (hairline input, square filled primary submit with press feedback, mono trust footnote). The submit writes to the shared Lakebed subscriber list. Use as the final conversion banner before the footer on B2B SaaS, productivity, or developer-platform pages.',
  props: z.object({
    heading: z.string().optional(),
    subheading: z.string().optional(),
    placeholder: z.string().optional(),
    action: z.string().optional(),
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: newsletterLakebed,
  component: ({ props, lakebed }) => {
    const heading = props.heading ?? 'Ready to get more done?'
    const subheading =
      props.subheading ??
      'Join 10,000+ teams already using Flowstate to ship faster and stress less.'
    const placeholder = props.placeholder ?? 'Enter your work email'
    const action = props.action ?? 'Start free trial'
    const note = props.note ?? 'No credit card required. 14-day free trial.'

    return (
      <CtaBand
        tone="primary"
        className={cn(
          // Inversion band with a diagonal top seam — neighbor-independent.
          'relative overflow-hidden bg-foreground pt-8 text-background [clip-path:polygon(0_3rem,100%_0,100%_100%,0_100%)] sm:pt-12',
          props.className,
        )}
      >
        <Watermark className="-bottom-8 right-0 text-background/[0.05] text-[7rem] sm:text-[11rem] lg:text-[15rem]">
          GROW
        </Watermark>
        <CtaBandInner
          align="left"
          className="relative max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24"
        >
          <MonoTag tone="inverted" className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="size-1.5 shrink-0 bg-background"
            />
            Final step
            <span aria-hidden="true" className="text-background/40">
              · [ start ]
            </span>
          </MonoTag>
          <div className="grid w-full gap-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <CtaBandTitle className="max-w-2xl text-4xl font-extrabold tracking-tight text-background sm:text-5xl">
                {heading}
              </CtaBandTitle>
              <CtaBandSubtitle className="mt-5 text-background/70 opacity-100">
                {subheading}
              </CtaBandSubtitle>
            </div>
            <div className="lg:col-span-5">
              <NewsletterSubscribeForm
                lakebed={lakebed}
                source={action}
                placeholder={placeholder}
                buttonLabel={action}
                successMessage="You're in. Trial details will arrive by email."
                className="flex flex-col gap-3 sm:flex-row lg:flex-col"
                inputClassName="min-w-0 flex-1 rounded-none border border-background/25 bg-background/10 px-4 py-3.5 text-base text-background outline-none placeholder:text-background/50 focus:border-background"
                buttonClassName="inline-flex items-center justify-center rounded-none bg-background px-7 py-3.5 text-base font-semibold text-foreground shadow-[4px_4px_0_0] shadow-background/25 transition-[transform,box-shadow,background-color] duration-150 hover:bg-background/90 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none motion-reduce:transform-none disabled:pointer-events-none disabled:opacity-70"
                emailLabel="Work email"
                statusClassName="text-background/60"
              />
              <p className="mt-4 font-mono text-xs text-background/50">
                {note}
              </p>
            </div>
          </div>
        </CtaBandInner>
      </CtaBand>
    )
  },
})
