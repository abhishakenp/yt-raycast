import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

/**
 * AccountingFirmAbout — split about band for a CPA / accounting-firm site. A
 * muted two-column section: a 4:3 photo on one side and, on the other, an
 * uppercase eyebrow, a heading, two body paragraphs, a 2x2 KPI grid of firm
 * stats, and a founder credit row (round avatar + name + role). Calm,
 * trustworthy professional-services aesthetic that builds credibility. Photo and
 * founder avatar use the alt-driven Image component. Use to tell the firm story
 * on accounting firms, CPA practices, tax/bookkeeping providers, audit firms, or
 * financial advisory practices. Renders fully with no props via baked-in
 * "Northridge" defaults.
 */
export const AccountingFirmAbout = defineCapsule({
  name: 'AccountingFirmAbout',
  description:
    'Split about band for a CPA / accounting-firm site: a muted two-column section with a 4:3 photo on one side and, on the other, an uppercase eyebrow, a heading, two body paragraphs, a 2x2 KPI grid of firm stats, and a founder credit row (round avatar + name + role). Calm professional-services credibility band; photo and founder avatar use the alt-driven Image component. Use to tell the firm story on accounting firms, CPA practices, tax/bookkeeping providers, audit firms, or financial advisory practices.',
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
      <section className={cn('bg-muted py-20 lg:py-28', props.className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <div className="order-2 lg:order-1">
              <Image
                alt={imageAlt}
                w={800}
                h={600}
                loading="lazy"
                className="aspect-[4/3] w-full rounded-lg object-cover shadow-lg"
              />
            </div>
            <div className="order-1 lg:order-2">
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {eyebrow}
              </p>
              <h2 className="mb-6 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {heading}
              </h2>
              {paragraphs.map((p, i) => (
                <p
                  key={p}
                  className={cn(
                    'leading-relaxed text-muted-foreground',
                    i === 0 ? 'mb-6 text-lg' : 'mb-8',
                  )}
                >
                  {p}
                </p>
              ))}

              <div className="mb-8 grid grid-cols-2 gap-6">
                {stats.map((s) => (
                  <div key={s.label}>
                    <p className="text-3xl font-bold text-foreground">
                      {s.value}
                    </p>
                    <p className="text-sm text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4">
                <Image
                  alt={founderAvatarAlt}
                  w={100}
                  h={100}
                  className="size-14 rounded-full border-2 border-card object-cover shadow"
                />
                <div>
                  <p className="font-semibold text-foreground">{founderName}</p>
                  <p className="text-sm text-muted-foreground">{founderRole}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  },
})
