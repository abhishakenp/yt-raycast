import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { ResponsiveGrid } from '#/section-kit/ResponsiveGrid.tsx'
import { ImageTile } from '#/section-kit/ImageTile.tsx'
import { StorySection } from '#/section-kit/StorySection.tsx'
import { PullQuoteText } from '#/section-kit/PullQuote.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'

/**
 * CrowdfundingStory — a playful-bold founder STORY chapter for a crowdfunding
 * / campaign landing page. A muted wash band cutting in on a slanted clip-path
 * seam under a giant ghost "01" watermark: a mono metadata rail (eyebrow —
 * hairline rule — "CH. 01") above a left-aligned extrabold tight-tracked
 * heading and intro, then a two-up story grid whose photo plates sit in sharp
 * 2px-bordered tiles tilted ±1° with the second block staggered downward. An
 * asymmetric 5:7 split follows: the founder pull-quote (giant ghost serif
 * quotation mark, italic serif text, rotated mono attribution sticker) beside
 * a hard-bordered "problem" panel holding a collapsed-border ledger of giant
 * destructive-toned tabular numerals with mono captions. The solution heading
 * + paragraphs close the chapter with an oversized drop cap. Imagery uses the
 * alt-driven Image component. Use to tell the origin / mission narrative on a
 * product launch, fundraiser, maker project, or any campaign page that needs a
 * problem-and-solution story with supporting stats and a founder quote.
 */
export const CrowdfundingStory = defineCapsule({
  name: 'CrowdfundingStory',
  description:
    "A playful-bold founder STORY chapter for a crowdfunding / campaign landing page: a muted wash band cutting in on a slanted clip-path seam under a giant ghost '01' watermark, with a mono metadata rail ('CH. 01'), a left-aligned extrabold heading + intro, a two-up story grid of ±1°-tilted 2px-bordered photo plates (second block staggered downward), then an asymmetric 5:7 split of the founder pull-quote (ghost serif quotation mark, italic serif text, rotated mono attribution sticker) beside a hard-bordered 'problem' panel with a collapsed-border ledger of giant destructive-toned tabular numerals and mono captions, closing with the solution heading + drop-cap paragraphs. Imagery uses the alt-driven Image component. Use to tell the origin / mission narrative on a product launch, fundraiser, maker project, or any campaign page that needs a problem-and-solution story with supporting stats and a founder quote.",
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
      <StorySection
        className={cn(
          'relative overflow-hidden bg-muted/40 py-16 pt-24 [clip-path:polygon(0_2.5rem,100%_0,100%_100%,0_100%)] sm:py-20 sm:pt-28 lg:py-28 lg:pt-36',
          props.className,
        )}
      >
        <Watermark className="-left-6 bottom-0 text-[9rem] sm:text-[14rem] lg:text-[20rem]">
          01
        </Watermark>
        <Container className="relative">
          {/* Mono metadata rail */}
          <div className="flex items-center gap-4">
            <MonoTag tone="primary">{storyEyebrow}</MonoTag>
            <span aria-hidden="true" className="h-px flex-1 bg-border" />
            <MonoTag aria-hidden="true">Ch. 01</MonoTag>
          </div>

          <SectionHeading
            title={storyHeading}
            subtitle={storyIntro}
            align="left"
            titleClassName="text-4xl font-extrabold leading-[0.98] tracking-tighter sm:text-5xl"
            subtitleClassName="max-w-2xl text-lg"
            className="mt-6 mb-12 gap-4 sm:mb-16"
          />

          <ResponsiveGrid cols="1-md-2" className="mb-14 gap-x-10 gap-y-12">
            {storyBlocks.map((block, i) => (
              <div
                key={block.imageAlt}
                className={cn(i % 2 === 1 && 'md:translate-y-10')}
              >
                <div
                  className={cn(
                    'relative mb-5',
                    i % 2 === 0 ? '-rotate-1' : 'rotate-1',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 translate-x-2.5 translate-y-2.5 border-2 border-primary/25 bg-primary/5"
                  />
                  <ImageTile
                    treatment="4-3-xl"
                    className="relative rounded-none border-2 border-foreground/70"
                  >
                    <Image
                      alt={block.imageAlt}
                      w={800}
                      h={600}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </ImageTile>
                </div>
                <p className="leading-relaxed text-muted-foreground">
                  {block.body}
                </p>
              </div>
            ))}
          </ResponsiveGrid>

          {/* Asymmetric 5:7 split — quote beside the problem ledger */}
          <div className="mb-14 grid items-start gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="relative lg:col-span-5">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -top-8 left-0 select-none font-serif text-[7rem] leading-none text-primary/15"
              >
                &ldquo;
              </span>
              <PullQuoteText className="relative block font-serif text-2xl font-medium italic leading-[1.2] tracking-tight text-foreground sm:text-3xl">
                &ldquo;{storyQuote}&rdquo;
              </PullQuoteText>
              <footer className="mt-5 flex">
                <span className="inline-flex -rotate-1 rounded-full border-2 border-foreground/60 bg-background px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-foreground shadow-[2px_2px_0_0] shadow-foreground/15">
                  — {storyQuoteAuthor}
                </span>
              </footer>
            </div>

            <div className="border-2 border-foreground bg-card p-6 sm:p-8 lg:col-span-7">
              <h3 className="mb-6 text-2xl font-extrabold tracking-tight">
                {problemHeading}
              </h3>
              <div className="grid grid-cols-1 gap-0 border-l-2 border-t-2 border-foreground/15 sm:grid-cols-3">
                {problemStats.map((s) => (
                  <div
                    key={s.label}
                    className="border-b-2 border-r-2 border-foreground/15 p-4 sm:p-5"
                  >
                    <div className="mb-2 text-4xl font-extrabold tracking-tight text-destructive tabular-nums">
                      {s.value}
                    </div>
                    <p className="font-mono text-[11px] uppercase leading-relaxed tracking-[0.1em] text-muted-foreground">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="max-w-3xl lg:ml-auto lg:mr-0">
            <h3 className="mb-5 text-2xl font-extrabold tracking-tight">
              {solutionHeading}
            </h3>
            {solutionParagraphs.map((p, i) => (
              <p
                key={i}
                className={cn(
                  'mb-6 leading-relaxed text-muted-foreground',
                  i === 0 &&
                    'first-letter:float-left first-letter:mr-3 first-letter:text-6xl first-letter:font-extrabold first-letter:leading-[0.8] first-letter:tracking-tight first-letter:text-foreground',
                )}
              >
                {p}
              </p>
            ))}
          </div>
        </Container>
      </StorySection>
    )
  },
})
