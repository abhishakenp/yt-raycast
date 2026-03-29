# Generation Architecture Audit

## Current Flow Before Refactor

Prompt entry:
- Homepage prompt form posts to `POST /api/sessions` in [src/server/index.js](/home/suryaremanan/Documents/ship-fast/src/server/index.js)
- The server creates a session workspace in [src/server/sessions.js](/home/suryaremanan/Documents/ship-fast/src/server/sessions.js)

Design/theme generation:
- `runAll()` in [src/pipeline/runner.js](/home/suryaremanan/Documents/ship-fast/src/pipeline/runner.js) calls `generateDesignBrief()`
- Design metadata is persisted as `design-brief.txt`

Project context generation:
- `runAll()` calls `detectSiteType()` then `generateContext()`
- Context is persisted as `project-context.json`

Homepage generation:
- `runAll()` starts `generateHomepage()` in parallel with context/design work
- Generated homepage HTML is written directly into `index.html`

Task/page generation:
- `deriveTasks()` currently derives page/backend tasks from `project-context.json`
- `generateAllTasks()` generates remaining pages as full HTML files and backend placeholders
- `fixHomepageNav()` mutates the generated homepage after page generation completes

Session storage:
- Session state is stored in memory and reconstructed from workspace artifacts
- The workspace currently stores prompt/context/homepage/tasks plus elapsed/cost metadata

Preview routing:
- Preview files are served directly from the session workspace under `/preview/:sessionId`
- The dashboard iframe points at the generated static files in that workspace

Edit mode:
- `runEdit()` currently reads existing HTML files and asks the model to rewrite them in place
- HTML has been the practical source of truth for edits

## Refactor Direction

This refactor introduces `site-spec.json` as the canonical artifact for each session.

New architecture:
- Prompt -> design/context/site-spec generation
- `site-spec.json` becomes the export/edit source of truth
- Renderer modules generate HTML/React/Next.js projects from the spec
- Preview can be re-rendered from `site-spec.json`
- Existing fast preview generation remains available during initial generation so the dashboard experience does not regress while the renderer architecture is introduced
