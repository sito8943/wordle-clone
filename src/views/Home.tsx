import type { JSX } from "react";
import {
  faCircleQuestion,
  faList,
  faRotateRight,
} from "@fortawesome/free-solid-svg-icons";
import {
  Board,
  Button,
  FireStreak,
  HelpDialog,
  Keyboard,
  RefreshConfirmationDialog,
  SessionResumeDialog,
  WordListDialog,
} from "../components";
import { env } from "../config";
import { useHomeController } from "../hooks";

const Home = (): JSX.Element => {
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
    continuePreviousBoard,
    startNewBoard,
    currentWinStreak,
    refreshBoard,
    openWordsDialog,
    closeWordsDialog,
    openHelpDialog,
    closeHelpDialog,
    confirmRefreshBoard,
    cancelRefreshBoard,
    dictionaryWords,
    dictionaryLoading,
    dictionaryError,
    wordListEnabledForDifficulty,
  } = useHomeController();
  const animateTileEntry = startAnimationsEnabled && startAnimationSeed > 0;
  const wordListButtonEnabled =
    env.wordListButtonEnabled && wordListEnabledForDifficulty;

  return (
    <>
      {message && (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none fixed left-1/2 top-5 z-10 -translate-x-1/2 rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white shadow-lg"
        >
          {message}
        </div>
      )}
      {showResumeDialog && (
        <SessionResumeDialog
          onContinue={continuePreviousBoard}
          onStartNew={startNewBoard}
        />
      )}
      {!showResumeDialog && showRefreshDialog && (
        <RefreshConfirmationDialog
          onCancel={cancelRefreshBoard}
          onConfirm={confirmRefreshBoard}
        />
      )}
      {!showResumeDialog && wordListButtonEnabled && showWordsDialog && (
        <WordListDialog
          language="en"
          words={dictionaryWords}
          onClose={closeWordsDialog}
        />
      )}
      {!showResumeDialog && showHelpDialog && (
        <HelpDialog onClose={closeHelpDialog} />
      )}
      <main className="flex flex-1 flex-col">
        <section className="flex flex-1 flex-col items-center justify-start gap-6 max-sm:gap-2 py-6 max-sm:py-2">
          <div className="w-full max-w-md flex items-center justify-end gap-2">
            <FireStreak streak={currentWinStreak} />
            {wordListButtonEnabled && (
              <Button
                onClick={openWordsDialog}
                aria-label="Word list"
                icon={faList}
                className="mobile-compact-button"
                hideLabelOnMobile
                disabled={dictionaryLoading || dictionaryWords.length === 0}
              >
                Words
              </Button>
            )}
            <Button
              onClick={openHelpDialog}
              aria-label="Help"
              variant="ghost"
              icon={faCircleQuestion}
              iconClassName="text-xl"
              className="mobile-compact-button"
              hideLabelOnMobile
            >
              Help
            </Button>
            <Button
              onClick={refreshBoard}
              aria-label="Refresh"
              icon={faRotateRight}
              className="mobile-compact-button"
              hideLabelOnMobile
            >
              Refresh
            </Button>
          </div>

          {dictionaryLoading && (
            <p className="rounded border border-sky-300 bg-sky-100 px-3 py-2 text-sm text-sky-900 dark:border-sky-700 dark:bg-sky-950/40 dark:text-sky-200">
              Loading word list...
            </p>
          )}

          {!dictionaryLoading && dictionaryError && (
            <p className="rounded border border-red-300 bg-red-100 px-3 py-2 text-sm text-red-900 dark:border-red-700 dark:bg-red-950/40 dark:text-red-200">
              {dictionaryError}
            </p>
          )}

          <Board
            key={`board-${startAnimationSeed}`}
            guesses={guesses}
            current={current}
            gameOver={gameOver}
            animateTileEntry={animateTileEntry}
            isLoss={gameOver && !won}
            animateEntry={startAnimationsEnabled && startAnimationSeed > 0}
          />

          {gameOver && (
            <>
              <p className="text-center text-base font-semibold text-neutral-800 dark:text-neutral-200 sm:text-lg">
                {won
                  ? `You got it in ${guesses.length}!`
                  : `The word was: ${answer}`}
              </p>
            </>
          )}
        </section>

        <Keyboard
          guesses={guesses}
          onKey={handleKey}
          isLoss={gameOver && !won}
          animateEntry={keyboardEntryAnimationEnabled}
        />
      </main>
    </>
  );
};

export default Home;
