/**
 * @ship-fast/engine — Mobbin Pro DNA inheritance layer.
 *
 * Production-side port of the forge sandbox's Mobbin pipeline (forge-mobbin.mjs).
 * Provides DNA resolution, prompt-block builders, LLM-driven anchor routing,
 * and coverage scoring. The forge sandbox imports from here too — the only
 * thing it adds on top is the live Mobbin Pro Supabase auth + Playwright
 * palette extraction layer (kept in scripts/ because it's Bun + Playwright-only).
 */
export { COPY_EXAMPLES, listDnaAppNames, resolveCopyExamples, resolveDna, synthesizeDna } from './dna.js'
export { mobbinDoctrineBlock, mobbinSessionBlock, resolveAnchor } from './prompt-blocks.js'
export { anchorAvoidsAurora, anchorAvoidsSaasMarketing, detectVerbatimAnchorCopy, relaxAuroraAuditForAnchor, scoreMobbinCoverage } from './score.js'
export { inferMobbinAnchor } from './anchor-router.js'
export { readMobbinAnchorFromWorkspace, writeMobbinAnchorToWorkspace } from './workspace.js'
