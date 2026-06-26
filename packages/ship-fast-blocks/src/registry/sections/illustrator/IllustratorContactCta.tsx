import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * IllustratorContactCta — a centered closing contact call-to-action for an
 * illustrator / visual-artist portfolio. A large serif heading and supporting
 * paragraph sit above dual CTAs (a filled primary email button with a mail icon
 * + an outlined secondary action) and a centered row of text social links.
 * Every button and social link routes through useNavigate. Use as the final
 * "let's work together" band before the footer. Renders fully with no props via
 * baked-in defaults.
 */
export const IllustratorContactCta = defineComponent({
  name: 'IllustratorContactCta',
  description:
    "Centered closing contact call-to-action for an illustrator / visual-artist portfolio: a large serif heading and supporting paragraph above dual CTAs (a filled primary email button with a mail icon + an outlined secondary action) and a centered row of text social links, all routing through useNavigate. Use as the final 'let's work together' band before the footer.",
  props: z.object({
    /** Serif heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
    /** Email shown on the primary button (also the nav target). */
    email: z.string().optional(),
    /** Outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Text social links shown in the bottom row. */
    socials: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading = props.heading ?? "Let's create something beautiful together"
    const description =
      props.description ??
      "Whether you're an editor with a manuscript, a brand seeking editorial work, or an art lover wanting the perfect print—I'd love to hear from you."
    const email = props.email ?? 'hello@mirachen.studio'
    const secondaryCta = props.secondaryCta ?? 'Download Portfolio PDF'
    const socials = props.socials?.length
      ? props.socials
      : ['Instagram', 'Pinterest', 'Behance', 'Dribbble']

    return (
      <section
        className={cn(
          'bg-background px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36',
          props.className,
        )}
      >
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-6 font-serif text-3xl sm:text-4xl lg:text-5xl">
            {heading}
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            {description}
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <button
              type="button"
              onClick={() => go(email)}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-8 py-4 text-sm font-medium text-background transition-colors hover:bg-muted-foreground"
            >
              <svg
                className="size-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              {email}
            </button>
            <button
              type="button"
              onClick={() => go(secondaryCta)}
              className="rounded-full border border-foreground px-8 py-4 text-sm font-medium text-foreground transition-colors hover:bg-foreground hover:text-background"
            >
              {secondaryCta}
            </button>
          </div>
          <div className="mt-12 flex justify-center gap-6">
            {socials.map((social) => (
              <button
                key={social}
                type="button"
                aria-label={social}
                onClick={() => go(social)}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {social}
              </button>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
