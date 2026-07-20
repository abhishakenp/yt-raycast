import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { Card } from '#/section-kit/Card.tsx'
import {
  ArticleGrid,
  ArticleCard,
  ArticleMedia,
  ArticleContent,
} from '#/section-kit/ArticleGrid.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * KnowledgeBaseGuides — "Terminal-docs" featured step-by-step guides ledger for
 * a help center. An asymmetric header row (left-aligned heading + description
 * beside a mono "view all" link) sits above a collapsed-border hairline grid of
 * routable guide cards: each square cell has a wide cover image with a square
 * hairline mono difficulty badge (Beginner/Intermediate/Advanced) overlaid, a
 * tabular mono index numeral, a `#`-anchored bold title, a description and a
 * hairline mono read-time + step-count meta row with icons; the image zooms and
 * cells tint on hover. Calm, hairline, reference aesthetic. Every guide card
 * and the "view all" link route through section-kit route links; covers use the
 * alt-driven Image component. Use to spotlight walkthroughs on a knowledge base
 * or docs site. Renders fully with no props via baked-in defaults. Theme tokens
 * only.
 */
export const KnowledgeBaseGuides = defineCapsule({
  name: 'KnowledgeBaseGuides',
  description:
    "Terminal-docs featured step-by-step guides ledger for a help center: an asymmetric header row (left-aligned heading + description beside a mono 'view all' link) above a collapsed-border hairline grid of routable guide cards — each square cell has a wide cover image with a square hairline mono difficulty badge (Beginner/Intermediate/Advanced) overlaid, a tabular mono index numeral, a '#'-anchored bold title, a description and a hairline mono read-time + step-count meta row with icons; the image zooms and cells tint on hover. Calm, hairline, reference aesthetic; guide cards and the 'view all' link route through section-kit route links and covers use the alt-driven Image component. Use to spotlight walkthroughs on a knowledge base, support portal or docs site.",
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    viewAll: z.string().optional(),
    items: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
          level: z.string(),
          readTime: z.string(),
          steps: z.string(),
          imageAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Featured Guides'
    const description =
      props.description ??
      'Step-by-step walkthroughs for common workflows and setups.'
    const viewAll = props.viewAll ?? 'View all guides'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Complete Setup Guide for New Teams',
            description:
              'Get your team up and running in under 30 minutes with workspaces, projects, and initial configurations.',
            level: 'Beginner',
            readTime: '25 min read',
            steps: '12 steps',
            imageAlt:
              'Modern laptop displaying analytics dashboard with charts on a clean desk',
          },
          {
            title: 'Building Custom Reports & Dashboards',
            description:
              'Learn to create, schedule, and share custom reports with filters, grouping, and visualization options.',
            level: 'Intermediate',
            readTime: '40 min read',
            steps: '18 steps',
            imageAlt:
              'Data visualization dashboard showing colorful analytics charts and metrics',
          },
          {
            title: 'Advanced API Integration Patterns',
            description:
              'Deep dive into webhooks, batch operations, error handling, and building resilient integrations.',
            level: 'Advanced',
            readTime: '55 min read',
            steps: '24 steps',
            imageAlt:
              'Software developer writing code on multiple monitors showing programming interfaces',
          },
        ]

    const levelTone = (level: string) => {
      const l = level.toLowerCase()
      if (l.includes('begin'))
        return 'border-chart-2/40 bg-background text-chart-2'
      if (l.includes('inter'))
        return 'border-chart-4/40 bg-background text-chart-4'
      if (l.includes('adv'))
        return 'border-destructive/40 bg-background text-destructive'
      return 'border-border bg-background text-secondary-foreground'
    }

    const ChevronRight = ({ className }: { className?: string }) => (
      <svg
        className={className}
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
        <polyline points="9 5 16 12 9 19" />
      </svg>
    )

    const ClockIcon = () => (
      <svg
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
        <circle cx="12" cy="12" r="9" />
        <polyline points="12 7 12 12 15 14" />
      </svg>
    )

    const ListIcon = () => (
      <svg
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
        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6l6 6v10a2 2 0 0 1-2 2z" />
      </svg>
    )

    return (
      <section
        className={cn('bg-background py-16 sm:py-20', props.className)}
        aria-labelledby="kb-guides-heading"
      >
        <Container>
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              align="left"
              title={heading}
              subtitle={description}
              className="max-w-2xl gap-3"
              titleId="kb-guides-heading"
              titleClassName="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl"
              subtitleClassName="text-muted-foreground"
            />
            <Card
              asChild
              variant="outline"
              className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-none border border-border bg-background p-0 px-4 py-2 font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-foreground transition-colors hover:bg-muted active:translate-y-px"
            >
              <NavbarRouteLink href={viewAll}>
                {viewAll}
                <ChevronRight className="size-4" />
              </NavbarRouteLink>
            </Card>
          </div>
          <ArticleGrid
            cols="1-md-2-3"
            className="gap-0 border-l border-t border-border"
          >
            {items.map((guide, i) => (
              <ArticleCard
                key={guide.title}
                asChild
                variant="none"
                className="block cursor-pointer rounded-none border-0 border-b border-r border-border bg-transparent text-left transition-colors hover:bg-muted/40"
              >
                <NavbarRouteLink href={guide.title}>
                  <ArticleMedia
                    aspect="16-9"
                    className="rounded-none border-b border-border"
                  >
                    <Image
                      alt={guide.imageAlt}
                      w={800}
                      h={450}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute left-3 top-3">
                      <span
                        className={cn(
                          'rounded-none border px-2 py-0.5 font-mono text-[11px] uppercase tracking-[0.12em]',
                          levelTone(guide.level),
                        )}
                      >
                        {guide.level}
                      </span>
                    </span>
                  </ArticleMedia>
                  <ArticleContent className="p-6">
                    <span
                      aria-hidden="true"
                      className="font-mono text-[11px] tabular-nums tracking-[0.2em] text-muted-foreground/60"
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 className="mb-2 mt-3 text-lg font-bold tracking-tight text-card-foreground">
                      <span
                        aria-hidden="true"
                        className="mr-2 font-mono font-normal text-muted-foreground/50 transition-colors group-hover:text-primary"
                      >
                        #
                      </span>
                      {guide.title}
                    </h3>
                    <p className="mb-6 text-sm text-muted-foreground">
                      {guide.description}
                    </p>
                    <div className="flex items-center gap-4 border-t border-border pt-4 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <ClockIcon />
                        {guide.readTime}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <ListIcon />
                        {guide.steps}
                      </span>
                    </div>
                  </ArticleContent>
                </NavbarRouteLink>
              </ArticleCard>
            ))}
          </ArticleGrid>
        </Container>
      </section>
    )
  },
})
