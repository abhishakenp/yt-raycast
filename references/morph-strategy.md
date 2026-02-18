# Morph + Task Design Strategy

## Mode detection

```bash
if [ -f "package.json" ] || [ -d "src/" ]; then
  MODE="ITERATION"
else
  MODE="BOOTSTRAP"
fi
```

## Bootstrap mode (default for /ship)

Use when: directory is empty, new features create new files, spec describes a new system.

Rules:
- Generate COMPLETE files — all imports, all types, no TODO, no placeholders
- Do NOT use Morph patches
- Each task action must contain full source code

## Iteration mode (existing project, file modifications)

Use Morph when ALL are true:
- Project is not empty
- Task is EDIT (not CREATE)
- File size > 150 lines OR file is shared
- Multiple tasks may modify the file

Morph patch format:
```
FILE: path
ACTION: UPDATE

// ... existing code ...
<new or modified code>
// ... existing code ...
```

Rules:
- Do NOT rewrite entire file
- Only changed sections with minimal context markers
- Patch size ≤ 40% of original file
- Fast Apply merges correctly

## Parallelism rules

- ALL feature tasks MUST depend ONLY on task-1
- If a feature task would depend on another feature → REDESIGN to eliminate the dependency
- If a page imports a new component → same task creates both files, OR inline the types
- Multiple tasks MAY modify the same file (conflicts resolved in fix loop)

## Task weight (50-150 tokens per description)

Each task description should include ONLY:
- File path
- Responsibility/goal
- Key constraints
- Integration notes (if any)

Bad: `Implement full authentication system with roles, middleware, validation, session management...`

Good:
```
File: src/auth/middleware.ts
Goal: Verify JWT and attach user to request
Constraints: Use jsonwebtoken, return 401 if invalid
```

## Anti-patterns (MUST avoid)

- Using Morph for initial project creation
- Including full spec in each task
- Creating sequential feature tasks (A → B → C)
- Over-describing tasks (>150 tokens)
- Adding consolidation/cleanup tasks (fix loop handles it)
- Rewriting large files unnecessarily

## Decision table

| Situation | Strategy |
|-----------|----------|
| Empty project | Full files (no Morph) |
| New file | Full file |
| Edit small file (<150 lines) | Full file OR patch |
| Edit large/shared file | Morph patch |
| Parallel edits expected | Morph |
| Refactor existing feature | Morph |
| Greenfield spec | No Morph |
