#!/usr/bin/env python3
"""
Ship Executor — Visual task execution dashboard with Groq code generation.
Reads tasks.json, executes tasks in dependency waves via ThreadPoolExecutor,
serves animated dashboard at localhost:7420 with SSE events.

Usage:
    IRIS_WORKSPACE="<project-path>" python3 ~/.skills/ship/scripts/executor.py

Environment:
    IRIS_WORKSPACE  — absolute path to project directory (required)
    GROQ_API_KEY    — Groq API key (required)
    GROQ_HOST       — Groq API base URL (default: https://api.groq.com)
    GROQ_MODEL      — model name (default: openai/gpt-oss-120b)
"""
import json
import os
import re
import subprocess
import sys
import threading
import time
import urllib.error
import urllib.request
import webbrowser
from concurrent.futures import ThreadPoolExecutor, as_completed
from http.server import BaseHTTPRequestHandler, HTTPServer
from socketserver import ThreadingMixIn

GROQ_HOST = os.environ.get("GROQ_HOST", "https://api.groq.com")
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
MODEL = os.environ.get("GROQ_MODEL", "openai/gpt-oss-120b")
PORT = 7420

# OpenRouter pricing for gpt-oss:120b (USD per token, fallback values)
PRICE_INPUT = 0.0  # free input on Groq
PRICE_OUTPUT = 0.0  # free on Groq direct; set for OpenRouter if needed

# --- Global state ---
tasks_data = []
event_log = []
event_lock = threading.Lock()
event_counter = 0
is_running = False
run_thread = None
_server = None

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DASHBOARD_V2_PATH = os.path.join(SCRIPT_DIR, "dashboard-v2.html")
DASHBOARD_PATH = DASHBOARD_V2_PATH  # Use split-screen dashboard by default
DASHBOARD_LEGACY_PATH = os.path.join(SCRIPT_DIR, "dashboard.html")
PREVIEW_PORT = 7421

CONTEXT_CAP = 12000
UPSTREAM_CAP = 4000


def notify_preview(endpoint: str, data: dict):
    """Send update to the preview server (best-effort, non-blocking)."""
    def _send():
        try:
            url = f"http://127.0.0.1:{PREVIEW_PORT}/api/{endpoint}"
            payload = json.dumps(data).encode()
            req = urllib.request.Request(url, data=payload, headers={
                "Content-Type": "application/json",
            })
            urllib.request.urlopen(req, timeout=3)
        except Exception:
            pass
    threading.Thread(target=_send, daemon=True).start()


def emit(event_type: str, data: dict):
    global event_counter
    with event_lock:
        event_counter += 1
        event_log.append((event_counter, {"type": event_type, **data}))


def log(msg: str):
    print(msg)
    emit("log", {"message": msg})


def call_groq(prompt: str) -> dict:
    """Call Groq API (OpenAI-compatible chat completions)."""
    url = f"{GROQ_HOST.rstrip('/')}/openai/v1/chat/completions"
    payload = json.dumps({
        "model": MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.3,
        "max_tokens": 8000,
        "stream": False,
    }).encode()
    req = urllib.request.Request(url, data=payload, headers={
        "Content-Type": "application/json",
        "Authorization": f"Bearer {GROQ_API_KEY}",
    })
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            data = json.loads(resp.read())
            choice = data.get("choices", [{}])[0]
            content = choice.get("message", {}).get("content", "")
            usage = data.get("usage", {})
            # Groq returns usage in OpenAI format
            prompt_tokens = usage.get("prompt_tokens", 0)
            completion_tokens = usage.get("completion_tokens", 0)
            # Timing from x-groq headers or usage
            total_time = usage.get("total_time", 0)
            return {
                "content": content,
                "eval_count": completion_tokens,
                "prompt_eval_count": prompt_tokens,
                "total_time": total_time,
            }
    except urllib.error.HTTPError as e:
        return {"content": f"[HTTP {e.code}] {e.read().decode()[:500]}", "error": True}
    except Exception as e:
        return {"content": f"[Error] {e}", "error": True}


