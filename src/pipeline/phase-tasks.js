import { groqParallel } from '../llm/groq.js'
import { translateHtmlSequential } from '../llm/translator.js'
import { stripFences, formatTps } from '../llm/utils.js'
import { alignGeneratedImagesToContext } from './image-hints.js'
import { ensureLucideIconRuntime } from './lucide-icons.js'
import { slug, writeFile } from './workspace.js'
import { HOME_LABELS } from '../config.js'
import { pagePrompt, backendPrompt } from '../prompts/page.js'
import { routeToHtmlFile } from '../renderers/shared.js'

export function sumTokens(results) {
  let inputTokens = 0
  let outputTokens = 0
  let cost = 0
  for (const r of results) {
    if (r) {
      inputTokens += r.inputTokens ?? 0
      outputTokens += r.outputTokens ?? 0
      cost += r.cost ?? 0
    }
  }
  return { inputTokens, outputTokens, cost }
}

export function deriveTasksFromSiteSpec(siteSpec) {
  const tasks = []

  tasks.push({
    id: 'task-1',
    title: 'Homepage',
    status: 'DONE',
    filename: 'index.html',
    dependsOn: [],
  })

  let pageIdx = 2
  for (const page of siteSpec.pages ?? []) {
    const pageName = page.name || page.title || 'Page'
    if (HOME_LABELS.includes(pageName.toLowerCase()) || page.route === '/') continue
    const filename = routeToHtmlFile(page.route)
    tasks.push({
      id: `task-${pageIdx}`,
      title: pageName,
      description: `${pageName} page for ${siteSpec.projectName ?? 'the project'}`,
      filename,
      status: 'PENDING',
      dependsOn: [],
    })
    pageIdx++
  }

  let backendIdx = 1
  for (const feature of siteSpec.backendFeatureHints ?? []) {
    tasks.push({
      id: `backend-${backendIdx}`,
      title: feature,
      description: `Backend logic for: ${feature}`,
      status: 'PENDING',
      dependsOn: [],
    })
    backendIdx++
  }

  return tasks
}

export function deriveTasks(ctxOrSiteSpec) {
  if (Array.isArray(ctxOrSiteSpec?.pages) && typeof ctxOrSiteSpec?.projectName === 'string') {
    return deriveTasksFromSiteSpec(ctxOrSiteSpec)
  }

  const tasks = []

  tasks.push({
    id: 'task-1',
    title: 'Homepage',
    status: 'DONE',
    filename: 'index.html',
    dependsOn: [],
  })

  let pageIdx = 2
  for (const page of ctxOrSiteSpec.pages ?? []) {
    if (HOME_LABELS.includes(page.toLowerCase())) continue
    const filename = `${slug(page)}.html`
    tasks.push({
      id: `task-${pageIdx}`,
      title: page,
      description: `${page} page for ${ctxOrSiteSpec.project_name ?? 'the project'}`,
      filename,
      status: 'PENDING',
      dependsOn: [],
    })
    pageIdx++
  }

  let backendIdx = 1
  for (const feature of ctxOrSiteSpec.features ?? []) {
    tasks.push({
      id: `backend-${backendIdx}`,
      title: feature,
      description: `Backend logic for: ${feature}`,
      status: 'PENDING',
      dependsOn: [],
    })
    backendIdx++
  }

  return tasks
}

function processResults(taskCtx, filteredTasks, results, workspace, getFname, log, imageHints = null) {
  const { taskList, updateTask } = taskCtx
  const saveTasks = () =>
    writeFile(workspace, 'tasks.json', JSON.stringify({ tasks: taskList }, null, 2))

  for (let i = 0; i < filteredTasks.length; i++) {
    const t = filteredTasks[i]
    const r = results[i]
    const task = taskList.find((x) => x.id === t.id)
    if (!r?.content || r.error) {
      log(`  ${t.id}: FAILED \u2014 ${r?.error ?? 'empty response'}`)
      if (task) task.status = 'FAILED'
      updateTask({ id: t.id, status: 'FAILED' })
      saveTasks()
      continue
    }
    const content = ensureLucideIconRuntime(
      alignGeneratedImagesToContext(stripFences(r.content), imageHints),
      log,
    )
    const fname = getFname(t)
    writeFile(workspace, fname, content)
    if (task) {
      task.status = 'DONE'
      task.files = [fname]
    }
    updateTask({ id: t.id, status: 'DONE', files: [fname] })
    saveTasks()
    const tpsStr = formatTps(r) ? ` | ${formatTps(r)}` : ''
    log(`  ${t.id} \u2192 ${fname}: ${content.length} chars${tpsStr}`)
  }
}

export async function generateAllTasks(
  tasks,
  ctx,
  homepageHtml,
  designBrief,
  workspace,
  log,
  status,
  taskCtx,
  indiaMode = null,
  imageHints = null,
  brandProfile = null,
) {
  const isFrontend = (t) => t.status !== 'DONE' && !String(t.id).startsWith('backend-')
  const isBackend = (t) => String(t.id).startsWith('backend-') && t.status !== 'DONE'

  const pageTasks = tasks.filter((t) => isFrontend(t) && t.filename && t.filename !== 'index.html')
  const backendTasks = tasks.filter(isBackend)

  log('\n  \u2500\u2500 Generating tasks \u2500\u2500')
  status('Generating tasks\u2026', 'generating')

  const allPages = tasks
    .filter((t) => t.filename)
    .map((t) => ({ title: t.title, filename: t.filename }))
  const navList = allPages.map((p) => `- ${p.title}: ${p.filename}`).join('\n')

  const pageCalls = pageTasks.map((t) =>
    pagePrompt(t, navList, homepageHtml, imageHints, indiaMode, brandProfile),
  )
  const backendCalls = backendTasks.map((t) => backendPrompt(t, ctx))

  const allCalls = [...pageCalls, ...backendCalls]
  if (allCalls.length === 0) {
    log('  No tasks to generate')
    return { pages: { count: 0 }, backend: { count: 0 }, navList }
  }

  // Generate all pages with Groq (quality), translate with hex-1 if India mode
  let pageResults = pageCalls.length > 0 ? await groqParallel(pageCalls) : []

  if (indiaMode?.code && indiaMode.code !== 'en' && !indiaMode.skipFullTranslation && pageResults.length > 0) {
    log(
      `  translating ${pageResults.length} pages to ${indiaMode.name || indiaMode.language?.name} (sequential)...`,
    )
    const englishHtmls = pageResults.map((r) => (r?.content ? stripFences(r.content) : ''))
    const translatedHtmls = await translateHtmlSequential(englishHtmls, indiaMode)
    translatedHtmls.forEach((html, i) => {
      const changed = html !== englishHtmls[i]
      log(
        `  page ${i + 1} translation: ${changed ? `✓ ${html.length} chars` : '✗ no changes — kept English'}`,
      )
    })
    pageResults = pageResults.map((r, i) => ({ ...r, content: translatedHtmls[i] }))
  }

  const backendResults = backendCalls.length > 0 ? await groqParallel(backendCalls) : []

  if (pageTasks.length > 0) {
    processResults(taskCtx, pageTasks, pageResults, workspace, (t) => t.filename, log, imageHints)
  }
  if (backendTasks.length > 0) {
    processResults(
      taskCtx,
      backendTasks,
      backendResults,
      workspace,
      (t) => t.filename || `${slug(t.title ?? t.id)}.js`,
      log,
    )
  }

  return {
    pages: { count: pageTasks.length, ...sumTokens(pageResults) },
    backend: { count: backendTasks.length, ...sumTokens(backendResults) },
    navList,
  }
}
