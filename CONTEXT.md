# Context — Ship Fast language/translation glossary

- **Locale** — the language identity of generated content, as a BCP-47 code (`en`, `hi`, `ne`, `fr`).
- **Script** — the writing system content is rendered in (Devanagari, Latin, …). Historically derived from the language; now an independent axis for Indian languages via a `-latn` subtag.
- **Romanized variant (`xx-latn`)** — content fully translated into language `xx`, then transliterated into the Latin/Roman alphabet using casual phonetic spelling (`Aapka swaagat hai`, not scholarly `āpakā svāgata`). Distinct from code-mixing. `needsTranslation: true`.
- **Code-mixed variant (`hinglish`, `xx-en`)** — content that mixes the Indian language with English words, written in Latin script (`Aapka welcome hai, best deals yahan`). `skipFullTranslation: true` — NOT translated; the AI's English copy is left as-is. This is NOT the same as Romanized.

> Note: the words "roman hindi" / "romanized X" / "X in english letters" mean the Romanized variant (`xx-latn`), not Hinglish.
