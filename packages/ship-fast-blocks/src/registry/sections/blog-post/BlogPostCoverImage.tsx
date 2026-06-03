import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { Image } from "#/lib/img.tsx"

/**
 * BlogPostCoverImage — full-width hero cover image for an editorial blog post
 * detail page. A responsive, aspect-ratioed figure that spans the article column
 * width with a screen-reader-only caption. Uses alt-driven <Image> and semantic
 * tokens. Use as the feature / hero photo directly below the article header on
 * blogs, magazines, journals, or editorial reading pages.
 */
export const BlogPostCoverImage = defineComponent({
  name: "BlogPostCoverImage",
  description:
    "Full-width hero cover image for an editorial blog post detail page: a responsive, aspect-ratioed figure spanning the article column width with a screen-reader-only caption. Uses the alt-driven Image component and semantic tokens. Use as the feature / hero photo directly below the article header on blogs, magazines, journals, or editorial reading pages.",
  props: z.object({
    /** Alt text driving the cover image. */
    imageAlt: z.string().optional(),
    /** Screen-reader-only caption for accessibility. */
    caption: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const imageAlt =
      props.imageAlt ??
      "Minimalist design workspace with natural light, featuring a clean desk with notebook and single plant"
    const caption =
      props.caption ??
      "A serene, minimalist workspace representing the philosophy of slow design"

    return (
      <div className={cn("mx-auto mb-16 max-w-5xl px-6 lg:px-8", props.className)}>
        <figure className="relative">
          <Image
            alt={imageAlt}
            w={1600}
            h={900}
            className="h-[400px] w-full rounded-lg object-cover md:h-[500px] lg:h-[600px]"
          />
          <figcaption className="sr-only">{caption}</figcaption>
        </figure>
      </div>
    )
  },
})
