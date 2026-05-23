import { generateHomepageHtml, resolveHomepageEngineStrategy } from '@ship-fast/engine/llm/homepage-engine.js'
import { passesHybridHomepageVerification } from '@ship-fast/engine/pipeline/hybrid-homepage-verify.js'
import { readDesignRefFromWorkspace } from '@ship-fast/engine/prompts/design-refs.js'
import {
  anchorAvoidsAurora,
  anchorAvoidsSaasMarketing,
  readMobbinAnchorFromWorkspace,
  relaxAuroraAuditForAnchor,
} from '@ship-fast/engine/lib/mobbin/index.js'
import { auditMobbinCoverage } from '@ship-fast/engine/pipeline/mobbin-audit.js'
import {
  VAGUE_MARKETING_HOMEPAGE_APPENDIX,
  shouldExpandVagueMarketing,
} from '@ship-fast/engine/prompts/vague-marketing-brief.js'
import { readDesignReferenceUrlsFromWorkspace } from './ecommerce-design-references.js'
import { SHIP_FAST_SITE_URL, shipFastFooterLogoMarkup } from '@ship-fast/engine/marketing.js'
import { translateHtml } from '@ship-fast/engine/llm/translator.js'
import { stripFences, formatTps } from '@ship-fast/engine/llm/utils.js'
import {
  alignGeneratedImagesToContext,
  hydrateStorefrontGradientSlots,
  injectEcommerceHeroResponsiveCss,
  verifyTrustedStockImageUrls,
} from './image-hints.js'
import { ensureLucideIconRuntime } from './lucide-icons.js'
import { htmlLooksDegenerate } from './homepage-degeneracy.js'
import { passesHomepagePublicDesignVerification } from './ralph-homepage-score.js'
import { getPublicDesignExemplarPath } from '@ship-fast/engine/prompts/public-design-exemplar-append.js'
import { stripDestructiveEmptyDesignTheme } from '@ship-fast/engine/pipeline/homepage-theme-sanitize.js'
import { writeFile } from './workspace.js'
import { buildHomepageSpecSliceJson } from '../spec/homepage-spec-slice.js'
import { generateShipEngineHomepage, isShipHomepageEngineEnabled } from '@ship-fast/engine/pipeline/ship-homepage-engine.js'
import { writeMobbinAnchorToWorkspace } from '@ship-fast/engine/lib/mobbin/index.js'
import { writeLlmHomepageBackup } from './llm-homepage-guard.js'

const SHIPFAST_FOOTER_MARKER = 'data-sf-footer-branding'

export function injectShipFastFooterBranding(html, log = () => {}) {
  if (!html) return html

  let next = html
  const hasBrandingMarkup = (value) => /<[^>]+\sdata-sf-footer-branding\b/i.test(value)

  if (hasBrandingMarkup(next)) return next

  const logoHtml = shipFastFooterLogoMarkup('sfhp').replace(
    'class="footer-branding__logo"',
    'class="footer-branding__logo inline-flex h-8 w-8 shrink-0 items-center justify-center drop-shadow-[0_2px_6px_rgba(124,58,237,0.45)] [&_svg]:block [&_svg]:h-full [&_svg]:w-full"',
  )
  const brandingHtml = `
    <div ${SHIPFAST_FOOTER_MARKER} class="footer-branding mt-0 inline-flex justify-center" aria-label="Built with Ship Fast">
      <a class="footer-branding__link group inline-flex items-center gap-3 rounded-full border border-violet-500/45 bg-gradient-to-br from-[#140c24]/92 via-[#2e1a4e]/88 to-[#1e1234]/94 px-4 py-2 text-zinc-100 no-underline shadow-[0_10px_32px_rgba(124,58,237,0.18),0_2px_12px_rgba(0,0,0,0.35)] transition duration-200 hover:-translate-y-px hover:border-violet-400/65 hover:shadow-[0_14px_40px_rgba(124,58,237,0.28),0_4px_14px_rgba(0,0,0,0.4)]" href="${SHIP_FAST_SITE_URL}" target="_blank" rel="noreferrer">
        ${logoHtml}
        <span class="footer-branding__text flex flex-col items-start gap-px leading-tight">
          <span class="footer-branding__label text-[0.62rem] uppercase tracking-[0.14em] text-violet-200/90">Built with</span>
          <span class="footer-branding__name text-[0.88rem] font-bold uppercase tracking-[0.08em] text-zinc-50">Ship Fast</span>
        </span>
        <span class="text-[0.85em] text-violet-400" aria-hidden="true">↗</span>
      </a>
    </div>
  `

  if (/<\/body>/i.test(next)) {
    next = next.replace(
      /<\/body>/i,
      `<footer class="sf-built-with-strip clear-both w-full border-t border-zinc-600/50 px-4 py-6 text-center box-border">${brandingHtml}</footer>\n</body>`,
    )
  } else {
    next = `${next}\n<footer class="sf-built-with-strip clear-both w-full border-t border-zinc-600/50 px-4 py-6 text-center box-border">${brandingHtml}</footer>`
  }

  if (next !== html) log('  ✓ Ship Fast footer branding appended')
  return next
}

