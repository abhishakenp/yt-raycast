import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { SplitStory } from '#/section-kit/SplitStory.tsx'

/**
 * ResumeCvAbout — professional-summary section for a personal resume / CV /
 * portfolio site. A left-aligned `SectionHeading` ("About" / "Professional
 * summary") leads into two or three prose paragraphs describing the person's
 * background and approach, followed by a row of quick-fact chips (location,
 * focus, availability) rendered as token labels. Clean, minimal, and
 * text-forward with no required imagery. Use on a personal portfolio, online
 * résumé, or professional profile page to introduce who the person is. Renders
 * fully with no props via baked-in defaults.
 */
export const ResumeCvAbout = defineCapsule({
  name: 'ResumeCvAbout',
  description:
    "Professional-summary section for a personal resume / CV / portfolio site: a left-aligned SectionHeading ('About' / 'Professional summary') leads into two or three prose paragraphs describing the person's background and approach, followed by a row of quick-fact chips (location, focus, availability) rendered as token labels. Clean, minimal, text-forward, no required imagery. Use on a personal portfolio, online résumé, or professional profile page to introduce who the person is.",
  props: z.object({
    /** Small eyebrow above the heading. */
    eyebrow: z.string().optional(),
    /** Section heading title. */
    heading: z.string().optional(),
    /** Section subheading. */
    subheading: z.string().optional(),
    /** Professional-summary prose paragraphs. */
    paragraphs: z.array(z.string()).optional(),
    /** Quick-fact chips, each a label + value. */
    facts: z
      .array(z.object({ label: z.string(), value: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const paragraphs = props.paragraphs?.length
      ? props.paragraphs
      : [
          "I'm a senior product designer with eight years of experience shaping digital products across fintech, healthcare, and developer tools. I care most about clarity — interfaces that feel obvious, get out of the way, and respect the people using them.",
          'My work spans the full arc of a product: framing the problem with research, mapping flows, building design systems that scale, and pairing with engineers to ship the real thing. I believe the best design decisions are made in the open, backed by evidence, and tested early.',
          'Outside of client work I write about design systems, mentor early-career designers, and tinker with small side projects to keep my hands close to the craft.',
        ]
    const facts = props.facts?.length
      ? props.facts
      : [
          { label: 'Location', value: 'San Francisco, CA' },
          { label: 'Focus', value: 'Product Design & Systems' },
          { label: 'Availability', value: 'Open to new projects' },
        ]

    return (
      <SplitStory className={cn('bg-background', props.className)}>
        <div className="mx-auto max-w-3xl px-6 py-24 lg:px-8 lg:py-28">
          <SectionHeading
            align="left"
            eyebrow={props.eyebrow}
            title={props.heading ?? 'About'}
            subtitle={props.subheading ?? 'Professional summary'}
          />

          <div className="mt-8 space-y-5">
            {paragraphs.map((paragraph, i) => (
              <p
                key={i}
                className="text-base leading-relaxed text-muted-foreground md:text-lg"
              >
                {paragraph}
              </p>
            ))}
          </div>

          <dl className="mt-10 flex flex-wrap gap-3">
            {facts.map((fact, i) => (
              <div
                key={i}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-2 text-sm"
              >
                <dt className="font-medium text-muted-foreground">
                  {fact.label}
                </dt>
                <dd className="font-medium text-foreground">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </SplitStory>
    )
  },
})
