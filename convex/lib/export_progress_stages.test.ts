import { describe, expect, it } from 'vitest'
import {
  EXPORT_BUILD_STAGE_KEYS,
  LAKEBED_DEPLOY_STAGE_KEYS,
  progressForStage,
} from './export_progress_stages'

describe('progressForStage — build only (html/react/next, or a private lakebed build)', () => {
  it('starts near zero and ends at exactly 100 on ready', () => {
    const first = progressForStage(EXPORT_BUILD_STAGE_KEYS[0], {
      willDeploy: false,
    })
    expect(first.percent).toBeGreaterThan(0)
    expect(first.percent).toBeLessThan(20)

    const ready = progressForStage('ready', { willDeploy: false })
    expect(ready.percent).toBe(100)
    expect(ready.stage).toBe('Ready')
  })

  it('never regresses across the real stage order and climbs from start to finish', () => {
    // 'saving' (last build stage) and 'ready' are the same real checkpoint —
    // both mean "build just finished" — so they legitimately tie.
    const orderedKeys = [...EXPORT_BUILD_STAGE_KEYS, 'ready']
    const percents = orderedKeys.map(
      (key) => progressForStage(key, { willDeploy: false }).percent,
    )
    for (let i = 1; i < percents.length; i++) {
      expect(percents[i]).toBeGreaterThanOrEqual(percents[i - 1])
    }
    expect(percents[percents.length - 1]).toBeGreaterThan(percents[0])
  })

  it('gives every build stage a human label distinct from its raw key', () => {
    for (const key of EXPORT_BUILD_STAGE_KEYS) {
      const { stage } = progressForStage(key, { willDeploy: false })
      expect(stage).not.toBe(key)
      expect(stage.length).toBeGreaterThan(0)
    }
  })

  it('never exceeds 100 for any known stage', () => {
    for (const key of [...EXPORT_BUILD_STAGE_KEYS, 'ready']) {
      expect(
        progressForStage(key, { willDeploy: false }).percent,
      ).toBeLessThanOrEqual(100)
    }
  })
})

describe('progressForStage — build followed by a real Lakebed deploy', () => {
  it('caps the build phase below 100 so the bar has room for deploy stages', () => {
    const ready = progressForStage('ready', { willDeploy: true })
    expect(ready.percent).toBeGreaterThan(0)
    expect(ready.percent).toBeLessThan(100)
    expect(ready.stage).toContain('deploy')
  })

  it('only reaches 100 once the deploy actually finishes (deployed)', () => {
    const deployed = progressForStage('deployed', { willDeploy: true })
    expect(deployed.percent).toBe(100)
  })

  it('never regresses across build stages + ready + deploy stages, and climbs through the middle', () => {
    // 'saving' (last build stage) and 'ready' are the same real checkpoint
    // (build just finished) so they legitimately tie, as do 'finalizing'
    // (last deploy stage) and 'deployed' — everywhere else must strictly climb.
    const orderedKeys = [
      ...EXPORT_BUILD_STAGE_KEYS,
      'ready',
      ...LAKEBED_DEPLOY_STAGE_KEYS,
      'deployed',
    ]
    const percents = orderedKeys.map(
      (key) => progressForStage(key, { willDeploy: true }).percent,
    )
    for (let i = 1; i < percents.length; i++) {
      expect(percents[i]).toBeGreaterThanOrEqual(percents[i - 1])
    }
    expect(percents[percents.length - 1]).toBeGreaterThan(percents[0])
  })

  it('deploy stage percents sit at or above the build-ready checkpoint, up to 100 at the last stage', () => {
    const readyPercent = progressForStage('ready', { willDeploy: true }).percent
    LAKEBED_DEPLOY_STAGE_KEYS.slice(0, -1).forEach((key) => {
      const percent = progressForStage(key, { willDeploy: true }).percent
      expect(percent).toBeGreaterThan(readyPercent)
      expect(percent).toBeLessThan(100)
    })
    const lastDeployStage =
      LAKEBED_DEPLOY_STAGE_KEYS[LAKEBED_DEPLOY_STAGE_KEYS.length - 1]
    expect(
      progressForStage(lastDeployStage, { willDeploy: true }).percent,
    ).toBe(100)
  })
})

describe('progressForStage — unknown input', () => {
  it('falls back to 0 percent instead of throwing', () => {
    expect(() =>
      progressForStage('nonsense-stage', { willDeploy: false }),
    ).not.toThrow()
    expect(
      progressForStage('nonsense-stage', { willDeploy: false }).percent,
    ).toBe(0)
  })
})
