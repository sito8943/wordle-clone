import { useMemo } from "react";
import { env } from "@config";
import type { Player } from "@domain/wordle";
import type {
  BoardSectionProps,
  DialogsSectionProps,
  KeyboardSectionProps,
  ToolbarProps,
} from "../sections/types";
import type { usePlayController } from "./usePlayController";

type PlayControllerState = ReturnType<typeof usePlayController>;

type UsePlaySectionsResult = {
  toolbarProps: ToolbarProps;
  boardProps: BoardSectionProps;
  keyboardProps: KeyboardSectionProps;
  dialogsProps: DialogsSectionProps;
};

const usePlaySections = (
  controller: PlayControllerState,
  player: Player,
): UsePlaySectionsResult => {
  const {
    activeRowHintStatuses,
    answer,
    boardShakePulse,
    cancelRefreshBoard,
    closeDeveloperConsoleDialog,
    closeEndOfGameDialog,
    closeHelpDialog,
    closeWordsDialog,
    confirmRefreshBoard,
    continuePreviousBoard,
    current,
    currentLanguage,
    currentWinStreak,
  } = controller;
  const {
    dictionaryChecksumMessage,
    dictionaryChecksumMessageKind,
    dictionaryError,
    dictionaryLoading,
    dictionaryWords,
    endOfGameAnswer,
    endOfGameBestStreak,
    endOfGameCurrentStreak,
    gameOver,
    guesses,
    handleKey,
    hardModeClockBoostScale,
    hardModeFinalStretchProgressPercent,
    hardModeSecondsLeft,
    hardModeTickPulse,
    hintButtonDisabled,
    hintsEnabledForDifficulty,
    hintsRemaining,
    hintRevealPulse,
    hintRevealTileIndex,
    isRefreshingDictionaryChecksum,
    keyboardEntryAnimationEnabled,
    message,
    openDeveloperConsoleDialog,
    openHelpDialog,
    openWordsDialog,
    refreshAttentionPulse,
    refreshAttentionScale,
    refreshBoard,
    refreshRemoteDictionaryChecksum,
    showDefeatDialog,
    showDeveloperConsoleDialog,
    showEndOfGameSettingsHint,
    showHardModeFinalStretchBar,
    showHardModeTimer,
    showHelpDialog,
    showLegacyEndOfGameMessage,
    showRefreshAttention,
    showRefreshDialog,
    showResumeDialog,
    showVictoryDialog,
    showWordsDialog,
    startAnimationSeed,
    startAnimationsEnabled,
    startNewBoard,
    submitDeveloperPlayer,
    useHint,
    victoryScoreSummary,
    won,
    wordListEnabledForDifficulty,
  } = controller;

  const animateTileEntry = startAnimationsEnabled && startAnimationSeed > 0;
  const wordListButtonEnabled =
    env.wordListButtonEnabled && wordListEnabledForDifficulty;
  const developerConsoleEnabled =
    env.mode === "development" || env.mode === "develpment";
  const preferNativeKeyboard = player.keyboardPreference === "native";

  const toolbarProps = useMemo<ToolbarProps>(
    () => ({
      currentWinStreak,
      dictionaryLoading,
      dictionaryWords,
      openWordsDialog,
      hintsEnabledForDifficulty,
      useHint,
      hintButtonDisabled,
      hintsRemaining,
      openHelpDialog,
      openDeveloperConsoleDialog,
      showRefreshAttention,
      refreshAttentionPulse,
      refreshAttentionScale,
      refreshBoard,
      dictionaryError,
      wordListButtonEnabled,
      developerConsoleEnabled,
      timer: {
        showHardModeTimer,
        hardModeSecondsLeft,
        hardModeTickPulse,
        hardModeClockBoostScale,
      },
    }),
    [
      currentWinStreak,
      dictionaryError,
      dictionaryLoading,
      dictionaryWords,
      hardModeClockBoostScale,
      hardModeSecondsLeft,
      hardModeTickPulse,
      hintButtonDisabled,
      hintsEnabledForDifficulty,
      hintsRemaining,
      openDeveloperConsoleDialog,
      openHelpDialog,
      openWordsDialog,
      refreshAttentionPulse,
      refreshAttentionScale,
      refreshBoard,
      showHardModeTimer,
      showRefreshAttention,
      useHint,
      developerConsoleEnabled,
      wordListButtonEnabled,
    ],
  );

  const boardProps = useMemo<BoardSectionProps>(
    () => ({
      board: {
        guesses,
        current,
        gameOver,
        won,
        answer,
        showLegacyEndOfGameMessage,
        startAnimationSeed,
        startAnimationsEnabled,
        boardShakePulse,
        activeRowHintStatuses,
        hintRevealPulse,
        hintRevealTileIndex,
        animateTileEntry,
      },
      hardModeProgress: {
        showHardModeFinalStretchBar,
        hardModeSecondsLeft,
        hardModeFinalStretchProgressPercent,
      },
    }),
    [
      animateTileEntry,
      activeRowHintStatuses,
      answer,
      boardShakePulse,
      current,
      gameOver,
      guesses,
      hardModeFinalStretchProgressPercent,
      hardModeSecondsLeft,
      hintRevealPulse,
      hintRevealTileIndex,
      showHardModeFinalStretchBar,
      showLegacyEndOfGameMessage,
      startAnimationSeed,
      startAnimationsEnabled,
      won,
    ],
  );

  const keyboardProps = useMemo<KeyboardSectionProps>(
    () => ({
      guesses,
      current,
      handleKey,
      gameOver,
      won,
      keyboardEntryAnimationEnabled,
      showResumeDialog,
      preferNativeKeyboard,
    }),
    [
      current,
      gameOver,
      guesses,
      handleKey,
      keyboardEntryAnimationEnabled,
      showResumeDialog,
      won,
      preferNativeKeyboard,
    ],
  );

  const dialogsProps = useMemo<DialogsSectionProps>(
    () => ({
      message,
      showResumeDialog,
      showRefreshDialog,
      showWordsDialog,
      showHelpDialog,
      showDeveloperConsoleDialog,
      showVictoryDialog,
      showDefeatDialog,
      showEndOfGameSettingsHint,
      endOfGameAnswer,
      victoryScoreSummary,
      endOfGameCurrentStreak,
      endOfGameBestStreak,
      continuePreviousBoard,
      startNewBoard,
      closeEndOfGameDialog,
      cancelRefreshBoard,
      confirmRefreshBoard,
      dictionaryWords,
      currentLanguage,
      closeWordsDialog,
      closeHelpDialog,
      closeDeveloperConsoleDialog,
      wordListButtonEnabled,
      developerConsoleEnabled,
      player,
      submitDeveloperPlayer,
      refreshRemoteDictionaryChecksum,
      isRefreshingDictionaryChecksum,
      dictionaryChecksumMessage,
      dictionaryChecksumMessageKind,
    }),
    [
      cancelRefreshBoard,
      closeDeveloperConsoleDialog,
      closeEndOfGameDialog,
      closeHelpDialog,
      closeWordsDialog,
      confirmRefreshBoard,
      continuePreviousBoard,
      currentLanguage,
      dictionaryChecksumMessage,
      dictionaryChecksumMessageKind,
      dictionaryWords,
      endOfGameAnswer,
      endOfGameBestStreak,
      endOfGameCurrentStreak,
      isRefreshingDictionaryChecksum,
      message,
      refreshRemoteDictionaryChecksum,
      showDefeatDialog,
      showDeveloperConsoleDialog,
      showEndOfGameSettingsHint,
      showHelpDialog,
      showRefreshDialog,
      showResumeDialog,
      showVictoryDialog,
      showWordsDialog,
      startNewBoard,
      submitDeveloperPlayer,
      victoryScoreSummary,
      developerConsoleEnabled,
      player,
      wordListButtonEnabled,
    ],
  );

  return {
    toolbarProps,
    boardProps,
    keyboardProps,
    dialogsProps,
  };
};

export { usePlaySections };
