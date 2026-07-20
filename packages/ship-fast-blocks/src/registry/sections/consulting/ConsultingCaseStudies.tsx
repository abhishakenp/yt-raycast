import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

import { Container } from '#/section-kit/Container.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { Card } from '#/section-kit/Card.tsx'
import {
  PortfolioGrid,
  PortfolioItem,
  PortfolioMedia,
  PortfolioCaption,
} from '#/section-kit/PortfolioGrid.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * ConsultingCaseStudies — Swiss editorial engagement dossier grid for a
 * management-consulting firm page. On a muted wash band: a mono "04 / Selected
 * Work" metadata rail with a hairline rule, then an asymmetric header — serif
 * heading + lede left, a mono uppercase "View All" link with a primary
 * underline accent and press feedback right. Below, a staggered 3-column grid
 * of sharp hairline-framed dossier cards (middle column dropped on desktop for
 * an offset rhythm): each card pairs the alt-driven photo (subtle zoom on
 * hover) with a square mono tag chip, a serif title, a description, and a
 * hairline-topped mono duration/period ledger row. Every card and the view-all
 * link route through section-kit route links. Use to showcase consulting case
 * studies, client success stories, or industry-specific engagements. Renders
 * fully with no props via six baked-in default case studies.
 */
export const ConsultingCaseStudies = defineCapsule({
  name: 'ConsultingCaseStudies',
  description:
    "Swiss editorial engagement dossier grid for a management-consulting firm page: on a muted wash band, a mono '04 / Selected Work' metadata rail with hairline rule, an asymmetric header (serif heading + lede left, mono uppercase 'View All' link with primary underline accent right), then a staggered 3-column grid of sharp hairline-framed dossier cards — alt-driven photo with subtle hover zoom and square mono tag chip, serif title, description, and a hairline-topped mono duration/period ledger row. Cards and the view-all link route through section-kit route links. Use to showcase consulting case studies, client success stories, or industry-specific engagements.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** "View All" link label. */
    viewAll: z.string().optional(),
    /** Case-study cards: tag, title, description, duration, period, imageAlt. */
    items: z
      .array(
        z.object({
          tag: z.string(),
          title: z.string(),
          description: z.string(),
          duration: z.string(),
          period: z.string(),
          imageAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Featured Case Studies'
    const description =
      props.description ??
      "Real results from real partnerships. Explore how we've helped clients across industries achieve transformative outcomes."
    const viewAll = props.viewAll ?? 'View All Insights'
    const items = props.items?.length
      ? props.items
      : [
          {
            tag: 'Financial Services',
            title: "Transforming a Regional Bank's Digital Ecosystem",
            description:
              'Helped First Capital Bank redesign their digital platform, resulting in 47% increase in mobile adoption and $23M in operational savings over 18 months.',
            duration: '18-month engagement',
            period: '2023-2024',
            imageAlt:
              'Modern glass skyscraper headquarters building in downtown business district',
          },
          {
            tag: 'Manufacturing',
            title: 'Operational Turnaround for Industrial Manufacturer',
            description:
              'Partnered with Meridian Industrial to implement lean manufacturing principles, reducing production costs by 31% and improving on-time delivery to 97%.',
            duration: '24-month engagement',
            period: '2022-2024',
            imageAlt:
              'Advanced manufacturing facility with robotic arms assembling products on production line',
          },
          {
            tag: 'Healthcare',
            title: 'Post-Merger Integration for Health System Expansion',
            description:
              'Guided Westview Health System through the integration of three acquired hospitals, achieving $85M in synergies while maintaining quality of care standards.',
            duration: '36-month engagement',
            period: '2021-2024',
            imageAlt:
              'Healthcare professionals reviewing patient data on tablets in modern hospital setting',
          },
          {
            tag: 'Retail',
            title: 'Omnichannel Strategy for National Retailer',
            description:
              'Developed and executed an omnichannel transformation for Carter Retail Group, driving 28% growth in e-commerce revenue and improving customer lifetime value by 34%.',
            duration: '30-month engagement',
            period: '2022-2024',
            imageAlt:
              'Retail store interior with customers shopping and modern product displays',
          },
          {
            tag: 'Energy',
            title: 'Sustainability Transformation for Energy Provider',
            description:
              "Supported Pacific Energy's transition to renewable sources, developing a 10-year roadmap that positions the company for carbon neutrality by 2035.",
            duration: '15-month engagement',
            period: '2023-2024',
            imageAlt:
              'Sustainable office building with green rooftop garden and solar panels',
          },
          {
            tag: 'Technology',
            title: 'Product Strategy for SaaS Market Leader',
            description:
              'Helped CloudSync Technologies redefine their product portfolio, entering three new market segments and increasing ARR by $42M in the first year.',
            duration: '12-month engagement',
            period: '2023-2024',
            imageAlt:
              'Software development team collaborating on multiple monitors in modern tech office',
          },
        ]

    const ArrowRight = () => (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <line x1="3" y1="12" x2="21" y2="12" />
        <polyline points="14 5 21 12 14 19" />
      </svg>
    )

    return (
      <section
        className={cn(
          'relative overflow-hidden bg-muted/40 py-16 sm:py-20 lg:py-28',
          props.className,
        )}
      >
        <Container>
          <div className="mb-8 flex items-center gap-4">
            <span aria-hidden="true" className="size-2 shrink-0 bg-primary" />
            <MonoTag className="shrink-0">04 / Selected Work</MonoTag>
            <span aria-hidden="true" className="h-px flex-1 bg-border" />
            <MonoTag tone="faint" className="hidden tabular-nums sm:inline">
              {String(items.length).padStart(2, '0')} Engagements
            </MonoTag>
          </div>

          <div className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between lg:mb-16">
            <SectionHeading
              align="left"
              title={heading}
              subtitle={description}
              className="gap-4"
              titleClassName="font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl"
              subtitleClassName="max-w-2xl text-lg text-muted-foreground"
            />
            <NavbarRouteLink
              className="inline-flex shrink-0 items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-foreground underline decoration-primary decoration-2 underline-offset-8 transition-colors duration-150 hover:text-muted-foreground active:translate-y-px"
              href={viewAll}
            >
              {viewAll}
              <ArrowRight />
            </NavbarRouteLink>
          </div>

          <PortfolioGrid
            cols="1-2-3"
            className="gap-x-6 gap-y-10 md:gap-y-12 md:[&>*:nth-child(3n+2)]:translate-y-10"
          >
            {items.map((item, i) => (
              <Card
                key={item.title}
                asChild
                variant="outline"
                className="group block w-full cursor-pointer overflow-hidden rounded-none border-border bg-card p-0 text-left shadow-none transition-all duration-150 hover:border-foreground active:translate-y-px"
              >
                <PortfolioItem asChild>
                  <NavbarRouteLink href={item.title}>
                    <PortfolioMedia
                      aspect="3-2"
                      className="h-56 border-b border-border"
                    >
                      <Image
                        alt={item.imageAlt}
                        w={600}
                        h={400}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                      <div className="absolute left-0 top-4">
                        <span className="inline-flex items-center gap-2 border-y border-r border-border bg-background px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-foreground">
                          <span
                            aria-hidden="true"
                            className="size-1.5 bg-primary"
                          />
                          {item.tag}
                        </span>
                      </div>
                    </PortfolioMedia>
                    <PortfolioCaption className="p-6">
                      <span
                        aria-hidden="true"
                        className="mb-3 block font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 tabular-nums"
                      >
                        Case {String(i + 1).padStart(2, '0')}
                      </span>
                      <h3 className="mb-3 font-serif text-xl font-bold leading-snug tracking-tight text-card-foreground">
                        {item.title}
                      </h3>
                      <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
                        {item.description}
                      </p>
                      <div className="flex items-center justify-between gap-4 border-t border-border pt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        <span>{item.duration}</span>
                        <span className="tabular-nums">{item.period}</span>
                      </div>
                    </PortfolioCaption>
                  </NavbarRouteLink>
                </PortfolioItem>
              </Card>
            ))}
          </PortfolioGrid>
        </Container>
      </section>
    )
  },
})
