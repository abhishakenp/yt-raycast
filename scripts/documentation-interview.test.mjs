import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'

import {
  buildAnswerRecord,
  loadAnswers,
  parseBulkAnswers,
  parseQuestions,
  runInterview,
} from './documentation-interview.mjs'

const sample = `## Questions requiring answers

### Product

1. First question?
2. Second question?

### Security

3. Third question?

## Resolution protocol`

test('parses ordered categorized questions', () => {
  assert.deepEqual(parseQuestions(sample), [
    { id: 1, category: 'Product', prompt: 'First question?' },
    { id: 2, category: 'Product', prompt: 'Second question?' },
    { id: 3, category: 'Security', prompt: 'Third question?' },
  ])
})

test('uses the 60 curated decision questions as the default interview source', async () => {
  const source = await readFile('docs/DOCUMENTATION-DECISION-INTERVIEW.md', 'utf8')
  const questions = parseQuestions(source)
  assert.equal(questions.length, 60)
  assert.equal(questions[0].id, 1)
  assert.equal(questions.at(-1).id, 60)
})

test('rejects malformed question sequences', () => {
  assert.throws(
    () => parseQuestions(sample.replace('2. Second question?\n', '')),
    /Expected question 2, found 3/,
  )
})

test('parses numbered bulk answers and rejects unknown IDs', () => {
  const questions = parseQuestions(sample)
  assert.deepEqual(
    [...parseBulkAnswers('1: First answer\n3: Third answer', questions)],
    [
      [1, 'First answer'],
      [3, 'Third answer'],
    ],
  )
  assert.throws(() => parseBulkAnswers('4: Invalid', questions), /Unknown question number/)
})

test('registers bulk answers and exports a resumable answer record', async () => {
  const questions = parseQuestions(sample)
  const directory = await mkdtemp(join(tmpdir(), 'documentation-interview-'))
  const answersPath = join(directory, 'answers.json')
  const inputs = [':bulk', '1: First bulk answer', '3: Third bulk answer', ':end', ':skip', ':quit']
  const answers = await runInterview({
    answersPath,
    ask: async () => inputs.shift(),
    from: 1,
    questions,
    speed: 320,
    voice: false,
  })

  assert.deepEqual([...answers], [
    [1, 'First bulk answer'],
    [3, 'Third bulk answer'],
  ])
  const persisted = JSON.parse(await readFile(answersPath, 'utf8'))
  assert.equal(persisted.totalQuestions, 3)
  assert.equal(persisted.answeredQuestions, 2)
  assert.deepEqual(
    persisted.answers,
    buildAnswerRecord(questions, answers).answers,
  )
  await rm(directory, { force: true, recursive: true })
})

test('keeps saved answers and continues with unanswered questions', async () => {
  const questions = parseQuestions(sample)
  const directory = await mkdtemp(join(tmpdir(), 'documentation-interview-'))
  const answersPath = join(directory, 'answers.json')
  await writeFile(
    answersPath,
    `${JSON.stringify(buildAnswerRecord(questions, new Map([[1, 'Existing answer']])), null, 2)}\n`,
  )
  const answers = await runInterview({
    answersPath,
    ask: async () => 'Second answer',
    from: 1,
    initialAnswers: await loadAnswers(answersPath, questions),
    questions,
    speed: 220,
    voice: false,
  })

  assert.deepEqual([...answers], [
    [1, 'Existing answer'],
    [2, 'Second answer'],
    [3, 'Second answer'],
  ])
  await rm(directory, { force: true, recursive: true })
})

test('does not reuse an answer when the question wording changed', async () => {
  const questions = parseQuestions(sample)
  const directory = await mkdtemp(join(tmpdir(), 'documentation-interview-'))
  const answersPath = join(directory, 'answers.json')
  await writeFile(
    answersPath,
    `${JSON.stringify({ answers: [{ id: 1, prompt: 'Old question?', answer: 'Old answer' }] })}\n`,
  )
  assert.equal((await loadAnswers(answersPath, questions)).size, 0)
  await rm(directory, { force: true, recursive: true })
})

test('reads every question without requiring input in read-all mode', async () => {
  const answers = await runInterview({
    answersPath: join(tmpdir(), 'documentation-interview-read-all.json'),
    ask: async () => {
      throw new Error('read-all mode must not ask for input')
    },
    from: 1,
    questions: parseQuestions(sample),
    readAll: true,
    speed: 220,
    voice: false,
  })

  assert.equal(answers.size, 0)
  await rm(join(tmpdir(), 'documentation-interview-read-all.json'), { force: true })
})

test('registers voice transcripts and skips blank voice answers', async () => {
  const questions = parseQuestions(sample)
  const directory = await mkdtemp(join(tmpdir(), 'documentation-interview-'))
  const answersPath = join(directory, 'answers.json')
  const captured = [{ type: 'audio', audioPath: 'one', directory }, { type: 'blank' }]
  const answers = await runInterview({
    answersPath,
    ask: async () => {
      throw new Error('voice mode must not ask for typed input')
    },
    captureVoiceAnswerFn: async () => captured.shift(),
    from: 1,
    questions: questions.slice(0, 2),
    speed: 220,
    transcribeVoiceAnswerFn: async () => ({ type: 'answer', text: 'Spoken answer' }),
    voice: false,
    voiceAnswers: true,
  })

  assert.deepEqual([...answers], [[1, 'Spoken answer']])
  await rm(directory, { force: true, recursive: true })
})
