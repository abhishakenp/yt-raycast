import os
import json
import re
import sys
import time
import subprocess
from pathlib import Path
from timing import Timer
from llm_client import (
    call_gemini, call_ollama, call_groq, call_groq_model, call_groq_parallel,
    format_tps, HOMEPAGE_PROVIDER, HOMEPAGE_GROQ_MODEL
)
from executor_utils import (
    kill_port, post_status, reload_executor, trigger_run, 
    start_executor, start_http_server, PREVIEW_PORT
)

def detect_resume_phase(workspace: str) -> int:
    w = Path(workspace)
    has_spec = (w / "spec.md").exists()
    has_design = (w / "design-system.md").exists()
    has_homepage = (w / "index.html").exists()
    has_tasks = (w / "tasks.json").exists()

    if has_tasks:
        try:
            data = json.loads((w / "tasks.json").read_text())
            tasks = data.get("tasks", [])
            all_done = all(t.get("status") in ("DONE", "FAILED") for t in tasks)
            if all_done and tasks:
                return 6 
        except Exception:
            pass
        return 4 

    if not has_spec or not has_design:
        return 1
    if not has_homepage:
        return 2 
    return 3 

def reset_workspace(workspace: str, variant: str):
    w = Path(workspace)
    keep_sets = {
        "reset": {"prompt.txt", "spec.md", "project-context.json", "design-system.md", "references", "ship.log"},
        "reset-hard": {"prompt.txt"},
    }
    keep = keep_sets.get(variant, {"prompt.txt"})
    for item in w.iterdir():
        if item.name in keep or item.name.startswith("."):
            continue
        if item.is_dir():
            import shutil
            shutil.rmtree(item, ignore_errors=True)
        else:
            item.unlink(missing_ok=True)
    print(f"Reset ({variant}): wiped workspace, kept {keep}")

def phase0_setup(workspace: str, prompt: str, timer: Timer, children: list):
    timer.start("setup")
    print(f"\n{'='*60}")
    print(f"  /ship — {prompt[:80]}{'...' if len(prompt) > 80 else ''}")
    print(f"  workspace: {workspace}")
    print(f"{'='*60}\n")

    prompt_path = Path(workspace) / "prompt.txt"
    if not prompt_path.exists():
        prompt_path.write_text(prompt)

    kill_port(PREVIEW_PORT)
    start_executor(workspace, prompt, children)

    log_path = Path.home() / ".ship.log"
    with open(log_path, "a") as f:
        f.write(f"\n--- /ship started at {time.strftime('%Y-%m-%d %H:%M:%S')} ---\n")
        f.write(f"    prompt: {prompt[:120]}\n")
        f.write(f"    workspace: {workspace}\n")

    timer.stop("setup")
    print(f"Phase 0 (setup): {timer.get('setup'):.1f}s")

def phase1_verify(workspace: str, prompt: str, timer: Timer):
    timer.start("verify")
    w = Path(workspace)
    spec_exists = (w / "spec.md").exists()
    context_exists = (w / "project-context.json").exists()
    design_exists = (w / "design-system.md").exists()

    if not spec_exists or not context_exists:
        print("\n  🤖 Generating spec.md + project-context.json...")
        missing = [f for f, exists in [("spec.md", spec_exists), ("project-context.json", context_exists)] if not exists]
        print(f"  ⚠️  Missing: {', '.join(missing)}")
        print(f"  (Auto-generation not yet implemented)")
        sys.exit(1)

    if not design_exists:
        print("\n  🤖 Generating design system...")
        print(f"  ⚠️  Missing: design-system.md")
        sys.exit(1)

    print("  ✓ spec.md\n  ✓ project-context.json\n  ✓ design-system.md")
    timer.stop("verify")
    print(f"Phase 1 (verify artifacts): {timer.get('verify'):.1f}s")

