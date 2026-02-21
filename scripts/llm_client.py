import os
import json
import subprocess
import time
import re
from concurrent.futures import ThreadPoolExecutor, as_completed

GROQ_HOST = os.environ.get("GROQ_HOST", "https://api.groq.com")
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
MODEL = os.environ.get("GROQ_MODEL", "openai/gpt-oss-120b")
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-3.1-pro-preview")
OLLAMA_HOST = os.environ.get("OLLAMA_HOST", "https://ollama.com")
OLLAMA_API_KEY = os.environ.get("OLLAMA_API_KEY", "")
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "kimi-k2-thinking:cloud")
HOMEPAGE_PROVIDER = os.environ.get("HOMEPAGE_PROVIDER", "groq")
HOMEPAGE_GROQ_MODEL = os.environ.get("HOMEPAGE_GROQ_MODEL", "moonshotai/kimi-k2-instruct-0905")

def call_gemini(prompt: str, system: str = "", temperature: float = 0.3, max_tokens: int = 8000) -> dict:
    if not GEMINI_API_KEY:
        return {"content": "", "error": "GEMINI_API_KEY not set"}

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"
    
    contents = []
    if system:
        contents.append({"role": "user", "parts": [{"text": f"System Instructions: {system}"}]})
    contents.append({"role": "user", "parts": [{"text": prompt}]})

    payload = json.dumps({
        "contents": contents,
        "generationConfig": {
            "temperature": temperature,
            "maxOutputTokens": max_tokens,
        }
    })

    for attempt in range(2):
        try:
            result = subprocess.run(
                ["curl", "-s", url,
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

            candidate = data.get("candidates", [{}])[0]
            content = candidate.get("content", {}).get("parts", [{}])[0].get("text", "")
            
            usage = data.get("usageMetadata", {})
            return {
                "content": content,
                "output_tokens": usage.get("candidatesTokenCount", 0),
                "prompt_tokens": usage.get("promptTokenCount", 0),
                "total_time": 1.0, 
            }
        except Exception as e:
            if attempt == 0:
                time.sleep(2)
                continue
            return {"content": "", "error": str(e)}

    return {"content": "", "error": "max retries"}

def call_ollama(prompt: str, system: str = "", temperature: float = 0.3, max_tokens: int = 8000) -> dict:
    if not OLLAMA_API_KEY:
        return {"content": "", "error": "OLLAMA_API_KEY not set"}

    messages = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})

    url = f"{OLLAMA_HOST.rstrip('/')}/v1/chat/completions"
    payload = json.dumps({
        "model": OLLAMA_MODEL,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
        "stream": False,
    })

    for attempt in range(2):
        try:
            result = subprocess.run(
                ["curl", "-s", url,
                 "-H", f"Authorization: Bearer {OLLAMA_API_KEY}",
                 "-H", "Content-Type: application/json",
                 "-d", payload],
                capture_output=True, text=True, timeout=180
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

def call_groq(prompt: str, system: str = "", temperature: float = 0.3, max_tokens: int = 8000) -> dict:
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

def call_groq_model(prompt: str, model: str, system: str = "", temperature: float = 0.3, max_tokens: int = 8000) -> dict:
    """Like call_groq but with an explicit model override."""
    messages = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})

    url = f"{GROQ_HOST.rstrip('/')}/openai/v1/chat/completions"
    payload = json.dumps({
        "model": model,
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
                capture_output=True, text=True, timeout=180
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
