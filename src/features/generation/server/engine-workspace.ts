import { existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'

export type EngineTaskStatus = 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'FAILED'

export type EngineWorkspaceTask = {
  id: string
  label: string
  status: EngineTaskStatus
  filename?: string
  files?: string[]
}

export type EngineWorkspaceArtifacts = {
  html: string
  siteSpecJson?: string
  openUiSource?: string
  tasks: EngineWorkspaceTask[]
}

const safeWorkspaceSegment = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'session'

const readOptionalTextFile = (workspace: string, fileName: string): string | undefined => {
  const filePath = join(workspace, fileName)

  return existsSync(filePath) ? readFileSync(filePath, 'utf8') : undefined
}

const parseTasks = (rawTasks: string | undefined): EngineWorkspaceTask[] => {
  if (!rawTasks) return []

  const parsed = JSON.parse(rawTasks) as { tasks?: EngineWorkspaceTask[] }

  return Array.isArray(parsed.tasks) ? parsed.tasks : []
}

export const createEngineWorkspacePath = (workspaceRoot: string, sessionId: string): string =>
  join(workspaceRoot, safeWorkspaceSegment(sessionId))

export const prepareEngineWorkspace = (workspace: string): void => {
  rmSync(workspace, { force: true, recursive: true })
  mkdirSync(workspace, { recursive: true })
}

export const readEngineWorkspaceArtifacts = (workspace: string): EngineWorkspaceArtifacts => {
  const html = readOptionalTextFile(workspace, 'index.html')

  if (!html) {
    throw new Error('Ship Fast engine did not write index.html')
  }

  return {
    html,
    siteSpecJson: readOptionalTextFile(workspace, 'site-spec.json'),
    openUiSource: readOptionalTextFile(workspace, 'home.openui'),
    tasks: parseTasks(readOptionalTextFile(workspace, 'tasks.json')),
  }
}
