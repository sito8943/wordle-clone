import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  getRandomWord,
  getWordDictionary,
  hasWordDictionary,
  isValidWord,
  loadWordDictionaryFromCache,
  setWordDictionary,
} from "./words";

// Reset module state and localStorage before each test
beforeEach(() => {
  localStorage.clear();
  // Reset dictionary to empty state
  setWordDictionary([]);
});

afterEach(() => {
  localStorage.clear();
});

describe("setWordDictionary", () => {
  it("sets the current dictionary and returns normalized words", () => {
    const result = setWordDictionary(["crane", "stone", "PLANT"]);
    expect(result).toEqual(["crane", "plant", "stone"]); // sorted, lowercased
  });

  it("deduplicates words", () => {
    const result = setWordDictionary(["crane", "CRANE", "crane"]);
    expect(result).toEqual(["crane"]);
  });

  it("trims whitespace from words", () => {
    const result = setWordDictionary(["  crane  ", " stone "]);
    expect(result).toEqual(["crane", "stone"]);
  });

  it("filters out empty strings", () => {
    const result = setWordDictionary(["crane", "", "  "]);
    expect(result).toEqual(["crane"]);
  });

  it("persists to localStorage", () => {
    setWordDictionary(["crane"]);
    const key = "wordle:dictionary:en";
    expect(localStorage.getItem(key)).not.toBeNull();
  });
});

describe("getWordDictionary", () => {
  it("returns empty array when no dictionary is set", () => {
    expect(getWordDictionary()).toEqual([]);
  });

  it("returns the current dictionary after setting it", () => {
    setWordDictionary(["crane", "stone"]);
    expect(getWordDictionary()).toEqual(["crane", "stone"]);
  });
});

describe("hasWordDictionary", () => {
  it("returns false when no dictionary is loaded", () => {
    expect(hasWordDictionary()).toBe(false);
  });

  it("returns true after setting a dictionary", () => {
    setWordDictionary(["crane"]);
    expect(hasWordDictionary()).toBe(true);
  });
});

describe("isValidWord", () => {
  it("falls back to length-5 check when dictionary is empty", () => {
    // Without a loaded dictionary, any 5-letter word is considered valid
    expect(isValidWord("crane")).toBe(true);
    expect(isValidWord("zzzzz")).toBe(true);
  });

  it("returns false for non-5-letter words when dictionary is empty", () => {
    expect(isValidWord("cr")).toBe(false);
    expect(isValidWord("toolong")).toBe(false);
  });

  it("returns true for a word in the dictionary", () => {
    setWordDictionary(["crane", "stone"]);
    expect(isValidWord("crane")).toBe(true);
  });

  it("returns false for a word not in the dictionary", () => {
    setWordDictionary(["crane", "stone"]);
    expect(isValidWord("zzzzz")).toBe(false);
  });

  it("is case-insensitive", () => {
    setWordDictionary(["crane"]);
    expect(isValidWord("CRANE")).toBe(true);
    expect(isValidWord("Crane")).toBe(true);
  });
});

describe("getRandomWord", () => {
  it("returns the fallback word in uppercase when dictionary is empty", () => {
    expect(getRandomWord()).toBe("APPLE");
  });

  it("returns an uppercase word from the dictionary", () => {
    setWordDictionary(["crane"]);
    expect(getRandomWord()).toBe("CRANE");
  });

  it("returns one of the words in the dictionary", () => {
    const words = ["crane", "stone", "plant"];
    setWordDictionary(words);
    const result = getRandomWord();
    expect(words.map((w) => w.toUpperCase())).toContain(result);
  });
});

describe("loadWordDictionaryFromCache", () => {
  it("returns empty array when nothing is cached", () => {
    const result = loadWordDictionaryFromCache();
    expect(result).toEqual([]);
  });

  it("loads words from localStorage cache", () => {
    // Populate cache first via setWordDictionary
    setWordDictionary(["crane", "stone"]);
    // Then reset in-memory state by loading from cache
    const result = loadWordDictionaryFromCache("en");
    expect(result).toEqual(["crane", "stone"]);
  });

  it("updates the active dictionary after loading from cache", () => {
    setWordDictionary(["crane"], "en");
    loadWordDictionaryFromCache("en");
    expect(getWordDictionary()).toEqual(["crane"]);
  });
});
