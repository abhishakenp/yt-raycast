#!/usr/bin/env python3
"""
ship.py — Deterministic orchestrator for the ship-fast pipeline.

Replaces the 523-line SKILL.md that Claude Code used to interpret.
Phases: prompt → dashboard → spec+design → homepage → tasks → execute → fix → report

Usage:
    python3 ship.py "build a todo app"       # Fresh run
    python3 ship.py                          # Auto-detect: continue or read prompt.txt
    python3 ship.py --reset                  # Keep spec/design/tasks, wipe code
    python3 ship.py --reset-hard             # Wipe everything except prompt.txt
    python3 ship.py --reset-no-spec          # Re-generate spec
    python3 ship.py --reset-no-home          # Re-generate homepage
    python3 ship.py --reset-no-tasks         # Re-plan tasks
    python3 ship.py --reset-no-design        # Re-generate design system
"""

import atexit
import glob
import json
import os
import re
import signal
import subprocess
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

# ── Config ────────────────────────────────────────────────────────────────────

SCRIPT_DIR = Path(__file__).parent.resolve()
SKILL_DIR = SCRIPT_DIR.parent
SEARCH_PY = Path.home() / ".claude/skills/ui-ux-pro-max/.claude/skills/ui-ux-pro-max/scripts/search.py"

GROQ_HOST = os.environ.get("GROQ_HOST", "https://api.groq.com")
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
MODEL = os.environ.get("GROQ_MODEL", "openai/gpt-oss-120b")

EXECUTOR_PORT = 7420
PREVIEW_PORT = 3000

# ── Subprocess tracking ──────────────────────────────────────────────────────

_children: list[subprocess.Popen] = []


def _cleanup():
    for p in _children:
        try:
            p.terminate()
            p.wait(timeout=3)
        except Exception:
            try:
                p.kill()
            except Exception:
                pass


atexit.register(_cleanup)
signal.signal(signal.SIGINT, lambda *_: (sys.exit(130),))


# ── Timer ─────────────────────────────────────────────────────────────────────

class Timer:
    def __init__(self):
        self._starts: dict[str, float] = {}
        self._durations: dict[str, float] = {}
        self.start("total")

    def start(self, name: str):
        self._starts[name] = time.time()

    def stop(self, name: str) -> float:
        d = time.time() - self._starts.get(name, time.time())
        self._durations[name] = d
        return d

    def get(self, name: str) -> float:
        return self._durations.get(name, 0.0)

    def report(self) -> str:
        self.stop("total")
        lines = ["/ship complete", "──────────────────────────────"]
        for name, d in self._durations.items():
            label = name.replace("_", " ").title()
            lines.append(f"{label:16s} {d:.1f}s")
        lines.append("──────────────────────────────")
        return "\n".join(lines)


# ── Groq API ──────────────────────────────────────────────────────────────────

def call_groq(prompt: str, system: str = "", temperature: float = 0.3,
              max_tokens: int = 8000) -> dict:
    """Call Groq via curl (urllib blocked on some macOS)."""
    messages = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})

    url = f"{GROQ_HOST.rstrip('/')}/openai/v1/chat/completions"
    payload = json.dumps({
        "model": MODEL,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
        "stream": False,
    })

    for attempt in range(2):
        try:
            result = subprocess.run(
                ["curl", "-s", url,
                 "-H", f"Authorization: Bearer {GROQ_API_KEY}",
                 "-H", "Content-Type: application/json",
                 "-d", payload],
                capture_output=True, text=True, timeout=120
            )
            data = json.loads(result.stdout)
            if "error" in data:
                if attempt == 0:
                    time.sleep(2)
                    continue
                return {"content": "", "error": str(data["error"])}

            choice = data.get("choices", [{}])[0]
            content = choice.get("message", {}).get("content", "")
            usage = data.get("usage", {})
            return {
                "content": content,
                "output_tokens": usage.get("completion_tokens", 0),
                "prompt_tokens": usage.get("prompt_tokens", 0),
                "total_time": usage.get("total_time", 0),
            }
        except Exception as e:
            if attempt == 0:
                time.sleep(2)
                continue
            return {"content": "", "error": str(e)}

    return {"content": "", "error": "max retries"}


