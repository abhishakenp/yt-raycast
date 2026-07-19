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
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * KnowledgeBaseGuides — featured step-by-step guides gallery for a help center.
 * A heading + description with a bordered "view all" button on one side, above a
 * responsive 1/2/3-up grid of card buttons: each card has a wide cover image
 * with a token-colored difficulty badge (Beginner/Intermediate/Advanced)
 * overlaid, a title, a description and read-time + step-count meta with icons;
 * cards lift on hover and the image zooms. Calm, light, editorial. Every guide
 * card and the "view all" button route through section-kit route links; covers use the
 * alt-driven Image component. Use to spotlight walkthroughs on a knowledge base
 * or docs site. Renders fully with no props via baked-in defaults.
 */
export const KnowledgeBaseGuides = defineCapsule({
  name: 'KnowledgeBaseGuides',
  description:
    "Featured step-by-step guides gallery for a help center: a heading + description with a bordered 'view all' button on one side, above a responsive 1/2/3-up grid of card buttons — each with a wide cover image plus an overlaid token-colored difficulty badge (Beginner/Intermediate/Advanced), a title, a description and read-time + step-count meta with icons; cards lift on hover and the image zooms. Calm, light, editorial; guide cards and the 'view all' button route through section-kit route links and covers use the alt-driven Image component. Use to spotlight walkthroughs on a knowledge base, support portal or docs site.",
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
      if (l.includes('begin')) return 'bg-chart-2/15 text-chart-2'
      if (l.includes('inter')) return 'bg-chart-4/15 text-chart-4'
      if (l.includes('adv')) return 'bg-destructive/15 text-destructive'
      return 'bg-secondary text-secondary-foreground'
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
          <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <SectionHeading
              align="left"
              title={heading}
              subtitle={description}
              className="gap-0"
              titleId="kb-guides-heading"
              titleClassName="mb-2 text-2xl font-semibold text-foreground sm:text-3xl"
              subtitleClassName="text-muted-foreground"
            />
            <Card
              asChild
              variant="default"
              className="inline-flex cursor-pointer items-center gap-2 px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-muted rounded-lg p-0"
            >
              <NavbarRouteLink href={viewAll}>
                {viewAll}
                <ChevronRight className="size-4" />
              </NavbarRouteLink>
            </Card>
          </div>
          <ArticleGrid cols="1-md-2-3">
            {items.map((guide) => (
              <ArticleCard
                key={guide.title}
                asChild
                variant="default"
                className="block cursor-pointer text-left transition-all hover:shadow-lg"
              >
                <NavbarRouteLink href={guide.title}>
                  <ArticleMedia aspect="16-9">
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
                          'rounded px-2 py-1 text-xs font-medium',
                          levelTone(guide.level),
                        )}
                      >
                        {guide.level}
                      </span>
                    </span>
                  </ArticleMedia>
                  <ArticleContent className="p-6">
                    <h3 className="mb-2 text-lg font-semibold text-card-foreground transition-colors group-hover:text-muted-foreground">
                      {guide.title}
                    </h3>
                    <p className="mb-4 text-sm text-muted-foreground">
                      {guide.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <ClockIcon />
                        {guide.readTime}
                      </span>
                      <span className="flex items-center gap-1">
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
