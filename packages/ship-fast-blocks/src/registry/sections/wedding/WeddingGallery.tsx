import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { GalleryGrid } from "#/section-kit/GalleryGrid.tsx"

export const WeddingGallery = defineComponent({
  name: "WeddingGallery",
  description:
    "Photo gallery band for a wedding site, built on the shared GalleryGrid composite: a soft serif-friendly heading over a responsive grid of alt-driven engagement and couple photographs with short captions. Use to showcase engagement sessions, candid moments, and venue previews on a wedding invitation or celebration page.",
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    images: z
      .array(
        z.object({
          alt: z.string(),
          caption: z.string().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const images = props.images?.length
      ? props.images
      : [
          {
            alt: "engaged couple laughing together in a sunlit wildflower field, candid engagement photo",
            caption: "Where it all began",
          },
          {
            alt: "close-up of two hands with engagement ring resting on lace fabric, soft natural light",
            caption: "She said yes",
          },
          {
            alt: "couple silhouette kissing at golden hour against a glowing sunset sky",
            caption: "Golden hour",
          },
          {
            alt: "bride and groom dancing slowly under string lights at an outdoor evening party",
            caption: "Our first dance",
          },
          {
            alt: "couple walking hand in hand along a cobblestone street in an old European town",
            caption: "Adventures together",
          },
          {
            alt: "intimate portrait of a couple foreheads touching with a blurred garden background",
            caption: "Forever starts now",
          },
        ]
    return (
      <GalleryGrid
        heading={props.heading ?? "Our moments"}
        subheading={props.description ?? "Engagement & beyond"}
        images={images}
        columns={3}
        className={props.className}
      />
    )
  },
})