def format_tps(result: dict) -> str:
    """Format tokens-per-second stats from Groq response."""
    output_tokens = result.get("eval_count", 0) or 0
    prompt_tokens = result.get("prompt_eval_count", 0) or 0
    total_time = result.get("total_time", 0) or 0

    if total_time > 0 and output_tokens > 0:
        output_tps = output_tokens / total_time
        return f" | {output_tps:.0f} tps ({output_tokens} out, {prompt_tokens} in)"
    elif output_tokens > 0:
        return f" | {output_tokens} out, {prompt_tokens} in"
    return ""


def accumulate_stats(stats: dict, result: dict):
    stats["output_tokens"] += result.get("eval_count", 0) or 0
    stats["prompt_tokens"] += result.get("prompt_eval_count", 0) or 0
    stats["total_time"] += result.get("total_time", 0) or 0


def gather_context(task: dict, workspace: str) -> str:
    parts, total = [], 0
    for fpath in task.get("files", []):
        full = os.path.join(workspace, fpath)
        try:
            with open(full, "r") as f:
                content = f.read()
            if total + len(content) > CONTEXT_CAP:
                break
            parts.append(f"--- {fpath} (existing) ---\n{content}\n--- END ---")
            total += len(content)
        except FileNotFoundError:
            parent = os.path.dirname(full)
            ext = os.path.splitext(fpath)[1]
            if os.path.isdir(parent) and ext:
                siblings = [s for s in os.listdir(parent) if s.endswith(ext)][:2]
                for sib in siblings:
                    try:
                        with open(os.path.join(parent, sib), "r") as f:
                            sc = f.read()[:2000]
                        rel = os.path.join(os.path.dirname(fpath), sib)
                        parts.append(f"--- {rel} (convention ref) ---\n{sc}\n--- END ---")
                    except Exception:
                        pass
        except Exception:
            pass
    return "\n\n".join(parts)


def gather_upstream(completed_results: dict, workspace: str) -> str:
    parts, total = [], 0
    for tid, written_files in completed_results.items():
        for fpath in written_files:
            full = os.path.join(workspace, fpath)
            try:
                with open(full, "r") as f:
                    content = f.read()
                if total + len(content) > UPSTREAM_CAP:
                    return "\n\n".join(parts)
                parts.append(f"--- {fpath} (from {tid}) ---\n{content}\n--- END ---")
                total += len(content)
            except Exception:
                pass
    return "\n\n".join(parts)


def parse_and_write_files(output: str, workspace: str, task: dict) -> list:
    written = []
    task_files = task.get("files", [])

    # Strategy 1: --- FILE: path --- ... --- END FILE ---
    for m in re.finditer(r"--- FILE: (.+?) ---\n([\s\S]*?)\n--- END FILE ---", output):
        fpath, code = m.group(1).strip(), m.group(2)
        resolved = _resolve_file(fpath, task_files, workspace)
        if resolved:
            _write_file(resolved, code, workspace, written)

    # Strategy 2: // file: path + ```fenced blocks```
    if not written:
        pattern = re.compile(
            r"(?:^|\n)[ \t]*(?://|#|<!--|---)?[ \t]*(?:file:|File:|FILE:)[ \t]*"
            r"([a-zA-Z0-9_./-]+\.[a-zA-Z0-9]+)[^\n]*\n"
            r"```[^\n]*\n([\s\S]*?)\n```",
            re.MULTILINE,
        )
        for m in pattern.finditer(output):
            fpath, code = m.group(1).strip(), m.group(2)
            resolved = _resolve_file(fpath, task_files, workspace)
            if resolved:
                _write_file(resolved, code, workspace, written)

    # Strategy 3: match ```blocks by position to task file list
    if not written and task_files:
        blocks = re.findall(r"```[^\n]*\n([\s\S]*?)\n```", output)
        for i, block in enumerate(blocks):
            if i < len(task_files):
                resolved = os.path.join(workspace, task_files[i])
                _write_file(resolved, block, workspace, written)

    return written


