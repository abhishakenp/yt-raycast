import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { normalizeSlug } from '../lib/text-utils.js'

const DEPLOYMENTS_FILE = '_deployments.json'
let deploymentsDir
const deploymentMap = new Map()
const sessionMap = new Map()

function buildPayload() {
  const payload = {}
  for (const [slug, entry] of deploymentMap.entries()) {
    payload[slug] = {
      sessionId: entry.sessionId,
      deployedAt: entry.deployedAt,
    }
  }
  return payload
}

function persist() {
  if (!deploymentsDir) return
  const path = join(deploymentsDir, DEPLOYMENTS_FILE)
  try {
    writeFileSync(path, JSON.stringify(buildPayload(), null, 2))
  } catch {
    return
  }
}

function setDeployment(slug, sessionId, deployedAt = Date.now()) {
  const existingBySession = sessionMap.get(sessionId)
  if (existingBySession && existingBySession.slug !== slug) {
    deploymentMap.delete(existingBySession.slug)
  }

  deploymentMap.set(slug, { sessionId, deployedAt })
  sessionMap.set(sessionId, { slug, deployedAt })
  persist()
  return { slug, sessionId, deployedAt }
}

export function initDeployments(sessionsDir) {
  deploymentsDir = sessionsDir
  deploymentMap.clear()
  sessionMap.clear()

  if (!sessionsDir) return
  const path = join(sessionsDir, DEPLOYMENTS_FILE)
  if (!existsSync(path)) return

  try {
    const raw = JSON.parse(readFileSync(path, 'utf-8'))
    if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
      for (const [slug, data] of Object.entries(raw)) {
        const key = normalizeSlug(slug)
        const sessionId = String(data?.sessionId || '').trim()
        const deployedAt = Number(data?.deployedAt)
        if (!key || !sessionId || Number.isNaN(deployedAt)) continue
        deploymentMap.set(key, { sessionId, deployedAt })
        sessionMap.set(sessionId, { slug: key, deployedAt })
      }
    }
  } catch {
    return
  }
}

export function getDeploymentBySlug(slug) {
  const entry = deploymentMap.get(normalizeSlug(slug))
  return entry
    ? { slug: normalizeSlug(slug), sessionId: entry.sessionId, deployedAt: entry.deployedAt }
    : null
}

export function getDeploymentBySessionId(sessionId) {
  const entry = sessionMap.get(String(sessionId || ''))
  return entry ? { slug: entry.slug, sessionId, deployedAt: entry.deployedAt } : null
}

export function isSlugTaken(slug) {
  return deploymentMap.has(normalizeSlug(slug))
}

export function registerDeployment(slug, sessionId, deployedAt = Date.now()) {
  const key = normalizeSlug(slug)
  return setDeployment(key, String(sessionId || ''), deployedAt)
}

export function removeDeploymentBySessionId(sessionId) {
  const key = String(sessionId || '')
  const entry = sessionMap.get(key)
  if (!entry) return false
  deploymentMap.delete(entry.slug)
  sessionMap.delete(key)
  persist()
  return true
}
