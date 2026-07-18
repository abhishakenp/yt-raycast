import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  HeroSection,
  HeroHeading,
  HeroHighlight,
  HeroSubheading,
  HeroActions,
} from '#/section-kit/HeroSection.tsx'
import { Card } from '#/section-kit/Card.tsx'
import {
  SaasMutationSpinner,
  SaasPlanActionButton,
} from './saas-interactions.tsx'
import { saasLakebed } from './saas-lakebed.ts'

/**
 * SaasHero — split product hero for an AI-product / SaaS landing page. A
 * two-column band over a soft muted surface with a radial primary glow orb: on
 * the left a pulsing-dot status pill, a huge headline with one phrase in the
 * indigo primary highlight, a supporting paragraph, dual CTAs (gradient primary
 * + outlined "play" secondary) and an avatar-stack social-proof row; on the
 * right a floating product-demo mockup card showing an AI-assistant chat thread
 * (AI/user bubbles with action chips) above a live calendar preview with
 * free/busy/success rows. Premium, conversion-focused; CTAs and demo chips
 * write to Lakebed. Use as the opening hero for AI tools, scheduling/productivity
 * apps, automation products, or B2B SaaS. Renders fully with no props via
 * baked-in "Chronos AI" defaults.
 */
export const SaasHero = defineCapsule({
  name: 'SaasHero',
  description:
    'Split product hero for an AI-product / SaaS landing page: a two-column band over a soft muted surface with a radial primary glow orb. Left column has a pulsing-dot status pill, a huge headline with one phrase in the indigo primary highlight, a supporting paragraph, dual fullstack CTAs (gradient primary + outlined play-icon secondary) and an avatar-stack social-proof row; right column is a floating product-demo mockup card showing an AI-assistant chat thread (AI/user bubbles with Lakebed action chips) above a live calendar preview with free/busy/success rows. Premium and conversion-focused; CTAs and demo chips write to shared Lakebed conversion state. Use as the opening hero for AI tools, scheduling/productivity apps, automation products, or B2B SaaS.',
  props: z.object({
    /** Status / announcement pill text with a pulsing dot. */
    badge: z.string().optional(),
    /** Headline text before the highlighted phrase. */
    heading: z.string().optional(),
    /** Phrase inside the heading rendered in the primary highlight color. */
    highlight: z.string().optional(),
    /** Supporting paragraph under the headline. */
    subheading: z.string().optional(),
    /** Gradient primary CTA label. */
    primaryCta: z.string().optional(),
    /** Outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Social-proof line beside the avatar stack. */
    socialProof: z.string().optional(),
    /** Title shown in the demo card header bar. */
    demoTitle: z.string().optional(),
    /** Chat bubbles shown in the product-demo mockup. */
    chat: z
      .array(
        z.object({
          from: z.enum(['ai', 'user']),
          avatar: z.string().optional(),
          text: z.string(),
        }),
      )
      .optional(),
    /** Action-chip labels appended to the final AI bubble. */
    chips: z.array(z.string()).optional(),
    /** Calendar preview rows beneath the chat. */
    calendar: z
      .array(
        z.object({
          time: z.string(),
          label: z.string().optional(),
          tone: z.enum(['free', 'busy', 'success']).optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: saasLakebed,
  component: ({ props, lakebed }) => {
    const badge = props.badge ?? 'Now with GPT-4 scheduling intelligence'
    const heading = props.heading ?? 'Reclaim your day with'
    const highlight = props.highlight ?? 'AI-powered scheduling'
    const subheading =
      props.subheading ??
      'Chronos AI reads your calendar, understands your priorities, and automatically schedules meetings at the perfect time. No more back-and-forth emails. No more double-bookings. Just focus.'
    const primaryCta = props.primaryCta ?? 'Start free trial'
    const secondaryCta = props.secondaryCta ?? 'Book demo'
    const socialProof =
      props.socialProof ?? 'Trusted by 12,000+ busy professionals'
    const demoTitle = props.demoTitle ?? 'Chronos Assistant'
    const chat = props.chat?.length
      ? props.chat
      : [
          {
            from: 'ai' as const,
            avatar: 'AI',
            text: 'Good morning! I see you have 3 meeting requests today. Shall I find the best slots?',
          },
          {
            from: 'user' as const,
            avatar: 'JD',
            text: 'Yes, prioritize the product review with Sarah',
          },
          {
            from: 'ai' as const,
            avatar: 'AI',
            text: 'Done. I found Tuesday 2pm for Sarah. Also moved your standup to avoid the conflict.',
          },
        ]
    const chips = props.chips?.length ? props.chips : ['Accept all', 'Modify']
    const calendar = props.calendar?.length
      ? props.calendar
      : [
          { time: '9am', tone: 'free' as const },
          { time: '10am', label: 'Standup (moved)', tone: 'busy' as const },
          {
            time: '2pm',
            label: 'Product Review — Sarah',
            tone: 'success' as const,
          },
        ]

    return (
      <HeroSection
        className={cn('relative overflow-hidden bg-muted/40', props.className)}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-1/2 -right-[20%] size-[800px] rounded-full bg-primary/[0.08] blur-3xl"
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 sm:px-8 lg:grid-cols-[1fr_1.1fr] lg:gap-16 lg:px-12 lg:py-28">
          <div>
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-1.5 text-sm font-medium text-muted-foreground shadow-sm">
              <span className="inline-block size-1.5 animate-pulse rounded-full bg-primary" />
              {badge}
            </span>
            <HeroHeading variant="extra-bold">
              {heading} <HeroHighlight>{highlight}</HeroHighlight>
            </HeroHeading>
            <HeroSubheading>{subheading}</HeroSubheading>
            <HeroActions>
              <SaasPlanActionButton
                lakebed={lakebed}
                intentLabel={primaryCta}
                plan={primaryCta}
                source="hero"
                pendingChildren={
                  <>
                    <SaasMutationSpinner className="size-4" />
                    Starting
                  </>
                }
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 px-8 py-3.5 text-base font-semibold text-primary-foreground shadow-[0_1px_3px_rgba(79,70,229,0.3)] transition-all hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(79,70,229,0.35)]"
              >
                {primaryCta}
              </SaasPlanActionButton>
              <SaasPlanActionButton
                lakebed={lakebed}
                intentLabel={secondaryCta}
                plan={secondaryCta}
                source="hero"
                pendingChildren={
                  <>
                    <SaasMutationSpinner className="size-4" />
                    Opening
                  </>
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-8 py-3.5 text-base font-semibold text-foreground shadow-sm transition-colors hover:bg-muted"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polygon points="10 8 16 12 10 16 10 8" />
                </svg>
                {secondaryCta}
              </SaasPlanActionButton>
            </HeroActions>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <div className="flex" aria-hidden="true">
                {['a', 'b', 'c', 'd'].map((id, i) => (
                  <span
                    key={id}
                    className={cn(
                      'grid size-9 place-items-center rounded-full border-2 border-background bg-gradient-to-br from-primary/70 to-primary text-[0.625rem] font-bold text-primary-foreground',
                      i > 0 && '-ml-2',
                    )}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                ))}
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                {socialProof}
              </p>
            </div>
          </div>

          {/* Product demo mockup card */}
          <div className="flex justify-center">
            <Card
              variant="default"
              rounded="3xl"
              padding="none"
              className="w-full max-w-[520px] overflow-hidden shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)]"
            >
              <div className="flex items-center gap-2 border-b border-border/60 px-5 py-4">
                <span className="size-2.5 rounded-full bg-chart-5" />
                <span className="size-2.5 rounded-full bg-chart-4" />
                <span className="size-2.5 rounded-full bg-chart-2" />
                <span className="ml-auto text-xs font-medium text-muted-foreground">
                  {demoTitle}
                </span>
              </div>
              <div className="p-5">
                {chat.map((msg, i) => (
                  <div
                    key={i}
                    className={cn(
                      'mb-4 flex items-start gap-3',
                      msg.from === 'user' && 'flex-row-reverse',
                    )}
                  >
                    <span
                      className={cn(
                        'grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold',
                        msg.from === 'ai'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-accent text-accent-foreground',
                      )}
                    >
                      {msg.avatar ?? (msg.from === 'ai' ? 'AI' : 'JD')}
                    </span>
                    <div
                      className={cn(
                        'max-w-[80%] rounded-xl px-4 py-2.5 text-sm leading-relaxed',
                        msg.from === 'ai'
                          ? 'rounded-bl-sm bg-muted text-foreground'
                          : 'rounded-br-sm bg-primary text-primary-foreground',
                      )}
                    >
                      {msg.text}
                      {msg.from === 'ai' && i === chat.length - 1 ? (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {chips.map((chip) => (
                            <SaasPlanActionButton
                              key={chip}
                              lakebed={lakebed}
                              intentLabel={chip}
                              plan={chip}
                              source="demo"
                              pendingChildren={<SaasMutationSpinner />}
                              className="inline-flex items-center rounded-full border border-border bg-background px-3 py-1 text-[0.8125rem] font-medium text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-70"
                            >
                              {chip}
                            </SaasPlanActionButton>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}

                {/* Calendar preview */}
                <div className="mt-4 rounded-xl bg-muted p-4">
                  {calendar.map((row) => (
                    <div key={row.time} className="mb-2 flex gap-2 last:mb-0">
                      <span className="w-12 shrink-0 pr-2 text-right text-xs leading-7 text-muted-foreground">
                        {row.time}
                      </span>
                      <div
                        className={cn(
                          'flex h-7 flex-1 items-center rounded-sm border px-2 text-[0.6875rem] font-semibold',
                          row.tone === 'success'
                            ? 'border-chart-2/30 bg-chart-2/10 text-chart-2'
                            : row.tone === 'busy'
                              ? 'border-primary/30 bg-primary/10 text-primary'
                              : 'border-border/60 bg-background',
                        )}
                      >
                        {row.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </HeroSection>
    )
  },
})
