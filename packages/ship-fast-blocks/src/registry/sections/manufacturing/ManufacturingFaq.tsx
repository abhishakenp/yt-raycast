import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"

/**
 * ManufacturingFaq — a static FAQ list for a precision-manufacturing site. On a
 * muted band, a centered eyebrow + heading intro sits above a narrow column of
 * bordered card rows, each a definition-list question/answer pair with a bold
 * card-foreground question over muted answer copy. Clean, neutral, readable. Use
 * to answer common procurement questions (file formats, lead times, certs,
 * tolerances, ITAR, finishes, assembly, tracking) on machine-shop or fabricator
 * pages. Renders fully with no props via baked-in defaults.
 */
export const ManufacturingFaq = defineComponent({
  name: "ManufacturingFaq",
  description:
    "A static FAQ list for a precision-manufacturing site: on a muted band, a centered eyebrow + heading intro above a narrow column of bordered card rows, each a definition-list question/answer pair with a bold card-foreground question over muted answer copy. Clean, neutral, readable. Use to answer common procurement questions (file formats, lead times, certs, tolerances, ITAR, finishes, assembly, tracking) on machine-shop or fabricator pages.",
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    items: z
      .array(z.object({ question: z.string(), answer: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? "FAQ"
    const heading = props.heading ?? "Common Questions"
    const items = props.items?.length
      ? props.items
      : [
          {
            question: "What file formats do you accept for quotes?",
            answer:
              "We accept STEP, IGES, SolidWorks (.sldprt/.sldasm), CATIA, Parasolid, and AutoCAD files. For 2D laser cutting and sheet metal, PDF drawings with bend notes are sufficient. All files are handled securely and covered under our NDA.",
          },
          {
            question: "What is your typical lead time for prototypes?",
            answer:
              "Standard prototype lead time is 2-3 business days for machined parts and 3-5 days for sheet metal. Expedited 24-hour service is available for urgent projects. Production volumes typically ship in 2-4 weeks depending on complexity.",
          },
          {
            question: "Do you provide material certifications?",
            answer:
              "Yes, we provide full material certifications (mill certs), test reports, and inspection documentation with every order. FAIR (First Article Inspection Report) and PPAP (Production Part Approval Process) documentation is available upon request at no additional charge.",
          },
          {
            question: "What tolerances can you hold?",
            answer:
              'Our standard machining tolerance is ±0.005". Precision tolerances of ±0.001" are routine. For critical aerospace and medical applications, we can achieve ±0.0005" on suitable geometries using our 5-axis mills and precision grinders.',
          },
          {
            question: "Do you work with ITAR-controlled projects?",
            answer:
              "Yes, Vertex is ITAR registered and maintains a secure facility for defense work. We have SCIF capabilities and cleared personnel for classified projects. All employees undergo background checks and regular compliance training.",
          },
          {
            question: "What surface finishes do you offer?",
            answer:
              "We offer bead blasting, anodizing (Type II and III hardcoat), chem film (Alodine), powder coating, passivation, electroless nickel, and custom painting. Specialty finishes like Titanium anodizing and Teflon coating are also available.",
          },
          {
            question: "Do you offer assembly services?",
            answer:
              "Yes, we provide light assembly, hardware installation, and kitting services. Our Class 1000 cleanroom is available for medical device and semiconductor component assembly. We can also manage subcontractor relationships for specialized processes.",
          },
          {
            question: "How do I track my order?",
            answer:
              "All customers receive access to our online portal where you can track job status, view production photos, download inspection reports, and communicate with our team. Email and phone support is also available during business hours (7 AM - 5 PM PST, Mon-Fri).",
          },
        ]

    return (
      <section className={cn("bg-muted py-20 lg:py-28", props.className)}>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              {eyebrow}
            </span>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {heading}
            </h2>
          </div>
          <dl className="space-y-4">
            {items.map((item) => (
              <div
                key={item.question}
                className="rounded-lg border border-border bg-card p-6"
              >
                <dt className="mb-2 font-semibold text-card-foreground">
                  {item.question}
                </dt>
                <dd className="text-muted-foreground">{item.answer}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    )
  },
})