def format_tps(r: dict) -> str:
    ot = r.get("output_tokens", 0) or 0
    pt = r.get("prompt_tokens", 0) or 0
    tt = r.get("total_time", 0) or 0
    if tt > 0 and ot > 0:
        return f"{ot / tt:.0f} tps ({ot} out, {pt} in)"
    elif ot > 0:
        return f"{ot} out, {pt} in"
    return ""


def call_groq_parallel(calls: list[dict]) -> list[dict]:
    """Fire all Groq calls simultaneously. Each dict has prompt, system, temperature, max_tokens."""
    results = [None] * len(calls)
    with ThreadPoolExecutor(max_workers=len(calls)) as pool:
        futures = {}
        for i, c in enumerate(calls):
            f = pool.submit(
                call_groq,
                c["prompt"],
                c.get("system", ""),
                c.get("temperature", 0.3),
                c.get("max_tokens", 8000),
            )
            futures[f] = i
        for f in as_completed(futures):
            results[futures[f]] = f.result()
    return results


# ── Port / process management ─────────────────────────────────────────────────

def kill_port(port: int):
    try:
        pids = subprocess.check_output(
            ["lsof", "-ti", f":{port}"], text=True, stderr=subprocess.DEVNULL
        ).strip().split()
        for pid in pids:
            try:
                os.kill(int(pid), 9)
            except (ProcessLookupError, ValueError):
                pass
        if pids:
            time.sleep(0.3)
    except Exception:
        pass


# ── Status / executor communication ──────────────────────────────────────────

def post_status(status: str, phase: str):
    try:
        subprocess.run(
            ["curl", "-s", "-X", "POST", f"http://localhost:{EXECUTOR_PORT}/api/status",
             "-H", "Content-Type: application/json",
             "-d", json.dumps({"status": status, "phase": phase})],
            capture_output=True, timeout=5
        )
    except Exception:
        pass


def wait_executor_has_tasks(timeout: int = 30):
    """Poll executor /api/tasks until it has loaded tasks into memory."""
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            r = subprocess.run(
                ["curl", "-s", f"http://localhost:{EXECUTOR_PORT}/api/tasks"],
                capture_output=True, text=True, timeout=3
            )
            if r.returncode == 0:
                data = json.loads(r.stdout)
                if isinstance(data, list) and len(data) > 0:
                    print(f"  executor: loaded {len(data)} tasks")
                    return True
        except Exception:
            pass
        time.sleep(0.5)
    print("  WARNING: executor did not load tasks within timeout")
    return False


def trigger_run():
    try:
        r = subprocess.run(
            ["curl", "-s", "-X", "POST", f"http://localhost:{EXECUTOR_PORT}/api/run",
             "-H", "Content-Type: application/json", "-d", "{}"],
            capture_output=True, text=True, timeout=5
        )
        if r.returncode == 0:
            print(f"  executor: run triggered — {r.stdout.strip()}")
    except Exception as e:
        print(f"  WARNING: trigger_run failed: {e}")


# ── Subprocess launchers ──────────────────────────────────────────────────────

def start_executor(workspace: str, prompt: str) -> subprocess.Popen:
    kill_port(EXECUTOR_PORT)
    env = {**os.environ, "IRIS_WORKSPACE": workspace, "SHIP_PROMPT": prompt}
    p = subprocess.Popen(
        [sys.executable, str(SCRIPT_DIR / "executor.py")],
        env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL
    )
    _children.append(p)
    # Wait for executor to be ready
    for _ in range(20):
        try:
            r = subprocess.run(
                ["curl", "-s", f"http://localhost:{EXECUTOR_PORT}/api/tasks"],
                capture_output=True, timeout=2
            )
            if r.returncode == 0:
                break
        except Exception:
            pass
        time.sleep(0.3)
    return p


