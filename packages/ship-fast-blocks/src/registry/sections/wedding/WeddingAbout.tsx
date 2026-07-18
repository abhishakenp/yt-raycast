import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { Card } from '#/section-kit/Card.tsx'
import { SplitStory, SplitStoryGrid } from '#/section-kit/SplitStory.tsx'

export const WeddingAbout = defineCapsule({
  name: 'WeddingAbout',
  description:
    'Romantic "Our Story" band for a wedding site: a tall alt-driven engagement photograph paired with a vertical how-we-met timeline (first meeting, first date, the proposal) rendered as accented milestone rows, plus a short serif prose paragraph. Use to tell the couple\'s love story on a wedding invitation or celebration page.',
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
      <SplitStory
        className={cn(
          'bg-background py-20 text-foreground lg:py-28',
          props.className,
        )}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeading
            eyebrow={eyebrow}
            title={heading}
            subtitle={intro}
            titleClassName="font-serif"
          />

          <SplitStoryGrid className="mt-16 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="relative">
              <div
                className="absolute -inset-4 rounded-3xl bg-primary/10 blur-2xl"
                aria-hidden="true"
              />
              <Card
                variant="default"
                rounded="2xl"
                padding="none"
                className="relative overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.12)]"
              >
                <Image
                  alt={imageAlt}
                  w={800}
                  h={900}
                  loading="lazy"
                  className="aspect-[4/5] w-full object-cover"
                />
              </Card>
            </div>

            <ol className="relative ml-2 border-l border-border pl-8">
              {timeline.map((item, i) => (
                <li
                  key={`${item.title}-${i}`}
                  className="relative pb-10 last:pb-0"
                >
                  <span
                    className="absolute -left-[2.1rem] top-1 size-3 rounded-full border-2 border-background bg-primary"
                    aria-hidden="true"
                  />
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">
                    {item.date}
                  </p>
                  <h3 className="mt-1 font-serif text-xl font-medium text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-base leading-7 text-muted-foreground">
                    {item.description}
                  </p>
                </li>
              ))}
            </ol>
          </SplitStoryGrid>
        </div>
      </SplitStory>
    )
  },
})
