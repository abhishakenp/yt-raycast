import { type ReactNode } from "react"
import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { SectionHeading } from "#/section-kit/SectionHeading.tsx"

const cardIcons: Record<string, ReactNode> = {
  power: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-8"
      aria-hidden="true"
    >
      <polygon points="13 2 3 14 11 14 11 22 21 10 13 10 13 2" />
    </svg>
  ),
  business: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-8"
      aria-hidden="true"
    >
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
  environment: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-8"
      aria-hidden="true"
    >
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6" />
    </svg>
  ),
  sustainability: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-8"
      aria-hidden="true"
    >
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 16h5v5" />
    </svg>
  ),
}

export const GovernmentPortalServices = defineComponent({
  name: "GovernmentPortalServices",
  description:
    "Row of four colored quick-link department cards (Power Generation #74C7A1, Business #E2CA96, Environment #E6AD97, Sustainability #94BEE0) with line icons, generalising to any classic indian government / PSU department set. Official, civic navigation tiles for public sector, municipal, utility, power and electricity board portals linking to tender, notice and service sections of a government portal. Use for the department quick-links band of a classic government portal.",
  props: z.object({
    /** Optional small section heading shown above the cards. */
    heading: z.string().optional(),
    /** Colored department quick-link cards. */
    cards: z
      .array(
        z.object({
          title: z.string(),
          href: z.string(),
          color: z.string(),
          icon: z.enum(["power", "business", "environment", "sustainability"]),
          desc: z.string().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading = props.heading ?? "Citizen Services & Departments"
    const cards =
      props.cards?.length
        ? props.cards
        : [
            {
              title: "Power Generation",
              href: "Power Generation",
              color: "#74C7A1",
              icon: "power" as const,
              desc: "Thermal generation, installed capacity & plant performance",
            },
            {
              title: "Business",
              href: "Business",
              color: "#E2CA96",
              icon: "business" as const,
              desc: "Tenders, procurement, vendor empanelment & bidding",
            },
            {
              title: "Environment",
              href: "Environment",
              color: "#E6AD97",
              icon: "environment" as const,
              desc: "Ash utilisation, emissions & environment policy",
            },
            {
              title: "Sustainability",
              href: "Sustainability",
              color: "#94BEE0",
              icon: "sustainability" as const,
              desc: "CSR, safety & community welfare initiatives",
            },
          ]
    return (
      <section
        className={cn("w-full", props.className)}
        style={{
          fontFamily: '"Alegreya Sans","Open Sans",system-ui,sans-serif',
        }}
      >
        <div className="mx-auto max-w-[1200px] px-4 py-8">
          {heading ? (
            <SectionHeading
              title={heading}
              align="left"
              className="mb-4"
              titleClassName="text-[18px] font-medium text-[#3346B5]"
            />
          ) : null}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {cards.map((card) => (
              <button
                type="button"
                onClick={() => go(card.href)}
                key={card.title}
                style={{ backgroundColor: card.color }}
                className="group flex flex-col gap-3 rounded-sm p-5 text-left text-[#1f2a44] shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="grid size-12 shrink-0 place-items-center rounded-full bg-white/40 text-[#1f2a44] transition-colors group-hover:bg-white/60">
                  {cardIcons[card.icon]}
                </span>
                <span className="text-[17px] font-semibold leading-tight">
                  {card.title}
                </span>
                {card.desc ? (
                  <span className="text-[13px] leading-snug text-[#1f2a44]/80">
                    {card.desc}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
