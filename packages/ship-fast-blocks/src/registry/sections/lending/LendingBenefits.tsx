import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import {
  FeatureGrid,
  FeatureCard,
  FeatureIcon,
  FeatureTitle,
  FeatureDescription,
} from '#/section-kit/FeatureGrid.tsx'

/**
 * LendingBenefits — Swiss-fintech "why borrowers choose us" capability ledger for
 * a lending or fintech marketing page. An asymmetric header (left-aligned heading
 * + lede, mono meta count right) sits above a sharp-cornered, collapsed-border
 * 3-column grid whose cells share hairline rules (binary radius, no gaps); each
 * cell carries a mono index numeral over a hairline rule, a bold title, and a
 * description, with the ink hairline thickening on hover. No icon tiles — the
 * ledger structure and mono indexing carry the rhythm. Use to spell out product
 * advantages — fast funding, no hidden fees, fixed rates, paperless apply, human
 * support, soft credit check — on loan, debt-consolidation, or fintech landing
 * pages. Renders fully with no props via baked-in "ClearLoan" defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
export const LendingBenefits = defineCapsule({
  name: 'LendingBenefits',
  description:
    "Swiss-fintech 'why borrowers choose us' capability ledger for a lending or fintech marketing page: an asymmetric header (left-aligned heading + lede, mono meta count right) above a sharp-cornered, collapsed-border 3-column grid whose cells share hairline rules and carry a mono index numeral, a bold title and a description with an ink-hairline hover. No icon tiles — the ledger structure carries the rhythm. Use to spell out product advantages — fast funding, no hidden fees, fixed rates, paperless apply, human support, soft credit check — on loan, debt-consolidation, or fintech landing pages.",
  props: z.object({
    /** Brand / lender name woven into the default heading. */
    brand: z.string().optional(),
    heading: z.string().optional(),
    description: z.string().optional(),
    items: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'ClearLoan'
    const benefitsHeading = props.heading ?? `Why borrowers choose ${brand}`
    const benefitsDesc =
      props.description ??
      'No hidden fees, no surprises. Just honest lending with terms that work for you.'
    const benefitItems = props.items?.length
      ? props.items
      : [
          {
            title: 'Funds in 24 hours',
            description:
              'Once approved, money hits your account as soon as the next business day. No waiting, no stress.',
          },
          {
            title: 'No hidden fees',
            description:
              'Zero origination fees, zero prepayment penalties, zero late fees. What you see is what you pay.',
          },
          {
            title: 'Fixed rates for life',
            description:
              "Your rate never changes. Budget with confidence knowing exactly what you'll pay every month.",
          },
          {
            title: 'Paperless application',
            description:
              'Apply in under 2 minutes from your phone or laptop. No printing, no faxing, no branch visits.',
          },
          {
            title: 'Human support',
            description:
              'Real people, real help. Our California-based team is available 7 days a week by phone or chat.',
          },
          {
            title: 'Soft credit check',
            description:
              "Checking your rate won't affect your credit score. Apply with confidence, no strings attached.",
          },
        ]
    return (
      <section className={cn('pt-24 pb-20 lg:pt-28 lg:pb-28', props.className)}>
        <Container>
          <div className="mb-12 flex flex-col gap-6 border-b border-border pb-6 md:flex-row md:items-end md:justify-between lg:mb-14">
            <div className="max-w-2xl">
              <MonoTag className="mb-4 block">
                Why us
                <span aria-hidden="true" className="text-primary">
                  {' '}
                  / {String(benefitItems.length).padStart(2, '0')}
                </span>
              </MonoTag>
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground text-balance sm:text-4xl">
                {benefitsHeading}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground text-pretty">
                {benefitsDesc}
              </p>
            </div>
            <MonoTag
              aria-hidden="true"
              tone="faint"
              className="shrink-0 tabular-nums"
            >
              [ {String(benefitItems.length).padStart(2, '0')} reasons ]
            </MonoTag>
          </div>
          <FeatureGrid
            columns={3}
            className="gap-0 border-l border-t border-border"
          >
            {benefitItems.map((item, i) => {
              const __iv__ = item as {
                title: string
                description: string
                icon?: React.ReactNode
              }
              return (
                <FeatureCard
                  key={__iv__.title}
                  className="gap-3 rounded-none border-0 border-b border-r border-border bg-transparent p-7 transition-colors duration-150 hover:border-foreground/30 hover:bg-muted/30 sm:p-8"
                >
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="font-mono text-[11px] font-semibold tabular-nums tracking-[0.2em] text-primary"
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span
                      aria-hidden="true"
                      className="h-px flex-1 bg-border"
                    />
                  </div>
                  {__iv__.icon && <FeatureIcon>{__iv__.icon}</FeatureIcon>}
                  <FeatureTitle className="text-lg font-semibold tracking-tight text-card-foreground">
                    {__iv__.title}
                  </FeatureTitle>
                  <FeatureDescription className="leading-relaxed">
                    {__iv__.description}
                  </FeatureDescription>
                </FeatureCard>
              )
            })}
          </FeatureGrid>
        </Container>
      </section>
    )
  },
})
