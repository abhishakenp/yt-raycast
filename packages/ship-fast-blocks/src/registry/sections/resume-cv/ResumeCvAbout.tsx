import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { AboutSection } from '#/section-kit/AboutSection.tsx'
import { Container } from '#/section-kit/Container.tsx'

/**
 * ResumeCvAbout — professional-summary band for a personal resume / CV /
 * portfolio site, styled as a crisp résumé section. A mono metadata rail
 * ("01 / ABOUT" — hairline rule) sits above a left-aligned extrabold
 * tight-tracked heading, followed by prose paragraphs whose opening line carries
 * an oversized drop cap, over a giant faint "01" ghost watermark. The quick
 * facts (location, focus, availability) render as a collapsed-border definition
 * ledger with mono uppercase labels rather than pills. Hairline-precise,
 * text-forward, tokens only. Use on a personal portfolio, online résumé, or
 * professional profile page to introduce who the person is. Renders fully with
 * no props via baked-in defaults.
 */
export const ResumeCvAbout = defineCapsule({
  name: 'ResumeCvAbout',
  description:
    "Professional-summary band for a personal resume / CV / portfolio site styled as a crisp résumé section: a mono '01 / ABOUT' metadata rail with a hairline rule above a left-aligned extrabold tight-tracked heading, prose paragraphs whose opening line carries an oversized drop cap over a giant faint '01' ghost watermark, and quick facts (location, focus, availability) rendered as a collapsed-border definition ledger with mono uppercase labels rather than pills. Hairline-precise, text-forward, tokens only. Use on a personal portfolio, online résumé, or professional profile page to introduce who the person is.",
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
      <AboutSection
        className={cn(
          'relative overflow-hidden bg-background',
          props.className,
        )}
      >
        <Container size="sm" className="relative px-6 py-24 lg:px-6 lg:py-28">
          {/* Giant faint section-index watermark. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-6 right-0 select-none font-extrabold leading-none tracking-tighter text-foreground/[0.04] text-[9rem] sm:text-[12rem]"
          >
            01
          </span>

          {/* Mono metadata rail. */}
          <div className="relative flex items-center gap-4">
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              01 / About
            </span>
            <span aria-hidden="true" className="h-px flex-1 bg-border" />
          </div>

          <SectionHeading
            align="left"
            eyebrow={props.eyebrow}
            title={props.heading ?? 'About'}
            subtitle={props.subheading ?? 'Professional summary'}
            className="relative mt-6 gap-2"
            titleClassName="text-3xl font-extrabold tracking-tighter text-foreground md:text-4xl"
            subtitleClassName="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground"
          />

          <div className="relative mt-8 space-y-5">
            {paragraphs.map((paragraph, i) => (
              <p
                key={i}
                className={cn(
                  'text-base leading-relaxed text-muted-foreground md:text-lg',
                  i === 0 &&
                    'first-letter:float-left first-letter:mr-3 first-letter:text-6xl first-letter:font-extrabold first-letter:leading-[0.75] first-letter:tracking-tight first-letter:text-foreground',
                )}
              >
                {paragraph}
              </p>
            ))}
          </div>

          {/* Collapsed-border definition ledger. */}
          <dl className="relative mt-12 grid grid-cols-2 gap-0 border-l border-t border-border sm:grid-cols-3">
            {facts.map((fact, i) => (
              <div
                key={i}
                className="flex flex-col gap-1.5 border-b border-r border-border p-4 sm:p-5"
              >
                <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  {fact.label}
                </dt>
                <dd className="text-sm font-semibold text-foreground">
                  {fact.value}
                </dd>
              </div>
            ))}
          </dl>
        </Container>
      </AboutSection>
    )
  },
})
