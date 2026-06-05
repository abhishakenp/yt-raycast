# 0001 — Romanized script subtag

## Status

Accepted

## Context

Translation was locale-only: a single language code drove generation, and the
script was simply whatever writing system the LLM happened to choose for a given
language name. There was no way to ask for an Indian language rendered in Latin
script — the writing system was not an independent, addressable axis.

Compounding this, multiple independent locale normalizers each gated acceptance
on a narrow shape (`length === 2`, or a `[a-z]{2,8}` / `-en` pattern). Any new
multi-subtag code that did not match these gates was silently collapsed back to
`en`, so even if a `-latn` code were introduced it would not survive the
pipeline.

## Decision

Represent the writing-system axis as a BCP-47 `-latn` script subtag appended to
the base language code (e.g. `hi-latn`). The subtag is stored lowercase for
case-consistency with the lowercasing pipeline, which avoids exact-match misses
in `lookupKnownLanguage`.

- Auto-generate a `-latn` sibling for every Indic pure language.
- Introduce a shared `isTranslatableLocale()` predicate that accepts a 2-char
  ISO code OR an `xx-latn` code, while still rejecting `hinglish` / `xx-en`.
- Add a `-latn` allow-branch to each `preferredLanguage` normalizer so the new
  codes are no longer collapsed to `en`.
- Extend the `/api/translate` LLM prompt with a transliteration branch: casual
  romanization with no diacritics.

## Consequences

- A clean seam now exists to later swap the LLM romanization for a deterministic
  transliteration library, selected per-script.
- Code-mixed variants (`hinglish`, `xx-en`) keep their existing suppressed
  behavior unchanged.
- Script subtags become the extension point for future scripts.