def start_http_server(workspace: str) -> subprocess.Popen:
    kill_port(PREVIEW_PORT)
    p = subprocess.Popen(
        [sys.executable, "-m", "http.server", str(PREVIEW_PORT), "--directory", workspace],
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL
    )
    _children.append(p)
    return p


# ── Resume / reset logic ─────────────────────────────────────────────────────

def detect_resume_phase(workspace: str) -> int:
    """Return the phase number to start from based on existing artifacts."""
    w = Path(workspace)
    has_spec = (w / "spec.md").exists()
    has_design = any(w.glob("design-system/**/MASTER.md"))
    has_homepage = (w / "index.html").exists()
    has_tasks = (w / "tasks.json").exists()

    if has_tasks:
        try:
            data = json.loads((w / "tasks.json").read_text())
            tasks = data.get("tasks", [])
            all_done = all(t.get("status") in ("DONE", "FAILED") for t in tasks)
            if all_done and tasks:
                return 6  # report
        except Exception:
            pass
        return 4  # wait for completion

    if not has_spec:
        return 1
    if not has_design:
        return 1  # design only (spec exists)
    if not has_homepage:
        return 2
    return 3


def reset_workspace(workspace: str, variant: str):
    """Selectively wipe workspace based on reset variant."""
    w = Path(workspace)

    # Files that survive all resets
    always_keep = {"prompt.txt"}

    # Per-variant keep sets
    keep_sets = {
        "reset": {"prompt.txt", "spec.md", "project-context.json", "tasks.json",
                  "tasks-skeleton.json", "design-system", "references", "ship.log"},
        "reset-hard": {"prompt.txt"},
        "reset-no-spec": {"prompt.txt", "tasks.json",
                          "tasks-skeleton.json", "design-system", "references", "ship.log"},
        "reset-no-home": {"prompt.txt", "spec.md", "project-context.json",
                          "design-system", "references", "ship.log"},
        "reset-no-tasks": {"prompt.txt", "spec.md", "project-context.json",
                           "index.html", "design-system", "references", "ship.log"},
        "reset-no-design": {"prompt.txt", "spec.md", "project-context.json",
                            "tasks.json", "tasks-skeleton.json", "references", "ship.log"},
    }

    keep = keep_sets.get(variant, always_keep)

    for item in w.iterdir():
        if item.name in keep:
            continue
        if item.name.startswith("."):
            continue
        if item.is_dir():
            import shutil
            shutil.rmtree(item, ignore_errors=True)
        else:
            item.unlink(missing_ok=True)

    print(f"Reset ({variant}): wiped workspace, kept {keep}")


# ── Phase implementations ─────────────────────────────────────────────────────

def phase0_setup(workspace: str, prompt: str, timer: Timer):
    """Save prompt, kill stale ports, launch executor."""
    timer.start("setup")
    print(f"\n{'='*60}")
    print(f"  /ship — {prompt[:80]}{'...' if len(prompt) > 80 else ''}")
    print(f"  workspace: {workspace}")
    print(f"{'='*60}\n")

    # Save prompt.txt
    prompt_path = Path(workspace) / "prompt.txt"
    prompt_path.write_text(prompt)

    # Kill stale ports
    kill_port(EXECUTOR_PORT)
    kill_port(PREVIEW_PORT)

    # Launch executor (dashboard at :7420)
    start_executor(workspace, prompt)

    # Log start
    log_path = Path.home() / ".ship.log"
    with open(log_path, "a") as f:
        f.write(f"\n--- /ship started at {time.strftime('%Y-%m-%d %H:%M:%S')} ---\n")
        f.write(f"    prompt: {prompt[:120]}\n")
        f.write(f"    workspace: {workspace}\n")

    timer.stop("setup")
    print(f"Phase 0 (setup): {timer.get('setup'):.1f}s")


