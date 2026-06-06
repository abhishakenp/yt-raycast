import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { loadSiteSpec } from '@ship-fast/engine/spec/index.js'
import { resolveMedusaAdminEmbedPayload } from '../config.js'

const workspaceLooksEcommerceMedusa = (workspace) => {
  if (!workspace) return false
  const root = join(workspace, 'next-app')
  if (!existsSync(root)) return false
  return (
    existsSync(join(root, 'components', 'ecommerce')) || existsSync(join(root, 'lib', 'medusa.js'))
  )
}

const readRawSiteType = (workspace) => {
  if (!workspace) return null
  const filePath = join(workspace, 'site-spec.json')
  if (!existsSync(filePath)) return null
  try {
    const parsed = JSON.parse(readFileSync(filePath, 'utf-8'))
    return typeof parsed?.siteType === 'string' ? parsed.siteType : null
  } catch {
    return null
  }
}

export const getMedusaAdminEmbedAndEcommerce = (session) => {
  if (!session?.workspace) {
    return {
      ecommerce: false,
      medusaAdminEmbed: resolveMedusaAdminEmbedPayload(false),
    }
  }
  const spec = loadSiteSpec(session.workspace)
  const fromSpec = spec?.siteType === 'ecommerce'
  const fromRaw = readRawSiteType(session.workspace) === 'ecommerce'
  const fromWorkspace = workspaceLooksEcommerceMedusa(session.workspace)
  const ecommerce = Boolean(fromSpec || fromRaw || fromWorkspace)
  return {
    ecommerce,
    medusaAdminEmbed: resolveMedusaAdminEmbedPayload(ecommerce),
  }
}
