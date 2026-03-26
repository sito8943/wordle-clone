import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(SCRIPT_DIR, "..");
const DEFAULT_CSV_PATH = resolve(PROJECT_ROOT, "palabras_espanol_comunes.csv");

const parseWordsFromCsv = (rawCsv) => {
  const lines = rawCsv
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((line) => line.trim().toLowerCase())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    throw new Error("CSV file is empty.");
  }

  const words = lines[0] === "palabra" ? lines.slice(1) : lines;
  const uniqueWords = [...new Set(words)];
  const invalidWords = uniqueWords.filter(
    (word) => word.length !== 5 || !/^[a-z\u00f1]+$/.test(word),
  );

  if (invalidWords.length > 0) {
    const preview = invalidWords.slice(0, 10).join(", ");
    throw new Error(
      `CSV contains invalid words (must be 5 lowercase letters): ${preview}`,
    );
  }

  return uniqueWords;
};

const extractCliOptions = (argv) => {
  let csvPath = DEFAULT_CSV_PATH;
  const forwardArgs = [];

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];

    if (value === "--csv" || value === "--csv-path") {
      const next = argv[index + 1];
      if (!next) {
        throw new Error("Missing value for --csv/--csv-path.");
      }
      csvPath = resolve(process.cwd(), next);
      index += 1;
      continue;
    }

    forwardArgs.push(value);
  }

  return { csvPath, forwardArgs };
};

const { csvPath, forwardArgs } = extractCliOptions(process.argv.slice(2));
const words = parseWordsFromCsv(readFileSync(csvPath, "utf8"));

const args = [
  "convex",
  "run",
  "words:seedLanguageWords",
  JSON.stringify({
    language: "es",
    replaceExisting: true,
    words,
  }),
  ...forwardArgs,
];

console.log(
  `[seed-spanish-words] Seeding ${words.length} words from ${csvPath}`,
);

const result = spawnSync("npx", args, {
  stdio: "inherit",
  shell: process.platform === "win32",
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}
