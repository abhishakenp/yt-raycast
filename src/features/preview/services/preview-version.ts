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
  html: string
  source: PreviewSource
  createdAt: number
}

export type PreviewState = {
  currentVersion: number
  versions: PreviewVersion[]
}

export const createEmptyPreviewState = (): PreviewState => ({
  currentVersion: 0,
  versions: [],
})

export const getCurrentPreview = (state: PreviewState): PreviewVersion | undefined =>
  state.versions.find((version) => version.version === state.currentVersion)

export const appendPreviewVersion = (
  state: PreviewState,
  input: {
    html: string
    source: PreviewSource
    createdAt: number
  },
): PreviewState => {
  const nextVersion = state.currentVersion + 1

  return {
    currentVersion: nextVersion,
    versions: [
      ...state.versions,
      {
        version: nextVersion,
        html: input.html,
        source: input.source,
        createdAt: input.createdAt,
      },
    ],
  }
}

export const restorePreviewVersion = (
  state: PreviewState,
  version: number,
  createdAt: number,
): PreviewState => {
  const preview = state.versions.find((candidate) => candidate.version === version)

  return preview
    ? appendPreviewVersion(state, {
        html: preview.html,
        source: 'history_restore',
        createdAt,
      })
    : (() => {
        throw createAppError('NOT_FOUND', `Preview version ${version} was not found`)
      })()
}
