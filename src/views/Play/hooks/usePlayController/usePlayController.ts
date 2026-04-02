import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getGuessCombo,
  getStreakScoreMultiplier,
  getDifficultyScoreMultiplier,
  getInsaneTimeBonus,
  getNormalDictionaryBonusRowFlags,
  getNormalDictionaryRowsBonusPoints,
  getPointsForWin,
  getTotalPointsForWin,
  type Player,
} from "@domain/wordle";
import { useApi, usePlayer } from "@providers";
import { useHardModeTimer } from "./useHardModeTimer";
import { UPDATE_SCORE_MUTATION } from "@api/score/constants";
import { useWordle } from "@hooks";
import { useHintController } from "../useHintController";
import type {
  ComboFlash,
  EndOfGameSnapshot,
  EndOfGameScoreSummaryItem,
} from "./types";
import {
  hasSeenEndOfGameDialogInSession,
  markEndOfGameDialogAsSeenInSession,
} from "./utils";
import { i18n } from "@i18n";
import { COMBO_FLASH_VISIBILITY_DURATION_MS } from "./constants";

const getGuessWords = (guesses: unknown[]): string[] =>
  guesses.reduce<string[]>((words, guess) => {
    if (typeof guess === "string") {
      words.push(guess);
      return words;
    }

    if (!guess || typeof guess !== "object") {
      return words;
    }

    const maybeWord = (guess as { word?: unknown }).word;

    if (typeof maybeWord === "string") {
      words.push(maybeWord);
    }

    return words;
  }, []);

