#!/usr/bin/env python3

"""
Ship Memory Engine — Self-Improving Error Intelligence

3-layer architecture:
  Layer 1: Error Bank     — raw error→fix pairs, fingerprinted, deduped
  Layer 2: Patterns       — LLM-compressed high-level rules extracted from bank
  Layer 3: Fix Strategies — meta-learning: which approaches work for which errors

No external dependencies. Uses:
  - N-gram Jaccard similarity for dedup (fast, pure Python)
  - Groq LLM for periodic compression (already in pipeline)
  - JSON storage with auto-compaction
"""

import json
import os
import hashlib
import re
import time
import subprocess
from collections import Counter
from pathlib import Path
from typing import Optional

MEMORY_DIR = Path(__file__).parent.parent / "memory"
ERRORS_FILE = MEMORY_DIR / "errors.json"
PATTERNS_FILE = MEMORY_DIR / "patterns.json"
STATS_FILE = MEMORY_DIR / "stats.json"

MAX_BANK_SIZE = 150       # trigger compaction above this
COMPACT_TARGET = 80       # compact down to this many entries
SIMILARITY_THRESHOLD = 0.6  # Jaccard threshold for "same error"
PATTERN_EXTRACT_EVERY = 5   # extract patterns every N runs
NGRAM_SIZE = 3


# =============================================================================
# Fingerprinting & Similarity (pure Python, no deps)
# =============================================================================

def tokenize_error(error_line: str) -> set[str]:
    """Extract meaningful tokens from a TS error line."""
    # Remove file paths but keep the error code and message
    # e.g. "src/foo.tsx(12,5): error TS2307: Cannot find module '@/lib/utils'"
    # → {"TS2307", "cannot", "find", "module", "@/lib/utils"}

    # Extract TS error code
    codes = set(re.findall(r"TS\d+", error_line))

    # Extract the message part (after the error code)
    msg_match = re.search(r"error TS\d+:\s*(.+)", error_line)
    msg = msg_match.group(1) if msg_match else error_line

    # Tokenize: split on non-alphanumeric, lowercase, filter short
    words = set(re.findall(r"[a-zA-Z_@/]{2,}", msg.lower()))

    return codes | words


def ngrams(tokens: set[str], n: int = NGRAM_SIZE) -> set[str]:
    """Generate character n-grams from a set of tokens for finer similarity."""
    grams = set()
    for token in tokens:
        for i in range(len(token) - n + 1):
            grams.add(token[i:i + n])
    return grams


def fingerprint(error_lines: list[str]) -> str:
    """Create a stable hash fingerprint from error lines."""
    # Sort and deduplicate error codes + key tokens
    all_tokens = set()
    for line in error_lines:
        all_tokens |= tokenize_error(line)

    canonical = "|".join(sorted(all_tokens))
    return hashlib.sha256(canonical.encode()).hexdigest()[:16]


def similarity(errors_a: list[str], errors_b: list[str]) -> float:
    """Jaccard similarity on n-grams of error tokens. 0.0 to 1.0."""
    tokens_a = set()
    tokens_b = set()
    for line in errors_a:
        tokens_a |= tokenize_error(line)
    for line in errors_b:
        tokens_b |= tokenize_error(line)

    grams_a = ngrams(tokens_a)
    grams_b = ngrams(tokens_b)

    if not grams_a or not grams_b:
        return 0.0

    intersection = grams_a & grams_b
    union = grams_a | grams_b
    return len(intersection) / len(union)


def categorize_error(error_line: str) -> str:
    """Auto-categorize a TS error into a bucket."""
    code_match = re.search(r"TS(\d+)", error_line)
    if not code_match:
        return "unknown"

    code = int(code_match.group(1))

    categories = {
        range(1000, 1999): "syntax",
        range(2000, 2099): "declaration",
        range(2300, 2400): "duplicate",
        range(2304, 2320): "import",       # Cannot find name/module
        range(2322, 2323): "type_mismatch",
        range(2339, 2340): "property",      # Property does not exist
        range(2345, 2346): "argument",      # Argument of type X not assignable
        range(2551, 2552): "suggestion",    # Did you mean...
        range(2700, 2800): "module",
        range(6000, 6200): "config",
        range(7000, 7100): "implicit_any",
        range(17000, 17100): "jsx",
        range(18000, 18100): "feature",     # Newer TS features
    }

    for code_range, category in categories.items():
        if code in code_range:
            return category

    return "other"


