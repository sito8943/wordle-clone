import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getGuessCombo,
  getStreakScoreMultiplier,
  getDifficultyScoreMultiplier,
  getInsaneTimeBonus,
  getNormalDictionaryBonusRowFlags,
  getNormalDictionaryRowsBonusPoints,
  getPointsForWin,
  getRoundDurationMs,
  getTotalPointsForWin,
  type Player,
} from "@domain/wordle";
import {
  evaluateCondition,
  notifyDailyChallengesProgressUpdated,
  recordDailyChallengeRoundCompletion,
  resetDailyChallengeRoundTracker,
  type ChallengeConditionContext,
} from "@domain/challenges";
import { useApi, usePlayer } from "@providers";
import { useFeatureFlags } from "@providers/FeatureFlags";
import { useSound } from "@providers/Sound";
import { useHardModeTimer } from "./useHardModeTimer";
import type { RemoteChallenge } from "@api/challenges";
import { UPDATE_SCORE_MUTATION } from "@api/score/constants";
import { WORDS_DEFAULT_LANGUAGE } from "@api/words";
import { useWordle } from "@hooks";
import { getTodayDateUTC } from "@hooks/useChallenges";
import { useHintController } from "../useHintController";
import { getHintsUsedForGame } from "../useHintController/utils";
import type {
  ComboFlash,
  EndOfGameSnapshot,
  EndOfGameScoreSummaryItem,
} from "./types";
import {
  canShareVictoryBoardFile,
  captureVictoryBoardImageFile,
  getVictoryBoardShareCaptureElement,
  hasSeenEndOfGameDialogInSession,
  isVictoryBoardShareSupported,
  markEndOfGameDialogAsSeenInSession,
} from "./utils";
import { i18n } from "@i18n";
import {
  CHALLENGE_COMPLETION_ALERT_VISIBILITY_DURATION_MS,
  COMBO_FLASH_VISIBILITY_DURATION_MS,
} from "./constants";
import {
  TILE_STATUS_SOUND_INITIAL_DELAY_MS,
  TILE_STATUS_SOUND_STEP_DELAY_MS,
} from "@providers/Sound/constants";

