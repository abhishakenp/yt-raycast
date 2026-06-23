import { useEffect, useState } from "react"
import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { Image } from "#/lib/img.tsx"

/**
 * GovernmentPortalHero — full-width classic indian government / PSU hero
 * carousel (the "TVNL" state-power-utility look): auto-advancing plant and
 * infrastructure photos with prev/next chevrons and dot indicators, a captioned
 * gradient overlay, and a thin royal-blue welcome / notice ticker bar below.
 * Official, civic, institutional mood for public sector portals. Renders fully
 * with no props via baked-in Tenughat Vidyut Nigam Limited defaults.
 */
export const GovernmentPortalHero = defineComponent({
  name: "GovernmentPortalHero",
  description:
    "Full-width classic indian government / PSU hero carousel of plant and infrastructure photos (auto-advancing with prev/next/dots) plus a thin royal-blue welcome and notice ticker. Official, civic, institutional mood for public sector, municipal, utility, power and electricity board portals that announce tenders and public notices. Use for the homepage banner of any classic government portal.",
  props: z.object({
    /** Carousel slides — each with optional stock-photo alt, explicit img src, and caption. */
    slides: z
      .array(
        z.object({
          img: z.string().optional(),
          alt: z.string().optional(),
          caption: z.string().optional(),
        }),
      )
      .optional(),
    /** Welcome / notice ticker items scrolled in the royal-blue bar below. */
    ticker: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const slides =
      props.slides && props.slides.length > 0
        ? props.slides
        : [
            {
              alt: "Thermal power station with tall cooling towers and turbine hall at dusk, industrial infrastructure",
              caption:
                "Tenughat Thermal Power Station, Lalpania — powering the state",
            },
            {
              alt: "High-voltage electricity transmission towers and power grid lines across rural landscape",
              caption: "Reliable generation & transmission for every citizen",
            },
            {
              alt: "Government engineers in safety helmets inspecting a power plant control room",
              caption:
                "Operational excellence, public service, transparent governance",
            },
          ]
    const ticker =
      props.ticker && props.ticker.length > 0
        ? props.ticker
        : [
            "Welcome to the official portal of Tenughat Vidyut Nigam Limited (A Govt. of Jharkhand Undertaking)",
            "Latest tender notices and public notices are now available under the Tenders section",
            "Citizen grievances may be filed online via the Info Desk",
          ]

    const [slide, setSlide] = useState(0)

    useEffect(() => {
      if (slides.length < 2) return
      const id = setInterval(() => {
        setSlide((current) => (current + 1) % slides.length)
      }, 5000)
      return () => clearInterval(id)
    }, [slides.length])

    const current = slides[slide]

    return (
      <section
        className={cn("w-full", props.className)}
        style={{
          fontFamily: '"Alegreya Sans","Open Sans",system-ui,sans-serif',
          color: "#333",
        }}
      >
        <div className="relative overflow-hidden bg-[#0a1f44]">
          <div className="relative aspect-[1200/440] w-full">
            {slides.map((s, i) => {
              const layerClass = cn(
                "absolute inset-0 size-full object-cover transition-opacity duration-700",
                i === slide ? "opacity-100" : "opacity-0",
              )
              const fallbackAlt =
                s.alt ?? s.caption ?? "government power infrastructure"
              if (typeof s.img === "string" && s.img) {
                return (
                  <img
                    key={i}
                    src={s.img}
                    alt={fallbackAlt}
                    className={layerClass}
                  />
                )
              }
              return (
                <Image
                  key={i}
                  alt={fallbackAlt}
                  w={1200}
                  h={440}
                  className={layerClass}
                />
              )
            })}

            {current?.caption ? (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-5">
                <p className="max-w-[70%] text-[16px] font-medium text-white drop-shadow">
                  {current.caption}
                </p>
              </div>
            ) : null}

            {slides.length > 1 ? (
              <>
                <button
                  type="button"
                  aria-label="Previous slide"
                  onClick={() =>
                    setSlide(
                      (current2) => (current2 - 1 + slides.length) % slides.length,
                    )
                  }
                  className="absolute left-3 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-white/25 text-white backdrop-blur hover:bg-white/40"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <button
                  type="button"
                  aria-label="Next slide"
                  onClick={() =>
                    setSlide((current2) => (current2 + 1) % slides.length)
                  }
                  className="absolute right-3 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-white/25 text-white backdrop-blur hover:bg-white/40"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>

                <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      aria-label={`Go to slide ${i + 1}`}
                      onClick={() => setSlide(i)}
                      className={cn(
                        "size-2.5 rounded-full",
                        i === slide
                          ? "bg-white"
                          : "bg-white/45 hover:bg-white/70",
                      )}
                    />
                  ))}
                </div>
              </>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-3 bg-[#3346B5] px-4 py-2 text-[14px] text-white">
          <span className="shrink-0 rounded-sm bg-[#0792D0] px-2 py-0.5 text-[12px] font-semibold uppercase">
            Notice
          </span>
          <p className="truncate">{ticker.join(" • ")}</p>
        </div>
      </section>
    )
  },
})