def phase1_verify(workspace: str, prompt: str, timer: Timer):
    """Verify that spec.md + project-context.json + design system exist (all pre-written by Claude)."""
    timer.start("verify")
    w = Path(workspace)

    # Check all required artifacts
    missing = []
    if not (w / "spec.md").exists():
        missing.append("spec.md")
    if not (w / "project-context.json").exists():
        missing.append("project-context.json")

    design_exists = any(w.glob("design-system/**/MASTER.md"))
    if not design_exists:
        missing.append("design-system/<slug>/MASTER.md")

    if missing:
        print(f"\n  ERROR: Missing required files: {', '.join(missing)}")
        print(f"  Claude must write/generate these BEFORE invoking ship.py:")
        print(f"  1. spec.md (Step 1)")
        print(f"  2. project-context.json (Step 1)")
        print(f"  3. design-system/<slug>/MASTER.md via /ui-ux-pro-max (Step 2)")
        print(f"  4. Review & curate design system (Step 3)")
        print(f"  See SKILL.md for details.")
        sys.exit(1)

    # Log what was found
    print("  ✓ spec.md")
    print("  ✓ project-context.json")
    design_paths = list(w.glob("design-system/**/MASTER.md"))
    if design_paths:
        print(f"  ✓ design-system: {design_paths[0].relative_to(w)}")

    timer.stop("verify")
    print(f"Phase 1 (verify artifacts): {timer.get('verify'):.1f}s")


def phase2_homepage(workspace: str, timer: Timer):
    """Generate homepage HTML, start preview server, notify dashboard."""
    timer.start("homepage")
    w = Path(workspace)

    # Start preview server FIRST
    start_http_server(workspace)

    # Deceptive status: "Generating tasks..." while actually making homepage
    post_status("Generating tasks...", "tasks")

    # Read spec + design system
    spec = ""
    try:
        spec = (w / "spec.md").read_text()
    except Exception:
        pass

    design = ""
    # Search recursively for MASTER.md in case of nested paths
    masters = list(w.glob("design-system/**/MASTER.md"))
    if masters:
        design = masters[0].read_text()
        print(f"  design system: loaded from {masters[0].relative_to(w)} ({len(design)} chars)")
    else:
        print("  WARNING: no design system MASTER.md found — homepage will use generic styling")

    if not spec:
        print("  WARNING: spec.md is empty or missing")

    result = call_groq(
        prompt=(
            f"Generate a complete index.html for:\n\n{spec}\n\n"
            f"Design system (USE THESE EXACT COLORS, FONTS, AND SPACING):\n{design}\n\n"
            f"Requirements:\n"
            f"- Single self-contained HTML file with Tailwind CDN\n"
            f"  (<script src=\"https://cdn.tailwindcss.com\"></script>)\n"
            f"- Dark mode using the exact color tokens from the design system\n"
            f"- Include ALL sections visible in viewport (header, hero, key interactive elements)\n"
            f"- Placeholder/mock data for dynamic content\n"
            f"- Smooth animations (CSS transitions, keyframes)\n"
            f"- Responsive layout\n"
            f"- Professional polish\n"
            f"- Google Fonts via CDN link\n\n"
            f"Output ONLY the HTML. No markdown fences, no explanation."
        ),
        system=(
            "You are a frontend code generator. Output ONLY a complete HTML file. "
            "Use Tailwind CSS via CDN. The page must be beautiful, polished, and fully responsive. "
            "Include animations and micro-interactions via inline CSS/JS. "
            "Use Google Fonts via CDN link. No external dependencies beyond Tailwind CDN and Google Fonts."
        ),
        max_tokens=8000,
    )

    content = result.get("content", "")
    # Strip markdown fences if present
    content = re.sub(r"^```html?\s*\n?", "", content)
    content = re.sub(r"\n?```\s*$", "", content)

    (w / "index.html").write_text(content)
    tps = format_tps(result)
    print(f"  homepage: {len(content)} chars | {tps}")

    # Notify dashboard: homepage ready → exits intro, shows split view
    post_status("Homepage ready", "homepage_ready")

    timer.stop("homepage")
    print(f"Phase 2 (homepage): {timer.get('homepage'):.1f}s")


