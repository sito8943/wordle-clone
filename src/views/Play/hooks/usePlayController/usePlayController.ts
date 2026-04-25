import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import {
  clearAllDailyModeOutcomes,
  clearAllDailyShieldUsages,
  clearAllPersistedGameStates,
  clearDailyShieldUsage,
  clearDailyModeOutcome,
  consumeDailyShieldForDate,
  getTodayDateUTC,
  getGuessCombo,
  getNormalDictionaryBonusRowFlags,
  hasDailyShieldAvailableForDate,
  isWordleModeEnabled,
  readDailyModeOutcomeForDate,
  resolvePlayableWordleModeId,
  resolveScoreboardModeId,
  getRoundDurationMs,
  resolveRoundConfigForMode,
  resolveWordleModeId,
  writeDailyModeOutcomeForDate,
  WORDLE_MODE_IDS,
  type DailyModeOutcome,
  type Player,
  type PlayerDifficulty,
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
import { useHintController } from "../useHintController";
import { getHintsUsedForGame } from "../useHintController/utils";
import type {
  ComboFlash,
  EndOfGameSnapshot,
  UsePlayControllerOptions,
} from "./types";
import {
  canShareVictoryBoardFile,
  captureVictoryBoardImageFile,
  getGuessWords,
  getTileStatusSoundEvent,
  getVictoryBoardShareCaptureElement,
  hasSeenTutorialPromptForMode,
  hasSeenEndOfGameDialogInSession,
  isVictoryBoardShareSupported,
  markTutorialPromptAsSeenForMode,
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
import { ROUTES, getHelpRoute } from "@config/routes";
import {
  resolveVictoryOutcomeForMode,
  shouldCompleteChallengesForMode,
} from "./modeRules";

export default function usePlayController(
  options: UsePlayControllerOptions = {},
) {
  const navigate = useNavigate();
  const {
    scoreClient,
    wordDictionaryClient,
    challengeClient,
    dailyWordClient,
  } = useApi();
  const {
    player,
    replacePlayer,
    commitVictory,
    commitLoss,
    updatePlayerDifficulty,
    updatePlayerManualTileSelection,
  } = usePlayer();
  const { hintsEnabled, challengesEnabled, timerAutoPauseEnabled } =
    useFeatureFlags();
  const { playSound } = useSound();
  const gameplayLanguage = WORDS_DEFAULT_LANGUAGE;
  const modeId = useMemo(
    () => resolveWordleModeId(options.modeId),
    [options.modeId],
  );
  const modeEnabled = useMemo(() => isWordleModeEnabled(modeId), [modeId]);
  const activeModeId = useMemo(
    () => resolvePlayableWordleModeId(modeId),
    [modeId],
  );
  const activeScoreboardModeId = useMemo(
    () => resolveScoreboardModeId(activeModeId),
    [activeModeId],
  );
  const modeRoundConfig = useMemo(
    () => resolveRoundConfigForMode(activeModeId),
    [activeModeId],
  );

  const wordle = useWordle({
    allowUnknownWords:
      player.difficulty === "easy" ||
      player.difficulty === "normal" ||
      activeModeId === WORDLE_MODE_IDS.DAILY,
    language: gameplayLanguage,
    manualTileSelection: player.manualTileSelection === true,
    roundConfig: modeRoundConfig,
    modeId: activeModeId,
  });
  const {
    sessionId,
    gameId,
    roundStartedAt,
    roundConfig,
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

  const snapshotStreak = scoreClient.getCurrentClientScoreSnapshot(
    gameplayLanguage,
    activeScoreboardModeId,
  ).streak;
  const activeModeStreak =
    activeScoreboardModeId === WORDLE_MODE_IDS.CLASSIC &&
    snapshotStreak === 0 &&
    player.streak > 0
      ? // Backward-compat fallback for clients that still have legacy player streak
        // but no classic score snapshot cached yet.
        player.streak
      : snapshotStreak;

  const lightningModeActive = activeModeId === WORDLE_MODE_IDS.LIGHTNING;
  const dailyModeActive = activeModeId === WORDLE_MODE_IDS.DAILY;
  const resolveDailyModeOutcomeForToday = useCallback(
    (): DailyModeOutcome | null => {
      if (!dailyModeActive) {
        return null;
      }

      const currentPlayerOutcome = readDailyModeOutcomeForDate(player.code);
      if (currentPlayerOutcome !== null) {
        return currentPlayerOutcome;
      }

      return readDailyModeOutcomeForDate();
    },
    [dailyModeActive, player.code],
  );
  const showDeveloperChallengesSection =
    activeModeId === WORDLE_MODE_IDS.CLASSIC;
  const showDeveloperDailySection = activeModeId === WORDLE_MODE_IDS.DAILY;
  const hardModeEnabled = lightningModeActive || player.difficulty === "insane";
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
  const [dailyModeOutcomeAtEntry, setDailyModeOutcomeAtEntry] =
    useState<DailyModeOutcome | null>(resolveDailyModeOutcomeForToday);
  const [showDailyMeaningDialog, setShowDailyMeaningDialog] = useState(false);
  const [isLoadingDailyMeaning, setIsLoadingDailyMeaning] = useState(false);
  const [dailyMeaning, setDailyMeaning] = useState<string | null>(null);
  const [dailyMeaningError, setDailyMeaningError] = useState<string | null>(
    null,
  );
  const [showDeveloperConsoleDialog, setShowDeveloperConsoleDialog] =
    useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [showTutorialPromptDialog, setShowTutorialPromptDialog] = useState(
    () => !hasSeenTutorialPromptForMode(activeModeId, player.declinedTutorial),
  );
  const [pendingDifficulty, setPendingDifficulty] =
    useState<PlayerDifficulty | null>(null);
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
  const [dailyModeDeveloperMessage, setDailyModeDeveloperMessage] = useState<
    string | null
  >(null);
  const [dailyModeDeveloperMessageKind, setDailyModeDeveloperMessageKind] =
    useState<"success" | "error" | null>(null);
  const [endOfGameSnapshot, setEndOfGameSnapshot] =
    useState<EndOfGameSnapshot | null>(null);
  const [showLegacyEndOfGameFeedback, setShowLegacyEndOfGameFeedback] =
    useState(false);
  const [endOfGameDialogDismissed, setEndOfGameDialogDismissed] =
    useState(false);
  const [defeatShieldDecisionPending, setDefeatShieldDecisionPending] =
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
  const manualTileSelectionRef = useRef(player.manualTileSelection === true);
  const victoryBoardShareSupported = useMemo(
    () => isVictoryBoardShareSupported(),
    [],
  );
  const pauseHardModeTimerForDialogs =
    timerAutoPauseEnabled &&
    (showDictionaryChecksumDialog ||
      showRefreshDialog ||
      showWordsDialog ||
      showDailyMeaningDialog ||
      showDeveloperConsoleDialog ||
      showTutorialPromptDialog ||
      pendingDifficulty !== null);

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
  const dailyHintsLimitOverride = useMemo(() => {
    if (!dailyModeActive) {
      return undefined;
    }

    return Math.floor(answer.length / 3);
  }, [answer.length, dailyModeActive]);
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
    pauseTimer: pauseHardModeTimerForDialogs,
    pauseWhenHidden: timerAutoPauseEnabled,
    gameOver,
    guessesLength: guesses.length,
    currentLength: current.length,
    forceLoss,
    modeId: activeModeId,
  });
  const boardShakePulse = hardModeBoardShakePulse + invalidGuessShakePulse;

  useEffect(() => {
    setDailyModeOutcomeAtEntry(resolveDailyModeOutcomeForToday());
  }, [resolveDailyModeOutcomeForToday]);

  useEffect(() => {
    setShowTutorialPromptDialog(
      !hasSeenTutorialPromptForMode(activeModeId, player.declinedTutorial),
    );
  }, [activeModeId, player.declinedTutorial]);

  const completeEligibleChallenges = useCallback(async () => {
    if (
      !challengesEnabled ||
      !shouldCompleteChallengesForMode(activeModeId) ||
      !challengeClient?.isConfigured ||
      !gameOver
    ) {
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
        maxGuesses: roundConfig?.maxGuesses,
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
    activeModeId,
    player.code,
    player.difficulty,
    roundConfig?.maxGuesses,
    roundStartedAt,
    won,
  ]);

  useEffect(() => {
    const dailyModeWasAlreadyResolvedAtEntry =
      dailyModeActive && dailyModeOutcomeAtEntry !== null;

    if (!hydrated.current) {
      hydrated.current = true;

      if (dailyModeWasAlreadyResolvedAtEntry) {
        setDefeatShieldDecisionPending(false);
        roundSettled.current = gameOver;
        return;
      }

      if (gameOver && !won) {
        setShowLegacyEndOfGameFeedback(false);
        setEndOfGameDialogDismissed(false);
        setEndOfGameSnapshot({
          answer,
          currentStreak: activeModeStreak,
          bestStreak: activeModeStreak,
          challengeBonusPoints: 0,
          scoreSummary: null,
        });

        const canUseDailyShield =
          activeModeId !== WORDLE_MODE_IDS.DAILY &&
          hasDailyShieldAvailableForDate(player.code);
        setDefeatShieldDecisionPending(canUseDailyShield);

        if (!canUseDailyShield) {
          void commitLoss(activeModeId);
        }
      }

      roundSettled.current = gameOver;
      return;
    }

    if (!gameOver) {
      roundSettled.current = false;
      setEndOfGameDialogDismissed(false);
      setDefeatShieldDecisionPending(false);
      return;
    }

    if (roundSettled.current) {
      return;
    }

    setShowLegacyEndOfGameFeedback(false);
    setEndOfGameDialogDismissed(false);

    if (won) {
      setDefeatShieldDecisionPending(false);
      if (dailyModeActive) {
        writeDailyModeOutcomeForDate({
          outcome: "won",
          playerCode: player.code,
        });
      }

      const victoryOutcome = resolveVictoryOutcomeForMode({
        modeId: activeModeId,
        answer,
        guessesLength: guesses.length,
        guessWords,
        playerDifficulty: player.difficulty,
        playerStreak: activeModeStreak,
        hardModeEnabled,
        hardModeSecondsLeft,
      });

      setEndOfGameSnapshot(victoryOutcome.snapshot);
      void commitVictory(
        victoryOutcome.awardedPoints,
        undefined,
        roundStartedAt,
        activeModeId,
      );
    } else {
      if (dailyModeActive) {
        writeDailyModeOutcomeForDate({
          outcome: "lost",
          playerCode: player.code,
        });
      }

      setEndOfGameSnapshot({
        answer,
        currentStreak: activeModeStreak,
        bestStreak: activeModeStreak,
        challengeBonusPoints: 0,
        scoreSummary: null,
      });

      const canUseDailyShield =
        activeModeId !== WORDLE_MODE_IDS.DAILY &&
        hasDailyShieldAvailableForDate(player.code);
      setDefeatShieldDecisionPending(canUseDailyShield);

      if (!canUseDailyShield) {
        void commitLoss(activeModeId);
      }
    }

    void completeEligibleChallenges();
    roundSettled.current = true;
  }, [
    activeModeId,
    completeEligibleChallenges,
    gameOver,
    guesses,
    guesses.length,
    commitLoss,
    commitVictory,
    answer,
    guessWords,
    hardModeEnabled,
    hardModeSecondsLeft,
    dailyModeActive,
    dailyModeOutcomeAtEntry,
    player.code,
    player.difficulty,
    activeModeStreak,
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
    hintsLimitOverride: dailyHintsLimitOverride,
    hintStatusOverride: dailyModeActive ? "present" : undefined,
    roundConfig,
    hasInProgressGameAtMount,
    showResumeDialog,
    gameOver,
    current,
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

  const isDailyModeLockedForToday = useCallback((): boolean => {
    if (!dailyModeActive) {
      return false;
    }

    return resolveDailyModeOutcomeForToday() !== null;
  }, [dailyModeActive, resolveDailyModeOutcomeForToday]);

  const refreshBoardNow = useCallback(() => {
    if (isDailyModeLockedForToday() || defeatShieldDecisionPending) {
      return;
    }

    setEndOfGameSnapshot(null);
    setShowLegacyEndOfGameFeedback(false);
    setEndOfGameDialogDismissed(false);
    setDefeatShieldDecisionPending(false);
    setComboFlash(null);
    setShowSettingsPanel(false);
    setPendingDifficulty(null);
    setIsSharingVictoryBoard(false);
    setVictoryBoardShareError(null);
    setChallengeCompletionMessage(null);
    resetHints();
    resetHardModeTimer();
    acknowledgeDictionaryChecksumChange();
    refresh();
  }, [
    acknowledgeDictionaryChecksumChange,
    defeatShieldDecisionPending,
    isDailyModeLockedForToday,
    refresh,
    resetHardModeTimer,
    resetHints,
  ]);

  const startNewBoard = useCallback(() => {
    if (isDailyModeLockedForToday() || defeatShieldDecisionPending) {
      return;
    }

    setEndOfGameSnapshot(null);
    setShowLegacyEndOfGameFeedback(false);
    setEndOfGameDialogDismissed(false);
    setDefeatShieldDecisionPending(false);
    setComboFlash(null);
    setShowSettingsPanel(false);
    setPendingDifficulty(null);
    setIsSharingVictoryBoard(false);
    setVictoryBoardShareError(null);
    setChallengeCompletionMessage(null);
    resetHints();
    resetHardModeTimer();
    startNewWordleBoard();
  }, [
    defeatShieldDecisionPending,
    isDailyModeLockedForToday,
    resetHardModeTimer,
    resetHints,
    startNewWordleBoard,
  ]);

  const closeEndOfGameDialog = useCallback(() => {
    if (defeatShieldDecisionPending) {
      return;
    }

    setShowLegacyEndOfGameFeedback(true);
    setEndOfGameDialogDismissed(true);
    setIsSharingVictoryBoard(false);
    setVictoryBoardShareError(null);
  }, [defeatShieldDecisionPending]);

  const useDailyShieldForCurrentDefeat = useCallback(() => {
    if (!defeatShieldDecisionPending) {
      return;
    }

    consumeDailyShieldForDate({
      playerCode: player.code,
    });
    setDefeatShieldDecisionPending(false);
  }, [defeatShieldDecisionPending, player.code]);

  const skipDailyShieldForCurrentDefeat = useCallback(() => {
    if (!defeatShieldDecisionPending) {
      return;
    }

    setDefeatShieldDecisionPending(false);
    void commitLoss(activeModeId);
  }, [activeModeId, commitLoss, defeatShieldDecisionPending]);

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
  const openSettingsPanel = useCallback(() => {
    setShowSettingsPanel(true);
  }, []);

  const closeSettingsPanel = useCallback(() => {
    setShowSettingsPanel(false);
  }, []);
  const goToPlayRoute = useCallback(() => {
    navigate(ROUTES.PLAY);
  }, [navigate]);

  const acceptTutorialPrompt = useCallback(() => {
    markTutorialPromptAsSeenForMode(activeModeId);
    replacePlayer({ declinedTutorial: false });
    setShowTutorialPromptDialog(false);
    navigate(getHelpRoute(activeModeId));
  }, [activeModeId, navigate, replacePlayer]);

  const declineTutorialPrompt = useCallback(() => {
    markTutorialPromptAsSeenForMode(activeModeId);
    setShowTutorialPromptDialog(false);
    replacePlayer({ declinedTutorial: true });
  }, [activeModeId, replacePlayer]);

  useEffect(() => {
    manualTileSelectionRef.current = player.manualTileSelection === true;
  }, [player.manualTileSelection]);

  const changeManualTileSelection = useCallback(
    (enabled: boolean) => {
      if (enabled === manualTileSelectionRef.current) {
        return;
      }

      manualTileSelectionRef.current = enabled;
      updatePlayerManualTileSelection(enabled);
    },
    [updatePlayerManualTileSelection],
  );

  const changeDifficulty = useCallback(
    (nextDifficulty: PlayerDifficulty) => {
      if (nextDifficulty === player.difficulty) {
        return;
      }

      if (hasActiveGame) {
        setPendingDifficulty(nextDifficulty);
        return;
      }

      updatePlayerDifficulty(nextDifficulty);
    },
    [hasActiveGame, player.difficulty, updatePlayerDifficulty],
  );

  const confirmDifficultyChange = useCallback(() => {
    if (!pendingDifficulty) {
      return;
    }

    clearAllPersistedGameStates();
    updatePlayerDifficulty(pendingDifficulty);
    setPendingDifficulty(null);
    setShowSettingsPanel(false);
    startNewBoard();
  }, [pendingDifficulty, startNewBoard, updatePlayerDifficulty]);

  const cancelDifficultyChange = useCallback(() => {
    setPendingDifficulty(null);
  }, []);

  const isDifficultyChangeConfirmationOpen = pendingDifficulty !== null;
  const pendingDifficultyValue = pendingDifficulty ?? player.difficulty;

  const openWordsDialog = useCallback(() => {
    if (!wordListEnabledForDifficulty) {
      return;
    }

    setShowWordsDialog(true);
  }, [wordListEnabledForDifficulty]);

  const closeWordsDialog = useCallback(() => {
    setShowWordsDialog(false);
  }, []);

  const fetchDailyMeaning = useCallback(async () => {
    if (!dailyModeActive || isLoadingDailyMeaning) {
      return;
    }

    setIsLoadingDailyMeaning(true);
    setDailyMeaningError(null);

    try {
      const meaning = await dailyWordClient.getDailyMeaning(
        answer,
        getTodayDateUTC(),
      );

      if (!meaning) {
        setDailyMeaningError(i18n.t("play.dailyMeaningDialog.unavailable"));
        return;
      }

      setDailyMeaning(meaning);
    } catch {
      setDailyMeaningError(i18n.t("play.dailyMeaningDialog.unavailable"));
    } finally {
      setIsLoadingDailyMeaning(false);
    }
  }, [answer, dailyModeActive, dailyWordClient, isLoadingDailyMeaning]);

  const openDailyMeaningDialog = useCallback(() => {
    if (!dailyModeActive) {
      return;
    }

    setShowDailyMeaningDialog(true);

    if (dailyMeaning || isLoadingDailyMeaning) {
      return;
    }

    void fetchDailyMeaning();
  }, [dailyModeActive, dailyMeaning, fetchDailyMeaning, isLoadingDailyMeaning]);

  const closeDailyMeaningDialog = useCallback(() => {
    setShowDailyMeaningDialog(false);
  }, []);

  const retryDailyMeaningFetch = useCallback(() => {
    void fetchDailyMeaning();
  }, [fetchDailyMeaning]);

  const openDeveloperConsoleDialog = useCallback(() => {
    setDictionaryChecksumMessage(null);
    setDictionaryChecksumMessageKind(null);
    setDailyChallengesDeveloperMessage(null);
    setDailyChallengesDeveloperMessageKind(null);
    setDailyModeDeveloperMessage(null);
    setDailyModeDeveloperMessageKind(null);
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

  const resetDailyForCurrentPlayerForDeveloper = useCallback(() => {
    try {
      clearDailyModeOutcome(player.code);
      clearDailyModeOutcome();
      clearDailyShieldUsage(player.code);
      clearDailyShieldUsage();
      setDailyModeOutcomeAtEntry(null);
      setDailyModeDeveloperMessage(
        i18n.t("play.developerConsole.dailyCurrentPlayerResetSuccess"),
      );
      setDailyModeDeveloperMessageKind("success");

      if (dailyModeActive) {
        startNewBoard();
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : i18n.t("play.developerConsole.dailyResetError");
      setDailyModeDeveloperMessage(message);
      setDailyModeDeveloperMessageKind("error");
    }
  }, [dailyModeActive, player.code, startNewBoard]);

  const resetDailyForAllPlayersForDeveloper = useCallback(() => {
    try {
      clearAllDailyModeOutcomes();
      clearAllDailyShieldUsages();
      setDailyModeOutcomeAtEntry(null);
      setDailyModeDeveloperMessage(
        i18n.t("play.developerConsole.dailyAllPlayersResetSuccess"),
      );
      setDailyModeDeveloperMessageKind("success");

      if (dailyModeActive) {
        startNewBoard();
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : i18n.t("play.developerConsole.dailyResetError");
      setDailyModeDeveloperMessage(message);
      setDailyModeDeveloperMessageKind("error");
    }
  }, [dailyModeActive, startNewBoard]);

  const submitDeveloperPlayer = useCallback(
    (nextPlayer: Partial<Player>) => {
      const nextNick =
        typeof nextPlayer.name === "string" ? nextPlayer.name : player.name;
      const nextScore =
        typeof nextPlayer.score === "number" ? nextPlayer.score : player.score;
      const nextStreak =
        typeof nextPlayer.streak === "number"
          ? nextPlayer.streak
          : activeModeStreak;

      void scoreClient.recordScore(
        {
          nick: nextNick,
          language: gameplayLanguage,
          modeId: activeModeId,
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
      activeModeId,
      player.name,
      player.score,
      activeModeStreak,
      gameplayLanguage,
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
      setShowDailyMeaningDialog(false);
      setShowDeveloperConsoleDialog(false);
      setShowSettingsPanel(false);
      setPendingDifficulty(null);
      setDefeatShieldDecisionPending(false);
      setIsSharingVictoryBoard(false);
      setVictoryBoardShareError(null);
      setChallengeCompletionMessage(null);
      setDailyChallengesDeveloperMessage(null);
      setDailyChallengesDeveloperMessageKind(null);
      setDailyModeDeveloperMessage(null);
      setDailyModeDeveloperMessageKind(null);
    }
  }, [showResumeDialog]);

  useEffect(() => {
    if (!showDictionaryChecksumDialog) {
      return;
    }

    setShowRefreshDialog(false);
    setShowWordsDialog(false);
    setShowDailyMeaningDialog(false);
    setShowDeveloperConsoleDialog(false);
    setShowSettingsPanel(false);
    setPendingDifficulty(null);
  }, [showDictionaryChecksumDialog]);

  useEffect(() => {
    if (!wordListEnabledForDifficulty) {
      setShowWordsDialog(false);
    }
  }, [wordListEnabledForDifficulty]);

  useEffect(() => {
    setShowDailyMeaningDialog(false);
    setIsLoadingDailyMeaning(false);
    setDailyMeaning(null);
    setDailyMeaningError(null);
  }, [activeModeId, answer]);

  const showDailyCompletedDialog =
    dailyModeActive && dailyModeOutcomeAtEntry !== null;
  const showVictoryDialog =
    showEndOfGameDialogs &&
    gameOver &&
    won &&
    endOfGameSnapshot !== null &&
    !showDailyCompletedDialog &&
    !endOfGameDialogDismissed;
  const forceDefeatDialogForShield = defeatShieldDecisionPending;
  const showDefeatDialog =
    gameOver &&
    !won &&
    endOfGameSnapshot !== null &&
    !showDailyCompletedDialog &&
    (showEndOfGameDialogs || forceDefeatDialogForShield) &&
    !endOfGameDialogDismissed;
  const dailyCompletedAnswer = useMemo(() => {
    if (!showDailyCompletedDialog) {
      return null;
    }

    return dailyWordClient.getCachedWord(getTodayDateUTC());
  }, [dailyWordClient, showDailyCompletedDialog]);
  const endOfGameAnswer =
    showDailyCompletedDialog && dailyCompletedAnswer
      ? dailyCompletedAnswer
      : endOfGameSnapshot?.answer ?? answer;
  const showRefreshAttention =
    gameOver && !isDailyModeLockedForToday() && !defeatShieldDecisionPending;
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
        roundConfig,
      });

      if (!canShareVictoryBoardFile(boardImageFile)) {
        setVictoryBoardShareError(
          i18n.t("play.victoryDialog.shareErrors.unavailable"),
        );
        return;
      }

      const shareTextKey = lightningModeActive
        ? "play.victoryDialog.sharePayloadTextLightning"
        : "play.victoryDialog.sharePayloadText";

      await navigator.share({
        files: [boardImageFile],
        title: i18n.t("play.victoryDialog.sharePayloadTitle"),
        text: i18n.t(shareTextKey, {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    answer,
    guesses,
    isSharingVictoryBoard,
    lightningModeActive,
    roundConfig?.lettersPerRow,
    roundConfig?.maxGuesses,
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
    modeId,
    activeModeId,
    modeEnabled,
    manualTileSelection: player.manualTileSelection === true,
    showTutorialPromptDialog,
    acceptTutorialPrompt,
    declineTutorialPrompt,
    goToPlayRoute,
    showSettingsPanel,
    openSettingsPanel,
    closeSettingsPanel,
    pendingDifficulty: pendingDifficultyValue,
    isDifficultyChangeConfirmationOpen,
    changeDifficulty,
    confirmDifficultyChange,
    cancelDifficultyChange,
    changeManualTileSelection,
    currentLanguage: gameplayLanguage,
    currentWinStreak: activeModeStreak,
    showLegacyEndOfGameMessage:
      (!showEndOfGameDialogs && !defeatShieldDecisionPending) ||
      showLegacyEndOfGameFeedback,
    canReopenEndOfGameDialog,
    showRefreshAttention,
    refreshAttentionPulse,
    refreshAttentionScale: 0.14,
    showVictoryDialog,
    showDefeatDialog,
    showDailyCompletedDialog,
    showDefeatShieldActions: defeatShieldDecisionPending,
    useDailyShieldForCurrentDefeat,
    skipDailyShieldForCurrentDefeat,
    victoryBoardShareSupported,
    isSharingVictoryBoard,
    victoryBoardShareError,
    shareVictoryBoard,
    showEndOfGameSettingsHint,
    endOfGameAnswer,
    victoryScoreSummary: endOfGameSnapshot?.scoreSummary ?? null,
    endOfGameChallengeBonusPoints: endOfGameSnapshot?.challengeBonusPoints ?? 0,
    endOfGameCurrentStreak:
      endOfGameSnapshot?.currentStreak ?? activeModeStreak,
    endOfGameBestStreak: endOfGameSnapshot?.bestStreak ?? activeModeStreak,
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
    showDailyMeaningDialog,
    isLoadingDailyMeaning,
    dailyMeaning,
    dailyMeaningError,
    showDeveloperConsoleDialog,
    openWordsDialog,
    closeWordsDialog,
    openDailyMeaningDialog,
    closeDailyMeaningDialog,
    retryDailyMeaningFetch,
    openDeveloperConsoleDialog,
    closeDeveloperConsoleDialog,
    showDeveloperChallengesSection,
    showDeveloperDailySection,
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
    resetDailyForCurrentPlayerForDeveloper,
    resetDailyForAllPlayersForDeveloper,
    dailyModeDeveloperMessage,
    dailyModeDeveloperMessageKind,
    challengeCompletionMessage,
    confirmDictionaryChecksumRefresh,
    confirmRefreshBoard,
    cancelRefreshBoard,
  };
}
