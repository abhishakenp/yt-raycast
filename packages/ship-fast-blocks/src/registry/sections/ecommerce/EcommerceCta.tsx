import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { newsletterLakebed } from '../newsletter/newsletter-lakebed.ts'
import { NewsletterSubscribeForm } from '../newsletter/newsletter-interactions.tsx'

/**
 * EcommerceCta — high-contrast sale / newsletter band for a general online
 * store. Thin configuration over the shared `CtaBand` composite at
 * tone="primary": a bold headline + sub paragraph over a primary surface, a
 * contrasting "Claim My 15% Off" pill (auto-inverted on the primary band), and
 * a small disclaimer carried in the eyebrow. The CTA routes through
 * useNavigate. Use as a prominent storewide conversion band to capture
 * subscribers, advertise a first-order discount, or push a sale for any
 * ecommerce / online retail site. Renders fully with no props via baked-in
 * defaults.
 */
export const EcommerceCta = defineCapsule({
  name: 'EcommerceCta',
  description:
    'High-contrast sale / newsletter band for a general online store: a bold headline + sub paragraph over a primary surface, an email capture form backed by the shared Lakebed newsletter subscriber table, and a small disclaimer. Use as a prominent storewide conversion band to capture subscribers, advertise a first-order discount, or push a sale for any ecommerce or online retail site.',
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
      <section
        className={cn(
          'w-full bg-primary text-primary-foreground',
          props.className,
        )}
      >
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-5 px-6 py-16 text-center lg:px-8">
          <span className="text-sm font-medium uppercase tracking-wide opacity-80">
            {disclaimer}
          </span>
          <h2 className="text-3xl font-semibold md:text-4xl">{heading}</h2>
          <p className="max-w-2xl text-base opacity-90 md:text-lg">
            {subheading}
          </p>
          <NewsletterSubscribeForm
            lakebed={lakebed}
            source="ecommerce-cta"
            buttonLabel={submit}
            pendingLabel="Claiming"
            placeholder={placeholder}
            successMessage="You're in. Your welcome offer is ready in the live subscriber list."
            className="mt-2 flex w-full max-w-xl flex-col gap-3 sm:flex-row"
            inputClassName="min-h-12 flex-1 rounded-full border border-primary-foreground/30 bg-primary-foreground px-5 text-sm text-primary shadow-sm outline-none transition-colors placeholder:text-primary/60 focus:border-primary-foreground"
            buttonClassName="inline-flex min-h-12 items-center justify-center rounded-full bg-primary-foreground px-6 py-3 text-sm font-semibold text-primary shadow-sm transition-colors hover:bg-primary-foreground/90 disabled:pointer-events-none disabled:opacity-70"
            statusClassName="text-primary-foreground/80"
          />
        </div>
      </section>
    )
  },
})