def phase3_tasks(workspace: str, prompt: str, timer: Timer):
    """Generate task skeleton, fire parallel Groq calls for frontend actions, assemble tasks.json."""
    timer.start("tasks")
    w = Path(workspace)

    spec = ""
    try:
        spec = (w / "spec.md").read_text()
    except Exception:
        pass

    ctx = ""
    try:
        ctx = (w / "project-context.json").read_text()
    except Exception:
        pass

    design = ""
    masters = list(w.glob("design-system/**/MASTER.md"))
    if masters:
        design = masters[0].read_text()

    # Step 1: Generate task skeleton
    post_status("Planning tasks...", "planning")
    skeleton_result = call_groq(
        prompt=(
            f"Plan 5-12 tasks for building this project as HTML pages.\n\n"
            f"SPEC:\n{spec}\n\n"
            f"CONTEXT:\n{ctx}\n\n"
            f"RULES:\n"
            f"- task-1 is ALWAYS the homepage (already generated, mark status: DONE)\n"
            f"- task-2 through task-N-1: one HTML page/component each (all parallel, no dependencies)\n"
            f"- task-N: final assembly + verify task (depends on all others)\n"
            f"- Each frontend task generates a single self-contained HTML file with Tailwind CDN\n"
            f"- Backend tasks (if any) have IDs like backend-1, backend-2 and depend on all frontend tasks\n"
            f"- Keep descriptions under 150 tokens\n"
            f"- action field: leave as \"PLACEHOLDER\" for now (will be filled separately)\n\n"
            f"Output ONLY valid JSON:\n"
            f'{{"tasks": [{{"id": "task-1", "title": "Homepage", "description": "...", '
            f'"files": ["index.html"], "action": "Already generated", "status": "DONE", '
            f'"dependsOn": []}}, ...]}}'
        ),
        system="You are a task planner. Output ONLY valid JSON with a tasks array. No markdown fences.",
        max_tokens=4000,
    )

    skeleton_text = skeleton_result.get("content", "")
    # Extract JSON from potential markdown wrapping
    json_match = re.search(r"\{[\s\S]*\}", skeleton_text)
    if json_match:
        skeleton_text = json_match.group(0)

    try:
        skeleton = json.loads(skeleton_text)
    except json.JSONDecodeError as e:
        print(f"  ERROR: Failed to parse task skeleton: {e}")
        print(f"  Raw output: {skeleton_text[:500]}")
        # Minimal fallback skeleton
        skeleton = {"tasks": [
            {"id": "task-1", "title": "Homepage", "description": "Homepage",
             "files": ["index.html"], "action": "Already generated",
             "status": "DONE", "dependsOn": []},
        ]}

    tasks = skeleton.get("tasks", [])
    print(f"  skeleton: {len(tasks)} tasks | {format_tps(skeleton_result)}")

    # Save skeleton
    (w / "tasks-skeleton.json").write_text(json.dumps(skeleton, indent=2))

    # Step 2: Identify frontend tasks needing actions
    frontend_tasks = [
        t for t in tasks
        if t.get("status") != "DONE"
        and not t.get("id", "").startswith("backend-")
        and t.get("action", "") in ("PLACEHOLDER", "")
    ]

    # Step 3: Parallel Groq calls for frontend task actions
    if frontend_tasks:
        post_status(f"Generating {len(frontend_tasks)} tasks...", "generating")
        calls = []
        for t in frontend_tasks:
            calls.append({
                "prompt": (
                    f"Project context:\n{ctx}\n\n"
                    f"Design system:\n{design}\n\n"
                    f"Task: {t['title']}\n"
                    f"Description: {t.get('description', '')}\n"
                    f"File(s): {', '.join(t.get('files', []))}\n\n"
                    f"Generate a complete self-contained HTML file with Tailwind CDN "
                    f"(<script src=\"https://cdn.tailwindcss.com\"></script>). "
                    f"Use the exact color tokens from the design system. "
                    f"Include Google Fonts via CDN link. Output ONLY the HTML."
                ),
                "system": (
                    "You are a code generator for a stateless execution pipeline. "
                    "Output ONLY the complete HTML file content. No JSON, no markdown fences."
                ),
                "max_tokens": 8000,
            })

        results = call_groq_parallel(calls)

        for i, t in enumerate(frontend_tasks):
            r = results[i]
            if r and r.get("content") and not r.get("error"):
                content = r["content"]
                # Strip markdown fences
                content = re.sub(r"^```html?\s*\n?", "", content)
                content = re.sub(r"\n?```\s*$", "", content)
                t["action"] = content
                tps = format_tps(r)
                print(f"  {t['id']}: {len(content)} chars | {tps}")
            else:
                print(f"  {t['id']}: FAILED — {r.get('error', 'empty response')}")

    # Step 4: Assemble tasks.json
    (w / "tasks.json").write_text(json.dumps(skeleton, indent=2))
    print(f"  tasks.json: {len(tasks)} tasks written")

    # Validate
    try:
        json.loads((w / "tasks.json").read_text())
    except json.JSONDecodeError:
        print("  ERROR: tasks.json is invalid JSON!")

    # Step 5: Wait for executor to load tasks, then trigger run
    wait_executor_has_tasks(timeout=15)
    trigger_run()

    # Step 6: Generate backend task actions in parallel (if any)
    backend_tasks = [
        t for t in tasks
        if t.get("id", "").startswith("backend-")
        and t.get("action", "") in ("PLACEHOLDER", "")
    ]

    if backend_tasks:
        post_status(f"Generating {len(backend_tasks)} backend tasks...", "backend")
        calls = []
        for t in backend_tasks:
            calls.append({
                "prompt": (
                    f"Project context:\n{ctx}\n\n"
                    f"Task: {t['title']}\n"
                    f"Description: {t.get('description', '')}\n"
                    f"File(s): {', '.join(t.get('files', []))}\n\n"
                    f"Generate the complete file content for this backend task. "
                    f"Output each file using:\n"
                    f"--- FILE: <path> ---\n<content>\n--- END FILE ---"
                ),
                "system": "You are a backend code generator. Output ONLY file content.",
                "max_tokens": 8000,
            })

        results = call_groq_parallel(calls)

        # Hot-patch into tasks.json
        data = json.loads((w / "tasks.json").read_text())
        for i, t in enumerate(backend_tasks):
            r = results[i]
            if r and r.get("content") and not r.get("error"):
                for task in data["tasks"]:
                    if task["id"] == t["id"]:
                        task["action"] = r["content"]
                        break
                print(f"  {t['id']}: hot-patched | {format_tps(r)}")

        (w / "tasks.json").write_text(json.dumps(data, indent=2))

    timer.stop("tasks")
    print(f"Phase 3 (tasks): {timer.get('tasks'):.1f}s")


