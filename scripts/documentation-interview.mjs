#!/usr/bin/env node

import { spawn, spawnSync } from 'node:child_process'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { createInterface } from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import { dirname, resolve } from 'node:path'

import {
  captureVoiceAnswer,
  transcribeVoiceAnswer,
} from './documentation-voice-input.mjs'

const defaultSourcePath = resolve('docs/DOCUMENTATION-DECISION-INTERVIEW.md')
const defaultAnswersPath = resolve('.interview/documentation-answers.json')

export const parseQuestions = (markdown) => {
  const section = markdown.match(
    /## Questions requiring answers\n([\s\S]*?)\n## Resolution protocol/,
  )?.[1]

  if (!section) {
    throw new Error('Missing “Questions requiring answers” or “Resolution protocol” boundary.')
  }

  let category = ''
  const questions = []

  for (const line of section.split('\n')) {
    const heading = line.match(/^### (.+)$/)
    if (heading) {
      category = heading[1]
      continue
    }

    const question = line.match(/^(\d+)\. (.+)$/)
    if (question) {
      if (!category) throw new Error(`Question ${question[1]} has no category.`)
      questions.push({
        id: Number(question[1]),
        category,
        prompt: question[2],
      })
    }
  }

  if (questions.length === 0) throw new Error('No questions found.')

  const ids = new Set(questions.map(({ id }) => id))
  if (ids.size !== questions.length) throw new Error('Duplicate question IDs found.')

  for (const [index, question] of questions.entries()) {
    if (question.id !== index + 1) {
      throw new Error(`Expected question ${index + 1}, found ${question.id}.`)
    }
  }

  return questions
}

export const parseBulkAnswers = (text, questions) => {
  const validIds = new Set(questions.map(({ id }) => id))
  const answers = new Map()

  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim()
    if (!line) continue
    const match = line.match(/^(\d+):\s*(.+)$/)
    if (!match) throw new Error(`Invalid bulk line: “${rawLine}”. Use “number: answer”.`)
    const id = Number(match[1])
    if (!validIds.has(id)) throw new Error(`Unknown question number: ${id}.`)
    answers.set(id, match[2])
  }

  return answers
}

export const buildAnswerRecord = (questions, answers) => ({
  generatedAt: new Date().toISOString(),
  source: 'docs/DOCUMENTATION-DECISION-INTERVIEW.md',
  totalQuestions: questions.length,
  answeredQuestions: answers.size,
  answers: questions
    .filter(({ id }) => answers.has(id))
    .map((question) => ({ ...question, answer: answers.get(question.id) })),
})

export const loadAnswers = async (answersPath, questions) => {
  try {
    const record = JSON.parse(await readFile(answersPath, 'utf8'))
    const promptsById = new Map(questions.map(({ id, prompt }) => [id, prompt]))
    return new Map(
      (record.answers ?? [])
        .filter(
          ({ id, prompt, answer }) =>
            promptsById.get(id) === prompt && typeof answer === 'string',
        )
        .map(({ id, answer }) => [id, answer]),
    )
  } catch (error) {
    if (error?.code === 'ENOENT') return new Map()
    throw new Error(`Could not load saved answers: ${error.message}`)
  }
}

const parseArgs = (argv) => {
  const get = (name, fallback) => argv.find((arg) => arg.startsWith(`${name}=`))?.slice(name.length + 1) ?? fallback
  const speed = Number(get('--speed', '220'))
  if (!Number.isFinite(speed) || speed < 80 || speed > 600) {
    throw new Error('--speed must be between 80 and 600 words per minute.')
  }

  return {
    answersPath: resolve(get('--answers', defaultAnswersPath)),
    from: Number(get('--from', '1')),
    sourcePath: resolve(get('--source', defaultSourcePath)),
    readAll: argv.includes('--read-all'),
    speed,
    voice: !argv.includes('--no-voice'),
    voiceAnswers: argv.includes('--voice-answers'),
    voiceName: get('--voice', 'Voice 1'),
  }
}

const sayAvailable = () => spawnSync('which', ['say'], { stdio: 'ignore' }).status === 0

let speaking = false
const speak = async (text, speed, voiceName) => {
  if (speaking) return // Prevent overlapping speech
  speaking = true
  try {
    await new Promise((resolveSpeech, rejectSpeech) => {
      const child = spawn('say', ['-v', voiceName, '-r', String(speed), text], {
        stdio: 'ignore',
      })
      child.once('error', rejectSpeech)
      child.once('exit', (code) => {
        if (code === 0) resolveSpeech()
        else rejectSpeech(new Error(`say exited with ${code}.`))
      })
    })
  } finally {
    speaking = false
  }
}

