import type { JSX } from "react";
import { usePlayer } from "@providers";
import {
  Toolbar,
  DialogsSection,
  BoardSection,
  KeyboardSection,
} from "./sections";
import { usePlayController, usePlaySections } from "./hooks";

const PlayContent = (): JSX.Element => {
  const controller = usePlayController();
  const { player } = usePlayer();
  const { toolbarProps, boardProps, keyboardProps, dialogsProps } =
    usePlaySections(controller, player);

  return (
    <>
      <DialogsSection
        message={dialogsProps.message}
        showResumeDialog={dialogsProps.showResumeDialog}
        showRefreshDialog={dialogsProps.showRefreshDialog}
        showWordsDialog={dialogsProps.showWordsDialog}
        showHelpDialog={dialogsProps.showHelpDialog}
        showDeveloperConsoleDialog={dialogsProps.showDeveloperConsoleDialog}
        showVictoryDialog={dialogsProps.showVictoryDialog}
        showDefeatDialog={dialogsProps.showDefeatDialog}
        showEndOfGameSettingsHint={dialogsProps.showEndOfGameSettingsHint}
        endOfGameAnswer={dialogsProps.endOfGameAnswer}
        victoryScoreSummary={dialogsProps.victoryScoreSummary}
        endOfGameCurrentStreak={dialogsProps.endOfGameCurrentStreak}
        endOfGameBestStreak={dialogsProps.endOfGameBestStreak}
        continuePreviousBoard={dialogsProps.continuePreviousBoard}
        startNewBoard={dialogsProps.startNewBoard}
        closeEndOfGameDialog={dialogsProps.closeEndOfGameDialog}
        cancelRefreshBoard={dialogsProps.cancelRefreshBoard}
        confirmRefreshBoard={dialogsProps.confirmRefreshBoard}
        dictionaryWords={dialogsProps.dictionaryWords}
        currentLanguage={dialogsProps.currentLanguage}
        closeWordsDialog={dialogsProps.closeWordsDialog}
        closeHelpDialog={dialogsProps.closeHelpDialog}
        closeDeveloperConsoleDialog={dialogsProps.closeDeveloperConsoleDialog}
        wordListButtonEnabled={dialogsProps.wordListButtonEnabled}
        developerConsoleEnabled={dialogsProps.developerConsoleEnabled}
        player={dialogsProps.player}
        submitDeveloperPlayer={dialogsProps.submitDeveloperPlayer}
        refreshRemoteDictionaryChecksum={
          dialogsProps.refreshRemoteDictionaryChecksum
        }
        isRefreshingDictionaryChecksum={
          dialogsProps.isRefreshingDictionaryChecksum
        }
        dictionaryChecksumMessage={dialogsProps.dictionaryChecksumMessage}
        dictionaryChecksumMessageKind={dialogsProps.dictionaryChecksumMessageKind}
      />
      <main className="flex flex-1 flex-col">
        <section className="flex flex-1 flex-col items-center justify-start gap-6 max-sm:gap-2 py-6 max-sm:py-2">
          <Toolbar
            currentWinStreak={toolbarProps.currentWinStreak}
            dictionaryLoading={toolbarProps.dictionaryLoading}
            dictionaryWords={toolbarProps.dictionaryWords}
            openWordsDialog={toolbarProps.openWordsDialog}
            hintsEnabledForDifficulty={toolbarProps.hintsEnabledForDifficulty}
            useHint={toolbarProps.useHint}
            hintButtonDisabled={toolbarProps.hintButtonDisabled}
            hintsRemaining={toolbarProps.hintsRemaining}
            openHelpDialog={toolbarProps.openHelpDialog}
            openDeveloperConsoleDialog={toolbarProps.openDeveloperConsoleDialog}
            showRefreshAttention={toolbarProps.showRefreshAttention}
            refreshAttentionPulse={toolbarProps.refreshAttentionPulse}
            refreshAttentionScale={toolbarProps.refreshAttentionScale}
            refreshBoard={toolbarProps.refreshBoard}
            dictionaryError={toolbarProps.dictionaryError}
            wordListButtonEnabled={toolbarProps.wordListButtonEnabled}
            developerConsoleEnabled={toolbarProps.developerConsoleEnabled}
            timer={toolbarProps.timer}
          />
          <BoardSection
            board={boardProps.board}
            hardModeProgress={boardProps.hardModeProgress}
          />
        </section>

        <KeyboardSection
          guesses={keyboardProps.guesses}
          current={keyboardProps.current}
          handleKey={keyboardProps.handleKey}
          gameOver={keyboardProps.gameOver}
          won={keyboardProps.won}
          keyboardEntryAnimationEnabled={
            keyboardProps.keyboardEntryAnimationEnabled
          }
          showResumeDialog={keyboardProps.showResumeDialog}
          preferNativeKeyboard={keyboardProps.preferNativeKeyboard}
        />
      </main>
    </>
  );
};

const Play = (): JSX.Element => {
  return <PlayContent />;
};

export default Play;
