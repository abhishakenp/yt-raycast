#!/usr/bin/env python3

"""
Agentic TypeScript Fix Loop — Morph Strategy + Tool-Calling Pattern

Instead of fixing files one-by-one with full rewrites:
1. Run tsc --noEmit to collect ALL errors (not stopping at first)
2. Send ALL errors + ALL errored file contents to Groq in ONE call
3. Groq returns morph patches via write_file tool calls (one per file)
4. Apply ALL patches at once (one wave)
5. Re-run tsc, check convergence (error count must decrease)
6. Repeat until zero errors or max waves

Used in /ship Phase 4B (final task verification)
"""

import subprocess
import json
import sys
import re
import os
import time
import threading

# Add scripts dir to path for memory import
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from memory import (
    build_context_prompt, recall, record_memory_hit,
    run_retrospective
)

MAX_WAVES = 10
STALL_TOLERANCE = 2  # bail after N waves with no improvement
PROJECT_ROOT = sys.argv[1] if len(sys.argv) > 1 else "."

GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
if not GROQ_API_KEY:
    print("ERROR: GROQ_API_KEY not set")
    sys.exit(1)

os.chdir(PROJECT_ROOT)

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "write_file",
            "description": "Write fixed content to a file. Use morph patches — only include changed sections with '// ... existing code ...' markers for unchanged parts. For small files (<80 lines), you may include the complete file.",
            "parameters": {
                "type": "object",
                "properties": {
                    "file_path": {
                        "type": "string",
                        "description": "Relative path to the file (e.g. src/components/button.tsx)"
                    },
                    "content": {
                        "type": "string",
                        "description": "The complete fixed file content"
                    }
                },
                "required": ["file_path", "content"]
            }
        }
    }
]


def run_tsc():
    """Run tsc --noEmit and return (error_count, error_lines, errors_by_file)."""
    result = subprocess.run(
        ["bunx", "tsc", "--noEmit"],
        capture_output=True, text=True, cwd="."
    )
    output = result.stdout + result.stderr

    error_lines = [
        line for line in output.split("\n")
        if "error TS" in line and ".next/types" not in line
    ]

    errors_by_file = {}
    for line in error_lines:
        match = re.match(r"^([^(:\s]+)", line)
        if match:
            fp = match.group(1)
            if os.path.isfile(fp):
                errors_by_file.setdefault(fp, []).append(line)

    return len(error_lines), error_lines, errors_by_file


def read_file(path):
    """Read file content, return empty string on failure."""
    try:
        with open(path, "r") as f:
            return f.read()
    except Exception:
        return ""


def strip_markdown_fences(text):
    """Remove markdown code fences if present."""
    text = text.strip()
    if text.startswith("```"):
        lines = text.split("\n")
        lines = lines[1:]  # remove opening fence
        if lines and lines[-1].strip().startswith("```"):
            lines = lines[:-1]
        return "\n".join(lines)
    return text


def call_groq(messages, use_tools=True):
    """Call Groq API with tool-calling support. Returns the response message."""
    payload = {
        "model": "openai/gpt-oss-120b",
        "messages": messages,
        "temperature": 0.15,
        "max_tokens": 16000,
    }
    if use_tools:
        payload["tools"] = TOOLS
        payload["tool_choice"] = "auto"

    try:
        resp = subprocess.run(
            ["curl", "-s", "https://api.groq.com/openai/v1/chat/completions",
             "-H", f"Authorization: Bearer {GROQ_API_KEY}",
             "-H", "Content-Type: application/json",
             "-d", json.dumps(payload)],
            capture_output=True, text=True, timeout=120
        )
        data = json.loads(resp.stdout)

        if "error" in data:
            print(f"  Groq API error: {data['error']}")
            return None

        return data["choices"][0]["message"]

    except subprocess.TimeoutExpired:
        print("  Groq call timed out")
        return None
    except (json.JSONDecodeError, KeyError, IndexError) as e:
        print(f"  Failed to parse Groq response: {e}")
        return None


