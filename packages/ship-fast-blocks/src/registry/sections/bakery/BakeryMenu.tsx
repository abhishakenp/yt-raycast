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
import { MonoTag } from '#/section-kit/Decor.tsx'
import { MenuList } from '#/section-kit/MenuList.tsx'

/**
 * BakeryMenu — full daily menu block for an artisan-bakery page, in a
 * playful-geometric warm language. Opens with a full-bleed inverted
 * foreground-on-background heading band whose bottom edge is cut on a
 * diagonal (clip-path slant seam): inside it, a mono "03 / Menu" index above
 * an asymmetric 7:5 row pairing an oversized serif heading with the
 * right-aligned lead paragraph. Below, two side-by-side chunky-bordered menu
 * cards (breads + pastries) with mirrored blob corners and soft offset
 * shadows, each headed by a rotated rounded-full emoji sticker tile and a
 * serif title over ledger rows — serif item name, dotted price leader, serif
 * italic price, muted description, and a rounded-full add-to-cart chip that
 * floods dark on hover with press feedback. A full-width dashed-border
 * primary-washed cakes & special-orders card lays its rows out in a 3-column
 * grid. Rows seed the shared product search catalog and add into the shared
 * Lakebed cart used by bakery navigation.
 */
export const BakeryMenu = defineCapsule({
  name: 'BakeryMenu',
  description:
    "Full daily menu block for an artisan-bakery page in a playful-geometric warm language: a full-bleed inverted heading band with a diagonal clip-path bottom seam holds a mono index tag and an asymmetric serif heading + right-aligned lead paragraph; below, two side-by-side chunky-bordered menu cards (breads + pastries) with mirrored blob corners and soft offset shadows — each headed by a rotated rounded-full emoji sticker tile and serif title over ledger rows with dotted price leaders, serif italic prices, and rounded-full add-to-cart chips with press feedback — plus a full-width dashed-border primary-washed cakes & special-orders card whose priced rows lay out in a 3-column grid. Rows seed the shared product search catalog and mutate the shared Lakebed cart used by bakery navigation. Use to present a bakery's, patisserie's, or cafe's daily offerings and price list (artisan breads, pastries, viennoiserie, cakes, special orders).",
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

    const MenuAddButton = ({
      item,
      section,
    }: {
      item: { name: string; description: string; price: string }
      section: string
    }) => (
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
        className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-full border-2 border-foreground/20 bg-background px-3.5 text-xs font-semibold text-foreground transition-all duration-100 hover:border-foreground hover:bg-foreground hover:text-background active:translate-y-px disabled:pointer-events-none disabled:opacity-70"
      >
        {addLabel}
        <span className="sr-only"> {section}</span>
      </CommerceAddItemButton>
    )

    const MenuLedgerRow = ({
      item,
      section,
    }: {
      item: { name: string; description: string; price: string }
      section: string
    }) => (
      <div className="group">
        <div className="flex items-baseline gap-3">
          <span className="font-serif text-base font-medium text-card-foreground sm:text-lg">
            {item.name}
          </span>
          <span
            aria-hidden="true"
            className="mb-1 min-w-4 flex-1 border-b-2 border-dotted border-foreground/20"
          />
          <span className="shrink-0 font-serif text-lg italic text-foreground">
            {item.price}
          </span>
        </div>
        <div className="mt-1 flex items-end justify-between gap-4">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {item.description}
          </p>
          <MenuAddButton item={item} section={section} />
        </div>
      </div>
    )

    const CategorySticker = ({
      emoji,
      title,
      rotate,
    }: {
      emoji: string
      title: string
      rotate: string
    }) => (
      <div className="mb-7 flex items-center gap-4">
        <span
          className={cn(
            'grid size-12 shrink-0 place-items-center rounded-full border-2 border-foreground/15 bg-primary/10 text-xl shadow-[3px_3px_0_0] shadow-foreground/10',
            rotate,
          )}
        >
          {emoji}
        </span>
        <h3 className="font-serif text-2xl font-medium tracking-tight text-card-foreground">
          {title}
        </h3>
      </div>
    )

    return (
      <section className={cn('bg-background pb-16 lg:pb-24', props.className)}>
        <MenuList>
          {/* Inverted heading band with a diagonal bottom seam. */}
          <div className="bg-foreground pb-20 pt-14 text-background [clip-path:polygon(0_0,100%_0,100%_calc(100%-3rem),0_100%)] sm:pt-16 lg:pb-24">
            <Container>
              <MonoTag tone="inverted">03 / Menu</MonoTag>
              <div className="mt-4 grid gap-4 lg:grid-cols-12 lg:items-end lg:gap-10">
                <h2 className="font-serif text-3xl font-medium tracking-tight sm:text-4xl lg:col-span-7 lg:text-5xl">
                  {heading}
                </h2>
                <p className="max-w-md text-base leading-relaxed text-background/70 lg:col-span-5 lg:justify-self-end lg:text-right">
                  {description}
                </p>
              </div>
            </Container>
          </div>

          <Container className="mt-10 lg:mt-12">
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
              <div className="rounded-[2rem] rounded-tr-none border-2 border-foreground/15 bg-card p-6 shadow-[6px_6px_0_0] shadow-foreground/10 sm:p-8">
                <CategorySticker
                  emoji={breadsEmoji}
                  title={breadsTitle}
                  rotate="-rotate-3"
                />
                <div className="space-y-6">
                  {breads.map((item) => (
                    <MenuLedgerRow
                      key={`${breadsTitle}:${item.name}`}
                      item={item}
                      section={breadsTitle}
                    />
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] rounded-tl-none border-2 border-foreground/15 bg-card p-6 shadow-[6px_6px_0_0] shadow-foreground/10 sm:p-8 lg:translate-y-6">
                <CategorySticker
                  emoji={pastriesEmoji}
                  title={pastriesTitle}
                  rotate="rotate-3"
                />
                <div className="space-y-6">
                  {pastries.map((item) => (
                    <MenuLedgerRow
                      key={`${pastriesTitle}:${item.name}`}
                      item={item}
                      section={pastriesTitle}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-[2rem] rounded-bl-none border-2 border-dashed border-foreground/25 bg-primary/5 p-6 sm:p-8 lg:mt-14">
              <CategorySticker
                emoji={cakesEmoji}
                title={cakesTitle}
                rotate="-rotate-2"
              />
              <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
                {cakes.map((item) => (
                  <MenuLedgerRow
                    key={`${cakesTitle}:${item.name}`}
                    item={item}
                    section={cakesTitle}
                  />
                ))}
              </div>
            </div>
          </Container>
        </MenuList>
      </section>
    )
  },
})