def _resolve_file(fpath: str, task_files: list, workspace: str) -> str:
    for tf in task_files:
        if fpath == tf or fpath.endswith(tf) or tf.endswith(fpath):
            return os.path.join(workspace, tf)
    if not fpath.startswith("/"):
        return os.path.join(workspace, fpath)
    return fpath


def _write_file(full_path: str, content: str, workspace: str, written: list):
    try:
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        with open(full_path, "w") as f:
            f.write(content)
        rel = os.path.relpath(full_path, workspace)
        written.append(rel)
        log(f"    Wrote: {rel} ({len(content)} chars)")
    except Exception as e:
        log(f"    Failed to write {full_path}: {e}")


# --- Command execution support ---

SHELL_MARKERS = [
    "#!/bin/bash", "set -e", "bunx create-next-app", "bun add ", "bun install",
    "bun i ", "bun i\n", "npm install", "npx ", 'echo "no" |', "cat >",
    "rm -f ", "rm -rf ", "mkdir -p", "cp /tmp/", "bunx npm-check-updates",
    "echo [task-", ">> ship.log", "python3 ", "kill $", "timeout ",
]


def is_command_task(task: dict) -> bool:
    action = task.get("action", "")
    if isinstance(action, list):
        action = "\n".join(action)
    marker_count = sum(1 for m in SHELL_MARKERS if m in action)
    return marker_count >= 2


def execute_commands(script: str, workspace: str, task_id: str) -> tuple:
    log(f"  {task_id}: executing shell commands...")
    try:
        result = subprocess.run(
            ["bash", "-c", script],
            cwd=workspace,
            capture_output=True,
            text=True,
            timeout=300,
            env={**os.environ, "HOME": os.path.expanduser("~")},
        )
        if result.stdout:
            tail = result.stdout[-600:]
            log(f"  {task_id} stdout (tail): {tail}")
        if result.returncode != 0 and result.stderr:
            log(f"  {task_id} stderr: {result.stderr[-400:]}")
        return result.stdout, result.stderr, result.returncode
    except subprocess.TimeoutExpired:
        log(f"  {task_id}: command timed out after 300s")
        return "", "Timeout after 300s", 1
    except Exception as e:
        log(f"  {task_id}: command execution failed: {e}")
        return "", str(e), 1


def extract_shell_blocks(text: str) -> list:
    blocks = []
    for m in re.finditer(r"```(?:bash|sh|shell)\n([\s\S]*?)\n```", text):
        blocks.append(m.group(1))
    for m in re.finditer(r"--- COMMAND ---\n([\s\S]*?)\n--- END COMMAND ---", text):
        blocks.append(m.group(1))
    return blocks


def build_prompt(task: dict, project_context: str, upstream_context: str) -> str:
    actions = task.get("action", [])
    if isinstance(actions, list):
        actions = "\n".join(f"  - {a}" for a in actions)
    files = ", ".join(task.get("files", []))
    verify = task.get("verify", "")
    done = task.get("done", "")

    prompt = "You are a stateless code generator. Output ONLY file content, no explanations.\n\n"
    if project_context:
        prompt += f"PROJECT CONTEXT (existing files for reference):\n{project_context}\n\n"
    if upstream_context:
        prompt += f"UPSTREAM (files from completed tasks):\n{upstream_context}\n\n"

    prompt += (
        f"TASK: {task['title']}\n"
        f"Description: {task['description']}\n"
        f"Steps:\n{actions}\n"
        f"Allowed files: {files}\n"
    )
    if done:
        prompt += f"Done when: {done}\n"
    if verify:
        prompt += f"Verify with: {verify}\n"

    prompt += (
        f"\nOutput each file using this EXACT format:\n"
        f"--- FILE: <relative-path> ---\n"
        f"<complete file content>\n"
        f"--- END FILE ---\n\n"
        f"If the task requires running shell commands, output them in a bash code block:\n"
        f"```bash\n<commands>\n```\n\n"
        f"Output ALL files listed above. No markdown, no commentary."
    )
    return prompt