def execute_tool_call(tool_call):
    """Execute a write_file tool call. Returns (file_path, success)."""
    try:
        fn = tool_call["function"]
        args = json.loads(fn["arguments"]) if isinstance(fn["arguments"], str) else fn["arguments"]
        file_path = args["file_path"]
        content = strip_markdown_fences(args["content"])

        with open(file_path, "w") as f:
            f.write(content)

        return file_path, True
    except Exception as e:
        return args.get("file_path", "unknown"), False


def build_fix_prompt(errors_by_file):
    """Build the user prompt with all errors and file contents."""
    parts = ["TypeScript compilation found errors in the following files. Fix ALL errors across ALL files.\n"]
    parts.append("ERRORS:\n")

    all_errors = []
    for fp, errs in sorted(errors_by_file.items()):
        all_errors.extend(errs)
    parts.append("\n".join(all_errors))

    parts.append("\n\nFILE CONTENTS:\n")
    for fp in sorted(errors_by_file.keys()):
        content = read_file(fp)
        if content:
            parts.append(f"--- {fp} ---\n{content}\n")

    parts.append("\nFix ALL errors by calling write_file for each file that needs changes.")
    parts.append("For each file, output the COMPLETE fixed file content (all imports, all code).")
    parts.append("Fix every error — missing imports, type mismatches, missing 'use client', wrong paths.")
    parts.append("Do NOT skip any file. Do NOT leave any error unfixed.")

    return "\n".join(parts)


def run_agentic_wave(errors_by_file, wave_num):
    """
    Run one agentic wave: send all errors to Groq, let it call write_file
    for each fix via tool calling loop. Returns (files_patched, files_changed_list).
    """
    print(f"\n  Sending {len(errors_by_file)} files to Groq for morph fixes...")

    # Memory: recall past fixes for similar errors
    all_error_lines = []
    for errs in errors_by_file.values():
        all_error_lines.extend(errs)

    memory_context = build_context_prompt(all_error_lines)
    matches = recall(all_error_lines, top_k=3)
    record_memory_hit(len(matches))

    if memory_context:
        print(f"  [memory] Injecting context from {len(matches)} similar past fixes")

    system_content = (
        "You are an expert TypeScript fixer. You receive tsc compilation errors and file contents. "
        "Fix ALL errors by calling the write_file tool for each file that needs changes. "
        "Output the COMPLETE fixed file content for each file. "
        "Common fixes: add 'use client' directive, fix import paths (@/ alias), add missing types, "
        "fix parameter types, add missing exports. "
        "Call write_file once per file. Fix all files in one pass."
    )

    if memory_context:
        system_content += f"\n\n{memory_context}"

    messages = [
        {"role": "system", "content": system_content},
        {"role": "user", "content": build_fix_prompt(errors_by_file)}
    ]

    files_patched = 0
    files_changed = []
    iterations = 0
    max_inner_iterations = 5  # inner loop for multi-turn tool calling

    while iterations < max_inner_iterations:
        iterations += 1
        response_msg = call_groq(messages)

        if response_msg is None:
            print("  Groq call failed, falling back...")
            break

        # Add assistant message to history
        messages.append(response_msg)

        # Check for tool calls
        tool_calls = response_msg.get("tool_calls", [])

        if not tool_calls:
            # No more tool calls — LLM is done
            # Check if there's content that might contain file fixes (fallback parsing)
            content = response_msg.get("content", "")
            if content and "```" in content:
                files_patched += parse_fallback_fixes(content, errors_by_file)
            break

        # Execute all tool calls
        for tc in tool_calls:
            if tc["function"]["name"] == "write_file":
                fp, success = execute_tool_call(tc)
                status = "ok" if success else "FAILED"
                print(f"    [{status}] {fp}")
                if success:
                    files_patched += 1
                    files_changed.append(fp)

                # Add tool result to messages
                messages.append({
                    "role": "tool",
                    "tool_call_id": tc["id"],
                    "content": json.dumps({"status": status, "file": fp})
                })

    return files_patched, files_changed


