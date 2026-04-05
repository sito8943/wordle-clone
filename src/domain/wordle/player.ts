export type PlayerHackingBanReason = "score-submission-too-fast";

export type PlayerHackingBan = {
  reason: PlayerHackingBanReason;
  bannedAt: number;
  thresholdMs: number;
  detectedRoundDurationMs: number;
};

export type Player = {
  name: string;
  code: string;
  score: number;
  streak: number;
  language: PlayerLanguage;
  difficulty: PlayerDifficulty;
  keyboardPreference: PlayerKeyboardPreference;
  showEndOfGameDialogs: boolean;
  manualTileSelection: boolean;
  hackingBan: PlayerHackingBan | null;
};

export type PlayerDifficulty = "easy" | "normal" | "hard" | "insane";
export type PlayerKeyboardPreference = "onscreen" | "native";
export type PlayerLanguage = "en" | "es";
