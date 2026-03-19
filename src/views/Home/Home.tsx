import { useMemo, type JSX } from "react";
import { env } from "@config";
import { usePlayer } from "@providers";
import {
  Toolbar,
  DialogsSection,
  BoardSection,
  KeyboardSection,
} from "./sections";
import { useHomeController } from "./hooks";

const HomeContent = (): JSX.Element => {
  const controller = useHomeController();
  const { player } = usePlayer();
  const animateTileEntry =
    controller.startAnimationsEnabled && controller.startAnimationSeed > 0;
  const wordListButtonEnabled =
    env.wordListButtonEnabled && controller.wordListEnabledForDifficulty;
  const developerConsoleEnabled =
    env.mode === "development" || env.mode === "develpment";
  const preferNativeKeyboard = player.keyboardPreference === "native";

  const toolbarProps = useMemo(
    () => ({
      currentWinStreak: player.streak,
      dictionaryLoading: controller.dictionaryLoading,
      dictionaryWords: controller.dictionaryWords,
      openWordsDialog: controller.openWordsDialog,
      hintsEnabledForDifficulty: controller.hintsEnabledForDifficulty,
      useHint: controller.useHint,
      hintButtonDisabled: controller.hintButtonDisabled,
      hintsRemaining: controller.hintsRemaining,
      openHelpDialog: controller.openHelpDialog,
      openDeveloperConsoleDialog: controller.openDeveloperConsoleDialog,
      showRefreshAttention: controller.showRefreshAttention,
      refreshAttentionPulse: controller.refreshAttentionPulse,
      refreshAttentionScale: controller.refreshAttentionScale,
      refreshBoard: controller.refreshBoard,
      dictionaryError: controller.dictionaryError,
      wordListButtonEnabled,
      developerConsoleEnabled,
      timer: {
        showHardModeTimer: controller.showHardModeTimer,
        hardModeSecondsLeft: controller.hardModeSecondsLeft,
        hardModeTickPulse: controller.hardModeTickPulse,
        hardModeClockBoostScale: controller.hardModeClockBoostScale,
      },
    }),
    [
      controller.dictionaryError,
      controller.dictionaryLoading,
      controller.dictionaryWords,
      controller.hardModeClockBoostScale,
      controller.hardModeSecondsLeft,
      controller.hardModeTickPulse,
      controller.hintButtonDisabled,
      controller.hintsEnabledForDifficulty,
      controller.hintsRemaining,
      controller.openDeveloperConsoleDialog,
      controller.openHelpDialog,
      controller.openWordsDialog,
      controller.refreshAttentionPulse,
      controller.refreshAttentionScale,
      controller.refreshBoard,
      controller.showHardModeTimer,
      controller.showRefreshAttention,
      controller.useHint,
      developerConsoleEnabled,
      player.streak,
      wordListButtonEnabled,
    ],
  );
  const boardProps = useMemo(
    () => ({
      board: {
        guesses: controller.guesses,
        current: controller.current,
        gameOver: controller.gameOver,
        won: controller.won,
        answer: controller.answer,
        showLegacyEndOfGameMessage: controller.showLegacyEndOfGameMessage,
        startAnimationSeed: controller.startAnimationSeed,
        startAnimationsEnabled: controller.startAnimationsEnabled,
        boardShakePulse: controller.boardShakePulse,
        activeRowHintStatuses: controller.activeRowHintStatuses,
        hintRevealPulse: controller.hintRevealPulse,
        hintRevealTileIndex: controller.hintRevealTileIndex,
        animateTileEntry,
      },
      hardModeProgress: {
        showHardModeFinalStretchBar: controller.showHardModeFinalStretchBar,
        hardModeSecondsLeft: controller.hardModeSecondsLeft,
        hardModeFinalStretchProgressPercent:
          controller.hardModeFinalStretchProgressPercent,
      },
    }),
    [
      animateTileEntry,
      controller.activeRowHintStatuses,
      controller.answer,
      controller.boardShakePulse,
      controller.current,
      controller.gameOver,
      controller.guesses,
      controller.hardModeFinalStretchProgressPercent,
      controller.hardModeSecondsLeft,
      controller.hintRevealPulse,
      controller.hintRevealTileIndex,
      controller.showHardModeFinalStretchBar,
      controller.showLegacyEndOfGameMessage,
      controller.startAnimationSeed,
      controller.startAnimationsEnabled,
      controller.won,
    ],
  );
  const keyboardProps = useMemo(
    () => ({
      guesses: controller.guesses,
      current: controller.current,
      handleKey: controller.handleKey,
      gameOver: controller.gameOver,
      won: controller.won,
      keyboardEntryAnimationEnabled: controller.keyboardEntryAnimationEnabled,
      showResumeDialog: controller.showResumeDialog,
      preferNativeKeyboard,
    }),
    [
      controller.current,
      controller.gameOver,
      controller.guesses,
      controller.handleKey,
      controller.keyboardEntryAnimationEnabled,
      controller.showResumeDialog,
      controller.won,
      preferNativeKeyboard,
    ],
  );
  const dialogsProps = useMemo(
    () => ({
      message: controller.message,
      showResumeDialog: controller.showResumeDialog,
      showRefreshDialog: controller.showRefreshDialog,
      showWordsDialog: controller.showWordsDialog,
      showHelpDialog: controller.showHelpDialog,
      showDeveloperConsoleDialog: controller.showDeveloperConsoleDialog,
      showVictoryDialog: controller.showVictoryDialog,
      showDefeatDialog: controller.showDefeatDialog,
      showEndOfGameSettingsHint: controller.showEndOfGameSettingsHint,
      endOfGameAnswer: controller.endOfGameAnswer,
      victoryScoreSummary: controller.victoryScoreSummary,
      endOfGameCurrentStreak: controller.endOfGameCurrentStreak,
      endOfGameBestStreak: controller.endOfGameBestStreak,
      continuePreviousBoard: controller.continuePreviousBoard,
      startNewBoard: controller.startNewBoard,
      closeEndOfGameDialog: controller.closeEndOfGameDialog,
      cancelRefreshBoard: controller.cancelRefreshBoard,
      confirmRefreshBoard: controller.confirmRefreshBoard,
      dictionaryWords: controller.dictionaryWords,
      closeWordsDialog: controller.closeWordsDialog,
      closeHelpDialog: controller.closeHelpDialog,
      closeDeveloperConsoleDialog: controller.closeDeveloperConsoleDialog,
      wordListButtonEnabled,
      developerConsoleEnabled,
      player,
      submitDeveloperPlayer: controller.submitDeveloperPlayer,
      refreshRemoteDictionaryChecksum:
        controller.refreshRemoteDictionaryChecksum,
      isRefreshingDictionaryChecksum:
        controller.isRefreshingDictionaryChecksum,
      dictionaryChecksumMessage: controller.dictionaryChecksumMessage,
      dictionaryChecksumMessageKind: controller.dictionaryChecksumMessageKind,
    }),
    [
      controller.cancelRefreshBoard,
      controller.closeDeveloperConsoleDialog,
      controller.closeEndOfGameDialog,
      controller.closeHelpDialog,
      controller.closeWordsDialog,
      controller.confirmRefreshBoard,
      controller.continuePreviousBoard,
      controller.dictionaryChecksumMessage,
      controller.dictionaryChecksumMessageKind,
      controller.dictionaryWords,
      controller.endOfGameAnswer,
      controller.endOfGameBestStreak,
      controller.endOfGameCurrentStreak,
      controller.isRefreshingDictionaryChecksum,
      controller.message,
      controller.refreshRemoteDictionaryChecksum,
      controller.showDefeatDialog,
      controller.showDeveloperConsoleDialog,
      controller.showEndOfGameSettingsHint,
      controller.showHelpDialog,
      controller.showRefreshDialog,
      controller.showResumeDialog,
      controller.showVictoryDialog,
      controller.showWordsDialog,
      controller.startNewBoard,
      controller.submitDeveloperPlayer,
      controller.victoryScoreSummary,
      developerConsoleEnabled,
      player,
      wordListButtonEnabled,
    ],
  );

  return (
    <>
      <DialogsSection {...dialogsProps} />
      <main className="flex flex-1 flex-col">
        <section className="flex flex-1 flex-col items-center justify-start gap-6 max-sm:gap-2 py-6 max-sm:py-2">
          <Toolbar {...toolbarProps} />
          <BoardSection {...boardProps} />
        </section>

        <KeyboardSection {...keyboardProps} />
      </main>
    </>
  );
};

const Home = (): JSX.Element => {
  return <HomeContent />;
};

export default Home;