# =============================================================================
# Storage Layer
# =============================================================================

def _ensure_dir():
    MEMORY_DIR.mkdir(parents=True, exist_ok=True)


def load_errors() -> list[dict]:
    _ensure_dir()
    if ERRORS_FILE.exists():
        try:
            return json.loads(ERRORS_FILE.read_text())
        except (json.JSONDecodeError, IOError):
            return []
    return []


def save_errors(entries: list[dict]):
    _ensure_dir()
    ERRORS_FILE.write_text(json.dumps(entries, indent=2, default=str))


def load_patterns() -> list[dict]:
    _ensure_dir()
    if PATTERNS_FILE.exists():
        try:
            return json.loads(PATTERNS_FILE.read_text())
        except (json.JSONDecodeError, IOError):
            return []
    return []


def save_patterns(patterns: list[dict]):
    _ensure_dir()
    PATTERNS_FILE.write_text(json.dumps(patterns, indent=2, default=str))


def load_stats() -> dict:
    _ensure_dir()
    if STATS_FILE.exists():
        try:
            return json.loads(STATS_FILE.read_text())
        except (json.JSONDecodeError, IOError):
            pass
    return {
        "total_runs": 0,
        "total_errors_seen": 0,
        "total_errors_fixed": 0,
        "memory_hits": 0,
        "memory_misses": 0,
        "last_compaction": None,
        "last_pattern_extraction": None,
    }


def save_stats(stats: dict):
    _ensure_dir()
    STATS_FILE.write_text(json.dumps(stats, indent=2, default=str))


# =============================================================================
# Core Memory Operations
# =============================================================================

def recall(current_errors: list[str], top_k: int = 5) -> list[dict]:
    """
    Search memory for similar past errors. Returns top-K matches
    with their known fixes, sorted by relevance (similarity * confidence).
    """
    bank = load_errors()
    if not bank:
        return []

    scored = []
    for entry in bank:
        sim = similarity(current_errors, entry.get("error_lines", []))
        if sim >= SIMILARITY_THRESHOLD * 0.7:  # slightly lower threshold for recall
            confidence = entry.get("success_rate", 0.5) * entry.get("frequency", 1)
            score = sim * (1 + confidence * 0.1)
            scored.append((score, sim, entry))

    scored.sort(key=lambda x: x[0], reverse=True)

    results = []
    for score, sim, entry in scored[:top_k]:
        results.append({
            **entry,
            "_similarity": round(sim, 3),
            "_score": round(score, 3),
        })

    return results


def remember(
    error_lines: list[str],
    fix_description: str,
    files_changed: list[str],
    success: bool = True,
):
    """
    Store an error→fix pair in memory. Deduplicates against existing entries
    using n-gram Jaccard similarity.
    """
    bank = load_errors()
    fp = fingerprint(error_lines)

    # Check for exact fingerprint match
    for entry in bank:
        if entry["fingerprint"] == fp:
            # Update existing entry
            entry["frequency"] = entry.get("frequency", 1) + 1
            entry["last_seen"] = time.strftime("%Y-%m-%d")
            if success:
                total = entry.get("frequency", 1)
                old_rate = entry.get("success_rate", 0.5)
                entry["success_rate"] = round(old_rate + (1.0 - old_rate) / total, 3)
            save_errors(bank)
            return "updated"

    # Check for similar entries (dedup)
    for entry in bank:
        sim = similarity(error_lines, entry.get("error_lines", []))
        if sim >= SIMILARITY_THRESHOLD:
            # Merge into existing entry
            entry["frequency"] = entry.get("frequency", 1) + 1
            entry["last_seen"] = time.strftime("%Y-%m-%d")
            # Keep the better fix description
            if success and len(fix_description) > len(entry.get("fix_description", "")):
                entry["fix_description"] = fix_description
            if success:
                total = entry.get("frequency", 1)
                old_rate = entry.get("success_rate", 0.5)
                entry["success_rate"] = round(old_rate + (1.0 - old_rate) / total, 3)
            save_errors(bank)
            return "merged"

    # New entry
    categories = Counter(categorize_error(line) for line in error_lines)
    primary_category = categories.most_common(1)[0][0] if categories else "unknown"

    # Extract TS error codes
    codes = set()
    for line in error_lines:
        codes.update(re.findall(r"TS\d+", line))

    new_entry = {
        "fingerprint": fp,
        "error_codes": sorted(codes),
        "category": primary_category,
        "error_lines": error_lines[:5],  # keep at most 5 representative lines
        "fix_description": fix_description,
        "files_changed": files_changed[:3],
        "frequency": 1,
        "success_rate": 1.0 if success else 0.0,
        "first_seen": time.strftime("%Y-%m-%d"),
        "last_seen": time.strftime("%Y-%m-%d"),
    }

    bank.append(new_entry)
    save_errors(bank)

    # Check if compaction needed
    if len(bank) > MAX_BANK_SIZE:
        compact(bank)

    return "added"


