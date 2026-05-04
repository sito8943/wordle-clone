export type ViewVersionHistoryEntry = {
  version: string;
  releasedAt: string;
};

export type ViewChangelogLanguage = "en" | "es";

export type ViewChangelogEntry = {
  releasedAt: string;
  language: Record<ViewChangelogLanguage, string[]>;
};

export type ViewChangelogByVersion = Record<string, ViewChangelogEntry>;

export type ResolvedVersionChangelog = {
  version: string;
  releasedAt: string;
  changes: string[];
};
