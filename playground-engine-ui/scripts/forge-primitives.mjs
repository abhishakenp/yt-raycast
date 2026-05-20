// Layout primitives vocabulary for the forge planner.
//
// These primitives form the structural vocabulary that Qwen's planner picks
// from when proposing a layout per section. Locking sections to a known
// primitive forces visual consistency across generated sites.

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PRIMITIVES_PATH = resolve(__dirname, "..", "data", "primitives.json");

export const LAYOUT_PRIMITIVES = JSON.parse(readFileSync(PRIMITIVES_PATH, "utf8"));

export const PRIMITIVE_IDS = LAYOUT_PRIMITIVES.map((p) => p.id);

const PRIMITIVE_SET = new Set(PRIMITIVE_IDS);

export function isValidPrimitive(id) {
  return typeof id === "string" && PRIMITIVE_SET.has(id);
}

export function describePrimitives() {
  const lines = ["# Layout primitives", ""];
  LAYOUT_PRIMITIVES.forEach((p, i) => {
    lines.push(`${i + 1}. \`${p.id}\`: ${p.when}`);
  });
  return lines.join("\n");
}

// Heuristic fallback used when Qwen's plan omits a primitive for a section.
// Keys are normalized lowercase kinds; values can be a string (single) or a
// map keyed by site type with `_default` fallback.
const SUGGEST_MAP = {
  menu: "list-rows",
  pricing: {
    saas: "card-grid",
    _default: "card-grid",
  },
  testimonials: "masonry-grid",
  "case-studies": "magazine-asymmetric",
  casestudies: "magazine-asymmetric",
  team: "card-grid",
  process: "numbered-steps",
  "how-it-works": "numbered-steps",
  howitworks: "numbered-steps",
  hero: {
    restaurant: "full-bleed-overlay",
    hotel: "full-bleed-overlay",
    fitness: "full-bleed-overlay",
    event: "full-bleed-overlay",
    _default: "split-2col",
  },
  logos: "logo-strip",
  partners: "logo-strip",
  press: "logo-strip",
  stats: "stat-row",
  metrics: "stat-row",
  faq: "list-rows",
  story: "image-text-alternating",
  about: "image-text-alternating",
  contact: "form-split",
  booking: "form-split",
  reservation: "form-split",
  rooms: "card-grid",
  classes: "card-grid",
  services: "card-grid",
  features: "bento-asymmetric",
  gallery: "masonry-grid",
  schedule: "tabbed-content",
  locations: "map-side",
  navbar: "navbar-row",
  nav: "navbar-row",
  footer: "footer-grid",
  timeline: "timeline-vertical",
  history: "timeline-vertical",
  capabilities: "tag-cloud",
  skills: "tag-cloud",
  quote: "featured-quote",
  manifesto: "featured-quote",
};

function normalizeKind(kind) {
  return String(kind || "").trim().toLowerCase().replace(/\s+/g, "-");
}

function normalizeType(type) {
  return String(type || "").trim().toLowerCase();
}

export function suggestPrimitive(sectionKind, siteType) {
  const kind = normalizeKind(sectionKind);
  const type = normalizeType(siteType);

  // Testimonials with a single quote → featured-quote (caller signals via
  // kind "featured-quote" or "testimonial" / "testimonials"). Site type is
  // not enough to know cardinality; default stays masonry-grid.
  if (kind === "testimonial") return "featured-quote";

  const entry = SUGGEST_MAP[kind];
  if (!entry) return "centered-stacked";

  if (typeof entry === "string") return entry;

  // Object: site-type lookup with _default fallback.
  if (type && entry[type]) return entry[type];
  return entry._default || "centered-stacked";
}

// ---------- CLI ----------
const isMain = process.argv[1] && resolve(process.argv[1]) === __filename;
if (isMain) {
  const cmd = process.argv[2];
  if (cmd === "list") {
    for (const id of PRIMITIVE_IDS) console.log(id);
  } else if (cmd === "describe") {
    console.log(describePrimitives());
  } else {
    console.error("usage: bun scripts/forge-primitives.mjs <list|describe>");
    process.exit(1);
  }
}
