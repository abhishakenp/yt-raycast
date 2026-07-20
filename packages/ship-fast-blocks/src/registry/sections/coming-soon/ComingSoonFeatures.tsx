import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  FeatureGrid,
  FeatureCard,
  FeatureIcon,
  FeatureTitle,
  FeatureDescription,
} from '#/section-kit/FeatureGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { Watermark } from '#/section-kit/Decor.tsx'

/**
 * ComingSoonFeatures — kinetic capability index for a "launching soon" /
 * waitlist pre-launch landing page. An asymmetric header (left-aligned mono
 * eyebrow rail + big tight-tracked heading left, lead paragraph offset right)
 * above a collapsed-border 1/2/3-column grid of sharp-cornered cells, each
 * stamped with a giant faint mono index numeral ("01"–"06") behind its title
 * and description; a huge ghost "FEATURES-scale" watermark word sits behind
 * the band. Use to present product features, platform capabilities, or
 * "what's included" on SaaS waitlists, app pre-launch pages, or beta sign-up
 * landers. Renders fully with no props via six baked-in default features.
 */
export const ComingSoonFeatures = defineCapsule({
  name: 'ComingSoonFeatures',
  description:
    "Kinetic capability index for a 'launching soon' / waitlist pre-launch landing page: asymmetric header (mono eyebrow rail and big tight-tracked heading left, lead paragraph offset right) above a collapsed-border 1/2/3-column grid of sharp-cornered cells, each stamped with a giant faint mono index numeral ('01'–'06') behind its title and description. Use to present product features, platform capabilities, or 'what's included' on SaaS waitlists, app pre-launch pages, or beta sign-up landers.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Feature cards: title + description. */
    items: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Everything you need'
    const description =
      props.description ??
      'Built for modern teams who value clarity, speed, and thoughtful design.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Real-time Sync',
            description:
              'Changes appear instantly across all devices. No refresh needed, no version conflicts.',
          },
          {
            title: 'Enterprise Security',
            description:
              'SOC 2 Type II certified with end-to-end encryption. Your data stays yours.',
          },
          {
            title: 'Smart Boards',
            description:
              'Visual canvases that connect to your data. Drag, drop, and watch ideas come alive.',
          },
          {
            title: 'Contextual Chat',
            description:
              'Discuss work where it happens. Comments, DMs, and channels unified in one stream.',
          },
          {
            title: 'Living Documents',
            description:
              'Docs that stay current. Embed data, automate updates, track changes effortlessly.',
          },
          {
            title: 'Workflow Automations',
            description:
              'Build custom workflows without code. Connect 100+ apps and automate the routine.',
          },
        ]

    return (
      <section
        className={cn(
          'relative w-full overflow-hidden px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28 xl:px-12',
          props.className,
        )}
      >
        <Watermark className="-left-6 top-2 text-[7rem] sm:text-[11rem] lg:text-[15rem]">
          {String(items.length).padStart(2, '0')}
        </Watermark>

        <Container size="lg" className="relative">
          {/* Asymmetric header: heading left, lead offset bottom-right. */}
          <div className="mb-12 grid gap-6 sm:mb-16 lg:grid-cols-12 lg:items-end lg:gap-10">
            <SectionHeading
              align="left"
              title={heading}
              className="gap-4 lg:col-span-7"
              titleClassName="text-4xl font-extrabold uppercase leading-[0.92] tracking-tighter text-foreground sm:text-5xl lg:text-6xl"
            />
            <p className="max-w-md text-base leading-relaxed text-muted-foreground lg:col-span-5 lg:justify-self-end lg:pb-1">
              {description}
            </p>
          </div>

          <FeatureGrid
            columns={3}
            className="gap-0 [&>div]:grid-cols-2 [&>div]:gap-0 [&>div]:border-l [&>div]:border-t [&>div]:border-border md:[&>div]:grid-cols-3"
          >
            {items.map((f, i) => {
              const __iv__ = f as {
                title: string
                description: string
                icon?: React.ReactNode
                points?: string[]
                cta?: string
                price?: string
                imageAlt?: string
              }
              return (
                <FeatureCard
                  key={__iv__.title}
                  className="group relative gap-3 overflow-hidden rounded-none border-0 border-b border-r border-border bg-transparent p-5 transition-colors duration-150 hover:-translate-y-0 hover:border-border hover:bg-muted/40 sm:p-7"
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-2 -top-4 select-none font-mono text-[4.5rem] font-bold leading-none tracking-tighter text-foreground/[0.06] tabular-nums sm:text-[6rem]"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {__iv__.icon && (
                    <FeatureIcon className="rounded-none bg-transparent text-foreground">
                      {__iv__.icon}
                    </FeatureIcon>
                  )}
                  <span
                    aria-hidden="true"
                    className="h-1 w-8 bg-primary transition-[width] duration-150 group-hover:w-12"
                  />
                  <FeatureTitle className="relative text-base font-bold uppercase tracking-tight sm:text-lg">
                    {__iv__.title}
                  </FeatureTitle>
                  <FeatureDescription className="relative text-sm leading-relaxed">
                    {__iv__.description}
                  </FeatureDescription>
                </FeatureCard>
              )
            })}
          </FeatureGrid>
        </Container>
      </section>
    )
  },
})