const getTileStatusSoundEvent = (
  status: unknown,
): "tile_correct" | "tile_present" | "tile_absent" | null => {
  if (status === "correct") {
    return "tile_correct";
  }

  if (status === "present") {
    return "tile_present";
  }

  if (status === "absent") {
    return "tile_absent";
  }

  return null;
};

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
  const { scoreClient, wordDictionaryClient, challengeClient } = useApi();
  const { player, replacePlayer, commitVictory, commitLoss } = usePlayer();
  const { hintsEnabled, challengesEnabled } = useFeatureFlags();
  const { playSound } = useSound();
  const gameplayLanguage = WORDS_DEFAULT_LANGUAGE;
  const wordle = useWordle({
    allowUnknownWords:
      player.difficulty === "easy" || player.difficulty === "normal",
    language: gameplayLanguage,
    manualTileSelection: player.manualTileSelection === true,
  });
  const {
    sessionId,
    gameId,
    roundStartedAt,
    answer,
    won,
    guesses,
    current,
    gameOver,
    refresh,
    forceLoss,
    showResumeDialog,
    showDictionaryChecksumDialog,
    acknowledgeDictionaryChecksumChange,
    boardVersion,
    startNewBoard: startNewWordleBoard,
    revealHint,
    invalidGuessShakePulse = 0,
  } = wordle;
  const hardModeEnabled = player.difficulty === "insane";
  const showEndOfGameDialogs = player.showEndOfGameDialogs;

  const roundSettled = useRef(false);
  const hydrated = useRef(false);
  const didMountRoundStartSoundRef = useRef(false);
  const previousBoardVersionForSoundRef = useRef(boardVersion);
  const didMountRoundResultSoundRef = useRef(false);
  const previousGameOverForSoundRef = useRef(gameOver);
  const previousGuessesLengthForSoundRef = useRef(guesses.length);
  const previousGuessesLengthRef = useRef(guesses.length);
  const [showRefreshDialog, setShowRefreshDialog] = useState(false);
  const [showWordsDialog, setShowWordsDialog] = useState(false);
  const [showDeveloperConsoleDialog, setShowDeveloperConsoleDialog] =
    useState(false);
  const [isRefreshingDictionaryChecksum, setIsRefreshingDictionaryChecksum] =
    useState(false);
  const [dictionaryChecksumMessage, setDictionaryChecksumMessage] = useState<
    string | null
  >(null);
  const [dictionaryChecksumMessageKind, setDictionaryChecksumMessageKind] =
    useState<"success" | "error" | null>(null);
  const [
    isRefreshingDailyChallengesForDeveloper,
    setIsRefreshingDailyChallengesForDeveloper,
  ] = useState(false);
  const [
    isChangingDailyChallengesForDeveloper,
    setIsChangingDailyChallengesForDeveloper,
  ] = useState(false);
  const [dailyChallengesDeveloperMessage, setDailyChallengesDeveloperMessage] =
    useState<string | null>(null);
  const [
    dailyChallengesDeveloperMessageKind,
    setDailyChallengesDeveloperMessageKind,
  ] = useState<"success" | "error" | null>(null);
  const [endOfGameSnapshot, setEndOfGameSnapshot] =
    useState<EndOfGameSnapshot | null>(null);
  const [showLegacyEndOfGameFeedback, setShowLegacyEndOfGameFeedback] =
    useState(false);
  const [endOfGameDialogDismissed, setEndOfGameDialogDismissed] =
    useState(false);
  const [comboFlash, setComboFlash] = useState<ComboFlash | null>(null);
  const [challengeCompletionMessage, setChallengeCompletionMessage] = useState<
    string | null
  >(null);
  const [refreshAttentionPulse, setRefreshAttentionPulse] = useState(0);
  const [showEndOfGameSettingsHint, setShowEndOfGameSettingsHint] =
    useState(false);
  const [isSharingVictoryBoard, setIsSharingVictoryBoard] = useState(false);
  const [victoryBoardShareError, setVictoryBoardShareError] = useState<
    string | null
  >(null);
  const victoryBoardShareSupported = useMemo(
    () => isVictoryBoardShareSupported(),
    [],
  );

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
    boardShakePulse: hardModeBoardShakePulse,
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
  const boardShakePulse = hardModeBoardShakePulse + invalidGuessShakePulse;
  const completeEligibleChallenges = useCallback(async () => {
    if (!challengesEnabled || !challengeClient?.isConfigured || !gameOver) {
      return;
    }

    const date = getTodayDateUTC();
    const dailyTracker = recordDailyChallengeRoundCompletion({
      date,
      playerCode: player.code,
      won,
    });

    try {
      let todayChallenges = await challengeClient.getTodayChallenges(date);

      if (!todayChallenges) {
        todayChallenges = await challengeClient.generateDailyChallenges(date);
      }

      const progress = await challengeClient.getPlayerChallengeProgress(date);
      const completedChallengeIds = new Set(
        progress
          .filter((item) => item.completed)
          .map((item) => item.challengeId),
      );
      const roundDurationMs =
        getRoundDurationMs(roundStartedAt, Date.now()) ??
        Number.MAX_SAFE_INTEGER;
      const context: ChallengeConditionContext = {
        guesses,
        gameOver,
        won,
        answer,
        playerDifficulty: player.difficulty,
        roundDurationMs,
        dailyCompletedRounds: dailyTracker.completedRounds,
        dailyWonRounds: dailyTracker.wonRounds,
        dailyConsecutiveWins: dailyTracker.consecutiveWins,
        hintsUsed: getHintsUsedForGame(gameId, answer),
      };
      let completedInRound = 0;
      let awardedPointsInRound = 0;
      const completedChallengeNames: string[] = [];

      const completeChallengesForPeriod = async (
        challenges: Array<RemoteChallenge>,
        completedIds: Set<string>,
        periodKey: string,
      ) => {
        for (const challenge of challenges) {
          if (completedIds.has(challenge.id)) {
            continue;
          }

          if (!evaluateCondition(challenge.conditionKey, context)) {
            continue;
          }

          const completion = await challengeClient.completeChallenge(
            challenge.id,
            periodKey,
          );

          if (completion.alreadyCompleted || completion.pointsAwarded <= 0) {
            continue;
          }

          completedIds.add(challenge.id);
          completedInRound += 1;
          awardedPointsInRound += completion.pointsAwarded;
          completedChallengeNames.push(
            i18n.t(`challenges.names.${challenge.conditionKey}`),
          );
        }
      };

      await completeChallengesForPeriod(
        [todayChallenges.simple, todayChallenges.complex],
        completedChallengeIds,
        date,
      );

      if (completedInRound === 0 || awardedPointsInRound <= 0) {
        return;
      }

      if (won) {
        setEndOfGameSnapshot((currentSnapshot) => {
          if (!currentSnapshot) {
            return currentSnapshot;
          }

          return {
            ...currentSnapshot,
            challengeBonusPoints:
              currentSnapshot.challengeBonusPoints + awardedPointsInRound,
          };
        });
      }

      setChallengeCompletionMessage(
        completedInRound === 1
          ? i18n.t("challenges.challengeCompleted", {
              name: completedChallengeNames[0] ?? "",
              points: awardedPointsInRound,
            })
          : i18n.t("challenges.challengeCompletedMultiple", {
              count: completedInRound,
              points: awardedPointsInRound,
            }),
      );
      notifyDailyChallengesProgressUpdated();
    } catch {
      // Silently fail — round flow must continue even if challenges fail.
    }
  }, [
    answer,
    challengeClient,
    challengesEnabled,
    gameId,
    gameOver,
    guesses,
    player.code,
    player.difficulty,
    roundStartedAt,
    won,
  ]);

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
      setEndOfGameDialogDismissed(false);
      return;
    }

    if (roundSettled.current) {
      return;
    }

    setShowLegacyEndOfGameFeedback(false);
    setEndOfGameDialogDismissed(false);

    if (won) {
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
        challengeBonusPoints: 0,
        scoreSummary: {
          items: scoreSummaryItems,
          total: totalPoints,
        },
      });

      void commitVictory(totalPoints, undefined, roundStartedAt);
    } else {
      setEndOfGameSnapshot({
        answer,
        currentStreak: player.streak,
        bestStreak: player.streak,
        challengeBonusPoints: 0,
        scoreSummary: null,
      });
      void commitLoss();
    }

    void completeEligibleChallenges();
    roundSettled.current = true;
  }, [
    completeEligibleChallenges,
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
    roundStartedAt,
    won,
  ]);

  const {
    hintsRemaining,
    hintsEnabledForDifficulty: hintsEnabledByDifficulty,
    hintButtonDisabled,
    useHint: consumeHintControllerAction,
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
  const hintsEnabledForDifficulty = hintsEnabled && hintsEnabledByDifficulty;
  const useHint = useCallback(() => {
    if (!hintsEnabled) {
      return;
    }

    const hintUsed = consumeHintControllerAction();
    if (hintUsed) {
      playSound("hint_use");
    }
  }, [consumeHintControllerAction, hintsEnabled, playSound]);

  useEffect(() => {
    if (!didMountRoundStartSoundRef.current) {
      didMountRoundStartSoundRef.current = true;
      previousBoardVersionForSoundRef.current = boardVersion;

      if (!showResumeDialog) {
        playSound("round_start");
      }
      return;
    }

    const boardVersionChanged =
      boardVersion !== previousBoardVersionForSoundRef.current;
    previousBoardVersionForSoundRef.current = boardVersion;

    if (!showResumeDialog && boardVersionChanged) {
      playSound("round_start");
    }
  }, [boardVersion, playSound, showResumeDialog]);

  useEffect(() => {
    const previousGuessesLength = previousGuessesLengthForSoundRef.current;
    previousGuessesLengthForSoundRef.current = guesses.length;

    if (guesses.length <= previousGuessesLength) {
      return;
    }

    playSound("line_change");

    const latestGuess = guesses[guesses.length - 1];
    if (!latestGuess || typeof latestGuess !== "object") {
      return;
    }

    const statuses = (latestGuess as { statuses?: unknown }).statuses;
    if (!Array.isArray(statuses)) {
      return;
    }

    statuses.forEach((status, index) => {
      const soundEvent = getTileStatusSoundEvent(status);
      if (!soundEvent) {
        return;
      }

      playSound(soundEvent, {
        delayMs:
          TILE_STATUS_SOUND_INITIAL_DELAY_MS +
          index * TILE_STATUS_SOUND_STEP_DELAY_MS,
      });
    });
  }, [guesses, playSound]);

  useEffect(() => {
    if (!didMountRoundResultSoundRef.current) {
      didMountRoundResultSoundRef.current = true;
      previousGameOverForSoundRef.current = gameOver;
      return;
    }

    if (!previousGameOverForSoundRef.current && gameOver) {
      playSound(won ? "round_win" : "round_loss");
    }

    previousGameOverForSoundRef.current = gameOver;
  }, [gameOver, playSound, won]);

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

  useEffect(() => {
    if (!challengeCompletionMessage) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setChallengeCompletionMessage(null);
    }, CHALLENGE_COMPLETION_ALERT_VISIBILITY_DURATION_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [challengeCompletionMessage]);

  const refreshBoardNow = useCallback(() => {
    setEndOfGameSnapshot(null);
    setShowLegacyEndOfGameFeedback(false);
    setEndOfGameDialogDismissed(false);
    setComboFlash(null);
    setIsSharingVictoryBoard(false);
    setVictoryBoardShareError(null);
    setChallengeCompletionMessage(null);
    resetHints();
    resetHardModeTimer();
    acknowledgeDictionaryChecksumChange();
    refresh();
  }, [
    acknowledgeDictionaryChecksumChange,
    refresh,
    resetHardModeTimer,
    resetHints,
  ]);

  const startNewBoard = useCallback(() => {
    setEndOfGameSnapshot(null);
    setShowLegacyEndOfGameFeedback(false);
    setEndOfGameDialogDismissed(false);
    setComboFlash(null);
    setIsSharingVictoryBoard(false);
    setVictoryBoardShareError(null);
    setChallengeCompletionMessage(null);
    resetHints();
    resetHardModeTimer();
    startNewWordleBoard();
  }, [resetHardModeTimer, resetHints, startNewWordleBoard]);

  const closeEndOfGameDialog = useCallback(() => {
    setShowLegacyEndOfGameFeedback(true);
    setEndOfGameDialogDismissed(true);
    setIsSharingVictoryBoard(false);
    setVictoryBoardShareError(null);
  }, []);

  const reopenEndOfGameDialog = useCallback(() => {
    if (!showEndOfGameDialogs || !gameOver || endOfGameSnapshot === null) {
      return;
    }

    setShowLegacyEndOfGameFeedback(false);
    setEndOfGameDialogDismissed(false);
  }, [endOfGameSnapshot, gameOver, showEndOfGameDialogs]);

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
  const confirmDictionaryChecksumRefresh = useCallback(() => {
    refreshBoardNow();
  }, [refreshBoardNow]);

  const openWordsDialog = useCallback(() => {
    if (!wordListEnabledForDifficulty) {
      return;
    }

    setShowWordsDialog(true);
  }, [wordListEnabledForDifficulty]);

  const closeWordsDialog = useCallback(() => {
    setShowWordsDialog(false);
  }, []);

  const openDeveloperConsoleDialog = useCallback(() => {
    setDictionaryChecksumMessage(null);
    setDictionaryChecksumMessageKind(null);
    setDailyChallengesDeveloperMessage(null);
    setDailyChallengesDeveloperMessageKind(null);
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
      const refreshed =
        await wordDictionaryClient.refreshRemoteChecksum(gameplayLanguage);
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
  }, [gameplayLanguage, isRefreshingDictionaryChecksum, wordDictionaryClient]);

  const refreshDailyChallengesForDeveloper = useCallback(async () => {
    if (
      isRefreshingDailyChallengesForDeveloper ||
      isChangingDailyChallengesForDeveloper
    ) {
      return;
    }

    setIsRefreshingDailyChallengesForDeveloper(true);
    setDailyChallengesDeveloperMessage(null);
    setDailyChallengesDeveloperMessageKind(null);

    if (!challengeClient.isConfigured) {
      setDailyChallengesDeveloperMessage(
        i18n.t("play.developerConsole.challengesActionError"),
      );
      setDailyChallengesDeveloperMessageKind("error");
      setIsRefreshingDailyChallengesForDeveloper(false);
      return;
    }

    try {
      await challengeClient.seedChallenges();
      const date = getTodayDateUTC();
      let todayChallenges = await challengeClient.getTodayChallenges(date);

      if (!todayChallenges) {
        todayChallenges = await challengeClient.generateDailyChallenges(date);
      }
      const resetResult =
        await challengeClient.resetPlayerChallengeProgressForDate(date);
      resetDailyChallengeRoundTracker(date, player.code);

      setDailyChallengesDeveloperMessage(
        i18n.t("play.developerConsole.challengesRefreshed", {
          simple: i18n.t(
            `challenges.names.${todayChallenges.simple.conditionKey}`,
          ),
          complex: i18n.t(
            `challenges.names.${todayChallenges.complex.conditionKey}`,
          ),
          count: resetResult.resetCount,
          points: resetResult.pointsReverted,
        }),
      );
      setDailyChallengesDeveloperMessageKind("success");
      notifyDailyChallengesProgressUpdated();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : i18n.t("play.developerConsole.challengesActionError");
      setDailyChallengesDeveloperMessage(message);
      setDailyChallengesDeveloperMessageKind("error");
    } finally {
      setIsRefreshingDailyChallengesForDeveloper(false);
    }
  }, [
    challengeClient,
    isChangingDailyChallengesForDeveloper,
    isRefreshingDailyChallengesForDeveloper,
    player.code,
  ]);

  const changeDailyChallengesForDeveloper = useCallback(async () => {
    if (
      isChangingDailyChallengesForDeveloper ||
      isRefreshingDailyChallengesForDeveloper
    ) {
      return;
    }

    setIsChangingDailyChallengesForDeveloper(true);
    setDailyChallengesDeveloperMessage(null);
    setDailyChallengesDeveloperMessageKind(null);

    if (!challengeClient.isConfigured) {
      setDailyChallengesDeveloperMessage(
        i18n.t("play.developerConsole.challengesActionError"),
      );
      setDailyChallengesDeveloperMessageKind("error");
      setIsChangingDailyChallengesForDeveloper(false);
      return;
    }

    try {
      await challengeClient.seedChallenges();
      const date = getTodayDateUTC();
      const todayChallenges =
        await challengeClient.regenerateDailyChallenges(date);
      const resetResult =
        await challengeClient.resetPlayerChallengeProgressForDate(date);
      resetDailyChallengeRoundTracker(date, player.code);

      setDailyChallengesDeveloperMessage(
        i18n.t("play.developerConsole.challengesChanged", {
          simple: i18n.t(
            `challenges.names.${todayChallenges.simple.conditionKey}`,
          ),
          complex: i18n.t(
            `challenges.names.${todayChallenges.complex.conditionKey}`,
          ),
          count: resetResult.resetCount,
          points: resetResult.pointsReverted,
        }),
      );
      setDailyChallengesDeveloperMessageKind("success");
      notifyDailyChallengesProgressUpdated();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : i18n.t("play.developerConsole.challengesActionError");
      setDailyChallengesDeveloperMessage(message);
      setDailyChallengesDeveloperMessageKind("error");
    } finally {
      setIsChangingDailyChallengesForDeveloper(false);
    }
  }, [
    challengeClient,
    isChangingDailyChallengesForDeveloper,
    isRefreshingDailyChallengesForDeveloper,
    player.code,
  ]);

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
      setEndOfGameDialogDismissed(false);
      setComboFlash(null);
      setShowRefreshDialog(false);
      setShowWordsDialog(false);
      setShowDeveloperConsoleDialog(false);
      setIsSharingVictoryBoard(false);
      setVictoryBoardShareError(null);
      setChallengeCompletionMessage(null);
      setDailyChallengesDeveloperMessage(null);
      setDailyChallengesDeveloperMessageKind(null);
    }
  }, [showResumeDialog]);

  useEffect(() => {
    if (!showDictionaryChecksumDialog) {
      return;
    }

    setShowRefreshDialog(false);
    setShowWordsDialog(false);
    setShowDeveloperConsoleDialog(false);
  }, [showDictionaryChecksumDialog]);

  useEffect(() => {
    if (!wordListEnabledForDifficulty) {
      setShowWordsDialog(false);
    }
  }, [wordListEnabledForDifficulty]);

  const showVictoryDialog =
    showEndOfGameDialogs &&
    gameOver &&
    won &&
    endOfGameSnapshot !== null &&
    !endOfGameDialogDismissed;
  const showDefeatDialog =
    showEndOfGameDialogs &&
    gameOver &&
    !won &&
    endOfGameSnapshot !== null &&
    !endOfGameDialogDismissed;
  const showRefreshAttention = gameOver;
  const endOfGameDialogVisible = showVictoryDialog || showDefeatDialog;
  const canReopenEndOfGameDialog =
    showEndOfGameDialogs &&
    gameOver &&
    endOfGameSnapshot !== null &&
    endOfGameDialogDismissed;

  const shareVictoryBoard = useCallback(async () => {
    if (
      !victoryBoardShareSupported ||
      isSharingVictoryBoard ||
      !showVictoryDialog
    ) {
      return;
    }

    const boardElement = getVictoryBoardShareCaptureElement();

    if (!boardElement) {
      setVictoryBoardShareError(
        i18n.t("play.victoryDialog.shareErrors.captureUnavailable"),
      );
      return;
    }

    setVictoryBoardShareError(null);
    setIsSharingVictoryBoard(true);

    try {
      const boardImageFile = await captureVictoryBoardImageFile(boardElement, {
        answer,
        guesses,
      });

      if (!canShareVictoryBoardFile(boardImageFile)) {
        setVictoryBoardShareError(
          i18n.t("play.victoryDialog.shareErrors.unavailable"),
        );
        return;
      }

      await navigator.share({
        files: [boardImageFile],
        title: i18n.t("play.victoryDialog.sharePayloadTitle"),
        text: i18n.t("play.victoryDialog.sharePayloadText", {
          count: guesses.length,
        }),
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      setVictoryBoardShareError(
        i18n.t("play.victoryDialog.shareErrors.captureFailed"),
      );
    } finally {
      setIsSharingVictoryBoard(false);
    }
  }, [
    answer,
    guesses,
    isSharingVictoryBoard,
    showVictoryDialog,
    victoryBoardShareSupported,
  ]);

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
    if (showVictoryDialog) {
      return;
    }

    setIsSharingVictoryBoard(false);
    setVictoryBoardShareError(null);
  }, [showVictoryDialog]);

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
    currentLanguage: gameplayLanguage,
    currentWinStreak: player.streak,
    showLegacyEndOfGameMessage:
      !showEndOfGameDialogs || showLegacyEndOfGameFeedback,
    canReopenEndOfGameDialog,
    showRefreshAttention,
    refreshAttentionPulse,
    refreshAttentionScale: 0.14,
    showVictoryDialog,
    showDefeatDialog,
    victoryBoardShareSupported,
    isSharingVictoryBoard,
    victoryBoardShareError,
    shareVictoryBoard,
    showEndOfGameSettingsHint,
    endOfGameAnswer: endOfGameSnapshot?.answer ?? answer,
    victoryScoreSummary: endOfGameSnapshot?.scoreSummary ?? null,
    endOfGameChallengeBonusPoints: endOfGameSnapshot?.challengeBonusPoints ?? 0,
    endOfGameCurrentStreak: endOfGameSnapshot?.currentStreak ?? player.streak,
    endOfGameBestStreak: endOfGameSnapshot?.bestStreak ?? player.streak,
    closeEndOfGameDialog,
    reopenEndOfGameDialog,
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
    showDeveloperConsoleDialog,
    openWordsDialog,
    closeWordsDialog,
    openDeveloperConsoleDialog,
    closeDeveloperConsoleDialog,
    submitDeveloperPlayer,
    refreshRemoteDictionaryChecksum,
    isRefreshingDictionaryChecksum,
    dictionaryChecksumMessage,
    dictionaryChecksumMessageKind,
    refreshDailyChallengesForDeveloper,
    changeDailyChallengesForDeveloper,
    isRefreshingDailyChallengesForDeveloper,
    isChangingDailyChallengesForDeveloper,
    dailyChallengesDeveloperMessage,
    dailyChallengesDeveloperMessageKind,
    challengeCompletionMessage,
    confirmDictionaryChecksumRefresh,
    confirmRefreshBoard,
    cancelRefreshBoard,
  };
}