def phase4_wait(workspace: str, timer: Timer):
    """Poll tasks.json until all tasks are DONE or FAILED."""
    timer.start("execute")
    w = Path(workspace)
    tasks_path = w / "tasks.json"

    print("Phase 4: waiting for executor...")
    stall_count = 0
    last_done = 0

    while True:
        try:
            data = json.loads(tasks_path.read_text())
            tasks = data.get("tasks", [])
            pending = [t for t in tasks if t.get("status") in ("PENDING", "IN_PROGRESS")]
            done = [t for t in tasks if t.get("status") == "DONE"]
            failed = [t for t in tasks if t.get("status") == "FAILED"]

            print(f"  {len(done)} done, {len(pending)} pending, {len(failed)} failed")

            if not pending:
                break

            # Stall detection
            if len(done) == last_done:
                stall_count += 1
            else:
                stall_count = 0
                last_done = len(done)

            if stall_count > 60:  # 5 minutes of no progress
                print("  WARNING: execution stalled for 5 minutes")
                break

        except Exception as e:
            print(f"  error reading tasks.json: {e}")

        time.sleep(5)

    timer.stop("execute")
    print(f"Phase 4 (execute): {timer.get('execute'):.1f}s")


def phase5_fix(workspace: str, timer: Timer):
    """Verify HTML files, check broken links, validate design tokens."""
    timer.start("fix")
    w = Path(workspace)

    html_files = list(w.glob("*.html"))
    print(f"Phase 5: verifying {len(html_files)} HTML file(s)...")

    issues = []

    for hf in html_files:
        content = hf.read_text()

        # Check it's valid HTML (has <html> or <body>)
        if "<html" not in content.lower() and "<body" not in content.lower():
            issues.append(f"  {hf.name}: missing <html>/<body> tags")

        # Check for broken local links
        for m in re.finditer(r'href="([^"#]+\.html)"', content):
            linked = m.group(1)
            if not (w / linked).exists():
                issues.append(f"  {hf.name}: broken link to {linked}")

    if issues:
        print("  Issues found:")
        for issue in issues:
            print(f"    {issue}")
    else:
        print("  All HTML files valid, no broken links")

    timer.stop("fix")
    print(f"Phase 5 (fix): {timer.get('fix'):.1f}s")


