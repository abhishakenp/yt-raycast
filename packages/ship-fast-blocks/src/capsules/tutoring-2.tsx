import { type ReactNode } from "react"
import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * TutoringKimiPage2 — a bold, dark-hero tutoring landing page. This is the
 * second style sibling to TutoringKimiPage, featuring a high-contrast hero
 * with ambient background imagery and a floating tutor card, a trusted-by
 * school logos strip, a 6-up subject grid with tag chips, a 4-up vetted-expert
 * highlights band, a numbered vertical step timeline paired with a
 * session-booked preview image, a 4-column mentor gallery with star ratings,
 * a 3-tier pricing table on a dark band with an emphasized Most Popular plan,
 * a full-width stats band, a 6-up testimonial grid with star-rated quotes
 * and parent/student avatars, an accordion FAQ with animated chevrons, a
 * vibrant CTA section with dot-pattern texture, and a multi-column footer with
 * social icons. Use when a modern, energetic, conversion-forward tutoring
 * marketplace page is wanted with rich content sections, pricing tiers, and
 * social proof.
 */
export const TutoringKimiPage2 = defineCapsule({
  name: "TutoringKimiPage2",
  description:
    "A bold, dark-hero tutoring landing page — the second style sibling to TutoringKimiPage — featuring a high-contrast hero with ambient background imagery and floating tutor card, a trusted-by school logos strip, a 6-up subject grid with tag chips, a 4-up vetted-expert highlights band, a numbered vertical step timeline paired with a session-booked preview image, a 4-column mentor gallery with star ratings, a 3-tier pricing table on a dark band with an emphasized Most Popular plan, a full-width stats band, a 6-up testimonial grid with star-rated quotes and parent/student avatars, an accordion FAQ with animated chevrons, a vibrant CTA section with dot-pattern texture, and a multi-column footer with social icons. Use when a modern, energetic, conversion-forward tutoring marketplace page is wanted with rich content sections, pricing tiers, and social proof.",
  props: z.object({
    brand: z.string().optional(),
    nav: z.array(z.string()).optional(),
    hero: z
      .object({
        badge: z.string().optional(),
        heading: z.string().optional(),
        highlight: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        trust: z.array(z.string()).optional(),
        imageAlt: z.string().optional(),
        floatingName: z.string().optional(),
        floatingMeta: z.string().optional(),
        floatingAvatarAlt: z.string().optional(),
      })
      .optional(),
    logos: z
      .object({
        caption: z.string().optional(),
        items: z.array(z.string()).optional(),
      })
      .optional(),
    features: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
              tags: z.array(z.string()),
            }),
          )
          .optional(),
      })
      .optional(),
    highlights: z
      .object({
        items: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    steps: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    tutors: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        viewAll: z.string().optional(),
        items: z
          .array(
            z.object({
              name: z.string(),
              subject: z.string(),
              bio: z.string(),
              rating: z.string(),
              tags: z.array(z.string()),
              avatarAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    pricing: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        plans: z
          .array(
            z.object({
              name: z.string(),
              tagline: z.string(),
              price: z.string(),
              period: z.string(),
              note: z.string().optional(),
              features: z.array(z.string()),
              cta: z.string(),
              featured: z.boolean().optional(),
              badge: z.string().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    stats: z
      .object({
        items: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    testimonials: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
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
    faq: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ question: z.string(), answer: z.string() }))
          .optional(),
      })
      .optional(),
    cta: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        note: z.string().optional(),
      })
      .optional(),
    footer: z
      .object({
        about: z.string().optional(),
        columns: z
          .array(
            z.object({
              title: z.string(),
              links: z.array(z.string()),
            }),
          )
          .optional(),
        copyright: z.string().optional(),
        tagline: z.string().optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()

    const brand = props.brand ?? "SparkTutors"
    const nav = props.nav?.length
      ? props.nav
      : ["Subjects", "How It Works", "Tutors", "Pricing", "FAQ"]

    const hero = {
      badge: props.hero?.badge ?? "Now accepting students for Fall 2025",
      heading: props.hero?.heading ?? "Learning that",
      highlight: props.hero?.highlight ?? "actually clicks.",
      subheading:
        props.hero?.subheading ??
        "Expert 1-on-1 tutoring in math, science, English, and test prep. Our tutors are top performers from universities like Stanford, MIT, and Cornell. Average grade improvement: 1.5 letter grades in 8 weeks.",
      primaryCta: props.hero?.primaryCta ?? "Start Your Free Session",
      secondaryCta: props.hero?.secondaryCta ?? "See How It Works",
      trust: props.hero?.trust?.length
        ? props.hero.trust
        : ["No commitment", "Vetted top-5% tutors", "Money-back guarantee"],
      imageAlt:
        props.hero?.imageAlt ??
        "young woman tutoring a high school student at a wooden table with notebooks and a laptop",
      floatingName: props.hero?.floatingName ?? "Dr. Sarah Chen",
      floatingMeta: props.hero?.floatingMeta ?? "PhD Mathematics, MIT",
      floatingAvatarAlt:
        props.hero?.floatingAvatarAlt ??
        "professional headshot of a smiling female tutor with dark hair",
    }

    const logos = {
      caption:
        props.logos?.caption ?? "Trusted by families at leading schools",
      items: props.logos?.items?.length
        ? props.logos.items
        : [
            "Exeter Prep",
            "Andover Academy",
            "Harker School",
            "Lakeside",
            "TJ High School",
          ],
    }

    const features = {
      heading: props.features?.heading ?? "Every subject, every level.",
      description:
        props.features?.description ??
        "From elementary reading to college-level physics, our specialists cover 40+ subjects with proven curricula designed for real understanding — not just homework help.",
      items: props.features?.items?.length
        ? props.features.items
        : [
            {
              title: "Mathematics",
              description:
                "Arithmetic through multivariable calculus, linear algebra, and differential equations. AP Calculus AB/BC specialists with 95% pass rate.",
              tags: ["Algebra", "Geometry", "Calculus", "Statistics"],
            },
            {
              title: "Sciences",
              description:
                "Biology, chemistry, physics, and environmental science. Hands-on lab prep and conceptual problem-solving from PhD-level instructors.",
              tags: ["Biology", "Chemistry", "Physics", "AP Science"],
            },
            {
              title: "English & Writing",
              description:
                "Reading comprehension, essay writing, grammar, and literary analysis. Former AP English exam readers on staff.",
              tags: ["Reading", "Essays", "Literature", "ESL"],
            },
            {
              title: "Test Preparation",
              description:
                "SAT, ACT, SSAT, ISEE, AP exams, and GRE. Average score improvement of 140 points on the SAT and 4 points on the ACT.",
              tags: ["SAT", "ACT", "SSAT", "AP Exams"],
            },
            {
              title: "Computer Science",
              description:
                "Python, Java, JavaScript, data structures, algorithms, and machine learning fundamentals. Project-based learning with real portfolio builds.",
              tags: ["Python", "Java", "JavaScript", "AP CS"],
            },
            {
              title: "Languages",
              description:
                "Spanish, Mandarin, French, Latin, and German. Native speakers and certified educators with immersive conversation practice.",
              tags: ["Spanish", "Mandarin", "French", "Latin"],
            },
          ],
    }

    const highlights = {
      items: props.highlights?.items?.length
        ? props.highlights.items
        : [
            {
              title: "Vetted Experts",
              description:
                "Top 5% of applicants. Background-checked with verified credentials.",
            },
            {
              title: "Flexible Scheduling",
              description:
                "Book same-day sessions 7 days a week, 6 AM to 11 PM in your timezone.",
            },
            {
              title: "Progress Tracking",
              description:
                "Detailed session notes and weekly dashboards for parents and students.",
            },
            {
              title: "Personalized Matching",
              description:
                "AI-assisted tutor matching based on learning style and personality.",
            },
          ],
    }

    const steps = {
      heading: props.steps?.heading ?? "Start learning in minutes.",
      description:
        props.steps?.description ??
        "No long-term contracts. No hidden fees. Just book, meet, and start seeing results from the very first session.",
      items: props.steps?.items?.length
        ? props.steps.items
        : [
            {
              title: "Tell us what you need",
              description:
                "Answer 5 quick questions about the subject, grade level, and learning goals. Takes under 60 seconds.",
            },
            {
              title: "Get matched with a tutor",
              description:
                "Our matching engine suggests 3 verified tutors. Review their profiles, credentials, and student ratings before choosing.",
            },
            {
              title: "Book your first session",
              description:
                "Pick a time that works for you. Sessions are held over our interactive video classroom with built-in whiteboard and screen share.",
            },
            {
              title: "Track progress every week",
              description:
                "Receive detailed session recaps, practice assignments, and a weekly progress dashboard. Adjust goals anytime.",
            },
          ],
    }

    const tutors = {
      heading: props.tutors?.heading ?? "Meet your mentors.",
      description:
        props.tutors?.description ??
        "Our tutors are graduates and current students from the nation's top universities. They have an average of 4.8 years of teaching experience and are passionate about helping students succeed.",
      viewAll: props.tutors?.viewAll ?? "View All 200+ Tutors",
      items: props.tutors?.items?.length
        ? props.tutors.items
        : [
            {
              name: "Dr. Marcus Webb",
              subject: "Mathematics & Physics",
              bio: "PhD Physics, Stanford. 6 years teaching AP Calculus and Physics. Former competition math coach.",
              rating: "4.9",
              tags: ["Calculus", "Physics", "SAT Math"],
              avatarAlt:
                "professional headshot of a smiling male tutor in his late twenties wearing a navy blazer",
            },
            {
              name: "Priya Sharma",
              subject: "English & History",
              bio: "AB Harvard '22, Rhodes Scholar finalist. Specializes in essay writing and AP English Literature.",
              rating: "5.0",
              tags: ["Writing", "Literature", "History"],
              avatarAlt:
                "professional headshot of a confident female tutor in her early thirties with dark hair and a white blouse",
            },
            {
              name: "James Okonkwo",
              subject: "Chemistry & Biology",
              bio: "MD Candidate, Johns Hopkins. 5 years tutoring organic chemistry and molecular biology.",
              rating: "4.8",
              tags: ["Chemistry", "Biology", "MCAT"],
              avatarAlt:
                "professional headshot of a friendly male tutor in his late twenties wearing a light blue button-down shirt",
            },
            {
              name: "Lin Chen",
              subject: "Computer Science & Math",
              bio: "BS Computer Science, MIT. Former software engineer at Google. Teaches Python, Java, and algorithms.",
              rating: "4.9",
              tags: ["Python", "Java", "AP CS"],
              avatarAlt:
                "professional headshot of a cheerful female tutor in her late twenties with long dark hair and a cream sweater",
            },
          ],
    }

    const pricing = {
      heading: props.pricing?.heading ?? "Simple, transparent pricing.",
      description:
        props.pricing?.description ??
        "No enrollment fees. No surprise charges. Purchase sessions and use them whenever you want — they never expire.",
      plans: props.pricing?.plans?.length
        ? props.pricing.plans
        : [
            {
              name: "Single Session",
              tagline: "Perfect for a quick cram or homework emergency.",
              price: "$75",
              period: "/session",
              features: [
                "60 minutes, 1-on-1",
                "Session recording included",
                "Session notes & resources",
                "Same-day booking available",
              ],
              cta: "Book Single Session",
              featured: false,
            },
            {
              name: "8-Session Pack",
              tagline: "Our recommended plan for measurable improvement.",
              price: "$540",
              period: "/pack",
              note: "$67.50 per session — save 10%",
              features: [
                "Everything in Single Session",
                "Matched tutor consistency",
                "Weekly progress reports",
                "Custom practice problem sets",
                "Email support between sessions",
              ],
              cta: "Get 8 Sessions",
              featured: true,
              badge: "Most Popular",
            },
            {
              name: "Semester Plan",
              tagline:
                "Comprehensive support for a full semester or test prep cycle.",
              price: "$1,260",
              period: "/semester",
              note: "$63 per session — save 16%",
              features: [
                "20 sessions, never expire",
                "Dedicated tutor assignment",
                "Parent dashboard & calls",
                "Custom curriculum road map",
                "Priority scheduling & 24/7 chat",
              ],
              cta: "Start Semester Plan",
              featured: false,
            },
          ],
    }

    const stats = {
      items: props.stats?.items?.length
        ? props.stats.items
        : [
            { value: "14,000+", label: "Students Helped" },
            { value: "98,000+", label: "Sessions Delivered" },
            { value: "4.9/5", label: "Average Rating" },
            { value: "240+", label: "Expert Tutors" },
          ],
    }

    const testimonials = {
      heading: props.testimonials?.heading ?? "Real families. Real results.",
      description:
        props.testimonials?.description ??
        "Join thousands of families who have transformed their student's confidence and grades with Spark Tutors.",
      items: props.testimonials?.items?.length
        ? props.testimonials.items
        : [
            {
              quote:
                'My daughter went from a C+ in Algebra II to an A- in just six weeks with Marcus. She actually looks forward to their sessions now. The detailed progress reports after every meeting are incredibly helpful.',
              name: "Jennifer Walsh",
              role: "Parent of 10th grader, Boston, MA",
              avatarAlt:
                "professional headshot of a smiling mother in her forties with short brown hair and glasses",
            },
            {
              quote:
                "I was completely lost in AP Chemistry before working with James. He explained stoichiometry and equilibrium in ways my teacher never could. I got a 5 on the AP exam and now I'm majoring in chemistry at UCLA.",
              name: "David Park",
              role: "12th grader, Los Angeles, CA",
              avatarAlt:
                "professional headshot of a smiling young man with short dark hair wearing a dark crew neck shirt",
            },
            {
              quote:
                "Priya helped my son with his college application essays. The difference between his first draft and final submission was night and day. He got into his dream school, and I truly believe her guidance was a major factor.",
              name: "Margaret Okafor",
              role: "Parent of 12th grader, Chicago, IL",
              avatarAlt:
                "professional headshot of a smiling woman in her fifties with silver hair and a navy blouse",
            },
            {
              quote:
                "I struggled with Spanish for two years. After 10 sessions with Maria, I went from failing quizzes to getting consistent B+s. She's patient and makes grammar actually make sense.",
              name: "Sophia Martinez",
              role: "11th grader, Miami, FL",
              avatarAlt:
                "professional headshot of a smiling teenage girl with long straight dark hair and a light pink top",
            },
            {
              quote:
                "The Semester Plan was the best investment we made this year. Our daughter's SAT score jumped from 1240 to 1420. The tutor assigned practice tests, tracked weak spots, and adjusted the plan weekly.",
              name: "Robert Henderson",
              role: "Parent of 11th grader, Austin, TX",
              avatarAlt:
                "professional headshot of a middle-aged man with graying hair and a warm smile wearing a blue dress shirt",
            },
            {
              quote:
                "Lin made computer science accessible for my son, who had zero coding experience. Three months later he's building his own Python projects and just started an AP CS class with full confidence.",
              name: "Amanda Liu",
              role: "Parent of 9th grader, Seattle, WA",
              avatarAlt:
                "professional headshot of a professional woman in her thirties wearing a black blazer and pearl earrings",
            },
          ],
    }

    const faq = {
      heading: props.faq?.heading ?? "Questions? We've got answers.",
      description:
        props.faq?.description ??
        "If you don't see your question here, our support team is available 7 days a week.",
      items: props.faq?.items?.length
        ? props.faq.items
        : [
            {
              question: "How do I choose the right tutor for my child?",
              answer:
                "After you fill out a brief questionnaire about your student's needs, our matching engine recommends 3 tutors based on subject expertise, teaching style, and personality fit. You can review full profiles including credentials, student reviews, sample teaching videos, and availability before making your choice. Every first session is backed by our satisfaction guarantee — if it's not a good fit, we'll rematch you at no cost.",
            },
            {
              question: "What happens during a typical tutoring session?",
              answer:
                "Sessions take place in our interactive virtual classroom with HD video, a shared digital whiteboard, and screen sharing. Before each session, your tutor reviews your previous progress and prepares targeted material. During the 60-minute session, you'll work through problems, review concepts, and ask questions in real time. Afterward, you'll receive a detailed recap with notes, assigned practice problems, and goals for next time.",
            },
            {
              question: "Can I use sessions for multiple subjects?",
              answer:
                "Absolutely. Your purchased sessions are stored as credits in your account and can be used across any subject and any tutor. Many of our students work with one tutor for math and another for English in the same week. There's no restriction on mixing subjects, and credits never expire.",
            },
            {
              question: "What is your cancellation and rescheduling policy?",
              answer:
                "You can reschedule or cancel any session up to 4 hours before the start time with no penalty — the session credit simply returns to your account. Cancellations within 4 hours may be subject to a late cancellation fee. For the Semester Plan, you'll also receive two complimentary same-day reschedules per month for those unexpected schedule changes.",
            },
            {
              question: "Do you offer in-person tutoring?",
              answer:
                "Currently, all Spark Tutors sessions are conducted online through our purpose-built virtual classroom. This allows us to match you with the absolute best tutor for your needs nationwide, not just whoever is available locally. Our online platform includes collaborative whiteboards, equation editors, document annotation, and session recording — tools that often make online tutoring more effective than in-person.",
            },
            {
              question: "Is there a money-back guarantee?",
              answer:
                "Yes. We offer a 100% satisfaction guarantee on your first session. If you or your student are not completely satisfied, we'll refund the full cost or apply it toward a rematch with a different tutor — your choice. For session packs, unused credits are fully refundable within 30 days of purchase. After 30 days, unused credits remain in your account indefinitely and can be used anytime.",
            },
          ],
    }

    const cta = {
      heading: props.cta?.heading ?? "Ready to see results?",
      description:
        props.cta?.description ??
        "Book your free 30-minute assessment session. We'll evaluate your student's needs, demonstrate our platform, and match them with the perfect tutor — no credit card required.",
      primaryCta: props.cta?.primaryCta ?? "Start Free Assessment",
      secondaryCta: props.cta?.secondaryCta ?? "View Full Pricing",
      note:
        props.cta?.note ??
        "Average first-session-to-match time: 4 minutes",
    }

    const footer = {
      about:
        props.footer?.about ??
        "Expert 1-on-1 tutoring that gets real results. Real tutors, real subjects, and a real commitment to your success.",
      columns: props.footer?.columns?.length
        ? props.footer.columns
        : [
            {
              title: "Subjects",
              links: [
                "Mathematics",
                "Sciences",
                "English & Writing",
                "Test Preparation",
                "Computer Science",
                "World Languages",
              ],
            },
            {
              title: "Company",
              links: ["About Us", "Our Tutors", "Careers", "Blog", "Press", "Contact"],
            },
            {
              title: "Support",
              links: [
                "Help Center",
                "Session Guidelines",
                "Technical Requirements",
                "Parent Resources",
                "Privacy Policy",
                "Terms of Service",
              ],
            },
          ],
      copyright:
        props.footer?.copyright ??
        `© ${new Date().getFullYear()} ${brand}. All rights reserved.`,
      tagline: props.footer?.tagline ?? "Made with care for students everywhere.",
    }

    const LogoIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 3v18" />
        <path d="M3 12h18" />
        <path d="m7 7 10 10" />
        <path d="m17 7-10 10" />
      </svg>
    )

    const Check = ({ className }: { className?: string }) => (
      <svg
        className={className}
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
        <path d="M5 13l4 4L19 7" />
      </svg>
    )

    const Star = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        className={className}
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
        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    )

    const ChevronDown = ({ className }: { className?: string }) => (
      <svg
        className={className}
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
        <path d="M19 9l-7 7-7-7" />
      </svg>
    )

    const SocialIcon = ({
      type,
      className,
    }: {
      type: string
      className?: string
    }) => {
      if (type === "Facebook") {
        return (
          <svg
            className={className}
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        )
      }
      if (type === "Twitter") {
        return (
          <svg
            className={className}
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
          </svg>
        )
      }
      if (type === "Instagram") {
        return (
          <svg
            className={className}
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
        )
      }
      if (type === "LinkedIn") {
        return (
          <svg
            className={className}
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
        )
      }
      return null
    }

    const subjectIcon = (i: number) => {
      const icons: ReactNode[] = [
        <svg
          key="m"
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
          <path d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>,
        <svg
          key="s"
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
          <path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>,
        <svg
          key="e"
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
          <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>,
        <svg
          key="t"
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
          <path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>,
        <svg
          key="c"
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
          <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>,
        <svg
          key="l"
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
          <path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>,
      ]
      return icons[i % icons.length]
    }

    return (
      <div
        className={cn(
          "min-h-svh bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
          <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => go(nav[0])}
              className="flex items-center gap-2"
            >
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
                <LogoIcon className="h-5 w-5" />
              </span>
              <span className="text-xl font-bold tracking-tight">{brand}</span>
            </button>

            <div className="hidden items-center gap-8 md:flex">
              {nav.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => go(label)}
                  className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => go("Log in")}
                className="hidden text-sm font-semibold text-primary transition-colors hover:text-primary/80 sm:inline-flex"
              >
                Log in
              </button>
              <button
                type="button"
                onClick={() => go("Book a Session")}
                className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-lg transition-colors hover:bg-primary/90"
              >
                Book a Session
              </button>
            </div>
          </nav>
        </header>

        <main>
          {/* Hero */}
          <section className="relative overflow-hidden bg-card" aria-label="Hero">
            <div className="absolute inset-0 opacity-20">
              <Image
                alt="overhead view of students collaborating on a laptop in a bright modern study space"
                w={2000}
                h={800}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-card via-card/95 to-card/70" />
            <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
              <div className="grid items-center gap-12 lg:grid-cols-2">
                <div>
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                    <span className="text-sm font-semibold text-primary">
                      {hero.badge}
                    </span>
                  </div>
                  <h1 className="mb-6 text-4xl font-black leading-tight tracking-tight text-card-foreground sm:text-5xl lg:text-7xl">
                    {hero.heading}
                    <br />
                    <span className="text-primary">{hero.highlight}</span>
                  </h1>
                  <p className="mb-8 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                    {hero.subheading}
                  </p>
                  <div className="mb-12 flex flex-col gap-4 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => go(hero.primaryCta)}
                      className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-4 text-base font-bold text-primary-foreground shadow-xl transition-all hover:scale-105 hover:bg-primary/90"
                    >
                      {hero.primaryCta}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => go(hero.secondaryCta)}
                      className="inline-flex items-center justify-center rounded-full border border-primary-foreground/20 bg-card/10 px-8 py-4 text-base font-bold text-card-foreground backdrop-blur transition-colors hover:bg-card/20"
                    >
                      {hero.secondaryCta}
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-muted-foreground">
                    {hero.trust.map((t) => (
                      <div key={t} className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-primary" />
                        <span>{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="relative hidden lg:block">
                  <div
                    className="relative overflow-hidden rounded-2xl border border-primary-foreground/10 shadow-2xl"
                    style={{ animation: "float 4s ease-in-out infinite" }}
                  >
                    <Image
                      alt={hero.imageAlt}
                      w={1200}
                      h={800}
                      className="h-auto w-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-6 -left-6 rounded-xl border border-border bg-background p-4 shadow-xl">
                    <div className="flex items-center gap-3">
                      <Image
                        alt={hero.floatingAvatarAlt}
                        w={120}
                        h={120}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-bold">{hero.floatingName}</p>
                        <p className="text-xs text-muted-foreground">
                          {hero.floatingMeta}
                        </p>
                        <div className="mt-0.5 flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 text-primary" />
                          <span className="text-xs font-bold">4.9</span>
                          <span className="text-xs text-muted-foreground">
                            (312 reviews)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Logos */}
          <section
            className="border-b border-border bg-muted/50"
            aria-label="Partner schools and organizations"
          >
            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
              <p className="mb-8 text-center text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                {logos.caption}
              </p>
              <div className="grid grid-cols-2 items-center justify-items-center gap-8 opacity-70 sm:grid-cols-3 md:grid-cols-5">
                {logos.items.map((logo, i) => (
                  <div
                    key={logo}
                    className={cn(
                      "flex items-center gap-2 text-lg font-bold tracking-tight text-foreground",
                      i === 4 && "hidden sm:flex",
                    )}
                  >
                    <svg
                      className="h-8 w-8"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      {i === 0 && (
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                      )}
                      {i === 1 && <rect x="3" y="3" width="18" height="18" rx="2" />}
                      {i === 2 && <path d="M12 2L1 21h22L12 2z" />}
                      {i === 3 && <circle cx="12" cy="12" r="10" />}
                      {i === 4 && <polygon points="12 2 22 22 2 22" />}
                    </svg>
                    {logo}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Features / Subjects */}
          <section
            id="subjects"
            className="bg-background py-20 sm:py-28 lg:py-36"
            aria-label="Subjects and features"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center lg:mb-20">
                <h2 className="mb-5 text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                  {features.heading}
                </h2>
                <p className="text-lg leading-relaxed text-muted-foreground sm:text-xl">
                  {features.description}
                </p>
              </div>
              <div className="mb-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                {features.items.map((item, i) => (
                  <article
                    key={item.title}
                    className="group relative rounded-2xl border border-border bg-muted/50 p-7 transition-all hover:border-primary/20 hover:shadow-xl sm:p-8"
                  >
                    <div className="mb-5 grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                      {subjectIcon(i)}
                    </div>
                    <h3 className="mb-2 text-xl font-bold text-foreground">
                      {item.title}
                    </h3>
                    <p className="mb-4 leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-border bg-background px-2.5 py-1 text-xs font-semibold text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {highlights.items.map((h) => (
                  <div
                    key={h.title}
                    className="flex items-start gap-4 rounded-xl border border-primary/20 bg-primary/5 p-5"
                  >
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
                      <Check className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="mb-1 font-bold text-foreground">
                        {h.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {h.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Steps */}
          <section
            id="how-it-works"
            className="bg-muted py-20 sm:py-28 lg:py-36"
            aria-label="How it works"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-24">
                <div>
                  <h2 className="mb-5 text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                    {steps.heading}
                  </h2>
                  <p className="mb-10 text-lg leading-relaxed text-muted-foreground">
                    {steps.description}
                  </p>
                  <div className="space-y-8">
                    {steps.items.map((step, i) => (
                      <div key={step.title} className="flex gap-5">
                        <div className="flex flex-col items-center">
                          <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-lg">
                            {i + 1}
                          </div>
                          {i < steps.items.length - 1 && (
                            <div className="mt-2 h-full w-0.5 bg-primary/20" />
                          )}
                        </div>
                        <div
                          className={cn(
                            "pb-8",
                            i === steps.items.length - 1 && "pb-0",
                          )}
                        >
                          <h3 className="text-lg font-bold text-foreground">
                            {step.title}
                          </h3>
                          <p className="leading-relaxed text-muted-foreground">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <div className="overflow-hidden rounded-2xl border border-border shadow-2xl">
                    <Image
                      alt="close-up of a student writing in a notebook with colored highlighters and a laptop showing study notes"
                      w={1200}
                      h={800}
                      className="h-auto w-full object-cover"
                    />
                  </div>
                  <div className="absolute -top-6 -right-6 hidden rounded-xl border border-border bg-background p-4 shadow-xl lg:block">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-full bg-secondary">
                        <Check className="h-5 w-5 text-secondary-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">Session Booked</p>
                        <p className="text-xs text-muted-foreground">
                          Algebra II with Marcus — Today at 4:00 PM
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -bottom-6 -left-6 hidden rounded-xl border border-border bg-background p-4 shadow-xl lg:block">
                    <div className="flex items-center gap-3">
                      <Image
                        alt="professional headshot of a smiling young female tutor with curly brown hair"
                        w={120}
                        h={120}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-bold">Matched with Priya</p>
                        <div className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 text-primary" />
                          <span className="text-xs font-bold">4.9</span>
                          <span className="text-xs text-muted-foreground">
                            Harvard '22
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Tutors */}
          <section
            id="tutors"
            className="bg-background py-20 sm:py-28 lg:py-36"
            aria-label="Featured tutors"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 flex flex-col justify-between gap-6 sm:flex-row sm:items-end lg:mb-16">
                <div className="max-w-2xl">
                  <h2 className="mb-4 text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                    {tutors.heading}
                  </h2>
                  <p className="text-lg leading-relaxed text-muted-foreground">
                    {tutors.description}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => go(tutors.viewAll)}
                  className="inline-flex shrink-0 items-center justify-center rounded-full border-2 border-foreground px-6 py-3 text-sm font-bold text-foreground transition-colors hover:bg-foreground hover:text-background"
                >
                  {tutors.viewAll}
                </button>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
                {tutors.items.map((tutor) => (
                  <article key={tutor.name} className="group">
                    <div className="relative mb-4 overflow-hidden rounded-2xl bg-muted">
                      <Image
                        alt={tutor.avatarAlt}
                        w={600}
                        h={750}
                        loading="lazy"
                        className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-background/95 px-2.5 py-1 shadow-sm backdrop-blur">
                        <Star className="h-3.5 w-3.5 text-primary" />
                        <span className="text-xs font-bold">{tutor.rating}</span>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-foreground">
                      {tutor.name}
                    </h3>
                    <p className="mb-1 text-sm font-semibold text-primary">
                      {tutor.subject}
                    </p>
                    <p className="mb-3 text-sm text-muted-foreground">
                      {tutor.bio}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {tutor.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded bg-muted px-2 py-1 text-xs font-medium text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section
            id="pricing"
            className="bg-card py-20 sm:py-28 lg:py-36"
            aria-label="Pricing plans"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-14 max-w-3xl text-center lg:mb-20">
                <h2 className="mb-5 text-3xl font-black tracking-tight text-card-foreground sm:text-4xl lg:text-5xl">
                  {pricing.heading}
                </h2>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {pricing.description}
                </p>
              </div>
              <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
                {pricing.plans.map((plan) => (
                  <article
                    key={plan.name}
                    className={cn(
                      "relative flex flex-col rounded-2xl border p-8",
                      plan.featured
                        ? "border-primary bg-primary text-primary-foreground shadow-2xl"
                        : "border-border bg-card/50 text-card-foreground",
                    )}
                  >
                    {plan.badge && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-background px-4 py-1.5 text-xs font-black uppercase tracking-wider text-foreground shadow-lg">
                        {plan.badge}
                      </div>
                    )}
                    <h3
                      className={cn(
                        "mb-2 text-lg font-bold",
                        plan.featured
                          ? "text-primary-foreground"
                          : "text-card-foreground",
                      )}
                    >
                      {plan.name}
                    </h3>
                    <p
                      className={cn(
                        "mb-6 text-sm",
                        plan.featured
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground",
                      )}
                    >
                      {plan.tagline}
                    </p>
                    <div className="mb-6">
                      <span
                        className={cn(
                          "text-5xl font-black",
                          plan.featured
                            ? "text-primary-foreground"
                            : "text-card-foreground",
                        )}
                      >
                        {plan.price}
                      </span>
                      <span
                        className={cn(
                          "font-medium",
                          plan.featured
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground",
                        )}
                      >
                        {plan.period}
                      </span>
                      {plan.note && (
                        <div
                          className={cn(
                            "mt-1 text-sm",
                            plan.featured
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground",
                          )}
                        >
                          {plan.note}
                        </div>
                      )}
                    </div>
                    <ul className="mb-8 flex-1 space-y-3">
                      {plan.features.map((f) => (
                        <li
                          key={f}
                          className="flex items-start gap-3 text-sm"
                        >
                          <Check
                            className={cn(
                              "h-5 w-5 shrink-0",
                              plan.featured
                                ? "text-primary-foreground"
                                : "text-primary",
                            )}
                          />
                          <span
                            className={
                              plan.featured
                                ? "text-primary-foreground/80"
                                : "text-muted-foreground"
                            }
                          >
                            {f}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => go(plan.cta)}
                      className={cn(
                        "block rounded-full px-6 py-3.5 text-center text-sm font-bold transition-colors",
                        plan.featured
                          ? "bg-background text-foreground hover:bg-muted"
                          : "border border-border bg-card text-card-foreground hover:bg-muted",
                      )}
                    >
                      {plan.cta}
                    </button>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Stats */}
          <section
            className="bg-primary py-16 sm:py-20"
            aria-label="Statistics"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4 lg:gap-12">
                {stats.items.map((s) => (
                  <div key={s.label}>
                    <div className="mb-2 text-4xl font-black text-primary-foreground sm:text-5xl lg:text-6xl">
                      {s.value}
                    </div>
                    <div className="text-sm font-semibold uppercase tracking-wide text-primary-foreground/70 sm:text-base">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section
            className="bg-background py-20 sm:py-28 lg:py-36"
            aria-label="Testimonials"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-14 max-w-3xl text-center lg:mb-20">
                <h2 className="mb-5 text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                  {testimonials.heading}
                </h2>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {testimonials.description}
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                {testimonials.items.map((t) => (
                  <article
                    key={t.name}
                    className="flex flex-col rounded-2xl border border-border bg-muted/50 p-7 sm:p-8"
                  >
                    <div className="mb-4 flex items-center gap-1 text-primary">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="h-5 w-5" />
                      ))}
                    </div>
                    <blockquote className="mb-6 flex-1 leading-relaxed text-foreground/80">
                      &ldquo;{t.quote}&rdquo;
                    </blockquote>
                    <div className="flex items-center gap-3 border-t border-border pt-4">
                      <Image
                        alt={t.avatarAlt}
                        w={120}
                        h={120}
                        className="h-11 w-11 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-bold">{t.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {t.role}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section
            id="faq"
            className="bg-muted py-20 sm:py-28 lg:py-36"
            aria-label="Frequently asked questions"
          >
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="mb-14 text-center lg:mb-20">
                <h2 className="mb-5 text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                  {faq.heading}
                </h2>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {faq.description}
                </p>
              </div>
              <div className="space-y-4">
                {faq.items.map((item) => (
                  <details
                    key={item.question}
                    className="group rounded-xl border border-border bg-background transition-all open:border-primary/30 open:shadow-lg"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between p-6">
                      <h3 className="pr-4 text-base font-bold text-foreground sm:text-lg">
                        {item.question}
                      </h3>
                      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-muted transition-colors group-hover:bg-primary/10">
                        <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
                      </div>
                    </summary>
                    <div className="px-6 pb-6 leading-relaxed text-muted-foreground">
                      {item.answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section
            id="book"
            className="relative overflow-hidden bg-primary py-20 sm:py-28 lg:py-36"
            aria-label="Call to action"
          >
            <div className="absolute inset-0 opacity-10">
              <svg
                className="h-full w-full"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <pattern
                  id="dots"
                  width="20"
                  height="20"
                  patternUnits="userSpaceOnUse"
                >
                  <circle
                    cx="2"
                    cy="2"
                    r="1.5"
                    fill="currentColor"
                    className="text-primary-foreground"
                  />
                </pattern>
                <rect width="100" height="100" fill="url(#dots)" />
              </svg>
            </div>
            <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="mb-5 text-3xl font-black tracking-tight text-primary-foreground sm:text-4xl lg:text-5xl">
                {cta.heading}
              </h2>
              <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-primary-foreground/70 sm:text-xl">
                {cta.description}
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(cta.primaryCta)}
                  className="inline-flex items-center justify-center rounded-full bg-background px-8 py-4 text-base font-bold text-foreground shadow-xl transition-all hover:scale-105 hover:bg-muted"
                >
                  {cta.primaryCta}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => go(cta.secondaryCta)}
                  className="inline-flex items-center justify-center rounded-full border-2 border-primary-foreground/30 px-8 py-4 text-base font-bold text-primary-foreground transition-colors hover:bg-primary-foreground/10"
                >
                  {cta.secondaryCta}
                </button>
              </div>
              <p className="mt-6 text-sm font-medium text-primary-foreground/60">
                {cta.note}
              </p>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer
          className="border-t border-border bg-card py-16 sm:py-20"
          aria-label="Footer"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-8">
              <div className="lg:col-span-2">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-5 flex items-center gap-2"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
                    <LogoIcon className="h-5 w-5" />
                  </span>
                  <span className="text-xl font-bold tracking-tight text-card-foreground">
                    {brand}
                  </span>
                </button>
                <p className="mb-6 max-w-sm leading-relaxed text-muted-foreground">
                  {footer.about}
                </p>
                <div className="flex items-center gap-4">
                  {(
                    ["Facebook", "Twitter", "Instagram", "LinkedIn"] as const
                  ).map((social) => (
                    <button
                      key={social}
                      type="button"
                      onClick={() => go(social)}
                      aria-label={social}
                      className="grid h-10 w-10 place-items-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <SocialIcon type={social} className="h-5 w-5" />
                    </button>
                  ))}
                </div>
              </div>
              {footer.columns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-card-foreground">
                    {col.title}
                  </h4>
                  <ul className="space-y-2.5">
                    {col.links.map((link) => (
                      <li key={link}>
                        <button
                          type="button"
                          onClick={() => go(link)}
                          className="text-sm text-muted-foreground transition-colors hover:text-primary"
                        >
                          {link}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
              <p className="text-sm text-muted-foreground">
                {footer.copyright}
              </p>
              <p className="text-sm text-muted-foreground">
                {footer.tagline}
              </p>
            </div>
          </div>
        </footer>
      </div>
    )
  },
})
