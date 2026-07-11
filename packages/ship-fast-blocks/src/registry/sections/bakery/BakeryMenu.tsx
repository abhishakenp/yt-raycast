import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { commerceCartLakebed } from '../commerce/cart-lakebed.ts'
import {
  CommerceAddItemButton,
  CommerceMutationSpinner,
  commerceProduct,
  useSyncCommerceCatalog,
} from '../commerce/commerce-interactions.tsx'

import { Container } from '#/section-kit/Container.tsx'

/**
 * BakeryMenu — full daily menu block for an artisan-bakery page, on a soft
 * muted band. A centered heading + lead paragraph above two side-by-side priced
 * menu columns (breads + pastries) each in a card with an emoji icon tile and a
 * stack of name / description / price rows with real add-to-cart controls,
 * followed by a full-width cakes & special-orders card whose priced rows lay
 * out in a 3-column grid. Rows seed the shared product search catalog and add
 * into the shared Lakebed cart used by bakery navigation.
 */
export const BakeryMenu = defineCapsule({
  name: 'BakeryMenu',
  description:
    "Full daily menu block for an artisan-bakery page on a soft muted band: a centered heading and lead paragraph above two side-by-side priced menu columns (breads + pastries), each in a card with an emoji icon tile and a stack of name / description / price rows with real add-to-cart controls, followed by a full-width cakes & special-orders card whose priced rows lay out in a 3-column grid. Rows seed the shared product search catalog and mutate the shared Lakebed cart used by bakery navigation. Use to present a bakery's, patisserie's, or cafe's daily offerings and price list (artisan breads, pastries, viennoiserie, cakes, special orders).",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Title for the breads column. */
    breadsTitle: z.string().optional(),
    /** Emoji icon for the breads column. */
    breadsEmoji: z.string().optional(),
    /** Breads menu items. */
    breads: z
      .array(
        z.object({
          name: z.string(),
          description: z.string(),
          price: z.string(),
        }),
      )
      .optional(),
    /** Title for the pastries column. */
    pastriesTitle: z.string().optional(),
    /** Emoji icon for the pastries column. */
    pastriesEmoji: z.string().optional(),
    /** Pastries menu items. */
    pastries: z
      .array(
        z.object({
          name: z.string(),
          description: z.string(),
          price: z.string(),
        }),
      )
      .optional(),
    /** Title for the cakes / special-orders card. */
    cakesTitle: z.string().optional(),
    /** Emoji icon for the cakes card. */
    cakesEmoji: z.string().optional(),
    /** Cakes / special-order menu items. */
    cakes: z
      .array(
        z.object({
          name: z.string(),
          description: z.string(),
          price: z.string(),
        }),
      )
      .optional(),
    /** Label for each row add button. */
    addLabel: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: commerceCartLakebed,
  component: ({ props, lakebed }) => {
    const heading = props.heading ?? 'Our Daily Menu'
    const description =
      props.description ??
      'Available from 7am until sold out. Call ahead for large orders or custom cakes.'
    const breadsTitle = props.breadsTitle ?? 'Artisan Breads'
    const breadsEmoji = props.breadsEmoji ?? '🍞'
    const breads = props.breads?.length
      ? props.breads
      : [
          {
            name: 'Country Sourdough',
            description: 'Organic wheat, 36-hour ferment, crispy crust',
            price: '$9',
          },
          {
            name: 'Seeded Multigrain',
            description: 'Sunflower, sesame, flax, and pumpkin seeds',
            price: '$10',
          },
          {
            name: 'Rustic Rye',
            description: '70% rye flour, caraway, molasses',
            price: '$9',
          },
          {
            name: 'Olive & Herb Fougasse',
            description: 'Kalamata olives, rosemary, sea salt',
            price: '$8',
          },
          {
            name: 'Baguette Tradition',
            description: 'Classic French style, crackling crust',
            price: '$5',
          },
          {
            name: 'Cinnamon Raisin Swirl',
            description: 'Overnight-soaked raisins, Ceylon cinnamon',
            price: '$10',
          },
        ]
    const pastriesTitle = props.pastriesTitle ?? 'Pastries & Viennoiserie'
    const pastriesEmoji = props.pastriesEmoji ?? '🥐'
    const pastries = props.pastries?.length
      ? props.pastries
      : [
          {
            name: 'Butter Croissant',
            description: 'Laminated with European-style butter, 27 layers',
            price: '$4.50',
          },
          {
            name: 'Chocolate Almond Croissant',
            description: 'Double-baked with Valrhona chocolate frangipane',
            price: '$5.50',
          },
          {
            name: 'Kouign-Amann',
            description: 'Breton specialty, caramelized sugar crust',
            price: '$5',
          },
          {
            name: 'Morning Bun',
            description: 'Orange zest, cinnamon, caramelized exterior',
            price: '$4.50',
          },
          {
            name: 'Seasonal Fruit Danish',
            description: 'Current: Oregon berry compote with vanilla cream',
            price: '$5',
          },
          {
            name: 'Canelé de Bordeaux',
            description: 'Rum and vanilla custard, dark caramelized shell',
            price: '$4',
          },
        ]
    const cakesTitle = props.cakesTitle ?? 'Cakes & Special Orders'
    const cakesEmoji = props.cakesEmoji ?? '🎂'
    const cakes = props.cakes?.length
      ? props.cakes
      : [
          {
            name: 'Whole Wheat Sandwich Loaf',
            description: 'Soft crumb, honey-sweetened, sliced',
            price: '$7',
          },
          {
            name: 'Brioche Hamburger Buns (4)',
            description: 'Buttery, sesame-crusted, bakery favorite',
            price: '$8',
          },
          {
            name: 'Flourless Chocolate Cake',
            description: '6-inch, ganache glaze (48hr notice)',
            price: '$38',
          },
          {
            name: 'Tarte Tatin',
            description: 'Caramelized apple, puff pastry (weekends only)',
            price: '$32',
          },
          {
            name: 'Seasonal Fruit Galette',
            description: '9-inch, rustic free-form tart',
            price: '$28',
          },
          {
            name: 'Custom Celebration Cake',
            description: 'Consultation required, 1 week notice',
            price: 'From $75',
          },
        ]
    const addLabel = props.addLabel ?? 'Add'
    const allMenuItems = [
      ...breads.map((item) => ({ ...item, category: breadsTitle })),
      ...pastries.map((item) => ({ ...item, category: pastriesTitle })),
      ...cakes.map((item) => ({ ...item, category: cakesTitle })),
    ]
    useSyncCommerceCatalog(
      lakebed,
      allMenuItems.map((item) =>
        commerceProduct({
          imageAlt: item.name,
          label: item.name,
          price: item.price,
          subtitle: item.category,
        }),
      ),
    )

    const PriceRow = ({
      item,
      section,
    }: {
      item: { name: string; description: string; price: string }
      section: string
    }) => (
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="font-semibold text-card-foreground">{item.name}</h4>
          <p className="mt-1 text-sm text-muted-foreground">
            {item.description}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <span className="font-semibold text-card-foreground">
            {item.price}
          </span>
          <CommerceAddItemButton
            lakebed={lakebed}
            item={{
              label: item.name,
              price: item.price,
            }}
            aria-label={`${addLabel} ${item.name} to cart`}
            pendingChildren={
              <>
                <CommerceMutationSpinner className="size-3" />
                Adding
              </>
            }
            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-full border border-border bg-background px-3 text-xs font-medium text-foreground transition-colors hover:bg-primary hover:text-primary-foreground disabled:pointer-events-none disabled:opacity-70"
          >
            {addLabel}
            <span className="sr-only"> {section}</span>
          </CommerceAddItemButton>
        </div>
      </div>
    )

    return (
      <section className={cn('bg-muted py-20 lg:py-28', props.className)}>
        <Container>
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-semibold text-foreground lg:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>

          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="rounded-xl bg-card p-8 shadow-sm">
              <h3 className="mb-6 flex items-center gap-3 text-2xl font-semibold text-card-foreground">
                <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-lg">
                  {breadsEmoji}
                </span>
                {breadsTitle}
              </h3>
              <div className="space-y-6">
                {breads.map((item) => (
                  <PriceRow key={item.name} item={item} section={breadsTitle} />
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-card p-8 shadow-sm">
              <h3 className="mb-6 flex items-center gap-3 text-2xl font-semibold text-card-foreground">
                <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-lg">
                  {pastriesEmoji}
                </span>
                {pastriesTitle}
              </h3>
              <div className="space-y-6">
                {pastries.map((item) => (
                  <PriceRow
                    key={item.name}
                    item={item}
                    section={pastriesTitle}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-xl bg-card p-8 shadow-sm">
            <h3 className="mb-6 flex items-center gap-3 text-2xl font-semibold text-card-foreground">
              <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-lg">
                {cakesEmoji}
              </span>
              {cakesTitle}
            </h3>
            <div className="grid gap-6 md:grid-cols-3">
              {cakes.map((item) => (
                <PriceRow key={item.name} item={item} section={cakesTitle} />
              ))}
            </div>
          </div>
        </Container>
      </section>
    )
  },
})
