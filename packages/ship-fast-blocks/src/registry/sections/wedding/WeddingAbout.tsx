import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { Card } from '#/section-kit/Card.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import { AboutSection, AboutGrid } from '#/section-kit/AboutSection.tsx'
import { StepItem, StepContent } from '#/section-kit/StepTimeline.tsx'

export const WeddingAbout = defineCapsule({
  name: 'WeddingAbout',
  description:
    'Romantic-editorial "Our Story" band for a wedding site on a soft muted wash with a slanted top seam and a giant ghost ampersand watermark: a mono metadata rail (primary diamond + eyebrow, hairline rule, mono index) above a serif-italic heading and a short serif lede, then an asymmetric 5:7 editorial grid pairing a tall alt-driven engagement photograph in a hairline double-framed plate tilted slightly with a vertical mono side label on the left, and a hairline how-we-met timeline of milestone rows (first meeting, first date, the proposal) with mono dates and serif titles on the right. Use to tell the couple\'s love story on a wedding invitation or celebration page.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    intro: z.string().optional(),
    imageAlt: z.string().optional(),
    timeline: z
      .array(
        z.object({
          date: z.string(),
          title: z.string(),
          description: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Our Story'
    const heading = props.heading ?? 'How we met'
    const intro =
      props.intro ??
      'From a rainy afternoon in a quiet bookshop to a sunrise proposal on the coast, our story has been written in small, perfect moments. Here is how it all began.'
    const imageAlt =
      props.imageAlt ??
      'couple holding hands walking through an autumn park, candid engagement photo with warm light'
    const timeline = props.timeline?.length
      ? props.timeline
      : [
          {
            date: 'Spring 2019',
            title: 'Where it began',
            description:
              'We reached for the same novel in a tiny corner bookshop and ended up talking until closing time.',
          },
          {
            date: 'Summer 2019',
            title: 'Our first date',
            description:
              'A candlelit dinner that turned into a midnight walk along the harbor — neither of us wanted the night to end.',
          },
          {
            date: 'Winter 2023',
            title: 'The proposal',
            description:
              "At sunrise by the sea, with the words we'd both been waiting to hear, we said yes to forever.",
          },
        ]

    return (
      <AboutSection
        className={cn(
          'relative overflow-hidden bg-muted/30 py-16 pt-24 text-foreground [clip-path:polygon(0_2.5rem,100%_0,100%_100%,0_100%)] sm:py-20 sm:pt-28 lg:py-28 lg:pt-36',
          props.className,
        )}
      >
        <Watermark className="-bottom-16 -right-6 font-serif text-[12rem] font-normal italic leading-none sm:text-[18rem] lg:text-[22rem]">
          &amp;
        </Watermark>

        <Container size="xl" className="relative px-6">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-2.5">
              <span
                aria-hidden="true"
                className="size-1.5 rotate-45 bg-primary"
              />
              <MonoTag>{eyebrow}</MonoTag>
            </span>
            <span aria-hidden="true" className="h-px flex-1 bg-border" />
            <MonoTag aria-hidden="true" tone="faint">
              The Beginning
            </MonoTag>
          </div>

          <div className="mt-8 max-w-2xl">
            <h2 className="font-serif text-4xl font-normal italic leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              {heading}
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              {intro}
            </p>
          </div>

          <AboutGrid className="mt-12 items-start gap-10 sm:mt-16 md:grid-cols-12 lg:grid-cols-12 lg:gap-14">
            <div className="relative -mx-1 -rotate-1 sm:mx-0 md:col-span-5">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-3 border border-border sm:-inset-4"
              />
              <Card
                variant="default"
                className="relative overflow-hidden rounded-none border-border p-0 shadow-none"
              >
                <Image
                  alt={imageAlt}
                  w={800}
                  h={1000}
                  loading="lazy"
                  className="aspect-[4/5] w-full object-cover"
                />
              </Card>
              <span
                aria-hidden="true"
                className="absolute -left-3 top-6 hidden bg-muted/30 px-1 py-2 font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground [writing-mode:vertical-rl] sm:block"
              >
                Us
              </span>
            </div>

            <ol className="relative ml-1 border-l border-border pl-8 md:col-span-7">
              {timeline.map((item, i) => (
                <StepItem
                  key={`${item.title}-${i}`}
                  className="relative pb-10 last:pb-0"
                >
                  <span
                    className="absolute -left-[2.15rem] top-1.5 size-2.5 rotate-45 border border-background bg-primary"
                    aria-hidden="true"
                  />
                  <StepContent className="mt-0 gap-0">
                    <MonoTag tone="primary" className="tracking-[0.18em]">
                      {item.date}
                    </MonoTag>
                    <h3 className="mt-2 font-serif text-2xl font-normal italic text-foreground">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-base leading-7 text-muted-foreground">
                      {item.description}
                    </p>
                  </StepContent>
                </StepItem>
              ))}
            </ol>
          </AboutGrid>
        </Container>
      </AboutSection>
    )
  },
})
