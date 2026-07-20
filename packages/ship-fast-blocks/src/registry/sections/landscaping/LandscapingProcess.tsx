import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  ProcessTimeline,
  ProcessGrid,
  ProcessStep,
} from '#/section-kit/ProcessTimeline.tsx'

/**
 * LandscapingProcess — the page's one inverted "how we work" band for a
 * landscaping / outdoor-design company. A full ink inversion (bg-foreground /
 * text-background) that cuts in on a slanted clip-path seam: a mono uppercase
 * meta rule with a sage square and a tabular step count, a left-aligned oversized
 * heading + lede, then a collapsed-border 4-step ledger whose cells share
 * hairline rules and each carry a giant ghost step numeral, a mono sage step
 * label, a title and a descriptive paragraph. Organic-editorial gravitas — the
 * dark band anchors the page rhythm. Use to explain an engagement / project
 * workflow (consultation, design, installation, care) for landscapers, garden
 * designers, hardscaping contractors or maintenance services. Renders fully with
 * no props via baked-in four-step defaults.
 */
export const LandscapingProcess = defineCapsule({
  name: 'LandscapingProcess',
  description:
    "The page's one inverted 'how we work' band for a landscaping / outdoor-design company: a full ink inversion (bg-foreground / text-background) cutting in on a slanted clip-path seam, with a mono uppercase meta rule + tabular step count, a left-aligned oversized heading + lede, then a collapsed-border 4-step ledger whose cells share hairline rules and each carry a giant ghost step numeral, a mono sage step label, a title and a descriptive paragraph. Organic-editorial gravitas anchoring the page rhythm. Use to explain an engagement / project workflow (consultation, design, installation, care) for landscapers, garden designers, hardscaping contractors or maintenance services.",
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    items: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'How we work'
    const description =
      props.description ??
      'A proven process refined over 16 years and 500+ projects. Clear communication at every step.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Consultation',
            description:
              'Free 60-minute site visit. We assess your space, discuss your vision, and identify opportunities and constraints. No obligation.',
          },
          {
            title: 'Design',
            description:
              '2-3 weeks to create detailed plans and 3D renderings. Two revision rounds included. Transparent pricing with no hidden fees.',
          },
          {
            title: 'Installation',
            description:
              'Scheduled within 2-4 weeks of approval. Daily progress updates. Clean, respectful crews. Minimal disruption to your routine.',
          },
          {
            title: 'Care',
            description:
              "Optional maintenance packages. Seasonal check-ins. 2-year plant guarantee. We're with you long after the last stone is set.",
          },
        ]

    return (
      <ProcessTimeline
        variant="inverted"
        className={cn(
          // Slanted top edge: the inverted band starts on a diagonal seam
          // (clip-path on the band itself keeps it neighbor-independent).
          'relative overflow-hidden py-16 pt-24 [clip-path:polygon(0_0,100%_3rem,100%_100%,0_100%)] sm:py-20 sm:pt-28 lg:py-28 lg:pt-36',
          props.className,
        )}
      >
        <Container className="relative">
          <div className="mb-10 flex items-center justify-between gap-4 border-b border-background/20 pb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-background/50">
            <span className="flex items-center gap-3">
              <span aria-hidden="true" className="size-2 bg-primary" />
              Process
            </span>
            <span className="tabular-nums">
              {String(items.length).padStart(2, '0')} steps
            </span>
          </div>

          <SectionHeading
            align="left"
            title={heading}
            subtitle={description}
            className="mb-10 max-w-3xl gap-4 sm:mb-14 lg:mb-16"
            titleClassName="text-4xl font-semibold tracking-tight text-background sm:text-5xl"
            subtitleClassName="max-w-xl text-lg text-background/60"
          />

          <ProcessGrid
            columns={4}
            className="gap-0 border-l border-t border-background/20"
          >
            {items.map((step, i) => (
              <ProcessStep
                key={step.title}
                className="relative border-b border-r border-background/20 p-6 sm:p-8"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute right-4 top-4 select-none font-mono text-6xl font-bold tabular-nums leading-none text-background/10 sm:right-5 sm:top-5 sm:text-7xl"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
                  Step {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-4 text-xl font-semibold tracking-tight text-background">
                  {step.title}
                </h3>
                <p className="mt-3 leading-relaxed text-background/70">
                  {step.description}
                </p>
              </ProcessStep>
            ))}
          </ProcessGrid>
        </Container>
      </ProcessTimeline>
    )
  },
})
