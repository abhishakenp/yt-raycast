import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

/**
 * MarketingAgencyCases — kinetic case-study gallery on a diagonal-seam muted band.
 * An asymmetric header (mono "[ CASE STUDIES ]" meta, marker-highlighted heading
 * and description) sits above a staggered 3-up grid of sharp hard-offset-shadow
 * card buttons (the middle column pushed down), each carrying a cover image that
 * zooms on hover, a rotated rounded-full category sticker chip, a mono case index,
 * a client name, a short summary, and a dual result-metric row split by a hairline
 * with tabular-nums figures. Category chips rotate through the chart token palette.
 * Links route through section-kit route links. Use to showcase client outcomes for
 * a marketing / growth agency. Renders fully with no props.
 */
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import {
  PortfolioGrid,
  PortfolioItem,
  PortfolioMedia,
  PortfolioCaption,
  PortfolioTag,
} from '#/section-kit/PortfolioGrid.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
export const MarketingAgencyCases = defineCapsule({
  name: 'MarketingAgencyCases',
  description:
    'Kinetic case-study gallery on a diagonal-seam muted band: an asymmetric header (mono case-studies meta, marker-highlighted heading and description) above a staggered 3-up grid of sharp hard-offset-shadow card buttons, each with a hover-zoom cover image, a rotated rounded-full category sticker chip, a mono case index, a client name, a short summary, and a dual result-metric row split by a hairline with tabular-nums figures. Category chips rotate through the chart token palette. Links route through section-kit route links. Use to showcase client outcomes and results for a marketing / growth / performance agency across SaaS, e-commerce, fintech, and B2B services.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    description: z.string().optional(),
    items: z
      .array(
        z.object({
          name: z.string(),
          tag: z.string(),
          summary: z.string(),
          metricA: z.string(),
          labelA: z.string(),
          metricB: z.string(),
          labelB: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Case Studies'
    const heading = props.heading ?? 'Results That Speak'
    const description =
      props.description ??
      'Real outcomes from real clients across SaaS, e-commerce, and B2B services.'
    const items = props.items?.length
      ? props.items
      : [
          {
            name: 'CloudSync',
            tag: 'SaaS',
            summary:
              'Workflow automation platform for remote teams. Joined at $200K ARR.',
            metricA: '892%',
            labelA: 'Revenue Growth',
            metricB: '$1.8M',
            labelB: 'New ARR in 8 Months',
          },
          {
            name: 'Luxe Threads',
            tag: 'E-commerce',
            summary:
              'Sustainable luxury fashion brand. Shopify store struggling with CAC.',
            metricA: '156%',
            labelA: 'ROAS Increase',
            metricB: '$420K',
            labelB: 'Monthly Revenue',
          },
          {
            name: 'Paywise',
            tag: 'Fintech',
            summary:
              'B2B payment processing platform. Needed enterprise lead generation.',
            metricA: '3,400',
            labelA: 'Qualified Leads',
            metricB: '$2.1M',
            labelB: 'Pipeline Generated',
          },
          {
            name: 'MedConnect',
            tag: 'Healthcare',
            summary:
              'Telehealth platform for mental health providers. HIPAA-compliant marketing.',
            metricA: '247%',
            labelA: 'Patient Signups',
            metricB: '12,500',
            labelB: 'New Providers',
          },
          {
            name: 'BuildRight',
            tag: 'Construction',
            summary:
              'Commercial construction firm. Needed local SEO and lead generation.',
            metricA: '#1',
            labelA: 'Local Rankings',
            metricB: '$5.2M',
            labelB: 'Contracts Won',
          },
          {
            name: 'LearnHub',
            tag: 'EdTech',
            summary:
              "Online coding bootcamp. High competition for 'learn to code' keywords.",
            metricA: '89K',
            labelA: 'Organic Visitors/Mo',
            metricB: '$3.8M',
            labelB: 'Course Sales',
          },
        ]
    const tagTones = [
      'bg-chart-1 text-primary-foreground',
      'bg-chart-2 text-primary-foreground',
      'bg-chart-3 text-primary-foreground',
      'bg-chart-4 text-primary-foreground',
      'bg-chart-5 text-primary-foreground',
      'bg-primary text-primary-foreground',
    ]
    const headingWords = heading.split(' ')
    const headingLead = headingWords.slice(0, -1).join(' ')
    const headingMark = headingWords.at(-1) ?? ''
    return (
      <section
        className={cn(
          // Diagonal top seam on a contrasting muted band — neighbor-independent.
          'relative overflow-hidden bg-muted/40 pt-20 pb-20 lg:pt-28 lg:pb-28 [clip-path:polygon(0_2.5rem,100%_0,100%_100%,0_100%)]',
          props.className,
        )}
      >
        <Container className="relative">
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-16">
            <div className="max-w-2xl">
              <MonoTag className="mb-4 block">
                Case Studies
                <span aria-hidden="true" className="text-primary">
                  {' '}
                  · proof
                </span>
              </MonoTag>
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                {headingLead}{' '}
                <span className="relative ml-[0.12em] inline-block whitespace-nowrap">
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-[-0.15em] inset-y-[0.05em] -rotate-1 bg-primary"
                  />
                  <span className="relative text-primary-foreground">
                    {headingMark}
                  </span>
                </span>
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                {description}
              </p>
            </div>
            <p
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60"
            >
              [ {eyebrow} ]
            </p>
          </div>
          <PortfolioGrid cols="1-2-3" className="gap-6 lg:gap-8">
            {items.map((c, i) => (
              <PortfolioItem
                key={c.name}
                className={cn(
                  'group block w-full overflow-hidden rounded-none border border-foreground/80 bg-card text-left shadow-[6px_6px_0_0] shadow-foreground/12 transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-[9px_9px_0_0] hover:shadow-foreground/20 motion-reduce:transform-none',
                  i % 3 === 1 && 'lg:translate-y-8',
                )}
                asChild
              >
                <NavbarRouteLink href={c.name}>
                  <PortfolioMedia
                    aspect="3-2"
                    className="h-48 border-b border-foreground/80"
                  >
                    <Image
                      alt={`${c.name} ${c.tag} marketing case study`}
                      w={600}
                      h={400}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <PortfolioTag
                      className={cn(
                        'absolute left-4 top-4 -rotate-2 rounded-full border border-foreground/30 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] shadow-[2px_2px_0_0] shadow-foreground/25',
                        tagTones[i % tagTones.length],
                      )}
                    >
                      {c.tag}
                    </PortfolioTag>
                  </PortfolioMedia>
                  <PortfolioCaption className="p-6">
                    <MonoTag
                      aria-hidden="true"
                      tone="faint"
                      className="mb-3 block"
                    >
                      Case {String(i + 1).padStart(2, '0')}
                    </MonoTag>
                    <h3 className="mb-2 text-lg font-bold tracking-tight text-card-foreground">
                      {c.name}
                    </h3>
                    <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
                      {c.summary}
                    </p>
                    <div className="grid grid-cols-2 gap-0 border-t border-border">
                      <div className="border-r border-border pr-4 pt-4">
                        <p className="text-2xl font-extrabold tracking-tight text-card-foreground tabular-nums">
                          {c.metricA}
                        </p>
                        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                          {c.labelA}
                        </p>
                      </div>
                      <div className="pl-4 pt-4">
                        <p className="text-2xl font-extrabold tracking-tight text-card-foreground tabular-nums">
                          {c.metricB}
                        </p>
                        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                          {c.labelB}
                        </p>
                      </div>
                    </div>
                  </PortfolioCaption>
                </NavbarRouteLink>
              </PortfolioItem>
            ))}
          </PortfolioGrid>
        </Container>
      </section>
    )
  },
})
