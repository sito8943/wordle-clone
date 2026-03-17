import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { EN_WORDS } from "./data/wordsEn";

const EN_LANGUAGE = "en";
const SUPPORTED_LANGUAGES = new Set([EN_LANGUAGE]);

const normalizeLanguage = (value: string): string => value.trim().toLowerCase();

const normalizeWords = (words: string[]): string[] => {
  const unique = new Set<string>();

  for (const word of words) {
    const normalized = word.trim().toLowerCase();
    if (normalized.length > 0) {
      unique.add(normalized);
    }
  }

  return [...unique].sort();
};

const EN_WORDS_NORMALIZED = normalizeWords(EN_WORDS);

const assertLanguageSupported = (language: string): string => {
  const normalized = normalizeLanguage(language);

  if (!SUPPORTED_LANGUAGES.has(normalized)) {
    throw new Error("Unsupported language. Only 'en' is available for now.");
  }

  return normalized;
};

export const ensureLanguageSeeded = mutation({
  args: {
    language: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const language = assertLanguageSupported(args.language ?? EN_LANGUAGE);
    const existingWords = await ctx.db
      .query("words")
      .withIndex("by_language", (q) => q.eq("language", language))
      .collect();

    if (existingWords.length > 0) {
      return {
        language,
        inserted: 0,
        total: existingWords.length,
      };
    }

    const seedWords =
      language === EN_LANGUAGE ? EN_WORDS_NORMALIZED : ([] as string[]);
    const createdAt = Date.now();

    for (const value of seedWords) {
      await ctx.db.insert("words", {
        language,
        value,
        createdAt,
      });
    }

    return {
      language,
      inserted: seedWords.length,
      total: seedWords.length,
    };
  },
});

export const listByLanguage = query({
  args: {
    language: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const language = assertLanguageSupported(args.language ?? EN_LANGUAGE);
    const rows = await ctx.db
      .query("words")
      .withIndex("by_language", (q) => q.eq("language", language))
      .collect();

    return normalizeWords(rows.map((row) => row.value));
  },
});

const djb2Hash = (words: string[]): number => {
  let hash = 5381;
  const str = words.join(",");
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
    hash = hash >>> 0; // keep as unsigned 32-bit
  }
  return hash;
};

export const getWordsChecksum = query({
  args: {
    language: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const language = assertLanguageSupported(args.language ?? EN_LANGUAGE);
    const rows = await ctx.db
      .query("words")
      .withIndex("by_language", (q) => q.eq("language", language))
      .collect();

    const words = normalizeWords(rows.map((row) => row.value));
    return { checksum: djb2Hash(words), count: words.length };
  },
});
