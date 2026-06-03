import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * ElectronicsStoreNewsletter — a dark inverted, centered newsletter CTA band for
 * an electronics storefront. A bold heading, a muted supporting paragraph, an
 * inline email capture form (translucent input + solid submit button that stacks
 * on mobile), and a fine-print disclaimer beneath. The form submit routes through
 * useNavigate. Use as a closing email-capture / discount-incentive band on
 * electronics stores, gadget shops, consumer-tech retailers, or any product
 * catalog.
 */
export const ElectronicsStoreNewsletter = defineComponent({
  name: "ElectronicsStoreNewsletter",
  description:
    "Dark inverted, centered newsletter CTA band for an electronics storefront: a bold heading, a muted supporting paragraph, an inline email capture form (translucent input + solid submit button that stacks on mobile), and a fine-print disclaimer beneath. The form submit routes through useNavigate. Use as a closing email-capture / discount-incentive band (e.g. 'Get 10% Off Your First Order') on electronics stores, gadget shops, consumer-tech retailers, or any product catalog.",
  props: z.object({
    /** Band heading. */
    heading: z.string().optional(),
    /** Supporting paragraph. */
    description: z.string().optional(),
    /** Email input placeholder. */
    placeholder: z.string().optional(),
    /** Submit button label. */
    submit: z.string().optional(),
    /** Fine-print disclaimer beneath the form. */
    disclaimer: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading = props.heading ?? "Get 10% Off Your First Order"
    const description =
      props.description ??
      "Subscribe to our newsletter for exclusive deals, new product announcements, and expert tech tips delivered to your inbox."
    const placeholder = props.placeholder ?? "Enter your email"
    const submit = props.submit ?? "Subscribe"
    const disclaimer =
      props.disclaimer ??
      "By subscribing, you agree to our Privacy Policy. Unsubscribe anytime."

    return (
      <section
        className={cn(
          "bg-foreground py-16 text-background lg:py-24",
          props.className,
        )}
      >
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 text-3xl font-semibold text-background lg:text-4xl">
            {heading}
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-background/60">
            {description}
          </p>
          <form
            className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault()
              go(submit)
            }}
          >
            <input
              type="email"
              required
              placeholder={placeholder}
              aria-label={placeholder}
              className="flex-1 rounded-lg border border-background/20 bg-background/10 px-4 py-3 text-background placeholder:text-background/50 focus:border-background/40 focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-lg bg-background px-6 py-3 font-medium text-foreground transition-colors hover:bg-background/90"
            >
              {submit}
            </button>
          </form>
          <p className="mt-4 text-sm text-background/50">{disclaimer}</p>
        </div>
      </section>
    )
  },
})
