import os
import sys
import json
import time
import subprocess
from pathlib import Path

EXECUTOR_PORT = 7420
PREVIEW_PORT = 3000
SCRIPT_DIR = Path(__file__).parent.resolve()

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

def post_status(status: str, phase: str):
    max_attempts = 5 if phase == "homepage_ready" else 1
    for attempt in range(max_attempts):
        try:
            r = subprocess.run(
                ["curl", "-s", "-o", "/dev/null", "-w", "%{http_code}",
                 "-X", "POST", f"http://localhost:{EXECUTOR_PORT}/api/status",
                 "-H", "Content-Type: application/json",
                 "-d", json.dumps({"status": status, "phase": phase})],
                capture_output=True, text=True, timeout=5
            )
            if r.returncode == 0 and r.stdout.strip() == "200":
                return
        except Exception:
            pass
        if attempt < max_attempts - 1:
            time.sleep(1)
    if max_attempts > 1:
        print(f"  WARNING: failed to post {phase} to executor after {max_attempts} attempts")

def wait_executor_has_tasks(timeout: int = 30):
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

def reload_executor():
    try:
        r = subprocess.run(
            ["curl", "-s", "-X", "POST", f"http://localhost:{EXECUTOR_PORT}/api/reload",
             "-H", "Content-Type: application/json", "-d", "{}"],
            capture_output=True, text=True, timeout=5
        )
        if r.returncode == 0:
            print(f"  executor: reloaded — {r.stdout.strip()}")
    except Exception as e:
        print(f"  WARNING: reload_executor failed: {e}")

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

def start_executor(workspace: str, prompt: str, children_list: list) -> subprocess.Popen:
    try:
        r = subprocess.run(
            ["curl", "-s", f"http://localhost:{EXECUTOR_PORT}/api/tasks"],
            capture_output=True, timeout=2
        )
        if r.returncode == 0:
            print(f"  executor already running on :{EXECUTOR_PORT}")
            return None
    except Exception:
        pass

    kill_port(EXECUTOR_PORT)
    env = {**os.environ, "IRIS_WORKSPACE": workspace, "SHIP_PROMPT": prompt, "SHIP_NO_BROWSER": "1"}
    p = subprocess.Popen(
        [sys.executable, str(SCRIPT_DIR / "executor.py")],
        env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL
    )
    children_list.append(p)
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

def start_http_server(workspace: str, children_list: list) -> subprocess.Popen:
    kill_port(PREVIEW_PORT)
    p = subprocess.Popen(
        [sys.executable, "-m", "http.server", str(PREVIEW_PORT), "--directory", workspace],
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL
    )
    children_list.append(p)
    return p
