## Learned User Preferences
- Prefer direct, low-friction generation flow: do not open sign-up/auth overlay unless the backend explicitly indicates authentication or quota exhaustion (use explicit server signals such as error codes—not generic 429s or unrelated rate limits).
- Prefer prompt guidance that is subtle and non-blocking, with delayed helper text rather than hard minimum-length enforcement; do not treat clearly substantive project descriptions as invalid for being too short or generic.
- Prefer Cursor to open the project in the integrated browser and open automatically on start.
- Prefer local web entrypoint at `http://localhost:7420` in Cursor project settings.
- Prefer concise changes for recurring UX behaviors over pre-emptive client-side gating.

## Learned Workspace Facts
- `.cursor/settings.json` is used for project browser behavior (`cursorProject`) including `openMode`, `autoOpenOnStart`, and `defaultUrl`.
- Workspace has a GitHub MCP configuration in `.cursor/mcp.json` using `bunx` and `@modelcontextprotocol/server-github` with token env var.
- Local MCP plugin metadata indicates a configured tldraw integration under `.cursor/projects/Users-livio-Documents-ship-fast/mcps/plugin-tldraw-tldraw`.
- The app has recurring runtime behavior around preview hot-reload events (`preview_reload`, `client_reload`) and websocket-driven dashboard updates.
- Session and homepage flows have repeatedly aimed to avoid iframe-embedding the homepage behind a session; prefer URL or view-state changes without iframes where possible.
