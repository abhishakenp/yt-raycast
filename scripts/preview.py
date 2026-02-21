#!/usr/bin/env python3
"""
Ship Preview — Instant HTML preview generator + server.
Generates a self-contained HTML page using the design system tokens via Groq,
then serves it on port 7421 with SSE for phase/task updates.

Usage:
    PREVIEW_DESC="<description>" PREVIEW_DESIGN="<MASTER.md content>" python3 preview.py

Environment:
    PREVIEW_DESC    — user's app description (required)
    PREVIEW_DESIGN  — design system MASTER.md content (required)
    GROQ_API_KEY    — Groq API key (required)
    GROQ_HOST       — Groq API base URL (default: https://api.groq.com)
    GROQ_MODEL      — model name (default: openai/gpt-oss-120b)
"""
import json
import os
import subprocess
import sys
import threading
import time
import urllib.error
import urllib.request
from http.server import BaseHTTPRequestHandler, HTTPServer
from socketserver import ThreadingMixIn

PORT = 7421
GROQ_HOST = os.environ.get("GROQ_HOST", "https://api.groq.com")
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
MODEL = os.environ.get("GROQ_MODEL", "openai/gpt-oss-120b")

# --- State ---
generated_html = ""
html_ready = threading.Event()
phase_data = {"phase": "generating", "message": "Generating preview..."}
task_list = []
task_status = {}
redirect_url = ""
sse_clients = []
sse_lock = threading.Lock()
event_counter = 0
event_log = []
_server = None


def emit_sse(event_type: str, data: dict):
    global event_counter
    with sse_lock:
        event_counter += 1
        event_log.append((event_counter, {"type": event_type, **data}))


def call_groq(prompt: str, system: str = "") -> str:
    url = f"{GROQ_HOST.rstrip('/')}/openai/v1/chat/completions"
    messages = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})
    payload = json.dumps({
        "model": MODEL,
        "messages": messages,
        "temperature": 0.4,
        "max_tokens": 12000,
        "stream": False,
    })
    try:
        result = subprocess.run(
            ["curl", "-s", url,
             "-H", f"Authorization: Bearer {GROQ_API_KEY}",
             "-H", "Content-Type: application/json",
             "-d", payload],
            capture_output=True, text=True, timeout=120
        )
        data = json.loads(result.stdout)
        return data.get("choices", [{}])[0].get("message", {}).get("content", "")
    except Exception as e:
        print(f"[preview] Groq error: {e}")
        return ""


def generate_preview(description: str, design_system: str):
    global generated_html
    print("[preview] Generating HTML preview via Groq...")
    start = time.time()

    system_prompt = """You are a UI preview generator. Generate a SINGLE self-contained HTML page that looks like the final app.
Rules:
- Output ONLY the HTML — no markdown fences, no explanation
- Must be a complete <!DOCTYPE html> page with inline <style> and inline JS if needed
- Use the EXACT color tokens from the design system
- Make it look polished: gradients, shadows, rounded corners, proper spacing
- Use placeholder/mocked content that matches the app description
- Responsive layout, centered content
- Import Google Fonts if needed (Inter is a good default)
- Add subtle CSS animations for visual polish (fade-ins, hover effects)
- The page should represent the MAIN view of the app
- Include a header/nav area, the main content area, and any relevant UI elements
- NO external dependencies besides Google Fonts
- Make it look PRODUCTION READY, not a wireframe"""

    user_prompt = f"""App Description:
{description}

Design System:
{design_system}

Generate a beautiful, self-contained HTML preview page for this app using the exact design tokens above.
The preview should look like the real app's main page with mocked data."""

    html = call_groq(user_prompt, system_prompt)

    # Strip markdown fences if present
    if html.startswith("```"):
        lines = html.split("\n")
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        html = "\n".join(lines)

    if not html.strip().startswith("<!DOCTYPE") and not html.strip().startswith("<html"):
        # Try to find HTML in the response
        start_idx = html.find("<!DOCTYPE")
        if start_idx == -1:
            start_idx = html.find("<html")
        if start_idx >= 0:
            html = html[start_idx:]

    elapsed = time.time() - start
    print(f"[preview] HTML generated in {elapsed:.1f}s ({len(html)} chars)")

    generated_html = html
    html_ready.set()
    emit_sse("preview_ready", {"chars": len(html)})


class PreviewHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def do_OPTIONS(self):
        self.send_response(200)
        self._cors()
        self.end_headers()

    def do_GET(self):
        if self.path == "/":
            self._serve_preview()
        elif self.path == "/api/progress":
            self._serve_sse()
        elif self.path == "/api/status":
            self._serve_status()
        elif self.path == "/health":
            self.send_response(200)
            self._cors()
            self.end_headers()
            self.wfile.write(b"ok")
        else:
            self.send_error(404)

    def do_POST(self):
        content_len = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_len) if content_len > 0 else b""

        if self.path == "/api/phase":
            self._handle_phase(body)
        elif self.path == "/api/tasks":
            self._handle_tasks(body)
        elif self.path == "/api/task-status":
            self._handle_task_status(body)
        elif self.path == "/api/redirect":
            self._handle_redirect(body)
        elif self.path == "/api/shutdown":
            self._handle_shutdown()
        else:
            self.send_error(404)

    def _serve_preview(self):
        html_ready.wait(timeout=60)
        html = generated_html or "<html><body><h1>Generating preview...</h1></body></html>"
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self._cors()
        self.end_headers()
        self.wfile.write(html.encode())

    def _serve_status(self):
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self._cors()
        self.end_headers()
        self.wfile.write(json.dumps({
            "phase": phase_data,
            "tasks": task_list,
            "taskStatus": task_status,
            "redirect": redirect_url,
        }).encode())

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
                with sse_lock:
                    new_events = [(eid, ev) for eid, ev in event_log if eid > last_id]
                for eid, ev in new_events:
                    msg = f"id: {eid}\ndata: {json.dumps(ev)}\n\n"
                    self.wfile.write(msg.encode())
                    self.wfile.flush()
                    last_id = eid
                time.sleep(0.3)
        except (BrokenPipeError, ConnectionResetError):
            pass

    def _handle_phase(self, body):
        global phase_data
        try:
            phase_data = json.loads(body)
            emit_sse("phase", phase_data)
        except Exception:
            pass
        self.send_response(200)
        self._cors()
        self.end_headers()
        self.wfile.write(b'{"ok":true}')

    def _handle_tasks(self, body):
        global task_list
        try:
            data = json.loads(body)
            task_list = data.get("tasks", data) if isinstance(data, dict) else data
            emit_sse("tasks", {"tasks": task_list})
        except Exception:
            pass
        self.send_response(200)
        self._cors()
        self.end_headers()
        self.wfile.write(b'{"ok":true}')

    def _handle_task_status(self, body):
        try:
            data = json.loads(body)
            tid = data.get("id", "")
            status = data.get("status", "")
            task_status[tid] = status
            emit_sse("task_status", {"id": tid, "status": status})
        except Exception:
            pass
        self.send_response(200)
        self._cors()
        self.end_headers()
        self.wfile.write(b'{"ok":true}')

    def _handle_redirect(self, body):
        global redirect_url
        try:
            data = json.loads(body)
            redirect_url = data.get("url", "http://localhost:3000")
        except Exception:
            redirect_url = "http://localhost:3000"
        emit_sse("redirect", {"url": redirect_url})
        self.send_response(200)
        self._cors()
        self.end_headers()
        self.wfile.write(b'{"ok":true}')

    def _handle_shutdown(self):
        self.send_response(200)
        self._cors()
        self.end_headers()
        self.wfile.write(b'{"ok":true}')
        if _server:
            threading.Timer(1.0, _server.shutdown).start()


def main():
    global _server

    description = os.environ.get("PREVIEW_DESC", "")
    design_system = os.environ.get("PREVIEW_DESIGN", "")

    if not description:
        print("[preview] Error: PREVIEW_DESC not set")
        sys.exit(1)
    if not GROQ_API_KEY:
        print("[preview] Error: GROQ_API_KEY not set")
        sys.exit(1)

    # Kill stale process on port
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

    # Start HTML generation in background
    gen_thread = threading.Thread(target=generate_preview, args=(description, design_system), daemon=True)
    gen_thread.start()

    class ThreadedHTTPServer(ThreadingMixIn, HTTPServer):
        daemon_threads = True
        allow_reuse_address = True

    server = ThreadedHTTPServer(("127.0.0.1", PORT), PreviewHandler)
    _server = server
    print(f"[preview] Server: http://localhost:{PORT}")

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[preview] Shutting down.")
        server.shutdown()


if __name__ == "__main__":
    main()
