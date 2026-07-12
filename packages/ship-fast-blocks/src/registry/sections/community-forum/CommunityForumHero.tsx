import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * CommunityForumHero — centered hero band for a community-platform / discussion-forum
 * landing page. A centered section with a live-status pill, a large tracking-tight
 * headline split across two lines, a supporting paragraph, dual CTAs (primary filled +
 * secondary outlined), and a trust-checkmark chip strip beneath. Clean, calm, light,
 * slate-toned SaaS aesthetic. CTAs route through useNavigate. Use as the opening hero
 * for community platforms, online forums, discussion boards, or membership SaaS
 * products.
 */
export const CommunityForumHero = defineCapsule({
  name: 'CommunityForumHero',
  description:
    'Centered hero band for a community-platform / discussion-forum landing page: a live-status pill dot, a large tracking-tight headline split across two lines, a supporting paragraph, dual CTAs (primary filled + secondary outlined), and a trust-checkmark chip strip beneath. Clean, calm, light slate-toned SaaS aesthetic; CTAs route through useNavigate. Use as the opening hero for community platforms, online forums, discussion boards, or membership SaaS products.',
  props: z.object({
    /** Status pill text. */
    badge: z.string().optional(),
    /** First heading line. */
    headingTop: z.string().optional(),
    /** Second heading line. */
    headingBottom: z.string().optional(),
    /** Supporting paragraph under the headline. */
    subheading: z.string().optional(),
    /** Filled primary CTA label. */
    primaryCta: z.string().optional(),
    /** Outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Trust checkmark chips beneath the CTAs. */
    trust: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const badge = props.badge ?? 'Over 12,000 communities already connected'
    const headingTop = props.headingTop ?? 'Where conversations'
    const headingBottom = props.headingBottom ?? 'actually matter'
    const subheading =
      props.subheading ??
      'Threadloom brings professionals, creators, and enthusiasts together in structured, searchable discussions. No noise. No algorithms. Just genuine exchange.'
    const primaryCta = props.primaryCta ?? 'Start Your Community'
    const secondaryCta = props.secondaryCta ?? 'See How It Works'
    const trust = props.trust?.length
      ? props.trust
      : ['Free 14-day trial', 'No credit card required', 'Cancel anytime']

    const Check = ({ className }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M5 13l4 4L19 7" />
      </svg>
    )

    return (
      <section
        className={cn(
          'relative overflow-hidden pb-24 pt-20 lg:pt-28 lg:pb-28',
          props.className,
        )}
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className="flex size-2 rounded-full bg-primary" />
              {badge}
            </div>
            <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              {headingTop}
              <br className="hidden sm:block" /> {headingBottom}
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              {subheading}
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button
                type="button"
                onClick={() => go(primaryCta)}
                className="inline-flex w-full items-center justify-center rounded-lg bg-primary px-8 py-4 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto"
              >
                {primaryCta}
              </button>
              <button
                type="button"
                onClick={() => go(secondaryCta)}
                className="inline-flex w-full items-center justify-center rounded-lg border border-input bg-background px-8 py-4 text-base font-medium text-foreground/80 transition-colors hover:bg-muted sm:w-auto"
              >
                {secondaryCta}
              </button>
            </div>
            <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-muted-foreground">
              {trust.map((t) => (
                <div key={t} className="flex items-center gap-2">
                  <Check className="size-5 text-primary" />
                  {t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  },
})
