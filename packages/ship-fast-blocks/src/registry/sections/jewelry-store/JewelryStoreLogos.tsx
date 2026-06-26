import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'

/**
 * JewelryStoreLogos — press / awards recognition strip for a luxury jewelry
 * brand. A bordered band with a centered wide letter-spaced uppercase
 * caption above a responsive grid of dimmed serif publication wordmarks
 * (2 cols mobile, 4 tablet, 6 desktop; the last items reveal only on large
 * screens). Use directly below the hero to establish editorial credibility
 * via Vogue / Bazaar / Tatler-style press logos. Renders fully with no props
 * via baked-in defaults.
 */
export const JewelryStoreLogos = defineComponent({
  name: 'JewelryStoreLogos',
  description:
    'Press / awards recognition strip for a luxury jewelry brand: a bordered band with a centered wide letter-spaced uppercase caption above a responsive grid of dimmed serif publication wordmarks (2 cols mobile, 4 tablet, 6 desktop; trailing items reveal only on large screens). Use directly below the hero to establish editorial credibility via Vogue / Bazaar / Tatler-style press logos for fine jewelers, diamond houses, or any premium luxury-retail brand.',
  props: z.object({
    label: z.string().optional(),
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const label = props.label ?? 'Recognized Excellence'
    const items = props.items?.length
      ? props.items
      : ['VOGUE', 'BAZAAR', 'TATLER', 'WWD', 'JCK JEWELRY', 'ELLE']

    return (
      <section
        className={cn(
          'border-b border-border bg-background py-20',
          props.className,
        )}
      >
        <div className="w-full px-6 lg:px-12 xl:px-20">
          <p className="mb-12 text-center text-xs uppercase tracking-[0.3em] text-muted-foreground">
            {label}
          </p>
          <div className="grid grid-cols-2 items-center gap-12 opacity-60 md:grid-cols-4 lg:grid-cols-6">
            {items.map((logo, i) => (
              <div
                key={logo}
                className={cn(
                  'flex justify-center font-serif text-lg tracking-widest text-muted-foreground',
                  i >= 4 && 'hidden lg:flex',
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
