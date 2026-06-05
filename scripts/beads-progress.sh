#!/usr/bin/env bash
# Beads task-progress banner — agent-agnostic (Claude Code, Codex, Devin, humans).
#
#   bash scripts/beads-progress.sh
#
# Run it at the START of a work session and AFTER `git pull` to see what's left.
# - Claude Code runs it automatically via .claude/settings.json hooks.
# - Codex / Devin / other agents are instructed to run it via AGENTS.md.
# - Humans can run it anytime.
#
# Safe no-op when `bd` or the .beads database is absent — never fails the caller.

root="${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null || echo .)}"
cd "$root" 2>/dev/null || exit 0

command -v bd >/dev/null 2>&1 || exit 0
[ -d .beads ] || exit 0

echo "📿 Beads — task progress for this repo"
bd status 2>/dev/null | sed -n '1,14p'
echo "▶️  Ready to work (open, no blockers):"
bd ready 2>/dev/null | grep -vE '^-{5,}|^Status:|^Ready:|^$' | sed -n '1,15p'
echo "   ↳ bd ready · bd show <id> · bd update <id> --claim · bd close <id>"
exit 0
