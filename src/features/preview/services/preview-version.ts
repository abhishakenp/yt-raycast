import { createAppError } from '@/shared/errors/app-error'

export const previewSourceValues = [
  'generation',
  'edit',
  'rewrite',
  'cms',
  'history_restore',
] as const

export type PreviewSource = (typeof previewSourceValues)[number]

export type PreviewVersion = {
  version: number
  source: PreviewSource
  createdAt: number
}

export type PreviewState = {
  currentVersion: number
  versions: PreviewVersion[]
}

export function createEmptyPreviewState(): PreviewState {
  return {
    currentVersion: 0,
    versions: [],
  }
}

export function getCurrentPreview(
  state: PreviewState,
): PreviewVersion | undefined {
  return state.versions.find(
    (version) => version.version === state.currentVersion,
  )
}

export function appendPreviewVersion(
  state: PreviewState,
  input: {
    source: PreviewSource
    createdAt: number
  },
): PreviewState {
  const nextVersion = state.currentVersion + 1

  return {
    currentVersion: nextVersion,
    versions: [
      ...state.versions,
      {
        version: nextVersion,
        source: input.source,
        createdAt: input.createdAt,
      },
    ],
  }
}

export function restorePreviewVersion(
  state: PreviewState,
  version: number,
  createdAt: number,
): PreviewState {
  const preview = state.versions.find(
    (candidate) => candidate.version === version,
  )

  return preview
    ? appendPreviewVersion(state, {
        source: 'history_restore',
        createdAt,
      })
    : (() => {
        throw createAppError(
          'NOT_FOUND',
          `Preview version ${version} was not found`,
        )
      })()
}
