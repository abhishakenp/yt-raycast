import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * DatingAppHero — bright, romantic split hero for a dating / matchmaking app. A
 * soft rose/primary-to-muted gradient canvas with a two-column layout: on the left
 * a live-matches pulse pill, a big "find someone who [gets you]" headline (with the
 * highlight phrase in the primary accent), a supporting paragraph, dual CTAs
 * (filled "Download Free" + outlined "See How It Works"), and stacked overlapping
 * avatar social proof; on the right a tall rounded photo with an overlaid online
 * profile card and a floating "It's a Match!" verified badge. Buttons route through
 * useNavigate and all imagery is alt-driven. Use as the top hero for dating apps,
 * matchmaking services, singles or relationship platforms. Renders fully with no
 * props via baked-in "HeartLink" defaults.
 */
export const DatingAppHero = defineComponent({
  name: "DatingAppHero",
  description:
    "Bright, romantic split hero for a dating / matchmaking app: a soft rose/primary-to-muted gradient canvas, two columns — left has a live-matches pulse pill, a large 'find someone who [highlight]' headline with the accent phrase in primary, a supporting paragraph, dual CTAs (filled 'Download Free' + outlined 'See How It Works'), and stacked overlapping avatar social proof; right has a tall rounded photo with an overlaid online profile card and a floating 'It's a Match!' verified badge. Buttons route through useNavigate; all imagery is alt-driven <Image>. Use as the top hero for dating apps, matchmaking services, singles or relationship platforms.",
  props: z.object({
    badge: z.string().optional(),
    /** Heading words before the highlighted phrase. */
    headingPre: z.string().optional(),
    /** Phrase rendered in the rose/primary accent color. */
    highlight: z.string().optional(),
    subheading: z.string().optional(),
    primaryCta: z.string().optional(),
    secondaryCta: z.string().optional(),
    socialProof: z.string().optional(),
    /** Alt texts for the stacked social-proof avatars. */
    avatars: z.array(z.string()).optional(),
    /** Alt text for the large hero photo. */
    heroImageAlt: z.string().optional(),
    /** Featured profile card overlay name. */
    profileName: z.string().optional(),
    profileMeta: z.string().optional(),
    /** Alt text for the overlaid profile photo. */
    profileImageAlt: z.string().optional(),
    matchBadge: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heroBadge = props.badge ?? "2.1M+ matches made this month"
    const headingPre = props.headingPre ?? "Find someone who"
    const heroHighlight = props.highlight ?? "gets you"
    const heroSub =
      props.subheading ??
      "HeartLink connects you with genuine people looking for real relationships. Our smart matching algorithm finds compatibility beyond the surface—based on values, interests, and relationship goals."
    const heroPrimary = props.primaryCta ?? "Download Free"
    const heroSecondary = props.secondaryCta ?? "See How It Works"
    const heroSocial = props.socialProof ?? "Join 2M+ singles finding love"
    const avatars = props.avatars?.length
      ? props.avatars
      : [
          "professional headshot of a smiling woman with brown hair",
          "professional headshot of a smiling man with short curly hair",
          "professional headshot of a smiling woman with blonde hair",
          "professional headshot of a smiling man with beard",
        ]
    const heroImageAlt =
      props.heroImageAlt ?? "happy couple on a coffee date laughing together"
    const profileName = props.profileName ?? "Sarah, 28"
    const profileMeta = props.profileMeta ?? "Marketing Manager • 2 miles away"
    const profileImageAlt =
      props.profileImageAlt ??
      "profile photo of Sarah a 28 year old marketing manager"
    const matchBadge = props.matchBadge ?? "It's a Match!"

    const HeartGlyph = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
          clipRule="evenodd"
        />
      </svg>
    )

    const Check = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M5 13l4 4L19 7" />
      </svg>
    )

    const ChevronDown = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M19 9l-7 7-7-7" />
      </svg>
    )

    return (
      <section className={cn("relative overflow-hidden", props.className)}>
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-muted"
        />
        <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-20 sm:px-6 lg:px-8 lg:pb-40 lg:pt-32">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="max-w-2xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                <span className="size-2 animate-pulse rounded-full bg-primary" />
                {heroBadge}
              </div>
              <h1 className="mb-6 text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-6xl">
                {headingPre} <span className="text-primary">{heroHighlight}</span>
              </h1>
              <p className="mb-8 text-lg leading-relaxed text-muted-foreground sm:text-xl">
                {heroSub}
              </p>
              <div className="mb-8 flex flex-col gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(heroPrimary)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90"
                >
                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="size-5"
                    aria-hidden="true"
                  >
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" />
                  </svg>
                  {heroPrimary}
                </button>
                <button
                  type="button"
                  onClick={() => go(heroSecondary)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-4 text-base font-semibold text-foreground transition-all hover:bg-accent"
                >
                  {heroSecondary}
                  <ChevronDown className="size-5" />
                </button>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex -space-x-2">
                  {avatars.map((a) => (
                    <Image
                      key={a}
                      alt={a}
                      w={100}
                      h={100}
                      className="size-8 rounded-full border-2 border-background object-cover"
                    />
                  ))}
                </div>
                <p>{heroSocial}</p>
              </div>
            </div>
            <div className="relative lg:pl-8">
              <div className="relative overflow-hidden rounded-2xl shadow-2xl shadow-primary/10">
                <Image
                  alt={heroImageAlt}
                  w={800}
                  h={1000}
                  className="aspect-[4/5] w-full object-cover"
                />
                <div className="absolute inset-x-4 bottom-4 rounded-xl bg-card/95 p-4 shadow-lg backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Image
                        alt={profileImageAlt}
                        w={100}
                        h={100}
                        className="size-12 rounded-full object-cover"
                      />
                      <span className="absolute -right-1 -top-1 size-4 rounded-full border-2 border-card bg-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-card-foreground">
                        {profileName}
                      </p>
                      <p className="text-sm text-muted-foreground">{profileMeta}</p>
                    </div>
                    <span className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary">
                      <HeartGlyph className="size-5" />
                    </span>
                  </div>
                </div>
              </div>
              <div className="absolute -right-4 -top-4 hidden rounded-xl bg-card p-4 shadow-lg sm:block">
                <div className="flex items-center gap-2">
                  <span className="grid size-8 place-items-center rounded-full bg-primary/10 text-primary">
                    <Check className="size-4" />
                  </span>
                  <span className="text-sm font-medium text-card-foreground">
                    {matchBadge}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  },
})
