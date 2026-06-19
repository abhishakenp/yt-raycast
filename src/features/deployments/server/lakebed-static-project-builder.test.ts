import { describe, expect, it } from 'vitest'

import { buildStaticLakebedProjectFiles } from './lakebed-static-project-builder'

describe('buildStaticLakebedProjectFiles', () => {
  it('builds a lightweight static Lakebed project without OpenUI manifests', async () => {
    const project = await buildStaticLakebedProjectFiles({
      source:
        '<!doctype html><html><head><title>Static Demo</title><style>body{color:red}</style></head><body><h1>Demo</h1></body></html>',
      siteSpecJson: '{"projectName":"Static Demo"}',
    })

    expect(project.projectName).toBe('Static Demo')
    expect(Object.keys(project.files).sort()).toEqual([
      'AGENTS.md',
      'CLAUDE.md',
      'README.md',
      'client/index.tsx',
      'client/preview.ts',
      'server/index.ts',
      'shared/content.ts',
    ])
    expect(project.files['client/index.tsx']).toContain('srcDoc={previewHtml}')
    expect(project.files['client/preview.ts']).toContain('body{color:red}')
    expect(Object.values(project.files).join('\n')).not.toMatch(
      /@ship-fast|@openuidev|OpenUI|defineCapsule|root =/,
    )
  })

  it('rewrites generated preview image API URLs to detached image URLs', async () => {
    const project = await buildStaticLakebedProjectFiles({
      source:
        '<!doctype html><html><head><title>Images</title></head><body><img alt="Max the dog" src="/api/pexels?query=max-the-dog&w=800&h=600"></body></html>',
    })

    expect(project.files['client/preview.ts']).toContain(
      'https://picsum.photos/seed/max-the-dog/800/600',
    )
    expect(project.files['client/preview.ts']).not.toContain('/api/pexels')
  })

  it('replaces ShipFast-local Tailwind runtime with the public CDN script', async () => {
    const project = await buildStaticLakebedProjectFiles({
      source:
        '<!doctype html><html><head><title>Styled</title><script src="/scripts/tailwind-browser.js"></script></head><body class="bg-background text-foreground"><div class="border-border bg-card text-card-foreground">Styled</div></body></html>',
    })

    expect(project.files['client/preview.ts']).toContain(
      'https://cdn.tailwindcss.com',
    )
    expect(project.files['client/preview.ts']).toContain('bg-background')
    expect(project.files['client/preview.ts']).not.toContain(
      '/scripts/tailwind-browser.js',
    )
    expect(project.files['client/preview.ts']).not.toContain('tailwind.config')
  })
})
