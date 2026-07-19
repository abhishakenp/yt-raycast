import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { Card } from '#/section-kit/Card.tsx'
import {
  HeroSection,
  HeroStatBadge,
  HeroStatBadgeIcon,
  HeroStatBadgeContent,
  HeroStatBadgeTitle,
  HeroStatBadgeSubtitle,
} from '#/section-kit/HeroSection.tsx'
import { StarRating } from '#/section-kit/StarRating.tsx'

/**
 * OnlineCourseHero — split, two-column hero for an online-course / e-learning
 * landing page. Left column: a pill enrollment badge with a pulsing dot, a huge
 * tracking-tight headline, a relaxed subheading, dual CTAs (solid primary +
 * outlined "Watch Demo" with a play glyph), and an overlapping avatar
 * social-proof row. Right column: a rounded showcase photo with a floating
 * "Certificate Issued" card (bottom-left) and a floating star-rating card
 * (top-right). All CTAs route through useNavigate. Use as the top hero for
 * course platforms, e-learning marketplaces, bootcamps, academies, or any
 * skill-learning subscription product. Renders fully with no props.
 */
export const OnlineCourseHero = defineCapsule({
  name: 'OnlineCourseHero',
  description:
    'Split two-column hero for an online-course / e-learning landing page: left column has a pill enrollment badge with a pulsing dot, a huge tracking-tight headline, a relaxed subheading, dual CTAs (solid primary + outlined Watch Demo with a play glyph), and an overlapping avatar social-proof row; right column has a rounded showcase photo with a floating Certificate Issued card and a floating star-rating card. CTAs route through useNavigate. Use as the top hero for course platforms, e-learning marketplaces, bootcamps, academies, or skill-learning subscription products.',
  props: z.object({
    badge: z.string().optional(),
    heading: z.string().optional(),
    subheading: z.string().optional(),
    primaryCta: z.string().optional(),
    secondaryCta: z.string().optional(),
    socialProof: z.string().optional(),
    /** Alt-text-driven avatars for the overlapping social-proof row. */
    avatars: z.array(z.string()).optional(),
    imageAlt: z.string().optional(),
    certTitle: z.string().optional(),
    certSubtitle: z.string().optional(),
    rating: z.string().optional(),
    ratingNote: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const badge = props.badge ?? 'Over 50,000 students enrolled this month'
    const heading = props.heading ?? 'Master the skills that shape the future'
    const subheading =
      props.subheading ??
      'Learn from industry experts with hands-on projects, earn recognized certificates, and join a community of 2 million+ learners advancing their careers.'
    const primaryCta = props.primaryCta ?? 'Explore Courses'
    const secondaryCta = props.secondaryCta ?? 'Watch Demo'
    const socialProof =
      props.socialProof ?? 'Joined by 2,400+ learners this week'
    const avatars = props.avatars?.length
      ? props.avatars
      : [
          'professional headshot of a smiling woman with brown hair',
          'professional headshot of a man in his 30s with short dark hair',
          'professional headshot of a woman with blonde hair smiling',
          'professional headshot of a young man with beard and glasses',
        ]
    const imageAlt =
      props.imageAlt ??
      'diverse group of young professionals collaborating around a laptop in a modern office'
    const certTitle = props.certTitle ?? 'Certificate Issued'
    const certSubtitle = props.certSubtitle ?? 'Sarah completed UX Design'
    const rating = props.rating ?? '4.9/5'
    const ratingNote = props.ratingNote ?? 'From 12,847 reviews'

    return (
      <HeroSection
        variant="split"
        className={cn('py-20 sm:py-28 lg:py-28', props.className)}
      >
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="max-w-2xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1">
                <span className="size-2 rounded-full bg-primary" />
                <span className="text-xs font-medium text-muted-foreground">
                  {badge}
                </span>
              </div>
              <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                {heading}
              </h1>
              <p className="mb-8 text-lg leading-relaxed text-muted-foreground sm:text-xl">
                {subheading}
              </p>
              <div className="mb-8 flex flex-col gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(primaryCta)}
                  className="rounded-lg bg-primary px-6 py-3.5 text-center font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {primaryCta}
                </button>
                <button
                  type="button"
                  onClick={() => go(secondaryCta)}
                  className="flex items-center justify-center gap-2 rounded-lg border border-border px-6 py-3.5 font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {secondaryCta}
                </button>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex -space-x-2">
                  {avatars.map((alt) => (
                    <Image
                      key={alt}
                      alt={alt}
                      w={100}
                      h={100}
                      className="size-8 rounded-full border-2 border-background object-cover"
                    />
                  ))}
                </div>
                <span>{socialProof}</span>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
                <Image
                  alt={imageAlt}
                  w={1200}
                  h={900}
                  className="size-full object-cover"
                />
              </div>
              <HeroStatBadge className="absolute -bottom-6 -left-6 flex max-w-xs items-center gap-3">
                <HeroStatBadgeIcon className="size-12 bg-primary/10 text-primary">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </HeroStatBadgeIcon>
                <HeroStatBadgeContent>
                  <HeroStatBadgeTitle className="font-semibold">
                    {certTitle}
                  </HeroStatBadgeTitle>
                  <HeroStatBadgeSubtitle className="text-sm">
                    {certSubtitle}
                  </HeroStatBadgeSubtitle>
                </HeroStatBadgeContent>
              </HeroStatBadge>
              <Card
                className="absolute -right-4 -top-4 px-4 py-3 p-0 shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <StarRating rating={5} size="md" color="primary" />
                  <span className="font-semibold text-card-foreground">
                    {rating}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {ratingNote}
                </p>
              </Card>
            </div>
          </div>
        </Container>
      </HeroSection>
    )
  },
})