def run_tasks():
    global is_running
    is_running = True
    workspace = os.environ.get("IRIS_WORKSPACE", os.getcwd())
    pending = {t["id"]: t for t in tasks_data if t.get("status") == "PENDING"}

    if not pending:
        log("No pending tasks found.")
        emit("run_completed", {"message": "No pending tasks"})
        is_running = False
        return

    log(f"Starting run: {len(pending)} pending task(s)")
    log(f"Workspace: {workspace}")
    log(f"Groq: {GROQ_HOST} | Model: {MODEL} | Key set: {bool(GROQ_API_KEY)}")
    try:
        ls = os.listdir(workspace)
        log(f"Workspace contents ({len(ls)}): {', '.join(ls[:15])}")
    except Exception as e:
        log(f"Cannot list workspace: {e}")

    emit("run_started", {"total": len(pending)})
    completed = set()
    completed_files = {}
    aggregate_stats = {"output_tokens": 0, "prompt_tokens": 0, "total_time": 0}
    run_start_time = time.time()

    def deps_met(task):
        return all(d in completed or d not in pending for d in task.get("dependsOn", []))

    def generate_for_task(task):
        tid = task["id"]
        action = task.get("action", "")
        if isinstance(action, list):
            action = "\n".join(action)

        if is_command_task(task):
            log(f"  {tid}: detected as COMMAND task — executing directly")
            stdout, stderr, rc = execute_commands(action, workspace, tid)
            return {"content": stdout, "is_command": True, "returncode": rc, "stderr": stderr}

        log(f"  {tid}: gathering context...")
        ctx = gather_context(task, workspace)
        upstream_results = {k: v for k, v in completed_files.items() if k in task.get("dependsOn", [])}
        upstream = gather_upstream(upstream_results, workspace)
        if ctx:
            log(f"  {tid}: project context {len(ctx)} chars")
        if upstream:
            log(f"  {tid}: upstream context {len(upstream)} chars")
        prompt = build_prompt(task, ctx, upstream)
        result = call_groq(prompt)
        result["is_command"] = False
        return result

    wave = 0
    while len(completed) < len(pending):
        ready = [t for tid, t in pending.items() if tid not in completed and deps_met(t)]
        if not ready:
            blocked = [tid for tid in pending if tid not in completed]
            log(f"BLOCKED: {blocked} — circular or unresolvable deps")
            for tid in blocked:
                pending[tid]["status"] = "FAILED"
                emit("task_failed", {"id": tid, "error": "Circular or unresolvable dependency"})
            save_tasks()
            break

        wave += 1
        wave_start = time.time()
        log(f"--- Wave {wave}: {len(ready)} task(s) ---")
        for t in ready:
            log(f"  > {t['id']}: {t['title']} ({len(t.get('files', []))} files)")
            t["status"] = "IN_PROGRESS"
            emit("task_started", {"id": t["id"]})
            notify_preview("task-status", {"id": t["id"], "status": "IN_PROGRESS"})

        with ThreadPoolExecutor(max_workers=min(4, len(ready))) as pool:
            futures = {pool.submit(generate_for_task, t): t for t in ready}
            for future in as_completed(futures):
                task = futures[future]
                tid = task["id"]
                try:
                    result = future.result()

                    if result.get("is_command"):
                        rc = result.get("returncode", 1)
                        if rc != 0:
                            stderr = result.get("stderr", "")
                            task["status"] = "FAILED"
                            task["output"] = stderr
                            log(f"FAILED {tid}: command exit {rc}")
                            emit("task_failed", {"id": tid, "error": stderr[:200]})
                            notify_preview("task-status", {"id": tid, "status": "FAILED"})
                        else:
                            task["output"] = result.get("content", "")
                            completed_files[tid] = task.get("files", [])
                            task["status"] = "DONE"
                            completed.add(tid)
                            log(f"DONE {tid} (command execution)")
                            emit("task_completed", {"id": tid})
                            notify_preview("task-status", {"id": tid, "status": "DONE"})
                        save_tasks()
                        continue

                    content = result.get("content", "")
                    if result.get("error") or content.startswith("[Error]") or content.startswith("[HTTP"):
                        task["status"] = "FAILED"
                        task["output"] = content
                        log(f"FAILED {tid}: {content[:150]}")
                        emit("task_failed", {"id": tid, "error": content[:200]})
                        notify_preview("task-status", {"id": tid, "status": "FAILED"})
                    else:
                        tps_info = format_tps(result)
                        accumulate_stats(aggregate_stats, result)
                        log(f"LLM done for {tid} ({len(content)} chars{tps_info}) — writing files...")
                        task["output"] = content
                        written = parse_and_write_files(content, workspace, task)
                        if not written:
                            log(f"  WARNING: no files extracted for {tid}")
                        else:
                            log(f"  Wrote {len(written)} file(s) for {tid}")

                        shell_blocks = extract_shell_blocks(content)
                        if shell_blocks:
                            combined_script = "\n".join(shell_blocks)
                            log(f"  {tid}: found {len(shell_blocks)} shell block(s) — executing...")
                            execute_commands(combined_script, workspace, tid)

                        completed_files[tid] = written
                        task["status"] = "DONE"
                        completed.add(tid)
                        log(f"DONE {tid}")
                        emit("task_completed", {"id": tid})
                        notify_preview("task-status", {"id": tid, "status": "DONE"})
                    save_tasks()
                except Exception as e:
                    task["status"] = "FAILED"
                    log(f"EXCEPTION {tid}: {e}")
                    emit("task_failed", {"id": tid, "error": str(e)[:200]})
                    save_tasks()

        wave_elapsed = time.time() - wave_start
        log(f"--- Wave {wave} completed in {wave_elapsed:.1f}s ---")

    # --- Final summary ---
    run_elapsed = time.time() - run_start_time
    total_output = aggregate_stats["output_tokens"]
    total_prompt = aggregate_stats["prompt_tokens"]
    total_tokens = total_output + total_prompt
    total_time = aggregate_stats["total_time"]

    output_tps = total_output / total_time if total_time > 0 else 0

    log(f"\n{'='*50}")
    log(f"Run complete: {len(completed)}/{len(pending)} tasks done in {run_elapsed:.1f}s")
    if total_tokens > 0:
        log(f"Tokens: {total_prompt:,} prompt + {total_output:,} output = {total_tokens:,} total")
        if output_tps > 0:
            log(f"TPS: {output_tps:.0f} output avg")
        if PRICE_INPUT > 0 or PRICE_OUTPUT > 0:
            cost = total_prompt * PRICE_INPUT + total_output * PRICE_OUTPUT
            log(f"Cost: ~${cost:.4f} (OpenRouter gpt-oss:120b)")
    log(f"{'='*50}")

    emit("run_completed", {
        "completed": len(completed),
        "total": len(pending),
        "elapsed": round(run_elapsed, 1),
        "tokens": total_tokens,
        "output_tps": round(output_tps, 0),
    })

    # Notify preview server to redirect to the real app
    notify_preview("redirect", {"url": "http://localhost:3000"})

    is_running = False

    if _server:
        threading.Timer(3.0, _server.shutdown).start()


class DashboardHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")

    def do_OPTIONS(self):
        self.send_response(200)
        self._cors()
        self.end_headers()

    def do_GET(self):
        if self.path == "/":
            self._serve_dashboard()
        elif self.path == "/api/tasks":
            self._serve_tasks()
        elif self.path == "/preview-url" or self.path == "/api/preview-url":
            self._serve_preview_url()
        elif self.path.startswith("/api/events"):
            self._serve_sse()
        elif self.path.startswith("/assets/"):
            self._serve_asset()
        else:
            self.send_error(404)

    def do_POST(self):
        if self.path == "/api/run":
            self._handle_run()
        else:
            self.send_error(404)

    def _serve_dashboard(self):
        # Prefer dashboard-v2, fall back to legacy
        path = DASHBOARD_PATH
        if not os.path.exists(path):
            path = DASHBOARD_LEGACY_PATH
        try:
            with open(path, "r") as f:
                html = f.read()
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self._cors()
            self.end_headers()
            self.wfile.write(html.encode())
        except FileNotFoundError:
            self.send_error(500, "dashboard.html not found")

    def _serve_asset(self):
        # Serve files from the skill's assets directory
        asset_name = self.path.split("/assets/", 1)[-1]
        asset_path = os.path.join(SCRIPT_DIR, "..", "assets", asset_name)
        asset_path = os.path.normpath(asset_path)
        if not os.path.isfile(asset_path):
            self.send_error(404, "Asset not found")
            return
        ext = os.path.splitext(asset_name)[1].lower()
        content_types = {
            ".mp3": "audio/mpeg", ".wav": "audio/wav", ".ogg": "audio/ogg",
            ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml",
            ".css": "text/css", ".js": "application/javascript",
        }
        ct = content_types.get(ext, "application/octet-stream")
        with open(asset_path, "rb") as f:
            data = f.read()
        self.send_response(200)
        self.send_header("Content-Type", ct)
        self.send_header("Content-Length", str(len(data)))
        self._cors()
        self.end_headers()
        self.wfile.write(data)

    def _serve_preview_url(self):
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self._cors()
        self.end_headers()
        self.wfile.write(json.dumps({"url": f"http://localhost:{PREVIEW_PORT}"}).encode())

    def _serve_tasks(self):
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self._cors()
        self.end_headers()
        safe = [{k: v for k, v in t.items() if k != "output"} for t in tasks_data]
        self.wfile.write(json.dumps(safe).encode())

    def _serve_sse(self):
        self.send_response(200)
        self.send_header("Content-Type", "text/event-stream")
        self.send_header("Cache-Control", "no-cache")
        self.send_header("Connection", "keep-alive")
        self._cors()
        self.end_headers()

        last_id = 0
        try:
            while True:
                with event_lock:
                    new_events = [(eid, ev) for eid, ev in event_log if eid > last_id]
                for eid, ev in new_events:
                    msg = f"id: {eid}\ndata: {json.dumps(ev)}\n\n"
                    self.wfile.write(msg.encode())
                    self.wfile.flush()
                    last_id = eid
                time.sleep(0.3)
        except (BrokenPipeError, ConnectionResetError):
            pass

    def _handle_run(self):
        global run_thread, is_running
        if is_running:
            self.send_response(409)
            self.send_header("Content-Type", "application/json")
            self._cors()
            self.end_headers()
            self.wfile.write(json.dumps({"error": "Already running"}).encode())
            return

        workspace = os.environ.get("IRIS_WORKSPACE", os.getcwd())
        print(f"\n{'='*60}")
        print(f"RUN triggered — workspace: {workspace}")
        print(f"  GROQ_HOST: {GROQ_HOST}")
        print(f"  GROQ_API_KEY set: {bool(GROQ_API_KEY)}")
        print(f"  MODEL: {MODEL}")
        print(f"  Tasks loaded: {len(tasks_data)}")
        pending = [t for t in tasks_data if t.get("status") == "PENDING"]
        print(f"  Pending tasks: {len(pending)}")
        for t in pending:
            deps = t.get("dependsOn", [])
            print(f"    {t['id']}: {t['title']} (files: {len(t.get('files', []))}, deps: {deps})")
        print(f"{'='*60}\n")

        run_thread = threading.Thread(target=run_tasks, daemon=True)
        run_thread.start()

        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self._cors()
        self.end_headers()
        self.wfile.write(json.dumps({"ok": True}).encode())