def phase2_homepage(workspace: str, timer: Timer, children: list):
    timer.start("homepage")
    w = Path(workspace)
    prompt_text = ""
    prompt_path = w / "prompt.txt"
    if prompt_path.exists():
        prompt_text = prompt_path.read_text().lower()

    if os.environ.get("SHIP_SKIP_HOMEPAGE") == "1" or "skip homepage" in prompt_text:
        print("\n  ⏭ Skipping homepage generation")
        timer.stop("homepage")
        return

    spec = (w / "spec.md").read_text() if (w / "spec.md").exists() else ""
    design = (w / "design-system.md").read_text() if (w / "design-system.md").exists() else ""

    start_http_server(workspace, children)
    post_status("Generating tasks...", "tasks")

    hp_prompt = (
        f"Generate a complete index.html for:\n\n{spec}\n\n"
        f"Requirements:\n- Single self-contained HTML file with Tailwind CDN\n"
        f"- Responsive layout with smooth animations\n"
        f"- Placeholder/mock data where needed\n"
        f"Output ONLY the HTML. No markdown fences, no explanation."
    )
    hp_system = (
        "You are a frontend code generator. Output ONLY a complete HTML file. "
        "Use Tailwind CSS via CDN. The page must be beautiful, polished, and fully responsive. "
        "Include animations and micro-interactions via inline CSS/JS. "
        "Use Google Fonts via CDN link. No external dependencies beyond Tailwind CDN and Google Fonts."
    )

    provider = HOMEPAGE_PROVIDER.lower()
    print(f"\n  Generating homepage ({provider})...")
    if provider == "ollama":
        result = call_ollama(hp_prompt, system=hp_system, temperature=0.7)
    elif provider == "groq":
        result = call_groq_model(hp_prompt, model=HOMEPAGE_GROQ_MODEL, system=hp_system, temperature=0.7)
    elif provider == "gemini":
        result = call_gemini(hp_prompt, system=hp_system, temperature=0.7)
    else:
        result = call_groq_model(hp_prompt, model=HOMEPAGE_GROQ_MODEL, system=hp_system, temperature=0.7)

    content = result.get("content", "")
    if content:
        content = re.sub(r"^```html?\s*\n?", "", content)
        content = re.sub(r"\n?```\s*$", "", content)
        (w / "index.html").write_text(content)
        print(f"  index.html: {len(content)} chars | {format_tps(result)}")
    else:
        print(f"  ERROR: homepage generation failed — {result.get('error', 'empty')}")

    post_status("Homepage ready", "homepage_ready")
    timer.stop("homepage")
    print(f"Phase 2 (homepage): {timer.get('homepage'):.1f}s")

