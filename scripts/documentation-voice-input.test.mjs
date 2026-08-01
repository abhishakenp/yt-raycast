import assert from 'node:assert/strict'
import { EventEmitter } from 'node:events'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'

import {
  captureVoiceAnswer,
  normalizeVoiceAnswer,
  transcribeVoiceAnswer,
} from './documentation-voice-input.mjs'

const childThatExits = ({ code = 0, signal = null } = {}) => {
  const child = new EventEmitter()
  child.kill = () => setTimeout(() => child.emit('exit', code, signal), 0)
  return child
}

test('normalizes blank, done, and answer transcripts', () => {
  assert.deepEqual(normalizeVoiceAnswer(''), { type: 'blank' })
  assert.deepEqual(normalizeVoiceAnswer('I’m done.'), { type: 'done' })
  assert.deepEqual(normalizeVoiceAnswer('The payment policy is pending. I am done.'), {
    type: 'answer',
    text: 'The payment policy is pending.',
  })
  assert.deepEqual(normalizeVoiceAnswer('The payment policy is pending.'), {
    type: 'answer',
    text: 'The payment policy is pending.',
  })
})

test('waits for a response instead of treating initial silence as an answer', async () => {
  const capture = childThatExits({ code: null, signal: 'SIGINT' })
  const pending = captureVoiceAnswer({
    maxDurationMs: 0,
    spawnFn: () => capture,
    statFn: async () => {
      throw new Error('no audio yet')
    },
  })
  await new Promise((resolve) => setTimeout(resolve, 10))
  assert.equal(capture.killed, undefined)
  capture.emit('exit', null, 'SIGINT')
  const result = await pending
  assert.deepEqual(result, { type: 'blank' })
})

test('parses Whisper JSON and removes temporary capture files', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'documentation-voice-test-'))
  const child = childThatExits({ code: 0 })
  setTimeout(() => child.emit('exit', 0, null), 0)
  const result = await transcribeVoiceAnswer({
    audioPath: join(directory, 'answer.wav'),
    directory,
    readFileFn: async () => JSON.stringify({ text: 'Done.' }),
    spawnFn: () => child,
  })
  assert.deepEqual(result, { type: 'done' })
  await rm(directory, { force: true, recursive: true })
})
