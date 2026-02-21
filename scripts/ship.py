#!/usr/bin/env python3
"""
ship.py — Deterministic orchestrator for the ship-fast pipeline.
"""

import atexit
import json
import os
import signal
import sys
import time
from pathlib import Path

# Add script directory to path to ensure local imports work
SCRIPT_DIR = Path(__file__).parent.resolve()
sys.path.append(str(SCRIPT_DIR))

from timing import Timer
from llm_client import GROQ_API_KEY 
from executor_utils import (
    reload_executor, trigger_run, post_status, 
    EXECUTOR_PORT, PREVIEW_PORT
)
from phases import (
    detect_resume_phase, phase0_setup, phase1_verify, 
    phase2_homepage, phase3_tasks, phase4_wait, 
    phase5_fix, phase6_report
)

# ── Subprocess tracking ──────────────────────────────────────────────────────

_children = []

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

# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    if not GROQ_API_KEY:
        print("Error: GROQ_API_KEY not set.")
        sys.exit(1)

    workspace = os.getcwd()
    timer = Timer()

    # Determine prompt from prompt.txt
    prompt_path = Path(workspace) / "prompt.txt"
    if prompt_path.exists():
        prompt = prompt_path.read_text().strip()
    else:
        print("No prompt.txt found. Run /ship-fast first.")
        sys.exit(1)

    # Detect resume phase
    start_phase = detect_resume_phase(workspace)
    if start_phase > 0:
        print(f"Resuming from phase {start_phase} (existing artifacts detected)")

    # Execute phases
    if start_phase <= 0:
        phase0_setup(workspace, prompt, timer, _children)

    if start_phase <= 1:
        if start_phase == 1:
            phase0_setup(workspace, prompt, timer, _children)
        phase1_verify(workspace, prompt, timer)

    if start_phase <= 2:
        if start_phase == 2:
            phase0_setup(workspace, prompt, timer, _children)
        phase2_homepage(workspace, timer, _children)

    if start_phase <= 3:
        if start_phase == 3:
            phase0_setup(workspace, prompt, timer, _children)
        phase3_tasks(workspace, prompt, timer)

    if start_phase <= 4:
        if start_phase == 4:
            phase0_setup(workspace, prompt, timer, _children)
            if (Path(workspace) / "index.html").exists():
                post_status("Homepage ready", "homepage_ready")
            
            tasks_path = Path(workspace) / "tasks.json"
            if tasks_path.exists():
                try:
                    data = json.loads(tasks_path.read_text())
                    for t in data.get("tasks", []):
                        status = t.get("status", "").upper()
                        if status not in ("DONE", "FAILED", "PENDING", "IN_PROGRESS"):
                            t["status"] = "PENDING"
                    tasks_path.write_text(json.dumps(data, indent=2))
                except:
                    pass
            reload_executor()
            time.sleep(0.5)
            trigger_run()
        phase4_wait(workspace, timer)

    if start_phase <= 5:
        phase5_fix(workspace, timer)

    phase6_report(timer)

if __name__ == "__main__":
    main()
