import { WORDS } from "./constants";

export function getRandomWord(): string {
  return WORDS[Math.floor(Math.random() * WORDS.length)].toUpperCase();
}

export function isValidWord(word: string): boolean {
  return WORDS.includes(word.toLowerCase());
}