def load_tasks():
    global tasks_data
    workspace = os.environ.get("IRIS_WORKSPACE", os.getcwd())
    tasks_path = os.path.join(workspace, "tasks.json")

    if not GROQ_API_KEY:
        print("Error: GROQ_API_KEY not set in environment.")
        sys.exit(1)

    try:
        with open(tasks_path, "r") as f:
            data = json.load(f)
        tasks_data = data.get("tasks", [])
        print(f"Loaded {len(tasks_data)} tasks from {tasks_path}")
    except (FileNotFoundError, json.JSONDecodeError):
        # tasks.json not ready yet — start with empty list, poll later
        tasks_data = []
        print(f"[executor] tasks.json not ready — starting in intro mode, will poll...")


def poll_for_tasks():
    """Background thread that polls for tasks.json until it has tasks."""
    workspace = os.environ.get("IRIS_WORKSPACE", os.getcwd())
    tasks_path = os.path.join(workspace, "tasks.json")
    while not tasks_data:
        time.sleep(1)
        try:
            with open(tasks_path, "r") as f:
                data = json.load(f)
            loaded = data.get("tasks", [])
            if loaded:
                tasks_data.clear()
                tasks_data.extend(loaded)
                print(f"[executor] Loaded {len(tasks_data)} tasks from {tasks_path}")
                emit("tasks_loaded", {"count": len(tasks_data)})
                break
        except (FileNotFoundError, json.JSONDecodeError):
            pass


