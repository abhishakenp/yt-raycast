import { getEcommerceGenerationGuidelines } from '../config.js'
import { siteSpecSchema } from '../spec/schema.js'
import { brandProfilePromptBlock } from './brand-profile.js'
import { VAGUE_MARKETING_THIN_SPEC_APPENDIX } from './vague-marketing-brief.js'
import {
  contentPlanPromptAppendix,
  editSpecRulesAppendix,
  globalSpecRulesAppendix,
  siteSpecOutputContractAppendix,
  thinSiteSpecOutputAppendix,
} from './content-refs.js'

export function siteSpecPrompt({
  prompt,
  ctx,
  designBrief,
  fallbackSpec,
  brandProfile = null,
  mode = 'generate',
  hasUserDesignReferences = false,
  contentPlanRef = null,
  archetypePresetKey = '',
}) {
  const ecommerceGuidelines = getEcommerceGenerationGuidelines({ hasUserDesignReferences })
  const actionLine =
    mode === 'edit'
      ? 'Update the canonical site spec so the requested changes are reflected structurally.'
      : 'Generate a canonical site spec that can drive multiple renderers.'
  const brandBlock = brandProfilePromptBlock(brandProfile)

  const ecommerceDynamicRules =
    ctx?.site_type === 'ecommerce' || ctx?.siteType === 'ecommerce'
      ? `\n- Ecommerce generation cues (Medusa-aligned): ${ecommerceGuidelines} Follow the CONTENT PLAN REFERENCE for page inventory, storefront sections, and cart/checkout structure.\n`
      : ''

  const presetLine = archetypePresetKey
    ? `\n- Archetype preset key (store in planMeta.archetypePresetKey): "${archetypePresetKey}"\n`
    : ''

  return {
    system:
      'You are a product architect who outputs only valid JSON. No markdown. No explanation. Keep the result strongly structured and renderer-friendly.',
    user:
      `${actionLine}\n\n` +
      `User prompt:\n${prompt}\n\n` +
      `Existing project context:\n${JSON.stringify(ctx, null, 2)}\n\n` +
      `Design brief:\n${designBrief}\n\n` +
      `${brandBlock ? `${brandBlock}\n` : ''}` +
      `${ecommerceDynamicRules}` +
      `${presetLine}` +
      `Required section types (use only when relevant):\n${siteSpecSchema.supportedSectionTypes.join(', ')}\n\n` +
      `Required export targets:\n${siteSpecSchema.supportedExportTargets.join(', ')}\n\n` +
      `Use this fallback structure as a shape reference and minimum completeness baseline:\n${JSON.stringify(fallbackSpec, null, 2)}\n\n` +
      `${siteSpecOutputContractAppendix(siteSpecSchema.version)}` +
      `${globalSpecRulesAppendix()}${mode === 'edit' ? editSpecRulesAppendix() : ''}${contentPlanPromptAppendix(contentPlanRef)}\n\n`,
    temperature: 0.2,
    maxTokens: 12000,
  }
}

export function thinSiteSpecPrompt({
  prompt,
  ctx,
  designBrief,
  fallbackSpec,
  brandProfile = null,
  hasUserDesignReferences = false,
  contentPlanRef = null,
  archetypePresetKey = '',
  vagueMarketingBoost = false,
}) {
  const ecommerceGuidelines = getEcommerceGenerationGuidelines({ hasUserDesignReferences })
  const brandBlock = brandProfilePromptBlock(brandProfile)
  const vagueLine = vagueMarketingBoost ? VAGUE_MARKETING_THIN_SPEC_APPENDIX : ''
  const ecommerceDynamicRules =
    ctx?.site_type === 'ecommerce' || ctx?.siteType === 'ecommerce'
      ? `\n- Ecommerce (Medusa-aligned): ${ecommerceGuidelines} Include ecommerce.products (6+ SKUs) on the homepage pass.\n`
      : ''
  const presetLine = archetypePresetKey
    ? `\n- Archetype preset (planMeta.archetypePresetKey): "${archetypePresetKey}"\n`
    : ''
  return {
    system:
      'You are a product architect who outputs only valid JSON. No markdown. No explanation. PASS A: exactly one homepage page in pages[].',
    user:
      `Generate a THIN canonical site spec: homepage only (one entry in pages, route /). Navigation may list future destinations.\n\n` +
      `User prompt:\n${prompt}\n\n` +
      `Context:\n${JSON.stringify(ctx, null, 2)}\n\n` +
      `Design brief:\n${designBrief}\n\n` +
      `${brandBlock ? `${brandBlock}\n` : ''}` +
      `${ecommerceDynamicRules}` +
      `${presetLine}` +
      `Section types (homepage):\n${siteSpecSchema.supportedSectionTypes.join(', ')}\n\n` +
      `Export targets:\n${siteSpecSchema.supportedExportTargets.join(', ')}\n\n` +
      `Shape baseline:\n${JSON.stringify(fallbackSpec, null, 2)}\n\n` +
      `${thinSiteSpecOutputAppendix(siteSpecSchema.version)}` +
      `${vagueLine}` +
      `${contentPlanPromptAppendix(contentPlanRef)}\n\n`,
    temperature: 0.2,
    maxTokens: 6000,
  }
}

export function siteSpecExpandPrompt({
  prompt,
  ctx,
  designBrief,
  thinSpecJson,
  contentPlanRef = null,
  archetypePresetKey = '',
  hasUserDesignReferences = false,
}) {
  const ecommerceGuidelines = getEcommerceGenerationGuidelines({ hasUserDesignReferences })
  const ecommerceDynamicRules =
    ctx?.site_type === 'ecommerce' || ctx?.siteType === 'ecommerce'
      ? `\n- Ecommerce: ${ecommerceGuidelines} Preserve and extend ecommerce data; do not shrink the product list.\n`
      : ''
  const presetLine = archetypePresetKey
    ? `\n- planMeta.archetypePresetKey stays "${archetypePresetKey}" unless the user contradicts.\n`
    : ''
  const homeId = thinSpecJson?.pages?.[0]?.id || 'page-home'
  return {
    system:
      'You are a product architect who outputs only valid JSON. No markdown. PASS B: expand to full multi-page spec; preserve ids.',
    user:
      `Expand PASS A into a COMPLETE site spec. Output ONLY valid JSON.\n\n` +
      `CRITICAL: Keep homepage page id "${homeId}" and route "/" for the first page in pages[]. Reorder if needed so it is pages[0]. Add all secondary pages from the content plan and context. Set planMeta.specPhase to "full".\n\n` +
      `User prompt:\n${prompt}\n\n` +
      `Context:\n${JSON.stringify(ctx, null, 2)}\n\n` +
      `Design brief:\n${designBrief}\n\n` +
      `${ecommerceDynamicRules}` +
      `${presetLine}` +
      `PASS A spec (evolve, do not discard theme or homepage intent):\n${JSON.stringify(thinSpecJson, null, 2)}\n\n` +
      `${siteSpecOutputContractAppendix(siteSpecSchema.version)}` +
      `${globalSpecRulesAppendix()}${contentPlanPromptAppendix(contentPlanRef)}\n\n`,
    temperature: 0.2,
    maxTokens: 12000,
  }
}
