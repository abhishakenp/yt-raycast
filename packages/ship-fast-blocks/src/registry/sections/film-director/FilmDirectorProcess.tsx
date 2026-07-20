import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

/**
 * FilmDirectorProcess — a split, cinematic "how we work" process / about band for
 * a film director or cinematographer. An asymmetric 7:5 layout with a left text
 * column (mono slate rail with eyebrow, a giant credits-style extrabold heading,
 * muted intro, then a vertical list of square mono "SC. 0X" slate badges paired
 * with an extrabold step title + description) beside a letterboxed tall 3:4 photo
 * (thin bg-foreground bars, a RUNTIME timecode) with a floating overlapping client
 * pull-quote card (square, hard offset shadow, italic quote + mono attribution)
 * anchored at its lower-left on desktop. Imagery uses the alt-driven Image
 * component; tokens-only and theme-adaptive. Use to explain a collaborative
 * production workflow for filmmakers, directors, DPs, or video production houses.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { ProcessTimeline } from '#/section-kit/ProcessTimeline.tsx'
export const FilmDirectorProcess = defineCapsule({
  name: 'FilmDirectorProcess',
  description:
    "Split, cinematic 'how we work' process / about band for a film director or cinematographer: an asymmetric 7:5 layout with a left text column (mono slate rail with eyebrow, a giant credits-style extrabold heading, muted intro, then a vertical list of square mono 'SC. 0X' slate badges paired with an extrabold step title + description) beside a letterboxed tall 3:4 photo (thin bg-foreground bars, RUNTIME timecode) with a floating overlapping client pull-quote card (square, hard offset shadow, italic quote + mono attribution) anchored at its lower-left on desktop. Imagery uses the Image component; tokens-only and theme-adaptive. Use to explain a collaborative production workflow for filmmakers, directors, DPs, or video production houses.",
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
      <ProcessTimeline
        className={cn('pt-28 pb-20 lg:pt-32 lg:pb-28', props.className)}
      >
        <Container>
          <div className="grid items-center gap-16 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <SectionHeading
                align="left"
                eyebrow={processEyebrow}
                title={processHeading}
                subtitle={processDesc}
                className="mb-12 gap-0"
                eyebrowClassName="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
                titleClassName="mb-6 text-4xl font-extrabold tracking-tight md:text-5xl"
                subtitleClassName="leading-relaxed text-muted-foreground"
              />
              <div className="space-y-8">
                {processSteps.map((step, i) => (
                  <div key={step.title} className="flex gap-6">
                    <div className="grid size-12 shrink-0 place-items-center rounded-none border border-foreground/20 bg-background font-mono text-sm font-semibold tabular-nums">
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <div>
                      <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                        SC. {String(i + 1).padStart(2, '0')}
                      </span>
                      <h3 className="mb-2 mt-1 text-lg font-extrabold tracking-tight">
                        {step.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative lg:col-span-5">
              <div className="relative bg-foreground py-4">
                <span className="absolute bottom-6 right-3 z-10 font-mono text-[11px] uppercase tracking-[0.2em] text-background/70">
                  Runtime 04:52
                </span>
                <div className="aspect-[3/4] overflow-hidden">
                  <Image
                    alt={processImageAlt}
                    w={800}
                    h={1066}
                    loading="lazy"
                    className="size-full object-cover"
                  />
                </div>
              </div>
              <div className="absolute -bottom-8 -left-8 hidden max-w-xs rounded-none border border-border bg-card p-6 text-card-foreground shadow-[6px_6px_0_0] shadow-foreground md:block">
                <p className="mb-3 font-serif text-base italic leading-snug text-foreground">
                  &ldquo;{processQuote}&rdquo;
                </p>
                <p className="text-sm font-extrabold tracking-tight">
                  {processQuoteName}
                </p>
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  {processQuoteRole}
                </p>
              </div>
            </div>
          </div>
        </Container>
      </ProcessTimeline>
    )
  },
})
