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
  siteSpecJson?: string
  openUiSource?: string
  tasks: EngineWorkspaceTask[]
}

export const assertCompletedEngineWorkspaceArtifacts = (
  artifacts: EngineWorkspaceArtifacts,
): void => {
  if (artifacts.tasks.some((task) => task.status !== 'DONE')) {
    throw new Error(
      'Ship Fast engine returned before all workspace tasks completed',
    )
  }
}

function safeWorkspaceSegment(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80) || 'session'
  )
}

function readOptionalTextFile(
  workspace: string,
  fileName: string,
): string | undefined {
  const filePath = join(workspace, fileName)

  return existsSync(filePath) ? readFileSync(filePath, 'utf8') : undefined
}

function parseTasks(rawTasks: string | undefined): EngineWorkspaceTask[] {
  if (!rawTasks) return []

  const parsed = JSON.parse(rawTasks) as { tasks?: EngineWorkspaceTask[] }

  return Array.isArray(parsed.tasks) ? parsed.tasks : []
}

export function createEngineWorkspacePath(
  workspaceRoot: string,
  sessionId: string,
): string {
  return join(workspaceRoot, safeWorkspaceSegment(sessionId))
}

export function prepareEngineWorkspace(workspace: string): void {
  rmSync(workspace, { force: true, recursive: true })
  mkdirSync(workspace, { recursive: true })
}

export function readEngineWorkspaceArtifacts(
  workspace: string,
): EngineWorkspaceArtifacts {
  return {
    siteSpecJson: readOptionalTextFile(workspace, 'site-spec.json'),
    openUiSource: readOptionalTextFile(workspace, 'home.openui'),
    tasks: parseTasks(readOptionalTextFile(workspace, 'tasks.json')),
  }
}
