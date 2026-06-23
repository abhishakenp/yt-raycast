import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"
import { describe, expect, it } from "vitest"

const DIR = dirname(fileURLToPath(import.meta.url))
const read = (file: string) => readFileSync(join(DIR, file), "utf8")

// The four CONTENT sections of the classic Indian-government / PSU portal
// family built in batch B. Source-level invariants guard against regression of
// the defineComponent contract, retrieval-rich descriptions, and the signature
// gov interactions (Events 4-tab board, Contact form).
const SECTIONS = [
  { file: "GovernmentPortalEvents.tsx", name: "GovernmentPortalEvents" },
  { file: "GovernmentPortalAbout.tsx", name: "GovernmentPortalAbout" },
  { file: "GovernmentPortalFaq.tsx", name: "GovernmentPortalFaq" },
  { file: "GovernmentPortalContact.tsx", name: "GovernmentPortalContact" },
] as const

describe("government-portal sections (batch B)", () => {
  for (const { file, name } of SECTIONS) {
    describe(name, () => {
      const src = read(file)

      it("uses defineComponent with the correct name", () => {
        expect(src).toContain('from "@openuidev/react-lang"')
        expect(src).toContain("defineComponent({")
        expect(src).toContain(`name: "${name}",`)
        expect(src).toContain(`export const ${name} = defineComponent`)
      })

      it("has a retrieval-rich gov description with tender/notice terms", () => {
        const lower = src.toLowerCase()
        expect(lower).toContain("government")
        expect(lower).toMatch(/tender|notice/)
        // classic Indian-gov retrieval anchors
        expect(lower).toMatch(/public sector|psu|civic|citizen|portal/)
      })
    })
  }

  it("Events renders the four-tab notice board", () => {
    const src = read("GovernmentPortalEvents.tsx")
    expect(src).toContain("useState")
    expect(src).toContain('label: "Tenders"')
    expect(src).toContain('label: "Notices"')
    expect(src).toContain('label: "Downloads"')
    expect(src).toContain('label: "Public Notices"')
    // 4 tab entries in the tabs array
    expect((src.match(/key: "(tenders|notices|downloads|public)"/g) ?? []).length).toBe(4)
  })

  it("Contact renders an enquiry/grievance form with the four fields", () => {
    const src = read("GovernmentPortalContact.tsx")
    expect(src).toContain("<form")
    expect(src).toContain("onSubmit")
    expect(src).toContain("useState")
    for (const field of ["name", "email", "subject", "message"]) {
      expect(src).toContain(`gov-contact-${field}`)
    }
  })

  it("About uses Image and a leader message + overview prose", () => {
    const src = read("GovernmentPortalAbout.tsx")
    expect(src).toContain('from "#/lib/img.tsx"')
    expect(src).toContain("leader")
    expect(src).toContain("overview")
  })

  it("Faq is an accordion driven by useState", () => {
    const src = read("GovernmentPortalFaq.tsx")
    expect(src).toContain("useState")
    expect(src).toContain("aria-expanded")
  })

  it("content sections compose the section-kit SectionHeading", () => {
    for (const { file } of SECTIONS) {
      expect(read(file)).toContain('from "#/section-kit/SectionHeading.tsx"')
    }
  })
})
