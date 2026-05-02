import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

export const ensureEmbeddedStudioBuilt = (studioRoot) => {
  if (process.env.STUDIO_SKIP_AUTO_BUILD === '1') return
  const distIndex = join(studioRoot, 'dist', 'index.html')
  if (existsSync(distIndex)) return
  if (!existsSync(join(studioRoot, 'package.json'))) return
  console.log('[ship-fast] studio/dist missing — running embedded Sanity Studio build…')
  const r = spawnSync('bun', ['run', 'build'], {
    cwd: studioRoot,
    stdio: 'inherit',
    env: process.env,
  })
  if (r.status !== 0) {
    console.warn(
      '[ship-fast] sanity build failed; Site content → Sanity Studio iframe will show the placeholder until `bun run studio:build` succeeds.',
    )
  } else {
    console.log('[ship-fast] embedded Sanity Studio build finished.')
  }
}