def save_tasks():
    workspace = os.environ.get("IRIS_WORKSPACE", os.getcwd())
    tasks_path = os.path.join(workspace, "tasks.json")
    clean = [{k: v for k, v in t.items() if k != "output"} for t in tasks_data]
    try:
        with open(tasks_path, "w") as f:
            json.dump({"tasks": clean}, f, indent=2)
    except Exception as e:
        log(f"Failed to save tasks.json: {e}")


def main():
    load_tasks()

    # Emit intro text if provided via env, and save to prompts.txt
    ship_prompt = os.environ.get("SHIP_PROMPT", "")
    if ship_prompt:
        emit("intro_text", {"text": ship_prompt})
        workspace = os.environ.get("IRIS_WORKSPACE", ".")
        try:
            prompts_path = os.path.join(workspace, "prompts.txt")
            with open(prompts_path, "a") as f:
                f.write(ship_prompt + "\n")
            log(f"Saved prompt to {prompts_path}")
        except Exception as e:
            log(f"Failed to save prompt: {e}")

    class ThreadedHTTPServer(ThreadingMixIn, HTTPServer):
        daemon_threads = True
        allow_reuse_address = True

    # Kill stale process on the port
    try:
        pids = subprocess.check_output(["lsof", "-ti", f":{PORT}"], text=True).strip().split()
        for pid in pids:
            try:
                os.kill(int(pid), 9)
            except (ProcessLookupError, ValueError):
                pass
        if pids:
            time.sleep(0.3)
    except Exception:
        pass

    global _server
    server = ThreadedHTTPServer(("127.0.0.1", PORT), DashboardHandler)
    _server = server
    print(f"Dashboard: http://localhost:{PORT}")

    # If no tasks yet, start polling in background
    if not tasks_data:
        threading.Thread(target=poll_for_tasks, daemon=True).start()

    threading.Timer(0.5, lambda: webbrowser.open(f"http://localhost:{PORT}")).start()

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down.")
        server.shutdown()


if __name__ == "__main__":
    main()
