import {
  getDifficultyScoreMultiplier,
  getInsaneTimeBonus,
  getNormalDictionaryRowsBonusPoints,
  getPointsForWin,
  getStreakScoreMultiplier,
  getTotalPointsForWin,
  WORDLE_MODE_IDS,
  type PlayerDifficulty,
  type WordleModeId,
} from "@domain/wordle";
import type { EndOfGameScoreSummaryItem, EndOfGameSnapshot } from "./types";

export const shouldCompleteChallengesForMode = (
  modeId: WordleModeId,
): boolean =>
  modeId !== WORDLE_MODE_IDS.LIGHTNING && modeId !== WORDLE_MODE_IDS.DAILY;

export const resolveVictoryOutcomeForMode = ({
  modeId,
  answer,
  guessesLength,
  guessWords,
  playerDifficulty,
  playerStreak,
  hardModeEnabled,
  hardModeSecondsLeft,
}: {
  modeId: WordleModeId;
  answer: string;
  guessesLength: number;
  guessWords: string[];
  playerDifficulty: PlayerDifficulty;
  playerStreak: number;
  hardModeEnabled: boolean;
  hardModeSecondsLeft: number;
}): {
  awardedPoints: number;
  snapshot: EndOfGameSnapshot;
} => {
  if (modeId === WORDLE_MODE_IDS.DAILY) {
    const dailyWinsScore = 1;
    const scoreSummaryItems: EndOfGameScoreSummaryItem[] = [
      { key: "base", value: dailyWinsScore },
    ];

    return {
      awardedPoints: dailyWinsScore,
      snapshot: {
        answer,
        currentStreak: playerStreak + 1,
        bestStreak: playerStreak,
        challengeBonusPoints: 0,
        scoreSummary: {
          items: scoreSummaryItems,
          total: dailyWinsScore,
        },
      },
    };
  }

  const basePoints = getPointsForWin(guessesLength);
  const baseDifficultyMultiplier =
    getDifficultyScoreMultiplier(playerDifficulty);
  const timeBonus = hardModeEnabled
    ? getInsaneTimeBonus(hardModeSecondsLeft)
    : 0;
  const normalDictionaryRowsBonusMultiplier =
    playerDifficulty === "normal"
      ? getNormalDictionaryRowsBonusPoints(guessWords, answer)
      : 0;
  const difficultyMultiplier =
    baseDifficultyMultiplier + normalDictionaryRowsBonusMultiplier;
  const streakMultiplier = getStreakScoreMultiplier(playerStreak);
  const scoreSummaryItems: EndOfGameScoreSummaryItem[] = [
    { key: "base", value: basePoints },
    { key: "difficulty", value: difficultyMultiplier },
  ];

  if (normalDictionaryRowsBonusMultiplier > 0) {
    scoreSummaryItems.push({
      key: "dictionary",
      value: normalDictionaryRowsBonusMultiplier,
    });
  }

  if (streakMultiplier) {
    scoreSummaryItems.push({
      key: "streak",
      value: streakMultiplier,
    });
  }

  if (hardModeEnabled) {
    scoreSummaryItems.push({ key: "time", value: timeBonus });
  }

  const totalPoints = getTotalPointsForWin(
    guessesLength,
    difficultyMultiplier,
    playerStreak,
    timeBonus,
  );

  return {
    awardedPoints: totalPoints,
    snapshot: {
      answer,
      currentStreak: playerStreak + 1,
      bestStreak: playerStreak,
      challengeBonusPoints: 0,
      scoreSummary: {
        items: scoreSummaryItems,
        total: totalPoints,
      },
    },
  };
};