export default function usePlayController() {
  const { scoreClient, wordDictionaryClient } = useApi();
  const { player, replacePlayer, commitVictory, commitLoss } = usePlayer();
  const wordle = useWordle({
    allowUnknownWords:
      player.difficulty === "easy" || player.difficulty === "normal",
    language: player.language,
    manualTileSelection: player.manualTileSelection === true,
  });
  const {
    sessionId,
    gameId,
    answer,
    won,
    guesses,
    current,
    gameOver,
    refresh,
    forceLoss,
    showResumeDialog,
    boardVersion,
    startNewBoard: startNewWordleBoard,
    revealHint,
  } = wordle;
  const hardModeEnabled = player.difficulty === "insane";

  const roundSettled = useRef(false);
  const hydrated = useRef(false);
  const previousGuessesLengthRef = useRef(guesses.length);
  const [showRefreshDialog, setShowRefreshDialog] = useState(false);
  const [showWordsDialog, setShowWordsDialog] = useState(false);
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const [showDeveloperConsoleDialog, setShowDeveloperConsoleDialog] =
    useState(false);
  const [isRefreshingDictionaryChecksum, setIsRefreshingDictionaryChecksum] =
    useState(false);
  const [dictionaryChecksumMessage, setDictionaryChecksumMessage] = useState<
    string | null
  >(null);
  const [dictionaryChecksumMessageKind, setDictionaryChecksumMessageKind] =
    useState<"success" | "error" | null>(null);
  const [endOfGameSnapshot, setEndOfGameSnapshot] =
    useState<EndOfGameSnapshot | null>(null);
  const [showLegacyEndOfGameFeedback, setShowLegacyEndOfGameFeedback] =
    useState(false);
  const [comboFlash, setComboFlash] = useState<ComboFlash | null>(null);
  const [refreshAttentionPulse, setRefreshAttentionPulse] = useState(0);
  const [showEndOfGameSettingsHint, setShowEndOfGameSettingsHint] =
    useState(false);

  const hasActiveGame = useMemo(
    () => !gameOver && (guesses.length > 0 || current.length > 0),
    [current.length, gameOver, guesses.length],
  );
  const guessWords = useMemo(
    () => getGuessWords(guesses as unknown[]),
    [guesses],
  );
  const normalDictionaryBonusRowFlags = useMemo(
    () =>
      player.difficulty === "normal"
        ? getNormalDictionaryBonusRowFlags(guessWords, answer)
        : [],
    [answer, guessWords, player.difficulty],
  );
  const hasInProgressGameAtMount = hasActiveGame;
  const wordListEnabledForDifficulty = player.difficulty === "easy";
  const {
    showHardModeTimer,
    showHardModeFinalStretchBar,
    hardModeSecondsLeft,
    hardModeTimerStarted,
    hardModeTickPulse,
    hardModeClockBoostScale,
    hardModeFinalStretchProgressPercent,
    boardShakePulse,
    resetHardModeTimer,
  } = useHardModeTimer({
    sessionId,
    hardModeEnabled,
    hasInProgressGameAtMount,
    boardVersion,
    showResumeDialog,
    gameOver,
    guessesLength: guesses.length,
    currentLength: current.length,
    forceLoss,
  });
  useEffect(() => {
    if (!hydrated.current) {
      hydrated.current = true;

      if (gameOver && !won) {
        void commitLoss();
      }

      roundSettled.current = gameOver;
      return;
    }

    if (!gameOver) {
      roundSettled.current = false;
      return;
    }

    if (roundSettled.current) {
      return;
    }

    if (won) {
      setShowLegacyEndOfGameFeedback(false);
      const basePoints = getPointsForWin(guesses.length);
      const baseDifficultyMultiplier = getDifficultyScoreMultiplier(
        player.difficulty,
      );
      const timeBonus =
        player.difficulty === "insane"
          ? getInsaneTimeBonus(hardModeSecondsLeft)
          : 0;
      const normalDictionaryRowsBonusMultiplier =
        player.difficulty === "normal"
          ? getNormalDictionaryRowsBonusPoints(guessWords, answer)
          : 0;
      const difficultyMultiplier =
        baseDifficultyMultiplier + normalDictionaryRowsBonusMultiplier;
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

      if (getStreakScoreMultiplier(player.streak)) {
        scoreSummaryItems.push({
          key: "streak",
          value: getStreakScoreMultiplier(player.streak),
        });
      }

      if (player.difficulty === "insane") {
        scoreSummaryItems.push({ key: "time", value: timeBonus });
      }

      const totalPoints = getTotalPointsForWin(
        guesses.length,
        difficultyMultiplier,
        player.streak,
        timeBonus,
      );

      setEndOfGameSnapshot({
        answer,
        currentStreak: player.streak + 1,
        bestStreak: player.streak,
        scoreSummary: {
          items: scoreSummaryItems,
          total: totalPoints,
        },
      });

      void commitVictory(totalPoints);
    } else {
      setShowLegacyEndOfGameFeedback(false);
      setEndOfGameSnapshot({
        answer,
        currentStreak: player.streak,
        bestStreak: player.streak,
        scoreSummary: null,
      });
      void commitLoss();
    }

    roundSettled.current = true;
  }, [
    gameOver,
    guesses,
    guesses.length,
    commitLoss,
    commitVictory,
    answer,
    guessWords,
    hardModeSecondsLeft,
    player.difficulty,
    player.streak,
    won,
  ]);

  const {
    hintsRemaining,
    hintsEnabledForDifficulty,
    hintButtonDisabled,
    useHint,
    resetHints,
  } = useHintController({
    answer,
    gameId,
    difficulty: player.difficulty,
    hasInProgressGameAtMount,
    showResumeDialog,
    gameOver,
    currentLength: current.length,
    revealHint,
  });

  useEffect(() => {
    const previousGuessesLength = previousGuessesLengthRef.current;
    previousGuessesLengthRef.current = guesses.length;

    if (guesses.length <= previousGuessesLength) {
      if (guesses.length === 0) {
        setComboFlash(null);
      }
      return;
    }

    const latestGuess = guesses[guesses.length - 1];
    const combo = getGuessCombo(latestGuess);

    if (!combo) {
      setComboFlash(null);
      return;
    }

    setComboFlash((previous) => ({
      ...combo,
      pulse: (previous?.pulse ?? 0) + 1,
    }));
  }, [guesses]);

  useEffect(() => {
    if (!comboFlash) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setComboFlash(null);
    }, COMBO_FLASH_VISIBILITY_DURATION_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [comboFlash]);

  const refreshBoardNow = useCallback(() => {
    setEndOfGameSnapshot(null);
    setShowLegacyEndOfGameFeedback(false);
    setComboFlash(null);
    resetHints();
    resetHardModeTimer();
    refresh();
  }, [refresh, resetHardModeTimer, resetHints]);

  const startNewBoard = useCallback(() => {
    setEndOfGameSnapshot(null);
    setShowLegacyEndOfGameFeedback(false);
    setComboFlash(null);
    resetHints();
    resetHardModeTimer();
    startNewWordleBoard();
  }, [resetHardModeTimer, resetHints, startNewWordleBoard]);

  const closeEndOfGameDialog = useCallback(() => {
    setEndOfGameSnapshot(null);
    setShowLegacyEndOfGameFeedback(true);
  }, []);

  const refreshBoard = useCallback(() => {
    if (hasActiveGame) {
      setShowRefreshDialog(true);
      return;
    }

    refreshBoardNow();
  }, [hasActiveGame, refreshBoardNow]);

  const confirmRefreshBoard = useCallback(() => {
    setShowRefreshDialog(false);
    refreshBoardNow();
  }, [refreshBoardNow]);

  const cancelRefreshBoard = useCallback(() => {
    setShowRefreshDialog(false);
  }, []);

  const openWordsDialog = useCallback(() => {
    if (!wordListEnabledForDifficulty) {
      return;
    }

    setShowWordsDialog(true);
  }, [wordListEnabledForDifficulty]);

  const closeWordsDialog = useCallback(() => {
    setShowWordsDialog(false);
  }, []);

  const openHelpDialog = useCallback(() => {
    setShowHelpDialog(true);
  }, []);

  const closeHelpDialog = useCallback(() => {
    setShowHelpDialog(false);
  }, []);

  const openDeveloperConsoleDialog = useCallback(() => {
    setDictionaryChecksumMessage(null);
    setDictionaryChecksumMessageKind(null);
    setShowDeveloperConsoleDialog(true);
  }, []);

  const closeDeveloperConsoleDialog = useCallback(() => {
    setShowDeveloperConsoleDialog(false);
  }, []);

  const refreshRemoteDictionaryChecksum = useCallback(async () => {
    if (isRefreshingDictionaryChecksum) {
      return;
    }

    setIsRefreshingDictionaryChecksum(true);
    setDictionaryChecksumMessage(null);
    setDictionaryChecksumMessageKind(null);

    try {
      const refreshed = await wordDictionaryClient.refreshRemoteChecksum(
        player.language,
      );
      setDictionaryChecksumMessage(
        i18n.t("play.developerConsole.checksumUpdated", {
          checksum: refreshed.checksum,
        }),
      );
      setDictionaryChecksumMessageKind("success");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : i18n.t("play.developerConsole.checksumRefreshError");
      setDictionaryChecksumMessage(message);
      setDictionaryChecksumMessageKind("error");
    } finally {
      setIsRefreshingDictionaryChecksum(false);
    }
  }, [isRefreshingDictionaryChecksum, player.language, wordDictionaryClient]);

  const submitDeveloperPlayer = useCallback(
    (nextPlayer: Partial<Player>) => {
      const nextNick =
        typeof nextPlayer.name === "string" ? nextPlayer.name : player.name;
      const nextScore =
        typeof nextPlayer.score === "number" ? nextPlayer.score : player.score;
      const nextStreak =
        typeof nextPlayer.streak === "number"
          ? nextPlayer.streak
          : player.streak;

      void scoreClient.recordScore(
        {
          nick: nextNick,
          language: player.language,
          score: nextScore,
          streak: nextStreak,
          overwriteExisting: true,
        },
        UPDATE_SCORE_MUTATION,
      );

      replacePlayer(nextPlayer);
      setShowDeveloperConsoleDialog(false);
    },
    [
      player.language,
      player.name,
      player.score,
      player.streak,
      replacePlayer,
      scoreClient,
    ],
  );

  useEffect(() => {
    if (showResumeDialog) {
      setEndOfGameSnapshot(null);
      setShowLegacyEndOfGameFeedback(false);
      setComboFlash(null);
      setShowRefreshDialog(false);
      setShowWordsDialog(false);
      setShowHelpDialog(false);
      setShowDeveloperConsoleDialog(false);
    }
  }, [showResumeDialog]);

  useEffect(() => {
    if (!wordListEnabledForDifficulty) {
      setShowWordsDialog(false);
    }
  }, [wordListEnabledForDifficulty]);

  const showEndOfGameDialogs = player.showEndOfGameDialogs;
  const showVictoryDialog =
    showEndOfGameDialogs && gameOver && won && endOfGameSnapshot !== null;
  const showDefeatDialog =
    showEndOfGameDialogs && gameOver && !won && endOfGameSnapshot !== null;
  const showRefreshAttention = gameOver;
  const endOfGameDialogVisible = showVictoryDialog || showDefeatDialog;

  useEffect(() => {
    if (!endOfGameDialogVisible) {
      return;
    }

    if (hasSeenEndOfGameDialogInSession()) {
      setShowEndOfGameSettingsHint(false);
      return;
    }

    markEndOfGameDialogAsSeenInSession();
    setShowEndOfGameSettingsHint(true);
  }, [endOfGameDialogVisible]);

  useEffect(() => {
    if (!showRefreshAttention) {
      setRefreshAttentionPulse(0);
      return;
    }

    setRefreshAttentionPulse((previous) => previous + 1);

    const intervalId = window.setInterval(() => {
      setRefreshAttentionPulse((previous) => previous + 1);
    }, 1400);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [showRefreshAttention]);

  return {
    ...wordle,
    manualTileSelection: player.manualTileSelection === true,
    currentLanguage: player.language,
    currentWinStreak: player.streak,
    showLegacyEndOfGameMessage:
      !showEndOfGameDialogs || showLegacyEndOfGameFeedback,
    showRefreshAttention,
    refreshAttentionPulse,
    refreshAttentionScale: 0.14,
    showVictoryDialog,
    showDefeatDialog,
    showEndOfGameSettingsHint,
    endOfGameAnswer: endOfGameSnapshot?.answer ?? answer,
    victoryScoreSummary: endOfGameSnapshot?.scoreSummary ?? null,
    endOfGameCurrentStreak: endOfGameSnapshot?.currentStreak ?? player.streak,
    endOfGameBestStreak: endOfGameSnapshot?.bestStreak ?? player.streak,
    closeEndOfGameDialog,
    wordListEnabledForDifficulty,
    showHardModeTimer,
    showHardModeFinalStretchBar,
    hardModeSecondsLeft,
    hardModeTimerStarted,
    hardModeTickPulse,
    hardModeClockBoostScale,
    hardModeFinalStretchProgressPercent,
    boardShakePulse,
    useHint,
    hintsRemaining,
    hintsEnabledForDifficulty,
    hintButtonDisabled,
    comboFlash,
    normalDictionaryBonusRowFlags,
    startNewBoard,
    refreshBoard,
    showRefreshDialog,
    showWordsDialog,
    showHelpDialog,
    showDeveloperConsoleDialog,
    openWordsDialog,
    closeWordsDialog,
    openHelpDialog,
    closeHelpDialog,
    openDeveloperConsoleDialog,
    closeDeveloperConsoleDialog,
    submitDeveloperPlayer,
    refreshRemoteDictionaryChecksum,
    isRefreshingDictionaryChecksum,
    dictionaryChecksumMessage,
    dictionaryChecksumMessageKind,
    confirmRefreshBoard,
    cancelRefreshBoard,
  };
}
