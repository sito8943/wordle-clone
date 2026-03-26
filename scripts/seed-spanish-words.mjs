import { spawnSync } from "node:child_process";

const args = [
  "convex",
  "run",
  "words:seedLanguageWords",
  JSON.stringify({
    language: "es",
    replaceExisting: true,
  }),
  ...process.argv.slice(2),
];

const result = spawnSync("npx", args, {
  stdio: "inherit",
  shell: process.platform === "win32",
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}