const save = async (answersPath, questions, answers) => {
  await mkdir(dirname(answersPath), { recursive: true })
  await writeFile(
    answersPath,
    `${JSON.stringify(buildAnswerRecord(questions, answers), null, 2)}\n`,
  )
}

export const createPromptReader = (rl) => {
  const buffered = []
  const waiters = []

  rl.on('line', (line) => {
    const waiter = waiters.shift()
    if (waiter) waiter(line)
    else buffered.push(line)
  })

  return (prompt) => {
    output.write(prompt)
    const line = buffered.shift()
    if (line !== undefined) return Promise.resolve(line)
    return new Promise((resolveLine) => waiters.push(resolveLine))
  }
}

const readBulk = async (ask) => {
  output.write('Paste lines as “number: answer”. Type :end on its own line when finished.\n')
  const lines = []
  while (true) {
    const line = await ask('bulk> ')
    if (line.trim() === ':end') return lines.join('\n')
    lines.push(line)
  }
}

export const runInterview = async ({
  answersPath,
  from,
  questions,
  ask,
  speed,
  voice,
  voiceName,
  initialAnswers = new Map(),
  readAll = false,
  voiceAnswers = false,
  captureVoiceAnswerFn = captureVoiceAnswer,
  transcribeVoiceAnswerFn = transcribeVoiceAnswer,
}) => {
  const answers = new Map(initialAnswers)
  const canSpeak = voice && sayAvailable()

  if (voice && !canSpeak) output.write('Voice unavailable: continuing with text prompts.\n')

  for (let index = Math.max(0, from - 1); index < questions.length; index += 1) {
    const question = questions[index]
    if (answers.has(question.id)) {
      output.write(`\nQuestion ${question.id} already recorded; skipping.\n`)
      continue
    }
    const prompt = `Question ${question.id} of ${questions.length}. ${question.prompt}`
    output.write(`\n[${question.category}]\n${prompt}\n`)
    if (canSpeak) await speak(prompt, speed, voiceName)
    if (readAll) continue

    if (voiceAnswers) {
      output.write('Listening… start when ready; five seconds of silence after you finish submits your answer.\n')
      const captured = await captureVoiceAnswerFn({})
      if (captured.type === 'audio') {
        const transcript = await transcribeVoiceAnswerFn(captured)
        if (transcript.type === 'answer') {
          answers.set(question.id, transcript.text)
          await save(answersPath, questions, answers)
        }
      }
      continue
    }

    while (true) {
      const response = await ask('Answer (:bulk, :repeat, :skip, :back, :quit): ')
      const command = response.trim()

      if (command === ':repeat') {
        if (canSpeak) await speak(prompt, speed, voiceName)
        continue
      }
      if (command === ':skip') break
      if (command === ':back') {
        index = Math.max(-1, index - 2)
        break
      }
      if (command === ':quit') {
        await save(answersPath, questions, answers)
        return answers
      }
      if (command === ':bulk') {
        const bulkAnswers = parseBulkAnswers(await readBulk(ask), questions)
        for (const [id, answer] of bulkAnswers) answers.set(id, answer)
        await save(answersPath, questions, answers)
        continue
      }
      if (!command) {
        output.write('Answer cannot be empty. Use :skip to leave it unanswered.\n')
        continue
      }

      answers.set(question.id, response.trim())
      await save(answersPath, questions, answers)
      break
    }
  }

  await save(answersPath, questions, answers)
  return answers
}

const main = async () => {
  const rl = createInterface({ input, output, terminal: input.isTTY })
  const ask = createPromptReader(rl)
  const options = parseArgs(process.argv.slice(2))
  try {
    const questions = parseQuestions(await readFile(options.sourcePath, 'utf8'))
    if (!Number.isInteger(options.from) || options.from < 1 || options.from > questions.length) {
      throw new Error(`--from must be between 1 and ${questions.length}.`)
    }
    const initialAnswers = options.readAll
      ? new Map()
      : await loadAnswers(options.answersPath, questions)
    const answers = await runInterview({ ...options, ask, initialAnswers, questions })
    output.write(`\nSaved ${answers.size}/${questions.length} answers to ${options.answersPath}\n`)
  } finally {
    rl.close()
  }
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  main().catch((error) => {
    console.error(`Interview failed: ${error.message}`)
    process.exitCode = 1
  })
}
