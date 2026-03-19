import { getWordDictionary } from "@utils/words";
import { createSessionId } from "./session";
import type { GameReference } from "./types";

const UINT32_MAX = 0x1_0000_0000;

const randomUint32 = (): number => {
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    const values = new Uint32Array(1);
    crypto.getRandomValues(values);
    return values[0] >>> 0;
  }

  return Math.floor(Math.random() * UINT32_MAX) >>> 0;
};

export const normalizeSeed = (seed: number): number => seed >>> 0;

export const hashGameId = (gameId: string): number => {
  let hash = 2166136261;

  for (let index = 0; index < gameId.length; index += 1) {
    hash ^= gameId.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
};

export const mixGameSeed = (seed: number, gameId: string): number => {
  let value = (normalizeSeed(seed) ^ hashGameId(gameId) ^ 0x9e3779b9) >>> 0;
  value ^= value >>> 16;
  value = Math.imul(value, 0x85ebca6b) >>> 0;
  value ^= value >>> 13;
  value = Math.imul(value, 0xc2b2ae35) >>> 0;
  value ^= value >>> 16;
  return value >>> 0;
};

export const resolveWordIndex = (
  seed: number,
  gameId: string,
  wordsLength: number,
): number => {
  if (wordsLength <= 0) {
    return 0;
  }

  return mixGameSeed(seed, gameId) % wordsLength;
};

const createGameReference = (): GameReference => ({
  gameId: createSessionId(),
  seed: randomUint32(),
});

export const createGameReferenceForAnswer = (
  answer: string,
  words: string[] = getWordDictionary(),
  options?: { deterministic?: boolean },
): GameReference => {
  const normalizedAnswer = answer.trim().toLowerCase();
  const answerIndex = words.findIndex((word) => word === normalizedAnswer);

  if (answerIndex < 0 || words.length === 0) {
    return createGameReference();
  }

  if (options?.deterministic) {
    let seed = 0;
    const gameId = `legacy-${hashGameId(normalizedAnswer).toString(16)}`;
    while (resolveWordIndex(seed, gameId, words.length) !== answerIndex) {
      seed += 1;
    }

    return {
      gameId,
      seed: normalizeSeed(seed),
    };
  }

  // Brute-force is cheap here because the dictionary size is small enough.
  for (let attempt = 0; attempt < words.length * 4; attempt += 1) {
    const nextReference = createGameReference();
    if (
      resolveWordIndex(
        nextReference.seed,
        nextReference.gameId,
        words.length,
      ) === answerIndex
    ) {
      return nextReference;
    }
  }

  let seed = 0;
  const gameId = createSessionId();
  while (resolveWordIndex(seed, gameId, words.length) !== answerIndex) {
    seed += 1;
  }

  return {
    gameId,
    seed: normalizeSeed(seed),
  };
};

export const createRandomGameReference = (
  words: string[] = getWordDictionary(),
): GameReference => {
  if (words.length === 0) {
    return createGameReference();
  }

  return createGameReference();
};

export const resolveAnswerFromGameReference = (
  reference: GameReference,
  words: string[] = getWordDictionary(),
): string | null => {
  if (words.length === 0) {
    return null;
  }

  const resolvedIndex = resolveWordIndex(
    reference.seed,
    reference.gameId,
    words.length,
  );

  return words[resolvedIndex]?.toUpperCase() ?? null;
};
