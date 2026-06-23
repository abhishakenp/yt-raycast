import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { Image } from "#/lib/img.tsx"
import { SectionHeading } from "#/section-kit/SectionHeading.tsx"

/**
 * WriterAuthorAbout — a two-column "About" band for a literary author site.
 * A black-and-white portrait sits beside a left-aligned SectionHeading
 * (uppercase "About" eyebrow over a serif title) and a stack of generous,
 * serif prose paragraphs telling the author's story. The columns stack on
 * small screens and sit side by side, vertically centered, on large ones.
 * Designed for novelists, essayists, and memoirists who want a calm, reading
 * biography section. Renders fully with no props via baked-in copy for the
 * novelist Eleanor Vance.
 */
export const WriterAuthorAbout = defineComponent({
  name: "WriterAuthorAbout",
  description:
    "A two-column 'About' band for a literary author website: a black-and-white author portrait beside a left-aligned SectionHeading (uppercase 'About' eyebrow over a serif title) and a stack of generous serif prose paragraphs telling the author's story. Columns stack on small screens and sit side by side, vertically centered, on large screens. Built for novelists, essayists, and memoirists who want a calm, reading biography section. Renders fully with no props via baked-in copy for the novelist Eleanor Vance.",
  props: z.object({
    /** Uppercase eyebrow above the title. */
    eyebrow: z.string().optional(),
    /** Serif title in the heading block. */
    heading: z.string().optional(),
    /** Biography paragraphs rendered as serif prose. */
    paragraphs: z.array(z.string()).optional(),
    /** Alt text driving the portrait image. */
    portraitAlt: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const paragraphs =
      props.paragraphs ?? [
        "Eleanor Vance is a novelist whose work moves quietly between coastlines, old houses, and the unspoken histories that bind families together. Over the past decade she has published five novels, each preoccupied with memory, inheritance, and the small acts of tenderness that survive long silences.",
        "Born in a fishing town on the northern coast, she trained as a cartographer before turning to fiction, and the discipline of mapping still shapes her prose: precise, patient, and attentive to the contours of a place. Her novels have been translated into a dozen languages and shortlisted for several international literary prizes.",
        "She writes from a converted lighthouse keeper's cottage, where the same grey light that fills her stories spills across her desk each morning. When she is not writing, she teaches, walks the cliffs, and answers far too few of the letters readers send her.",
      ]

    return (
      <section className={cn("bg-background py-20 sm:py-24", props.className)}>
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-2 lg:items-center lg:px-8">
          <Image
            alt={props.portraitAlt ?? "author portrait black and white"}
            w={640}
            h={800}
            className="w-full rounded-2xl border border-border object-cover"
          />

          <div>
            <SectionHeading
              align="left"
              eyebrow={props.eyebrow ?? "About"}
              title={props.heading ?? "On writing and a life of letters"}
            />
            <div className="mt-6 space-y-4">
              {paragraphs.map((paragraph, i) => (
                <p
                  key={i}
                  className="font-serif text-lg leading-relaxed text-muted-foreground"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  },
})
