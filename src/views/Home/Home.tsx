import type { JSX } from "react";
import { ErrorBoundary, ErrorFallback } from "../../components";
import { env } from "../../config";
import { useHomeController } from "../../hooks";
import { usePlayer } from "../../providers";
import HomeBoardSection from "./HomeBoardSection";
import HomeDialogs from "./HomeDialogs";
import HomeKeyboardSection from "./HomeKeyboardSection";
import HomeToolbar from "./HomeToolbar";

const Home = (): JSX.Element => {
  const { player } = usePlayer();
  const {
    answer,
    guesses,
    current,
    gameOver,
    won,
    message,
    handleKey,
    startAnimationSeed,
    startAnimationsEnabled,
    keyboardEntryAnimationEnabled,
    showResumeDialog,
    showRefreshDialog,
    showWordsDialog,
    showHelpDialog,
    showDeveloperConsoleDialog,
    continuePreviousBoard,
    startNewBoard,
    currentWinStreak,
    refreshBoard,
    openWordsDialog,
    closeWordsDialog,
    openHelpDialog,
    closeHelpDialog,
    openDeveloperConsoleDialog,
    closeDeveloperConsoleDialog,
    submitDeveloperPlayer,
    confirmRefreshBoard,
    cancelRefreshBoard,
    dictionaryWords,
    dictionaryLoading,
    dictionaryError,
    wordListEnabledForDifficulty,
    showHardModeTimer,
    showHardModeFinalStretchBar,
    hardModeSecondsLeft,
    hardModeTickPulse,
    hardModeClockBoostScale,
    hardModeFinalStretchProgressPercent,
    boardShakePulse,
    useHint,
    hintsRemaining,
    hintsEnabledForDifficulty,
    hintButtonDisabled,
    activeRowHintStatuses,
    hintRevealPulse,
    hintRevealTileIndex,
  } = useHomeController();

  const animateTileEntry = startAnimationsEnabled && startAnimationSeed > 0;
  const wordListButtonEnabled =
    env.wordListButtonEnabled && wordListEnabledForDifficulty;
  const developerConsoleEnabled =
    env.mode === "development" || env.mode === "develpment";
  const preferNativeKeyboard = player.keyboardPreference === "native";

  return (
    <>
      <HomeDialogs
        message={message}
        showResumeDialog={showResumeDialog}
        showRefreshDialog={showRefreshDialog}
        showWordsDialog={showWordsDialog}
        showHelpDialog={showHelpDialog}
        showDeveloperConsoleDialog={showDeveloperConsoleDialog}
        continuePreviousBoard={continuePreviousBoard}
        startNewBoard={startNewBoard}
        cancelRefreshBoard={cancelRefreshBoard}
        confirmRefreshBoard={confirmRefreshBoard}
        wordListButtonEnabled={wordListButtonEnabled}
        dictionaryWords={dictionaryWords}
        closeWordsDialog={closeWordsDialog}
        closeHelpDialog={closeHelpDialog}
        developerConsoleEnabled={developerConsoleEnabled}
        player={player}
        closeDeveloperConsoleDialog={closeDeveloperConsoleDialog}
        submitDeveloperPlayer={submitDeveloperPlayer}
      />
      <main className="flex flex-1 flex-col">
        <section className="flex flex-1 flex-col items-center justify-start gap-6 max-sm:gap-2 py-6 max-sm:py-2">
          <HomeToolbar
            currentWinStreak={currentWinStreak}
            wordListButtonEnabled={wordListButtonEnabled}
            dictionaryLoading={dictionaryLoading}
            dictionaryWordsCount={dictionaryWords.length}
            openWordsDialog={openWordsDialog}
            hintsEnabledForDifficulty={hintsEnabledForDifficulty}
            useHint={useHint}
            hintButtonDisabled={hintButtonDisabled}
            hintsRemaining={hintsRemaining}
            openHelpDialog={openHelpDialog}
            developerConsoleEnabled={developerConsoleEnabled}
            openDeveloperConsoleDialog={openDeveloperConsoleDialog}
            showHardModeTimer={showHardModeTimer}
            hardModeSecondsLeft={hardModeSecondsLeft}
            hardModeTickPulse={hardModeTickPulse}
            hardModeClockBoostScale={hardModeClockBoostScale}
            refreshBoard={refreshBoard}
            dictionaryError={dictionaryError}
          />

          <HomeBoardSection
            guesses={guesses}
            current={current}
            gameOver={gameOver}
            won={won}
            answer={answer}
            startAnimationSeed={startAnimationSeed}
            startAnimationsEnabled={startAnimationsEnabled}
            boardShakePulse={boardShakePulse}
            showHardModeFinalStretchBar={showHardModeFinalStretchBar}
            hardModeSecondsLeft={hardModeSecondsLeft}
            hardModeFinalStretchProgressPercent={
              hardModeFinalStretchProgressPercent
            }
            animateTileEntry={animateTileEntry}
            activeRowHintStatuses={activeRowHintStatuses}
            hintRevealPulse={hintRevealPulse}
            hintRevealTileIndex={hintRevealTileIndex}
          />
        </section>

        <ErrorBoundary
          name="home-keyboard"
          resetKeys={[guesses.length, current, gameOver, won]}
          fallback={({ reset }) => (
            <div className="px-2 pb-2">
              <ErrorFallback
                title="The keyboard is unavailable."
                description="Retry to re-enable key input."
                actionLabel="Retry keyboard"
                onAction={reset}
              />
            </div>
          )}
        >
          <HomeKeyboardSection
            preferNativeKeyboard={preferNativeKeyboard}
            guesses={guesses}
            handleKey={handleKey}
            gameOver={gameOver}
            won={won}
            keyboardEntryAnimationEnabled={keyboardEntryAnimationEnabled}
            showResumeDialog={showResumeDialog}
          />
        </ErrorBoundary>
      </main>
    </>
  );
};

export default Home;
