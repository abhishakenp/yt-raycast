import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * MentalHealthHero — a split, two-column hero for a therapy / counseling
 * practice. On the left a large two-line headline (second line in the primary
 * accent color), a reassuring sub-paragraph, dual rounded CTAs (filled primary +
 * outline), and a row of licensed-clinician trust checks; on the right a calming
 * therapy-office photo with a floating "Next Available" appointment card. Sits on
 * a soft primary-tinted gradient canvas. Calm, warm, sage-and-sand wellness
 * aesthetic. CTAs route through useNavigate. Use as the top hero for therapists,
 * counselors, psychologists, wellness centers, or telehealth practices.
 */
export const MentalHealthHero = defineComponent({
  name: "MentalHealthHero",
  description:
    "Split, two-column hero for a therapy / counseling practice: a large two-line headline (second line in the primary accent color), a reassuring sub-paragraph, dual rounded CTAs (filled primary + outline), and a row of licensed-clinician trust checks on the left; a calming therapy-office photo with a floating 'Next Available' appointment card on the right. Sits on a soft primary-tinted gradient canvas with a calm, warm, sage-and-sand wellness aesthetic. CTAs route through useNavigate. Use as the top hero for therapists, counselors, psychologists, wellness centers, or telehealth practices.",
  props: z.object({
    headingTop: z.string().optional(),
    /** Phrase rendered in the primary accent color (second headline line). */
    highlight: z.string().optional(),
    subheading: z.string().optional(),
    primaryCta: z.string().optional(),
    secondaryCta: z.string().optional(),
    imageAlt: z.string().optional(),
    cardTitle: z.string().optional(),
    cardSubtitle: z.string().optional(),
    trust: z.array(z.string()).optional(),
    /** Navigation target for the primary CTA (e.g. "Book Session"). */
    bookLabel: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const headingTop = props.headingTop ?? "Find your calm."
    const highlight = props.highlight ?? "Begin healing."
    const subheading =
      props.subheading ??
      "Professional therapy services in Portland's Pearl District. Licensed clinicians providing evidence-based care for anxiety, depression, relationships, and life transitions. Most insurance accepted."
    const primaryCta = props.primaryCta ?? "Schedule a Session"
    const secondaryCta = props.secondaryCta ?? "Explore Services"
    const imageAlt =
      props.imageAlt ??
      "Serene therapy office with comfortable seating, soft natural lighting, and calming neutral decor"
    const cardTitle = props.cardTitle ?? "Next Available"
    const cardSubtitle = props.cardSubtitle ?? "Tomorrow, 10:00 AM"
    const trust = props.trust?.length
      ? props.trust
      : ["Licensed Clinicians", "In-Person & Virtual"]
    const bookLabel = props.bookLabel ?? "Book Session"

    const Check = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M5 13l4 4L19 7"
        />
      </svg>
    )

    return (
      <section
        className={cn(
          "relative overflow-hidden py-20 lg:py-28",
          props.className,
        )}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-muted"
        />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                {headingTop}
                <br />
                <span className="text-primary">{highlight}</span>
              </h1>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground lg:mx-0">
                {subheading}
              </p>
              <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
                <button
                  type="button"
                  onClick={() => go(bookLabel)}
                  className="rounded-full bg-primary px-8 py-4 text-center font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90"
                >
                  {primaryCta}
                </button>
                <button
                  type="button"
                  onClick={() => go(secondaryCta)}
                  className="rounded-full border border-border bg-background px-8 py-4 text-center font-medium text-foreground transition-colors hover:bg-accent"
                >
                  {secondaryCta}
                </button>
              </div>
              <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground lg:justify-start">
                {trust.map((t) => (
                  <div key={t} className="flex items-center gap-2">
                    <Check className="size-5 text-primary" />
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <Image
                alt={imageAlt}
                w={800}
                h={600}
                loading="eager"
                className="h-[400px] w-full rounded-2xl object-cover shadow-2xl lg:h-[500px]"
              />
              <div className="absolute -bottom-6 -left-6 max-w-[200px] rounded-xl bg-card p-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-full bg-primary/10">
                    <svg
                      className="size-5 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-card-foreground">
                      {cardTitle}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {cardSubtitle}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  },
})