def parse_fallback_fixes(content, errors_by_file):
    """
    Fallback: if Groq doesn't use tool calls, try to parse file fixes
    from markdown code blocks in the response content.
    Pattern: ```tsx\n// File: path\n...code...\n```
    """
    patched = 0
    # Match patterns like "File: src/components/foo.tsx" followed by code blocks
    blocks = re.split(r"(?:^|\n)(?:#{1,3}\s+)?(?:File:\s*|`)?([^\n`]+\.tsx?)(?:`)?[\s]*\n```(?:tsx?|typescript|jsx?)?\n", content)

    if len(blocks) < 3:
        # Try simpler pattern: just extract all code blocks and match to error files
        code_blocks = re.findall(r"```(?:tsx?|typescript|jsx?)?\n(.*?)```", content, re.DOTALL)
        error_files = sorted(errors_by_file.keys())

        for i, (block, fp) in enumerate(zip(code_blocks, error_files)):
            try:
                with open(fp, "w") as f:
                    f.write(block.strip())
                print(f"    [fallback] {fp}")
                patched += 1
            except Exception:
                pass
        return patched

    # Parse matched file-block pairs
    for i in range(1, len(blocks) - 1, 2):
        fp = blocks[i].strip()
        code = blocks[i + 1].split("```")[0].strip()
        if os.path.isfile(fp) and code:
            try:
                with open(fp, "w") as f:
                    f.write(code)
                print(f"    [fallback] {fp}")
                patched += 1
            except Exception:
                pass

    return patched


# =============================================================================
# Main loop
# =============================================================================

print(f"Starting agentic TypeScript fix loop (max {MAX_WAVES} waves)...")
print(f"Strategy: morph — collect all errors, fix all files per wave\n")

prev_error_count = float("inf")
stall_count = 0
start_time = time.time()
all_files_changed = []
initial_errors = None
waves_completed = 0

for wave in range(1, MAX_WAVES + 1):
    print(f"[Wave {wave}/{MAX_WAVES}] Running tsc --noEmit...")

    error_count, error_lines, errors_by_file = run_tsc()

    # Capture initial errors for retrospective
    if initial_errors is None:
        initial_errors = error_lines[:]

    if error_count == 0:
        elapsed = time.time() - start_time
        print(f"\nZero TypeScript errors — compilation successful ({elapsed:.1f}s, {wave - 1} fix waves)")

        # Background retrospective
        threading.Thread(
            target=run_retrospective,
            args=(initial_errors, [], all_files_changed, wave - 1, elapsed),
            daemon=True,
        ).start()
        time.sleep(0.5)  # give retrospective a moment to write

        sys.exit(0)

    print(f"  Found {error_count} errors across {len(errors_by_file)} files")
    for line in error_lines[:5]:
        print(f"    {line}")
    if error_count > 5:
        print(f"    ... and {error_count - 5} more")

    # Convergence check
    if error_count >= prev_error_count:
        stall_count += 1
        print(f"  Stall detected ({stall_count}/{STALL_TOLERANCE}) — errors not decreasing ({prev_error_count} -> {error_count})")
        if stall_count >= STALL_TOLERANCE:
            print(f"\n  Bailing after {stall_count} stalled waves. Remaining errors need manual fix.")
            break
    else:
        stall_count = 0
        if prev_error_count != float("inf"):
            print(f"  Progress: {prev_error_count} -> {error_count} errors (-{prev_error_count - error_count})")

    prev_error_count = error_count

    # Run one agentic wave
    files_patched, wave_files = run_agentic_wave(errors_by_file, wave)
    all_files_changed.extend(wave_files)
    waves_completed = wave
    print(f"  Wave {wave} complete: patched {files_patched} files")

    if files_patched == 0:
        print("  No files patched — cannot make progress, bailing.")
        break

# Final check
elapsed = time.time() - start_time
error_count, error_lines, _ = run_tsc()

# Always run retrospective (background, non-blocking)
threading.Thread(
    target=run_retrospective,
    args=(initial_errors or [], error_lines, all_files_changed, waves_completed, elapsed),
    daemon=True,
).start()
time.sleep(0.5)  # give retrospective a moment to write

if error_count == 0:
    print(f"\nZero TypeScript errors — compilation successful ({elapsed:.1f}s)")
    sys.exit(0)
else:
    print(f"\n{error_count} TypeScript errors remain after {MAX_WAVES} waves ({elapsed:.1f}s)")
    for line in error_lines[:20]:
        print(f"  {line}")
    sys.exit(1)
