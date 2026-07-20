import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { HeroSection } from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { Watermark } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * MembershipClubHero — asymmetric member-card hero for a private membership club
 * / exclusive community landing page. A 7:5 split over a giant ghost serif
 * watermark: the wider left column carries a hairline rule beside a mono
 * heritage micro-label, an oversized serif display headline with one italic
 * emphasized phrase, a light supporting paragraph, dual square CTAs (a solid
 * bg-foreground primary + a hairline-outline ghost, both with press feedback),
 * and a collapsed-border member-count proof row with serif tabular-nums figures;
 * the narrower right column is the members-only signature — a hairline-framed
 * membership card with a restrained hard offset shadow, a mono card label and
 * embossed member number NO. 0001, the alt-driven lifestyle photograph inset in
 * a hairline mat, a mono tier line, and an italic serif pull quote credited to
 * its cardholder. CTAs route through section-kit route links. Use as the
 * trust-building opening section for members clubs, founders/social clubs,
 * professional networks, curated communities or paid community subscriptions.
 * Renders fully with no props.
 */
export const MembershipClubHero = defineCapsule({
  name: 'MembershipClubHero',
  description:
    'Asymmetric member-card hero for a private membership club / exclusive community landing page: a 7:5 split over a giant ghost serif watermark with a wider left column carrying a hairline rule beside a mono heritage micro-label, an oversized serif display headline with one italic emphasized phrase, a light supporting paragraph, dual square CTAs (a solid bg-foreground primary + a hairline-outline ghost, both with press feedback), and a collapsed-border member-count proof row with serif tabular-nums figures; the narrower right column is a hairline-framed membership card with a restrained hard offset shadow, a mono card label and embossed member number NO. 0001, the alt-driven lifestyle photograph inset in a hairline mat, a mono tier line, and an italic serif pull quote credited to its cardholder. CTAs route through section-kit route links. Use as the trust-building opening section for members clubs, founders/social clubs, professional networks, curated communities or paid community subscriptions.',
  props: z.object({
    eyebrow: z.string().optional(),
    /** Headline text before the emphasized highlight phrase. */
    headingBefore: z.string().optional(),
    /** Phrase rendered with emphasized (normal-weight) highlight. */
    highlight: z.string().optional(),
    /** Headline text after the emphasized highlight phrase. */
    headingAfter: z.string().optional(),
    subheading: z.string().optional(),
    primaryCta: z.string().optional(),
    secondaryCta: z.string().optional(),
    imageAlt: z.string().optional(),
    proof: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    quote: z.string().optional(),
    quoteAuthor: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Est. 2019 — Private Collective'
    const headingBefore =
      props.headingBefore ?? 'A private space for people who value '
    const highlight = props.highlight ?? 'depth over breadth'
    const headingAfter = props.headingAfter ?? ''
    const subheading =
      props.subheading ??
      'The Guild is a curated membership of 500 professionals, founders, and creatives. We host intimate dinners, workshops, and retreats designed for genuine connection.'
    const primaryCta = props.primaryCta ?? 'Apply for Membership'
    const secondaryCta = props.secondaryCta ?? 'Explore Benefits'
    const imageAlt =
      props.imageAlt ??
      'group of professionals having an engaging conversation in a modern airy loft space with large windows'
    const proof = props.proof?.length
      ? props.proof
      : [
          { value: '487', label: 'Members' },
          { value: '12', label: 'Cities Worldwide' },
        ]
    const quote =
      props.quote ??
      "The quality of conversations here is unlike anything I've found elsewhere."
    const quoteAuthor =
      props.quoteAuthor ?? '— Sarah Chen, Product Lead at Stripe'

    return (
      <HeroSection
        className={cn(
          'relative w-full overflow-hidden bg-background',
          props.className,
        )}
        aria-labelledby="hero-heading"
      >
        <Watermark className="-left-2 bottom-[-0.1em] font-serif text-[26vw] font-normal tracking-tighter">
          Members
        </Watermark>
        <Container size="xl" className="relative py-20 lg:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-[7fr_5fr] lg:gap-16">
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <span aria-hidden="true" className="h-px w-12 bg-primary" />
                <p className="font-mono text-[11px] font-medium uppercase tracking-[0.28em] text-muted-foreground">
                  {eyebrow}
                </p>
              </div>
              <h1
                id="hero-heading"
                className="font-serif text-4xl font-normal leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl"
              >
                {headingBefore}
                <span className="italic text-foreground">{highlight}</span>
                {headingAfter}
              </h1>
              <p className="max-w-xl text-lg font-light leading-relaxed text-muted-foreground">
                {subheading}
              </p>
              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <NavbarRouteLink
                  href={primaryCta}
                  className="inline-flex items-center justify-center rounded-none bg-foreground px-8 py-4 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-background transition-[background-color,transform] duration-150 hover:bg-foreground/90 active:translate-y-px"
                >
                  {primaryCta}
                </NavbarRouteLink>
                <NavbarRouteLink
                  href={secondaryCta}
                  className="inline-flex items-center justify-center rounded-none border border-border px-8 py-4 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-foreground transition-[border-color,color,transform] duration-150 hover:border-foreground active:translate-y-px"
                >
                  {secondaryCta}
                </NavbarRouteLink>
              </div>
              <dl className="flex max-w-md border-t border-border pt-8">
                {proof.map((p, i) => (
                  <div
                    key={p.label}
                    className={cn(
                      'flex-1',
                      i > 0 && 'border-l border-border pl-8',
                    )}
                  >
                    <dt className="sr-only">{p.label}</dt>
                    <dd className="font-serif text-3xl font-normal tabular-nums text-foreground">
                      {p.value}
                    </dd>
                    <dd className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                      {p.label}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="relative">
              <div className="border border-border bg-card p-5 shadow-[10px_10px_0_0] shadow-foreground/10">
                <div className="flex items-center justify-between">
                  <span
                    aria-hidden="true"
                    className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground"
                  >
                    Member Card
                  </span>
                  <span
                    aria-hidden="true"
                    className="font-mono text-[11px] uppercase tracking-[0.24em] text-foreground tabular-nums"
                  >
                    No. 0001
                  </span>
                </div>
                <div className="mt-4 border border-border bg-background p-2">
                  <Image
                    alt={imageAlt}
                    w={800}
                    h={640}
                    className="h-64 w-full object-cover lg:h-72"
                  />
                </div>
                <p
                  aria-hidden="true"
                  className="mt-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
                >
                  Tier · Founding Member
                </p>
                <blockquote className="mt-2 font-serif text-lg font-normal italic leading-relaxed text-foreground">
                  &ldquo;{quote}&rdquo;
                </blockquote>
                <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  {quoteAuthor}
                </p>
              </div>
            </div>
          </div>
        </Container>
      </HeroSection>
    )
  },
})