def phase3_tasks(workspace: str, prompt: str, timer: Timer):
    timer.start("tasks")
    w = Path(workspace)
    spec = (w / "spec.md").read_text() if (w / "spec.md").exists() else ""
    ctx = (w / "project-context.json").read_text() if (w / "project-context.json").exists() else ""
    design = (w / "design-system.md").read_text() if (w / "design-system.md").exists() else ""

    timer.start("skeleton")
    post_status("Planning tasks...", "planning")
    skeleton_result = call_groq(
        prompt=f"Plan 5-12 tasks for building this project as HTML pages.\n\nSPEC:\n{spec}\n\nCONTEXT:\n{ctx}\n\n"
               f"RULES: task-1 is Homepage (DONE), task-2 to N-1 are parallel HTML tasks, task-N is final assembly.\n"
               f"Output ONLY valid JSON with tasks array.",
        system="You are a task planner. Output ONLY valid JSON with a tasks array. No markdown fences.",
        max_tokens=4000
    )

    skeleton_text = skeleton_result.get("content", "")
    json_match = re.search(r"\{[\s\S]*\}", skeleton_text)
    skeleton_text = json_match.group(0) if json_match else "{}"

    try:
        skeleton = json.loads(skeleton_text)
    except:
        skeleton = {"tasks": [{"id": "task-1", "title": "Homepage", "status": "DONE", "dependsOn": []}]}

    timer.stop("skeleton")
    tasks = skeleton.get("tasks", [])
    for t in tasks:
        t["status"] = t.get("status", "PENDING").upper() if t.get("status", "").upper() not in ("DONE", "FAILED") else t.get("status", "").upper()

    (w / "tasks-skeleton.json").write_text(json.dumps(skeleton, indent=2))

    frontend_tasks = [t for t in tasks if t.get("status") != "DONE" and not str(t.get("id", "")).startswith("backend-") and t.get("action", "") in ("PLACEHOLDER", "")]
    if frontend_tasks:
        timer.start("frontend_gen")
        post_status(f"Generating {len(frontend_tasks)} tasks...", "generating")
        calls = [{
            "prompt": f"Context:\n{ctx}\n\nDesign:\n{design}\n\nTask: {t.get('title', t.get('name', 'Task'))}\nDescription: {t.get('description', '')}\n"
                      f"Generate a self-contained HTML file with Tailwind CDN. Output ONLY HTML.",
            "system": "You are a code generator. Output ONLY the complete HTML file content.",
        } for t in frontend_tasks]
        results = call_groq_parallel(calls)
        for i, t in enumerate(frontend_tasks):
            r = results[i]
            if r and r.get("content") and not r.get("error"):
                content = re.sub(r"^```html?\s*\n?", "", r["content"])
                content = re.sub(r"\n?```\s*$", "", content)
                t["action"] = content
                slug = re.sub(r'[^a-z0-9]+', '-', (t.get('title') or t.get('name') or f'page-{t.get("id","x")}').lower()).strip('-')
                fname = f"{slug}.html"
                (w / fname).write_text(content)
                t["files"] = [fname]
                print(f"  {t['id']}: {len(content)} chars | {format_tps(r)}")
        timer.stop("frontend_gen")

    (w / "tasks.json").write_text(json.dumps(skeleton, indent=2))
    reload_executor()
    time.sleep(0.5)
    trigger_run()

    backend_tasks = [t for t in tasks if str(t.get("id", "")).startswith("backend-") and t.get("action", "") in ("PLACEHOLDER", "")]
    if backend_tasks:
        timer.start("backend_gen")
        post_status(f"Generating {len(backend_tasks)} backend tasks...", "backend")
        calls = [{
            "prompt": f"Context:\n{ctx}\n\nTask: {t['title']}\nDescription: {t.get('description', '')}\n"
                      f"Generate file content. Use: --- FILE: <path> ---\n<content>\n--- END FILE ---",
            "system": "You are a backend code generator. Output ONLY file content.",
        } for t in backend_tasks]
        results = call_groq_parallel(calls)
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
        timer.stop("backend_gen")

    timer.stop("tasks")
    print(f"Phase 3 (tasks): {timer.get('tasks'):.1f}s")

def phase4_wait(workspace: str, timer: Timer):
    timer.start("execute")
    w = Path(workspace)
    tasks_path = w / "tasks.json"
    print("Phase 4: waiting for executor...")
    stall_count, last_done = 0, 0
    while True:
        try:
            data = json.loads(tasks_path.read_text())
            tasks = data.get("tasks", [])
            pending = [t for t in tasks if t.get("status") not in ("DONE", "FAILED")]
            done = [t for t in tasks if t.get("status") == "DONE"]
            print(f"  {len(done)} done, {len(pending)} pending")
            if not pending: break
            stall_count = stall_count + 1 if len(done) == last_done else 0
            last_done = len(done)
            if stall_count > 18: break
        except: pass
        time.sleep(5)
    timer.stop("execute")
    print(f"Phase 4 (execute): {timer.get('execute'):.1f}s")

def phase5_fix(workspace: str, timer: Timer):
    timer.start("fix")
    w = Path(workspace)
    html_files = list(w.glob("*.html"))
    print(f"Phase 5: verifying {len(html_files)} HTML file(s)...")
    issues = []
    for hf in html_files:
        content = hf.read_text()
        if "<html" not in content.lower() and "<body" not in content.lower():
            issues.append(f"  {hf.name}: missing tags")
        for m in re.finditer(r'href="([^"#]+\.html)"', content):
            if not (w / m.group(1)).exists():
                issues.append(f"  {hf.name}: broken link to {m.group(1)}")
    if issues:
        for issue in issues: print(f"    {issue}")
    else:
        print("  All HTML files valid")
    timer.stop("fix")
    print(f"Phase 5 (fix): {timer.get('fix'):.1f}s")

def phase6_report(timer: Timer):
    report = timer.report()
    print(f"\n{report}")
    log_path = Path.home() / ".ship.log"
    with open(log_path, "a") as f: f.write(f"\n{report}\n")
