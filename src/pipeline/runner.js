import { writeFileSync, readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { broadcast, setPrompt, setTasks, updateTask, signalHomepageReady } from '../server/state.js'
import { stripFences, formatTps } from '../llm/utils.js'
import { groqParallel } from '../llm/groq.js'
import { writeFile } from './workspace.js'
import { generateDesignBrief } from './phase-design.js'
import { detectSiteType } from './phase-detect.js'
import { generateContext } from './phase-context.js'
import { generateHomepage } from './phase-homepage.js'
import { deriveTasks, generateAllTasks, setTaskState } from './phase-tasks.js'
import { fixHomepageNav } from './phase-navfix.js'
import { formatRunAllReport, formatEditReport } from './report.js'
import { editPrompt } from '../prompts/edit.js'

const log = (msg) => {
  console.log(msg)
  broadcast({ type: 'log', message: msg })
}

const status = (message, phase) => {
  console.log(`  [${phase}] ${message}`)
  broadcast({ type: 'status', message, phase })
}

export async function runEdit({ prompt, workspace }) {
  const t0 = Date.now()

  setPrompt(prompt)

  const tasksData = JSON.parse(readFileSync(join(workspace, 'tasks.json'), 'utf-8'))
  const tasks = tasksData.tasks ?? []
  const htmlTasks = tasks.filter((t) => t.filename?.endsWith('.html'))

  const taskList = tasks.map((t) => ({
    ...t,
    status: t.filename?.endsWith('.html') ? 'PENDING' : 'DONE',
  }))
  setTaskState(workspace, taskList)
  setTasks(taskList)
  writeFile(workspace, 'tasks.json', JSON.stringify({ tasks: taskList }, null, 2))

  log(
    `\n  \u2500\u2500 Edit mode: applying "${prompt.slice(0, 80)}" to ${htmlTasks.length} HTML files \u2500\u2500`,
  )
  status('Editing pages\u2026', 'editing')

  const homepageHtml = existsSync(join(workspace, 'index.html'))
    ? readFileSync(join(workspace, 'index.html'), 'utf-8')
    : ''
  const homepageRef = homepageHtml
    ? `\n\nHOMEPAGE REFERENCE (match this exact style, head, nav, footer, colors):\n${homepageHtml}\n`
    : ''

  const calls = htmlTasks.map((t) => {
    const filePath = join(workspace, t.filename)
    const html = existsSync(filePath) ? readFileSync(filePath, 'utf-8') : ''
    if (!html) return null
    return editPrompt(prompt, t, html, homepageRef)
  })

  const validIndices = calls.map((c, i) => (c ? i : -1)).filter((i) => i >= 0)
  const validCalls = calls.filter(Boolean)

  if (validCalls.length === 0) {
    log('  No HTML files to edit')
    broadcast({ type: 'run_completed', elapsed: 0, completed: 0, total: 0 })
    return
  }

  const results = await groqParallel(validCalls)

  let done = 0
  for (let j = 0; j < results.length; j++) {
    const taskIdx = validIndices[j]
    const t = htmlTasks[taskIdx]
    const r = results[j]
    const task = taskList.find((x) => x.id === t.id)

    if (!r?.content || r.error) {
      log(`  ${t.filename}: FAILED \u2014 ${r?.error ?? 'empty response'}`)
      if (task) task.status = 'FAILED'
      updateTask({ id: t.id, status: 'FAILED' })
      writeFile(workspace, 'tasks.json', JSON.stringify({ tasks: taskList }, null, 2))
      continue
    }

    const content = stripFences(r.content)
    writeFile(workspace, t.filename, content)
    if (task) task.status = 'DONE'
    updateTask({ id: t.id, status: 'DONE' })
    writeFile(workspace, 'tasks.json', JSON.stringify({ tasks: taskList }, null, 2))
    done++
    const tpsStr = formatTps(r) ? ` | ${formatTps(r)}` : ''
    log(`  ${t.filename}: ${content.length} chars${tpsStr}`)
  }

  signalHomepageReady()

  const elapsed = ((Date.now() - t0) / 1000).toFixed(1)
  const totalInput = results.reduce((s, r) => s + (r?.inputTokens ?? 0), 0)
  const totalOutput = results.reduce((s, r) => s + (r?.outputTokens ?? 0), 0)
  const totalCost = results.reduce((s, r) => s + (r?.cost ?? 0), 0)

  const report = formatEditReport(
    done,
    htmlTasks.length,
    elapsed,
    totalInput,
    totalOutput,
    totalCost,
  )
  log(report)
  broadcast({
    type: 'run_completed',
    elapsed: Number.parseFloat(elapsed),
    completed: done,
    total: htmlTasks.length,
    report,
  })
}

export async function runAll({ prompt, workspace }) {
  const t0 = Date.now()
  const timings = {}
  const tick = (name) => {
    timings[name] = Date.now()
  }

  writeFileSync(join(workspace, 'prompt.txt'), prompt)
  setPrompt(prompt)

  let ctx = null
  let homepage = null

  tick('t0')

  status('Generating spec\u2026', 'spec')
  const designStats = await generateDesignBrief(prompt, workspace, log)
  const designBrief = designStats.brief
  tick('design_end')

  const detectStats = await detectSiteType(prompt, log)
  const siteType = detectStats.siteType
  tick('detect_end')

  const ctxStats = await generateContext(prompt, designBrief, siteType, workspace, log)
  ctx = ctxStats.ctx
  tick('ctx_end')

  let homepageStats = { inputTokens: 0, outputTokens: 0, cost: 0 }
  const needHomepage = !homepage
  if (needHomepage) {
    status('Generating tasks\u2026', 'generating')
    homepageStats = await generateHomepage(prompt, ctx, designBrief, workspace, log)
    homepage = homepageStats.html
    tick('homepage_end')
  } else {
    log(`  index.html: ${homepage.length} chars (cached)`)
    signalHomepageReady()
    tick('homepage_end')
  }
  const ctxPages = ctx.pages?.length ?? 0
  const homepageChars = homepage?.length ?? 0

  if (!homepage) {
    log('  Error: index.html not found')
    return
  }

  tick('derive_start')
  const tasks = deriveTasks(ctx)
  setTaskState(workspace, tasks)
  setTasks(tasks)
  writeFile(workspace, 'tasks.json', JSON.stringify({ tasks }, null, 2))
  log(
    `  Derived ${tasks.length} tasks (${tasks.filter((t) => t.filename).length} pages, ${tasks.filter((t) => String(t.id).startsWith('backend-')).length} backend)`,
  )
  tick('derive_end')

  tick('gen_start')
  const genStats = await generateAllTasks(tasks, ctx, homepage, designBrief, workspace, log, status)
  tick('gen_end')

  tick('navfix_start')
  const navFixStats = (await fixHomepageNav(genStats.navList, workspace, log)) ?? {
    count: 0,
    inputTokens: 0,
    outputTokens: 0,
  }
  tick('navfix_end')

  const done = tasks.filter((t) => t.status === 'DONE').length
  const total = tasks.length
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1)

  broadcast({ type: 'run_completed', elapsed: Number.parseFloat(elapsed), completed: done, total })

  const report = formatRunAllReport(timings, {
    elapsed,
    done,
    total,
    ctxPages,
    homepageChars,
    tasks,
    designStats,
    detectStats,
    ctxStats,
    homepageStats,
    genStats,
    navFixStats,
  })

  log(report)
  broadcast({
    type: 'run_completed',
    elapsed: Number.parseFloat(elapsed),
    completed: done,
    total,
    report,
  })

  try {
    const homeDir = process.env.HOME
    const logFile = join(homeDir, '.ship.log')
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19)
    const logEntry = `\n--- /ship-fast completed at ${timestamp} ---\n  prompt: ${prompt.slice(0, 120)}\n  workspace: ${workspace}\n  result: ${done}/${total} tasks in ${elapsed}s\n${report}\n`
    writeFileSync(logFile, readFileSync(logFile, 'utf-8') + logEntry)
  } catch {
    /* log writing is best-effort */
  }
}
