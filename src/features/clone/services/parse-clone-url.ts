/**
 * Pure module to extract clone target URL(s) from a user's prompt.
 *
 * No external deps — uses the global `URL`. Defensive: invalid URLs are
 * dropped, never thrown.
 */

export interface ParsedClonePrompt {
  seedUrls: string[];
  brief: string;
  isClone: boolean;
}

// Match http(s) URLs, stopping at whitespace. Trailing punctuation is trimmed
// in a second pass so we keep query strings / fragments intact.
const URL_REGEX = /https?:\/\/[^\s]+/gi;

// Characters that are commonly trailing punctuation (not part of the URL).
const TRAILING_PUNCT = /[.,;:!?)\]}'"<>»”’]+$/;

/**
 * Trim trailing punctuation from a raw URL match. Handles the common case of
 * a sentence-ending period, a closing paren that has no matching open paren
 * inside the URL, and stray quotes/brackets.
 */
function trimTrailingPunct(raw: string): string {
  let url = raw;
  // Iteratively strip trailing punctuation. For closing brackets, only strip
  // when there is no matching opener inside the URL (so balanced parens in a
  // query string survive).
  for (;;) {
    const match = TRAILING_PUNCT.exec(url);
    if (!match) break;

    const trailing = match[0];
    let cut = trailing.length;

    // Re-attach balanced closing brackets/parens.
    for (const pair of [
      [")", "("],
      ["]", "["],
      ["}", "{"],
    ] as const) {
      const [close, open] = pair;
      while (cut > 0 && url[url.length - cut] === close) {
        const candidate = url.slice(0, url.length - cut);
        const opens = (candidate.match(new RegExp(`\\${open}`, "g")) ?? [])
          .length;
        const closes = (candidate.match(new RegExp(`\\${close}`, "g")) ?? [])
          .length;
        if (opens > closes) {
          // Balanced — keep this closing bracket as part of the URL.
          cut -= 1;
        } else {
          break;
        }
      }
    }

    if (cut <= 0) break;
    url = url.slice(0, url.length - cut);
    // Loop again in case more trailing punctuation remains after the cut.
    if (cut === trailing.length) break;
  }
  return url;
}

/**
 * Build a case-insensitive dedupe key from a parsed URL: host + path.
 * Query strings and fragments are ignored for dedupe purposes.
 */
function dedupeKey(url: URL): string {
  const host = url.host.toLowerCase();
  const path = url.pathname.replace(/\/+$/, "");
  return `${host}${path}`.toLowerCase();
}

export function parseClonePrompt(prompt: string): ParsedClonePrompt {
  if (typeof prompt !== "string" || prompt.length === 0) {
    return { seedUrls: [], brief: "", isClone: false };
  }

  const seedUrls: string[] = [];
  const seen = new Set<string>();
  // Record the exact raw substrings we consumed so we can strip them from
  // brief (raw includes any trailing punctuation that belongs to the prose).
  const consumed: string[] = [];

  const matches = prompt.match(URL_REGEX) ?? [];

  for (const raw of matches) {
    if (seedUrls.length >= 5) break;

    const cleaned = trimTrailingPunct(raw);
    let parsed: URL;
    try {
      parsed = new URL(cleaned);
    } catch {
      continue; // invalid URL — drop, never throw
    }

    // Keep ONLY http/https.
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      continue;
    }

    // Strip the raw match (incl. any trailing punctuation that was attached
    // to the URL in the prose) from the brief.
    consumed.push(raw);

    const key = dedupeKey(parsed);
    if (seen.has(key)) {
      continue; // duplicate — already recorded for stripping
    }
    seen.add(key);
    seedUrls.push(cleaned);
  }

  // Strip every consumed URL substring from the prompt to form the brief.
  let brief = prompt;
  for (const url of consumed) {
    brief = brief.split(url).join(" ");
  }
  brief = brief.replace(/\s+/g, " ").trim();

  return {
    seedUrls,
    brief,
    isClone: seedUrls.length > 0,
  };
}