def build_context_prompt(current_errors: list[str]) -> str:
    """
    Build a context injection string from memory for the fix loop.
    Returns a concise block of known fixes to prepend to the Groq prompt.
    """
    matches = recall(current_errors, top_k=5)
    patterns = load_patterns()

    if not matches and not patterns:
        return ""

    parts = []

    if patterns:
        parts.append("KNOWN PATTERNS (from past runs):")
        for p in patterns[:5]:
            parts.append(f"  - [{p.get('category', '?')}] {p['pattern']}")
        parts.append("")

    if matches:
        parts.append("SIMILAR PAST ERRORS & FIXES:")
        for m in matches:
            codes = ", ".join(m.get("error_codes", []))
            parts.append(f"  - {codes} ({m['category']}): {m['fix_description']} "
                        f"[seen {m['frequency']}x, {m['success_rate']*100:.0f}% success]")
        parts.append("")

    parts.append("Use these hints to fix errors faster. Apply known patterns first.\n")

    return "\n".join(parts)


# =============================================================================
# Compaction (prune + merge similar entries)
# =============================================================================

def compact(bank: Optional[list[dict]] = None):
    """
    Compact the error bank:
    1. Merge entries with similarity > threshold
    2. Drop low-frequency + low-success entries
    3. Keep top COMPACT_TARGET entries by score
    """
    if bank is None:
        bank = load_errors()

    if len(bank) <= COMPACT_TARGET:
        return

    print(f"  [memory] Compacting: {len(bank)} entries -> target {COMPACT_TARGET}")

    # Phase 1: Merge similar entries
    merged = []
    used = set()

    for i, entry_a in enumerate(bank):
        if i in used:
            continue

        cluster = [entry_a]
        for j, entry_b in enumerate(bank[i + 1:], start=i + 1):
            if j in used:
                continue
            sim = similarity(
                entry_a.get("error_lines", []),
                entry_b.get("error_lines", [])
            )
            if sim >= SIMILARITY_THRESHOLD:
                cluster.append(entry_b)
                used.add(j)

        # Merge cluster into one entry (keep highest frequency/success)
        best = max(cluster, key=lambda e: e.get("frequency", 0) * e.get("success_rate", 0))
        best["frequency"] = sum(e.get("frequency", 1) for e in cluster)
        best["success_rate"] = max(e.get("success_rate", 0) for e in cluster)

        # Merge error codes
        all_codes = set()
        for e in cluster:
            all_codes.update(e.get("error_codes", []))
        best["error_codes"] = sorted(all_codes)

        merged.append(best)
        used.add(i)

    # Phase 2: Score and keep top entries
    for entry in merged:
        freq = entry.get("frequency", 1)
        success = entry.get("success_rate", 0.5)
        # Recency bonus: entries seen in last 7 days get a boost
        last_seen = entry.get("last_seen", "2020-01-01")
        try:
            days_ago = (time.time() - time.mktime(time.strptime(last_seen, "%Y-%m-%d"))) / 86400
        except ValueError:
            days_ago = 365
        recency = max(0, 1 - days_ago / 30)  # 1.0 if today, 0.0 if 30+ days ago

        entry["_score"] = freq * success * (1 + recency * 0.3)

    merged.sort(key=lambda e: e.get("_score", 0), reverse=True)

    # Keep top entries
    kept = merged[:COMPACT_TARGET]

    # Clean up internal score
    for entry in kept:
        entry.pop("_score", None)

    save_errors(kept)

    stats = load_stats()
    stats["last_compaction"] = time.strftime("%Y-%m-%d %H:%M:%S")
    save_stats(stats)

    print(f"  [memory] Compacted: {len(bank)} -> {len(kept)} entries")