def phase6_report(timer: Timer):
    """Print timing summary, append to ~/.ship.log."""
    report = timer.report()
    print(f"\n{report}")

    # Append to ship log
    log_path = Path.home() / ".ship.log"
    with open(log_path, "a") as f:
        f.write(f"\n{report}\n")


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    if not GROQ_API_KEY:
        print("Error: GROQ_API_KEY not set.")
        sys.exit(1)

    workspace = os.getcwd()
    timer = Timer()
    args = sys.argv[1:]

    # Handle reset variants
    reset_variant = None
    prompt = None

    for arg in args:
        if arg.startswith("--reset"):
            reset_variant = arg.lstrip("-")
            break
        elif not arg.startswith("-"):
            prompt = arg

    if reset_variant:
        kill_port(EXECUTOR_PORT)
        kill_port(PREVIEW_PORT)
        reset_workspace(workspace, reset_variant)

    # Determine prompt
    if prompt is None:
        prompt_path = Path(workspace) / "prompt.txt"
        if prompt_path.exists():
            prompt = prompt_path.read_text().strip()
        else:
            print("No prompt provided and no prompt.txt found.")
            print("Usage: python3 ship.py \"build a todo app\"")
            sys.exit(1)

    # Determine starting phase
    start_phase = 0
    if reset_variant:
        phase_map = {
            "reset": 0,           # re-execute from scratch (keeps spec/design/tasks)
            "reset-hard": 0,      # full wipe
            "reset-no-spec": 1,   # re-generate spec
            "reset-no-design": 1, # re-generate design
            "reset-no-home": 2,   # re-generate homepage
            "reset-no-tasks": 3,  # re-plan tasks
        }
        start_phase = phase_map.get(reset_variant, 0)
    elif not any(args) or prompt:
        # Check for existing artifacts
        start_phase = detect_resume_phase(workspace)
        if start_phase > 0 and not reset_variant:
            print(f"Resuming from phase {start_phase} (existing artifacts detected)")

    # Execute phases
    if start_phase <= 0:
        phase0_setup(workspace, prompt, timer)

    if start_phase <= 1:
        if start_phase > 0 and start_phase <= 1:
            phase0_setup(workspace, prompt, timer)
        phase1_verify(workspace, prompt, timer)

    if start_phase <= 2:
        if start_phase == 2:
            phase0_setup(workspace, prompt, timer)
        phase2_homepage(workspace, timer)

    if start_phase <= 3:
        if start_phase == 3:
            phase0_setup(workspace, prompt, timer)
        phase3_tasks(workspace, prompt, timer)

    if start_phase <= 4:
        if start_phase == 4:
            phase0_setup(workspace, prompt, timer)
        phase4_wait(workspace, timer)

    if start_phase <= 5:
        phase5_fix(workspace, timer)

    phase6_report(timer)


if __name__ == "__main__":
    main()
