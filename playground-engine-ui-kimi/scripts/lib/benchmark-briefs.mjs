/** Canonical benchmark briefs — shared by kimi-native and engine-benchmark. */
export const BENCHMARK_BRIEFS = [
  { slug: 'saas', brief: 'Homepage for KubeMeter, an open-source Kubernetes cost-attribution platform that breaks down spend by pod, namespace, and team in real time. Self-hosted, alternative to Datadog Cost Management.' },
  { slug: 'ecommerce', brief: 'Homepage for Aerie Skincare, a plant-based DTC face oil line. Three products: Restore, Glow, Calm. Founded by herbalists. Subscribe and save, recyclable packaging, made in small batches in Vermont.' },
  { slug: 'restaurant', brief: 'Homepage for Sumida, a single-origin coffee roaster in Tokyo. Subscriptions, retail bags, wholesale to cafes. Family-run since 1987.' },
  { slug: 'portfolio', brief: 'Personal portfolio for Maya Chen, a freelance brand designer working with early-stage startups. Based in Brooklyn. Past clients include Linear, Vercel, and Pitch.' },
  { slug: 'agency', brief: 'Homepage for Sutter Creative, a brand identity and digital design agency working with consumer startups. 12-person team in Portland.' },
  { slug: 'fitness', brief: 'Homepage for Vertex Fitness, a HIIT and strength training studio in Brooklyn. Class packs, monthly memberships, drop-in rates.' },
  { slug: 'wellness', brief: 'Homepage for Halo Wellness, a meditation and sound bath studio in Los Angeles. 60-min and 90-min sessions, monthly membership.' },
  { slug: 'hotel', brief: 'Homepage for Stoneholm, a 24-room boutique hotel on the Oregon coast. Cliffside cedar architecture, ocean-view rooms, spa, fire pits.' },
  { slug: 'fleet', brief: 'Helmsman — a fleet operations console for autonomous delivery robots. Operators watch a live city map, per-robot battery and route status, an incident timeline, and can hand off to remote teleoperation.' },
  { slug: 'riso', brief: 'Riso Press — a Brooklyn risograph print studio and zine shop. Bold, playful, ink-on-paper craft. Limited-run art prints and weekend workshops.' },
  { slug: 'music', brief: 'Tessellate — an independent electronic music label and warehouse event series in Berlin. Vinyl + digital releases, 12 artists, upcoming parties, merch shop.' },
  { slug: 'butchery', brief: 'Marrow — a nose-to-tail butchery and supper club in Lisbon. Weekly changing set menus, butchery classes, whole-animal provenance from a single farm.' },
]

export const DEFAULT_BENCHMARK_8 = ['saas', 'ecommerce', 'restaurant', 'portfolio', 'agency', 'fitness', 'wellness', 'hotel']

export function selectBenchmarkBriefs(slugs = []) {
  if (slugs.length) return BENCHMARK_BRIEFS.filter((b) => slugs.includes(b.slug))
  return BENCHMARK_BRIEFS.filter((b) => DEFAULT_BENCHMARK_8.includes(b.slug))
}
