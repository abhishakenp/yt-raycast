import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dir = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.join(__dir, '..', '..')

/**
 * Load template from either v1 (dark) or v2 (light)
 * Randomly picks one unless specified
 */
export async function loadTemplate(siteType, version = null) {
  // Determine version: either specified, random, or fallback to v1
  const selectedVersion = version || (Math.random() > 0.5 ? 'v1' : 'v2')
  const templateDir = path.join(projectRoot, `templates-${selectedVersion}`)
  const templatePath = path.join(templateDir, `${siteType}.html`)

  // Check if template exists
  if (!fs.existsSync(templatePath)) {
    // Fallback to other version if not found
    const fallbackVersion = selectedVersion === 'v1' ? 'v2' : 'v1'
    const fallbackPath = path.join(projectRoot, `templates-${fallbackVersion}`, `${siteType}.html`)

    if (!fs.existsSync(fallbackPath)) {
      throw new Error(`Template not found for site type: ${siteType}`)
    }

    console.log(`  ⚠️  Template ${templatePath.split('/').pop()} not found, using fallback`)
    return {
      content: fs.readFileSync(fallbackPath, 'utf-8'),
      version: fallbackVersion,
      siteType,
    }
  }

  return {
    content: fs.readFileSync(templatePath, 'utf-8'),
    version: selectedVersion,
    siteType,
  }
}

/**
 * Get template version info
 */
export function getVersionInfo(version) {
  const info = {
    v1: {
      name: 'Dark Theme',
      description: 'Modern dark design with purple/indigo gradients',
      bgColor: '#09090b',
      textColor: '#f1f5f9',
      accentColor: '#a78bfa',
    },
    v2: {
      name: 'Light Theme',
      description: 'Clean light design with indigo/violet accents',
      bgColor: '#ffffff',
      textColor: '#0f172a',
      accentColor: '#6366f1',
    },
  }
  return info[version] || info.v1
}

/**
 * Extract design tokens from template
 */
export function extractDesignTokens(templateContent) {
  const tokenMatch = templateContent.match(/:root\s*\{([\s\S]*?)\}/i)
  if (!tokenMatch) return null

  const tokens = {}
  const lines = tokenMatch[1].split('\n')

  for (const line of lines) {
    const match = line.match(/--([^:]+):\s*([^;]+);/)
    if (match) {
      tokens[match[1].trim()] = match[2].trim()
    }
  }

  return tokens
}

/**
 * Update design tokens in template
 */
export function updateDesignTokens(templateContent, tokenUpdates) {
  let result = templateContent

  // Replace each token
  for (const [key, value] of Object.entries(tokenUpdates)) {
    const varName = key.startsWith('--') ? key : `--${key}`
    const pattern = new RegExp(`${varName}\\s*:\\s*[^;]+;`, 'i')
    result = result.replace(pattern, `${varName}: ${value};`)
  }

  return result
}

/**
 * Get all available templates
 */
export function getAvailableTemplates() {
  const templates = {
    v1: [],
    v2: [],
  }

  const v1Dir = path.join(projectRoot, 'templates-v1')
  const v2Dir = path.join(projectRoot, 'templates-v2')

  if (fs.existsSync(v1Dir)) {
    templates.v1 = fs.readdirSync(v1Dir).filter(f => f.endsWith('.html')).map(f => f.replace('.html', ''))
  }

  if (fs.existsSync(v2Dir)) {
    templates.v2 = fs.readdirSync(v2Dir).filter(f => f.endsWith('.html')).map(f => f.replace('.html', ''))
  }

  return templates
}

export default {
  loadTemplate,
  getVersionInfo,
  extractDesignTokens,
  updateDesignTokens,
  getAvailableTemplates,
}
