import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Card } from '#/section-kit/Card.tsx'

import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  PopularList,
  PopularItem,
  PopularCard,
  PopularMeta,
} from '#/section-kit/PopularList.tsx'

/**
 * KnowledgeBasePopular — popular-articles list beside a sticky-style support
 * sidebar for a help center. A two-thirds column lists the most-viewed articles
 * as full-width row buttons (eye-icon tile, title, description, view-count +
 * updated meta, trailing chevron) under a heading + description with a
 * "view all" link; a one-third aside stacks a muted "Trending Topics" panel
 * (title + percent-change rows) and a bordered "Need more help?" card of
 * chat/contact links. Calm, light, editorial. Every article, trending row and
 * help link routes through useNavigate. Use as the browse-popular section of a
 * knowledge base or support portal. Renders fully with no props via baked-in
 * defaults.
 */
export const KnowledgeBasePopular = defineCapsule({
  name: 'KnowledgeBasePopular',
  description:
    "Popular-articles list beside a support sidebar for a help center: a two-thirds column lists the most-viewed articles as full-width row buttons (eye-icon tile, title, description, view-count + updated meta, trailing chevron) under a heading + description with a 'view all' link; a one-third aside stacks a muted 'Trending Topics' panel (title + percent-change rows) and a bordered 'Need more help?' card of chat/contact links. Calm, light, editorial; every article, trending row and help link routes through useNavigate. Use as the browse-popular section of a knowledge base, support portal or docs site.",
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    viewAll: z.string().optional(),
    items: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
          views: z.string(),
          updated: z.string(),
        }),
      )
      .optional(),
    trendingHeading: z.string().optional(),
    trending: z
      .array(z.object({ title: z.string(), change: z.string() }))
      .optional(),
    helpHeading: z.string().optional(),
    helpLinks: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading = props.heading ?? 'Popular Articles'
    const description =
      props.description ??
      'The most viewed help articles from the past 30 days.'
    const viewAll = props.viewAll ?? 'View all 234 articles'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'How to set up two-factor authentication (2FA)',
            description:
              'Secure your account with an authenticator app or SMS verification',
            views: '12.4k views',
            updated: 'Updated 3 days ago',
          },
          {
            title: 'Understanding your monthly invoice and charges',
            description:
              'Breakdown of usage-based pricing, overages, and discounts',
            views: '9.8k views',
            updated: 'Updated 1 week ago',
          },
          {
            title: 'Getting started with the REST API',
            description:
              'Authentication, rate limits, and your first API request',
            views: '8.2k views',
            updated: 'Updated 2 days ago',
          },
          {
            title: 'Connecting Slack for team notifications',
            description: 'Configure webhooks and customize alert channels',
            views: '7.5k views',
            updated: 'Updated 5 days ago',
          },
          {
            title: 'Managing team members and permissions',
            description: 'Invite users, assign roles, and set access levels',
            views: '6.9k views',
            updated: 'Updated 1 day ago',
          },
          {
            title: 'How to migrate data from your old platform',
            description: 'Step-by-step import guide with CSV templates',
            views: '6.3k views',
            updated: 'Updated 2 weeks ago',
          },
        ]
    const trendingHeading = props.trendingHeading ?? 'Trending Topics'
    const trending = props.trending?.length
      ? props.trending
      : [
          { title: 'Webhook configuration errors', change: '+340% this week' },
          { title: 'SSO setup with Okta', change: '+215% this week' },
          { title: 'Exporting data to PDF', change: '+178% this week' },
          { title: 'Custom domain SSL issues', change: '+142% this week' },
          { title: 'API rate limit increases', change: '+98% this week' },
        ]
    const helpHeading = props.helpHeading ?? 'Need More Help?'
    const helpLinks = props.helpLinks?.length
      ? props.helpLinks
      : ['Start live chat', 'Email support', 'Documentation', 'Community forum']

    const EyeIcon = () => (
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    )

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

    const ArrowRight = ({ className }: { className?: string }) => (
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
        <line x1="3" y1="12" x2="19" y2="12" />
        <polyline points="13 6 19 12 13 18" />
      </svg>
    )

    const ChatIcon = ({ className }: { className?: string }) => (
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
        <path d="M21 11.5a8.38 8.38 0 0 1-9 8.5 9.86 9.86 0 0 1-4.26-.95L3 20l1.4-3.72A8.5 8.5 0 0 1 12 3a8.38 8.38 0 0 1 9 8.5z" />
      </svg>
    )

    return (
      <section
        className={cn(
          'border-b border-border bg-card py-16 sm:py-20',
          props.className,
        )}
        aria-labelledby="kb-popular-heading"
      >
        <Container>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <SectionHeading
                align="left"
                title={heading}
                subtitle={description}
                className="gap-0"
                titleId="kb-popular-heading"
                titleClassName="mb-3 text-2xl font-semibold text-foreground sm:text-3xl"
                subtitleClassName="mb-8 text-muted-foreground"
              />
              <div className="space-y-4">
                {items.map((art) => (
                  <PopularItem key={art.title}>
                    <PopularCard
                      asChild
                      className="group w-full items-start rounded-lg border-0 bg-transparent hover:bg-muted"
                    >
                      <button type="button" onClick={() => go(art.title)}>
                        <span className="grid size-10 flex-shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-accent">
                          <EyeIcon />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-base font-medium text-foreground transition-colors group-hover:text-muted-foreground">
                            {art.title}
                          </span>
                          <span className="mt-1 block text-sm text-muted-foreground">
                            {art.description}
                          </span>
                          <PopularMeta asChild>
                            <span className="mt-2 flex items-center gap-3">
                              <span className="flex items-center gap-1">
                                <EyeIcon />
                                {art.views}
                              </span>
                              <span>{art.updated}</span>
                            </span>
                          </PopularMeta>
                        </span>
                        <ChevronRight className="size-5 flex-shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
                      </button>
                    </PopularCard>
                  </PopularItem>
                ))}
              </div>
              <div className="mt-8">
                <button
                  type="button"
                  onClick={() => go(viewAll)}
                  className="inline-flex items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-muted-foreground"
                >
                  {viewAll}
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </div>

            <aside
              className="lg:col-span-1"
              aria-label="Trending topics and support links"
            >
              <div className="mb-6 rounded-xl bg-muted p-6">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-foreground">
                  {trendingHeading}
                </h3>
                <div className="space-y-3">
                  {trending.map((t) => (
                    <button
                      key={t.title}
                      type="button"
                      onClick={() => go(t.title)}
                      className="group block w-full text-left"
                    >
                      <span className="block text-sm font-medium text-secondary-foreground transition-colors group-hover:text-foreground">
                        {t.title}
                      </span>
                      <PopularMeta asChild>
                        <span className="mt-0.5 block">{t.change}</span>
                      </PopularMeta>
                    </button>
                  ))}
                </div>
              </div>

              <Card>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-foreground">
                  {helpHeading}
                </h3>
                <PopularList className="space-y-3">
                  {helpLinks.map((link) => (
                    <li key={link}>
                      <button
                        type="button"
                        onClick={() => go(link)}
                        className="flex items-center gap-3 text-sm text-secondary-foreground transition-colors hover:text-foreground"
                      >
                        <ChatIcon className="size-5 text-muted-foreground" />
                        {link}
                      </button>
                    </li>
                  ))}
                </PopularList>
              </Card>
            </aside>
          </div>
        </Container>
      </section>
    )
  },
})