export async function generateHomepage(
  prompt,
  workspace,
  log,
  sessionCtx,
  indiaMode = null,
  imageHints = null,
  brandProfile = null,
  businessProfile = null,
  designRef = null,
  contentPlanRef = null,
  thinSiteSpec = null,
) {
  log('  homepage: generating from scratch (LLM)...')

  if (isShipHomepageEngineEnabled()) {
    log('  homepage: unified ship engine (playground-engine-ui-ship)')
    const ship = await generateShipEngineHomepage(prompt, {
      seed: thinSiteSpec?.slug || workspace?.sessionId || prompt,
    })
    let html = injectShipFastFooterBranding(stripDestructiveEmptyDesignTheme(ship.html), log)

    const shipAnchor = ship.route?.primary?.app
      ? {
          app: ship.route.primary.app,
          category: ship.route.primary.category || null,
          palette: ship.route.primary.palette?.length
            ? ship.route.primary.palette
            : ship.route.primary.dna?.accents || [],
          accents: ship.route.primary.dna?.accents || ship.route.primary.palette || [],
          reason: `ship-engine:${ship.route.siteHint}`,
        }
      : null
    if (shipAnchor) {
      writeMobbinAnchorToWorkspace(workspace, shipAnchor)
      log(`  homepage: Mobbin DNA anchor ${shipAnchor.app} (${ship.route.siteHint})`)
    }

    if (indiaMode?.code && indiaMode.code !== 'en' && !indiaMode.skipFullTranslation) {
      log(`  homepage: translating to ${indiaMode.name || indiaMode.language?.name} via Groq...`)
      try {
        const translated = await translateHtml(html, indiaMode)
        if (translated?.content && !translated.error) {
          html = translated.content
          log(`  homepage: translation complete — ${translated.translatedCount} strings translated`)
        }
      } catch (err) {
        log(`  homepage: translation error — ${err.message}, keeping original`)
      }
    }

    html = injectEcommerceHeroResponsiveCss(html)
    html = ensureLucideIconRuntime(html, log)
    html = await alignGeneratedImagesToContext(html, imageHints)

    const kimiScore = ship.metrics.kimiScore ?? ship.audits?.kimi?.score ?? 0
    const minKimiScore = parseInt(process.env.SHIP_MIN_KIMI_SCORE || '90', 10)
    const degenerate = htmlLooksDegenerate(html, { prompt, skipNovaMarketingBar: true })

    if (kimiScore < minKimiScore || degenerate) {
      log(
        `  ❌ homepage: ship engine output failed quality gate (kimi=${kimiScore}, target>=${minKimiScore}, degenerate=${degenerate})`,
      )
      throw new Error('Homepage output failed quality check')
    }

    writeFile(workspace, 'index.html', html)
    writeLlmHomepageBackup(workspace, html)
    if (shipAnchor) {
      const coverage = auditMobbinCoverage(html, { app: shipAnchor.app, ...ship.route.primary })
      try {
        writeFile(workspace, 'mobbin-coverage.json', JSON.stringify(coverage, null, 2))
      } catch {}
      if (coverage.warnings?.length) {
        for (const w of coverage.warnings) log(`  ⚠️  mobbin: ${w}`)
      } else if (coverage.anchor) {
        log(
          `  ✓ mobbin: ${coverage.anchor} inheritance (palette ${coverage.score?.palette?.hits}/${coverage.score?.palette?.total}, doctrine ${coverage.score?.doctrine?.hits}/${coverage.score?.doctrine?.total})`,
        )
      }
    }
    if (sessionCtx?.signalHomepageReady) sessionCtx.signalHomepageReady()
    log(
      `  index.html: ${html.length} chars | ship engine ${ship.metrics.wall}ms kimi=${ship.metrics.kimiScore}${ship.metrics.under20s ? ' ✓<20s' : ''} anchor=${ship.metrics.anchor || shipAnchor?.app || 'none'} (planner ${ship.metrics.plannerMs ?? 0}ms · hero ${ship.metrics.heroTopSource || 'gemini'} · gemini ${ship.metrics.geminiMs ?? 0}ms · compose ${ship.metrics.parallelMs ?? 0}ms)`,
    )
    return {
      html,
      inputTokens: 0,
      outputTokens: 0,
      cost: 0,
      engineWall: ship.metrics.wall,
      kimiScore: ship.metrics.kimiScore,
      buildMode: ship.metrics.buildMode,
    }
  }

  const hasDesignReferenceUrls = readDesignReferenceUrlsFromWorkspace(workspace).length > 0
  const resolvedDesignRef = designRef ?? readDesignRefFromWorkspace(workspace)
  if (resolvedDesignRef) log(`  homepage: using design ref "${resolvedDesignRef.name}"`)
  const mobbinAnchor = readMobbinAnchorFromWorkspace(workspace)
  if (mobbinAnchor?.app) log(`  homepage: inheriting Mobbin DNA from ${mobbinAnchor.app}`)
  const thinJson = thinSiteSpec ? buildHomepageSpecSliceJson(thinSiteSpec) : ''
  const siteTypeForVague = thinSiteSpec?.siteType
  const siteType = String(thinSiteSpec?.siteType || 'landing').toLowerCase()
  const exemplarPath = getPublicDesignExemplarPath(siteType)
  const ralphDisabled = process.env.SHIPFAST_HOMEPAGE_RALPH === '0'
  const maxRalph =
    siteType === 'game' || ralphDisabled || hasDesignReferenceUrls
      ? 1
      : Math.max(1, Math.min(14, parseInt(process.env.SHIPFAST_HOMEPAGE_RALPH_MAX || '3', 10) || 3))
  const promptBase =
    shouldExpandVagueMarketing(prompt, siteTypeForVague) ? `${prompt}\n\n${VAGUE_MARKETING_HOMEPAGE_APPENDIX}` : prompt
  if (promptBase.length > (prompt || '').length)
    log('  homepage: vague-prompt reference-tier expansion (density + anti-template)')

  const engineStrategy = resolveHomepageEngineStrategy({
    prompt: promptBase,
    siteType,
    hasDesignReferenceUrls,
    mobbinAnchor,
  })
  const useHybrid = engineStrategy.startsWith('hybrid')
  const useKimi = engineStrategy === 'kimi'
  if (useKimi) log('  homepage: kimi engine')
  else if (useHybrid) log(`  homepage: hybrid engine (${engineStrategy})`)
  else log('  homepage: groq single-pass engine')

  const shellAfterGroq = (raw) => {
    let h = stripFences(raw)
    h = stripDestructiveEmptyDesignTheme(h)
    h = h
      .replace(/const\s+\{[^}]*\}\s*=\s*require\([^)]*\);?\n?/g, '')
      .replace(/<link[^>]*href="styles\.css"[^>]*>/g, '')
      .replace(/<script[^>]*>\s*const\s+\{[^}]*\}\s*=\s*\{[^}]*\};\s*<\/script>\n?/g, '')
    return injectShipFastFooterBranding(h, log)
  }

  let ralphFeedback = ''
  let result = null
  const tokenAgg = { inputTokens: 0, outputTokens: 0, cost: 0 }
  let html = ''

  for (let attempt = 1; attempt <= maxRalph; attempt++) {
    const promptForModel = ralphFeedback
      ? `${promptBase}\n\n── MANDATORY REVISION (failed reference-tier verification) ──\n${ralphFeedback}\n── END REVISION ──`
      : promptBase
    result = await generateHomepageHtml(
      promptForModel,
      [
        imageHints,
        indiaMode,
        brandProfile,
        hasDesignReferenceUrls,
        resolvedDesignRef,
        businessProfile,
        contentPlanRef,
        thinJson,
        mobbinAnchor,
      ],
      {
        engine: engineStrategy,
        specAppend: thinJson ? `\n\nStructured homepage spec (align sections and theme tokens):\n${thinJson}` : '',
        revision: ralphFeedback,
      },
    )
    if (result?.hybridFallback) {
      log(`  homepage: hybrid failed — ${result.hybridError}; used groq fallback`)
    } else if (result?.kimiFallback) {
      log(`  homepage: kimi engine failed — ${result.kimiError}; used ${result.engine ?? 'fallback'} engine`)
    } else if (result?.engine === 'kimi') {
      log(
        `  homepage: kimi ${result.layoutMode ?? 'page'} · ${result.archetype ?? 'page'} · score ${result.kimiScore ?? '?'} · ${result.wall ?? '?'}ms`,
      )
    } else if (result?.engine === 'hybrid') {
      log(`  homepage: hybrid ${result.layoutMode} · ${result.archetype ?? 'page'} · ${result.wall ?? '?'}ms`)
      if (result.stitchValidation && !result.stitchValidation.ok) {
        log(`  homepage: hybrid stitch warnings — ${result.stitchValidation.issues.join('; ')}`)
      }
      if (result.topTruncated) log('  homepage: hybrid top was truncated — tail retried with seam repair')
    }
    if (!result?.content || result.error) {
      log(`  ❌ homepage generation failed: ${result?.error ?? 'empty response'}`)
      throw new Error(`Homepage generation failed: ${result?.error}`)
    }
    tokenAgg.inputTokens += result.inputTokens ?? 0
    tokenAgg.outputTokens += result.outputTokens ?? 0
    tokenAgg.cost += result.cost ?? 0
    html = shellAfterGroq(result.content)
    const effectiveEngine = result?.kimiFallback ? result.engine || engineStrategy : engineStrategy
    let ver =
      effectiveEngine === 'kimi'
        ? {
            ok:
              (result.kimiScore ?? 0) >= 90 &&
              !htmlLooksDegenerate(html, {
                prompt,
                skipNovaMarketingBar: true,
              }),
            feedback: `Kimi engine score ${result.kimiScore ?? 0}; target >=90 and non-degenerate HTML.`,
          }
        : effectiveEngine === 'hybrid' || effectiveEngine === 'hybrid-app-shell'
          ? passesHybridHomepageVerification(html, prompt, siteType)
          : exemplarPath && !hasDesignReferenceUrls
            ? passesHomepagePublicDesignVerification(html, prompt, exemplarPath, siteType)
            : {
                ok: !htmlLooksDegenerate(html, { prompt, skipNovaMarketingBar: Boolean(mobbinAnchor?.app) }),
                feedback: 'Output failed degeneracy or marketing bar checks.',
              }
    // When the active anchor's DNA explicitly rejects aurora visuals
    // (Airbnb/Apple/Linear/Patagonia/etc), the engine's aurora-tier
    // verification rules become a quality regression — the LLM CORRECTLY
    // followed the anchor by omitting radial-gradient stacks, but the engine
    // sees that omission as failure. Relax the audit to its theme-agnostic
    // checks (data-reveal, data-magnet, contrast) when the anchor is
    // anti-aurora. This is the production analog of forge's relaxation pass.
    if (!ver.ok && mobbinAnchor && anchorAvoidsAurora(mobbinAnchor.dna)) {
      const relaxed = relaxAuroraAuditForAnchor(ver, mobbinAnchor.dna)
      if (relaxed.auroraRelaxed) log(`  homepage: aurora-tier audit relaxed for anti-aurora anchor ${mobbinAnchor.app}`)
      ver = relaxed
    }
    if (ver.ok) {
      if (maxRalph > 1) log(`  homepage: reference-tier verification passed (attempt ${attempt}/${maxRalph})`)
      break
    }
    ralphFeedback = ver.feedback || 'Match the public design exemplar for this site type in the system prompt.'
    log(`  homepage: reference-tier verification failed — attempt ${attempt}/${maxRalph}`)
    if (attempt === maxRalph) {
      // When Mobbin anchor or hybrid engine is active, the renderer fallback is a worse
      // outcome than imperfect LLM output (it strips craft / anchor inheritance).
      if (mobbinAnchor?.app || useHybrid || useKimi) {
        log(
          `  homepage: keeping LLM output despite verification failure — ${useKimi ? 'kimi engine' : useHybrid ? 'hybrid engine' : `Mobbin Pro anchor ${mobbinAnchor.app}`} active`,
        )
        break
      }
      throw new Error(`Homepage failed reference-tier verification after ${maxRalph} attempts: ${ralphFeedback}`)
    }
  }

  if (indiaMode?.code && indiaMode.code !== 'en' && !indiaMode.skipFullTranslation) {
    log(`  homepage: translating to ${indiaMode.name || indiaMode.language?.name} via Groq...`)
    try {
      const translated = await translateHtml(html, indiaMode)
      if (translated?.content && !translated.error) {
        html = translated.content
        log(`  homepage: translation complete — ${translated.translatedCount} strings translated`)
      } else {
        log(`  homepage: translation failed — ${translated?.error ?? 'empty'}, keeping original`)
      }
    } catch (err) {
      log(`  homepage: translation error — ${err.message}, keeping original`)
    }
  }

  if (htmlLooksDegenerate(html, { prompt, skipNovaMarketingBar: Boolean(mobbinAnchor?.app || useKimi) })) {
    log('  ❌ homepage: degeneracy flag tripped before image pass')
    if (!mobbinAnchor?.app && !useKimi) {
      throw new Error('Homepage output failed quality check')
    }
    log(
      `  homepage: keeping LLM output despite pre-image degeneracy flag — ${useKimi ? 'kimi engine' : `Mobbin Pro anchor ${mobbinAnchor.app}`} active`,
    )
  }

  html = await alignGeneratedImagesToContext(html, imageHints)
  html = hydrateStorefrontGradientSlots(html, imageHints)
  html = await verifyTrustedStockImageUrls(html)
  html = injectEcommerceHeroResponsiveCss(html)
  html = ensureLucideIconRuntime(html, log)

  // Save the raw LLM output to disk before the final degeneracy check so we
  // can always recover the model's actual work for debugging when the check
  // rejects it.
  try {
    writeFile(workspace, 'index.llm.html', html)
  } catch {}
  if (htmlLooksDegenerate(html, { prompt, skipNovaMarketingBar: Boolean(mobbinAnchor?.app || useKimi) })) {
    log('  ❌ homepage: degeneracy flag tripped (repetition or invalid HTML)')
    // When Mobbin anchor is active, trust the LLM output even if it's
    // structurally lean — the renderer fallback strips all anchor inheritance,
    // which is a far worse outcome than a slightly thin LLM page.
    if (!mobbinAnchor?.app && !useKimi) {
      throw new Error('Homepage output failed quality check')
    }
    log(
      `  homepage: keeping LLM output despite degeneracy flag — ${useKimi ? 'kimi engine' : `Mobbin Pro anchor ${mobbinAnchor.app}`} active`,
    )
  }

  writeFile(workspace, 'index.html', html)
  const tpsStr = formatTps(result) ? ` | ${formatTps(result)}` : ''
  log(`  index.html: ${html.length} chars${tpsStr}`)

  if (mobbinAnchor?.app) {
    const coverage = auditMobbinCoverage(html, mobbinAnchor)
    try {
      writeFile(workspace, 'mobbin-coverage.json', JSON.stringify(coverage, null, 2))
    } catch {}
    if (coverage.warnings.length) {
      for (const w of coverage.warnings) log(`  ⚠️  mobbin: ${w}`)
    } else {
      log(`  ✓ mobbin: anchor ${coverage.anchor} inheritance looks healthy (palette ${coverage.score?.palette?.hits}/${coverage.score?.palette?.total}, doctrine ${coverage.score?.doctrine?.hits}/${coverage.score?.doctrine?.total})`)
    }
  }

  return {
    html,
    inputTokens: tokenAgg.inputTokens,
    outputTokens: tokenAgg.outputTokens,
    cost: tokenAgg.cost,
  }
}

