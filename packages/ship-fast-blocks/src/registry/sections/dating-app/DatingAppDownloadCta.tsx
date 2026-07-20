import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { Image } from '#/lib/img.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import {
  CtaBand,
  CtaBandInner,
  CtaBandTitle,
  CtaBandSubtitle,
  CtaAction,
} from '#/section-kit/CtaBand.tsx'
import { DownloadBand } from '#/section-kit/DownloadBand.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * DatingAppDownloadCta — playful-geometric inverted download band for a dating
 * / matchmaking app. The page's full bg-foreground/text-background inversion
 * cuts in on a slanted clip-path seam under a giant ghost "MATCH" watermark:
 * an asymmetric 7:5 split with a mono "[ download ] free forever" micro-label,
 * a big extrabold heading, a supporting paragraph, and App Store + Google Play
 * buttons restyled as rounded-full background-surface pills (glyph +
 * two-line label) with hard offset shadows and press feedback on the left; on
 * the right a sharp 2px-bordered tilted phone plate with an overlaid in-app
 * profile card and a rotated rounded-full "New Match!" heart sticker chip
 * breaching its corner. Store buttons route through section-kit route links
 * and the mockup imagery is alt-driven. Use as the final conversion / install
 * push for dating apps, singles platforms, or any mobile app landing page.
 * Renders fully with no props via baked-in "HeartLink" defaults.
 */
