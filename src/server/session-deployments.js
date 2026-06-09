import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { BASE_DOMAIN } from '../config.js'
import { ensureSanityCorsForTenant } from '../sanity/ensure-cors.js'
import { getDeploymentBySessionId, registerDeployment } from './deployments.js'
import { generateSlug } from './slug-generator.js'
import { makeSessionState } from './sessions.js'

export function readSessionDeployment(session) {
  if (!session) return null
  let deployment = session.deployment || getDeploymentBySessionId(session.id)
  if (!deployment) return null
  const mapped = getDeploymentBySessionId(session.id)
  if (!deployment.url && deployment.slug) {
    deployment = { ...deployment, url: `https://${deployment.slug}.${BASE_DOMAIN}` }
    session.deployment = deployment
    try {
      writeFileSync(join(session.workspace, 'deploy.json'), JSON.stringify(deployment, null, 2))
    } catch {
      void 0
    }
  }
  if (deployment.slug && !mapped) {
    registerDeployment(deployment.slug, session.id, deployment.deployedAt || Date.now())
  }
  return deployment
}

function readProjectContext(workspace) {
  try {
    const contextPath = join(workspace, 'project-context.json')
    if (existsSync(contextPath)) return JSON.parse(readFileSync(contextPath, 'utf-8'))
  } catch {
    void 0
  }
  return {}
}

export async function provisionDeploymentIfNeeded(session, options = {}) {
  const existing = readSessionDeployment(session)
  if (existing) return existing

  const projectContext = readProjectContext(session.workspace)
  const slug = await (options.generateSlug || generateSlug)(projectContext)
  const created = registerDeployment(slug, session.id)
  const deployment = {
    slug: created.slug,
    url: `https://${created.slug}.${BASE_DOMAIN}`,
    deployedAt: created.deployedAt,
  }

  session.deployment = deployment
  try {
    writeFileSync(join(session.workspace, 'deploy.json'), JSON.stringify(deployment, null, 2))
  } catch {
    void 0
  }

  const state = makeSessionState(session)
  state.broadcast({ type: 'deployed', slug: deployment.slug, url: deployment.url })

  if (session.sanityConfig?.projectId && deployment.url) {
    void ensureSanityCorsForTenant(session.sanityConfig, [deployment.url]).catch(() => {})
  }

  return deployment
}
