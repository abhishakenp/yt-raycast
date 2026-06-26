import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

/**
 * NoCodeSteps — centered-header 3-step "how it works" flow on a subtle muted
 * band. A muted eyebrow, heading, and paragraph sit above a 1-to-3 column grid
 * of numbered steps: each has a large inverse rounded number badge, a card with
 * a 16:9 image, a centered title, and a description, plus a connecting dotted
 * line between steps on desktop. Use as the "from idea to live" / onboarding
 * flow on a no-code builder, SaaS, or product landing page. Renders fully with
 * no props.
 */
export const NoCodeSteps = defineComponent({
  name: 'NoCodeSteps',
  description:
    "Centered-header 3-step 'how it works' flow on a subtle muted band: a muted eyebrow, heading, and paragraph above a 1-to-3 column grid of numbered steps, each with a large inverse rounded number badge, a card holding a 16:9 image, a centered title, and a description, plus a connecting dotted line between steps on desktop. Use as the 'from idea to live' / onboarding flow on a no-code / app-builder SaaS or product landing page.",
  props: z.object({
    /** Muted uppercase eyebrow above the heading. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
    /** Step cards (title + description + image alt). */
    items: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
          imageAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'How It Works'
    const heading = props.heading ?? 'From idea to live app in 3 simple steps'
    const description =
      props.description ??
      'No coding required. No setup headaches. Just pure creation.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Choose a Template',
            description:
              'Browse 200+ professionally designed templates. Filter by category, style, or industry to find your perfect starting point.',
            imageAlt: 'Designer browsing template gallery on laptop screen',
          },
          {
            title: 'Customize Everything',
            description:
              'Drag, drop, and edit with our visual builder. Change colors, fonts, images, and content to match your brand perfectly.',
            imageAlt:
              'Person customizing app interface with drag and drop editor',
          },
          {
            title: 'Publish & Grow',
            description:
              'Hit publish and your app goes live instantly. Get a custom domain, analytics, and scale as your audience grows.',
            imageAlt:
              'Live analytics dashboard showing app performance metrics',
          },
        ]

    return (
      <section
        className={cn('bg-muted/40 py-24', props.className)}
        aria-labelledby="nc-steps"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <span className="mb-3 inline-block text-sm font-medium uppercase tracking-wider text-muted-foreground">
              {eyebrow}
            </span>
            <h2
              id="nc-steps"
              className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl"
            >
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
            {items.map((step, i) => (
              <div key={step.title} className="relative">
                <div className="mx-auto mb-6 grid size-16 place-items-center rounded-2xl bg-foreground text-2xl font-bold text-background">
                  {i + 1}
                </div>
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <div className="mb-4 aspect-video overflow-hidden rounded-xl bg-muted">
                    <Image
                      alt={step.imageAlt}
                      w={600}
                      h={340}
                      loading="lazy"
                      className="size-full object-cover"
                    />
                  </div>
                  <h3 className="mb-2 text-center text-lg font-semibold text-card-foreground">
                    {step.title}
                  </h3>
                  <p className="text-center text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
                {i < items.length - 1 && (
                  <div
                    aria-hidden="true"
                    className="absolute left-full top-8 hidden h-0.5 w-full -translate-x-8 bg-border md:block"
                  >
                    <div className="absolute -top-1.5 right-0 size-3 rounded-full bg-border" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
