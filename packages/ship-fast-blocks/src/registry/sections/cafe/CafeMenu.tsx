import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * CafeMenu — printed-style food and drink menu for a neighborhood cafe /
 * coffee shop page. A centered cap / heading / description above a two-column
 * grid: the left column lists coffee drinks, the right lists pastries and light
 * fare. Each item is a clickable row with a name, description, and price
 * separated by a border divider. Below the two-column grid, a teas and
 * non-coffee band shows four centered cards. Every menu row routes through
 * useNavigate. Use for cafes, bakeries, tea houses, brunch spots, or any
 * cozy eatery wanting a readable, conversion-focused menu section. Renders
 * fully with no props via baked-in defaults.
 */
export const CafeMenu = defineComponent({
  name: "CafeMenu",
  description:
    "Printed-style food and drink menu for a cozy cafe page: centered cap, heading, and description above a two-column grid of coffee drinks and pastries/light fare. Each item is a clickable row with name, description, and price separated by a border divider. Below, a teas and non-coffee band shows four centered cards. Menu rows route through useNavigate. Use for cafes, bakeries, tea houses, brunch spots, or cozy eateries wanting a readable menu section.",
  props: z.object({
    /** Eyebrow / cap text above the heading. */
    cap: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
    /** Coffee column title. */
    coffeeTitle: z.string().optional(),
    /** Coffee menu items. */
    coffee: z
      .array(
        z.object({
          name: z.string(),
          description: z.string(),
          price: z.string(),
        }),
      )
      .optional(),
    /** Food column title. */
    foodTitle: z.string().optional(),
    /** Food / pastry menu items. */
    food: z
      .array(
        z.object({
          name: z.string(),
          description: z.string(),
          price: z.string(),
        }),
      )
      .optional(),
    /** Teas band title. */
    teaTitle: z.string().optional(),
    /** Tea and non-coffee items. */
    teas: z
      .array(
        z.object({
          name: z.string(),
          description: z.string(),
          price: z.string(),
        }),
      )
      .optional(),
    /** Navigation target when a menu item is clicked. */
    menuTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const cap = props.cap ?? "Our Offerings"
    const heading = props.heading ?? "Crafted with intention"
    const description =
      props.description ??
      "Every drink is made to order with precision. Every pastry is baked fresh before sunrise."
    const coffeeTitle = props.coffeeTitle ?? "Coffee"
    const coffee = props.coffee?.length
      ? props.coffee
      : [
          {
            name: "Espresso",
            description: "Double shot, rich crema, served demitasse",
            price: "$3.50",
          },
          {
            name: "House Drip",
            description: "Rotating single origin, batch brewed",
            price: "$3.00",
          },
          {
            name: "Cappuccino",
            description: "Equal parts espresso, steamed milk, microfoam",
            price: "$4.50",
          },
          {
            name: "Latte",
            description: "Espresso with silky steamed milk",
            price: "$5.00",
          },
          {
            name: "Oat Flat White",
            description: "Double ristretto, Oatly barista blend",
            price: "$5.50",
          },
          {
            name: "Pour Over",
            description: "V60 or Chemex, rotating seasonal beans",
            price: "$5.00",
          },
          {
            name: "Cold Brew",
            description: "Steeped 18 hours, smooth and strong",
            price: "$4.50",
          },
          {
            name: "Nitro Cold Brew",
            description: "Nitrogen-infused, creamy texture",
            price: "$5.50",
          },
          {
            name: "Americano",
            description: "Double espresso, hot water",
            price: "$3.75",
          },
          {
            name: "Mocha",
            description: "Espresso, house chocolate, steamed milk",
            price: "$5.50",
          },
        ]
    const foodTitle = props.foodTitle ?? "Pastries & Light Fare"
    const food = props.food?.length
      ? props.food
      : [
          {
            name: "Butter Croissant",
            description: "Flaky layers, French butter, baked fresh",
            price: "$4.25",
          },
          {
            name: "Almond Croissant",
            description:
              "Filled with house almond cream, topped with sliced almonds",
            price: "$5.00",
          },
          {
            name: "Morning Bun",
            description: "Orange zest, cinnamon sugar, brioche dough",
            price: "$4.50",
          },
          {
            name: "Sourdough Toast",
            description: "Ken's Artisan sourdough, cultured butter, sea salt",
            price: "$4.00",
          },
          {
            name: "Avocado Toast",
            description: "Sourdough, smashed avocado, radish, chili flakes",
            price: "$9.50",
          },
          {
            name: "Seasonal Scone",
            description: "Current: Blueberry lemon with glaze",
            price: "$4.00",
          },
          {
            name: "Cardamom Bun",
            description: "Swedish-style, caramelized cardamom sugar",
            price: "$4.75",
          },
          {
            name: "Chocolate Chip Cookie",
            description: "Tahini, brown butter, Maldon sea salt",
            price: "$3.50",
          },
          {
            name: "Quiche Lorraine",
            description: "Bacon, Gruyère, all-butter crust",
            price: "$8.50",
          },
          {
            name: "Granola Bowl",
            description: "House granola, Greek yogurt, seasonal fruit, honey",
            price: "$7.50",
          },
        ]
    const teaTitle = props.teaTitle ?? "Teas & Non-Coffee"
    const teas = props.teas?.length
      ? props.teas
      : [
          {
            name: "Matcha Latte",
            description: "Ceremonial grade, oat milk",
            price: "$5.50",
          },
          {
            name: "Chai Latte",
            description: "House spice blend, steamed milk",
            price: "$5.00",
          },
          {
            name: "Earl Grey",
            description: "Loose leaf, bergamot forward",
            price: "$3.50",
          },
          {
            name: "House Kombucha",
            description: "Rotating flavor, locally brewed",
            price: "$4.50",
          },
        ]
    const menuTarget = props.menuTarget ?? "View Menu"

    return (
      <section className={cn("py-20 lg:py-32", props.className)}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <p className="mb-3 text-sm font-medium uppercase tracking-wider text-primary">
              {cap}
            </p>
            <h2 className="mb-6 font-serif text-3xl font-medium text-foreground sm:text-4xl lg:text-5xl">
              {heading}
            </h2>
            <p className="text-muted-foreground">{description}</p>
          </div>

          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            {[
              { title: coffeeTitle, items: coffee },
              { title: foodTitle, items: food },
            ].map((col) => (
              <div key={col.title} className="space-y-8">
                <div className="mb-8 flex items-center gap-4">
                  <div className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
                    <svg
                      className="size-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 2.829a4.978 4.978 0 01-1.414-2.83M6 12a6 6 0 0112 0v1H6v-1z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-serif text-2xl font-medium text-foreground">
                    {col.title}
                  </h3>
                </div>
                <div className="space-y-6">
                  {(col.items ?? []).map((item, idx) => (
                    <div key={item.name}>
                      <button
                        type="button"
                        onClick={() => go(menuTarget)}
                        className="group flex w-full items-start justify-between gap-4 text-left"
                      >
                        <div>
                          <h4 className="font-medium text-foreground transition-colors group-hover:text-primary">
                            {item.name}
                          </h4>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {item.description}
                          </p>
                        </div>
                        <span className="font-serif text-lg text-foreground">
                          {item.price}
                        </span>
                      </button>
                      {idx < col.items.length - 1 ? (
                        <div className="mt-6 h-px bg-border" />
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Teas & Non-Coffee */}
          <div className="mt-16 border-t border-border pt-16">
            <h3 className="mb-8 text-center font-serif text-xl font-medium text-foreground">
              {teaTitle}
            </h3>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {teas.map((tea) => (
                <div
                  key={tea.name}
                  className="rounded-xl bg-muted p-6 text-center"
                >
                  <h4 className="mb-1 font-medium text-foreground">
                    {tea.name}
                  </h4>
                  <p className="mb-2 text-sm text-muted-foreground">
                    {tea.description}
                  </p>
                  <span className="font-serif text-foreground">
                    {tea.price}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  },
})
