import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { ConvexHttpClient } from "convex/browser";

const EXPORT_FUNCTION = "exportData:exportAllData";
const DEFAULT_EXPORTS_DIR = "exports";

const getDefaultOutputPath = () => {
  const iso = new Date().toISOString().replace(/[:.]/g, "-");
  return resolve(process.cwd(), DEFAULT_EXPORTS_DIR, `convex-export-${iso}.json`);
};

const printHelp = () => {
  console.log(`Usage: node scripts/export-convex-data.mjs [options]

Options:
  --url <convex-url>     Convex deployment URL (fallback: CONVEX_URL or VITE_CONVEX_URL)
  --out <file-path>      Output JSON path (default: ./exports/convex-export-<timestamp>.json)
  --help                 Show this help message
`);
};

const parseOptions = (argv) => {
  let url;
  let outPath;
  let help = false;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--help" || arg === "-h") {
      help = true;
      continue;
    }

    if (arg === "--url") {
      const next = argv[index + 1];
      if (!next) {
        throw new Error("Missing value for --url.");
      }
      url = next;
      index += 1;
      continue;
    }

    if (arg === "--out") {
      const next = argv[index + 1];
      if (!next) {
        throw new Error("Missing value for --out.");
      }
      outPath = resolve(process.cwd(), next);
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return { url, outPath, help };
};

const main = async () => {
  const options = parseOptions(process.argv.slice(2));

  if (options.help) {
    printHelp();
    return;
  }

  const convexUrl =
    options.url ?? process.env.CONVEX_URL ?? process.env.VITE_CONVEX_URL;
  if (!convexUrl) {
    throw new Error(
      "Convex URL missing. Pass --url or define CONVEX_URL / VITE_CONVEX_URL.",
    );
  }

  const outputPath = options.outPath ?? getDefaultOutputPath();
  const client = new ConvexHttpClient(convexUrl);
  const data = await client.query(EXPORT_FUNCTION, {});

  const payload = {
    generatedAt: new Date().toISOString(),
    source: {
      function: EXPORT_FUNCTION,
    },
    data,
  };

  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

  const counts = payload.data?.counts ?? {};
  console.log(`[export-convex-data] JSON saved to: ${outputPath}`);
  console.log(`[export-convex-data] Row counts: ${JSON.stringify(counts)}`);
};

main().catch((error) => {
  console.error(
    `[export-convex-data] ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exit(1);
});
