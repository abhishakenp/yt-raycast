import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { SiteFooter } from "#/section-kit/SiteFooter.tsx"

/**
 * VideoStreamingFooter — a rich, multi-column closing footer for a
 * video-streaming site. Thin configuration over the shared `SiteFooter`
 * composite: a bold wordmark beside an inline primary play-triangle mark, a
 * tagline, a social row (Instagram, Twitter, TikTok, YouTube), and a responsive
 * grid of link columns (Browse, Account, Company, Support). A bordered-top
 * bottom bar carries an auto-updating copyright line. Use as the site-wide
 * footer for streaming services, OTT apps, or on-demand video platforms.
 * Renders fully with no props via baked-in "Lumen" defaults.
 */
const PlayMark = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M7 4.5v15a1 1 0 0 0 1.52.85l12-7.5a1 1 0 0 0 0-1.7l-12-7.5A1 1 0 0 0 7 4.5Z" />
  </svg>
)

export const VideoStreamingFooter = defineComponent({
  name: "VideoStreamingFooter",
  description:
    "Rich, multi-column closing footer for a video-streaming site built on the shared SiteFooter composite: a bold wordmark + inline primary play-triangle mark, a tagline, a social row (Instagram, Twitter, TikTok, YouTube), and a responsive grid of link columns (Browse, Account, Company, Support); a bordered-top bottom bar holds an auto-updating copyright line. Use as the site-wide footer for streaming services, OTT apps, or on-demand video platforms.",
  props: z.object({
    /** Streaming brand name shown as the wordmark. */
    brand: z.string().optional(),
    /** Short tagline below the wordmark. */
    tagline: z.string().optional(),
    /** Social channels rendered as a link row under the brand. */
    social: z
      .array(z.object({ label: z.string(), href: z.string().optional() }))
      .optional(),
    /** Link columns (Browse, Account, Company, Support, …), each a title + labels. */
    columns: z
      .array(z.object({ title: z.string(), links: z.array(z.string()) }))
      .optional(),
    /** Legal links shown in the bottom bar. */
    legal: z.array(z.string()).optional(),
    /** Copyright note appended after the brand + year. */
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const social = props.social?.length
      ? props.social
      : [
          { label: "Instagram" },
          { label: "Twitter" },
          { label: "TikTok" },
          { label: "YouTube" },
        ]
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: "Browse",
            links: ["Shows", "Movies", "New & Popular", "Originals", "Kids"],
          },
          {
            title: "Account",
            links: ["My List", "Profiles", "Devices", "Manage Plan"],
          },
          {
            title: "Company",
            links: ["About", "Careers", "Press", "Investors"],
          },
          {
            title: "Support",
            links: ["Help Center", "Contact Us", "Account Settings", "Gift Cards"],
          },
        ]

    return (
      <SiteFooter
        brand={props.brand ?? "Lumen"}
        brandMark={<PlayMark className="size-7 text-primary" />}
        brandClassName="font-bold tracking-tight"
        tagline={
          props.tagline ??
          "Thousands of shows and movies, ad-free, on every screen you own."
        }
        social={social}
        columns={columns}
        legal={props.legal?.length ? props.legal : ["Privacy", "Terms"]}
        note={props.note ?? "All rights reserved."}
        className={props.className}
      />
    )
  },
})
