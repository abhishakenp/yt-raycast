import { spawn } from 'node:child_process'
import { mkdtemp, readFile, rm, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

export const normalizeVoiceAnswer = (text) => {
  const answer = String(text ?? '').replace(/\s+/g, ' ').trim()
  const terminal = answer
    .toLowerCase()
    .replace(/[.!?]+$/, '')
    .replace(/[’]/g, "'")

  if (!answer) return { type: 'blank' }
  if (/^(?:done|i'?m done|i am done)$/.test(terminal)) {
    return { type: 'done' }
  }
  return {
    type: 'answer',
    text: answer.replace(/\s+(?:done|i'?m done|i am done)[.!?]*$/i, '').trim(),
  }
}

const waitForExit = (child) =>
  new Promise((resolveExit, rejectExit) => {
    child.once('error', rejectExit)
    child.once('exit', (code, signal) => resolveExit({ code, signal }))
  })

export const captureVoiceAnswer = async ({
  maxDurationMs = 0,
  trailingSilenceSeconds = 5,
  spawnFn = spawn,
  statFn = stat,
  tempRoot = tmpdir(),
}) => {
  const directory = await mkdtemp(join(tempRoot, 'documentation-voice-'))
  const audioPath = join(directory, 'answer.wav')
  let child
  let spoken = false
  let poll
  let maxTimer

  try {
    child = spawnFn('rec', [
      '-q',
      audioPath,
      'rate',
      '16000',
      'channels',
      '1',
      'silence',
      '1',
      '0.1',
      '1%',
      '1',
      String(trailingSilenceSeconds),
      '1%',
    ])

    const markSpeech = async () => {
      try {
        const info = await statFn(audioPath)
        if (info.size > 4_096) {
          spoken = true
          clearInterval(poll)
        }
      } catch {}
    }

    poll = setInterval(() => void markSpeech(), 150)
    if (maxDurationMs > 0) {
      maxTimer = setTimeout(() => child.kill('SIGINT'), maxDurationMs)
    }

    const { code, signal } = await waitForExit(child)
    clearTimeout(maxTimer)
    clearInterval(poll)

    if (!spoken) return { type: 'blank' }
    if (code !== 0 && signal !== 'SIGINT') {
      throw new Error(`Microphone capture failed (exit ${code ?? signal ?? 'unknown'}).`)
    }

    return { type: 'audio', audioPath, directory }
  } catch (error) {
    clearTimeout(maxTimer)
    clearInterval(poll)
    await rm(directory, { force: true, recursive: true })
    throw error
  }
}

export const transcribeVoiceAnswer = async ({
  audioPath,
  directory,
  spawnFn = spawn,
  readFileFn = readFile,
}) => {
  try {
    const child = spawnFn('whisper', [
      audioPath,
      '--model',
      'turbo',
      '--language',
      'en',
      '--output_format',
      'json',
      '--output_dir',
      directory,
      '--verbose',
      'False',
    ])
    const { code } = await waitForExit(child)
    if (code !== 0) throw new Error(`Whisper transcription failed (exit ${code}).`)

    const result = JSON.parse(await readFileFn(join(directory, 'answer.json'), 'utf8'))
    return normalizeVoiceAnswer(result.text)
  } finally {
    await rm(directory, { force: true, recursive: true })
  }
}
