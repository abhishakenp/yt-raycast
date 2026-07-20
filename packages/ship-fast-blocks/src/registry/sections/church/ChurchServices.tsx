import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import {
  ServiceCard,
  ServiceIcon,
  ServiceTitle,
  ServiceDescription,
} from '#/section-kit/ServicesGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'

/**
 * ChurchServices — serene editorial weekly-gatherings section for a church or
 * faith-community site, set on a softly slanted muted wash (gentle clip-path
 * top seam) with a giant ghost serif "9 & 11" watermark. An asymmetric 7:5
 * grid: the left column opens with a mono metadata rail (eyebrow — hairline
 * rule — "wk / order of service"), a large serif heading, and a hairline-ruled
 * description, then lists each gathering as a quiet ledger row — hairline top
 * rule, faint serif index numeral, serif title, detail line, and a mono
 * location micro-label. The right column holds a sticky 3:4 photo plate in a
 * hairline frame over an offset hairline outline with a vertical mono edition
 * label, and beneath it a sharp hairline "What to Expect" card whose checklist
 * uses small primary star ticks. Use as the service-times / weekly-gatherings
 * section for churches, worship centers, parishes, or ministries. Renders
 * fully with no props via baked-in defaults.
 */
export const ChurchServices = defineCapsule({
  name: 'ChurchServices',
  description:
    "Serene editorial weekly-gatherings section for a church or faith-community site on a softly slanted muted wash (gentle clip-path top seam) with a giant ghost serif '9 & 11' watermark. Asymmetric 7:5 grid: left column with a mono metadata rail, large serif heading, hairline-ruled description, and gatherings listed as quiet ledger rows (hairline top rule, faint serif index numeral, serif title, detail line, mono location micro-label); right column with a sticky 3:4 photo plate in a hairline frame over an offset hairline outline plus a vertical mono edition label, and a sharp hairline 'What to Expect' checklist card with small primary star ticks beneath. Use as the service-times / weekly-gatherings section for churches, worship centers, parishes, or ministries.",
  props: z.object({
    /** Small uppercase eyebrow above the heading. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Paragraph under the heading. */
    description: z.string().optional(),
    /** Service cards; each has a title, detail line, and location. */
    items: z
      .array(
        z.object({
          title: z.string(),
          detail: z.string(),
          location: z.string(),
        }),
      )
      .optional(),
    /** Alt text for the right-side sticky image. */
    imageAlt: z.string().optional(),
    /** Title of the expectations checklist card. */
    expectTitle: z.string().optional(),
    /** Bullet items in the expectations checklist. */
    expect: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Weekly Gatherings'
    const heading = props.heading ?? 'Join us this Sunday'
    const description =
      props.description ??
      'Experience contemporary worship, relevant teaching, and a welcoming community. Services last approximately 75 minutes.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Sunday Morning Worship',
            detail:
              "9:00 AM & 11:00 AM — Contemporary service with full band, children's programs, and nursery care.",
            location: 'Main Sanctuary & Live Stream',
          },
          {
            title: 'Wednesday Night Encounter',
            detail:
              '7:00 PM — Midweek prayer, worship, and teaching. Dinner served at 6:00 PM ($5 suggested).',
            location: 'Fellowship Hall',
          },
          {
            title: 'Saturday Prayer Vigil',
            detail:
              'First Saturday monthly, 8:00 AM — 12:00 PM — Corporate prayer for our city and world.',
            location: 'Prayer Chapel',
          },
        ]
    const imageAlt =
      props.imageAlt ??
      'Wide interior view of a modern church sanctuary with warm lighting and wooden accents'
    const expectTitle = props.expectTitle ?? 'What to Expect'
    const expect = props.expect?.length
      ? props.expect
      : [
          'Casual dress — come as you are',
          'Free coffee and pastries before service',
          'Programs for kids ages 0-18',
          'Accessible parking and seating',
        ]

    return (
      <section
        className={cn(
          // Softly slanted muted band — the section cuts in on a gentle
          // diagonal seam (clip-path is neighbor-independent).
          'relative overflow-hidden bg-muted/40 pb-20 pt-24 [clip-path:polygon(0_2.5rem,100%_0,100%_100%,0_100%)] sm:pt-28 lg:pb-28 lg:pt-36',
          props.className,
        )}
      >
        {/* Giant ghost service-hour numerals. */}
        <Watermark className="-left-4 bottom-0 font-serif text-[6rem] font-medium italic text-foreground/[0.04] sm:text-[9rem] lg:text-[13rem]">
          9 &amp; 11
        </Watermark>

        <Container size="xl" className="relative px-6">
          <div className="grid items-start gap-14 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              {/* Mono metadata rail. */}
              <div className="mb-8 flex items-center gap-4">
                <MonoTag tone="primary" className="shrink-0">
                  {eyebrow}
                </MonoTag>
                <span aria-hidden="true" className="h-px flex-1 bg-border" />
                <MonoTag tone="faint" className="hidden shrink-0 sm:inline">
                  Order of service
                </MonoTag>
              </div>
              <SectionHeading
                align="left"
                title={heading}
                subtitle={description}
                className="mb-12 gap-0"
                titleClassName="mb-6 font-serif text-4xl font-medium leading-[1.08] tracking-tight text-foreground sm:text-5xl"
                subtitleClassName="max-w-lg border-l border-border pl-5 text-base leading-relaxed text-muted-foreground sm:text-lg"
              />
              <div>
                {items.map((s, i) => (
                  <ServiceCard
                    key={s.title}
                    className="grid grid-cols-[auto_1fr] items-start gap-x-5 gap-y-0 rounded-none border-0 border-t border-border bg-transparent p-0 py-7 sm:gap-x-8"
                  >
                    <ServiceIcon className="size-auto rounded-none bg-transparent pt-1 font-serif text-3xl font-medium italic leading-none text-muted-foreground/40 sm:text-4xl">
                      {String(i + 1).padStart(2, '0')}
                    </ServiceIcon>
                    <div className="min-w-0">
                      <ServiceTitle className="font-serif text-xl font-medium tracking-tight text-foreground sm:text-2xl">
                        {s.title}
                      </ServiceTitle>
                      <ServiceDescription className="mt-2 leading-relaxed">
                        {s.detail}
                      </ServiceDescription>
                      <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
                        {s.location}
                      </p>
                    </div>
                  </ServiceCard>
                ))}
                <span aria-hidden="true" className="block h-px bg-border" />
              </div>
            </div>

            <div className="lg:col-span-5 lg:sticky lg:top-24">
              <div className="relative mr-3 sm:mr-0">
                {/* Vertical mono label on the plate's edge. */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -left-9 top-0 hidden font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground [writing-mode:vertical-rl] lg:block"
                >
                  Sundays — 9:00 &amp; 11:00
                </span>
                {/* Offset hairline outline behind the plate. */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 translate-x-3 translate-y-3 border border-border"
                />
                <div className="relative aspect-[3/4] overflow-hidden border border-foreground/25 bg-muted">
                  <Image
                    alt={imageAlt}
                    w={800}
                    h={1000}
                    loading="lazy"
                    className="size-full object-cover"
                  />
                </div>
              </div>
              <div className="relative z-10 -mt-10 ml-6 border border-border bg-background p-6 sm:ml-10 sm:p-7">
                <div className="mb-4 flex items-center gap-3">
                  <h4 className="font-serif text-lg font-medium italic tracking-tight text-foreground">
                    {expectTitle}
                  </h4>
                  <span aria-hidden="true" className="h-px flex-1 bg-border" />
                </div>
                <ul className="space-y-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {expect.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span
                        aria-hidden="true"
                        className="mt-1 shrink-0 text-[10px] text-primary"
                      >
                        ✦
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Container>
      </section>
    )
  },
})