const SF_THEME_INJECT_START = '<!-- sf-design-theme -->'
const SF_THEME_INJECT_END = '<!-- /sf-design-theme -->'
const LEGACY_THEME_STAR_TRANSITION = /\s*\*\s*\{\s*transition:\s*background-color\s+0\.6s\s+cubic-bezier\(0\.4,\s*0,\s*0\.2,\s*1\),[\s\S]*?stroke\s+0\.6s\s+cubic-bezier\(0\.4,\s*0,\s*0\.2,\s*1\);\s*\}\s*/g

export const stripLegacyThemeStarTransition = (html) =>
  !html || typeof html !== 'string' ? html : html.replace(LEGACY_THEME_STAR_TRANSITION, '\n')

export function injectDesignIntoHomepage(html, designBrief, workspace, log) {
  html = stripDestructiveEmptyDesignTheme(html)
  const configMatch = designBrief.match(/```json\s*(\{[\s\S]*?\})\s*```/)
  if (!configMatch) return html

  try {
    const configJson = JSON.parse(configMatch[1])
    const colors = configJson.colors && typeof configJson.colors === 'object' ? configJson.colors : {}
    const fontFamily =
      configJson.fontFamily && typeof configJson.fontFamily === 'object' ? configJson.fontFamily : {}
    const tailwindColors = Object.keys(colors).reduce((acc, name) => {
      acc[name] = colors[name]
      return acc
    }, {})
    const colorKeys = Object.keys(tailwindColors)
    const fontKeys = Object.keys(fontFamily)
    if (!colorKeys.length && !fontKeys.length) {
      log('  design inject: skipped (design brief JSON has no colors or fontFamily to merge)')
      return html
    }

    html = html.replace(
      new RegExp(`${SF_THEME_INJECT_START}[\\s\\S]*?${SF_THEME_INJECT_END}\\s*`, 'gi'),
      '',
    )
    html = stripLegacyThemeStarTransition(html)

    const themeScript = `${SF_THEME_INJECT_START}
<script>
(function () {
  var patchColors = ${JSON.stringify(tailwindColors, null, 2)}
  var patchFonts = ${JSON.stringify(fontFamily, null, 2)}
  tailwind.config = tailwind.config || { theme: { extend: {} } }
  var ex = tailwind.config.theme.extend = tailwind.config.theme.extend || {}
  ex.colors = Object.assign({}, ex.colors || {}, patchColors)
  ex.fontFamily = Object.assign({}, ex.fontFamily || {}, patchFonts)
})()
window.addEventListener('message', function (e) {
  if (e.data.type === 'UPDATE_THEME' && e.data.colors && typeof tailwind !== 'undefined') {
    tailwind.config = tailwind.config || { theme: { extend: {} } }
    tailwind.config.theme.extend = tailwind.config.theme.extend || {}
    tailwind.config.theme.extend.colors = Object.assign(
      {},
      tailwind.config.theme.extend.colors || {},
      e.data.colors,
    )
  }
})
</script>
${SF_THEME_INJECT_END}
  </head>`

    html = html.replace('</head>', themeScript)
    log('  ✓ Design system merged into homepage tailwind.config')
  } catch {
    log('  warning: failed to inject tailwind config')
  }

  html = stripDestructiveEmptyDesignTheme(html)
  html = ensureLucideIconRuntime(html, log)
  writeFile(workspace, 'index.html', html)
  return html
}
