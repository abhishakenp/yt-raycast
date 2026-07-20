import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

/**
 * FitnessHero — warm, editorial split hero for a gym / fitness-studio landing page.
 * A two-column layout pairing a large two-tone headline (lead in foreground, a
 * highlight phrase in muted), a supporting paragraph, dual CTAs (a filled primary
 * pill with an arrow icon + an outlined secondary), and a row of check-marked
 * member-proof points on the left, with a tall rounded showcase photo carrying a
 * floating member-quote card on the right. CTAs route through section-kit route links. Use as
 * the top hero for gyms, fitness studios, yoga / pilates / boxing / spin studios.
 */
import { Container } from '#/section-kit/Container.tsx'
import { HeroSection } from '#/section-kit/HeroSection.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
export const FitnessHero = defineCapsule({
  name: 'FitnessHero',
  description:
    'Warm, editorial split hero for a gym / fitness-studio landing page: a two-column layout pairing a large two-tone headline (lead in foreground, highlight phrase in muted), a supporting paragraph, dual CTAs (a filled primary pill with an arrow icon and an outlined secondary), and a row of check-marked member-proof points on the left, with a tall rounded showcase photo carrying a floating member-quote card on the right. CTAs route through section-kit route links; the photo uses the alt-driven Image component. Use as the top hero for gyms, fitness studios, CrossFit boxes, yoga, pilates, boxing or spin / cycle studios.',
  props: z.object({
    /** Heading lead text rendered in foreground. */
    headingLead: z.string().optional(),
    /** Phrase rendered in the muted accent color. */
    headingHighlight: z.string().optional(),
    subheading: z.string().optional(),
    primaryCta: z.string().optional(),
    secondaryCta: z.string().optional(),
    proof: z.array(z.string()).optional(),
    imageAlt: z.string().optional(),
    quote: z.string().optional(),
    quoteAuthor: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heroLead = props.headingLead ?? 'Strength through'
    const heroHighlight = props.headingHighlight ?? 'movement'
    const heroSub =
      props.subheading ??
      'Base Fitness Studio offers expert-led classes, personalized training, and a supportive community. Build strength, find balance, and move better every day.'
    const heroPrimary = props.primaryCta ?? 'Explore Classes'
    const heroSecondary = props.secondaryCta ?? 'View Memberships'
    const heroProof = props.proof?.length
      ? props.proof
      : ['3,200+ members', '4.9 rating']
    const heroImageAlt =
      props.imageAlt ??
      'athletic woman performing barbell back squat in modern gym with natural lighting'
    const heroQuote = props.quote ?? "Best fitness decision I've made"
    const heroQuoteAuthor = props.quoteAuthor ?? 'Sarah Chen, member since 2022'
    const CheckIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M5 13l4 4L19 7" />
      </svg>
    )
    return (
      <HeroSection
        variant="split"
        className={cn(
          'relative overflow-hidden py-20 lg:py-28',
          props.className,
        )}
      >
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <div className="space-y-8">
              <h1 className="text-4xl font-semibold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl">
                {heroLead}{' '}
                <span className="text-muted-foreground">{heroHighlight}</span>
              </h1>
              <p className="max-w-lg text-lg leading-relaxed text-muted-foreground md:text-xl">
                {heroSub}
              </p>
              <div className="flex flex-wrap gap-4">
                <NavbarRouteLink
                  className="inline-flex items-center rounded-sm bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  href={heroPrimary}
                >
                  {heroPrimary}
                  <svg
                    className="ml-2 size-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </NavbarRouteLink>
                <NavbarRouteLink
                  className="inline-flex items-center rounded-sm border border-input px-6 py-3 text-sm font-medium text-foreground transition-colors hover:border-border"
                  href={heroSecondary}
                >
                  {heroSecondary}
                </NavbarRouteLink>
              </div>
              <div className="flex items-center gap-6 pt-4 text-sm text-muted-foreground">
                {heroProof.map((proof) => (
                  <div key={proof} className="flex items-center gap-2">
                    <CheckIcon className="size-5" />
                    <span>{proof}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <Image
                alt={heroImageAlt}
                w={800}
                h={1000}
                className="h-[500px] w-full rounded-lg object-cover shadow-2xl lg:h-[600px]"
              />
              <div className="absolute -bottom-6 -left-6 max-w-xs rounded-sm bg-card p-4 shadow-lg">
                <p className="text-sm font-medium text-card-foreground">
                  &ldquo;{heroQuote}&rdquo;
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {heroQuoteAuthor}
                </p>
              </div>
            </div>
          </div>
        </Container>
      </HeroSection>
    )
  },
})
