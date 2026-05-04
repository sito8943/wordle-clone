import changelogRaw from "./changelog.json?raw";
import { compareAppVersions } from "./utils";
import type {
  ResolvedVersionChangelog,
  ViewChangelogByVersion,
  ViewChangelogLanguage,
  ViewVersionHistoryEntry,
} from "./types";

const normalizeChangelogLanguage = (value: string): ViewChangelogLanguage => {
  const normalized = value.trim().toLowerCase();
  if (normalized === "es" || normalized.startsWith("es-")) {
    return "es";
  }

  return "en";
};

const resolveChangelogData = (): ViewChangelogByVersion => {
  try {
    return JSON.parse(changelogRaw) as ViewChangelogByVersion;
  } catch {
    return {};
  }
};

export const VIEW_CHANGELOG_BY_VERSION = resolveChangelogData();

export const VIEW_VERSION_HISTORY: ViewVersionHistoryEntry[] = Object.entries(
  VIEW_CHANGELOG_BY_VERSION,
)
  .map(([version, entry]) => ({
    version,
    releasedAt: entry.releasedAt,
  }))
  .sort((left, right) => {
    if (left.releasedAt !== right.releasedAt) {
      return right.releasedAt.localeCompare(left.releasedAt);
    }

    return compareAppVersions(right.version, left.version);
  });

export const getResolvedVersionChangelog = (
  version: string,
  language: string,
): ResolvedVersionChangelog | null => {
  const entry = VIEW_CHANGELOG_BY_VERSION[version];
  if (!entry) {
    return null;
  }

  const normalizedLanguage = normalizeChangelogLanguage(language);
  const fallbackLanguage: ViewChangelogLanguage =
    normalizedLanguage === "es" ? "en" : "es";
  const changes =
    entry.language[normalizedLanguage] ?? entry.language[fallbackLanguage] ?? [];

  return {
    version,
    releasedAt: entry.releasedAt,
    changes,
  };
};
