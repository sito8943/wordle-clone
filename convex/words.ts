import { mutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { EN_WORDS } from "./data/wordsEn";
import { ES_WORDS } from "./data/wordsEs";

const EN_LANGUAGE = "en";
const ES_LANGUAGE = "es";
const SUPPORTED_LANGUAGES = new Set([EN_LANGUAGE, ES_LANGUAGE]);

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
const ES_WORDS_NORMALIZED = normalizeWords(ES_WORDS);

const assertLanguageSupported = (language: string): string => {
  const normalized = normalizeLanguage(language);

  if (!SUPPORTED_LANGUAGES.has(normalized)) {
    throw new Error("Unsupported language. Supported languages: 'en', 'es'.");
  }

  return normalized;
};

const djb2Hash = (words: string[]): number => {
  let hash = 5381;
  const str = words.join(",");
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
    hash = hash >>> 0;
  }
  return hash;
};

const upsertWordsMeta = async (
  ctx: MutationCtx,
  language: string,
  checksum: number,
) => {
  const existing = await ctx.db
    .query("wordsMeta")
    .withIndex("by_language", (q) => q.eq("language", language))
    .unique();

  if (existing) {
    await ctx.db.patch(existing._id, { checksum, updatedAt: Date.now() });
  } else {
    await ctx.db.insert("wordsMeta", {
      language,
      checksum,
      updatedAt: Date.now(),
    });
  }
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
      language === ES_LANGUAGE ? ES_WORDS_NORMALIZED : EN_WORDS_NORMALIZED;
    const createdAt = Date.now();

    for (const value of seedWords) {
      await ctx.db.insert("words", {
        language,
        value,
        createdAt,
      });
    }

    await upsertWordsMeta(ctx, language, djb2Hash(seedWords));

    return {
      language,
      inserted: seedWords.length,
      total: seedWords.length,
    };
  },
});

export const seedLanguageWords = mutation({
  args: {
    language: v.string(),
    replaceExisting: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const language = assertLanguageSupported(args.language);
    const shouldReplace = args.replaceExisting === true;
    const seedWords =
      language === ES_LANGUAGE ? ES_WORDS_NORMALIZED : EN_WORDS_NORMALIZED;
    const existingWords = await ctx.db
      .query("words")
      .withIndex("by_language", (q) => q.eq("language", language))
      .collect();

    if (!shouldReplace && existingWords.length > 0) {
      return {
        language,
        inserted: 0,
        total: existingWords.length,
        replaced: false,
      };
    }

    if (shouldReplace) {
      for (const row of existingWords) {
        await ctx.db.delete(row._id);
      }
    }

    const createdAt = Date.now();

    for (const value of seedWords) {
      await ctx.db.insert("words", {
        language,
        value,
        createdAt,
      });
    }

    await upsertWordsMeta(ctx, language, djb2Hash(seedWords));

    return {
      language,
      inserted: seedWords.length,
      total: shouldReplace ? seedWords.length : existingWords.length + seedWords.length,
      replaced: shouldReplace,
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

export const getLanguageChecksum = query({
  args: {
    language: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const language = assertLanguageSupported(args.language ?? EN_LANGUAGE);
    const meta = await ctx.db
      .query("wordsMeta")
      .withIndex("by_language", (q) => q.eq("language", language))
      .unique();

    if (!meta) return null;
    return { checksum: meta.checksum, updatedAt: meta.updatedAt };
  },
});

export const refreshLanguageChecksum = mutation({
  args: {
    language: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const language = assertLanguageSupported(args.language ?? EN_LANGUAGE);
    const rows = await ctx.db
      .query("words")
      .withIndex("by_language", (q) => q.eq("language", language))
      .collect();
    const checksum = djb2Hash(normalizeWords(rows.map((row) => row.value)));
    const updatedAt = Date.now();
    const meta = await ctx.db
      .query("wordsMeta")
      .withIndex("by_language", (q) => q.eq("language", language))
      .unique();

    if (meta) {
      await ctx.db.patch(meta._id, { checksum, updatedAt });
    } else {
      await ctx.db.insert("wordsMeta", { language, checksum, updatedAt });
    }

    return { language, checksum, updatedAt, total: rows.length };
  },
});
