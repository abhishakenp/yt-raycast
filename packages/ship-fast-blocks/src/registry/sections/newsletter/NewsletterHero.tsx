import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  HeroSection,
  HeroContent,
  HeroSubheading,
} from '#/section-kit/HeroSection.tsx'
import { newsletterLakebed } from './newsletter-lakebed.ts'
import { NewsletterSubscribeForm } from './newsletter-interactions.tsx'

/**
 * NewsletterHero — centered editorial hero for a newsletter / subscription
 * landing page. On a generous paper-toned canvas: an uppercase eyebrow kicker, a
 * large two-line serif display headline, a relaxed lede paragraph, an inline
 * email subscribe form (rounded email input + solid foreground submit button
 * that stacks on mobile), a live subscriber status line, and a small
 * social-proof line with emphasized brand names. Warm, calm, literary mood. The
 * form submit writes to the shared Lakebed subscriber list. Use as the
 * top-of-page hero for newsletters, Substack-style publications, blogs,
 * essayists, or content creators. Renders fully with no props via baked-in
 * defaults.
 */
export const NewsletterHero = defineCapsule({
  name: 'NewsletterHero',
  description:
    'Centered editorial hero for a newsletter / subscription landing page on a generous paper-toned canvas: an uppercase eyebrow kicker, a large two-line serif display headline, a relaxed lede paragraph, an inline email subscribe form (rounded email input + solid foreground submit button that stacks on mobile), a live subscriber status line, and a small social-proof line with emphasized brand names. Warm, calm, literary mood. Submitting writes to the shared Lakebed subscriber list so another subscribe block or admin view can react immediately. Use as the top-of-page hero for newsletters, Substack-style publications, blogs, essayists, or content creators.',
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
          'pb-12 pt-16 md:pb-16 md:pt-24 lg:pb-24 lg:pt-28',
          props.className,
        )}
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <HeroContent className="mx-auto max-w-3xl text-center">
            <p className="mb-4 text-sm font-medium uppercase tracking-wide text-muted-foreground">
              {eyebrow}
            </p>
            <h1 className="mb-6 font-serif text-4xl font-medium leading-tight text-foreground sm:text-5xl lg:text-6xl">
              {headingTop}
              <br className="hidden sm:block" /> {headingBottom}
            </h1>
            <HeroSubheading variant="large" className="mb-8">
              {subheading}
            </HeroSubheading>

            <NewsletterSubscribeForm
              lakebed={lakebed}
              source="Newsletter hero"
              placeholder={emailPlaceholder}
              buttonLabel={submit}
              successMessage="You're subscribed. Your next issue will arrive by email."
              className="mx-auto mb-6 flex max-w-md flex-col gap-3 sm:flex-row"
              inputClassName="flex-1 rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder-muted-foreground transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"
              buttonClassName="rounded-lg bg-foreground px-6 py-3 font-medium text-background transition-colors hover:bg-foreground/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-70"
              emailLabel="Email address for newsletter subscription"
            />

            <p className="text-sm text-muted-foreground">
              {proofPrefix}
              <span className="font-medium text-foreground">{proofBrands}</span>
              .
            </p>
          </HeroContent>
        </div>
      </HeroSection>
    )
  },
})
