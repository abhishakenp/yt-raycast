import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

/**
 * FilmDirectorProcess — a split, numbered "how we work" process / about band for
 * a film director or cinematographer. A two-column layout with a left text
 * column (uppercase tracked eyebrow, thin heading, muted intro, then a vertical
 * list of numbered circular badges paired with step title + description) beside
 * a tall 3:4 photo with a floating overlapping client pull-quote card (italic
 * quote + attribution) anchored at its lower-left on desktop. Imagery uses the
 * alt-driven Image component. Use to explain a collaborative production workflow
 * for filmmakers, directors, DPs, or video production houses.
 */
import { Container } from '#/section-kit/Container.tsx'
export const FilmDirectorProcess = defineCapsule({
  name: 'FilmDirectorProcess',
  description:
    "Split, numbered 'how we work' process / about band for a film director or cinematographer: a two-column layout with a left text column (uppercase tracked eyebrow, thin heading, muted intro, then a vertical list of numbered circular badges paired with step title + description) beside a tall 3:4 photo with a floating overlapping client pull-quote card (italic quote + attribution) anchored at its lower-left on desktop. Imagery uses the Image component. Use to explain a collaborative production workflow for filmmakers, directors, DPs, or video production houses.",
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    description: z.string().optional(),
    imageAlt: z.string().optional(),
    steps: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
        }),
      )
      .optional(),
    quote: z.string().optional(),
    quoteName: z.string().optional(),
    quoteRole: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const processEyebrow = props.eyebrow ?? 'The Process'
    const processHeading = props.heading ?? 'How we work together'
    const processDesc =
      props.description ??
      'Every project begins with understanding your vision and ends with delivering a film that exceeds expectations. My process is collaborative, transparent, and designed to bring out the best in every story.'
    const processImageAlt =
      props.imageAlt ??
      'film director reviewing footage on a professional monitor in a color grading suite with calibrated displays and dim ambient lighting'
    const processSteps = props.steps?.length
      ? props.steps
      : [
          {
            title: 'Discovery & Concept',
            description:
              "We start with deep conversations about your goals, audience, and vision. I develop creative treatments and storyboards that capture the essence of what we're building.",
          },
          {
            title: 'Pre-Production',
            description:
              'Casting, location scouting, shot lists, and schedules. Every detail is planned to ensure a smooth production day and the highest quality footage.',
          },
          {
            title: 'Production',
            description:
              'On set, I focus on capturing authentic performances and stunning visuals. My approach balances creative spontaneity with meticulous technical execution.',
          },
          {
            title: 'Post-Production',
            description:
              'Editing, color grading, sound design, and final delivery. I work with top-tier post houses and colorists to ensure your film looks and sounds its best.',
          },
        ]
    const processQuote =
      props.quote ??
      'Marcus has an incredible eye for detail and a gift for bringing out authentic performances.'
    const processQuoteName = props.quoteName ?? 'Sarah Mitchell'
    const processQuoteRole = props.quoteRole ?? 'Creative Director, Nike Global'
    return (
      <section className={cn('py-20 md:py-32', props.className)}>
        <Container>
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div>
              <p className="mb-4 text-sm uppercase tracking-widest text-muted-foreground">
                {processEyebrow}
              </p>
              <h2 className="mb-6 text-3xl font-light md:text-4xl">
                {processHeading}
              </h2>
              <p className="mb-12 leading-relaxed text-muted-foreground">
                {processDesc}
              </p>
              <div className="space-y-8">
                {processSteps.map((step, i) => (
                  <div key={step.title} className="flex gap-6">
                    <div className="grid size-12 shrink-0 place-items-center rounded-full bg-muted text-lg font-medium">
                      {i + 1}
                    </div>
                    <div>
                      <h3 className="mb-2 text-lg font-medium">{step.title}</h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[3/4] overflow-hidden rounded-md bg-muted">
                <Image
                  alt={processImageAlt}
                  w={800}
                  h={1066}
                  loading="lazy"
                  className="size-full object-cover"
                />
              </div>
              <div className="absolute -bottom-8 -left-8 hidden max-w-xs rounded-md bg-card p-6 text-card-foreground shadow-lg md:block">
                <p className="mb-3 text-sm italic text-muted-foreground">
                  &ldquo;{processQuote}&rdquo;
                </p>
                <p className="text-sm font-medium">{processQuoteName}</p>
                <p className="text-xs text-muted-foreground">
                  {processQuoteRole}
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>
    )
  },
})
