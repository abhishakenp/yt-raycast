import { describe, expect, it } from 'vitest'
import { spawn, type ChildProcess } from 'node:child_process'

function waitForOutput(proc: ChildProcess, needle: string): Promise<string> {
  return new Promise((resolve, reject) => {
    let output = ''
    const timeout = setTimeout(() => {
      reject(new Error(`Timed out waiting for "${needle}". Output: ${output}`))
    }, 8_000)

    proc.stdout!.on('data', (chunk: Buffer) => {
      output += chunk.toString('utf8')
      if (output.includes(needle)) {
        clearTimeout(timeout)
        resolve(output)
      }
    })

    proc.on('error', (error: Error) => {
      clearTimeout(timeout)
      reject(error)
    })

    proc.on('exit', (code: number | null) => {
      if (!output.includes(needle)) {
        clearTimeout(timeout)
        reject(
          new Error(
            `Exited with ${code} before "${needle}". Output: ${output}`,
          ),
        )
      }
    })
  })
}

describe('@ship-fast/engine package binary', () => {
  it('starts the standalone runner from the installed package command', async () => {
    const prompt = 'binary package smoke test'
    const proc = spawn(
      'bun',
      ['x', '--no-install', 'ship-fast-engine', prompt],
      {
        env: {
          ...process.env,
          // The smoke test only needs to prove the binary launches. Keep any
          // accidental provider calls from reaching real services before kill.
          GEMINI_API_KEY: '',
          GROQ_API_KEY: '',
        },
        stdio: ['ignore', 'pipe', 'pipe'],
      },
    )

    try {
      const output = await waitForOutput(proc, `Prompt: ${prompt}`)
      expect(output).toContain('Running Ship Faster engine standalone')
      expect(output).toContain(`Prompt: ${prompt}`)
    } finally {
      if (proc.exitCode === null) {
        proc.kill('SIGTERM')
        await new Promise<void>((resolve) => {
          const timeout = setTimeout(resolve, 1_000)
          proc.once('close', () => {
            clearTimeout(timeout)
            resolve()
          })
        })
      }
    }
  }, 10_000)
})
