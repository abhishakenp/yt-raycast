import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Card } from '#/section-kit/Card.tsx'

import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  PopularList,
  PopularItem,
  PopularCard,
  PopularMeta,
} from '#/section-kit/PopularList.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * KnowledgeBasePopular — "Terminal-docs" most-viewed article ledger beside a
 * hairline-railed support index for a help center. A naturally sidebar-
 * asymmetric 2:1 split: the two-thirds column is a collapsed-border article
 * ledger whose rows each pair a tabular mono index numeral with a `#`-anchored
 * bold title, a one-line description, a mono view-count + updated meta row and
 * an arrow that slides on hover, under a left-aligned heading with a mono
 * "view all" link; the one-third aside is an index rail (hairline left border)
 * stacking a mono `## Trending` list (title + percent-change rows) and a
 * square "Need more help?" panel of chat/contact links. Calm, hairline,
 * reference aesthetic; every article, trending row and help link routes
 * through section-kit route links. Use as the browse-popular section of a
 * knowledge base or support portal. Renders fully with no props via baked-in
 * defaults. Theme tokens only.
 */
export const KnowledgeBasePopular = defineCapsule({
  name: 'KnowledgeBasePopular',
  description:
    "Terminal-docs most-viewed article ledger beside a hairline-railed support index for a help center: a sidebar-asymmetric 2:1 split — the two-thirds column is a collapsed-border article ledger whose rows each pair a tabular mono index numeral with a '#'-anchored bold title, a one-line description, a mono view-count + updated meta row and an arrow that slides on hover, under a left-aligned heading with a mono 'view all' link; the one-third aside is an index rail (hairline left border) stacking a mono '## Trending' list (title + percent-change rows) and a square 'Need more help?' panel of chat/contact links. Calm, hairline, reference aesthetic; every article, trending row and help link routes through section-kit route links. Use as the browse-popular section of a knowledge base, support portal or docs site.",
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
              <div className="mb-8 flex items-end justify-between gap-6">
                <SectionHeading
                  align="left"
                  title={heading}
                  subtitle={description}
                  className="gap-3"
                  titleId="kb-popular-heading"
                  titleClassName="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl"
                  subtitleClassName="text-muted-foreground"
                />
                <p
                  aria-hidden="true"
                  className="hidden shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] tabular-nums text-muted-foreground/60 sm:block"
                >
                  [ {String(items.length).padStart(2, '0')} entries ]
                </p>
              </div>
              <div className="divide-y divide-border border-y border-border">
                {items.map((art, i) => (
                  <PopularItem key={art.title}>
                    <PopularCard
                      asChild
                      className="group w-full items-start gap-4 rounded-none border-0 bg-transparent px-0 py-5 transition-colors hover:bg-muted/40"
                    >
                      <NavbarRouteLink href={art.title}>
                        <span
                          aria-hidden="true"
                          className="mt-0.5 shrink-0 font-mono text-[11px] tabular-nums tracking-[0.2em] text-muted-foreground/60"
                        >
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-base font-bold tracking-tight text-foreground">
                            <span
                              aria-hidden="true"
                              className="mr-2 font-mono font-normal text-muted-foreground/50 transition-colors group-hover:text-primary"
                            >
                              #
                            </span>
                            {art.title}
                          </span>
                          <span className="mt-1 block text-sm text-muted-foreground">
                            {art.description}
                          </span>
                          <PopularMeta asChild>
                            <span className="mt-2 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.12em]">
                              <span className="flex items-center gap-1">
                                <EyeIcon />
                                {art.views}
                              </span>
                              <span>{art.updated}</span>
                            </span>
                          </PopularMeta>
                        </span>
                        <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-[transform,color] duration-150 group-hover:translate-x-1 group-hover:text-primary" />
                      </NavbarRouteLink>
                    </PopularCard>
                  </PopularItem>
                ))}
              </div>
              <div className="mt-8">
                <NavbarRouteLink
                  className="inline-flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-foreground transition-colors hover:text-primary active:translate-y-px"
                  href={viewAll}
                >
                  {viewAll}
                  <ArrowRight className="size-4" />
                </NavbarRouteLink>
              </div>
            </div>

            <aside
              className="lg:col-span-1 lg:border-l lg:border-border lg:pl-8"
              aria-label="Trending topics and support links"
            >
              <div className="mb-10">
                <h3 className="mb-4 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {trendingHeading}
                </h3>
                <div className="divide-y divide-border border-y border-border">
                  {trending.map((t, i) => (
                    <NavbarRouteLink
                      key={t.title}
                      className="group flex w-full items-baseline gap-3 py-3 text-left"
                      href={t.title}
                    >
                      <span
                        aria-hidden="true"
                        className="shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground/50"
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-secondary-foreground transition-colors group-hover:text-foreground">
                          {t.title}
                        </span>
                        <PopularMeta asChild>
                          <span className="mt-0.5 block font-mono text-[11px] uppercase tracking-[0.12em] tabular-nums text-primary">
                            {t.change}
                          </span>
                        </PopularMeta>
                      </span>
                    </NavbarRouteLink>
                  ))}
                </div>
              </div>

              <Card className="rounded-none">
                <h3 className="mb-4 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {helpHeading}
                </h3>
                <PopularList className="space-y-3">
                  {helpLinks.map((link) => (
                    <li key={link}>
                      <NavbarRouteLink
                        className="flex items-center gap-3 text-sm text-secondary-foreground transition-colors hover:text-foreground"
                        href={link}
                      >
                        <ChatIcon className="size-5 text-muted-foreground" />
                        {link}
                      </NavbarRouteLink>
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
