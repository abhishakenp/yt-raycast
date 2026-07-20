import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  CtaBand,
  CtaBandInner,
  CtaBandEyebrow,
  CtaBandTitle,
  CtaBandSubtitle,
} from '#/section-kit/CtaBand.tsx'
import { Watermark } from '#/section-kit/Decor.tsx'
import { newsletterLakebed } from '../newsletter/newsletter-lakebed.ts'
import { NewsletterSubscribeForm } from '../newsletter/newsletter-interactions.tsx'

/**
 * EcommerceCta — inverted editorial-commerce conversion band for a general
 * online store. The page's full ink inversion (foreground background,
 * background text) cutting in on a slanted clip-path seam, with a giant ghost
 * "SHOP" watermark bleeding off the right edge: a left-aligned extrabold
 * tight-tracked headline + supporting paragraph, a square hairline email
 * capture form (transparent mono input + light square submit button with
 * press feedback) backed by the shared Lakebed newsletter subscriber table,
 * and the disclaimer as a hairline-ruled mono uppercase footer row. Use as a
 * prominent storewide conversion band to capture subscribers, advertise a
 * first-order discount, or push a sale for any ecommerce / online retail
 * site. Renders fully with no props via baked-in defaults.
 */
export const EcommerceCta = defineCapsule({
  name: 'EcommerceCta',
  description:
    "Inverted editorial-commerce conversion band for a general online store: a full ink inversion (foreground background, background text) cutting in on a slanted clip-path seam with a giant ghost 'SHOP' watermark, a left-aligned extrabold tight-tracked headline + supporting paragraph, a square hairline email capture form backed by the shared Lakebed newsletter subscriber table, and the disclaimer as a hairline-ruled mono uppercase footer row. Use as a prominent storewide conversion band to capture subscribers, advertise a first-order discount, or push a sale for any ecommerce or online retail site.",
  props: z.object({
    heading: z.string().optional(),
    subheading: z.string().optional(),
    submit: z.string().optional(),
    placeholder: z.string().optional(),
    disclaimer: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: newsletterLakebed,
  component: ({ props, lakebed }) => {
    const heading = props.heading ?? 'Join & Save 15% On Your First Order'
    const subheading =
      props.subheading ??
      'Sign up for our newsletter to unlock an exclusive welcome discount, early access to sales, and the latest arrivals straight to your inbox.'
    const submit = props.submit ?? 'Claim My 15% Off'
    const placeholder = props.placeholder ?? 'you@example.com'
    const disclaimer =
      props.disclaimer ??
      'No spam, just deals. Unsubscribe anytime. By subscribing you agree to our Terms.'

    return (
      <CtaBand
        tone="primary"
        className={cn(
          'relative overflow-hidden bg-foreground text-background [clip-path:polygon(0_3rem,100%_0,100%_100%,0_100%)]',
          props.className,
        )}
      >
        <Watermark className="right-[-0.06em] top-[0.25em] text-[clamp(7rem,20vw,16rem)] uppercase text-background/[0.05]">
          Shop
        </Watermark>
        <CtaBandInner
          align="left"
          className="relative max-w-7xl gap-6 px-4 pb-16 pt-24 sm:px-6 sm:pt-28 lg:px-8 lg:pb-20 lg:pt-32"
        >
          <div className="flex w-full items-center gap-4 font-mono text-[11px] uppercase tracking-[0.2em] text-background/50">
            <span className="flex items-center gap-3">
              <span aria-hidden="true" className="size-1.5 bg-background" />
              Store offer
            </span>
            <span aria-hidden="true" className="h-px flex-1 bg-background/20" />
            <span aria-hidden="true">[ subscribe ]</span>
          </div>
          <CtaBandTitle className="max-w-3xl text-4xl font-extrabold leading-[0.98] tracking-tighter sm:text-5xl lg:text-6xl">
            {heading}
          </CtaBandTitle>
          <CtaBandSubtitle className="max-w-2xl text-background/70 opacity-100">
            {subheading}
          </CtaBandSubtitle>
          <NewsletterSubscribeForm
            lakebed={lakebed}
            source="ecommerce-cta"
            buttonLabel={submit}
            pendingLabel="Claiming"
            placeholder={placeholder}
            successMessage="You're in. Your welcome offer is ready in the live subscriber list."
            className="mt-2 flex w-full max-w-xl flex-col gap-3 sm:flex-row"
            inputClassName="min-h-12 flex-1 rounded-none border border-background/30 bg-transparent px-5 font-mono text-sm text-background outline-none transition-colors placeholder:text-background/40 focus:border-background"
            buttonClassName="inline-flex min-h-12 items-center justify-center rounded-none bg-background px-7 py-3 font-mono text-xs font-semibold uppercase tracking-[0.15em] text-foreground transition-all duration-150 hover:bg-background/90 active:translate-y-px disabled:pointer-events-none disabled:opacity-70"
            statusClassName="text-background/70"
          />
          <CtaBandEyebrow className="mt-4 w-full border-t border-background/20 pt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-background/50 opacity-100">
            {disclaimer}
          </CtaBandEyebrow>
        </CtaBandInner>
      </CtaBand>
    )
  },
})
