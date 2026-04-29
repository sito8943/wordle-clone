export type PlayerHackingBanReason = "score-submission-too-fast";

export type PlayerHackingBan = {
  reason: PlayerHackingBanReason;
  bannedAt: number;
  thresholdMs: number;
  detectedRoundDurationMs: number;
};

export type PlayerTutorialModeId = "classic" | "lightning" | "zen" | "daily";
export type PlayerTutorialPromptSeenModes = Partial<
  Record<PlayerTutorialModeId, boolean>
>;

export type Player = {
  name: string;
  code: string;
  score: number;
  streak: number;
  language: PlayerLanguage;
  difficulty: PlayerDifficulty;
  keyboardPreference: PlayerKeyboardPreference;
  declinedTutorial?: boolean;
  tutorialPromptSeenModes?: PlayerTutorialPromptSeenModes;
  showEndOfGameDialogs: boolean;
  manualTileSelection: boolean;
  hackingBan: PlayerHackingBan | null;
};

export type PlayerDifficulty = "easy" | "normal" | "hard" | "insane";
export type PlayerKeyboardPreference = "onscreen" | "native";
export type PlayerLanguage = "en" | "es";

export type PlayerDifficultyEnabledMap = Record<PlayerDifficulty, boolean>;

const DIFFICULTY_ORDER: PlayerDifficulty[] = [
  "easy",
  "normal",
  "hard",
  "insane",
];

export const resolveEnabledDifficulty = (
  current: PlayerDifficulty,
  enabledMap: PlayerDifficultyEnabledMap,
): PlayerDifficulty | null => {
  if (enabledMap[current]) {
    return current;
  }

  const currentIdx = DIFFICULTY_ORDER.indexOf(current);
  const enabled = DIFFICULTY_ORDER.filter(
    (difficulty) => enabledMap[difficulty],
  );

  if (enabled.length === 0) {
    return null;
  }

  let best = enabled[0];
  let bestDistance = Math.abs(DIFFICULTY_ORDER.indexOf(best) - currentIdx);

  for (const candidate of enabled) {
    const distance = Math.abs(DIFFICULTY_ORDER.indexOf(candidate) - currentIdx);
    if (distance < bestDistance) {
      best = candidate;
      bestDistance = distance;
    }
  }

  return best;
};
