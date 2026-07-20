import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { HeroSection, HeroSubheading } from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import { newsletterLakebed } from './newsletter-lakebed.ts'
import { NewsletterSubscribeForm } from './newsletter-interactions.tsx'

/**
 * NewsletterHero — newsprint-lite masthead hero for a newsletter / subscription
 * landing page. On a clean paper-toned canvas behind a giant faint serif "№156"
 * ghost watermark: a hairline-ruled masthead rail carries a mono dateline eyebrow
 * on the left and a mono "Weekly · By email" edition tag on the right, then an
 * asymmetric 7/5 grid drops a large two-line serif display headline, a relaxed
 * lede, a square (rounded-none) inline email subscribe form with a mono
 * uppercase submit button (press feedback), a live subscriber status line, and a
 * small social-proof line with emphasized brand names on the left — with a
 * hairline-framed issue nameplate (Vol. 3 · Sunday Edition, a giant serif ordinal
 * numeral, and a mono delivery footer) on the right at desktop. Restrained,
 * literary newspaper structure. The form submit writes to the shared Lakebed
 * subscriber list. Use as the top-of-page hero for newsletters, Substack-style
 * publications, blogs, essayists, or content creators. Renders fully with no
 * props via baked-in defaults.
 */
export const NewsletterHero = defineCapsule({
  name: 'NewsletterHero',
  description:
    'Newsprint-lite masthead hero for a newsletter / subscription landing page on a clean paper-toned canvas behind a giant faint serif ghost watermark ordinal: a hairline-ruled masthead rail with a mono dateline eyebrow and a mono edition tag, then an asymmetric 7/5 grid with a large two-line serif display headline, a relaxed lede, a square inline email subscribe form with a mono uppercase submit button (press feedback), a live subscriber status line, and a small social-proof line with emphasized brand names on the left, plus a hairline-framed issue nameplate (edition numerals, a giant serif ordinal, mono delivery footer) on the right at desktop. Restrained, literary newspaper structure. Submitting writes to the shared Lakebed subscriber list so another subscribe block or admin view can react immediately. Use as the top-of-page hero for newsletters, Substack-style publications, blogs, essayists, or content creators.',
  props: z.object({
    /** Uppercase eyebrow kicker above the headline. */
    eyebrow: z.string().optional(),
    /** First line of the serif display headline. */
    headingTop: z.string().optional(),
    /** Second line of the serif display headline. */
    headingBottom: z.string().optional(),
    /** Lede paragraph under the headline. */
    subheading: z.string().optional(),
    /** Email input placeholder. */
    emailPlaceholder: z.string().optional(),
    /** Submit button label (also the navigate target on submit). */
    submit: z.string().optional(),
    /** Social-proof line prefix before the emphasized brands. */
    proofPrefix: z.string().optional(),
    /** Emphasized brand names in the social-proof line. */
    proofBrands: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: newsletterLakebed,
  component: ({ props, lakebed }) => {
    const eyebrow = props.eyebrow ?? 'Every Sunday Morning'
    const headingTop = props.headingTop ?? 'Essays that slow down'
    const headingBottom = props.headingBottom ?? 'the conversation'
    const subheading =
      props.subheading ??
      'A weekly newsletter exploring the intersection of technology, creativity, and human connection. Join 12,000+ readers who start their Sundays with insight, not noise.'
    const emailPlaceholder = props.emailPlaceholder ?? 'your@email.com'
    const submit = props.submit ?? 'Subscribe Free'
    const proofPrefix =
      props.proofPrefix ?? 'No spam. Unsubscribe anytime. Read by teams at '
    const proofBrands = props.proofBrands ?? 'Notion, Figma, Stripe, and Vercel'

    return (
      <HeroSection
        variant="default"
        className={cn(
          'relative overflow-hidden pb-14 pt-14 md:pb-20 md:pt-20 lg:pb-28 lg:pt-24',
          props.className,
        )}
      >
        <Watermark className="-right-6 top-1/2 -translate-y-1/2 font-serif text-[9rem] font-medium not-italic sm:text-[13rem] lg:right-4 lg:text-[17rem]">
          №156
        </Watermark>

        <Container size="lg" className="relative">
          <div className="flex items-center justify-between gap-4 border-y border-border py-3">
            <MonoTag className="tracking-[0.25em]">{eyebrow}</MonoTag>
            <MonoTag className="hidden tracking-[0.25em] sm:inline">
              Weekly · By email
            </MonoTag>
          </div>

          <div className="grid gap-10 pt-10 md:pt-12 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-7">
              <h1 className="font-serif text-4xl font-medium leading-[1.03] tracking-tight text-foreground text-balance sm:text-5xl lg:text-6xl">
                {headingTop}
                <br className="hidden sm:block" /> {headingBottom}
              </h1>
              <HeroSubheading
                variant="large"
                className="mx-0 mb-8 max-w-xl text-pretty"
              >
                {subheading}
              </HeroSubheading>

              <NewsletterSubscribeForm
                lakebed={lakebed}
                source="Newsletter hero"
                placeholder={emailPlaceholder}
                buttonLabel={submit}
                successMessage="You're subscribed. Your next issue will arrive by email."
                className="mb-5 flex max-w-md flex-col gap-2.5 sm:flex-row"
                inputClassName="min-w-0 flex-1 rounded-none border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground transition-colors focus:border-foreground focus:outline-none"
                buttonClassName="rounded-none bg-foreground px-6 py-3 font-mono text-xs font-medium uppercase tracking-[0.15em] text-background transition-[transform,background-color] duration-150 hover:bg-foreground/90 active:translate-y-px disabled:pointer-events-none disabled:opacity-70"
                statusClassName="mt-0"
                emailLabel="Email address for newsletter subscription"
              />

              <p className="text-sm text-muted-foreground text-pretty">
                {proofPrefix}
                <span className="font-medium text-foreground">
                  {proofBrands}
                </span>
                .
              </p>
            </div>

            <div className="hidden self-start border border-foreground/15 lg:col-span-5 lg:block">
              <div className="flex items-center justify-between border-b border-foreground/15 px-6 py-4">
                <MonoTag className="tracking-[0.25em]">Vol. 3</MonoTag>
                <MonoTag className="tracking-[0.25em]">Sunday Edition</MonoTag>
              </div>
              <div className="px-6 py-12 text-center">
                <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                  Issue
                </p>
                <p className="mt-3 font-serif text-8xl font-medium leading-none tracking-tight text-foreground tabular-nums">
                  №156
                </p>
              </div>
              <div className="border-t border-foreground/15 px-6 py-4">
                <MonoTag className="block text-center tracking-[0.2em]">
                  Every Sunday · No spam
                </MonoTag>
              </div>
            </div>
          </div>
        </Container>
      </HeroSection>
    )
  },
})