# =============================================================================
# Pattern Extraction (LLM-powered compression)
# =============================================================================

def extract_patterns_with_groq():
    """
    Use Groq to analyze the error bank and extract high-level patterns.
    These patterns are concise rules injected into future fix prompts.
    Called periodically (every N runs).
    """
    groq_key = os.environ.get("GROQ_API_KEY")
    if not groq_key:
        return

    bank = load_errors()
    if len(bank) < 5:
        return  # not enough data

    # Build summary of error bank
    summary_parts = []
    for entry in bank[:50]:  # limit to avoid token overflow
        codes = ", ".join(entry.get("error_codes", []))
        summary_parts.append(
            f"- {codes} ({entry['category']}): {entry['fix_description']} "
            f"[freq={entry.get('frequency', 1)}, success={entry.get('success_rate', 0):.0%}]"
        )

    summary = "\n".join(summary_parts)

    payload = {
        "model": "openai/gpt-oss-120b",
        "messages": [
            {
                "role": "system",
                "content": (
                    "You analyze TypeScript error patterns from a code generation pipeline. "
                    "Output ONLY a JSON array of pattern objects. No markdown, no explanation."
                )
            },
            {
                "role": "user",
                "content": f"""Analyze these error→fix pairs and extract 5-10 high-level patterns.

Error bank:
{summary}

Output JSON array:
[
  {{
    "category": "import|type|syntax|config|directive|other",
    "pattern": "One-line rule describing when this error occurs and how to fix it",
    "error_codes": ["TS2307"],
    "priority": 1-10
  }}
]

Rules:
- Merge similar errors into one pattern
- Prioritize by frequency and success rate
- Each pattern must be actionable (not just a description)
- Max 10 patterns total
- Keep each pattern under 100 characters"""
            }
        ],
        "temperature": 0.2,
        "max_tokens": 2000
    }

    try:
        resp = subprocess.run(
            ["curl", "-s", "https://api.groq.com/openai/v1/chat/completions",
             "-H", f"Authorization: Bearer {groq_key}",
             "-H", "Content-Type: application/json",
             "-d", json.dumps(payload)],
            capture_output=True, text=True, timeout=30
        )
        data = json.loads(resp.stdout)
        content = data["choices"][0]["message"]["content"].strip()

        # Strip markdown fences
        if content.startswith("```"):
            content = content.split("\n", 1)[1].rsplit("```", 1)[0]

        patterns = json.loads(content)
        if isinstance(patterns, list):
            save_patterns(patterns)
            print(f"  [memory] Extracted {len(patterns)} patterns from {len(bank)} error entries")

            stats = load_stats()
            stats["last_pattern_extraction"] = time.strftime("%Y-%m-%d %H:%M:%S")
            save_stats(stats)

    except Exception as e:
        print(f"  [memory] Pattern extraction failed: {e}")


# =============================================================================
# Retrospective (post-fix analysis)
# =============================================================================

