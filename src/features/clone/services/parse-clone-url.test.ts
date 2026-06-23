import { describe, it, expect } from "vitest";
import { parseClonePrompt } from "./parse-clone-url";

describe("parseClonePrompt", () => {
  it("extracts a single URL and strips it from the brief", () => {
    const result = parseClonePrompt("clone https://x.com but make it a cafe");
    expect(result.seedUrls).toEqual(["https://x.com"]);
    expect(result.brief).toBe("clone but make it a cafe");
    expect(result.isClone).toBe(true);
  });

  it("extracts multiple URLs", () => {
    const result = parseClonePrompt(
      "merge https://a.com and https://b.com into one",
    );
    expect(result.seedUrls).toEqual(["https://a.com", "https://b.com"]);
    expect(result.brief).toBe("merge and into one");
    expect(result.isClone).toBe(true);
  });

  it("preserves query strings and fragments", () => {
    const result = parseClonePrompt(
      "clone https://shop.example.com/p?id=42&ref=x#reviews please",
    );
    expect(result.seedUrls).toEqual([
      "https://shop.example.com/p?id=42&ref=x#reviews",
    ]);
    expect(result.brief).toBe("clone please");
    expect(result.isClone).toBe(true);
  });

  it("trims trailing punctuation (sentence period)", () => {
    const result = parseClonePrompt("see https://x.com.");
    expect(result.seedUrls).toEqual(["https://x.com"]);
    expect(result.brief).toBe("see");
    expect(result.isClone).toBe(true);
  });

  it("trims a trailing closing paren that is not part of the URL", () => {
    const result = parseClonePrompt("reference (https://x.com) here");
    expect(result.seedUrls).toEqual(["https://x.com"]);
    expect(result.brief).toBe("reference ( here");
    expect(result.isClone).toBe(true);
  });

  it("keeps balanced parens inside a URL path", () => {
    const result = parseClonePrompt(
      "clone https://en.wikipedia.org/wiki/Foo_(bar) now",
    );
    expect(result.seedUrls).toEqual([
      "https://en.wikipedia.org/wiki/Foo_(bar)",
    ]);
    expect(result.brief).toBe("clone now");
    expect(result.isClone).toBe(true);
  });

  it("returns isClone false and brief=prompt when no URL is present", () => {
    const prompt = "build me a cafe landing page";
    const result = parseClonePrompt(prompt);
    expect(result.seedUrls).toEqual([]);
    expect(result.brief).toBe(prompt);
    expect(result.isClone).toBe(false);
  });

  it("ignores non-http URLs (ftp/mailto)", () => {
    const result = parseClonePrompt(
      "email me at mailto:a@b.com or ftp://files.example.com/x",
    );
    expect(result.seedUrls).toEqual([]);
    expect(result.isClone).toBe(false);
    // Non-http URLs are left in the brief untouched.
    expect(result.brief).toContain("mailto:a@b.com");
    expect(result.brief).toContain("ftp://files.example.com/x");
  });

  it("keeps http URLs but drops a sibling non-http URL", () => {
    const result = parseClonePrompt(
      "clone https://x.com not ftp://x.com please",
    );
    expect(result.seedUrls).toEqual(["https://x.com"]);
    expect(result.isClone).toBe(true);
  });

  it("dedupes URLs case-insensitively by host+path", () => {
    const result = parseClonePrompt(
      "clone https://X.com/Home and HTTPS://x.com/Home again",
    );
    expect(result.seedUrls).toEqual(["https://X.com/Home"]);
    expect(result.isClone).toBe(true);
  });

  it("dedupes ignoring trailing slash differences", () => {
    const result = parseClonePrompt(
      "compare https://x.com/path and https://x.com/path/",
    );
    expect(result.seedUrls).toEqual(["https://x.com/path"]);
  });

  it("caps the number of seed URLs at 5", () => {
    const result = parseClonePrompt(
      "merge https://a.com https://b.com https://c.com https://d.com https://e.com https://f.com",
    );
    expect(result.seedUrls).toHaveLength(5);
    expect(result.seedUrls).toEqual([
      "https://a.com",
      "https://b.com",
      "https://c.com",
      "https://d.com",
      "https://e.com",
    ]);
  });

  it("handles empty / non-string input defensively", () => {
    expect(parseClonePrompt("")).toEqual({
      seedUrls: [],
      brief: "",
      isClone: false,
    });
  });
});
