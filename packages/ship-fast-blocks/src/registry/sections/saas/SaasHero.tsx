import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { HeroSection } from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { DotGrid, MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import {
  SaasMutationSpinner,
  SaasPlanActionButton,
} from './saas-interactions.tsx'
import { saasLakebed } from './saas-lakebed.ts'

/**
 * SaasHero — kinetic-SaaS split product hero for an AI-product / SaaS landing
 * page. An asymmetric 7:5 grid over a dot-grid wash and a giant ghost "AI"
 * watermark: on the left a square mono status chip with a pulsing dot, a huge
 * clamp-scaled extrabold headline whose highlighted phrase sits on a tilted
 * primary marker block, a supporting paragraph, dual square CTAs with hard
 * offset shadows and press feedback, and an avatar-stack social-proof row; on
 * the right a sharp-cornered product-demo mockup panel with mono window chrome
 * showing an AI-assistant chat thread (AI/user bubbles with Lakebed action
 * chips) above a hairline calendar preview with free/busy/success rows. CTAs and
 * demo chips write to shared Lakebed conversion state. Use as the opening hero
 * for AI tools, scheduling/productivity apps, automation products, or B2B SaaS.
 * Renders fully with no props via baked-in "Chronos AI" defaults.
 */
export const SaasHero = defineCapsule({
  name: 'SaasHero',
  description:
    'Kinetic-SaaS split product hero for an AI-product / SaaS landing page: an asymmetric 7:5 grid over a dot-grid wash and giant ghost AI watermark. Left column has a square mono status chip with pulsing dot, a huge clamp-scaled headline whose highlighted phrase sits on a tilted primary marker block, a supporting paragraph, dual square fullstack CTAs with hard offset shadows and press feedback, and an avatar-stack social-proof row; right column is a sharp-cornered product-demo mockup panel with mono window chrome showing an AI-assistant chat thread (AI/user bubbles with Lakebed action chips) above a hairline calendar preview with free/busy/success rows. CTAs and demo chips write to shared Lakebed conversion state. Use as the opening hero for AI tools, scheduling/productivity apps, automation products, or B2B SaaS.',
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
        variant="split"
        className={cn(
          'relative overflow-hidden bg-background',
          props.className,
        )}
      >
        {/* Layered wash: dot grid fading right + giant ghost watermark. */}
        <DotGrid
          className="inset-y-0 left-0 w-2/3"
          fade="right"
          tone="border"
        />
        <Watermark className="-top-8 right-0 text-[8rem] sm:text-[12rem] lg:-top-16 lg:text-[18rem]">
          AI
        </Watermark>
        <Container className="relative py-16 sm:py-20 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-7">
              <span className="mb-6 inline-flex items-center gap-2 border border-border bg-background px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.15em] text-foreground/80">
                <span className="size-2 animate-pulse bg-primary" />
                {badge}
              </span>
              <h1 className="mb-6 text-[clamp(2.5rem,6.5vw,4.75rem)] font-extrabold leading-[0.98] tracking-tight text-foreground">
                {heading}{' '}
                <span className="relative ml-[0.12em] inline-block">
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-[-0.12em] inset-y-[0.04em] -rotate-1 bg-primary"
                  />
                  <span className="relative text-primary-foreground">
                    {highlight}
                  </span>
                </span>
              </h1>
              <p className="mb-8 max-w-xl text-lg leading-relaxed text-muted-foreground">
                {subheading}
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
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
                  className="inline-flex items-center justify-center gap-2 rounded-none bg-primary px-8 py-4 text-center font-semibold text-primary-foreground shadow-[5px_5px_0_0] shadow-foreground transition-[transform,box-shadow,background-color] duration-150 hover:bg-primary/90 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none motion-reduce:transform-none disabled:pointer-events-none disabled:opacity-70"
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
                  className="inline-flex items-center justify-center gap-2 rounded-none border border-foreground bg-background px-8 py-4 text-center font-semibold text-foreground transition-[transform,background-color] duration-150 hover:bg-muted active:translate-y-px motion-reduce:transform-none disabled:pointer-events-none disabled:opacity-70"
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
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <div className="flex" aria-hidden="true">
                  {['a', 'b', 'c', 'd'].map((id, i) => (
                    <span
                      key={id}
                      className={cn(
                        'grid size-9 place-items-center rounded-none border border-background bg-foreground text-[0.625rem] font-bold text-background',
                        i > 0 && '-ml-2',
                      )}
                    >
                      {String.fromCharCode(65 + i)}
                    </span>
                  ))}
                </div>
                <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  {socialProof}
                </p>
              </div>
            </div>

            {/* Product demo mockup panel — sharp, mono chrome. */}
            <div className="relative -mx-2 sm:mx-0 lg:col-span-5">
              <div className="border border-foreground/80 bg-card shadow-[8px_8px_0_0] shadow-foreground/15">
                <div className="flex items-center gap-2 border-b border-foreground/80 bg-muted px-4 py-2.5">
                  <div className="flex gap-1.5" aria-hidden="true">
                    <span className="size-2.5 border border-foreground/40" />
                    <span className="size-2.5 border border-foreground/40" />
                    <span className="size-2.5 bg-primary" />
                  </div>
                  <span className="ml-2 truncate font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
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
                          'grid size-8 shrink-0 place-items-center rounded-none text-[10px] font-bold',
                          msg.from === 'ai'
                            ? 'bg-primary text-primary-foreground'
                            : 'border border-border bg-background text-foreground',
                        )}
                      >
                        {msg.avatar ?? (msg.from === 'ai' ? 'AI' : 'JD')}
                      </span>
                      <div
                        className={cn(
                          'max-w-[80%] border px-4 py-2.5 text-sm leading-relaxed',
                          msg.from === 'ai'
                            ? 'border-border bg-muted text-foreground'
                            : 'border-foreground bg-foreground text-background',
                        )}
                      >
                        {msg.text}
                        {msg.from === 'ai' && i === chat.length - 1 ? (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {chips.map((chip) => (
                              <SaasPlanActionButton
                                key={chip}
                                lakebed={lakebed}
                                intentLabel={chip}
                                plan={chip}
                                source="demo"
                                pendingChildren={<SaasMutationSpinner />}
                                className="inline-flex items-center rounded-none border border-border bg-background px-3 py-1 font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground transition-colors hover:border-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-70"
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
                  <div className="mt-4 border border-border bg-muted p-4">
                    {calendar.map((row) => (
                      <div key={row.time} className="mb-2 flex gap-2 last:mb-0">
                        <span className="w-12 shrink-0 pr-2 text-right font-mono text-[11px] leading-7 tabular-nums text-muted-foreground">
                          {row.time}
                        </span>
                        <div
                          className={cn(
                            'flex h-7 flex-1 items-center border px-2 text-[11px] font-semibold',
                            row.tone === 'success'
                              ? 'border-primary/50 bg-primary/10 text-foreground'
                              : row.tone === 'busy'
                                ? 'border-foreground/30 bg-foreground/5 text-foreground'
                                : 'border-border bg-background',
                          )}
                        >
                          {row.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Rotated hard-shadow status badge overlapping the corner. */}
              <div className="absolute -top-5 right-2 rotate-2 border border-foreground bg-background px-3 py-2 shadow-[5px_5px_0_0] shadow-foreground sm:-right-4">
                <MonoTag
                  aria-hidden="true"
                  className="flex items-center gap-1.5"
                >
                  <span className="size-1.5 shrink-0 animate-pulse bg-primary" />
                  Live
                </MonoTag>
              </div>
            </div>
          </div>
        </Container>
      </HeroSection>
    )
  },
})
