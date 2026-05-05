/**
 * Asset prefetch: get a Pexels image hints block once at run start; reuse
 * across all iterations of a forge-loop run so we pay the API cost once.
 *
 * Returns { promptBlock, photos, videos } — caller appends promptBlock to the
 * user message before sending to Groq.
 */
import { resolvePexelsImageHints } from '@ship-fast/engine/pipeline/image-hints.js'

let CACHE = null

export async function prefetchAssets(prompt) {
  if (CACHE) return CACHE
  try {
    const out = await resolvePexelsImageHints({ prompt, hydrationPrompt: prompt })
    CACHE = out || { promptBlock: '', photos: [], videos: [] }
  } catch (e) {
    CACHE = { promptBlock: '', photos: [], videos: [], error: String(e?.message || e) }
  }
  return CACHE
}

export function assetPromptBlock(assets) {
  if (!assets || !assets.promptBlock) return ''
  // Engine block is verbose — keep it small. Truncate at 1800 chars.
  const block = String(assets.promptBlock).slice(0, 1800)
  return `\n${block}`
}
