export const DAILY_WORD_STORAGE_KEY_PREFIX = "wordle:daily-word";
export const RAE_DAILY_WORD_API_URL = "https://rae-api.com/api/daily";

export const DAILY_WORD_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const ACCENTED_LETTER_REPLACEMENTS: Record<string, string> = {
  Á: "A",
  À: "A",
  Ä: "A",
  Â: "A",
  É: "E",
  È: "E",
  Ë: "E",
  Ê: "E",
  Í: "I",
  Ì: "I",
  Ï: "I",
  Î: "I",
  Ó: "O",
  Ò: "O",
  Ö: "O",
  Ô: "O",
  Ú: "U",
  Ù: "U",
  Ü: "U",
  Û: "U",
};