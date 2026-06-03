import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * KnowledgeBaseSupportCta — contrasting "still need help?" support CTA band on
 * the primary surface for a help center. A centered heading + supporting
 * paragraph above two buttons (a filled inverted "live chat" with a chat icon
 * and an outlined "email support" with a mail icon), with a bordered-top note
 * line below stating availability / response times. High-contrast, calm, and
 * reassuring. Both buttons route through useNavigate. Use near the end of a
 * knowledge base, support portal or docs site to escalate visitors to human
 * support. Renders fully with no props via baked-in defaults.
 */
export const KnowledgeBaseSupportCta = defineComponent({
  name: "KnowledgeBaseSupportCta",
  description:
    "Contrasting 'still need help?' support CTA band on the primary surface for a help center: a centered heading + supporting paragraph above two buttons (a filled inverted 'live chat' with a chat icon and an outlined 'email support' with a mail icon), with a bordered-top note line below stating availability / response times. High-contrast, calm and reassuring; both buttons route through useNavigate. Use near the end of a knowledge base, support portal or docs site to escalate visitors to human support.",
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    primaryCta: z.string().optional(),
    secondaryCta: z.string().optional(),
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading = props.heading ?? "Still need help?"
    const description =
      props.description ??
      "Our support team is available Monday through Friday, 9 AM to 6 PM EST. Enterprise customers have 24/7 priority support."
    const primaryCta = props.primaryCta ?? "Start live chat"
    const secondaryCta = props.secondaryCta ?? "Email support"
    const note =
      props.note ??
      "Average response time: Under 2 hours for email, Instant for live chat"

    const ChatIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 11.5a8.38 8.38 0 0 1-9 8.5 9.86 9.86 0 0 1-4.26-.95L3 20l1.4-3.72A8.5 8.5 0 0 1 12 3a8.38 8.38 0 0 1 9 8.5z" />
      </svg>
    )

    const MailIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <polyline points="3 7 12 13 21 7" />
      </svg>
    )

    return (
      <section
        id="kb-support"
        className={cn(
          "bg-primary py-16 text-primary-foreground sm:py-20",
          props.className,
        )}
        aria-labelledby="kb-support-heading"
      >
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2
            id="kb-support-heading"
            className="mb-4 text-2xl font-semibold sm:text-3xl"
          >
            {heading}
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-primary-foreground/70">
            {description}
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              type="button"
              onClick={() => go(primaryCta)}
              className="inline-flex items-center gap-2 rounded-lg bg-primary-foreground px-6 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary-foreground/90"
            >
              <ChatIcon className="size-5" />
              {primaryCta}
            </button>
            <button
              type="button"
              onClick={() => go(secondaryCta)}
              className="inline-flex items-center gap-2 rounded-lg border border-primary-foreground/40 px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-foreground/10"
            >
              <MailIcon className="size-5" />
              {secondaryCta}
            </button>
          </div>
          <div className="mt-12 border-t border-primary-foreground/20 pt-8">
            <p className="text-sm text-primary-foreground/60">{note}</p>
          </div>
        </div>
      </section>
    )
  },
})
