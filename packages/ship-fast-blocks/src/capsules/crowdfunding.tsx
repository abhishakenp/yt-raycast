import { useState } from "react"
import { z } from "zod/v4"
import { number, string, table } from "@ship-fast/lakebed/server"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "#/components/ui/sheet.tsx"

const priceAmount = (price: string) => {
  const amount = Number.parseFloat(price.replace(/[^0-9.]+/g, ""))
  return Number.isFinite(amount) ? amount : 0
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)

/**
 * CrowdfundingKimiPage — a complete, self-contained crowdfunding / campaign
 * landing page (Indiegogo / Kickstarter style).
 *
 * A faithful Tailwind v4 port of a Kimi-generated "EcoBrush" design: a clean,
 * warm, eco/sustainability aesthetic on a light stone canvas with an emerald
 * brand accent. It pairs a 2-column campaign hero (product gallery + funding
 * progress card: amount raised, animated progress bar, percent-funded banner,
 * backers / early-bird / days-left stats, big back-this-project CTA, deadline
 * note) with a "Featured in" press logo strip, a long-form story section
 * (founders, problem stats, pull-quote, solution), a 6-up features grid with
 * icons, a product photo gallery, a 4-tier rewards/pledge grid (with a
 * highlighted "Best Value" tier and an unlocked/in-progress stretch-goals
 * list), star-rated backer testimonials with avatars, an accordion FAQ, a
 * full-width emerald closing CTA band, and a 4-column footer.
 *
 * The block owns ALL layout, spacing, depth and type hierarchy. Every nav item
 * / CTA / pledge button / footer link routes through `useNavigate` (never a
 * dead "#"), and the navbar labels match the `nav` array so PageSwitch can swap
 * pages. All imagery uses the alt-driven <Image> component (never a raw src).
 * Callers supply ONLY content data; rich defaults make it render great with no
 * props at all.
 */