def run_retrospective(
    initial_errors: list[str],
    final_errors: list[str],
    files_changed: list[str],
    waves_taken: int,
    elapsed_seconds: float,
):
    """
    Post-fix retrospective. Analyzes what was fixed, stores learnings.
    Designed to run in background after the fix loop completes.
    """
    stats = load_stats()
    stats["total_runs"] = stats.get("total_runs", 0) + 1
    stats["total_errors_seen"] = stats.get("total_errors_seen", 0) + len(initial_errors)

    fixed_count = max(0, len(initial_errors) - len(final_errors))
    stats["total_errors_fixed"] = stats.get("total_errors_fixed", 0) + fixed_count

    # Determine what was fixed
    initial_codes = set()
    for line in initial_errors:
        initial_codes.update(re.findall(r"TS\d+", line))

    final_codes = set()
    for line in final_errors:
        final_codes.update(re.findall(r"TS\d+", line))

    fixed_codes = initial_codes - final_codes
    unfixed_codes = initial_codes & final_codes

    # Store the fix as a memory entry
    if fixed_count > 0:
        fix_desc = (
            f"Fixed {fixed_count} errors ({', '.join(sorted(fixed_codes)[:5])}) "
            f"in {waves_taken} waves, {elapsed_seconds:.0f}s. "
            f"Files: {', '.join(files_changed[:3])}"
        )
        remember(
            error_lines=initial_errors[:5],
            fix_description=fix_desc,
            files_changed=files_changed,
            success=len(final_errors) == 0,
        )

    # Store unfixed errors too (with success=False) for future learning
    if final_errors:
        remember(
            error_lines=final_errors[:5],
            fix_description=f"UNFIXED after {waves_taken} waves. Codes: {', '.join(sorted(unfixed_codes)[:5])}",
            files_changed=[],
            success=False,
        )

    save_stats(stats)

    # Periodic pattern extraction
    if stats["total_runs"] % PATTERN_EXTRACT_EVERY == 0:
        print("  [memory] Triggering periodic pattern extraction...")
        extract_patterns_with_groq()

    # Print summary
    hit_rate = (
        stats["memory_hits"] / max(1, stats["memory_hits"] + stats["memory_misses"]) * 100
    )
    print(f"\n  [memory] Retrospective complete:")
    print(f"    Run #{stats['total_runs']}: {fixed_count}/{len(initial_errors)} errors fixed in {waves_taken} waves")
    print(f"    Lifetime: {stats['total_errors_fixed']}/{stats['total_errors_seen']} errors fixed")
    print(f"    Memory bank: {len(load_errors())} entries, {len(load_patterns())} patterns")
    print(f"    Hit rate: {hit_rate:.0f}%")


def record_memory_hit(found_matches: int):
    """Track when memory recall finds relevant matches."""
    stats = load_stats()
    if found_matches > 0:
        stats["memory_hits"] = stats.get("memory_hits", 0) + 1
    else:
        stats["memory_misses"] = stats.get("memory_misses", 0) + 1
    save_stats(stats)


# =============================================================================
# CLI interface (for manual inspection)
# =============================================================================

if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage: memory.py [status|errors|patterns|compact|extract]")
        sys.exit(0)

    cmd = sys.argv[1]

    if cmd == "status":
        stats = load_stats()
        bank = load_errors()
        patterns = load_patterns()
        print(f"Error bank:  {len(bank)} entries")
        print(f"Patterns:    {len(patterns)}")
        print(f"Total runs:  {stats.get('total_runs', 0)}")
        print(f"Fixed/seen:  {stats.get('total_errors_fixed', 0)}/{stats.get('total_errors_seen', 0)}")
        hit = stats.get('memory_hits', 0)
        miss = stats.get('memory_misses', 0)
        rate = hit / max(1, hit + miss) * 100
        print(f"Hit rate:    {rate:.0f}% ({hit}/{hit + miss})")
        print(f"Last compact:  {stats.get('last_compaction', 'never')}")
        print(f"Last extract:  {stats.get('last_pattern_extraction', 'never')}")

    elif cmd == "errors":
        bank = load_errors()
        for i, entry in enumerate(bank):
            codes = ", ".join(entry.get("error_codes", []))
            print(f"  [{i}] {codes} ({entry['category']}) freq={entry.get('frequency', 1)} "
                  f"success={entry.get('success_rate', 0):.0%}")
            print(f"       {entry.get('fix_description', 'no description')}")

    elif cmd == "patterns":
        patterns = load_patterns()
        for p in patterns:
            print(f"  [{p.get('category', '?')}] {p['pattern']} (priority={p.get('priority', '?')})")

    elif cmd == "compact":
        compact()

    elif cmd == "extract":
        extract_patterns_with_groq()

    else:
        print(f"Unknown command: {cmd}")
