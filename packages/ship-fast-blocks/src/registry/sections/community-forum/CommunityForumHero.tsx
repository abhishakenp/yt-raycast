import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  HeroSection,
  HeroContent,
  HeroBadge,
  HeroHeading,
  HeroSubheading,
  HeroSocialProof,
  HeroSocialProofItem,
} from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { DotGrid, MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * CommunityForumHero — playful-geometric asymmetric hero for a
 * community-platform / discussion-forum landing page. A 7:5 editorial split:
 * on the left a mono "01 / community" metadata rail, a slightly rotated
 * sticker-style status chip (pulsing dot + mono label, hard offset shadow), a
 * giant tight-tracked display headline split across two lines with a tilted
 * primary highlight block behind the second line, a supporting paragraph, dual
 * CTAs (rounded-full primary pill with hard offset shadow + outlined pill,
 * both with press feedback), and a strip of rounded-full mono trust chips. On
 * the right an aria-hidden staggered stack of abstract thread cards —
 * sharp-cornered bordered plates tilted ±1–2deg with overlapping avatar
 * cluster rings, skeleton text bars, and sticker reaction chips — floating
 * over a rotated primary-tinted block and a faint dot grid, with a giant ghost
 * "✱" watermark. CTAs route through section-kit route links. Use as the
 * opening hero for community platforms, online forums, discussion boards, or
 * membership SaaS products.
 */
export const CommunityForumHero = defineCapsule({
  name: 'CommunityForumHero',
  description:
    'Playful-geometric asymmetric hero for a community-platform / discussion-forum landing page: a 7:5 split with a mono metadata rail, a rotated sticker status chip (pulsing dot, hard offset shadow), a giant two-line tight-tracked headline with a tilted primary highlight block behind the second line, a supporting paragraph, dual rounded-full CTAs (primary pill with hard offset shadow + outlined pill, press feedback), and rounded-full mono trust chips — beside an aria-hidden staggered stack of abstract thread cards (tilted bordered plates with overlapping avatar-cluster rings, skeleton bars, and sticker reaction chips) over a rotated primary-tinted block, dot grid, and a giant ghost watermark. CTAs route through section-kit route links. Use as the opening hero for community platforms, online forums, discussion boards, or membership SaaS products.',
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

    const Check = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M5 13l4 4L19 7" />
      </svg>
    )

    /** Abstract, aria-hidden "thread card": avatar cluster + skeleton bars + reaction chips. */
    const ThreadCard = ({
      className,
      avatarTints,
      barWidths,
      reactions,
      highlight,
    }: {
      className?: string
      avatarTints: string[]
      barWidths: string[]
      reactions: string[]
      highlight?: boolean
    }) => (
      <div
        className={cn(
          'rounded-none border-2 border-foreground/15 bg-card p-4 sm:p-5',
          highlight && 'shadow-[6px_6px_0_0] shadow-primary/25',
          className,
        )}
      >
        <div className="flex items-center gap-3">
          <span className="flex -space-x-2.5">
            {avatarTints.map((tint, i) => (
              <span
                key={i}
                className={cn(
                  'size-7 rounded-full border-2 border-card sm:size-8',
                  tint,
                )}
              />
            ))}
          </span>
          <span className="h-2 w-16 rounded-full bg-muted" />
          <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground/70">
            live
          </span>
        </div>
        <div className="mt-4 space-y-2">
          {barWidths.map((w, i) => (
            <span
              key={i}
              className={cn('block h-2 rounded-full bg-muted', w)}
            />
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {reactions.map((r) => (
            <span
              key={r}
              className="inline-flex items-center rounded-full border border-foreground/15 bg-background px-2.5 py-0.5 font-mono text-[10px] tracking-[0.08em] text-muted-foreground"
            >
              {r}
            </span>
          ))}
        </div>
      </div>
    )

    return (
      <HeroSection
        variant="default"
        className={cn(
          'relative overflow-hidden pb-16 pt-14 sm:pb-20 sm:pt-16 lg:pb-28 lg:pt-24',
          props.className,
        )}
      >
        <Watermark className="-right-10 top-2 text-[11rem] text-foreground/[0.035] sm:text-[16rem] lg:-right-4 lg:text-[22rem]">
          ✱
        </Watermark>
        <DotGrid tone="faint" fade="left" className="inset-y-0 right-0 w-1/2" />
        <Container size="xl" className="relative">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
            <HeroContent className="lg:col-span-7">
              <div className="mb-6 flex items-center gap-4">
                <MonoTag>01 / Community</MonoTag>
                <span aria-hidden="true" className="h-px flex-1 bg-border" />
              </div>
              <HeroBadge
                variant="pulsing-dot"
                className="mb-7 inline-flex -rotate-1 rounded-full border-2 border-foreground/20 bg-background px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-foreground shadow-[3px_3px_0_0] shadow-primary/25"
              >
                <span className="relative flex size-2 shrink-0">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60" />
                  <span className="relative inline-flex size-2 rounded-full bg-primary" />
                </span>
                {badge}
              </HeroBadge>
              <HeroHeading className="mb-6 text-[clamp(2.75rem,7.5vw,5.5rem)] font-extrabold leading-[0.95] tracking-tighter">
                {headingTop}
                <br />
                <span className="relative inline-block">
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-[-0.12em] bottom-[0.04em] h-[0.32em] -rotate-1 bg-primary/20"
                  />
                  <span className="relative">{headingBottom}</span>
                </span>
              </HeroHeading>
              <HeroSubheading
                variant="large"
                className="mx-0 mb-9 max-w-xl text-base sm:text-lg"
              >
                {subheading}
              </HeroSubheading>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <NavbarRouteLink
                  className="inline-flex w-full items-center justify-center rounded-full bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground shadow-[4px_4px_0_0] shadow-foreground/20 transition-all duration-150 hover:-translate-y-0.5 active:translate-y-px active:shadow-none sm:w-auto"
                  href={primaryCta}
                >
                  {primaryCta}
                </NavbarRouteLink>
                <NavbarRouteLink
                  className="inline-flex w-full items-center justify-center rounded-full border-2 border-foreground/20 bg-background px-8 py-3.5 text-base font-semibold text-foreground transition-all duration-150 hover:border-foreground/40 hover:bg-muted active:translate-y-px sm:w-auto"
                  href={secondaryCta}
                >
                  {secondaryCta}
                </NavbarRouteLink>
              </div>
              <HeroSocialProof className="mt-9 gap-x-2.5 gap-y-2.5">
                {trust.map((t) => (
                  <HeroSocialProofItem
                    key={t}
                    className="rounded-full border border-border bg-muted/60 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground"
                  >
                    <Check className="size-3.5 shrink-0 text-primary" />
                    {t}
                  </HeroSocialProofItem>
                ))}
              </HeroSocialProof>
            </HeroContent>

            {/* Decorative staggered thread-card stack. */}
            <div
              aria-hidden="true"
              className="pointer-events-none relative select-none lg:col-span-5"
            >
              <span className="absolute -inset-x-2 inset-y-6 -rotate-2 border-2 border-primary/20 bg-primary/10 sm:-inset-x-4" />
              <div className="relative grid gap-4 px-2 py-6 sm:px-6">
                <ThreadCard
                  className="-rotate-1"
                  avatarTints={[
                    'bg-chart-1/50',
                    'bg-chart-2/50',
                    'bg-chart-3/50',
                  ]}
                  barWidths={['w-11/12', 'w-2/3']}
                  reactions={['▲ 128', '✦ 32', '❋ 12']}
                />
                <ThreadCard
                  className="rotate-[1.5deg] sm:translate-x-6"
                  avatarTints={['bg-chart-4/50', 'bg-primary/40']}
                  barWidths={['w-3/4', 'w-5/6', 'w-1/2']}
                  reactions={['▲ 96', '✦ 18']}
                  highlight
                />
                <ThreadCard
                  className="-rotate-1 sm:-translate-x-3"
                  avatarTints={[
                    'bg-chart-5/50',
                    'bg-chart-1/50',
                    'bg-chart-2/50',
                    'bg-chart-3/50',
                  ]}
                  barWidths={['w-4/5']}
                  reactions={['▲ 64', '❋ 7']}
                />
              </div>
            </div>
          </div>
        </Container>
      </HeroSection>
    )
  },
})