export const DatingAppDownloadCta = defineCapsule({
  name: 'DatingAppDownloadCta',
  description:
    "Playful-geometric inverted download band for a dating / matchmaking app: a full bg-foreground/text-background inversion cutting in on a slanted clip-path seam under a giant ghost 'MATCH' watermark — left has a mono micro-label, a big extrabold heading, a supporting paragraph, and App Store + Google Play buttons as rounded-full background-surface pills (glyph + two-line label) with hard offset shadows and press feedback; right has a sharp 2px-bordered tilted phone plate with an overlaid in-app profile card and a rotated rounded-full 'New Match!' heart sticker chip. Store buttons route through section-kit route links; mockup imagery is alt-driven <Image>. Use as the final conversion / install push for dating apps, singles platforms, or any mobile app landing page.",
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    appStore: z.string().optional(),
    googlePlay: z.string().optional(),
    /** Alt text for the phone-mockup screen image. */
    mockupAlt: z.string().optional(),
    mockupProfileName: z.string().optional(),
    mockupProfileMeta: z.string().optional(),
    /** Alt text for the small overlaid profile photo. */
    mockupProfileImageAlt: z.string().optional(),
    floatTitle: z.string().optional(),
    floatMeta: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const downloadHeading = props.heading ?? 'Your perfect match is waiting'
    const downloadDesc =
      props.description ??
      'Download HeartLink today and join 2 million singles already finding meaningful connections. Your next great conversation starts with a single tap.'
    const appStore = props.appStore ?? 'App Store'
    const googlePlay = props.googlePlay ?? 'Google Play'
    const mockupAlt =
      props.mockupAlt ??
      'app interface showing matching screen with profile cards'
    const mockupProfileName = props.mockupProfileName ?? 'Alex, 26'
    const mockupProfileMeta = props.mockupProfileMeta ?? 'Software Engineer'
    const mockupProfileImageAlt =
      props.mockupProfileImageAlt ??
      'profile photo of Alex a 26 year old software engineer'
    const floatTitle = props.floatTitle ?? 'New Match!'
    const floatMeta = props.floatMeta ?? 'Jessica liked you'

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

    return (
      <DownloadBand asChild>
        <CtaBand
          tone="muted"
          className={`relative overflow-hidden bg-foreground py-14 pt-20 text-background [clip-path:polygon(0_3rem,100%_0,100%_100%,0_100%)] sm:py-16 sm:pt-24 lg:py-20 lg:pt-28 ${props.className ?? ''}`}
        >
          {/* Ghost watermark closing the loop with the hero's grammar. */}
          <Watermark className="-bottom-8 -left-4 text-[7rem] uppercase text-background/[0.05] sm:text-[11rem] lg:text-[16rem]">
            Match
          </Watermark>
          <Container className="relative">
            <CtaBandInner className="max-w-none items-stretch gap-0 px-0 py-0 text-left">
              <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
                <div className="lg:col-span-7">
                  <MonoTag tone="inverted" className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="size-1.5 rounded-full bg-background/60"
                    />
                    [ download ] free forever
                  </MonoTag>
                  <CtaBandTitle className="mt-5 text-4xl font-extrabold leading-[0.98] tracking-tighter text-background sm:text-5xl lg:text-6xl">
                    {downloadHeading}
                  </CtaBandTitle>
                  <CtaBandSubtitle className="mt-5 max-w-xl text-lg leading-relaxed text-background/70 opacity-100">
                    {downloadDesc}
                  </CtaBandSubtitle>
                  <div className="mt-9 grid grid-cols-1 gap-4 sm:flex sm:flex-row">
                    <CtaAction
                      variant="primary"
                      invert
                      className="justify-center gap-3 rounded-full bg-background px-6 py-3.5 font-semibold text-foreground shadow-[3px_3px_0_0] shadow-background/30 transition-[transform,box-shadow,background-color] duration-150 hover:-translate-y-0.5 hover:bg-background/90 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none motion-reduce:transform-none"
                      asChild
                    >
                      <NavbarRouteLink href={appStore}>
                        <svg
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="size-7"
                          aria-hidden="true"
                        >
                          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                        </svg>
                        <span className="text-left">
                          <span className="block text-xs text-muted-foreground">
                            Download on the
                          </span>
                          <span className="-mt-1 block text-lg font-bold">
                            {appStore}
                          </span>
                        </span>
                      </NavbarRouteLink>
                    </CtaAction>
                    <CtaAction
                      variant="primary"
                      invert
                      className="justify-center gap-3 rounded-full bg-background px-6 py-3.5 font-semibold text-foreground shadow-[3px_3px_0_0] shadow-background/30 transition-[transform,box-shadow,background-color] duration-150 hover:-translate-y-0.5 hover:bg-background/90 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none motion-reduce:transform-none"
                      asChild
                    >
                      <NavbarRouteLink href={googlePlay}>
                        <svg
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="size-7"
                          aria-hidden="true"
                        >
                          <path d="M3,20.5V3.5C3,2.91 3.4,2.38 4,2.2L13.69,12L4,21.8C3.4,21.62 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                        </svg>
                        <span className="text-left">
                          <span className="block text-xs text-muted-foreground">
                            Get it on
                          </span>
                          <span className="-mt-1 block text-lg font-bold">
                            {googlePlay}
                          </span>
                        </span>
                      </NavbarRouteLink>
                    </CtaAction>
                  </div>
                </div>
                <div className="relative flex justify-center pt-6 sm:pt-0 lg:col-span-5 lg:justify-end">
                  <div className="relative rotate-2">
                    <div className="w-64 border-2 border-background/25 bg-background/5 p-3 sm:w-72">
                      <div className="relative aspect-[9/16] overflow-hidden bg-muted">
                        <Image
                          alt={mockupAlt}
                          w={400}
                          h={700}
                          className="size-full object-cover"
                        />
                        <div className="absolute inset-x-4 bottom-6 space-y-3">
                          <div className="border-2 border-foreground bg-card p-3 shadow-[3px_3px_0_0] shadow-foreground">
                            <div className="flex items-center gap-3">
                              <Image
                                alt={mockupProfileImageAlt}
                                w={100}
                                h={100}
                                className="size-10 shrink-0 rounded-full object-cover"
                              />
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-bold text-card-foreground">
                                  {mockupProfileName}
                                </p>
                                <p className="truncate text-xs text-muted-foreground">
                                  {mockupProfileMeta}
                                </p>
                              </div>
                              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                                <HeartGlyph className="size-4" />
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Rotated heart sticker chip breaching the plate corner. */}
                    <div className="absolute -bottom-5 -left-6 -rotate-2 rounded-full border-2 border-foreground bg-background px-4 py-2.5 shadow-[3px_3px_0_0] shadow-background/30">
                      <div className="flex items-center gap-3">
                        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                          <HeartGlyph className="size-4" />
                        </span>
                        <div>
                          <p className="text-sm font-bold leading-tight text-foreground">
                            {floatTitle}
                          </p>
                          <p className="text-xs leading-tight text-muted-foreground">
                            {floatMeta}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CtaBandInner>
          </Container>
        </CtaBand>
      </DownloadBand>
    )
  },
})
