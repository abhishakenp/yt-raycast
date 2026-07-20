import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  AboutSection,
  AboutGrid,
  AboutContent,
  AboutFooter,
} from '#/section-kit/AboutSection.tsx'
import {
  StatGrid,
  StatItem,
  StatValue,
  StatLabel,
} from '#/section-kit/StatGrid.tsx'

/**
 * AccountingFirmAbout — Swiss-ledger about band for a CPA / accounting-firm
 * site. An asymmetric 5:7 split: a narrow, tall 3:4 photo in a hairline frame
 * over an offset primary-tinted block on one side and, on the other, a mono
 * uppercase eyebrow rule, a large tracking-tight heading, body copy whose first
 * paragraph opens with a serif drop cap, a 2x2 collapsed-border KPI ledger
 * block (cells sharing hairline rules, giant mono tabular values, mono
 * micro-labels), and a signature row under a hairline top rule (round founder
 * avatar + name + mono role). Newsprint gravitas and grid discipline in place
 * of soft card styling. Photo and founder avatar use the alt-driven Image
 * component. Use to tell the firm story on accounting firms, CPA practices,
 * tax/bookkeeping providers, audit firms, or financial advisory practices.
 * Renders fully with no props via baked-in "Northridge" defaults.
 */
export const AccountingFirmAbout = defineCapsule({
  name: 'AccountingFirmAbout',
  description:
    'Swiss-ledger about band for a CPA / accounting-firm site: an asymmetric 5:7 split with a narrow tall 3:4 photo in a hairline frame over an offset primary-tinted block on one side and, on the other, a mono uppercase eyebrow rule, a large tracking-tight heading, body copy opening with a serif drop cap, a 2x2 collapsed-border KPI ledger block (shared hairline rules, giant mono tabular values, mono micro-labels), and a founder signature row under a hairline top rule (round avatar + name + mono role). Photo and founder avatar use the alt-driven Image component. Use to tell the firm story on accounting firms, CPA practices, tax/bookkeeping providers, audit firms, or financial advisory practices.',
  props: z.object({
    /** Uppercase eyebrow above the heading. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Body paragraphs (first is rendered larger). */
    paragraphs: z.array(z.string()).optional(),
    /** Alt text driving the about photo. */
    imageAlt: z.string().optional(),
    /** Firm KPI stats shown in a 2x2 grid. */
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    /** Founder name in the credit row. */
    founderName: z.string().optional(),
    /** Founder role in the credit row. */
    founderRole: z.string().optional(),
    /** Alt text driving the founder avatar. */
    founderAvatarAlt: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'About Northridge'
    const heading = props.heading ?? 'Three decades of financial excellence'
    const paragraphs = props.paragraphs?.length
      ? props.paragraphs
      : [
          'Founded in 1987 by Robert Northridge, our firm has grown from a one-person practice to a team of 24 dedicated professionals serving clients throughout Oregon and Washington.',
          'We believe in building lasting relationships. Our average client tenure exceeds 11 years—a testament to the trust we earn through consistent results and personal attention. Every engagement is led by a partner, ensuring senior-level expertise on every matter.',
        ]
    const imageAlt =
      props.imageAlt ??
      'modern glass office building exterior with blue sky reflection'
    const stats = props.stats?.length
      ? props.stats
      : [
          { value: '37', label: 'Years in practice' },
          { value: '24', label: 'Team members' },
          { value: '800+', label: 'Active clients' },
          { value: '11.2', label: 'Average client years' },
        ]
    const founderName = props.founderName ?? 'Robert Northridge, CPA'
    const founderRole = props.founderRole ?? 'Founder & Managing Partner'
    const founderAvatarAlt =
      props.founderAvatarAlt ??
      'professional headshot of Robert Northridge founder in navy suit with warm smile'

    return (
      <AboutSection
        className={cn(
          'border-b border-border bg-background py-16 sm:py-20 lg:py-28',
          props.className,
        )}
      >
        <Container>
          <AboutGrid className="items-start gap-10 md:grid-cols-12 md:gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="order-2 md:order-1 md:col-span-5">
              <div className="relative">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 -translate-x-4 translate-y-4 bg-primary/10"
                />
                <Image
                  alt={imageAlt}
                  w={600}
                  h={800}
                  loading="lazy"
                  className="relative aspect-[4/3] w-full rounded-none border border-foreground object-cover md:aspect-[3/4]"
                />
              </div>
            </div>
            <AboutContent className="order-1 space-y-0 md:order-2 md:col-span-7">
              <SectionHeading
                align="left"
                eyebrow={eyebrow}
                title={heading}
                className="gap-0"
                eyebrowClassName="mb-5 flex items-center gap-3 font-mono text-[11px] font-normal uppercase tracking-[0.2em] text-muted-foreground before:block before:h-px before:w-8 before:bg-primary"
                titleClassName="mb-8 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl"
              />
              {paragraphs.map((p, i) => (
                <p
                  key={p}
                  className={cn(
                    'leading-relaxed text-muted-foreground',
                    i === 0
                      ? 'mb-6 text-lg first-letter:float-left first-letter:mr-3 first-letter:font-serif first-letter:text-6xl first-letter:leading-[0.8] first-letter:text-foreground'
                      : 'mb-10',
                  )}
                >
                  {p}
                </p>
              ))}

              <StatGrid
                columns={2}
                className="mb-10 grid grid-cols-2 gap-0 border-l border-t border-border"
              >
                {stats.map((s) => (
                  <StatItem
                    key={s.label}
                    align="left"
                    className="border-b border-r border-border p-5 sm:p-6"
                  >
                    <StatValue className="font-mono text-3xl font-bold tabular-nums tracking-tight text-foreground sm:text-5xl">
                      {s.value}
                    </StatValue>
                    <StatLabel className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em]">
                      {s.label}
                    </StatLabel>
                  </StatItem>
                ))}
              </StatGrid>

              <AboutFooter className="gap-4 border-t border-border pt-6">
                <Image
                  alt={founderAvatarAlt}
                  w={100}
                  h={100}
                  className="size-14 rounded-full border border-border object-cover"
                />
                <div>
                  <p className="font-serif text-lg text-foreground">
                    {founderName}
                  </p>
                  <p className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                    {founderRole}
                  </p>
                </div>
              </AboutFooter>
            </AboutContent>
          </AboutGrid>
        </Container>
      </AboutSection>
    )
  },
})
