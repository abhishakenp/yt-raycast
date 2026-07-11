import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * FitnessLogos — compact trusted-by logo / brand strip for a gym or fitness-studio
 * site. A bordered, card-surfaced band with a small uppercase eyebrow label centered
 * above a wrapping, dimmed row of partner / brand wordmarks. Renders fully on zero
 * args. Use directly under the hero on gyms, fitness studios or wellness clubs to
 * build credibility with recognizable brand or partner names.
 */
import { Container } from '#/section-kit/Container.tsx'
export const FitnessLogos = defineCapsule({
  name: 'FitnessLogos',
  description:
    'Compact trusted-by logo / brand strip for a gym or fitness-studio site: a bordered, card-surfaced band with a small uppercase eyebrow label centered above a wrapping, dimmed row of partner / brand wordmarks. Use directly under the hero on gyms, fitness studios, wellness clubs or class-booking sites to build credibility with recognizable brand or partner names.',
  props: z.object({
    label: z.string().optional(),
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const logosLabel = props.label ?? 'Trusted by teams at'
    const logoItems = props.items?.length
      ? props.items
      : ['Nike', 'Equinox', 'Lululemon', 'WHOOP', 'Rogue', 'Concept2']
    return (
      <section
        className={cn('border-y border-border bg-card py-12', props.className)}
      >
        <Container>
          <p className="mb-8 text-center text-xs uppercase tracking-wider text-muted-foreground">
            {logosLabel}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-60 md:gap-16">
            {logoItems.map((logo) => (
              <div
                key={logo}
                className="text-lg font-semibold text-muted-foreground"
              >
                {logo}
              </div>
            ))}
          </div>
        </Container>
      </section>
    )
  },
})
