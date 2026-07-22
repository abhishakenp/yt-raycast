import { describe, expect, it } from 'vitest'
import {
  estimateObservedRemainingMs,
  estimateRemainingMs,
  formatDurationShort,
} from './format-progress-duration'

describe('formatDurationShort', () => {
  it('shows sub-second durations as <1s', () => {
    expect(formatDurationShort(400)).toBe('<1s')
  })

  it('shows whole seconds under a minute', () => {
    expect(formatDurationShort(1000)).toBe('1s')
    expect(formatDurationShort(45_000)).toBe('45s')
  })

  it('shows minutes and seconds once past 60s', () => {
    expect(formatDurationShort(65_000)).toBe('1m 5s')
    expect(formatDurationShort(125_000)).toBe('2m 5s')
  })

  it('omits the seconds part on an exact minute', () => {
    expect(formatDurationShort(120_000)).toBe('2m')
  })
})

describe('estimateRemainingMs', () => {
  it('projects remaining time linearly from elapsed/percent-so-far', () => {
    // 10s elapsed at 25% done → 3x that remains
    expect(estimateRemainingMs(10_000, 25)).toBe(30_000)
  })

  it('returns null at 0% (no pace signal yet)', () => {
    expect(estimateRemainingMs(5000, 0)).toBeNull()
  })

  it('returns null at 100% or above (already done)', () => {
    expect(estimateRemainingMs(5000, 100)).toBeNull()
    expect(estimateRemainingMs(5000, 120)).toBeNull()
  })

  it('returns null with no elapsed time yet', () => {
    expect(estimateRemainingMs(0, 50)).toBeNull()
  })

  it('never returns a negative estimate', () => {
    expect(estimateRemainingMs(1, 99)).toBeGreaterThanOrEqual(0)
  })
})

describe('estimateObservedRemainingMs', () => {
  it('does not invent ETA before enough real server samples exist', () => {
    expect(
      estimateObservedRemainingMs({
        now: 1_000,
        percent: 25,
        progressSampleCount: 2,
        progressStartedAt: 0,
        progressUpdatedAt: 200,
      }),
    ).toBeNull()
  })

  it('projects from actual observed server progress timing', () => {
    expect(
      estimateObservedRemainingMs({
        now: 80_000,
        percent: 76,
        progressSampleCount: 3,
        progressStartedAt: 0,
        progressUpdatedAt: 76_000,
      }),
    ).toBe(20_000)
  })

  it('changes with real workload duration at the same percent', () => {
    const tenBlockEta = estimateObservedRemainingMs({
      now: 80_000,
      percent: 76,
      progressSampleCount: 3,
      progressStartedAt: 0,
      progressUpdatedAt: 76_000,
    })
    const twelveBlockEta = estimateObservedRemainingMs({
      now: 120_000,
      percent: 76,
      progressSampleCount: 3,
      progressStartedAt: 0,
      progressUpdatedAt: 116_000,
    })

    expect(twelveBlockEta).toBeGreaterThan(tenBlockEta ?? 0)
  })
})
