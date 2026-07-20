import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { newsletterLakebed } from '../newsletter/newsletter-lakebed.ts'
import { NewsletterSubscribeForm } from '../newsletter/newsletter-interactions.tsx'

import { Container } from '#/section-kit/Container.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import {
  NewsletterCtaDescription,
  NewsletterCtaFineprint,
  NewsletterCtaHeading,
} from '#/section-kit/NewsletterCta.tsx'
import { SubscribeBand } from '#/section-kit/SubscribeBand.tsx'

/**
 * BeautyStoreNewsletter — full-bleed inverted editorial subscribe band for a
 * beauty / skincare / cosmetics storefront. The band flips to the foreground
 * color and cuts in on a slanted top seam (clip-path), with the product
 * photograph washed to low opacity behind and a giant ghost serif italic
 * "Beauté" watermark. Content sits in an asymmetric 7:5 split: left carries a
 * mono inverted eyebrow rail, a serif italic heading, and the supporting
 * paragraph; right holds a real email-capture form — hairline-underlined
 * transparent input plus a sharp uppercase-tracked background-colored submit
 * button with press feedback — over the mono fine-print note. Form submit
 * writes to the shared Lakebed subscriber list. Use as a list-building /
 * first-order-discount conversion block for e-commerce, beauty boxes, or DTC
 * personal-care brands.
 */
export const BeautyStoreNewsletter = defineCapsule({
  name: 'BeautyStoreNewsletter',
  description:
    'Full-bleed inverted editorial subscribe band for a beauty / skincare / cosmetics storefront: the band flips to the foreground color and cuts in on a slanted top seam, with the product photograph washed to low opacity behind and a giant ghost serif italic "Beauté" watermark. An asymmetric 7:5 split places a mono inverted eyebrow rail, serif italic heading, and supporting paragraph on the left, and a real email-capture form (hairline-underlined transparent input + sharp uppercase-tracked submit button with press feedback) over the mono fine-print note on the right. Form submit writes to the shared Lakebed subscriber list so another subscribe block or admin view can react immediately. Use as a list-building / first-order-discount conversion block for e-commerce, beauty boxes, or DTC personal-care brands.',
  props: z.object({
    /** Eyebrow text above heading. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
    /** Email field placeholder text. */
    placeholder: z.string().optional(),
    /** Submit button label. */
    submit: z.string().optional(),
    /** Fine-print note beneath the form. */
    note: z.string().optional(),
    /** Alt text driving the background image. */
    imageAlt: z.string().optional(),
    /** Subscriber source label recorded when the form is submitted. */
    submitTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: newsletterLakebed,
  component: ({ props, lakebed }) => {
    const eyebrow = props.eyebrow ?? 'Limited Time Offer'
    const heading = props.heading ?? 'Join Our Beauty Community'
    const description =
      props.description ??
      'Subscribe to receive 15% off your first order, exclusive access to new arrivals, and personalized beauty recommendations.'
    const placeholder = props.placeholder ?? 'Enter your email'
    const submit = props.submit ?? 'Get 15% Off'
    const note = props.note ?? 'No spam, ever. Unsubscribe anytime.'
    const imageAlt =
      props.imageAlt ??
      'luxury skincare products arranged on dark marble surface'
    const submitTarget = props.submitTarget ?? submit

    return (
      <SubscribeBand
        variant="inverted"
        className={cn(
          // Inverted band with a slanted top seam — neighbor-independent.
          'relative overflow-hidden py-16 pt-24 [clip-path:polygon(0_3rem,100%_0,100%_100%,0_100%)] sm:pt-28 lg:py-28 lg:pt-36',
          props.className,
        )}
      >
        {/* Low-opacity product photograph washing the whole band. */}
        <div aria-hidden="true" className="absolute inset-0 opacity-15">
          <Image
            alt={imageAlt}
            w={1200}
            h={600}
            loading="lazy"
            className="size-full object-cover"
          />
        </div>
        {/* Giant ghost serif italic watermark. */}
        <Watermark className="-bottom-10 -left-4 font-serif text-[7rem] font-medium italic tracking-tight text-background/[0.06] sm:text-[11rem] lg:text-[15rem]">
          Beauté
        </Watermark>

        <Container className="relative">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-16">
            <div className="lg:col-span-7">
              {/* Mono inverted eyebrow rail. */}
              <div className="mb-6 flex items-center gap-4">
                <MonoTag tone="inverted" className="shrink-0 text-background">
                  {eyebrow}
                </MonoTag>
                <span
                  aria-hidden="true"
                  className="h-px w-10 bg-background/30 sm:max-w-24 sm:flex-1"
                />
              </div>
              <NewsletterCtaHeading className="max-w-2xl font-serif text-4xl font-medium italic tracking-tight text-background sm:text-5xl lg:text-6xl">
                {heading}
              </NewsletterCtaHeading>
              <NewsletterCtaDescription className="mt-6 max-w-xl border-l border-background/30 pl-5 text-lg text-background/70">
                {description}
              </NewsletterCtaDescription>
            </div>
            <div className="lg:col-span-5">
              <NewsletterSubscribeForm
                lakebed={lakebed}
                source={submitTarget}
                placeholder={placeholder}
                buttonLabel={submit}
                successMessage="You're in. Your beauty offer and product edits will arrive by email."
                className="flex max-w-md flex-col gap-4 sm:flex-row sm:items-end sm:gap-3 lg:max-w-none"
                inputClassName="flex-1 rounded-none border-0 border-b border-background/40 bg-transparent px-1 py-3 text-background placeholder:text-background/50 focus:border-background focus:outline-none"
                buttonClassName="whitespace-nowrap rounded-none bg-background px-7 py-3.5 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground transition-all duration-150 hover:bg-background/90 active:translate-y-px disabled:pointer-events-none disabled:opacity-70"
                statusClassName="text-background/60"
              />
              <NewsletterCtaFineprint className="mt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-background/60">
                {note}
              </NewsletterCtaFineprint>
            </div>
          </div>
        </Container>
      </SubscribeBand>
    )
  },
})
