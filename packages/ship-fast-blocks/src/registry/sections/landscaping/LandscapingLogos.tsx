import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'

/**
 * LandscapingLogos — a slim "trusted by" social-proof strip for a landscaping /
 * outdoor-design company. A bordered card band with a small uppercase eyebrow
 * label centered above a responsive, dimmed grid of partner / neighborhood
 * property names (2 cols on mobile, up to 6 on large screens, with the last two
 * hidden on small screens). Calm and understated to lend credibility without
 * stealing focus. Use directly beneath a hero for landscapers, lawn-care
 * services, garden designers or property-maintenance companies. Renders fully
 * with no props via baked-in Portland-neighborhood defaults.
 */
export const LandscapingLogos = defineComponent({
  name: 'LandscapingLogos',
  description:
    "Slim 'trusted by' social-proof strip for a landscaping / outdoor-design company: a bordered card band with a small uppercase eyebrow label centered above a responsive dimmed grid of partner / neighborhood property names (2 cols on mobile, up to 6 on large screens, with the last two hidden on small screens). Calm and understated to lend credibility without stealing focus. Use directly beneath a hero for landscapers, lawn-care services, garden designers or property-maintenance companies.",
  props: z.object({
    label: z.string().optional(),
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const label = props.label ?? 'Trusted by leading Portland properties'
    const items = props.items?.length
      ? props.items
      : [
          'Pearl District Condos',
          'Hawthorne Gardens',
          'Alberta Arts Lofts',
          'Sellwood Heights',
          'Laurelhurst Estates',
          'Forest Park HOA',
        ]

    return (
      <section
        className={cn('border-b border-border bg-card py-12', props.className)}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <div className="grid grid-cols-2 items-center gap-8 opacity-60 md:grid-cols-4 lg:grid-cols-6">
            {items.map((logo, i) => (
              <div
                key={logo}
                className={cn(
                  'flex h-12 items-center justify-center font-semibold text-muted-foreground',
                  i >= 4 && 'hidden md:flex',
                )}
              >
                {logo}
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
