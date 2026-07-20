import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { Card } from '#/section-kit/Card.tsx'
import { DotGrid, Watermark } from '#/section-kit/Decor.tsx'
import {
  HeroSection,
  HeroStatBadge,
  HeroStatBadgeIcon,
  HeroStatBadgeContent,
  HeroStatBadgeTitle,
  HeroStatBadgeSubtitle,
} from '#/section-kit/HeroSection.tsx'
import { StarRating } from '#/section-kit/StarRating.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * OnlineCourseHero — "Curriculum LMS" asymmetric 7:5 split hero for an
 * online-course / e-learning landing page. Over a dot-grid background with a
 * giant ghost "01" watermark, the left column opens with a square mono
 * enrollment chip (pulsing live dot), a decorative "> enroll --track" prompt
 * line, a giant tracking-tight headline whose key word carries a marker
 * highlight, a relaxed subheading, dual CTAs (a hard-offset-shadow primary
 * block + a bracketed mono outline "Watch Demo" with a play glyph), and an
 * overlapping avatar social-proof row. The right column frames a showcase photo
 * as a hairline course-preview panel (mono title bar, hard offset shadow) with
 * a floating square "Certificate Issued" stat card and a floating square
 * star-rating card. All CTAs route through section-kit route links. Use as the
 * top hero for course platforms, e-learning marketplaces, bootcamps,
 * academies, or skill-learning subscription products. Renders fully with no
 * props.
 */
export const OnlineCourseHero = defineCapsule({
  name: 'OnlineCourseHero',
  description:
    'Curriculum-LMS asymmetric 7:5 split hero for an online-course / e-learning landing page: over a dot-grid background with a giant ghost "01" watermark, the left column has a square mono enrollment chip with a pulsing dot, a decorative "> enroll --track" prompt line, a giant tracking-tight headline with a marker-highlighted key word, a relaxed subheading, dual CTAs (a hard-offset-shadow primary block + a bracketed mono outline Watch Demo with a play glyph), and an overlapping avatar social-proof row; the right column frames a showcase photo as a hairline course-preview panel (mono title bar, hard offset shadow) with a floating square Certificate Issued stat card and a floating square star-rating card. CTAs route through section-kit route links. Use as the top hero for course platforms, e-learning marketplaces, bootcamps, academies, or skill-learning subscription products.',
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

    const headingWords = heading.split(' ')
    const headingLead = headingWords.slice(0, -1).join(' ')
    const headingMark = headingWords.at(-1) ?? ''

    return (
      <HeroSection
        variant="split"
        className={cn(
          'relative overflow-hidden bg-background py-20 sm:py-28 lg:py-28',
          props.className,
        )}
      >
        <DotGrid tone="border" className="inset-0 opacity-40" />
        <Watermark
          aria-hidden="true"
          className="-right-6 top-10 font-mono text-[8rem] sm:-right-10 sm:text-[15rem]"
        >
          01
        </Watermark>
        <Container className="relative">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="max-w-2xl lg:col-span-7">
              <div className="mb-6 inline-flex items-center gap-2 rounded-none border border-border bg-background px-3 py-1.5">
                <span
                  aria-hidden="true"
                  className="size-2 animate-pulse rounded-full bg-primary"
                />
                <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                  {badge}
                </span>
              </div>
              <p
                aria-hidden="true"
                className="mb-4 font-mono text-sm text-muted-foreground"
              >
                <span className="text-primary">{'>'}</span> enroll --track
                self-paced
              </p>
              <h1 className="mb-6 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                {headingLead}{' '}
                <span className="-mx-1 box-decoration-clone bg-primary/15 px-2">
                  {headingMark}
                </span>
              </h1>
              <p className="mb-8 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                {subheading}
              </p>
              <div className="mb-8 grid grid-cols-1 gap-3 sm:flex sm:flex-row sm:gap-4">
                <NavbarRouteLink
                  className="inline-flex items-center justify-center rounded-none bg-primary px-6 py-3.5 text-center font-mono text-sm font-semibold uppercase tracking-[0.12em] text-primary-foreground shadow-[6px_6px_0_0] shadow-primary/25 transition-[transform,box-shadow,background-color] duration-150 hover:bg-primary/90 active:translate-y-px active:shadow-none motion-reduce:transform-none"
                  href={primaryCta}
                >
                  {primaryCta}
                </NavbarRouteLink>
                <NavbarRouteLink
                  className="inline-flex items-center justify-center gap-2 rounded-none border border-border bg-background px-6 py-3.5 font-mono text-sm font-medium uppercase tracking-[0.12em] text-foreground transition-colors duration-150 hover:bg-foreground hover:text-background active:translate-y-px motion-reduce:transform-none"
                  href={secondaryCta}
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
                    <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {secondaryCta}
                </NavbarRouteLink>
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
                <span className="font-mono text-[11px] uppercase tracking-[0.12em]">
                  {socialProof}
                </span>
              </div>
            </div>
            <div className="relative lg:col-span-5">
              <div className="overflow-hidden rounded-none border border-border bg-card shadow-[8px_8px_0_0] shadow-foreground/10">
                <div className="flex items-center gap-2 border-b border-border bg-muted px-4 py-2.5">
                  <span
                    aria-hidden="true"
                    className="size-2 rounded-full bg-primary"
                  />
                  <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                    module 01 · preview
                  </span>
                </div>
                <div className="aspect-[4/3] overflow-hidden bg-muted">
                  <Image
                    alt={imageAlt}
                    w={1200}
                    h={900}
                    className="size-full object-cover"
                  />
                </div>
              </div>
              <HeroStatBadge className="absolute -bottom-6 -left-4 flex max-w-xs items-center gap-3 rounded-none border-border shadow-[6px_6px_0_0] shadow-foreground/10 sm:-left-6">
                <HeroStatBadgeIcon className="size-12 rounded-none bg-primary/10 text-primary">
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
                  <HeroStatBadgeSubtitle className="font-mono text-[11px] uppercase tracking-[0.1em]">
                    {certSubtitle}
                  </HeroStatBadgeSubtitle>
                </HeroStatBadgeContent>
              </HeroStatBadge>
              <Card className="absolute -right-4 -top-4 rounded-none border-border p-4 shadow-[6px_6px_0_0] shadow-foreground/10">
                <div className="flex items-center gap-2">
                  <StarRating rating={5} size="md" color="foreground" />
                  <span className="font-mono font-semibold tabular-nums text-card-foreground">
                    {rating}
                  </span>
                </div>
                <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
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