export const CrowdfundingKimiPage = defineCapsule({
  name: "CrowdfundingKimiPage",
  description:
    "Complete crowdfunding / campaign landing page in the Indiegogo / Kickstarter mold with a clean, warm, eco-sustainability aesthetic (light stone canvas, emerald brand accent). Includes a 2-column campaign hero (product image gallery on one side, a funding-progress card on the other showing amount raised vs goal, an animated progress bar, a percent-funded / stretch-goals-unlocked banner, backers / early-bird-price / days-left stat trio, a big 'Back This Project' CTA and an all-or-nothing deadline note), a 'Featured in' press-logo strip, a long-form founder STORY section with a problem-stats panel, a pull-quote and a solution write-up, a 6-up product FEATURES grid with icons, a product photo GALLERY, a 4-tier REWARDS / pledge grid with a highlighted Best-Value tier plus an unlocked / in-progress STRETCH-GOALS checklist, star-rated backer TESTIMONIALS with avatars, an accordion FAQ, a full-width closing CTA band, and a 4-column footer. Use as the ROOT/home page for any crowdfunding or pre-order campaign, product launch, fundraiser, maker/hardware project, Kickstarter/Indiegogo-style raise, or 'back this project' page when funding progress, reward tiers, social proof and a hard deadline must be front and center. Supply content only — brand, nav, hero, press, story, features, gallery, rewards, stretchGoals, testimonials, faq, cta, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / campaign name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Campaign hero: gallery, funding progress, CTA. */
    hero: z
      .object({
        category: z.string().optional(),
        liveBadge: z.string().optional(),
        heading: z.string().optional(),
        subheading: z.string().optional(),
        mainImageAlt: z.string().optional(),
        thumbAlts: z.array(z.string()).optional(),
        raisedAmount: z.string().optional(),
        goalLabel: z.string().optional(),
        progressPercent: z.number().optional(),
        fundedBanner: z.string().optional(),
        stats: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
        primaryCta: z.string().optional(),
        deadlineNote: z.string().optional(),
      })
      .optional(),
    /** "Featured in" press-logo strip. */
    press: z
      .object({
        heading: z.string().optional(),
        logos: z.array(z.string()).optional(),
      })
      .optional(),
    /** Long-form founder story section. */
    story: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        intro: z.string().optional(),
        blocks: z
          .array(z.object({ imageAlt: z.string(), body: z.string() }))
          .optional(),
        quote: z.string().optional(),
        quoteAuthor: z.string().optional(),
        problemHeading: z.string().optional(),
        problemStats: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
        solutionHeading: z.string().optional(),
        solutionParagraphs: z.array(z.string()).optional(),
      })
      .optional(),
    /** Product features grid. */
    features: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Product photo gallery. */
    gallery: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        imageAlts: z.array(z.string()).optional(),
      })
      .optional(),
    /** Reward / pledge tiers. */
    rewards: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        tiers: z
          .array(
            z.object({
              meta: z.string(),
              name: z.string(),
              price: z.string(),
              description: z.string(),
              perks: z.array(z.string()),
              cta: z.string(),
              featured: z.boolean().optional(),
              badge: z.string().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Stretch-goals checklist. */
    stretchGoals: z
      .object({
        heading: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
              status: z.string(),
              unlocked: z.boolean().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Backer testimonials. */
    testimonials: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        items: z
          .array(
            z.object({
              quote: z.string(),
              name: z.string(),
              role: z.string(),
              avatarAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** FAQ accordion. */
    faq: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        items: z
          .array(z.object({ q: z.string(), a: z.string() }))
          .optional(),
      })
      .optional(),
    /** Closing CTA band. */
    cta: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        note: z.string().optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        tagline: z.string().optional(),
        columns: z
          .array(
            z.object({ heading: z.string(), links: z.array(z.string()) }),
          )
          .optional(),
        socials: z.array(z.string()).optional(),
        note: z.string().optional(),
        legal: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: {
    schema: {
      pledges: table({
        rewardName: string(),
        rewardPrice: string(),
        quantity: number(),
      }),
    },
    queries: {
      pledges: ({ db }) => db.pledges.orderBy("createdAt").all(),
    },
    mutations: {
      addPledge: ({ db }, rewardName: string, rewardPrice: string) => {
        const existingPledge = db.pledges
          .where("rewardName", rewardName)
          .all()[0]
        if (existingPledge) {
          db.pledges.update(existingPledge.id, {
            quantity: existingPledge.quantity + 1,
            rewardPrice,
          })
          return db.pledges.all()
        }

        db.pledges.insert({
          rewardName,
          rewardPrice,
          quantity: 1,
        })
        return db.pledges.all()
      },
      updatePledgeQuantity: ({ db }, id: string, quantity: number) => {
        const nextQuantity = Math.max(0, Math.floor(quantity))
        const existing = db.pledges.get(id)

        if (!existing) {
          return db.pledges.all()
        }

        if (nextQuantity === 0) {
          db.pledges.delete(id)
        } else {
          db.pledges.update(id, { quantity: nextQuantity })
        }

        return db.pledges.all()
      },
      removePledge: ({ db }, id: string) => {
        db.pledges.delete(id)
        return db.pledges.all()
      },
      clearPledges: ({ db }) => {
        for (const pledge of db.pledges.all()) {
          db.pledges.delete(pledge.id)
        }

        return []
      },
    },
  },
  component: ({ props, lakebed }) => {
    const [pledgeDrawerOpen, setPledgeDrawerOpen] = useState(false)
    const go = useNavigate()
    const brand = props.brand ?? "EcoBrush"
    const nav = props.nav?.length
      ? props.nav
      : ["Our Story", "Features", "Rewards", "FAQ"]

    const heroCategory = props.hero?.category ?? "Design & Technology"
    const heroLiveBadge = props.hero?.liveBadge ?? "Live Project"
    const heroHeading =
      props.hero?.heading ??
      "EcoBrush: The Bamboo Electric Toothbrush That Returns to Earth"
    const heroSub =
      props.hero?.subheading ??
      "98% biodegradable. Zero plastic. Powerful sonic cleaning. The first electric toothbrush designed to gracefully return to nature at the end of its life."
    const heroMainImageAlt =
      props.hero?.mainImageAlt ??
      "Elegant bamboo electric toothbrush displayed on marble countertop with natural morning light"
    const heroThumbAlts = props.hero?.thumbAlts?.length
      ? props.hero.thumbAlts
      : [
          "Close-up view of bamboo toothbrush handle texture showing natural grain",
          "Electric toothbrush brush head detail showing biodegradable bristles",
          "EcoBrush packaging showing sustainable recycled cardboard box",
          "Family bathroom counter with EcoBrush charging base and accessories",
        ]
    const heroRaised = props.hero?.raisedAmount ?? "$487,293"
    const heroGoalLabel = props.hero?.goalLabel ?? "raised of $75,000 goal"
    const heroProgress = Math.min(
      100,
      Math.max(0, props.hero?.progressPercent ?? 100),
    )
    const heroFundedBanner =
      props.hero?.fundedBanner ?? "649% funded — Stretch goals unlocked!"
    const heroStats = props.hero?.stats?.length
      ? props.hero.stats
      : [
          { value: "12,847", label: "backers" },
          { value: "$49", label: "early bird" },
          { value: "18", label: "days left" },
        ]
    const heroPrimary =
      props.hero?.primaryCta ?? "Back This Project — Starting at $49"
    const heroDeadlineNote =
      props.hero?.deadlineNote ??
      "This project will only be funded if it reaches its goal by March 15, 2026 at 11:59 PM EST."

    const pressHeading = props.press?.heading ?? "Featured in"
    const pressLogos = props.press?.logos?.length
      ? props.press.logos
      : ["Fast Company", "Wired", "Dezeen", "Core77", "Design Milk"]

    const storyEyebrow = props.story?.eyebrow ?? "Our Story"
    const storyHeading = props.story?.heading ?? "Why We Created EcoBrush"
    const storyIntro =
      props.story?.intro ??
      "Every year, 4.7 billion plastic toothbrushes end up in landfills and oceans. We knew there had to be a better way."
    const storyBlocks = props.story?.blocks?.length
      ? props.story.blocks
      : [
          {
            imageAlt:
              "Team of designers working at wooden desk reviewing bamboo material samples",
            body: "It started with a simple question: Why does every electric toothbrush on the market have a plastic body that will outlive us by 500 years? Dr. Sarah Chen, a dental researcher, and Marcus Okafor, a sustainable materials engineer, met at a conference in Copenhagen in 2022 and discovered they had been asking themselves the same question.",
          },
          {
            imageAlt:
              "Dense bamboo forest with morning sunlight filtering through tall green stalks",
            body: "After two years of research and 47 prototype iterations, we developed a proprietary bamboo composite that is 98% biodegradable, naturally antimicrobial, and durable enough for daily use. Our Moso bamboo is sourced from FSC-certified forests in Zhejiang Province, China, and every handle is hand-finished by skilled craftspeople.",
          },
        ]
    const storyQuote =
      props.story?.quote ??
      "We didn't want to compromise on performance. EcoBrush had to clean as well as the best electric brushes on the market—while leaving zero trace when its job is done."
    const storyQuoteAuthor =
      props.story?.quoteAuthor ??
      "Dr. Sarah Chen, Co-founder & Chief Dental Officer"
    const problemHeading =
      props.story?.problemHeading ?? "The Problem We're Solving"
    const problemStats = props.story?.problemStats?.length
      ? props.story.problemStats
      : [
          { value: "4.7B", label: "Plastic toothbrushes discarded annually worldwide" },
          { value: "500", label: "Years for a plastic brush to decompose" },
          { value: "50M", label: "Pounds of toothbrush waste added to oceans each year" },
        ]
    const solutionHeading = props.story?.solutionHeading ?? "Our Solution"
    const solutionParagraphs = props.story?.solutionParagraphs?.length
      ? props.story.solutionParagraphs
      : [
          "EcoBrush combines sustainable materials with premium engineering. The handle is crafted from compressed bamboo fibers bonded with a plant-based resin. At the end of its life, you simply separate the small metal motor assembly (which we take back for recycling through our Take-Back Program) and compost the bamboo body. It returns to the earth in 4-6 months, not centuries.",
          "The sonic motor delivers 40,000 vibrations per minute—matching the performance of premium plastic alternatives. Three smart modes (Clean, Whiten, Sensitive) adapt to your needs, and the 30-day battery life means less charging, less energy consumption.",
        ]

    const featuresEyebrow = props.features?.eyebrow ?? "Features"
    const featuresHeading =
      props.features?.heading ??
      "Designed for Performance. Built for the Planet."
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "40,000 VPM Sonic Motor",
            description:
              "Clinically proven to remove 10x more plaque than manual brushing with whisper-quiet operation.",
          },
          {
            title: "98% Biodegradable",
            description:
              "Bamboo composite handle breaks down in months, not centuries. Just remove the small motor for recycling.",
          },
          {
            title: "Replaceable Brush Heads",
            description:
              "Snap-on heads made from plant-based bristles and recyclable aluminum ferrule. 4-pack for $18.",
          },
          {
            title: "30-Day Battery Life",
            description:
              "USB-C rechargeable lithium battery. One charge lasts a month of twice-daily brushing.",
          },
          {
            title: "Naturally Antimicrobial",
            description:
              "Bamboo's natural antimicrobial properties keep your brush fresher, longer. No chemical coatings needed.",
          },
          {
            title: "Zero-Plastic Packaging",
            description:
              "Shipped in 100% recycled and recyclable paper-based packaging. No plastic film, no foam.",
          },
        ]

    const galleryEyebrow = props.gallery?.eyebrow ?? "Gallery"
    const galleryHeading = props.gallery?.heading ?? "See EcoBrush in Action"
    const galleryAlts = props.gallery?.imageAlts?.length
      ? props.gallery.imageAlts
      : [
          "Woman holding bamboo toothbrush in minimalist bathroom with white tiles and natural light",
          "Close-up of bamboo toothbrush handle showing ergonomic grip design",
          "EcoBrush charging station on wooden shelf with succulent plant",
          "Bamboo toothbrush heads arranged in compostable packaging materials",
          "Family using EcoBrush products at bathroom sinks together in morning routine",
          "EcoBrush sustainable packaging unboxing experience on linen background",
        ]

    const rewardsEyebrow = props.rewards?.eyebrow ?? "Rewards"
    const rewardsHeading = props.rewards?.heading ?? "Choose Your Reward"
    const rewardsDesc =
      props.rewards?.description ??
      "Select a pledge level that works for you. Every backer brings EcoBrush closer to reality."
    const rewardTiers = props.rewards?.tiers?.length
      ? props.rewards.tiers
      : [
          {
            meta: "Early Bird — 500 claimed",
            name: "Single EcoBrush",
            price: "$49",
            description:
              "One EcoBrush handle, 2 brush heads, USB-C cable, travel case.",
            perks: ["40% off retail ($79)", "Ships June 2026"],
            cta: "Select — $49",
          },
          {
            meta: "Popular — 2,847 claimed",
            name: "Couple Bundle",
            price: "$89",
            description:
              "Two EcoBrush handles, 4 brush heads, 2 travel cases, dual charging base.",
            perks: ["44% off retail", "Free shipping"],
            cta: "Select — $89",
          },
          {
            meta: "4,231 claimed",
            name: "Family Pack",
            price: "$149",
            description:
              "Four EcoBrush handles, 8 brush heads, 4 travel cases, charging station + 4-port USB hub.",
            perks: [
              "53% off retail",
              "Bonus: Year of brush heads",
              "Priority shipping",
            ],
            cta: "Select — $149",
            featured: true,
            badge: "Best Value",
          },
          {
            meta: "Limited — 127 of 250 left",
            name: "VIP Founder",
            price: "$299",
            description:
              "Everything in Family Pack + lifetime 50% off brush heads, name on website, exclusive colorway.",
            perks: [
              "Limited edition walnut variant",
              "Video call with founders",
              "First production batch",
            ],
            cta: "Select — $299",
          },
        ]

    const stretchHeading =
      props.stretchGoals?.heading ?? "Stretch Goals Unlocked"
    const stretchItems = props.stretchGoals?.items?.length
      ? props.stretchGoals.items
      : [
          {
            title: "$100K — Mobile App",
            description:
              "iOS & Android app for brushing analytics and reminders",
            status: "Unlocked",
            unlocked: true,
          },
          {
            title: "$250K — Kids Edition",
            description:
              "Smaller handle, fun colors, built-in timer with character guides",
            status: "Unlocked",
            unlocked: true,
          },
          {
            title: "$400K — Subscription Service",
            description:
              "Automated brush head delivery every 3 months at 30% off",
            status: "Unlocked",
            unlocked: true,
          },
          {
            title: "$750K — Solar Charging Base",
            description:
              "Optional solar-powered charging dock for true off-grid living",
            status: "In Progress",
            unlocked: false,
          },
        ]

    const testimonialsEyebrow = props.testimonials?.eyebrow ?? "Testimonials"
    const testimonialsHeading =
      props.testimonials?.heading ?? "What Beta Testers Are Saying"
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "I've tried every eco-friendly toothbrush out there. EcoBrush is the first one that actually feels like a premium product. The bamboo is smooth and warm in your hand—completely different from cold plastic.",
            name: "Jennifer Walsh",
            role: "Environmental Consultant, Portland",
            avatarAlt:
              "Professional headshot of a smiling woman with shoulder-length brown hair",
          },
          {
            quote:
              "As a dentist, I'm particular about oral care. The 40,000 VPM motor delivers serious cleaning power. My patients who tested it saw measurable improvements in plaque reduction. And they love that it won't sit in a landfill forever.",
            name: "Dr. Michael Chen",
            role: "Dentist, San Francisco",
            avatarAlt:
              "Professional headshot of a male dentist in white coat with friendly smile",
          },
          {
            quote:
              "The battery life is incredible—I charged it when I received it three weeks ago and it's still going strong. The travel case is elegant and the whole product just feels thoughtful. This is how all products should be designed.",
            name: "Marcus Okafor",
            role: "Product Designer, Berlin",
            avatarAlt:
              "Professional headshot of a young man with beard and warm expression",
          },
        ]

    const faqEyebrow = props.faq?.eyebrow ?? "FAQ"
    const faqHeading = props.faq?.heading ?? "Frequently Asked Questions"
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            q: "When will EcoBrush ship?",
            a: "We expect to begin shipping in June 2026. This timeline accounts for tooling finalization, production ramp-up, and quality control. VIP Founder backers will receive their orders first, followed by Family Pack, Couple Bundle, and Single EcoBrush backers in that order. We'll send monthly updates to all backers throughout the production process.",
          },
          {
            q: "How do I dispose of EcoBrush when it reaches end of life?",
            a: "Disposal is simple and designed for circularity. First, separate the brush head from the handle—the aluminum ferrule and plant-based bristles can go in your recycling bin. Next, use the included tool to remove the small motor assembly from the bamboo handle. Send the motor back to us for recycling through our Take-Back Program (we provide a prepaid envelope). Finally, the bamboo handle can be composted in your home compost bin or municipal compost program—it will break down completely in 4-6 months.",
          },
          {
            q: "Is the bamboo sustainably sourced?",
            a: "Yes, absolutely. We use Moso bamboo (Phyllostachys edulis) harvested from FSC-certified forests in Zhejiang Province, China. Moso bamboo is not a food source for pandas and grows incredibly fast—up to 1 meter per day—making it highly renewable. Our supplier has been certified by the Forest Stewardship Council since 2018 and undergoes annual third-party audits for environmental and labor practices.",
          },
          {
            q: "Does EcoBrush work with braces or dental work?",
            a: "EcoBrush is safe for use with braces, crowns, veneers, and implants. We recommend the \"Sensitive\" mode for those with orthodontic work—it's gentler but still effective. The plant-based bristles are softer than typical nylon but engineered to clean thoroughly around brackets and wires. As always, check with your dentist if you have specific concerns about your dental work.",
          },
          {
            q: "What is your refund policy?",
            a: "Crowdfunding pledges can be cancelled and fully refunded for any reason before the campaign ends on March 15, 2026. After the campaign closes and funds are transferred to production, refunds will be available if we encounter delays exceeding 6 months from the estimated ship date, or if the project cannot be completed. Once your EcoBrush ships, our standard 2-year warranty applies, which covers defects in materials and workmanship.",
          },
          {
            q: "Do you ship internationally?",
            a: "Yes, we ship to 47 countries. Shipping is free to the US, UK, EU, Canada, Australia, and New Zealand. For other destinations, shipping is calculated at checkout based on your location. Please note that international backers may be responsible for import duties and taxes, which vary by country and are not included in the pledge amount. Due to shipping regulations, we cannot ship to PO boxes.",
          },
        ]

    const ctaHeading = props.cta?.heading ?? "Be Part of the Solution"
    const ctaDesc =
      props.cta?.description ??
      "12,847 people have already joined us. Every pledge brings EcoBrush closer to production and keeps more plastic out of our oceans."
    const ctaPrimary = props.cta?.primaryCta ?? "Back This Project — $49"
    const ctaSecondary = props.cta?.secondaryCta ?? "Share This Campaign"
    const ctaNote =
      props.cta?.note ??
      "Campaign ends March 15, 2026 at 11:59 PM EST · Ships June 2026"

    const footerTagline =
      props.footer?.tagline ??
      "The first electric toothbrush designed to return to the earth. Sustainable oral care without compromise."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            heading: "Campaign",
            links: ["Our Story", "Features", "Rewards", "FAQ"],
          },
          {
            heading: "Company",
            links: [
              "About Us",
              "Sustainability Report",
              "Press Kit",
              "Contact",
            ],
          },
        ]
    const footerSocials = props.footer?.socials?.length
      ? props.footer.socials
      : ["Instagram", "Twitter", "YouTube"]
    const footerNote =
      props.footer?.note ?? "© 2026 EcoBrush Inc. All rights reserved."
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy Policy", "Terms of Service", "Cookie Policy"]

    const storedPledges = lakebed.useQuery("pledges")
    const addPledge = lakebed.useMutation("addPledge")
    const updatePledgeQuantity = lakebed.useMutation("updatePledgeQuantity")
    const removePledge = lakebed.useMutation("removePledge")
    const clearPledges = lakebed.useMutation("clearPledges")
    const auth = lakebed.useAuth()
    const isSignedIn = auth.isAuthenticated && !auth.isGuest
    const authEmail = auth.email || auth.user?.email
    const authDisplayName =
      auth.displayName || auth.user?.displayName || authEmail || "Account"
    const authInitials = authDisplayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((piece) => piece[0]?.toUpperCase())
      .join("") || "ME"
    const authLabel = auth.isLoading
      ? "Checking..."
      : isSignedIn
        ? authDisplayName
        : "Sign in"
    const handleSignIn = () => {
      if (auth.isLoading) return

      void lakebed.signInWithGoogle()
    }
    const handleSignOut = () => {
      lakebed.signOut()
    }
    const safePledges = storedPledges ?? []
    const pledgeCount = safePledges.reduce(
      (total, pledge) => total + pledge.quantity,
      0,
    )
    const pledgeTotal = safePledges.reduce(
      (total, pledge) => total + priceAmount(pledge.rewardPrice) * pledge.quantity,
      0,
    )
    const primaryRewardTier = rewardTiers[0]

    const addPledgeAndOpen = (rewardName: string, rewardPrice: string) => {
      void addPledge(rewardName, rewardPrice)
      setPledgeDrawerOpen(true)
    }
    const incrementPledge = (
      id: string,
      currentQuantity: number,
      delta: number,
    ) => {
      const nextQuantity = Math.max(0, currentQuantity + delta)
      if (nextQuantity === 0) {
        void removePledge(id)
        return
      }

      void updatePledgeQuantity(id, nextQuantity)
    }

    // Brand mark — decorative leaf/sparkle glyph in an emerald-token tile.
    const LeafMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid place-items-center rounded-full bg-primary text-primary-foreground",
          className,
        )}
        aria-hidden="true"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      </span>
    )

    const Check = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="16"
        height="16"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
    )

    const Star = () => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="text-chart-4"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    const featureIcons = [
      // bolt
      "M13 10V3L4 14h7v7l9-11h-7z",
      // sun / sustainability
      "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707",
      // box
      "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
      // clock
      "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
      // shield
      "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
      // recycle / globe
      "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    ]

    return (
      <div
        className={cn(
          "min-h-svh bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <Sheet open={pledgeDrawerOpen} onOpenChange={setPledgeDrawerOpen}>
          <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
            <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-2"
              >
                <LeafMark className="size-8" />
                <span className="text-xl font-semibold tracking-tight">
                  {brand}
                </span>
              </button>
              <div className="hidden items-center gap-8 md:flex">
                {nav.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => go(label)}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                {isSignedIn ? (
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                    title={authEmail || "Signed in"}
                  >
                    {authInitials} {authDisplayName}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSignIn}
                    disabled={auth.isLoading}
                    className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-60"
                  >
                    {authLabel}
                  </button>
                )}
                <SheetTrigger asChild>
                  <button
                    type="button"
                    onClick={() => {
                      if (primaryRewardTier) {
                        addPledgeAndOpen(
                          primaryRewardTier.name,
                          primaryRewardTier.price,
                        )
                      }
                      go(nav[2] ?? "Rewards")
                    }}
                    className="relative rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    Back This Project
                    {pledgeCount > 0 ? (
                      <span className="absolute -right-2 -top-2 inline-flex min-w-5 items-center justify-center rounded-full bg-background px-1.5 py-0.5 text-xs font-bold text-foreground">
                        {pledgeCount}
                      </span>
                    ) : null}
                  </button>
                </SheetTrigger>
              </div>
            </nav>
          </header>
          <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
            <SheetHeader className="border-b border-border p-6">
              <SheetTitle>Your Pledges</SheetTitle>
              <SheetDescription>
                {pledgeCount > 0
                  ? `${pledgeCount} reward${pledgeCount === 1 ? "" : "s"} added`
                  : "Add a reward tier to get started."}
              </SheetDescription>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {safePledges.length ? (
                <div className="space-y-5">
                  {safePledges.map((pledge) => (
                    <article
                      key={pledge.id}
                      className="rounded-lg border border-border p-4"
                    >
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-foreground">
                            {pledge.rewardName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {pledge.rewardPrice} each
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => void removePledge(pledge.id)}
                          className="text-xs font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <div className="inline-flex h-9 items-center rounded-full border border-border bg-background">
                          <button
                            type="button"
                            onClick={() =>
                              incrementPledge(pledge.id, pledge.quantity, -1)
                            }
                            className="grid size-9 place-items-center text-muted-foreground hover:text-foreground"
                            aria-label={`Decrease ${pledge.rewardName} quantity`}
                          >
                            -
                          </button>
                          <span className="min-w-8 text-center text-sm font-semibold">
                            {pledge.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              incrementPledge(pledge.id, pledge.quantity, 1)
                            }
                            className="grid size-9 place-items-center text-muted-foreground hover:text-foreground"
                            aria-label={`Increase ${pledge.rewardName} quantity`}
                          >
                            +
                          </button>
                        </div>
                        <p className="text-sm font-bold text-foreground">
                          {formatCurrency(
                            priceAmount(pledge.rewardPrice) * pledge.quantity,
                          )}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-6 text-center">
                  <p className="text-base font-semibold text-foreground">
                    No pledges yet
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Choose a reward tier to begin backing this project.
                  </p>
                </div>
              )}
            </div>
            <SheetFooter className="border-t border-border p-6">
              <div className="mb-4 space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Total pledged</span>
                  <span>{formatCurrency(pledgeTotal)}</span>
                </div>
              </div>
              {isSignedIn ? (
                <button
                  type="button"
                  disabled={!safePledges.length}
                  onClick={() => {
                    setPledgeDrawerOpen(false)
                    go("Checkout")
                  }}
                  className="w-full rounded-lg bg-foreground py-3 text-sm font-semibold text-background transition-colors hover:bg-foreground/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Continue to Checkout
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    handleSignIn()
                    setPledgeDrawerOpen(false)
                  }}
                  className="w-full rounded-lg bg-foreground py-3 text-sm font-semibold text-background transition-colors hover:bg-foreground/90 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={auth.isLoading}
                >
                  Sign in to Continue
                </button>
              )}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => void clearPledges()}
                  disabled={!safePledges.length}
                  className="w-full rounded-lg border border-border py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-60"
                >
                  Clear
                </button>
                <SheetClose asChild>
                  <button
                    type="button"
                    className="w-full rounded-lg bg-secondary py-3 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-secondary/90"
                  >
                    Continue
                  </button>
                </SheetClose>
              </div>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        <main>
          {/* Hero */}
          <section className="bg-card">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
              <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
                {/* Campaign image gallery */}
                <div className="order-2 lg:order-1">
                  <div className="aspect-[4/3] overflow-hidden rounded-xl bg-muted shadow-lg">
                    <Image
                      alt={heroMainImageAlt}
                      w={1200}
                      h={900}
                      className="size-full object-cover"
                    />
                  </div>
                  <div className="mt-4 grid grid-cols-4 gap-3">
                    {heroThumbAlts.map((alt) => (
                      <button
                        key={alt}
                        type="button"
                        onClick={() => go(nav[0])}
                        className="aspect-square overflow-hidden rounded-lg bg-muted transition-all hover:ring-2 hover:ring-ring"
                      >
                        <Image
                          alt={alt}
                          w={400}
                          h={400}
                          loading="lazy"
                          className="size-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Campaign info */}
                <div className="order-1 lg:order-2">
                  <div className="mb-4 flex items-center gap-2">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      {heroLiveBadge}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {heroCategory}
                    </span>
                  </div>
                  <h1 className="mb-4 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                    {heroHeading}
                  </h1>
                  <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
                    {heroSub}
                  </p>

                  {/* Funding progress */}
                  <div className="mb-8 rounded-xl bg-muted p-6">
                    <div className="mb-2 flex items-baseline gap-2">
                      <span className="text-4xl font-bold sm:text-5xl">
                        {heroRaised}
                      </span>
                      <span className="text-lg text-muted-foreground">
                        {heroGoalLabel}
                      </span>
                    </div>

                    <div
                      className="mb-4 h-3 w-full overflow-hidden rounded-full bg-secondary"
                      role="progressbar"
                      aria-valuenow={heroProgress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label="Funding progress"
                    >
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-500"
                        style={{ width: `${heroProgress}%` }}
                      />
                    </div>
                    <div className="mb-6 flex items-center gap-2 font-medium text-primary">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{heroFundedBanner}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 border-t border-border pt-6">
                      {heroStats.map((s, i) => (
                        <div
                          key={s.label}
                          className={cn(
                            "text-center",
                            i === 1 && "border-x border-border",
                          )}
                        >
                          <div className="text-2xl font-bold sm:text-3xl">
                            {s.value}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {s.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (primaryRewardTier) {
                        addPledgeAndOpen(
                          primaryRewardTier.name,
                          primaryRewardTier.price,
                        )
                      }
                      go(nav[2] ?? "Rewards")
                    }}
                    className="mb-4 block w-full rounded-xl bg-foreground py-4 text-center text-lg font-semibold text-background transition-colors hover:bg-foreground/90"
                  >
                    {heroPrimary}
                  </button>
                  <p className="text-center text-sm text-muted-foreground">
                    {heroDeadlineNote}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Press / featured-in */}
          <section className="border-y border-border bg-card py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
                {pressHeading}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-8 opacity-60 md:gap-16">
                {pressLogos.map((logo) => (
                  <button
                    key={logo}
                    type="button"
                    onClick={() => go(logo)}
                    className="text-xl font-semibold text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {logo}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Story */}
          <section className="bg-muted py-20 lg:py-28">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <span className="text-sm font-medium uppercase tracking-wider text-primary">
                  {storyEyebrow}
                </span>
                <h2 className="mb-4 mt-3 text-3xl font-semibold sm:text-4xl">
                  {storyHeading}
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                  {storyIntro}
                </p>
              </div>

              <div className="mb-12 grid gap-8 md:grid-cols-2">
                {storyBlocks.map((block) => (
                  <div key={block.imageAlt}>
                    <Image
                      alt={block.imageAlt}
                      w={800}
                      h={600}
                      loading="lazy"
                      className="mb-4 w-full rounded-xl object-cover"
                    />
                    <p className="leading-relaxed text-muted-foreground">
                      {block.body}
                    </p>
                  </div>
                ))}
              </div>

              <blockquote className="my-12 border-l-4 border-primary py-2 pl-6 text-xl italic text-foreground/80">
                &ldquo;{storyQuote}&rdquo;
                <footer className="mt-2 text-sm not-italic text-muted-foreground">
                  — {storyQuoteAuthor}
                </footer>
              </blockquote>

              <div className="mb-12 rounded-xl bg-card p-8 shadow-sm">
                <h3 className="mb-6 text-2xl font-semibold">
                  {problemHeading}
                </h3>
                <div className="grid gap-6 sm:grid-cols-3">
                  {problemStats.map((s) => (
                    <div key={s.label} className="p-4 text-center">
                      <div className="mb-2 text-4xl font-bold text-destructive">
                        {s.value}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {s.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <h3 className="mb-4 text-2xl font-semibold">
                {solutionHeading}
              </h3>
              {solutionParagraphs.map((p, i) => (
                <p
                  key={i}
                  className="mb-6 leading-relaxed text-muted-foreground"
                >
                  {p}
                </p>
              ))}
            </div>
          </section>

          {/* Features */}
          <section className="bg-card py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <span className="text-sm font-medium uppercase tracking-wider text-primary">
                  {featuresEyebrow}
                </span>
                <h2 className="mb-4 mt-3 text-3xl font-semibold sm:text-4xl">
                  {featuresHeading}
                </h2>
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {featureItems.map((item, i) => (
                  <div key={item.title} className="rounded-xl bg-muted p-6">
                    <div className="mb-4 grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d={featureIcons[i % featureIcons.length]} />
                      </svg>
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Gallery */}
          <section className="bg-muted py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <span className="text-sm font-medium uppercase tracking-wider text-primary">
                  {galleryEyebrow}
                </span>
                <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
                  {galleryHeading}
                </h2>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {galleryAlts.map((alt) => (
                  <div
                    key={alt}
                    className="aspect-[4/3] overflow-hidden rounded-xl"
                  >
                    <Image
                      alt={alt}
                      w={800}
                      h={600}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Rewards */}
          <section className="bg-card py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <span className="text-sm font-medium uppercase tracking-wider text-primary">
                  {rewardsEyebrow}
                </span>
                <h2 className="mb-4 mt-3 text-3xl font-semibold sm:text-4xl">
                  {rewardsHeading}
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                  {rewardsDesc}
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {rewardTiers.map((tier) => (
                  <div
                    key={tier.name}
                    className={cn(
                      "relative rounded-xl border-2 p-6 transition-colors",
                      tier.featured
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary",
                    )}
                  >
                    {tier.badge ? (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                        {tier.badge}
                      </div>
                    ) : null}
                    <div
                      className={cn(
                        "mb-2 text-sm",
                        tier.featured
                          ? "font-medium text-primary"
                          : "text-muted-foreground",
                      )}
                    >
                      {tier.meta}
                    </div>
                    <h3 className="mb-2 text-xl font-semibold">{tier.name}</h3>
                    <div className="mb-4 text-3xl font-bold">{tier.price}</div>
                    <p className="mb-6 text-sm text-muted-foreground">
                      {tier.description}
                    </p>
                    <ul className="mb-6 space-y-2 text-sm text-muted-foreground">
                      {tier.perks.map((perk) => (
                        <li key={perk} className="flex items-center gap-2">
                          <Check className="size-4 shrink-0 text-primary" />
                          {perk}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => {
                        void addPledge(tier.name, tier.price)
                        setPledgeDrawerOpen(true)
                        go(tier.name)
                      }}
                      className={cn(
                        "w-full rounded-lg py-3 font-medium transition-colors",
                        tier.featured
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "border-2 border-foreground text-foreground hover:bg-foreground hover:text-background",
                      )}
                    >
                      {tier.cta}
                    </button>
                  </div>
                ))}
              </div>

              {/* Stretch goals */}
              <div className="mt-16 rounded-xl bg-muted p-8">
                <h3 className="mb-6 text-center text-xl font-semibold">
                  {stretchHeading}
                </h3>
                <div className="space-y-4">
                  {stretchItems.map((goal) => (
                    <div
                      key={goal.title}
                      className={cn(
                        "flex items-center gap-4 rounded-xl p-4",
                        goal.unlocked
                          ? "bg-card"
                          : "bg-secondary opacity-60",
                      )}
                    >
                      <div
                        className={cn(
                          "grid size-10 shrink-0 place-items-center rounded-full",
                          goal.unlocked
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {goal.unlocked ? (
                          <Check className="size-5" />
                        ) : (
                          <span className="text-sm font-bold">?</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{goal.title}</div>
                        <p className="text-sm text-muted-foreground">
                          {goal.description}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "text-sm font-medium",
                          goal.unlocked
                            ? "text-primary"
                            : "text-muted-foreground",
                        )}
                      >
                        {goal.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="bg-muted py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <span className="text-sm font-medium uppercase tracking-wider text-primary">
                  {testimonialsEyebrow}
                </span>
                <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
                  {testimonialsHeading}
                </h2>
              </div>

              <div className="grid gap-8 md:grid-cols-3">
                {testimonialItems.map((t) => (
                  <div
                    key={t.name}
                    className="rounded-xl bg-card p-8 shadow-sm"
                  >
                    <div className="mb-4 flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} />
                      ))}
                    </div>
                    <p className="mb-6 leading-relaxed text-muted-foreground">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
                      <Image
                        alt={t.avatarAlt}
                        w={100}
                        h={100}
                        loading="lazy"
                        className="size-12 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-medium">{t.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {t.role}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-card py-20 lg:py-28">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <span className="text-sm font-medium uppercase tracking-wider text-primary">
                  {faqEyebrow}
                </span>
                <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
                  {faqHeading}
                </h2>
              </div>

              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.q}
                    className="group overflow-hidden rounded-xl border border-border"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between bg-card p-6 transition-colors hover:bg-muted">
                      <span className="font-medium">{item.q}</span>
                      <svg
                        className="size-5 text-muted-foreground transition-transform group-open:rotate-180"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="px-6 pb-6 leading-relaxed text-muted-foreground">
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* Closing CTA */}
          <section className="bg-primary py-20 text-primary-foreground lg:py-28">
            <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="mb-6 text-3xl font-semibold sm:text-4xl lg:text-5xl">
                {ctaHeading}
              </h2>
              <p className="mx-auto mb-8 max-w-2xl text-lg text-primary-foreground/80 sm:text-xl">
                {ctaDesc}
              </p>
              <div className="mb-8 flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    if (primaryRewardTier) {
                      addPledgeAndOpen(
                        primaryRewardTier.name,
                        primaryRewardTier.price,
                      )
                    }
                    go(nav[2] ?? "Rewards")
                  }}
                  className="rounded-xl bg-background px-8 py-4 text-lg font-semibold text-foreground transition-colors hover:bg-background/90"
                >
                  {ctaPrimary}
                </button>
                <button
                  type="button"
                  onClick={() => go(ctaSecondary)}
                  className="rounded-xl border-2 border-primary-foreground px-8 py-4 text-lg font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10"
                >
                  {ctaSecondary}
                </button>
              </div>
              <p className="text-sm text-primary-foreground/70">{ctaNote}</p>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-foreground py-16 text-background/70">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-12 md:grid-cols-4">
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <LeafMark className="size-8" />
                  <span className="text-xl font-semibold text-background">
                    {brand}
                  </span>
                </div>
                <p className="text-sm leading-relaxed">{footerTagline}</p>
              </div>
              {footerColumns.map((col) => (
                <div key={col.heading}>
                  <h4 className="mb-4 font-medium text-background">
                    {col.heading}
                  </h4>
                  <ul className="space-y-2 text-sm">
                    {col.links.map((link) => (
                      <li key={link}>
                        <button
                          type="button"
                          onClick={() => go(link)}
                          className="transition-colors hover:text-background"
                        >
                          {link}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <div>
                <h4 className="mb-4 font-medium text-background">Connect</h4>
                <div className="flex gap-4">
                  {footerSocials.map((social) => (
                    <button
                      key={social}
                      type="button"
                      aria-label={social}
                      onClick={() => go(social)}
                      className="grid size-10 place-items-center rounded-lg bg-background/10 text-background transition-colors hover:bg-background/20"
                    >
                      <span className="text-xs font-semibold">
                        {social.charAt(0)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center justify-between gap-4 border-t border-background/20 pt-8 md:flex-row">
              <p className="text-sm">{footerNote}</p>
              <div className="flex gap-6 text-sm">
                {footerLegal.map((link) => (
                  <button
                    key={link}
                    type="button"
                    onClick={() => go(link)}
                    className="transition-colors hover:text-background"
                  >
                    {link}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </footer>
      </div>
    )
  },
})
