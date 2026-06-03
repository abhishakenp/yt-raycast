import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { Image } from "#/lib/img.tsx"

/**
 * CafeStory — split founder / origin story section for a cozy cafe / coffee
 * shop page. Left side: two vertically offset 3:4 photos in a 2-column grid.
 * Right side: an eyebrow cap, a serif heading, multiple paragraphs of narrative
 * copy, and a founder attribution row with a round avatar, name, and role.
 * No links. Use to present a cafe's origin, values, or team story. Renders
 * fully with no props via baked-in "Little Owl Coffee" defaults.
 */
export const CafeStory = defineComponent({
  name: "CafeStory",
  description:
    "Split founder / origin story section for a cozy cafe page: left side shows two vertically offset 3:4 photos in a 2-column grid; right side has an eyebrow cap, serif heading, multiple narrative paragraphs, and a founder attribution row with a round avatar, name, and role. No links. Use to present a cafe's origin, values, or team story.",
  props: z.object({
    /** Eyebrow / cap text. */
    cap: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Narrative paragraphs. */
    paragraphs: z.array(z.string()).optional(),
    /** Founder name(s). */
    founderName: z.string().optional(),
    /** Founder role. */
    founderRole: z.string().optional(),
    /** Alt text driving the founder avatar. */
    founderAvatarAlt: z.string().optional(),
    /** Alt text driving the left-top photo. */
    imageAlt1: z.string().optional(),
    /** Alt text driving the left-bottom photo. */
    imageAlt2: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const cap = props.cap ?? "Our Story"
    const heading =
      props.heading ?? "From a dream to your daily ritual"
    const paragraphs = props.paragraphs?.length
      ? props.paragraphs
      : [
          "Little Owl Coffee began in 2018 when Marcus Chen and Elena Rodriguez left their corporate jobs to pursue a shared obsession: creating a space where exceptional coffee meets genuine community. They spent six months remodeling a forgotten storefront in Portland's Pearl District, hand-pouring the concrete floors and building the communal tables themselves.",
          'The name "Little Owl" came from the Western Screech-Owl pair that nested in the oak tree outside their first apartment together. Like those owls, we believe in being quietly present, observant, and creating warmth in unexpected places.',
          "Today, we source our beans through direct trade relationships with small farms in Ethiopia, Colombia, and Guatemala. We visit at least two farms each year, building relationships that go beyond transactional. Our head roaster, James, develops profiles that honor the unique characteristics of each origin while making them approachable for everyday enjoyment.",
        ]
    const founderName = props.founderName ?? "Marcus & Elena"
    const founderRole = props.founderRole ?? "Founders & Co-owners"
    const founderAvatarAlt =
      props.founderAvatarAlt ??
      "Professional headshot of Marcus Chen, co-owner, a smiling man with glasses and a beard"
    const imageAlt1 =
      props.imageAlt1 ??
      "Portrait of cafe owners in the coffee shop kitchen, smiling while preparing pastries"
    const imageAlt2 =
      props.imageAlt2 ??
      "Coffee shop interior during golden hour, showing warm lighting, potted plants, and communal seating"

    return (
      <section className={cn("py-20 lg:py-32", props.className)}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <div className="order-2 lg:order-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="mt-8 aspect-[3/4] overflow-hidden rounded-xl">
                  <Image
                    alt={imageAlt1}
                    w={500}
                    h={667}
                    loading="lazy"
                    className="size-full object-cover"
                  />
                </div>
                <div className="aspect-[3/4] overflow-hidden rounded-xl">
                  <Image
                    alt={imageAlt2}
                    w={500}
                    h={667}
                    loading="lazy"
                    className="size-full object-cover"
                  />
                </div>
              </div>
            </div>

            <div className="order-1 space-y-6 lg:order-2">
              <p className="text-sm font-medium uppercase tracking-wider text-primary">
                {cap}
              </p>
              <h2 className="font-serif text-3xl font-medium leading-tight text-foreground sm:text-4xl lg:text-5xl">
                {heading}
              </h2>
              <div className="space-y-4 leading-relaxed text-muted-foreground">
                {paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
              <div className="flex items-center gap-6 pt-4">
                <Image
                  alt={founderAvatarAlt}
                  w={100}
                  h={100}
                  className="size-14 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium text-foreground">
                    {founderName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {founderRole}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  },
})
