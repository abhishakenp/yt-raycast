import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

/**
 * CrowdfundingStory — a long-form founder STORY section for a crowdfunding /
 * campaign landing page. On a muted band: a centered eyebrow + heading + intro,
 * a two-up grid of image-over-paragraph story blocks, a primary-bordered
 * pull-quote with attribution, a raised card panel holding a "problem" heading
 * over a three-up stat trio (big destructive-toned numbers + captions), and a
 * "solution" heading followed by body paragraphs. Imagery uses the alt-driven
 * Image component. Use to tell the origin / mission narrative on a product
 * launch, fundraiser, maker project, or any campaign page that needs a
 * problem-and-solution story with supporting stats and a founder quote.
 */
export const CrowdfundingStory = defineComponent({
  name: 'CrowdfundingStory',
  description:
    "A long-form founder STORY section for a crowdfunding / campaign landing page on a muted band: a centered eyebrow + heading + intro, a two-up grid of image-over-paragraph story blocks, a primary-bordered pull-quote with attribution, a raised card panel holding a 'problem' heading over a three-up stat trio (big destructive-toned numbers + captions), and a 'solution' heading followed by body paragraphs. Imagery uses the alt-driven Image component. Use to tell the origin / mission narrative on a product launch, fundraiser, maker project, or any campaign page that needs a problem-and-solution story with supporting stats and a founder quote.",
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    intro: z.string().optional(),
    blocks: z
      .array(z.object({ imageAlt: z.string(), body: z.string() }))
      .optional(),
    quote: z.string().optional(),
    quoteAuthor: z.string().optional(),
    problemHeading: z.string().optional(),
    problemStats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    solutionHeading: z.string().optional(),
    solutionParagraphs: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const storyEyebrow = props.eyebrow ?? 'Our Story'
    const storyHeading = props.heading ?? 'Why We Created EcoBrush'
    const storyIntro =
      props.intro ??
      'Every year, 4.7 billion plastic toothbrushes end up in landfills and oceans. We knew there had to be a better way.'
    const storyBlocks = props.blocks?.length
      ? props.blocks
      : [
          {
            imageAlt:
              'Team of designers working at wooden desk reviewing bamboo material samples',
            body: 'It started with a simple question: Why does every electric toothbrush on the market have a plastic body that will outlive us by 500 years? Dr. Sarah Chen, a dental researcher, and Marcus Okafor, a sustainable materials engineer, met at a conference in Copenhagen in 2022 and discovered they had been asking themselves the same question.',
          },
          {
            imageAlt:
              'Dense bamboo forest with morning sunlight filtering through tall green stalks',
            body: 'After two years of research and 47 prototype iterations, we developed a proprietary bamboo composite that is 98% biodegradable, naturally antimicrobial, and durable enough for daily use. Our Moso bamboo is sourced from FSC-certified forests in Zhejiang Province, China, and every handle is hand-finished by skilled craftspeople.',
          },
        ]
    const storyQuote =
      props.quote ??
      "We didn't want to compromise on performance. EcoBrush had to clean as well as the best electric brushes on the market—while leaving zero trace when its job is done."
    const storyQuoteAuthor =
      props.quoteAuthor ?? 'Dr. Sarah Chen, Co-founder & Chief Dental Officer'
    const problemHeading = props.problemHeading ?? "The Problem We're Solving"
    const problemStats = props.problemStats?.length
      ? props.problemStats
      : [
          {
            value: '4.7B',
            label: 'Plastic toothbrushes discarded annually worldwide',
          },
          { value: '500', label: 'Years for a plastic brush to decompose' },
          {
            value: '50M',
            label: 'Pounds of toothbrush waste added to oceans each year',
          },
        ]
    const solutionHeading = props.solutionHeading ?? 'Our Solution'
    const solutionParagraphs = props.solutionParagraphs?.length
      ? props.solutionParagraphs
      : [
          'EcoBrush combines sustainable materials with premium engineering. The handle is crafted from compressed bamboo fibers bonded with a plant-based resin. At the end of its life, you simply separate the small metal motor assembly (which we take back for recycling through our Take-Back Program) and compost the bamboo body. It returns to the earth in 4-6 months, not centuries.',
          'The sonic motor delivers 40,000 vibrations per minute—matching the performance of premium plastic alternatives. Three smart modes (Clean, Whiten, Sensitive) adapt to your needs, and the 30-day battery life means less charging, less energy consumption.',
        ]

    return (
      <section className={cn('bg-muted py-20 lg:py-28', props.className)}>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <span className="text-sm font-medium uppercase tracking-wider text-primary">
              {storyEyebrow}
            </span>
            <h2 className="mb-4 mt-3 text-3xl font-semibold sm:text-4xl">
              {storyHeading}
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              {storyIntro}
            </p>
          </div>

          <div className="mb-12 grid gap-8 md:grid-cols-2">
            {storyBlocks.map((block) => (
              <div key={block.imageAlt}>
                <Image
                  alt={block.imageAlt}
                  w={800}
                  h={600}
                  loading="lazy"
                  className="mb-4 w-full rounded-xl object-cover"
                />
                <p className="leading-relaxed text-muted-foreground">
                  {block.body}
                </p>
              </div>
            ))}
          </div>

          <blockquote className="my-12 border-l-4 border-primary py-2 pl-6 text-xl italic text-foreground/80">
            &ldquo;{storyQuote}&rdquo;
            <footer className="mt-2 text-sm not-italic text-muted-foreground">
              — {storyQuoteAuthor}
            </footer>
          </blockquote>

          <div className="mb-12 rounded-xl bg-card p-8 shadow-sm">
            <h3 className="mb-6 text-2xl font-semibold">{problemHeading}</h3>
            <div className="grid gap-6 sm:grid-cols-3">
              {problemStats.map((s) => (
                <div key={s.label} className="p-4 text-center">
                  <div className="mb-2 text-4xl font-bold text-destructive">
                    {s.value}
                  </div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <h3 className="mb-4 text-2xl font-semibold">{solutionHeading}</h3>
          {solutionParagraphs.map((p, i) => (
            <p key={i} className="mb-6 leading-relaxed text-muted-foreground">
              {p}
            </p>
          ))}
        </div>
      </section>
    )
  },
})
